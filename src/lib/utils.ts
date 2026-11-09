import type { BookingStatus, PriceCalculation } from '@/types'
import {
  CURRENCY_SYMBOL,
  PLATFORM_FEE_PERCENTAGE,
  BOOKING_STATUS_LABEL_MAP,
  BOOKING_STATUS_COLOR_MAP,
} from '@/lib/constants'

// ============================================================================
// Formatting
// ============================================================================

/**
 * Format amount as Indian Rupees.
 */
export function formatCurrency(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Format an ISO date string or Date object for display.
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format a 24-hour time string (HH:mm) to 12-hour display.
 */
export function formatTime(time: string): string {
  const [hoursStr, minutesStr] = time.split(':')
  let hours = parseInt(hoursStr, 10)
  const minutes = minutesStr || '00'
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${hours}:${minutes} ${ampm}`
}

/**
 * Format a duration in hours to a human-readable string.
 */
export function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`
  }
  const wholeHours = Math.floor(hours)
  const remainingMinutes = Math.round((hours - wholeHours) * 60)
  if (remainingMinutes === 0) {
    return `${wholeHours} hr${wholeHours > 1 ? 's' : ''}`
  }
  return `${wholeHours} hr${wholeHours > 1 ? 's' : ''} ${remainingMinutes} min`
}

// ============================================================================
// Price Calculation
// ============================================================================

/**
 * Calculate total booking price including platform fee and tax.
 */
export function calculateBookingPrice(
  hourlyRate: number,
  hours: number,
  platformFeePercent: number = PLATFORM_FEE_PERCENTAGE
): PriceCalculation {
  const subtotal = hourlyRate * hours
  const platformFee = Math.round((subtotal * platformFeePercent) / 100)
  const taxableAmount = subtotal + platformFee
  const taxAmount = Math.round(taxableAmount * 0.18) // 18% GST
  const totalAmount = subtotal + platformFee + taxAmount

  return {
    hourly_rate: hourlyRate,
    total_hours: hours,
    subtotal,
    platform_fee: platformFee,
    tax_amount: taxAmount,
    discount_amount: 0,
    total_amount: totalAmount,
  }
}

// ============================================================================
// Booking Helpers
// ============================================================================

/**
 * Generate a unique booking number.
 */
export function generateBookingNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `HT-${timestamp}-${random}`
}

/**
 * Get the display color for a booking status.
 */
export function getStatusColor(status: BookingStatus): string {
  return BOOKING_STATUS_COLOR_MAP[status] ?? '#6B7280'
}

/**
 * Get the display label for a booking status.
 */
export function getStatusLabel(status: BookingStatus): string {
  return BOOKING_STATUS_LABEL_MAP[status] ?? status
}

// ============================================================================
// CSS / Class Utilities
// ============================================================================

/**
 * Merge CSS class names, filtering out falsy values.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Convert text to a URL-friendly slug.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

/**
 * Truncate text to a given length, appending '…' if truncated.
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trimEnd() + '…'
}

// ============================================================================
// Image Normalization & Client Compression
// ============================================================================

export const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  bike: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
  car: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
  van: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&w=800&q=80',
  local_guide: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  sightseeing_tour: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
  experience: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80',
  humani: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
}

/**
 * Robustly normalizes images from any source (array, stringified JSON, Postgres array literal, single URL)
 * into a clean array of valid image URLs / data strings.
 */
export function normalizeListingImages(images: any, category?: string): string[] {
  const fallback = [DEFAULT_CATEGORY_IMAGES[category || 'car'] || DEFAULT_CATEGORY_IMAGES.car]

  if (!images) return fallback

  let result: string[] = []

  if (Array.isArray(images)) {
    result = images.filter((img) => typeof img === 'string' && img.trim().length > 0)
  } else if (typeof images === 'string') {
    const trimmed = images.trim()
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          result = parsed.filter((img) => typeof img === 'string' && img.trim().length > 0)
        }
      } catch {
        // Fall through
      }
    } else if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      // Postgres array literal syntax: {url1,url2}
      const rawItems = trimmed.slice(1, -1).split(',')
      result = rawItems
        .map((item) => item.replace(/^"|"$/g, '').trim())
        .filter((item) => item.length > 0)
    } else if (trimmed.startsWith('http') || trimmed.startsWith('data:image')) {
      result = [trimmed]
    }
  }

  return result.length > 0 ? result : fallback
}

/**
 * Compresses an image file in the browser before upload using HTML Canvas.
 * Resizes large camera photos to max width 1200px and exports as clean JPEG (~70KB - 120KB).
 */
export function compressImageFile(file: File, maxWidth = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const src = e.target?.result as string
      if (!src) {
        resolve('')
        return
      }

      // If already small (< 150KB), resolve directly
      if (file.size < 150 * 1024) {
        resolve(src)
        return
      }

      const img = new Image()
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(src)
            return
          }

          ctx.drawImage(img, 0, 0, width, height)
          const compressed = canvas.toDataURL('image/jpeg', quality)
          resolve(compressed)
        } catch {
          resolve(src)
        }
      }
      img.onerror = () => resolve(src)
      img.src = src
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
