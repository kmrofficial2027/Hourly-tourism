import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import {
  DEFAULT_HOMEPAGE_REVIEWS,
  type HomepageShowcaseReview,
} from '@/lib/homepageReviews'

export const dynamic = 'force-dynamic'

// GET: Public fetch of homepage showcase reviews
export async function GET() {
  try {
    const adminSupabase = await createAdminSupabaseClient()
    const { data: setting } = await adminSupabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'homepage_reviews')
      .maybeSingle()

    let reviews: HomepageShowcaseReview[] = DEFAULT_HOMEPAGE_REVIEWS
    if (setting?.value && Array.isArray(setting.value) && setting.value.length > 0) {
      reviews = setting.value
    }

    return NextResponse.json({ success: true, reviews })
  } catch (err: any) {
    console.error('Homepage reviews GET error:', err)
    return NextResponse.json({ success: true, reviews: DEFAULT_HOMEPAGE_REVIEWS })
  }
}

// POST: Admin updates the homepage showcase reviews
export async function POST(request: Request) {
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
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { reviews } = body

    if (!Array.isArray(reviews)) {
      return NextResponse.json({ error: 'Reviews must be an array' }, { status: 400 })
    }

    await adminSupabase.from('platform_settings').upsert(
      {
        key: 'homepage_reviews',
        value: reviews,
        description: 'Homepage Showcase Reviews (Loved by Tourists Across India)',
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      },
      { onConflict: 'key' }
    )

    return NextResponse.json({
      success: true,
      reviews,
      message: 'Homepage showcase reviews updated successfully!',
    })
  } catch (err: any) {
    console.error('Homepage reviews POST error:', err)
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 })
  }
}

