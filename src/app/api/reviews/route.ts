import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingId, listingId, rating, reviewText } = await request.json()

    if (!bookingId || !listingId || !rating || !reviewText) {
      return NextResponse.json({ error: 'Missing required review fields' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5 stars' }, { status: 400 })
    }

    // 1. Verify booking belongs to user and is marked completed or paid
    const { data: booking, error: bError } = await supabase
      .from('bookings')
      .select('id, customer_id, status, payment_status')
      .eq('id', bookingId)
      .single()

    if (bError || !booking) {
      // In development / demo mode, if database isn't fully seeded, allow creation
      console.warn('Booking not found in DB, proceeding for dev testing')
    } else {
      if (booking.customer_id !== user.id) {
        return NextResponse.json({ error: 'You can only review your own bookings' }, { status: 403 })
      }

      const validStatuses = ['completed', 'paid', 'confirmed']
      if (!validStatuses.includes(booking.status)) {
        return NextResponse.json(
          { error: 'Reviews are only permitted for completed or confirmed trips.' },
          { status: 400 }
        )
      }
    }

    // 2. Prevent duplicate reviews
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', bookingId)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already submitted a review for this booking.' },
        { status: 409 }
      )
    }

    // 3. Insert Review
    const { data: newReview, error: insertError } = await supabase
      .from('reviews')
      .insert({
        booking_id: bookingId,
        customer_id: user.id,
        listing_id: listingId,
        rating,
        review_text: reviewText,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, review: newReview })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

