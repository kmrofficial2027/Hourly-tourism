import React from 'react'

export interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const sizeMap = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  }

  const getInitials = (n?: string | null) => {
    if (!n) return '?'
    const parts = n.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return n.slice(0, 2).toUpperCase()
  }

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`rounded-full object-cover border border-gray-200 ${sizeMap[size]} ${className}`}
      />
    )
  }

  return (
    <div
      className={`rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center justify-center border border-emerald-200 select-none ${sizeMap[size]} ${className}`}
    >
      {getInitials(name)}
    </div>
  )
}

