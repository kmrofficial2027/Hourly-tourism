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
