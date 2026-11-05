'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Car,
  Bike,
  Users,
  Compass,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  DollarSign,
  Calendar,
  Briefcase,
  FileCheck,
  HelpCircle,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  DEFAULT_FOOTER_PAGES_SETTINGS,
  ProvidersHostsSettings,
} from '@/lib/footerCategoryPages'

export default function ProvidersAndHostsPage() {
  const [data, setData] = useState<ProvidersHostsSettings>(
    DEFAULT_FOOTER_PAGES_SETTINGS.providers_hosts
  )

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`/api/admin/footer-pages?t=${Date.now()}`, { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          if (json.settings?.providers_hosts) {
            setData(json.settings.providers_hosts)
          }
        }
      } catch (err) {
        console.error('Failed to fetch providers hosts settings:', err)
      }
    }
    fetchSettings()
  }, [])

  const CLASS_ICONS = [Bike, Car, Users, Compass]
  const BENEFIT_ICONS = [Clock, DollarSign, ShieldCheck, Calendar]
  const TOOL_ICONS = [FileCheck, Briefcase, Car, DollarSign, ShieldCheck, HelpCircle]

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-orange-600 selection:text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 text-white py-16 sm:py-24 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#ff7a00_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 backdrop-blur-md border border-orange-400/30 text-xs font-black uppercase tracking-wider text-orange-400">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{data.hero_eyebrow || 'Partner & Host Community'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight leading-tight">
              {data.hero_title || 'Earn Predictably with Hourly Tourism'}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              {data.hero_subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                href="/become-provider"
                className="px-6 py-3 rounded-xl bg-[#ff7a00] hover:bg-[#e66e00] text-white text-xs font-black transition-all shadow-lg flex items-center gap-2"
              >
                <span>Join as a Host Today</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/provider"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all"
              >
                Open Host Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-16">
        {/* Why Host On Hourly Tourism */}
        <section className="space-y-6">
          <div className="max-w-2xl space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600">
              Why Partner With Us
            </span>
            <h2 className="text-2xl font-black text-gray-900 font-display">
              Built by Operators, for Reliable Daily Income
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {data.benefits.map((ben, i) => {
              const Icon = BENEFIT_ICONS[i % BENEFIT_ICONS.length]
              return (
                <div key={i} className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#ff7a00] flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-gray-900">{ben.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{ben.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Categories Who Can Host */}
        <section className="space-y-6">
          <div className="max-w-2xl space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600">
              Operator Models
            </span>
            <h2 className="text-2xl font-black text-gray-900 font-display">
              Who Can Host on the Platform?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.operator_classes.map((cat, i) => {
              const Icon = CLASS_ICONS[i % CLASS_ICONS.length]
              return (
                <div
                  key={i}
                  className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200/80 shadow-sm hover:shadow-lg transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#ff7a00] flex items-center justify-center font-bold">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-gray-900 font-display">{cat.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{cat.tagline}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                        Daily Potential
                      </span>
                      <span className="text-sm font-black text-emerald-700">{cat.earningRange}</span>
                    </div>
                  </div>

                  {cat.requirements?.length > 0 && (
                    <div className="pt-3 border-t border-gray-100 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Basic Requirements:
                      </span>
                      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-700">
                        {cat.requirements.map((r, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-xl text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2">
                    <Link
                      href={cat.link || '/become-provider'}
                      className="inline-flex items-center text-xs font-black text-[#ff7a00] hover:text-[#e66e00]"
                    >
                      <span>Apply for {cat.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Provider Tools Hub */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-sm space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-50 text-orange-800 border border-orange-200">
              Host Tools & Pages
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
              Direct Provider Workspace Links
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Every tool to grow and operate your hourly travel business:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.tools.map((tool, i) => {
              const Icon = TOOL_ICONS[i % TOOL_ICONS.length]
              return (
                <Link
                  key={i}
                  href={tool.link}
                  className="p-6 rounded-2xl border border-gray-200/80 hover:border-orange-400 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff7a00] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {tool.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-gray-900 group-hover:text-[#ff7a00] transition-colors">
                        {tool.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-gray-100 flex items-center text-xs font-bold text-[#ff7a00]">
                    <span>Access Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* CTA Callout */}
        <div className="rounded-3xl p-8 bg-gradient-to-r from-slate-950 to-orange-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1">
            <h3 className="text-lg font-black font-display">
              {data.cta_title || 'Ready to Launch Your Hourly Travel Service?'}
            </h3>
            <p className="text-xs text-orange-200">
              {data.cta_subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/become-provider"
              className="px-5 py-2.5 rounded-xl bg-[#ff7a00] hover:bg-[#e66e00] text-white text-xs font-black transition shadow-md"
            >
              Start Host Registration
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition"
            >
              Host Sign In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
