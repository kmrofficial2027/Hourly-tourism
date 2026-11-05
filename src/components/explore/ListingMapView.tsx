'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { MapPin, Navigation, Star, ArrowRight, ShieldCheck, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export interface ListingMapViewProps {
  listings: any[]
  city?: string
}

// Preset coordinates / landmarks for popular tourism hubs
const LANDMARKS = [
  { name: 'RS Puram Hub', x: 30, y: 40 },
  { name: 'Gandhipuram Central', x: 48, y: 32 },
  { name: 'Race Course Promenade', x: 55, y: 55 },
  { name: 'Peelamedu Tech Zone', x: 72, y: 42 },
  { name: 'Coimbatore Airport (CJB)', x: 84, y: 48 },
  { name: 'Coimbatore Junction', x: 42, y: 62 },
  { name: 'Marudhamalai Foothills', x: 18, y: 25 },
]

export function ListingMapView({ listings, city = 'Coimbatore' }: ListingMapViewProps) {
  const [selectedListing, setSelectedListing] = useState<any | null>(listings[0] || null)

  return (
    <div className="relative w-full h-[580px] bg-slate-900 rounded-3xl overflow-hidden border border-gray-200 shadow-md">
      {/* Stylized SVG Map Canvas */}
      <svg className="w-full h-full opacity-60 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#0f172a" />
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Arterial Roads Simulation */}
        <path d="M 0 200 Q 300 280 600 240 T 1200 320" fill="none" stroke="#475569" strokeWidth="3" />
        <path d="M 200 0 Q 320 300 480 600" fill="none" stroke="#475569" strokeWidth="2.5" />
        <path d="M 700 0 L 620 600" fill="none" stroke="#334155" strokeWidth="2" />
        <circle cx="500" cy="300" r="180" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
      </svg>

      {/* City Overlay Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-700 text-white text-xs">
        <Navigation className="w-3.5 h-3.5 text-[#ff7a00]" />
        <span className="font-bold">{city} Metropolitan Zone</span>
        <span className="text-[10px] text-slate-400">({listings.length} live pins)</span>
      </div>

      {/* Plot Listings on the Interactive Map */}
      <div className="absolute inset-0 z-10">
        {listings.map((l, idx) => {
          const landmark = LANDMARKS[idx % LANDMARKS.length]
          const isSelected = selectedListing?.id === l.id
          return (
            <button
              key={l.id}
              onClick={() => setSelectedListing(l)}
              style={{ left: `${landmark.x}%`, top: `${landmark.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all transform hover:scale-110 z-20 focus:outline-none`}
            >
              <div
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-2xl font-display font-black text-xs shadow-lg transition-all ${
                  isSelected
                    ? 'bg-[#ff7a00] text-white ring-4 ring-orange-500/30 scale-110'
                    : 'bg-white text-gray-900 hover:bg-emerald-50 hover:text-emerald-800'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#ff7a00]'}`} />
                <span>{formatCurrency(l.hourly_rate)}/h</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected Listing Popup Card */}
      {selectedListing && (
        <div className="absolute bottom-5 left-5 right-5 sm:right-auto sm:w-96 z-30 bg-white rounded-3xl p-4 shadow-2xl border border-gray-100 flex items-center space-x-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
            <img
              src={selectedListing.photos?.[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80'}
              alt={selectedListing.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase bg-black/75 text-white">
              {selectedListing.category}
            </span>
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-[#ff7a00]">
                {selectedListing.destination_city || 'Coimbatore'}
              </span>
              <button
                onClick={() => setSelectedListing(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <h4 className="text-xs font-black text-gray-900 truncate">
              {selectedListing.title}
            </h4>

            <div className="flex items-baseline space-x-1">
              <span className="text-base font-black text-[#0a4d29]">
                {formatCurrency(selectedListing.hourly_rate)}
              </span>
              <span className="text-[10px] text-gray-400">/ hour</span>
            </div>

            <Link href={`/services/${selectedListing.id}`} className="block pt-1">
              <span className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center">
                Book Hourly Slot
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

