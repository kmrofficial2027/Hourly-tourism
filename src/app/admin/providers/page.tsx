'use client'

import React, { useState } from 'react'
import { ShieldCheck, Check, X, Building2, User, Phone, MapPin } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { showToast } from '@/components/ui/Toast'

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState([
    {
      id: 'prov-01',
      name: 'Goa Coastal Rides',
      owner: 'Ramesh Sawant',
      type: 'Independent Host',
      category: 'Bike Rental',
      city: 'Goa',
      phone: '+91 98221 44120',
      status: 'approved',
      license: 'DL-06201900124',
    },
    {
      id: 'prov-02',
      name: 'Rajputana Heritage Walks',
      owner: 'Mahendra Singh',
      type: 'Independent Guide',
      category: 'Local Tour Guide',
      city: 'Jaipur',
      phone: '+91 94140 88219',
      status: 'approved',
      license: 'TG-RAJ-2018-912',
    },
    {
      id: 'prov-03',
      name: 'Metro Chauffeur Services',
      owner: 'Kunal Patil',
      type: 'Tourism Company',
      category: 'Car & Van Rental',
      city: 'Mumbai',
      phone: '+91 98200 31290',
      status: 'pending',
      license: 'MH-COM-44129',
    },
  ])

  const handleAction = (id: string, newStatus: 'approved' | 'rejected') => {
    setProviders(
      providers.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    )
    showToast.success(`Provider application marked as ${newStatus}`)
  }

  return (
    <DashboardLayout role="admin" title="Provider Approvals & Verification">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display">
            Provider Compliance & Onboarding
          </h1>
          <p className="text-xs text-gray-500">
            Review host identity documents, licenses, and commercial registrations.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
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
                      <p className="font-bold text-gray-900">{p.name}</p>
                      <p className="text-[11px] text-gray-400">{p.owner} • {p.phone}</p>
                    </td>
                    <td className="p-4">{p.type}</td>
                    <td className="p-4 font-semibold text-emerald-800">{p.category}</td>
                    <td className="p-4">{p.city}</td>
                    <td className="p-4 font-mono text-gray-500">{p.license}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          p.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {p.status === 'pending' ? (
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
        </div>
      </div>
    </DashboardLayout>
  )
}

