import React from 'react'
import { Button } from './Button'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionHref?: string
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 ${className}`}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 text-3xl shadow-sm">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {actionLabel && (
        <>
          {actionHref ? (
            <a href={actionHref}>
              <Button variant="primary">{actionLabel}</Button>
            </a>
          ) : onAction ? (
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : null}
        </>
      )}
    </div>
  )
}

