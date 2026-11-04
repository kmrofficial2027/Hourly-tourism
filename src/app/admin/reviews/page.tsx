'use client'

import React, { useState } from 'react'
import {
  Star,
  ShieldCheck,
  Check,
  X,
  MessageSquare,
  AlertTriangle,
  MapPin,
  Trash2,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { showToast } from '@/components/ui/Toast'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([
    {
      id: 'rev-01',
      author: 'Karthik Subramanian',
      serviceTitle: 'Royal Enfield Classic 350 — Western Ghats Explorer',
      rating: 5,
      circuit: 'Isha Adiyogi Sunset Circuit',
      comment:
        'Fantastic bike condition! Picked it up from Gandhipuram and rode to Isha Adiyogi and Marudhamalai. Smooth hourly pricing without having to pay for the whole day.',
      date: '2024-03-12',
      status: 'approved',
    },
    {
      id: 'rev-02',
      author: 'Ananya Ramachandran',
      serviceTitle: 'Force Urbania Luxury Van with Chauffeur',
      rating: 5,
      circuit: 'Siruvani Foothills & Eco Park',
      comment:
        'Booked for 4 hours for our family visit to Siruvani Dam and Noyyal river checkdams. Chauffeur Kumar was very courteous and punctual.',
      date: '2024-03-10',
      status: 'approved',
    },
    {
      id: 'rev-03',
      author: 'Deepak Raj',
      serviceTitle: 'Royal Enfield Himalayan 450 — Hill Adventure',
      rating: 3,
      circuit: 'Valparai 40 Hairpin Ghats',
      comment:
        'Good bike, but the helmet provided was slightly worn. The host was helpful in swapping it though.',
      date: '2024-03-08',
      status: 'flagged',
    },
  ])

  const handleAction = (id: string, action: 'approved' | 'hidden' | 'deleted') => {
    if (action === 'deleted') {
      setReviews((prev) => prev.filter((r) => r.id !== id))
      showToast.success('Review permanently removed')
    } else {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: action } : r))
      )
      showToast.success(`Review status updated to ${action}`)
    }
  }

  return (
    <DashboardLayout role="admin" title="Reviews & Moderation">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display">
            Customer Reviews & Content Moderation
          </h1>
          <p className="text-xs text-gray-500">
            Moderate tourist testimonials, investigate flagged feedback, and ensure quality standards.
          </p>
        </div>

        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-gray-900">{rev.author}</span>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-gray-400">{rev.date}</span>
                </div>

                <div className="text-xs font-semibold text-[#0a4d29]">
                  {rev.serviceTitle}{' '}
                  <span className="text-gray-400 font-normal">({rev.circuit})</span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>

                <div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      rev.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rev.status === 'flagged'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {rev.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {rev.status !== 'approved' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(rev.id, 'approved')}
                    className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Approve
                  </Button>
                )}
                {rev.status !== 'hidden' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(rev.id, 'hidden')}
                    className="text-xs text-gray-700 hover:bg-gray-100"
                  >
                    Hide
                  </Button>
                )}
                <button
                  onClick={() => handleAction(rev.id, 'deleted')}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

