'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/Toast'
import { playBookingAcceptedSound, playBookingRejectedSound } from '@/lib/soundUtils'

export interface BookingRealtimeState {
  status: string | null
  updatedPayload: any | null
  lastUpdated: Date | null
  isConnected: boolean
}

export function useRealtimeBooking(bookingId: string | null | undefined, onStatusChange?: (newStatus: string, payload: any) => void) {
  const [realtimeState, setRealtimeState] = useState<BookingRealtimeState>({
    status: null,
    updatedPayload: null,
    lastUpdated: null,
    isConnected: false,
  })

  useEffect(() => {
    if (!bookingId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`booking-live-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${bookingId}`,
        },
        (payload) => {
          const newStatus = (payload.new as any)?.status
          const updated = payload.new
          if (newStatus) {
            setRealtimeState({
              status: newStatus,
              updatedPayload: updated,
              lastUpdated: new Date(),
              isConnected: true,
            })

            // Audio Intimation for Customer: Two Distinct Sounds
            if (newStatus === 'confirmed') {
              playBookingAcceptedSound()
            } else if (newStatus === 'rejected' || newStatus === 'cancelled') {
              playBookingRejectedSound()
            }

            const formatted = newStatus.replace(/_/g, ' ')
            showToast.success(`Live Update: Booking status is now "${formatted}"`)
            if (onStatusChange) {
              onStatusChange(newStatus, updated)
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeState((prev) => ({ ...prev, isConnected: true }))
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeState((prev) => ({ ...prev, isConnected: false }))
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [bookingId, onStatusChange])

  return realtimeState
}

