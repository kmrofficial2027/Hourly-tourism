import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch provider bookings
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('provider_id', user.id)

    if (error) {
      console.error('Error fetching provider bookings:', error)
      return NextResponse.json({
        earnings: {
          grossRevenue: 0,
          platformCommission: 0,
          netEarnings: 0,
          pendingPayout: 0,
          completedPayout: 0,
        },
        payouts: [],
      })
    }

    const paidBookings = (bookings || []).filter((b) =>
      ['paid', 'completed'].includes(b.payment_status)
    )

    const grossRevenue = paidBookings.reduce(
      (sum, b) => sum + Number(b.total_amount || 0),
      0
    )
    const platformCommission = Math.round(grossRevenue * 0.1)
    const netEarnings = grossRevenue - platformCommission

    // Pending vs completed
    const pendingPayout = paidBookings
      .filter((b) => b.status !== 'completed')
      .reduce((sum, b) => sum + Math.round(Number(b.total_amount || 0) * 0.9), 0)

    const completedPayout = netEarnings - pendingPayout

    // Fetch provider earnings records if any
    const { data: earningsRecords } = await supabase
      .from('provider_earnings')
      .select('*')
      .eq('provider_id', user.id)
      .order('created_at', { ascending: false })

    const payouts = (earningsRecords || []).map((e: any) => ({
      id: e.id,
      amount: Number(e.provider_earnings || 0),
      status: e.status === 'paid' ? 'completed' : 'pending',
      date: new Date(e.created_at).toLocaleDateString('en-IN'),
      reference: `NEFT-${e.id.slice(0, 8).toUpperCase()}`,
      created_at: e.created_at,
    }))

    return NextResponse.json({
      earnings: {
        grossRevenue,
        platformCommission,
        netEarnings,
        pendingPayout,
        completedPayout: Math.max(0, completedPayout),
      },
      payouts,
    })
  } catch (err: any) {
    console.error('Provider earnings API error:', err)
    return NextResponse.json(
      {
        earnings: {
          grossRevenue: 0,
          platformCommission: 0,
          netEarnings: 0,
          pendingPayout: 0,
          completedPayout: 0,
        },
        payouts: [],
      },
      { status: 500 }
    )
  }
}

