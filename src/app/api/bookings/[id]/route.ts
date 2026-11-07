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

    // Query booking with full relational joins
    const { data: booking, error } = await adminSupabase
      .from('bookings')
      .select(`
        *,
        service_listings (
          id,
          title,
          category,
          images,
          destination_city,
          destination_state,
          hourly_rate,
          minimum_hours,
          cancellation_hours,
          cancellation_fee_percent,
          vehicle_details (
            vehicle_type,
            make,
            model,
            year,
            color,
            registration_number,
            fuel_type,
            transmission,
            seating_capacity
          ),
          guide_details (
            languages,
            specializations,
            experience_years
          )
        ),
        customer:customer_id (
          id,
          full_name,
          email,
          phone,
          avatar_url
        ),
        provider_profile:provider_id (
          id,
          business_name,
          average_rating,
          total_reviews,
          city,
          verification_status,
          user_id
        )
      `)
      .eq('id', bookingId)
      .maybeSingle()

    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Role security check: only the booking customer, the assigned provider, or admin can access
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const isAdmin = profile?.role === 'admin'
    const isCustomer = booking.customer_id === user.id
    const isProvider = booking.provider_profile?.user_id === user.id

    if (!isAdmin && !isCustomer && !isProvider) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Retrieve timeline history
    const { data: history } = await adminSupabase
      .from('booking_status_history')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true })

    // Retrieve active dispute if any
    const { data: dispute } = await adminSupabase
      .from('booking_disputes')
      .select('*')
      .eq('booking_id', bookingId)
      .maybeSingle()

    // Retrieve payment & refund info
    const { data: payments } = await adminSupabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)

    const { data: refunds } = await adminSupabase
      .from('refunds')
      .select('*')
      .eq('booking_id', bookingId)

    // Resolve verified host contact info
    let hostContact = {
      name: booking.provider_profile?.business_name || 'Verified Local Host',
      phone: '+91 98765 43210',
      email: 'support@hourlytourism.com',
      city: booking.provider_profile?.city || 'Coimbatore, Tamil Nadu',
    }
    const providerUserId = booking.provider_profile?.user_id || (booking.provider_id?.length === 36 ? booking.provider_id : null)
    if (providerUserId) {
      const { data: hostUser } = await adminSupabase
        .from('profiles')
        .select('full_name, phone, email')
        .eq('id', providerUserId)
        .maybeSingle()
      if (hostUser) {
        hostContact = {
          name: hostUser.full_name || booking.provider_profile?.business_name || 'Verified Host',
          phone: hostUser.phone || '+91 98765 43210',
          email: hostUser.email || 'support@hourlytourism.com',
          city: booking.provider_profile?.city || 'Coimbatore, Tamil Nadu',
        }
      }
    }

    return NextResponse.json({
      booking: {
        ...booking,
        host_contact: hostContact,
        history: history || [],
        dispute: dispute || null,
        payments: payments || [],
        refunds: refunds || [],
      },
    })
  } catch (err: any) {
    console.error('Error fetching booking details:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

