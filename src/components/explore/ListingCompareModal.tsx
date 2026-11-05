'use client'

import React from 'react'
import Link from 'next/link'
import { X, Check, Star, ShieldCheck, ArrowRight, Fuel, Users } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

export interface ListingCompareModalProps {
  isOpen: boolean
  onClose: () => void
  listings: any[]
  onRemove: (id: string) => void
}

export function ListingCompareModal({
  isOpen,
  onClose,
  listings,
  onRemove,
}: ListingCompareModalProps) {
  if (listings.length === 0) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compare Hourly Listings Side-by-Side" size="lg">
      <div className="space-y-6">
        <p className="text-xs text-gray-500">
          Compare pricing, vehicle specs, fuel policies, and ratings across your selected options.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-gray-200 rounded-2xl overflow-hidden">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 w-40 text-gray-500 uppercase font-bold text-[10px]">Criteria</th>
                {listings.map((l) => (
                  <th key={l.id} className="p-4 min-w-[200px] text-gray-900 font-bold">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#ff7a00] block">
                          {l.category}
                        </span>
                        <span className="text-sm font-black line-clamp-1">{l.title}</span>
                      </div>
                      <button
                        onClick={() => onRemove(l.id)}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-500"
                        title="Remove from compare"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {/* Hourly Rate */}
              <tr>
                <td className="p-4 font-bold text-gray-500">Hourly Rate</td>
                {listings.map((l) => (
                  <td key={l.id} className="p-4">
                    <span className="text-lg font-black text-[#0a4d29]">
                      {formatCurrency(l.hourly_rate)}
                    </span>
                    <span className="text-gray-400 text-[11px]"> / hour</span>
                  </td>
                ))}
              </tr>

              {/* Min Duration */}
              <tr>
                <td className="p-4 font-bold text-gray-500">Min. Duration</td>
                {listings.map((l) => (
                  <td key={l.id} className="p-4 text-gray-800">
                    {l.min_hours || 1} {l.min_hours === 1 ? 'Hour' : 'Hours'}
                  </td>
                ))}
              </tr>

              {/* Seating Capacity */}
              <tr>
                <td className="p-4 font-bold text-gray-500">Capacity</td>
                {listings.map((l) => (
                  <td key={l.id} className="p-4 text-gray-800 flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1 text-gray-400" />
                    {l.max_participants || (l.category === 'bike' ? 2 : 5)} Seats
                  </td>
                ))}
              </tr>

              {/* Fuel & Transmission */}
              <tr>
                <td className="p-4 font-bold text-gray-500">Transmission & Fuel</td>
                {listings.map((l) => (
                  <td key={l.id} className="p-4 text-gray-800 capitalize">
                    {l.transmission || 'Manual'} • {l.fuel_type || 'Petrol'}
                  </td>
                ))}
              </tr>

              {/* Rating */}
              <tr>
                <td className="p-4 font-bold text-gray-500">Customer Rating</td>
                {listings.map((l) => (
                  <td key={l.id} className="p-4">
                    <div className="flex items-center text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 mr-1 text-amber-400" />
                      {Number(l.rating || 4.9).toFixed(1)} / 5.0
                    </div>
                  </td>
                ))}
              </tr>

              {/* Cancellation Policy */}
              <tr>
                <td className="p-4 font-bold text-gray-500">Cancellation Policy</td>
                {listings.map((l) => (
                  <td key={l.id} className="p-4 text-emerald-700 font-semibold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
                    Free up to 24h before
                  </td>
                ))}
              </tr>

              {/* Book Action */}
              <tr className="bg-gray-50/50">
                <td className="p-4 font-bold text-gray-500">Action</td>
                {listings.map((l) => (
                  <td key={l.id} className="p-4">
                    <Link href={`/services/${l.id}`}>
                      <Button variant="primary" size="sm" fullWidth className="font-bold">
                        Book Now
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  )
}

