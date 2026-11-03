import React from 'react'

const cardVariants = {
  default: 'bg-white rounded-xl shadow-sm',
  bordered: 'bg-white rounded-xl border border-gray-200',
  elevated: 'bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300',
} as const

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof cardVariants
}

export function Card({
  variant = 'default',
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div className={`${cardVariants[variant]} ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-5 py-4 border-b border-gray-100 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardContent({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-5 py-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`px-5 py-4 border-t border-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
