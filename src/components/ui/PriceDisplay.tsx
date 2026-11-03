import React from 'react'
import { CURRENCY_SYMBOL } from '@/lib/constants'

export interface PriceDisplayProps {
  amount: number
  unit?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  originalAmount?: number
  className?: string
}

export function PriceDisplay({
  amount,
  unit = '/ hour',
  size = 'md',
  originalAmount,
  className = '',
}: PriceDisplayProps) {
  const sizeClasses = {
    sm: 'text-base font-semibold',
    md: 'text-xl font-bold',
    lg: 'text-2xl font-extrabold',
    xl: 'text-3xl font-black',
  }

  const unitSizeClasses = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
  }

  return (
    <div className={`flex items-baseline space-x-1.5 ${className}`}>
      {originalAmount && originalAmount > amount && (
        <span className="line-through text-gray-400 text-sm font-medium mr-1">
          {CURRENCY_SYMBOL}{originalAmount.toLocaleString('en-IN')}
        </span>
      )}
      <span className={`text-emerald-700 tracking-tight ${sizeClasses[size]}`}>
        {CURRENCY_SYMBOL}{amount.toLocaleString('en-IN')}
      </span>
      {unit && (
        <span className={`text-gray-500 font-medium ${unitSizeClasses[size]}`}>
          {unit}
        </span>
      )}
    </div>
  )
}

