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
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [bookingsRes, servicesRes, verifRes] = await Promise.all([
          fetch('/api/bookings?role=provider'),
          fetch('/api/services'),
          fetch('/api/provider/verification'),
        ])

        if (verifRes.ok) {
          const vData = await verifRes.json()
          setVerificationStatus(vData.verification_status || 'unsubmitted')
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
        const upcomingBookings = bookings.filter((b) => ['confirmed', 'in_progress'].includes(b.status)).length
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

  return (
    <DashboardLayout role="provider" title="Provider Dashboard">
      <div className="space-y-8">
        {/* Top Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl font-black text-gray-900 font-display">
              Host Performance Overview
            </h1>
            <p className="text-xs text-gray-500">
              Manage your hourly fleet, booking requests, and payout status.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/provider/listings/new">
              <Button variant="primary" size="md">
                <Plus className="w-4 h-4 mr-1.5" />
                Add New Listing
              </Button>
            </Link>
          </div>
        </div>

        {/* Verification Status Notice if not verified */}
        {verificationStatus && verificationStatus !== 'verified' && (
          <div
            className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              verificationStatus === 'pending'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex items-center space-x-3.5">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  verificationStatus === 'pending'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-700 text-white'
                }`}
              >
                {verificationStatus === 'pending' ? (
                  <Clock className="w-5 h-5 animate-pulse" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm">
                  {verificationStatus === 'pending'
                    ? 'Aadhaar ID & Live Selfie Verification Pending Admin Approval'
                    : 'Identity Verification Required for Marketplace Listings'}
                </h4>
                <p className="text-xs opacity-80 mt-0.5">
                  {verificationStatus === 'pending'
                    ? 'Your documents have been submitted. Admin is reviewing your Aadhaar and live photo before activating your listing capabilities.'
                    : 'Upload your Aadhaar Card and capture a live facial selfie to get verified and approved by Admin.'}
                </p>
              </div>
            </div>

            <Link href="/provider/verification" className="flex-shrink-0">
              <Button
                variant={verificationStatus === 'pending' ? 'secondary' : 'primary'}
                size="sm"
              >
                {verificationStatus === 'pending' ? 'View Status' : 'Verify Identity Now'}
              </Button>
            </Link>
          </div>
        )}

        {/* 4 Core Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
              <span>Net Earnings</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-emerald-700">
              {formatCurrency(stats.netEarnings)}
            </h3>
            <p className="text-[11px] text-gray-400">After 10% platform commission</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
              <span>Pending Requests</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-gray-900">{stats.bookingRequests}</h3>
            <p className="text-[11px] text-amber-600 font-semibold">Awaiting your response</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
              <span>Active Listings</span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <Compass className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-gray-900">{stats.totalListings}</h3>
            <p className="text-[11px] text-gray-400">Bikes, Cars, Vans or Guides</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
              <span>Rating & Reviews</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-gray-900">
              {stats.averageRating} <span className="text-sm font-normal text-gray-400">/ 5.0</span>
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold">100% verified tourists</p>
          </div>
        </div>

        {/* Recent Requests Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-display">
                Recent Booking Requests
              </h2>
              <p className="text-xs text-gray-400">
                Review and accept upcoming hourly reservations
              </p>
            </div>
            <Link
              href="/provider/bookings"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center"
            >
              <span>Manage all bookings</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {recentRequests.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                No active booking requests at the moment. Your availability calendar is open.
              </div>
            ) : (
              recentRequests.map((b) => (
                <div
                  key={b.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        #{b.booking_number}
                      </span>
                      <BookingStatusBadge status={b.status} />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mt-1">
                      {b.service_listings?.title || 'Hourly Booking'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {formatDate(b.booking_date)} • {formatTime(b.start_time)} to {formatTime(b.end_time)} ({b.duration_hours} hrs)
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="font-black text-sm text-gray-900">
                      {formatCurrency(Number(b.total_amount))}
                    </span>
                    <Link href={`/provider/bookings?id=${b.id}`}>
                      <Button variant="secondary" size="sm">
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
