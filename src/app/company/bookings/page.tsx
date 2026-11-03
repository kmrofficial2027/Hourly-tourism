'use client'

import React from 'react'
import { Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge'
import { formatCurrency } from '@/lib/utils'

export default function CompanyBookingsPage() {
  const companyBookings = [
    {
      id: 'cb-01',
      bookingNumber: 'HT-2024-000412',
      service: 'Force Urbania 9-Seater Luxury Van',
      customer: 'Sanjay Deshmukh',
      date: '2024-03-22',
      time: '09:00 - 15:00 (6 hrs)',
      city: 'Goa',
      amount: 5994,
      status: 'confirmed',
    },
    {
      id: 'cb-02',
      bookingNumber: 'HT-2024-000415',
      service: 'Innova Crysta 7-Seater Chauffeur',
      customer: 'Kavita Reddy',
      date: '2024-03-24',
      time: '14:00 - 18:00 (4 hrs)',
      city: 'Mumbai',
      amount: 2796,
      status: 'paid',
    },
  ]

  return (
    <DashboardLayout role="company" title="Company Bookings Calendar">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display">
            Company Wide Reservations
          </h1>
          <p className="text-xs text-gray-500">
            Monitor all assigned vehicle and tour bookings across your enterprise.
          </p>
        </div>

        <div className="space-y-4">
          {companyBookings.map((b) => (
            <div
              key={b.id}
              className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    #{b.bookingNumber}
                  </span>
                  <BookingStatusBadge status={b.status} />
                </div>
                <h3 className="font-bold text-base text-gray-900">{b.service}</h3>
                <p className="text-xs text-gray-500">
                  {b.date} • {b.time} • Guest: {b.customer} ({b.city})
                </p>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-gray-900 block">
                  {formatCurrency(b.amount)}
                </span>
                <span className="text-[10px] text-gray-400">Total Billed</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

