import React from 'react'

const badgeVariants = {
  success: 'bg-green-50 text-[#15803d] ring-green-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  info: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  neutral: 'bg-gray-50 text-gray-700 ring-gray-600/20',
  primary: 'bg-green-50 text-[#0a4d29] ring-green-600/20',
  accent: 'bg-orange-50 text-[#ff7a00] ring-orange-500/30',
} as const

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants
}

export function Badge({
  variant = 'neutral',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full px-2.5 py-0.5
        text-xs font-semibold ring-1 ring-inset
        ${badgeVariants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  )
}
