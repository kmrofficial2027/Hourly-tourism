'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Calendar, Clock, Compass } from 'lucide-react'
import { SERVICE_CATEGORIES } from '@/lib/constants'

export interface SearchBarProps {
  initialDestination?: string
  initialCategory?: string
  initialDate?: string
  initialTime?: string
  initialDuration?: number
  compact?: boolean
  className?: string
}

export function SearchBar({
  initialDestination = '',
  initialCategory = '',
  initialDate = '',
  initialTime = '',
  initialDuration = 2,
  compact = false,
  className = '',
}: SearchBarProps) {
  const router = useRouter()
  const [destination, setDestination] = useState(initialDestination)
  const [category, setCategory] = useState(initialCategory)
  const [date, setDate] = useState(initialDate)
  const [time, setTime] = useState(initialTime)
  const [duration, setDuration] = useState(initialDuration)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (destination.trim()) params.set('destination', destination.trim())
    if (category) params.set('category', category)
    if (date) params.set('date', date)
    if (time) params.set('time', time)
    if (duration) params.set('duration', duration.toString())

    router.push(`/explore?${params.toString()}`)
  }

  // Today's date in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]

  return (
    <form
      onSubmit={handleSearch}
      className={`w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-3 sm:p-4 transition-all ${className}`}
    >
      <div
        className={`grid gap-3 sm:gap-4 ${
          compact
            ? 'grid-cols-1 md:grid-cols-5'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'
        }`}
      >
        {/* Destination */}
        <div className="flex items-center space-x-3 px-3 py-2 sm:py-2.5 rounded-2xl bg-gray-50 border border-gray-200/80 focus-within:bg-white focus-within:border-[#ff7a00] focus-within:ring-2 focus-within:ring-orange-100 transition-all">
          <MapPin className="w-5 h-5 text-[#ff7a00] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Coimbatore, Isha, Pollachi"
              className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400 placeholder:font-normal"
            />
          </div>
        </div>

        {/* Category */}
        <div className="flex items-center space-x-3 px-3 py-2 sm:py-2.5 rounded-2xl bg-gray-50 border border-gray-200/80 focus-within:bg-white focus-within:border-[#15803d] focus-within:ring-2 focus-within:ring-green-100 transition-all">
          <Compass className="w-5 h-5 text-[#15803d] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Service Type
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none cursor-pointer"
            >
              <option value="">All Services</option>
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center space-x-3 px-3 py-2 sm:py-2.5 rounded-2xl bg-gray-50 border border-gray-200/80 focus-within:bg-white focus-within:border-[#15803d] focus-within:ring-2 focus-within:ring-green-100 transition-all">
          <Calendar className="w-5 h-5 text-[#15803d] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Date
            </label>
            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Duration (Hours) */}
        <div className="flex items-center space-x-3 px-3 py-2 sm:py-2.5 rounded-2xl bg-gray-50 border border-gray-200/80 focus-within:bg-white focus-within:border-[#15803d] focus-within:ring-2 focus-within:ring-green-100 transition-all">
          <Clock className="w-5 h-5 text-[#15803d] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((hrs) => (
                <option key={hrs} value={hrs}>
                  {hrs} {hrs === 1 ? 'Hour' : 'Hours'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex items-center sm:col-span-2 lg:col-span-1">
          <button
            type="submit"
            className="w-full h-full min-h-[50px] bg-gradient-to-r from-[#ff7a00] to-[#f59e0b] hover:from-[#ea6f00] hover:to-[#d97706] text-white font-bold rounded-2xl shadow-lg shadow-orange-400/30 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
          >
            <Search className="w-5 h-5" />
            <span>Search Hourly</span>
          </button>
        </div>
      </div>

      {!compact && (
        <div className="mt-3.5 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
          <span className="font-bold text-[11px] uppercase tracking-wider text-[#0a4d29] mr-1 flex items-center">
            📍 Coimbatore Hubs & Escapes:
          </span>
          {[
            { label: 'Isha Adiyogi (3-5 hrs)', q: 'Isha' },
            { label: 'Marudhamalai Temple (2 hrs)', q: 'Marudhamalai' },
            { label: 'Siruvani Waterfalls (4-6 hrs)', q: 'Siruvani' },
            { label: 'Valparai 40 Hairpins (8-10 hrs)', q: 'Valparai' },
            { label: 'Pollachi Countryside (5-7 hrs)', q: 'Pollachi' },
            { label: 'Perur Chola Temple (2 hrs)', q: 'Perur' },
            { label: 'Gedee Car Museum (2 hrs)', q: 'Gedee' },
            { label: 'Baralikadu Coracle (6-8 hrs)', q: 'Baralikadu' },
          ].map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => {
                setDestination(chip.q)
                router.push(`/explore?destination=${encodeURIComponent(chip.q)}`)
              }}
              className={`px-2.5 py-1 rounded-full bg-gray-100 hover:bg-orange-100 hover:text-orange-800 font-medium transition-colors text-[11px]`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
    </form>
  )
}

