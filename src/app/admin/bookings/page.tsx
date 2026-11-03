'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, CreditCard, Download, ShieldAlert } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBookings() {
      setLoading(true)
      try {
        const res = await fetch('/api/bookings')
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
    loadBookings()
  }, [])

  return (
    <DashboardLayout role="admin" title="Platform Bookings & Escrow">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display">
            All Marketplace Bookings
          </h1>
          <p className="text-xs text-gray-500">
            Audit transactions, review cancellation disputes, and oversee refunds.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Booking #</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Schedule</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Platform Fee</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      No active bookings in database currently.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-4 font-mono font-bold text-emerald-800">
                        #{b.booking_number}
                      </td>
                      <td className="p-4 font-bold text-gray-900">
                        {b.service_listings?.title || 'Hourly Experience'}
                      </td>
                      <td className="p-4">
                        {formatDate(b.booking_date)} at {formatTime(b.start_time)}
                      </td>
                      <td className="p-4">{b.duration_hours} hrs</td>
                      <td className="p-4 font-black text-gray-900">
                        {formatCurrency(Number(b.total_amount))}
                      </td>
                      <td className="p-4 font-bold text-emerald-600">
                        {formatCurrency(Number(b.platform_fee))}
                      </td>
                      <td className="p-4">
                        <BookingStatusBadge status={b.status} />
                      </td>
                      <td className="p-4 text-right font-bold uppercase text-[10px]">
                        {b.payment_status}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

