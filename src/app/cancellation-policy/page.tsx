import React from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ShieldCheck, Clock, RefreshCw } from 'lucide-react'

export const metadata = {
  title: 'Cancellation Policy | Hourly Tourism',
  description: 'Understand Hourly Tourism cancellation rules, refund timelines, and host protection terms.',
}

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
            Transparent Rules
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 font-display mt-3">
            Cancellation & Refund Policy
          </h1>
          <p className="text-xs text-gray-500 mt-1">Last revised: March 2024</p>
        </div>

        <div className="prose max-w-none text-sm text-gray-600 leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900">1. Standard Hourly Cancellation Windows</h2>
            <p>
              At Hourly Tourism, we balance flexibility for tourists with revenue protection for our
              independent vehicle owners and local guides who reserve specific time slots exclusively for you.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>More than 4 Hours before booking start time:</strong> 100% full refund
                automatically credited back to your original payment method (minus any payment gateway processing fees where applicable).
              </li>
              <li>
                <strong>Between 2 and 4 Hours before start time:</strong> 50% refund, with 50% paid
                to the service provider to compensate for lost booking opportunities.
              </li>
              <li>
                <strong>Less than 2 Hours or No-Show:</strong> Non-refundable. The vehicle or guide has
                already mobilized to the designated meeting or pickup location.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900">2. Provider-Initiated Cancellations</h2>
            <p>
              If an independent host or company cancels your booking due to unforeseen vehicle
              breakdown, illness, or severe weather conditions:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You receive a prompt 100% full refund.</li>
              <li>Our customer support team assists in immediately finding an equivalent replacement.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900">3. Refund Processing Time</h2>
            <p>
              Approved refunds are initiated through Cashfree Payments or Razorpay within 24 business hours. Bank settlement
              typically reflects in your account within 5-7 working days.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

