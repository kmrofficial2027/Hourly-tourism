'use client'

import React, { useState, useEffect } from 'react'
import { ShieldCheck, Check, X, Building2, User, RefreshCw } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { showToast } from '@/components/ui/Toast'

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProviders() }, [])

  const handleAction = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: id, status: newStatus }),
      })
      if (res.ok) {
        setProviders(providers.map((p) => (p.id === id ? { ...p, status: newStatus } : p)))
        showToast.success(`Provider application marked as ${newStatus}`)
      }
    } catch (err) {
      showToast.error('Action failed. Please try again.')
    }
  }

  return (
    <DashboardLayout role="admin" title="Provider Approvals & Verification">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-display">
              Provider Compliance & Onboarding
            </h1>
            <p className="text-xs text-gray-500">
              Review host identity documents, licenses, and commercial registrations.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadProviders} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-400">Loading providers...</div>
          ) : providers.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Building2 className="w-10 h-10 text-gray-200 mx-auto" />
              <p className="text-sm font-semibold text-gray-500">No provider applications yet</p>
              <p className="text-xs text-gray-400">
                Providers who apply to join the platform will appear here for review.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Business / Host</th>
                    <th className="p-4">Model</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">City</th>
                    <th className="p-4">License / Permit</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {providers.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-gray-900">{p.business_name || p.name}</p>
                        <p className="text-[11px] text-gray-400">
                          {p.owner_name || p.owner} • {p.phone}
                        </p>
                      </td>
                      <td className="p-4">{p.business_type || p.type || '—'}</td>
                      <td className="p-4 font-semibold text-emerald-800">
                        {p.vehicle_category || p.category || '—'}
                      </td>
                      <td className="p-4">{p.city || '—'}</td>
                      <td className="p-4 font-mono text-gray-500">{p.license_number || p.license || '—'}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            p.verification_status === 'verified' || p.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.verification_status === 'pending' || p.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {p.verification_status || p.status || 'pending'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {(p.status === 'pending' || p.verification_status === 'pending') ? (
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAction(p.id, 'approved')}
                            >
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleAction(p.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Verified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
