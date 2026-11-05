'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  RotateCcw,
  Building,
  FileSpreadsheet,
  AlertTriangle,
  Sliders,
  XCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { exportToCSV } from '@/lib/exportUtils'
import { showToast } from '@/components/ui/Toast'

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'refunds' | 'settlements' | 'settings'>('transactions')
  const [gatewayFilter, setGatewayFilter] = useState<'all' | 'cashfree' | 'razorpay'>('all')
  const [transactions, setTransactions] = useState<any[]>([])
  const [refunds, setRefunds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Commission & Tax settings state
  const [commissionSettings, setCommissionSettings] = useState({
    bike: 10,
    car: 12,
    van: 15,
    guide: 10,
    tour: 15,
    experience: 15,
    tdsRate: 1.0,
    gstRate: 18.0,
  })
  const [settingsSaved, setSettingsSaved] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [txRes, refRes] = await Promise.all([
        fetch('/api/admin/payments'),
        fetch('/api/admin/refunds'),
      ])
      if (txRes.ok) {
        const txData = await txRes.json()
        setTransactions(txData.payments || [])
      }
      if (refRes.ok) {
        const refData = await refRes.json()
        setRefunds(refData.refunds || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Handle Approve / Reject refund
  const handleRefundAction = async (bookingId: string, action: 'approve' | 'reject', refundAmount: number) => {
    setActionLoading(`${action}-${bookingId}`)
    try {
      const res = await fetch('/api/admin/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, action, refundAmount }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast.success(action === 'approve' ? 'Refund processed and credited to customer' : 'Refund request rejected')
        loadData()
      } else {
        showToast.error(data.error || 'Failed to process refund')
      }
    } catch (err: any) {
      showToast.error(err.message || 'Error executing refund')
    } finally {
      setActionLoading(null)
    }
  }

  // Handle Retry Payout
  const handleRetryPayout = async (payoutId: string, providerId: string, amount: number) => {
    setActionLoading(`payout-${payoutId}`)
    try {
      const res = await fetch('/api/admin/payouts/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId, providerId, amount }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast.success('NEFT Settlement initiated with banking partner')
        loadData()
      } else {
        showToast.error(data.error || 'Payout retry failed')
      }
    } catch (err: any) {
      showToast.error(err.message || 'Error processing payout')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredTransactions = useMemo(() => {
    if (gatewayFilter === 'all') return transactions
    return transactions.filter(
      (t) => (t.gateway || t.payment_method || '').toLowerCase() === gatewayFilter
    )
  }, [gatewayFilter, transactions])

  const totals = useMemo(() => {
    const totalVolume = transactions.reduce((acc, t) => acc + Number(t.amount || 0), 0)
    const cashfreeVolume = transactions
      .filter((t) => (t.gateway || '').toLowerCase() === 'cashfree')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0)
    const razorpayVolume = transactions
      .filter((t) => (t.gateway || '').toLowerCase() === 'razorpay')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0)
    const totalCommission = transactions.reduce(
      (acc, t) => acc + Number(t.platform_fee || t.commission || 0),
      0
    )
    return { totalVolume, cashfreeVolume, razorpayVolume, totalCommission }
  }, [transactions])

  // Export current view to CSV
  const handleExport = () => {
    if (activeTab === 'transactions') {
      const columns = [
        { header: 'Booking Number', key: 'booking_number' },
        { header: 'Customer', key: 'customer_name' },
        { header: 'Gross Amount', key: 'amount' },
        { header: 'Platform Fee', key: 'platform_fee' },
        { header: 'Gateway', key: 'gateway' },
        { header: 'Status', key: 'status' },
      ]
      exportToCSV('admin-transactions', filteredTransactions, columns)
    } else if (activeTab === 'refunds') {
      const columns = [
        { header: 'Booking Number', key: 'bookingNumber' },
        { header: 'Customer', key: 'customerName' },
        { header: 'Email', key: 'customerEmail' },
        { header: 'Refund Amount', key: 'refundAmount' },
        { header: 'Reason', key: 'reason' },
        { header: 'Status', key: 'status' },
      ]
      exportToCSV('admin-refund-queue', refunds, columns)
    } else {
      const columns = [
        { header: 'Transaction ID', key: 'id' },
        { header: 'Amount', key: 'amount' },
        { header: 'Status', key: 'status' },
        { header: 'Gateway', key: 'gateway' },
      ]
      exportToCSV('admin-finance-export', transactions, columns)
    }
  }

  return (
    <DashboardLayout role="admin" title="Payments & Revenue Finance Workbench">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-900">
                Cashfree & Razorpay Dual-Gateway Active
              </span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 font-display mt-1">
              Escrow & Transaction Settlement Logs
            </h1>
            <p className="text-xs text-gray-500">
              Audit dual-gateway collections, approve policy refunds, track provider payouts, and configure statutory commission rates.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="rounded-xl">
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="rounded-xl">
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* 4 Gateway Performance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Total Gross Volume
            </span>
            <h3 className="text-2xl font-black text-gray-900 font-display">{formatCurrency(totals.totalVolume)}</h3>
            <p className="text-[11px] text-gray-500">Combined gateway processing</p>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Cashfree Volume
            </span>
            <h3 className="text-2xl font-black text-emerald-700 font-display">{formatCurrency(totals.cashfreeVolume)}</h3>
            <p className="text-[11px] text-gray-500">Processed via Cashfree PG</p>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Razorpay Volume
            </span>
            <h3 className="text-2xl font-black text-blue-700 font-display">{formatCurrency(totals.razorpayVolume)}</h3>
            <p className="text-[11px] text-gray-500">Processed via Razorpay</p>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
              Platform Take Rate (10-15%)
            </span>
            <h3 className="text-2xl font-black text-orange-600 font-display">{formatCurrency(totals.totalCommission)}</h3>
            <p className="text-[11px] text-gray-500">Retained before provider payout</p>
          </div>
        </div>

        {/* Module Tabs Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 ${
              activeTab === 'transactions'
                ? 'border-[#ff7a00] text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Dual-Gateway Logs ({transactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('refunds')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 ${
              activeTab === 'refunds'
                ? 'border-[#ff7a00] text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Refund Queue ({refunds.filter((r) => r.status === 'pending_approval').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settlements')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 ${
              activeTab === 'settlements'
                ? 'border-[#ff7a00] text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Provider Settlements & Retries</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 ${
              activeTab === 'settings'
                ? 'border-[#ff7a00] text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Commission & Tax Matrix</span>
          </button>
        </div>

        {/* TAB 1: Dual-Gateway Transactions */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 font-semibold">Gateway Filter:</span>
              <button
                onClick={() => setGatewayFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  gatewayFilter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({transactions.length})
              </button>
              <button
                onClick={() => setGatewayFilter('cashfree')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  gatewayFilter === 'cashfree'
                    ? 'bg-[#0a4d29] text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Cashfree
              </button>
              <button
                onClick={() => setGatewayFilter('razorpay')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  gatewayFilter === 'razorpay'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                }`}
              >
                Razorpay
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-xs text-gray-400">Loading transactions...</div>
              ) : filteredTransactions.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <CreditCard className="w-10 h-10 text-gray-200 mx-auto" />
                  <p className="text-sm font-semibold text-gray-500">No transactions recorded</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                      <tr>
                        <th className="p-4">Transaction / Booking</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Gross Amount</th>
                        <th className="p-4">Platform Fee</th>
                        <th className="p-4">Host Net</th>
                        <th className="p-4">Gateway</th>
                        <th className="p-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {filteredTransactions.map((tx) => {
                        const gateway = (
                          tx.gateway ||
                          tx.notes?.gateway ||
                          tx.payment_method ||
                          ''
                        ).toLowerCase()
                        return (
                          <tr key={tx.id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="p-4 font-mono font-bold text-gray-900">
                              #{tx.booking_number || tx.bookings?.booking_number || tx.booking_id?.slice(0, 8)}
                            </td>
                            <td className="p-4">{tx.customer_name || tx.bookings?.profiles?.full_name || '—'}</td>
                            <td className="p-4 text-gray-500">
                              {tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-IN') : '—'}
                            </td>
                            <td className="p-4 font-bold text-gray-900">{formatCurrency(Number(tx.amount))}</td>
                            <td className="p-4 font-bold text-emerald-600">
                              {formatCurrency(Number(tx.platform_fee || tx.commission || 0))}
                            </td>
                            <td className="p-4 font-bold text-gray-700">
                              {formatCurrency(Number(tx.amount) - Number(tx.platform_fee || tx.commission || 0))}
                            </td>
                            <td className="p-4">
                              {gateway.includes('cashfree') ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Cashfree
                                </span>
                              ) : gateway.includes('razorpay') ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                  Razorpay
                                </span>
                              ) : (
                                <span className="text-gray-400 text-[10px]">{tx.payment_method || '—'}</span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {tx.status || 'completed'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Refund Queue */}
        {activeTab === 'refunds' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 font-display">
                  Cancellation & Refund Approval Queue
                </h3>
                <p className="text-xs text-gray-500">
                  Review customer-initiated cancellations and exceptions. Approving triggers gateway reverse-payout.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-gray-400">Loading refund queue...</div>
            ) : refunds.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-gray-700">Refund queue is all clear</p>
                <p className="text-xs text-gray-400">No pending cancellations requiring refund review.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Booking</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Reason</th>
                      <th className="p-4 text-right">Refund Amount</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {refunds.map((ref) => {
                      const isPending = ref.status === 'pending_approval'
                      const isActing = actionLoading?.includes(ref.id)
                      return (
                        <tr key={ref.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="p-4 font-mono font-bold text-gray-900">
                            #{ref.bookingNumber}
                            <span className="block text-[11px] font-sans text-gray-400 font-normal">
                              {ref.serviceTitle}
                            </span>
                          </td>

                          <td className="p-4">
                            <span className="font-semibold text-gray-800 block">{ref.customerName}</span>
                            <span className="text-[11px] text-gray-400">{ref.customerEmail}</span>
                          </td>

                          <td className="p-4 text-gray-600 max-w-xs truncate" title={ref.reason}>
                            {ref.reason}
                          </td>

                          <td className="p-4 text-right font-black text-emerald-700 text-sm">
                            {formatCurrency(ref.refundAmount)}
                          </td>

                          <td className="p-4 text-center">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                ref.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ref.status === 'completed' ? 'Refunded' : 'Awaiting Approval'}
                            </span>
                          </td>

                          <td className="p-4 text-right space-x-2">
                            {isPending ? (
                              <>
                                <button
                                  onClick={() => handleRefundAction(ref.id, 'approve', ref.refundAmount)}
                                  disabled={Boolean(isActing)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                                >
                                  Approve & Issue
                                </button>
                                <button
                                  onClick={() => handleRefundAction(ref.id, 'reject', ref.refundAmount)}
                                  disabled={Boolean(isActing)}
                                  className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-bold text-xs transition-all disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-gray-400 text-xs">Processed</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Settlements & Retries */}
        {activeTab === 'settlements' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 font-display">
                Automated NEFT Bank Settlement Batches
              </h3>
              <p className="text-xs text-gray-500">
                Hourly tourism transfers net host earnings after deductions (10% platform fee and 1% TDS).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-emerald-700">Settlement Frequency</span>
                <p className="text-sm font-black text-emerald-900">Daily at 18:00 IST</p>
                <p className="text-[11px] text-emerald-600">Automated RBI NEFT window</p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-blue-700">Grace Holding Period</span>
                <p className="text-sm font-black text-blue-900">2 Hours Post-Trip</p>
                <p className="text-[11px] text-blue-600">For dispute buffer before release</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-700">Bank Gateway Status</span>
                <p className="text-sm font-black text-amber-900">Operational (100% Payout SLA)</p>
                <p className="text-[11px] text-amber-600">Dual payout routers enabled</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                Retry Failed Settlement Workflow
              </h4>
              <p className="text-xs text-gray-500 mb-4">
                If a host bank rejects an IFSC or account verification, update the account and click retry below.
              </p>

              <div className="flex items-center space-x-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleRetryPayout('batch-retry-manual', 'all-pending', 0)}
                  className="rounded-xl font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Run Pending Settlements Batch Now
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Commission & Tax Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 font-display">
                Category Commission & Statutory Tax Matrix
              </h3>
              <p className="text-xs text-gray-500">
                Configure platform take rates per transport category and statutory taxes (TDS 194-O & GST).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Bike */}
              <div className="p-4 rounded-2xl border border-gray-200 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block">
                  Bike Tourist Rides Commission
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={commissionSettings.bike}
                    onChange={(e) => setCommissionSettings({ ...commissionSettings, bike: Number(e.target.value) })}
                    className="w-20 px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 text-center"
                  />
                  <span className="text-sm font-bold text-gray-500">% per hour</span>
                </div>
              </div>

              {/* Car */}
              <div className="p-4 rounded-2xl border border-gray-200 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block">
                  Car Tourist Rides Commission
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={commissionSettings.car}
                    onChange={(e) => setCommissionSettings({ ...commissionSettings, car: Number(e.target.value) })}
                    className="w-20 px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 text-center"
                  />
                  <span className="text-sm font-bold text-gray-500">% per hour</span>
                </div>
              </div>

              {/* Van */}
              <div className="p-4 rounded-2xl border border-gray-200 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block">
                  Van Group Tours Commission
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={commissionSettings.van}
                    onChange={(e) => setCommissionSettings({ ...commissionSettings, van: Number(e.target.value) })}
                    className="w-20 px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 text-center"
                  />
                  <span className="text-sm font-bold text-gray-500">% per hour</span>
                </div>
              </div>

              {/* Guide */}
              <div className="p-4 rounded-2xl border border-gray-200 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block">
                  Local Guide Commission
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={commissionSettings.guide}
                    onChange={(e) => setCommissionSettings({ ...commissionSettings, guide: Number(e.target.value) })}
                    className="w-20 px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 text-center"
                  />
                  <span className="text-sm font-bold text-gray-500">% per hour</span>
                </div>
              </div>

              {/* TDS Rate */}
              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-800 block">
                  TDS Rate (Sec 194-O)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.1"
                    value={commissionSettings.tdsRate}
                    onChange={(e) => setCommissionSettings({ ...commissionSettings, tdsRate: Number(e.target.value) })}
                    className="w-20 px-3 py-2 rounded-xl border border-amber-200 text-sm font-bold text-amber-900 text-center bg-white"
                  />
                  <span className="text-sm font-bold text-amber-700">% statutory</span>
                </div>
              </div>

              {/* GST Rate */}
              <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-800 block">
                  GST on Platform Fee
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={commissionSettings.gstRate}
                    onChange={(e) => setCommissionSettings({ ...commissionSettings, gstRate: Number(e.target.value) })}
                    className="w-20 px-3 py-2 rounded-xl border border-blue-200 text-sm font-bold text-blue-900 text-center bg-white"
                  />
                  <span className="text-sm font-bold text-blue-700">% GST (SAC 9985)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              {settingsSaved && (
                <span className="text-xs font-bold text-emerald-700 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                  Commission and tax settings updated successfully!
                </span>
              )}
              <Button
                variant="primary"
                onClick={() => {
                  setSettingsSaved(true)
                  showToast.success('Financial matrix updated successfully')
                  setTimeout(() => setSettingsSaved(false), 3000)
                }}
                className="ml-auto rounded-xl font-bold"
              >
                Save Financial Settings
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
