import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'

// GET: Fetch current provider's verification status & submitted documents
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

    const { data: profile } = await adminSupabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    const { data: compProfile } = await adminSupabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile && !compProfile) {
      return NextResponse.json({
        verification_status: 'unsubmitted',
        documents: null,
      })
    }

    if (compProfile && !profile) {
      return NextResponse.json({
        verification_status: compProfile.verification_status || 'approved',
        verified_at: compProfile.verified_at || new Date().toISOString(),
        documents: compProfile.documents || null,
        business_name: compProfile.company_name,
        city: compProfile.city,
      })
    }

    const currentStatus =
      profile.verification_status === 'approved' || profile.verification_status === 'verified'
        ? 'approved'
        : profile.verification_status || 'unsubmitted'

    return NextResponse.json({
      verification_status: currentStatus,
      verified_at: profile.verified_at,
      documents: profile.documents || null,
      business_name: profile.business_name,
      city: profile.city,
    })
  } catch (err: any) {
    console.error('Provider verification GET error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

// POST: Submit Aadhar / ID proof and Live Photo for admin approval
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
      idType,
      idNumber,
      idCardFront,
      idCardBack,
      livePhoto,
      businessName,
      city,
      phone,

      // Driver Verification Details
      driverName,
      driverPhone,
      dlNumber,
      dlExpiry,
      dlFront,
      dlBack,
      driverExperience,

      // Vehicle Verification Details
      vehicleType,
      vehicleBrand,
      vehicleModel,
      vehicleYear,
      vehicleRegNumber,
      vehicleCapacity,
      fuelType,
      rcDocument,
      insuranceDocument,
      insuranceExpiry,
      fitnessDocument,
      vehiclePhoto,
    } = body

    if (!idType || !idNumber || !idCardFront || !livePhoto) {
      return NextResponse.json(
        { error: 'Please provide ID Type, ID Number, ID Proof document, and a Live Selfie photo.' },
        { status: 400 }
      )
    }

    const adminSupabase = await createAdminSupabaseClient()

    const documentPayload = {
      // 1. Identity & KYC Proof
      id_type: idType,
      id_number: idNumber,
      id_card_front: idCardFront,
      id_card_back: idCardBack || null,
      live_photo: livePhoto,

      // 2. Driver Details & Driving Licence
      driver_name: driverName || null,
      driver_phone: driverPhone || null,
      dl_number: dlNumber || null,
      dl_expiry: dlExpiry || null,
      dl_front: dlFront || null,
      dl_back: dlBack || null,
      driver_experience: driverExperience || null,

      // 3. Vehicle Details & Registration Compliance
      vehicle_type: vehicleType || 'car',
      vehicle_brand: vehicleBrand || null,
      vehicle_model: vehicleModel || null,
      vehicle_year: vehicleYear || null,
      registration_number: vehicleRegNumber || null,
      seating_capacity: vehicleCapacity || null,
      fuel_type: fuelType || null,
      rc_document: rcDocument || null,
      insurance_document: insuranceDocument || null,
      insurance_expiry: insuranceExpiry || null,
      fitness_document: fitnessDocument || null,
      vehicle_photo: vehiclePhoto || null,

      submitted_at: new Date().toISOString(),
    }

    // Check if provider profile exists
    const { data: existing } = await adminSupabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      const { error: updateErr } = await adminSupabase
        .from('provider_profiles')
        .update({
          verification_status: 'pending',
          documents: documentPayload,
          business_name: businessName || existing.business_name,
          city: city || existing.city,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (updateErr) throw updateErr
    } else {
      const { error: insertErr } = await adminSupabase.from('provider_profiles').insert({
        user_id: user.id,
        business_name: businessName || 'Independent Host',
        city: city || 'Coimbatore',
        verification_status: 'pending',
        documents: documentPayload,
      })

      if (insertErr) throw insertErr
    }

    // Create notification for admin
    await adminSupabase.from('notifications').insert({
      user_id: user.id,
      title: 'Verification Submitted',
      message: 'Your Aadhaar / ID proof and live photo have been submitted for admin approval.',
      type: 'account',
      is_read: false,
    })

    return NextResponse.json({
      success: true,
      message: 'Documents and live photo submitted for admin approval',
      verification_status: 'pending',
    })
  } catch (err: any) {
    console.error('Provider verification POST error:', err)
    return NextResponse.json({ error: err.message || 'Submission failed' }, { status: 500 })
  }
}

