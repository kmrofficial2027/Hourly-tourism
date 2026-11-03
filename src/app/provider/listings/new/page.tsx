'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Compass,
  Plus,
  Trash2,
  UploadCloud,
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { showToast } from '@/components/ui/Toast'

export default function NewListingPage() {
  const router = useRouter()

  // Form states
  const [category, setCategory] = useState<'bike' | 'car' | 'van' | 'local_guide' | 'sightseeing_tour' | 'experience'>('bike')
  const [title, setTitle] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [destinationCity, setDestinationCity] = useState('')
  const [destinationState, setDestinationState] = useState('')
  const [address, setAddress] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [minBookingHours, setMinBookingHours] = useState('1')
  const [maxBookingHours, setMaxBookingHours] = useState('12')
  const [bufferTimeMinutes, setBufferTimeMinutes] = useState('30')
  const [imageUrl, setImageUrl] = useState('')
  const [images, setImages] = useState<string[]>([])

  // Vehicle specific
  const [vehicleBrand, setVehicleBrand] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [vehicleYear, setVehicleYear] = useState('2023')
  const [vehicleCapacity, setVehicleCapacity] = useState('2')
  const [fuelType, setFuelType] = useState('Petrol')

  // Guide specific
  const [languages, setLanguages] = useState('English, Hindi')
  const [experienceYears, setExperienceYears] = useState('5')
  const [maxGroupSize, setMaxGroupSize] = useState('8')

  // Included & Excluded
  const [includedText, setIncludedText] = useState('')
  const [includedList, setIncludedList] = useState<string[]>([
    'Safety gear / helmets',
    'Third-party vehicle insurance',
  ])
  const [excludedText, setExcludedText] = useState('')
  const [excludedList, setExcludedList] = useState<string[]>([
    'Toll charges',
    'Personal dining expenses',
  ])

  // Packages
  const [packages, setPackages] = useState<
    { name: string; duration_hours: number; price: number; description: string }[]
  >([
    { name: '2-Hour Quick Explorer', duration_hours: 2, price: 399, description: 'Short local tour' },
    { name: '4-Hour Half Day', duration_hours: 4, price: 749, description: 'Explore multiple landmarks' },
  ])

  const [loading, setLoading] = useState(false)

  const isVehicle = ['bike', 'car', 'van'].includes(category)

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()])
      setImageUrl('')
    }
  }

  const handleAddPackage = () => {
    setPackages([
      ...packages,
      { name: 'Full Day Package', duration_hours: 8, price: 1499, description: 'Comprehensive hourly service' },
    ])
  }

  const handleRemovePackage = (index: number) => {
    setPackages(packages.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: any = {
        title,
        shortDescription,
        description,
        category,
        destinationCity,
        destinationState,
        address,
        hourlyRate: Number(hourlyRate),
        minBookingHours: Number(minBookingHours),
        maxBookingHours: Number(maxBookingHours),
        bufferTimeMinutes: Number(bufferTimeMinutes),
        images: images.length > 0 ? images : [
          category === 'bike'
            ? 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80'
            : category === 'car'
            ? 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80'
            : 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&w=800&q=80',
        ],
        includedServices: includedList,
        excludedServices: excludedList,
        termsAndConditions: 'Standard rental agreement and terms apply. Valid ID required.',
        cancellationPolicy: 'Free cancellation up to 4 hours before booking start time.',
        packages,
      }

      if (isVehicle) {
        payload.vehicleDetails = {
          vehicle_type: category,
          brand: vehicleBrand || 'Generic',
          model: vehicleModel || 'Standard',
          year: Number(vehicleYear),
          passenger_capacity: Number(vehicleCapacity),
          fuel_type: fuelType,
          features: ['Regularly Maintained', 'Insured'],
        }
      } else {
        payload.guideDetails = {
          languages: languages.split(',').map((s) => s.trim()),
          experience_years: Number(experienceYears),
          max_group_size: Number(maxGroupSize),
          specializations: ['Local Heritage', 'City Sights'],
        }
      }

      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create listing')

      showToast.success('Listing created successfully!')
      router.push('/provider/listings')
    } catch (err: any) {
      showToast.error(err.message || 'Error creating listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout role="provider" title="Create Hourly Listing">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-2">
          <Link
            href="/provider/listings"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-0.5" />
            Back to My Listings
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Info & Category */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 font-display">
              1. Category & General Information
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                Service Category (Transport restricted to Bike, Car, Van only)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { label: '🏍️ Bike by the Hour', val: 'bike' },
                  { label: '🚗 Car by the Hour', val: 'car' },
                  { label: '🚐 Van by the Hour', val: 'van' },
                  { label: '🧑‍🏫 Local Tour Guide', val: 'local_guide' },
                  { label: '🗺️ Sightseeing Tour', val: 'sightseeing_tour' },
                  { label: '🎭 Local Experience', val: 'experience' },
                ].map((cat) => (
                  <button
                    key={cat.val}
                    type="button"
                    onClick={() => setCategory(cat.val as any)}
                    className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all border text-left ${
                      category === cat.val
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-sm'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Listing Title"
              required
              placeholder="e.g. Royal Enfield Classic 350 — Hourly Cruiser"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Input
              label="Short Tagline (1 sentence)"
              required
              placeholder="e.g. Explore coastal Goa palm-lined highways and hidden beaches on a classic Royal Enfield."
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />

            <Textarea
              label="Full Service Description"
              required
              rows={4}
              placeholder="Detail the experience, vehicle condition, safety features, recommended routes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="City"
                required
                placeholder="e.g. Goa, Jaipur, Mumbai"
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
              />
              <Input
                label="State"
                placeholder="e.g. Goa, Rajasthan, Maharashtra"
                value={destinationState}
                onChange={(e) => setDestinationState(e.target.value)}
              />
            </div>

            <Input
              label="Meeting / Pickup Address"
              placeholder="e.g. Calangute Main Beach Road, Shop #4"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Section 2: Vehicle or Guide Specifications */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 font-display">
              2. {isVehicle ? 'Vehicle Details (Strictly Bike, Car, Van)' : 'Guide / Host Credentials'}
            </h2>

            {isVehicle ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Brand / Make"
                  placeholder="e.g. Royal Enfield / Hyundai / Force"
                  value={vehicleBrand}
                  onChange={(e) => setVehicleBrand(e.target.value)}
                />
                <Input
                  label="Model"
                  placeholder="e.g. Classic 350 / Creta / Traveller"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                />
                <Input
                  label="Passenger Capacity"
                  type="number"
                  value={vehicleCapacity}
                  onChange={(e) => setVehicleCapacity(e.target.value)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Languages Spoken (comma separated)"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                />
                <Input
                  label="Experience (Years)"
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                />
                <Input
                  label="Max Group Size"
                  type="number"
                  value={maxGroupSize}
                  onChange={(e) => setMaxGroupSize(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Section 3: Hourly Pricing & Duration Rules */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 font-display">
              3. Hourly Pricing & Booking Rules
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Input
                label="Base Hourly Rate (₹)"
                type="number"
                required
                placeholder="e.g. 199"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
              />
              <Input
                label="Min Duration (Hours)"
                type="number"
                value={minBookingHours}
                onChange={(e) => setMinBookingHours(e.target.value)}
              />
              <Input
                label="Max Duration (Hours)"
                type="number"
                value={maxBookingHours}
                onChange={(e) => setMaxBookingHours(e.target.value)}
              />
              <Input
                label="Buffer Time (Minutes)"
                type="number"
                value={bufferTimeMinutes}
                onChange={(e) => setBufferTimeMinutes(e.target.value)}
              />
            </div>

            {/* Predefined Packages */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Predefined Hourly Packages</h4>
                  <p className="text-xs text-gray-400">Offer discounted bundle hours for tourists</p>
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={handleAddPackage}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Package
                </Button>
              </div>

              <div className="space-y-3">
                {packages.map((pkg, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-gray-50 border border-gray-200 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center"
                  >
                    <input
                      type="text"
                      placeholder="Package Name"
                      value={pkg.name}
                      onChange={(e) => {
                        const copy = [...packages]
                        copy[idx].name = e.target.value
                        setPackages(copy)
                      }}
                      className="px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-semibold outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Duration (Hours)"
                      value={pkg.duration_hours}
                      onChange={(e) => {
                        const copy = [...packages]
                        copy[idx].duration_hours = Number(e.target.value)
                        setPackages(copy)
                      }}
                      className="px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-semibold outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Price (₹)"
                      value={pkg.price}
                      onChange={(e) => {
                        const copy = [...packages]
                        copy[idx].price = Number(e.target.value)
                        setPackages(copy)
                      }}
                      className="px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-semibold outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemovePackage(idx)}
                        className="text-red-500 hover:text-red-700 p-2 text-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="flex items-center justify-end space-x-4">
            <Link href="/provider/listings">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="px-8 font-bold"
            >
              Publish Hourly Listing
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

