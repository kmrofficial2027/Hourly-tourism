'use client'

import React, { useState } from 'react'
import { User, Phone, Mail, MapPin, ShieldCheck, Camera, Save } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { showToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'

export default function ProviderProfilePage() {
  const { user, profile } = useAuth()
  const [businessName, setBusinessName] = useState('Kovai Ghat Rides & Tours')
  const [phone, setPhone] = useState('+91 98422 11099')
  const [city, setCity] = useState('Coimbatore, Tamil Nadu')
  const [upiId, setUpiId] = useState('kovaighat@okhdfcbank')
  const [saving, setSaving] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      showToast.success('Provider profile updated successfully!')
    }, 400)
  }

  return (
    <DashboardLayout role="provider" title="Provider Profile Settings">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display">
            Provider Business & Payout Profile
          </h1>
          <p className="text-xs text-gray-500">
            Manage your host contact details, operational base, and direct settlement UPI ID.
          </p>
        </div>

        <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center space-x-4 pb-4 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0a4d29] flex items-center justify-center font-black text-xl">
              KR
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">{businessName}</h3>
              <p className="text-xs text-gray-500">{user?.email || 'provider@hourlytourism.com'}</p>
              <span className="inline-flex items-center text-[10px] text-emerald-700 font-bold uppercase mt-1">
                <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                Verified Host Partner
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Business / Host Name</label>
              <Input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Business Name"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Contact Phone</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98422 00000"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Operational City / Base</label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Coimbatore, TN"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Payout UPI ID (Instant Escrow)</label>
              <Input
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourid@upi"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button variant="primary" size="md" type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-1.5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

