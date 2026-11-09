import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { DEFAULT_HUMAN_GUIDE_SETTINGS, HumanGuideSettings } from '@/lib/humanGuideSettings'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const adminSupabase = await createAdminSupabaseClient()
    const { data: setting, error } = await adminSupabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'human_i_guide_settings')
      .maybeSingle()

    if (error) {
      console.warn('Note reading human_i_guide_settings:', error.message)
      return NextResponse.json(
        { success: true, settings: DEFAULT_HUMAN_GUIDE_SETTINGS },
        { headers: { 'Cache-Control': 'no-store, must-revalidate' } }
      )
    }

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
      }
      return NextResponse.json(
        { success: true, settings: merged },
        { headers: { 'Cache-Control': 'no-store, must-revalidate' } }
      )
    }

    return NextResponse.json(
      { success: true, settings: DEFAULT_HUMAN_GUIDE_SETTINGS },
      { headers: { 'Cache-Control': 'no-store, must-revalidate' } }
    )
  } catch (err: any) {
    console.error('Human-I Guide GET error:', err)
    return NextResponse.json(
      { success: true, settings: DEFAULT_HUMAN_GUIDE_SETTINGS },
      { headers: { 'Cache-Control': 'no-store, must-revalidate' } }
    )
  }
}

