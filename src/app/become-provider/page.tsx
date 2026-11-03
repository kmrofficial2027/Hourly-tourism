'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldCheck,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  UploadCloud,
  Building2,
  User,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { showToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'

export default function BecomeProviderPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [providerType, setProviderType] = useState<'individual' | 'company'>('individual')
  const [businessName, setBusinessName] = useState('')
  const [serviceCategory, setServiceCategory] = useState('bike')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      router.push('/login?redirect=/become-provider')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/providers/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerType,
          businessName,
          serviceCategory,
          city,
          phone,
          hourlyRate: Number(hourlyRate),
          description,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit provider application')
      }

      setSuccess(true)
      showToast.success('Provider onboarding submitted! Redirecting to provider portal...')
      setTimeout(() => {
        router.push(providerType === 'company' ? '/company' : '/provider')
      }, 1500)
    } catch (err: any) {
      showToast.error(err.message || 'Error submitting application')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0a4d29] to-[#065f46] text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-800/60 px-4 py-1.5 rounded-full border border-emerald-700/50">
            Earn with Hourly Tourism
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight mt-4 mb-6 leading-tight">
            Turn your travel services into guaranteed hourly earnings.
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Join hundreds of verified bike owners, car chauffeurs, van operators, and local guides
            earning flexible hourly income with transparent payouts and full schedule control.
          </p>
        </div>
      </section>

      {/* Form Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-20 relative z-20 w-full">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xl shadow-gray-200/50">
          {success ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 font-display">
                Welcome to Hourly Tourism Partner Network!
              </h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Your provider profile has been initiated. Our team will review your verification
                documents within 24 hours.
              </p>
              <Link href="/provider">
                <Button variant="primary" className="mt-4">
                  Open Provider Dashboard
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-display">
                  Step 1: Partner Information
                </h2>
                <p className="text-xs text-gray-500">
                  Select your operator model and provide your basic business credentials.
                </p>
              </div>

              {/* Account Type Toggle */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setProviderType('individual')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3 ${
                    providerType === 'individual'
                      ? 'border-[#ff7a00] bg-orange-50/50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <User className="w-6 h-6 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Independent Provider</p>
                    <p className="text-[11px] text-gray-500">Individual bike/car owner or guide</p>
                  </div>
                </div>

                <div
                  onClick={() => setProviderType('company')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3 ${
                    providerType === 'company'
                      ? 'border-[#ff7a00] bg-orange-50/50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <Building2 className="w-6 h-6 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Tourism Company / Operator</p>
                    <p className="text-[11px] text-gray-500">Fleet operator or travel agency</p>
                  </div>
                </div>
              </div>

              {/* Business Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={providerType === 'company' ? 'Company Name' : 'Host / Business Name'}
                  required
                  placeholder={providerType === 'company' ? 'e.g. Royal Travels Pvt Ltd' : 'e.g. Ramesh Rides'}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />

                <Select
                  label="Primary Hourly Service Category"
                  required
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  options={[
                    { label: '🏍️ Bike Rental (Hourly)', value: 'bike' },
                    { label: '🚗 Car Rental (Hourly)', value: 'car' },
                    { label: '🚐 Van Rental (Hourly)', value: 'van' },
                    { label: '🧑‍🏫 Local Tour Guide', value: 'local_guide' },
                    { label: '🗺️ Sightseeing Tours', value: 'sightseeing_tour' },
                    { label: '🎭 Local Experiences', value: 'experience' },
                  ]}
                />
              </div>

              {/* City, Phone, Estimated Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Operating City"
                  required
                  placeholder="e.g. Goa, Jaipur, Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />

                <Input
                  label="WhatsApp / Contact Phone"
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <Input
                  label="Base Hourly Rate (₹)"
                  type="number"
                  required
                  placeholder="e.g. 299"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                />
              </div>

              {/* Description */}
              <Textarea
                label="About your service or fleet"
                required
                rows={3}
                placeholder="Mention vehicle models, experience years, specializations, or unique perks..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-1">
                <p className="font-bold text-gray-900">Platform Terms:</p>
                <p>• Platform commission: 10% on completed bookings.</p>
                <p>• Only Bikes, Cars, and Vans permitted under transport categories.</p>
                <p>• Payouts processed every Tuesday directly to your bank account.</p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={loading}
                className="rounded-2xl font-bold text-base"
              >
                {user ? 'Submit Onboarding Application' : 'Sign In to Submit Application'}
              </Button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

