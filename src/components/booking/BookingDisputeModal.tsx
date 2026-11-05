'use client'

import React, { useState } from 'react'
import { AlertCircle, ShieldAlert, Upload, Check } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { showToast } from '@/components/ui/Toast'

export interface BookingDisputeModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  bookingNumber: string
  userRole?: 'customer' | 'provider'
  onSuccess: () => void
}

export function BookingDisputeModal({
  isOpen,
  onClose,
  bookingId,
  bookingNumber,
  userRole = 'customer',
  onSuccess,
}: BookingDisputeModalProps) {
  const [category, setCategory] = useState<string>('late_pickup')
  const [description, setDescription] = useState('')
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const disputeCategories = [
    { value: 'late_pickup', label: 'Late Pickup / Major Delay' },
    { value: 'wrong_vehicle', label: 'Vehicle or Model Mismatch / Poor Condition' },
    { value: 'damage_claim', label: 'Vehicle Damage / Extra Fee Disagreement' },
    { value: 'unfair_cancellation', label: 'Host / Customer Unfair Cancellation' },
    { value: 'safety_behavior', label: 'Safety, Conduct, or Rude Behavior' },
    { value: 'refund_issue', label: 'Refund or Payment Calculation Issue' },
    { value: 'other', label: 'Other Operational Issue' },
  ]

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      showToast.error('Please describe the issue in detail.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          description: description.trim(),
          evidenceUrls: evidenceUrl.trim() ? [evidenceUrl.trim()] : [],
        }),
      })

      if (res.ok) {
        showToast.success('Dispute case created. A platform mediator will review within 12-24 hours.')
        onSuccess()
        onClose()
      } else {
        const data = await res.json().catch(() => ({}))
        showToast.error(data.error || 'Failed to file dispute.')
      }
    } catch {
      showToast.error('Network error filing dispute.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`File Dispute • Booking #${bookingNumber}`}>
      <form onSubmit={handleSubmitDispute} className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
          <p className="font-bold flex items-center mb-1">
            <ShieldAlert className="w-4 h-4 mr-1.5 text-amber-600" />
            Platform Mediation & Evidence Review
          </p>
          Disputes are independently reviewed by Hourly Tourism operations. Both sides are given the opportunity to present facts, chat transcripts, and photos.
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Dispute Category <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full text-xs p-3 rounded-2xl border border-gray-200 bg-white font-medium outline-none"
            required
          >
            {disputeCategories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Detailed Explanation & Facts <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain what happened, including exact times, landmarks, and what resolution you expect..."
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Photo / Document Evidence Link (Optional)
          </label>
          <Input
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            placeholder="https://drive.google.com/... or image URL"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading} className="bg-amber-600 hover:bg-amber-700 font-bold">
            Submit Dispute for Mediation
          </Button>
        </div>
      </form>
    </Modal>
  )
}

