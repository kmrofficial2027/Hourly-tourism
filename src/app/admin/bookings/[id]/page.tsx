'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  DollarSign,
  Download,
  Sliders,
  User,
  Briefcase,
  FileText,
  CreditCard,
  MessageCircle,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge'
import { BookingTimeline } from '@/components/booking/BookingTimeline'
import { BookingChatModal } from '@/components/booking/BookingChatModal'
import { RefundTracker } from '@/components/booking/RefundTracker'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FullPageLoader } from '@/components/ui/LoadingSpinner'
import { showToast } from '@/components/ui/Toast'
import { formatCurrency, formatDate, normalizeListingImages } from '@/lib/utils'
import { printBookingInvoice } from '@/lib/invoiceUtils'
import { useAuth } from '@/hooks/useAuth'

export default function AdminBookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params?.id as string
  const { user } = useAuth()

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Admin Modals
  const [showOverrideModal, setShowOverrideModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)

  // Override form
  const [newStatus, setNewStatus] = useState('')
  const [overrideReason, setOverrideReason] = useState('')

  // Refund form
  const [refundAmount, setRefundAmount] = useState<number>(0)
  const [refundReason, setRefundReason] = useState('Admin approved customer exception')

  // Internal admin notes
  const [adminNotes, setAdminNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  const loadBooking = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`)
      if (res.ok) {
        const data = await res.json()
        setBooking(data.booking)
        setNewStatus(data.booking.status)
        setRefundAmount(Number(data.booking.total_amount || 0))
        setAdminNotes(data.booking.admin_notes || '')
      } else {
        showToast.error('Booking not found.')
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

  const handleStatusOverride = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes: `Admin Override: ${overrideReason}`,
        }),
      })

      if (res.ok) {
        showToast.success('Booking status updated via admin override.')
        setShowOverrideModal(false)
        loadBooking()
      } else {
        showToast.error('Failed to override status.')
      }
    } catch {
      showToast.error('Network error.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleIssueRefund = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'refunded',
          payment_status: 'refunded',
          reason: refundReason,
        }),
      })

      if (res.ok) {
        showToast.success(`Refund of ${formatCurrency(refundAmount)} approved and marked.`)
        setShowRefundModal(false)
        loadBooking()
      } else {
        showToast.error('Failed to process refund.')
      }
    } catch {
      showToast.error('Network error.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: booking.status,
          notes: adminNotes,
        }),
      })

      if (res.ok) {
        showToast.success('Internal admin notes updated.')
      }
    } catch {
      showToast.error('Failed to save notes.')
    } finally {
      setSavingNotes(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="admin" title="Booking Administration">
        <FullPageLoader text="Loading full audit log & booking records..." />
      </DashboardLayout>
    )
  }

  if (!booking) {
    return (
      <DashboardLayout role="admin" title="Booking Administration">
        <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 shadow-sm max-w-lg mx-auto">
          <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-1">Booking Not Found</h2>
          <Link href="/admin/bookings">
            <Button variant="primary">Return to Bookings Monitor</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const listing = booking.service_listings || {}
  const customer = booking.customer || {}
  const provider = booking.provider_profile || {}

  return (
    <DashboardLayout role="admin" title={`Admin Review • #${booking.booking_number}`}>
      <div className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
          <Link
            href="/admin/bookings"
            className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-[#0a4d29] transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Bookings Monitor
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <BookingStatusBadge status={booking.status} />
            <Button variant="secondary" size="sm" onClick={() => setShowOverrideModal(true)}>
              <Sliders className="w-3.5 h-3.5 mr-1.5" />
              Manual Status Override
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowRefundModal(true)} className="text-emerald-700 border-emerald-300">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Approve Refund
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowChatModal(true)}>
              <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
              Inspect Chat
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                printBookingInvoice({
                  bookingNumber: booking.booking_number,
                  invoiceNumber: `INV-${booking.booking_number}`,
                  bookingDate: booking.booking_date,
                  startTime: booking.start_time,
                  endTime: booking.end_time,
                  durationHours: booking.duration_hours,
                  serviceTitle: listing.title || 'Service',
                  serviceCategory: listing.category || 'Rental',
                  customerName: customer.full_name || 'Customer',
                  customerEmail: customer.email || '',
                  customerPhone: customer.phone || '',
                  providerName: provider.business_name || 'Host',
                  hourlyRate: Number(booking.hourly_rate || 0),
                  basePrice: Number(booking.base_price || 0),
                  platformFee: Number(booking.platform_fee || 0),
                  taxes: Number(booking.tax_amount || 0),
                  totalAmount: Number(booking.total_amount || 0),
                  paymentMethod: 'Prepaid',
                  paymentStatus: booking.payment_status?.toUpperCase(),
                })
              }
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Tax Invoice
            </Button>
          </div>
        </div>

        {/* 3-Card Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer Profile Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-[10px] font-black uppercase text-gray-400">Customer (Tourist)</span>
              <User className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm font-bold text-gray-900">{customer.full_name || 'Guest'}</p>
            <p className="text-xs text-gray-500">{customer.email || 'No email'}</p>
            <p className="text-xs text-gray-500">{customer.phone || 'No phone provided'}</p>
          </div>

          {/* Provider Profile Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-[10px] font-black uppercase text-gray-400">Host (Provider)</span>
              <Briefcase className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm font-bold text-gray-900">{provider.business_name || 'Host'}</p>
            <p className="text-xs text-gray-500">City: {provider.city || 'Coimbatore'}</p>
            <p className="text-xs text-emerald-700 font-bold">Verification: {provider.verification_status || 'verified'}</p>
          </div>

          {/* Financial Breakdown Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-[10px] font-black uppercase text-gray-400">Financial Ledger</span>
              <CreditCard className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Total Paid:</span>
              <span className="font-bold text-gray-900">{formatCurrency(booking.total_amount)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Platform Take (10%):</span>
              <span className="font-bold text-[#0a4d29]">{formatCurrency(booking.platform_fee)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Payment Status:</span>
              <span className="font-bold text-emerald-700">{booking.payment_status?.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Refund Tracker if refunded or cancelled */}
        {(booking.status === 'cancelled' ||
          booking.status === 'refund_initiated' ||
          booking.status === 'refund_completed' ||
          (booking.refund_status && booking.refund_status !== 'not_required')) && (
          <RefundTracker
            refundStatus={
              booking.status === 'refund_completed'
                ? 'completed'
                : booking.status === 'refund_initiated'
                ? 'initiated'
                : booking.refund_status || 'processing'
            }
            refundAmount={booking.refund_amount || booking.total_amount}
            refundRequestedAt={booking.cancelled_at}
            cancellationReason={booking.cancellation_reason}
          />
        )}

        {/* Dispute Notice if active */}
        {booking.dispute && (
          <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
            <div className="flex items-center space-x-2 font-black text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Active Customer Dispute Case: {booking.dispute.dispute_category?.replace(/_/g, ' ')}</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-900">
              "{booking.dispute.description}"
            </p>
            {booking.dispute.evidence_urls?.length > 0 && (
              <div className="pt-2">
                <a
                  href={booking.dispute.evidence_urls[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-700 underline"
                >
                  View Evidence Attachment ↗
                </a>
              </div>
            )}
          </div>
        )}

        {/* Internal Admin Notes Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-700">
              Internal Admin Notes & Compliance Log
            </h3>
            <Button variant="primary" size="sm" onClick={handleSaveNotes} isLoading={savingNotes}>
              Save Admin Notes
            </Button>
          </div>
          <Textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add internal notes on disputes, refund approvals, exception waivers..."
            rows={3}
          />
        </div>

        {/* Audit Timeline */}
        <BookingTimeline
          currentStatus={booking.status}
          events={booking.history}
          createdAt={booking.created_at}
          confirmedAt={booking.confirmed_at}
          startedAt={booking.started_at}
          completedAt={booking.completed_at}
          cancelledAt={booking.cancelled_at}
          cancellationReason={booking.cancellation_reason}
        />
      </div>

      {/* Manual Status Override Modal */}
      {showOverrideModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowOverrideModal(false)}
          title={`Admin Override • #${booking.booking_number}`}
        >
          <form onSubmit={handleStatusOverride} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Target Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-gray-200 bg-white"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="driver_on_the_way">Driver On The Way</option>
                <option value="trip_started">Trip Started</option>
                <option value="completed">Completed</option>
                <option value="cancelled_by_admin">Cancelled by Admin</option>
                <option value="no_show">Marked No-Show</option>
                <option value="refund_initiated">Refund Initiated</option>
                <option value="refund_completed">Refund Completed</option>
                <option value="disputed">Under Dispute</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Override Reason <span className="text-red-500">*</span></label>
              <Textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Document administrative justification for this manual override..."
                rows={3}
                required
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
              <Button type="button" variant="secondary" onClick={() => setShowOverrideModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={actionLoading}>
                Execute Override
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Approve Refund Modal */}
      {showRefundModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowRefundModal(false)}
          title={`Approve Refund • #${booking.booking_number}`}
        >
          <form onSubmit={handleIssueRefund} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Refund Amount (₹)</label>
              <Input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
                max={Number(booking.total_amount)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Justification Reason</label>
              <Textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={2}
                required
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
              <Button type="button" variant="secondary" onClick={() => setShowRefundModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" isLoading={actionLoading} className="bg-emerald-600 hover:bg-emerald-700 font-bold">
                Authorize Refund of {formatCurrency(refundAmount)}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Chat Inspector Modal */}
      {showChatModal && (
        <BookingChatModal
          isOpen={true}
          onClose={() => setShowChatModal(false)}
          bookingId={booking.id}
          bookingNumber={booking.booking_number}
          currentUserRole="admin"
          currentUserId={user?.id || ''}
          recipientName={`${customer.full_name || 'Customer'} & ${provider.business_name || 'Host'}`}
        />
      )}
    </DashboardLayout>
  )
}
