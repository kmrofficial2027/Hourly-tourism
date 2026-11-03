import React from 'react'
import type { BookingStatus } from '@/types'

export interface BookingStatusBadgeProps {
  status: BookingStatus | string
  className?: string
}

export function BookingStatusBadge({ status, className = '' }: BookingStatusBadgeProps) {
  const statusStyles: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    pending: {
      label: 'Pending',
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-800',
      dot: 'bg-amber-400',
    },
    awaiting_confirmation: {
      label: 'Awaiting Host',
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      dot: 'bg-blue-500',
    },
    confirmed: {
      label: 'Confirmed',
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-800',
      dot: 'bg-emerald-500',
    },
    provider_accepted: {
      label: 'Accepted by Host',
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-800',
      dot: 'bg-emerald-500',
    },
    payment_pending: {
      label: 'Payment Pending',
      bg: 'bg-orange-50 border-orange-200',
      text: 'text-orange-800',
      dot: 'bg-orange-500',
    },
    paid: {
      label: 'Paid',
      bg: 'bg-emerald-100 border-emerald-300',
      text: 'text-emerald-900',
      dot: 'bg-emerald-600',
    },
    in_progress: {
      label: 'In Progress',
      bg: 'bg-purple-50 border-purple-200',
      text: 'text-purple-800',
      dot: 'bg-purple-500 animate-pulse',
    },
    completed: {
      label: 'Completed',
      bg: 'bg-gray-100 border-gray-200',
      text: 'text-gray-800',
      dot: 'bg-gray-400',
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      dot: 'bg-red-500',
    },
    cancelled_by_customer: {
      label: 'Cancelled by Customer',
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      dot: 'bg-red-500',
    },
    cancelled_by_provider: {
      label: 'Cancelled by Host',
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      dot: 'bg-red-500',
    },
    cancelled_by_admin: {
      label: 'Cancelled by Admin',
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      dot: 'bg-red-500',
    },
    rejected: {
      label: 'Rejected',
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      dot: 'bg-red-500',
    },
    provider_rejected: {
      label: 'Rejected by Host',
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      dot: 'bg-red-500',
    },
    refund_pending: {
      label: 'Refund Pending',
      bg: 'bg-indigo-50 border-indigo-200',
      text: 'text-indigo-800',
      dot: 'bg-indigo-500',
    },
    refund_initiated: {
      label: 'Refund Initiated',
      bg: 'bg-indigo-50 border-indigo-200',
      text: 'text-indigo-800',
      dot: 'bg-indigo-500',
    },
    refunded: {
      label: 'Refunded',
      bg: 'bg-indigo-100 border-indigo-300',
      text: 'text-indigo-900',
      dot: 'bg-indigo-600',
    },
  }

  const current = statusStyles[status] || {
    label: String(status).replace(/_/g, ' '),
    bg: 'bg-gray-100 border-gray-200',
    text: 'text-gray-700',
    dot: 'bg-gray-400',
  }

  return (
    <span
      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${current.bg} ${current.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <span>{current.label}</span>
    </span>
  )
}

