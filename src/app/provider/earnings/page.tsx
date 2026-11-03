'use client'

import React, { useState } from 'react'
import {
  TrendingUp,
  CreditCard,
  Clock,
  CheckCircle2,
  Download,
  Building,
  ArrowUpRight,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

export default function ProviderEarningsPage() {
  const [earnings, setEarnings] = useState({
    grossRevenue: 24500,
    platformCommission: 2450,
    netEarnings: 22050,
    pendingPayout: 6800,
    completedPayout: 15250,
  })

  const payoutHistory = [
    {
      id: 'po_01',
      date: '2024-03-12',
      amount: 8450,
      status: 'completed',
      bank: 'HDFC Bank ending in **4120',
      reference: 'NEFT-HT-89104',
    },
    {
      id: 'po_02',
      date: '2024-03-05',
      amount: 6800,
      status: 'completed',
      bank: 'HDFC Bank ending in **4120',
      reference: 'NEFT-HT-78210',
    },
  ]

  return (
    <DashboardLayout role="provider" title="Earnings & Payouts">
      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display">Revenue Breakdown</h1>
          <p className="text-xs text-gray-500">
            Track gross hourly revenue, platform commission deductions, and direct bank payouts.
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
              Gross Revenue
            </span>
            <h3 className="text-2xl font-black text-gray-900">
              {formatCurrency(earnings.grossRevenue)}
            </h3>
            <p className="text-[11px] text-gray-400">Total customer hourly value</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
              Platform Commission (10%)
            </span>
            <h3 className="text-2xl font-black text-gray-600">
              {formatCurrency(earnings.platformCommission)}
            </h3>
            <p className="text-[11px] text-gray-400">Support, hosting & verification fee</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
              Net Earnings
            </span>
            <h3 className="text-2xl font-black text-emerald-700">
              {formatCurrency(earnings.netEarnings)}
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold">Your total profit</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
              Next Payout
            </span>
            <h3 className="text-2xl font-black text-amber-600">
              {formatCurrency(earnings.pendingPayout)}
            </h3>
            <p className="text-[11px] text-amber-600 font-semibold">Scheduled for Tuesday</p>
          </div>
        </div>

        {/* Bank Account Details */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Registered Bank Account</h4>
              <p className="text-xs text-gray-500">
                HDFC Bank • A/C No: **********4120 • IFSC: HDFC0001243
              </p>
              <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
                Verified for automated NEFT
              </span>
            </div>
          </div>

          <Button variant="secondary" size="sm">
            Update Bank Details
          </Button>
        </div>

        {/* Payout History Table */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 font-display">Payout History</h2>
          <div className="divide-y divide-gray-100">
            {payoutHistory.map((po) => (
              <div key={po.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(po.amount)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Settled
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {po.date} • {po.reference} • {po.bank}
                  </p>
                </div>
                <Button variant="secondary" size="sm">
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

