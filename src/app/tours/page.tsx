import React from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SearchBar } from '@/components/layout/SearchBar'
import { Sparkles, Clock, Compass, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Hourly Sightseeing Tours & Experiences | Hourly Tourism',
  description:
    'Book curated sightseeing tours and local cultural experiences by the hour. Heritage walks, culinary tastings, photography trails, and more.',
}

export default function ToursPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-emerald-50/60 to-white py-16 sm:py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-4 py-1.5 rounded-full">
            Curated Local Activities
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight font-display mt-4 mb-4">
            Hourly Sightseeing & Experiences
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8">
            Experience the soul of every city in concise, meaningful hourly sessions. No long bus
            rides or packed timetables.
          </p>

          <SearchBar compact initialCategory="sightseeing_tour" />
        </div>
      </section>

      {/* Popular Hourly Itineraries */}
      <section className="py-16 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Sightseeing Tours
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-1">
                  Nature, Waterfalls & Heritage Circuits
                </h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  2 to 8 hour curated tours: Siruvani Sweet Water Cascades, Topslip Elephant Safari in Anamalai Tiger Reserve,
                  Marudhamalai Sacred Hills, and Perur 1500-Year Chola Art Trail with skip-the-line assistance.
                </p>
              </div>
              <Link
                href="/explore?category=sightseeing_tour"
                className="inline-flex items-center text-sm font-bold text-emerald-700 hover:text-emerald-800"
              >
                <span>View Sightseeing Tours</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Unique Experiences
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-1">
                  Kongunadu Culinary, Cars & Forest Adventures
                </h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  1 to 4 hour immersive sessions: Kongunadu traditional food trail in RS Puram (filter coffee & Arisi Paruppu Sadam),
                  Gedee Vintage Car Museum walkthrough, Baralikadu coracle boat safari, and Pollachi tender coconut groves.
                </p>
              </div>
              <Link
                href="/explore?category=experience"
                className="inline-flex items-center text-sm font-bold text-emerald-700 hover:text-emerald-800"
              >
                <span>View Experiences</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

