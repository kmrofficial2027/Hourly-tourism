import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
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
      .select('id, full_name, email, role')
      .eq('id', user.id)
      .single()

    // Default credits for demo / active customers
    // In production, wallet balance is tracked per customer
    const walletBalance = 150 // Promotional starter credit
    const referralCredits = 100

    return NextResponse.json({
      balance: walletBalance,
      referralCredits,
      totalCredits: walletBalance + referralCredits,
      currency: 'INR',
      recentTransactions: [
        {
          id: 'TX-WL-01',
          type: 'credit',
          title: 'Welcome Bonus Credit',
          amount: 150,
          date: new Date().toLocaleDateString('en-IN'),
          status: 'available',
        },
        {
          id: 'TX-WL-02',
          type: 'credit',
          title: 'Referral Sign-up Reward',
          amount: 100,
          date: new Date().toLocaleDateString('en-IN'),
          status: 'available',
        },
      ],
    })
  } catch (err: any) {
    console.error('Wallet balance fetch error:', err)
    return NextResponse.json({ balance: 0, referralCredits: 0, totalCredits: 0 })
  }
}

