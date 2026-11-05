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
    const { data: profile } = await adminSupabase
      .from('provider_profiles')
      .select('id, bank_account_details, business_name')
      .eq('user_id', user.id)
      .maybeSingle()

    const details = profile?.bank_account_details || {}

    return NextResponse.json({
      success: true,
      payoutMethods: {
        bankName: details.bank_name || '',
        accountHolderName: details.account_holder_name || profile?.business_name || '',
        accountNumber: details.account_number || '',
        ifscCode: details.ifsc_code || '',
        accountType: details.account_type || 'Savings',
        upiId: details.upi_id || '',
        qrCodeUrl: details.qr_code_url || '',
        primaryMethod: details.primary_payout_method || 'bank_transfer',
        isVerified: details.is_verified || false,
      },
    })
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
      bankName,
      accountHolderName,
      accountNumber,
      ifscCode,
      accountType,
      upiId,
      qrCodeUrl,
      primaryMethod,
    } = body

    const adminSupabase = await createAdminSupabaseClient()

    // Find or create provider profile
    let { data: profile } = await adminSupabase
      .from('provider_profiles')
      .select('id, bank_account_details')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile) {
      const { data: newProfile } = await adminSupabase
        .from('provider_profiles')
        .insert({
          user_id: user.id,
          business_name: accountHolderName || 'Independent Host',
          verification_status: 'pending',
        })
        .select('id, bank_account_details')
        .single()
      profile = newProfile
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Unable to locate or initialize provider profile for payouts.' },
        { status: 400 }
      )
    }

    const updatedDetails = {
      ...(profile.bank_account_details || {}),
      bank_name: bankName?.trim(),
      account_holder_name: accountHolderName?.trim(),
      account_number: accountNumber?.trim(),
      ifsc_code: ifscCode?.trim()?.toUpperCase(),
      accountType: accountType || 'Savings',
      upi_id: upiId?.trim(),
      qr_code_url: qrCodeUrl || '',
      primary_payout_method: primaryMethod || 'bank_transfer',
      updated_at: new Date().toISOString(),
    }

    const { error: updateError } = await adminSupabase
      .from('provider_profiles')
      .update({
        bank_account_details: updatedDetails,
      })
      .eq('id', profile.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: 'Payout methods and QR code updated successfully.',
      payoutMethods: updatedDetails,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
