import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { getActiveDestinations } from '@/lib/destinations'

export const dynamic = 'force-dynamic'

// High-speed short-lived in-memory cache for admin dashboard analytics (15s TTL)
const statsCache = new Map<string, { data: any; ts: number }>()
const STATS_CACHE_TTL = 15 * 1000

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || 'all'

    const cached = statsCache.get(range)
    if (cached && Date.now() - cached.ts < STATS_CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    const adminSupabase = await createAdminSupabaseClient()

    // Compute date cutoff based on range parameter
    let dateCutoff: string | null = null
    const now = new Date()
    if (range === 'today') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      dateCutoff = startOfToday.toISOString()
    } else if (range === '7d') {
      dateCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    } else if (range === '30d') {
      dateCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    } else if (range === '90d') {
      dateCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
    }

    // Query platform entities in parallel
    let bookingsQuery = adminSupabase
      .from('bookings')
      .select('id, booking_number, total_amount, platform_fee, status, payment_status, listing_id, provider_id, customer_id, created_at')
    
    if (dateCutoff) {
      bookingsQuery = bookingsQuery.gte('created_at', dateCutoff)
    }

    const [
      { count: totalCustomers },
      { count: totalProviders },
      { count: totalCompanies },
      { count: totalListings },
      { count: pendingApprovals },
      { data: rawBookings },
      { data: rawListings },
      { data: rawProviderProfiles },
    ] = await Promise.all([
      adminSupabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      adminSupabase.from('provider_profiles').select('*', { count: 'exact', head: true }),
      adminSupabase.from('company_profiles').select('*', { count: 'exact', head: true }),
      adminSupabase.from('service_listings').select('*', { count: 'exact', head: true }),
      adminSupabase.from('provider_profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
      bookingsQuery,
      adminSupabase.from('service_listings').select('id, title, category, city, status, hourly_rate, provider_id'),
      adminSupabase.from('provider_profiles').select('id, city, is_available, verification_status'),
    ])

    const bookings = rawBookings || []
    const listings = rawListings || []
    const providers = rawProviderProfiles || []

    // Build listings lookup map
    const listingMap = new Map<string, any>()
    listings.forEach((l) => listingMap.set(l.id, l))

    // Operational booking metrics
    const totalBookings = bookings.length
    let completedBookings = 0
    let cancelledBookings = 0
    let grossBookingValue = 0
    let totalPlatformCommission = 0

    // Category aggregations (car, bike, van)
    const categoryStats: Record<string, { revenue: number; bookings: number; listings: number }> = {
      car: { revenue: 0, bookings: 0, listings: 0 },
      bike: { revenue: 0, bookings: 0, listings: 0 },
      van: { revenue: 0, bookings: 0, listings: 0 },
    }

    // Tally listings per category
    listings.forEach((l) => {
      const cat = (l.category || 'car').toLowerCase()
      if (categoryStats[cat]) {
        categoryStats[cat].listings++
      } else {
        categoryStats.car.listings++
      }
    })

    // City aggregations
    const cityStats: Record<string, { gmv: number; bookings: number; listings: number; providers: number }> = {}

    // Initialize with active destinations
    const activeDestinations = getActiveDestinations()
    activeDestinations.forEach((d: any) => {
      cityStats[d.name] = { gmv: 0, bookings: 0, listings: 0, providers: 0 }
    })

    // Count providers per city
    providers.forEach((p) => {
      const pCity = p.city || 'Coimbatore'
      const matchedCity = Object.keys(cityStats).find(
        (c) => c.toLowerCase() === pCity.toLowerCase()
      ) || pCity
      if (!cityStats[matchedCity]) {
        cityStats[matchedCity] = { gmv: 0, bookings: 0, listings: 0, providers: 0 }
      }
      cityStats[matchedCity].providers++
    })

    // Count listings per city
    listings.forEach((l) => {
      const lCity = l.city || 'Coimbatore'
      const matchedCity = Object.keys(cityStats).find(
        (c) => c.toLowerCase() === lCity.toLowerCase()
      ) || lCity
      if (!cityStats[matchedCity]) {
        cityStats[matchedCity] = { gmv: 0, bookings: 0, listings: 0, providers: 0 }
      }
      cityStats[matchedCity].listings++
    })

    // Calculate real booking totals and distributions
    bookings.forEach((b: any) => {
      const isCancelled = String(b.status || '').toLowerCase().includes('cancel')
      const isCompleted = String(b.status || '').toLowerCase() === 'completed'
      const amount = Number(b.total_amount || 0)
      const commission = Number(b.platform_fee || amount * 0.10)

      if (isCancelled) {
        cancelledBookings++
      } else {
        grossBookingValue += amount
        totalPlatformCommission += commission
        if (isCompleted) completedBookings++

        // Attribute to category & city
        const listing = listingMap.get(b.listing_id)
        if (listing) {
          const cat = (listing.category || 'car').toLowerCase()
          if (categoryStats[cat]) {
            categoryStats[cat].revenue += amount
            categoryStats[cat].bookings++
          } else {
            categoryStats.car.revenue += amount
            categoryStats.car.bookings++
          }

          const lCity = listing.city || 'Coimbatore'
          const matchedCity = Object.keys(cityStats).find(
            (c) => c.toLowerCase() === lCity.toLowerCase()
          ) || lCity
          if (!cityStats[matchedCity]) {
            cityStats[matchedCity] = { gmv: 0, bookings: 0, listings: 0, providers: 0 }
          }
          cityStats[matchedCity].gmv += amount
          cityStats[matchedCity].bookings++
        }
      }
    })

    // Format category distribution array
    const categoryLabels: Record<string, string> = {
      car: 'Cars & Cabs (4-7 Seater)',
      bike: 'Bikes & Scooters (Two-Wheeler)',
      van: 'Vans & Travellers (Group Tourism)',
    }

    const totalCategoryVolume = Object.values(categoryStats).reduce(
      (acc, c) => acc + (grossBookingValue > 0 ? c.revenue : c.listings),
      0
    )

    const categoriesArray = Object.entries(categoryStats).map(([catKey, data]) => {
      const volume = grossBookingValue > 0 ? data.revenue : data.listings
      const share = totalCategoryVolume > 0 ? Math.round((volume / totalCategoryVolume) * 100) : 0
      return {
        name: categoryLabels[catKey] || catKey,
        key: catKey,
        share,
        revenue: data.revenue,
        bookings: data.bookings,
        listingsCount: data.listings,
      }
    })

    // Format city distribution array
    const citiesArray = Object.entries(cityStats)
      .map(([cityName, data]) => {
        const share =
          grossBookingValue > 0
            ? Math.round((data.gmv / grossBookingValue) * 100)
            : listings.length > 0
            ? Math.round((data.listings / listings.length) * 100)
            : 0
        return {
          city: cityName,
          share,
          gmv: data.gmv,
          bookings: data.bookings,
          listingsCount: data.listings,
          activeProviders: data.providers,
        }
      })
      .sort((a, b) => b.gmv - a.gmv || b.listingsCount - a.listingsCount)

    // Derived Financial Ratios (Honest Live Data)
    const aov = totalBookings > 0 ? Math.round(grossBookingValue / totalBookings) : 0
    const takeRate =
      grossBookingValue > 0
        ? ((totalPlatformCommission / grossBookingValue) * 100).toFixed(1)
        : '10.0'
    const completionRate =
      totalBookings > 0
        ? (((completedBookings) / totalBookings) * 100).toFixed(1)
        : '0.0'
    const cancellationRate =
      totalBookings > 0
        ? (((cancelledBookings) / totalBookings) * 100).toFixed(1)
        : '0.0'

    const responsePayload = {
      stats: {
        totalCustomers: totalCustomers || 0,
        totalProviders: totalProviders || 0,
        totalCompanies: totalCompanies || 0,
        totalListings: totalListings || 0,
        totalBookings,
        completedBookings,
        cancelledBookings,
        pendingApprovals: pendingApprovals || 0,
        grossBookingValue,
        totalPlatformCommission,
        aov,
        takeRate,
        completionRate,
        cancellationRate,
        categories: categoriesArray,
        cities: citiesArray,
      },
    }

    statsCache.set(range, { data: responsePayload, ts: Date.now() })

    return NextResponse.json(responsePayload, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (err: any) {
    console.error('Admin stats route error:', err)
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
        aov: 0,
        takeRate: '10.0',
        completionRate: '0.0',
        cancellationRate: '0.0',
        categories: [],
        cities: [],
      },
    })
  }
}
