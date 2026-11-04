import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Use service role client for webhook (no user session)
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-webhook-signature')
    const timestamp = request.headers.get('x-webhook-timestamp')
    const secretKey = process.env.CASHFREE_SECRET_KEY

    // Verify webhook signature (skip in dev/placeholder mode)
    const isPlaceholder =
      !secretKey || secretKey.includes('PLACEHOLDER')

    if (!isPlaceholder && signature && timestamp) {
      const signedPayload = timestamp + body
      const expectedSignature = crypto
        .createHmac('sha256', secretKey!)
        .update(signedPayload)
        .digest('base64')

      if (signature !== expectedSignature) {
        console.error('Cashfree webhook signature mismatch')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const event = JSON.parse(body)
    const eventType: string = event.type || ''

    // Only process ORDER_PAID events
    if (eventType !== 'PAYMENT_SUCCESS_WEBHOOK') {
      return NextResponse.json({ received: true, skipped: eventType })
    }

    const orderData = event.data?.order
    const paymentData = event.data?.payment

    if (!orderData?.order_id) {
      return NextResponse.json({ error: 'Missing order data' }, { status: 400 })
    }

    const orderId: string = orderData.order_id
    const orderNote: string = orderData.order_note || ''

    // Extract booking number from order note or order id
    // orderId format: CF_<booking_number>_<timestamp>
    const bookingNumberMatch = orderId.match(/^CF_([^_]+)/)
    const bookingNumber = bookingNumberMatch ? bookingNumberMatch[1] : null

    const supabase = createServiceClient()

    // Find booking by booking_number or order notes
    let bookingQuery = supabase.from('bookings').select('*')
    if (bookingNumber) {
      bookingQuery = bookingQuery.eq('booking_number', bookingNumber)
    } else {
      // Fallback: try to find via notes in payments table
      return NextResponse.json({ received: true, warning: 'Could not extract booking number' })
    }

    const { data: booking } = await bookingQuery.single()

    if (!booking) {
      console.error('Booking not found for Cashfree order:', orderId)
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Idempotency check - already processed
    if (booking.payment_status === 'paid') {
      return NextResponse.json({ received: true, message: 'Already processed' })
    }

    const totalAmount = Number(booking.total_amount)
    const platformCommission = Math.round(totalAmount * 0.1 * 100) / 100
    const providerEarnings = Math.round((totalAmount - platformCommission) * 100) / 100

    // Update booking
    await supabase
      .from('bookings')
      .update({ status: 'confirmed', payment_status: 'paid' })
      .eq('id', booking.id)

    // Insert payment record
    await supabase.from('payments').insert({
      booking_id: booking.id,
      user_id: booking.user_id,
      amount: totalAmount,
      currency: 'INR',
      status: 'completed',
      payment_method: paymentData?.payment_method || 'cashfree',
      notes: {
        gateway: 'cashfree',
        cashfree_order_id: orderId,
        cashfree_payment_id: paymentData?.cf_payment_id,
        cashfree_payment_time: paymentData?.payment_completion_time,
        webhook_event: eventType,
      },
    })

    // Provider earnings
    if (booking.provider_id) {
      await supabase.from('provider_earnings').upsert({
        provider_id: booking.provider_id,
        booking_id: booking.id,
        total_amount: totalAmount,
        platform_commission: platformCommission,
        provider_earnings: providerEarnings,
        status: 'pending_payout',
      })
    }

    // Notification
    await supabase.from('notifications').insert({
      user_id: booking.user_id,
      title: 'Payment Confirmed',
      message: `Your booking #${booking.booking_number} payment of ₹${totalAmount} was received via Cashfree.`,
      type: 'payment',
      is_read: false,
    })

    return NextResponse.json({ received: true, success: true })
  } catch (err: any) {
    console.error('Cashfree Webhook Error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
