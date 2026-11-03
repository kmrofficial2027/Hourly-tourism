'use client'

import React, { useState } from 'react'
import { Rating } from '@/components/ui/Rating'
import { Button } from '@/components/ui/Button'
import { showToast } from '@/components/ui/Toast'

export interface ReviewFormProps {
  bookingId: string
  listingId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ReviewForm({
  bookingId,
  listingId,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState<number>(5)
  const [reviewText, setReviewText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (reviewText.trim().length < 10) {
      setError('Please provide at least 10 characters describing your experience.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          listingId,
          rating,
          reviewText: reviewText.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      showToast.success('Thank you! Your review has been published.')
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Error submitting review')
      showToast.error(err.message || 'Error submitting review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
      <div>
        <h3 className="text-base font-bold text-gray-900">Rate your experience</h3>
        <p className="text-xs text-gray-500">
          How was your hourly service? Your feedback helps fellow travelers.
        </p>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
          Your Rating
        </label>
        <Rating
          value={rating}
          onChange={(newVal) => setRating(newVal)}
          readOnly={false}
          size="lg"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
          Review Details
        </label>
        <textarea
          rows={4}
          required
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share details of your hourly trip, guide punctuality, vehicle cleanliness, or favorite highlights..."
          className="w-full p-3 text-sm rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="flex justify-between text-[11px] text-gray-400 mt-1">
          <span>Minimum 10 characters</span>
          <span>{reviewText.length} characters</span>
        </div>
      </div>

      {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

      <div className="flex items-center space-x-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          className="flex-1"
        >
          Submit Review
        </Button>
      </div>
    </form>
  )
}

