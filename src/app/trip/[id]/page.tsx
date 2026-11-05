'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldCheck,
  Navigation,
  Clock,
  Car,
  Bike,
  Truck,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Share2,
  ArrowRight,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useRealtimeBooking } from '@/hooks/useRealtimeBooking'

export default function PublicTripTrackerPage() {
  const params = useParams()
  const tripId = params?.id as string
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadTrip = async () => {
    try {
      const res = await fetch(`/api/bookings/${tripId}`)
      if (res.ok) {
        const data = await res.json()
        setBooking(data.booking)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tripId) loadTrip()
  }, [tripId])

  // Real-time synchronization for live radar status
  const { isConnected: realtimeConnected } = useRealtimeBooking(tripId, () => {
    loadTrip()
  })

  const status = booking?.status || 'trip_started'
  const isCompleted = status === 'completed'
  const isActive = ['confirmed', 'driver_on_the_way', 'trip_started', 'in_progress'].includes(status)

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="h-18 px-4 sm:px-8 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <Logo variant="compact" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff7a00] pl-2 border-l border-slate-700">
            Live Trip Radar
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-emerald-400">Live GPS Active</span>
        </div>
      </header>

      {/* Main Tracker Container */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            Connecting to satellite telemetry...
          </div>
        ) : (
          <>
            {/* Status Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/80 border border-slate-700 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Booking Reference
                  </span>
                  <h1 className="text-2xl font-black font-display text-white">
                    #{booking?.booking_number || (tripId ? tripId.slice(0, 8).toUpperCase() : 'TRIP-LIVE')}
                  </h1>
                </div>

                <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  {status.replace(/_/g, ' ').toUpperCase()}
                </div>
              </div>

              {/* Service & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-700/60 text-xs text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Service / Experience</span>
                  <span className="text-sm font-bold text-white">
                    {booking?.listing?.title || 'Hourly Tour / Vehicle Rental'}
                  </span>
                  <span className="block text-[11px] text-slate-400">
                    {booking?.listing?.destination_city || 'Coimbatore'}, Tamil Nadu
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Duration Booked</span>
                  <span className="text-sm font-bold text-white">
                    {booking?.duration_hours || 4} Hours Hourly Session
                  </span>
                  <span className="block text-[11px] text-slate-400">
                    Start: {booking?.start_time || '10:00 AM'}
                  </span>
                </div>
              </div>

              {/* Pickup & Drop Details */}
              {booking?.pickup_location && (
                <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-700 text-xs text-slate-300 flex items-start space-x-2">
                  <Navigation className="w-4 h-4 text-[#ff7a00] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Designated Pickup:</span>
                    <span>{booking.pickup_location}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Emergency SOS & Police Hotlines */}
            <div className="p-6 rounded-3xl bg-red-950/40 border border-red-500/30 text-red-200 space-y-3">
              <div className="flex items-center space-x-2 font-bold text-sm text-red-300">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span>24x7 Emergency Assistance Hotline</span>
              </div>
              <p className="text-xs text-red-200/80 leading-relaxed">
                If the rider or driver requires emergency help, contact the Tamil Nadu Tourist Police or our 24x7 safety response team immediately.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href="tel:112"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center shadow-lg shadow-red-600/30"
                >
                  <Phone className="w-3.5 h-3.5 mr-1.5" />
                  Call Police Emergency (112)
                </a>
                <a
                  href="tel:18002008899"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center border border-slate-700"
                >
                  <Phone className="w-3.5 h-3.5 mr-1.5" />
                  Hourly Tourism Hotline (1800-200-8899)
                </a>
              </div>
            </div>

            {/* Safety & Escrow Assurance */}
            <div className="p-5 rounded-3xl bg-slate-800/60 border border-slate-700 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Protected by Hourly Tourism Trust & Safety Shield</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Encrypted Real-Time Link
              </span>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-600 border-t border-slate-800">
        © {new Date().getFullYear()} Hourly Tourism Marketplace • Safe Travel Technologies
      </footer>
    </div>
  )
}

