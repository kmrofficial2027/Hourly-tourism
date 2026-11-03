'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Plus, Briefcase, Trash2, Eye, ShieldCheck } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

export default function CompanyServicesPage() {
  const [fleet, setFleet] = useState([
    {
      id: 'f-01',
      category: 'van',
      title: 'Force Urbania 9-Seater Luxury Van',
      city: 'Goa',
      rate: 999,
      reg: 'GA-03-Z-9912',
      status: 'Active',
    },
    {
      id: 'f-02',
      category: 'car',
      title: 'Innova Crysta 7-Seater Chauffeur',
      city: 'Mumbai',
      rate: 699,
      reg: 'MH-02-CX-4411',
      status: 'Active',
    },
    {
      id: 'f-03',
      category: 'bike',
      title: 'Royal Enfield Himalayan 450 (Fleet of 3)',
      city: 'Leh',
      rate: 349,
      reg: 'JK-10-EE-2110',
      status: 'Active',
    },
  ])

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

          <Link href="/provider/listings/new">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4 mr-1.5" />
              Add Vehicle
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Vehicle / Service</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Registration</th>
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
                    <td className="p-4 font-mono text-gray-500">{item.reg}</td>
                    <td className="p-4">{item.city}</td>
                    <td className="p-4 font-bold text-emerald-700">
                      {formatCurrency(item.rate)}/hr
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
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

