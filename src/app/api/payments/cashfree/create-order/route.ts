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

    // Fetch booking with customer profile
    const { data: booking, error: fetchErr } = await supabase
      .from('bookings')
      .select('*, profiles(*)')
      .eq('id', bookingId)
      .single()

    if (fetchErr || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const appId = process.env.CASHFREE_APP_ID
    const secretKey = process.env.CASHFREE_SECRET_KEY
    const cfEnv = process.env.CASHFREE_ENV || 'sandbox'
    const apiVersion = process.env.CASHFREE_API_VERSION || '2023-08-01'

    const isPlaceholder =
      !appId ||
      !secretKey ||
      appId.includes('PLACEHOLDER') ||
      secretKey.includes('PLACEHOLDER')

    const amount = Number(booking.total_amount)

    // Sanitize orderId: alphanumeric + hyphen/underscore, max 50 chars
    const rawOrderId = `CF_${booking.booking_number || bookingId}_${Date.now()}`
    const orderId = rawOrderId.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50)

    // Dev / placeholder mode
    if (isPlaceholder) {
      return NextResponse.json({
        isDevelopmentMode: true,
        gateway: 'cashfree',
        message: 'Cashfree API credentials not configured. Running in development test mode.',
        paymentSessionId: `dev_session_${Math.random().toString(36).substring(2, 12)}`,
        orderId,
        amount,
        bookingId: booking.id,
      })
    }

    // Extract customer phone (10 digits, strip +91)
    const rawPhone: string = booking.profiles?.phone || '9999999999'
    const phone = rawPhone.replace(/^\+91/, '').replace(/\D/g, '').slice(-10).padStart(10, '0')

    const baseUrl =
      cfEnv === 'production'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg'

    const returnUrl =
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings` +
      `?order_id=${orderId}&bookingId=${bookingId}`

    const orderPayload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      order_note: `Hourly Tourism Booking #${booking.booking_number}`,
      customer_details: {
        customer_id: user.id.substring(0, 50),
        customer_name: booking.profiles?.full_name || 'Customer',
        customer_email: user.email || booking.profiles?.email || 'customer@example.com',
        customer_phone: phone,
      },
      order_meta: {
        return_url: returnUrl,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/cashfree/webhook`,
      },
    }

    const response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': apiVersion,
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
      body: JSON.stringify(orderPayload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Cashfree API Error:', data)
      return NextResponse.json(
        { error: data.message || 'Failed to create Cashfree order' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      isDevelopmentMode: false,
      gateway: 'cashfree',
      paymentSessionId: data.payment_session_id,
      orderId: data.order_id,
      amount,
      bookingId: booking.id,
    })
  } catch (err: any) {
    console.error('Cashfree Create Order Error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
