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

    const { orderId, bookingId } = await request.json()

    if (!orderId || !bookingId) {
      return NextResponse.json({ error: 'Missing orderId or bookingId' }, { status: 400 })
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

    // Dev / placeholder mode — auto-confirm booking
    if (isPlaceholder) {
      await supabase
        .from('bookings')
        .update({ status: 'confirmed', payment_status: 'paid' })
        .eq('id', bookingId)

      return NextResponse.json({
        success: true,
        isDevelopmentMode: true,
        message: 'Booking confirmed in development mode (Cashfree not configured)',
      })
    }

    // Verify order status with Cashfree API
    const baseUrl =
      cfEnv === 'production'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg'

    const response = await fetch(`${baseUrl}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-api-version': apiVersion,
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to verify Cashfree order' },
        { status: response.status }
      )
    }

    if (data.order_status !== 'PAID') {
      return NextResponse.json(
        { error: `Payment not completed. Status: ${data.order_status}` },
        { status: 400 }
      )
    }

    // Get payment details
    const paymentsResp = await fetch(`${baseUrl}/orders/${orderId}/payments`, {
      method: 'GET',
      headers: {
        'x-api-version': apiVersion,
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
    })

    const payments = await paymentsResp.json()
    const payment = Array.isArray(payments) ? payments[0] : null

    // Fetch booking to compute earnings
    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const totalAmount = Number(booking.total_amount)
    const platformCommission = Math.round(totalAmount * 0.1 * 100) / 100
    const providerEarnings = Math.round((totalAmount - platformCommission) * 100) / 100

    // Update booking status
    await supabase
      .from('bookings')
      .update({ status: 'confirmed', payment_status: 'paid' })
      .eq('id', bookingId)

    // Insert payment record
    await supabase.from('payments').insert({
      booking_id: bookingId,
      user_id: user.id,
      amount: totalAmount,
      currency: 'INR',
      status: 'completed',
      payment_method: payment?.payment_method || 'cashfree',
      notes: {
        gateway: 'cashfree',
        cashfree_order_id: orderId,
        cashfree_payment_id: payment?.cf_payment_id,
        cashfree_payment_time: payment?.payment_completion_time,
      },
    })

    // Insert provider earnings record if provider_id exists
    if (booking.provider_id) {
      await supabase.from('provider_earnings').upsert({
        provider_id: booking.provider_id,
        booking_id: bookingId,
        total_amount: totalAmount,
        platform_commission: platformCommission,
        provider_earnings: providerEarnings,
        status: 'pending_payout',
      })
    }

    // Insert notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Payment Successful',
      message: `Your booking #${booking.booking_number} has been confirmed via Cashfree. Amount: ₹${totalAmount}`,
      type: 'payment',
      is_read: false,
    })

    return NextResponse.json({
      success: true,
      isDevelopmentMode: false,
      message: 'Payment verified and booking confirmed',
      bookingNumber: booking.booking_number,
    })
  } catch (err: any) {
    console.error('Cashfree Verify Error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
