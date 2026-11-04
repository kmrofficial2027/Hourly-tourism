'use client'

import React, { useState, useEffect } from 'react'
import { Star, Check, X, MessageSquare, Trash2, RefreshCw } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { showToast } from '@/components/ui/Toast'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reviews')
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadReviews() }, [])

  const handleAction = async (id: string, action: 'approved' | 'hidden' | 'deleted') => {
    if (action === 'deleted') {
      try {
        await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' })
        setReviews((prev) => prev.filter((r) => r.id !== id))
        showToast.success('Review permanently removed')
      } catch {
        showToast.error('Delete failed')
      }
    } else {
      try {
        await fetch('/api/reviews', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: action }),
        })
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: action } : r)))
        showToast.success(`Review status updated to ${action}`)
      } catch {
        showToast.error('Update failed')
      }
    }
  }

  return (
    <DashboardLayout role="admin" title="Reviews & Moderation">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-display">
              Customer Reviews & Content Moderation
            </h1>
            <p className="text-xs text-gray-500">
              Moderate tourist testimonials, investigate flagged feedback, and ensure quality standards.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadReviews} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <MessageSquare className="w-10 h-10 text-gray-200 mx-auto" />
            <p className="text-sm font-semibold text-gray-500">No reviews yet</p>
            <p className="text-xs text-gray-400">
              Customer reviews submitted after bookings will appear here for moderation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-gray-900">
                      {rev.reviewer_name || rev.profiles?.full_name || 'Anonymous'}
                    </span>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString('en-IN') : '—'}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-[#0a4d29]">
                    {rev.service_listings?.title || rev.service_title || 'Service Review'}
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed italic">"{rev.comment || rev.review_text}"</p>

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
                      {rev.status || 'pending'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {rev.status !== 'approved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction(rev.id, 'approved')}
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
        )}
      </div>
    </DashboardLayout>
  )
}
