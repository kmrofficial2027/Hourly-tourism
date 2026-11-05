import React from 'react'
import Link from 'next/link'
import { MapPin, Clock, Star, Users, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react'
import { CURRENCY_SYMBOL } from '@/lib/constants'
import { Rating } from '@/components/ui/Rating'
import { normalizeListingImages } from '@/lib/utils'

export interface ServiceCardProps {
  listing: any
}

export function ServiceCard({ listing }: ServiceCardProps) {
  const categoryConfig: Record<string, { label: string; badgeClass: string; iconEmoji: string }> = {
    bike: {
      label: 'Bike Tourist Ride',
      badgeClass: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-orange-500/25',
      iconEmoji: '🏍️',
    },
    car: {
      label: 'Car Tourist Trip',
      badgeClass: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-emerald-600/25',
      iconEmoji: '🚗',
    },
    van: {
      label: 'Van Group Tour',
      badgeClass: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-blue-600/25',
      iconEmoji: '🚐',
    },
    local_guide: {
      label: 'Local City Guide',
      badgeClass: 'bg-gradient-to-r from-purple-600 to-violet-700 text-white shadow-purple-600/25',
      iconEmoji: '🧭',
    },
    sightseeing_tour: {
      label: 'Sightseeing Tour',
      badgeClass: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-rose-500/25',
      iconEmoji: '🏛️',
    },
    experience: {
      label: 'Local Experience',
      badgeClass: 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white shadow-cyan-600/25',
      iconEmoji: '✨',
    },
  }

  const normalizedImages = normalizeListingImages(listing.images, listing.category)
  const imageSrc = normalizedImages[0]

  const providerName =
    listing.provider?.business_name ||
    listing.company?.company_name ||
    listing.provider_profile?.business_name ||
    'Verified Local Host'

  const currentCat = categoryConfig[listing.category] || {
    label: listing.category || 'Hourly Tourist Trip',
    badgeClass: 'bg-gradient-to-r from-emerald-700 to-teal-800 text-white',
    iconEmoji: '📍',
  }

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100/90 shadow-sm hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full relative">
      {/* Top Visual Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        <img
          src={imageSrc}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Gradient vignette for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-md backdrop-blur-md flex items-center gap-1 ${currentCat.badgeClass}`}
            >
              <span>{currentCat.iconEmoji}</span>
              <span>{currentCat.label}</span>
            </span>
            {listing.is_featured && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-current" />
                Featured
              </span>
            )}
          </div>

          {/* Real-time Availability Pill */}
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5 shadow-sm">
            <span className="live-badge-dot" />
            <span>Available</span>
          </span>
        </div>

        {/* Bottom Image Overlay Badges */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
          <span className="flex items-center px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 shadow-sm">
            <MapPin className="w-3.5 h-3.5 mr-1 text-[#ff7a00]" />
            <span className="truncate max-w-[130px] font-semibold">
              {listing.destination_city || 'Coimbatore'}
            </span>
          </span>
          <span className="flex items-center px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-gray-200">
            <Clock className="w-3.5 h-3.5 mr-1 text-[#ff7a00]" />
            Min {listing.min_booking_hours || 1} hr
          </span>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Host Info & Rating */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center shrink-0 border border-emerald-200">
                {providerName.charAt(0).toUpperCase()}
              </div>
              <div className="flex items-center space-x-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">
                  {providerName}
                </p>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </div>
            </div>

            <div className="flex items-center space-x-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span className="text-xs font-bold text-gray-800">
                {Number(listing.average_rating || 5.0).toFixed(1)}
              </span>
              <span className="text-[10px] text-gray-400">
                ({listing.total_reviews || 0})
              </span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/services/${listing.id}`}>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-[#ff7a00] transition-colors line-clamp-1 mb-1.5 font-display">
              {listing.title}
            </h3>
          </Link>

          {/* Host & Vehicle attributes if present */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center gap-1">
              <span>👤</span>
              <span>
                {listing.category === 'bike'
                  ? 'Local Rider Included'
                  : listing.category === 'car'
                  ? 'Chauffeur Included'
                  : listing.category === 'van'
                  ? 'Tour Driver Included'
                  : 'Guide Accompanied'}
              </span>
            </span>

            {listing.vehicle_details && (
              <>
                {listing.vehicle_details.seating_capacity && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-700 flex items-center gap-1">
                    <Users className="w-3 h-3 text-gray-500" />
                    {listing.vehicle_details.seating_capacity} Seats
                  </span>
                )}
                {listing.vehicle_details.fuel_type && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-700 capitalize">
                    {listing.vehicle_details.fuel_type} (Fuel Included)
                  </span>
                )}
              </>
            )}
          </div>

          {/* Planned Trip Route Spots if present */}
          {listing.planned_spots && listing.planned_spots.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#0a4d29] bg-emerald-50/80 px-2.5 py-1 rounded-xl border border-emerald-200/70 mb-2 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">
                <span className="font-bold text-emerald-900">Trip Plan ({listing.planned_spots.length} Stops):</span>{' '}
                {listing.planned_spots.map((s: any) => s.name).join(' → ')}
              </span>
            </div>
          )}

          {/* Curated Unseen & Hidden spots tags if present */}
          {((listing.hidden_spots && listing.hidden_spots.length > 0) || (listing.unseen_spots && listing.unseen_spots.length > 0)) && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {listing.hidden_spots && listing.hidden_spots.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/80 shadow-xs">
                  <span>💎</span>
                  <span>{listing.hidden_spots.length} Secret Gem{listing.hidden_spots.length > 1 ? 's' : ''}</span>
                </span>
              )}
              {listing.unseen_spots && listing.unseen_spots.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs">
                  <span>🌿</span>
                  <span>{listing.unseen_spots.length} Unseen Spot{listing.unseen_spots.length > 1 ? 's' : ''}</span>
                </span>
              )}
            </div>
          )}

          {/* Short description */}
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
            {listing.short_description || listing.description}
          </p>
        </div>

        {/* Pricing & CTA Footer */}
        <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block -mb-0.5">
              Hourly Tour Rate
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-black text-[#0a4d29]">
                {CURRENCY_SYMBOL}
                {Number(listing.hourly_rate || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-gray-400 font-semibold">/ hr</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-medium block">
              Rider + Vehicle + Fuel
            </span>
          </div>

          <Link
            href={`/services/${listing.id}`}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#ff7a00] to-[#f59e0b] hover:from-[#ea6f00] hover:to-[#d97706] transition-all shadow-md shadow-orange-500/25 active:scale-95 group/btn"
          >
            <span>Book Trip</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}
