import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

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

    const { data: provProfile } = await adminSupabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    const providerId = provProfile?.id || user.id

    const { data: drivers, error } = await adminSupabase
      .from('fleet_drivers')
      .select('*, vehicle:assigned_vehicle_id(make, model, registration_number, category)')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching drivers:', error)
      return NextResponse.json({ drivers: [] })
    }

    return NextResponse.json({ drivers: drivers || [] })
  } catch (err: any) {
    console.error('Drivers GET error:', err)
    return NextResponse.json({ drivers: [] }, { status: 500 })
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
    const { fullName, phone, licenseNumber, licenseExpiresAt, assignedVehicleId } = body

    if (!fullName || !phone || !licenseNumber) {
      return NextResponse.json(
        { error: 'Driver full name, phone number, and license number are required' },
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

    const { data: newDriver, error } = await adminSupabase
      .from('fleet_drivers')
      .insert({
        provider_id: providerId,
        full_name: fullName,
        phone,
        license_number: licenseNumber.toUpperCase().trim(),
        license_expires_at: licenseExpiresAt || null,
        assigned_vehicle_id: assignedVehicleId || null,
        status: 'active',
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      driver: newDriver,
      message: 'Driver profile registered successfully',
    })
  } catch (err: any) {
    console.error('Drivers POST error:', err)
    return NextResponse.json({ error: 'Failed to add driver' }, { status: 500 })
  }
}

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
    const { id, status, assignedVehicleId } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing driver ID' }, { status: 400 })
    }

    const adminSupabase = await createAdminSupabaseClient()

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }
    if (status) updatePayload.status = status
    if (assignedVehicleId !== undefined) updatePayload.assigned_vehicle_id = assignedVehicleId

    const { data: updatedDriver, error } = await adminSupabase
      .from('fleet_drivers')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      driver: updatedDriver,
      message: 'Driver status updated successfully',
    })
  } catch (err: any) {
    console.error('Drivers PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update driver' }, { status: 500 })
  }
}

