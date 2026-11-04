'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SearchBar } from '@/components/layout/SearchBar'
import { FilterSidebar, type FilterValues } from '@/components/listings/FilterSidebar'
import { ListingGrid } from '@/components/listings/ListingGrid'
import { Pagination } from '@/components/ui/Pagination'

function ExploreContent() {
  const searchParams = useSearchParams()

  const destinationParam = searchParams.get('destination') || ''
  const categoryParam = searchParams.get('category') || ''
  const dateParam = searchParams.get('date') || ''
  const timeParam = searchParams.get('time') || ''
  const durationParam = searchParams.get('duration') ? Number(searchParams.get('duration')) : 2

  const [filters, setFilters] = useState<FilterValues>({
    category: categoryParam || undefined,
    destination: destinationParam || undefined,
    sortBy: 'recommended',
  })

  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 9

  useEffect(() => {
    // Sync filters with URL query parameters when URL changes
    setFilters((prev) => ({
      ...prev,
      category: searchParams.get('category') || undefined,
      destination: searchParams.get('destination') || undefined,
    }))
  }, [searchParams])

  // Fetch listings from API
  useEffect(() => {
    async function loadListings() {
      setLoading(true)
      try {
        const queryParams = new URLSearchParams()
        if (filters.category) queryParams.set('category', filters.category)
        if (filters.destination) queryParams.set('destination', filters.destination)
        if (filters.minPrice) queryParams.set('minPrice', filters.minPrice.toString())
        if (filters.maxPrice) queryParams.set('maxPrice', filters.maxPrice.toString())
        if (filters.minRating) queryParams.set('minRating', filters.minRating.toString())
        if (filters.sortBy) queryParams.set('sortBy', filters.sortBy)

        const res = await fetch(`/api/services?${queryParams.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setListings(data.listings || [])
        } else {
          setListings([])
        }
      } catch (err) {
        setListings([])
      } finally {
        setLoading(false)
      }
    }

    loadListings()
  }, [filters])

  const totalPages = Math.ceil(listings.length / pageSize) || 1
  const paginatedListings = listings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />

      {/* Top Search bar wrapper */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar
            compact
            initialDestination={destinationParam}
            initialCategory={categoryParam}
            initialDate={dateParam}
            initialTime={timeParam}
            initialDuration={durationParam}
          />
        </div>
      </div>

      {/* Main Browse Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onReset={() => setFilters({ sortBy: 'recommended' })}
            totalResults={listings.length}
          />

          {/* Results Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 font-display">
                {filters.category
                  ? `${filters.category.replace(/_/g, ' ').toUpperCase()} Services by the Hour`
                  : 'All Hourly Tourism Services'}
              </h1>
              <span className="text-xs text-gray-500 font-semibold hidden sm:block">
                Showing {listings.length} experiences
              </span>
            </div>

            <ListingGrid
              listings={paginatedListings}
              loading={loading}
              emptyTitle="No listings available yet"
              emptyDescription="No hourly services are available right now. Check back soon or try clearing your filters."
            />

            {/* Pagination */}
            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ExploreContent />
    </Suspense>
  )
}
