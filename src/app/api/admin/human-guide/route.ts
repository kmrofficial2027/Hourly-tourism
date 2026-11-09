import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { DEFAULT_HUMAN_GUIDE_SETTINGS, HumanGuideSettings } from '@/lib/humanGuideSettings'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const adminSupabase = await createAdminSupabaseClient()
    const { data: setting } = await adminSupabase
      .from('platform_settings')
      .select('value, updated_at')
      .eq('key', 'human_i_guide_settings')
      .maybeSingle()

    if (setting?.value && typeof setting.value === 'object') {
      const merged: HumanGuideSettings = {
        ...DEFAULT_HUMAN_GUIDE_SETTINGS,
        ...setting.value,
        packages: Array.isArray(setting.value.packages) && setting.value.packages.length > 0
          ? setting.value.packages
          : DEFAULT_HUMAN_GUIDE_SETTINGS.packages,
        useCases: Array.isArray(setting.value.useCases) && setting.value.useCases.length > 0
          ? setting.value.useCases
          : DEFAULT_HUMAN_GUIDE_SETTINGS.useCases,
        faqs: Array.isArray(setting.value.faqs) && setting.value.faqs.length > 0
          ? setting.value.faqs
          : DEFAULT_HUMAN_GUIDE_SETTINGS.faqs,
        updatedAt: setting.updated_at || undefined,
      }
      return NextResponse.json({ success: true, settings: merged })
    }

    return NextResponse.json({ success: true, settings: DEFAULT_HUMAN_GUIDE_SETTINGS })
  } catch (err: any) {
    console.error('Admin Human-I Guide GET error:', err)
    return NextResponse.json({ success: true, settings: DEFAULT_HUMAN_GUIDE_SETTINGS })
  }
}

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

    const payloadToSave: HumanGuideSettings = {
      badgeText: String(settings.badgeText || DEFAULT_HUMAN_GUIDE_SETTINGS.badgeText),
      heroHeadline: String(settings.heroHeadline || DEFAULT_HUMAN_GUIDE_SETTINGS.heroHeadline),
      heroSubheadline: String(settings.heroSubheadline || DEFAULT_HUMAN_GUIDE_SETTINGS.heroSubheadline),
      baseHourlyRate: Number(settings.baseHourlyRate) || DEFAULT_HUMAN_GUIDE_SETTINGS.baseHourlyRate,
      minimumHours: Number(settings.minimumHours) || DEFAULT_HUMAN_GUIDE_SETTINGS.minimumHours,
      maximumHours: Number(settings.maximumHours) || DEFAULT_HUMAN_GUIDE_SETTINGS.maximumHours,
      supportPhone: String(settings.supportPhone || DEFAULT_HUMAN_GUIDE_SETTINGS.supportPhone),
      packages: Array.isArray(settings.packages) ? settings.packages : DEFAULT_HUMAN_GUIDE_SETTINGS.packages,
      useCases: Array.isArray(settings.useCases) ? settings.useCases : DEFAULT_HUMAN_GUIDE_SETTINGS.useCases,
      faqs: Array.isArray(settings.faqs) ? settings.faqs : DEFAULT_HUMAN_GUIDE_SETTINGS.faqs,
      updatedAt: new Date().toISOString(),
    }

    // Check if platform_settings record exists
    const { data: existing } = await adminSupabase
      .from('platform_settings')
      .select('id')
      .eq('key', 'human_i_guide_settings')
      .maybeSingle()

    let saveErr = null
    if (existing?.id) {
      const { error } = await adminSupabase
        .from('platform_settings')
        .update({
          value: payloadToSave,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
      saveErr = error
    } else {
      const { error } = await adminSupabase
        .from('platform_settings')
        .insert({
          key: 'human_i_guide_settings',
          value: payloadToSave,
          category: 'general',
          updated_at: new Date().toISOString(),
        })
      saveErr = error
    }

    if (saveErr) {
      console.error('Error saving Human-I Guide settings to Supabase:', saveErr)
      return NextResponse.json({ error: 'Failed to save settings to database' }, { status: 500 })
    }

    return NextResponse.json({ success: true, settings: payloadToSave })
  } catch (err: any) {
    console.error('Admin Human-I Guide POST error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

