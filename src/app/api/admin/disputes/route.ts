import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET: Fetch all active and resolved disputes
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

    const { data: rawDisputes, error } = await adminSupabase
      .from('booking_disputes')
      .select(`
        *,
        booking:booking_id(
          id,
          booking_number,
          total_amount,
          status,
          booking_date,
          customer:customer_id(full_name, email, phone),
          provider:provider_id(user_id)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching disputes:', error)
      return NextResponse.json({ disputes: [] })
    }

    const disputes = (rawDisputes || []).map((d) => {
      const b: any = d.booking || {}
      const customer: any = Array.isArray(b.customer) ? b.customer[0] : b.customer
      return {
        id: d.id,
        bookingId: d.booking_id,
        bookingNumber: b.booking_number || `BK-${(d.booking_id || '').slice(0, 8).toUpperCase()}`,
        totalAmount: Number(b.total_amount || 0),
        customerName: customer?.full_name || 'Verified Tourist',
        customerEmail: customer?.email,
        customerPhone: customer?.phone,
        category: d.dispute_category || 'general_dispute',
        description: d.description || '',
        evidenceUrls: d.evidence_urls || [],
        status: d.status || 'opened',
        refundRequested: d.refund_requested_amount || b.total_amount || 0,
        resolution: d.resolution || null,
        resolvedAt: d.resolved_at || null,
        createdAt: d.created_at,
      }
    })

    return NextResponse.json({ disputes })
  } catch (err: any) {
    console.error('Admin disputes GET error:', err)
    return NextResponse.json({ disputes: [] }, { status: 500 })
  }
}

// POST: Resolve dispute
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { disputeId, bookingId, resolutionType, refundAmount, notes } = await request.json()

    if (!disputeId || !resolutionType) {
      return NextResponse.json({ error: 'Missing dispute ID or resolution type' }, { status: 400 })
    }

    const adminSupabase = await createAdminSupabaseClient()

    // Update dispute record
    const { error: disputeUpdateErr } = await adminSupabase
      .from('booking_disputes')
      .update({
        status: 'resolved',
        resolution: `${resolutionType.toUpperCase()}: ${notes || 'Mediation concluded by admin'}`,
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', disputeId)

    if (disputeUpdateErr) {
      return NextResponse.json({ error: disputeUpdateErr.message }, { status: 500 })
    }

    // If refund was awarded, update booking status
    if (bookingId && (resolutionType === 'full_refund' || resolutionType === 'partial_refund')) {
      await adminSupabase
        .from('bookings')
        .update({
          status: 'refund_completed',
          payment_status: 'refunded',
          refund_amount: Number(refundAmount || 0),
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)

      await adminSupabase.from('booking_status_history').insert({
        booking_id: bookingId,
        status: 'refund_completed',
        changed_by: user.id,
        notes: `Dispute mediated: ${resolutionType} of ₹${refundAmount} approved`,
      })
    }

    // Log admin audit
    try {
      await adminSupabase.from('admin_audit_logs').insert({
        actor_id: user.id,
        action: 'dispute_resolution',
        target_entity: 'booking_disputes',
        target_id: disputeId,
        metadata: { resolutionType, refundAmount, notes },
      })
    } catch (e) {
      // non-blocking
    }

    return NextResponse.json({
      success: true,
      message: 'Dispute case successfully resolved and archived',
    })
  } catch (err: any) {
    console.error('Dispute resolution error:', err)
    return NextResponse.json({ error: 'Failed to resolve dispute' }, { status: 500 })
  }
}

