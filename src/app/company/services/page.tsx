'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Briefcase, Trash2, Eye, ShieldCheck, RefreshCw } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

export default function CompanyServicesPage() {
  const [fleet, setFleet] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadFleet = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/services')
      if (res.ok) {
        const data = await res.json()
        setFleet(data.listings || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFleet()
  }, [])

  return (
    <DashboardLayout role="company" title="Fleet & Service Management">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-display">Company Fleet Registry</h1>
            <p className="text-xs text-gray-500">
              Only verified Bikes, Cars, and Vans are permitted in fleet inventory.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={loadFleet} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/provider/listings/new">
              <Button variant="primary" size="md">
                <Plus className="w-4 h-4 mr-1.5" />
                Add Vehicle
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-400">Loading fleet...</div>
          ) : fleet.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Briefcase className="w-10 h-10 text-gray-200 mx-auto" />
              <p className="text-sm font-semibold text-gray-500">No vehicles in company fleet</p>
              <p className="text-xs text-gray-400">
                Click "Add Vehicle" to register bikes, cars, or vans to your commercial fleet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Vehicle / Service</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">City</th>
                    <th className="p-4">Hourly Rate</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {fleet.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{item.title}</td>
                      <td className="p-4 uppercase text-[10px] font-bold text-emerald-800">
                        {item.category}
                      </td>
                      <td className="p-4">{item.destination_city}</td>
                      <td className="p-4 font-bold text-emerald-700">
                        {formatCurrency(Number(item.hourly_rate))}/hr
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.is_active ? 'Active' : 'Inactive'}
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
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
