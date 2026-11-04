import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'

// POST: Synchronize and persist user role between auth.users metadata, profiles table, and provider/company profiles
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { role, fullName, phone } = body

    const targetRole = ['customer', 'provider', 'company', 'admin'].includes(role)
      ? role
      : 'customer'

    const adminSupabase = await createAdminSupabaseClient()

    // 1. Check or fetch existing profile
    const { data: existingProfile } = await adminSupabase
      .from('profiles')
      .select('id, role, full_name, phone')
      .eq('id', user.id)
      .maybeSingle()

    // Strict Role Preservation: If user already has a profile with a role, prevent accidental cross-role overwrite
    let finalRole = targetRole
    if (existingProfile?.role) {
      if (existingProfile.role === 'admin') {
        finalRole = 'admin'
      } else if (existingProfile.role === 'customer' && targetRole !== 'customer') {
        return NextResponse.json(
          {
            error:
              'Account already exists in Tourist Portal. Each portal requires a separate account. Please sign in to the Tourist Portal or register a distinct account for Provider.',
          },
          { status: 403 }
        )
      } else if (existingProfile.role !== targetRole) {
        return NextResponse.json(
          {
            error: `This account is already registered as ${existingProfile.role}. Please sign in through the appropriate portal.`,
          },
          { status: 403 }
        )
      } else {
        finalRole = existingProfile.role
      }
    }

    // 2. Upsert profile in profiles table
    await adminSupabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: fullName || existingProfile?.full_name || user.user_metadata?.full_name || 'User',
      role: finalRole,
      phone: phone || existingProfile?.phone || null,
      is_active: true,
      updated_at: new Date().toISOString(),
    })

    // 3. Update auth.users metadata so JWT has the role synchronously
    await adminSupabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        role: finalRole,
        full_name: fullName || existingProfile?.full_name || user.user_metadata?.full_name,
      },
    })

    // 4. If provider, ensure a provider_profiles record exists
    if (finalRole === 'provider') {
      const { data: existingProvider } = await adminSupabase
        .from('provider_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!existingProvider) {
        await adminSupabase.from('provider_profiles').insert({
          user_id: user.id,
          business_name: fullName || 'Independent Host',
          verification_status: 'pending',
        })
      }
    }

    // 5. If company, ensure a company_profiles record exists
    if (finalRole === 'company') {
      const { data: existingCompany } = await adminSupabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!existingCompany) {
        await adminSupabase.from('company_profiles').insert({
          user_id: user.id,
          company_name: fullName || 'Commercial Fleet',
          verification_status: 'approved',
        })
      }
    }

    return NextResponse.json({
      success: true,
      role: finalRole,
      userId: user.id,
    })
  } catch (err: any) {
    console.error('Auth sync API error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

// GET: Query current ground-truth role and profile
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = await createAdminSupabaseClient()

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    const { data: prov } = await adminSupabase
      .from('provider_profiles')
      .select('id, verification_status')
      .eq('user_id', user.id)
      .maybeSingle()

    const { data: comp } = await adminSupabase
      .from('company_profiles')
      .select('id, verification_status')
      .eq('user_id', user.id)
      .maybeSingle()

    let effectiveRole = profile?.role || (user.user_metadata?.role as string) || 'customer'
    if (comp) effectiveRole = 'company'
    else if (prov && effectiveRole !== 'company') effectiveRole = 'provider'

    return NextResponse.json({
      role: effectiveRole,
      profile,
      hasProviderProfile: !!prov,
      hasCompanyProfile: !!comp,
    })
  } catch (err: any) {
    console.error('Auth sync GET error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

