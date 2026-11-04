'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Building2,
  User,
  Compass,
  Sparkles,
  Info,
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

type PublicRole = 'customer' | 'provider' | 'company'

const roleConfigs: Record<
  PublicRole,
  {
    title: string
    subtitle: string
    badge: string
    targetUrl: string
    icon: any
    color: string
    bgLight: string
    borderColor: string
  }
> = {
  customer: {
    title: 'Customer & Tourist Sign In',
    subtitle: 'Sign in to book hourly bikes, cars, vans, guides, and tours.',
    badge: 'Tourist Portal',
    targetUrl: '/dashboard',
    icon: User,
    color: 'text-[#0a4d29]',
    bgLight: 'bg-green-50/70',
    borderColor: 'border-green-200',
  },
  provider: {
    title: 'Independent Provider Sign In',
    subtitle: 'Manage your hourly fleet, booking requests, and direct earnings.',
    badge: 'Provider Portal',
    targetUrl: '/provider',
    icon: Compass,
    color: 'text-[#ff7a00]',
    bgLight: 'bg-orange-50/70',
    borderColor: 'border-orange-200',
  },
  company: {
    title: 'Company Operator Sign In',
    subtitle: 'Manage commercial fleets, multiple drivers, and branch revenue.',
    badge: 'Company Portal',
    targetUrl: '/company',
    icon: Building2,
    color: 'text-blue-700',
    bgLight: 'bg-blue-50/70',
    borderColor: 'border-blue-200',
  },
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect')
  const initialRoleParam = searchParams.get('role') as PublicRole | null

  const { user, profile, signIn, signInWithGoogle, loading: authLoading } = useAuth()

  // Selected Login Mode (Customer, Provider, Company)
  const [selectedRole, setSelectedRole] = useState<PublicRole>(
    initialRoleParam && roleConfigs[initialRoleParam] ? initialRoleParam : 'customer'
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(true)
  const [savedEmail, setSavedEmail] = useState<string | null>(null)

  // Load saved credentials for easy sign-in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ht_remembered_email')
      const savedRole = localStorage.getItem('ht_remembered_role') as PublicRole | null
      if (saved) {
        setEmail(saved)
        setSavedEmail(saved)
      }
      if (savedRole && roleConfigs[savedRole] && !initialRoleParam) {
        setSelectedRole(savedRole)
      }
    }
  }, [initialRoleParam])

  // Auto-redirect if user is already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      // Wait until profile is fetched from database to ensure exact role routing
      if (!profile) return

      const effectiveRole = profile.role || (user.user_metadata?.role as string) || selectedRole || 'customer'
      let dest = '/dashboard'
      if (effectiveRole === 'admin') dest = '/admin'
      else if (effectiveRole === 'provider') dest = '/provider'
      else if (effectiveRole === 'company') dest = '/company'

      let target = dest
      if (
        redirectPath &&
        redirectPath.startsWith('/') &&
        !['/login', '/signup', '/null', '/undefined', '/dashboard'].includes(redirectPath)
      ) {
        if (effectiveRole === 'provider' && redirectPath.startsWith('/provider')) target = redirectPath
        else if (effectiveRole === 'company' && redirectPath.startsWith('/company')) target = redirectPath
        else if (effectiveRole === 'customer' && redirectPath.startsWith('/dashboard')) target = redirectPath
        else if (effectiveRole === 'admin') target = redirectPath
      }

      window.location.href = target
    }
  }, [user, profile, authLoading, redirectPath, selectedRole])

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      if (errorParam === 'oauth_failed') {
        setError('Google authentication was cancelled or could not be completed.')
      } else if (errorParam === 'missing_code') {
        setError('Google authentication did not return an authorization code. Please try again.')
      } else if (errorParam === 'session_not_created') {
        setError('Failed to establish user session after Google login. Please check Supabase Auth settings.')
      } else {
        setError(decodeURIComponent(errorParam))
      }
    }
  }, [searchParams])

  const currentRoleConfig = roleConfigs[selectedRole]

  // Submit password login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Strict Role Exclusivity Check before login
      try {
        const checkRes = await fetch(
          `/api/auth/check-email?email=${encodeURIComponent(email)}&role=${selectedRole}`
        )
        if (checkRes.ok) {
          const checkData = await checkRes.json()
          if (
            checkData.exists &&
            checkData.registeredRole &&
            checkData.registeredRole !== selectedRole &&
            checkData.registeredRole !== 'admin'
          ) {
            if (checkData.registeredRole === 'customer' && selectedRole === 'provider') {
              throw new Error(
                'Account already exists in Tourist Portal. Please sign in to the Tourist Portal or create a new account with a different email for Provider.'
              )
            }
            if (checkData.registeredRole === 'customer' && selectedRole === 'company') {
              throw new Error(
                'Account already exists in Tourist Portal. Please sign in to the Tourist Portal or create a new account with a different email for Company.'
              )
            }
            if (checkData.registeredRole === 'provider' && selectedRole === 'customer') {
              throw new Error(
                'This account is registered as an Independent Provider. Please switch to the Provider Portal tab to sign in.'
              )
            }
            if (checkData.registeredRole === 'company' && selectedRole === 'customer') {
              throw new Error(
                'This account is registered as a Company Operator. Please switch to the Company Portal tab to sign in.'
              )
            }
            if (checkData.registeredRole === 'provider' && selectedRole === 'company') {
              throw new Error(
                'This account is registered as an Independent Provider. Please switch to the Provider Portal tab to sign in.'
              )
            }
            if (checkData.registeredRole === 'company' && selectedRole === 'provider') {
              throw new Error(
                'This account is registered as a Company Operator. Please switch to the Company Portal tab to sign in.'
              )
            }
          }
        }
      } catch (checkErr: any) {
        if (checkErr.message?.includes('already exists') || checkErr.message?.includes('registered as')) {
          throw checkErr
        }
      }

      // 2. Authenticate
      const res = await signIn(email, password)
      if (res?.error) {
        throw new Error(res.error)
      }

      // 3. Save login details for easy sign-in
      if (typeof window !== 'undefined') {
        if (rememberMe) {
          localStorage.setItem('ht_remembered_email', email.trim())
          localStorage.setItem('ht_remembered_role', selectedRole)
          setSavedEmail(email.trim())
        } else {
          localStorage.removeItem('ht_remembered_email')
          localStorage.removeItem('ht_remembered_role')
          setSavedEmail(null)
        }
      }

      showToast.success(`Welcome back! Redirecting to ${currentRoleConfig.badge}...`)

      // Calculate role-safe portal destination
      let target = currentRoleConfig.targetUrl
      if (
        redirectPath &&
        redirectPath.startsWith('/') &&
        !['/login', '/signup', '/null', '/undefined', '/dashboard'].includes(redirectPath)
      ) {
        if (selectedRole === 'provider' && redirectPath.startsWith('/provider')) target = redirectPath
        else if (selectedRole === 'company' && redirectPath.startsWith('/company')) target = redirectPath
        else if (selectedRole === 'customer' && redirectPath.startsWith('/dashboard')) target = redirectPath
      }

      window.location.href = target
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.')
      showToast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  // Google OAuth Login
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError(null)

    try {
      let target = currentRoleConfig.targetUrl
      if (
        redirectPath &&
        redirectPath.startsWith('/') &&
        !['/login', '/signup', '/null', '/undefined', '/dashboard'].includes(redirectPath)
      ) {
        if (selectedRole === 'provider' && redirectPath.startsWith('/provider')) target = redirectPath
        else if (selectedRole === 'company' && redirectPath.startsWith('/company')) target = redirectPath
        else if (selectedRole === 'customer' && redirectPath.startsWith('/dashboard')) target = redirectPath
      }
      const res = await signInWithGoogle(selectedRole, target)
      if (res?.error) {
        // If Google provider not yet activated in Supabase dashboard
        if (
          res.error.toLowerCase().includes('provider is not enabled') ||
          res.error.toLowerCase().includes('unsupported provider')
        ) {
          setError(
            'Google Login requires Google OAuth enabled in your Supabase Dashboard (Authentication → Providers → Google). You can also sign in with Email & Password below.'
          )
          showToast.error('Google provider not yet enabled in Supabase')
        } else {
          setError(res.error)
          showToast.error(res.error)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start Google sign-in')
    } finally {
      setGoogleLoading(false)
    }
  }

  // 1-Click Demo Credentials
  const fillDemoCredentials = (role: PublicRole) => {
    setSelectedRole(role)
    const demoAccounts: Record<PublicRole, { email: string; pass: string }> = {
      customer: { email: 'tourist.demo@hourlytourism.com', pass: 'Tourist@123' },
      provider: { email: 'kovai.riders@hourlytourism.com', pass: 'Provider@123' },
      company: { email: 'kongu.fleet@hourlytourism.com', pass: 'Company@123' },
    }
    setEmail(demoAccounts[role].email)
    setPassword(demoAccounts[role].pass)
    showToast.success(`Prefilled ${roleConfigs[role].badge} credentials`)
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
            <p className="text-[11px] font-bold tracking-wider text-[#ff7a00] uppercase">
              Discover More. One Hour at a Time.
            </p>
          </div>

          {/* Role Login Mode Tabs */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2 text-center">
              Select Your Portal Login Mode
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setSelectedRole('customer')}
                className={`py-2 px-2 text-xs font-bold rounded-xl transition-all flex flex-col items-center space-y-1 ${
                  selectedRole === 'customer'
                    ? 'bg-white text-[#0a4d29] shadow-sm ring-1 ring-black/5'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>🧳 Tourist</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('provider')}
                className={`py-2 px-2 text-xs font-bold rounded-xl transition-all flex flex-col items-center space-y-1 ${
                  selectedRole === 'provider'
                    ? 'bg-white text-[#ff7a00] shadow-sm ring-1 ring-black/5'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>🏍️ Provider</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('company')}
                className={`py-2 px-2 text-xs font-bold rounded-xl transition-all flex flex-col items-center space-y-1 ${
                  selectedRole === 'company'
                    ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>🏢 Company</span>
              </button>
            </div>
          </div>

          {/* Dynamic Role Banner */}
          <div
            className={`p-3.5 rounded-2xl border mb-6 flex items-start space-x-3 transition-all ${currentRoleConfig.bgLight} ${currentRoleConfig.borderColor}`}
          >
            <currentRoleConfig.icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${currentRoleConfig.color}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-gray-900">{currentRoleConfig.title}</h2>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-white/80 border text-gray-700 shadow-2xs">
                  {currentRoleConfig.badge}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                {currentRoleConfig.subtitle}
              </p>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full py-3 px-4 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center space-x-3 active:scale-[0.99] disabled:opacity-50"
          >
            <GoogleIcon className="w-5 h-5" />
            <span>
              {googleLoading ? 'Connecting Google...' : `Continue with Google as ${currentRoleConfig.badge}`}
            </span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400 font-medium tracking-wider">
                or sign in with email
              </span>
            </div>
          </div>

          {/* Saved Account Quick Access Banner */}
          {savedEmail && email === savedEmail && (
            <div className="mb-4 p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
              <span className="font-semibold truncate">
                ⚡ Welcome back! Saved account for <strong>{savedEmail}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('ht_remembered_email')
                    localStorage.removeItem('ht_remembered_role')
                  }
                  setSavedEmail(null)
                  setEmail('')
                  showToast.success('Saved login details cleared')
                }}
                className="text-[10px] text-gray-500 hover:text-red-600 underline ml-2 flex-shrink-0"
              >
                Clear
              </button>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
              label="Password"
              type="password"
              required
              leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Remember me & Easy Sign-in options */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#15803d] border-gray-300 focus:ring-green-500"
                />
                <span className="font-medium text-gray-700">Remember me for easy sign-in</span>
              </label>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium leading-relaxed flex items-start justify-between gap-2">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-700 font-bold ml-1 flex-shrink-0"
                  aria-label="Dismiss error"
                >
                  ✕
                </button>
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
              <span>Sign In to {currentRoleConfig.badge}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* 1-Click Quick Demo Helper */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-[#ff7a00]" />
                Demo 1-Click Fill:
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(['customer', 'provider', 'company'] as PublicRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => fillDemoCredentials(r)}
                  className="px-2 py-1.5 rounded-xl bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 text-[11px] font-semibold text-gray-700 capitalize transition-all"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Don't have an account yet?{' '}
              <Link
                href={`/signup?role=${selectedRole}`}
                className="font-bold text-[#ff7a00] hover:text-[#ea6f00]"
              >
                Create {currentRoleConfig.badge} Account
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginForm />
    </Suspense>
  )
}
