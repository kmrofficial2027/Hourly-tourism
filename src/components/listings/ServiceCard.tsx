import React from 'react'
import Link from 'next/link'
import { MapPin, Clock, Star, Users } from 'lucide-react'
import type { ServiceListingWithDetails } from '@/types'
import { CURRENCY_SYMBOL } from '@/lib/constants'
import { Rating } from '@/components/ui/Rating'

export interface ServiceCardProps {
  listing: any // Supports ServiceListing or database row with joined details
}

export function ServiceCard({ listing }: ServiceCardProps) {
  // Default image based on category if listing images are empty
  const defaultImages: Record<string, string> = {
    bike: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    car: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
    van: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&w=800&q=80',
    local_guide: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    sightseeing_tour: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    experience: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80',
  }

  const categoryNames: Record<string, string> = {
    bike: 'Bike Rental',
    car: 'Car Rental',
    van: 'Van Rental',
    local_guide: 'Local Guide',
    sightseeing_tour: 'Sightseeing Tour',
    experience: 'Experience',
  }

  const imageSrc =
    listing.images && listing.images.length > 0
      ? listing.images[0]
      : defaultImages[listing.category] || defaultImages.experience

  const providerName =
    listing.provider?.business_name ||
    listing.company?.company_name ||
    listing.provider_profile?.business_name ||
    'Verified Local Host'

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Image & Category Pill */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <img
          src={imageSrc}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-3 left-3 flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 backdrop-blur-md text-[#0a4d29] shadow-sm">
            {categoryNames[listing.category] || listing.category}
          </span>
          {listing.is_featured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Location tag */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
          <span className="flex items-center px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md">
            <MapPin className="w-3.5 h-3.5 mr-1 text-[#ff7a00]" />
            {listing.destination_city || 'India'}
          </span>
          <span className="flex items-center px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md">
            <Clock className="w-3.5 h-3.5 mr-1 text-[#ff7a00]" />
            Min {listing.min_booking_hours || 1} hr
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Provider and Rating row */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-500 truncate max-w-[150px]">
              By {providerName}
            </p>
            <Rating
              value={Number(listing.average_rating || 0)}
              size="sm"
              showCount
              count={listing.total_reviews || 0}
            />
          </div>

          {/* Title */}
          <Link href={`/services/${listing.id}`}>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-[#ff7a00] transition-colors line-clamp-1 mb-1.5">
              {listing.title}
            </h3>
          </Link>

          {/* Short description */}
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
            {listing.short_description || listing.description}
          </p>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block -mb-0.5">
              Hourly Rate
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-black text-[#0a4d29]">
                {CURRENCY_SYMBOL}{Number(listing.hourly_rate).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-gray-400 font-medium">/ hr</span>
            </div>
          </div>

          <Link
            href={`/services/${listing.id}`}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#ff7a00] to-[#f59e0b] hover:from-[#ea6f00] hover:to-[#d97706] transition-all shadow-md shadow-orange-400/30 active:scale-95"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  )
}

