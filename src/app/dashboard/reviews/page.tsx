'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Star } from 'lucide-react'

export default function CustomerReviewsPage() {
  return (
    <DashboardLayout role="customer" title="My Reviews & Ratings">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center max-w-2xl mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
          <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 font-display">Your Verified Reviews</h2>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Reviews can be submitted directly from the{' '}
          <a href="/dashboard/bookings" className="text-emerald-700 font-bold underline">
            My Bookings
          </a>{' '}
          tab once any hourly trip is completed.
        </p>
      </div>
    </DashboardLayout>
  )
}

