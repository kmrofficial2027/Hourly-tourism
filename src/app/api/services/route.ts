import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { normalizeListingImages } from '@/lib/utils'
import { DEFAULT_DESTINATIONS } from '@/lib/destinations'

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category')
    const destination = searchParams.get('destination')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minRating = searchParams.get('minRating')
    const sortBy = searchParams.get('sortBy')
    const scope = searchParams.get('scope') // 'admin' | 'provider' | null
    const all = searchParams.get('all') === 'true'

    const adminSupabase = await createAdminSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let query = adminSupabase
      .from('service_listings')
      .select('*, vehicle_details(*), hourly_packages(*), provider:provider_id(id, business_name, user_id)')

    if (scope === 'admin' || all) {
      // Admin sees everything; verify admin role if user logged in
      if (user) {
        const { data: profile } = await adminSupabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
        if (profile?.role === 'admin') {
          // Allow unrestricted access
        } else {
          // Non-admin fall back to active
          query = query.eq('status', 'active')
        }
      } else {
        query = query.eq('status', 'active')
      }
    } else if (scope === 'provider' && user) {
      // Find provider profile ID
      const { data: prov } = await adminSupabase.from('provider_profiles').select('id').eq('user_id', user.id).maybeSingle()
      const { data: comp } = await adminSupabase.from('company_profiles').select('id').eq('user_id', user.id).maybeSingle()
      
      if (prov) {
        query = query.eq('provider_id', prov.id)
      } else if (comp) {
        query = query.eq('company_id', comp.id)
      } else {
        return NextResponse.json({ listings: [] })
      }
    } else {
      // Public view: only active listings
      query = query.eq('status', 'active')
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (destination) {
      query = query.ilike('destination_city', `%${destination}%`)
    }

    if (minPrice) {
      query = query.gte('hourly_rate', Number(minPrice))
    }

    if (maxPrice) {
      query = query.lte('hourly_rate', Number(maxPrice))
    }

    if (minRating) {
      query = query.gte('average_rating', Number(minRating))
    }

    if (sortBy === 'price_asc') {
      query = query.order('hourly_rate', { ascending: true })
    } else if (sortBy === 'price_desc') {
      query = query.order('hourly_rate', { ascending: false })
    } else if (sortBy === 'rating_desc') {
      query = query.order('average_rating', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data: listings, error } = await query

    if (error) {
      console.error('Listings query error:', error)
      return NextResponse.json({ listings: [] })
    }

    const now = new Date()

    let normalizedListings = (listings || []).map((l: any) => {
      let metadata: any = {}
      try {
        if (l.terms_and_conditions && l.terms_and_conditions.startsWith('{')) {
          metadata = JSON.parse(l.terms_and_conditions)
        }
      } catch (e) {}

      const activeUntil = metadata.active_until || null
      const isExpired = activeUntil ? new Date(activeUntil) < now : false

      return {
        ...l,
        planned_spots: metadata.planned_spots || [],
        unseen_spots: metadata.unseen_spots || [],
        hidden_spots: metadata.hidden_spots || [],
        active_from: metadata.active_from || l.created_at,
        active_until: activeUntil,
        is_timed: Boolean(metadata.is_timed && activeUntil),
        is_expired: isExpired,
        rejection_reason: metadata.rejection_reason || l.rejection_reason || null,
        rejected_at: metadata.rejected_at || l.rejected_at || null,
        images: normalizeListingImages(l.images, l.category),
      }
    })

    // If public browsing (not provider scope and not admin scope), filter out expired listings
    if (scope !== 'provider' && scope !== 'admin' && !all) {
      normalizedListings = normalizedListings.filter((l: any) => !l.is_expired)
    }

    return NextResponse.json({ listings: normalizedListings })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
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

    const body = await request.json()
    const {
      title,
      description,
      shortDescription,
      category,
      destinationCity,
      destinationState,
      address,
      latitude,
      longitude,
      hourlyRate,
      minBookingHours = 1,
      maxBookingHours = 12,
      bufferTimeMinutes = 30,
      images = [],
      includedServices = [],
      excludedServices = [],
      termsAndConditions,
      cancellationPolicy,
      meetingPoint,
      pickupLocation,
      maxParticipants,
      vehicleDetails, // { vehicle_type: 'bike' | 'car' | 'van', brand, model, year, passenger_capacity, fuel_type, features }
      guideDetails, // { languages, specializations, experience_years, max_group_size }
      packages = [], // array of { name, duration_hours, price, description }
      plannedSpots = [],
      unseenSpots = [],
      hiddenSpots = [],
      activeFrom,
      activeUntil,
      isTimed = false,
    } = body

    // Strict validation: Transport category restriction
    const allowedCategories = ['bike', 'car', 'van', 'local_guide', 'sightseeing_tour', 'experience']
    if (!allowedCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Only ${allowedCategories.join(', ')} are permitted.` },
        { status: 400 }
      )
    }

    // Vehicle type restriction strictly enforced
    if (['bike', 'car', 'van'].includes(category)) {
      if (!vehicleDetails?.vehicle_type || !['bike', 'car', 'van'].includes(vehicleDetails.vehicle_type)) {
        return NextResponse.json(
          { error: 'Invalid vehicle type. Only bike, car, and van are permitted.' },
          { status: 400 }
        )
      }
    }

    const adminSupabase = await createAdminSupabaseClient()

    // Validate that operating city is active and not disabled by admin
    if (destinationCity) {
      const { data: destSetting } = await adminSupabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'city_destinations')
        .maybeSingle()

      const allDestinations =
        destSetting?.value && Array.isArray(destSetting.value)
          ? destSetting.value
          : DEFAULT_DESTINATIONS

      const cityMatch = allDestinations.find(
        (d: any) => d.name.toLowerCase() === destinationCity.trim().toLowerCase()
      )

      if (cityMatch && !cityMatch.is_active) {
        return NextResponse.json(
          {
            error: `The city "${destinationCity}" is currently disabled by platform administrator. You can only create listings in active cities.`,
          },
          { status: 400 }
        )
      }
    }

    // Get provider or company profile using admin client to bypass RLS recursion
    let { data: provProfile } = await adminSupabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    const { data: compProfile } = await adminSupabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    // If neither exists, ensure a provider profile is created for this provider user
    if (!provProfile && !compProfile) {
      const { data: userProfile } = await adminSupabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: newProv } = await adminSupabase
        .from('provider_profiles')
        .insert({
          user_id: user.id,
          business_name: userProfile?.full_name || 'Independent Host',
          city: destinationCity || 'Coimbatore',
          verification_status: 'approved',
        })
        .select('id')
        .single()

      provProfile = newProv
    }

    const termsMetadata = JSON.stringify({
      rental_terms: termsAndConditions || 'Rider-hosted hourly tourist service. Local host provides personal ride, fuel, and guidance during booked hours.',
      trip_terms: termsAndConditions || 'Rider-hosted hourly tourist service. Local host provides personal ride, fuel, and guidance during booked hours.',
      active_from: activeFrom || new Date().toISOString(),
      active_until: activeUntil || null,
      is_timed: Boolean(isTimed && activeUntil),
      planned_spots: Array.isArray(plannedSpots) ? plannedSpots : [],
      unseen_spots: Array.isArray(unseenSpots) ? unseenSpots : [],
      hidden_spots: Array.isArray(hiddenSpots) ? hiddenSpots : [],
    })

    // Insert Service Listing via adminSupabase (completely avoids RLS recursion stack depth error)
    const { data: listing, error: insertError } = await adminSupabase
      .from('service_listings')
      .insert({
        provider_id: provProfile?.id || null,
        company_id: compProfile?.id || null,
        title,
        description,
        short_description: shortDescription,
        category,
        destination_city: destinationCity,
        destination_state: destinationState,
        address,
        latitude,
        longitude,
        hourly_rate: Number(hourlyRate),
        min_booking_hours: Number(minBookingHours),
        max_booking_hours: Number(maxBookingHours),
        buffer_time_minutes: Number(bufferTimeMinutes),
        images,
        included_services: includedServices,
        excluded_services: excludedServices,
        terms_and_conditions: termsMetadata,
        cancellation_policy: cancellationPolicy,
        meeting_point: meetingPoint,
        pickup_location: pickupLocation,
        max_participants: maxParticipants ? Number(maxParticipants) : null,
        status: 'active',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Service listing insert error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Insert vehicle details if applicable
    if (vehicleDetails && ['bike', 'car', 'van'].includes(category)) {
      await adminSupabase.from('vehicle_details').insert({
        listing_id: listing.id,
        vehicle_type: vehicleDetails.vehicle_type,
        brand: vehicleDetails.brand,
        model: vehicleDetails.model,
        year: vehicleDetails.year ? Number(vehicleDetails.year) : null,
        passenger_capacity: vehicleDetails.passenger_capacity ? Number(vehicleDetails.passenger_capacity) : null,
        fuel_type: vehicleDetails.fuel_type || null,
        features: vehicleDetails.features || [],
      })
    }

    // Insert guide details if applicable
    if (guideDetails && ['local_guide', 'sightseeing_tour', 'experience'].includes(category)) {
      await adminSupabase.from('guide_details').insert({
        listing_id: listing.id,
        languages: guideDetails.languages || [],
        specializations: guideDetails.specializations || [],
        experience_years: guideDetails.experience_years ? Number(guideDetails.experience_years) : 0,
        max_group_size: guideDetails.max_group_size ? Number(guideDetails.max_group_size) : 10,
      })
    }

    // Insert hourly packages
    if (packages && packages.length > 0) {
      const packageRows = packages.map((pkg: any) => ({
        listing_id: listing.id,
        name: pkg.name,
        duration_hours: Number(pkg.duration_hours),
        price: Number(pkg.price),
        description: pkg.description || null,
      }))
      await adminSupabase.from('hourly_packages').insert(packageRows)
    }

    return NextResponse.json({ success: true, listing })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

