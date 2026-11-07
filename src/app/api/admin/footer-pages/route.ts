import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import {
  DEFAULT_FOOTER_PAGES_SETTINGS,
  type FooterPagesSettings,
} from '@/lib/footerCategoryPages'

export const dynamic = 'force-dynamic'

let cachedFooterSettings: FooterPagesSettings | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 60 * 1000

// GET: Fetch current footer category pages configuration
export async function GET() {
  try {
    const now = Date.now()
    if (cachedFooterSettings && now - cacheTimestamp < CACHE_TTL_MS) {
      return NextResponse.json(
        { success: true, settings: cachedFooterSettings },
        { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
      )
    }

    const adminSupabase = await createAdminSupabaseClient()
    const { data: setting } = await adminSupabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'footer_category_pages_settings')
      .maybeSingle()

    let settings: FooterPagesSettings = DEFAULT_FOOTER_PAGES_SETTINGS
    if (setting?.value && typeof setting.value === 'object') {
      settings = {
        ...DEFAULT_FOOTER_PAGES_SETTINGS,
        ...setting.value,
        hourly_services: {
          ...DEFAULT_FOOTER_PAGES_SETTINGS.hourly_services,
          ...(setting.value.hourly_services || {}),
        },
        tourist_portal: {
          ...DEFAULT_FOOTER_PAGES_SETTINGS.tourist_portal,
          ...(setting.value.tourist_portal || {}),
        },
        providers_hosts: {
          ...DEFAULT_FOOTER_PAGES_SETTINGS.providers_hosts,
          ...(setting.value.providers_hosts || {}),
        },
        support_legal: {
          ...DEFAULT_FOOTER_PAGES_SETTINGS.support_legal,
          ...(setting.value.support_legal || {}),
        },
        footer_contacts: {
          ...DEFAULT_FOOTER_PAGES_SETTINGS.footer_contacts,
          ...(setting.value.footer_contacts || {}),
        },
      }
    }

    cachedFooterSettings = settings
    cacheTimestamp = now

    return NextResponse.json(
      { success: true, settings },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    )
  } catch (err: any) {
    console.error('Footer pages GET error:', err)
    return NextResponse.json({ success: true, settings: DEFAULT_FOOTER_PAGES_SETTINGS })
  }
}

// POST/PATCH: Update footer category pages configuration (Admin only)
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
    cachedFooterSettings = null
    cacheTimestamp = 0

    // Check if platform_settings record exists
    const { data: existing } = await adminSupabase
      .from('platform_settings')
      .select('id')
      .eq('key', 'footer_category_pages_settings')
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
          key: 'footer_category_pages_settings',
          value: settings,
          category: 'general',
          description: 'Customizable content and headers for footer category pages',
          is_public: true,
        })
      saveErr = error
    }

    if (saveErr) {
      console.error('Error saving footer category pages settings:', saveErr)
      return NextResponse.json({ error: saveErr.message }, { status: 500 })
    }

    cachedFooterSettings = settings
    cacheTimestamp = Date.now()

    return NextResponse.json({
      success: true,
      message: 'Footer category pages updated successfully!',
      settings,
    })
  } catch (err: any) {
    console.error('Footer pages POST error:', err)
    return NextResponse.json({ error: err.message || 'Failed to save settings' }, { status: 500 })
  }
}
