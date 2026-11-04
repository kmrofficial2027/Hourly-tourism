'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertTriangle,
  KeyRound,
  ChevronLeft,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { showToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (authError) {
        throw new Error(authError.message || 'Invalid administrator credentials.')
      }

      if (!authData.user) {
        throw new Error('Authentication failed.')
      }

      // 2. Strict Role Verification via server API to bypass any client RLS issues
      let userRole: string | null = (authData.user.user_metadata?.role as string) || null

      try {
        const verifyRes = await fetch('/api/auth/sync')
        if (verifyRes.ok) {
          const verifyData = await verifyRes.json()
          userRole = verifyData.role
        }
      } catch {}

      if (userRole !== 'admin') {
        // Immediate sign out and reject
        await supabase.auth.signOut()
        throw new Error(
          'ACCESS DENIED: This account does not possess Platform Administrator clearance.'
        )
      }

      showToast.success('Admin clearance confirmed. Accessing Console...')
      window.location.href = '/admin'
    } catch (err: any) {
      setError(err.message || 'Authentication error.')
      showToast.error(err.message || 'Admin authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <Link
          href="/"
          className="inline-flex items-center text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>Back to Marketplace</span>
        </Link>
        <div className="flex items-center space-x-2 text-[11px] font-bold tracking-widest uppercase text-amber-400">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Internal Security Console</span>
        </div>
      </header>

      {/* Main Admin Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          {/* Logo with security shield */}
          <div className="text-center mb-6">
            <div className="inline-block p-3 rounded-2xl bg-white mb-4 shadow-lg">
              <Logo variant="compact" />
            </div>

            <div className="flex items-center justify-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Platform Administration</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-display">
              Administrative Console
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Confidential access for Hourly Tourism operators and executive management.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminSignIn} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Admin Email
              </label>
              <div className="flex items-center space-x-2 px-3.5 py-3 rounded-xl bg-slate-800/80 border border-slate-700 focus-within:border-amber-400 transition-all">
                <Mail className="w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@hourlytourism.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Master Security Password
              </label>
              <div className="flex items-center space-x-2 px-3.5 py-3 rounded-xl bg-slate-800/80 border border-slate-700 focus-within:border-amber-400 transition-all">
                <Lock className="w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-800/60 text-xs text-red-300 font-medium flex items-start space-x-2 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Verifying Clearance...' : 'Authenticate Admin Access'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security warning footer */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500 leading-relaxed">
            <p>
              Unauthorized access attempts are monitored and recorded. Only authorized platform administrators may proceed.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-600 border-t border-slate-900">
        © {new Date().getFullYear()} Hourly Tourism Inc. — Internal Infrastructure.
      </footer>
    </div>
  )
}

