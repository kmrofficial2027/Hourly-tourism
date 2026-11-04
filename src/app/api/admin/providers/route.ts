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
    const verificationStatus = status === 'approved' ? 'approved' : 'rejected'

    // Fetch provider to get user_id (check by provider id or auth user_id)
    let provider = null
    const { data: pById } = await adminSupabase
      .from('provider_profiles')
      .select('*')
      .eq('id', providerId)
      .maybeSingle()

    if (pById) {
      provider = pById
    } else {
      const { data: pByUserId } = await adminSupabase
        .from('provider_profiles')
        .select('*')
        .eq('user_id', providerId)
        .maybeSingle()
      provider = pByUserId
    }

    const targetId = provider?.id || providerId

    const { error: updateErr } = await adminSupabase
      .from('provider_profiles')
      .update({
        verification_status: verificationStatus,
        verified_at: status === 'approved' ? new Date().toISOString() : null,
      })
      .eq('id', targetId)

    if (updateErr) {
      console.error('Update provider_profiles error:', updateErr)
      throw new Error(updateErr.message || 'Failed to update provider status')
    }

    // If approved, make sure user profile is active and role is provider
    const targetUserId = provider?.user_id || providerId
    if (targetUserId) {
      if (status === 'approved') {
        await adminSupabase
          .from('profiles')
          .update({ is_active: true, role: 'provider' })
          .eq('id', targetUserId)

        // Sync role into auth.users metadata as well
        try {
          await adminSupabase.auth.admin.updateUserById(targetUserId, {
            user_metadata: { role: 'provider' },
          })
        } catch (authMetaErr) {
          console.warn('Non-fatal user metadata sync note:', authMetaErr)
        }

        // Insert notification with valid enum type 'provider_status'
        try {
          await adminSupabase.from('notifications').insert({
            user_id: targetUserId,
            title: '🎉 Account Approved!',
            message: 'Congratulations! Your Aadhaar / ID proof and live photo have been approved by Admin. You can now publish hourly listings and receive bookings.',
            type: 'provider_status',
            is_read: false,
          })
        } catch (notifErr) {
          console.error('Non-fatal notification error:', notifErr)
        }
      } else {
        // Notification for rejection
        try {
          await adminSupabase.from('notifications').insert({
            user_id: targetUserId,
            title: 'Verification Not Approved',
            message: rejectionReason
              ? `Your verification request was rejected: ${rejectionReason}. Please re-submit clear documents.`
              : 'Your verification request was rejected. Please re-submit clear ID proof and live selfie.',
            type: 'provider_status',
            is_read: false,
          })
        } catch (notifErr) {
          console.error('Non-fatal notification error:', notifErr)
        }
      }
    }

    return NextResponse.json({ success: true, providerId: targetId, status: verificationStatus })
  } catch (err: any) {
    console.error('Admin provider update error:', err)
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 })
  }
}
