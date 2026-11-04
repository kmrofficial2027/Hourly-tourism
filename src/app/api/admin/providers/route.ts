import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/server'

// GET: Fetch all provider profiles with profiles user info & submitted verification documents
export async function GET() {
  try {
    const adminSupabase = await createAdminSupabaseClient()

    const { data: providers, error } = await adminSupabase
      .from('provider_profiles')
      .select('*, profiles:user_id(id, full_name, email, phone, avatar_url, is_active)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching providers:', error)
      return NextResponse.json({ providers: [] })
    }

    const formatted = (providers || []).map((p: any) => {
      const docs = p.documents || {}
      return {
        id: p.id,
        user_id: p.user_id,
        business_name: p.business_name || p.profiles?.full_name || 'Independent Host',
        owner_name: p.profiles?.full_name || 'Host Partner',
        phone: p.profiles?.phone || '—',
        email: p.profiles?.email || '—',
        avatar_url: p.profiles?.avatar_url || null,
        business_type: p.address ? 'Registered Enterprise' : 'Independent Host',
        vehicle_category: 'Hourly Transport',
        city: p.city || 'Coimbatore, TN',
        license_number: docs.id_number || p.documents?.[0]?.name || '—',
        verification_status: p.verification_status || 'pending',
        status: p.verification_status === 'verified' ? 'approved' : p.verification_status,
        commission_rate: p.commission_rate,
        documents: docs,
        created_at: p.created_at,
        verified_at: p.verified_at,
      }
    })

    return NextResponse.json({ providers: formatted, total: formatted.length })
  } catch (err: any) {
    console.error('Admin providers error:', err)
    return NextResponse.json({ providers: [], total: 0 })
  }
}

// PATCH: Approve or reject provider verification
export async function PATCH(request: Request) {
  try {
    const { providerId, status, rejectionReason } = await request.json()

    if (!providerId || !status) {
      return NextResponse.json({ error: 'Missing providerId or status' }, { status: 400 })
    }

    const adminSupabase = await createAdminSupabaseClient()
    const verificationStatus = status === 'approved' ? 'verified' : 'rejected'

    // Fetch provider to get user_id
    const { data: provider } = await adminSupabase
      .from('provider_profiles')
      .select('*')
      .eq('id', providerId)
      .single()

    const { error: updateErr } = await adminSupabase
      .from('provider_profiles')
      .update({
        verification_status: verificationStatus,
        verified_at: status === 'approved' ? new Date().toISOString() : null,
      })
      .eq('id', providerId)

    if (updateErr) throw updateErr

    // If approved, make sure user profile is active and role is provider
    if (provider?.user_id) {
      if (status === 'approved') {
        await adminSupabase
          .from('profiles')
          .update({ is_active: true, role: 'provider' })
          .eq('id', provider.user_id)

        // Insert notification
        await adminSupabase.from('notifications').insert({
          user_id: provider.user_id,
          title: '🎉 Account Approved!',
          message: 'Congratulations! Your Aadhaar / ID proof and live photo have been approved by Admin. You can now publish hourly listings and receive bookings.',
          type: 'account',
          is_read: false,
        })
      } else {
        // Notification for rejection
        await adminSupabase.from('notifications').insert({
          user_id: provider.user_id,
          title: 'Verification Not Approved',
          message: rejectionReason
            ? `Your verification request was rejected: ${rejectionReason}. Please re-submit clear documents.`
            : 'Your verification request was rejected. Please re-submit clear ID proof and live selfie.',
          type: 'account',
          is_read: false,
        })
      }
    }

    return NextResponse.json({ success: true, providerId, status: verificationStatus })
  } catch (err: any) {
    console.error('Admin provider update error:', err)
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 })
  }
}
