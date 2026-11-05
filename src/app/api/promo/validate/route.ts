import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface PromoCodeRule {
  code: string
  discountType: 'percentage' | 'flat'
  discountValue: number
  maxDiscount?: number
  minOrderValue?: number
  description: string
  expiresAt?: string
}

const PROMO_CODES: Record<string, PromoCodeRule> = {
  WELCOME10: {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 250,
    minOrderValue: 200,
    description: '10% off your booking up to ₹250',
  },
  HOURLY20: {
    code: 'HOURLY20',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscount: 500,
    minOrderValue: 500,
    description: '20% off hourly trips up to ₹500',
  },
  STARTUP50: {
    code: 'STARTUP50',
    discountType: 'flat',
    discountValue: 50,
    minOrderValue: 150,
    description: '₹50 flat launch discount on any hourly booking',
  },
  COIMBATORE25: {
    code: 'COIMBATORE25',
    discountType: 'percentage',
    discountValue: 25,
    maxDiscount: 350,
    minOrderValue: 400,
    description: 'Coimbatore launch special: 25% off up to ₹350',
  },
  WEEKEND15: {
    code: 'WEEKEND15',
    discountType: 'percentage',
    discountValue: 15,
    maxDiscount: 300,
    minOrderValue: 300,
    description: 'Weekend explorer: 15% off up to ₹300',
  },
}

export async function POST(request: Request) {
  try {
    const { code, orderAmount, category, city } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Please enter a valid coupon code' }, { status: 400 })
    }

    const cleanCode = code.trim().toUpperCase()
    const rule = PROMO_CODES[cleanCode]

    if (!rule) {
      return NextResponse.json(
        { error: `Coupon code "${cleanCode}" is invalid or expired` },
        { status: 404 }
      )
    }

    const baseAmount = Number(orderAmount || 0)

    if (rule.minOrderValue && baseAmount < rule.minOrderValue) {
      return NextResponse.json(
        {
          error: `Minimum booking value of ₹${rule.minOrderValue} required for coupon "${cleanCode}"`,
        },
        { status: 400 }
      )
    }

    let discount = 0
    if (rule.discountType === 'percentage') {
      discount = Math.round((baseAmount * rule.discountValue) / 100)
      if (rule.maxDiscount) {
        discount = Math.min(discount, rule.maxDiscount)
      }
    } else {
      discount = rule.discountValue
    }

    // Discount cannot exceed order value
    discount = Math.min(discount, baseAmount)
    const finalAmount = Math.max(0, baseAmount - discount)

    return NextResponse.json({
      valid: true,
      code: rule.code,
      discount,
      finalAmount,
      description: rule.description,
    })
  } catch (err: any) {
    console.error('Promo validation error:', err)
    return NextResponse.json({ error: 'Failed to validate promo code' }, { status: 500 })
  }
}

