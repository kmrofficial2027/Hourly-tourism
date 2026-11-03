import React from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SearchBar } from '@/components/layout/SearchBar'
import { ShieldCheck, Clock, CheckCircle2, ArrowRight, Bike, Car, Navigation } from 'lucide-react'

export const metadata = {
  title: 'Hourly Vehicles — Bikes, Cars & Vans | Hourly Tourism',
  description:
    'Book verified Bikes, Cars, and Vans by the hour. No full-day lock-ins. Explore your destination with total freedom.',
}

export default function VehiclesPage() {
  const vehicleCategories = [
    {
      title: 'Bikes by the Hour',
      type: 'bike',
      tagline: 'Cruise scenic foothills, mountain curves, and city lanes',
      image:
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
      rates: 'From ₹150 / hour',
      features: [
        'Cruisers (Royal Enfield Hunter 350, Himalayan 450)',
        'Maxi-Scooters & Automatics (Yamaha Aerox 155)',
        'Complimentary ISI helmets for rider & pillion',
        'Transparent fuel options & roadside assistance',
      ],
      href: '/explore?category=bike',
    },
    {
      title: 'Cars by the Hour',
      type: 'car',
      tagline: 'Self-drive hatchbacks, sedans, and 4x4 SUVs or with courteous chauffeur',
      image:
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80',
      rates: 'From ₹480 / hour',
      features: [
        'Sedans, Ertiga Hybrids, & Thar 4x4',
        'Professional, local background-verified chauffeur',
        'Clean, sanitized, dual air-conditioned cabins',
        'Flexible 1 to 12 hour bookings with zero day lock-in',
      ],
      href: '/explore?category=car',
    },
    {
      title: 'Vans by the Hour',
      type: 'van',
      tagline: 'Spacious 9 to 12 passenger vans for family and group touring',
      image:
        'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&w=1200&q=80',
      rates: 'From ₹950 / hour',
      features: [
        '9 to 12 Seater Luxury Force Urbania & Travellers',
        'Experienced mountain/ghat driver included',
        'Spacious boot space for luggage and bags',
        'Zero intercity delay or full-day lock-in',
      ],
      href: '/explore?category=van',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-emerald-50/60 to-white py-16 sm:py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-4 py-1.5 rounded-full">
            Flexible Transport Marketplace
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight font-display mt-4 mb-4">
            Hourly Vehicle Rentals
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8">
            Rent Bikes, Cars, and Vans strictly on an hourly basis. Why pay for a 24-hour rental
            when you only need 3 hours to explore?
          </p>

          <SearchBar compact initialCategory="bike" />
        </div>
      </section>

      {/* Vehicle Category Cards */}
      <section className="py-16 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {vehicleCategories.map((v, idx) => (
            <div
              key={v.type}
              className={`flex flex-col lg:flex-row items-center gap-8 bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
            >
              <div className="w-full lg:w-1/2 aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={v.image}
                  alt={v.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="w-full lg:w-1/2 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#ff7a00]">
                  {v.rates}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-display">
                  {v.title}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">{v.tagline}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-2">
                  {v.features.map((feat, i) => (
                    <div key={i} className="flex items-center text-xs font-medium text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link
                    href={v.href}
                    className="inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-[#ff7a00] to-[#f59e0b] hover:from-[#ea6f00] hover:to-[#d97706] text-white font-bold text-sm shadow-md shadow-orange-400/25 transition-all"
                  >
                    <span>Browse {v.title}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Coimbatore Regional Fleet Spotlight */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Coimbatore Startup Launch Fleet
                </span>
                <h3 className="text-xl font-black text-gray-900 font-display mt-1">
                  Top-Rated Hourly Vehicles in Coimbatore
                </h3>
              </div>
              <Link
                href="/explore?destination=Coimbatore"
                className="mt-3 sm:mt-0 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center"
              >
                <span>View all Coimbatore vehicles</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Bike Spotlight */}
              <Link
                href="/services/bike-cbe-01"
                className="p-5 rounded-2xl bg-gray-50 hover:bg-orange-50/50 border border-gray-100 hover:border-orange-200 transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#ff7a00] text-[10px] font-extrabold uppercase tracking-wider">
                    Bike • ₹180/hr
                  </span>
                  <h4 className="text-sm font-bold text-gray-900 mt-2 group-hover:text-[#ff7a00] transition-colors">
                    Royal Enfield Hunter 350 — Isha Foothills Ride
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Dual ISI helmets, mobile charger, and fuel included for scenic rides to Adiyogi.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#ff7a00] mt-4">Book Hourly Ride →</span>
              </Link>

              {/* Car Spotlight */}
              <Link
                href="/services/car-cbe-02"
                className="p-5 rounded-2xl bg-gray-50 hover:bg-emerald-50/50 border border-gray-100 transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                    Car • ₹650/hr
                  </span>
                  <h4 className="text-sm font-bold text-gray-900 mt-2 group-hover:text-emerald-700 transition-colors">
                    Toyota Innova Crysta Chauffeur — Isha & Marudhamalai
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    7-seater luxury AC with courteous local chauffeur for family pilgrimages and trips.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 mt-4">Book Hourly Car →</span>
              </Link>

              {/* Van Spotlight */}
              <Link
                href="/services/van-cbe-03"
                className="p-5 rounded-2xl bg-gray-50 hover:bg-orange-50/50 border border-gray-100 hover:border-orange-200 transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#ff7a00] text-[10px] font-extrabold uppercase tracking-wider">
                    Van • ₹1,100/hr
                  </span>
                  <h4 className="text-sm font-bold text-gray-900 mt-2 group-hover:text-[#ff7a00] transition-colors">
                    Force Urbania 12-Seater — Valparai 40 Hairpins Safari
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    High-roof luxury reclining seats and mountain-certified driver for group hill tours.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#ff7a00] mt-4">Book Hourly Van →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Rules Notice */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 gap-4">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-gray-900">Vehicle Category Policy</p>
                <p className="text-gray-500">
                  Hourly Tourism strictly permits only verified Bikes, Cars, and Vans for safety,
                  quality, and insurance compliance. Other categories are not supported.
                </p>
              </div>
            </div>
            <Link href="/terms" className="text-emerald-700 font-bold hover:underline whitespace-nowrap">
              Review Fleet Terms
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
