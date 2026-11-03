import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Profile, UserRole } from '@/types'

// ============================================================================
// Server-side Auth Helpers
// ============================================================================

/**
 * Get the currently authenticated Supabase user (server-side).
 * Returns `null` if not authenticated.
 */
export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null
  return user
}

/**
 * Get the currently authenticated user's profile (server-side).
 * Returns `null` if not authenticated or profile doesn't exist.
 */
export async function getUserProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) return null
  return profile as Profile
}

/**
 * Require authentication. Redirects to `/login` if not authenticated.
 * Returns the authenticated user.
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

/**
 * Require a specific role. Redirects to `/dashboard` if authenticated but
 * wrong role, or `/login` if not authenticated at all.
 */
export async function requireRole(role: UserRole | UserRole[]) {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  const roles = Array.isArray(role) ? role : [role]

  if (!roles.includes(profile.role)) {
    redirect('/dashboard')
  }

  return profile
}

// ============================================================================
// Auth Actions (server-side, usable from Server Actions / Route Handlers)
// ============================================================================

/**
 * Sign up a new user and create their profile.
 */
export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: UserRole = 'customer'
) {
  const supabase = await createServerSupabaseClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  })

  if (authError) {
    return { user: null, error: authError.message }
  }

  if (!authData.user) {
    return { user: null, error: 'Sign up failed. Please try again.' }
  }

  // Create profile row
  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    email,
    full_name: fullName,
    role,
    is_active: true,
    email_verified: false,
    phone_verified: false,
  })

  if (profileError) {
    // Profile creation failed – the auth trigger / RLS policy may handle this
    console.error('Profile creation error:', profileError.message)
  }

  return { user: authData.user, error: null }
}

/**
 * Sign in with email and password.
 */
export async function signIn(email: string, password: string) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { user: null, session: null, error: error.message }
  }

  return { user: data.user, session: data.session, error: null }
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  redirect('/login')
}

/**
 * Update a user's profile.
 */
export async function updateProfile(
  userId: string,
  data: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
) {
  const supabase = await createServerSupabaseClient()

  const { data: updated, error } = await supabase
    .from('profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    return { profile: null, error: error.message }
  }

  return { profile: updated as Profile, error: null }
}
