import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'

interface PushBroadcastRecord {
  id: string
  title: string
  message: string
  audience: 'all' | 'tourist' | 'provider' | 'specific'
  targetUserId?: string
  targetUserEmail?: string
  category: string
  actionUrl: string
  recipientCount: number
  sentAt: string
  sentBy: string
  status: 'delivered'
}

// GET: Fetch recipient stats and push broadcast history
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

    const adminClient = await createAdminSupabaseClient()

    // Verify admin role
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get count of tourists and providers
    const [touristsRes, providersRes, allUsersRes, historyRes] = await Promise.all([
      adminClient.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
      adminClient.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'provider'),
      adminClient.from('profiles').select('id', { count: 'exact', head: true }),
      adminClient.from('platform_settings').select('value').eq('key', 'push_notification_history').single(),
    ])

    const history: PushBroadcastRecord[] = historyRes.data?.value || []

    return NextResponse.json({
      stats: {
        touristsCount: touristsRes.count || 0,
        providersCount: providersRes.count || 0,
        totalUsersCount: allUsersRes.count || 0,
      },
      history: history.slice(0, 30), // latest 30 broadcasts
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}

// POST: Broadcast push notification to selected audience (Tourists, Providers, All)
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

    const adminClient = await createAdminSupabaseClient()

    // Verify admin
    const { data: adminProfile } = await adminClient
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single()

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const {
      audience = 'all', // 'tourist' | 'provider' | 'all' | 'specific'
      targetUserId,
      title,
      message,
      category = 'promo',
      actionUrl = '/',
      urgency = 'normal',
    } = body

    if (!title?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })
    }

    // 1. Fetch matching audience profiles
    let profilesQuery = adminClient.from('profiles').select('id, email, role')

    if (audience === 'tourist') {
      profilesQuery = profilesQuery.eq('role', 'customer')
    } else if (audience === 'provider') {
      profilesQuery = profilesQuery.eq('role', 'provider')
    } else if (audience === 'specific' && targetUserId) {
      profilesQuery = profilesQuery.eq('id', targetUserId)
    }

    const { data: targetProfiles, error: profilesError } = await profilesQuery

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 })
    }

    const recipients = targetProfiles || []

    // 2. Insert notifications for all targeted users in batch
    if (recipients.length > 0) {
      const now = new Date().toISOString()
      const notificationRows = recipients.map((p) => ({
        user_id: p.id,
        title: title.trim(),
        message: message.trim(),
        type: category === 'promo' ? 'booking_created' : 'system_alert',
        action_url: actionUrl.trim() || '/',
        is_read: false,
        created_at: now,
      }))

      // Batch insert in chunks of 100
      const chunkSize = 100
      for (let i = 0; i < notificationRows.length; i += chunkSize) {
        const chunk = notificationRows.slice(i, i + chunkSize)
        await adminClient.from('notifications').insert(chunk)
      }
    }

    // 3. Broadcast real-time push event across all active apps & devices
    const realtimeChannel = adminClient.channel('hourly-push-broadcasts')
    await realtimeChannel.send({
      type: 'broadcast',
      event: 'push_notification',
      payload: {
        audience,
        targetUserId,
        title: title.trim(),
        message: message.trim(),
        category,
        actionUrl: actionUrl.trim() || '/',
        urgency,
        sentAt: new Date().toISOString(),
      },
    })

    // 4. Record in broadcast history
    const newRecord: PushBroadcastRecord = {
      id: `push-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      message: message.trim(),
      audience,
      targetUserId,
      category,
      actionUrl: actionUrl.trim() || '/',
      recipientCount: recipients.length,
      sentAt: new Date().toISOString(),
      sentBy: adminProfile.email || user.email || 'Admin',
      status: 'delivered',
    }

    const { data: existingHistory } = await adminClient
      .from('platform_settings')
      .select('value')
      .eq('key', 'push_notification_history')
      .single()

    const updatedHistory = [newRecord, ...(existingHistory?.value || [])].slice(0, 50)

    await adminClient.from('platform_settings').upsert({
      key: 'push_notification_history',
      value: updatedHistory,
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: `Push notification successfully delivered to ${recipients.length} ${
        audience === 'tourist'
          ? 'tourists'
          : audience === 'provider'
          ? 'providers'
          : 'recipients'
      }!`,
      recipientCount: recipients.length,
      record: newRecord,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}

