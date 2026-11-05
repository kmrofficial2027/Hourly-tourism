import React from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  Wallet,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Calendar,
  Zap,
  HelpCircle,
} from 'lucide-react'

export const metadata = {
  title: 'How Earnings Work for Providers & Hosts | Hourly Tourism',
  description:
    'Transparent 10% platform commission, 100% escrow protection, and guaranteed weekly bank payouts for hourly vehicle hosts and tour guides.',
}

export default function HowEarningsWorkPage() {
  const earningTiers = [
    {
      category: 'Bikes & Scooters',
      typicalRate: '₹180 - ₹350 / hr',
      avgHoursPerDay: '4 - 6 hrs',
      dailyPotential: '₹1,200 - ₹2,100',
      monthlyPotential: '₹35,000 - ₹60,000',
      inclusions: 'Complimentary helmets, self-drive or guided escorts',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      category: 'Chauffeur Cars & Sedans',
      typicalRate: '₹480 - ₹850 / hr',
      avgHoursPerDay: '6 - 8 hrs',
      dailyPotential: '₹3,000 - ₹6,800',
      monthlyPotential: '₹85,000 - ₹1,80,000',
      inclusions: 'Courteous verified chauffeur, dual AC, fuel packages',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      category: 'Luxury Vans & Tempo Travellers',
      typicalRate: '₹950 - ₹1,800 / hr',
      avgHoursPerDay: '8 - 10 hrs',
      dailyPotential: '₹7,500 - ₹18,000',
      monthlyPotential: '₹2,20,000 - ₹4,80,000',
      inclusions: '9-17 passenger capacity, hill/ghat expert driver',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      category: 'Regional Certified Guides',
      typicalRate: '₹300 - ₹600 / hr',
      avgHoursPerDay: '3 - 6 hrs',
      dailyPotential: '₹1,500 - ₹3,600',
      monthlyPotential: '₹40,000 - ₹90,000',
      inclusions: 'Temple history, tribal trails, food walking circuits',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ]

  const workflowSteps = [
    {
      step: '01',
      title: 'Set Your Custom Hourly Tariff',
      desc: 'You decide your base hourly rate and minimum booking duration (e.g., 2 hrs minimum). Adjust tariffs anytime according to tourist demand, holidays, or seasonal peaks.',
    },
    {
      step: '02',
      title: 'Pre-Funded Escrow Lock',
      desc: 'When a tourist books your vehicle or guide service, the full trip amount is locked securely in platform escrow. You never have to worry about unpaid trips or no-shows.',
    },
    {
      step: '03',
      title: 'Trip Verification via Secure OTP',
      desc: 'Upon meeting the tourist, verify the start OTP on your Provider App. When the scheduled hours conclude, enter the completion OTP to immediately release the funds.',
    },
    {
      step: '04',
      title: 'Weekly Automated Payouts',
      desc: 'Every Tuesday, your net earnings (90% after the platform 10% fee) are settled directly to your registered bank account or UPI ID with complete GST and tax statements.',
    },
  ]

  const faqs = [
    {
      q: 'What is the platform commission rate?',
      a: 'Hourly Tourism charges a simple, transparent 10% commission on completed trips. There are zero listing fees, zero monthly subscription charges, and no hidden deductions.',
    },
    {
      q: 'How do in-trip hourly extensions work?',
      a: 'If a tourist wishes to explore longer, they can request an extra 1 to 4 hours directly from their trip screen. If you accept, the extra hours are billed at your standard hourly tariff and automatically credited to your earnings.',
    },
    {
      q: 'What happens if a tourist cancels at the last minute?',
      a: 'We protect your time. If a tourist cancels between 2 and 4 hours before the booking, you receive a 50% cancellation compensation. If they cancel within 2 hours or no-show, you receive the full 100% reservation payout.',
    },
    {
      q: 'When are funds transferred to my bank?',
      a: 'Payouts are processed automatically every Tuesday via NEFT/IMPS/UPI. You can also view your live pending balance and trip breakdown in your Provider Dashboard at any time.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-4 py-1.5 rounded-full inline-block mb-4">
            Transparent Partner Economics
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-display text-white mb-6">
            How Earnings Work for Hosts & Fleet Operators
          </h1>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-8">
            Keep 90% of every hour booked. Zero listing fees, 100% guaranteed escrow protection, and direct bank payouts every single week.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/become-provider"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/40 transition-all text-sm group"
            >
              <span>Become a Verified Provider</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/provider"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-bold text-gray-300 hover:text-white bg-gray-800/80 hover:bg-gray-800 border border-gray-700 transition-all text-sm"
            >
              <span>Go to Provider Dashboard</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Earnings */}
      <section className="py-16 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">You Keep 90%</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We deduct only a standard 10% platform fee to cover Razorpay/Cashfree payment gateways, GPS safety tracking, marketing, and 24/7 tourist helpline.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">100% Escrow Protection</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Tourists pay in advance into a verified escrow account before trip commencement. No cash haggling, no bad debts, and zero risk of customer default.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Weekly Auto-Settlement</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Settlements are pushed every Tuesday directly to your verified bank account or UPI VPA without manual withdrawal requests or processing delays.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Realistic Earning Potential Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff7a00] bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
              Estimated Incomes
            </span>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight font-display">
              Earnings Potential by Vehicle Category
            </h2>
            <p className="text-sm text-gray-600">
              Based on actual average operating hours across Coimbatore, Pollachi, and Nilgiri circuits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {earningTiers.map((tier) => (
              <div
                key={tier.category}
                className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col justify-between hover:shadow-lg transition-all hover:border-emerald-500 group"
              >
                <div className="space-y-4">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border inline-block ${tier.badgeColor}`}
                  >
                    {tier.category}
                  </span>

                  <div>
                    <span className="text-xs text-gray-400 font-medium">Standard Tariff</span>
                    <p className="text-lg font-black text-gray-900 mt-0.5">{tier.typicalRate}</p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Avg Utilization:</span>
                      <span className="font-bold text-gray-800">{tier.avgHoursPerDay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Daily Revenue:</span>
                      <span className="font-bold text-emerald-600">{tier.dailyPotential}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Monthly Est.:</span>
                      <span className="font-black text-gray-900">{tier.monthlyPotential}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 italic pt-2 border-t border-gray-100">
                    {tier.inclusions}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100">
                  <Link
                    href="/become-provider"
                    className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white transition-colors"
                  >
                    Register Vehicle
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Step Workflow */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
              Seamless Flow
            </span>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight font-display">
              From Trip Request to Bank Settlement
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((s) => (
              <div
                key={s.step}
                className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-3"
              >
                <span className="text-3xl font-black text-emerald-600 font-mono">{s.step}</span>
                <h3 className="text-base font-bold text-gray-900">{s.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Provider FAQs */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
              Frequently Asked Questions for Hosts
            </h2>
            <p className="text-sm text-gray-500">
              Clear answers regarding payments, safety deposits, and taxes.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-2"
              >
                <h3 className="text-base font-bold text-gray-900">{f.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-emerald-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Start Earning on Your Own Terms Today
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto">
            Join over 250+ active vehicle hosts and certified guides earning steady hourly income across Coimbatore and Western Ghats.
          </p>
          <div>
            <Link
              href="/become-provider"
              className="inline-flex items-center px-8 py-3.5 rounded-xl font-bold text-emerald-900 bg-white hover:bg-emerald-50 shadow-xl transition-all text-sm group"
            >
              <span>Apply for Host Verification</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

