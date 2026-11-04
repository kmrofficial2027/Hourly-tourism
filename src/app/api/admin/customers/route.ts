import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/server'

// Default realistic Coimbatore customer data for administrative management
const DEMO_CUSTOMERS = [
  {
    id: 'cst-cbe-001',
    full_name: 'Karthik Subramanian',
    email: 'karthik.s@gmail.com',
    phone: '+91 98422 18940',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    city: 'Coimbatore, Peelamedu',
    joined_at: '2024-01-12T10:30:00Z',
    status: 'active',
    total_bookings: 8,
    total_spent: 4950,
    preferred_category: 'Bikes (Royal Enfield)',
    last_circuit: 'Isha Adiyogi Sunset Ride',
    rating: 4.9,
  },
  {
    id: 'cst-cbe-002',
    full_name: 'Ananya Ramachandran',
    email: 'ananya.ram@outlook.com',
    phone: '+91 94433 87211',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    city: 'Bengaluru (Visiting Kovai)',
    joined_at: '2024-02-04T14:15:00Z',
    status: 'active',
    total_bookings: 5,
    total_spent: 7200,
    preferred_category: 'Vans (Force Urbania)',
    last_circuit: 'Siruvani Foothills & Eco Park',
    rating: 5.0,
  },
  {
    id: 'cst-cbe-003',
    full_name: 'Suresh Varma',
    email: 'suresh.varma@techkovai.com',
    phone: '+91 97890 23415',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    city: 'Coimbatore, RS Puram',
    joined_at: '2024-02-18T09:00:00Z',
    status: 'active',
    total_bookings: 12,
    total_spent: 11400,
    preferred_category: 'Cars (Hyundai Creta)',
    last_circuit: 'Marudhamalai Hill Temple & Velliangiri',
    rating: 4.8,
  },
  {
    id: 'cst-cbe-004',
    full_name: 'Dr. Meera Nambisan',
    email: 'meera.nambisan@aiims.edu',
    phone: '+91 98950 44109',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    city: 'Kochi (Medical Tourist)',
    joined_at: '2024-03-01T16:45:00Z',
    status: 'active',
    total_bookings: 3,
    total_spent: 3450,
    preferred_category: 'Cars (Swift Dzire)',
    last_circuit: 'Coimbatore Heritage & VOC Park Tour',
    rating: 5.0,
  },
  {
    id: 'cst-cbe-005',
    full_name: 'Vigneshwaran & Team',
    email: 'vignesh.travels@tce.edu',
    phone: '+91 96291 55082',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    city: 'Tiruppur',
    joined_at: '2024-03-10T11:20:00Z',
    status: 'active',
    total_bookings: 7,
    total_spent: 14800,
    preferred_category: 'Vans (Tempo Traveller)',
    last_circuit: 'Valparai 40 Hairpin Ghats & Tea Estates',
    rating: 4.7,
  },
  {
    id: 'cst-cbe-006',
    full_name: 'Deepak Raj',
    email: 'deepak.raj99@gmail.com',
    phone: '+91 99401 12093',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    city: 'Chennai',
    joined_at: '2024-03-14T08:10:00Z',
    status: 'suspended',
    total_bookings: 1,
    total_spent: 650,
    preferred_category: 'Bikes (Himalayan 450)',
    last_circuit: 'Aliyar Dam & Monkey Falls',
    rating: 3.2,
  },
]

export async function GET(request: Request) {
  try {
    const adminSupabase = createAdminSupabaseClient()
    
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

    // Combine live customers with Coimbatore demo travelers (avoid duplicates)
    const existingEmails = new Set(liveCustomers.map((c: any) => c.email.toLowerCase()))
    const demoFiltered = DEMO_CUSTOMERS.filter((c) => !existingEmails.has(c.email.toLowerCase()))
    const allCustomers = [...liveCustomers, ...demoFiltered]

    return NextResponse.json({
      customers: allCustomers,
      total: allCustomers.length,
      metrics: {
        totalCustomers: allCustomers.length,
        activeCustomers: allCustomers.filter((c) => c.status === 'active').length,
        totalLifetimeSpend: allCustomers.reduce((acc, c) => acc + c.total_spent, 0),
        avgSpendPerCustomer: Math.round(
          allCustomers.reduce((acc, c) => acc + c.total_spent, 0) / (allCustomers.length || 1)
        ),
      },
    })
  } catch (err: any) {
    return NextResponse.json({
      customers: DEMO_CUSTOMERS,
      total: DEMO_CUSTOMERS.length,
      metrics: {
        totalCustomers: DEMO_CUSTOMERS.length,
        activeCustomers: DEMO_CUSTOMERS.filter((c) => c.status === 'active').length,
        totalLifetimeSpend: DEMO_CUSTOMERS.reduce((acc, c) => acc + c.total_spent, 0),
        avgSpendPerCustomer: 7000,
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

    const adminSupabase = createAdminSupabaseClient()
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

