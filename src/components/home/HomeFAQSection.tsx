'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Clock,
  Phone,
  MessageCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

interface FAQItem {
  id: string
  category: 'general' | 'tourist' | 'pricing' | 'hosts'
  question: string
  answer: string
}

const FAQS: FAQItem[] = [
  {
    id: 'how-it-works',
    category: 'general',
    question: 'How does Hourly Tourism work compared to traditional car rentals or taxis?',
    answer:
      'With Hourly Tourism, you rent verified vehicles (Bikes, Cars, Vans) or certified Local Guides strictly for the hours you need (from 1 hour to 16 hours). Unlike traditional 24-hour car rentals that force you into full-day fees, or metered taxis where ticking wait-time meters create anxiety, you pay a transparent hourly tariff. Make unlimited stops, explore at your own pace, and enjoy complete flexibility with zero surge pricing.',
  },
  {
    id: 'inclusions',
    category: 'pricing',
    question: 'What is included in the hourly rate? Are fuel and driver charges included?',
    answer:
      'Yes! All car and van hourly listings on Hourly Tourism include the vehicle, the courteous vetted chauffeur/driver, and standard regional fuel coverage for the duration of the booked hours. Bike rentals include sanitized helmets and phone mounts. Parking fees and highway tolls (if any) are paid at actuals.',
  },
  {
    id: 'escrow-protection',
    category: 'pricing',
    question: 'How does the 100% Escrow Protection guarantee my money?',
    answer:
      'When you book, your payment is held in an RBI-compliant escrow account—it is never transferred directly to the host before the trip starts. Funds are settled to the host only after your trip safely concludes. If the host fails to show up or cancels, you receive an immediate 100% full refund.',
  },
  {
    id: 'multi-stops',
    category: 'tourist',
    question: 'Can I make multiple stops, shop, dine, or wait at temples during my hourly booking?',
    answer:
      'Absolutely! That is the defining advantage of Hourly Tourism. Your driver remains exclusively dedicated to you for your entire booked slot. You can stop for darshan at temples (e.g. Isha, Marudhamalai, Perur), pause for authentic Kongu meals, or shop for cotton sarees without worrying about ticking meters or driver cancellations.',
  },
  {
    id: 'trip-extensions',
    category: 'tourist',
    question: 'Can I extend my booking duration while the trip is already in progress?',
    answer:
      'Yes. If you decide to stay longer at a scenic spot, simply open your Live Trip Tracker on your phone and tap "Extend Trip" by 1, 2, or more hours at the host’s standard hourly tariff, provided the host has no conflicting reservation immediately following.',
  },
  {
    id: 'cancellation-policy',
    category: 'tourist',
    question: 'What happens if I need to cancel or reschedule my trip?',
    answer:
      'You can cancel for free with a 100% instant refund up to 6 hours before your scheduled pickup time. Cancellations between 2 to 6 hours before pickup receive a 75% refund (the 25% compensates the driver who reserved their slot for you). Cancellations under 2 hours or no-shows receive a 50% refund.',
  },
  {
    id: 'how-to-host',
    category: 'hosts',
    question: 'How do vehicle owners and local guides join and earn as hosts?',
    answer:
      'Vehicle owners (Bikes, Cars, Vans) and certified guides can click "Become a Provider", submit their Aadhaar, Driving License, vehicle RC, and commercial insurance. Once verified by our administrative desk within 24 hours, you can create hourly listings, set your rates, and receive direct escrow payouts to your bank account or UPI after every trip.',
  },
  {
    id: 'active-cities',
    category: 'general',
    question: 'Which cities and regions are currently active on Hourly Tourism?',
    answer:
      'We are live and active across Tamil Nadu—including Coimbatore, Pollachi, Ooty, and Valparai, with dedicated regional travel circuits and bundled local packages. New tourist hubs across South India are continually being added.',
  },
]

export function HomeFAQSection() {
  const [activeTab, setActiveTab] = useState<'all' | 'tourist' | 'pricing' | 'hosts'>('all')
  const [openIds, setOpenIds] = useState<string[]>(['how-it-works', 'inclusions'])

  const toggleFAQ = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const filteredFaqs =
    activeTab === 'all' ? FAQS : FAQS.filter((f) => f.category === activeTab || f.category === 'general')

  return (
    <section className="bg-slate-50 py-16 sm:py-24 border-t border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-black uppercase tracking-wider text-[#0a4d29]">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Got Questions? We Have Answers</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 font-display tracking-tight">
            Frequently Asked Questions
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Everything you need to know about hourly vehicle rentals, certified local guides, 100% escrow payment protection, and flexible multi-stop touring.
          </p>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { id: 'all', label: 'All Questions' },
              { id: 'tourist', label: 'For Tourists & Travelers' },
              { id: 'pricing', label: 'Pricing & Escrow' },
              { id: 'hosts', label: 'For Hosts & Drivers' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#0a4d29] text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openIds.includes(faq.id)
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-emerald-300 shadow-sm'
                    : 'bg-white/80 border-gray-200 hover:border-gray-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4"
                >
                  <span className="font-bold text-sm sm:text-base text-gray-900 font-display">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 border-t border-gray-100">
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-3">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom Help Desk Banner */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#062413] to-[#0a4d29] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-black font-display flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-[#ff7a00]" />
              Still Have a Specific Question?
            </h3>
            <p className="text-xs text-emerald-100/90">
              Our 24x7 travel coordinators in Tamil Nadu are ready to help via WhatsApp or Toll-Free Phone.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href="https://wa.me/919842100000"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-black flex items-center gap-1.5 transition shadow"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Live Desk</span>
            </a>
            <a
              href="tel:+9118002008899"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-[#ff7a00]" />
              <span>1800-200-8899</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

