'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp, CreditCard, Download, RefreshCw } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

export default function CompanyRevenuePage() {
  const [revenue, setRevenue] = useState({
    totalBilled: 0,
    platformCommission: 0,
    netSettlement: 0,
  })
  const [loading, setLoading] = useState(true)

  const loadRevenue = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/bookings?role=company')
      if (res.ok) {
        const data = await res.json()
        const bookings = data.bookings || []
        const paid = bookings.filter((b: any) => ['paid', 'completed'].includes(b.payment_status))
        const total = paid.reduce((acc: number, b: any) => acc + Number(b.total_amount || 0), 0)
        const commission = Math.round(total * 0.1)
        const net = total - commission
        setRevenue({
          totalBilled: total,
          platformCommission: commission,
          netSettlement: net,
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRevenue()
  }, [])

  return (
    <DashboardLayout role="company" title="Company Revenue & Commissions">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-display">Financial Performance</h1>
            <p className="text-xs text-gray-500">
              Enterprise gross billing, platform commission, and automated settlement logs.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadRevenue} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase text-gray-400">Total Billed</span>
            <h3 className="text-2xl font-black text-gray-900">{formatCurrency(revenue.totalBilled)}</h3>
            <p className="text-[11px] text-gray-400">Paid customer reservations</p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase text-gray-400">Platform Commission (10%)</span>
            <h3 className="text-2xl font-black text-gray-600">{formatCurrency(revenue.platformCommission)}</h3>
            <p className="text-[11px] text-gray-400">Platform hosting fee</p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase text-emerald-600">Net Settlements</span>
            <h3 className="text-2xl font-black text-emerald-700">{formatCurrency(revenue.netSettlement)}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold">Your fleet earnings</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
