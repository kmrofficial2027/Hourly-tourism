'use client'

import React, { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { showToast } from '@/components/ui/Toast'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // QR Payment Collection Modal state
  const [qrModalBooking, setQrModalBooking] = useState<any | null>(null)
  const [providerQr, setProviderQr] = useState<{
    qrCodeUrl: string | null
    upiId: string | null
    businessName: string | null
  } | null>(null)
  const [loadingQr, setLoadingQr] = useState(false)

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

  const loadBookings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/bookings?role=provider')
      if (res.ok) {
        const data = await res.json()
        setBookings(data.bookings || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const handleUpdateStatus = async (
    bookingId: string,
    newStatus: string,
    paymentStatus?: string,
    reason?: string
  ) => {
    setActionLoading(bookingId)
    try {
      const payload: any = { status: newStatus }
      if (paymentStatus) payload.payment_status = paymentStatus
      if (reason) payload.reason = reason

      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Status update failed')

      showToast.success(
        paymentStatus === 'paid'
          ? 'Payment collected & trip marked as completed!'
          : newStatus === 'cancelled'
          ? 'Booking cancelled.'
          : `Booking updated to ${newStatus.replace(/_/g, ' ')}`
      )
      loadBookings()
      setQrModalBooking(null)
    } catch (err: any) {
      showToast.error(err.message || 'Error updating status')
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
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display">
            Customer Hourly Bookings
          </h1>
          <p className="text-xs text-gray-500">
            Accept requests, track live trips, and collect on-site payments via your direct UPI QR code.
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-900">No Reservations Yet</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Your listings are active. When tourists book your hourly services, they will appear here.
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
                      {b.payment_status === 'paid' ? (
                        <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Paid
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          Payment Pending
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

                      {b.status === 'pending' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={isActioning}
                            onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Accept Request
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            isLoading={isActioning}
                            onClick={() => handleUpdateStatus(b.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {['confirmed', 'paid'].includes(b.status) && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={isActioning}
                            onClick={() => handleUpdateStatus(b.id, 'in_progress')}
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            <Play className="w-3.5 h-3.5 mr-1" />
                            Start Trip
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

                      {/* Collect Payment via QR Button */}
                      {['confirmed', 'in_progress'].includes(b.status) && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenQrModal(b)}
                          className="border-emerald-600 text-emerald-800 hover:bg-emerald-50"
                        >
                          <QrCode className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                          Collect via QR
                        </Button>
                      )}

                      {b.status === 'in_progress' && (
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={isActioning}
                          onClick={() => handleUpdateStatus(b.id, 'completed')}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          End Trip
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
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
                    Ask tourist to scan with <strong>Google Pay, PhonePe, Paytm</strong> or any UPI app.
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
                        handleUpdateStatus(qrModalBooking.id, 'completed', 'paid')
                      }
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Confirm Payment Received & Complete Trip
                    </Button>
                    <p className="text-[11px] text-gray-400 text-center">
                      Marks booking as paid in escrow logs and finalizes the reservation.
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
                  <Link href="/provider/profile">
                    <Button variant="primary" size="md">
                      <QrCode className="w-4 h-4 mr-1.5" />
                      Upload QR Code in Profile
                    </Button>
                  </Link>
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
            <div className="space-y-5 pt-2">
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-xs text-red-900 space-y-1">
                <span className="font-bold block">Cancelling Booking #{cancelModalBooking.booking_number}</span>
                <p>Please select the reason for cancelling this reservation. The tourist will be notified immediately.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">Select Cancellation Reason:</label>
                <div className="space-y-1.5">
                  {PROVIDER_CANCEL_REASONS.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center space-x-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        cancelReason === r ? 'border-red-500 bg-red-50/50 font-bold text-red-900' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="provider_cancel_reason"
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
      </div>
    </DashboardLayout>
  )
}
