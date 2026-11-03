'use client'

import React, { useState } from 'react'
import { Star } from 'lucide-react'

export interface RatingProps {
  value: number
  onChange?: (value: number) => void
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  count?: number
  className?: string
}

export function Rating({
  value,
  onChange,
  readOnly = true,
  size = 'md',
  showCount = false,
  count,
  className = '',
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  }

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const activeVal = hoverValue !== null ? hoverValue : value

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = activeVal >= star
          const isHalf = !isFilled && activeVal >= star - 0.5

          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => onChange?.(star)}
              onMouseEnter={() => !readOnly && setHoverValue(star)}
              onMouseLeave={() => !readOnly && setHoverValue(null)}
              className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                    ? 'fill-amber-200 text-amber-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          )
        })}
      </div>

      <span className={`font-semibold text-gray-800 ml-1 ${textSize[size]}`}>
        {value > 0 ? value.toFixed(1) : 'New'}
      </span>

      {showCount && count !== undefined && (
        <span className={`text-gray-500 ${textSize[size]}`}>({count})</span>
      )}
    </div>
  )
}

