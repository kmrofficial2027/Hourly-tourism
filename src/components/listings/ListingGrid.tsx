import React from 'react'
import { ServiceCard } from './ServiceCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Compass } from 'lucide-react'

export interface ListingGridProps {
  listings: any[]
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

export function ListingGrid({
  listings,
  loading = false,
  emptyTitle = 'No services found',
  emptyDescription = 'Try adjusting your destination, date, or category filters to find available hourly experiences.',
}: ListingGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm animate-pulse"
          >
            <div className="aspect-[16/10] bg-gray-200" />
            <div className="p-5 space-y-3">
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-20" />
                <div className="h-8 bg-gray-200 rounded w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={<Compass className="w-8 h-8 text-emerald-600" />}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel="Explore All Categories"
        actionHref="/explore"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <ServiceCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}

