import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// High-speed short-lived in-memory cache for provider profiles (10s TTL)
const profileCache = new Map<string, { data: any; ts: number }>()
const PROFILE_CACHE_TTL = 10 * 1000

// GET: Fetch provider profile details and current online/offline status
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cached = profileCache.get(user.id)
    if (cached && Date.now() - cached.ts < PROFILE_CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    const adminSupabase = await createAdminSupabaseClient()

    // 1 & 2. Fetch provider profile and base profile in parallel
    const [provRes, userRes] = await Promise.all([
      adminSupabase.from('provider_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      adminSupabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    ])

    let providerProfile = provRes.data
    const userProfile = userRes.data

    // 3. Fallback or initialize provider profile if missing
    if (!providerProfile) {
      const { data: newProfile } = await adminSupabase
        .from('provider_profiles')
        .insert({
          user_id: user.id,
          business_name: userProfile?.full_name || 'Independent Host',
          city: 'Coimbatore, Tamil Nadu',
          verification_status: 'pending',
          documents: { is_online: true },
        })
        .select('*')
        .single()
      providerProfile = newProfile
    }

    const providerId = providerProfile?.id
    const docs = providerProfile?.documents || {}

    // Online status: defaults to true unless explicitly toggled off
    const isOnline =
      typeof docs.is_online === 'boolean'
        ? docs.is_online
        : userProfile?.is_active ?? true

    // 4. Fetch counts of provider's listings in parallel
    let totalListings = 0
    let activeListings = 0

    if (providerId) {
      const [totalRes, activeRes] = await Promise.all([
        adminSupabase.from('service_listings').select('*', { count: 'exact', head: true }).eq('provider_id', providerId),
        adminSupabase.from('service_listings').select('*', { count: 'exact', head: true }).eq('provider_id', providerId).eq('status', 'active'),
      ])

      totalListings = totalRes.count || 0
      activeListings = activeRes.count || 0
    }

    const responsePayload = {
      success: true,
      businessName: providerProfile?.business_name || userProfile?.full_name || '',
      phone: userProfile?.phone || providerProfile?.address || '',
      city: providerProfile?.city || 'Coimbatore, Tamil Nadu',
      email: userProfile?.email || user.email || '',
      isOnline,
      totalListings,
      activeListings,
      verificationStatus: providerProfile?.verification_status || 'pending',
    }

    profileCache.set(user.id, { data: responsePayload, ts: Date.now() })
    return NextResponse.json(responsePayload)
  } catch (err: any) {
    console.error('Provider profile GET error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

// POST: Update provider profile details and/or toggle Online / Offline rider status
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { businessName, phone, city, isOnline } = body

    const adminSupabase = await createAdminSupabaseClient()

    // 1. Fetch current provider profile
    let { data: providerProfile } = await adminSupabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!providerProfile) {
      const { data: newProfile } = await adminSupabase
        .from('provider_profiles')
        .insert({
          user_id: user.id,
          business_name: businessName || 'Independent Host',
          city: city || 'Coimbatore, Tamil Nadu',
          verification_status: 'pending',
          documents: { is_online: isOnline ?? true },
        })
        .select('*')
        .single()
      providerProfile = newProfile
    }

    const providerId = providerProfile?.id
    const currentDocs = providerProfile?.documents || {}

    // 2. Handle Online / Offline Status Toggle
    let updatedIsOnline = typeof currentDocs.is_online === 'boolean' ? currentDocs.is_online : true

    if (typeof isOnline === 'boolean') {
      updatedIsOnline = isOnline

      // Save is_online into provider_profiles.documents
      await adminSupabase
        .from('provider_profiles')
        .update({
          documents: {
            ...currentDocs,
            is_online: isOnline,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      // Also update profiles.is_active
      await adminSupabase
        .from('profiles')
        .update({
          is_active: isOnline,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      // If going OFFLINE: mark provider's active listings as inactive so marketplace hides them
      if (!isOnline && providerId) {
        await adminSupabase
          .from('service_listings')
          .update({
            status: 'inactive',
            updated_at: new Date().toISOString(),
          })
          .eq('provider_id', providerId)
          .eq('status', 'active')
      }

      // If going ACTIVE: re-activate provider's inactive listings to active
      if (isOnline && providerId) {
        await adminSupabase
          .from('service_listings')
          .update({
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('provider_id', providerId)
          .eq('status', 'inactive')
      }
    }

    // 3. Handle Profile Info Update (business name, phone, city)
    if (businessName !== undefined || city !== undefined) {
      await adminSupabase
        .from('provider_profiles')
        .update({
          business_name: businessName ? businessName.trim() : providerProfile?.business_name,
          city: city ? city.trim() : providerProfile?.city,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
    }

    if (businessName !== undefined || phone !== undefined) {
      await adminSupabase
        .from('profiles')
        .update({
          full_name: businessName ? businessName.trim() : undefined,
          phone: phone !== undefined ? phone.trim() : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
    }

    // 4. Return updated counts
    let activeListings = 0
    let totalListings = 0

    if (providerId) {
      const [totalCountRes, activeCountRes] = await Promise.all([
        adminSupabase.from('service_listings').select('*', { count: 'exact', head: true }).eq('provider_id', providerId),
        adminSupabase.from('service_listings').select('*', { count: 'exact', head: true }).eq('provider_id', providerId).eq('status', 'active'),
      ])

      totalListings = totalCountRes.count || 0
      activeListings = activeCountRes.count || 0
    }

    // Invalidate profile cache
    profileCache.delete(user.id)

    return NextResponse.json({
      success: true,
      isOnline: updatedIsOnline,
      activeListings,
      totalListings,
      businessName: businessName || providerProfile?.business_name,
      city: city || providerProfile?.city,
      phone,
    })
  } catch (err: any) {
    console.error('Provider profile POST error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
