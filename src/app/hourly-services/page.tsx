'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Bike,
  Car,
  Compass,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  Navigation,
  Fuel,
  Sparkles,
  Check,
  Phone,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  DEFAULT_FOOTER_PAGES_SETTINGS,
  HourlyServicesSettings,
  HourlyServiceItem,
} from '@/lib/footerCategoryPages'

const ICON_MAP: Record<string, any> = {
  bike: Bike,
  car: Car,
  van: Users,
  local_guide: Compass,
  sightseeing_tour: Navigation,
  experience: Sparkles,
}

export default function HourlyServicesPage() {
  const [activeTab, setActiveTab] = useState<string>('all')
  const [data, setData] = useState<HourlyServicesSettings>(
    DEFAULT_FOOTER_PAGES_SETTINGS.hourly_services
  )

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`/api/admin/footer-pages?t=${Date.now()}`, { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          if (json.settings?.hourly_services) {
            setData(json.settings.hourly_services)
          }
        }
      } catch (err) {
        console.error('Failed to fetch hourly services settings:', err)
      }
    }
    fetchSettings()
  }, [])

  const filteredServices =
    activeTab === 'all'
      ? data.services
      : data.services.filter((s) => s.category === activeTab)

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-[#ff7a00] selection:text-white">
      <Header />

      {/* Hero Header */}
      <section className="relative bg-gradient-to-br from-[#062413] via-[#0a4d29] to-[#041a0d] text-white py-16 sm:py-24 overflow-hidden border-b border-emerald-900">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-wider text-[#ff7a00]">
              <Clock className="w-3.5 h-3.5" />
              <span>{data.hero_eyebrow || 'On-Demand Travel Freedom'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight leading-tight">
              {data.hero_title || 'Hourly Tourism Services Explained'}
            </h1>

            <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed">
              {data.hero_subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-emerald-200">
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                100% Escrow Protection
              </span>
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
                <Clock className="w-4 h-4 text-[#ff7a00]" />
                Zero Surge Pricing
              </span>
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                Verified Local Hosts
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Service Category Navigation Pills */}
      <div className="sticky top-[72px] z-20 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400 mr-2 shrink-0">
              Categories:
            </span>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                activeTab === 'all'
                  ? 'bg-[#0a4d29] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Services ({data.services.length})
            </button>
            {data.services.map((s) => {
              const Icon = ICON_MAP[s.category] || Compass
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveTab(s.category)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
                    activeTab === s.category
                      ? 'bg-[#0a4d29] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{s.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Services Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => {
            const Icon = ICON_MAP[service.category] || Compass
            return (
              <div
                key={service.id}
                className="bg-white rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:border-emerald-300"
              >
                <div>
                  {/* Top Header Card */}
                  <div className="p-6 pb-4 border-b border-gray-100 bg-gradient-to-b from-gray-50/70 to-white">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0a4d29] flex items-center justify-center font-bold shadow-inner group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      {service.badge && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-50 text-[#ff7a00] border border-orange-200">
                          {service.badge}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-black text-gray-900 font-display">
                      {service.title}
                    </h2>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {service.tagline}
                    </p>
                  </div>

                  {/* Pricing & Duration Bar */}
                  <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between text-xs font-bold">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[11px] text-gray-400 font-normal">Starting at</span>
                      <span className="text-lg font-black text-[#ff7a00]">₹{service.startingRate}</span>
                      <span className="text-gray-400 font-normal">/ hour</span>
                    </div>
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{service.minHours}h min • up to {service.maxHours}h</span>
                    </div>
                  </div>

                  {/* Inclusions List */}
                  <div className="p-6 space-y-4">
                    {service.inclusions?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                          What's Included Every Hour:
                        </span>
                        <ul className="space-y-2">
                          {service.inclusions.map((inc, i) => (
                            <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Ideal For */}
                    {service.idealFor?.length > 0 && (
                      <div className="pt-3 border-t border-gray-100">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                          Ideal Situations:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {service.idealFor.map((item, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 rounded-lg bg-gray-100 text-[11px] text-gray-700 font-medium"
                            >
                              • {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="p-6 pt-0">
                  <Link
                    href={service.exploreLink || `/explore?category=${service.category}`}
                    className="w-full py-3 px-4 rounded-xl bg-[#0a4d29] hover:bg-[#07361d] text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md group-hover:shadow-lg"
                  >
                    <span>Find Available {service.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Comparison Table */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              The Hourly Advantage
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
              {data.comparison_title || 'Why Hourly Tourism is Better Than Taxis & 24h Car Rentals'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              {data.comparison_subtitle}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-700">
                  <th className="p-4 font-black">Feature / Policy</th>
                  <th className="p-4 font-black text-[#0a4d29] bg-emerald-50/60">Hourly Tourism Model</th>
                  <th className="p-4 font-bold text-gray-500">Traditional Metered Taxis</th>
                  <th className="p-4 font-bold text-gray-500">Full-Day (24h) Car Rentals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data.comparison_rows || []).map((row, idx) => (
                  <tr key={idx}>
                    <td className="p-4 font-bold text-gray-900">{row.feature}</td>
                    <td className="p-4 font-extrabold text-emerald-800 bg-emerald-50/40">
                      {row.hourlyAdvantage}
                    </td>
                    <td className="p-4 text-gray-600">{row.traditionalTaxi}</td>
                    <td className="p-4 text-gray-600">{row.fullDayRental}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bottom Banner */}
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#062413] to-[#0a4d29] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl font-black font-display">
              {data.cta_title || 'Ready to Book Your Hourly Ride or Guide?'}
            </h3>
            <p className="text-xs text-emerald-100">
              {data.cta_subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/explore"
              className="px-6 py-3 rounded-xl bg-[#ff7a00] hover:bg-[#e66e00] text-white font-black text-xs transition-all shadow-md"
            >
              Explore All Listings
            </Link>
            <Link
              href="/regional-guides"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
            >
              View Regional Guides
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
