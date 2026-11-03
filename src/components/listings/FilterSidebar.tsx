'use client'

import React, { useState } from 'react'
import { Filter, X, RotateCcw, Check } from 'lucide-react'
import { SERVICE_CATEGORIES } from '@/lib/constants'
import { Button } from '@/components/ui/Button'

export interface FilterValues {
  category?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  sortBy?: string
  destination?: string
}

export interface FilterSidebarProps {
  filters: FilterValues
  onFilterChange: (filters: FilterValues) => void
  onReset: () => void
  totalResults?: number
  className?: string
}

export function FilterSidebar({
  filters,
  onFilterChange,
  onReset,
  totalResults,
  className = '',
}: FilterSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleCategoryToggle = (categoryValue: string) => {
    onFilterChange({
      ...filters,
      category: filters.category === categoryValue ? undefined : categoryValue,
    })
  }

  const handleRatingSelect = (rating: number) => {
    onFilterChange({
      ...filters,
      minRating: filters.minRating === rating ? undefined : rating,
    })
  }

  const sortOptions = [
    { label: 'Recommended', value: 'recommended' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Highest Rated', value: 'rating_desc' },
    { label: 'Newest Added', value: 'newest' },
  ]

  const filterContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-[#ff7a00]" />
          <h3 className="font-bold text-gray-900 text-base">Filters</h3>
          {totalResults !== undefined && (
            <span className="text-xs bg-orange-50 text-[#ff7a00] px-2 py-0.5 rounded-full font-bold">
              {totalResults}
            </span>
          )}
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
          Sort Results By
        </label>
        <select
          value={filters.sortBy || 'recommended'}
          onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Coimbatore Circuits & Locations */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
          Coimbatore Circuits
        </label>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'All Coimbatore', value: '' },
            { label: 'Isha Adiyogi', value: 'Isha' },
            { label: 'Marudhamalai', value: 'Marudhamalai' },
            { label: 'Siruvani Falls', value: 'Siruvani' },
            { label: 'Valparai Ghats', value: 'Valparai' },
            { label: 'Pollachi Country', value: 'Pollachi' },
            { label: 'Perur Temple', value: 'Perur' },
            { label: 'Gedee Museum', value: 'Gedee' },
            { label: 'Baralikadu', value: 'Baralikadu' },
          ].map((loc) => {
            const isSelected =
              (!filters.destination && loc.value === '') ||
              filters.destination?.toLowerCase() === loc.value.toLowerCase()
            return (
              <button
                key={loc.label}
                type="button"
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    destination: loc.value === '' ? undefined : loc.value,
                  })
                }
                className={`text-[11px] px-2.5 py-1 rounded-full font-semibold transition-all border ${
                  isSelected
                    ? 'bg-[#ff7a00] text-white border-[#ff7a00] shadow-sm'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {loc.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
          Service Category
        </label>
        <div className="space-y-1.5">
          {SERVICE_CATEGORIES.map((cat) => {
            const isSelected = filters.category === cat.value
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleCategoryToggle(cat.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#ff7a00] text-white shadow-sm shadow-orange-400/30'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
          Hourly Rate (₹)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-gray-400 block mb-1">Min</span>
            <input
              type="number"
              placeholder="0"
              value={filters.minPrice || ''}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  minPrice: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block mb-1">Max</span>
            <input
              type="number"
              placeholder="10000"
              value={filters.maxPrice || ''}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  maxPrice: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Ratings */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
          Minimum Rating
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[4.5, 4.0, 3.5, 3.0].map((star) => {
            const isSelected = filters.minRating === star
            return (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingSelect(star)}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                  isSelected
                    ? 'border-[#ff7a00] bg-orange-50 text-[#ff7a00]'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                ★ {star}+
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile filter toggle bar */}
      <div className="lg:hidden mb-4 flex items-center justify-between">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-sm font-bold text-gray-800 shadow-sm"
        >
          <Filter className="w-4 h-4 text-[#ff7a00]" />
          <span>Filters & Sort</span>
          {filters.category && (
            <span className="w-2 h-2 rounded-full bg-[#ff7a00] ml-1" />
          )}
        </button>

        {totalResults !== undefined && (
          <span className="text-xs text-gray-500 font-medium">
            Showing {totalResults} available
          </span>
        )}
      </div>

      {/* Desktop sidebar */}
      <div
        className={`hidden lg:block w-72 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm self-start sticky top-24 ${className}`}
      >
        {filterContent}
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 overflow-y-auto z-10 flex flex-col justify-between animate-slide-left">
            <div>
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {filterContent}
            </div>

            <div className="pt-6 border-t border-gray-100">
              <Button
                variant="primary"
                fullWidth
                onClick={() => setMobileOpen(false)}
              >
                Show Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

