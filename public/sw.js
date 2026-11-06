// Hourly Tourism — Progressive Web App (PWA) Service Worker & Push Notification Handler

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Listen to Native Web Push Events
self.addEventListener('push', (event) => {
  let data = {}
  try {
    if (event.data) {
      data = event.data.json()
    }
  } catch (e) {
    data = {
      title: 'Hourly Tourism Alert',
      message: event.data ? event.data.text() : 'You have a new update.',
    }
  }

  const title = data.title || 'Hourly Tourism'
  const options = {
    body: data.message || data.body || 'You have a new travel update.',
    icon: data.icon || '/icon-192.png',
    badge: '/favicon.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.actionUrl || data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: [
      { action: 'open', title: 'View Details' },
      { action: 'dismiss', title: 'Close' },
    ],
    tag: data.tag || `hourly-push-${Date.now()}`,
    renotify: true,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Handle Notification Click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') return

  const targetUrl = (event.notification.data && event.notification.data.url) || '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If an open window exists, navigate and focus it
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(targetUrl)
            return client.focus()
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl)
        }
      })
  )
})

// In-App Message listener to trigger system notification while app is running
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, message, actionUrl } = event.data
    self.registration.showNotification(title || 'Hourly Tourism', {
      body: message || 'You have an update.',
      icon: '/icon-192.png',
      badge: '/favicon.png',
      vibrate: [150, 80, 150],
      data: { url: actionUrl || '/' },
      tag: 'hourly-live-alert',
      renotify: true,
    })
  }
})

