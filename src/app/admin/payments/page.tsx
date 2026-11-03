'use client'

import React from 'react'
import { CreditCard, Download, ShieldCheck, ArrowUpRight } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

export default function AdminPaymentsPage() {
  const transactions = [
    {
      id: 'tx-01',
      bookingNumber: 'HT-2024-000001',
      customer: 'Rahul Sen',
      amount: 438,
      commission: 40,
      providerPayout: 398,
      date: '2024-03-15',
      gateway: 'Razorpay',
      status: 'captured',
    },
    {
      id: 'tx-02',
      bookingNumber: 'HT-2024-000002',
      customer: 'Priya Nambiar',
      amount: 1475,
      commission: 135,
      providerPayout: 1340,
      date: '2024-03-10',
      gateway: 'Razorpay',
      status: 'captured',
    },
  ]

  return (
    <DashboardLayout role="admin" title="Payments & Revenue Settlement">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display">
            Razorpay Transaction Logs
          </h1>
          <p className="text-xs text-gray-500">
            Escrow tracking, payment capture receipts, and provider commission split.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Transaction / Booking</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Gross Amount</th>
                  <th className="p-4">Platform Cut (10%)</th>
                  <th className="p-4">Net to Host</th>
                  <th className="p-4">Gateway</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {transactions.map((tx) => (
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
                    <td className="p-4">{tx.gateway}</td>
                    <td className="p-4 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
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

