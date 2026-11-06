'use client'

import React, { useEffect, useState } from 'react'
import { Bell, X, Check, ShieldCheck, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/Toast'

export function PushNotificationSubscriber() {
  const { user, profile } = useAuth()
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // 1. Register Service Worker on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          // Service worker active
        })
        .catch((err) => {
          console.debug('ServiceWorker registration error:', err)
        })
    }

    if ('Notification' in window) {
      setPermission(Notification.permission)
      // Check if user previously dismissed prompt
      const wasDismissed = localStorage.getItem('hourly_push_dismissed') === 'true'
      if (Notification.permission === 'default' && !wasDismissed) {
        // Show banner after brief delay
        const timer = setTimeout(() => setShowPrompt(true), 3500)
        return () => clearTimeout(timer)
      }
    }
  }, [])

  // 2. Listen to Supabase Realtime Push Broadcast Channel
  useEffect(() => {
    if (typeof window === 'undefined') return
    const supabase = createClient()

    const channel = supabase
      .channel('hourly-push-broadcasts')
      .on('broadcast', { event: 'push_notification' }, (payload: any) => {
        const data = payload?.payload
        if (!data) return

        // Target audience check
        const targetAudience = data.audience || 'all'
        const userRole = profile?.role || 'customer'

        const isMatch =
          targetAudience === 'all' ||
          (targetAudience === 'tourist' && userRole === 'customer') ||
          (targetAudience === 'provider' && userRole === 'provider') ||
          (data.targetUserId && data.targetUserId === user?.id)

        if (!isMatch) return

        // Trigger native notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'SHOW_NOTIFICATION',
              title: data.title,
              message: data.message,
              actionUrl: data.actionUrl,
            })
          } else {
            try {
              new Notification(data.title, {
                body: data.message,
                icon: '/icon-192.png',
                badge: '/favicon.png',
              })
            } catch (e) {
              // fallback
            }
          }
        }

        // Also trigger in-app visual toast
        showToast.success(`📢 ${data.title}: ${data.message}`)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, profile])

  // Request native permission
  const handleEnablePush = async () => {
    if (!('Notification' in window)) {
      showToast.error('Notifications are not supported by this browser.')
      setShowPrompt(false)
      return
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result === 'granted') {
        setShowPrompt(false)
        showToast.success('🔔 Push Notifications Enabled! You will receive live alerts on your device.')
        // Try to show welcome test notification
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title: 'Hourly Tourism Alerts Active',
            message: 'You are now ready to receive live ride updates and announcements!',
            actionUrl: '/',
          })
        }
      } else {
        setShowPrompt(false)
        showToast.error('Push notifications are muted. You can enable them anytime in site settings.')
      }
    } catch {
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    try {
      localStorage.setItem('hourly_push_dismissed', 'true')
    } catch {}
  }

  if (!showPrompt || permission === 'granted' || dismissed) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-2xl border border-slate-800 backdrop-blur-md flex items-start gap-3.5 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-[#ff7a00]/20 blur-xl pointer-events-none" />

        <div className="w-10 h-10 rounded-2xl bg-[#ff7a00] text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
          <Bell className="w-5 h-5 animate-pulse" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <h4 className="text-xs sm:text-sm font-black text-white">
            Enable Live Push Alerts
          </h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Get instant updates on your mobile screen for booking confirmations, chauffeur arrival, and payouts.
          </p>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleEnablePush}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ff7a00] to-[#f59e0b] hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all"
            >
              Turn On
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold hover:bg-white/5 transition-colors"
            >
              Later
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
          aria-label="Close prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
