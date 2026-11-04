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

    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })
    }

    // Fetch booking
    const { data: booking, error: fetchErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (fetchErr || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    const isPlaceholder =
      !keyId ||
      !keySecret ||
      keyId.includes('placeholder') ||
      keySecret.includes('placeholder')

    const amountInPaise = Math.round(Number(booking.total_amount) * 100)

    // Check if Razorpay API keys are configured
    if (isPlaceholder) {
      // In development test mode:
      return NextResponse.json({
        isDevelopmentMode: true,
        gateway: 'razorpay',
        message: 'Razorpay API credentials not configured in environment. Running in development test mode.',
        order: {
          id: 'order_rzp_dev_' + Math.random().toString(36).substring(2, 10),
          amount: amountInPaise,
          currency: 'INR',
          bookingId: booking.id,
        },
        keyId: 'rzp_test_dev',
      })
    }

    // Call real Razorpay API using dynamic import or REST API
    const Razorpay = (await import('razorpay')).default
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${booking.booking_number}`,
      notes: {
        bookingId: booking.id,
        bookingNumber: booking.booking_number,
      },
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      isDevelopmentMode: false,
      gateway: 'razorpay',
      order,
      keyId,
    })
  } catch (err: any) {
    console.error('Razorpay Create Order Error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
