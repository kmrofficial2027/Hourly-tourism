// ============================================================================
// Hourly Tourism - Cancellation & Refund Policy Engine
// ============================================================================

export interface RefundEstimate {
  eligibleForRefund: boolean
  refundPercentage: number
  refundAmount: number
  cancellationFee: number
  policyWindow: string
  hoursUntilBooking: number
  notes: string
}

/**
 * Calculate refund estimate based on booking start time and total paid
 * Standard Policy:
 * - > 24 hours before trip: 100% refund (Free cancellation)
 * - 6 to 24 hours before trip: 75% refund (25% cancellation charge)
 * - 2 to 6 hours before trip: 50% refund (50% cancellation charge)
 * - < 2 hours before trip: 0% refund (Non-refundable window)
 */
export function calculateRefundEstimate(
  bookingDate: string,
  startTime: string,
  totalAmount: number,
  actor: 'customer' | 'provider' | 'admin' = 'customer'
): RefundEstimate {
  // If cancelled by provider or admin, customer is always 100% refunded
  if (actor === 'provider' || actor === 'admin') {
    return {
      eligibleForRefund: true,
      refundPercentage: 100,
      refundAmount: totalAmount,
      cancellationFee: 0,
      policyWindow: 'Host/Admin Initiated Cancellation',
      hoursUntilBooking: 999,
      notes: 'Full 100% refund guaranteed when cancellation is initiated by the host or platform.',
    }
  }

  try {
    const bookingDateTime = new Date(`${bookingDate}T${startTime.length === 5 ? `${startTime}:00` : startTime}`)
    const now = new Date()
    const diffMs = bookingDateTime.getTime() - now.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    if (diffHours >= 24) {
      return {
        eligibleForRefund: true,
        refundPercentage: 100,
        refundAmount: totalAmount,
        cancellationFee: 0,
        policyWindow: 'More than 24 hours in advance',
        hoursUntilBooking: Math.round(diffHours),
        notes: 'Free cancellation. Full refund will be credited back to your original payment method in 3-5 business days.',
      }
    } else if (diffHours >= 6) {
      const refund = Math.round(totalAmount * 0.75)
      return {
        eligibleForRefund: true,
        refundPercentage: 75,
        refundAmount: refund,
        cancellationFee: totalAmount - refund,
        policyWindow: '6 to 24 hours in advance',
        hoursUntilBooking: Math.round(diffHours),
        notes: '75% refund applicable. A 25% host preparation compensation fee is retained.',
      }
    } else if (diffHours >= 2) {
      const refund = Math.round(totalAmount * 0.5)
      return {
        eligibleForRefund: true,
        refundPercentage: 50,
        refundAmount: refund,
        cancellationFee: totalAmount - refund,
        policyWindow: '2 to 6 hours in advance',
        hoursUntilBooking: Math.round(diffHours),
        notes: '50% refund applicable. A 50% last-minute slot holding fee is retained.',
      }
    } else {
      return {
        eligibleForRefund: false,
        refundPercentage: 0,
        refundAmount: 0,
        cancellationFee: totalAmount,
        policyWindow: 'Less than 2 hours before trip start',
        hoursUntilBooking: Math.max(0, Math.round(diffHours)),
        notes: 'Non-refundable window. Vehicle/guide has already been dispatched.',
      }
    }
  } catch (err) {
    return {
      eligibleForRefund: true,
      refundPercentage: 100,
      refundAmount: totalAmount,
      cancellationFee: 0,
      policyWindow: 'Standard Policy',
      hoursUntilBooking: 24,
      notes: 'Standard platform refund policy applied.',
    }
  }
}

