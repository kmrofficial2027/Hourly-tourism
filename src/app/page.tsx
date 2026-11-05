import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Compass,
  Clock,
  ShieldCheck,
  Star,
  Users,
  MapPin,
  ChevronRight,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  CalendarCheck,
  Zap,
  CheckCircle2,
  HeartHandshake,
  ShieldAlert,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SearchBar } from '@/components/layout/SearchBar'
import { Button } from '@/components/ui/Button'
import { SERVICE_CATEGORIES } from '@/lib/constants'
import { CoimbatoreTripPlanner } from '@/components/coimbatore/CoimbatoreTripPlanner'
import { FeaturedListingsSection } from '@/components/home/FeaturedListingsSection'
import { LovedByTouristsSection } from '@/components/home/LovedByTouristsSection'
import { HomeFAQSection } from '@/components/home/HomeFAQSection'

export default function HomePage({
  searchParams,
}: {
  searchParams?: { code?: string }
}) {
  if (searchParams?.code) {
    redirect(`https://hourlytourism.netlify.app/auth/callback?code=${searchParams.code}`)
  }

  const categoryColorMap: Record<string, { bg: string; border: string; text: string }> = {
    bike: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-500' },
    car: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-500' },
    van: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-500' },
    local_guide: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-500' },
    sightseeing_tour: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-500' },
    experience: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-500' },
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white">
      <Header />

      {/* Hero Section — 2025 Luxury Mobility App Design */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-36 overflow-hidden bg-gradient-to-b from-[#062413] via-[#0a4d29] to-[#072414] text-white">
        {/* Ambient Glow & Floating Lighting */}
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-[450px] h-[450px] bg-orange-500/15 rounded-full blur-[130px] pointer-events-none -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-10">
            {/* Live Status Pill */}
            <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-emerald-300 text-xs font-bold mb-6 shadow-xl shadow-black/20 animate-fade-in">
              <span className="live-badge-dot" />
              <span className="text-white/90">Multi-Region Marketplace (Coimbatore • Pollachi)</span>
              <span className="text-white/30">•</span>
              <span className="text-orange-400 font-extrabold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Book by the Hour
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight font-display leading-[1.08] text-balance">
              Explore Destinations on Your Terms,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400">
                Hour by Hour
              </span>
            </h1>

            {/* Supporting text */}
            <p className="mt-6 text-base sm:text-xl text-emerald-100/90 leading-relaxed max-w-2xl mx-auto font-normal">
              No locked-in full day tariffs. Explore cities on hourly tours with verified local riders and drivers in their personal bikes, cars, and vans during their free time.
            </p>
          </div>

          {/* Floating Glassmorphism Search Engine Card */}
          <div className="max-w-5xl mx-auto relative z-20">
            <div className="p-3 sm:p-4 rounded-3xl bg-white/95 backdrop-blur-2xl shadow-2xl shadow-black/30 border border-white/50">
              <SearchBar />
            </div>
          </div>

          {/* Real-time Trust & Activity Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-emerald-100/80">
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>1 to 12 Hours Flexible Booking</span>
            </div>
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% KYC-Verified Local Hosts</span>
            </div>
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>4.9★ Real Customer Reviews</span>
            </div>
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
              <Zap className="w-4 h-4 text-orange-400" />
              <span>Zero Overlap Instant Scheduling</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Strip */}
      <section className="py-16 bg-white border-b border-slate-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-extrabold uppercase tracking-widest text-[#ff7a00] mb-2">
                <span>Select Category</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0a4d29] font-display">
                What are you booking today?
              </h2>
            </div>
            <p className="text-sm text-slate-500 max-w-md mt-2 md:mt-0 font-medium">
              Verified local motorcycle riders, private car chauffeurs, and family van drivers. Transparent hourly rates with zero surprise charges.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {SERVICE_CATEGORIES.map((cat) => {
              const styling = categoryColorMap[cat.value] || {
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/30',
                text: 'text-emerald-600',
              }
              return (
                <Link
                  key={cat.value}
                  href={`/explore?category=${cat.value}`}
                  className="group p-5 rounded-3xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-orange-400/80 transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/60"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl ${styling.bg} border ${styling.border} shadow-sm flex items-center justify-center text-3xl mb-3.5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {cat.icon}
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[#ff7a00] transition-colors mb-1 font-display">
                    {cat.label}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                  <span className="mt-3 text-[11px] font-bold text-[#15803d] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    Explore <ChevronRight className="w-3 h-3" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Listings Section (Dynamic Launch Edition & Provider Listings) */}
      <section className="py-12 bg-slate-50">
        <FeaturedListingsSection />
      </section>

      {/* Interactive Regional Circuits & Western Ghats Trip Planner */}
      <section className="bg-white py-14 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Active Region Curations
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-display">
                Regional Hourly Curations & Scenic Circuits
              </h2>
            </div>
            <Link
              href="/regional-guides"
              className="hidden sm:inline-flex items-center text-xs font-bold text-orange-600 hover:text-orange-700"
            >
              Explore Regional Guides <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
          <CoimbatoreTripPlanner />
        </div>
      </section>

      {/* How It Works Section — 5 Step Interactive Flow */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff7a00] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              Simple & Transparent
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0a4d29] font-display mt-3">
              How Hourly Tourism Works
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Flexible mobility and tours designed for your exact schedule. Pay only for what you use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              {
                step: '01',
                title: 'Choose Region',
                desc: 'Select an active region (Coimbatore, Pollachi, etc.) and explore curated circuits.',
                icon: MapPin,
                gradient: 'from-emerald-500 to-teal-600',
              },
              {
                step: '02',
                title: 'Select Transport',
                desc: 'Pick a Bike, Car, or Van with transparent hourly tariffs.',
                icon: Compass,
                gradient: 'from-orange-500 to-amber-600',
              },
              {
                step: '03',
                title: 'Set Your Hours',
                desc: 'Choose from 1 to 12 hours with instant price transparency.',
                icon: Clock,
                gradient: 'from-blue-500 to-indigo-600',
              },
              {
                step: '04',
                title: 'Direct Confirm',
                desc: 'Instant conflict check, secure escrow payment, live booking timeline.',
                icon: ShieldCheck,
                gradient: 'from-purple-500 to-violet-600',
              },
              {
                step: '05',
                title: 'Live Tracking',
                desc: 'Pickup vehicle or meet host, track trip with live SOS safety beacon.',
                icon: Sparkles,
                gradient: 'from-rose-500 to-pink-600',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.step}
                  className="relative p-6 rounded-3xl bg-white border border-slate-200/80 text-center flex flex-col items-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">
                    Step {item.step}
                  </span>
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${item.gradient} text-white shadow-lg flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mb-2 font-display">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Become a Provider Banner — High Converting 2025 Style */}
      <section className="py-20 bg-gradient-to-br from-[#062413] via-[#0a4d29] to-[#041a0d] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/30 inline-flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Partner With Hourly Tourism
              </span>
              <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight leading-tight">
                Turn your vehicle or local expertise into hourly revenue.
              </h2>
              <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed max-w-lg">
                Own a bike, car, or van? List your hourly tourist ride services,
                set your own packages, and receive direct confirmed bookings with automated bank settlements.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/become-provider">
                  <Button
                    variant="primary"
                    size="lg"
                    className="font-extrabold px-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-xl shadow-orange-500/25 border-none"
                  >
                    Start Hosting by the Hour
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/provider">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-white hover:bg-white/10 border border-white/20 font-semibold"
                  >
                    Provider Dashboard
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 space-y-2 hover:bg-white/15 transition-colors">
                <TrendingUp className="w-8 h-8 text-orange-400" />
                <h4 className="text-2xl font-black">₹300 - ₹1,500</h4>
                <p className="text-xs text-emerald-200 font-medium">Average hourly earnings per vehicle</p>
              </div>
              <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 space-y-2 hover:bg-white/15 transition-colors">
                <Clock className="w-8 h-8 text-emerald-300" />
                <h4 className="text-2xl font-black">Zero Lock-in</h4>
                <p className="text-xs text-emerald-200 font-medium">Set availability, buffers, and block out dates</p>
              </div>
              <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 space-y-2 hover:bg-white/15 transition-colors">
                <ShieldCheck className="w-8 h-8 text-cyan-300" />
                <h4 className="text-2xl font-black">Automated Payouts</h4>
                <p className="text-xs text-emerald-200 font-medium">Direct TDS-compliant settlements to your bank</p>
              </div>
              <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 space-y-2 hover:bg-white/15 transition-colors">
                <Award className="w-8 h-8 text-amber-300" />
                <h4 className="text-2xl font-black">Rider Tiers</h4>
                <p className="text-xs text-emerald-200 font-medium">Unlock lower commissions as you complete trips</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Reviews Section (Dynamic Showcase Reviews) */}
      <LovedByTouristsSection />

      {/* Frequently Asked Questions (FAQ) Section */}
      <HomeFAQSection />

      <Footer />
    </div>
  )
}
