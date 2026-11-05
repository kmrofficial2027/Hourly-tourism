'use client'

import React, { useState, useEffect } from 'react'
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
  AlertCircle,
  ArrowRight,
  Camera,
  Image as ImageIcon,
  Star,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { showToast } from '@/components/ui/Toast'
import { compressImageFile } from '@/lib/utils'

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
  >([])

  // Planned Trip Route & Places configured by provider (starts empty so provider chooses spots)
  const [plannedSpots, setPlannedSpots] = useState<
    {
      id: string
      name: string
      category?: string
      description?: string
      duration: string
      insider_tip?: string
      is_custom?: boolean
    }[]
  >([])

  // Custom spot entry inputs
  const [customPlaceName, setCustomPlaceName] = useState('')
  const [customPlaceDuration, setCustomPlaceDuration] = useState('1 Hour')
  const [customPlaceCategory, setCustomPlaceCategory] = useState('Scenic Viewpoint')
  const [customPlaceDesc, setCustomPlaceDesc] = useState('')
  const [customPlaceTip, setCustomPlaceTip] = useState('')

  // Full destinations data containing city top_spots and hidden_spots
  const [destinationsData, setDestinationsData] = useState<any[]>([])

  // Timings & Expiry Window
  const [isTimed, setIsTimed] = useState(false)
  const [activeFrom, setActiveFrom] = useState(new Date().toISOString().slice(0, 16))
  const [activeUntil, setActiveUntil] = useState('')
  const [expiryPreset, setExpiryPreset] = useState<'never' | '24h' | '3d' | '7d' | '30d' | 'custom'>('never')

  const handleExpiryPresetChange = (preset: 'never' | '24h' | '3d' | '7d' | '30d' | 'custom') => {
    setExpiryPreset(preset)
    const now = Date.now()
    if (preset === 'never') {
      setIsTimed(false)
      setActiveUntil('')
    } else if (preset === '24h') {
      setIsTimed(true)
      setActiveUntil(new Date(now + 24 * 3600 * 1000).toISOString().slice(0, 16))
    } else if (preset === '3d') {
      setIsTimed(true)
      setActiveUntil(new Date(now + 3 * 24 * 3600 * 1000).toISOString().slice(0, 16))
    } else if (preset === '7d') {
      setIsTimed(true)
      setActiveUntil(new Date(now + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16))
    } else if (preset === '30d') {
      setIsTimed(true)
      setActiveUntil(new Date(now + 30 * 24 * 3600 * 1000).toISOString().slice(0, 16))
    } else if (preset === 'custom') {
      setIsTimed(true)
      if (!activeUntil) {
        setActiveUntil(new Date(now + 48 * 3600 * 1000).toISOString().slice(0, 16))
      }
    }
  }

  const [loading, setLoading] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null)
  const [checkingVerification, setCheckingVerification] = useState(true)

  const [availableCities, setAvailableCities] = useState<{ id: string; name: string; state: string }[]>([
    { id: 'coimbatore', name: 'Coimbatore', state: 'Tamil Nadu' },
  ])

  useEffect(() => {
    async function loadCities() {
      try {
        const res = await fetch(`/api/destinations?t=${Date.now()}`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (data.destinations?.length > 0) {
            setDestinationsData(data.destinations)
            setAvailableCities(data.destinations.map((d: any) => ({ id: d.id, name: d.name, state: d.state })))
            if (!destinationCity) {
              setDestinationCity(data.destinations[0].name)
              setDestinationState(data.destinations[0].state)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching destinations:', err)
      }
    }
    loadCities()
  }, [])

  // Helpers for planned trip places
  const handleToggleCitySpot = (spot: any) => {
    const exists = plannedSpots.some((s) => s.name.toLowerCase() === spot.name.toLowerCase())
    if (exists) {
      setPlannedSpots(plannedSpots.filter((s) => s.name.toLowerCase() !== spot.name.toLowerCase()))
      showToast.success(`Removed "${spot.name}" from planned route`)
    } else {
      setPlannedSpots([
        ...plannedSpots,
        {
          id: spot.id || `spot-${Date.now()}`,
          name: spot.name,
          category: spot.category || 'Tourist Attraction',
          description: spot.description || '',
          duration: spot.recommended_hours || '1 Hour',
          insider_tip: spot.insider_tip || '',
          is_custom: false,
        },
      ])
      showToast.success(`Added "${spot.name}" to planned trip route!`)
    }
  }

  const handleAddCustomPlace = () => {
    if (!customPlaceName.trim()) {
      showToast.error('Please enter a place name for the custom stop.')
      return
    }
    setPlannedSpots([
      ...plannedSpots,
      {
        id: `custom-spot-${Date.now()}`,
        name: customPlaceName.trim(),
        category: customPlaceCategory || 'Host Special Spot',
        description: customPlaceDesc.trim(),
        duration: customPlaceDuration.trim() || '45 Mins',
        insider_tip: customPlaceTip.trim(),
        is_custom: true,
      },
    ])
    setCustomPlaceName('')
    setCustomPlaceDesc('')
    setCustomPlaceTip('')
    showToast.success('Custom place added to planned trip!')
  }

  const handleMovePlannedSpot = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= plannedSpots.length) return
    const copy = [...plannedSpots]
    const temp = copy[index]
    copy[index] = copy[targetIndex]
    copy[targetIndex] = temp
    setPlannedSpots(copy)
  }

  const handleRemovePlannedSpot = (index: number) => {
    setPlannedSpots(plannedSpots.filter((_, i) => i !== index))
  }

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/provider/verification')
        if (res.ok) {
          const data = await res.json()
          setVerificationStatus(data.verification_status || 'unsubmitted')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setCheckingVerification(false)
      }
    }
    checkStatus()
  }, [])

  const isVehicle = ['bike', 'car', 'van'].includes(category)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach(async (file) => {
      if (!file.type.startsWith('image/')) {
        showToast.error('Please upload an image file (PNG, JPG, WebP).')
        return
      }
      try {
        const compressed = await compressImageFile(file, 1200, 0.82)
        if (compressed) {
          setImages((prev) => [...prev, compressed])
        }
      } catch (err) {
        showToast.error('Failed to process image.')
      }
    })
  }

  const handleMakeCoverImage = (index: number) => {
    if (index === 0) return
    const target = images[index]
    const filtered = images.filter((_, i) => i !== index)
    setImages([target, ...filtered])
    showToast.success('Set as primary cover image!')
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

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
        termsAndConditions:
          'Rider-hosted hourly tourist service. Local host provides personal vehicle, fuel, and guidance during booked hours. Respect safety instructions and local heritage.',
        cancellationPolicy: 'Free cancellation up to 4 hours before booking start time.',
        packages,
        plannedSpots: plannedSpots.filter((s) => s.name.trim().length > 0),
        isTimed,
        activeFrom,
        activeUntil: isTimed && activeUntil ? new Date(activeUntil).toISOString() : null,
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

  if (!checkingVerification && verificationStatus !== 'verified' && verificationStatus !== 'approved') {
    return (
      <DashboardLayout role="provider" title="Account Approval Required">
        <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-sm ${
              verificationStatus === 'pending'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {verificationStatus === 'pending' ? (
              <Clock className="w-10 h-10 animate-pulse" />
            ) : (
              <ShieldCheck className="w-10 h-10" />
            )}
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900 font-display">
              {verificationStatus === 'pending'
                ? 'Your Account is Pending Admin Approval'
                : 'Identity Verification Required to Add Listings'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
              {verificationStatus === 'pending'
                ? 'Your Aadhaar / ID proof and live selfie photo have been submitted and are under review by our Admin compliance team. Once approved, you will immediately have full access to publish listings in the Hourly Tourism marketplace.'
                : 'To maintain tourist safety and verified host standards, all providers must upload their Aadhaar / Government ID proof and a live selfie before publishing listings.'}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/provider/verification">
              <Button variant="primary" size="lg">
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                {verificationStatus === 'pending'
                  ? 'Check Verification Status'
                  : 'Submit ID & Live Photo for Approval'}
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
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
                  { label: '🏍️ Bike Tourist Ride (With Rider)', val: 'bike' },
                  { label: '🚗 Car Tourist Ride (With Chauffeur)', val: 'car' },
                  { label: '🚐 Van Group Tour (With Driver)', val: 'van' },
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
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Operating City (Admin Launched) <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={destinationCity}
                  onChange={(e) => {
                    const selCity = e.target.value
                    setDestinationCity(selCity)
                    const found = availableCities.find((c) => c.name === selCity)
                    if (found) setDestinationState(found.state)
                  }}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-semibold outline-none bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  {availableCities.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.state})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                  Only cities officially launched by the platform administrator are selectable.
                </p>
              </div>

              <Input
                label="State"
                readOnly
                placeholder="State"
                value={destinationState || 'Tamil Nadu'}
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

          {/* Section 3: Vehicle Photos & Image Upload */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-gray-900 font-display flex items-center">
                  <Camera className="w-5 h-5 mr-2 text-emerald-700" />
                  3. {isVehicle ? 'Vehicle Photos & Image Gallery' : 'Tour / Experience Photos'}
                </h2>
                <p className="text-xs text-gray-500">
                  Upload authentic photos of your actual vehicle. These photos will be showcased on your listing and seen by all tourists.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                {images.length} Photo{images.length !== 1 ? 's' : ''} Attached
              </span>
            </div>

            {/* Direct File Upload Dropzone */}
            <div>
              <input
                type="file"
                accept="image/*"
                multiple
                id="vehicle-image-file-input"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="vehicle-image-file-input"
                className="border-2 border-dashed border-emerald-200 hover:border-emerald-500 rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer bg-emerald-50/30 hover:bg-emerald-50/70 transition-all text-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="font-bold text-sm text-gray-800">
                  Click to Upload Vehicle Photos from your Device
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports JPG, PNG, WebP up to 5MB. You can select multiple photos at once.
                </p>
              </label>
            </div>

            {/* Image URL input fallback */}
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <Input
                placeholder="Or paste an image web link (e.g. https://...)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 w-full"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddImage}
                disabled={!imageUrl.trim()}
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Image URL
              </Button>
            </div>

            {/* Sample Vehicle Photo Quick Picks */}
            {isVehicle && images.length === 0 && (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                  Quick Sample Photos (Click to prefill):
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setImages(['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80'])}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-white border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300"
                  >
                    🏍️ Classic Bike (Royal Enfield)
                  </button>
                  <button
                    type="button"
                    onClick={() => setImages(['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80'])}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-white border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300"
                  >
                    🚗 Premium Sedan / SUV (Innova / Creta)
                  </button>
                  <button
                    type="button"
                    onClick={() => setImages(['https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&w=800&q=80'])}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-white border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300"
                  >
                    🚐 12-Seater Passenger Van (Traveller)
                  </button>
                </div>
              </div>
            )}

            {/* Photo Gallery Grid */}
            {images.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
                  Attached Photos ({images.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-2xl overflow-hidden border-2 bg-gray-100 aspect-[4/3] group shadow-sm transition-all"
                    >
                      <img src={img} alt={`Vehicle photo ${idx + 1}`} className="w-full h-full object-cover" />

                      {idx === 0 ? (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-600 text-white shadow">
                          Cover Photo
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleMakeCoverImage(idx)}
                          className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/90 hover:bg-white text-gray-800 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Set Cover
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600/90 hover:bg-red-700 text-white shadow transition-transform hover:scale-110"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Planned Trip Route & Places Selection */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900 font-display">
                    4. Trip Route & Planned Places (Places You Will Take Tourists To)
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-[#0a4d29]">
                    Core Feature
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Choose from verified tourist spots in {destinationCity || 'your city'} or add your own custom spots to build the planned tour route. Tourists will see this route and book your hourly ride!
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {plannedSpots.length} Places in Route
                </span>
              </div>
            </div>

            {/* Sub-A: Quick Select from City Spots */}
            {(() => {
              const currentDest =
                destinationsData.find(
                  (d: any) => d.name?.toLowerCase() === (destinationCity || '').toLowerCase()
                ) || destinationsData[0]
              
              const cityTopSpots = (currentDest?.top_spots || []).filter(
                (s: any) => s.name && s.name.trim().length > 0
              )
              const cityHiddenSpots = (currentDest?.hidden_spots || []).filter(
                (s: any) => s.name && s.name.trim().length > 0
              )
              const totalSpots = cityTopSpots.length + cityHiddenSpots.length

              return (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-800 block">
                        Select Places from {destinationCity || 'City'} to include in this Trip:
                      </label>
                      <p className="text-[11px] text-gray-500">
                        Bundled from Admin & AI maps. Click any spot to add it to your planned tour route.
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {totalSpots} Bundled Places in {destinationCity || 'City'}
                    </span>
                  </div>

                  {totalSpots > 0 ? (
                    <div className="space-y-3.5">
                      {/* Top Tourist Spots Group */}
                      {cityTopSpots.length > 0 && (
                        <div>
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1 mb-2">
                            <span>⭐</span> Top Tourist Attractions ({cityTopSpots.length})
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {cityTopSpots.map((spot: any) => {
                              const isSelected = plannedSpots.some(
                                (s) => s.name.toLowerCase() === spot.name.toLowerCase()
                              )
                              return (
                                <button
                                  key={spot.id || spot.name}
                                  type="button"
                                  onClick={() => handleToggleCitySpot(spot)}
                                  className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5 shadow-sm ${
                                    isSelected
                                      ? 'bg-[#0a4d29] text-white border-[#0a4d29] ring-2 ring-emerald-500/20'
                                      : 'bg-white text-gray-800 border-gray-200 hover:bg-emerald-50 hover:border-emerald-300'
                                  }`}
                                >
                                  <span
                                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                                      isSelected ? 'bg-white text-[#0a4d29]' : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {isSelected ? '✓' : '+'}
                                  </span>
                                  <span>{spot.name}</span>
                                  {spot.recommended_hours && (
                                    <span
                                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                        isSelected
                                          ? 'bg-white/20 text-white'
                                          : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                                      }`}
                                    >
                                      {spot.recommended_hours}
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Hidden Gems Group */}
                      {cityHiddenSpots.length > 0 && (
                        <div>
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-600 flex items-center gap-1 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                            Secret Gems & Off-Beat Spots ({cityHiddenSpots.length})
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {cityHiddenSpots.map((spot: any) => {
                              const isSelected = plannedSpots.some(
                                (s) => s.name.toLowerCase() === spot.name.toLowerCase()
                              )
                              return (
                                <button
                                  key={spot.id || spot.name}
                                  type="button"
                                  onClick={() => handleToggleCitySpot(spot)}
                                  className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5 shadow-sm ${
                                    isSelected
                                      ? 'bg-orange-600 text-white border-orange-600 ring-2 ring-orange-500/20'
                                      : 'bg-orange-50/50 text-orange-950 border-orange-200 hover:bg-orange-100/60 hover:border-orange-300'
                                  }`}
                                >
                                  <span
                                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                                      isSelected ? 'bg-white text-orange-600' : 'bg-orange-100 text-orange-700'
                                    }`}
                                  >
                                    {isSelected ? '✓' : '+'}
                                  </span>
                                  <span>{spot.name}</span>
                                  {spot.recommended_hours && (
                                    <span
                                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                        isSelected
                                          ? 'bg-white/20 text-white'
                                          : 'bg-white text-orange-700 border border-orange-200'
                                      }`}
                                    >
                                      {spot.recommended_hours}
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-xl border border-gray-100">
                      No bundled spots found for {destinationCity || 'this city'}. You can add custom places below.
                    </p>
                  )}
                </div>
              )
            })()}

            {/* Sub-B: Add Custom Spot Form */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#ff7a00]" />
                Add Your Own Custom Spot / Secret Stop
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <input
                  type="text"
                  placeholder="Spot / Place Name (e.g. Mettupalayam River Viewpoint)"
                  value={customPlaceName}
                  onChange={(e) => setCustomPlaceName(e.target.value)}
                  className="sm:col-span-2 px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <select
                  value={customPlaceDuration}
                  onChange={(e) => setCustomPlaceDuration(e.target.value)}
                  className="px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="30 Mins">30 Mins</option>
                  <option value="45 Mins">45 Mins</option>
                  <option value="1 Hour">1 Hour</option>
                  <option value="1.5 Hours">1.5 Hours</option>
                  <option value="2 Hours">2 Hours</option>
                  <option value="3 Hours">3 Hours</option>
                </select>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleAddCustomPlace}
                  className="rounded-xl text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add to Route
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Short description of what tourist will see or experience..."
                  value={customPlaceDesc}
                  onChange={(e) => setCustomPlaceDesc(e.target.value)}
                  className="px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-normal outline-none"
                />
                <input
                  type="text"
                  placeholder="Host Insider Tip (e.g. Best photo angle at sunset, famous tea stall)..."
                  value={customPlaceTip}
                  onChange={(e) => setCustomPlaceTip(e.target.value)}
                  className="px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-normal outline-none"
                />
              </div>
            </div>

            {/* Sub-C: Planned Trip Itinerary (Sequence & Time Management) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
                  Planned Trip Sequence ({plannedSpots.length} Stops in Route)
                </h4>
                <span className="text-[11px] text-gray-400">Re-order stops to set travel sequence</span>
              </div>

              {plannedSpots.length === 0 ? (
                <div className="p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center text-xs text-gray-400">
                  No places added yet. Select spots above or add custom stops to plan your route.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {plannedSpots.map((spot, idx) => (
                    <div
                      key={spot.id || idx}
                      className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-emerald-400 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-xs sm:text-sm text-gray-900">
                              {spot.name}
                            </h5>
                            {spot.is_custom && (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-purple-100 text-purple-700">
                                Custom Place
                              </span>
                            )}
                          </div>
                          {spot.description && (
                            <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                              {spot.description}
                            </p>
                          )}
                          {spot.insider_tip && (
                            <p className="text-[10px] text-orange-800 font-medium mt-0.5">
                              💡 <strong>Tip:</strong> {spot.insider_tip}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Controls: Duration & Reordering */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <input
                          type="text"
                          value={spot.duration}
                          onChange={(e) => {
                            const copy = [...plannedSpots]
                            copy[idx].duration = e.target.value
                            setPlannedSpots(copy)
                          }}
                          className="w-24 px-2 py-1 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 text-center"
                          title="Time spent at this spot"
                        />

                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMovePlannedSpot(idx, 'up')}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30 text-gray-600 text-xs"
                          title="Move earlier in trip"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={idx === plannedSpots.length - 1}
                          onClick={() => handleMovePlannedSpot(idx, 'down')}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30 text-gray-600 text-xs"
                          title="Move later in trip"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePlannedSpot(idx)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                          title="Remove spot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Hourly Pricing & Duration Rules */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 font-display">
              5. Hourly Pricing & Booking Rules
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
                {packages.length === 0 ? (
                  <p className="text-xs text-gray-400 italic bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200 text-center">
                    No predefined packages added. Tourists will book based on your standard hourly rate. Click &quot;+ Add Package&quot; if you wish to offer discounted bundled hours.
                  </p>
                ) : (
                  packages.map((pkg, idx) => (
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
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Section 6: Listing Timings & Validity (Auto-Expiry Window) */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 font-display">
                  6. Listing Timings & Validity Window
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800">
                  Auto-Expiry Option
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Configure how long this listing stays live in the marketplace. When it expires, it automatically becomes inactive and can be purged while all booking transactions and ride details remain permanently preserved.
              </p>
            </div>

            {/* Preset Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block">
                Listing Active Duration Preset
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {[
                  { id: 'never', label: 'Always Active (No Expiry)' },
                  { id: '24h', label: '24 Hours (Flash Tour)' },
                  { id: '3d', label: '3 Days (Weekend Special)' },
                  { id: '7d', label: '7 Days (1 Week)' },
                  { id: '30d', label: '30 Days (1 Month)' },
                  { id: 'custom', label: 'Custom Date & Time' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleExpiryPresetChange(item.id as any)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center ${
                      expiryPreset === item.id
                        ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-sm ring-1 ring-blue-500'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom or Timed Dates */}
            {isTimed && (
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Live Active From:
                  </label>
                  <input
                    type="datetime-local"
                    value={activeFrom}
                    onChange={(e) => setActiveFrom(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Expires & Automatically Inactivates At:
                  </label>
                  <input
                    type="datetime-local"
                    value={activeUntil}
                    onChange={(e) => {
                      setActiveUntil(e.target.value)
                      setExpiryPreset('custom')
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-800 outline-none"
                  />
                </div>
                <div className="sm:col-span-2 text-xs text-blue-900 bg-white/80 p-3 rounded-xl border border-blue-200/60 font-medium">
                  ℹ️ This listing will be visible and bookable until{' '}
                  <strong>{activeUntil ? new Date(activeUntil).toLocaleString() : 'scheduled expiry'}</strong>.
                  After this date/time, it will switch to Inactive in your dashboard.
                </div>
              </div>
            )}
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

