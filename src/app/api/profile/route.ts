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
    const { data: profile, error } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile, user })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
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
    const { full_name, phone, avatar_url, preferences } = body

    const adminSupabase = await createAdminSupabaseClient()

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }
    if (full_name !== undefined) updateData.full_name = full_name.trim()
    if (phone !== undefined) updateData.phone = phone.trim()
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url

    const { data: updatedProfile, error: updateErr } = await adminSupabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select('*')
      .single()

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    // If user has a provider_profile, keep business_name / details in sync
    try {
      const { data: provRec } = await adminSupabase
        .from('provider_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (provRec) {
        const provUpdates: any = { updated_at: new Date().toISOString() }
        if (full_name) provUpdates.business_name = full_name.trim()
        await adminSupabase
          .from('provider_profiles')
          .update(provUpdates)
          .eq('user_id', user.id)
      }
    } catch {
      // Non-fatal
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

