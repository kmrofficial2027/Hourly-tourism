export interface RiderLevelTier {
  id: 'bronze' | 'silver' | 'gold' | 'platinum'
  name: string
  title: string
  minTrips: number
  maxTrips: number | null
  commissionRate: number // Percentage platform fee, e.g. 15 = 15%
  hostShareRate: number // Percentage host retains, e.g. 85 = 85%
  earningsBoostPercent: number // Extra % earnings compared to bronze base, e.g. 0, 3, 5, 7.5
  badgeIcon: string
  badgeColor: {
    bg: string
    text: string
    border: string
    gradient: string
  }
  perks: string[]
  description: string
}

export const RIDER_LEVELS: RiderLevelTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    title: 'Bronze Host',
    minTrips: 0,
    maxTrips: 4,
    commissionRate: 15,
    hostShareRate: 85,
    earningsBoostPercent: 0,
    badgeIcon: '🥉',
    badgeColor: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      gradient: 'from-amber-600 to-amber-800',
    },
    perks: [
      'Standard marketplace listing (Bikes, Cars, Vans)',
      'Direct UPI / QR code customer payments',
      'Standard 15% platform commission (You keep 85%)',
      'Customer chat & trip route navigation',
    ],
    description: 'Starting tier for new verified vehicle hosts.',
  },
  {
    id: 'silver',
    name: 'Silver Pro',
    title: 'Silver Pro Host',
    minTrips: 5,
    maxTrips: 19,
    commissionRate: 12,
    hostShareRate: 88,
    earningsBoostPercent: 3,
    badgeIcon: '🥈',
    badgeColor: {
      bg: 'bg-slate-100',
      text: 'text-slate-800',
      border: 'border-slate-300',
      gradient: 'from-slate-500 to-slate-700',
    },
    perks: [
      'Commission reduced to 12% (Earn +3% more on every trip)',
      'Verified "Silver Pro" badge on your public listings',
      '1.25x Priority boost in marketplace search results',
      'Fast-track 24-hour payout settlements',
      'Ability to set customized hourly package minimums',
    ],
    description: 'Unlocked at 5 completed trips with higher profit margins.',
  },
  {
    id: 'gold',
    name: 'Gold Super Host',
    title: 'Gold Super Host',
    minTrips: 20,
    maxTrips: 49,
    commissionRate: 10,
    hostShareRate: 90,
    earningsBoostPercent: 5,
    badgeIcon: '🥇',
    badgeColor: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      gradient: 'from-yellow-500 to-amber-600',
    },
    perks: [
      'Commission reduced to 10% (Earn +5% more on every trip)',
      'Prestigious "Gold Super Host" trophy badge on listings',
      'Homepage spotlight & top recommendations',
      'Custom weekend & holiday surge pricing enabled',
      'Same-day instant payout clearance to bank account',
    ],
    description: 'Unlocked at 20 completed trips for top-rated community leaders.',
  },
  {
    id: 'platinum',
    name: 'Platinum Elite',
    title: 'Platinum Elite Host',
    minTrips: 50,
    maxTrips: null,
    commissionRate: 7.5,
    hostShareRate: 92.5,
    earningsBoostPercent: 7.5,
    badgeIcon: '👑',
    badgeColor: {
      bg: 'bg-purple-50',
      text: 'text-purple-900',
      border: 'border-purple-300',
      gradient: 'from-purple-600 via-indigo-600 to-emerald-600',
    },
    perks: [
      'Lowest 7.5% platform commission (Earn +7.5% maximum profit)',
      'Platinum Crown badge next to your name and listings',
      '0% commission deduction on all 5-star reviewed trips',
      'VIP exclusive multi-day circuit package creation',
      'Dedicated concierge host success manager',
    ],
    description: 'The pinnacle tier for high-volume, highly reliable hosts.',
  },
]

export interface CalculatedRiderLevel {
  currentTier: RiderLevelTier
  nextTier: RiderLevelTier | null
  completedTrips: number
  tripsToNextTier: number
  progressPercent: number
  extraEarningsEarned: number // approximate extra INR earned from commission discount
}

/**
 * Calculates host level, next milestone, and progress percentage.
 */
export function calculateRiderLevel(completedTrips: number, grossRevenue: number = 0): CalculatedRiderLevel {
  const safeTrips = Math.max(0, completedTrips || 0)

  let currentTierIndex = 0
  for (let i = 0; i < RIDER_LEVELS.length; i++) {
    const tier = RIDER_LEVELS[i]
    if (safeTrips >= tier.minTrips) {
      if (tier.maxTrips === null || safeTrips <= tier.maxTrips) {
        currentTierIndex = i
        break
      }
    }
  }

  // If over 50, ensure platinum
  if (safeTrips >= 50) {
    currentTierIndex = 3
  }

  const currentTier = RIDER_LEVELS[currentTierIndex]
  const nextTier = currentTierIndex < RIDER_LEVELS.length - 1 ? RIDER_LEVELS[currentTierIndex + 1] : null

  let tripsToNextTier = 0
  let progressPercent = 100

  if (nextTier) {
    tripsToNextTier = Math.max(0, nextTier.minTrips - safeTrips)
    const range = nextTier.minTrips - currentTier.minTrips
    const achieved = safeTrips - currentTier.minTrips
    progressPercent = Math.min(100, Math.max(0, Math.round((achieved / range) * 100)))
  }

  // Extra earnings earned = grossRevenue * (earningsBoostPercent / 100)
  const extraEarningsEarned = Math.round((grossRevenue * currentTier.earningsBoostPercent) / 100)

  return {
    currentTier,
    nextTier,
    completedTrips: safeTrips,
    tripsToNextTier,
    progressPercent,
    extraEarningsEarned,
  }
}

