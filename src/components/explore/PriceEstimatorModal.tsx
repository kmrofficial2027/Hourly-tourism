'use client'

import React, { useState } from 'react'
import {
  Calculator,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Info,
  Car,
  Bike,
  Truck,
  Compass,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

export interface PriceEstimatorModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyCategory?: (category: string) => void
}

export function PriceEstimatorModal({
  isOpen,
  onClose,
  onApplyCategory,
}: PriceEstimatorModalProps) {
  const [category, setCategory] = useState<'bike' | 'car' | 'van' | 'guide' | 'tour'>('car')
  const [hours, setHours] = useState(4)
  const [includeDriver, setIncludeDriver] = useState(true)
  const [isNightTrip, setIsNightTrip] = useState(false)
  const [extraLuggage, setExtraLuggage] = useState(false)

  // Hourly base rates matrix
  const baseRates: Record<string, number> = {
    bike: 149, // Royal Enfield / Scooter
    car: 399, // Swift / Sedan / SUV
    van: 799, // 12-16 Seater Tempo
    guide: 299, // Certified Tourist Guide
    tour: 499, // Curated Sightseeing Tour
  }

  const hourlyRate = baseRates[category]
  const basePrice = hourlyRate * hours
  const driverCharge = includeDriver && (category === 'car' || category === 'van') ? 150 * hours : 0
  const nightSurcharge = isNightTrip ? Math.round(basePrice * 0.15) : 0
  const luggageCharge = extraLuggage ? 100 : 0
  const platformFee = Math.round(basePrice * 0.05)
  const taxes = Math.round((basePrice + platformFee) * 0.05)
  const totalEstimatedPrice = basePrice + driverCharge + nightSurcharge + luggageCharge + platformFee + taxes

  const handleApply = () => {
    if (onApplyCategory) {
      onApplyCategory(category)
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hourly Price & Fare Estimator">
      <div className="space-y-5 text-gray-800">
        <p className="text-xs text-gray-500">
          Calculate upfront estimates with zero surge surprises. Includes platform protection, driver allowances, and transparent hourly rates.
        </p>

        {/* Category Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Select Transport / Experience Mode
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {[
              { id: 'bike', label: 'Bike', icon: Bike, rate: '₹149/h' },
              { id: 'car', label: 'Car', icon: Car, rate: '₹399/h' },
              { id: 'van', label: 'Van', icon: Truck, rate: '₹799/h' },
              { id: 'guide', label: 'Guide', icon: Compass, rate: '₹299/h' },
              { id: 'tour', label: 'Tour', icon: Sparkles, rate: '₹499/h' },
            ].map((item) => {
              const Icon = item.icon
              const isSelected = category === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.id as any)}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#0a4d29] to-[#15803d] text-white shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-bold leading-tight">{item.label}</span>
                  <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-green-200' : 'text-gray-400'}`}>
                    {item.rate}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Hours Duration Slider */}
        <div className="p-4 bg-gray-50 rounded-2xl space-y-2 border border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-700">Trip Duration</span>
            <span className="text-base font-black text-[#ff7a00] font-display">
              {hours} {hours === 1 ? 'Hour' : 'Hours'}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={12}
            step={1}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full accent-[#ff7a00] cursor-pointer h-2 bg-gray-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>1 Hour Quick Ride</span>
            <span>6 Hours Half Day</span>
            <span>12 Hours Full Day</span>
          </div>
        </div>

        {/* Addon Toggles */}
        <div className="space-y-2 pt-1">
          {(category === 'car' || category === 'van') && (
            <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer">
              <span className="text-xs font-semibold text-gray-700">
                Include Dedicated Chauffeur / Driver (+₹150/hr)
              </span>
              <input
                type="checkbox"
                checked={includeDriver}
                onChange={(e) => setIncludeDriver(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
            </label>
          )}

          <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer">
            <span className="text-xs font-semibold text-gray-700">
              Late Night Trip (10:00 PM - 06:00 AM, +15% Night Allowance)
            </span>
            <input
              type="checkbox"
              checked={isNightTrip}
              onChange={(e) => setIsNightTrip(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer">
            <span className="text-xs font-semibold text-gray-700">
              Heavy Luggage Carrier / Roof Rack (+₹100 flat)
            </span>
            <input
              type="checkbox"
              checked={extraLuggage}
              onChange={(e) => setExtraLuggage(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
          </label>
        </div>

        {/* Calculated Breakdown Card */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl space-y-2 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>Base Hourly Fare ({formatCurrency(hourlyRate)} × {hours}h):</span>
            <span className="font-semibold text-gray-900">{formatCurrency(basePrice)}</span>
          </div>
          {driverCharge > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Chauffeur Allowance:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(driverCharge)}</span>
            </div>
          )}
          {nightSurcharge > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Night Service Allowance (15%):</span>
              <span className="font-semibold text-gray-900">{formatCurrency(nightSurcharge)}</span>
            </div>
          )}
          {luggageCharge > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Luggage Carrier Rack:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(luggageCharge)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Platform Protection Fee & GST:</span>
            <span className="font-semibold text-gray-900">{formatCurrency(platformFee + taxes)}</span>
          </div>

          <div className="pt-2 border-t border-emerald-200 flex justify-between items-baseline">
            <span className="text-sm font-bold text-emerald-950">Estimated Total Fare</span>
            <span className="text-2xl font-black text-emerald-800 font-display">
              {formatCurrency(totalEstimatedPrice)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <Button variant="secondary" onClick={onClose} size="sm">
            Close
          </Button>
          <Button variant="primary" onClick={handleApply} size="sm" className="font-bold">
            Show Matching {category.toUpperCase()} Listings
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </Modal>
  )
}

