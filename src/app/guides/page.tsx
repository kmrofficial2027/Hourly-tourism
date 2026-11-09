import React from 'react'
import Link from 'next/link'
import {
  Compass,
  Users,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Bike,
  Car,
  CheckCircle2,
  BookOpen,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'

export const metadata = {
  title: 'Guides & How-To Manuals | Hourly Tourism',
  description:
    'Comprehensive guides for booking verified local companions (Book your Humani), regional destination circuits, and hourly mobility in Coimbatore and Tamil Nadu.',
}

export default function GuidesHubPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white">
      <Header />

      {/* Header Banner */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-[#0a4d29] via-[#07361c] to-[#041a0e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold border border-white/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Hourly Tourism Official Guides & Manuals</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-balance">
            Everything You Need to Know About Hourly Tourism
          </h1>
          <p className="text-base text-emerald-100/90 max-w-2xl mx-auto font-normal">
            Learn how to book a verified local companion for your personal needs, explore regional circuits, and travel flexibly by the hour.
          </p>
        </div>
      </section>

      {/* Main Guides Directory */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
        {/* Spotlight Feature: Book Your Humani Guide */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#21123a] via-[#351e5e] to-[#1c0f33] text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 border-2 border-purple-500/30">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 max-w-2xl relative z-10">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/40 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Spotlight Feature Guide • New Category</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black font-display leading-tight text-white">
              Book Human-Ⅰ: How Booking a Person for Your Needs Works
            </h2>

            <p className="text-sm text-purple-100/90 leading-relaxed">
              Discover how to book a background-verified local companion, shopping assistant, dialect translator, or hospital escort strictly by the hour. Read about hourly pricing packages (from ₹249/hr), Start OTP verification, and 100% Escrow Protection.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
              <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-2 rounded-xl">
                <span>🛍️</span>
                <span>Market Bargaining</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-2 rounded-xl">
                <span>👵</span>
                <span>Elderly Escort</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-2 rounded-xl">
                <span>🗣️</span>
                <span>Bilingual Translation</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Link href="/guides/book-your-humani">
                <Button
                  variant="primary"
                  className="bg-[#ff7a00] hover:bg-[#e06c00] text-white font-black text-xs px-6 py-3 rounded-xl shadow-lg"
                >
                  Read Complete Human-Ⅰ Guide
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/explore?category=humani">
                <Button
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs font-bold px-5 py-3 rounded-xl"
                >
                  Browse Available Human-Ⅰ
                </Button>
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-80 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-3 shrink-0 relative z-10 text-xs">
            <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">
              Quick Pricing Summary
            </span>
            <div className="flex justify-between py-1.5 border-b border-white/10">
              <span className="text-white/80">1 Hour (Quick Errand)</span>
              <span className="font-bold text-white">₹299</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/10">
              <span className="text-white/80">3 Hours (Half-Day Buddy)</span>
              <span className="font-bold text-amber-300">₹799 (Save 11%)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/10">
              <span className="text-white/80">6 Hours (Full Day Shopping)</span>
              <span className="font-bold text-amber-300">₹1,499 (Save 16%)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-white/80">10 Hours (All-Day VIP)</span>
              <span className="font-bold text-amber-300">₹2,299 (Save 23%)</span>
            </div>
          </div>
        </div>

        {/* Other Essential Guides Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900 font-display">
              Regional & Mobility Guides
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Coimbatore Guide */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#0a4d29] flex items-center justify-center font-bold text-lg">
                  🏙️
                </div>
                <h3 className="font-bold text-base text-gray-900 font-display">
                  Coimbatore Regional Guide
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Explore Adiyogi Shiva statue, Marudhamalai temple, Perur heritage, and RS Puram food walks with hourly itinerary planners.
                </p>
              </div>
              <Link href="/regional-guides?city=Coimbatore">
                <Button variant="outline" size="sm" fullWidth className="font-bold text-xs">
                  Read Coimbatore Guide
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Pollachi Guide */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#ff7a00] flex items-center justify-center font-bold text-lg">
                  🌴
                </div>
                <h3 className="font-bold text-base text-gray-900 font-display">
                  Pollachi & Anamalai Guide
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Discover Aliyar reservoir, canal road film locations, Monkey Falls, and Topslip wildlife trails by the hour.
                </p>
              </div>
              <Link href="/regional-guides?city=Pollachi">
                <Button variant="outline" size="sm" fullWidth className="font-bold text-xs">
                  Read Pollachi Guide
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            {/* How Hourly Earnings Work for Hosts */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                  💼
                </div>
                <h3 className="font-bold text-base text-gray-900 font-display">
                  How Earnings & Escrow Work
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Everything about platform escrow security, automated payouts, transparent service fees, and Ride Start OTP verification.
                </p>
              </div>
              <Link href="/how-earnings-work">
                <Button variant="outline" size="sm" fullWidth className="font-bold text-xs">
                  Read Escrow Guide
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
