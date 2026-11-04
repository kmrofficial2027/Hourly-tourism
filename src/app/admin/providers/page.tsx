'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  ShieldCheck,
  Check,
  X,
  Building2,
  User,
  RefreshCw,
  Eye,
  FileText,
  Camera,
  AlertCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { showToast } from '@/components/ui/Toast'

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all')
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)

  const loadProviders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/providers')
      if (res.ok) {
        const data = await res.json()
        setProviders(data.providers || [])
      }
    } catch (err) {
      console.error(err)
      showToast.error('Failed to load providers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProviders()
  }, [])

  const handleAction = async (providerId: string, newStatus: 'approved' | 'rejected') => {
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          status: newStatus,
          rejectionReason: newStatus === 'rejected' ? rejectionReason : undefined,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Status update failed')
      }

      setProviders(
        providers.map((p) =>
          p.id === providerId
            ? {
                ...p,
                verification_status: newStatus === 'approved' ? 'approved' : 'rejected',
                status: newStatus === 'approved' ? 'approved' : 'rejected',
              }
            : p
        )
      )

      showToast.success(
        newStatus === 'approved'
          ? 'Provider approved! Marketplace listing privileges granted.'
          : 'Provider application marked as rejected.'
      )
      setSelectedProvider(null)
      setShowRejectInput(false)
      setRejectionReason('')
    } catch (err: any) {
      showToast.error(err.message || 'Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredProviders = useMemo(() => {
    if (filterTab === 'all') return providers
    if (filterTab === 'pending') {
      return providers.filter(
        (p) => p.verification_status === 'pending' || p.status === 'pending'
      )
    }
    if (filterTab === 'verified') {
      return providers.filter(
        (p) => p.verification_status === 'verified' || p.status === 'approved'
      )
    }
    if (filterTab === 'rejected') {
      return providers.filter(
        (p) => p.verification_status === 'rejected' || p.status === 'rejected'
      )
    }
    return providers
  }, [filterTab, providers])

  const pendingCount = providers.filter(
    (p) => p.verification_status === 'pending' || p.status === 'pending'
  ).length

  return (
    <DashboardLayout role="admin" title="Provider Approvals & Verification">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-display">
              Provider Identity & Onboarding Approvals
            </h1>
            <p className="text-xs text-gray-500">
              Review government Aadhaar card proofs and live facial selfies before activating host accounts.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={loadProviders} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 border-b border-gray-100 pb-2 overflow-x-auto text-xs">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterTab === 'all'
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            All Hosts ({providers.length})
          </button>
          <button
            onClick={() => setFilterTab('pending')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${
              filterTab === 'pending'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <span>Pending Review</span>
            {pendingCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-amber-900 text-[10px] font-black flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterTab('verified')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterTab === 'verified'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            Approved & Active
          </button>
          <button
            onClick={() => setFilterTab('rejected')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterTab === 'rejected'
                ? 'bg-red-700 text-white'
                : 'text-red-700 hover:bg-red-50'
            }`}
          >
            Rejected
          </button>
        </div>

        {/* Providers Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-400">Loading provider applications...</div>
          ) : filteredProviders.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Building2 className="w-10 h-10 text-gray-200 mx-auto" />
              <p className="text-sm font-semibold text-gray-500">
                {filterTab === 'pending'
                  ? 'No pending applications waiting for review'
                  : 'No providers found in this category'}
              </p>
              <p className="text-xs text-gray-400">
                New registrations and verification submissions will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Provider / Business</th>
                    <th className="p-4">Owner & Contact</th>
                    <th className="p-4">City</th>
                    <th className="p-4">ID Proof / Aadhaar</th>
                    <th className="p-4">Live Selfie</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {filteredProviders.map((p) => {
                    const docs = p.documents || {}
                    const hasDocs = Boolean(docs.id_card_front || docs.live_photo)
                    const isVerified = p.verification_status === 'verified' || p.status === 'approved'
                    const isPending = p.verification_status === 'pending' || p.status === 'pending'

                    return (
                      <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-gray-900">{p.business_name || 'Independent Host'}</p>
                          <span className="text-[10px] text-gray-400 font-mono">
                            ID: {p.id.slice(0, 8)}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-gray-800">{p.owner_name}</p>
                          <p className="text-[11px] text-gray-400">{p.phone} • {p.email}</p>
                        </td>
                        <td className="p-4">{p.city || 'Coimbatore'}</td>
                        <td className="p-4">
                          {docs.id_type ? (
                            <span className="inline-flex items-center text-xs font-semibold text-gray-800">
                              <FileText className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                              {docs.id_type}
                              {docs.id_number ? ` (${docs.id_number.slice(-4)})` : ''}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs italic">Not submitted</span>
                          )}
                        </td>
                        <td className="p-4">
                          {docs.live_photo ? (
                            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-500">
                              <img
                                src={docs.live_photo}
                                alt="Selfie"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs italic">No photo</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isVerified
                                ? 'bg-emerald-100 text-emerald-800'
                                : isPending
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {p.verification_status || p.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedProvider(p)}
                              className="text-xs"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                              Review Dossier
                            </Button>

                            {isPending && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAction(p.id, 'approved')}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Verification Dossier & ID Proof Modal */}
        {selectedProvider && (
          <Modal
            isOpen={true}
            onClose={() => {
              setSelectedProvider(null)
              setShowRejectInput(false)
              setRejectionReason('')
            }}
            title="Provider Compliance Dossier & Verification"
          >
            <div className="space-y-6 pt-2">
              {/* Provider Overview Card */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">
                    {selectedProvider.business_name}
                  </h3>
                  <p className="text-gray-500">
                    Host: <strong>{selectedProvider.owner_name}</strong> • Phone: {selectedProvider.phone}
                  </p>
                  <p className="text-gray-500">Email: {selectedProvider.email} • Base: {selectedProvider.city}</p>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      selectedProvider.verification_status === 'approved' || selectedProvider.verification_status === 'verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedProvider.verification_status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedProvider.verification_status}
                  </span>
                </div>
              </div>

              {/* Side-by-Side Comparison: ID Proof vs Live Selfie */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Government ID Proof */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-700">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>
                      {selectedProvider.documents?.id_type || 'Government ID Proof'}
                    </span>
                  </div>
                  {selectedProvider.documents?.id_number && (
                    <p className="text-[11px] font-mono font-bold text-gray-600">
                      ID Number: {selectedProvider.documents.id_number}
                    </p>
                  )}

                  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center min-h-[220px]">
                    {selectedProvider.documents?.id_card_front ? (
                      <img
                        src={selectedProvider.documents.id_card_front}
                        alt="Government ID Proof Front"
                        className="w-full max-h-60 object-contain bg-white"
                      />
                    ) : (
                      <div className="p-6 text-center text-xs text-gray-400">
                        <FileText className="w-8 h-8 mx-auto mb-1 text-gray-300" />
                        No ID front document uploaded
                      </div>
                    )}
                  </div>

                  {selectedProvider.documents?.id_card_back && (
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-gray-500 block mb-1">
                        Back Side / Address:
                      </span>
                      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white max-h-40 flex items-center justify-center">
                        <img
                          src={selectedProvider.documents.id_card_back}
                          alt="ID Back"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Selfie Photo */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-700">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Live Facial Selfie Photo</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Captured directly on-device by the host
                  </p>

                  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center min-h-[220px]">
                    {selectedProvider.documents?.live_photo ? (
                      <img
                        src={selectedProvider.documents.live_photo}
                        alt="Live Selfie Photo"
                        className="w-full max-h-60 object-contain bg-white"
                      />
                    ) : (
                      <div className="p-6 text-center text-xs text-gray-400">
                        <Camera className="w-8 h-8 mx-auto mb-1 text-gray-300" />
                        No live selfie photo uploaded
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 space-y-1">
                    <p className="font-bold">Facial Audit Checklist:</p>
                    <p>• Verify that the face on the ID matches the live selfie.</p>
                    <p>• Verify the name on ID matches the registered host profile.</p>
                  </div>
                </div>
              </div>

              {/* Rejection Note input */}
              {showRejectInput && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 space-y-2">
                  <label className="block text-xs font-bold text-red-900">
                    Reason for Rejection (sent to host):
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Aadhaar card image was blurry / selfie did not match ID photo"
                    className="w-full p-2.5 rounded-xl border border-red-200 text-xs outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setSelectedProvider(null)}
                >
                  Close
                </Button>

                {!showRejectInput ? (
                  <Button
                    variant="danger"
                    size="md"
                    onClick={() => setShowRejectInput(true)}
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    Reject Application
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    size="md"
                    isLoading={actionLoading}
                    onClick={() => handleAction(selectedProvider.id, 'rejected')}
                  >
                    Confirm Rejection
                  </Button>
                )}

                <Button
                  variant="primary"
                  size="md"
                  isLoading={actionLoading}
                  onClick={() => handleAction(selectedProvider.id, 'approved')}
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  Approve & Activate Host
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}
