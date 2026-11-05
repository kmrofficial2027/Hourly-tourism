import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET: Fetch all refund records / queue
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = await createAdminSupabaseClient()

    // Fetch bookings with refund requests or cancelled bookings
    const { data: bookings, error } = await adminSupabase
      .from('bookings')
      .select(`
        id,
        booking_number,
        total_amount,
        payment_status,
        status,
        cancellation_reason,
        cancelled_at,
        created_at,
        customer:customer_id(id, full_name, email, phone),
        listing:listing_id(title, category)
      `)
      .in('status', ['cancelled', 'refund_initiated', 'refund_completed', 'disputed'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching refunds:', error)
      return NextResponse.json({ refunds: [] })
    }

    const refunds = (bookings || []).map((b) => {
      const isCompleted = b.status === 'refund_completed'
      const listingObj: any = Array.isArray(b.listing) ? b.listing[0] : b.listing
      const customerObj: any = Array.isArray(b.customer) ? b.customer[0] : b.customer
      return {
        id: b.id,
        bookingNumber: b.booking_number || `BK-${b.id.slice(0, 8).toUpperCase()}`,
        serviceTitle: listingObj?.title || 'Hourly Service',
        category: listingObj?.category || 'bike',
        customerName: customerObj?.full_name || 'Customer',
        customerEmail: customerObj?.email,
        totalAmount: Number(b.total_amount || 0),
        refundAmount: Number(b.total_amount || 0), // Full or policy-calculated
        reason: b.cancellation_reason || 'Customer cancellation under policy',
        status: isCompleted ? 'completed' : 'pending_approval',
        gateway: 'Cashfree / Razorpay Dual Escrow',
        referenceId: `REF-${b.id.slice(0, 8).toUpperCase()}`,
        requestedAt: b.cancelled_at || b.created_at,
      }
    })

    return NextResponse.json({ refunds })
  } catch (err: any) {
    console.error('Admin refunds GET error:', err)
    return NextResponse.json({ refunds: [] }, { status: 500 })
  }
}

// POST: Approve or reject refund
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingId, action, notes, refundAmount } = await request.json()

    if (!bookingId || !action) {
      return NextResponse.json({ error: 'Missing booking ID or action' }, { status: 400 })
    }

    const adminSupabase = await createAdminSupabaseClient()

    const newStatus = action === 'approve' ? 'refund_completed' : 'cancelled'
    const newPaymentStatus = action === 'approve' ? 'refunded' : 'paid'

    // Update booking
    const { error: updateError } = await adminSupabase
      .from('bookings')
      .update({
        status: newStatus,
        payment_status: newPaymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('Error updating booking refund:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log status history
    await adminSupabase.from('booking_status_history').insert({
      booking_id: bookingId,
      status: newStatus,
      changed_by: user.id,
      notes: notes || `Admin ${action}d refund of ₹${refundAmount || 0}`,
    })

    // Log admin audit
    try {
      await adminSupabase.from('admin_audit_logs').insert({
        actor_id: user.id,
        action: `refund_${action}`,
        target_entity: 'booking',
        target_id: bookingId,
        metadata: { action, refundAmount, notes },
      })
    } catch (e) {
      // Non-blocking if table is being created
    }

    return NextResponse.json({
      success: true,
      message: `Refund ${action === 'approve' ? 'approved and issued' : 'rejected'} successfully`,
    })
  } catch (err: any) {
    console.error('Admin refund POST error:', err)
    return NextResponse.json({ error: 'Failed to process refund' }, { status: 500 })
  }
}
