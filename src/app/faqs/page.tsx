'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  HelpCircle,
  Clock,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Phone,
  MessageCircle,
  ArrowRight,
  Car,
  Bike,
  Compass,
} from 'lucide-react'

export default function FAQsPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'tourist' | 'pricing' | 'hosts'>('all')
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  const faqs = [
    {
      id: 1,
      category: 'tourist',
      q: 'How does hourly booking work?',
      a: 'Unlike traditional rental agencies that force full 24-hour day charges, Hourly Tourism lets you book Bikes, Cars, Vans, and Local Guides strictly for the hours you need (from 2 hours up to 12 hours). Choose your pickup time, select your duration, and pay only for that reserved slot.',
    },
    {
      id: 2,
      category: 'pricing',
      q: 'What is included in the hourly vehicle tariff?',
      a: 'Car and Van bookings include a professional, courteous local chauffeur, air conditioning, and full vehicle maintenance. Fuel is typically packaged into the rate or settled per actual km driven based on the host’s transparent policy shown before checkout. Two-wheeler rentals include two sanitized ISI-certified helmets.',
    },
    {
      id: 3,
      category: 'pricing',
      q: 'How does the 100% Escrow Protection work?',
      a: 'When you book a ride or guide, your payment is held safely in platform escrow. The money is never released to the driver or host until your trip is physically completed and verified via your confidential 4-digit completion OTP. If the host fails to show up, you receive a full 100% refund.',
    },
    {
      id: 4,
      category: 'tourist',
      q: 'Can I visit multiple stops like temples, viewpoints, and markets?',
      a: 'Absolutely! That is the core advantage of hourly touring. Within your booked hours, the vehicle and driver are exclusively at your disposal. You can visit multiple temples, stop for traditional South Indian meals, explore spice markets, or take photos at scenic viewpoints at your own relaxed pace.',
    },
    {
      id: 5,
      category: 'tourist',
      q: 'Can I extend my booking duration while on the road?',
      a: 'Yes! If you are enjoying your trip and want to stay longer, you can tap "Extend Trip" directly from your active trip screen in the Tourist Dashboard. As long as your host has no overlapping reservation immediately following your slot, your booking will be extended seamlessly at the same hourly rate.',
    },
    {
      id: 6,
      category: 'pricing',
      q: 'What is the hourly cancellation and refund policy?',
      a: 'Cancellations made more than 4 hours before the booking start time receive a 100% full refund. Cancellations made between 2 and 4 hours before start time receive a 50% refund (with 50% paid to the driver for holding their calendar). Cancellations within 2 hours or no-shows are non-refundable as the vehicle is already mobilized.',
    },
    {
      id: 7,
      category: 'hosts',
      q: 'How do providers and chauffeurs get paid?',
      a: 'Hourly Tourism operates with a flat 10% platform fee—you keep 90% of every booking! All earnings from completed trips are automatically settled directly to your registered bank account or UPI ID every Tuesday without any manual withdrawal hassle.',
    },
    {
      id: 8,
      category: 'hosts',
      q: 'What are the quality standards to list my car or bike?',
      a: 'Vehicles must be under 6 years old, mechanically fit with valid commercial/private tourist permits, active comprehensive insurance, and working air conditioning. Hosts and drivers must pass background KYC verification via Aadhaar and valid Driving License.',
    },
    {
      id: 9,
      category: 'tourist',
      q: 'Which regions are currently active on Hourly Tourism?',
      a: 'We currently cover the entire Western Ghats & Kongu belt including Coimbatore (City Hub, Isha Yoga, Marudhamalai, Kovai Kutralam), Pollachi (Topslip, Parambikulam, Anamalai Tiger Reserve), Valparai (Tea Estates & 40 Hairpin Curves), and the Nilgiris (Ooty & Coonoor circuits). More South Indian tourist circuits are launching soon!',
    },
    {
      id: 10,
      category: 'hosts',
      q: 'Can individual car owners or local tour guides register?',
      a: 'Yes! We onboard individual vehicle owners, commercial fleet operators, certified regional guides, and local experience curators. Our onboarding team reviews your documents and activates your provider profile within 24 hours.',
    },
  ]

  const filteredFaqs = faqs.filter((f) => {
    if (activeCategory === 'all') return true
    return f.category === activeCategory
  })

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-4 py-1.5 rounded-full inline-block">
            Help Center & Support Desk
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-display text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Everything you need to know about hourly vehicle rentals, certified local guides, escrow protection, and host payouts.
          </p>

          {/* Quick Contact Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <a
              href="tel:18002008899"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-200 border border-gray-700 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Toll-Free: 1800-200-8899</span>
            </a>
            <a
              href="https://wa.me/919842100000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-200 border border-gray-700 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-green-400" />
              <span>WhatsApp Support (24/7)</span>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Interactive Section */}
      <section className="py-16 sm:py-20 bg-gray-50 flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {[
              { id: 'all', label: 'All Questions' },
              { id: 'tourist', label: 'For Tourists & Travelers' },
              { id: 'pricing', label: 'Pricing & Escrow' },
              { id: 'hosts', label: 'For Hosts & Providers' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveCategory(tab.id as any)
                  setOpenIdx(null)
                }}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  activeCategory === tab.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 shadow-sm'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div className="space-y-3.5">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIdx === idx
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 hover:bg-gray-50/70 transition-colors"
                  >
                    <span className="font-bold text-gray-900 text-sm sm:text-base leading-snug">
                      {faq.q}
                    </span>
                    <span
                      className={`p-1 rounded-full transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? 'rotate-180 bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/30">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Still have questions banner */}
          <div className="p-8 rounded-3xl bg-emerald-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-xl font-bold">Still have questions?</h3>
              <p className="text-xs sm:text-sm text-emerald-100">
                Our local travel support desk is available round the clock to assist you.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-emerald-900 bg-white hover:bg-emerald-50 transition-colors"
              >
                Contact Desk
              </Link>
              <Link
                href="/explore"
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-600 transition-colors"
              >
                Browse Rides
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
