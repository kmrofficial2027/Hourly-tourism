import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

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

    const { status, reason, notes } = await request.json()
    const bookingId = params.id

    // Fetch existing booking
    const { data: booking, error: fetchErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (fetchErr || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const oldStatus = booking.status

    // Update booking status
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'confirmed') updateData.confirmed_at = new Date().toISOString()
    if (status === 'completed') updateData.completed_at = new Date().toISOString()
    if (status.includes('cancel')) {
      updateData.cancelled_at = new Date().toISOString()
      updateData.cancellation_reason = reason || notes
    }

    const { error: updateErr } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    // Insert audit log in booking_status_history
    await supabase.from('booking_status_history').insert({
      booking_id: bookingId,
      old_status: oldStatus,
      new_status: status,
      changed_by: user.id,
      notes: notes || reason || null,
    })

    // Create notifications for customer & provider
    const targetUserId =
      user.id === booking.customer_id ? booking.provider_id : booking.customer_id

    if (targetUserId) {
      await supabase.from('notifications').insert({
        user_id: targetUserId,
        type: 'booking',
        title: `Booking Status: ${status.replace(/_/g, ' ')}`,
        message: `Booking #${booking.booking_number} status has been updated to ${status}.`,
        data: { booking_id: bookingId, new_status: status },
      })
    }

    return NextResponse.json({ success: true, status })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

