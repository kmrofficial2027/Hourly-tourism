import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

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

    let query = supabase
      .from('service_listings')
      .select('*, provider:provider_id(business_name), company:company_id(company_name)')
      .eq('status', 'active')

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
      return NextResponse.json({ listings: [] })
    }

    return NextResponse.json({ listings })
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

    // Get provider profile
    const { data: provProfile } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const { data: compProfile } = await supabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!provProfile && !compProfile) {
      return NextResponse.json(
        { error: 'You must have a provider or company profile to create listings.' },
        { status: 403 }
      )
    }

    // Insert Service Listing
    const { data: listing, error: insertError } = await supabase
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
        terms_and_conditions: termsAndConditions,
        cancellation_policy: cancellationPolicy,
        meeting_point: meetingPoint,
        pickup_location: pickupLocation,
        max_participants: maxParticipants ? Number(maxParticipants) : null,
        status: 'active',
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Insert vehicle details if applicable
    if (vehicleDetails && ['bike', 'car', 'van'].includes(category)) {
      await supabase.from('vehicle_details').insert({
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
      await supabase.from('guide_details').insert({
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
      await supabase.from('hourly_packages').insert(packageRows)
    }

    return NextResponse.json({ success: true, listing })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

