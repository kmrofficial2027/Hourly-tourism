'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  MapPin,
  Clock,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  HelpCircle,
  Coffee,
  Navigation,
  Car,
  Bike,
  Users,
  ChevronRight,
  Info,
  ExternalLink,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SearchBar } from '@/components/layout/SearchBar'
import { CityDestination, CityRegionalGuide } from '@/lib/destinations'

function RegionalGuidesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialCityQuery = searchParams.get('city') || ''

  const [destinations, setDestinations] = useState<CityDestination[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCityId, setSelectedCityId] = useState<string>('')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'bike' | 'car' | 'van'>('all')

  useEffect(() => {
    async function loadActiveDestinations() {
      setLoading(true)
      try {
        const res = await fetch(`/api/destinations?t=${Date.now()}`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          const list: CityDestination[] = data.destinations || []
          setDestinations(list)

          if (list.length > 0) {
            if (initialCityQuery) {
              const matched = list.find(
                (d) =>
                  d.name.toLowerCase() === initialCityQuery.toLowerCase() ||
                  d.id.toLowerCase() === initialCityQuery.toLowerCase()
              )
              setSelectedCityId(matched ? matched.id : list[0].id)
            } else {
              setSelectedCityId(list[0].id)
            }
          }
        }
      } catch (err) {
        console.error('Failed to load destinations for regional guide:', err)
      } finally {
        setLoading(false)
      }
    }
    loadActiveDestinations()
  }, [initialCityQuery])

  const currentCity = destinations.find((d) => d.id === selectedCityId) || destinations[0]

  const handleSelectCity = (city: CityDestination) => {
    setSelectedCityId(city.id)
    router.replace(`/regional-guides?city=${encodeURIComponent(city.name)}`)
  }

  // Filter circuits by transport type
  const circuits = (currentCity?.guide?.circuits || []).filter((c) => {
    if (selectedCategoryFilter === 'all') return true
    return c.transport_type === selectedCategoryFilter
  })

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white">
      <Header />

      {/* ── Active Regions & City Selector Bar ────────────────────────────── */}
      <div className="bg-[#062413] border-b border-emerald-900/60 sticky top-[72px] z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2 text-white">
              <Compass className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-200">
                Active Regions:
              </span>
            </div>

            {/* City Pills Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {destinations.map((city) => {
                const isSelected = city.id === currentCity?.id
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelectCity(city)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-[#ff7a00] text-white shadow-md shadow-orange-500/30 ring-2 ring-orange-300'
                        : 'bg-white/10 text-emerald-100 hover:bg-white/20 hover:text-white border border-white/10'
                    }`}
                  >
                    <span>📍</span>
                    <span>{city.name}</span>
                    {city.is_active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-gray-500">Loading Regional Guide...</p>
        </div>
      ) : !currentCity ? (
        <div className="py-24 text-center">
          <p className="text-gray-500 font-bold">No active regions found.</p>
        </div>
      ) : (
        <>
          {/* ── Hero Section ────────────────────────────────────────────────── */}
          <section className="relative pt-12 pb-20 md:pt-16 md:pb-24 overflow-hidden bg-gradient-to-b from-[#062413] via-[#0a4d29] to-[#072414] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-4xl">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-bold mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  Regional Guide Edition • {currentCity.name}, {currentCity.state}
                </span>
                <span className="text-white/30">•</span>
                <span className="text-orange-400 font-semibold">{currentCity.category}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight font-display text-white leading-tight mb-6">
                {currentCity.guide?.headline ||
                  `The Regional Hourly Travel & Day Escapes Guide for ${currentCity.name}`}
              </h1>

              <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mb-8 max-w-3xl mx-auto font-normal">
                {currentCity.guide?.overview ||
                  currentCity.description ||
                  `Explore ${currentCity.name} on your terms with verified local riders and chauffeurs. No rigid full-day tariffs—book hourly circuits and discover monuments, secret waterfalls, and panoramic viewpoints.`}
              </p>

              {/* Search Bar for current destination */}
              <div className="max-w-3xl mx-auto">
                <SearchBar compact initialDestination={currentCity.name} />
              </div>
            </div>
          </section>

          {/* ── Curated Hourly Circuits & Day Escapes ────────────────────────── */}
          <section className="py-16 sm:py-20 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff7a00] block mb-1">
                    Signature Circuits
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-gray-900 font-display">
                    Hourly Circuits in {currentCity.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl">
                    Hand-crafted day escapes and hourly itineraries designed for riders, cars, and vans.
                  </p>
                </div>

                {/* Filter Tabs by Transport */}
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-gray-100 border border-gray-200 self-start md:self-auto">
                  {[
                    { id: 'all', label: 'All Circuits' },
                    { id: 'bike', label: '🏍️ Bike Rides' },
                    { id: 'car', label: '🚗 Car Escapes' },
                    { id: 'van', label: '🚐 Van Tours' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedCategoryFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedCategoryFilter === tab.id
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Circuits Grid */}
              {circuits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {circuits.map((circuit) => (
                    <div
                      key={circuit.id}
                      className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Image Header with Duration & Category Badges */}
                        <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                          <img
                            src={circuit.image_url}
                            alt={circuit.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
                              {circuit.transport_type === 'bike'
                                ? '🏍️ Bike Ride'
                                : circuit.transport_type === 'car'
                                ? '🚗 Car Escort'
                                : '🚐 Van Group'}
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#ff7a00] text-white">
                              {circuit.ideal_duration}
                            </span>
                          </div>

                          <div className="absolute bottom-3 left-4 right-4 text-white">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                              {circuit.category}
                            </span>
                            <h3 className="text-lg font-black leading-snug line-clamp-2">
                              {circuit.title}
                            </h3>
                          </div>
                        </div>

                        {/* Body Details */}
                        <div className="p-5 space-y-4">
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {circuit.tagline}
                          </p>

                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-gray-700">
                            <div>
                              <span className="text-gray-400 block text-[10px]">Best Time:</span>
                              <span className="font-semibold">{circuit.best_time_of_day}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[10px]">Distance:</span>
                              <span className="font-semibold">{circuit.distance_km ? `${circuit.distance_km} km` : 'Regional'}</span>
                            </div>
                          </div>

                          {/* Key Attractions */}
                          {circuit.key_attractions?.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                                Circuit Highlights:
                              </span>
                              <div className="space-y-1">
                                {circuit.key_attractions.map((att, aIdx) => (
                                  <div key={aIdx} className="flex items-center text-xs text-gray-700">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0" />
                                    <span className="line-clamp-1">{att}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Pro Tip */}
                          {circuit.pro_tip && (
                            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#ff7a00] shrink-0 mt-0.5" />
                              <span className="leading-snug">{circuit.pro_tip}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Action */}
                      <div className="p-5 pt-0">
                        <Link
                          href={`/explore?destination=${encodeURIComponent(currentCity.name)}&category=${circuit.transport_type}`}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#0a4d29] hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                        >
                          <span>Book Hourly Ride for this Circuit</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-3xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold">
                    No circuits found matching "{selectedCategoryFilter}".
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ── Distance & Driving Time Matrix ──────────────────────────────── */}
          {currentCity.guide?.distance_matrix && currentCity.guide.distance_matrix.length > 0 && (
            <section className="py-16 bg-gray-50 border-b border-gray-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff7a00] block mb-1">
                    Route Intelligence
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
                    Distance & Driving Time Matrix from {currentCity.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Calculate your hourly ride duration based on actual road conditions and ideal dwell times.
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-emerald-900 text-white text-[11px] font-black uppercase tracking-wider">
                          <th className="py-3.5 px-5">Destination / Attraction</th>
                          <th className="py-3.5 px-4">Distance</th>
                          <th className="py-3.5 px-4">Driving Time</th>
                          <th className="py-3.5 px-4">Ideal Booking Duration</th>
                          <th className="py-3.5 px-4">Best Transport</th>
                          <th className="py-3.5 px-5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs">
                        {currentCity.guide.distance_matrix.map((row, idx) => (
                          <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                            <td className="py-3.5 px-5 font-bold text-gray-900 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                              <span>{row.destination}</span>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-gray-600">{row.distance}</td>
                            <td className="py-3.5 px-4 text-gray-600">{row.drive_time}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {row.ideal_hours}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-gray-700 font-medium">{row.best_transport}</td>
                            <td className="py-3.5 px-5 text-right">
                              <Link
                                href={`/explore?destination=${encodeURIComponent(currentCity.name)}`}
                                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-0.5"
                              >
                                Find Ride <ChevronRight className="w-3 h-3" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── Bundled Top Attractions & Secret Gems ────────────────────────── */}
          <section className="py-16 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              {/* Top Tourist Spots */}
              {currentCity.top_spots?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 block mb-1">
                        Must-Visit
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900 font-display">
                        Top Tourist Attractions in {currentCity.name} ({currentCity.top_spots.length})
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {currentCity.top_spots.map((spot) => (
                      <div
                        key={spot.id}
                        className="p-4 rounded-2xl bg-gray-50 border border-gray-200 hover:border-emerald-300 transition-all space-y-2.5"
                      >
                        <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-200">
                          <img
                            src={spot.image_url}
                            alt={spot.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                            {spot.category}
                          </span>
                          <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{spot.name}</h4>
                          <span className="inline-block mt-1 text-[10px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                            ⏱️ {spot.recommended_hours}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {spot.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hidden Gems */}
              {currentCity.hidden_spots?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff7a00] flex items-center gap-1 mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Off-The-Beaten-Path
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900 font-display">
                        Secret Gems & Hidden Spots ({currentCity.hidden_spots.length})
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {currentCity.hidden_spots.map((spot) => (
                      <div
                        key={spot.id}
                        className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200 hover:border-orange-300 transition-all space-y-2.5"
                      >
                        <div className="aspect-[16/10] rounded-xl overflow-hidden bg-orange-100">
                          <img
                            src={spot.image_url}
                            alt={spot.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 block">
                            {spot.category}
                          </span>
                          <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{spot.name}</h4>
                          <span className="inline-block mt-1 text-[10px] font-semibold text-orange-800 bg-white px-2 py-0.5 rounded-md border border-orange-200">
                            ⏱️ {spot.recommended_hours}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {spot.description}
                        </p>
                        {spot.insider_tip && (
                          <div className="text-[11px] text-amber-900 font-medium bg-white/80 p-2 rounded-lg border border-amber-200">
                            💡 <strong>Insider Tip:</strong> {spot.insider_tip}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── Insider Local Secrets & Travel Tips ──────────────────────────── */}
          {currentCity.guide?.insider_tips && currentCity.guide.insider_tips.length > 0 && (
            <section className="py-16 bg-gray-50 border-b border-gray-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 text-center max-w-2xl mx-auto">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff7a00] block mb-1">
                    Local Knowledge
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
                    Insider Secrets for Touring {currentCity.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Essential tips compiled by verified regional rider hosts and local chauffeurs.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
                  {currentCity.guide.insider_tips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2 hover:border-emerald-300 transition-all"
                    >
                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        {tip.title}
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed pl-7">{tip.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── Final Call to Action ────────────────────────────────────────── */}
          <section className="py-16 bg-gradient-to-r from-[#062413] to-[#0a4d29] text-white text-center">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
              <h2 className="text-2xl sm:text-4xl font-black font-display">
                Ready to Experience {currentCity.name} by the Hour?
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl mx-auto">
                Select your preferred vehicle—bike, car, or van—and explore {currentCity.name} with certified local hosts.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <Link
                  href={`/explore?destination=${encodeURIComponent(currentCity.name)}`}
                  className="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-transform hover:scale-105 flex items-center gap-1.5"
                >
                  <span>Explore All {currentCity.name} Rides</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/become-provider"
                  className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
                >
                  Host Rides in {currentCity.name}
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  )
}

export default function RegionalGuidesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegionalGuidesContent />
    </Suspense>
  )
}

