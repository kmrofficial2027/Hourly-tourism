'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  Briefcase,
  Compass,
  Calendar,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>({
    totalCustomers: 0,
    totalProviders: 0,
    totalCompanies: 0,
    totalListings: 0,
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    pendingApprovals: 0,
    grossBookingValue: 0,
    totalPlatformCommission: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/stats')
        if (res.ok) {
          const data = await res.json()
          if (data.stats) {
            setStats(data.stats)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  return (
    <DashboardLayout role="admin" title="Platform Administration">
      <div className="space-y-8">
        {/* Admin Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gray-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live Database Telemetry
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-display">
              Hourly Tourism Platform Command Center
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
              Real-time platform metrics, user management, listing compliance, and commission revenue.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/admin/providers">
              <Button variant="primary" size="md">
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                Review Approvals ({stats.pendingApprovals})
              </Button>
            </Link>
          </div>
        </div>

        {/* 10 Core Live Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Gross Booking Value
            </span>
            <h3 className="text-xl font-black text-gray-900">
              {formatCurrency(stats.grossBookingValue)}
            </h3>
            <span className="text-[10px] text-gray-400">All paid reservations</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Platform Commission
            </span>
            <h3 className="text-xl font-black text-emerald-700">
              {formatCurrency(stats.totalPlatformCommission)}
            </h3>
            <span className="text-[10px] text-emerald-600 font-semibold">10% Platform Cut</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Total Customers
            </span>
            <h3 className="text-xl font-black text-gray-900">{stats.totalCustomers}</h3>
            <span className="text-[10px] text-gray-400">Registered tourists</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Total Providers
            </span>
            <h3 className="text-xl font-black text-gray-900">{stats.totalProviders}</h3>
            <span className="text-[10px] text-gray-400">Independent hosts</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Fleet Companies
            </span>
            <h3 className="text-xl font-black text-gray-900">{stats.totalCompanies}</h3>
            <span className="text-[10px] text-gray-400">Commercial operators</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Active Listings
            </span>
            <h3 className="text-xl font-black text-gray-900">{stats.totalListings}</h3>
            <span className="text-[10px] text-gray-400">Bikes, Cars, Vans, Guides</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Total Bookings
            </span>
            <h3 className="text-xl font-black text-gray-900">{stats.totalBookings}</h3>
            <span className="text-[10px] text-gray-400">All-time reservations</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Completed Trips
            </span>
            <h3 className="text-xl font-black text-emerald-700">{stats.completedBookings}</h3>
            <span className="text-[10px] text-emerald-600">Successfully served</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
              Cancellations
            </span>
            <h3 className="text-xl font-black text-red-600">{stats.cancelledBookings}</h3>
            <span className="text-[10px] text-red-500">Under policy</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
              Pending Approvals
            </span>
            <h3 className="text-xl font-black text-amber-600">{stats.pendingApprovals}</h3>
            <span className="text-[10px] text-amber-600 font-semibold">Requires verification</span>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/providers"
            className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-bold text-base text-gray-900">Provider & Fleet Approvals</h3>
            <p className="text-xs text-gray-500 mt-1">
              Verify driving licenses, identity credentials, and commercial insurance.
            </p>
          </Link>

          <Link
            href="/admin/listings"
            className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-bold text-base text-gray-900">Listings Quality & Restrictions</h3>
            <p className="text-xs text-gray-500 mt-1">
              Enforce strict transport category rules (Bikes, Cars, Vans only).
            </p>
          </Link>

          <Link
            href="/admin/payments"
            className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-bold text-base text-gray-900">Cashfree & Razorpay Payments & Escrow</h3>
            <p className="text-xs text-gray-500 mt-1">
              Monitor Cashfree & Razorpay transactions, commission splits, and automated bank payouts.
            </p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}

