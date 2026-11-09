'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export interface LogoProps {
  variant?: 'header' | 'footer' | 'hero' | 'compact' | 'icon'
  showTagline?: boolean
  className?: string
  href?: string
}

export function Logo({
  variant = 'header',
  showTagline = false,
  className = '',
  href = '/',
}: LogoProps) {
  // Dimension and styling classes based on variant (tuned for clear, prominent visibility)
  const getVariantStyles = () => {
    switch (variant) {
      case 'header':
        return {
          container: 'flex flex-col items-center justify-center text-center',
          image: 'h-10 sm:h-12 lg:h-14 w-auto object-contain',
        }
      case 'footer':
        return {
          container: 'flex flex-col items-start justify-center',
          image: 'h-16 sm:h-20 w-auto object-contain',
        }
      case 'hero':
        return {
          container: 'flex flex-col items-center justify-center',
          image: 'h-24 sm:h-32 md:h-38 w-auto object-contain drop-shadow-md',
        }
      case 'compact':
        return {
          container: 'flex flex-col items-center justify-center',
          image: 'h-10 sm:h-12 lg:h-14 w-auto object-contain',
        }
      case 'icon':
        return {
          container: 'w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center bg-white shadow-sm border border-emerald-100',
          image: 'w-full h-full object-cover scale-125',
        }
      default:
        return {
          container: 'flex flex-col items-center justify-center text-center',
          image: 'h-10 sm:h-12 lg:h-14 w-auto object-contain',
        }
    }
  }

  const { container, image } = getVariantStyles()

  const content = (
    <div className={`group transition-transform ${container} ${className}`}>
      {/* Real Brand Logo Image */}
      <div className="relative flex items-center justify-center">
        <img
          src="/images/logo.png"
          alt="Hourly Tourism — Discover More. One Hour at a Time."
          className={`${image} transition-all duration-300 group-hover:scale-105`}
        />
      </div>

      {showTagline && (
        <span className="hidden md:block text-[9px] lg:text-[10px] font-bold text-[#ff7a00] tracking-wider uppercase mt-1 leading-none whitespace-nowrap">
          Discover More. One Hour at a Time.
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    )
  }

  return content
}

