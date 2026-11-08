'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Bell,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  KeyRound,
  ExternalLink,
  Car,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { showToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { useProviderQueue } from '@/hooks/useProviderQueue'
import {
  isProviderBuzzerActive,
  stopContinuousProviderBuzzer,
  playBookingAcceptedSound,
  playBookingRejectedSound,
} from '@/lib/soundUtils'
import { createClient } from '@/lib/supabase/client'

// ============================================================================
// 1. PROVIDER GLOBAL REALTIME ALERTS & CONTINUOUS BUZZER BANNER
// ============================================================================
export function ProviderGlobalAlerts() {
  const { latestPendingBooking, pendingCount, refreshQueue } = useProviderQueue()
  const [buzzerActive, setBuzzerActive] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    setBuzzerActive(isProviderBuzzerActive())

    const handleBuzzerChange = (e: any) => {
      setBuzzerActive(Boolean(e.detail?.active))
    }

    window.addEventListener('hourly-provider-buzzer-change', handleBuzzerChange)
    return () => {
      window.removeEventListener('hourly-provider-buzzer-change', handleBuzzerChange)
    }
  }, [])

  const handleAcceptRide = async (bookingId: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'confirmed',
          notes: 'Accepted & confirmed via global provider alert',
        }),
      })

      if (res.ok) {
        stopContinuousProviderBuzzer()
        showToast.success('Booking confirmed! Start OTP generated for rider.')
        refreshQueue()
      } else {
        const data = await res.json().catch(() => ({}))
        showToast.error(data.error || 'Failed to accept booking.')
      }
    } catch {
      showToast.error('Network error accepting booking.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeclineRide = async (bookingId: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          reason: 'Host declined from global alert queue',
        }),
      })

      if (res.ok) {
        stopContinuousProviderBuzzer()
        showToast.success('Booking declined. Buzzer alarm stopped.')
        refreshQueue()
      } else {
        const data = await res.json().catch(() => ({}))
        showToast.error(data.error || 'Failed to decline booking.')
      }
    } catch {
      showToast.error('Network error declining booking.')
    } finally {
      setActionLoading(false)
    }
  }

  if (!buzzerActive && pendingCount === 0) return null

  return (
    <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white shadow-xl px-4 py-3 sticky top-0 z-50 animate-pulse border-b-2 border-red-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <Volume2 className="w-6 h-6 text-white animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-sm uppercase tracking-wider text-white">
                🚨 {buzzerActive ? 'LOUD BUZZER RINGING' : 'ACTION REQUIRED'}: NEW BOOKING REQUEST
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-red-700">
                {pendingCount} Pending
              </span>
            </div>
            <p className="text-xs text-white/95 mt-0.5">
              {latestPendingBooking
                ? `Booking #${latestPendingBooking.booking_number} for ${latestPendingBooking.booking_date} (${latestPendingBooking.duration_hours || 1} hrs) — ₹${latestPendingBooking.total_amount || ''}. Provider must Accept or Decline to stop alarm.`
                : 'Customer has submitted an hourly tour reservation. Please confirm or decline immediately.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {latestPendingBooking && (
            <>
              <Button
                variant="secondary"
                size="sm"
                isLoading={actionLoading}
                onClick={() => handleAcceptRide(latestPendingBooking.id)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs border-0 shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-white" />
                Accept & Confirm
              </Button>
              <Button
                variant="secondary"
                size="sm"
                isLoading={actionLoading}
                onClick={() => handleDeclineRide(latestPendingBooking.id)}
                className="bg-red-800 hover:bg-red-900 text-white font-bold text-xs border-0 shadow-md"
              >
                <XCircle className="w-3.5 h-3.5 mr-1 text-white" />
                Decline
              </Button>
            </>
          )}

          <Link href="/provider/bookings">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs font-bold"
            >
              Open Queue
            </Button>
          </Link>

          {buzzerActive && (
            <button
              onClick={() => stopContinuousProviderBuzzer()}
              title="Silence Buzzer Alarm"
              className="p-1.5 rounded-xl bg-black/30 hover:bg-black/50 text-white/90 text-xs"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 2. CUSTOMER GLOBAL REALTIME STATUS AUDIO ALERTS (5-SEC POLLING + REALTIME)
// ============================================================================
export function CustomerGlobalAlerts() {
  const { user } = useAuth()
  const [activeAlert, setActiveAlert] = useState<{
    type: 'accepted' | 'rejected'
    bookingNumber: string
    bookingId: string
  } | null>(null)

  const previousStatusMapRef = React.useRef<Map<string, string>>(new Map())
  const hasLoadedInitialRef = React.useRef(false)
  const isFetchingRef = React.useRef(false)

  // Resilient status polling with in-flight guard
  const checkCustomerStatusUpdates = React.useCallback(async () => {
    if (!user || isFetchingRef.current) return
    isFetchingRef.current = true

    try {
      const res = await fetch('/api/bookings?role=customer')
      if (res.ok) {
        const data = await res.json()
        const bookings = data.bookings || []

        bookings.forEach((b: any) => {
          const oldStatus = previousStatusMapRef.current.get(b.id)

          if (hasLoadedInitialRef.current && oldStatus && oldStatus !== b.status) {
            // 1. Status transitioned to 'confirmed' -> Joyful chime
            if (b.status === 'confirmed' && oldStatus !== 'confirmed') {
              playBookingAcceptedSound()
              setActiveAlert({
                type: 'accepted',
                bookingNumber: b.booking_number || 'Your Ride',
                bookingId: b.id,
              })
              showToast.success(`🎉 Your ride #${b.booking_number || ''} was ACCEPTED by the host! Start OTP is ready.`)
            }

            // 2. Status transitioned to 'rejected' or 'cancelled' -> Descending tone
            if (['rejected', 'cancelled'].includes(b.status) && oldStatus === 'pending') {
              playBookingRejectedSound()
              setActiveAlert({
                type: 'rejected',
                bookingNumber: b.booking_number || 'Your Ride',
                bookingId: b.id,
              })
              showToast.error(`Your booking #${b.booking_number || ''} was declined by host. Please choose another host or slot.`)
            }
          }

          previousStatusMapRef.current.set(b.id, b.status)
        })

        hasLoadedInitialRef.current = true
      }
    } catch {
      // Non-fatal
    } finally {
      isFetchingRef.current = false
    }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return

    checkCustomerStatusUpdates()

    const supabase = createClient()
    const channel = supabase
      .channel(`customer-global-status-alerts-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          const updated = payload.new as any
          const old = payload.old as any
          if (!updated) return

          // Only listen for bookings belonging to this customer
          if (updated.customer_id && updated.customer_id !== user.id) return

          // 1. Status became 'confirmed' -> Joyful 4-note ascending chime
          if (updated.status === 'confirmed' && old?.status !== 'confirmed') {
            playBookingAcceptedSound()
            setActiveAlert({
              type: 'accepted',
              bookingNumber: updated.booking_number || 'Your Ride',
              bookingId: updated.id,
            })
            showToast.success(`🎉 Your ride #${updated.booking_number || ''} was ACCEPTED by the host! Start OTP is ready.`)
          }

          // 2. Status became 'rejected' or 'cancelled' -> Distinct 2-note descending alert
          if (['rejected', 'cancelled'].includes(updated.status) && old?.status === 'pending') {
            playBookingRejectedSound()
            setActiveAlert({
              type: 'rejected',
              bookingNumber: updated.booking_number || 'Your Ride',
              bookingId: updated.id,
            })
            showToast.error(`Your booking #${updated.booking_number || ''} was declined by host. Please choose another host or slot.`)
          }
          checkCustomerStatusUpdates()
        }
      )
      .subscribe()

    // Battery-efficient background polling (every 8 seconds when active, paused when minimized)
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return
      }
      checkCustomerStatusUpdates()
    }, 8000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [user?.id, checkCustomerStatusUpdates])

  if (!activeAlert) return null

  return (
    <div
      className={`px-4 py-3 sticky top-0 z-50 text-white shadow-lg transition-all ${
        activeAlert.type === 'accepted'
          ? 'bg-gradient-to-r from-[#0a4d29] to-emerald-700'
          : 'bg-gradient-to-r from-red-600 to-rose-700'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          {activeAlert.type === 'accepted' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-white shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-bold">
            {activeAlert.type === 'accepted'
              ? `🎉 Ride Confirmed! Host accepted Booking #${activeAlert.bookingNumber}. Tap to view OTP & live tracking.`
              : `Booking #${activeAlert.bookingNumber} was declined by host. Please select another time or service.`}
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {activeAlert.type === 'accepted' && (
            <Link href={`/dashboard/bookings`}>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold"
              >
                View Trip & OTP
              </Button>
            </Link>
          )}
          <button
            onClick={() => setActiveAlert(null)}
            className="p-1 text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

