'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Calendar,
  ShieldCheck,
  Clock,
  Settings,
  Sparkles,
  Zap,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { showToast } from '@/components/ui/Toast'

export interface NotificationCenterProps {
  role?: 'customer' | 'provider' | 'admin'
}

// Relative time helper
function formatTimeAgo(isoString?: string) {
  if (!isoString) return 'Recent'
  try {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 172800) return 'Yesterday'
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    })
  } catch {
    return 'Recent'
  }
}

export function NotificationCenter({ role = 'customer' }: NotificationCenterProps) {
  const { user } = useAuth()
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh,
  } = useNotifications(user?.id)

  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'booking' | 'payment' | 'safety'>('all')
  const [showPreferences, setShowPreferences] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)

  // Channel notification preferences (stored locally)
  const [channels, setChannels] = useState({
    inApp: true,
    sms: true,
    email: true,
    whatsapp: true,
  })

  // Category tab filter logic
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true
    const type = (n.type || '').toLowerCase()
    if (activeTab === 'booking') {
      return (
        type.includes('booking') ||
        type.includes('trip') ||
        type.includes('provider') ||
        type.includes('offer')
      )
    }
    if (activeTab === 'payment') {
      return (
        type.includes('payment') ||
        type.includes('payout') ||
        type.includes('refund') ||
        type.includes('earning')
      )
    }
    if (activeTab === 'safety') {
      return (
        type.includes('safety') ||
        type.includes('sos') ||
        type.includes('verification') ||
        type.includes('system') ||
        type.includes('alert')
      )
    }
    return true
  })

  // Resolve action URL
  const resolveActionUrl = (n: any) => {
    if (n.action_url) return n.action_url
    const type = (n.type || '').toLowerCase()
    if (role === 'provider') {
      if (type.includes('payment') || type.includes('payout')) return '/provider/earnings'
      if (type.includes('verification')) return '/provider/verification'
      return '/provider/bookings'
    }
    if (role === 'admin') {
      if (type.includes('payment')) return '/admin/payments'
      if (type.includes('verification')) return '/admin/providers'
      return '/admin/bookings'
    }
    return '/dashboard/bookings'
  }

  // Get icon and color based on notification type
  const getIcon = (type: string = '') => {
    const t = type.toLowerCase()
    if (t.includes('payment') || t.includes('payout') || t.includes('refund')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <CreditCard className="w-4 h-4" />
        </div>
      )
    }
    if (t.includes('sos') || t.includes('safety') || t.includes('alert')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
      )
    }
    if (t.includes('verification') || t.includes('system')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
      )
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
        <Calendar className="w-4 h-4" />
      </div>
    )
  }

  // Handle individual notification click
  const handleNotificationClick = async (n: any) => {
    if (!n.is_read) {
      await markAsRead(n.id)
    }
  }

  // Trigger real test notification
  const handleSendTestNotification = async () => {
    if (!user) {
      showToast.error('Please log in to trigger a test notification')
      return
    }
    setSendingTest(true)
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '⚡ Real-Time Alert Active',
          message: `Live notification system is connected. Role: ${role.toUpperCase()} • Time: ${new Date().toLocaleTimeString()}`,
          type: 'booking_created',
          actionUrl: role === 'provider' ? '/provider/bookings' : '/dashboard/bookings',
        }),
      })
      if (res.ok) {
        showToast.success('Live test notification delivered to your feed!')
        await refresh()
      } else {
        const data = await res.json()
        showToast.error(data.error || 'Failed to trigger test notification')
      }
    } catch {
      showToast.error('Network error triggering notification')
    } finally {
      setSendingTest(false)
    }
  }

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl text-gray-600 hover:text-gray-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all shadow-xs focus:outline-none"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[#ff7a00] text-white text-[10px] font-black flex items-center justify-center shadow-md shadow-orange-500/40 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Modal / Drawer */}
      {isOpen && (
        <>
          {/* Backdrop on mobile */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-x-3 top-24 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center space-x-2">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-gray-900 font-display">Notifications</h3>
                  <span className="live-badge-dot" />
                </div>
                {unreadCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-[#ff7a00]">
                    {unreadCount} new
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    All caught up
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={refresh}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Refresh notifications"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Channel settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification Channel Preferences Toggle Panel */}
            {showPreferences && (
              <div className="p-4 bg-slate-50 border-b border-gray-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">Delivery Channels</span>
                  <button
                    onClick={handleSendTestNotification}
                    disabled={sendingTest}
                    className="text-[11px] font-bold text-[#ff7a00] hover:text-orange-600 hover:underline flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Send Test Alert</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.inApp}
                      onChange={(e) => setChannels({ ...channels, inApp: e.target.checked })}
                      className="rounded accent-emerald-600"
                    />
                    <span>In-App Realtime</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.sms}
                      onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                      className="rounded accent-emerald-600"
                    />
                    <span>Fast SMS OTP</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.email}
                      onChange={(e) => setChannels({ ...channels, email: e.target.checked })}
                      className="rounded accent-emerald-600"
                    />
                    <span>Email Invoices</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.whatsapp}
                      onChange={(e) => setChannels({ ...channels, whatsapp: e.target.checked })}
                      className="rounded accent-emerald-600"
                    />
                    <span>WhatsApp</span>
                  </label>
                </div>
              </div>
            )}

            {/* Category Filter Pills */}
            <div className="flex border-b border-gray-100 bg-gray-50/70 p-1.5 text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'booking', label: 'Trips' },
                { id: 'payment', label: 'Payouts' },
                { id: 'safety', label: 'Safety' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-1 text-center font-bold rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Real Notifications List */}
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-xs">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">No Notifications Yet</h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-[240px] mx-auto leading-relaxed">
                      You are all caught up! Real-time alerts for booking requests, status updates, and payouts will appear here.
                    </p>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleSendTestNotification}
                      disabled={sendingTest}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ff7a00] text-xs font-bold transition-colors border border-orange-200/60 shadow-xs active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{sendingTest ? 'Sending...' : '⚡ Send Test Notification'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  const actionUrl = resolveActionUrl(notif)
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 flex items-start space-x-3 hover:bg-gray-50/80 transition-colors cursor-pointer ${
                        !notif.is_read ? 'bg-orange-50/40 border-l-3 border-[#ff7a00]' : ''
                      }`}
                    >
                      {getIcon(notif.type)}

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-gray-900 truncate pr-2">
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 shrink-0 font-medium">
                            {formatTimeAgo(notif.created_at)}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        {actionUrl && (
                          <Link
                            href={actionUrl}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline pt-0.5"
                          >
                            <span>View Details</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="font-bold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Mark all as read
              </button>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>Live Event Stream Active</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
