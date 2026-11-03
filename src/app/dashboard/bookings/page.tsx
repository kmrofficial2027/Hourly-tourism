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
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { showToast } from '@/components/ui/Toast'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'

function CustomerBookingsContent() {
  const searchParams = useSearchParams()
  const highlightBookingId = searchParams.get('bookingId')
  const defaultAction = searchParams.get('action')

  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modals state
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [reviewBooking, setReviewBooking] = useState<any | null>(null)
  const [cancelBooking, setCancelBooking] = useState<any | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [payLoading, setPayLoading] = useState(false)

  const fetchBookings = async () => {
    setLoading(true)
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
            if (defaultAction === 'pay') {
              // Trigger payment flow
            }
          }
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [highlightBookingId])

  // Handle Cancellation
  const handleCancelBooking = async () => {
    if (!cancelBooking) return
    setCancelLoading(true)
    try {
      const res = await fetch(`/api/bookings/${cancelBooking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled_by_customer',
          reason: 'Customer initiated cancellation',
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to cancel booking')
      }

      showToast.success('Booking cancelled successfully')
      setCancelBooking(null)
      setSelectedBooking(null)
      fetchBookings()
    } catch (err: any) {
      showToast.error(err.message || 'Error cancelling booking')
    } finally {
      setCancelLoading(false)
    }
  }

  // Handle Razorpay Payment flow
  const handlePayNow = async (booking: any) => {
    setPayLoading(true)
    try {
      const res = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to initialize payment')

      if (data.isDevelopmentMode) {
        // Development mode: verify transaction immediately for testing
        const verifyRes = await fetch('/api/payments/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: booking.id,
            isDevelopmentMode: true,
            razorpay_order_id: data.order.id,
            razorpay_payment_id: `pay_test_${Date.now()}`,
          }),
        })

        if (!verifyRes.ok) throw new Error('Verification failed')

        showToast.success('Payment verified in test mode! Booking confirmed.')
        setSelectedBooking(null)
        fetchBookings()
      } else {
        // Real Razorpay Checkout integration
        showToast.loading('Opening Razorpay checkout...')
        // Checkout script invocation
      }
    } catch (err: any) {
      showToast.error(err.message || 'Payment failed')
    } finally {
      setPayLoading(false)
    }
  }

  // Handle Receipt download
  const handleDownloadReceipt = (booking: any) => {
    const receiptContent = `
========================================
HOURLY TOURISM - BOOKING RECEIPT
========================================
Booking Number: #${booking.booking_number}
Date Issued: ${new Date().toLocaleDateString('en-IN')}
Service: ${booking.service_listings?.title || 'Hourly Tourism Experience'}
Destination: ${booking.service_listings?.destination_city || 'India'}

TRIP SCHEDULE:
Date: ${formatDate(booking.booking_date)}
Time: ${formatTime(booking.start_time)} to ${formatTime(booking.end_time)}
Duration: ${booking.duration_hours} Hours
Participants: ${booking.num_participants}

PAYMENT BREAKDOWN:
Base Hourly Price: ${formatCurrency(Number(booking.base_price))}
Platform Service Fee: ${formatCurrency(Number(booking.platform_fee))}
Taxes / GST: ${formatCurrency(Number(booking.tax_amount))}
TOTAL AMOUNT: ${formatCurrency(Number(booking.total_amount))}

Status: ${booking.status.toUpperCase()}
Payment Status: ${booking.payment_status.toUpperCase()}
========================================
Thank you for discovering with Hourly Tourism!
support@hourlytourism.com
========================================
    `
    const blob = new Blob([receiptContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt_${booking.booking_number}.txt`
    a.click()
    showToast.success('Receipt downloaded')
  }

  return (
    <DashboardLayout role="customer" title="My Bookings">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display">My Hourly Bookings</h1>
          <p className="text-xs text-gray-500">
            View status, make payments, download invoices, or rate your completed trips.
          </p>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-900 text-base">No Bookings Yet</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Find bikes, cars, vans, guides, and unique local experiences ready to book by the hour.
            </p>
            <Link href="/explore">
              <Button variant="primary" size="md">
                Browse Marketplace
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const isPast = new Date(booking.booking_date) < new Date()
              const canCancel = ['pending', 'awaiting_confirmation', 'confirmed'].includes(
                booking.status
              )
              const canReview = ['completed', 'paid'].includes(booking.status)
              const canPay = booking.payment_status === 'pending'

              return (
                <div
                  key={booking.id}
                  className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                        #{booking.booking_number}
                      </span>
                      <BookingStatusBadge status={booking.status} />
                      <span className="text-xs px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-600 font-semibold uppercase">
                        Pay: {booking.payment_status}
                      </span>
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

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <div className="text-left md:text-right mr-3">
                      <span className="text-base font-black text-emerald-800 block">
                        {formatCurrency(Number(booking.total_amount))}
                      </span>
                      <span className="text-[10px] text-gray-400">Total Charged</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      {/* Pay Button if pending */}
                      {canPay && (
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={payLoading}
                          onClick={() => handlePayNow(booking)}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CreditCard className="w-3.5 h-3.5 mr-1" />
                          Pay Now
                        </Button>
                      )}

                      {/* Download Receipt */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownloadReceipt(booking)}
                        title="Download Receipt"
                      >
                        <Download className="w-3.5 h-3.5" />
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

                      {/* View Details Modal */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        Details
                      </Button>
                    </div>
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
              >
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
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

      {/* Cancel Confirmation Dialog */}
      {cancelBooking && (
        <ConfirmDialog
          isOpen={Boolean(cancelBooking)}
          title="Cancel This Booking?"
          message={`Are you sure you want to cancel booking #${cancelBooking.booking_number}? Cancellation policies apply.`}
          confirmText="Yes, Cancel Booking"
          type="danger"
          isLoading={cancelLoading}
          onConfirm={handleCancelBooking}
          onCancel={() => setCancelBooking(null)}
        />
      )}
    </DashboardLayout>
  )
}

export default function CustomerBookingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <CustomerBookingsContent />
    </Suspense>
  )
}

