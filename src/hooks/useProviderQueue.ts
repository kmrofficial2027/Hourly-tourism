'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/Toast'
import {
  playMildHornBuzzer,
  startContinuousProviderBuzzer,
  stopContinuousProviderBuzzer,
} from '@/lib/soundUtils'
import {
  requestNotificationPermission,
  triggerProviderBookingPushNotification,
} from '@/lib/pushNotificationUtils'

export function useProviderQueue(providerId?: string) {
  const [pendingCount, setPendingCount] = useState(0)
  const [latestPendingBooking, setLatestPendingBooking] = useState<any>(null)
  const [hasNewPing, setHasNewPing] = useState(false)
  const previousCountRef = useRef<number | null>(null)
  const isFetchingRef = useRef<boolean>(false)

  // Request browser push notification permission once on mount
  useEffect(() => {
    requestNotificationPermission()
  }, [])

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

        // If pending booking exists or new arrived, keep buzzer ringing and trigger notification
        if (pendingBookings.length > 0) {
          startContinuousProviderBuzzer()
          if (previousCountRef.current === null || newCount > previousCountRef.current) {
            triggerProviderBookingPushNotification(pendingBookings[0])
            showToast.success('✨ New Hourly Booking Request Received!')
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
    const uniqueChannelName = `provider-queue-${Math.random().toString(36).substring(2, 9)}`
    let channel: any = null

    try {
      channel = supabase
        .channel(uniqueChannelName)
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
                // START CONTINUOUS BUZZER & SYSTEM NOTIFICATION
                startContinuousProviderBuzzer()
                triggerProviderBookingPushNotification(booking)
                showToast.success('✨ New Booking Request Received!')
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
    } catch (err) {
      console.debug('Provider queue realtime subscription skipped:', err)
    }

    // Battery-efficient 8-second background polling ensuring instant alert delivery (skips when tab minimized)
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return
      }
      fetchPending()
    }, 8000)

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
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
