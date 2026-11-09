'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  CreditCard,
  XCircle,
  Star,
  CheckCircle2,
  AlertCircle,
  Download,
  MessageCircle,
  ShieldCheck,
  QrCode,
  Copy,
  KeyRound,
  Radio,
  Car,
  Navigation,
  Check,
  Plus,
  Sparkles,
  Compass,
  ArrowRight,
  Phone,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { showToast } from '@/components/ui/Toast'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import { getBookingStartOtp } from '@/lib/otpUtils'
import { generateInvoiceForBooking } from '@/lib/invoiceUtils'
import { useAuth } from '@/hooks/useAuth'
import { LiveTripTrackingModal } from '@/components/booking/LiveTripTrackingModal'
import { createClient } from '@/lib/supabase/client'
import { playBookingAcceptedSound, playBookingRejectedSound } from '@/lib/soundUtils'

// Helper: Calculate if live tracking radar should be active (5 mins before start time or during trip)
function isTrackingActive(booking: any): boolean {
  if (booking.status === 'in_progress') return true
  if (booking.status !== 'confirmed') return false

  try {
    const bookingDateStr = booking.booking_date
    const [startH, startM] = (booking.start_time || '00:00').split(':').map(Number)
    const tripStart = new Date(bookingDateStr)
    tripStart.setHours(startH, startM, 0, 0)

    const now = new Date()
    const diffMinutes = (tripStart.getTime() - now.getTime()) / (1000 * 60)
    // Within 5 minutes prior to scheduled start, or up to 4 hours past start if not ended
    return diffMinutes <= 5 && diffMinutes >= -240
  } catch {
    return false
  }
}

