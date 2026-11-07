'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Shield,
  Phone,
  MessageCircle,
  Download,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Car,
  Star,
  ShieldCheck,
  CreditCard,
  HelpCircle,
  XCircle,
  Navigation,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge'
import { BookingTimeline } from '@/components/booking/BookingTimeline'
import { BookingCancelModal } from '@/components/booking/BookingCancelModal'
import { BookingChatModal } from '@/components/booking/BookingChatModal'
import { BookingDisputeModal } from '@/components/booking/BookingDisputeModal'
import { BookingSOSModal } from '@/components/booking/BookingSOSModal'
import { RefundTracker } from '@/components/booking/RefundTracker'
import { FullPageLoader } from '@/components/ui/LoadingSpinner'
import { showToast } from '@/components/ui/Toast'
import { formatCurrency, formatDate, normalizeListingImages } from '@/lib/utils'
import { printBookingInvoice } from '@/lib/invoiceUtils'
import { useAuth } from '@/hooks/useAuth'
import { useRealtimeBooking } from '@/hooks/useRealtimeBooking'
import { LiveTripTrackingModal } from '@/components/booking/LiveTripTrackingModal'

export default function CustomerBookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params?.id as string
  const { user } = useAuth()

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Modals
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [showSOSModal, setShowSOSModal] = useState(false)
  const [showTrackingModal, setShowTrackingModal] = useState(false)

  // Real-time Supabase sync for live booking status
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
        showToast.error('Booking details could not be loaded.')
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

  if (loading) {
    return (
      <DashboardLayout role="customer" title="Booking Details">
        <FullPageLoader text="Loading secure reservation details..." />
      </DashboardLayout>
    )
  }

  if (!booking) {
    return (
      <DashboardLayout role="customer" title="Booking Details">
        <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 shadow-sm max-w-lg mx-auto">
          <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-1">Booking Not Found</h2>
          <p className="text-xs text-gray-500 mb-6">The requested booking does not exist or has expired.</p>
          <Link href="/dashboard/bookings">
            <Button variant="primary">Return to My Bookings</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const listing = booking.service_listings || {}
  const provider = booking.provider_profile || {}
  const images = normalizeListingImages(listing.images, listing.category)
  const canCancel = ['pending', 'awaiting_confirmation', 'confirmed', 'provider_accepted'].includes(booking.status)
  const isActiveTrip = ['trip_started', 'in_progress', 'driver_on_the_way'].includes(booking.status)
  const isCompleted = booking.status === 'completed'

  const handleDownloadInvoice = () => {
    printBookingInvoice({
      bookingNumber: booking.booking_number,
      invoiceNumber: `INV-${booking.booking_number}`,
      bookingDate: booking.booking_date,
      startTime: booking.start_time,
      endTime: booking.end_time,
      durationHours: booking.duration_hours,
      serviceTitle: listing.title || 'Hourly Tourism Service',
      serviceCategory: listing.category || 'Rental',
      customerName: booking.customer?.full_name || user?.user_metadata?.full_name || 'Valued Customer',
      customerEmail: booking.customer?.email || user?.email || '',
      customerPhone: booking.customer?.phone || '',
      providerName: provider.business_name || 'Verified Local Host',
      pickupLocation: booking.pickup_location || listing.destination_city,
      hourlyRate: Number(booking.hourly_rate || listing.hourly_rate || 0),
      basePrice: Number(booking.base_price || 0),
      platformFee: Number(booking.platform_fee || 0),
      taxes: Number(booking.tax_amount || 0),
      totalAmount: Number(booking.total_amount || 0),
      paymentMethod: booking.payment_status === 'paid' ? 'Prepaid (Razorpay / UPI / Card)' : 'Payment on Confirmation',
      paymentStatus: booking.payment_status?.toUpperCase(),
    })
  }

  return (
    <DashboardLayout role="customer" title={`Booking #${booking.booking_number}`}>
      <div className="space-y-6">
        {/* Top Back Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
          <Link
            href="/dashboard/bookings"
            className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-[#0a4d29] transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to All Bookings
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {realtimeConnected && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="live-badge-dot" />
                <span>Live Sync</span>
              </span>
            )}
            <BookingStatusBadge status={booking.status} />
            <Button variant="outline" size="sm" onClick={handleDownloadInvoice}>
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Tax Receipt / Invoice
            </Button>
            {isActiveTrip && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowSOSModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-black animate-pulse"
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                Emergency SOS
              </Button>
            )}
          </div>
        </div>

        {/* Main Grid: Left Details & Right Financial Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (8 cols): Service Info, Trip Schedule, Host Contact */}
          <div className="lg:col-span-8 space-y-6">
            {/* Service Showcase Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-48 h-36 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={images[0]}
                    alt={listing.title || 'Listing'}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-50 text-[#0a4d29] border border-green-200">
                      {listing.category?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs font-semibold text-gray-500">
                      {listing.destination_city || 'Coimbatore'}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-black text-gray-900 font-display">
                    {listing.title}
                  </h2>

                  {/* Provider Info Row */}
                  <div className="flex items-center space-x-3 pt-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0a4d29] flex items-center justify-center font-bold text-xs">
                      {provider.business_name?.[0] || 'H'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-gray-800">
                          {provider.business_name || 'Verified Local Host'}
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="flex items-center space-x-1 text-[11px] text-gray-500">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{provider.average_rating || 5.0}</span>
                        <span>({provider.total_reviews || 0} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Highlights Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 bg-gray-50/50 p-4 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-[#ff7a00]" />
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Booking Date</span>
                    <span className="text-xs font-black text-gray-900">{formatDate(booking.booking_date)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-[#ff7a00]" />
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Booked Time Slot</span>
                    <span className="text-xs font-black text-gray-900">
                      {booking.start_time} - {booking.end_time} ({booking.duration_hours} hrs)
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-[#ff7a00]" />
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Pickup Location</span>
                    <span className="text-xs font-black text-gray-900 truncate max-w-[160px] block">
                      {booking.pickup_location || 'Designated Meeting Point'}
                    </span>
                  </div>
                </div>
              </div>

              {booking.special_requests && (
                <div className="mt-4 p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-xs text-amber-900">
                  <span className="font-bold">Special Requests: </span>
                  {booking.special_requests}
                </div>
              )}
            </div>

            {/* Host Communication & Contact Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#0a4d29] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                  🚗
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-black text-gray-900">
                      {booking.host_contact?.name || booking.host_contact?.businessName || provider.business_name || 'Verified Dedicated Host'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-[#0a4d29]">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Operating in {booking.host_contact?.city || listing.destination_city || 'Tamil Nadu'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {(booking.host_contact?.phone || provider.phone) && (
                  <>
                    <a
                      href={`tel:${booking.host_contact?.phone || provider.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-emerald-800 border border-emerald-300 text-xs font-bold hover:bg-emerald-50 transition-colors shadow-xs"
                      title="Call host directly"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Call Host</span>
                    </a>
                    <a
                      href={`https://wa.me/${(booking.host_contact?.phone || provider.phone).replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-colors shadow-xs"
                      title="WhatsApp Chat"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </>
                )}

                {['confirmed', 'in_progress'].includes(booking.status) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowTrackingModal(true)}
                    className="bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-bold"
                  >
                    <Navigation className="w-3.5 h-3.5 mr-1 text-emerald-600 animate-pulse" />
                    Live Trip Radar
                  </Button>
                )}

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowChatModal(true)}
                  className="bg-[#0a4d29] hover:bg-[#07361c]"
                >
                  <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                  Chat In-App
                </Button>
              </div>
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

          {/* Right Column (4 cols): Transparent Price Breakdown, Policies, Actions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Price Breakdown Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-gray-900 font-display pb-3 border-b border-gray-100">
                Payment & Price Breakdown
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>
                    Hourly Rate ({formatCurrency(booking.hourly_rate || listing.hourly_rate)} × {booking.duration_hours} hrs)
                  </span>
                  <span className="font-semibold text-gray-900">{formatCurrency(booking.base_price)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Platform Protection & Service Fee</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(booking.platform_fee)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>GST / Tourism Taxes</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(booking.tax_amount || 0)}</span>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between text-sm font-black text-[#0a4d29]">
                  <span>Total Paid</span>
                  <span>{formatCurrency(booking.total_amount)}</span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl text-[11px] text-gray-500 flex items-center justify-between">
                <span className="flex items-center">
                  <CreditCard className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                  Status: {booking.payment_status?.toUpperCase()}
                </span>
                <span className="font-bold text-emerald-700">Protected</span>
              </div>
            </div>

            {/* Refund Tracker (Visible if booking was cancelled or refund initiated) */}
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

            {/* Cancellation Policy Box */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-700">
                Cancellation & Refund Policy
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Free cancellation up to 24 hours before trip start. 75% refund between 6-24 hrs. 50% refund between 2-6 hrs.
              </p>

              {canCancel && (
                <Button
                  variant="outline"
                  fullWidth
                  size="sm"
                  onClick={() => setShowCancelModal(true)}
                  className="text-red-600 border-red-200 hover:bg-red-50 font-bold"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1.5" />
                  Cancel Booking
                </Button>
              )}

              {isCompleted && (
                <Link href={`/explore?category=${listing.category || 'bike'}&destination=${listing.destination_city || 'Coimbatore'}`}>
                  <Button variant="primary" fullWidth size="sm" className="font-bold">
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Book Again (1-Click)
                  </Button>
                </Link>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(true)}
                  className="w-full text-center text-[11px] font-bold text-gray-400 hover:text-amber-600 transition-colors"
                >
                  Report Issue / File Dispute
                </button>
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
          userRole="customer"
          onSuccess={loadBooking}
        />
      )}

      {showChatModal && (
        <BookingChatModal
          isOpen={true}
          onClose={() => setShowChatModal(false)}
          bookingId={booking.id}
          bookingNumber={booking.booking_number}
          currentUserRole="customer"
          currentUserId={user?.id || ''}
          recipientName={provider.business_name || 'Verified Host'}
        />
      )}

      {showDisputeModal && (
        <BookingDisputeModal
          isOpen={true}
          onClose={() => setShowDisputeModal(false)}
          bookingId={booking.id}
          bookingNumber={booking.booking_number}
          userRole="customer"
          onSuccess={loadBooking}
        />
      )}

      {showSOSModal && (
        <BookingSOSModal
          isOpen={true}
          onClose={() => setShowSOSModal(false)}
          bookingId={booking.id}
          bookingNumber={booking.booking_number}
        />
      )}

      {showTrackingModal && (
        <LiveTripTrackingModal
          isOpen={true}
          onClose={() => setShowTrackingModal(false)}
          booking={booking}
          role="customer"
        />
      )}
    </DashboardLayout>
  )
}
