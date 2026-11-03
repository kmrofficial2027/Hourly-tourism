import React from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata = {
  title: 'Terms & Conditions | Hourly Tourism',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-6">
        <h1 className="text-3xl font-black text-gray-900 font-display">Terms of Service</h1>
        <p className="text-xs text-gray-500">Effective Date: March 2024</p>
        <div className="text-sm text-gray-600 leading-relaxed space-y-4">
          <p>
            Welcome to Hourly Tourism. By accessing or using our marketplace platform, you agree
            to be bound by these Terms and Conditions.
          </p>
          <h2 className="text-base font-bold text-gray-900 mt-4">1. Authorized Transport Categories</h2>
          <p>
            Hourly Tourism is an hourly travel marketplace connecting customers with verified providers
            offering Bikes, Cars, Vans, and Local Tour Guides. We explicitly restrict vehicle listings
            to Bikes, Cars, and Vans only.
          </p>
          <h2 className="text-base font-bold text-gray-900 mt-4">2. Hourly Bookings & Overlap Prevention</h2>
          <p>
            All bookings are tracked on an hourly schedule with buffer times to prevent double bookings.
            Users agree to return vehicles and conclude tours punctually at the scheduled completion time.
          </p>
          <h2 className="text-base font-bold text-gray-900 mt-4">3. Driving Licenses & Compliance</h2>
          <p>
            Tourists renting self-drive vehicles must possess and present a valid driving license at
            pickup. Helmet usage on two-wheelers is strictly mandatory under Indian motor vehicle regulations.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

