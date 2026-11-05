import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'

export async function POST(
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

    const bookingId = params.id
    const body = await request.json()
    const { alternateDate, alternateStartTime, alternateVehicle, note } = body

    const adminSupabase = await createAdminSupabaseClient()

    const { data: booking } = await adminSupabase
      .from('bookings')
      .select('customer_id, booking_number')
      .eq('id', bookingId)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const proposalMessage = `Host Counter-Offer: Proposed alternate timing: ${alternateDate || 'Same Date'} at ${alternateStartTime || 'Proposed Time'}.${alternateVehicle ? ` Alternate Vehicle: ${alternateVehicle}.` : ''} Note from host: ${note || 'Please confirm if this suits you.'}`

    // Insert system proposal in chat messages
    await adminSupabase.from('booking_messages').insert({
      booking_id: bookingId,
      sender_id: user.id,
      receiver_id: booking.customer_id,
      sender_role: 'provider',
      message: proposalMessage,
      is_read: false,
    })

    // Notify customer
    await adminSupabase.from('notifications').insert({
      user_id: booking.customer_id,
      type: 'booking',
      title: 'Host Proposed Alternate Time / Vehicle',
      message: proposalMessage,
      data: { booking_id: bookingId, counter_offer: true },
    })

    return NextResponse.json({ success: true, message: 'Counter-offer delivered to customer.' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

