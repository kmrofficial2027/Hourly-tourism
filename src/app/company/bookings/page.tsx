'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, CheckCircle2, RefreshCw } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

export default function CompanyBookingsPage() {
  const [companyBookings, setCompanyBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadBookings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/bookings?role=company')
      if (res.ok) {
        const data = await res.json()
        setCompanyBookings(data.bookings || [])
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

  return (
    <DashboardLayout role="company" title="Company Bookings Calendar">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-display">
              Company Wide Reservations
            </h1>
            <p className="text-xs text-gray-500">
              Monitor all assigned vehicle and tour bookings across your enterprise.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadBookings} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading bookings...</div>
        ) : companyBookings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <Calendar className="w-10 h-10 text-gray-200 mx-auto" />
            <p className="text-sm font-semibold text-gray-500">No company reservations yet</p>
            <p className="text-xs text-gray-400">
              When tourists book your fleet vehicles, reservations will show here in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {companyBookings.map((b) => (
              <div
                key={b.id}
                className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      #{b.booking_number}
                    </span>
                    <BookingStatusBadge status={b.status} />
                  </div>
                  <h3 className="font-bold text-base text-gray-900">
                    {b.service_listings?.title || 'Vehicle Service'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {formatDate(b.booking_date)} • {formatTime(b.start_time)} ({b.duration_hours} hrs)
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-gray-900 block">
                    {formatCurrency(Number(b.total_amount))}
                  </span>
                  <span className="text-[10px] text-gray-400">Total Billed</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
