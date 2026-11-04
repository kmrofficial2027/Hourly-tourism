import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const adminSupabase = await createAdminSupabaseClient()

    // Query live counts from PostgreSQL using service role for maximum speed
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
      adminSupabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      adminSupabase.from('provider_profiles').select('*', { count: 'exact', head: true }),
      adminSupabase.from('company_profiles').select('*', { count: 'exact', head: true }),
      adminSupabase.from('service_listings').select('*', { count: 'exact', head: true }),
      adminSupabase.from('bookings').select('*', { count: 'exact', head: true }),
      adminSupabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      adminSupabase.from('bookings').select('*', { count: 'exact', head: true }).like('status', '%cancel%'),
      adminSupabase.from('provider_profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
      adminSupabase.from('bookings').select('total_amount, platform_fee').in('payment_status', ['paid', 'completed']),
    ])

    let grossBookingValue = 0
    let totalPlatformCommission = 0

    if (paidBookings && paidBookings.length > 0) {
      paidBookings.forEach((b: any) => {
        grossBookingValue += Number(b.total_amount || 0)
        totalPlatformCommission += Number(b.platform_fee || 0)
      })
    }

    return NextResponse.json(
      {
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
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30',
        },
      }
    )
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

