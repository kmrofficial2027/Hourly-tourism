'use client'

import React from 'react'
import {
  CheckCircle2,
  Clock,
  Car,
  Navigation,
  Compass,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  User,
  Briefcase,
  ShieldCheck,
  Cpu,
} from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'

export interface TimelineEvent {
  status: string
  title: string
  actor: 'customer' | 'provider' | 'system' | 'admin'
  timestamp: string
  notes?: string
}

export interface BookingTimelineProps {
  currentStatus: string
  events?: TimelineEvent[]
  createdAt?: string
  confirmedAt?: string
  startedAt?: string
  completedAt?: string
  cancelledAt?: string
  cancellationReason?: string
}

export function BookingTimeline({
  currentStatus,
  events,
  createdAt,
  confirmedAt,
  startedAt,
  completedAt,
  cancelledAt,
  cancellationReason,
}: BookingTimelineProps) {
  // If specific history events aren't passed, synthesize from booking timestamps
  const synthesizedEvents: TimelineEvent[] = events && events.length > 0 ? events : []

  if (synthesizedEvents.length === 0) {
    if (createdAt) {
      synthesizedEvents.push({
        status: 'pending',
        title: 'Booking Request Submitted',
        actor: 'customer',
        timestamp: createdAt,
        notes: 'Customer placed hourly reservation. Waiting for host confirmation.',
      })
    }

    if (confirmedAt) {
      synthesizedEvents.push({
        status: 'confirmed',
        title: 'Booking Confirmed by Host',
        actor: 'provider',
        timestamp: confirmedAt,
        notes: 'Host confirmed availability and reserved the slot.',
      })
    }

    if (['driver_on_the_way', 'trip_started', 'in_progress', 'completed'].includes(currentStatus)) {
      synthesizedEvents.push({
        status: 'driver_on_the_way',
        title: 'Host / Driver On The Way',
        actor: 'provider',
        timestamp: confirmedAt || createdAt || new Date().toISOString(),
        notes: 'Host is en route to the specified pickup location.',
      })
    }

    if (startedAt || ['trip_started', 'in_progress', 'completed'].includes(currentStatus)) {
      synthesizedEvents.push({
        status: 'trip_started',
        title: 'Hourly Trip Commenced',
        actor: 'provider',
        timestamp: startedAt || confirmedAt || new Date().toISOString(),
        notes: 'Odometer/departure verified. Hourly meter is active.',
      })
    }

    if (completedAt || currentStatus === 'completed') {
      synthesizedEvents.push({
        status: 'completed',
        title: 'Trip Completed Successfully',
        actor: 'provider',
        timestamp: completedAt || new Date().toISOString(),
        notes: 'Trip ended cleanly. Review eligibility unlocked.',
      })
    }

    if (currentStatus.includes('cancel') || cancelledAt) {
      synthesizedEvents.push({
        status: currentStatus,
        title: `Trip ${currentStatus.replace(/_/g, ' ')}`,
        actor: currentStatus.includes('provider')
          ? 'provider'
          : currentStatus.includes('admin')
          ? 'admin'
          : 'customer',
        timestamp: cancelledAt || new Date().toISOString(),
        notes: cancellationReason || 'Cancellation processed according to cancellation policy.',
      })
    }

    if (currentStatus === 'no_show') {
      synthesizedEvents.push({
        status: 'no_show',
        title: 'Marked as No-Show',
        actor: 'provider',
        timestamp: new Date().toISOString(),
        notes: 'Waiting SLA expired with no customer arrival at pickup spot.',
      })
    }

    if (currentStatus === 'disputed') {
      synthesizedEvents.push({
        status: 'disputed',
        title: 'Dispute Raised & Under Review',
        actor: 'customer',
        timestamp: new Date().toISOString(),
        notes: 'Dispute case filed. Admin investigation initiated.',
      })
    }
  }

  const actorBadges = {
    customer: { label: 'Customer', icon: User, bg: 'bg-green-50 text-[#0a4d29] border-green-200' },
    provider: { label: 'Host / Provider', icon: Briefcase, bg: 'bg-orange-50 text-[#ff7a00] border-orange-200' },
    system: { label: 'System SLA', icon: Cpu, bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    admin: { label: 'Platform Admin', icon: ShieldCheck, bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
        <div>
          <h3 className="text-base font-black text-gray-900 font-display">
            Booking & Trip Timeline
          </h3>
          <p className="text-xs text-gray-500">
            Immutable audit log of all booking lifecycle events and actors
          </p>
        </div>
        <span className="text-xs font-bold text-gray-400">
          {synthesizedEvents.length} Events
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
        {synthesizedEvents.map((evt, idx) => {
          const isLast = idx === synthesizedEvents.length - 1
          const actorMeta = actorBadges[evt.actor] || actorBadges.system
          const ActorIcon = actorMeta.icon

          let dotColor = 'bg-gray-300'
          if (evt.status.includes('cancel') || evt.status === 'no_show') {
            dotColor = 'bg-red-500 ring-4 ring-red-100'
          } else if (evt.status === 'completed') {
            dotColor = 'bg-emerald-600 ring-4 ring-emerald-100'
          } else if (['in_progress', 'trip_started', 'driver_on_the_way'].includes(evt.status)) {
            dotColor = 'bg-[#ff7a00] ring-4 ring-orange-100'
          } else if (['confirmed', 'provider_accepted'].includes(evt.status)) {
            dotColor = 'bg-[#0a4d29] ring-4 ring-green-100'
          }

          return (
            <div key={idx} className="relative group">
              <span
                className={`absolute -left-6 top-1 w-3 h-3 rounded-full ${dotColor} transition-all`}
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                <span className="text-sm font-bold text-gray-900 capitalize">
                  {evt.title}
                </span>

                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${actorMeta.bg}`}
                  >
                    <ActorIcon className="w-3 h-3" />
                    <span>{actorMeta.label}</span>
                  </span>

                  <span className="text-[11px] font-medium text-gray-500">
                    {formatDate(evt.timestamp)} • {formatTime(evt.timestamp)}
                  </span>
                </div>
              </div>

              {evt.notes && (
                <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                  {evt.notes}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

