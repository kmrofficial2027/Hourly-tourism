'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Compass,
  Calendar,
  Clock,
  TrendingUp,
  Star,
  ShieldCheck,
  Plus,
  ChevronRight,
  AlertCircle,
  Users,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  BarChart3,
  Car,
  Wallet,
  ListChecks,
  BadgeCheck,
  Timer,
  ArrowRight,
  Radio,
  Power,
  PowerOff,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge'
import { showToast } from '@/components/ui/Toast'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { useProviderQueue } from '@/hooks/useProviderQueue'

export default function ProviderOverviewPage() {
  const [stats, setStats] = useState({
    totalListings: 0,
    bookingRequests: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    grossRevenue: 0,
    netEarnings: 0,
    averageRating: 0,
  })

  const [recentRequests, setRecentRequests] = useState<any[]>([])
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null)
  const [isRiderOnline, setIsRiderOnline] = useState(true)
  const [loading, setLoading] = useState(true)

  // Real-time Provider queue listener
  const { hasNewPing, latestPendingBooking } = useProviderQueue()

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [bookingsRes, servicesRes, verifRes, profileRes] = await Promise.all([
          fetch('/api/bookings?role=provider'),
          fetch('/api/services'),
          fetch('/api/provider/verification'),
          fetch('/api/provider/profile'),
        ])

        if (verifRes.ok) {
          const vData = await verifRes.json()
          setVerificationStatus(vData.verification_status || 'unsubmitted')
        }

        if (profileRes.ok) {
          const pData = await profileRes.json()
          if (typeof pData.isOnline === 'boolean') {
            setIsRiderOnline(pData.isOnline)
          }
        }

        let bookings: any[] = []
        let listingsCount = 0

        if (bookingsRes.ok) {
          const bData = await bookingsRes.json()
          bookings = bData.bookings || []
          setRecentRequests(bookings.slice(0, 5))
        }

        if (servicesRes.ok) {
          const sData = await servicesRes.json()
          listingsCount = (sData.listings || []).length
        }

        const bookingRequests = bookings.filter((b) => b.status === 'pending').length
        const upcomingBookings = bookings.filter((b) =>
          ['confirmed', 'in_progress'].includes(b.status)
        ).length
        const completedBookings = bookings.filter((b) => b.status === 'completed').length
        const grossRevenue = bookings
          .filter((b) => ['paid', 'completed'].includes(b.payment_status))
          .reduce((sum, b) => sum + Number(b.total_amount || 0), 0)
        const netEarnings = Math.round(grossRevenue * 0.9)

        setStats({
          totalListings: listingsCount,
          bookingRequests,
          upcomingBookings,
          completedBookings,
          grossRevenue,
          netEarnings,
          averageRating: 5.0,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const [togglingOnline, setTogglingOnline] = useState(false)

  // Instant toggle for Marketplace Availability (Online / Offline)
  const handleToggleOnlineStatus = async (newOnlineState: boolean) => {
    if (newOnlineState === isRiderOnline) return
    setTogglingOnline(true)
    try {
      const res = await fetch('/api/provider/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: newOnlineState }),
      })

      if (res.ok) {
        const data = await res.json()
        setIsRiderOnline(data.isOnline)
        if (data.totalListings !== undefined) {
          setStats((prev) => ({ ...prev, totalListings: data.activeListings ?? prev.totalListings }))
        }
        if (newOnlineState) {
          showToast.success('Marketplace Availability: You are now ONLINE! Your listings are active.')
        } else {
          showToast.success('Marketplace Availability: You are now OFFLINE. Your listings are hidden from tourists.')
        }
      } else {
        const err = await res.json().catch(() => ({}))
        showToast.error(err.error || 'Failed to update marketplace status')
      }
    } catch (err) {
      console.error(err)
      showToast.error('Network error changing availability status')
    } finally {
      setTogglingOnline(false)
    }
  }

  /* ─── Skeleton ─────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <DashboardLayout role="provider" title="Provider Dashboard">
        <div className="space-y-6 animate-pulse">
          {/* Hero skeleton */}
          <div className="h-44 rounded-3xl bg-gradient-to-br from-[#0a4d29] to-[#15803d] opacity-30" />
          {/* Stats grid skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-3xl bg-gray-200" />
            ))}
          </div>
          {/* Earnings skeleton */}
          <div className="h-36 rounded-3xl bg-gray-200" />
          {/* Requests skeleton */}
          <div className="h-64 rounded-3xl bg-gray-200" />
          {/* Quick actions skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-3xl bg-gray-200" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const isVerified =
    verificationStatus === 'verified' || verificationStatus === 'approved'

  /* ─── Main render ───────────────────────────────────────────────────────── */
  return (
    <DashboardLayout role="provider" title="Provider Dashboard">
      <div className="space-y-6">

        {/* ══════════════════════════════════════════════════
            0. TOP: MARKETPLACE AVAILABILITY INSTANT SWITCH BAR
        ══════════════════════════════════════════════════ */}
        <div
          className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 border transition-all duration-300 shadow-sm ${
            isRiderOnline
              ? 'bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border-emerald-200/80 shadow-emerald-500/5'
              : 'bg-gradient-to-r from-slate-100 via-gray-100 to-slate-100 border-gray-300 shadow-gray-500/5'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left status info */}
            <div className="flex items-center space-x-3.5">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors shadow-xs ${
                  isRiderOnline
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                {isRiderOnline ? (
                  <Radio className="w-5 h-5 animate-pulse" />
                ) : (
                  <PowerOff className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-black text-gray-900 font-display">
                    Marketplace Availability
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isRiderOnline
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-gray-200 text-gray-700 border border-gray-300'
                    }`}
                  >
                    <span className="relative flex h-2 w-2">
                      {isRiderOnline && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      )}
                      <span
                        className={`relative inline-flex rounded-full h-2 w-2 ${
                          isRiderOnline ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}
                      />
                    </span>
                    {isRiderOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  {isRiderOnline ? (
                    <span>
                      Your published tours are <strong className="text-emerald-700 font-bold">LIVE in the marketplace</strong>. Tourists can search and book your rides.
                    </span>
                  ) : (
                    <span>
                      You are currently <strong className="text-gray-800 font-bold">OFFLINE</strong>. All your listings are temporarily hidden from tourists.
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Right instant interactive switch */}
            <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
              <div className="inline-flex p-1 rounded-2xl bg-white border border-gray-200 shadow-inner">
                {/* Active (Online) Button */}
                <button
                  type="button"
                  onClick={() => handleToggleOnlineStatus(true)}
                  disabled={togglingOnline}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    isRiderOnline
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-500'
                      : 'text-gray-500 hover:text-emerald-700 hover:bg-emerald-50/50'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  Online
                </button>

                {/* Offline Button */}
                <button
                  type="button"
                  onClick={() => handleToggleOnlineStatus(false)}
                  disabled={togglingOnline}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    !isRiderOnline
                      ? 'bg-gradient-to-r from-gray-800 to-slate-900 text-white shadow-md shadow-slate-900/30 ring-1 ring-gray-700'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/60'
                  }`}
                >
                  <PowerOff className="w-3.5 h-3.5" />
                  Offline
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time New Booking Alert Banner */}
        {hasNewPing && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-slate-950 shadow-xl shadow-orange-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in border border-yellow-200">
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-1 rounded-xl bg-slate-950 text-orange-300 text-[11px] font-black tracking-wider uppercase">
                ⚡ NEW REQUEST
              </span>
              <div>
                <p className="font-black text-sm">New Booking Request Arrived in Real-time!</p>
                <p className="text-xs font-semibold text-slate-800">
                  {latestPendingBooking?.customer_name ? `From ${latestPendingBooking.customer_name} • ` : ''}
                  Action required before acceptance window expires.
                </p>
              </div>
            </div>
            <Link
              href="/provider/bookings"
              className="px-4 py-2 rounded-2xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-colors text-center shrink-0"
            >
              Open Booking Queue →
            </Link>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            1. DARK GRADIENT HERO HEADER
        ══════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a4d29] via-[#0d5c31] to-[#15803d] p-6 sm:p-8 shadow-xl shadow-green-900/30">
          {/* Decorative orbs */}
          <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-[#ff7a00]/10 blur-2xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-3">
              {/* Verification badge */}
              <div className="inline-flex items-center gap-2">
                {isVerified ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-sm">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Verified Provider
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/20 border border-orange-400/30 px-3 py-1 text-xs font-semibold text-orange-200 backdrop-blur-sm">
                    <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
                    {verificationStatus === 'pending' ? 'Verification Pending' : 'Verification Required'}
                  </span>
                )}
                {/* Live Online / Offline rider status click-to-toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleOnlineStatus(!isRiderOnline)}
                  disabled={togglingOnline}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all hover:scale-105 cursor-pointer ${
                    isRiderOnline
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                      : 'bg-white/10 text-white/70 border border-white/20'
                  }`}
                  title="Click to toggle marketplace availability"
                >
                  <span className="relative flex h-2 w-2">
                    {isRiderOnline && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    )}
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${
                        isRiderOnline ? 'bg-emerald-400' : 'bg-gray-400'
                      }`}
                    />
                  </span>
                  {isRiderOnline ? 'LIVE (ONLINE)' : 'OFFLINE'}
                </button>
              </div>

              {/* Today's earnings hero text */}
              <div>
                <p className="text-sm text-white/60 font-medium mb-1">Today's Earnings</p>
                <div className="flex items-end gap-2">
                  <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none font-display">
                    {formatCurrency(stats.netEarnings)}
                  </h1>
                  <Sparkles className="w-6 h-6 text-yellow-400 mb-1 flex-shrink-0" />
                </div>
                <p className="text-xs text-white/50 mt-1">
                  Gross {formatCurrency(stats.grossRevenue)} · 10% platform fee deducted
                </p>
              </div>

              {/* Sub stats row */}
              <div className="flex flex-wrap gap-4 pt-1">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-bold text-white">{stats.averageRating}</span>
                  <span className="text-xs text-white/50">rating</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-sm font-bold text-white">{stats.completedBookings}</span>
                  <span className="text-xs text-white/50">completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-sky-300" />
                  <span className="text-sm font-bold text-white">{stats.totalListings}</span>
                  <span className="text-xs text-white/50">listings</span>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-row sm:flex-col gap-3 flex-shrink-0">
              <Link href="/provider/listings/new">
                <button className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ff7a00] hover:bg-[#f59e0b] text-white text-sm font-bold px-5 py-3 shadow-lg shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0">
                  <Plus className="w-4 h-4" />
                  Add Listing
                </button>
              </Link>
              <Link href="/provider/bookings">
                <button className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold px-5 py-3 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0">
                  <ListChecks className="w-4 h-4" />
                  Bookings
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            VERIFICATION NOTICE (if not verified)
        ══════════════════════════════════════════════════ */}
        {verificationStatus && !isVerified && (
          <div
            className={`relative overflow-hidden p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              verificationStatus === 'pending'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  verificationStatus === 'pending'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                    : 'bg-gradient-to-br from-[#0a4d29] to-[#15803d] text-white shadow-md shadow-green-900/20'
                }`}
              >
                {verificationStatus === 'pending' ? (
                  <Clock className="w-5 h-5 animate-pulse" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className={`font-bold text-sm ${verificationStatus === 'pending' ? 'text-amber-900' : 'text-emerald-950'}`}>
                  {verificationStatus === 'pending'
                    ? 'Aadhaar ID & Live Selfie Verification Pending Admin Approval'
                    : 'Identity Verification Required for Marketplace Listings'}
                </h4>
                <p className={`text-xs mt-0.5 ${verificationStatus === 'pending' ? 'text-amber-700' : 'text-emerald-800'}`}>
                  {verificationStatus === 'pending'
                    ? 'Your documents have been submitted. Admin is reviewing your Aadhaar and live photo before activating your listing capabilities.'
                    : 'Upload your Aadhaar Card and capture a live facial selfie to get verified and approved by Admin.'}
                </p>
              </div>
            </div>
            <Link href="/provider/verification" className="flex-shrink-0">
              <button
                className={`inline-flex items-center gap-1.5 rounded-2xl text-sm font-bold px-4 py-2.5 transition-all duration-200 ${
                  verificationStatus === 'pending'
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/30'
                    : 'bg-gradient-to-br from-[#0a4d29] to-[#15803d] text-white shadow-md shadow-green-900/20 hover:-translate-y-0.5'
                }`}
              >
                {verificationStatus === 'pending' ? 'View Status' : 'Verify Identity Now'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            2. STATS GRID — 4 Cards
        ══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Total Listings */}
          <div className="relative overflow-hidden group p-5 rounded-3xl bg-white border border-gray-100 shadow-sm shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 cursor-default">
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-teal-50 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md shadow-teal-500/25">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Listings</p>
                <h3 className="text-3xl font-black text-gray-900 leading-none mt-1">{stats.totalListings}</h3>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-teal-600 font-semibold">
                <ArrowUpRight className="w-3 h-3" />
                Active tours
              </div>
            </div>
          </div>

          {/* Pending Requests */}
          <div className="relative overflow-hidden group p-5 rounded-3xl bg-white border border-orange-100 shadow-sm shadow-orange-100/50 hover:-translate-y-1 transition-all duration-300 cursor-default">
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-orange-50 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ff7a00] to-[#f59e0b] flex items-center justify-center shadow-md shadow-orange-500/25">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                {/* Pulsing orange dot */}
                {stats.bookingRequests > 0 && (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pending</p>
                <h3 className="text-3xl font-black text-gray-900 leading-none mt-1">{stats.bookingRequests}</h3>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-orange-500 font-semibold">
                <Timer className="w-3 h-3" />
                Awaiting response
              </div>
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="relative overflow-hidden group p-5 rounded-3xl bg-white border border-gray-100 shadow-sm shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 cursor-default">
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-blue-50 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Upcoming</p>
                <h3 className="text-3xl font-black text-gray-900 leading-none mt-1">{stats.upcomingBookings}</h3>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold">
                <Zap className="w-3 h-3" />
                Confirmed & active
              </div>
            </div>
          </div>

          {/* Completed Trips */}
          <div className="relative overflow-hidden group p-5 rounded-3xl bg-white border border-gray-100 shadow-sm shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 cursor-default">
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-emerald-50 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0a4d29] to-[#15803d] flex items-center justify-center shadow-md shadow-green-900/20">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Completed</p>
                <h3 className="text-3xl font-black text-gray-900 leading-none mt-1">{stats.completedBookings}</h3>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <TrendingUp className="w-3 h-3" />
                Total trips done
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            3. NET EARNINGS BREAKDOWN CARD
        ══════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm shadow-gray-200/50 p-6 sm:p-8">
          {/* Gradient accent strip */}
          <div className="absolute left-0 top-0 h-full w-1.5 rounded-l-3xl bg-gradient-to-b from-[#ff7a00] to-[#f59e0b]" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff7a00] to-[#f59e0b] flex items-center justify-center shadow-md shadow-orange-500/25">
                  <Wallet className="w-4.5 h-4.5 text-white" style={{ width: '18px', height: '18px' }} />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900 font-display">Earnings Breakdown</h2>
                  <p className="text-[11px] text-gray-400">All-time summary</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                {/* Gross */}
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Gross Revenue</p>
                  <p className="text-2xl font-black text-gray-800">{formatCurrency(stats.grossRevenue)}</p>
                </div>
                {/* Arrow */}
                <div className="flex items-end pb-1 text-gray-300">
                  <ChevronRight className="w-5 h-5" />
                </div>
                {/* Commission */}
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Platform Fee (10%)</p>
                  <p className="text-2xl font-black text-red-400">−{formatCurrency(stats.grossRevenue - stats.netEarnings)}</p>
                </div>
                {/* Arrow */}
                <div className="flex items-end pb-1 text-gray-300">
                  <ChevronRight className="w-5 h-5" />
                </div>
                {/* Net */}
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Your Net Payout</p>
                  <p className="text-2xl font-black text-emerald-700">{formatCurrency(stats.netEarnings)}</p>
                </div>
              </div>
            </div>

            <Link href="/provider/earnings">
              <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-[#0a4d29] to-[#15803d] text-white text-sm font-bold px-5 py-3 shadow-md shadow-green-900/20 hover:-translate-y-0.5 transition-all duration-200 flex-shrink-0">
                <BarChart3 className="w-4 h-4" />
                Full Report
              </button>
            </Link>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            4. PENDING REQUESTS — Urgent Priority Cards
        ══════════════════════════════════════════════════ */}
        <div className="rounded-3xl bg-white border border-gray-100 shadow-sm shadow-gray-200/50 overflow-hidden">
          {/* Section header */}
          <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff7a00] to-[#f59e0b] flex items-center justify-center shadow-md shadow-orange-500/25">
                <AlertCircle className="w-4.5 h-4.5 text-white" style={{ width: '18px', height: '18px' }} />
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900 font-display">Booking Requests</h2>
                <p className="text-[11px] text-gray-400">Review and respond to incoming reservations</p>
              </div>
            </div>
            <Link
              href="/provider/bookings"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0a4d29] hover:text-[#15803d] transition-colors"
            >
              All bookings
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Requests list */}
          <div className="divide-y divide-gray-50">
            {recentRequests.length === 0 ? (
              <div className="py-14 flex flex-col items-center gap-3 text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-gray-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">No booking requests yet</p>
                  <p className="text-xs text-gray-400 mt-0.5">Your availability calendar is open and ready.</p>
                </div>
              </div>
            ) : (
              recentRequests.map((b, idx) => (
                <div
                  key={b.id}
                  className={`p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors duration-150 ${
                    b.status === 'pending' ? 'border-l-4 border-[#ff7a00]' : ''
                  }`}
                >
                  {/* Left: booking info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Avatar / index */}
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0 font-black text-slate-500 text-sm">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-[11px] font-bold text-[#0a4d29] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                          #{b.booking_number}
                        </span>
                        <BookingStatusBadge status={b.status} />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 truncate">
                        {b.service_listings?.title || 'Hourly Booking'}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <Calendar className="w-3 h-3 inline text-gray-400" />
                        {formatDate(b.booking_date)}
                        <span className="text-gray-300">·</span>
                        <Clock className="w-3 h-3 inline text-gray-400" />
                        {formatTime(b.start_time)} – {formatTime(b.end_time)}
                        <span className="text-gray-300">·</span>
                        <span className="font-semibold text-gray-600">{b.duration_hours}h</span>
                      </p>
                      {/* Masked customer */}
                      <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Customer ****{String(b.tourist_id || '').slice(-4) || '—'}
                      </p>
                    </div>
                  </div>

                  {/* Right: amount + actions */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 flex-shrink-0">
                    <span className="text-lg font-black text-gray-900">
                      {formatCurrency(Number(b.total_amount))}
                    </span>
                    <div className="flex items-center gap-2">
                      {b.status === 'pending' ? (
                        <>
                          {/* Accept */}
                          <Link href={`/provider/bookings?id=${b.id}&action=accept`}>
                            <button className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-[#0a4d29] to-[#15803d] text-white text-xs font-bold px-3 py-2 shadow-md shadow-green-900/20 hover:-translate-y-0.5 transition-all duration-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Accept
                            </button>
                          </Link>
                          {/* Reject */}
                          <Link href={`/provider/bookings?id=${b.id}&action=reject`}>
                            <button className="inline-flex items-center gap-1.5 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold px-3 py-2 transition-all duration-200 hover:-translate-y-0.5">
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </Link>
                        </>
                      ) : (
                        <Link href={`/provider/bookings?id=${b.id}`}>
                          <button className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold px-3 py-2 transition-all duration-200">
                            Review
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            5. QUICK ACTION GRID
        ══════════════════════════════════════════════════ */}
        <div>
          <h2 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-3 px-1">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Add Listing */}
            <Link href="/provider/listings/new" className="group">
              <div className="relative overflow-hidden h-24 rounded-3xl bg-gradient-to-br from-[#ff7a00] to-[#f59e0b] p-5 flex flex-col justify-between shadow-lg shadow-orange-500/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <Plus className="w-6 h-6 text-white" />
                <p className="text-sm font-black text-white leading-tight">Add Listing</p>
                <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-white/10" />
              </div>
            </Link>

            {/* My Listings */}
            <Link href="/provider/listings" className="group">
              <div className="relative overflow-hidden h-24 rounded-3xl bg-gradient-to-br from-[#0a4d29] to-[#15803d] p-5 flex flex-col justify-between shadow-lg shadow-green-900/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <Compass className="w-6 h-6 text-white" />
                <p className="text-sm font-black text-white leading-tight">My Listings</p>
                <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-white/10" />
              </div>
            </Link>

            {/* View Earnings */}
            <Link href="/provider/earnings" className="group">
              <div className="relative overflow-hidden h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 flex flex-col justify-between shadow-lg shadow-blue-600/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <BarChart3 className="w-6 h-6 text-white" />
                <p className="text-sm font-black text-white leading-tight">View Earnings</p>
                <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-white/10" />
              </div>
            </Link>

            {/* Verification */}
            <Link href="/provider/verification" className="group">
              <div className={`relative overflow-hidden h-24 rounded-3xl p-5 flex flex-col justify-between shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
                isVerified
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20'
                  : 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20'
              }`}>
                <ShieldCheck className="w-6 h-6 text-white" />
                <p className="text-sm font-black text-white leading-tight">
                  {isVerified ? 'Verified ✓' : 'Get Verified'}
                </p>
                <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-white/10" />
              </div>
            </Link>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
