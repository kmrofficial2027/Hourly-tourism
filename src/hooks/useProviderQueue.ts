'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/Toast'

export function useProviderQueue(providerId?: string) {
  const [pendingCount, setPendingCount] = useState(0)
  const [latestPendingBooking, setLatestPendingBooking] = useState<any>(null)
  const [hasNewPing, setHasNewPing] = useState(false)

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch('/api/bookings?role=provider')
      if (res.ok) {
        const data = await res.json()
        const pending = (data.bookings || []).filter(
          (b: any) => b.status === 'pending' || b.status === 'pending_provider_approval'
        )
        setPendingCount(pending.length)
        if (pending.length > 0) {
          setLatestPendingBooking(pending[0])
        }
      }
    } catch (err) {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchPending()

    const supabase = createClient()

    const channel = supabase
      .channel('provider-bookings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const booking = payload.new as any
            if (booking.status === 'pending' || booking.status === 'pending_provider_approval') {
              setPendingCount((prev) => prev + 1)
              setLatestPendingBooking(booking)
              setHasNewPing(true)
              showToast.success('⚡ New Booking Request Received!')
              setTimeout(() => setHasNewPing(false), 8000)
            }
          } else if (payload.eventType === 'UPDATE') {
            fetchPending()
          }
        }
      )
      .subscribe()

    // 30-second background polling fallback
    const interval = setInterval(fetchPending, 30000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [fetchPending])

  return {
    pendingCount,
    latestPendingBooking,
    hasNewPing,
    refreshQueue: fetchPending,
  }
}

