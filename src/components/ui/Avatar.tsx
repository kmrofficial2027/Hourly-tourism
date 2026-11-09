'use client'

import React, { useState } from 'react'
import { getDefaultAvatar } from '@/lib/constants'

export interface AvatarProps {
  src?: string | null
  name?: string | null
  role?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ src, name, role, size = 'md', className = '' }: AvatarProps) {
  const [imgError, setImgError] = useState(false)

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

  // If no custom src, use Guy Tourist or Guy Provider avatar
  const effectiveSrc = !imgError ? (src || getDefaultAvatar(role)) : null

  if (effectiveSrc) {
    return (
      <img
        src={effectiveSrc}
        alt={name || `${role || 'User'} Avatar`}
        onError={() => setImgError(true)}
        className={`rounded-full object-cover border border-gray-200 shadow-xs ${sizeMap[size]} ${className}`}
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

