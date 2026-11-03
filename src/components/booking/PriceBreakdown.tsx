import React from 'react'
import { CURRENCY_SYMBOL } from '@/lib/constants'
import { Info } from 'lucide-react'

export interface PriceBreakdownProps {
  hourlyRate: number
  durationHours: number
  basePrice: number
  platformFee: number
  taxAmount?: number
  totalAmount: number
  packageName?: string
  className?: string
}

export function PriceBreakdown({
  hourlyRate,
  durationHours,
  basePrice,
  platformFee,
  taxAmount = 0,
  totalAmount,
  packageName,
  className = '',
}: PriceBreakdownProps) {
  return (
    <div className={`p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2.5 ${className}`}>
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
        Price Breakdown
      </h4>

      {packageName ? (
        <div className="flex justify-between text-xs text-gray-700">
          <span>
            {packageName} ({durationHours} hrs)
          </span>
          <span className="font-semibold">
            {CURRENCY_SYMBOL}{basePrice.toLocaleString('en-IN')}
          </span>
        </div>
      ) : (
        <div className="flex justify-between text-xs text-gray-700">
          <span>
            {CURRENCY_SYMBOL}{hourlyRate.toLocaleString('en-IN')} × {durationHours}{' '}
            {durationHours === 1 ? 'hour' : 'hours'}
          </span>
          <span className="font-semibold">
            {CURRENCY_SYMBOL}{basePrice.toLocaleString('en-IN')}
          </span>
        </div>
      )}

      <div className="flex justify-between text-xs text-gray-600">
        <span className="flex items-center">
          Platform service fee
          <span className="ml-1 text-gray-400 cursor-help" title="Standard platform fee for support and verification">
            <Info className="w-3 h-3" />
          </span>
        </span>
        <span className="font-semibold">
          {CURRENCY_SYMBOL}{platformFee.toLocaleString('en-IN')}
        </span>
      </div>

      {taxAmount > 0 && (
        <div className="flex justify-between text-xs text-gray-600">
          <span>GST / Taxes</span>
          <span className="font-semibold">
            {CURRENCY_SYMBOL}{taxAmount.toLocaleString('en-IN')}
          </span>
        </div>
      )}

      <div className="pt-2.5 border-t border-gray-200 flex justify-between items-baseline">
        <span className="text-sm font-bold text-gray-900">Total Booking Price</span>
        <span className="text-xl font-black text-[#0a4d29]">
          {CURRENCY_SYMBOL}{totalAmount.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  )
}

