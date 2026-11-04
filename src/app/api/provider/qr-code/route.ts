import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'

// GET: Fetch provider QR code and UPI details
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('providerId')

    const adminSupabase = await createAdminSupabaseClient()

    if (providerId) {
      // Fetch for specific provider (used by customer viewing booking)
      const { data: profile } = await adminSupabase
        .from('provider_profiles')
        .select('*')
        .or(`id.eq.${providerId},user_id.eq.${providerId}`)
        .single()

      const bankDetails = profile?.bank_account_details || {}
      return NextResponse.json({
        qrCodeUrl: bankDetails.qr_code_url || null,
        upiId: bankDetails.upi_id || null,
        businessName: profile?.business_name || null,
      })
    }

    // Authenticated provider fetching own QR code
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await adminSupabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const bankDetails = profile?.bank_account_details || {}
    return NextResponse.json({
      qrCodeUrl: bankDetails.qr_code_url || null,
      upiId: bankDetails.upi_id || null,
      businessName: profile?.business_name || null,
      phone: profile?.phone || null,
      city: profile?.city || null,
    })
  } catch (err: any) {
    console.error('QR Code GET error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
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

    const adminSupabase = await createAdminSupabaseClient()

    // Fetch existing provider profile
    const { data: existing } = await adminSupabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

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
        business_name: businessName || 'Hourly Tourism Host',
        city: city || 'Coimbatore',
        verification_status: 'verified',
        bank_account_details: updatedBankDetails,
      })

      if (error) throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Payment QR code & UPI settings saved successfully',
      qrCodeUrl: updatedBankDetails.qr_code_url,
      upiId: updatedBankDetails.upi_id,
    })
  } catch (err: any) {
    console.error('QR Code POST error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

// DELETE: Remove QR code
export async function DELETE(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = await createAdminSupabaseClient()
    const { data: existing } = await adminSupabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      const currentBankDetails = existing.bank_account_details || {}
      delete currentBankDetails.qr_code_url

      await adminSupabase
        .from('provider_profiles')
        .update({
          bank_account_details: currentBankDetails,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
    }

    return NextResponse.json({ success: true, message: 'QR Code removed' })
  } catch (err: any) {
    console.error('QR Code DELETE error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
