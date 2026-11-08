'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Sparkles,
  ShieldAlert,
  CreditCard,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PriceBreakdown } from './PriceBreakdown'
import { useAuth } from '@/hooks/useAuth'
import { calculateBookingPrice } from '@/lib/utils'
import { CURRENCY_SYMBOL } from '@/lib/constants'

export interface HourlyPackageOption {
  id: string
  name: string
  duration_hours: number
  price: number
  description?: string
}

export interface BookingFormProps {
  listingId: string
  hourlyRate: number
  minHours?: number
  maxHours?: number
  packages?: HourlyPackageOption[]
  maxParticipants?: number
  pickupLocation?: string
  meetingPoint?: string
  className?: string
}

export function BookingForm({
  listingId,
  hourlyRate,
  minHours = 1,
  maxHours = 12,
  packages = [],
  maxParticipants = 10,
  pickupLocation = '',
  meetingPoint = '',
  className = '',
}: BookingFormProps) {
  const router = useRouter()
  const { user } = useAuth()

  // Booking mode: 'package' or 'custom'
  const hasPackages = packages && packages.length > 0
  const [bookingMode, setBookingMode] = useState<'package' | 'custom'>(
    hasPackages ? 'package' : 'custom'
  )

  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    hasPackages ? packages[0]?.id : ''
  )

  // Booking fields
  const today = new Date().toISOString().split('T')[0]
  const [bookingDate, setBookingDate] = useState<string>(today)
  const [startTime, setStartTime] = useState<string>('09:00')
  const [durationHours, setDurationHours] = useState<number>(minHours)
  const [numParticipants, setNumParticipants] = useState<number>(1)
  const [pickup, setPickup] = useState<string>(pickupLocation || meetingPoint || '')
  const [specialRequests, setSpecialRequests] = useState<string>('')

  // Validation & Loading
  const [loading, setLoading] = useState(false)
  const [availabilityChecking, setAvailabilityChecking] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)

  // Selected package details
  const selectedPackage = useMemo(() => {
    return packages.find((p) => p.id === selectedPackageId)
  }, [packages, selectedPackageId])

  // Effective duration
  const effectiveDuration = bookingMode === 'package' && selectedPackage
    ? selectedPackage.duration_hours
    : durationHours

  // Calculate prices
  const priceDetails = useMemo(() => {
    if (bookingMode === 'package' && selectedPackage) {
      const basePrice = Number(selectedPackage.price)
      const platformFee = Math.round(basePrice * 0.1) // 10%
      const taxAmount = Math.round(basePrice * 0.05) // 5%
      const totalAmount = basePrice + platformFee + taxAmount
      return {
        basePrice,
        platformFee,
        taxAmount,
        totalAmount,
      }
    } else {
      const calc = calculateBookingPrice(hourlyRate, durationHours, 10)
      return {
        basePrice: calc.subtotal,
        platformFee: calc.platform_fee,
        taxAmount: calc.tax_amount,
        totalAmount: calc.total_amount,
      }
    }
  }, [bookingMode, selectedPackage, hourlyRate, durationHours])

  // Check availability when date, start time, or duration changes
  useEffect(() => {
    async function checkAvailability() {
      if (!bookingDate || !startTime) return
      setAvailabilityChecking(true)
      setAvailabilityError(null)

      try {
        const res = await fetch(
          `/api/bookings/check-conflict?listingId=${listingId}&date=${bookingDate}&startTime=${startTime}&duration=${effectiveDuration}`
        )
        const data = await res.json()

        if (!res.ok || !data.available) {
          setAvailabilityError(
            data.message || 'Selected time slot overlaps with an existing booking or is outside working hours.'
          )
        }
      } catch (err) {
        // If API is still starting up, don't hard-block user
      } finally {
        setAvailabilityChecking(false)
      }
    }

    const timeout = setTimeout(checkAvailability, 400)
    return () => clearTimeout(timeout)
  }, [listingId, bookingDate, startTime, effectiveDuration])

  // Submit booking
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      router.push(`/login?redirect=/services/${listingId}`)
      return
    }

    if (availabilityError) return

    setLoading(true)
    try {
      const payload = {
        listingId,
        bookingDate,
        startTime,
        durationHours: effectiveDuration,
        packageId: bookingMode === 'package' ? selectedPackageId : null,
        numParticipants,
        pickupLocation: pickup,
        specialRequests,
        hourlyRate,
        basePrice: priceDetails.basePrice,
        platformFee: priceDetails.platformFee,
        taxAmount: priceDetails.taxAmount,
        totalAmount: priceDetails.totalAmount,
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize booking')
      }

      // Navigate to booking payment/confirmation page
      router.push(`/dashboard/bookings?bookingId=${data.booking.id}&action=pay`)
    } catch (err: any) {
      setAvailabilityError(err.message || 'An error occurred while creating booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`bg-white rounded-3xl p-6 border border-gray-200 shadow-xl shadow-gray-200/50 ${className}`}>
      {/* Header Rate */}
      <div className="flex items-baseline justify-between pb-5 border-b border-gray-100">
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
            Hourly Pricing
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-black text-[#0a4d29] font-display">
              {CURRENCY_SYMBOL}{hourlyRate.toLocaleString('en-IN')}
            </span>
            <span className="text-sm font-semibold text-gray-500">/ hour</span>
          </div>
        </div>
        <span className="text-xs bg-orange-50 text-[#ff7a00] font-bold px-3 py-1.5 rounded-full border border-orange-200/60">
          ⚡ Instant Confirmation
        </span>
      </div>

      <form onSubmit={handleProceedToPayment} className="mt-5 space-y-4">
        {/* ── FAST 1-CLICK INSTANT BOOKING BAR (TOP OF FORM - ZERO SCROLL REQUIRED) ── */}
        <div className="p-3 bg-gradient-to-r from-emerald-50 to-orange-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between gap-2 shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Amount</span>
            <div className="flex items-baseline">
              <span className="text-xl font-black text-[#0a4d29]">
                {CURRENCY_SYMBOL}{priceDetails.totalAmount.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-gray-500 ml-1.5 font-bold">({effectiveDuration} hr{effectiveDuration > 1 ? 's' : ''})</span>
            </div>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={loading || availabilityChecking}
            disabled={Boolean(availabilityError)}
            className="bg-[#ff7a00] hover:bg-[#e06c00] font-black text-xs px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <CreditCard className="w-3.5 h-3.5 mr-1.5" />
            Instant Book & Pay
          </Button>
        </div>

        {/* Package vs Custom Toggle (if packages available) */}
        {hasPackages && (
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setBookingMode('package')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                bookingMode === 'package'
                  ? 'bg-white text-[#0a4d29] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Hourly Packages
            </button>
            <button
              type="button"
              onClick={() => setBookingMode('custom')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                bookingMode === 'custom'
                  ? 'bg-white text-[#0a4d29] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Custom Hours
            </button>
          </div>
        )}

        {/* Package Selector */}
        {bookingMode === 'package' && hasPackages && (
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
              Select Predefined Package
            </label>
            <div className="space-y-2">
              {packages.map((pkg) => {
                const isSelected = selectedPackageId === pkg.id
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#ff7a00] bg-orange-50/40 shadow-sm'
                        : 'border-gray-200 hover:border-orange-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-gray-900">{pkg.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-[#ff7a00] font-bold">
                          {pkg.duration_hours} hrs
                        </span>
                      </div>
                      {pkg.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{pkg.description}</p>
                      )}
                    </div>
                    <span className="font-black text-sm text-[#0a4d29]">
                      {CURRENCY_SYMBOL}{Number(pkg.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Date & Start Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                min={today}
                value={bookingDate}
                required
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
              Start Time
            </label>
            <select
              value={startTime}
              required
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {[
                '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
                '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
                '18:00', '19:00', '20:00',
              ].map((t) => {
                const hour = parseInt(t.split(':')[0], 10)
                const label = `${hour % 12 || 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`
                return (
                  <option key={t} value={t}>
                    {label}
                  </option>
                )
              })}
            </select>
          </div>
        </div>

        {/* Custom Duration (if custom mode) */}
        {bookingMode === 'custom' && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Number of Hours
              </label>
              <span className="text-xs font-black text-[#ff7a00]">
                {durationHours} {durationHours === 1 ? 'Hour' : 'Hours'}
              </span>
            </div>
            <input
              type="range"
              min={minHours}
              max={maxHours}
              step={1}
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              className="w-full accent-[#ff7a00] cursor-pointer h-2 bg-gray-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>Min: {minHours} hr</span>
              <span>Max: {maxHours} hrs</span>
            </div>
          </div>
        )}

        {/* Participants & Pickup */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
              Participants
            </label>
            <select
              value={numParticipants}
              onChange={(e) => setNumParticipants(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {Array.from({ length: Math.min(maxParticipants, 15) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'Person' : 'People'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
              Pickup / Meeting
            </label>
            <input
              type="text"
              placeholder="e.g. Hotel lobby, Airport"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
            Special Requests (Optional)
          </label>
          <textarea
            rows={2}
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Child seat, specific language preference, etc."
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Availability Error Banner */}
        {availabilityError && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
            <span>{availabilityError}</span>
          </div>
        )}

        {/* Real-time Price Breakdown */}
        <PriceBreakdown
          hourlyRate={hourlyRate}
          durationHours={effectiveDuration}
          basePrice={priceDetails.basePrice}
          platformFee={priceDetails.platformFee}
          taxAmount={priceDetails.taxAmount}
          totalAmount={priceDetails.totalAmount}
          packageName={bookingMode === 'package' ? selectedPackage?.name : undefined}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={loading || availabilityChecking}
          disabled={Boolean(availabilityError)}
          className="rounded-2xl shadow-lg shadow-orange-500/25 font-bold"
        >
          <CreditCard className="w-5 h-5 mr-2" />
          {user ? 'Proceed to Book & Pay' : 'Sign In to Reserve'}
        </Button>

        <p className="text-[11px] text-center text-gray-400">
          No charge until your booking request is confirmed. Free cancellation according to policy.
        </p>
      </form>
    </div>
  )
}

