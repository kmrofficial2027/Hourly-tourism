'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Heart,
  Languages,
  Camera,
  Compass,
  ArrowRight,
  HelpCircle,
  FileText,
  KeyRound,
  CreditCard,
  Phone,
  MessageCircle,
  ChevronRight,
  Star,
  Check,
  Zap,
  MapPin,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { CURRENCY_SYMBOL } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import {
  DEFAULT_HUMAN_GUIDE_SETTINGS,
  HumanGuideSettings,
} from '@/lib/humanGuideSettings'

export default function BookHumanIGuidePage() {
  const [settings, setSettings] = useState<HumanGuideSettings>(DEFAULT_HUMAN_GUIDE_SETTINGS)
  const [selectedHours, setSelectedHours] = useState(3)

  // Fetch live settings from Supabase so admin updates reflect immediately
  useEffect(() => {
    async function loadLiveSettings() {
      try {
        const res = await fetch(`/api/human-guide?t=${Date.now()}`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (data.settings) {
            setSettings(data.settings)
          }
        }
      } catch (err) {
        // graceful fallback to DEFAULT_HUMAN_GUIDE_SETTINGS
      }
    }
    loadLiveSettings()
  }, [])

  // Dynamic pricing calculation from live settings
  const baseRatePerHour = settings.baseHourlyRate || 299
  const rawSubtotal = selectedHours * baseRatePerHour

  // Volume discount calculation
  const discountRate = selectedHours >= 10 ? 0.23 : selectedHours >= 6 ? 0.16 : selectedHours >= 3 ? 0.11 : 0
  const discountedSubtotal = Math.round(rawSubtotal * (1 - discountRate))
  const platformFee = Math.round(discountedSubtotal * 0.1)
  const gstAmount = Math.round(discountedSubtotal * 0.05)
  const totalAmount = discountedSubtotal + platformFee + gstAmount

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-purple-500 selection:text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-[#1a0f2e] via-[#2d1b4e] to-[#120a21] text-white overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-[450px] h-[450px] bg-orange-500/15 rounded-full blur-[130px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Pill */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-purple-200 text-xs font-bold shadow-lg">
              <span className="live-badge-dot" />
              <span>{settings.badgeText}</span>
              <span className="text-white/30">•</span>
              <span className="text-orange-400 font-extrabold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Book Human-Ⅰ
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-display tracking-tight leading-[1.1] text-balance">
              Book a Person for Your Needs,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-amber-300">
                Hour by Hour
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-purple-100/90 leading-relaxed font-medium text-balance max-w-2xl mx-auto">
              {settings.heroSubheadline}
            </p>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/explore?category=humani" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto bg-[#ff7a00] hover:bg-[#e06c00] text-white font-black text-sm px-8 py-4 rounded-2xl shadow-xl shadow-orange-500/25 transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Explore Available Human-Ⅰ
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="#pricing-calculator" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-sm px-6 py-4 rounded-2xl backdrop-blur-md"
                >
                  Calculate Hourly Price
                </Button>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">Starting Tariff</p>
                <p className="text-lg font-black text-white mt-0.5">₹{baseRatePerHour}<span className="text-xs font-normal text-white/70">/hour</span></p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">Start Verification</p>
                <p className="text-lg font-black text-white mt-0.5">4-Digit OTP</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">Background Checks</p>
                <p className="text-lg font-black text-white mt-0.5">100% Verified</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">Payment Safety</p>
                <p className="text-lg font-black text-white mt-0.5">Platform Escrow</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: WHAT IS A HUMAN-I? */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#ff7a00]">
              The Concept
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">
              What is a Human-Ⅰ?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              A Human-Ⅰ is a vetted, trustworthy local person you book on-demand strictly by the hour. They act as your personal assistant, market negotiator, dialect interpreter, or companion for errands and city tours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xl">
                ⏳
              </div>
              <h3 className="text-lg font-black text-slate-900">Strictly Hourly Freedom</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Why pay for an expensive full-day agency contract? Book a Human-Ⅰ for exactly the hours you need—from 1 quick errand hour to a full 12-hour itinerary. Extend on-demand whenever required.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl">
                🛡️
              </div>
              <h3 className="text-lg font-black text-slate-900">100% Escrow Protection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your payment is held in platform escrow until you meet your Human-Ⅰ in person and provide your confidential 4-digit Ride Start OTP. If they fail to arrive, you receive an immediate 100% refund.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xl">
                🤝
              </div>
              <h3 className="text-lg font-black text-slate-900">1-on-1 Personalized Care</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You receive 100% dedicated personal attention. Whether helping bargaining down saree prices, standing in hospital queues, or showing you secret street food, your Human-Ⅰ works only for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: 6 REAL-WORLD USE CASES */}
      <section className="py-16 md:py-24 bg-slate-100/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#0a4d29]">
              Real-World Applications
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">
              What Can You Book a Human-Ⅰ For?
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Here are the most popular ways travelers, families, and busy individuals book their hourly Human-Ⅰ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settings.useCases.map((uc, i) => (
              <div
                key={i}
                className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-2xl flex items-center justify-center">
                    {uc.icon}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-800">
                    {uc.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {uc.title}
                  </h3>
                  <p className="text-xs text-purple-700 font-bold mt-0.5">
                    {uc.subtitle}
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {uc.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: INTERACTIVE PRICING ESTIMATOR */}
      <section id="pricing-calculator" className="py-16 md:py-24 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#ff7a00]">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">
              Hourly Tariff Estimator
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Slide to select your desired booking duration and see your exact transparent fare with automated volume discounts.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-gradient-to-br from-[#120a21] to-[#251540] text-white p-6 sm:p-10 rounded-3xl shadow-2xl border-2 border-purple-500/30">
            {/* Hours Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold text-purple-300 tracking-wider">
                  Select Required Duration
                </span>
                <span className="px-3.5 py-1 rounded-full text-base font-black bg-[#ff7a00] text-white">
                  {selectedHours} {selectedHours === 1 ? 'Hour' : 'Hours'}
                </span>
              </div>

              <input
                type="range"
                min={settings.minimumHours || 1}
                max={settings.maximumHours || 12}
                step={1}
                value={selectedHours}
                onChange={(e) => setSelectedHours(Number(e.target.value))}
                className="w-full h-3 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-[#ff7a00]"
              />

              <div className="flex justify-between text-[11px] text-purple-300/70 font-semibold px-1">
                <span>1 Hour (Errand)</span>
                <span>3 Hours (Half Day)</span>
                <span>6 Hours (Full Day)</span>
                <span>10 Hours (All-Day VIP)</span>
                <span>12 Hours (Max)</span>
              </div>
            </div>

            {/* Price Breakdown Card */}
            <div className="mt-8 pt-8 border-t border-purple-500/20 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="space-y-2 text-xs text-purple-200">
                <div className="flex justify-between py-1 border-b border-purple-900/60">
                  <span>Base Rate ({selectedHours} hrs × ₹{baseRatePerHour})</span>
                  <span className="font-semibold text-white">₹{rawSubtotal}</span>
                </div>
                {discountRate > 0 && (
                  <div className="flex justify-between py-1 border-b border-purple-900/60 text-emerald-400 font-bold">
                    <span>Duration Discount ({Math.round(discountRate * 100)}% OFF)</span>
                    <span>-₹{rawSubtotal - discountedSubtotal}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-purple-900/60">
                  <span>Platform Fee (10%)</span>
                  <span>₹{platformFee}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>GST Taxes (5%)</span>
                  <span>₹{gstAmount}</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-3">
                <span className="text-[10px] uppercase font-extrabold text-amber-300 tracking-wider">
                  Total Estimated Fare
                </span>
                <div className="text-4xl font-black text-white font-display">
                  ₹{totalAmount}
                </div>
                <p className="text-[11px] text-purple-200">
                  Effective rate ~₹{Math.round(discountedSubtotal / selectedHours)}/hr
                </p>

                <Link href={`/explore?category=humani`}>
                  <Button
                    variant="primary"
                    className="w-full bg-[#ff7a00] hover:bg-[#e06c00] text-white font-black text-xs py-3 rounded-xl shadow-lg mt-2"
                  >
                    Book Human-Ⅰ for {selectedHours} {selectedHours === 1 ? 'Hour' : 'Hours'}
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: 4 PRE-CONFIGURED HOURLY PACKAGES */}
      <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#0a4d29]">
              Pre-Configured Packages
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">
              Popular Human-Ⅰ Hourly Packages
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Choose from standard hourly tiers with volume discounts baked in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {settings.packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`p-6 rounded-3xl bg-white border flex flex-col justify-between transition-all relative ${
                  pkg.popular
                    ? 'border-purple-600 ring-2 ring-purple-500/20 shadow-lg'
                    : 'border-slate-200 shadow-xs hover:shadow-md'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[9px] font-black uppercase bg-purple-700 text-white shadow-sm">
                    Recommended
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">
                      {pkg.duration_hours} {pkg.duration_hours === 1 ? 'Hour' : 'Hours'}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-0.5">
                      {pkg.name}
                    </h3>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100/80">
                    <div className="text-3xl font-black text-purple-950 font-display">
                      ₹{pkg.price}
                    </div>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-200/60 px-2 py-0.5 rounded-full inline-block mt-1">
                      {pkg.discount_label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pkg.description}
                  </p>
                </div>

                <div className="pt-6">
                  <Link href={`/explore?category=humani`}>
                    <Button
                      variant={pkg.popular ? 'primary' : 'outline'}
                      size="sm"
                      className={`w-full font-bold text-xs ${
                        pkg.popular
                          ? 'bg-purple-700 hover:bg-purple-800 text-white shadow-sm'
                          : 'border-purple-300 text-purple-900 hover:bg-purple-50'
                      }`}
                    >
                      Book {pkg.duration_hours}h Package
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: STEP BY STEP HOW IT WORKS */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#ff7a00]">
              Step-by-Step
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">
              How Booking a Human-Ⅰ Works
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              From your initial booking to the final settlement in 4 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-purple-700 text-white font-black text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="text-base font-black text-slate-900">Choose Duration & Book</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter by "Book Human-Ⅰ" on Explore. Select your desired city, meeting point, and hours. Choose prepaid or pay after service.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-purple-700 text-white font-black text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="text-base font-black text-slate-900">4-Digit Start OTP</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When your verified Human-Ⅰ arrives at your hotel, home, or bazaar entrance, share your confidential 4-digit Ride/Meet Start OTP in person.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-purple-700 text-white font-black text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="text-base font-black text-slate-900">Accomplish Your Goals</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Shop with local bargaining confidence, attend hospital visits safely, explore hidden eateries, or let your companion handle tasks.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-purple-700 text-white font-black text-xs flex items-center justify-center">
                4
              </span>
              <h3 className="text-base font-black text-slate-900">Complete & Settle</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your host marks the trip complete. Settle via Cash, personal UPI QR, or release platform escrow. Rate and review your experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: FAQs */}
      <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#0a4d29]">
              Answers & Information
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {settings.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2"
              >
                <h3 className="text-base font-black text-slate-900 flex items-start gap-2">
                  <span className="text-purple-600 font-black">Q.</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: FINAL CTA BANNER */}
      <section className="py-16 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight">
            Ready to Book Your Local Human-Ⅰ?
          </h2>
          <p className="text-sm sm:text-base text-purple-200/90 max-w-xl mx-auto font-medium">
            Find vetted local companions in Coimbatore and Pollachi starting from just ₹{baseRatePerHour}/hour. 100% verified identities with zero full-day lock-ins.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/explore?category=humani">
              <Button
                variant="primary"
                size="lg"
                className="bg-[#ff7a00] hover:bg-[#e06c00] text-white font-black text-sm px-8 py-4 rounded-2xl shadow-xl"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Book Human-Ⅰ Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
