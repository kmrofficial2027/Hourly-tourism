'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, UserRole } from '@/types'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  })

  const supabase = createClient()

  // ---- Fetch profile for a given user id ----
  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error.message)
        return null
      }
      return data as Profile
    },
    [supabase]
  )

  // ---- Initialise & listen for auth changes ----
  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const profile = await fetchProfile(user.id)
          setState({ user, profile, loading: false, error: null })
        } else {
          setState({ user: null, profile: null, loading: false, error: null })
        }
      } catch (err) {
        setState({
          user: null,
          profile: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to initialise auth',
        })
      }
    }

    initAuth()

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchProfile(session.user.id)
        setState({ user: session.user, profile, loading: false, error: null })
      } else if (event === 'SIGNED_OUT') {
        setState({ user: null, profile: null, loading: false, error: null })
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setState((prev) => ({ ...prev, user: session.user }))
      } else if (event === 'USER_UPDATED' && session?.user) {
        const profile = await fetchProfile(session.user.id)
        setState({ user: session.user, profile, loading: false, error: null })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  // ---- Actions ----

  const signIn = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }))
      return { error: error.message }
    }

    if (data.user) {
      const profile = await fetchProfile(data.user.id)
      setState({ user: data.user, profile, loading: false, error: null })
    }

    return { error: null }
  }

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = 'customer'
  ) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    })

    if (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }))
      return { error: error.message }
    }

    if (data.user) {
      // Create profile row
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        role,
        is_active: true,
        email_verified: false,
        phone_verified: false,
      })

      if (profileError) {
        console.error('Profile creation error:', profileError.message)
      }

      const profile = await fetchProfile(data.user.id)
      setState({ user: data.user, profile, loading: false, error: null })
    }

    return { error: null }
  }

  const signOut = async () => {
    setState((prev) => ({ ...prev, loading: true }))
    const { error } = await supabase.auth.signOut()
    if (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }))
      return { error: error.message }
    }
    setState({ user: null, profile: null, loading: false, error: null })
    return { error: null }
  }

  const refreshProfile = async () => {
    if (!state.user) return
    const profile = await fetchProfile(state.user.id)
    setState((prev) => ({ ...prev, profile }))
  }

  return {
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    role: state.profile?.role ?? null,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }
}
