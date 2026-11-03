'use client'

import React, { useState, useCallback } from 'react'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  showCharCount?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      showCharCount = false,
      maxLength,
      className = '',
      id,
      onChange,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const [charCount, setCharCount] = useState(
      () => String(value || defaultValue || '').length
    )

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCharCount(e.target.value.length)
        onChange?.(e)
      },
      [onChange]
    )

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={`
            block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900
            placeholder:text-gray-400 resize-y min-h-[80px]
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
            }
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
          }
          {...props}
        />
        <div className="flex justify-between mt-1.5">
          <div>
            {error && (
              <p id={`${textareaId}-error`} className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {!error && helperText && (
              <p id={`${textareaId}-helper`} className="text-sm text-gray-500">
                {helperText}
              </p>
            )}
          </div>
          {showCharCount && (
            <p className="text-sm text-gray-400">
              {charCount}
              {maxLength ? `/${maxLength}` : ''}
            </p>
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
