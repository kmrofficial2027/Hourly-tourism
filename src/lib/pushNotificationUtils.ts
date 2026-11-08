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
      let permission: NotificationPermission = 'default'
      if (typeof Notification.requestPermission === 'function') {
        const result = Notification.requestPermission()
        if (result && typeof result.then === 'function') {
          permission = await result
        } else {
          // Legacy callback style support
          permission = await new Promise<NotificationPermission>((resolve) => {
            try {
              Notification.requestPermission((p) => resolve(p as NotificationPermission))
            } catch {
              resolve('denied')
            }
          })
        }
      }
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
 * Works seamlessly across mobile (Android Chrome ServiceWorker) and desktop browsers.
 */
export function triggerProviderBookingPushNotification(booking: any) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const bookingNum = booking.booking_number || 'New'
  const date = booking.booking_date || 'Today'
  const hours = booking.duration_hours || 1
  const amount = booking.total_amount ? `₹${booking.total_amount}` : ''
  const pickup = booking.pickup_location || 'Customer location'

  const title = `✨ New Hourly Booking Request #${bookingNum}`
  const body = `Customer requested ${hours} hr(s) on ${date} (${amount}). Pickup: ${pickup}. Tap to review and confirm.`

  try {
    // 1. Android Chrome requires ServiceWorkerRegistration.showNotification()
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.showNotification(title, {
            body,
            icon: '/icon-192.png',
            badge: '/favicon.png',
            tag: `booking-alert-${booking.id}`,
            data: { url: `/provider/bookings?id=${booking.id}` },
            vibrate: [250, 100, 250],
          } as any)
        })
        .catch(() => {
          // 2. Desktop browser fallback
          try {
            const notif = new Notification(title, {
              body,
              icon: '/icon-192.png',
              badge: '/favicon.png',
              tag: `booking-alert-${booking.id}`,
            })
            notif.onclick = () => {
              window.focus()
              window.location.href = `/provider/bookings?id=${booking.id}`
              notif.close()
            }
          } catch {}
        })
      return
    }

    // 3. Direct constructor for non-service worker contexts
    const notif = new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/favicon.png',
      tag: `booking-alert-${booking.id}`,
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
