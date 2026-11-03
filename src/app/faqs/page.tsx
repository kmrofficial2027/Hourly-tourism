import React from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata = {
  title: 'Frequently Asked Questions | Hourly Tourism',
}

export default function FAQsPage() {
  const faqs = [
    {
      q: 'How does hourly booking work?',
      a: 'Choose your destination, select your desired service (Bike, Car, Van, Guide, or Experience), pick the exact hours or choose a predefined hourly package, and confirm your reservation. You only pay for the hours you book!',
    },
    {
      q: 'What vehicle types are allowed?',
      a: 'Hourly Tourism strictly allows Bikes, Cars, and Vans. No buses, boats, or other unauthorized vehicle types are permitted on the platform.',
    },
    {
      q: 'How do providers get paid?',
      a: 'Earnings from completed trips (minus the 10% platform commission) are automatically deposited directly to the provider’s verified bank account on a regular weekly payout cycle.',
    },
    {
      q: 'Can I extend my booking duration during a trip?',
      a: 'Yes, if the provider has no overlapping booking scheduled immediately after your slot, you can request an hourly extension through your dashboard.',
    },
    {
      q: 'What if my flight or train is delayed?',
      a: 'Contact your provider via the dashboard immediately. Most providers offer grace periods or can reschedule your hourly slot depending on daily availability.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
            Help Center
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 font-display mt-3">
            Frequently Asked Questions
          </h1>
          <p className="text-xs text-gray-500 mt-1">Everything you need to know about Hourly Tourism.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="p-6 rounded-3xl bg-gray-50/70 border border-gray-100 space-y-2">
              <h3 className="text-base font-bold text-gray-900">{f.q}</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}

