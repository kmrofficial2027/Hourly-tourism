'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/Toast'
import {
  playMildHornBuzzer,
  startContinuousProviderBuzzer,
  stopContinuousProviderBuzzer,
} from '@/lib/soundUtils'

export function useProviderQueue(providerId?: string) {
  const [pendingCount, setPendingCount] = useState(0)
  const [latestPendingBooking, setLatestPendingBooking] = useState<any>(null)
  const [hasNewPing, setHasNewPing] = useState(false)
  const previousCountRef = useRef<number | null>(null)
  const isFetchingRef = useRef<boolean>(false)

  const fetchPending = useCallback(async () => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    try {
      const res = await fetch('/api/bookings?role=provider')
      if (res.ok) {
        const data = await res.json()
        const pendingBookings = (data.bookings || []).filter(
          (b: any) => ['pending', 'pending_provider_approval', 'awaiting_confirmation'].includes(b.status)
        )
        const activeBookings = (data.bookings || []).filter(
          (b: any) => ['pending', 'pending_provider_approval', 'confirmed'].includes(b.status)
        )
        const newCount = activeBookings.length

        // If new pending booking arrived, start continuous buzzer until accepted/declined
        if (pendingBookings.length > 0) {
          if (previousCountRef.current !== null && newCount > previousCountRef.current) {
            startContinuousProviderBuzzer()
            showToast.success('🚗 New Hourly Booking Request Received! Buzzer ringing.')
          }
        } else {
          // If no pending bookings remaining, stop buzzer
          stopContinuousProviderBuzzer()
        }

        previousCountRef.current = newCount

        setPendingCount(newCount)
        if (newCount > 0) {
          setLatestPendingBooking(activeBookings[0])
        }
      }
    } catch (err) {
      // silent
    } finally {
      isFetchingRef.current = false
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
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const booking = payload.new as any
            if (['pending', 'pending_provider_approval', 'awaiting_confirmation'].includes(booking.status)) {
              setPendingCount((prev) => prev + 1)
              setLatestPendingBooking(booking)
              setHasNewPing(true)
              // START CONTINUOUS BUZZER UNTIL ACCEPTED OR DECLINED
              startContinuousProviderBuzzer()
              showToast.success('⚡ New Booking Request! Accept or Decline to stop buzzer alert.')
              setTimeout(() => setHasNewPing(false), 8000)
            } else if (['confirmed', 'rejected', 'cancelled'].includes(booking.status)) {
              // Status resolved -> stop continuous buzzer
              stopContinuousProviderBuzzer()
            }
            fetchPending()
          }
        }
      )
      .subscribe()

    // 45-second background polling fallback (only active when tab is visible)
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return
      fetchPending()
    }, 45000)

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
