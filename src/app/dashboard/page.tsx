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
  Zap,
  HelpCircle,
  ArrowRight,
  Sun,
  Moon,
  Sunset,
  Bike,
  Car,
  Truck,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'

// ─── Helpers ────────────────────────────────────────────────────────────────

function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return { text: 'Good Morning', emoji: '☀️' }
  if (h >= 12 && h < 17) return { text: 'Good Afternoon', emoji: '🌤️' }
  if (h >= 17 && h < 21) return { text: 'Good Evening', emoji: '🌅' }
  return { text: 'Good Night', emoji: '🌙' }
}

function getStatusConfig(status: string) {
  if (['in_progress'].includes(status))
    return {
      dot: 'bg-emerald-400 animate-ping',
      dotBase: 'bg-emerald-500',
      ring: 'ring-emerald-200',
      label: 'Live',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
    }
  if (['confirmed', 'paid'].includes(status))
    return {
      dot: 'bg-blue-400 animate-ping',
      dotBase: 'bg-blue-500',
      ring: 'ring-blue-200',
      label: 'Confirmed',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
    }
  if (status === 'pending')
    return {
      dot: 'bg-amber-400 animate-pulse',
      dotBase: 'bg-amber-500',
      ring: 'ring-amber-200',
      label: 'Pending',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
    }
  if (status === 'completed')
    return {
      dot: 'bg-gray-300',
      dotBase: 'bg-gray-400',
      ring: 'ring-gray-200',
      label: 'Completed',
      bg: 'bg-gray-50',
      text: 'text-gray-600',
    }
  return {
    dot: 'bg-red-400',
    dotBase: 'bg-red-500',
    ring: 'ring-red-200',
    label: 'Cancelled',
    bg: 'bg-red-50',
    text: 'text-red-600',
  }
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonBookingCard() {
  return (
    <div className="p-5 rounded-2xl bg-white border border-gray-100 animate-pulse flex items-start gap-4">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded-full w-3/5" />
        <div className="h-3 bg-gray-100 rounded-full w-2/5" />
        <div className="h-3 bg-gray-100 rounded-full w-4/5" />
      </div>
      <div className="w-20 h-8 rounded-xl bg-gray-100 flex-shrink-0" />
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CustomerDashboardPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect providers/companies to their dedicated portals
  useEffect(() => {
    if (!authLoading && profile?.role) {
      if (profile.role === 'provider') {
        window.location.replace('/provider')
      } else if (profile.role === 'admin') {
        window.location.replace('/admin')
      }
    }
  }, [profile, authLoading])

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

    // 5-second auto-refresh for customer overview trips and active bookings
    const interval = setInterval(() => {
      loadBookings()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Partition bookings
  const upcomingBookings = bookings.filter((b) =>
    ['pending', 'confirmed', 'paid', 'in_progress'].includes(b.status)
  )
  const completedBookings = bookings.filter((b) => b.status === 'completed')
  const cancelledBookings = bookings.filter((b) => b.status?.includes('cancel'))

  const totalSpent = completedBookings.reduce(
    (acc, b) => acc + Number(b.total_amount || 0),
    0
  )
  const totalHours = completedBookings.reduce(
    (acc, b) => acc + (b.duration_hours || 0),
    0
  )

  const greeting = getGreeting()
  const firstName = profile?.full_name?.split(' ')[0] || 'Traveler'

  return (
    <DashboardLayout role="customer" title="Customer Overview">
      <div className="space-y-6 pb-24 lg:pb-8">

        {/* ── HERO GREETING CARD ─────────────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0a4d29] via-[#0d5c32] to-[#065f46] shadow-xl shadow-green-900/20">
          {/* Decorative orbs */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#ff7a00]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 p-6 sm:p-8">
            {/* Greeting */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl leading-none">{greeting.emoji}</span>
              <span className="text-sm font-semibold text-emerald-200/80">
                {greeting.text}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display mb-1">
              {firstName}!
            </h1>
            <p className="text-xs text-emerald-100/70 max-w-xs leading-relaxed">
              Explore India's best destinations by the hour.
            </p>

            {/* Glassmorphism Stats Row */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                {
                  label: 'Upcoming',
                  value: upcomingBookings.length,
                  suffix: 'trips',
                  icon: <Calendar className="w-4 h-4" />,
                },
                {
                  label: 'Hours Toured',
                  value: totalHours,
                  suffix: 'hrs',
                  icon: <Clock className="w-4 h-4" />,
                },
                {
                  label: 'Total Spent',
                  value: `₹${(totalSpent / 1000).toFixed(1)}k`,
                  suffix: '',
                  icon: <CreditCard className="w-4 h-4" />,
                  raw: true,
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-3 text-white"
                >
                  <div className="text-white/50 mb-1.5">{stat.icon}</div>
                  <div className="text-lg sm:text-xl font-black leading-none">
                    {stat.raw ? stat.value : stat.value}
                    {stat.suffix && (
                      <span className="text-xs font-normal text-white/60 ml-1">
                        {stat.suffix}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-white/50 mt-0.5 uppercase tracking-wider font-semibold">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── QUICK ACTION TILES ──────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {/* Book Now */}
          <Link href="/explore">
            <div className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#ff7a00] to-[#f59e0b] p-4 sm:p-5 shadow-lg shadow-orange-500/25 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
              <Compass className="w-7 h-7 text-white mb-3" />
              <p className="text-xs font-black text-white leading-tight">Book Now</p>
              <p className="text-[10px] text-orange-100/80 mt-0.5 hidden sm:block">
                Find services
              </p>
            </div>
          </Link>

          {/* My Trips */}
          <Link href="/dashboard/bookings">
            <div className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0a4d29] to-[#15803d] p-4 sm:p-5 shadow-lg shadow-green-900/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
              <Calendar className="w-7 h-7 text-white mb-3" />
              <p className="text-xs font-black text-white leading-tight">My Trips</p>
              <p className="text-[10px] text-emerald-100/80 mt-0.5 hidden sm:block">
                All bookings
              </p>
            </div>
          </Link>

          {/* Get Help */}
          <Link href="/dashboard/support">
            <div className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 p-4 sm:p-5 shadow-lg shadow-slate-900/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
              <HelpCircle className="w-7 h-7 text-white mb-3" />
              <p className="text-xs font-black text-white leading-tight">Get Help</p>
              <p className="text-[10px] text-slate-300/80 mt-0.5 hidden sm:block">
                24/7 support
              </p>
            </div>
          </Link>
        </div>

        {/* ── BOOKINGS TIMELINE ───────────────────────────────────────────── */}
        <div className="rounded-3xl bg-white border border-gray-100 shadow-xl shadow-green-900/5 overflow-hidden">
          {/* Section header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
            <div>
              <h2 className="text-base font-black text-gray-900 font-display">
                Upcoming &amp; Recent Bookings
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Your hourly travel itinerary
              </p>
            </div>
            <Link
              href="/dashboard/bookings"
              className="flex items-center gap-1 text-xs font-bold text-[#0a4d29] hover:text-[#15803d] transition-colors"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 space-y-3">
            {loading ? (
              <>
                <SkeletonBookingCard />
                <SkeletonBookingCard />
                <SkeletonBookingCard />
              </>
            ) : bookings.length === 0 ? (
              /* ── EMPTY STATE ── */
              <div className="py-14 flex flex-col items-center text-center space-y-4">
                {/* Illustration-like icon cluster */}
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#0a4d29]/10 to-[#ff7a00]/10 animate-pulse" />
                  <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#0a4d29]/10 to-[#ff7a00]/10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Compass className="w-10 h-10 text-[#0a4d29]/40" />
                  </div>
                </div>
                <div>
                  <p className="text-base font-black text-gray-800">
                    No bookings yet
                  </p>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1 leading-relaxed">
                    Book a bike, car, or van by the hour and explore India's
                    most beautiful destinations.
                  </p>
                </div>
                <Link href="/explore">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff7a00] to-[#f59e0b] text-white text-sm font-bold shadow-lg shadow-orange-500/25 hover:-translate-y-0.5 transition-all">
                    <Compass className="w-4 h-4" />
                    Start Exploring
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            ) : (
              /* ── BOOKING CARDS ── */
              <div className="space-y-3">
                {bookings.slice(0, 5).map((booking) => {
                  const sc = getStatusConfig(booking.status)
                  return (
                    <div
                      key={booking.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md hover:shadow-green-900/5 hover:-translate-y-0.5 transition-all duration-200 bg-white"
                    >
                      {/* Left: duration badge + details */}
                      <div className="flex items-start gap-3.5">
                        {/* Duration badge */}
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0a4d29] to-[#15803d] text-white font-black flex flex-col items-center justify-center flex-shrink-0 shadow-md shadow-green-900/20">
                          <span className="text-base leading-none">
                            {booking.duration_hours}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider text-emerald-200 font-semibold">
                            HRS
                          </span>
                        </div>

                        {/* Meta */}
                        <div>
                          <div className="flex items-center flex-wrap gap-2 mb-1">
                            <h4 className="text-sm font-black text-gray-900">
                              {booking.service_listings?.title ||
                                'Hourly Tourism Experience'}
                            </h4>
                            {/* Animated status badge */}
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${sc.bg} ${sc.text}`}
                            >
                              <span className="relative flex h-2 w-2">
                                <span
                                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${sc.dot}`}
                                />
                                <span
                                  className={`relative inline-flex rounded-full h-2 w-2 ${sc.dotBase}`}
                                />
                              </span>
                              {sc.label}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {formatDate(booking.booking_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {formatTime(booking.start_time)} –{' '}
                              {formatTime(booking.end_time)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {booking.service_listings?.destination_city ||
                                'India'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: amount + CTA */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                        <div className="text-right">
                          <span className="text-sm font-black text-gray-900 block">
                            {formatCurrency(Number(booking.total_amount))}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                            #{booking.booking_number}
                          </span>
                        </div>
                        <Link
                          href={`/dashboard/bookings?bookingId=${booking.id}`}
                        >
                          <button className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-[#0a4d29] text-gray-700 hover:text-white text-xs font-bold border border-gray-200 hover:border-transparent transition-all duration-200">
                            Details
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
