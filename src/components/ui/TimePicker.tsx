'use client'

import React from 'react'
import { Clock } from 'lucide-react'

export interface TimePickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
  minTime?: string
  maxTime?: string
  stepMinutes?: number
  error?: string
  helperText?: string
  disabled?: boolean
  className?: string
}

export function TimePicker({
  value,
  onChange,
  label,
  minTime = '06:00',
  maxTime = '22:00',
  stepMinutes = 30,
  error,
  helperText,
  disabled = false,
  className = '',
}: TimePickerProps) {
  // Generate time options
  const generateOptions = () => {
    const options: { label: string; value: string }[] = []
    const [minH, minM] = minTime.split(':').map(Number)
    const [maxH, maxM] = maxTime.split(':').map(Number)

    let current = minH * 60 + minM
    const end = maxH * 60 + maxM

    while (current <= end) {
      const h = Math.floor(current / 60)
      const m = current % 60
      const hStr = h.toString().padStart(2, '0')
      const mStr = m.toString().padStart(2, '0')
      const timeVal = `${hStr}:${mStr}`

      const ampm = h >= 12 ? 'PM' : 'AM'
      const h12 = h % 12 || 12
      const timeLabel = `${h12}:${mStr} ${ampm}`

      options.push({ label: timeLabel, value: timeVal })
      current += stepMinutes
    }

    return options
  }

  const options = generateOptions()

  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Clock className="w-5 h-5" />
        </div>
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full pl-11 pr-10 py-3 bg-white border rounded-xl text-gray-900 text-sm appearance-none transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:border-primary-500'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : ''}`}
        >
          <option value="" disabled>
            Select time
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
          ▼
        </div>
      </div>

      {error && <p className="text-xs text-red-600 font-medium mt-1.5">{error}</p>}
      {helperText && !error && <p className="text-xs text-gray-400 mt-1.5">{helperText}</p>}
    </div>
  )
}

