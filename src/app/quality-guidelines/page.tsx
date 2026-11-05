import React from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  ShieldCheck,
  Award,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Star,
  Clock,
  Car,
  Bike,
  Navigation,
  ArrowRight,
} from 'lucide-react'

export const metadata = {
  title: 'Quality & Safety Guidelines for Hosts | Hourly Tourism',
  description:
    'Mandatory vehicle fitness, chauffeur conduct, hygiene standards, and zero-tolerance policies for Hourly Tourism hosts and operators.',
}

export default function QualityGuidelinesPage() {
  const standards = [
    {
      icon: Car,
      title: 'Vehicle Fitness & Age Limit',
      points: [
        'All commercial cars and vans must be under 6 years from registration date with valid Fitness Certificates (FC).',
        'Dual-zone air conditioning must be maintained in pristine working order at all times.',
        'Tires must meet minimum 3mm tread depth; spare tire, jack, and emergency tool kit must be accessible.',
        'Interiors must be vacuumed, sanitized, and free of tobacco or artificial odors prior to each booking.',
      ],
    },
    {
      icon: Bike,
      title: 'Two-Wheeler Rental Protocols',
      points: [
        'Two ISI-certified (minimum ISI 4151) helmets in sanitary condition provided free of cost.',
        'Front and rear brakes, headlamps, indicators, and mirrors thoroughly inspected before handover.',
        'Fuel level documented on digital handover form; transparent return level expectations.',
        'Mandatory roadside assistance emergency contact card attached to vehicle key fob.',
      ],
    },
    {
      icon: Clock,
      title: 'Chauffeur Etiquette & Punctuality',
      points: [
        '10-Minute Rule: Arrive at the tourist’s designated pickup pin at least 10 minutes prior to booking start time.',
        'Courteous, non-intrusive professionalism. Respect tourist privacy, preferences, and pace.',
        'Zero commission detours: Never pressure tourists into unrequested emporiums, shops, or restaurants.',
        'Luggage assistance: Professional chauffeurs provide polite loading and unloading of tourist baggage.',
      ],
    },
    {
      icon: FileCheck,
      title: 'Mandatory Compliance & Documents',
      points: [
        'Commercial RC or valid Tourist Taxi permit with state taxes paid for destination circuits.',
        'Valid Commercial Driving License (or permanent LMV for self-drive verifications).',
        'Comprehensive motor insurance with active third-party passenger liability coverage.',
        'Valid Pollution Under Control (PUC) certificate updated every 6 months.',
      ],
    },
  ]

  const zeroTolerance = [
    {
      title: 'Intoxication & Driving Under Influence (DUI)',
      desc: 'Zero tolerance for alcohol, narcotics, or prescription sedatives while on duty. Violations result in immediate police referral and permanent lifetime blacklisting.',
    },
    {
      title: 'Off-Platform Cash Solicitation',
      desc: 'Demanding cash outside platform escrow or attempting to negotiate offline trips leads to immediate wallet freeze and forfeiture of active payouts.',
    },
    {
      title: 'Unnotified No-Shows & Last-Minute Drops',
      desc: 'Canceling within 2 hours of a confirmed booking without an verified emergency desk clearance incurs a penalty and temporary account deactivation.',
    },
    {
      title: 'Misleading Listing Information',
      desc: 'Substituting a different vehicle model or unverified replacement driver without prior written tourist approval is strictly prohibited.',
    },
  ]

  const badgeTiers = [
    {
      name: 'Verified Host',
      req: 'Aadhaar, DL, and Vehicle FC verified',
      perk: 'Standard search listing & 10% platform fee',
    },
    {
      name: 'Star Operator',
      req: '25+ completed trips with 4.7+ rating',
      perk: 'Priority search placement & faster payout clearance',
    },
    {
      name: 'Super Host Elite',
      req: '100+ trips, 4.9+ rating, <1% cancellation',
      perk: 'Discounted 8% platform fee & featured badge on homepage',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-4 py-1.5 rounded-full inline-block mb-4">
            Trust & Quality Benchmark
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-display text-white mb-6">
            Host & Operator Quality Guidelines
          </h1>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-8">
            Hourly Tourism sets the gold standard for on-demand travel in South India. Our guidelines protect your business reputation and ensure memorable tourist experiences.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/become-provider"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/40 transition-all text-sm group"
            >
              <span>Join as a Verified Host</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-bold text-gray-300 hover:text-white bg-gray-800/80 hover:bg-gray-800 border border-gray-700 transition-all text-sm"
            >
              <span>Contact Host Support</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Standards Grid */}
      <section className="py-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
              4 Operational Pillars
            </span>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight font-display">
              Mandatory Operational Standards
            </h2>
            <p className="text-sm text-gray-600">
              Every host and fleet listing is vetted against these standards prior to activation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {standards.map((std, idx) => {
              const Icon = std.icon
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl border border-gray-200/80 p-8 shadow-sm space-y-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">{std.title}</h3>
                  </div>

                  <ul className="space-y-3">
                    {std.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start text-xs sm:text-sm text-gray-600 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2.5 mt-0.5 flex-shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Zero Tolerance Policies */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
              Non-Negotiable
            </span>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight font-display">
              Zero-Tolerance Violations
            </h2>
            <p className="text-sm text-gray-600">
              Breach of any of the following items triggers immediate account suspension.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {zeroTolerance.map((zt, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-rose-50/50 border border-rose-100 flex items-start space-x-4"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0 mt-1">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-gray-900">{zt.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{zt.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Badges & Recognition */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              Host Recognition
            </span>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight font-display">
              Host Tiers & Reward Badges
            </h2>
            <p className="text-sm text-gray-600">
              Higher tourist ratings directly translate to more bookings and reduced commission fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {badgeTiers.map((b, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm text-center space-y-3"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{b.name}</h3>
                <p className="text-xs text-gray-500">{b.req}</p>
                <div className="pt-3 border-t border-gray-100">
                  <span className="text-xs font-bold text-emerald-600">{b.perk}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-black tracking-tight">
            Ready to Partner with Hourly Tourism?
          </h2>
          <p className="text-gray-300 text-sm max-w-xl mx-auto">
            Submit your vehicle RC, commercial permit, and Aadhaar to get verified within 24 hours.
          </p>
          <div>
            <Link
              href="/become-provider"
              className="inline-flex items-center px-8 py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl transition-all text-sm group"
            >
              <span>Submit Host Application</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

