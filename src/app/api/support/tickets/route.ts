import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

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

    // Query tickets for the current authenticated user
    const { data: tickets, error } = await adminSupabase
      .from('support_tickets')
      .select(`
        *,
        booking:booking_id(id, booking_number, total_amount, status)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    let rawTickets = tickets

    if (error) {
      // Fallback without booking join if relation is missing
      const { data: simpleTickets } = await adminSupabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      rawTickets = simpleTickets
    }

    // Unpack metadata from description & normalize properties
    const mappedTickets = (rawTickets || []).map((t: any) => {
      const catMatch = t.description?.match(/^\[Category:\s*([^\]]+)\]/m)
      const category = catMatch ? catMatch[1] : (t.category || 'General Inquiry')

      const bkMatch = t.description?.match(/^\[Booking Reference:\s*([^\]]+)\]/m)
      const bookingNumber = t.booking?.booking_number || (bkMatch ? bkMatch[1] : (t.booking_id ? `BK-${t.booking_id.slice(0, 8).toUpperCase()}` : null))

      // Clean description for display (remove category and booking ref headers)
      let cleanDesc = t.description || ''
      cleanDesc = cleanDesc.replace(/^\[Category:[^\]]+\]\n*/m, '')
      cleanDesc = cleanDesc.replace(/^\[Booking Reference:[^\]]+\]\n*/m, '')
      cleanDesc = cleanDesc.trim()

      return {
        ...t,
        category,
        booking_number: bookingNumber,
        clean_description: cleanDesc || t.description,
        resolution_notes: t.admin_notes || t.resolution_notes || null,
        resolved_at: t.resolved_at || null,
      }
    })

    return NextResponse.json({ tickets: mappedTickets })
  } catch (err: any) {
    console.error('Tickets GET error:', err)
    return NextResponse.json({ tickets: [] }, { status: 500 })
  }
}

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
    const { category, subject, description, bookingId, priority, attachmentUrl, rawCategoryName } = body

    if (!subject || !description) {
      return NextResponse.json(
        { error: 'Subject and description are required' },
        { status: 400 }
      )
    }

    const adminSupabase = await createAdminSupabaseClient()

    // Determine category to embed
    const chosenCategory = rawCategoryName || category || 'General Inquiry'

    // Validate if bookingId is a valid UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test((bookingId || '').trim())
    const validBookingUUID = isUUID ? bookingId.trim() : null

    // Format description with [Category: ...] and [Booking Reference: ...] headers
    let finalDescription = `[Category: ${chosenCategory}]\n`
    if (bookingId && !isUUID) {
      finalDescription += `[Booking Reference: ${bookingId.trim()}]\n`
    }
    if (attachmentUrl) {
      finalDescription += `[Attachment: ${attachmentUrl}]\n`
    }
    finalDescription += `\n${description.trim()}`

    // Map priority to valid schema values: 'low' | 'medium' | 'high' | 'urgent'
    let normPriority = 'medium'
    const p = (priority || '').toLowerCase()
    if (p === 'urgent') normPriority = 'urgent'
    else if (p === 'high') normPriority = 'high'
    else if (p === 'low') normPriority = 'low'
    else normPriority = 'medium'

    // Real table columns in Supabase:
    // id, user_id, booking_id (UUID), subject, description, status, priority, admin_notes, resolved_at
    const basePayload: any = {
      user_id: user.id,
      subject: subject.trim(),
      description: finalDescription,
      priority: normPriority,
      status: 'open',
    }

    if (validBookingUUID) {
      basePayload.booking_id = validBookingUUID
    }

    let newTicket = null
    let lastError = null

    // Attempt 1: Standard insert with only real existing columns
    const { data: t1, error: e1 } = await adminSupabase
      .from('support_tickets')
      .insert(basePayload)
      .select('*')
      .maybeSingle()

    if (!e1 && t1) {
      newTicket = t1
    } else {
      lastError = e1
      // Attempt 2: If booking_id failed foreign key check, insert without booking_id
      const payloadNoBooking = {
        user_id: user.id,
        subject: subject.trim(),
        description: finalDescription,
        priority: normPriority,
        status: 'open',
      }

      const { data: t2, error: e2 } = await adminSupabase
        .from('support_tickets')
        .insert(payloadNoBooking)
        .select('*')
        .maybeSingle()

      if (!e2 && t2) {
        newTicket = t2
      } else {
        lastError = e2
        // Attempt 3: Guaranteed minimal insert (user_id, subject, description)
        const { data: t3, error: e3 } = await adminSupabase
          .from('support_tickets')
          .insert({
            user_id: user.id,
            subject: subject.trim(),
            description: finalDescription,
          })
          .select('*')
          .maybeSingle()

        if (!e3 && t3) {
          newTicket = t3
        } else {
          console.error('All support ticket insert attempts failed:', e3 || e2 || e1)
          return NextResponse.json(
            { error: e3?.message || e2?.message || e1?.message || 'Failed to create support ticket' },
            { status: 500 }
          )
        }
      }
    }

    return NextResponse.json({
      success: true,
      ticket: newTicket,
      message: 'Support ticket submitted. Ticket ID: #' + (newTicket?.id?.slice(0, 8).toUpperCase() || 'HT'),
    })
  } catch (err: any) {
    console.error('Ticket POST unexpected error:', err)
    return NextResponse.json({ error: err.message || 'Failed to create support ticket' }, { status: 500 })
  }
}
