import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status, reason, notes, payment_status } = await request.json()
    const bookingId = params.id

    const adminSupabase = await createAdminSupabaseClient()

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
    const finalStatus = status.includes('cancel') ? 'cancelled' : status

    // Update booking status
    const updateData: any = {
      status: finalStatus,
      updated_at: new Date().toISOString(),
    }

    if (payment_status) updateData.payment_status = payment_status
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

    // Insert audit log in booking_status_history
    try {
      await adminSupabase.from('booking_status_history').insert({
        booking_id: bookingId,
        old_status: oldStatus,
        new_status: finalStatus,
        changed_by: user.id,
        notes: notes || reason || null,
      })
    } catch (histErr) {
      console.error('Non-fatal booking history error:', histErr)
    }

    // Create notifications for customer & provider
    const targetUserId =
      user.id === booking.customer_id ? booking.provider_id : booking.customer_id

    if (targetUserId) {
      try {
        await adminSupabase.from('notifications').insert({
          user_id: targetUserId,
          type: 'booking',
          title: `Booking Status: ${finalStatus.replace(/_/g, ' ')}`,
          message: `Booking #${booking.booking_number} status has been updated to ${finalStatus}.${
            reason ? ` Reason: ${reason}` : ''
          }`,
          data: { booking_id: bookingId, new_status: finalStatus },
        })
      } catch (notifErr) {
        console.error('Non-fatal notification error:', notifErr)
      }
    }

    return NextResponse.json({ success: true, status: finalStatus })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

