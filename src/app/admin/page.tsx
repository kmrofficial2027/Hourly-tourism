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
  Activity,
  Sparkles,
  ArrowUpRight,
  Clock,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>({
    totalCustomers: 0,
    totalProviders: 0,
    totalListings: 0,
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    pendingApprovals: 0,
    grossBookingValue: 0,
    totalPlatformCommission: 0,
  })

  const [loading, setLoading] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

  async function loadStats() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        if (data.stats) {
          setStats(data.stats)
          setLastRefreshed(new Date())
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
    // 30s auto-refresh
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <DashboardLayout role="admin" title="Platform Command Center">
      <div className="space-y-8">
        {/* Real-time Operations Header Bar */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white shadow-2xl relative overflow-hidden border border-slate-700/50">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="live-badge-dot" />
                  Live Platform Telemetry
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Updated {lastRefreshed.toLocaleTimeString()}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
                Hourly Tourism Platform Command Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
                Live monitoring of customer bookings, provider KYC verifications, 10% platform take-rate, and dispute arbitrations.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={loadStats}
                disabled={loading}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
                title="Refresh Live Data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Link href="/admin/providers">
                <Button variant="primary" size="md" className="bg-gradient-to-r from-orange-500 to-amber-500 border-none font-bold">
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  KYC Queue ({stats.pendingApprovals})
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Core Financial & Operational Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* GMV */}
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Gross Booking Value (GMV)
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 font-display">
              {formatCurrency(stats.grossBookingValue)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>All confirmed hourly reservations</span>
            </div>
          </div>

          {/* Platform Revenue */}
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-500">
                Net Platform Cut (10%)
              </span>
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-emerald-800 font-display">
              {formatCurrency(stats.totalPlatformCommission)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-orange-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Automated Escrow Commission</span>
            </div>
          </div>

          {/* Active Bookings */}
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Total Bookings
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 font-display">
              {stats.totalBookings}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-slate-500">
              <span className="text-emerald-600 font-bold">{stats.completedBookings} Completed</span>
              <span>•</span>
              <span className="text-red-500 font-bold">{stats.cancelledBookings} Cancelled</span>
            </div>
          </div>

          {/* KYC Approvals */}
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-500">
                KYC Verification Queue
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-amber-600 font-display">
              {stats.pendingApprovals}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-amber-700">
              <Clock className="w-3.5 h-3.5" />
              <span>Pending provider review</span>
            </div>
          </div>
        </div>

        {/* Secondary Marketplace Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Verified Customers
              </span>
              <h4 className="text-xl font-black text-slate-900 mt-1">{stats.totalCustomers}</h4>
              <p className="text-xs text-slate-400 mt-0.5">Tourists registered</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Independent Hosts
              </span>
              <h4 className="text-xl font-black text-slate-900 mt-1">{stats.totalProviders}</h4>
              <p className="text-xs text-slate-400 mt-0.5">Active providers & guides</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Active Listings
              </span>
              <h4 className="text-xl font-black text-slate-900 mt-1">{stats.totalListings}</h4>
              <p className="text-xs text-slate-400 mt-0.5">Bikes, Cars, Vans, Guides</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Compass className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Quick Management Modules */}
        <div>
          <h2 className="text-base font-black text-slate-900 mb-4 font-display">
            Operational Workbenches
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/admin/providers"
              className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="font-black text-base text-slate-900 font-display">Provider & Host Verifications</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Verify identity KYC, commercial driving licenses, and vehicle registration compliance.
              </p>
            </Link>

            <Link
              href="/admin/payments"
              className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="font-black text-base text-slate-900 font-display">Payments, Settlements & Refunds</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Process refund queue, verify TDS deductions, and trigger provider payouts.
              </p>
            </Link>

            <Link
              href="/admin/disputes"
              className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="font-black text-base text-slate-900 font-display">Dispute Mediation Center</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Review no-show evidence, customer claims, and issue binding arbitration rulings.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
