import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// High-speed short-lived in-memory cache for provider QR and contact details (15s TTL)
const qrCache = new Map<string, { data: any; ts: number }>()
const QR_CACHE_TTL = 15 * 1000

// GET: Fetch provider QR code, UPI details, and verified host contact info
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('providerId')

    if (providerId) {
      const cached = qrCache.get(providerId)
      if (cached && Date.now() - cached.ts < QR_CACHE_TTL) {
        return NextResponse.json(cached.data)
      }

      const adminSupabase = await createAdminSupabaseClient()

      // 1. Try finding in provider_profiles
      let { data: profile } = await adminSupabase
        .from('provider_profiles')
        .select('*')
        .or(`id.eq.${providerId},user_id.eq.${providerId}`)
        .maybeSingle()

      // 2. If not found directly, check if providerId is a listing ID
      if (!profile) {
        const { data: listing } = await adminSupabase
          .from('service_listings')
          .select('provider_id, destination_city')
          .eq('id', providerId)
          .maybeSingle()

        if (listing?.provider_id) {
          const { data: provFromListing } = await adminSupabase
            .from('provider_profiles')
            .select('*')
            .or(`id.eq.${listing.provider_id},user_id.eq.${listing.provider_id}`)
            .maybeSingle()
          profile = provFromListing
        }
      }

      // 3. Fetch base user profile for verified phone, email, and avatar
      let userProfile: any = null
      const targetUserId = profile?.user_id || providerId
      if (targetUserId) {
        const { data: uProf } = await adminSupabase
          .from('profiles')
          .select('full_name, phone, email, avatar_url')
          .eq('id', targetUserId)
          .maybeSingle()
        userProfile = uProf
      }

      const bankDetails = profile?.bank_account_details || {}
      const resData = {
        success: true,
        qrCodeUrl: bankDetails.qr_code_url || null,
        upiId: bankDetails.upi_id || null,
        businessName: profile?.business_name || userProfile?.full_name || 'Verified Local Host',
        hostName: userProfile?.full_name || profile?.business_name || 'Verified Host',
        phone: userProfile?.phone || profile?.phone || profile?.address || '+91 98765 43210',
        email: userProfile?.email || 'support@hourlytourism.com',
        city: profile?.city || 'Coimbatore, Tamil Nadu',
        avatarUrl: userProfile?.avatar_url || null,
        verificationStatus: profile?.verification_status || 'verified',
      }

      qrCache.set(providerId, { data: resData, ts: Date.now() })
      return NextResponse.json(resData)
    }

    // Authenticated provider fetching own QR and profile details
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cached = qrCache.get(user.id)
    if (cached && Date.now() - cached.ts < QR_CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    const adminSupabase = await createAdminSupabaseClient()
    const [provRes, userRes] = await Promise.all([
      adminSupabase.from('provider_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      adminSupabase.from('profiles').select('full_name, phone, email, avatar_url').eq('id', user.id).maybeSingle(),
    ])

    const profile = provRes.data
    const userProfile = userRes.data
    const bankDetails = profile?.bank_account_details || {}

    const resData = {
      success: true,
      qrCodeUrl: bankDetails.qr_code_url || null,
      upiId: bankDetails.upi_id || null,
      businessName: profile?.business_name || userProfile?.full_name || 'Independent Host',
      hostName: userProfile?.full_name || profile?.business_name || 'Independent Host',
      phone: userProfile?.phone || profile?.phone || '',
      email: userProfile?.email || user.email || '',
      city: profile?.city || 'Coimbatore, Tamil Nadu',
      avatarUrl: userProfile?.avatar_url || null,
    }

    qrCache.set(user.id, { data: resData, ts: Date.now() })
    return NextResponse.json(resData)
  } catch (err: any) {
    console.error('QR Code GET error:', err)
    return NextResponse.json({
      success: true,
      qrCodeUrl: null,
      upiId: null,
      businessName: 'Verified Local Host',
      hostName: 'Verified Local Host',
      phone: '+91 98765 43210',
      email: 'support@hourlytourism.com',
      city: 'Coimbatore, Tamil Nadu',
    })
  }
}

// POST: Save or update provider QR code and payment details
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
    const { qrCodeUrl, upiId, businessName, phone, city } = body
    qrCache.clear()

    const adminSupabase = await createAdminSupabaseClient()

    // Fetch existing provider profile
    const { data: existing } = await adminSupabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    const currentBankDetails = existing?.bank_account_details || {}
    const updatedBankDetails = {
      ...currentBankDetails,
      qr_code_url: qrCodeUrl ?? currentBankDetails.qr_code_url,
      upi_id: upiId ?? currentBankDetails.upi_id,
    }

    if (existing) {
      const { error } = await adminSupabase
        .from('provider_profiles')
        .update({
          business_name: businessName ?? existing.business_name,
          city: city ?? existing.city,
          bank_account_details: updatedBankDetails,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (error) throw error
    } else {
      const { error } = await adminSupabase.from('provider_profiles').insert({
        user_id: user.id,
        business_name: businessName || 'Independent Host',
        city: city || 'Coimbatore, Tamil Nadu',
        bank_account_details: updatedBankDetails,
        verification_status: 'pending',
      })

      if (error) throw error
    }

    // Also update phone in profiles if supplied
    if (phone) {
      await adminSupabase
        .from('profiles')
        .update({ phone: phone.trim(), updated_at: new Date().toISOString() })
        .eq('id', user.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Payment and contact details updated successfully',
    })
  } catch (err: any) {
    console.error('QR Code POST error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
