'use client'

import React, { useState, useEffect } from 'react'
import {
  Bell,
  BellRing,
  Send,
  Users,
  Compass,
  Zap,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  Calendar,
  Smartphone,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { showToast } from '@/components/ui/Toast'

interface BroadcastRecord {
  id: string
  title: string
  message: string
  audience: 'all' | 'tourist' | 'provider' | 'specific'
  category: string
  actionUrl: string
  recipientCount: number
  sentAt: string
  sentBy: string
  status: 'delivered'
}

export default function AdminPushNotificationsPage() {
  const [audience, setAudience] = useState<'tourist' | 'provider' | 'all'>('tourist')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [category, setCategory] = useState<'promo' | 'alert' | 'system' | 'earnings'>('promo')
  const [actionUrl, setActionUrl] = useState('/explore')
  const [urgency, setUrgency] = useState<'normal' | 'high'>('high')

  const [stats, setStats] = useState({
    touristsCount: 0,
    providersCount: 0,
    totalUsersCount: 0,
  })
  const [history, setHistory] = useState<BroadcastRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  // Fetch stats and broadcast history
  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/push-notifications?t=${Date.now()}`, { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        if (json.stats) setStats(json.stats)
        if (json.history) setHistory(json.history)
      }
    } catch {
      showToast.error('Could not load push notification analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // One-click presets for Tourists
  interface PresetItem {
    title: string
    message: string
    category: 'promo' | 'alert' | 'system' | 'earnings'
    actionUrl: string
  }

  const touristPresets: PresetItem[] = [
    {
      title: '🌟 Weekend Getaway: 20% OFF Hourly Rides!',
      message: 'Plan your scenic mountain circuit to Valparai or Pollachi. Verified bikes and chauffeur cars ready now.',
      category: 'promo',
      actionUrl: '/explore',
    },
    {
      title: '🌧️ Western Ghats Weather Advisory',
      message: 'Pleasant rainfall and clear visibility in Pollachi foothill circuits. Book hourly rides with local hosts.',
      category: 'alert',
      actionUrl: '/regional-guides',
    },
    {
      title: '🛕 Coimbatore Spiritual Circuit Open',
      message: 'Hourly car & van transfers ready for Isha Yoga Center and Marudhamalai temple visits with 100% escrow.',
      category: 'promo',
      actionUrl: '/explore?category=car',
    },
  ]

  // One-click presets for Providers
  const providerPresets: PresetItem[] = [
    {
      title: '🔥 High Tourist Demand Alert!',
      message: 'Heavy tourist traffic detected near Coimbatore Airport & Railway Station. Toggle ONLINE to receive ride requests.',
      category: 'alert',
      actionUrl: '/provider',
    },
    {
      title: '💰 Tuesday Payout Settlement Initiated',
      message: 'Your weekly completed ride payouts have been processed via NEFT. Check your live balance statement.',
      category: 'earnings',
      actionUrl: '/provider/earnings',
    },
    {
      title: '🛡️ Quality & Dual Helmet Reminder',
      message: 'Please ensure sanitized dual ISI helmets are provided with all two-wheeler handovers today.',
      category: 'system',
      actionUrl: '/quality-guidelines',
    },
  ]

  const applyPreset = (preset: PresetItem) => {
    setTitle(preset.title)
    setMessage(preset.message)
    setCategory(preset.category)
    setActionUrl(preset.actionUrl)
    showToast.success('Template loaded into composer!')
  }

  // Handle Send Push
  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !message.trim()) {
      showToast.error('Please enter both title and message')
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/admin/push-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audience,
          title: title.trim(),
          message: message.trim(),
          category,
          actionUrl: actionUrl.trim() || '/',
          urgency,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        showToast.success(data.message || 'Push notification broadcasted successfully!')
        setTitle('')
        setMessage('')
        loadData()
      } else {
        showToast.error(data.error || 'Failed to send push notification')
      }
    } catch {
      showToast.error('Network error broadcasting push notification')
    } finally {
      setSending(false)
    }
  }

  return (
    <DashboardLayout role="admin" title="Push Notifications Broadcast Hub">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#ff7a00]/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500/20 text-[#ff7a00] border border-orange-500/30 flex items-center gap-1.5">
                  <BellRing className="w-3.5 h-3.5" />
                  Live App Notification Engine
                </span>
                <span className="live-badge-dot" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-display">
                Push Notifications Control Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Broadcast instant push notifications and radar alerts directly to tourists’ or providers’ mobile apps and browsers.
              </p>
            </div>

            {/* Recipient Audience Counter Badges */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[100px]">
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {stats.touristsCount}
                </span>
                <p className="text-[10px] uppercase font-bold text-slate-300 mt-0.5">Tourists</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[100px]">
                <span className="text-2xl font-black text-[#ff7a00] font-mono">
                  {stats.providersCount}
                </span>
                <p className="text-[10px] uppercase font-bold text-slate-300 mt-0.5">Providers</p>
              </div>
              <button
                onClick={loadData}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
                title="Refresh stats"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Main 2-Column Grid: Composer + Live Mobile Device Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Columns: Broadcast Composer */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-black text-gray-900 font-display flex items-center gap-2">
                  <Send className="w-5 h-5 text-[#ff7a00]" />
                  <span>Compose Notification</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select target segment, write message, and broadcast instantly.
                </p>
              </div>
            </div>

            <form onSubmit={handleSendPush} className="space-y-5">
              {/* 1. Target Audience Selection */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2.5">
                  1. Target Audience Segment
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAudience('tourist')
                      setActionUrl('/explore')
                    }}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      audience === 'tourist'
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 font-bold shadow-sm ring-2 ring-emerald-500/20'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600 font-medium'
                    }`}
                  >
                    <span className="text-lg block">🎒</span>
                    <span className="text-xs block mt-1">Tourists Only</span>
                    <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                      {stats.touristsCount} users
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAudience('provider')
                      setActionUrl('/provider')
                    }}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      audience === 'provider'
                        ? 'border-[#ff7a00] bg-orange-50/80 text-orange-950 font-bold shadow-sm ring-2 ring-orange-500/20'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600 font-medium'
                    }`}
                  >
                    <span className="text-lg block">🏍️</span>
                    <span className="text-xs block mt-1">Providers Only</span>
                    <span className="text-[10px] text-[#ff7a00] font-bold block mt-0.5">
                      {stats.providersCount} hosts
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAudience('all')
                      setActionUrl('/')
                    }}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      audience === 'all'
                        ? 'border-blue-500 bg-blue-50/80 text-blue-900 font-bold shadow-sm ring-2 ring-blue-500/20'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600 font-medium'
                    }`}
                  >
                    <span className="text-lg block">👥</span>
                    <span className="text-xs block mt-1">All Users</span>
                    <span className="text-[10px] text-blue-700 font-bold block mt-0.5">
                      {stats.totalUsersCount} total
                    </span>
                  </button>
                </div>
              </div>

              {/* 2. Quick Preset Templates */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                  Quick Templates for {audience === 'tourist' ? 'Tourists' : audience === 'provider' ? 'Providers' : 'All Users'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {(audience === 'provider' ? providerPresets : touristPresets).map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#ff7a00]" />
                      <span className="truncate max-w-[200px]">{p.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Notification Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                    2. Notification Title
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono">{title.length}/60</span>
                </div>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 🌟 Weekend Special: 20% OFF on Bike Circuits"
                  maxLength={60}
                  className="rounded-2xl"
                  required
                />
              </div>

              {/* 4. Notification Message */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                    3. Notification Message / Body
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono">{message.length}/180</span>
                </div>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Book your hourly rental to Pollachi and Valparai with verified hosts. Zero day lock-ins."
                  rows={3}
                  maxLength={180}
                  className="rounded-2xl"
                  required
                />
              </div>

              {/* 5. Target Action Link & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                    Action Destination Link
                  </label>
                  <Input
                    value={actionUrl}
                    onChange={(e) => setActionUrl(e.target.value)}
                    placeholder="/explore or /provider/earnings"
                    className="rounded-2xl font-mono text-xs"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {['/explore', '/provider', '/provider/earnings', '/dashboard/bookings', '/regional-guides'].map(
                      (url) => (
                        <button
                          key={url}
                          type="button"
                          onClick={() => setActionUrl(url)}
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-mono"
                        >
                          {url}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                    Notification Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-semibold bg-white outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="promo">⚡ Promo & Special Offer</option>
                    <option value="alert">🚨 Urgency / Demand Alert</option>
                    <option value="earnings">💰 Payout & Earnings Notice</option>
                    <option value="system">📢 System Announcement</option>
                  </select>

                  <div className="flex items-center gap-3 mt-3">
                    <label className="text-xs font-bold text-gray-700">Urgency Level:</label>
                    <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                      <input
                        type="radio"
                        name="urgency"
                        checked={urgency === 'high'}
                        onChange={() => setUrgency('high')}
                        className="accent-orange-500"
                      />
                      <span className="font-bold text-orange-600">High (Sound + Vibrate)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                      <input
                        type="radio"
                        name="urgency"
                        checked={urgency === 'normal'}
                        onChange={() => setUrgency('normal')}
                        className="accent-orange-500"
                      />
                      <span>Normal</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={sending || !title.trim() || !message.trim()}
                  className="rounded-2xl py-4 font-black text-sm bg-gradient-to-r from-[#ff7a00] to-[#f59e0b] shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
                >
                  <Send className="w-4 h-4 mr-2" />
                  <span>
                    {sending
                      ? 'Broadcasting to Devices...'
                      : `Send Push Notification to ${
                          audience === 'tourist'
                            ? `Tourists (${stats.touristsCount})`
                            : audience === 'provider'
                            ? `Providers (${stats.providersCount})`
                            : `All Users (${stats.totalUsersCount})`
                        }`}
                  </span>
                </Button>
              </div>
            </form>
          </div>

          {/* Right 5 Columns: Live Mobile Device Push Notification Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-sm font-black text-gray-900 font-display flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Live Mobile Screen Preview</span>
                </h3>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Android / iOS Notification Shade
                </span>
              </div>

              {/* Smartphone Screen Mockup */}
              <div className="w-full max-w-sm mx-auto bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-700 relative">
                {/* Speaker pill */}
                <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto mb-4" />

                {/* Lock screen / notification shade area */}
                <div className="bg-gradient-to-b from-slate-800/90 to-slate-900 rounded-3xl p-4 text-white min-h-[320px] flex flex-col justify-start space-y-4">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
                    <span>9:41 AM</span>
                    <div className="flex items-center gap-1.5">
                      <span>5G</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* System Push Notification Card Banner */}
                  <div className="bg-white/95 text-slate-900 rounded-2xl p-4 shadow-xl backdrop-blur-md border border-white/20 space-y-2 animate-in fade-in duration-200">
                    {/* App header in notification */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src="/images/logo.png"
                          alt="Hourly Tourism"
                          className="h-4 w-auto object-contain bg-slate-900 rounded-md p-0.5"
                        />
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                          Hourly Tourism
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">· Just now</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-orange-100 text-[#ff7a00]">
                        {audience.toUpperCase()}
                      </span>
                    </div>

                    {/* Notification content */}
                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-tight">
                        {title.trim() || '🌟 Weekend Escapes Special Offer'}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {message.trim() ||
                          'Book your hourly bike or car rental to Valparai and Pollachi circuits with 100% escrow protection.'}
                      </p>
                    </div>

                    {/* Bottom action button */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                      <span className="text-[10px] font-mono text-emerald-700 font-bold truncate max-w-[180px]">
                        Target: {actionUrl || '/'}
                      </span>
                      <span className="text-[10px] font-bold text-[#ff7a00] hover:underline">
                        Open App →
                      </span>
                    </div>
                  </div>

                  {/* Lock Screen Time Hint */}
                  <div className="text-center pt-8 text-slate-500 text-xs">
                    <p className="text-3xl font-light tracking-tight text-slate-300 font-mono">09:41</p>
                    <p className="text-[10px] mt-1">Wednesday, November 6</p>
                  </div>
                </div>

                {/* Home Indicator bar */}
                <div className="w-28 h-1 bg-slate-600 rounded-full mx-auto mt-3" />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">⚡ Instant Multi-Channel Push:</p>
                <p>
                  1. Native lock-screen system banner via Service Worker.<br />
                  2. In-app real-time notification radar feed.<br />
                  3. Dynamic sound & vibration chime for high-priority alerts.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Broadcast History Log */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-black text-gray-900 font-display flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span>Recent Push Broadcast History</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Audit log of all sent app notifications across tourist and provider segments.
              </p>
            </div>
            <span className="text-xs font-bold text-gray-400">
              Showing last {history.length} broadcasts
            </span>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-50 text-[#ff7a00] flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">No Broadcast History Yet</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Sent push notifications will be logged here with recipient metrics, delivery timestamps, and action links.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-400 uppercase tracking-wider text-[10px] border-b border-gray-100">
                    <th className="pb-3 font-black">Title & Message</th>
                    <th className="pb-3 font-black">Audience</th>
                    <th className="pb-3 font-black">Delivered To</th>
                    <th className="pb-3 font-black">Action Link</th>
                    <th className="pb-3 font-black">Date & Time</th>
                    <th className="pb-3 font-black text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 pr-4 max-w-xs">
                        <p className="font-bold text-gray-900 truncate">{record.title}</p>
                        <p className="text-gray-500 text-[11px] line-clamp-1 mt-0.5">{record.message}</p>
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            record.audience === 'tourist'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : record.audience === 'provider'
                              ? 'bg-orange-50 text-[#ff7a00] border border-orange-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {record.audience === 'tourist'
                            ? '🎒 Tourists'
                            : record.audience === 'provider'
                            ? '🏍️ Providers'
                            : '👥 Everyone'}
                        </span>
                      </td>
                      <td className="py-4 pr-4 font-mono font-bold text-gray-700">
                        {record.recipientCount} users
                      </td>
                      <td className="py-4 pr-4 font-mono text-[11px] text-emerald-700">
                        {record.actionUrl}
                      </td>
                      <td className="py-4 pr-4 text-gray-500 whitespace-nowrap">
                        {new Date(record.sentAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Delivered</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
