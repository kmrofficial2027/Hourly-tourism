import React from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SearchBar } from '@/components/layout/SearchBar'
import { Star, ShieldCheck, Languages, MapPin, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Hourly Local Tour Guides | Hourly Tourism',
  description:
    'Hire certified, multilingual local tour guides by the hour. Discover history, hidden bazaars, food trails, and cultural landmarks on your time.',
}

export default function GuidesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-emerald-50/60 to-white py-16 sm:py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-4 py-1.5 rounded-full">
            Expert Companions on Demand
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight font-display mt-4 mb-4">
            Hire Local Guides by the Hour
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8">
            Connect with passionate, government-certified local guides. Whether you need 2 hours
            to tour a monument or 4 hours for an artisan food crawl, choose your duration with full flexibility.
          </p>

          <SearchBar compact initialCategory="local_guide" />
        </div>
      </section>

      {/* Guide Highlights */}
      <section className="py-16 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Verified & Certified</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                All guides undergo background checks, tourism license verification, and language proficiency assessments.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
                <Languages className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Multilingual Specialists</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                English, Hindi, French, German, Spanish, Japanese, and regional Indian languages.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Flexible Meeting Points</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Meet at your hotel lobby, monument gate, or airport terminal. The clock starts when your tour begins.
              </p>
            </div>
          </div>

          {/* Featured Coimbatore Guides */}
          <div className="mt-16 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Coimbatore Launch Specialists
                </span>
                <h3 className="text-xl font-black text-gray-900 font-display mt-1">
                  Top-Rated Guides in Coimbatore & Velliangiri
                </h3>
              </div>
              <Link
                href="/explore?category=local_guide&destination=Coimbatore"
                className="mt-3 sm:mt-0 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center"
              >
                <span>View all Coimbatore guides</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/services/guide-cbe-04"
                className="p-5 rounded-2xl bg-gray-50 hover:bg-emerald-50/50 border border-gray-100 transition-all flex items-start space-x-4 group"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                    alt="Guide"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    Kongu Heritage & Perur Chola Art Guide
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Specialist in 1500-year-old Chola architecture, Kanaka Sabha monolithic pillars, and Kovai textile history.
                  </p>
                  <div className="flex items-center space-x-3 text-xs mt-2.5">
                    <span className="font-extrabold text-emerald-700">₹400 / hr</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">Tamil, English, Malayalam</span>
                  </div>
                </div>
              </Link>

              <Link
                href="/services/guide-cbe-13"
                className="p-5 rounded-2xl bg-gray-50 hover:bg-emerald-50/50 border border-gray-100 transition-all flex items-start space-x-4 group"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80"
                    alt="Guide"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    Isha Dhyanalinga & Adiyogi Spiritual Concierge
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Expert orientation for Nada Aradhana musical meditation, Surya Kund dips, and 7 PM Adiyogi Divya Darshanam.
                  </p>
                  <div className="flex items-center space-x-3 text-xs mt-2.5">
                    <span className="font-extrabold text-emerald-700">₹380 / hr</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">Tamil, English, Hindi, Telugu</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/explore?category=local_guide"
              className="inline-flex items-center px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#ff7a00] to-[#f59e0b] hover:from-[#ea6f00] hover:to-[#d97706] text-white font-bold text-sm shadow-lg shadow-orange-400/25 transition-all"
            >
              <span>Explore All Guides</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

