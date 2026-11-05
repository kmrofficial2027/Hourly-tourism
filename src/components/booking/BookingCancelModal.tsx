'use client'

import React, { useState } from 'react'
import { AlertTriangle, Clock, RefreshCw, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { showToast } from '@/components/ui/Toast'
import { calculateRefundEstimate } from '@/lib/refundUtils'
import { formatCurrency } from '@/lib/utils'

export interface BookingCancelModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  bookingNumber: string
  bookingDate: string
  startTime: string
  totalAmount: number
  userRole?: 'customer' | 'provider' | 'admin'
  onSuccess: () => void
}

export function BookingCancelModal({
  isOpen,
  onClose,
  bookingId,
  bookingNumber,
  bookingDate,
  startTime,
  totalAmount,
  userRole = 'customer',
  onSuccess,
}: BookingCancelModalProps) {
  const [reasonCategory, setReasonCategory] = useState('change_of_plans')
  const [reasonDetails, setReasonDetails] = useState('')
  const [loading, setLoading] = useState(false)

  const estimate = calculateRefundEstimate(bookingDate, startTime, totalAmount, userRole)

  const customerReasonOptions = [
    { label: 'Change of travel plans', value: 'change_of_plans' },
    { label: 'Booked by mistake / wrong duration', value: 'mistake' },
    { label: 'Found alternate transport / guide', value: 'alternate_found' },
    { label: 'Host requested to cancel', value: 'host_requested' },
    { label: 'Weather or emergency issue', value: 'emergency' },
    { label: 'Other personal reason', value: 'other' },
  ]

  const providerReasonOptions = [
    { label: 'Vehicle breakdown or technical fault', value: 'vehicle_breakdown' },
    { label: 'Driver / Guide sudden illness', value: 'medical_emergency' },
    { label: 'Double booking / schedule conflict', value: 'schedule_conflict' },
    { label: 'Extreme weather or road block', value: 'weather' },
    { label: 'Customer unreachable / suspicious request', value: 'unreachable_customer' },
    { label: 'Other operational issue', value: 'other' },
  ]

  const reasons = userRole === 'provider' ? providerReasonOptions : customerReasonOptions

  const handleCancelBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reasonDetails.trim() && reasonCategory === 'other') {
      showToast.error('Please describe your cancellation reason in detail.')
      return
    }

    setLoading(true)
    const combinedReason = `${reasonCategory}: ${reasonDetails || 'Standard cancellation'}`
    const finalStatus =
      userRole === 'provider'
        ? 'cancelled_by_provider'
        : userRole === 'admin'
        ? 'cancelled_by_admin'
        : 'cancelled_by_customer'

    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: finalStatus,
          reason: combinedReason,
          refund_amount: estimate.refundAmount,
        }),
      })

      if (res.ok) {
        showToast.success(`Booking #${bookingNumber} cancelled successfully.`)
        onSuccess()
        onClose()
      } else {
        const data = await res.json().catch(() => ({}))
        showToast.error(data.error || 'Failed to cancel booking.')
      }
    } catch {
      showToast.error('Network error during cancellation.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Cancel Booking #${bookingNumber}`}>
      <form onSubmit={handleCancelBooking} className="space-y-5">
        {/* Policy & Refund Estimate Box */}
        <div
          className={`p-4 rounded-2xl border ${
            estimate.eligibleForRefund
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/10">
            <span className="text-xs font-bold uppercase tracking-wider">
              {userRole === 'provider' ? 'Host Cancellation Notice' : 'Refund Estimate'}
            </span>
            <span className="text-xs font-bold">
              {estimate.policyWindow}
            </span>
          </div>

          {userRole === 'customer' ? (
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <span className="text-[11px] text-gray-600 block">Total Paid:</span>
                <span className="text-sm font-black text-gray-900">{formatCurrency(totalAmount)}</span>
              </div>
              <div>
                <span className="text-[11px] text-emerald-800 font-bold block">Estimated Refund:</span>
                <span className="text-base font-black text-emerald-700">
                  {formatCurrency(estimate.refundAmount)} ({estimate.refundPercentage}%)
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-amber-900 mb-2 leading-relaxed">
              Cancelling a confirmed booking may affect your host punctuality rating and performance scorecard.
              The customer will receive a 100% full refund immediately.
            </p>
          )}

          <p className="text-[11px] text-gray-600 leading-relaxed">
            {estimate.notes}
          </p>
        </div>

        {/* Reason category */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Cancellation Reason <span className="text-red-500">*</span>
          </label>
          <select
            value={reasonCategory}
            onChange={(e) => setReasonCategory(e.target.value)}
            className="w-full text-xs p-3 rounded-2xl border border-gray-200 bg-white font-medium outline-none focus:ring-2 focus:ring-[#0a4d29]"
            required
          >
            {reasons.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Details textarea */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Additional Details & Explanation
          </label>
          <Textarea
            value={reasonDetails}
            onChange={(e) => setReasonDetails(e.target.value)}
            placeholder="Please provide additional context for this cancellation..."
            rows={3}
          />
        </div>

        {/* Action CTAs */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Keep Booking
          </Button>
          <Button
            type="submit"
            variant="danger"
            isLoading={loading}
            className="bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            Confirm Cancellation
          </Button>
        </div>
      </form>
    </Modal>
  )
}

