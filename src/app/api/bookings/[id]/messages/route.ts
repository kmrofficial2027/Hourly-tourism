import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'

export async function GET(
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
    const adminSupabase = await createAdminSupabaseClient()

    const { data: messages, error } = await adminSupabase
      .from('booking_messages')
      .select('*, sender:sender_id(full_name, avatar_url)')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ messages: [] })
    }

    return NextResponse.json({ messages: messages || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

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
    const { message, attachmentUrl, senderRole } = body

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
    }

    const adminSupabase = await createAdminSupabaseClient()

    // Find recipient from booking
    const { data: booking } = await adminSupabase
      .from('bookings')
      .select('customer_id, provider_id, provider_profile:provider_id(user_id)')
      .eq('id', bookingId)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const providerProfile: any = booking.provider_profile
    const providerUserId = Array.isArray(providerProfile) ? providerProfile[0]?.user_id : providerProfile?.user_id
    const receiverId = user.id === booking.customer_id ? providerUserId : booking.customer_id

    const { data: newMsg, error } = await adminSupabase
      .from('booking_messages')
      .insert({
        booking_id: bookingId,
        sender_id: user.id,
        receiver_id: receiverId || user.id,
        sender_role: senderRole || 'customer',
        message: message.trim(),
        attachment_url: attachmentUrl || null,
        is_read: false,
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error inserting message:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: newMsg })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
