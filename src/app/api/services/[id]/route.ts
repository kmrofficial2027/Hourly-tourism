import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const listingId = params.id

    const { data: listing, error } = await supabase
      .from('service_listings')
      .select(
        `*,
        vehicle_details(*),
        guide_details(*),
        packages:hourly_packages(*),
        provider:provider_id(*),
        company:company_id(*),
        reviews(*, customer:customer_id(full_name, avatar_url))`
      )
      .eq('id', listingId)
      .single()

    if (error || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    return NextResponse.json({ listing })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