function CustomerBookingsContent() {
  const { user, profile } = useAuth()
  const searchParams = useSearchParams()
  const highlightBookingId = searchParams.get('bookingId')
  const defaultAction = searchParams.get('action')

  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  type FilterTab = 'all' | 'upcoming' | 'completed' | 'cancelled'
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  // Modals state
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [reviewBooking, setReviewBooking] = useState<any | null>(null)
  const [cancelBooking, setCancelBooking] = useState<any | null>(null)
  const [touristCancelReason, setTouristCancelReason] = useState<string>('Change of travel plans / Destination change')
  const [touristCustomReason, setTouristCustomReason] = useState<string>('')
  const [paymentModalBooking, setPaymentModalBooking] = useState<any | null>(null)
  const [trackingBooking, setTrackingBooking] = useState<any | null>(null)
  const [gatewayChoice, setGatewayChoice] = useState<'cashfree' | 'razorpay' | 'provider_qr' | 'pay_after_ride'>('cashfree')
  const [providerQrInfo, setProviderQrInfo] = useState<any | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [payLoading, setPayLoading] = useState(false)
  const hasAutoOpenedPayModalRef = React.useRef(false)

  const TOURIST_CANCEL_REASONS = [
    'Change of travel plans / Destination change',
    'Found alternative transportation',
    'Personal emergency or illness',
    'Booked incorrect date or time',
    'Price / Budget considerations',
    'Other reason',
  ]

  const isFetchingRef = React.useRef(false)

  const fetchBookings = async (isBackground = false) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    if (!isBackground) {
      setLoading(true)
    }
    try {
      const res = await fetch('/api/bookings?role=customer')
      if (res.ok) {
        const data = await res.json()
        const fetched = data.bookings || []
        setBookings(fetched)

        if (highlightBookingId) {
          const match = fetched.find((b: any) => b.id === highlightBookingId)
          if (match) {
            setSelectedBooking(match)
            if (
              !hasAutoOpenedPayModalRef.current &&
              defaultAction === 'pay' &&
              match.payment_status !== 'completed' &&
              match.status !== 'confirmed'
            ) {
              hasAutoOpenedPayModalRef.current = true
              handlePayNow(match)
              if (typeof window !== 'undefined') {
                window.history.replaceState({}, '', '/dashboard/bookings')
              }
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
    fetchBookings(false)

    // Rapid background sync every 5 seconds ensuring live status updates
    const interval = setInterval(() => {
      fetchBookings(true)
    }, 5000)

    return () => clearInterval(interval)
  }, [highlightBookingId])

  // Realtime audio intimation when host accepts (Joyful Chime) or declines (Alert Tone)
  useEffect(() => {
    const supabase = createClient()
    const uniqueChannelName = `customer-bookings-alerts-${Math.random().toString(36).substring(2, 9)}`
    let channel: any = null

    try {
      channel = supabase
        .channel(uniqueChannelName)
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

            // 1. Host Accepted & Confirmed -> Play Joyful Trip Accepted Chime 🎉
            if (updated.status === 'confirmed' && old?.status !== 'confirmed') {
              playBookingAcceptedSound()
              showToast.success(`🎉 Your ride #${updated.booking_number || ''} was ACCEPTED by host! Start OTP is ready.`)
              fetchBookings(true)
            }

            // 2. Host Declined / Rejected -> Play Distinct Single Alert Tone
            if (['rejected', 'cancelled'].includes(updated.status) && old?.status === 'pending') {
              playBookingRejectedSound()
              showToast.error(`Your booking request #${updated.booking_number || ''} was declined by the host. Please choose another host or slot.`)
              fetchBookings(true)
            }
          }
        )
        .subscribe()
    } catch (err) {
      console.debug('Customer bookings realtime subscription skipped:', err)
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  // Handle return redirect from Cashfree
  useEffect(() => {
    const orderIdParam = searchParams.get('order_id')
    const bookingIdParam = searchParams.get('bookingId')

    if (orderIdParam && bookingIdParam) {
      const verifyCashfreeReturn = async () => {
        try {
          const res = await fetch('/api/payments/cashfree/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: bookingIdParam,
              order_id: orderIdParam,
            }),
          })
          if (res.ok) {
            showToast.success('Cashfree payment verified! Reservation confirmed.')
            fetchBookings()
          }
        } catch (err) {
          console.error(err)
        }
      }
      verifyCashfreeReturn()
    }
  }, [searchParams])

  // Handle Cancellation with selected reason
  const handleCancelBooking = async () => {
    if (!cancelBooking) return
    setCancelLoading(true)
    try {
      const finalReason =
        touristCancelReason === 'Other reason' && touristCustomReason.trim()
          ? `Tourist: ${touristCustomReason.trim()}`
          : `Tourist: ${touristCancelReason}`

      const res = await fetch(`/api/bookings/${cancelBooking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          reason: finalReason,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to cancel booking')
      }

      showToast.success('Booking cancelled successfully')
      setCancelBooking(null)
      setSelectedBooking(null)
      setTouristCancelReason('Change of travel plans / Destination change')
      setTouristCustomReason('')
      fetchBookings()
    } catch (err: any) {
      showToast.error(err.message || 'Error cancelling booking')
    } finally {
      setCancelLoading(false)
    }
  }

  // Open Payment Modal (Cashfree, Razorpay, Provider QR, or Pay After Ride)
  const handlePayNow = async (booking: any) => {
    setPaymentModalBooking(booking)
    setProviderQrInfo(null)
    try {
      const pid = booking.provider_id || booking.service_listings?.provider_id || booking.listing_id
      const query = pid ? `providerId=${pid}` : `bookingId=${booking.id}`
      const res = await fetch(`/api/provider/qr-code?${query}`)
      if (res.ok) {
        const data = await res.json()
        setProviderQrInfo(data)
      } else {
        setProviderQrInfo({
          success: true,
          businessName: booking.service_listings?.title || 'Verified Local Host',
          hostName: 'Verified Tourism Host',
          phone: '+91 94883 12345',
          email: 'support@hourlytourism.com',
          city: booking.service_listings?.destination_city || 'Tamil Nadu',
        })
      }
    } catch (e) {
      console.error('Error fetching provider QR:', e)
      setProviderQrInfo({
        success: true,
        businessName: booking.service_listings?.title || 'Verified Local Host',
        hostName: 'Verified Tourism Host',
        phone: '+91 94883 12345',
        email: 'support@hourlytourism.com',
        city: booking.service_listings?.destination_city || 'Tamil Nadu',
      })
    }
  }

  // Execute Payment via Selected Method (Cashfree, Razorpay, Provider QR, or Pay After Ride)
  const handleExecutePayment = async () => {
    if (!paymentModalBooking) return
    setPayLoading(true)

    try {
      const session = (await createClient().auth.getSession()).data.session
      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (session?.access_token) {
        authHeaders['Authorization'] = `Bearer ${session.access_token}`
      }

      // 1. Direct Provider UPI QR Code (On-Site Immediate)
      if (gatewayChoice === 'provider_qr') {
        const res = await fetch(`/api/bookings/${paymentModalBooking.id}/status`, {
          method: 'PATCH',
          headers: authHeaders,
          body: JSON.stringify({
            status: ['pending', 'unpaid', 'awaiting_confirmation', 'payment_pending'].includes(paymentModalBooking.status)
              ? 'confirmed'
              : paymentModalBooking.status,
            payment_status: 'completed',
            notes: 'Paid via direct Provider UPI QR code on-site',
            payment_method: 'provider_upi_qr',
          }),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || 'Failed to record on-site payment')
        }

        showToast.success('Payment recorded via Provider QR Code! Reservation confirmed.')
        setPaymentModalBooking(null)
        setSelectedBooking(null)
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, '', '/dashboard/bookings')
        }
        fetchBookings()
        return
      }

      // 2. Pay After Ride Completes (Cash or Host QR at Destination)
      if (gatewayChoice === 'pay_after_ride') {
        const res = await fetch(`/api/bookings/${paymentModalBooking.id}/status`, {
          method: 'PATCH',
          headers: authHeaders,
          body: JSON.stringify({
            status: 'pending',
            payment_status: 'pending',
            notes: 'Pay after ride completes (on-site cash or host QR upon destination arrival)',
            payment_method: 'pay_after_ride',
          }),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || 'Failed to record pay-after-ride selection')
        }

        showToast.success('Booking request sent to host! You can pay your host via Cash or UPI QR once your ride finishes.')
        setPaymentModalBooking(null)
        setSelectedBooking(null)
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, '', '/dashboard/bookings')
        }
        fetchBookings()
        return
      }

      // 3. Cashfree Online Gateway
      if (gatewayChoice === 'cashfree') {
        const res = await fetch('/api/payments/cashfree/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: paymentModalBooking.id }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to initialize Cashfree payment')

        if (data.isDevelopmentMode) {
          const verifyRes = await fetch('/api/payments/cashfree/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: paymentModalBooking.id,
              order_id: data.order_id,
              isDevelopmentMode: true,
            }),
          })

          if (!verifyRes.ok) throw new Error('Cashfree verification failed')

          showToast.success('Payment verified via Cashfree! Reservation confirmed.')
          setPaymentModalBooking(null)
          setSelectedBooking(null)
          fetchBookings()
        } else {
          showToast.loading('Opening Cashfree Gateway...')
          const script = document.createElement('script')
          script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
          script.onload = () => {
            const cashfree = (window as any).Cashfree({ mode: data.environment || 'sandbox' })
            cashfree.checkout({
              paymentSessionId: data.payment_session_id,
              redirectTarget: '_modal',
            }).then((result: any) => {
              if (result.error) {
                showToast.error(result.error.message || 'Payment cancelled')
              }
              if (result.paymentDetails) {
                showToast.success('Cashfree payment successful!')
                setPaymentModalBooking(null)
                fetchBookings()
              }
            })
          }
          document.body.appendChild(script)
        }
      } else {
        // 4. Razorpay Online Gateway
        const res = await fetch('/api/payments/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: paymentModalBooking.id }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to initialize Razorpay payment')

        if (data.isDevelopmentMode) {
          const verifyRes = await fetch('/api/payments/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: paymentModalBooking.id,
              razorpay_order_id: data.order.id,
              razorpay_payment_id: `pay_rzp_test_${Date.now()}`,
              isDevelopmentMode: true,
            }),
          })

          if (!verifyRes.ok) throw new Error('Razorpay verification failed')

          showToast.success('Payment verified via Razorpay! Reservation confirmed.')
          setPaymentModalBooking(null)
          setSelectedBooking(null)
          fetchBookings()
        } else {
          showToast.loading('Opening Razorpay Gateway...')
        }
      }
    } catch (err: any) {
      showToast.error(err.message || 'Payment processing failed')
    } finally {
      setPayLoading(false)
    }
  }

  // Handle Official Branded PDF Invoice Download
  const handleDownloadReceipt = (booking: any) => {
    generateInvoiceForBooking(booking, profile)
    showToast.success('Generating official branded PDF Tax Invoice...')
  }

  // Filter calculations
  const upcomingCount = bookings.filter((b) =>
    ['pending', 'awaiting_confirmation', 'confirmed', 'in_progress'].includes(b.status)
  ).length
  const completedCount = bookings.filter((b) =>
    ['completed', 'paid'].includes(b.status)
  ).length
  const cancelledCount = bookings.filter((b) =>
    ['cancelled', 'rejected'].includes(b.status)
  ).length

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'upcoming') {
      return ['pending', 'awaiting_confirmation', 'confirmed', 'in_progress'].includes(b.status)
    }
    if (activeTab === 'completed') {
      return ['completed', 'paid'].includes(b.status)
    }
    if (activeTab === 'cancelled') {
      return ['cancelled', 'rejected'].includes(b.status)
    }
    return true
  })

  return (
    <DashboardLayout role="customer" title="My Bookings">
      <div className="space-y-6">
        {/* Top Header & Direct Add Booking Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-display">My Hourly Bookings</h1>
            <p className="text-xs text-gray-500 mt-1">
              View trip status, share Ride Start OTP with your host, track live GPS arrivals, or download official PDF tax invoices.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link href="/explore">
              <Button
                variant="primary"
                size="md"
                className="bg-[#ff7a00] hover:bg-[#e06900] text-white shadow-sm flex items-center space-x-1.5 font-bold"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Booking</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Add New Booking Experience Banner */}
        <div className="bg-gradient-to-r from-[#0a4d29] via-[#0f5e33] to-[#0a4d29] rounded-3xl p-5 sm:p-6 text-white shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold border border-emerald-400/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Ready for your next trip?</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                Book a New Hourly Ride or Local Guide
              </h2>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Choose pay-by-the-hour cars, bikes, group vans, or verified local guides. Zero surge pricing, verified hosts, and on-site payment options.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
              <Link href="/explore">
                <Button
                  variant="primary"
                  size="md"
                  className="bg-[#ff7a00] hover:bg-[#e06900] text-white font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Book New Trip</span>
                </Button>
              </Link>
              <Link href="/explore">
                <Button
                  variant="outline"
                  size="md"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-medium backdrop-blur-sm"
                >
                  <span>Explore Marketplace</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Categories shortcut grid */}
          <div className="mt-4 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            <Link
              href="/explore?category=humani"
              className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-xs text-white group border border-purple-400/40"
            >
              <span className="text-base group-hover:scale-110 transition-transform">🤝</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="font-bold truncate">Human-Ⅰ</p>
                  <span className="px-1 py-0.2 rounded text-[8px] font-black uppercase bg-[#ff7a00] text-white">New</span>
                </div>
                <p className="text-[10px] text-purple-200 truncate">Companion by hour</p>
              </div>
            </Link>
            <Link
              href="/explore?category=car"
              className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-xs text-white group"
            >
              <span className="text-base group-hover:scale-110 transition-transform">🚗</span>
              <div className="min-w-0">
                <p className="font-bold truncate">Hourly Car</p>
                <p className="text-[10px] text-emerald-200 truncate">Sedans & SUVs</p>
              </div>
            </Link>
            <Link
              href="/explore?category=bike"
              className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-xs text-white group"
            >
              <span className="text-base group-hover:scale-110 transition-transform">🏍️</span>
              <div className="min-w-0">
                <p className="font-bold truncate">Bike Tour</p>
                <p className="text-[10px] text-emerald-200 truncate">Scenic city rides</p>
              </div>
            </Link>
            <Link
              href="/explore?category=local_guide"
              className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-xs text-white group"
            >
              <span className="text-base group-hover:scale-110 transition-transform">🧑‍🏫</span>
              <div className="min-w-0">
                <p className="font-bold truncate">Local Guide</p>
                <p className="text-[10px] text-emerald-200 truncate">Heritage & culture</p>
              </div>
            </Link>
            <Link
              href="/explore?category=van"
              className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-xs text-white group"
            >
              <span className="text-base group-hover:scale-110 transition-transform">🚐</span>
              <div className="min-w-0">
                <p className="font-bold truncate">Group Van</p>
                <p className="text-[10px] text-emerald-200 truncate">Family & groups</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'all'
                ? 'bg-[#0a4d29] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>All Bookings</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {bookings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'upcoming'
                ? 'bg-[#ff7a00] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>Active & Upcoming</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeTab === 'upcoming' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {upcomingCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'completed'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>Completed Trips</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {completedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'cancelled'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>Cancelled</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeTab === 'cancelled' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cancelledCount}
            </span>
          </button>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-900 text-base">No Bookings Yet</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              You haven't booked any hourly mobility services or guided tours yet. Start exploring local rides!
            </p>
            <Link href="/explore">
              <Button variant="primary" size="md" className="bg-[#ff7a00] hover:bg-[#e06900] text-white font-bold">
                <Plus className="w-4 h-4 mr-1.5" />
                Browse & Book Hourly Trips
              </Button>
            </Link>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-900 text-sm">
              No {activeTab === 'upcoming' ? 'Active or Upcoming' : activeTab === 'completed' ? 'Completed' : 'Cancelled'} Bookings
            </h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              {activeTab === 'upcoming'
                ? "You don't have any pending or active rides at the moment."
                : activeTab === 'completed'
                ? "You haven't completed any hourly trips yet."
                : "You don't have any cancelled bookings."}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setActiveTab('all')}>
                View All Bookings
              </Button>
              <Link href="/explore">
                <Button variant="primary" size="sm" className="bg-[#ff7a00] hover:bg-[#e06900] text-white font-bold">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Book New Trip
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const isPast = new Date(booking.booking_date) < new Date()
              const canCancel = ['pending', 'awaiting_confirmation', 'confirmed'].includes(booking.status)
              const canReview = ['completed', 'paid'].includes(booking.status)
              const canPay = booking.payment_status === 'pending'
              const startOtp = getBookingStartOtp(booking.booking_number || booking.id)
              const trackingActive = isTrackingActive(booking)

              return (
                <div
                  key={booking.id}
                  className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-5"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                          #{booking.booking_number}
                        </span>
                        <BookingStatusBadge status={booking.status} />
                        {booking.payment_status === 'completed' || booking.payment_status === 'paid' ? (
                          <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            Paid
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            Pay on Completion / Pending
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-gray-900">
                        {booking.service_listings?.title || 'Hourly Experience'}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          {formatDate(booking.booking_date)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)} ({booking.duration_hours} hrs)
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          {booking.service_listings?.destination_city || 'India'}
                        </span>
                      </div>
                    </div>

                    <div className="text-left md:text-right">
                      <span className="text-base font-black text-emerald-800 block">
                        {formatCurrency(Number(booking.total_amount))}
                      </span>
                      <span className="text-[10px] text-gray-400">Total Charged</span>
                    </div>
                  </div>

                  {/* ── Start Ride OTP Banner (Visible for confirmed & in_progress) ── */}
                  {['confirmed', 'in_progress'].includes(booking.status) && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-[#ff7a00]/15 text-[#ff7a00] flex items-center justify-center shrink-0">
                          <KeyRound className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                            Ride Start OTP Code
                          </span>
                          <p className="text-xs text-amber-800">
                            Share this code with your host at meetup to verify and start your ride.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 bg-white px-4 py-1.5 rounded-xl border border-amber-300 shadow-sm shrink-0 self-start sm:self-auto">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">OTP:</span>
                        <span className="font-mono text-xl font-black text-[#ff7a00] tracking-widest">
                          {startOtp}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ── Live Rider Tracking & Safety Radar (5 min before start or in-progress) ── */}
                  {trackingActive && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                      <div className="flex items-center space-x-3">
                        <div className="relative flex items-center justify-center shrink-0">
                          <span className="relative flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                              🟢 Live Safety Radar Active
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-800 font-bold">
                              {booking.status === 'in_progress' ? 'Trip Underway' : 'Arriving in ~4 mins'}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-800 mt-0.5">
                            Host GPS telemetry connected • 24x7 safety assistance monitor enabled.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setTrackingBooking(booking)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0a4d29] text-white text-xs font-bold hover:bg-[#07361c] transition-colors shadow-xs"
                        >
                          <Navigation className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                          <span>Track Host Live</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/dashboard/bookings/${booking.id}`}>
                        <Button variant="outline" size="sm" className="font-bold border-emerald-200 text-[#0a4d29]">
                          Details & Timeline
                        </Button>
                      </Link>

                      {/* Live Trip Radar Button */}
                      {['confirmed', 'in_progress'].includes(booking.status) && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setTrackingBooking(booking)}
                          className="bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-bold"
                        >
                          <Navigation className="w-3.5 h-3.5 mr-1 text-emerald-600 animate-pulse" />
                          Live Trip Radar
                        </Button>
                      )}

                      {/* Pay Button if pending */}
                      {canPay && (
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={payLoading}
                          onClick={() => handlePayNow(booking)}
                          className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                        >
                          <CreditCard className="w-3.5 h-3.5 mr-1" />
                          Pay / Settle Ride
                        </Button>
                      )}

                      {/* Download Official Branded PDF Invoice */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownloadReceipt(booking)}
                        title="Download Official PDF Tax Invoice"
                        className="border border-emerald-200 hover:bg-emerald-50 text-emerald-900 font-semibold text-xs"
                      >
                        <Download className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                        PDF Invoice
                      </Button>

                      {/* Review Button */}
                      {canReview && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setReviewBooking(booking)}
                        >
                          <Star className="w-3.5 h-3.5 mr-1 text-amber-500" />
                          Review
                        </Button>
                      )}

                      {/* Cancel Button */}
                      {canCancel && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setCancelBooking(booking)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedBooking(booking)}
                      className="text-xs text-gray-500 hover:text-gray-900"
                    >
                      Quick Info
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Modal
          isOpen={Boolean(selectedBooking)}
          onClose={() => setSelectedBooking(null)}
          title={`Booking Details #${selectedBooking.booking_number}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h4 className="font-bold text-gray-900 text-base">
                  {selectedBooking.service_listings?.title}
                </h4>
                <p className="text-xs text-gray-400">
                  {selectedBooking.service_listings?.destination_city}
                </p>
              </div>
              <BookingStatusBadge status={selectedBooking.status} />
            </div>

            {/* Ride Start OTP Card inside modal */}
            {['confirmed', 'in_progress'].includes(selectedBooking.status) && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                    Ride Start Verification OTP
                  </span>
                  <p className="text-xs text-amber-800">
                    Share this code with your host to verify and begin your ride.
                  </p>
                </div>
                <div className="font-mono text-2xl font-black text-[#ff7a00] bg-white px-3.5 py-1 rounded-xl border border-amber-300">
                  {getBookingStartOtp(selectedBooking.booking_number || selectedBooking.id)}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-2xl">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Trip Date</span>
                <span className="font-bold text-gray-800 text-sm">
                  {formatDate(selectedBooking.booking_date)}
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Hours</span>
                <span className="font-bold text-gray-800 text-sm">
                  {formatTime(selectedBooking.start_time)} to {formatTime(selectedBooking.end_time)} ({selectedBooking.duration_hours} hrs)
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Participants</span>
                <span className="font-bold text-gray-800 text-sm">
                  {selectedBooking.num_participants} Person(s)
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Pickup Point</span>
                <span className="font-bold text-gray-800 text-sm">
                  {selectedBooking.pickup_location || 'Confirmed with host'}
                </span>
              </div>
            </div>

            {selectedBooking.special_requests && (
              <div className="p-3.5 bg-gray-50 rounded-2xl text-xs text-gray-600">
                <span className="font-bold block text-gray-900 mb-0.5">Special Requests:</span>
                <p>{selectedBooking.special_requests}</p>
              </div>
            )}

            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs space-y-1.5">
              <div className="flex justify-between text-gray-700">
                <span>Base Hourly Price:</span>
                <span className="font-semibold">{formatCurrency(Number(selectedBooking.base_price))}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Platform Service Fee:</span>
                <span className="font-semibold">{formatCurrency(Number(selectedBooking.platform_fee))}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>GST / Taxes:</span>
                <span className="font-semibold">{formatCurrency(Number(selectedBooking.tax_amount || 0))}</span>
              </div>
              <div className="pt-2 border-t border-emerald-200 flex justify-between font-bold text-emerald-900 text-sm">
                <span>Total Amount:</span>
                <span>{formatCurrency(Number(selectedBooking.total_amount))}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button variant="secondary" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => handleDownloadReceipt(selectedBooking)}
                className="bg-[#0a4d29] hover:bg-[#07361d] font-bold"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF Invoice
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Review Submission Modal */}
      {reviewBooking && (
        <Modal
          isOpen={Boolean(reviewBooking)}
          onClose={() => setReviewBooking(null)}
          title="Review Your Completed Trip"
          size="md"
        >
          <ReviewForm
            bookingId={reviewBooking.id}
            listingId={reviewBooking.listing_id}
            onSuccess={() => {
              setReviewBooking(null)
              fetchBookings()
            }}
            onCancel={() => setReviewBooking(null)}
          />
        </Modal>
      )}

      {/* Tourist Cancellation Reason Modal */}
      {cancelBooking && (
        <Modal
          isOpen={Boolean(cancelBooking)}
          onClose={() => setCancelBooking(null)}
          title="Cancel Your Reservation"
          size="md"
        >
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Full refund is eligible when cancelled at least 2 hours before scheduled pickup.</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 block">Select Reason for Cancellation:</label>
              <div className="space-y-1.5">
                {TOURIST_CANCEL_REASONS.map((r) => (
                  <label
                    key={r}
                    className="flex items-center space-x-2 text-xs text-gray-700 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="tourist_cancel_reason"
                      value={r}
                      checked={touristCancelReason === r}
                      onChange={() => setTouristCancelReason(r)}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>

            {touristCancelReason === 'Other reason' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">Please Specify:</label>
                <textarea
                  rows={2}
                  value={touristCustomReason}
                  onChange={(e) => setTouristCustomReason(e.target.value)}
                  placeholder="Tell us more about why you are cancelling..."
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2 border-t">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCancelBooking(null)}
              >
                Keep Booking
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={cancelLoading}
                onClick={handleCancelBooking}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Quad Payment Selection Modal (Cashfree, Razorpay, Provider QR, Pay After Ride) */}
      {paymentModalBooking && (
        <Modal
          isOpen={Boolean(paymentModalBooking)}
          onClose={() => {
            if (!payLoading) {
              setPaymentModalBooking(null)
              if (typeof window !== 'undefined') {
                window.history.replaceState({}, '', '/dashboard/bookings')
              }
            }
          }}
          title="Payment & Settlement Confirmation"
          size="md"
        >
          <div className="space-y-5">
            {/* Booking Summary Header */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-mono">
                  Booking #{paymentModalBooking.booking_number}
                </p>
                <h4 className="font-bold text-sm text-gray-900 mt-0.5">
                  {paymentModalBooking.service_listings?.title || 'Hourly Tourism Reservation'}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Duration: {paymentModalBooking.duration_hours} hours • {paymentModalBooking.booking_date}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Due</span>
                <span className="text-xl font-black text-[#0a4d29]">
                  {formatCurrency(Number(paymentModalBooking.total_amount))}
                </span>
              </div>
            </div>

            {/* Host Contact Information Card */}
            {(() => {
              const hostName = providerQrInfo?.hostName || providerQrInfo?.businessName || paymentModalBooking.host_contact?.name || paymentModalBooking.service_listings?.title || 'Verified Local Host'
              const hostPhone = providerQrInfo?.phone || paymentModalBooking.host_contact?.phone || '+91 94883 12345'
              const hostCity = providerQrInfo?.city || paymentModalBooking.host_contact?.city || paymentModalBooking.service_listings?.destination_city || 'Tamil Nadu'
              return (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#0a4d29] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                        🚗
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span className="font-bold text-xs text-emerald-950">
                            {hostName}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-200 text-emerald-900 flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            Verified Host
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800">
                          Operating in {hostCity}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <a
                        href={`tel:${hostPhone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-emerald-800 border border-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors shadow-xs"
                        title="Call host directly"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{hostPhone}</span>
                      </a>
                      <a
                        href={`https://wa.me/${hostPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                        title="WhatsApp Host"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* ── FAST 1-CLICK INSTANT ACTION (NO SCROLL REQUIRED) ── */}
            <div className="p-3 bg-gradient-to-r from-emerald-50 via-orange-50 to-emerald-50 rounded-2xl border-2 border-[#ff7a00]/40 flex items-center justify-between gap-3 shadow-xs">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Ready to confirm?</span>
                <span className="text-xs font-black text-gray-900">
                  {gatewayChoice === 'pay_after_ride' ? 'Pay After Ride Completes' : gatewayChoice === 'provider_qr' ? 'Direct UPI QR Scan' : 'Online Gateway'}
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                isLoading={payLoading}
                onClick={handleExecutePayment}
                className="bg-[#ff7a00] hover:bg-[#e06c00] text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all shrink-0"
              >
                {gatewayChoice === 'pay_after_ride' ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    Instant Confirm (Pay Later)
                  </>
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                    Pay & Confirm Now
                  </>
                )}
              </Button>
            </div>

            {/* Gateway & Option Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                Choose Payment Option
              </label>

              {/* Option A: Pay After Ride Completes */}
              <div
                onClick={() => setGatewayChoice('pay_after_ride')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between ${
                  gatewayChoice === 'pay_after_ride'
                    ? 'border-[#ff7a00] bg-orange-50/50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                      gatewayChoice === 'pay_after_ride'
                        ? 'border-[#ff7a00] bg-[#ff7a00]'
                        : 'border-gray-300'
                    }`}
                  >
                    {gatewayChoice === 'pay_after_ride' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-gray-900">
                        Pay After Ride Completes
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-orange-100 text-[#ff7a00]">
                        Flexible
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Pay host on-site via Cash or UPI QR scan once your trip safely finishes at your destination.
                    </p>
                  </div>
                </div>
              </div>

              {/* Option B: Direct Provider UPI QR Code (Pay Now / On-Site Settle) */}
              <div
                onClick={() => setGatewayChoice('provider_qr')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between ${
                  gatewayChoice === 'provider_qr'
                    ? 'border-purple-600 bg-purple-50/40 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                      gatewayChoice === 'provider_qr'
                        ? 'border-purple-600 bg-purple-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {gatewayChoice === 'provider_qr' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-gray-900">
                        Direct Provider UPI QR Code
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-800">
                        Host QR
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Scan host’s verified personal UPI QR code (GPay, PhonePe, Paytm) right now.
                    </p>
                  </div>
                </div>
              </div>

              {/* Option C: Cashfree Payments (Online) */}
              <div
                onClick={() => setGatewayChoice('cashfree')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between ${
                  gatewayChoice === 'cashfree'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                      gatewayChoice === 'cashfree'
                        ? 'border-emerald-600 bg-emerald-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {gatewayChoice === 'cashfree' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-gray-900">
                        Cashfree Online Gateway
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      UPI (GPay, PhonePe, BHIM), NetBanking, Credit/Debit Cards, PayLater
                    </p>
                  </div>
                </div>
              </div>

              {/* Option D: Razorpay (Online) */}
              <div
                onClick={() => setGatewayChoice('razorpay')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between ${
                  gatewayChoice === 'razorpay'
                    ? 'border-blue-600 bg-blue-50/40 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                      gatewayChoice === 'razorpay'
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {gatewayChoice === 'razorpay' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-gray-900">
                        Razorpay
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                        Popular
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      UPI QR Code, Major Cards, NetBanking, Wallets
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider QR display when Option B is selected */}
            {gatewayChoice === 'provider_qr' && (
              <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 text-center space-y-3">
                {providerQrInfo?.qrCodeUrl ? (
                  <>
                    <div className="w-48 h-48 bg-white p-2.5 rounded-2xl border-2 border-purple-300 shadow-sm mx-auto flex items-center justify-center overflow-hidden">
                      <img
                        src={providerQrInfo.qrCodeUrl}
                        alt="Provider UPI QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-xs text-gray-700">
                      Scan with any UPI app to pay{' '}
                      <strong>{formatCurrency(Number(paymentModalBooking.total_amount))}</strong>{' '}
                      directly to host {providerQrInfo.businessName ? `(${providerQrInfo.businessName})` : ''}.
                    </p>
                    {providerQrInfo.upiId && (
                      <div className="flex items-center justify-center space-x-2 bg-white py-1.5 px-3 rounded-lg border border-purple-200 text-xs w-fit mx-auto">
                        <span className="text-gray-500">UPI ID:</span>
                        <span className="font-mono font-bold text-purple-950">{providerQrInfo.upiId}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(providerQrInfo.upiId)
                            showToast.success('UPI ID copied!')
                          }}
                          className="text-purple-700 hover:text-purple-900"
                          title="Copy UPI ID"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-2 text-xs text-gray-600">
                    <QrCode className="w-8 h-8 text-purple-400 mx-auto mb-1" />
                    <p className="font-bold text-gray-800">Host accepts direct QR / Cash on-site</p>
                    <p className="text-gray-500 mt-0.5">
                      Your host will present their verified UPI QR code at service completion.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Terms & Cancellation Policy Box */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[#ff7a00]" />
                  <h5 className="font-black text-xs text-gray-900 uppercase tracking-wider">
                    Terms & Cancellation Policy
                  </h5>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-[#0a4d29]">
                  100% Escrow Protected
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                <div className="flex items-start space-x-2 bg-white/80 p-2.5 rounded-xl border border-amber-100">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <div>
                    <p className="font-bold text-gray-900 text-[11px]">Free Cancellation</p>
                    <p className="text-[10px] text-gray-600">Full 100% refund if cancelled up to 2 hours before trip start time.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 bg-white/80 p-2.5 rounded-xl border border-amber-100">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <div>
                    <p className="font-bold text-gray-900 text-[11px]">Fuel & Host Inclusions</p>
                    <p className="text-[10px] text-gray-600">Standard fuel & dedicated host time included. Zero hidden toll surcharges.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 bg-white/80 p-2.5 rounded-xl border border-amber-100">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <div>
                    <p className="font-bold text-gray-900 text-[11px]">Start OTP Security</p>
                    <p className="text-[10px] text-gray-600">Share your 4-digit Ride Start OTP only when your driver meets you.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 bg-white/80 p-2.5 rounded-xl border border-amber-100">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <div>
                    <p className="font-bold text-gray-900 text-[11px]">Flexible Rescheduling</p>
                    <p className="text-[10px] text-gray-600">Propose alternate time slots directly to your host without penalty.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Escrow & Security Note */}
            <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                256-bit SSL encrypted • Funds protected under Hourly Escrow • Instant assistance 24x7.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                variant="secondary"
                disabled={payLoading}
                onClick={() => {
                  setPaymentModalBooking(null)
                  if (typeof window !== 'undefined') {
                    window.history.replaceState({}, '', '/dashboard/bookings')
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={payLoading}
                onClick={handleExecutePayment}
                className={
                  gatewayChoice === 'pay_after_ride'
                    ? 'bg-[#ff7a00] hover:bg-[#e06c00] font-bold'
                    : gatewayChoice === 'cashfree'
                    ? 'bg-[#0a4d29] hover:bg-[#07361d] font-bold'
                    : gatewayChoice === 'razorpay'
                    ? 'bg-blue-600 hover:bg-blue-700 font-bold'
                    : 'bg-purple-700 hover:bg-purple-800 font-bold'
                }
              >
                {gatewayChoice === 'pay_after_ride' ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5" />
                    Confirm & Pay After Ride
                  </>
                ) : gatewayChoice === 'provider_qr' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Confirm Paid via Provider QR
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-1.5" />
                    Pay {formatCurrency(Number(paymentModalBooking.total_amount))} via{' '}
                    {gatewayChoice === 'cashfree' ? 'Cashfree' : 'Razorpay'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Live GPS Trip Tracking Modal */}
      {trackingBooking && (
        <LiveTripTrackingModal
          isOpen={Boolean(trackingBooking)}
          onClose={() => setTrackingBooking(null)}
          booking={trackingBooking}
          role="customer"
        />
      )}
    </DashboardLayout>
  )
}

export default function CustomerBookingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-400">Loading your bookings...</div>}>
      <CustomerBookingsContent />
    </Suspense>
  )
}
