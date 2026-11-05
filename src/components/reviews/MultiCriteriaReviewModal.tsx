'use client'

import React, { useState } from 'react'
import {
  Star,
  CheckCircle2,
  Sparkles,
  Camera,
  Send,
  Clock,
  Car,
  UserCheck,
  Tag,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { showToast } from '@/components/ui/Toast'

export interface MultiCriteriaReviewModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  listingId: string
  serviceTitle: string
  onReviewSubmitted?: () => void
}

export function MultiCriteriaReviewModal({
  isOpen,
  onClose,
  bookingId,
  listingId,
  serviceTitle,
  onReviewSubmitted,
}: MultiCriteriaReviewModalProps) {
  // 4 Criteria Scores (1 to 5)
  const [punctuality, setPunctuality] = useState(5)
  const [cleanliness, setCleanliness] = useState(5)
  const [professionalism, setProfessionalism] = useState(5)
  const [valueForMoney, setValueForMoney] = useState(5)

  const [comment, setComment] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const overallRating = Number(
    ((punctuality + cleanliness + professionalism + valueForMoney) / 4).toFixed(1)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) {
      showToast.error('Please write a brief review of your experience')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          listingId,
          rating: overallRating,
          punctuality,
          cleanliness,
          professionalism,
          valueForMoney,
          comment: comment.trim(),
          photoUrl: photoUrl.trim() || null,
        }),
      })

      if (res.ok) {
        showToast.success('Thank you! Your verified review has been published.')
        if (onReviewSubmitted) onReviewSubmitted()
        onClose()
      } else {
        const data = await res.json()
        showToast.error(data.error || 'Failed to submit review')
      }
    } catch (err: any) {
      showToast.error(err.message || 'Error submitting review')
    } finally {
      setSubmitting(false)
    }
  }

  // Star Rating Picker Row
  const renderStarPicker = (
    label: string,
    value: number,
    onChange: (val: number) => void,
    icon: React.ReactNode
  ) => (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
      <div className="flex items-center space-x-2 text-xs font-bold text-gray-700">
        <span className="text-[#ff7a00]">{icon}</span>
        <span>{label}</span>
      </div>

      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 text-gray-300 hover:text-amber-400 focus:outline-none transition-colors"
          >
            <Star
              className={`w-4 h-4 ${
                star <= value ? 'text-amber-500 fill-amber-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="text-xs font-black text-gray-900 w-5 text-right ml-1">{value}</span>
      </div>
    </div>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rate & Review Your Hourly Trip">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            Trip Experience
          </span>
          <h3 className="text-sm font-black text-gray-900">{serviceTitle}</h3>
        </div>

        {/* Overall Score Badge */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-900 block">Overall Score</span>
            <span className="text-[10px] text-amber-700">Calculated average of 4 quality criteria</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span className="text-xl font-black text-gray-900 font-display">
              {overallRating} <span className="text-xs font-normal text-gray-400">/ 5.0</span>
            </span>
          </div>
        </div>

        {/* 4 Criteria Star Pickers */}
        <div className="space-y-2">
          {renderStarPicker('Punctuality & Arrival Time', punctuality, setPunctuality, <Clock className="w-4 h-4" />)}
          {renderStarPicker('Vehicle Condition & Cleanliness', cleanliness, setCleanliness, <Car className="w-4 h-4" />)}
          {renderStarPicker('Driver Professionalism & Manners', professionalism, setProfessionalism, <UserCheck className="w-4 h-4" />)}
          {renderStarPicker('Value for Hourly Money', valueForMoney, setValueForMoney, <Tag className="w-4 h-4" />)}
        </div>

        {/* Written Review */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Written Experience Review <span className="text-red-500">*</span>
          </label>
          <Textarea
            placeholder="Share details of your route, vehicle comfort, driver assistance, or spots visited..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            required
          />
        </div>

        {/* Optional Photo Attachment */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Photo URL (Optional Trip Snapshot)
          </label>
          <Input
            placeholder="https://example.com/trip-photo.jpg"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={submitting} className="font-bold">
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Publish Verified Review
          </Button>
        </div>
      </form>
    </Modal>
  )
}

