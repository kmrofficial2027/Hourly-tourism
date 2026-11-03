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

    const amountInPaise = Math.round(Number(booking.total_amount) * 100)

    // Check if Razorpay API keys are configured
    if (!keyId || !keySecret) {
      // In development mode without credentials:
      return NextResponse.json({
        isDevelopmentMode: true,
        message:
          'Razorpay API credentials not configured in environment. Running in development test mode.',
        order: {
          id: 'order_dev_' + Math.random().toString(36).substring(2, 10),
          amount: amountInPaise,
          currency: 'INR',
          bookingId: booking.id,
        },
        keyId: 'rzp_test_dev',
      })
    }

    // Call real Razorpay API using dynamic import or fetch
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
      order,
      keyId,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

