'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/Logo'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [statusMessage, setStatusMessage] = useState('Verifying credentials...')
  const hasExecutedRef = React.useRef(false)

  useEffect(() => {
    if (hasExecutedRef.current) return
    hasExecutedRef.current = true

    async function handleAuthCallback() {
      const code = searchParams.get('code')
      const oauthError = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (oauthError || errorDescription) {
        const errorMsg = errorDescription || oauthError || 'Authentication cancelled'
        window.location.replace(`/login?error=${encodeURIComponent(errorMsg)}`)
        return
      }

      if (!code) {
        window.location.replace('/login?error=missing_code')
        return
      }

      // Retrieve stored target role and redirect preference
      let storedRole = searchParams.get('role')
      let storedRedirect = searchParams.get('redirect')

      if (typeof window !== 'undefined') {
        if (!storedRole) {
          storedRole = localStorage.getItem('ht_auth_role')
        }
        if (!storedRedirect) {
          storedRedirect = localStorage.getItem('ht_auth_redirect')
        }
      }

      const effectiveRole = storedRole || 'customer'
      setStatusMessage(`Completing secure sign-in as ${effectiveRole}...`)

      try {
        const supabase = createClient()

        // 1. Check if a session is already established
        const { data: initialSession } = await supabase.auth.getSession()
        let authUser = initialSession?.session?.user

        if (!authUser) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            // Check if concurrent background exchange succeeded
            const { data: retrySession } = await supabase.auth.getSession()
            if (retrySession?.session?.user) {
              authUser = retrySession.session.user
            } else {
              console.error('Client exchangeCodeForSession error:', exchangeError)
              window.location.replace(`/login?error=${encodeURIComponent(exchangeError.message)}`)
              return
            }
          } else {
            authUser = data?.user || null
          }
        }

        if (!authUser) {
          window.location.replace('/login?error=session_not_created')
          return
        }

        if (typeof window !== 'undefined') {
          localStorage.removeItem('ht_auth_role')
          localStorage.removeItem('ht_auth_redirect')
        }

        setStatusMessage('Synchronizing portal profile...')

        // Sync profile and enforce strict role boundaries
        const syncRes = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: effectiveRole,
            fullName: authUser.user_metadata?.full_name || authUser.user_metadata?.name,
          }),
        })

        const syncData = await syncRes.json().catch(() => ({}))

        if (!syncRes.ok) {
          await supabase.auth.signOut()
          const errMsg = syncData.error || 'Portal account mismatch. Please sign in with the correct role.'
          window.location.replace(`/login?role=${encodeURIComponent(effectiveRole)}&error=${encodeURIComponent(errMsg)}`)
          return
        }

        const resolvedRole = syncData.role || effectiveRole

        let target = '/dashboard'
        if (resolvedRole === 'admin') target = '/admin'
        else if (resolvedRole === 'provider') target = '/provider'
        else if (resolvedRole === 'company') target = '/company'

        // Only apply storedRedirect if it's a specific route matching the user's portal
        if (
          storedRedirect &&
          storedRedirect.startsWith('/') &&
          !['/login', '/signup', '/null', '/undefined', '/dashboard'].includes(storedRedirect)
        ) {
          if (resolvedRole === 'provider' && storedRedirect.startsWith('/provider')) {
            target = storedRedirect
          } else if (resolvedRole === 'company' && storedRedirect.startsWith('/company')) {
            target = storedRedirect
          } else if (resolvedRole === 'customer' && storedRedirect.startsWith('/dashboard')) {
            target = storedRedirect
          } else if (resolvedRole === 'admin') {
            target = storedRedirect
          }
        }

        setStatusMessage('Redirecting to your dashboard...')
        window.location.replace(target)
      } catch (err: any) {
        console.error('Auth callback exception:', err)
        window.location.replace(`/login?error=${encodeURIComponent(err.message || 'Authentication error')}`)
      }
    }

    handleAuthCallback()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50 text-center space-y-6">
        <div className="inline-block mb-1">
          <Logo variant="hero" />
        </div>

        <div className="relative flex justify-center items-center py-2">
          <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-[#0a4d29] animate-spin" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-gray-900 font-display">Verifying Credentials</h2>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">{statusMessage}</p>
        </div>

        <p className="text-[11px] text-gray-400">Discover More. One Hour at a Time.</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-gray-100 border-t-[#0a4d29] animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}

