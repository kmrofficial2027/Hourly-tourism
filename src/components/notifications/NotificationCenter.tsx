'use client'

import React, { useState, useEffect } from 'react'
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
  MessageCircle,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export interface NotificationItem {
  id: string
  type: 'booking' | 'payment' | 'safety' | 'system'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  link?: string
}

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'booking',
    title: 'Booking Confirmed • #BK-789213',
    message: 'Your 4-hour car rental in Coimbatore has been confirmed by Host Ramesh.',
    timestamp: '10 mins ago',
    isRead: false,
    link: '/dashboard/bookings',
  },
  {
    id: 'notif-2',
    type: 'payment',
    title: 'Settlement Payout Released',
    message: '₹3,400 has been transferred to your registered bank account via NEFT.',
    timestamp: '2 hours ago',
    isRead: false,
    link: '/provider/earnings',
  },
  {
    id: 'notif-3',
    type: 'safety',
    title: 'Live Trip Started • OTP Verified',
    message: 'Trip started successfully. The 24x7 safety radar and live GPS tracking are active.',
    timestamp: '5 hours ago',
    isRead: true,
    link: '/dashboard/bookings',
  },
  {
    id: 'notif-4',
    type: 'system',
    title: 'KYC Document Verified',
    message: 'Your Aadhaar government ID verification was approved by the compliance team.',
    timestamp: '1 day ago',
    isRead: true,
    link: '/provider/verification',
  },
]

export interface NotificationCenterProps {
  role?: 'customer' | 'provider' | 'admin'
}

export function NotificationCenter({ role = 'customer' }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'booking' | 'payment' | 'safety'>('all')
  const [notifications, setNotifications] = useState<NotificationItem[]>(SAMPLE_NOTIFICATIONS)
  const [showPreferences, setShowPreferences] = useState(false)

  // Channel notification preferences
  const [channels, setChannels] = useState({
    inApp: true,
    sms: true,
    email: true,
    whatsapp: true,
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true
    return n.type === activeTab
  })

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-4 h-4 text-emerald-600" />
      case 'payment':
        return <CreditCard className="w-4 h-4 text-blue-600" />
      case 'safety':
        return <AlertTriangle className="w-4 h-4 text-[#ff7a00]" />
      default:
        return <ShieldCheck className="w-4 h-4 text-purple-600" />
    }
  }

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#ff7a00] text-white text-[9px] font-black flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Drawer */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-black text-gray-900 font-display">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-[#ff7a00]">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                  title="Channel preferences"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification Channel Preferences Toggle Panel */}
            {showPreferences && (
              <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-2 text-xs">
                <span className="font-bold text-gray-800 block">Notification Delivery Channels</span>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2 text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.inApp}
                      onChange={(e) => setChannels({ ...channels, inApp: e.target.checked })}
                      className="rounded accent-emerald-600"
                    />
                    <span>In-App Radar</span>
                  </label>
                  <label className="flex items-center space-x-2 text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.sms}
                      onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                      className="rounded accent-emerald-600"
                    />
                    <span>Fast SMS OTP</span>
                  </label>
                  <label className="flex items-center space-x-2 text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.email}
                      onChange={(e) => setChannels({ ...channels, email: e.target.checked })}
                      className="rounded accent-emerald-600"
                    />
                    <span>Email Invoices</span>
                  </label>
                  <label className="flex items-center space-x-2 text-gray-600 cursor-pointer">
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
            <div className="flex border-b border-gray-100 bg-gray-50/50 p-1.5 text-xs">
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

            {/* Notifications List */}
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  No notifications in this category.
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-4 flex items-start space-x-3 hover:bg-gray-50/80 transition-colors cursor-pointer ${
                      !notif.isRead ? 'bg-orange-50/30' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-gray-900 truncate">{notif.title}</h4>
                        <span className="text-[10px] text-gray-400 shrink-0">{notif.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      {notif.link && (
                        <Link
                          href={notif.link}
                          onClick={() => setIsOpen(false)}
                          className="text-[11px] font-bold text-emerald-700 hover:underline inline-block pt-0.5"
                        >
                          View Details →
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={markAllAsRead}
                className="font-bold text-gray-500 hover:text-gray-900"
              >
                Mark all as read
              </button>
              <span className="text-[10px] text-gray-400 font-medium">Real-Time Event Stream</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

