'use client'

import React, { useState, useMemo } from 'react'
import { CreditCard, Download, ShieldCheck, ArrowUpRight, Filter, CheckCircle2 } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

export default function AdminPaymentsPage() {
  const [gatewayFilter, setGatewayFilter] = useState<'all' | 'cashfree' | 'razorpay'>('all')

  const transactions = [
    {
      id: 'tx-cf-01',
      bookingNumber: 'HT-CBE-000101',
      customer: 'Karthik Subramanian',
      amount: 597,
      commission: 60,
      providerPayout: 537,
      date: '2024-03-15',
      gateway: 'Cashfree',
      method: 'Cashfree UPI (GPay)',
      status: 'captured',
    },
    {
      id: 'tx-rzp-02',
      bookingNumber: 'HT-CBE-000102',
      customer: 'Ananya Ramachandran',
      amount: 3196,
      commission: 320,
      providerPayout: 2876,
      date: '2024-03-14',
      gateway: 'Razorpay',
      method: 'Razorpay NetBanking',
      status: 'captured',
    },
    {
      id: 'tx-cf-03',
      bookingNumber: 'HT-CBE-000103',
      customer: 'Suresh Varma',
      amount: 1047,
      commission: 105,
      providerPayout: 942,
      date: '2024-03-12',
      gateway: 'Cashfree',
      method: 'Cashfree Credit Card',
      status: 'captured',
    },
    {
      id: 'tx-rzp-04',
      bookingNumber: 'HT-CBE-000104',
      customer: 'Dr. Meera Nambisan',
      amount: 1745,
      commission: 175,
      providerPayout: 1570,
      date: '2024-03-10',
      gateway: 'Razorpay',
      method: 'Razorpay UPI (PhonePe)',
      status: 'captured',
    },
    {
      id: 'tx-cf-05',
      bookingNumber: 'HT-CBE-000105',
      customer: 'Vigneshwaran & Team',
      amount: 3995,
      commission: 400,
      providerPayout: 3595,
      date: '2024-03-08',
      gateway: 'Cashfree',
      method: 'Cashfree PayLater / NetBanking',
      status: 'captured',
    },
  ]

  const filteredTransactions = useMemo(() => {
    if (gatewayFilter === 'all') return transactions
    return transactions.filter((t) => t.gateway.toLowerCase() === gatewayFilter)
  }, [gatewayFilter])

  const totals = useMemo(() => {
    const totalVolume = transactions.reduce((acc, t) => acc + t.amount, 0)
    const cashfreeVolume = transactions
      .filter((t) => t.gateway === 'Cashfree')
      .reduce((acc, t) => acc + t.amount, 0)
    const razorpayVolume = transactions
      .filter((t) => t.gateway === 'Razorpay')
      .reduce((acc, t) => acc + t.amount, 0)
    const totalCommission = transactions.reduce((acc, t) => acc + t.commission, 0)
    return { totalVolume, cashfreeVolume, razorpayVolume, totalCommission }
  }, [transactions])

  return (
    <DashboardLayout role="admin" title="Dual Payment Gateway Monitor">
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
              Real-time audit of payments received across Cashfree Payments and Razorpay.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 font-semibold">Filter:</span>
            <button
              onClick={() => setGatewayFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                gatewayFilter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Gateways ({transactions.length})
            </button>
            <button
              onClick={() => setGatewayFilter('cashfree')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                gatewayFilter === 'cashfree'
                  ? 'bg-[#0a4d29] text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Cashfree ({transactions.filter((t) => t.gateway === 'Cashfree').length})
            </button>
            <button
              onClick={() => setGatewayFilter('razorpay')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                gatewayFilter === 'razorpay'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
              }`}
            >
              Razorpay ({transactions.filter((t) => t.gateway === 'Razorpay').length})
            </button>
          </div>
        </div>

        {/* 4 Gateway Performance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Total Gross Volume
            </span>
            <h3 className="text-2xl font-black text-gray-900">
              {formatCurrency(totals.totalVolume)}
            </h3>
            <p className="text-[11px] text-gray-500">Combined gateway processing</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Cashfree Volume
            </span>
            <h3 className="text-2xl font-black text-emerald-700">
              {formatCurrency(totals.cashfreeVolume)}
            </h3>
            <p className="text-[11px] text-gray-500">Processed via Cashfree PG</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Razorpay Volume
            </span>
            <h3 className="text-2xl font-black text-blue-700">
              {formatCurrency(totals.razorpayVolume)}
            </h3>
            <p className="text-[11px] text-gray-500">Processed via Razorpay</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
              Platform Commission (10%)
            </span>
            <h3 className="text-2xl font-black text-orange-600">
              {formatCurrency(totals.totalCommission)}
            </h3>
            <p className="text-[11px] text-gray-500">Retained before provider payout</p>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
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
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Gateway</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-4 font-mono font-bold text-gray-900">
                      #{tx.bookingNumber}
                    </td>
                    <td className="p-4">{tx.customer}</td>
                    <td className="p-4 text-gray-500">{tx.date}</td>
                    <td className="p-4 font-bold text-gray-900">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="p-4 font-bold text-emerald-600">
                      {formatCurrency(tx.commission)}
                    </td>
                    <td className="p-4 font-bold text-gray-700">
                      {formatCurrency(tx.providerPayout)}
                    </td>
                    <td className="p-4 text-gray-600">{tx.method}</td>
                    <td className="p-4">
                      {tx.gateway === 'Cashfree' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Cashfree
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          Razorpay
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
