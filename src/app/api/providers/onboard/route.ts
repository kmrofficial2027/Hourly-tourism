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

    // 1. Update user profile role
    await supabase
      .from('profiles')
      .update({ role: targetRole, phone: phone || null })
      .eq('id', user.id)

    // 2. Insert provider or company record
    if (providerType === 'company') {
      await supabase.from('company_profiles').insert({
        user_id: user.id,
        company_name: businessName,
        city,
        phone,
        description,
        verification_status: 'pending',
      })
    } else {
      await supabase.from('provider_profiles').insert({
        user_id: user.id,
        business_name: businessName,
        city,
        description,
        verification_status: 'pending',
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding application registered successfully.',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

