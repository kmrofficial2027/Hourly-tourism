import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// High-speed short-lived in-memory cache for notifications (4s TTL)
const notifCache = new Map<string, { data: any; ts: number }>()
const NOTIF_CACHE_TTL = 4 * 1000

// GET: Fetch real notifications for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cached = notifCache.get(user.id)
    if (cached && Date.now() - cached.ts < NOTIF_CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const unreadCount = (notifications || []).filter((n: any) => !n.is_read).length

    const result = {
      notifications: notifications || [],
      unreadCount,
    }

    notifCache.set(user.id, { data: result, ts: Date.now() })

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

// PATCH: Mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, markAll } = body
    notifCache.delete(user.id)

    if (markAll) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) throw error
      return NextResponse.json({ success: true, message: 'All marked as read' })
    }

    if (notificationId) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) throw error
      return NextResponse.json({ success: true, message: 'Notification marked as read' })
    }

    return NextResponse.json({ error: 'Missing notificationId or markAll' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}

// POST: Trigger a live test notification for the authenticated user
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const title = body.title || '🔔 Real-Time Alert Active'
    const message =
      body.message ||
      'Your Hourly Tourism live notification radar is connected and operating in real-time.'
    const type = body.type || 'booking_created'
    const actionUrl = body.actionUrl || '/provider'

    const adminClient = await createAdminSupabaseClient()
    const { data: inserted, error: insertError } = await adminClient
      .from('notifications')
      .insert({
        user_id: user.id,
        title,
        message,
        type,
        action_url: actionUrl,
        is_read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      notification: inserted,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
