import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET: Fetch all vehicles for the logged-in provider
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = await createAdminSupabaseClient()

    // Get provider profile id
    const { data: provProfile } = await adminSupabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    const providerId = provProfile?.id || user.id

    const { data: vehicles, error } = await adminSupabase
      .from('fleet_vehicles')
      .select('*')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching fleet vehicles:', error)
      return NextResponse.json({ vehicles: [] })
    }

    return NextResponse.json({ vehicles: vehicles || [] })
  } catch (err: any) {
    console.error('Fleet GET error:', err)
    return NextResponse.json({ vehicles: [] }, { status: 500 })
  }
}

// POST: Add new vehicle to provider fleet
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
      category,
      make,
      model,
      year,
      registrationNumber,
      color,
      fuelType,
      transmission,
      seatingCapacity,
      luggageCapacity,
      features,
      photos,
      rcNumber,
      insurancePolicyNumber,
      insuranceExpiresAt,
      permitExpiresAt,
      fitnessExpiresAt,
      pollutionExpiresAt,
      maintenanceStatus,
    } = body

    // Validation: Category must strictly be bike, car, or van
    const validCategories = ['bike', 'car', 'van']
    if (!validCategories.includes(category?.toLowerCase())) {
      return NextResponse.json(
        { error: 'Vehicle category must strictly be bike, car, or van' },
        { status: 400 }
      )
    }

    if (!make || !model || !registrationNumber) {
      return NextResponse.json(
        { error: 'Make, model, and registration number are mandatory' },
        { status: 400 }
      )
    }

    const adminSupabase = await createAdminSupabaseClient()

    const { data: provProfile } = await adminSupabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    const providerId = provProfile?.id || user.id

    const { data: newVehicle, error } = await adminSupabase
      .from('fleet_vehicles')
      .insert({
        provider_id: providerId,
        category: category.toLowerCase(),
        make,
        model,
        year: Number(year) || new Date().getFullYear(),
        registration_number: registrationNumber.toUpperCase().trim(),
        color: color || 'Black',
        fuel_type: fuelType || 'petrol',
        transmission: transmission || 'manual',
        seating_capacity: Number(seatingCapacity) || (category === 'bike' ? 2 : 5),
        luggage_capacity: Number(luggageCapacity) || 2,
        features: features || [],
        photos: photos || [],
        rc_number: rcNumber || registrationNumber,
        insurance_policy_number: insurancePolicyNumber || null,
        insurance_expires_at: insuranceExpiresAt || null,
        permit_expires_at: permitExpiresAt || null,
        fitness_expires_at: fitnessExpiresAt || null,
        pollution_expires_at: pollutionExpiresAt || null,
        maintenance_status: maintenanceStatus || 'available',
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error inserting vehicle:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      vehicle: newVehicle,
      message: 'Vehicle added to fleet successfully',
    })
  } catch (err: any) {
    console.error('Fleet POST error:', err)
    return NextResponse.json({ error: 'Failed to add vehicle' }, { status: 500 })
  }
}

// PATCH: Update vehicle maintenance status or details
export async function PATCH(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, maintenanceStatus, photos, features, insuranceExpiresAt } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing vehicle ID' }, { status: 400 })
    }

    const adminSupabase = await createAdminSupabaseClient()

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }
    if (maintenanceStatus) updatePayload.maintenance_status = maintenanceStatus
    if (photos) updatePayload.photos = photos
    if (features) updatePayload.features = features
    if (insuranceExpiresAt) updatePayload.insurance_expires_at = insuranceExpiresAt

    const { data: updatedVehicle, error } = await adminSupabase
      .from('fleet_vehicles')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      vehicle: updatedVehicle,
      message: 'Vehicle updated successfully',
    })
  } catch (err: any) {
    console.error('Fleet PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 })
  }
}

