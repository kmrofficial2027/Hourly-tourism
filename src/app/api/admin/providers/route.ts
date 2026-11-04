import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/server'

// GET: Fetch all provider profiles with profiles user info
export async function GET() {
  try {
    const adminSupabase = await createAdminSupabaseClient()

    const { data: providers, error } = await adminSupabase
      .from('provider_profiles')
      .select('*, profiles:user_id(full_name, email, phone, avatar_url)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching providers:', error)
      return NextResponse.json({ providers: [] })
    }

    const formatted = (providers || []).map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      business_name: p.business_name || p.profiles?.full_name || 'Independent Host',
      owner_name: p.profiles?.full_name || 'Host Partner',
      phone: p.profiles?.phone || '—',
      email: p.profiles?.email || '—',
      business_type: p.address ? 'Registered Enterprise' : 'Independent Host',
      vehicle_category: 'Hourly Transport',
      city: p.city || 'Coimbatore, TN',
      license_number: p.documents?.[0]?.name || 'TN-VERIFIED',
      verification_status: p.verification_status,
      status: p.verification_status === 'verified' ? 'approved' : p.verification_status,
      commission_rate: p.commission_rate,
      created_at: p.created_at,
    }))

    return NextResponse.json({ providers: formatted, total: formatted.length })
  } catch (err: any) {
    console.error('Admin providers error:', err)
    return NextResponse.json({ providers: [], total: 0 })
  }
}

// PATCH: Approve or reject provider verification
export async function PATCH(request: Request) {
  try {
    const { providerId, status } = await request.json()

    if (!providerId || !status) {
      return NextResponse.json({ error: 'Missing providerId or status' }, { status: 400 })
    }

    const adminSupabase = await createAdminSupabaseClient()
    const verificationStatus = status === 'approved' ? 'verified' : 'rejected'

    const { error } = await adminSupabase
      .from('provider_profiles')
      .update({
        verification_status: verificationStatus,
        verified_at: status === 'approved' ? new Date().toISOString() : null,
      })
      .eq('id', providerId)

    if (error) throw error

    return NextResponse.json({ success: true, providerId, status: verificationStatus })
  } catch (err: any) {
    console.error('Admin provider update error:', err)
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 })
  }
}
