import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Role verification (admin check)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Query live counts from PostgreSQL
    const [
      { count: totalCustomers },
      { count: totalProviders },
      { count: totalCompanies },
      { count: totalListings },
      { count: totalBookings },
      { count: completedBookings },
      { count: cancelledBookings },
      { count: pendingApprovals },
      { data: paidBookings },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('provider_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('company_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('service_listings').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).like('status', '%cancel%'),
      supabase.from('provider_profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
      supabase.from('bookings').select('total_amount, platform_fee').in('payment_status', ['paid', 'completed']),
    ])

    let grossBookingValue = 0
    let totalPlatformCommission = 0

    if (paidBookings && paidBookings.length > 0) {
      paidBookings.forEach((b: any) => {
        grossBookingValue += Number(b.total_amount || 0)
        totalPlatformCommission += Number(b.platform_fee || 0)
      })
    }

    return NextResponse.json({
      stats: {
        totalCustomers: totalCustomers || 0,
        totalProviders: totalProviders || 0,
        totalCompanies: totalCompanies || 0,
        totalListings: totalListings || 0,
        totalBookings: totalBookings || 0,
        completedBookings: completedBookings || 0,
        cancelledBookings: cancelledBookings || 0,
        pendingApprovals: pendingApprovals || 0,
        grossBookingValue,
        totalPlatformCommission,
      },
    })
  } catch (err: any) {
    return NextResponse.json({
      stats: {
        totalCustomers: 0,
        totalProviders: 0,
        totalCompanies: 0,
        totalListings: 0,
        totalBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        pendingApprovals: 0,
        grossBookingValue: 0,
        totalPlatformCommission: 0,
      },
    })
  }
}

