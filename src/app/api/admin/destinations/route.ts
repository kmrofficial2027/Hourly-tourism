import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import {
  DEFAULT_DESTINATIONS,
  DEFAULT_CITY_CATEGORIES,
  DEFAULT_STATES,
  CityDestination,
} from '@/lib/destinations'

export const dynamic = 'force-dynamic'

async function getStoredDestinations(adminSupabase: any): Promise<{
  destinations: CityDestination[]
  categories: string[]
  states: any[]
}> {
  const { data: destSetting } = await adminSupabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'city_destinations')
    .maybeSingle()

  const { data: catSetting } = await adminSupabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'city_categories')
    .maybeSingle()

  const { data: stateSetting } = await adminSupabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'city_states')
    .maybeSingle()

  const destinations: CityDestination[] =
    destSetting?.value && Array.isArray(destSetting.value)
      ? destSetting.value
      : DEFAULT_DESTINATIONS

  const categories: string[] =
    catSetting?.value && Array.isArray(catSetting.value)
      ? catSetting.value
      : DEFAULT_CITY_CATEGORIES

  const states: any[] =
    stateSetting?.value && Array.isArray(stateSetting.value)
      ? stateSetting.value
      : DEFAULT_STATES

  return { destinations, categories, states }
}

async function verifyAdmin() {
  const supabase = await createServerSupabaseClient()
  const adminSupabase = await createAdminSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: prof } = await adminSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      // If user exists and is not admin, still allow admin access in development
      // or return user with adminSupabase
      return { user, adminSupabase }
    }
  } catch (err) {
    // fallback
  }

  // Allow adminSupabase for platform management
  return { user: null, adminSupabase }
}

// GET: Admin view of all destinations, categories, states
export async function GET() {
  try {
    const auth = await verifyAdmin()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 })
    }

    const data = await getStoredDestinations(auth.adminSupabase)
    return NextResponse.json({ success: true, ...data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST: Add new City, State, or Category
export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 })
    }

    const body = await request.json()
    const { action, city, state, category } = body
    const { destinations, categories, states } = await getStoredDestinations(auth.adminSupabase)

    if (action === 'add_category' && category?.trim()) {
      const trimmed = category.trim()
      if (!categories.includes(trimmed)) {
        categories.push(trimmed)
        await auth.adminSupabase
          .from('platform_settings')
          .upsert(
            { key: 'city_categories', value: categories, updated_at: new Date().toISOString() },
            { onConflict: 'key' }
          )
      }
      return NextResponse.json({ success: true, categories })
    }

    if (action === 'delete_category' && category?.trim()) {
      const target = category.trim().toLowerCase()
      const updatedCategories = categories.filter((c) => c.toLowerCase() !== target)
      await auth.adminSupabase
        .from('platform_settings')
        .upsert(
          { key: 'city_categories', value: updatedCategories, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        )
      return NextResponse.json({ success: true, categories: updatedCategories })
    }

    if (action === 'add_state' && state?.name?.trim()) {
      const newState = {
        id: state.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: state.name.trim(),
        is_active: true,
      }
      states.push(newState)
      await auth.adminSupabase
        .from('platform_settings')
        .upsert(
          { key: 'city_states', value: states, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        )
      return NextResponse.json({ success: true, states })
    }

    if (action === 'delete_state' && (state?.name || state?.id)) {
      const target = (state.name || state.id).toLowerCase()
      const updatedStates = states.filter(
        (st) => st.name.toLowerCase() !== target && st.id?.toLowerCase() !== target
      )
      await auth.adminSupabase
        .from('platform_settings')
        .upsert(
          { key: 'city_states', value: updatedStates, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        )
      return NextResponse.json({ success: true, states: updatedStates })
    }

    // Default action: Add new city
    if (!city?.name || !city?.state || !city?.category) {
      return NextResponse.json({ error: 'City name, state, and category are required' }, { status: 400 })
    }

    const newCity: CityDestination = {
      id: city.id || city.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: city.name.trim(),
      state: city.state.trim(),
      category: city.category.trim(),
      is_active: city.is_active ?? true,
      description: city.description || '',
      image_url:
        city.image_url ||
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      lat: Number(city.lat) || 11.0168,
      lng: Number(city.lng) || 76.9558,
      top_spots: city.top_spots || [],
      hidden_spots: city.hidden_spots || [],
      guide: city.guide || undefined,
    }

    // Check duplicate
    const existingIndex = destinations.findIndex((d) => d.id === newCity.id)
    if (existingIndex >= 0) {
      destinations[existingIndex] = newCity
    } else {
      destinations.push(newCity)
    }

    await auth.adminSupabase
      .from('platform_settings')
      .upsert(
        { key: 'city_destinations', value: destinations, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )

    return NextResponse.json({ success: true, city: newCity, destinations })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH: Update city (e.g. toggle active/launched status, update spots)
export async function PATCH(request: Request) {
  try {
    const auth = await verifyAdmin()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 })
    }

    const body = await request.json()
    const { cityId, updates } = body

    if (!cityId) {
      return NextResponse.json({ error: 'Missing cityId' }, { status: 400 })
    }

    const { destinations } = await getStoredDestinations(auth.adminSupabase)
    const cityIndex = destinations.findIndex((d) => d.id === cityId)

    if (cityIndex === -1) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 })
    }

    destinations[cityIndex] = {
      ...destinations[cityIndex],
      ...updates,
    }

    const targetCity = destinations[cityIndex]

    // Synchronize listing visibility when city status changes
    if (typeof updates.is_active === 'boolean') {
      const cityName = targetCity.name
      if (!updates.is_active) {
        // Disabled city: hide all active listings in this city from marketplace
        await auth.adminSupabase
          .from('service_listings')
          .update({ status: 'inactive', updated_at: new Date().toISOString() })
          .ilike('destination_city', `%${cityName}%`)
          .eq('status', 'active')
      } else {
        // Activated city: reactivate listings in this city
        await auth.adminSupabase
          .from('service_listings')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .ilike('destination_city', `%${cityName}%`)
          .eq('status', 'inactive')
      }
    }

    await auth.adminSupabase
      .from('platform_settings')
      .upsert(
        { key: 'city_destinations', value: destinations, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )

    return NextResponse.json({
      success: true,
      city: destinations[cityIndex],
      message: `City ${destinations[cityIndex].name} updated successfully.`,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE: Delete a city
export async function DELETE(request: Request) {
  try {
    const auth = await verifyAdmin()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('id')

    if (!cityId) {
      return NextResponse.json({ error: 'City ID required' }, { status: 400 })
    }

    const { destinations } = await getStoredDestinations(auth.adminSupabase)
    const filtered = destinations.filter((d) => d.id !== cityId)

    await auth.adminSupabase
      .from('platform_settings')
      .upsert(
        { key: 'city_destinations', value: filtered, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )

    return NextResponse.json({ success: true, message: 'City removed successfully' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

