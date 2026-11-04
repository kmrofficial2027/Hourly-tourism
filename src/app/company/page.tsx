'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Building2,
  Briefcase,
  Calendar,
  CreditCard,
  Plus,
  Users,
  Compass,
  TrendingUp,
  RefreshCw,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

export default function CompanyDashboardPage() {
  const [stats, setStats] = useState({
    fleetSize: 0,
    activeBookings: 0,
    monthlyGross: 0,
    monthlyNet: 0,
    totalDrivers: 0,
  })
  const [fleet, setFleet] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [servicesRes, bookingsRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/bookings?role=company'),
      ])

      let fleetItems: any[] = []
      let bookingItems: any[] = []

      if (servicesRes.ok) {
        const sData = await servicesRes.json()
        fleetItems = sData.listings || []
        setFleet(fleetItems)
      }

      if (bookingsRes.ok) {
        const bData = await bookingsRes.json()
        bookingItems = bData.bookings || []
      }

      const activeB = bookingItems.filter((b) =>
        ['confirmed', 'in_progress'].includes(b.status)
      ).length

      const totalGross = bookingItems
        .filter((b) => ['paid', 'completed'].includes(b.payment_status))
        .reduce((sum, b) => sum + Number(b.total_amount || 0), 0)

      const netEarnings = Math.round(totalGross * 0.9)

      setStats({
        fleetSize: fleetItems.length,
        activeBookings: activeB,
        monthlyGross: totalGross,
        monthlyNet: netEarnings,
        totalDrivers: 0,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <DashboardLayout role="company" title="Company Operator Portal">
      <div className="space-y-8">
        {/* Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-900 text-white shadow-lg space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md">
            Commercial Fleet Operator
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-display">
            Multi-Vehicle & Fleet Operations
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
            Manage your fleet of Bikes, Cars, and Vans, deploy staff, monitor live hourly bookings,
            and view commission breakdowns.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link href="/provider/listings/new">
              <Button variant="primary" className="bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50">
                <Plus className="w-4 h-4 mr-1.5 text-emerald-700" />
                Add Vehicle to Fleet
              </Button>
            </Link>
            <Link href="/company/services">
              <Button variant="secondary" className="border-white/30 text-white hover:bg-white/10 text-xs font-bold">
                Manage All Fleet ({stats.fleetSize})
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
              Fleet Size (Bikes/Cars/Vans)
            </span>
            <h3 className="text-2xl font-black text-gray-900">{stats.fleetSize}</h3>
            <p className="text-[11px] text-gray-400">Strictly verified transport</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
              Active Bookings Today
            </span>
            <h3 className="text-2xl font-black text-emerald-700">{stats.activeBookings}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold">In-progress trips</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
              Gross Revenue
            </span>
            <h3 className="text-2xl font-black text-gray-900">
              {formatCurrency(stats.monthlyGross)}
            </h3>
            <p className="text-[11px] text-gray-400">Total customer hourly billing</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
              Net Company Earnings
            </span>
            <h3 className="text-2xl font-black text-emerald-700">
              {formatCurrency(stats.monthlyNet)}
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold">After 10% platform fee</p>
          </div>
        </div>

        {/* Fleet Allocation List */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 font-display">
              Commercial Fleet Overview
            </h2>
            <Link href="/company/services" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
              View all vehicles
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8 text-xs text-gray-400">Loading fleet data...</div>
          ) : fleet.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <Compass className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-semibold text-gray-500">No vehicles registered yet</p>
              <p className="text-xs text-gray-400">
                Add your fleet of bikes, cars, and vans to manage commercial reservations.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 text-xs">
              {fleet.slice(0, 5).map((v) => (
                <div key={v.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-gray-900">{v.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                        {v.category}
                      </span>
                    </div>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                      City: {v.destination_city} • Rate: {formatCurrency(Number(v.hourly_rate))}/hr
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    v.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {v.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
