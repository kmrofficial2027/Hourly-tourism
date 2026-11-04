'use client'

import React, { useState } from 'react'
import { Building2, Phone, Mail, MapPin, ShieldCheck, Save, Users } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { showToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'

export default function CompanyProfilePage() {
  const { user } = useAuth()
  const [companyName, setCompanyName] = useState('Kongu Tourist Chauffeur Fleet Ltd.')
  const [gstNumber, setGstNumber] = useState('33AABCK1234F1Z8')
  const [fleetSize, setFleetSize] = useState('18 Vehicles (Cars & Vans)')
  const [city, setCity] = useState('Gandhipuram, Coimbatore')
  const [saving, setSaving] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      showToast.success('Company fleet profile updated!')
    }, 400)
  }

  return (
    <DashboardLayout role="company" title="Fleet Company Profile">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display">
            Commercial Fleet & Entity Settings
          </h1>
          <p className="text-xs text-gray-500">
            Maintain your legal business registrations, tax invoicing GSTIN, and dispatch base.
          </p>
        </div>

        <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center space-x-4 pb-4 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-orange-100 text-[#ff7a00] flex items-center justify-center font-black text-xl">
              KF
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">{companyName}</h3>
              <p className="text-xs text-gray-500">{user?.email || 'company@hourlytourism.com'}</p>
              <span className="inline-flex items-center text-[10px] text-emerald-700 font-bold uppercase mt-1">
                <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                Licensed Commercial Operator
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Company Entity Name</label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">GSTIN Number</label>
              <Input
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Fleet Capacity</label>
              <Input
                value={fleetSize}
                onChange={(e) => setFleetSize(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Fleet Dispatch Hub</label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button variant="primary" size="md" type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-1.5" />
              {saving ? 'Saving...' : 'Save Fleet Profile'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

