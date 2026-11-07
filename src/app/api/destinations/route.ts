import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { DEFAULT_DESTINATIONS, CityDestination } from '@/lib/destinations'

export const dynamic = 'force-dynamic'

// High-speed in-memory cache to eliminate repetitive Supabase network calls (60s TTL)
let cachedDestinations: CityDestination[] | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 60 * 1000

// GET: Public list of active/launched destinations and cities
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryFilter = searchParams.get('category')
    const stateFilter = searchParams.get('state')

    const now = Date.now()
    let allDestinations: CityDestination[] = DEFAULT_DESTINATIONS

    if (cachedDestinations && now - cacheTimestamp < CACHE_TTL_MS) {
      allDestinations = cachedDestinations
    } else {
      try {
        const adminSupabase = await createAdminSupabaseClient()
        const { data: setting } = await adminSupabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'city_destinations')
          .maybeSingle()

        if (setting?.value && Array.isArray(setting.value)) {
          allDestinations = setting.value
          cachedDestinations = setting.value
          cacheTimestamp = now
        } else {
          cachedDestinations = DEFAULT_DESTINATIONS
          cacheTimestamp = now
        }
      } catch (fetchErr) {
        console.warn('Destinations DB read failed, using cached/default:', fetchErr)
        if (cachedDestinations) {
          allDestinations = cachedDestinations
        }
      }
    }

    // Only return launched/active cities to providers and users
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

    return NextResponse.json(
      {
        success: true,
        destinations: activeDestinations,
        cities: activeDestinations,
        total: activeDestinations.length,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
      }
    )
  } catch (err: any) {
    console.error('Fetch destinations error:', err)
    const fallback = DEFAULT_DESTINATIONS.filter((d) => d.is_active)
    return NextResponse.json({
      success: true,
      destinations: fallback,
      cities: fallback,
      total: fallback.length,
    })
  }
}
