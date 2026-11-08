// ============================================================================
// Hourly Tourism - Web Push Notification & Browser Background Alert Utilities
// ============================================================================

/**
 * Requests browser permission to show native system push notifications
 * on desktop (Windows, Mac, Linux) and mobile devices (Android Chrome / Safari iOS).
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied'
  }

  try {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission
    }
    return Notification.permission
  } catch (err) {
    console.debug('Notification permission request error:', err)
    return 'denied'
  }
}

/**
 * Sends a native system push notification when a new booking request is received.
 * Works even when the browser tab is in the background or minimized.
 */
export function triggerProviderBookingPushNotification(booking: any) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const bookingNum = booking.booking_number || 'New'
  const date = booking.booking_date || 'Today'
  const hours = booking.duration_hours || 1
  const amount = booking.total_amount ? `₹${booking.total_amount}` : ''
  const pickup = booking.pickup_location || 'Customer location'

  const title = `🚨 New Hourly Booking Request #${bookingNum}!`
  const body = `Customer requested ${hours} hr(s) on ${date} (${amount}). Pickup: ${pickup}. Tap to Accept or Decline immediately!`

  try {
    const notif = new Notification(title, {
      body,
      icon: '/images/logo.png',
      badge: '/images/logo.png',
      tag: `booking-alert-${booking.id}`,
      requireInteraction: true, // Notification stays on screen until provider acts
      silent: false,
    })

    notif.onclick = () => {
      window.focus()
      window.location.href = `/provider/bookings?id=${booking.id}`
      notif.close()
    }
  } catch (err) {
    console.debug('Push notification display skipped:', err)
  }
}

