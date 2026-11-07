import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET: Fetch listing details by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const listingId = params.id

    const { data: listing, error } = await supabase
      .from('service_listings')
      .select(
        `*,
        vehicle_details(*),
        guide_details(*),
        packages:hourly_packages(*),
        provider:provider_id(*),
        company:company_id(*),
        reviews(*, customer:customer_id(full_name, avatar_url))`
      )
      .eq('id', listingId)
      .single()

    if (error || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    let metadata: any = {}
    try {
      if (listing.terms_and_conditions && listing.terms_and_conditions.startsWith('{')) {
        metadata = JSON.parse(listing.terms_and_conditions)
      }
    } catch (e) {}

    const now = new Date()
    const activeUntil = metadata.active_until || null
    const isExpired = activeUntil ? new Date(activeUntil) < now : false

    const normalizedListing = {
      ...listing,
      planned_spots: metadata.planned_spots || [],
      unseen_spots: metadata.unseen_spots || [],
      hidden_spots: metadata.hidden_spots || [],
      active_from: metadata.active_from || listing.created_at,
      active_until: activeUntil,
      is_timed: Boolean(metadata.is_timed && activeUntil),
      is_expired: isExpired,
    }

    return NextResponse.json({ listing: normalizedListing })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH: Update listing by ID (Provider owner or Platform Admin)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const listingId = params.id
    const adminSupabase = await createAdminSupabaseClient()

    // 1. Fetch user profile to verify role
    const { data: userProfile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const isAdmin = userProfile?.role === 'admin'

    // 2. Fetch existing listing to verify ownership
    const { data: existingListing, error: fetchErr } = await adminSupabase
      .from('service_listings')
      .select('id, provider_id, company_id, category, terms_and_conditions')
      .eq('id', listingId)
      .maybeSingle()

    if (fetchErr || !existingListing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (!isAdmin) {
      // Check if user is the provider owner
      const { data: prov } = await adminSupabase
        .from('provider_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      const { data: comp } = await adminSupabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      const isOwner =
        (prov && prov.id === existingListing.provider_id) ||
        (comp && comp.id === existingListing.company_id)

      if (!isOwner) {
        return NextResponse.json(
          { error: 'You do not have permission to edit this listing.' },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const {
      title,
      shortDescription,
      description,
      category,
      destinationCity,
      destinationState,
      address,
      latitude,
      longitude,
      hourlyRate,
      minBookingHours,
      maxBookingHours,
      bufferTimeMinutes,
      images,
      includedServices,
      excludedServices,
      status,
      rejectionReason,
      vehicleDetails,
      guideDetails,
      packages,
      plannedSpots,
      unseenSpots,
      hiddenSpots,
      activeFrom,
      activeUntil,
      isTimed,
      termsAndConditions,
    } = body

    // 3. Update core listing fields
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    }

    let existingMeta: any = {}
    try {
      if (existingListing.terms_and_conditions && existingListing.terms_and_conditions.startsWith('{')) {
        existingMeta = JSON.parse(existingListing.terms_and_conditions)
      }
    } catch (e) {}

    if (
      plannedSpots !== undefined ||
      unseenSpots !== undefined ||
      hiddenSpots !== undefined ||
      activeUntil !== undefined ||
      isTimed !== undefined ||
      status === 'rejected' ||
      status === 'active' ||
      rejectionReason !== undefined
    ) {
      updatePayload.terms_and_conditions = JSON.stringify({
        ...existingMeta,
        rental_terms: termsAndConditions !== undefined ? termsAndConditions : (existingMeta.rental_terms || 'Rider-hosted hourly tourist service. Local host provides personal ride, fuel, and guidance.'),
        trip_terms: termsAndConditions !== undefined ? termsAndConditions : (existingMeta.trip_terms || existingMeta.rental_terms || 'Rider-hosted hourly tourist service. Local host provides personal ride, fuel, and guidance.'),
        active_from: activeFrom !== undefined ? activeFrom : (existingMeta.active_from || new Date().toISOString()),
        active_until: activeUntil !== undefined ? activeUntil : (existingMeta.active_until || null),
        is_timed: isTimed !== undefined ? Boolean(isTimed && (activeUntil || existingMeta.active_until)) : (existingMeta.is_timed || false),
        planned_spots: plannedSpots !== undefined ? plannedSpots : (existingMeta.planned_spots || []),
        unseen_spots: unseenSpots !== undefined ? unseenSpots : (existingMeta.unseen_spots || []),
        hidden_spots: hiddenSpots !== undefined ? hiddenSpots : (existingMeta.hidden_spots || []),
        rejection_reason: status === 'rejected' ? (rejectionReason || existingMeta.rejection_reason || 'Listing rejected during moderation') : (status === 'active' ? null : existingMeta.rejection_reason),
        rejected_at: status === 'rejected' ? new Date().toISOString() : (status === 'active' ? null : existingMeta.rejected_at),
      })
    } else if (termsAndConditions !== undefined) {
      updatePayload.terms_and_conditions = termsAndConditions
    }

    if (title !== undefined) updatePayload.title = title
    if (shortDescription !== undefined) updatePayload.short_description = shortDescription
    if (description !== undefined) updatePayload.description = description
    if (category !== undefined) updatePayload.category = category
    if (destinationCity !== undefined) updatePayload.destination_city = destinationCity
    if (destinationState !== undefined) updatePayload.destination_state = destinationState
    if (address !== undefined) updatePayload.address = address
    if (latitude !== undefined) updatePayload.latitude = latitude
    if (longitude !== undefined) updatePayload.longitude = longitude
    if (hourlyRate !== undefined) updatePayload.hourly_rate = Number(hourlyRate)
    if (minBookingHours !== undefined) updatePayload.min_booking_hours = Number(minBookingHours)
    if (maxBookingHours !== undefined) updatePayload.max_booking_hours = Number(maxBookingHours)
    if (bufferTimeMinutes !== undefined) updatePayload.buffer_time_minutes = Number(bufferTimeMinutes)
    if (images !== undefined) updatePayload.images = images
    if (includedServices !== undefined) updatePayload.included_services = includedServices
    if (excludedServices !== undefined) updatePayload.excluded_services = excludedServices
    if (status !== undefined) {
      updatePayload.status = status
    }

    const { data: updatedListing, error: updateError } = await adminSupabase
      .from('service_listings')
      .update(updatePayload)
      .eq('id', listingId)
      .select()
      .single()

    if (updateError) {
      console.error('Update listing error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // 4. Update vehicle details if applicable
    const activeCategory = category || existingListing.category
    if (['bike', 'car', 'van'].includes(activeCategory) && vehicleDetails) {
      const { data: existingVeh } = await adminSupabase
        .from('vehicle_details')
        .select('id')
        .eq('listing_id', listingId)
        .maybeSingle()

      const vehPayload = {
        listing_id: listingId,
        vehicle_type: vehicleDetails.vehicle_type || activeCategory,
        brand: vehicleDetails.brand || 'Standard',
        model: vehicleDetails.model || 'Standard',
        year: vehicleDetails.year ? Number(vehicleDetails.year) : null,
        passenger_capacity: vehicleDetails.passenger_capacity ? Number(vehicleDetails.passenger_capacity) : null,
        fuel_type: vehicleDetails.fuel_type || null,
        features: vehicleDetails.features || [],
      }

      if (existingVeh) {
        await adminSupabase.from('vehicle_details').update(vehPayload).eq('id', existingVeh.id)
      } else {
        await adminSupabase.from('vehicle_details').insert(vehPayload)
      }
    }

    // 5. Update guide details if applicable
    if (['local_guide', 'sightseeing_tour', 'experience'].includes(activeCategory) && guideDetails) {
      const { data: existingG } = await adminSupabase
        .from('guide_details')
        .select('id')
        .eq('listing_id', listingId)
        .maybeSingle()

      const guidePayload = {
        listing_id: listingId,
        languages: guideDetails.languages || [],
        specializations: guideDetails.specializations || [],
        experience_years: guideDetails.experience_years ? Number(guideDetails.experience_years) : 0,
        max_group_size: guideDetails.max_group_size ? Number(guideDetails.max_group_size) : 10,
      }

      if (existingG) {
        await adminSupabase.from('guide_details').update(guidePayload).eq('id', existingG.id)
      } else {
        await adminSupabase.from('guide_details').insert(guidePayload)
      }
    }

    // 6. Update packages if provided
    if (Array.isArray(packages)) {
      await adminSupabase.from('hourly_packages').delete().eq('listing_id', listingId)
      if (packages.length > 0) {
        const pkgInserts = packages.map((p: any) => ({
          listing_id: listingId,
          name: p.name,
          duration_hours: Number(p.duration_hours),
          price: Number(p.price),
          description: p.description || null,
        }))
        await adminSupabase.from('hourly_packages').insert(pkgInserts)
      }
    }

    return NextResponse.json({
      success: true,
      listing: updatedListing,
      message: 'Listing updated successfully',
    })
  } catch (err: any) {
    console.error('PATCH listing error:', err)
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 })
  }
}

// DELETE: Permanently delete listing (Provider owner or Platform Admin)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const listingId = params.id
    const adminSupabase = await createAdminSupabaseClient()

    // 1. Fetch user profile
    const { data: userProfile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const isAdmin = userProfile?.role === 'admin'

    // 2. Fetch listing to verify ownership
    const { data: existingListing } = await adminSupabase
      .from('service_listings')
      .select('id, provider_id, company_id')
      .eq('id', listingId)
      .maybeSingle()

    if (!existingListing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (!isAdmin) {
      const { data: prov } = await adminSupabase
        .from('provider_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      const { data: comp } = await adminSupabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      const isOwner =
        (prov && prov.id === existingListing.provider_id) ||
        (comp && comp.id === existingListing.company_id)

      if (!isOwner) {
        return NextResponse.json(
          { error: 'You do not have permission to delete this listing.' },
          { status: 403 }
        )
      }
    }

    // 3. Preserve booking transactions and ride details in provider history while detaching from deleted listing
    const { data: bookings } = await adminSupabase
      .from('bookings')
      .select('id')
      .eq('listing_id', listingId)

    const bookingIds = (bookings || []).map((b: any) => b.id)

    if (bookingIds.length > 0) {
      // Unlink listing_id so bookings, ride details, and financial earnings records are permanently preserved
      await adminSupabase.from('bookings').update({ listing_id: null }).in('id', bookingIds)
    }

    // 4. Delete child listing tables
    await adminSupabase.from('vehicle_details').delete().eq('listing_id', listingId)
    await adminSupabase.from('guide_details').delete().eq('listing_id', listingId)
    await adminSupabase.from('hourly_packages').delete().eq('listing_id', listingId)
    await adminSupabase.from('provider_availability').delete().eq('listing_id', listingId)
    await adminSupabase.from('availability_exceptions').delete().eq('listing_id', listingId)
    await adminSupabase.from('reviews').delete().eq('listing_id', listingId)

    // 5. Delete service listing itself
    const { error: delErr } = await adminSupabase
      .from('service_listings')
      .delete()
      .eq('id', listingId)

    if (delErr) {
      console.error('Delete service listing error:', delErr)
      return NextResponse.json({ error: delErr.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Listing and all related specifications deleted successfully.',
    })
  } catch (err: any) {
    console.error('DELETE listing error:', err)
    return NextResponse.json({ error: err.message || 'Delete failed' }, { status: 500 })
  }
}
