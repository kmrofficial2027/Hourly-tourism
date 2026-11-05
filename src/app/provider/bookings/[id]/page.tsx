'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  MessageCircle,
  Download,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Car,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge'
import { BookingTimeline } from '@/components/booking/BookingTimeline'
import { BookingCancelModal } from '@/components/booking/BookingCancelModal'
import { BookingChatModal } from '@/components/booking/BookingChatModal'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FullPageLoader } from '@/components/ui/LoadingSpinner'
import { showToast } from '@/components/ui/Toast'
import { formatCurrency, formatDate, normalizeListingImages } from '@/lib/utils'
import { printBookingInvoice } from '@/lib/invoiceUtils'
import { useAuth } from '@/hooks/useAuth'
import { useRealtimeBooking } from '@/hooks/useRealtimeBooking'

export default function ProviderBookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params?.id as string
  const { user } = useAuth()

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Modals
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [showCounterModal, setShowCounterModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showNoShowModal, setShowNoShowModal] = useState(false)

  // Counter-offer form
  const [counterDate, setCounterDate] = useState('')
  const [counterTime, setCounterTime] = useState('')
  const [counterVehicle, setCounterVehicle] = useState('')
  const [counterNote, setCounterNote] = useState('')

  // Reject form
  const [rejectReason, setRejectReason] = useState('schedule_conflict')
  const [rejectDetails, setRejectDetails] = useState('')

  // No-show form
  const [noShowMinutes, setNoShowMinutes] = useState(20)
  const [noShowNotes, setNoShowNotes] = useState('')

  // Real-time Supabase sync for live booking state
  const { isConnected: realtimeConnected } = useRealtimeBooking(bookingId, () => {
    loadBooking()
  })

  const loadBooking = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`)
      if (res.ok) {
        const data = await res.json()
        setBooking(data.booking)
      } else {
        showToast.error('Failed to load booking.')
      }
    } catch {
      showToast.error('Network error loading booking.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (bookingId) loadBooking()
  }, [bookingId])

  const handleUpdateStatus = async (newStatus: string, reason?: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reason }),
      })

      if (res.ok) {
        showToast.success(`Trip status updated to ${newStatus.replace(/_/g, ' ')}.`)
        loadBooking()
      } else {
        const data = await res.json().catch(() => ({}))
        showToast.error(data.error || 'Failed to update status.')
      }
    } catch {
      showToast.error('Network error updating status.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSendCounterOffer = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/counter-offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alternateDate: counterDate,
          alternateStartTime: counterTime,
          alternateVehicle: counterVehicle,
          note: counterNote,
        }),
      })

      if (res.ok) {
        showToast.success('Counter-offer delivered to customer.')
        setShowCounterModal(false)
        loadBooking()
      } else {
        showToast.error('Failed to deliver counter-offer.')
      }
    } catch {
      showToast.error('Network error sending counter-offer.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleUpdateStatus('rejected', `${rejectReason}: ${rejectDetails}`)
    setShowRejectModal(false)
  }

  const handleConfirmNoShow = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/no-show`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: 'provider',
          waitMinutes: noShowMinutes,
          notes: noShowNotes,
        }),
      })

      if (res.ok) {
        showToast.success('Customer no-show logged.')
        setShowNoShowModal(false)
        loadBooking()
      } else {
        showToast.error('Failed to mark no-show.')
      }
    } catch {
      showToast.error('Network error.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="provider" title="Booking Details">
        <FullPageLoader text="Loading host reservation details..." />
      </DashboardLayout>
    )
  }

  if (!booking) {
    return (
      <DashboardLayout role="provider" title="Booking Details">
        <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 shadow-sm max-w-lg mx-auto">
          <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-1">Booking Not Found</h2>
          <Link href="/provider/bookings">
            <Button variant="primary">Return to Bookings Queue</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const listing = booking.service_listings || {}
  const customer = booking.customer || {}
  const grossAmount = Number(booking.total_amount || 0)
  const platformCommission = Math.round(grossAmount * 0.1) // 10% platform fee
  const tdsDeduction = Math.round(grossAmount * 0.01) // 1% Section 194O TDS
  const netEarnings = grossAmount - platformCommission - tdsDeduction

  const isPending = ['pending', 'awaiting_confirmation'].includes(booking.status)
  const isConfirmed = ['confirmed', 'provider_accepted'].includes(booking.status)
  const isEnRoute = booking.status === 'driver_on_the_way'
  const isTripStarted = ['trip_started', 'in_progress'].includes(booking.status)
  const isCompleted = booking.status === 'completed'

  return (
    <DashboardLayout role="provider" title={`Booking #${booking.booking_number}`}>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
          <Link
            href="/provider/bookings"
            className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-[#ff7a00] transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Bookings Queue
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {realtimeConnected && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="live-badge-dot" />
                <span>Live Sync</span>
              </span>
            )}
            <BookingStatusBadge status={booking.status} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChatModal(true)}
              className="text-[#0a4d29] border-emerald-200"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
              Chat with Customer
            </Button>
          </div>
        </div>

        {/* Operational Action Controls Bar */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Trip Dispatch Actions:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isPending && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpdateStatus('confirmed')}
                  isLoading={actionLoading}
                  className="bg-[#0a4d29] hover:bg-[#07361c]"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Accept Request
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCounterModal(true)}
                >
                  Propose Alternate Time
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRejectModal(true)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Reject
                </Button>
              </>
            )}

            {isConfirmed && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpdateStatus('driver_on_the_way')}
                  isLoading={actionLoading}
                  className="bg-sky-600 hover:bg-sky-700"
                >
                  <Car className="w-4 h-4 mr-1.5" />
                  Mark En Route
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpdateStatus('trip_started')}
                  isLoading={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Play className="w-4 h-4 mr-1.5" />
                  Start Hourly Trip
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNoShowModal(true)}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  Mark No-Show
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCancelModal(true)}
                  className="text-red-600"
                >
                  Cancel
                </Button>
              </>
            )}

            {isEnRoute && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleUpdateStatus('trip_started')}
                isLoading={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Play className="w-4 h-4 mr-1.5" />
                Start Hourly Trip
              </Button>
            )}

            {isTripStarted && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleUpdateStatus('completed')}
                isLoading={actionLoading}
                className="bg-emerald-700 hover:bg-emerald-800 font-bold"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Complete Hourly Trip
              </Button>
            )}
          </div>
        </div>

        {/* 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (8 cols): Customer Info, Service Details, Trip Schedule */}
          <div className="lg:col-span-8 space-y-6">
            {/* Customer & Location Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-base font-black text-gray-900 font-display">
                Customer & Pickup Dispatch Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Customer Name</span>
                  <span className="text-sm font-bold text-gray-900">{customer.full_name || 'Valued Tourist'}</span>
                  <span className="text-xs text-gray-500 block">Contact: Masked for privacy (use In-App Chat)</span>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Service Category</span>
                  <span className="text-sm font-bold text-gray-900 capitalize">{listing.category?.replace(/_/g, ' ')}</span>
                  <span className="text-xs text-gray-500 block">{listing.title}</span>
                </div>
              </div>

              {/* Schedule row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100">
                  <span className="text-[10px] font-bold text-[#ff7a00] uppercase block">Date</span>
                  <span className="text-xs font-black text-gray-900">{formatDate(booking.booking_date)}</span>
                </div>

                <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100">
                  <span className="text-[10px] font-bold text-[#ff7a00] uppercase block">Slot Timing</span>
                  <span className="text-xs font-black text-gray-900">{booking.start_time} - {booking.end_time}</span>
                </div>

                <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100">
                  <span className="text-[10px] font-bold text-[#ff7a00] uppercase block">Duration</span>
                  <span className="text-xs font-black text-gray-900">{booking.duration_hours} Hour(s)</span>
                </div>
              </div>

              {booking.pickup_location && (
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-start space-x-3 text-xs">
                  <MapPin className="w-4 h-4 text-[#ff7a00] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900">Pickup Address: </span>
                    <span className="text-gray-600">{booking.pickup_location}</span>
                  </div>
                </div>
              )}

              {booking.special_requests && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold">Customer Notes: </span>
                  {booking.special_requests}
                </div>
              )}
            </div>

            {/* Lifecycle Timeline */}
            <BookingTimeline
              currentStatus={booking.status}
              createdAt={booking.created_at}
              confirmedAt={booking.confirmed_at}
              startedAt={booking.started_at}
              completedAt={booking.completed_at}
              cancelledAt={booking.cancelled_at}
              cancellationReason={booking.cancellation_reason}
            />
          </div>

          {/* Right Column (4 cols): Host Financial Earnings Ledger */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-sm font-black text-gray-900 font-display">
                  Host Earnings Ledger
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                  Direct Payout
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Gross Booking Amount</span>
                  <span className="font-bold text-gray-900">{formatCurrency(grossAmount)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Platform Commission (10%)</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(platformCommission)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>TDS Deductions (Sec 194O 1%)</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(tdsDeduction)}</span>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between text-sm font-black text-[#0a4d29]">
                  <span>Net Payable to Host</span>
                  <span>{formatCurrency(netEarnings)}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-[11px] text-emerald-950 space-y-1">
                <span className="font-bold block">Payout Timeline:</span>
                <span>Automatic NEFT / UPI settlement within 24 hours of successful trip completion.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCancelModal && (
        <BookingCancelModal
          isOpen={true}
          onClose={() => setShowCancelModal(false)}
          bookingId={booking.id}
          bookingNumber={booking.booking_number}
          bookingDate={booking.booking_date}
          startTime={booking.start_time}
          totalAmount={Number(booking.total_amount)}
          userRole="provider"
          onSuccess={loadBooking}
        />
      )}

      {showChatModal && (
        <BookingChatModal
          isOpen={true}
          onClose={() => setShowChatModal(false)}
          bookingId={booking.id}
          bookingNumber={booking.booking_number}
          currentUserRole="provider"
          currentUserId={user?.id || ''}
          recipientName={customer.full_name || 'Customer'}
        />
      )}

      {/* Counter Offer Modal */}
      {showCounterModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowCounterModal(false)}
          title={`Propose Alternate Time • #${booking.booking_number}`}
        >
          <form onSubmit={handleSendCounterOffer} className="space-y-4">
            <p className="text-xs text-gray-500">
              Can't fulfill the requested slot? Offer an alternate time or vehicle without cancelling.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Proposed Date</label>
                <Input
                  type="date"
                  value={counterDate}
                  onChange={(e) => setCounterDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Proposed Start Time</label>
                <Input
                  type="time"
                  value={counterTime}
                  onChange={(e) => setCounterTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Alternate Vehicle (Optional)</label>
              <Input
                placeholder="e.g. Royal Enfield Meteor 350 / Innova"
                value={counterVehicle}
                onChange={(e) => setCounterVehicle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Message to Customer</label>
              <Textarea
                placeholder="e.g. My morning slot is booked, but I can host you at 3:00 PM!"
                value={counterNote}
                onChange={(e) => setCounterNote(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
              <Button type="button" variant="secondary" onClick={() => setShowCounterModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={actionLoading}>
                Deliver Counter-Offer
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowRejectModal(false)}
          title={`Reject Request #${booking.booking_number}`}
        >
          <form onSubmit={handleConfirmReject} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Rejection Reason</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-gray-200 bg-white"
              >
                <option value="schedule_conflict">Schedule conflict / Vehicle booked offline</option>
                <option value="maintenance">Vehicle in maintenance</option>
                <option value="outside_service_area">Pickup location too far</option>
                <option value="other">Other reason</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Notes</label>
              <Textarea
                placeholder="Short explanation for customer..."
                value={rejectDetails}
                onChange={(e) => setRejectDetails(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
              <Button type="button" variant="secondary" onClick={() => setShowRejectModal(false)}>
                Keep
              </Button>
              <Button type="submit" variant="danger" isLoading={actionLoading}>
                Confirm Rejection
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* No Show Modal */}
      {showNoShowModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowNoShowModal(false)}
          title={`Mark Customer No-Show #${booking.booking_number}`}
        >
          <form onSubmit={handleConfirmNoShow} className="space-y-4">
            <p className="text-xs text-gray-500">
              Have you arrived at the designated pickup location and attempted to call/chat with the customer?
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Minutes Waited (SLA Min: 15m)</label>
              <Input
                type="number"
                min={15}
                value={noShowMinutes}
                onChange={(e) => setNoShowMinutes(Number(e.target.value))}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Arrival Proof / Location Notes</label>
              <Textarea
                placeholder="e.g. Waited at RS Puram Post Office from 10:00 to 10:25 AM. Customer phone switched off."
                value={noShowNotes}
                onChange={(e) => setNoShowNotes(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
              <Button type="button" variant="secondary" onClick={() => setShowNoShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" isLoading={actionLoading}>
                Log No-Show Record
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  )
}

