import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import {
  DEFAULT_HOMEPAGE_FEATURED_SETTINGS,
  type HomepageFeaturedSettings,
} from '@/lib/homepageFeatured'

export const dynamic = 'force-dynamic'

// GET: Fetch current homepage showcase hosts and region bundle copy
export async function GET() {
  try {
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

    return NextResponse.json({ success: true, settings })
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

    if (!settings) {
      return NextResponse.json({ error: 'Settings payload is required' }, { status: 400 })
    }

    const updatedSettings: HomepageFeaturedSettings = {
      section_eyebrow: settings.section_eyebrow || DEFAULT_HOMEPAGE_FEATURED_SETTINGS.section_eyebrow,
      section_title: settings.section_title || DEFAULT_HOMEPAGE_FEATURED_SETTINGS.section_title,
      all_regions_badge: settings.all_regions_badge || DEFAULT_HOMEPAGE_FEATURED_SETTINGS.all_regions_badge,
      all_regions_title: settings.all_regions_title || DEFAULT_HOMEPAGE_FEATURED_SETTINGS.all_regions_title,
      all_regions_subtitle: settings.all_regions_subtitle || DEFAULT_HOMEPAGE_FEATURED_SETTINGS.all_regions_subtitle,
      region_configs: settings.region_configs || DEFAULT_HOMEPAGE_FEATURED_SETTINGS.region_configs,
      hosts: Array.isArray(settings.hosts) ? settings.hosts : DEFAULT_HOMEPAGE_FEATURED_SETTINGS.hosts,
    }

    await adminSupabase.from('platform_settings').upsert(
      {
        key: 'homepage_showcase_bundles',
        value: updatedSettings,
        description: 'Homepage Showcase Rider Hosts and Region Bundles Configuration',
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      },
      { onConflict: 'key' }
    )

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: 'Homepage showcase and region bundle settings saved successfully!',
    })
  } catch (err: any) {
    console.error('Homepage featured POST error:', err)
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  return POST(request)
}
