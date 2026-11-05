import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { DEFAULT_DESTINATIONS, CityDestination } from '@/lib/destinations'

export const dynamic = 'force-dynamic'

// GET: Public list of active/launched destinations and cities
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryFilter = searchParams.get('category')
    const stateFilter = searchParams.get('state')

    const adminSupabase = await createAdminSupabaseClient()

    // 1. Check if platform_settings has custom city destinations
    const { data: setting } = await adminSupabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'city_destinations')
      .maybeSingle()

    let allDestinations: CityDestination[] = DEFAULT_DESTINATIONS
    if (setting?.value && Array.isArray(setting.value)) {
      allDestinations = setting.value
    }

    // 2. Only return launched/active cities to providers and users
    let activeDestinations = allDestinations.filter((d) => d.is_active)

    if (categoryFilter) {
      activeDestinations = activeDestinations.filter(
        (d) => d.category.toLowerCase() === categoryFilter.toLowerCase()
      )
    }

    if (stateFilter) {
      activeDestinations = activeDestinations.filter(
        (d) => d.state.toLowerCase() === stateFilter.toLowerCase()
      )
    }

    return NextResponse.json({
      success: true,
      destinations: activeDestinations,
      cities: activeDestinations,
      total: activeDestinations.length,
    })
  } catch (err: any) {
    console.error('Fetch destinations error:', err)
    // Always fall back to default launched Coimbatore so app never fails
    const fallback = DEFAULT_DESTINATIONS.filter((d) => d.is_active)
    return NextResponse.json({
      success: true,
      destinations: fallback,
      cities: fallback,
      total: fallback.length,
    })
  }
}

