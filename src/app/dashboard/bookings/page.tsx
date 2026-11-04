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
  const [paymentModalBooking, setPaymentModalBooking] = useState<any | null>(null)
  const [gatewayChoice, setGatewayChoice] = useState<'cashfree' | 'razorpay' | 'provider_qr'>('cashfree')
  const [providerQrInfo, setProviderQrInfo] = useState<any | null>(null)
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
              setPaymentModalBooking(match)
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

  // Open Payment Modal (Cashfree, Razorpay, or Provider QR)
  const handlePayNow = async (booking: any) => {
    setPaymentModalBooking(booking)
    setProviderQrInfo(null)
    try {
      const pid = booking.provider_id || booking.service_listings?.provider_id
      if (pid) {
        const res = await fetch(`/api/provider/qr-code?providerId=${pid}`)
        if (res.ok) {
          const data = await res.json()
          setProviderQrInfo(data)
        }
      }
    } catch (e) {
      console.error('Error fetching provider QR:', e)
    }
  }

  // Execute Payment via Selected Method (Cashfree, Razorpay, or Provider QR)
  const handleExecutePayment = async () => {
    if (!paymentModalBooking) return
    setPayLoading(true)

    try {
      if (gatewayChoice === 'provider_qr') {
        const res = await fetch(`/api/bookings/${paymentModalBooking.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: ['pending', 'unpaid'].includes(paymentModalBooking.status)
              ? 'confirmed'
              : paymentModalBooking.status,
            payment_status: 'paid',
            notes: 'Paid via direct Provider UPI QR code on-site',
          }),
        })

        if (!res.ok) throw new Error('Failed to record on-site payment')

        showToast.success('Payment recorded via Provider QR Code! Reservation confirmed.')
        setPaymentModalBooking(null)
        setSelectedBooking(null)
        fetchBookings()
        return
      }

      if (gatewayChoice === 'cashfree') {
        // --- CASHFREE FLOW ---
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
        // --- RAZORPAY FLOW ---
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

      {/* Dual Payment Gateway Selection Modal */}
      {paymentModalBooking && (
        <Modal
          isOpen={Boolean(paymentModalBooking)}
          onClose={() => !payLoading && setPaymentModalBooking(null)}
          title="Complete Secure Payment"
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

            {/* Gateway Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                Choose Payment Gateway
              </label>

              {/* Option 1: Cashfree Payments */}
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
                        Cashfree Payments
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      UPI (Google Pay, PhonePe, Paytm, BHIM), NetBanking, Credit/Debit Cards, PayLater
                    </p>
                  </div>
                </div>
              </div>

              {/* Option 2: Razorpay */}
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
                      UPI QR Code, All Major Bank Cards, NetBanking, Wallets
                    </p>
                  </div>
                </div>
              </div>

              {/* Option 3: Provider Direct UPI QR Code (Pay at Service End) */}
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
                        On-Site Settle
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Scan host’s personal QR code (GPay, PhonePe, Paytm) at service pickup or trip completion
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider QR display when Option 3 is selected */}
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

            {/* Escrow & Security Note */}
            <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                256-bit SSL encrypted • Funds held in escrow until booking commences • Instant refund protection.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                variant="secondary"
                disabled={payLoading}
                onClick={() => setPaymentModalBooking(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={payLoading}
                onClick={handleExecutePayment}
                className={
                  gatewayChoice === 'cashfree'
                    ? 'bg-[#0a4d29] hover:bg-[#07361d]'
                    : gatewayChoice === 'razorpay'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-purple-700 hover:bg-purple-800'
                }
              >
                {gatewayChoice === 'provider_qr' ? (
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

