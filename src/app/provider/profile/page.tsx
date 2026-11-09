'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Radio,
  Power,
  PowerOff,
  Compass,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Camera,
  Upload,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { showToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { compressImageFile } from '@/lib/utils'
import { DEFAULT_AVATARS } from '@/lib/constants'

export default function ProviderProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const [businessName, setBusinessName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATARS.provider)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [totalListings, setTotalListings] = useState(0)
  const [activeListings, setActiveListings] = useState(0)
  const [verificationStatus, setVerificationStatus] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [togglingStatus, setTogglingStatus] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch live provider profile & status
  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      try {
        const res = await fetch('/api/provider/profile')
        if (res.ok) {
          const data = await res.json()
          if (data.businessName) setBusinessName(data.businessName)
          else if (profile?.full_name) setBusinessName(profile.full_name)

          if (data.phone) setPhone(data.phone)
          else if (profile?.phone) setPhone(profile.phone)

          if (data.city) setCity(data.city)
          if (data.email) setEmail(data.email)
          else if (user?.email) setEmail(user.email)

          if (data.avatarUrl) setAvatarUrl(data.avatarUrl)
          else if (profile?.avatar_url) setAvatarUrl(profile.avatar_url)
          else setAvatarUrl(DEFAULT_AVATARS.provider)

          if (typeof data.isOnline === 'boolean') {
            setIsOnline(data.isOnline)
          }
          setTotalListings(data.totalListings || 0)
          setActiveListings(data.activeListings || 0)
          setVerificationStatus(data.verificationStatus || 'pending')
        }
      } catch (err) {
        console.error('Error loading provider profile:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [profile, user])

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    try {
      showToast.loading('Optimizing host logo/avatar...')
      const compressed = await compressImageFile(file, 300, 0.85)
      setAvatarUrl(compressed)

      const res = await fetch('/api/provider/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: compressed }),
      })

      if (res.ok) {
        showToast.success('Host photo / logo updated successfully!')
        if (refreshProfile) refreshProfile()
      } else {
        showToast.error('Failed to update host avatar.')
      }
    } catch (err) {
      console.error(err)
      showToast.error('Error processing host avatar.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Handle Switching Active (Online) / Offline
  const handleToggleOnlineStatus = async (newOnlineState: boolean) => {
    if (newOnlineState === isOnline) return
    setTogglingStatus(true)
    try {
      const res = await fetch('/api/provider/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: newOnlineState }),
      })

      if (res.ok) {
        const data = await res.json()
        setIsOnline(data.isOnline)
        setActiveListings(data.activeListings)
        setTotalListings(data.totalListings)

        if (newOnlineState) {
          showToast.success(
            `You are now ACTIVE (Online)! ${data.activeListings} tours are live in the marketplace.`
          )
        } else {
          showToast.success(
            'You are now OFFLINE. Your tours are hidden from tourists until you go active.'
          )
        }
      } else {
        const err = await res.json()
        showToast.error(err.error || 'Failed to update rider status')
      }
    } catch (err) {
      console.error(err)
      showToast.error('Network error changing status')
    } finally {
      setTogglingStatus(false)
    }
  }

  // Save changes to profile info
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/provider/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          phone,
          city,
          avatar_url: avatarUrl,
        }),
      })

      if (res.ok) {
        showToast.success('Provider profile details updated!')
        if (refreshProfile) refreshProfile()
      } else {
        const errData = await res.json()
        showToast.error(errData.error || 'Failed to save profile')
      }
    } catch (err) {
      console.error(err)
      showToast.error('Error saving profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout role="provider" title="Provider Profile Settings">
      <div className="max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 font-display">
            Host Profile & Rider Availability
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your live marketplace availability and update your public host credentials.
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 bg-white rounded-3xl border border-gray-100">
            Loading profile and availability...
          </div>
        ) : (
          <div className="space-y-8">
            {/* ══════════════════════════════════════════════════
                1. RIDER AVAILABILITY & MARKETPLACE SWITCH
            ══════════════════════════════════════════════════ */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <Radio className="w-5 h-5 text-emerald-700" />
                    <h2 className="text-lg font-bold text-gray-900 font-display">
                      Marketplace Availability Switch
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Control whether your hourly tourist tours and listings appear to customers in the marketplace.
                  </p>
                </div>

                {/* Status Badge */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      isOnline
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      {isOnline && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      )}
                      <span
                        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                          isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}
                      />
                    </span>
                    {isOnline ? 'Active (Online)' : 'Offline (Hidden)'}
                  </span>
                </div>
              </div>

              {/* Two Prominent Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Active Button */}
                <button
                  type="button"
                  onClick={() => handleToggleOnlineStatus(true)}
                  disabled={togglingStatus}
                  className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 relative overflow-hidden group ${
                    isOnline
                      ? 'border-emerald-500 bg-emerald-50/60 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-400/30'
                      : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                        isOnline
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                      }`}
                    >
                      <Power className="w-5 h-5" />
                    </div>
                    {isOnline && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                        Current Status
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-gray-900">Active (Online)</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Your tours are live in the marketplace. Tourists can discover, view, and book your hourly trips.
                  </p>
                </button>

                {/* Offline Button */}
                <button
                  type="button"
                  onClick={() => handleToggleOnlineStatus(false)}
                  disabled={togglingStatus}
                  className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 relative overflow-hidden group ${
                    !isOnline
                      ? 'border-gray-700 bg-gray-50 shadow-md ring-2 ring-gray-400/30'
                      : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                        !isOnline
                          ? 'bg-gray-800 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-800'
                      }`}
                    >
                      <PowerOff className="w-5 h-5" />
                    </div>
                    {!isOnline && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-800 text-white">
                        Current Status
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-gray-900">Offline</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Your tours are temporarily paused and hidden from the marketplace. No new booking requests.
                  </p>
                </button>
              </div>

              {/* Status Note & Live Listings Count */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Marketplace Visibility:</strong>{' '}
                    {isOnline ? (
                      <span className="text-emerald-700 font-bold">
                        {activeListings} of {totalListings} tours are actively visible to tourists
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold">
                        0 tours visible (All {totalListings} tours are paused while offline)
                      </span>
                    )}
                  </span>
                </div>
                <Link
                  href="/provider/listings"
                  className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-1 shrink-0"
                >
                  View My Listings <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════
                2. HOST PROFILE & BUSINESS IDENTITY
            ══════════════════════════════════════════════════ */}
            <form onSubmit={handleSave} className="space-y-6">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileChange}
              />

              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="relative group">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Host Logo"
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-[#0a4d29] flex items-center justify-center font-black text-xl border-2 border-emerald-200">
                          {businessName ? businessName.slice(0, 2).toUpperCase() : 'HT'}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        title="Upload Host Avatar / Logo"
                        className="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-bold"
                      >
                        <Camera className="w-4 h-4 mb-0.5" />
                        Upload
                      </button>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">
                        {businessName || 'Your Business Name'}
                      </h3>
                      <p className="text-xs text-gray-500">{email || user?.email || 'provider@hourlytourism.com'}</p>
                      <span className="inline-flex items-center text-[10px] text-emerald-700 font-bold uppercase mt-1">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        {verificationStatus === 'approved' ? 'Verified Host Partner' : 'Verification Under Review'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Change Host Photo / Logo</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Business / Host Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Coimbatore Rider Co."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Contact Phone</label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98422 XXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Operational City / Base <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Coimbatore, Tamil Nadu"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Registered Email Address
                    </label>
                    <Input
                      value={email || user?.email || ''}
                      disabled
                      className="bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="primary" size="md" type="submit" disabled={saving}>
                    <Save className="w-4 h-4 mr-1.5" />
                    {saving ? 'Saving...' : 'Save Profile Changes'}
                  </Button>
                </div>
              </div>
            </form>

            {/* ══════════════════════════════════════════════════
                3. PAYMENTS & PAYOUTS HUB BANNER
            ══════════════════════════════════════════════════ */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-orange-50 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <CreditCard className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-bold text-sm text-gray-900">
                    Looking for Payment Methods & UPI QR Code?
                  </h3>
                </div>
                <p className="text-xs text-gray-600 mt-1 max-w-xl">
                  All payment settings, direct bank transfer accounts (NEFT/IMPS), UPI VPA, and your payout QR code are centrally managed under the Payments & Payouts tab.
                </p>
              </div>

              <Link
                href="/provider/earnings"
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all inline-flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                Go to Payments & Payouts
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
