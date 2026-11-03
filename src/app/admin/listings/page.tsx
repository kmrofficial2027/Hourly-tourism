'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Compass, Check, X, Eye, ShieldCheck, AlertTriangle } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { showToast } from '@/components/ui/Toast'
import { formatCurrency } from '@/lib/utils'

export default function AdminListingsPage() {
  const [listings, setListings] = useState([
    {
      id: 'lst-01',
      title: 'Royal Enfield Classic 350 — Hourly Cruiser',
      category: 'bike',
      destination: 'Goa',
      rate: 199,
      provider: 'Goa Coastal Rides',
      status: 'active',
      transportValid: true,
    },
    {
      id: 'lst-02',
      title: 'Pink City Heritage & Forts Expert Guide',
      category: 'local_guide',
      destination: 'Jaipur',
      rate: 450,
      provider: 'Rajputana Heritage Walks',
      status: 'active',
      transportValid: true,
    },
    {
      id: 'lst-03',
      title: 'Executive Sedan with Chauffeur — City Travel',
      category: 'car',
      destination: 'Mumbai',
      rate: 599,
      provider: 'Metro Chauffeurs',
      status: 'active',
      transportValid: true,
    },
    {
      id: 'lst-04',
      title: 'Luxury 9-Seater Van with Driver — Hill Tour',
      category: 'van',
      destination: 'Kochi',
      rate: 899,
      provider: 'Gods Own Vans & Tours',
      status: 'active',
      transportValid: true,
    },
  ])

  return (
    <DashboardLayout role="admin" title="Listings Moderation & Compliance">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display">
            Active Marketplace Listings
          </h1>
          <p className="text-xs text-gray-500">
            Ensure listings follow quality policies and only permitted transport types (Bikes, Cars, Vans only).
          </p>
        </div>

        {/* Transport Restriction Policy Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center space-x-3 text-xs text-emerald-800">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>
            <strong>Enforced Transport Category Rule:</strong> The database and UI strictly permit
            only <strong>Bike, Car, and Van</strong>. All other vehicle categories are rejected.
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Listing Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Provider</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Rate</th>
                  <th className="p-4">Transport Valid</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {listings.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{item.title}</td>
                    <td className="p-4 uppercase text-[10px] font-bold text-emerald-800">
                      {item.category?.replace(/_/g, ' ')}
                    </td>
                    <td className="p-4">{item.provider}</td>
                    <td className="p-4">{item.destination}</td>
                    <td className="p-4 font-bold text-emerald-700">
                      {formatCurrency(item.rate)}/hr
                    </td>
                    <td className="p-4">
                      <span className="flex items-center text-emerald-600 font-bold">
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Valid
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/services/${item.id}`} target="_blank">
                        <Button variant="secondary" size="sm">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
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

