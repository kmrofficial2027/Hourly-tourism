import React from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata = {
  title: 'Privacy Policy | Hourly Tourism',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-6">
        <h1 className="text-3xl font-black text-gray-900 font-display">Privacy Policy</h1>
        <p className="text-xs text-gray-500">Last updated: March 2024</p>
        <div className="text-sm text-gray-600 leading-relaxed space-y-4">
          <p>
            Your privacy is paramount. This Privacy Policy details how Hourly Tourism collects,
            safeguards, and processes personal data and identity verification documents.
          </p>
          <h2 className="text-base font-bold text-gray-900 mt-4">1. Information We Collect</h2>
          <p>
            We collect profile information (name, email, phone number), booking itineraries, and
            government documents submitted by providers exclusively for verification. Sensitive
            verification documents are securely stored and accessible only to authorized compliance staff.
          </p>
          <h2 className="text-base font-bold text-gray-900 mt-4">2. Payments Security</h2>
          <p>
            Payment transactions are tokenized and processed via certified PCI-DSS compliant gateways
            (Cashfree Payments &amp; Razorpay). Hourly Tourism does not store raw credit card numbers or UPI PINs on its servers.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

