'use client'

import React, { useState } from 'react'
import {
  Award,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowUpRight,
} from 'lucide-react'
import {
  RIDER_LEVELS,
  calculateRiderLevel,
  RiderLevelTier,
  CalculatedRiderLevel,
} from '@/lib/riderLevels'
import { formatCurrency } from '@/lib/utils'

interface RiderLevelCardProps {
  completedTrips: number
  grossRevenue?: number
}

export function RiderLevelCard({ completedTrips, grossRevenue = 0 }: RiderLevelCardProps) {
  const [showAllTiers, setShowAllTiers] = useState(false)
  const levelInfo = calculateRiderLevel(completedTrips, grossRevenue)
  const { currentTier, nextTier, tripsToNextTier, progressPercent, extraEarningsEarned } = levelInfo

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Top Banner with Gradient */}
      <div className={`p-6 sm:p-8 bg-gradient-to-r ${currentTier.badgeColor.gradient} text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/30 flex-shrink-0">
              {currentTier.badgeIcon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/25 text-white backdrop-blur-sm">
                  Active Tier
                </span>
                <span className="text-xs text-white/80">
                  {completedTrips} {completedTrips === 1 ? 'trip completed' : 'trips completed'}
                </span>
              </div>
              <h2 className="text-2xl font-black font-display text-white mt-0.5">
                {currentTier.title}
              </h2>
              <p className="text-xs text-white/90">
                You retain <strong className="underline decoration-white/40">{currentTier.hostShareRate}%</strong> of every booking fare (Platform fee: {currentTier.commissionRate}%).
              </p>
            </div>
          </div>

          {/* Extra Profit Highlight */}
          <div className="px-4 py-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-right sm:text-right">
            <span className="text-[10px] uppercase font-bold text-white/80 block">
              Earnings Accelerator
            </span>
            <span className="text-xl font-black text-white flex items-center justify-end gap-1">
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
              +{currentTier.earningsBoostPercent}% Profit
            </span>
            {extraEarningsEarned > 0 && (
              <span className="text-[10px] text-white/90 block">
                +{formatCurrency(extraEarningsEarned)} extra bonus earned
              </span>
            )}
          </div>
        </div>

        {/* Next Tier Progress Bar */}
        {nextTier ? (
          <div className="mt-6 pt-5 border-t border-white/20 space-y-2">
            <div className="flex items-center justify-between text-xs text-white">
              <span className="font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Next Level: <strong>{nextTier.title}</strong> ({nextTier.minTrips} trips)
              </span>
              <span className="font-bold">
                {tripsToNextTier} more {tripsToNextTier === 1 ? 'trip' : 'trips'} to unlock {nextTier.hostShareRate}% share!
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-black/20 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-white transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-white/80">
              <span>{currentTier.minTrips} trips</span>
              <span className="font-bold">{progressPercent}% complete</span>
              <span>{nextTier.minTrips} trips</span>
            </div>
          </div>
        ) : (
          <div className="mt-6 pt-5 border-t border-white/20 flex items-center justify-between text-xs text-white">
            <span className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Maximum Level Reached! You are a Platinum Elite Host with the highest profit rate in the industry.
            </span>
          </div>
        )}
      </div>

      {/* Current Perks Checklist & Toggle */}
      <div className="p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-sm">
              Current Tier Privileges & Earnings Perks
            </h3>
            <p className="text-xs text-gray-400">
              Perks unlocked automatically based on your successful trip completions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAllTiers(!showAllTiers)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            {showAllTiers ? 'Hide All Levels' : 'View All Levels & Perks'}
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAllTiers ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentTier.perks.map((perk, i) => (
            <div
              key={i}
              className="flex items-start space-x-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-700"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{perk}</span>
            </div>
          ))}
        </div>

        {/* Expanded View of All Tiers */}
        {showAllTiers && (
          <div className="pt-4 border-t border-gray-100 space-y-4 animate-in fade-in duration-200">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">
              Platform Host Progression Roadmap
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {RIDER_LEVELS.map((tier) => {
                const isCurrent = tier.id === currentTier.id
                const isCompleted = completedTrips >= (tier.maxTrips ?? 50) && !isCurrent

                return (
                  <div
                    key={tier.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20 shadow-sm'
                        : isCompleted
                        ? 'border-gray-200 bg-gray-50'
                        : 'border-gray-100 bg-white opacity-85'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{tier.badgeIcon}</span>
                      {isCurrent ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-600 text-white">
                          Current
                        </span>
                      ) : isCompleted ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-gray-200 text-gray-600">
                          Completed
                        </span>
                      ) : (
                        <span className="flex items-center text-[10px] font-semibold text-gray-400 gap-1">
                          <Lock className="w-3 h-3" />
                          {tier.minTrips}+ trips
                        </span>
                      )}
                    </div>

                    <h5 className="font-bold text-sm text-gray-900">{tier.name}</h5>
                    <p className="text-[11px] text-gray-500 mb-2">
                      {tier.maxTrips ? `${tier.minTrips}–${tier.maxTrips} trips` : '50+ trips'}
                    </p>

                    <div className="p-2 rounded-xl bg-white border border-gray-100 mb-3 space-y-1 text-center">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Take-Home</span>
                      <span className="text-base font-black text-emerald-700 block">
                        {tier.hostShareRate}%
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600">
                        +{tier.earningsBoostPercent}% boost
                      </span>
                    </div>

                    <ul className="space-y-1.5 text-[10px] text-gray-600">
                      {tier.perks.slice(0, 3).map((p, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

