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
    const { category, description, evidenceUrls = [] } = body

    if (!category || !description) {
      return NextResponse.json({ error: 'Category and description required' }, { status: 400 })
    }

    const adminSupabase = await createAdminSupabaseClient()

    const { data: booking } = await adminSupabase
      .from('bookings')
      .select('customer_id, provider_id, booking_number')
      .eq('id', bookingId)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Insert dispute record
    const { data: dispute, error } = await adminSupabase
      .from('booking_disputes')
      .insert({
        booking_id: bookingId,
        customer_id: booking.customer_id,
        provider_id: booking.provider_id,
        dispute_category: category,
        description,
        evidence_urls: evidenceUrls,
        status: 'open',
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update booking status to 'disputed'
    await adminSupabase
      .from('bookings')
      .update({ status: 'disputed' })
      .eq('id', bookingId)

    // Log in history
    await adminSupabase.from('booking_status_history').insert({
      booking_id: bookingId,
      old_status: 'completed',
      new_status: 'disputed',
      changed_by: user.id,
      notes: `Dispute filed: ${category} - ${description}`,
    })

    return NextResponse.json({ success: true, dispute })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

