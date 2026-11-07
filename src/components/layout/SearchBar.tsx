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

let clientCachedCities: any[] | null = null

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
  const [launchedCities, setLaunchedCities] = useState<any[]>(clientCachedCities || [])

  React.useEffect(() => {
    if (clientCachedCities && clientCachedCities.length > 0) {
      setLaunchedCities(clientCachedCities)
      return
    }

    async function loadActiveCities() {
      try {
        const res = await fetch('/api/destinations')
        if (res.ok) {
          const data = await res.json()
          const list = data.cities || data.destinations
          if (list && Array.isArray(list) && list.length > 0) {
            clientCachedCities = list
            setLaunchedCities(list)
          }
        }
      } catch (err) {
        // Fallback default
        setLaunchedCities([{ name: 'Coimbatore' }, { name: 'Pollachi' }])
      }
    }
    loadActiveCities()
  }, [])

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
              list="launched-cities"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Coimbatore, Isha, Pollachi"
              className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400 placeholder:font-normal"
            />
            <datalist id="launched-cities">
              {launchedCities.map((c: any) => (
                <option key={c.id || c.name} value={c.name} />
              ))}
            </datalist>
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
        <div className="mt-3.5 pt-3 border-t border-gray-100 space-y-2">
          {/* Quick Region Selector Pills if multiple cities exist */}
          {launchedCities.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 mr-1">
                Select Destination:
              </span>
              {launchedCities.map((c: any) => {
                const isSelected =
                  destination.trim().toLowerCase() === c.name.toLowerCase() ||
                  (destination.trim() === '' && c.name.toLowerCase() === 'coimbatore')
                return (
                  <button
                    key={c.id || c.name}
                    type="button"
                    onClick={() => {
                      setDestination(c.name)
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                      isSelected
                        ? 'bg-[#0a4d29] text-white shadow-sm ring-1 ring-emerald-500'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    📍 {c.name}
                  </button>
                )
              })}
            </div>
          )}

          {/* Dynamic City Hubs & Escapes */}
          {(() => {
            const cleanDest = destination.trim().toLowerCase()
            const matchedCity =
              launchedCities.find(
                (c: any) =>
                  c.name.toLowerCase() === cleanDest ||
                  cleanDest.includes(c.name.toLowerCase()) ||
                  c.name.toLowerCase().includes(cleanDest)
              ) || launchedCities[0]

            const cityName = matchedCity?.name || 'Coimbatore'

            // Generate chips from top_spots and hidden_spots, or fallback curated spots
            let chips: { label: string; q: string }[] = []

            if (matchedCity?.top_spots?.length || matchedCity?.hidden_spots?.length) {
              const spots = [
                ...(matchedCity.top_spots || []),
                ...(matchedCity.hidden_spots || []),
              ]
              chips = spots.slice(0, 8).map((s: any) => ({
                label: `${s.name}${s.recommended_hours ? ` (${s.recommended_hours})` : ''}`,
                q: s.name,
              }))
            } else if (cityName.toLowerCase() === 'pollachi') {
              chips = [
                { label: 'Aliyar Dam & Gardens (3-4 hrs)', q: 'Aliyar' },
                { label: 'Monkey Falls (2-3 hrs)', q: 'Monkey Falls' },
                { label: 'Topslip Elephant Safari (5-6 hrs)', q: 'Topslip' },
                { label: 'Valparai 40 Hairpins (8-10 hrs)', q: 'Valparai' },
                { label: 'Masani Amman Temple (2 hrs)', q: 'Masani Amman' },
                { label: 'Thirumoorthy Falls (4-5 hrs)', q: 'Thirumoorthy' },
              ]
            } else if (cityName.toLowerCase().includes('ooty')) {
              chips = [
                { label: 'Doddabetta Peak (2-3 hrs)', q: 'Doddabetta' },
                { label: 'Pykara Lake & Falls (4-5 hrs)', q: 'Pykara' },
                { label: 'Botanical Gardens (2 hrs)', q: 'Botanical Gardens' },
                { label: 'Emerald Lake & Avalanche (5-6 hrs)', q: 'Emerald Lake' },
                { label: 'Rose Garden Elk Hill (2 hrs)', q: 'Rose Garden' },
                { label: 'Coonoor Tea Estates (4-6 hrs)', q: 'Coonoor' },
              ]
            } else {
              // Default Coimbatore chips
              chips = [
                { label: 'Isha Adiyogi (3-5 hrs)', q: 'Isha' },
                { label: 'Marudhamalai Temple (2 hrs)', q: 'Marudhamalai' },
                { label: 'Siruvani Waterfalls (4-6 hrs)', q: 'Siruvani' },
                { label: 'Valparai 40 Hairpins (8-10 hrs)', q: 'Valparai' },
                { label: 'Pollachi Countryside (5-7 hrs)', q: 'Pollachi' },
                { label: 'Perur Chola Temple (2 hrs)', q: 'Perur' },
                { label: 'Gedee Car Museum (2 hrs)', q: 'Gedee' },
                { label: 'Baralikadu Coracle (6-8 hrs)', q: 'Baralikadu' },
              ]
            }

            return (
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 pt-1">
                <span className="font-bold text-[11px] uppercase tracking-wider text-[#0a4d29] mr-1 flex items-center">
                  📍 {cityName} Hubs & Escapes:
                </span>
                {chips.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => {
                      setDestination(chip.q)
                      router.push(`/explore?destination=${encodeURIComponent(chip.q)}`)
                    }}
                    className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-orange-100 hover:text-orange-800 font-medium transition-colors text-[11px]"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )
          })()}
        </div>
      )}
    </form>
  )
}

