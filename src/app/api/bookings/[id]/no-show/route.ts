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
    const { actor, waitMinutes = 20, notes } = body

    const adminSupabase = await createAdminSupabaseClient()

    const { data: booking } = await adminSupabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Update status to no_show
    await adminSupabase
      .from('bookings')
      .update({
        status: 'no_show',
        cancellation_reason: `No-Show reported by ${actor}: Waited ${waitMinutes} minutes. ${notes || ''}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    // Audit log
    await adminSupabase.from('booking_status_history').insert({
      booking_id: bookingId,
      old_status: booking.status,
      new_status: 'no_show',
      changed_by: user.id,
      notes: `No-show report filed by ${actor}. Grace period: ${waitMinutes}m.`,
    })

    return NextResponse.json({ success: true, status: 'no_show' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

