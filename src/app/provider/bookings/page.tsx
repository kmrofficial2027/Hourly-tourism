'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Check,
  AlertCircle,
  MapPin,
  Phone,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge'
import { Button } from '@/components/ui/Button'
import { showToast } from '@/components/ui/Toast'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

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

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    setActionLoading(bookingId)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Status update failed')

      showToast.success(`Booking updated to ${newStatus.replace(/_/g, ' ')}`)
      loadBookings()
    } catch (err: any) {
      showToast.error(err.message || 'Error updating status')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <DashboardLayout role="provider" title="Manage Reservations">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display">
            Customer Hourly Bookings
          </h1>
          <p className="text-xs text-gray-500">
            Accept requests, track live trips, and mark services as completed.
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

                    {/* Status update actions */}
                    <div className="flex flex-wrap items-center gap-2">
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
                      )}

                      {b.status === 'in_progress' && (
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={isActioning}
                          onClick={() => handleUpdateStatus(b.id, 'completed')}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Mark Completed
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

