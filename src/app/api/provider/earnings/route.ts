import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// High-speed short-lived in-memory cache for provider earnings (8s TTL)
const earningsCache = new Map<string, { data: any; ts: number }>()
const EARNINGS_CACHE_TTL = 8 * 1000

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || 'all'

    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cacheKey = `${user.id}:${range}`
    const cached = earningsCache.get(cacheKey)
    if (cached && Date.now() - cached.ts < EARNINGS_CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    const adminSupabase = await createAdminSupabaseClient()

    // Fetch provider profile ID to ensure robust lookup
    const { data: provProfile } = await adminSupabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    const providerIds = [user.id]
    if (provProfile?.id && provProfile.id !== user.id) {
      providerIds.push(provProfile.id)
    }

    // Fetch provider bookings with listings and customer details
    const { data: rawBookings, error } = await adminSupabase
      .from('bookings')
      .select(`
        *,
        listing:listing_id(title, category, destination_city),
        customer:customer_id(full_name, email)
      `)
      .in('provider_id', providerIds)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching provider bookings:', error)
      return NextResponse.json({
        earnings: {
          grossRevenue: 0,
          platformCommission: 0,
          tdsDeduction: 0,
          netEarnings: 0,
          pendingPayout: 0,
          completedPayout: 0,
          completedTrips: 0,
        },
        ledger: [],
        payouts: [],
      })
    }

    // Filter by date range if applicable
    const now = new Date()
    const filteredBookings = (rawBookings || []).filter((b) => {
      if (range === 'all') return true
      const bDate = new Date(b.created_at || b.booking_date)
      if (range === 'today') {
        return (
          bDate.getDate() === now.getDate() &&
          bDate.getMonth() === now.getMonth() &&
          bDate.getFullYear() === now.getFullYear()
        )
      }
      if (range === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return bDate >= weekAgo
      }
      if (range === 'month') {
        return (
          bDate.getMonth() === now.getMonth() &&
          bDate.getFullYear() === now.getFullYear()
        )
      }
      return true
    })

    const paidBookings = filteredBookings.filter((b) =>
      ['paid', 'completed'].includes(b.payment_status)
    )

    // Compute ledger rows
    const ledger = paidBookings.map((b) => {
      const gross = Number(b.total_amount || 0)
      const commission = Math.round(gross * 0.1) // 10% platform fee
      const tds = Math.round(gross * 0.01) // 1% TDS under Sec 194-O
      const gstOnCommission = Math.round(commission * 0.18) // 18% GST on platform commission
      const net = gross - commission - tds
      const isSettled = b.status === 'completed'

      return {
        id: b.id,
        bookingNumber: b.booking_number || `BK-${b.id.slice(0, 8).toUpperCase()}`,
        serviceTitle: b.listing?.title || 'Hourly Service',
        category: b.listing?.category || 'bike',
        customerName: b.customer?.full_name || 'Verified Tourist',
        bookingDate: b.booking_date,
        durationHours: b.duration_hours || 1,
        grossAmount: gross,
        commissionAmount: commission,
        tdsAmount: tds,
        gstOnCommission,
        netPayable: Math.max(0, net),
        paymentStatus: b.payment_status,
        tripStatus: b.status,
        payoutStatus: isSettled ? 'settled' : 'escrow_held',
        createdAt: b.created_at,
      }
    })

    const grossRevenue = ledger.reduce((sum, item) => sum + item.grossAmount, 0)
    const platformCommission = ledger.reduce((sum, item) => sum + item.commissionAmount, 0)
    const tdsDeduction = ledger.reduce((sum, item) => sum + item.tdsAmount, 0)
    const netEarnings = ledger.reduce((sum, item) => sum + item.netPayable, 0)

    const completedPayout = ledger
      .filter((i) => i.payoutStatus === 'settled')
      .reduce((sum, i) => sum + i.netPayable, 0)

    const pendingPayout = ledger
      .filter((i) => i.payoutStatus === 'escrow_held')
      .reduce((sum, i) => sum + i.netPayable, 0)

    // Payout records
    const { data: earningsRecords } = await adminSupabase
      .from('provider_earnings')
      .select('*')
      .in('provider_id', providerIds)
      .order('created_at', { ascending: false })

    const payouts = (earningsRecords || []).map((e: any) => ({
      id: e.id,
      amount: Number(e.provider_earnings || 0),
      status: e.status === 'paid' ? 'completed' : 'pending',
      date: new Date(e.created_at).toLocaleDateString('en-IN'),
      reference: `NEFT-${e.id.slice(0, 8).toUpperCase()}`,
      created_at: e.created_at,
    }))

    const completedTrips = filteredBookings.filter((b) => b.status === 'completed').length

    const resultData = {
      earnings: {
        grossRevenue,
        platformCommission,
        tdsDeduction,
        netEarnings,
        pendingPayout,
        completedPayout,
        completedTrips,
      },
      ledger,
      payouts,
    }

    earningsCache.set(cacheKey, { data: resultData, ts: Date.now() })
    return NextResponse.json(resultData)
  } catch (err: any) {
    console.error('Provider earnings API error:', err)
    return NextResponse.json(
      {
        earnings: {
          grossRevenue: 0,
          platformCommission: 0,
          tdsDeduction: 0,
          netEarnings: 0,
          pendingPayout: 0,
          completedPayout: 0,
          completedTrips: 0,
        },
        ledger: [],
        payouts: [],
      },
      { status: 500 }
    )
  }
}
