'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  Play,
  Check,
  AlertCircle,
  MapPin,
  Phone,
  QrCode,
  Copy,
  ExternalLink,
  CreditCard,
  KeyRound,
  ShieldCheck,
  Volume2,
  Navigation,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { showToast } from '@/components/ui/Toast'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import {
  playMildHornBuzzer,
  startContinuousProviderBuzzer,
  stopContinuousProviderBuzzer,
  isProviderBuzzerActive,
} from '@/lib/soundUtils'
import { createClient } from '@/lib/supabase/client'
import { LiveTripTrackingModal } from '@/components/booking/LiveTripTrackingModal'

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [trackingBooking, setTrackingBooking] = useState<any | null>(null)
  const [buzzerRinging, setBuzzerRinging] = useState(false)
  const previousBookingsCountRef = useRef<number | null>(null)

  // QR Payment Collection Modal state
  const [qrModalBooking, setQrModalBooking] = useState<any | null>(null)
  const [providerQr, setProviderQr] = useState<{
    qrCodeUrl: string | null
    upiId: string | null
    businessName: string | null
  } | null>(null)
  const [loadingQr, setLoadingQr] = useState(false)

  // Start OTP Verification Modal state
  const [otpModalBooking, setOtpModalBooking] = useState<any | null>(null)
  const [enteredOtp, setEnteredOtp] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)
  const [otpLoading, setOtpLoading] = useState(false)

  // Cancellation Modal state
  const [cancelModalBooking, setCancelModalBooking] = useState<any | null>(null)
  const [cancelReason, setCancelReason] = useState<string>('Vehicle breakdown / Maintenance required')
  const [customReason, setCustomReason] = useState<string>('')
  const [cancelLoading, setCancelLoading] = useState(false)

  const PROVIDER_CANCEL_REASONS = [
    'Vehicle breakdown / Maintenance required',
    'Driver unavailable / Personal emergency',
    'Severe weather or road route blocked',
    'Schedule overlap / Unavoidable delay',
    'Customer requested cancellation directly',
    'Other reason',
  ]

  const isFetchingRef = useRef(false)

  const loadBookings = async (isBackground = false) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    if (!isBackground) {
      setLoading(true)
    }
    try {
      const res = await fetch('/api/bookings?role=provider')
      if (res.ok) {
        const data = await res.json()
        const fetched = data.bookings || []
        
        // Check if pending bookings exist
        const hasPending = fetched.some((b: any) =>
          ['pending', 'pending_provider_approval', 'awaiting_confirmation'].includes(b.status)
        )
        if (hasPending) {
          startContinuousProviderBuzzer()
        } else {
          stopContinuousProviderBuzzer()
        }

        previousBookingsCountRef.current = fetched.length
        setBookings(fetched)

        // Check URL parameters for direct accept or reject actions
        if (typeof window !== 'undefined') {
          const sp = new URLSearchParams(window.location.search)
          const targetId = sp.get('id')
          const targetAction = sp.get('action')
          if (targetId) {
            if (targetAction === 'accept') {
              stopContinuousProviderBuzzer()
              handleUpdateStatus(targetId, 'confirmed')
              window.history.replaceState({}, '', '/provider/bookings')
            } else if (targetAction === 'reject') {
              stopContinuousProviderBuzzer()
              handleUpdateStatus(targetId, 'rejected', undefined, 'Declined by host')
              window.history.replaceState({}, '', '/provider/bookings')
            }
          }
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      if (!isBackground) {
        setLoading(false)
      }
      isFetchingRef.current = false
    }
  }

  useEffect(() => {
    loadBookings(false)

    const handleBuzzerChange = (e: any) => {
      setBuzzerRinging(Boolean(e.detail?.active))
    }
    window.addEventListener('hourly-provider-buzzer-change', handleBuzzerChange)

    // Realtime listener for incoming booking requests
    const supabase = createClient()
    const channel = supabase
      .channel('provider-bookings-live-alerts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          const b = payload.new as any
          if (['pending', 'pending_provider_approval', 'awaiting_confirmation'].includes(b?.status)) {
            startContinuousProviderBuzzer()
            showToast.success('🚗 New Booking Request! Accept or Decline to stop buzzer alert.')
          }
          loadBookings(true)
        }
      )
      .subscribe()

    // Battery-efficient 8-second polling interval delivering new incoming booking requests without manual reload
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return
      }
      loadBookings(true)
    }, 8000)

    return () => {
      window.removeEventListener('hourly-provider-buzzer-change', handleBuzzerChange)
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
      stopContinuousProviderBuzzer()
    }
  }, [])

  const handleUpdateStatus = async (
    bookingId: string,
    newStatus: string,
    paymentStatus?: string,
    reason?: string,
    otp?: string
  ) => {
    // If provider is accepting or declining, STOP continuous buzzer immediately
    if (['confirmed', 'rejected', 'cancelled'].includes(newStatus)) {
      stopContinuousProviderBuzzer()
    }

    setActionLoading(bookingId)
    try {
      const payload: any = { status: newStatus }
      
      // Normalize 'paid' to valid DB enum 'completed'
      if (paymentStatus === 'paid' || paymentStatus === 'completed') {
        payload.payment_status = 'completed'
      } else if (paymentStatus) {
        payload.payment_status = paymentStatus
      }

      if (reason) payload.reason = reason
      if (otp) payload.entered_otp = otp

      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.error || 'Status update failed')
      }

      showToast.success(
        payload.payment_status === 'completed'
          ? 'Payment collected & trip marked as completed!'
          : newStatus === 'in_progress'
          ? 'Trip started! OTP verified successfully. Live safety radar active.'
          : newStatus === 'cancelled'
          ? 'Booking cancelled.'
          : `Booking updated to ${newStatus.replace(/_/g, ' ')}`
      )
      loadBookings()
      setQrModalBooking(null)
      return true
    } catch (err: any) {
      showToast.error(err.message || 'Error updating status')
      return false
    } finally {
      setActionLoading(null)
    }
  }

  // Handle Start Trip: Prompt for Tourist Start OTP
  const handleOpenOtpModal = (booking: any) => {
    setOtpModalBooking(booking)
    setEnteredOtp('')
    setOtpError(null)
  }

  const handleVerifyOtpAndStart = async () => {
    if (!otpModalBooking) return
    if (!enteredOtp || enteredOtp.trim().length !== 4) {
      setOtpError('Please enter the full 4-digit OTP shown in the tourist app.')
      return
    }

    setOtpLoading(true)
    setOtpError(null)

    try {
      const success = await handleUpdateStatus(
        otpModalBooking.id,
        'in_progress',
        undefined,
        undefined,
        enteredOtp.trim()
      )

      if (success) {
        setOtpModalBooking(null)
        setEnteredOtp('')
      } else {
        setOtpError('Invalid OTP. Please check the 4-digit code in the tourist app.')
      }
    } catch (e: any) {
      setOtpError(e.message || 'OTP verification failed.')
    } finally {
      setOtpLoading(false)
    }
  }

  // Handle End Trip: Complete ride and immediately open QR payment modal
  const handleEndTripAndCollectPayment = async (booking: any) => {
    setActionLoading(booking.id)
    try {
      // 1. Update status to completed
      const success = await handleUpdateStatus(booking.id, 'completed')
      // 2. Open QR collection modal directly so host & rider settle on the spot
      handleOpenQrModal(booking)
    } finally {
      setActionLoading(null)
    }
  }

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return
    setCancelLoading(true)
    try {
      const finalReason =
        cancelReason === 'Other reason' && customReason.trim()
          ? `Provider: ${customReason.trim()}`
          : `Provider: ${cancelReason}`

      await handleUpdateStatus(cancelModalBooking.id, 'cancelled', undefined, finalReason)
      setCancelModalBooking(null)
      setCancelReason('Vehicle breakdown / Maintenance required')
      setCustomReason('')
    } finally {
      setCancelLoading(false)
    }
  }

  // Open QR modal and fetch provider's uploaded QR
  const handleOpenQrModal = async (booking: any) => {
    setQrModalBooking(booking)
    setLoadingQr(true)
    try {
      const res = await fetch('/api/provider/qr-code')
      if (res.ok) {
        const data = await res.json()
        setProviderQr(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingQr(false)
    }
  }

  const handleCopyUpi = (upi: string) => {
    navigator.clipboard.writeText(upi)
    showToast.success('UPI ID copied to clipboard!')
  }

  return (
    <DashboardLayout role="provider" title="Manage Reservations">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-display">
              Customer Hourly Bookings
            </h1>
            <p className="text-xs text-gray-500">
              Verify Start OTPs, track live trips, and collect on-site settlement via your direct UPI QR code.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              playMildHornBuzzer()
              showToast.success('Buzzer test: sound active!')
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors w-fit"
            title="Test mild horn notification audio"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Audio Buzzer Active</span>
          </button>
        </div>

        {/* Continuous Looping Buzzer Alert Banner for Provider */}
        {buzzerRinging && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-xl shadow-red-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse border-2 border-yellow-300">
            <div className="flex items-center space-x-3">
              <span className="w-10 h-10 rounded-2xl bg-white text-red-600 flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
                🚨
              </span>
              <div>
                <p className="font-black text-sm">New Booking Request Arrived — Buzzer Ringing!</p>
                <p className="text-xs text-white/95">
                  Accept & Confirm or Decline the pending request below to stop the alert buzzer.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => stopContinuousProviderBuzzer()}
              className="px-4 py-2 rounded-xl bg-black/40 hover:bg-black/60 text-white text-xs font-bold transition-colors shrink-0"
            >
              Mute Buzzer
            </button>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-900">No Reservations Yet</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Your listings are active. When tourists book your hourly services, they will appear here with instant audio buzzer alerts.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const isActioning = actionLoading === b.id

              return (
                <div
                  key={b.id}
                  className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                        #{b.booking_number}
                      </span>
                      <BookingStatusBadge status={b.status} />
                      {b.payment_status === 'completed' || b.payment_status === 'paid' ? (
                        <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Paid
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          Payment Pending (On-Site)
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-gray-900">
                      {b.service_listings?.title || 'Hourly Service'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                        {formatDate(b.booking_date)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                        {formatTime(b.start_time)} to {formatTime(b.end_time)} ({b.duration_hours} hrs)
                      </span>
                      {b.profiles?.full_name && (
                        <span className="text-gray-700 font-semibold">
                          Tourist: {b.profiles.full_name} ({b.num_participants} pax)
                        </span>
                      )}
                    </div>

                    {b.status === 'confirmed' && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-semibold">
                        <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                        <span>Requires Tourist 4-Digit OTP to Start</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <div className="text-left md:text-right mr-3">
                      <span className="text-base font-black text-emerald-800 block">
                        {formatCurrency(Number(b.total_amount))}
                      </span>
                      <span className="text-[10px] text-gray-400">Total Booking Value</span>
                    </div>

                    {/* Status and QR Collection Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/provider/bookings/${b.id}`}>
                        <Button variant="outline" size="sm" className="font-bold border-orange-200 text-[#ff7a00]">
                          Manage & Details
                        </Button>
                      </Link>

                      {['pending', 'awaiting_confirmation', 'pending_provider_approval'].includes(b.status) && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={isActioning}
                            onClick={() => {
                              playMildHornBuzzer()
                              handleUpdateStatus(b.id, 'confirmed')
                            }}
                            className="bg-[#0a4d29] hover:bg-[#07361c] text-white font-black shadow-md shadow-green-900/20"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Accept & Confirm Ride
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            isLoading={isActioning}
                            onClick={() => handleUpdateStatus(b.id, 'rejected', undefined, 'Declined by host')}
                            className="font-bold"
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Decline
                          </Button>
                        </>
                      )}

                      {/* Confirmed: Start Trip with OTP Verification */}
                      {['confirmed', 'paid'].includes(b.status) && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={isActioning}
                            onClick={() => handleOpenOtpModal(b)}
                            className="bg-indigo-600 hover:bg-indigo-700 font-bold"
                          >
                            <Play className="w-3.5 h-3.5 mr-1" />
                            Start Trip (Enter OTP)
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setTrackingBooking(b)}
                            className="bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-bold"
                          >
                            <Navigation className="w-3.5 h-3.5 mr-1 text-emerald-600 animate-pulse" />
                            Live Trip Radar
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setCancelModalBooking(b)}
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Cancel Ride
                          </Button>
                        </>
                      )}

                      {/* Ongoing Trip: End Trip & Directly Open QR Payment Modal */}
                      {b.status === 'in_progress' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={isActioning}
                            onClick={() => handleEndTripAndCollectPayment(b)}
                            className="bg-emerald-600 hover:bg-emerald-700 font-bold shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            End Trip & Collect Payment
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setTrackingBooking(b)}
                            className="bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-bold"
                          >
                            <Navigation className="w-3.5 h-3.5 mr-1 text-emerald-600 animate-pulse" />
                            Live Trip Radar
                          </Button>
                        </>
                      )}

                      {/* Collect Payment via QR Button */}
                      {['confirmed', 'in_progress', 'completed'].includes(b.status) && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenQrModal(b)}
                          className="border-emerald-600 text-emerald-800 hover:bg-emerald-50"
                        >
                          <QrCode className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                          Host QR Code
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Ride Start OTP Verification Modal */}
        {otpModalBooking && (
          <Modal
            isOpen={true}
            onClose={() => {
              setOtpModalBooking(null)
              setEnteredOtp('')
              setOtpError(null)
            }}
            title="Verify Tourist Start OTP"
            size="sm"
          >
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="text-xs font-bold text-amber-900 block mb-1">
                  Ride Verification Required
                </span>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Ask the tourist to open their Hourly Tourism booking #{otpModalBooking.booking_number} and share their <strong>4-digit Start OTP</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Enter 4-Digit Tourist OTP
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={enteredOtp}
                  onChange={(e) => {
                    setEnteredOtp(e.target.value.replace(/\D/g, ''))
                    setOtpError(null)
                  }}
                  placeholder="• • • •"
                  className="w-full text-center text-3xl font-mono font-black tracking-widest py-3 px-4 rounded-2xl border-2 border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-200 text-emerald-900 bg-emerald-50/30"
                  autoFocus
                />
                {otpError && (
                  <p className="text-xs font-semibold text-red-600 mt-2 text-center">
                    {otpError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setOtpModalBooking(null)
                    setEnteredOtp('')
                    setOtpError(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={otpLoading}
                  onClick={handleVerifyOtpAndStart}
                  className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                >
                  <Play className="w-3.5 h-3.5 mr-1" />
                  Verify & Start Trip
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* QR Payment Collection Modal */}
        {qrModalBooking && (
          <Modal
            isOpen={true}
            onClose={() => setQrModalBooking(null)}
            title="Direct Payment UPI QR Code"
          >
            <div className="space-y-6 pt-2">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                    Amount to Collect
                  </span>
                  <span className="text-2xl font-black text-emerald-900">
                    {formatCurrency(Number(qrModalBooking.total_amount))}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block">Booking Number</span>
                  <span className="font-mono text-xs font-bold text-gray-800">
                    #{qrModalBooking.booking_number}
                  </span>
                </div>
              </div>

              {loadingQr ? (
                <div className="py-12 text-center text-xs text-gray-400">Loading your QR code...</div>
              ) : providerQr?.qrCodeUrl ? (
                <div className="space-y-4 text-center">
                  <div className="w-64 h-64 mx-auto bg-white p-3 rounded-3xl border-2 border-emerald-500 shadow-md flex items-center justify-center overflow-hidden">
                    <img
                      src={providerQr.qrCodeUrl}
                      alt="Provider Payment QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <p className="text-xs text-gray-600 max-w-sm mx-auto">
                    Ask tourist to scan with <strong>Google Pay, PhonePe, Paytm</strong> or any UPI app to settle their completed ride.
                  </p>

                  {providerQr.upiId && (
                    <div className="flex items-center justify-center space-x-2 bg-gray-50 py-2 px-4 rounded-xl border border-gray-200 w-fit mx-auto text-xs">
                      <span className="text-gray-500">UPI ID:</span>
                      <span className="font-mono font-bold text-gray-800">{providerQr.upiId}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyUpi(providerQr.upiId!)}
                        className="text-emerald-700 hover:text-emerald-800 p-1"
                        title="Copy UPI ID"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100 space-y-2">
                    <Button
                      variant="primary"
                      fullWidth
                      size="lg"
                      isLoading={actionLoading === qrModalBooking.id}
                      onClick={() =>
                        handleUpdateStatus(qrModalBooking.id, 'completed', 'completed')
                      }
                      className="bg-[#0a4d29] hover:bg-[#07361d] font-bold"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Confirm Payment Received & Complete Trip
                    </Button>
                    <p className="text-[11px] text-gray-400 text-center">
                      Marks booking as completed and settled in platform logs.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">
                      No Payment QR Code Uploaded Yet
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      Upload your Google Pay, PhonePe, or Paytm QR code in your provider profile so tourists can pay you directly at service completion.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <Link href="/provider/profile">
                      <Button variant="primary" size="md">
                        <QrCode className="w-4 h-4 mr-1.5" />
                        Upload QR Code
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => handleUpdateStatus(qrModalBooking.id, 'completed', 'completed')}
                    >
                      Mark Cash Settled
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Provider Cancellation Reason Modal */}
        {cancelModalBooking && (
          <Modal
            isOpen={true}
            onClose={() => setCancelModalBooking(null)}
            title="Cancel Booking Reservation"
          >
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-red-50 rounded-xl text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Cancelling a reservation triggers an instant notification and refund to the customer.</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 block">Select Cancellation Reason:</label>
                <div className="space-y-1.5">
                  {PROVIDER_CANCEL_REASONS.map((r) => (
                    <label
                      key={r}
                      className="flex items-center space-x-2 text-xs text-gray-700 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="cancel_reason"
                        value={r}
                        checked={cancelReason === r}
                        onChange={() => setCancelReason(r)}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              {cancelReason === 'Other reason' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 block">Provide Details:</label>
                  <textarea
                    rows={2}
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Describe specific reason..."
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2 border-t">
                <Button variant="secondary" size="sm" onClick={() => setCancelModalBooking(null)}>
                  Keep Booking
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={cancelLoading}
                  onClick={handleConfirmCancel}
                >
                  Confirm Cancellation
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Dual Live GPS Tracking Modal for Provider */}
        {trackingBooking && (
          <LiveTripTrackingModal
            isOpen={Boolean(trackingBooking)}
            onClose={() => setTrackingBooking(null)}
            booking={trackingBooking}
            role="provider"
            onOpenOtpModal={() => {
              setOtpModalBooking(trackingBooking)
              setTrackingBooking(null)
            }}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
