'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Compass,
  Building2,
  CheckCircle2,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { showToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types'

// Google G logo component
function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRoleParam = searchParams.get('role') as UserRole | null

  const { user, profile, signUp, signInWithGoogle, loading: authLoading } = useAuth()

  const [role, setRole] = useState<UserRole>(
    initialRoleParam && ['customer', 'provider', 'company'].includes(initialRoleParam)
      ? initialRoleParam
      : 'customer'
  )
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-redirect if user is already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      if (!profile) return
      const userRole = profile.role || (user.user_metadata?.role as string) || 'customer'
      let target = '/dashboard'
      if (userRole === 'admin') target = '/admin'
      else if (userRole === 'provider') target = '/provider'
      else if (userRole === 'company') target = '/company'
      window.location.href = target
    }
  }, [user, profile, authLoading])

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      if (errorParam === 'oauth_failed') {
        setError('Google sign-up was cancelled or could not be completed.')
      } else if (errorParam === 'missing_code') {
        setError('Google sign-up did not return an authorization code. Please try again.')
      } else {
        setError(decodeURIComponent(errorParam))
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. Deduct duplicates & enforce strict role isolation across portals
      try {
        const checkRes = await fetch(
          `/api/auth/check-email?email=${encodeURIComponent(email)}&role=${role}`
        )
        if (checkRes.ok) {
          const checkData = await checkRes.json()
          if (checkData.exists) {
            if (checkData.registeredRole === 'customer' && role !== 'customer') {
              throw new Error(
                'Account already exists in Tourist Portal. To register as a Provider or Company, please use a distinct email address, or sign in to your Tourist account.'
              )
            }
            if (checkData.registeredRole === 'provider' && role !== 'provider') {
              throw new Error(
                'This email is already registered as an Independent Provider. Please sign in through the Provider Portal or use a different email.'
              )
            }
            if (checkData.registeredRole === 'company' && role !== 'company') {
              throw new Error(
                'This email is already registered as a Company Operator. Please sign in through the Company Portal or use a different email.'
              )
            }
            if (checkData.registeredRole === role) {
              throw new Error(
                `An account already exists with this email for ${roleLabels[role]?.label || role}. Please sign in to your existing account.`
              )
            }
          }
        }
      } catch (checkErr: any) {
        if (checkErr.message?.includes('already exists') || checkErr.message?.includes('registered as')) {
          throw checkErr
        }
      }

      const res = await signUp(email, password, fullName, role)
      if (res?.error) {
        throw new Error(res.error)
      }

      // Save email for easy sign-in on return
      if (typeof window !== 'undefined') {
        localStorage.setItem('ht_remembered_email', email.trim())
        localStorage.setItem('ht_remembered_role', role)
      }

      // Synchronize role and create provider/company draft record
      try {
        await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, fullName, phone }),
        })
      } catch {}

      showToast.success('Account created successfully!')
      let target = '/dashboard'
      if (role === 'provider') {
        target = '/provider'
      } else if (role === 'company') {
        target = '/company'
      } else if (role === 'admin') {
        target = '/admin'
      }

      window.location.href = target
    } catch (err: any) {
      setError(err.message || 'Error signing up')
      showToast.error(err.message || 'Error creating account')
    } finally {
      setLoading(false)
    }
  }

  // Google sign up
  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    setError(null)

    try {
      const target =
        role === 'provider'
          ? '/provider'
          : role === 'company'
          ? '/company'
          : '/dashboard'
      const res = await signInWithGoogle(role, target)
      if (res?.error) {
        if (
          res.error.toLowerCase().includes('provider is not enabled') ||
          res.error.toLowerCase().includes('unsupported provider')
        ) {
          setError(
            'Google Sign-Up requires Google OAuth activated in your Supabase Dashboard (Authentication → Providers → Google). You can register with Email & Password below.'
          )
          showToast.error('Google provider not yet enabled in Supabase')
        } else {
          setError(res.error)
          showToast.error(res.error)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start Google sign-up')
    } finally {
      setGoogleLoading(false)
    }
  }

  const roleLabels: Record<string, { label: string; desc: string }> = {
    customer: {
      label: 'Tourist / Customer',
      desc: 'Book hourly bikes, cars, vans, guides, and unique tours.',
    },
    provider: {
      label: 'Independent Host / Provider',
      desc: 'List your hourly vehicle or guide services and earn flexible income.',
    },
    company: {
      label: 'Tourism Fleet / Operator',
      desc: 'Manage commercial multi-vehicle fleet and operator staff.',
    },
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xl shadow-gray-200/50">
          {/* Logo prominently at the top */}
          <div className="text-center mb-6">
            <div className="inline-block hover:scale-105 transition-transform mb-3">
              <Logo variant="hero" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 font-display">
              Join Hourly Tourism
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Create an account to book or host tourism services by the hour.
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Select Account Type:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`py-2.5 px-2 rounded-2xl text-xs font-bold transition-all border flex flex-col items-center space-y-1 ${
                  role === 'customer'
                    ? 'border-[#0a4d29] bg-green-50/80 text-[#0a4d29] shadow-sm ring-1 ring-green-600/20'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>🧳 Tourist</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('provider')}
                className={`py-2.5 px-2 rounded-2xl text-xs font-bold transition-all border flex flex-col items-center space-y-1 ${
                  role === 'provider'
                    ? 'border-[#ff7a00] bg-orange-50/80 text-[#ff7a00] shadow-sm ring-1 ring-orange-500/20'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>🏍️ Provider</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('company')}
                className={`py-2.5 px-2 rounded-2xl text-xs font-bold transition-all border flex flex-col items-center space-y-1 ${
                  role === 'company'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-800 shadow-sm ring-1 ring-blue-500/20'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>🏢 Operator</span>
              </button>
            </div>

            <p className="text-[11px] text-gray-500 mt-2 px-1">
              {roleLabels[role]?.desc}
            </p>
          </div>

          {/* Google Sign Up Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            className="w-full py-3 px-4 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center space-x-3 active:scale-[0.99] disabled:opacity-50"
          >
            <GoogleIcon className="w-5 h-5" />
            <span>
              {googleLoading
                ? 'Connecting Google...'
                : `Sign up with Google as ${roleLabels[role]?.label.split(' ')[0]}`}
            </span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400 font-medium tracking-wider">
                or sign up with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium leading-relaxed">
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
              <span>Create {roleLabels[role]?.label.split('/')[0].trim()} Account</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Already have an account?{' '}
              <Link
                href={`/login?role=${role}`}
                className="font-bold text-[#ff7a00] hover:text-[#ea6f00]"
              >
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

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SignUpForm />
    </Suspense>
  )
}
