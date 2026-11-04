import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      providerType,
      businessName,
      serviceCategory,
      city,
      phone,
      hourlyRate,
      description,
    } = await request.json()

    // Validate transport category
    const validCategories = ['bike', 'car', 'van', 'local_guide', 'sightseeing_tour', 'experience']
    if (!validCategories.includes(serviceCategory)) {
      return NextResponse.json(
        { error: 'Invalid category. Only Bikes, Cars, Vans, and Local Guides/Experiences are supported.' },
        { status: 400 }
      )
    }

    const targetRole = providerType === 'company' ? 'company' : 'provider'
    const adminSupabase = await createAdminSupabaseClient()

    // 1. Update user profile role using adminSupabase (bypassing client RLS recursion)
    await adminSupabase
      .from('profiles')
      .update({ role: targetRole, phone: phone || null })
      .eq('id', user.id)

    // 2. Also update auth.users metadata so JWT has the role synchronously
    await adminSupabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        role: targetRole,
      },
    })

    // 3. Upsert provider or company record using adminSupabase
    if (providerType === 'company') {
      await adminSupabase.from('company_profiles').upsert(
        {
          user_id: user.id,
          company_name: businessName || 'Company Fleet',
          city,
          phone,
          description,
          verification_status: 'approved',
        },
        { onConflict: 'user_id' }
      )
    } else {
      await adminSupabase.from('provider_profiles').upsert(
        {
          user_id: user.id,
          business_name: businessName || 'Independent Host',
          city,
          description,
          verification_status: 'pending',
        },
        { onConflict: 'user_id' }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding application registered successfully.',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

