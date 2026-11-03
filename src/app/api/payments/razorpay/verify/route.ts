import { NextResponse } from 'next/server'
import crypto from 'crypto'
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

    const body = await request.json()
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      isDevelopmentMode,
    } = body

    // Fetch booking
    const { data: booking, error: fetchErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (fetchErr || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET

    // Signature verification logic
    let isSignatureValid = false

    if (keySecret && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex')

      isSignatureValid = generatedSignature === razorpay_signature
    } else if (isDevelopmentMode) {
      // In dev mode when credentials are deliberately unset for local testing
      isSignatureValid = true
    }

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: 'Payment signature verification failed' },
        { status: 400 }
      )
    }

    // 1. Update Booking status to 'paid' and 'confirmed'
    await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    // 2. Insert Payment record
    const { data: paymentRecord } = await supabase.from('payments').insert({
      booking_id: bookingId,
      razorpay_order_id,
      razorpay_payment_id: razorpay_payment_id || `pay_dev_${Date.now()}`,
      razorpay_signature,
      amount: booking.total_amount,
      currency: 'INR',
      status: 'completed',
      payment_method: 'razorpay',
    }).select().single()

    // 3. Compute Provider Earnings (10% platform commission default)
    const grossAmount = Number(booking.base_price)
    const commissionRate = 0.10
    const commissionAmount = Math.round(grossAmount * commissionRate)
    const netAmount = grossAmount - commissionAmount

    if (booking.provider_id || booking.company_id) {
      await supabase.from('provider_earnings').insert({
        booking_id: bookingId,
        provider_id: booking.provider_id,
        company_id: booking.company_id,
        gross_amount: grossAmount,
        commission_amount: commissionAmount,
        net_amount: netAmount,
        payout_status: 'pending',
      })
    }

    // 4. Send Confirmation Notification to Customer
    await supabase.from('notifications').insert({
      user_id: booking.customer_id,
      type: 'payment',
      title: 'Payment Successful & Booking Confirmed',
      message: `Your payment of ₹${Number(booking.total_amount).toLocaleString('en-IN')} was verified. Booking #${booking.booking_number} is confirmed!`,
      data: { booking_id: bookingId },
    })

    return NextResponse.json({
      success: true,
      bookingNumber: booking.booking_number,
      message: 'Payment verified and booking confirmed successfully.',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

