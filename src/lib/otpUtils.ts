// ============================================================================
// Hourly Tourism - Booking Start & Verification OTP Generator
// ============================================================================

/**
 * Deterministically generates a secure, consistent 4-digit Start OTP
 * for a booking based on its unique booking number or ID.
 * This guarantees the tourist and provider always see and verify the exact same code
 * without needing an extra unindexed database column.
 */
export function getBookingStartOtp(bookingIdOrNumber: string): string {
  if (!bookingIdOrNumber) return '1234'
  
  // Normalize string
  const cleanStr = bookingIdOrNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  
  let hash = 5381
  for (let i = 0; i < cleanStr.length; i++) {
    hash = ((hash << 5) + hash) + cleanStr.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  
  // Produce 4-digit code between 1000 and 9999
  const code = (Math.abs(hash) % 9000) + 1000
  return code.toString()
}

/**
 * Verifies if user entered OTP matches the booking's Start OTP.
 */
export function verifyBookingStartOtp(bookingIdOrNumber: string, enteredOtp: string): boolean {
  if (!bookingIdOrNumber || !enteredOtp) return false
  const expectedOtp = getBookingStartOtp(bookingIdOrNumber)
  return enteredOtp.trim() === expectedOtp
}

