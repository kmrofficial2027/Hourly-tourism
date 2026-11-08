import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { verifyBookingStartOtp, getBookingStartOtp } from '@/lib/otpUtils'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    let {
      data: { user },
    } = await supabase.auth.getUser()

    const adminSupabase = await createAdminSupabaseClient()

    if (!user) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        const { data: userData } = await adminSupabase.auth.getUser(token)
        if (userData?.user) {
          user = userData.user
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status, reason, notes, payment_status, entered_otp, payment_method } = await request.json()
    const bookingId = params.id

    // Fetch existing booking
    const { data: booking, error: fetchErr } = await adminSupabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (fetchErr || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const oldStatus = booking.status

    // Normalize cancellation status to valid DB enum 'cancelled'
    const finalStatus = status?.includes('cancel') ? 'cancelled' : status

    // Validate OTP if transitioning to 'in_progress'
    if (finalStatus === 'in_progress') {
      // If client provided entered_otp, verify it
      if (entered_otp) {
        const isValid = verifyBookingStartOtp(booking.booking_number || booking.id, entered_otp)
        if (!isValid) {
          return NextResponse.json(
            { error: 'Invalid Start OTP. Please ask the tourist to share the 4-digit code shown on their booking card.' },
            { status: 400 }
          )
        }
      }
    }

    // Update booking status
    const updateData: any = {
      status: finalStatus,
      updated_at: new Date().toISOString(),
    }

    // Normalize payment_status according to DB enum:
    // ('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded')
    if (payment_status) {
      if (payment_status === 'paid') {
        updateData.payment_status = 'completed'
      } else if (['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'].includes(payment_status)) {
        updateData.payment_status = payment_status
      }
    }

    if (finalStatus === 'confirmed') updateData.confirmed_at = new Date().toISOString()
    if (finalStatus === 'completed') updateData.completed_at = new Date().toISOString()
    if (finalStatus === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString()
      updateData.cancellation_reason = reason || notes || 'Cancelled by user'
    }

    const { error: updateErr } = await adminSupabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)

    if (updateErr) {
      console.error('Booking status update error:', updateErr)
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    // Insert payment record if payment completed
    if (updateData.payment_status === 'completed') {
      try {
        await adminSupabase.from('payments').insert({
          booking_id: bookingId,
          amount: booking.total_amount || 0,
          currency: 'INR',
          status: 'completed',
          payment_method: payment_method || (notes?.includes('QR') ? 'provider_upi_qr' : 'cash_on_site'),
        })
      } catch (payErr) {
        console.warn('Payment record log note (non-fatal):', payErr)
      }
    }

    // Insert audit log in booking_status_history
    try {
      await adminSupabase.from('booking_status_history').insert({
        booking_id: bookingId,
        old_status: oldStatus,
        new_status: finalStatus,
        changed_by: user.id,
        notes: notes || reason || (entered_otp ? `OTP Verified: ${entered_otp}` : null),
      })
    } catch (histErr) {
      console.error('Non-fatal booking history error:', histErr)
    }

    // Create notifications for customer or provider
    try {
      let recipientUserId: string | null = null

      if (user.id === booking.customer_id) {
        // Customer performed action -> notify provider's underlying user_id
        if (booking.provider_id) {
          const { data: provRec } = await adminSupabase
            .from('provider_profiles')
            .select('user_id')
            .eq('id', booking.provider_id)
            .maybeSingle()
          recipientUserId = provRec?.user_id || booking.provider_id
        }

        if (!recipientUserId && booking.company_id) {
          const { data: compRec } = await adminSupabase
            .from('company_profiles')
            .select('user_id')
            .eq('id', booking.company_id)
            .maybeSingle()
          recipientUserId = compRec?.user_id || null
        }

        if (!recipientUserId && booking.listing_id) {
          const { data: lRec } = await adminSupabase
            .from('service_listings')
            .select('provider_id, company_id')
            .eq('id', booking.listing_id)
            .maybeSingle()

          if (lRec?.provider_id) {
            const { data: provRec } = await adminSupabase
              .from('provider_profiles')
              .select('user_id')
              .eq('id', lRec.provider_id)
              .maybeSingle()
            recipientUserId = provRec?.user_id || lRec.provider_id
          } else if (lRec?.company_id) {
            const { data: compRec } = await adminSupabase
              .from('company_profiles')
              .select('user_id')
              .eq('id', lRec.company_id)
              .maybeSingle()
            recipientUserId = compRec?.user_id || null
          }
        }
      } else {
        // Provider or admin performed action -> notify customer
        recipientUserId = booking.customer_id
      }

      if (recipientUserId) {
        let notifTitle = `Booking Status: ${finalStatus.replace(/_/g, ' ')}`
        let notifMsg = `Booking #${booking.booking_number} status has been updated to ${finalStatus}.`

        if (finalStatus === 'confirmed') {
          if (user.id === booking.customer_id) {
            notifTitle = '🚗 Booking Confirmed by Customer!'
            notifMsg = `Customer has confirmed ride #${booking.booking_number} for ${booking.booking_date} at ${booking.start_time}. Start OTP is active.`
          } else {
            const startOtp = getBookingStartOtp(booking.booking_number || booking.id)
            notifTitle = 'Booking Confirmed! 🎉'
            notifMsg = `Your ride #${booking.booking_number} is confirmed. Your Start OTP is ${startOtp}.`
          }
        } else if (finalStatus === 'in_progress') {
          notifTitle = 'Trip In Progress 🚗'
          notifMsg = `Your trip #${booking.booking_number} has started with OTP verification. Live safety radar active!`
        } else if (finalStatus === 'completed') {
          notifTitle = 'Trip Completed ✨'
          notifMsg = `Your ride #${booking.booking_number} has concluded. Download your tax invoice or leave a review.`
        }

        await adminSupabase.from('notifications').insert({
          user_id: recipientUserId,
          type: 'booking',
          title: notifTitle,
          message: reason ? `${notifMsg} Reason: ${reason}` : notifMsg,
          data: { booking_id: bookingId, new_status: finalStatus },
        })
      }
    } catch (notifErr) {
      console.error('Non-fatal notification error:', notifErr)
    }

    return NextResponse.json({
      success: true,
      status: finalStatus,
      payment_status: updateData.payment_status || booking.payment_status,
      start_otp: getBookingStartOtp(booking.booking_number || booking.id),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
