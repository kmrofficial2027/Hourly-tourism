import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET: Check if an email is already registered, and verify role compatibility
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')?.trim().toLowerCase()
    const targetRole = searchParams.get('role') // 'customer' | 'provider'

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
    }

    const adminSupabase = await createAdminSupabaseClient()

    // Query profiles table for this email
    const { data: profile, error } = await adminSupabase
      .from('profiles')
      .select('id, email, full_name, role, is_active')
      .ilike('email', email)
      .maybeSingle()

    if (error) {
      console.warn('Check email query note:', error.message)
      return NextResponse.json({ exists: false })
    }

    if (!profile) {
      return NextResponse.json({ exists: false })
    }

    // Check if the user has a provider_profiles record
    let effectiveRole = profile.role
    if (effectiveRole !== 'admin') {
      const { data: prov } = await adminSupabase
        .from('provider_profiles')
        .select('id')
        .eq('user_id', profile.id)
        .maybeSingle()

      if (prov?.id) {
        effectiveRole = 'provider'
      }
    }

    const roleMatches = targetRole ? effectiveRole === targetRole : true

    return NextResponse.json({
      exists: true,
      registeredRole: effectiveRole,
      fullName: profile.full_name,
      roleMatches,
      isActive: profile.is_active,
    })
  } catch (err: any) {
    console.error('Check email API error:', err)
    return NextResponse.json({ exists: false, error: err.message }, { status: 500 })
  }
}

