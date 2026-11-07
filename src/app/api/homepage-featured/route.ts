import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import {
  DEFAULT_HOMEPAGE_FEATURED_SETTINGS,
  type HomepageFeaturedSettings,
} from '@/lib/homepageFeatured'

export const dynamic = 'force-dynamic'

let cachedFeaturedSettings: HomepageFeaturedSettings | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 60 * 1000

// GET: Fetch current homepage showcase hosts and region bundle copy
export async function GET() {
  try {
    const now = Date.now()
    if (cachedFeaturedSettings && now - cacheTimestamp < CACHE_TTL_MS) {
      return NextResponse.json(
        { success: true, settings: cachedFeaturedSettings },
        { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
      )
    }

    const adminSupabase = await createAdminSupabaseClient()
    const { data: setting } = await adminSupabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'homepage_showcase_bundles')
      .maybeSingle()

    let settings: HomepageFeaturedSettings = DEFAULT_HOMEPAGE_FEATURED_SETTINGS
    if (setting?.value && typeof setting.value === 'object') {
      settings = {
        ...DEFAULT_HOMEPAGE_FEATURED_SETTINGS,
        ...setting.value,
        region_configs: {
          ...DEFAULT_HOMEPAGE_FEATURED_SETTINGS.region_configs,
          ...(setting.value.region_configs || {}),
        },
        hosts: Array.isArray(setting.value.hosts) && setting.value.hosts.length > 0
          ? setting.value.hosts
          : DEFAULT_HOMEPAGE_FEATURED_SETTINGS.hosts,
      }
    }

    cachedFeaturedSettings = settings
    cacheTimestamp = now

    return NextResponse.json(
      { success: true, settings },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    )
  } catch (err: any) {
    console.error('Homepage featured GET error:', err)
    return NextResponse.json({ success: true, settings: DEFAULT_HOMEPAGE_FEATURED_SETTINGS })
  }
}

// POST/PATCH: Update homepage showcase hosts and region bundle copy (Admin only)
export async function POST(request: Request) {
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
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings payload' }, { status: 400 })
    }

    // Invalidate cache
    cachedFeaturedSettings = null
    cacheTimestamp = 0

    const { data: existing } = await adminSupabase
      .from('platform_settings')
      .select('id')
      .eq('key', 'homepage_showcase_bundles')
      .maybeSingle()

    let saveErr = null
    if (existing?.id) {
      const { error } = await adminSupabase
        .from('platform_settings')
        .update({
          value: settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
      saveErr = error
    } else {
      const { error } = await adminSupabase
        .from('platform_settings')
        .insert({
          key: 'homepage_showcase_bundles',
          value: settings,
          category: 'homepage',
          description: 'Homepage featured hosts and region showcase card details',
          is_public: true,
        })
      saveErr = error
    }

    if (saveErr) {
      console.error('Error saving homepage showcase settings:', saveErr)
      return NextResponse.json({ error: saveErr.message }, { status: 500 })
    }

    cachedFeaturedSettings = settings
    cacheTimestamp = Date.now()

    return NextResponse.json({
      success: true,
      message: 'Showcase bundles updated successfully!',
      settings,
    })
  } catch (err: any) {
    console.error('Homepage featured POST error:', err)
    return NextResponse.json({ error: err.message || 'Failed to save settings' }, { status: 500 })
  }
}
