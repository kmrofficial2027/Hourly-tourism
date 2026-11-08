'use client'

import { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseNotificationsOptions {
  /** Maximum number of notifications to fetch. Default 50. */
  limit?: number
  /** Whether to enable real-time subscription. Default true. */
  realtime?: boolean
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refresh: () => Promise<void>
}

export function useNotifications(
  userId: string | null | undefined,
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const { limit = 50, realtime = true } = options

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])
  const channelRef = useRef<RealtimeChannel | null>(null)
  const isFetchingRef = useRef<boolean>(false)

  // ---- Fetch notifications ----
  const fetchNotifications = useCallback(
    async (isBackground = false) => {
      if (!userId) {
        setNotifications([])
        setLoading(false)
        return
      }

      if (isFetchingRef.current) return
      isFetchingRef.current = true

      try {
        if (!isBackground) {
          setLoading(true)
        }
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (fetchError) {
          setError(fetchError.message)
          return
        }

        setNotifications((data as Notification[]) ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
      } finally {
        if (!isBackground) {
          setLoading(false)
        }
        isFetchingRef.current = false
      }
    },
    [userId, limit, supabase]
  )

  // ---- Mark single notification as read ----
  const markAsRead = useCallback(
    async (notificationId: string) => {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)

      if (updateError) {
        console.error('Failed to mark notification as read:', updateError.message)
        return
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      )
    },
    [supabase]
  )

  // ---- Mark all notifications as read ----
  const markAllAsRead = useCallback(async () => {
    if (!userId) return

    const { error: updateError } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (updateError) {
      console.error('Failed to mark all notifications as read:', updateError.message)
      return
    }

    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        is_read: true,
        read_at: n.read_at ?? new Date().toISOString(),
      }))
    )
  }, [userId, supabase])

  // ---- Initial fetch & stable 15-second background sync ----
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    fetchNotifications(false)

    // Gentle 15-second polling ensuring battery/data efficiency and no server storms
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return // Skip polling if user minimized tab or phone screen locked
      }
      fetchNotifications(true)
    }, 15000)

    return () => clearInterval(interval)
  }, [userId, fetchNotifications])

  // ---- Real-time subscription ----
  useEffect(() => {
    if (!userId || !realtime) return

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications((prev) => [newNotification, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as Notification
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          )
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [userId, realtime, supabase])

  // ---- Derived state ----
  const unreadCount = notifications.filter((n) => !n.is_read).length

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: () => fetchNotifications(false),
  }
}
