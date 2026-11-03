'use client'

import React from 'react'
import { TrendingUp, CreditCard, Download } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

export default function CompanyRevenuePage() {
  return (
    <DashboardLayout role="company" title="Company Revenue & Commissions">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display">Financial Performance</h1>
          <p className="text-xs text-gray-500">
            Enterprise gross billing, platform commission, and automated settlement logs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase text-gray-400">Total Billed</span>
            <h3 className="text-2xl font-black text-gray-900">{formatCurrency(182400)}</h3>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase text-gray-400">Platform Commission (10%)</span>
            <h3 className="text-2xl font-black text-gray-600">{formatCurrency(18240)}</h3>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase text-emerald-600">Net Settlements</span>
            <h3 className="text-2xl font-black text-emerald-700">{formatCurrency(164160)}</h3>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

