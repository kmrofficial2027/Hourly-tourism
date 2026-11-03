'use client'

import React, { useState } from 'react'
import { Settings, Save, ShieldCheck, DollarSign, Bell } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { showToast } from '@/components/ui/Toast'

export default function AdminSettingsPage() {
  const [commissionRate, setCommissionRate] = useState('10.0')
  const [taxRate, setTaxRate] = useState('5.0')
  const [minHours, setMinHours] = useState('1')
  const [maxHours, setMaxHours] = useState('12')
  const [cancellationCutoffHours, setCancellationCutoffHours] = useState('4')
  const [loading, setLoading] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      showToast.success('Platform settings updated successfully')
    }, 600)
  }

  return (
    <DashboardLayout role="admin" title="Platform Settings & Rules">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display">
            Platform Configuration
          </h1>
          <p className="text-xs text-gray-500">
            Control marketplace commissions, tax policies, and default hourly limits.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 font-display">
              Commission & Pricing Architecture
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Platform Commission Rate (%)"
                type="number"
                step="0.5"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                helperText="Deducted from gross booking value upon completed trip."
              />

              <Input
                label="Goods & Services Tax (GST %)"
                type="number"
                step="0.5"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                helperText="Government compliance tax applied to platform fee."
              />
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 font-display">
              Hourly Booking Constraints
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Default Min Hours"
                type="number"
                value={minHours}
                onChange={(e) => setMinHours(e.target.value)}
              />

              <Input
                label="Default Max Hours"
                type="number"
                value={maxHours}
                onChange={(e) => setMaxHours(e.target.value)}
              />

              <Input
                label="Free Cancellation Cutoff (Hours)"
                type="number"
                value={cancellationCutoffHours}
                onChange={(e) => setCancellationCutoffHours(e.target.value)}
                helperText="Hours before start time."
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="lg" isLoading={loading}>
              <Save className="w-4 h-4 mr-1.5" />
              Save Configuration
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

