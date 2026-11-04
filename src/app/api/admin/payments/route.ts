import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/server'

// GET: Fetch all payments for admin audit
export async function GET() {
  try {
    const adminSupabase = await createAdminSupabaseClient()

    const { data: payments, error } = await adminSupabase
      .from('payments')
      .select('*, bookings:booking_id(booking_number, total_amount, platform_fee, status, profiles:customer_id(full_name, email))')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching payments:', error)
      return NextResponse.json({ payments: [] })
    }

    const formatted = (payments || []).map((p: any) => {
      const notes = p.notes || {}
      const gateway = notes.gateway || (p.payment_method?.includes('cashfree') ? 'Cashfree' : p.payment_method?.includes('razorpay') ? 'Razorpay' : p.payment_method || 'Online')

      return {
        id: p.id,
        booking_id: p.booking_id,
        booking_number: p.bookings?.booking_number || p.booking_id?.slice(0, 8),
        customer_name: p.bookings?.profiles?.full_name || 'Customer',
        amount: Number(p.amount),
        currency: p.currency || 'INR',
        platform_fee: Number(p.bookings?.platform_fee || Math.round(Number(p.amount) * 0.1)),
        commission: Number(p.bookings?.platform_fee || Math.round(Number(p.amount) * 0.1)),
        status: p.status,
        payment_method: p.payment_method || 'UPI',
        gateway,
        notes,
        created_at: p.created_at,
      }
    })

    return NextResponse.json({ payments: formatted, total: formatted.length })
  } catch (err: any) {
    console.error('Admin payments error:', err)
    return NextResponse.json({ payments: [], total: 0 })
  }
}

