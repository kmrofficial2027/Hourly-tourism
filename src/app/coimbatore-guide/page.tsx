import React from 'react'
import Link from 'next/link'
import {
  MapPin,
  Clock,
  Car,
  Bike,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Coffee,
  HelpCircle,
  FileText,
  Navigation,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SearchBar } from '@/components/layout/SearchBar'
import { CoimbatoreTripPlanner } from '@/components/coimbatore/CoimbatoreTripPlanner'
import { COIMBATORE_CIRCUITS } from '@/components/coimbatore/CoimbatoreTripPlanner'

export const metadata = {
  title: 'Coimbatore Hourly Travel Guide — Places, Trips & Circuits | Hourly Tourism',
  description:
    'Discover the best places to visit in and around Coimbatore by the hour: Isha Adiyogi, Marudhamalai, Siruvani Waterfalls, Valparai 40 Hairpins, Pollachi, and Perur Temple.',
}

export default function CoimbatoreGuidePage() {
  const distanceMatrix = [
    { destination: 'Isha Yoga & 112-ft Adiyogi', distance: '32 km', driveTime: '45 mins', idealHours: '3 to 5 Hours', bestTransport: 'Bike or Car' },
    { destination: 'Marudhamalai Murugan Temple', distance: '12 km', driveTime: '25 mins', idealHours: '2 to 3 Hours', bestTransport: 'Scooter or Sedan' },
    { destination: 'Siruvani Waterfalls & Dam', distance: '35 km', driveTime: '55 mins', idealHours: '4 to 6 Hours', bestTransport: 'Adventure Bike or Car' },
    { destination: 'Valparai 40 Hairpin Ghats', distance: '105 km', driveTime: '2 hrs 45 mins', idealHours: '8 to 12 Hours', bestTransport: 'Van or 4x4 SUV' },
    { destination: 'Pollachi Coconut Country & Canals', distance: '42 km', driveTime: '1 hr', idealHours: '5 to 7 Hours', bestTransport: 'Thar 4x4 or Van' },
    { destination: 'Perur Pateeswarar Temple', distance: '7 km', driveTime: '15 mins', idealHours: '2 to 3 Hours', bestTransport: 'Car or Guide' },
    { destination: 'Gedee Car Museum & RS Puram', distance: '3 km', driveTime: '10 mins', idealHours: '3 to 4 Hours', bestTransport: 'City Bike or Car' },
    { destination: 'Baralikadu Parisal Coracle & Pillur', distance: '65 km', driveTime: '1 hr 45 mins', idealHours: '6 to 8 Hours', bestTransport: '12-Seater Van' },
  ]

  const insiderTips = [
    {
      title: 'Isha 7 PM Adiyogi Divya Darshanam',
      content:
        'The monumental 112-ft bust comes alive with a 14-minute 3D laser projection and musical sound spectacle every evening at 7:00 PM. Book 4 hours starting at 4:30 PM to catch Dhyanalinga, Surya Kund dip, and the show.',
    },
    {
      title: 'Siruvani Sweet Water Forest Gate Timings',
      content:
        'The Tamil Nadu Forest Department check-post at Sadivayal issues entry passes only until 3:30 PM. Single-use plastic bottles are strictly prohibited. Carry reusable flasks to sample the sweetest drinking water in India.',
    },
    {
      title: 'Valparai Hairpins 15 to 28 Tahr Watch',
      content:
        'Between hairpin bends 15 and 28, slow down near rocky cliff faces to spot the endangered Nilgiri Tahr mountain goat grazing on vertical precipices.',
    },
    {
      title: 'Iconic Kongunadu Dining Stops',
      content:
        'Never leave Coimbatore without experiencing Sree Annapoorna filter coffee and roast dosa on DB Road, RS Puram, and sampling authentic Arisi Paruppu Sadam prepared with shallots and cold-pressed coconut oil.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-emerald-50/70 via-white to-white py-16 sm:py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4">
            <Compass className="w-3.5 h-3.5" />
            <span>Coimbatore Startup Launch Edition</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight font-display mb-6">
            The Complete Coimbatore <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900">
              Hourly Travel & Day Escapes Guide
            </span>
          </h1>

          <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8 max-w-3xl mx-auto">
            From the mystical Velliangiri foothills and 112-ft Adiyogi to the 40 hairpin curves of Valparai,
            the world’s sweetest water at Siruvani, and 1500-year-old Chola stone temples — explore Coimbatore
            on your own terms, paying strictly for the hours you use.
          </p>

          <div className="max-w-3xl mx-auto">
            <SearchBar compact initialDestination="Coimbatore" />
          </div>
        </div>
      </section>

      {/* Interactive Circuit Planner */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CoimbatoreTripPlanner />
        </div>
      </section>

      {/* Distance, Travel Time & Recommended Hours Matrix */}
      <section className="py-16 bg-gray-50/60 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
              Quick Reference Table
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-display mt-3">
              Coimbatore Distance & Optimal Hourly Durations
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              All distances calculated from central Coimbatore Junction / Gandhipuram bus terminal.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-gray-200/80 bg-white shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-4 px-6">Destination Circuit</th>
                  <th className="py-4 px-6">Distance (One Way)</th>
                  <th className="py-4 px-6">Approx Drive Time</th>
                  <th className="py-4 px-6">Recommended Hours</th>
                  <th className="py-4 px-6">Ideal Transport</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {distanceMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900">
                      {item.destination}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {item.distance}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {item.driveTime}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        {item.idealHours}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {item.bestTransport}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/explore?destination=${encodeURIComponent(item.destination.split(' ')[0])}`}
                        className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-900"
                      >
                        <span>Book</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Local Insider Travel Advice */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
              Kovai Traveler Essentials
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-display mt-3">
              Local Insider Tips for Coimbatore
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Key tips gathered from local drivers, certified historians, and forest naturalists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {insiderTips.map((tip, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-3xl bg-gray-50/80 border border-gray-100 flex items-start space-x-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-1">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    {tip.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {tip.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Transport Fleet strictly Bikes, Cars, Vans */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full">
            Authorized Transport Categories
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-display text-white mt-4 mb-4">
            Hourly Mobility strictly for Bikes, Cars & Vans
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-10">
            No buses, no fixed schedules. Pure individual and group hourly freedom across Coimbatore.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <Link
              href="/explore?category=bike"
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Bike className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Hourly Bikes</h3>
              <p className="text-xs text-gray-400 mt-1">Royal Enfield Hunter 350, Himalayan 450, Aerox 155 maxi-scooters.</p>
              <span className="text-xs font-bold text-emerald-400 mt-4 inline-block">From ₹150 / hr →</span>
            </Link>

            <Link
              href="/explore?category=car"
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Hourly Cars</h3>
              <p className="text-xs text-gray-400 mt-1">Innova Crysta, Thar 4x4, Ertiga Hybrid with professional chauffeurs.</p>
              <span className="text-xs font-bold text-emerald-400 mt-4 inline-block">From ₹480 / hr →</span>
            </Link>

            <Link
              href="/explore?category=van"
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Hourly Vans</h3>
              <p className="text-xs text-gray-400 mt-1">Force Urbania 12-Seater, Tempo Traveller for Valparai & family trips.</p>
              <span className="text-xs font-bold text-emerald-400 mt-4 inline-block">From ₹950 / hr →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Ready to Book CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-700 to-teal-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight mb-4">
            Ready to Explore Coimbatore by the Hour?
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base mb-8 max-w-2xl mx-auto">
            Choose your start time, pick your duration, and enjoy total flexibility with verified local providers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/explore?destination=Coimbatore"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-emerald-950 font-black text-sm shadow-xl hover:bg-emerald-50 active:scale-95 transition-all"
            >
              Explore All Coimbatore Services
            </Link>
            <Link
              href="/become-provider"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-900/60 hover:bg-emerald-900/80 text-white font-bold text-sm border border-emerald-400/30 transition-all"
            >
              List Your Vehicle or Service in Coimbatore
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

