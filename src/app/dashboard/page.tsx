'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  MapPin,
  ChevronRight,
  TrendingUp,
  Star,
  Compass,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'

export default function CustomerDashboardPage() {
  const { user, profile } = useAuth()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBookings() {
      setLoading(true)
      try {
        const res = await fetch('/api/bookings?role=customer')
        if (res.ok) {
          const data = await res.json()
          setBookings(data.bookings || [])
        }
      } catch (err) {
        console.error('Error fetching bookings:', err)
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [])

  // Partition bookings
  const upcomingBookings = bookings.filter((b) =>
    ['pending', 'confirmed', 'paid', 'in_progress'].includes(b.status)
  )
  const completedBookings = bookings.filter((b) => b.status === 'completed')
  const cancelledBookings = bookings.filter((b) => b.status?.includes('cancel'))

  return (
    <DashboardLayout role="customer" title="Customer Overview">
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white shadow-lg shadow-emerald-700/20 relative overflow-hidden">
          <div className="max-w-xl space-y-2 relative z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md">
              Tourist Account
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Traveler'}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Explore India’s best destinations by the hour. Manage your upcoming bookings,
              receipts, and leave verified reviews.
            </p>
            <div className="pt-2">
              <Link href="/explore">
                <Button
                  variant="primary"
                  className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs"
                >
                  <Compass className="w-4 h-4 mr-2 text-emerald-700" />
                  Explore Hourly Services
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Upcoming Trips
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {upcomingBookings.length}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Completed Hours
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {completedBookings.reduce((acc, curr) => acc + (curr.duration_hours || 0), 0)}{' '}
                <span className="text-sm font-normal text-gray-500">hrs</span>
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Total Trips Taken
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {completedBookings.length}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Recent / Upcoming Bookings Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-display">
                Upcoming & Recent Bookings
              </h2>
              <p className="text-xs text-gray-400">
                Hourly bookings scheduled for your travel itinerary
              </p>
            </div>
            <Link
              href="/dashboard/bookings"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center"
            >
              <span>View all bookings</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400 animate-pulse">
              Loading your bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Clock className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-700">No bookings yet</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Ready to explore? Book a bike, car, van, or local guide by the hour.
              </p>
              <Link href="/explore">
                <Button variant="primary" size="sm">
                  Start Exploring
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/60 -mx-4 px-4 rounded-2xl transition-colors"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 font-bold flex flex-col items-center justify-center flex-shrink-0 text-center border border-emerald-100">
                      <span className="text-xs">{booking.duration_hours}</span>
                      <span className="text-[9px] uppercase font-semibold">HRS</span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-gray-900">
                          {booking.service_listings?.title || 'Hourly Tourism Experience'}
                        </h4>
                        <BookingStatusBadge status={booking.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                        <span className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {formatDate(booking.booking_date)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {booking.service_listings?.destination_city || 'India'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4">
                    <div className="text-right">
                      <span className="text-sm font-black text-gray-900 block">
                        {formatCurrency(Number(booking.total_amount))}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">
                        #{booking.booking_number}
                      </span>
                    </div>

                    <Link href={`/dashboard/bookings?bookingId=${booking.id}`}>
                      <Button variant="secondary" size="sm">
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

