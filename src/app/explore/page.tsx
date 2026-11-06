'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SearchBar } from '@/components/layout/SearchBar'
import { FilterSidebar, type FilterValues } from '@/components/listings/FilterSidebar'
import { ListingGrid } from '@/components/listings/ListingGrid'
import { Pagination } from '@/components/ui/Pagination'
import { Button } from '@/components/ui/Button'
import { PriceEstimatorModal } from '@/components/explore/PriceEstimatorModal'
import { ListingCompareModal } from '@/components/explore/ListingCompareModal'
import { ListingMapView } from '@/components/explore/ListingMapView'
import { LayoutGrid, Map, Calculator, SlidersHorizontal, Scale, Sparkles, X } from 'lucide-react'
import { SERVICE_CATEGORIES } from '@/lib/constants'

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

  // View Mode: Grid vs Interactive Map
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')

  // Modals
  const [showEstimator, setShowEstimator] = useState(false)
  const [showCompare, setShowCompare] = useState(false)
  const [compareList, setCompareList] = useState<any[]>([])

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

  const handleApplyCategoryFromEstimator = (category: string) => {
    setFilters((prev) => ({ ...prev, category }))
  }

  const handleRemoveCompare = (id: string) => {
    setCompareList((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70">
      <Header />

      {/* Top Search bar wrapper (scrolls naturally with page) */}
      <div className="bg-white border-b border-slate-200/80 py-5 shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar
            compact
            initialDestination={destinationParam}
            initialCategory={categoryParam}
            initialDate={dateParam}
            initialTime={timeParam}
            initialDuration={durationParam}
          />

          {/* Quick-Filter Category Pills (1-tap Mobile & Desktop friendly) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 pb-1 mt-2 border-t border-slate-100">
            <button
              onClick={() => setFilters((prev) => ({ ...prev, category: undefined }))}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                !filters.category
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {SERVICE_CATEGORIES.map((cat) => {
              const isSelected = filters.category === cat.value
              return (
                <button
                  key={cat.value}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      category: isSelected ? undefined : cat.value,
                    }))
                  }
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>
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

          {/* Results Grid / Map Area */}
          <div className="flex-1 min-w-0">
            {/* Action Bar: Title, Fare Estimator, Grid/Map Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                    {filters.category
                      ? `${filters.category.replace(/_/g, ' ').toUpperCase()} by the Hour`
                      : 'Hourly Tourism Services'}
                  </h1>
                  <span className="live-badge-dot" />
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Showing <span className="font-bold text-slate-800">{listings.length}</span> verified options in{' '}
                  <span className="font-semibold text-emerald-700">{filters.destination || 'All Active Regions'}</span>
                </p>
              </div>

              <div className="flex items-center space-x-2.5">
                {/* Price Estimator Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEstimator(true)}
                  className="rounded-2xl text-xs font-bold border-orange-200 text-[#ff7a00] hover:bg-orange-50 shadow-sm"
                >
                  <Calculator className="w-3.5 h-3.5 mr-1.5" />
                  Fare Estimator
                </Button>

                {/* Compare Button if items selected */}
                {compareList.length > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowCompare(true)}
                    className="rounded-2xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500"
                  >
                    <Scale className="w-3.5 h-3.5 mr-1.5" />
                    Compare ({compareList.length})
                  </Button>
                )}

                {/* View Mode Toggle: Grid vs Map */}
                <div className="flex items-center bg-slate-200/80 p-1 rounded-2xl border border-slate-300/40">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-xl transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-2 rounded-xl transition-all ${
                      viewMode === 'map'
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Interactive Map View"
                  >
                    <Map className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Display Active View Mode */}
            {viewMode === 'map' ? (
              <div className="rounded-3xl overflow-hidden shadow-sm border border-slate-200">
                <ListingMapView listings={listings} city={filters.destination || 'Coimbatore'} />
              </div>
            ) : (
              <>
                <ListingGrid
                  listings={paginatedListings}
                  loading={loading}
                  emptyTitle="No listings available for this filter"
                  emptyDescription="Try selecting another transport category or reset filters to see all available hourly listings."
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(p) => setCurrentPage(p)}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Price Estimator Modal */}
      {showEstimator && (
        <PriceEstimatorModal
          isOpen={true}
          onClose={() => setShowEstimator(false)}
          onApplyCategory={handleApplyCategoryFromEstimator}
        />
      )}

      {/* Compare Modal */}
      {showCompare && (
        <ListingCompareModal
          isOpen={true}
          onClose={() => setShowCompare(false)}
          listings={compareList}
          onRemove={handleRemoveCompare}
        />
      )}

      <Footer />
    </div>
  )
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ExploreContent />
    </Suspense>
  )
}
