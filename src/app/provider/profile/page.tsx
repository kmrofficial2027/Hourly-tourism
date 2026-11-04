'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Camera,
  Save,
  QrCode,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { showToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'

export default function ProviderProfilePage() {
  const { user, profile } = useAuth()
  const [businessName, setBusinessName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [upiId, setUpiId] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch live provider profile & QR code
  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      try {
        const res = await fetch('/api/provider/qr-code')
        if (res.ok) {
          const data = await res.json()
          if (data.businessName) setBusinessName(data.businessName)
          else if (profile?.full_name) setBusinessName(profile.full_name)

          if (data.phone) setPhone(data.phone)
          else if (profile?.phone) setPhone(profile.phone)

          if (data.city) setCity(data.city)
          if (data.upiId) setUpiId(data.upiId)
          if (data.qrCodeUrl) setQrCodeUrl(data.qrCodeUrl)
        }
      } catch (err) {
        console.error('Error loading provider profile:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [profile])

  // Handle QR image file selection & convert to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast.error('Please upload a valid image file (PNG, JPG, or WebP)')
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      showToast.error('QR code image size must be less than 3 MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string
      setQrCodeUrl(base64)
      showToast.success('QR Code loaded! Click "Save Changes" to apply.')
    }
    reader.readAsDataURL(file)
  }

  // Remove QR code
  const handleRemoveQr = async () => {
    try {
      await fetch('/api/provider/qr-code', { method: 'DELETE' })
      setQrCodeUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      showToast.success('QR Code removed')
    } catch {
      showToast.error('Failed to remove QR code')
    }
  }

  // Save changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/provider/qr-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          phone,
          city,
          upiId,
          qrCodeUrl,
        }),
      })

      if (res.ok) {
        showToast.success('Provider profile & payment QR code saved!')
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
      <div className="max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            Provider Business & Payment Settings
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your host identity, operating city, and upload your direct payment QR code for trip-end collections.
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 bg-white rounded-3xl border border-gray-100">
            Loading profile settings...
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Host Identity Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center space-x-4 pb-4 border-b border-gray-100">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0a4d29] flex items-center justify-center font-black text-xl">
                  {businessName ? businessName.slice(0, 2).toUpperCase() : 'HT'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {businessName || 'Your Business Name'}
                  </h3>
                  <p className="text-xs text-gray-500">{user?.email || 'provider@hourlytourism.com'}</p>
                  <span className="inline-flex items-center text-[10px] text-emerald-700 font-bold uppercase mt-1">
                    <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                    Verified Host Partner
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Business / Host Name
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
                    Operational City / Base
                  </label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Coimbatore, Tamil Nadu"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Payout UPI ID (Instant Collection)
                  </label>
                  <Input
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. merchant@okhdfcbank"
                  />
                </div>
              </div>
            </div>

            {/* Direct Payment QR Code Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <QrCode className="w-5 h-5 text-emerald-700" />
                    <h2 className="text-lg font-bold text-gray-900 font-display">
                      Direct Payment UPI QR Code
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 max-w-xl">
                    Upload your UPI QR code (Google Pay, PhonePe, Paytm, BHIM, or Bank QR).
                    When your hourly service ends or completes, you and your guest will be able to display
                    and scan this QR code to settle the payment immediately on-site.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Upload / Preview Box */}
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 hover:bg-gray-50 transition-all text-center">
                  {qrCodeUrl ? (
                    <div className="space-y-4">
                      <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-sm border border-gray-200 mx-auto flex items-center justify-center overflow-hidden">
                        <img
                          src={qrCodeUrl}
                          alt="Provider Payment QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-3.5 h-3.5 mr-1" />
                          Replace QR
                        </Button>
                        <button
                          type="button"
                          onClick={handleRemoveQr}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          title="Remove QR Code"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 py-4">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                        <QrCode className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">No QR Code Uploaded</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          PNG, JPG, or WebP up to 3MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-3.5 h-3.5 mr-1" />
                        Upload QR Code Image
                      </Button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Instructions & Features */}
                <div className="space-y-3 text-xs text-gray-600 bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100">
                  <span className="font-bold text-emerald-900 block text-sm">
                    How on-site QR payment works:
                  </span>
                  <div className="space-y-2">
                    <p className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>At Trip End:</strong> When you complete the hourly service, tap "Collect Payment via QR".
                      </span>
                    </p>
                    <p className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Tourist Scans:</strong> Guest opens Google Pay, PhonePe, or Paytm and scans your QR code directly.
                      </span>
                    </p>
                    <p className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Direct Receipt:</strong> Funds go directly into your bank account with zero waiting period.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="flex justify-end pt-2">
              <Button variant="primary" size="lg" type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-1.5" />
                {saving ? 'Saving...' : 'Save Profile & Payment Settings'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  )
}
