import React from 'react'
import { Loader2 } from 'lucide-react'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'gray'
  className?: string
  text?: string
}

export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className = '',
  text,
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  }

  const colorMap = {
    primary: 'text-primary-600',
    white: 'text-white',
    gray: 'text-gray-400',
  }

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <Loader2 className={`animate-spin ${sizeMap[size]} ${colorMap[color]}`} />
      {text && <p className="mt-3 text-sm font-medium text-gray-500">{text}</p>}
    </div>
  )
}

export function FullPageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

