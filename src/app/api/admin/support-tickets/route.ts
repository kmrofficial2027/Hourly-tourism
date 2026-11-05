import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET: Admin retrieves all support tickets across the platform
export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = await createAdminSupabaseClient()

    // Verify admin role
    const { data: adminProfile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')
    const roleFilter = searchParams.get('role')

    let query = adminSupabase
      .from('support_tickets')
      .select(`
        *,
        user:user_id(id, full_name, email, phone, role),
        booking:booking_id(id, booking_number, total_amount, status, booking_date)
      `)
      .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data: rawTickets, error } = await query

    let sourceTickets = rawTickets

    if (error) {
      console.error('Error fetching admin support tickets with joins:', error)
      // Fallback query if relation fails
      const { data: fallbackTickets } = await adminSupabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false })

      sourceTickets = fallbackTickets
    }

    let tickets = (sourceTickets || []).map((t: any) => {
      const u = Array.isArray(t.user) ? t.user[0] : t.user
      const b = Array.isArray(t.booking) ? t.booking[0] : t.booking
      const userRole = t.role || u?.role || 'customer'

      // Extract Category from description
      const catMatch = t.description?.match(/^\[Category:\s*([^\]]+)\]/m)
      const category = catMatch ? catMatch[1] : (t.category || 'General Support')

      // Extract Booking Number
      const bkMatch = t.description?.match(/^\[Booking Reference:\s*([^\]]+)\]/m)
      const bookingNumber = b?.booking_number || (bkMatch ? bkMatch[1] : (t.booking_id ? `BK-${t.booking_id.slice(0, 8).toUpperCase()}` : null))

      // Clean description
      let cleanDesc = t.description || ''
      cleanDesc = cleanDesc.replace(/^\[Category:[^\]]+\]\n*/m, '')
      cleanDesc = cleanDesc.replace(/^\[Booking Reference:[^\]]+\]\n*/m, '')
      cleanDesc = cleanDesc.trim()

      return {
        id: t.id,
        userId: t.user_id,
        userName: u?.full_name || (userRole === 'provider' ? 'Registered Host' : 'Registered Tourist'),
        userEmail: u?.email || 'N/A',
        userPhone: u?.phone || 'N/A',
        userRole,
        category,
        subject: t.subject,
        description: cleanDesc || t.description,
        priority: t.priority || 'medium',
        status: t.status || 'open',
        bookingId: t.booking_id,
        bookingNumber,
        bookingAmount: b?.total_amount ? Number(b.total_amount) : null,
        bookingStatus: b?.status || null,
        resolutionNotes: t.admin_notes || t.resolution_notes || null,
        resolvedAt: t.resolved_at || null,
        resolvedBy: t.resolved_by || null,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }
    })

    if (roleFilter && roleFilter !== 'all') {
      tickets = tickets.filter((t: any) => t.userRole === roleFilter)
    }

    return NextResponse.json({ tickets })
  } catch (err: any) {
    console.error('Admin support tickets GET error:', err)
    return NextResponse.json({ tickets: [] }, { status: 500 })
  }
}

// PATCH: Admin verifies, updates status, and solves the ticket using real DB columns
export async function PATCH(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = await createAdminSupabaseClient()

    // Verify admin role
    const { data: adminProfile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { ticketId, status, resolutionNotes } = body

    if (!ticketId || !status) {
      return NextResponse.json({ error: 'Ticket ID and status are required' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const formattedNotes = resolutionNotes?.trim() || 'Ticket verified and resolved by Antigravity Admin.'

    // Map to valid PostgreSQL ticket_status enum: 'open' | 'in_progress' | 'resolved' | 'closed'
    let dbStatus = 'open'
    if (status === 'resolved') dbStatus = 'resolved'
    else if (status === 'closed') dbStatus = 'closed'
    else if (status === 'in_progress' || status === 'waiting_for_customer') dbStatus = 'in_progress'
    else dbStatus = 'open'

    // Real table update using admin_notes and resolved_at
    const { data: updated, error: updateErr } = await adminSupabase
      .from('support_tickets')
      .update({
        status: dbStatus,
        admin_notes: formattedNotes,
        resolved_at: dbStatus === 'resolved' ? now : null,
        updated_at: now,
      })
      .eq('id', ticketId)
      .select('*')
      .maybeSingle()

    if (updateErr) {
      console.error('Failed to update ticket status:', updateErr)
      // Fallback: update status only
      const { data: fallbackUpdated, error: fallbackErr } = await adminSupabase
        .from('support_tickets')
        .update({
          status: dbStatus,
          updated_at: now,
        })
        .eq('id', ticketId)
        .select('*')
        .maybeSingle()

      if (fallbackErr) {
        return NextResponse.json({ error: fallbackErr.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        ticket: fallbackUpdated,
        message: `Ticket #${ticketId.slice(0, 8).toUpperCase()} updated to ${dbStatus}.`,
      })
    }

    return NextResponse.json({
      success: true,
      ticket: updated,
      message: `Ticket #${ticketId.slice(0, 8).toUpperCase()} successfully ${dbStatus === 'resolved' ? 'resolved and solved' : 'updated'}.`,
    })
  } catch (err: any) {
    console.error('Admin support tickets PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update support ticket' }, { status: 500 })
  }
}
