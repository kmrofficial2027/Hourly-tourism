'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  CreditCard,
  Clock,
  Download,
  Building,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  ArrowUpRight,
  Percent,
  QrCode,
  Check,
  UploadCloud,
  X,
  Sparkles,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { showToast } from '@/components/ui/Toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { exportToCSV } from '@/lib/exportUtils'
import { printBookingInvoice } from '@/lib/invoiceUtils'

export default function ProviderEarningsPage() {
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [earnings, setEarnings] = useState({
    grossRevenue: 0,
    platformCommission: 0,
    tdsDeduction: 0,
    netEarnings: 0,
    pendingPayout: 0,
    completedPayout: 0,
    completedTrips: 0,
  })
  const [ledger, setLedger] = useState<any[]>([])
  const [payoutHistory, setPayoutHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Payment & Payout Methods State
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [payoutLoading, setPayoutLoading] = useState(false)
  const [payoutMethods, setPayoutMethods] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    accountType: 'Savings',
    upiId: '',
    qrCodeUrl: '',
    primaryMethod: 'bank_transfer',
    isVerified: false,
  })

  // Edit form state
  const [formBankName, setFormBankName] = useState('')
  const [formAccountHolder, setFormAccountHolder] = useState('')
  const [formAccountNumber, setFormAccountNumber] = useState('')
  const [formIfscCode, setFormIfscCode] = useState('')
  const [formAccountType, setFormAccountType] = useState('Savings')
  const [formUpiId, setFormUpiId] = useState('')
  const [formQrCodeUrl, setFormQrCodeUrl] = useState('')
  const [formPrimaryMethod, setFormPrimaryMethod] = useState<'bank_transfer' | 'upi_qr'>('bank_transfer')

  const loadPayoutMethods = async () => {
    try {
      const res = await fetch('/api/provider/payout-methods')
      if (res.ok) {
        const data = await res.json()
        if (data.payoutMethods) {
          setPayoutMethods(data.payoutMethods)
          setFormBankName(data.payoutMethods.bankName || '')
          setFormAccountHolder(data.payoutMethods.accountHolderName || '')
          setFormAccountNumber(data.payoutMethods.accountNumber || '')
          setFormIfscCode(data.payoutMethods.ifscCode || '')
          setFormAccountType(data.payoutMethods.accountType || 'Savings')
          setFormUpiId(data.payoutMethods.upiId || '')
          setFormQrCodeUrl(data.payoutMethods.qrCodeUrl || '')
          setFormPrimaryMethod(data.payoutMethods.primaryMethod || 'bank_transfer')
        }
      }
    } catch (err) {
      // silent
    }
  }

  const handleSavePayoutMethods = async (e: React.FormEvent) => {
    e.preventDefault()
    setPayoutLoading(true)
    try {
      const res = await fetch('/api/provider/payout-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: formBankName,
          accountHolderName: formAccountHolder,
          accountNumber: formAccountNumber,
          ifscCode: formIfscCode,
          accountType: formAccountType,
          upiId: formUpiId,
          qrCodeUrl: formQrCodeUrl,
          primaryMethod: formPrimaryMethod,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setPayoutMethods({
          bankName: formBankName,
          accountHolderName: formAccountHolder,
          accountNumber: formAccountNumber,
          ifscCode: formIfscCode,
          accountType: formAccountType,
          upiId: formUpiId,
          qrCodeUrl: formQrCodeUrl,
          primaryMethod: formPrimaryMethod,
          isVerified: true,
        })
        showToast.success('Payout methods updated successfully!')
        setShowPayoutModal(false)
      } else {
        showToast.error('Failed to update payout methods.')
      }
    } catch {
      showToast.error('Network error saving payout methods.')
    } finally {
      setPayoutLoading(false)
    }
  }

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      showToast.error('QR code image must be under 3MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setFormQrCodeUrl(reader.result as string)
      showToast.success('QR Code image uploaded!')
    }
    reader.readAsDataURL(file)
  }

  const loadEarnings = async (range: string = dateRange) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/provider/earnings?range=${range}`)
      if (res.ok) {
        const data = await res.json()
        if (data.earnings) setEarnings(data.earnings)
        if (data.ledger) setLedger(data.ledger)
        if (data.payouts) setPayoutHistory(data.payouts)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEarnings(dateRange)
    loadPayoutMethods()
  }, [dateRange])

  // Export full ledger to CSV
  const handleExportCSV = () => {
    if (ledger.length === 0) return
    const columns = [
      { header: 'Booking Number', key: 'bookingNumber' },
      { header: 'Service Title', key: 'serviceTitle' },
      { header: 'Category', key: 'category' },
      { header: 'Customer', key: 'customerName' },
      { header: 'Trip Date', key: 'bookingDate' },
      { header: 'Duration (Hrs)', key: 'durationHours' },
      { header: 'Gross Amount (INR)', key: 'grossAmount' },
      { header: 'Platform Fee (INR)', key: 'commissionAmount' },
      { header: 'TDS (1%)', key: 'tdsAmount' },
      { header: 'Net Payable (INR)', key: 'netPayable' },
      { header: 'Trip Status', key: 'tripStatus' },
      { header: 'Payout Status', key: 'payoutStatus' },
    ]
    exportToCSV(`provider-earnings-ledger-${dateRange}`, ledger, columns)
  }

  return (
    <DashboardLayout role="provider" title="Earnings & Payouts">
      <div className="space-y-8">
        {/* Header & Date Range Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-display">Revenue & Settlements</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Transparent hourly revenue breakdown, platform fees, statutory TDS (1%), and direct bank settlements.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-gray-100 p-1 rounded-2xl">
              {[
                { id: 'all', label: 'All Time' },
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDateRange(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    dateRange === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={ledger.length === 0}
              className="rounded-2xl"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* 5 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Gross Volume
            </span>
            <h3 className="text-2xl font-black text-gray-900 font-display">
              {formatCurrency(earnings.grossRevenue)}
            </h3>
            <p className="text-[11px] text-gray-400">Total customer hourly value</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Platform Fee (10%)
            </span>
            <h3 className="text-2xl font-black text-gray-600 font-display">
              {formatCurrency(earnings.platformCommission)}
            </h3>
            <p className="text-[11px] text-gray-400">Hosting, escrow & support</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
              TDS Withheld (1%)
            </span>
            <h3 className="text-2xl font-black text-amber-700 font-display">
              {formatCurrency(earnings.tdsDeduction)}
            </h3>
            <p className="text-[11px] text-amber-600">Sec 194-O Income Tax</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
              Net Payable Profit
            </span>
            <h3 className="text-2xl font-black text-emerald-700 font-display">
              {formatCurrency(earnings.netEarnings)}
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold">Your total profit</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
              Settled to Bank
            </span>
            <h3 className="text-2xl font-black text-blue-700 font-display">
              {formatCurrency(earnings.completedPayout)}
            </h3>
            <p className="text-[11px] text-blue-600">Direct NEFT credited</p>
          </div>
        </div>

        {/* Booking-Wise Earnings Ledger Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 font-display">
                Trip Earnings Ledger
              </h2>
              <p className="text-xs text-gray-500">
                Transparent itemized breakdown of every booking, statutory deductions, and payout status.
              </p>
            </div>
            <div className="text-xs font-semibold text-gray-400">
              Showing {ledger.length} {ledger.length === 1 ? 'record' : 'records'}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-gray-400">Loading ledger records...</div>
          ) : ledger.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <CreditCard className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-600">No earnings recorded for this period</p>
              <p className="text-xs text-gray-400">
                Complete confirmed trips to see detailed ledger credits and bank settlements.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3.5">Booking / Trip</th>
                    <th className="px-4 py-3.5">Customer</th>
                    <th className="px-4 py-3.5 text-right">Gross</th>
                    <th className="px-4 py-3.5 text-right">Comm (10%)</th>
                    <th className="px-4 py-3.5 text-right">TDS (1%)</th>
                    <th className="px-4 py-3.5 text-right">Net Payable</th>
                    <th className="px-4 py-3.5 text-center">Settlement</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {ledger.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <Link
                          href={`/provider/bookings/${row.id}`}
                          className="font-mono font-bold text-gray-900 hover:text-[#ff7a00] flex items-center"
                        >
                          {row.bookingNumber}
                          <ArrowUpRight className="w-3 h-3 ml-1 text-gray-400" />
                        </Link>
                        <span className="text-[11px] text-gray-400 block truncate max-w-[200px]">
                          {row.serviceTitle} ({row.durationHours}h)
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-semibold text-gray-800 block truncate max-w-[140px]">
                          {row.customerName}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatDate(row.bookingDate)}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right font-bold text-gray-900">
                        {formatCurrency(row.grossAmount)}
                      </td>

                      <td className="px-4 py-4 text-right text-gray-500">
                        -{formatCurrency(row.commissionAmount)}
                      </td>

                      <td className="px-4 py-4 text-right text-amber-600">
                        -{formatCurrency(row.tdsAmount)}
                      </td>

                      <td className="px-4 py-4 text-right font-black text-emerald-700">
                        {formatCurrency(row.netPayable)}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            row.payoutStatus === 'settled'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {row.payoutStatus === 'settled' ? 'Settled' : 'In Escrow'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() =>
                            printBookingInvoice({
                              bookingNumber: row.bookingNumber,
                              invoiceNumber: `INV-${row.bookingNumber}`,
                              bookingDate: row.bookingDate || new Date().toISOString().slice(0, 10),
                              startTime: '09:00',
                              endTime: '17:00',
                              durationHours: row.durationHours,
                              serviceTitle: row.serviceTitle,
                              serviceCategory: row.category,
                              customerName: row.customerName,
                              customerEmail: 'customer@hourlytourism.com',
                              providerName: 'Host Settlement Voucher',
                              hourlyRate: Math.round(row.grossAmount / Math.max(1, row.durationHours)),
                              basePrice: row.grossAmount,
                              platformFee: row.commissionAmount,
                              taxes: row.tdsAmount,
                              totalAmount: row.netPayable,
                              paymentStatus: 'paid',
                              paymentMethod: 'NEFT Direct Bank Settlement',
                            })
                          }
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
                          title="Download Settlement Voucher"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Payment & Payout Methods Management ─────────────────── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-gray-900 font-display">
                  Payout Methods & Settlement Configuration
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {payoutMethods.isVerified || payoutMethods.accountNumber ? 'Configured ✓' : 'Setup Required'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Configure your direct bank transfer account, UPI VPA, and upload your payment QR code for automated payouts.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowPayoutModal(true)}
              className="bg-gradient-to-r from-orange-500 to-amber-500 border-none font-bold shrink-0"
            >
              <CreditCard className="w-3.5 h-3.5 mr-1.5" />
              Manage Payment Methods
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Method 1: Direct Bank Transfer */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                payoutMethods.primaryMethod === 'bank_transfer'
                  ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-300'
                  : 'bg-gray-50/60 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-emerald-700 flex items-center justify-center shadow-sm">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">Direct Bank Transfer (NEFT/IMPS)</h4>
                    <p className="text-[11px] text-gray-500">Automated end-of-day bank credit</p>
                  </div>
                </div>
                {payoutMethods.primaryMethod === 'bank_transfer' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                    Primary
                  </span>
                )}
              </div>

              {payoutMethods.accountNumber ? (
                <div className="space-y-1 text-xs text-gray-600 pt-2 border-t border-gray-200/60">
                  <p>
                    <span className="text-gray-400 font-medium">Bank:</span>{' '}
                    <strong className="text-gray-800">{payoutMethods.bankName || 'Verified Bank'}</strong>
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">Account:</span>{' '}
                    <strong className="text-gray-800">
                      •••• •••• {payoutMethods.accountNumber.slice(-4)} ({payoutMethods.accountType})
                    </strong>
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">IFSC:</span>{' '}
                    <strong className="text-gray-800">{payoutMethods.ifscCode}</strong>
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">Beneficiary:</span>{' '}
                    <strong className="text-gray-800">{payoutMethods.accountHolderName}</strong>
                  </p>
                </div>
              ) : (
                <div className="pt-2 text-xs text-amber-700 font-medium">
                  ⚠️ No bank account added yet. Click &quot;Manage Payment Methods&quot; to configure.
                </div>
              )}
            </div>

            {/* Method 2: UPI ID & QR Code */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                payoutMethods.primaryMethod === 'upi_qr'
                  ? 'bg-orange-50/50 border-orange-300 ring-1 ring-orange-300'
                  : 'bg-gray-50/60 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-orange-600 flex items-center justify-center shadow-sm">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">UPI VPA & Payout QR Code</h4>
                    <p className="text-[11px] text-gray-500">Instant UPI transfer & QR settlements</p>
                  </div>
                </div>
                {payoutMethods.primaryMethod === 'upi_qr' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-600 text-white">
                    Primary
                  </span>
                )}
              </div>

              {payoutMethods.upiId || payoutMethods.qrCodeUrl ? (
                <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                  <div className="space-y-1 text-xs text-gray-600">
                    <p>
                      <span className="text-gray-400 font-medium">UPI VPA:</span>{' '}
                      <strong className="text-gray-800">{payoutMethods.upiId || 'Not set'}</strong>
                    </p>
                    <p>
                      <span className="text-gray-400 font-medium">QR Status:</span>{' '}
                      <strong className="text-emerald-700">
                        {payoutMethods.qrCodeUrl ? 'QR Uploaded ✓' : 'No QR image'}
                      </strong>
                    </p>
                  </div>
                  {payoutMethods.qrCodeUrl && (
                    <img
                      src={payoutMethods.qrCodeUrl}
                      alt="Provider Payout QR Code"
                      className="w-16 h-16 rounded-xl border border-gray-300 object-contain bg-white p-1"
                    />
                  )}
                </div>
              ) : (
                <div className="pt-2 text-xs text-amber-700 font-medium">
                  ⚠️ No UPI ID or QR Code uploaded yet. Add them for instant settlement routing.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal: Add/Update Payment & Payout Methods */}
        {showPayoutModal && (
          <Modal
            isOpen={true}
            onClose={() => setShowPayoutModal(false)}
            title="Configure Payment Methods & Payout QR"
          >
            <form onSubmit={handleSavePayoutMethods} className="space-y-6">
              {/* Primary Payout Method Toggle */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-2">
                  Select Primary Payout Destination
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormPrimaryMethod('bank_transfer')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      formPrimaryMethod === 'bank_transfer'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Building className="w-4 h-4 text-emerald-600" />
                    <span>Direct Bank Account</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormPrimaryMethod('upi_qr')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      formPrimaryMethod === 'upi_qr'
                        ? 'bg-orange-50 border-orange-500 text-orange-800 shadow-sm'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-orange-600" />
                    <span>UPI ID / QR Code</span>
                  </button>
                </div>
              </div>

              {/* Bank Account Fields */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-emerald-600" />
                  Bank Account Transfer Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Bank Name"
                    placeholder="e.g. HDFC Bank, SBI, ICICI"
                    value={formBankName}
                    onChange={(e) => setFormBankName(e.target.value)}
                  />
                  <Input
                    label="Account Holder Name"
                    placeholder="As printed on Passbook / Cheque"
                    value={formAccountHolder}
                    onChange={(e) => setFormAccountHolder(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Bank Account Number"
                    placeholder="Enter account number"
                    value={formAccountNumber}
                    onChange={(e) => setFormAccountNumber(e.target.value)}
                  />
                  <Input
                    label="IFSC Code"
                    placeholder="e.g. HDFC0001234"
                    value={formIfscCode}
                    onChange={(e) => setFormIfscCode(e.target.value.toUpperCase())}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Account Type</label>
                  <select
                    value={formAccountType}
                    onChange={(e) => setFormAccountType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Savings">Savings Account</option>
                    <option value="Current">Current Business Account</option>
                  </select>
                </div>
              </div>

              {/* UPI & QR Code Fields */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-orange-600" />
                  UPI & Payout QR Code
                </h4>

                <Input
                  label="UPI VPA ID"
                  placeholder="e.g. yourname@okhdfcbank or phone@upi"
                  value={formUpiId}
                  onChange={(e) => setFormUpiId(e.target.value)}
                />

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Upload Custom UPI / Payment QR Code
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm transition-colors">
                      <UploadCloud className="w-4 h-4 text-orange-600" />
                      <span>{formQrCodeUrl ? 'Replace QR Code' : 'Choose QR Image'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleQrUpload} />
                    </label>
                    {formQrCodeUrl && (
                      <div className="flex items-center gap-2">
                        <img
                          src={formQrCodeUrl}
                          alt="QR Preview"
                          className="w-12 h-12 rounded-lg border border-gray-300 object-contain bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setFormQrCodeUrl('')}
                          className="p-1 rounded-full text-red-500 hover:bg-red-50"
                          title="Remove QR"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Upload your PhonePe, Google Pay, Paytm, or BHIM QR code screenshot (PNG/JPEG).
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPayoutModal(false)}
                  disabled={payoutLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={payoutLoading}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 border-none font-bold"
                >
                  {payoutLoading ? 'Saving Methods...' : 'Save Payout Methods'}
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Payout History */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 font-display">Completed NEFT Settlement Batches</h2>
          {loading ? (
            <p className="text-xs text-gray-400 text-center py-6">Loading...</p>
          ) : payoutHistory.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <CreditCard className="w-8 h-8 text-gray-200 mx-auto" />
              <p className="text-sm text-gray-500 font-semibold">No settlements yet</p>
              <p className="text-xs text-gray-400">
                Your settlement history will appear here once your first batch is transferred to your bank.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {payoutHistory.map((po) => (
                <div key={po.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(po.amount)}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        Credited
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {po.created_at ? new Date(po.created_at).toLocaleDateString('en-IN') : po.date} •{' '}
                      {po.reference || po.id}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" className="rounded-xl">
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
