'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Compass,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  CheckCircle2,
  Clock,
  MapPin,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

export default function ProviderListingsPage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadListings() {
      setLoading(true)
      try {
        const res = await fetch('/api/services')
        if (res.ok) {
          const data = await res.json()
          setListings(data.listings || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadListings()
  }, [])

  return (
    <DashboardLayout role="provider" title="My Service Listings">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-display">Manage Hourly Listings</h1>
            <p className="text-xs text-gray-500">
              Update hourly rates, packages, or add new vehicles and tours.
            </p>
          </div>

          <Link href="/provider/listings/new">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4 mr-1.5" />
              Add New Listing
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading listings...</div>
        ) : listings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <Compass className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-900">No Listings Created Yet</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              List your bikes, cars, vans, or tour guide services to begin receiving hourly bookings.
            </p>
            <Link href="/provider/listings/new">
              <Button variant="primary">Create Your First Listing</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[16/10] bg-gray-100 relative">
                    <img
                      src={
                        item.images?.[0] ||
                        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/95 text-emerald-800">
                      {item.category?.replace(/_/g, ' ')}
                    </span>
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-600 text-white">
                      Active
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-base text-gray-900 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {item.short_description || item.description}
                    </p>

                    <div className="flex items-center space-x-3 text-xs text-gray-400 pt-1">
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        {item.destination_city}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        Min {item.min_booking_hours || 1} hr
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      Hourly Rate
                    </span>
                    <span className="text-base font-black text-emerald-700">
                      {formatCurrency(Number(item.hourly_rate))}
                      <span className="text-xs font-normal text-gray-400">/hr</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link href={`/services/${item.id}`} target="_blank">
                      <Button variant="secondary" size="sm" title="View Public Listing">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

