import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')
    const date = searchParams.get('date')
    const startTime = searchParams.get('startTime')
    const duration = Number(searchParams.get('duration') || 1)

    if (!listingId || !date || !startTime) {
      return NextResponse.json({ available: true })
    }

    const [startH, startM] = startTime.split(':').map(Number)
    const endH = startH + duration
    const endTime = `${endH.toString().padStart(2, '0')}:${(startM || 0).toString().padStart(2, '0')}`

    const supabase = await createServerSupabaseClient()

    // 1. Check blocked dates / exceptions
    const { data: exceptions } = await supabase
      .from('availability_exceptions')
      .select('*')
      .eq('listing_id', listingId)
      .eq('exception_date', date)
      .eq('is_blocked', true)

    if (exceptions && exceptions.length > 0) {
      return NextResponse.json({
        available: false,
        message: 'This date is currently blocked by the host.',
      })
    }

    // 2. Check overlapping active bookings
    const { data: existingBookings, error } = await supabase
      .from('bookings')
      .select('id, start_time, end_time, status')
      .eq('listing_id', listingId)
      .eq('booking_date', date)
      .in('status', ['confirmed', 'paid', 'in_progress', 'awaiting_confirmation'])

    if (existingBookings && existingBookings.length > 0) {
      const hasOverlap = existingBookings.some((b) => {
        return startTime < b.end_time && endTime > b.start_time
      })

      if (hasOverlap) {
        return NextResponse.json({
          available: false,
          message: 'Selected time slot overlaps with an existing booking. Please pick another hour.',
        })
      }
    }

    return NextResponse.json({
      available: true,
      message: 'Time slot is available for booking.',
    })
  } catch (err: any) {
    return NextResponse.json({ available: true })
  }
}

