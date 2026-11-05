'use client'

import React from 'react'
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Star,
  Users,
  ShieldCheck,
  Award,
  Zap,
} from 'lucide-react'

export interface ProviderScorecardProps {
  acceptanceRate?: number
  rejectionRate?: number
  averageResponseMinutes?: number
  cancellationRate?: number
  completionRate?: number
  noShowRate?: number
  punctualityScore?: number
  customerRating?: number
  repeatCustomerRate?: number
  totalTripsCompleted?: number
  className?: string
}

export function ProviderScorecard({
  acceptanceRate = 96,
  rejectionRate = 4,
  averageResponseMinutes = 8,
  cancellationRate = 2.1,
  completionRate = 97.9,
  noShowRate = 0.0,
  punctualityScore = 98.4,
  customerRating = 4.9,
  repeatCustomerRate = 34.2,
  totalTripsCompleted = 28,
  className = '',
}: ProviderScorecardProps) {
  // Determine overall health tier
  const isSuperHost = acceptanceRate >= 90 && customerRating >= 4.7 && completionRate >= 95

  return (
    <div className={`p-6 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-black text-gray-900 font-display">
              Host Performance Scorecard
            </h3>
            {isSuperHost && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm">
                <Award className="w-3 h-3 mr-1" />
                Premier Host Status
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time quality metrics computed across {totalTripsCompleted} fulfilled bookings.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-100">
          <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
          <div>
            <span className="text-base font-black text-gray-900 leading-none block">
              {customerRating.toFixed(1)} / 5.0
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Customer Satisfaction
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Key Scorecard Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Acceptance Rate */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Acceptance</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-gray-900 font-display">{acceptanceRate}%</p>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${acceptanceRate}%` }} />
          </div>
        </div>

        {/* Avg Response Time */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">SLA Response</span>
            <Clock className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-xl font-black text-gray-900 font-display">{averageResponseMinutes} min</p>
          <span className="text-[10px] text-emerald-600 font-semibold block">Under 15m SLA target</span>
        </div>

        {/* Punctuality Score */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Punctuality</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-xl font-black text-gray-900 font-display">{punctualityScore}%</p>
          <span className="text-[10px] text-gray-400 block">On-time pickup rate</span>
        </div>

        {/* Completion Rate */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Completion</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-700 font-display">{completionRate}%</p>
          <span className="text-[10px] text-emerald-600 font-semibold block">Trip fulfillment</span>
        </div>

        {/* Cancellation Rate */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Host Cancels</span>
            <XCircle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <p className="text-xl font-black text-gray-900 font-display">{cancellationRate}%</p>
          <span className="text-[10px] text-emerald-600 font-semibold block">Below 3% penalty cap</span>
        </div>

        {/* No-Show Rate */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">No-Show Rate</span>
            <AlertTriangle className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <p className="text-xl font-black text-gray-900 font-display">{noShowRate}%</p>
          <span className="text-[10px] text-emerald-600 font-semibold block">Zero reported faults</span>
        </div>

        {/* Rejection Rate */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Rejection Rate</span>
            <Clock className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <p className="text-xl font-black text-gray-900 font-display">{rejectionRate}%</p>
          <span className="text-[10px] text-gray-400 block">Counter-offers accepted</span>
        </div>

        {/* Repeat Customer Rate */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Repeat Riders</span>
            <Users className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <p className="text-xl font-black text-purple-900 font-display">{repeatCustomerRate}%</p>
          <span className="text-[10px] text-purple-600 font-semibold block">Loyal tourist bookings</span>
        </div>
      </div>
    </div>
  )
}

