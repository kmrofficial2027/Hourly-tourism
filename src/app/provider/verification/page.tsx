'use client'

import React, { useState } from 'react'
import { ShieldCheck, UploadCloud, CheckCircle2, Clock, FileText, AlertCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { showToast } from '@/components/ui/Toast'

export default function ProviderVerificationPage() {
  const [status, setStatus] = useState<'pending' | 'submitted' | 'approved'>('approved')
  const [idNumber, setIdNumber] = useState('XXXX-XXXX-8921')
  const [licenseNumber, setLicenseNumber] = useState('DL-042021008912')
  const [loading, setLoading] = useState(false)

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStatus('submitted')
      showToast.success('Documents submitted for compliance check')
    }, 600)
  }

  return (
    <DashboardLayout role="provider" title="Identity & Fleet Verification">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display">
            Provider Trust & Compliance
          </h1>
          <p className="text-xs text-gray-500">
            Keep your credentials verified to maintain listing visibility and instant payouts.
          </p>
        </div>

        {/* Verification Status Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-gray-900">Verification Status</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800">
                  {status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Government ID, Vehicle Fitness, and Insurance Verified.
              </p>
            </div>
          </div>
        </div>

        {/* Documents Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-gray-900 font-display">Submitted Documents</h2>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-gray-900">Government Identity Proof</p>
                  <p className="text-[11px] text-gray-400">Aadhaar Card / Passport ({idNumber})</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Verified
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-gray-900">Commercial Driving License / Guide Badge</p>
                  <p className="text-[11px] text-gray-400">License ID ({licenseNumber})</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Verified
              </span>
            </div>
          </div>

          <p className="text-[11px] text-gray-400">
            To update documents or add additional commercial vehicles, contact our compliance team.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

