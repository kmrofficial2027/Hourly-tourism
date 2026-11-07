import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import {
  DEFAULT_HOMEPAGE_REVIEWS,
  type HomepageShowcaseReview,
} from '@/lib/homepageReviews'

export const dynamic = 'force-dynamic'

let cachedReviews: HomepageShowcaseReview[] | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 60 * 1000

// GET: Public fetch of homepage showcase reviews
export async function GET() {
  try {
    const now = Date.now()
    if (cachedReviews && now - cacheTimestamp < CACHE_TTL_MS) {
      return NextResponse.json(
        { success: true, reviews: cachedReviews },
        { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
      )
    }

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

    cachedReviews = reviews
    cacheTimestamp = now

    return NextResponse.json(
      { success: true, reviews },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    )
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

    // Invalidate cache
    cachedReviews = null
    cacheTimestamp = 0

    const { data: existing } = await adminSupabase
      .from('platform_settings')
      .select('id')
      .eq('key', 'homepage_reviews')
      .maybeSingle()

    let saveErr = null
    if (existing?.id) {
      const { error } = await adminSupabase
        .from('platform_settings')
        .update({
          value: reviews,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
      saveErr = error
    } else {
      const { error } = await adminSupabase
        .from('platform_settings')
        .insert({
          key: 'homepage_reviews',
          value: reviews,
          category: 'homepage',
          description: 'Homepage Loved by Tourists real-time showcase reviews',
          is_public: true,
        })
      saveErr = error
    }

    if (saveErr) {
      console.error('Error saving homepage reviews settings:', saveErr)
      return NextResponse.json({ error: saveErr.message }, { status: 500 })
    }

    cachedReviews = reviews
    cacheTimestamp = Date.now()

    return NextResponse.json({
      success: true,
      message: 'Showcase reviews updated successfully!',
      reviews,
    })
  } catch (err: any) {
    console.error('Homepage reviews POST error:', err)
    return NextResponse.json({ error: err.message || 'Failed to save settings' }, { status: 500 })
  }
}
