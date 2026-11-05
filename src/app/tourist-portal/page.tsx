'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Compass,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  User,
  Ticket,
  LifeBuoy,
  CreditCard,
  Phone,
  Sparkles,
  Search,
  Key,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  DEFAULT_FOOTER_PAGES_SETTINGS,
  TouristPortalSettings,
} from '@/lib/footerCategoryPages'

export default function TouristPortalPage() {
  const [data, setData] = useState<TouristPortalSettings>(
    DEFAULT_FOOTER_PAGES_SETTINGS.tourist_portal
  )

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`/api/admin/footer-pages?t=${Date.now()}`, { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          if (json.settings?.tourist_portal) {
            setData(json.settings.tourist_portal)
          }
        }
      } catch (err) {
        console.error('Failed to fetch tourist portal settings:', err)
      }
    }
    fetchSettings()
  }, [])

  const ICONS = [Search, User, Ticket, LifeBuoy]

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white py-16 sm:py-24 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-xs font-black uppercase tracking-wider text-blue-300">
              <User className="w-3.5 h-3.5" />
              <span>{data.hero_eyebrow || 'Tourist & Traveler Hub'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight leading-tight">
              {data.hero_title || 'Your Complete Tourist Booking Portal'}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              {data.hero_subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                href="/explore"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all shadow-lg flex items-center gap-2"
              >
                <span>Find Hourly Rides Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all"
              >
                Go to My Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation Cards */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-16">
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-blue-600">
                Tourist Workbench
              </span>
              <h2 className="text-2xl font-black text-gray-900 font-display mt-1">
                Everything for the Modern Traveler
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-500">
              <Link href="/login" className="text-blue-600 hover:underline">
                Tourist Sign In
              </Link>
              <span>•</span>
              <Link href="/signup" className="text-gray-700 hover:underline">
                Create Free Account
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.features.map((feat, i) => {
              const Icon = ICONS[i % ICONS.length]
              return (
                <Link
                  key={i}
                  href={feat.link}
                  className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:border-blue-400"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform shadow-inner">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gray-100 text-gray-700">
                        {feat.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                        {feat.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                    <span>Open Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* How It Works Step-by-Step */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-sm space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
              Tourist Guide
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
              {data.steps_title || '5 Steps to a Perfect Hourly Trip'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              {data.steps_subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {data.steps.map((s, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 relative"
              >
                <span className="text-3xl font-black text-blue-600/30 font-display block">
                  {s.step}
                </span>
                <h4 className="text-xs font-black text-gray-900">{s.title}</h4>
                <p className="text-[11px] text-gray-600 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tourist Confidence & Protections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(data.protections || []).map((prot, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-emerald-950">{prot.title}</h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                {prot.description}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Links Banner */}
        <div className="rounded-3xl p-8 bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1">
            <h3 className="text-lg font-black font-display">
              {data.banner_title || 'Need Help with an Active Booking?'}
            </h3>
            <p className="text-xs text-slate-400">
              {data.banner_subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`tel:+91${(data.helpline_phone || '18002008899').replace(/[^0-9]/g, '')}`}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call {data.helpline_phone || '1800-200-8899'}</span>
            </a>
            <Link
              href="/dashboard/support"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition"
            >
              Open Dispute Ticket
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
