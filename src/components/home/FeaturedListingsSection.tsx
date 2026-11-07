'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Compass,
  Star,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import {
  DEFAULT_HOMEPAGE_FEATURED_SETTINGS,
  ShowcaseRiderHost,
  HomepageFeaturedSettings,
} from '@/lib/homepageFeatured'

export function FeaturedListingsSection() {
  const [activeDestinations, setActiveDestinations] = useState<any[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [featuredSettings, setFeaturedSettings] = useState<HomepageFeaturedSettings>(
    DEFAULT_HOMEPAGE_FEATURED_SETTINGS
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch live active/launched destinations
        const destRes = await fetch('/api/destinations')
        if (destRes.ok) {
          const dData = await destRes.json()
          if (dData.destinations?.length > 0) {
            setActiveDestinations(dData.destinations)
          }
        }

        // 2. Fetch homepage showcase hosts and region bundle copy
        const featRes = await fetch('/api/homepage-featured')
        if (featRes.ok) {
          const fData = await featRes.json()
          if (fData.settings) {
            setFeaturedSettings(fData.settings)
          }
        }
      } catch (err) {
        console.warn('Error loading dynamic featured showcase:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Filter showcase hosts by selected region
  const allHosts = featuredSettings.hosts || DEFAULT_HOMEPAGE_FEATURED_SETTINGS.hosts
  const displayedHosts =
    selectedRegion === 'all'
      ? allHosts.filter((h) => h.is_active !== false)
      : allHosts.filter(
          (h) =>
            h.is_active !== false &&
            h.region.toLowerCase() === selectedRegion.toLowerCase()
        )

  // Current region copy configuration
  const currentRegionConfig =
    selectedRegion !== 'all' && featuredSettings.region_configs?.[selectedRegion]
      ? featuredSettings.region_configs[selectedRegion]
      : null

  const regionBadge =
    selectedRegion === 'all'
      ? featuredSettings.all_regions_badge
      : currentRegionConfig?.badge || `${selectedRegion} Regional Bundles`

  const regionTitle =
    selectedRegion === 'all'
      ? featuredSettings.all_regions_title
      : currentRegionConfig?.title || `Featured Hourly Trips in & around ${selectedRegion}`

  const regionSubtitle =
    selectedRegion === 'all'
      ? featuredSettings.all_regions_subtitle
      : currentRegionConfig?.subtitle ||
        `Select an active region to view bundled tourist packages curated with certified local rider hosts in their personal vehicles.`

  const viewAllLink =
    selectedRegion === 'all'
      ? '/explore'
      : `/explore?destination=${encodeURIComponent(selectedRegion)}`

  return (
    <section className="py-20 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Region Selector Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {featuredSettings.section_eyebrow || 'Explore by Region'}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-gray-800 mt-2">
                {featuredSettings.section_title || 'Select an active region to view bundled tourist packages:'}
              </h3>
            </div>

            <Link
              href={viewAllLink}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Explore All Live Rides</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Region Pills Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedRegion('all')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedRegion === 'all'
                  ? 'bg-[#0a4d29] text-white shadow-md shadow-emerald-950/20 ring-2 ring-emerald-500'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>All Active Regions</span>
            </button>

            {activeDestinations.map((dest: any) => {
              const isSelected = selectedRegion.toLowerCase() === dest.name.toLowerCase()
              return (
                <button
                  key={dest.id || dest.name}
                  type="button"
                  onClick={() => setSelectedRegion(dest.name)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#ff7a00] text-white shadow-md shadow-orange-500/20 ring-2 ring-orange-300'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{dest.name}</span>
                  {dest.is_active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Section Heading */}
        <div className="mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-500/20">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span>{regionBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 font-display tracking-tight">
            {regionTitle}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-2xl leading-relaxed">
            {regionSubtitle}
          </p>
        </div>

        {/* Showcase Rider Host Cards Grid */}
        {displayedHosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedHosts.map((host) => {
              const categoryBadge =
                host.category === 'bike'
                  ? '🏍️ Bike Tour & Ride'
                  : host.category === 'car'
                  ? '🚗 Private Car Chauffeur'
                  : host.category === 'van'
                  ? '🚐 Luxury Touring Van'
                  : host.category === 'local_guide'
                  ? '🧑‍🏫 Local Heritage Guide'
                  : host.category === 'sightseeing_tour'
                  ? '🗺️ Sightseeing Tour'
                  : '🎭 Local Experience'

              const targetExploreUrl = host.explore_query
                ? `/explore?destination=${encodeURIComponent(host.region)}&q=${encodeURIComponent(host.explore_query)}`
                : `/explore?destination=${encodeURIComponent(host.region)}&category=${host.category}`

              return (
                <div
                  key={host.id}
                  className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Banner */}
                    <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                      <img
                        src={host.image_url}
                        alt={host.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                      <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
                          {categoryBadge}
                        </span>
                        {host.badge && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#ff7a00] text-white">
                            {host.badge}
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-4 right-4 text-white">
                        <div className="flex items-center space-x-1.5 text-emerald-300 text-xs font-extrabold uppercase tracking-wider mb-1">
                          <MapPin className="w-3.5 h-3.5 text-orange-400" />
                          <span>{host.region}</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black leading-snug line-clamp-1">
                          {host.business_name}
                        </h3>
                        <p className="text-xs text-white/90 line-clamp-1 font-medium mt-0.5">
                          {host.title}
                        </p>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 space-y-3.5">
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {host.tagline}
                      </p>

                      {/* Bullet Highlights */}
                      {host.features?.length > 0 && (
                        <div className="space-y-1.5 pt-1 border-t border-gray-100">
                          {host.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-center text-xs text-gray-700">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600 shrink-0" />
                              <span className="line-clamp-1 font-medium">{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer with Price, Rating, and CTA to Explore Page */}
                  <div className="p-5 pt-0">
                    <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-gray-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">
                          Hourly Tariff
                        </span>
                        <div className="text-sm font-black text-gray-900">
                          From <span className="text-emerald-700 font-extrabold">₹{host.starting_rate}</span> / hr
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 text-xs font-bold text-gray-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{host.rating}</span>
                        <span className="text-gray-400 font-normal">({host.reviews_count})</span>
                      </div>
                    </div>

                    {/* Routing to explore page showing live active rides */}
                    <Link
                      href={targetExploreUrl}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#0a4d29] hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all group-hover:bg-[#ff7a00]"
                    >
                      <span>Explore Live Active Rides</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-200 p-8">
            <p className="text-sm font-bold text-gray-600">
              No showcase hosts configured for "{selectedRegion}".
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Select "All Active Regions" to view all certified regional rider hosts.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
