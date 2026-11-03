'use client'

import React from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'

export interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
  minDate?: string
  maxDate?: string
  error?: string
  helperText?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  value,
  onChange,
  label,
  minDate,
  maxDate,
  error,
  helperText,
  disabled = false,
  className = '',
}: DatePickerProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <CalendarIcon className="w-5 h-5" />
        </div>
        <input
          type="date"
          value={value}
          min={minDate}
          max={maxDate}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-gray-900 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:border-primary-500'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : ''}`}
        />
      </div>

      {error && <p className="text-xs text-red-600 font-medium mt-1.5">{error}</p>}
      {helperText && !error && <p className="text-xs text-gray-400 mt-1.5">{helperText}</p>}
    </div>
  )
}

