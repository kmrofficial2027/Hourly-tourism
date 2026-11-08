'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/Toast'

export function useRealtimeNotifications(userId: string | undefined) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasNewAlert, setHasNewAlert] = useState(false)

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()

    async function fetchInitialCount() {
      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false)

        if (!error && count !== null) {
          setUnreadCount(count)
        }
      } catch (err) {
        // fail gracefully
      }
    }

    fetchInitialCount()

    const uniqueChannelName = `user-notifications-${userId}-${Math.random().toString(36).substring(2, 9)}`
    let channel: any = null

    try {
      channel = supabase
        .channel(uniqueChannelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            setUnreadCount((prev) => prev + 1)
            setHasNewAlert(true)
            const title = (payload.new as any)?.title || 'New Notification'
            const message = (payload.new as any)?.message || ''
            showToast.success(`🔔 ${title}: ${message}`)
            setTimeout(() => setHasNewAlert(false), 5000)
          }
        )
        .subscribe()
    } catch (err) {
      console.debug('Realtime notifications subscription skipped:', err)
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [userId])

  const markAllReadLocally = () => {
    setUnreadCount(0)
    setHasNewAlert(false)
  }

  return { unreadCount, hasNewAlert, markAllReadLocally }
}

