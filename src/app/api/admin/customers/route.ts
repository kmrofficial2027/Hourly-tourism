import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const adminSupabase = await createAdminSupabaseClient()
    
    // Fetch live customers from Supabase profiles
    const { data: liveProfiles, error } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('role', 'customer')

    // Fetch booking aggregates if available
    const { data: bookings } = await adminSupabase
      .from('bookings')
      .select('customer_id, total_amount, status')

    const customerBookingStats: Record<string, { count: number; spend: number }> = {}
    if (bookings) {
      bookings.forEach((b: any) => {
        if (!customerBookingStats[b.customer_id]) {
          customerBookingStats[b.customer_id] = { count: 0, spend: 0 }
        }
        customerBookingStats[b.customer_id].count += 1
        customerBookingStats[b.customer_id].spend += Number(b.total_amount || 0)
      })
    }

    // Merge live Supabase profiles
    const liveCustomers = (liveProfiles || []).map((p: any) => ({
      id: p.id,
      full_name: p.full_name || 'Registered Customer',
      email: p.email,
      phone: p.phone || '+91 98430 00000',
      avatar_url: p.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.full_name || p.email)}`,
      city: 'Coimbatore, TN',
      joined_at: p.created_at,
      status: p.is_active ? 'active' : 'suspended',
      total_bookings: customerBookingStats[p.id]?.count || 0,
      total_spent: customerBookingStats[p.id]?.spend || 0,
      preferred_category: 'Hourly Transport',
      last_circuit: 'Coimbatore Circuit',
      rating: 5.0,
    }))

    return NextResponse.json({
      customers: liveCustomers,
      total: liveCustomers.length,
      metrics: {
        totalCustomers: liveCustomers.length,
        activeCustomers: liveCustomers.filter((c: any) => c.status === 'active').length,
        totalLifetimeSpend: liveCustomers.reduce((acc: number, c: any) => acc + c.total_spent, 0),
        avgSpendPerCustomer: Math.round(
          liveCustomers.reduce((acc: number, c: any) => acc + c.total_spent, 0) / (liveCustomers.length || 1)
        ),
      },
    })
  } catch (err: any) {
    return NextResponse.json({
      customers: [],
      total: 0,
      metrics: {
        totalCustomers: 0,
        activeCustomers: 0,
        totalLifetimeSpend: 0,
        avgSpendPerCustomer: 0,
      },
    })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { customerId, status } = body

    if (!customerId || !status) {
      return NextResponse.json({ error: 'Missing customerId or status' }, { status: 400 })
    }

    const adminSupabase = await createAdminSupabaseClient()
    const isActive = status === 'active'

    // Update in profiles if customer is a live Supabase user
    await adminSupabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', customerId)

    return NextResponse.json({ success: true, customerId, status })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 })
  }
}
