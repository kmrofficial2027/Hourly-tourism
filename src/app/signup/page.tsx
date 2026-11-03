'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Phone, ArrowRight, Clock, ShieldCheck, Building2 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { showToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types'

export default function SignUpPage() {
  const router = useRouter()
  const { signUp } = useAuth()

  const [role, setRole] = useState<UserRole>('customer')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: signUpError } = await signUp(email, password, fullName, role)
      if (signUpError) {
        throw signUpError
      }

      showToast.success('Account created! Please check your email to verify or sign in.')
      if (role === 'provider') {
        router.push('/become-provider')
      } else if (role === 'company') {
        router.push('/company')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Error signing up')
      showToast.error(err.message || 'Error creating account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xl shadow-gray-200/50">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#ff7a00] flex items-center justify-center mx-auto mb-3 font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 font-display">Create Your Account</h1>
            <p className="text-xs text-gray-500 mt-1">
              Join Hourly Tourism to book or list services by the hour.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selector Tabs */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                I want to:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                    role === 'customer'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Book Services
                </button>
                <button
                  type="button"
                  onClick={() => setRole('provider')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                    role === 'provider'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  List as Provider
                </button>
                <button
                  type="button"
                  onClick={() => setRole('company')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                    role === 'company'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Company Operator
                </button>
              </div>
            </div>

            <Input
              label="Full Name"
              type="text"
              required
              leftIcon={<User className="w-4 h-4 text-gray-400" />}
              placeholder="e.g. Ramesh Kumar"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <Input
              label="Email Address"
              type="email"
              required
              leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Phone Number"
              type="tel"
              leftIcon={<Phone className="w-4 h-4 text-gray-400" />}
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Input
              label="Password (min 6 characters)"
              type="password"
              required
              leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={loading}
              className="rounded-2xl font-bold mt-2"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-[#ff7a00] hover:text-[#ea6f00]">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

