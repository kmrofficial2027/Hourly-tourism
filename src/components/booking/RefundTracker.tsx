'use client'

import React from 'react'
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export interface RefundTrackerProps {
  refundStatus: 'not_required' | 'initiated' | 'processing' | 'completed' | 'failed' | 'rejected'
  refundAmount?: number
  refundMethod?: string
  refundReferenceId?: string
  refundRequestedAt?: string
  refundCompletedAt?: string
  expectedCompletionDate?: string
  cancellationReason?: string
  className?: string
}

export function RefundTracker({
  refundStatus,
  refundAmount = 0,
  refundMethod = 'Original Payment Method (UPI / Card)',
  refundReferenceId,
  refundRequestedAt,
  refundCompletedAt,
  expectedCompletionDate,
  cancellationReason,
  className = '',
}: RefundTrackerProps) {
  if (refundStatus === 'not_required') return null

  const steps = [
    {
      id: 'requested',
      label: 'Refund Requested',
      description: refundRequestedAt ? formatDate(refundRequestedAt) : 'Booking cancelled',
      completed: ['initiated', 'processing', 'completed'].includes(refundStatus),
      current: refundStatus === 'initiated',
    },
    {
      id: 'initiated',
      label: 'Gateway Initiated',
      description: 'Submitted to banking gateway',
      completed: ['processing', 'completed'].includes(refundStatus),
      current: refundStatus === 'processing',
    },
    {
      id: 'processing',
      label: 'Bank Processing',
      description: 'Acquiring bank verifying transaction',
      completed: refundStatus === 'completed',
      current: refundStatus === 'processing',
    },
    {
      id: 'completed',
      label: 'Credit Settled',
      description: refundCompletedAt
        ? formatDate(refundCompletedAt)
        : expectedCompletionDate
        ? `Est. by ${formatDate(expectedCompletionDate)}`
        : '2-4 business days',
      completed: refundStatus === 'completed',
      current: false,
    },
  ]

  const isFailed = refundStatus === 'failed' || refundStatus === 'rejected'

  return (
    <div className={`p-6 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-black text-gray-900 font-display">Refund Tracker</h3>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  refundStatus === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : isFailed
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800 animate-pulse'
                }`}
              >
                {refundStatus === 'completed'
                  ? 'Processed'
                  : isFailed
                  ? 'Failed / Disputed'
                  : 'In Progress'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Direct refund to {refundMethod}
            </p>
          </div>
        </div>

        <div className="text-right sm:text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            Refund Amount
          </span>
          <span className="text-2xl font-black text-emerald-700 font-display">
            {formatCurrency(refundAmount)}
          </span>
        </div>
      </div>

      {cancellationReason && (
        <div className="p-3 bg-gray-50 rounded-2xl text-xs text-gray-600">
          <span className="font-bold text-gray-800">Reason: </span>
          {cancellationReason}
        </div>
      )}

      {/* Progress Timeline */}
      <div className="relative pt-2 pb-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2">
          {steps.map((step, idx) => (
            <div key={step.id} className="relative flex flex-col items-start space-y-1.5">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step.completed
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : step.current
                      ? 'bg-[#ff7a00] text-white animate-pulse'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  className={`text-xs font-bold truncate ${
                    step.completed
                      ? 'text-emerald-900'
                      : step.current
                      ? 'text-orange-600'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 pl-9 sm:pl-0">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Reference & Banking Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl text-xs">
        <div>
          <span className="text-gray-400 block text-[10px] uppercase font-bold">ARN / Reference ID</span>
          <span className="font-mono font-bold text-gray-800">
            {refundReferenceId || `REF-${Math.floor(10000000 + Math.random() * 90000000)}`}
          </span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px] uppercase font-bold">Estimated Settlement</span>
          <span className="font-semibold text-gray-800">
            {expectedCompletionDate ? formatDate(expectedCompletionDate) : 'Within 48 hours'}
          </span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px] uppercase font-bold">Support Guarantee</span>
          <span className="font-semibold text-emerald-700 flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            100% Escrow Protected
          </span>
        </div>
      </div>
    </div>
  )
}

