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
          container: 'h-16 sm:h-20 lg:h-24 flex items-center',
          image: 'h-14 sm:h-18 lg:h-22 xl:h-24 w-auto object-contain',
        }
      case 'footer':
        return {
          container: 'h-20 sm:h-24 flex items-center',
          image: 'h-18 sm:h-22 w-auto object-contain',
        }
      case 'hero':
        return {
          container: 'h-28 sm:h-36 md:h-44 flex items-center justify-center',
          image: 'h-26 sm:h-32 md:h-40 w-auto object-contain drop-shadow-md',
        }
      case 'compact':
        return {
          container: 'h-14 sm:h-16 lg:h-18 flex items-center',
          image: 'h-13 sm:h-15 lg:h-17 w-auto object-contain',
        }
      case 'icon':
        return {
          container: 'w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center bg-white shadow-sm border border-emerald-100',
          image: 'w-full h-full object-cover scale-125',
        }
      default:
        return {
          container: 'h-16 sm:h-20 lg:h-24 flex items-center',
          image: 'h-14 sm:h-18 lg:h-22 xl:h-24 w-auto object-contain',
        }
    }
  }

  const { container, image } = getVariantStyles()

  const content = (
    <div className={`flex items-center space-x-2.5 group transition-transform ${container} ${className}`}>
      {/* Real Brand Logo Image */}
      <div className="relative flex items-center justify-center">
        <img
          src="/images/logo.png"
          alt="Hourly Tourism — Discover More. One Hour at a Time."
          className={`${image} transition-all duration-300 group-hover:scale-105`}
        />
      </div>

      {showTagline && (
        <span className="hidden md:inline-block text-[11px] font-semibold text-[#ff7a00] tracking-wide pl-2 border-l border-orange-200">
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

