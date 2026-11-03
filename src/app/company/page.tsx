'use client'

import React, { useState } from 'react'
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
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

export default function CompanyDashboardPage() {
  const [stats, setStats] = useState({
    fleetSize: 12,
    activeBookings: 8,
    monthlyGross: 142000,
    monthlyNet: 127800,
    totalDrivers: 6,
  })

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
            <p className="text-[11px] text-emerald-600 font-semibold">Across 4 destinations</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
              Monthly Gross Revenue
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

          <div className="divide-y divide-gray-100 text-xs">
            {[
              { type: 'Van', name: 'Force Traveller 9-Seater Luxury', reg: 'GA-03-Z-8910', city: 'Goa', rate: 899, status: 'On Trip (4 hrs)' },
              { type: 'Car', name: 'Hyundai Creta SX Chauffeur', reg: 'MH-02-EE-4129', city: 'Mumbai', rate: 599, status: 'Available' },
              { type: 'Bike', name: 'Royal Enfield Classic 350 (x4 fleet)', reg: 'RJ-14-BQ-1022', city: 'Jaipur', rate: 199, status: 'Available' },
            ].map((v, i) => (
              <div key={i} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-gray-900">{v.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                      {v.type}
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px] mt-0.5">
                    Reg: {v.reg} • City: {v.city} • Rate: {formatCurrency(v.rate)}/hr
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

