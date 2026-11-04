'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, UserRole } from '@/types'

export interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  role: UserRole | null
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithGoogle: (role?: UserRole, redirectPath?: string) => Promise<{ data?: any; error: string | null }>
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// In-memory profile cache across navigations to eliminate repeat fetches
let cachedProfile: Profile | null = null
let cachedUser: User | null = null

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(cachedUser)
  const [profile, setProfile] = useState<Profile | null>(cachedProfile)
  const [loading, setLoading] = useState<boolean>(!cachedUser)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  // Fetch profile with memory caching
  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      if (cachedProfile && cachedProfile.id === userId) {
        return cachedProfile
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) {
          console.warn('Profile fetch note:', error.message)
          return null
        }

        cachedProfile = data as Profile
        return cachedProfile
      } catch (err) {
        return null
      }
    },
    [supabase]
  )

  // Initialize Auth once on app mount
  useEffect(() => {
    let isMounted = true

    const init = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!isMounted) return

        if (currentUser) {
          cachedUser = currentUser
          setUser(currentUser)
          const prof = await fetchProfile(currentUser.id)
          if (isMounted) {
            setProfile(prof)
            setLoading(false)
          }
        } else {
          cachedUser = null
          cachedProfile = null
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setLoading(false)
          setError(err instanceof Error ? err.message : 'Auth initialization failed')
        }
      }
    }

    init()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return

      if (event === 'SIGNED_IN' && session?.user) {
        cachedUser = session.user
        setUser(session.user)
        const prof = await fetchProfile(session.user.id)
        if (isMounted) {
          setProfile(prof)
          setLoading(false)
        }
      } else if (event === 'SIGNED_OUT') {
        cachedUser = null
        cachedProfile = null
        setUser(null)
        setProfile(null)
        setLoading(false)
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        cachedUser = session.user
        setUser(session.user)
      } else if (event === 'USER_UPDATED' && session?.user) {
        cachedUser = session.user
        setUser(session.user)
        cachedProfile = null // invalidate cache to fetch fresh
        const prof = await fetchProfile(session.user.id)
        if (isMounted) {
          setProfile(prof)
          setLoading(false)
        }
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  // Sign In
  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setLoading(false)
      setError(error.message)
      return { error: error.message }
    }

    if (data.user) {
      cachedUser = data.user
      setUser(data.user)
      cachedProfile = null
      const prof = await fetchProfile(data.user.id)
      setProfile(prof)
      setLoading(false)
    }

    return { error: null }
  }

  // Sign Up
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = 'customer'
  ) => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    })

    if (error) {
      setLoading(false)
      setError(error.message)
      return { error: error.message }
    }

    if (data.user) {
      // Upsert profile and sync user_metadata via server admin API to bypass any client RLS restrictions
      try {
        await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, fullName }),
        })
      } catch (syncErr) {
        console.warn('Sync profile error:', syncErr)
      }

      cachedUser = data.user
      setUser(data.user)
      cachedProfile = null
      const prof = await fetchProfile(data.user.id)
      setProfile(prof)
      setLoading(false)
    }

    return { error: null }
  }

  // Google OAuth
  const signInWithGoogle = async (
    role: UserRole = 'customer',
    redirectPath?: string
  ) => {
    setLoading(true)
    setError(null)

    // Store role and redirect destination in cookies and localStorage for the OAuth callback
    if (typeof document !== 'undefined') {
      document.cookie = `ht_auth_role=${encodeURIComponent(role)}; path=/; max-age=600; SameSite=Lax`
      document.cookie = `ht_auth_redirect=${encodeURIComponent(redirectPath || '')}; path=/; max-age=600; SameSite=Lax`
      try {
        localStorage.setItem('ht_auth_role', role)
        localStorage.setItem('ht_auth_redirect', redirectPath || '')
      } catch {}
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://hourlytourism.netlify.app'
    const redirectTo = `${origin}/auth/callback`

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      })

      if (error) {
        setLoading(false)
        setError(error.message)
        return { error: error.message }
      }

      return { data, error: null }
    } catch (err: any) {
      const msg = err.message || 'Google sign-in initialization failed'
      setLoading(false)
      setError(msg)
      return { error: msg }
    }
  }

  // Sign Out
  const signOut = async () => {
    setLoading(true)
    cachedUser = null
    cachedProfile = null
    const { error } = await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setLoading(false)

    // Redirect to website home page on logout
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }

    if (error) {
      setError(error.message)
      return { error: error.message }
    }
    return { error: null }
  }

  // Refresh Profile
  const refreshProfile = async () => {
    if (!user) return
    cachedProfile = null
    const prof = await fetchProfile(user.id)
    setProfile(prof)
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    role: (profile?.role as UserRole) ?? (user?.user_metadata?.role as UserRole) ?? null,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    return {
      user: null,
      profile: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      role: null,
      signIn: async () => ({ error: null }),
      signInWithGoogle: async () => ({ error: null }),
      signUp: async () => ({ error: null }),
      signOut: async () => ({ error: null }),
      refreshProfile: async () => {},
    }
  }
  return context
}
