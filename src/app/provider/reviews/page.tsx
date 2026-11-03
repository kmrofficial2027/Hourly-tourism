'use client'

import React, { useState } from 'react'
import { Star, MessageCircle, Send } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Rating } from '@/components/ui/Rating'
import { showToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'

export default function ProviderReviewsPage() {
  const [reviews, setReviews] = useState([
    {
      id: 'rev-01',
      rating: 5,
      customerName: 'Rahul Sen',
      reviewText:
        'Incredible bike in mint condition! Smooth engine and the helmet was squeaky clean. Booked for 4 hours and explored Vagator and Chapora.',
      date: '2024-03-15',
      response: 'Thank you for riding with us! Hope to see you again next season.',
    },
    {
      id: 'rev-02',
      rating: 5,
      customerName: 'Priya Nambiar',
      reviewText:
        'Hourly pricing saved me money. Pickup was fast and painless, took less than 3 minutes to verify my license.',
      date: '2024-03-10',
      response: null,
    },
  ])

  const [replyText, setReplyText] = useState('')
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return
    setReviews(
      reviews.map((r) =>
        r.id === reviewId ? { ...r, response: replyText.trim() } : r
      )
    )
    setActiveReplyId(null)
    setReplyText('')
    showToast.success('Response posted successfully')
  }

  return (
    <DashboardLayout role="provider" title="Customer Reviews & Ratings">
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display">
            Customer Reviews
          </h1>
          <p className="text-xs text-gray-500">
            Read verified feedback from tourists and respond to reviews.
          </p>
        </div>

        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{r.customerName}</h4>
                  <p className="text-xs text-gray-400">{r.date}</p>
                </div>
                <Rating value={r.rating} size="sm" />
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">{r.reviewText}</p>

              {r.response ? (
                <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs text-gray-700">
                  <span className="font-bold text-emerald-800 block mb-1">Your Response:</span>
                  <p>{r.response}</p>
                </div>
              ) : activeReplyId === r.id ? (
                <div className="pt-2 space-y-2">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a polite response thanking the guest..."
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex items-center space-x-2 justify-end">
                    <Button variant="secondary" size="sm" onClick={() => setActiveReplyId(null)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleSendReply(r.id)}>
                      Post Reply
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    onClick={() => setActiveReplyId(r.id)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center"
                  >
                    <MessageCircle className="w-3.5 h-3.5 mr-1" />
                    Respond to Review
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

