'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp, CreditCard, Clock, Download, Building, RefreshCw } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

export default function ProviderEarningsPage() {
  const [earnings, setEarnings] = useState({
    grossRevenue: 0,
    platformCommission: 0,
    netEarnings: 0,
    pendingPayout: 0,
    completedPayout: 0,
  })
  const [payoutHistory, setPayoutHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadEarnings() {
      setLoading(true)
      try {
        const res = await fetch('/api/provider/earnings')
        if (res.ok) {
          const data = await res.json()
          if (data.earnings) setEarnings(data.earnings)
          if (data.payouts) setPayoutHistory(data.payouts)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadEarnings()
  }, [])

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
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Gross Revenue</span>
            <h3 className="text-2xl font-black text-gray-900">{formatCurrency(earnings.grossRevenue)}</h3>
            <p className="text-[11px] text-gray-400">Total customer hourly value</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Platform Commission (10%)</span>
            <h3 className="text-2xl font-black text-gray-600">{formatCurrency(earnings.platformCommission)}</h3>
            <p className="text-[11px] text-gray-400">Support, hosting & verification fee</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">Net Earnings</span>
            <h3 className="text-2xl font-black text-emerald-700">{formatCurrency(earnings.netEarnings)}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold">Your total profit</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block">Next Payout</span>
            <h3 className="text-2xl font-black text-amber-600">{formatCurrency(earnings.pendingPayout)}</h3>
            <p className="text-[11px] text-amber-600 font-semibold">Pending settlement</p>
          </div>
        </div>

        {/* Bank Account Details */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Bank Account for Payouts</h4>
              <p className="text-xs text-gray-500">
                Add your bank account details to receive automated NEFT payouts.
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm">
            Update Bank Details
          </Button>
        </div>

        {/* Payout History */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 font-display">Payout History</h2>
          {loading ? (
            <p className="text-xs text-gray-400 text-center py-6">Loading...</p>
          ) : payoutHistory.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <CreditCard className="w-8 h-8 text-gray-200 mx-auto" />
              <p className="text-sm text-gray-500 font-semibold">No payouts yet</p>
              <p className="text-xs text-gray-400">Your payout history will appear here once your first payout is processed.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {payoutHistory.map((po) => (
                <div key={po.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(po.amount)}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Settled</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {po.created_at ? new Date(po.created_at).toLocaleDateString('en-IN') : po.date} • {po.reference || po.id}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm">
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
