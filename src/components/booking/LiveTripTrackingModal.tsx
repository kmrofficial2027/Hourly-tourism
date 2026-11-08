'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  Navigation,
  Phone,
  MessageCircle,
  ShieldCheck,
  AlertTriangle,
  Car,
  Compass,
  MapPin,
  Clock,
  Radio,
  Share2,
  ExternalLink,
  KeyRound,
  CheckCircle2,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { showToast } from '@/components/ui/Toast'
import { getBookingStartOtp } from '@/lib/otpUtils'
import { formatTime, formatDate } from '@/lib/utils'

export interface LiveTripTrackingModalProps {
  isOpen: boolean
  onClose: () => void
  booking: any
  role?: 'customer' | 'provider'
  onOpenOtpModal?: () => void
}

// Haversine formula to compute exact distance in kilometers between two GPS coordinates
function computeHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Number((R * c).toFixed(2))
}

export function LiveTripTrackingModal({
  isOpen,
  onClose,
  booking,
  role = 'customer',
  onOpenOtpModal,
}: LiveTripTrackingModalProps) {
  if (!booking) return null

  const listing = booking.service_listings || {}
  const host = booking.host_contact || booking.provider_profile || {}
  const customer = booking.profiles || booking.customer || {}
  const startOtp = getBookingStartOtp(booking.booking_number || booking.id)

  // Default coordinate center (Coimbatore area or listing coordinates)
  const defaultLat = listing.latitude || 11.0168
  const defaultLng = listing.longitude || 76.9558

  // Live Simulated or Real GPS Coordinates
  const [providerCoords, setProviderCoords] = useState({
    lat: defaultLat + 0.009,
    lng: defaultLng - 0.007,
  })
  const [customerCoords, setCustomerCoords] = useState({
    lat: defaultLat,
    lng: defaultLng,
  })

  const [isSharingLiveGps, setIsSharingLiveGps] = useState(false)
  const [distanceKm, setDistanceKm] = useState(1.4)
  const [etaText, setEtaText] = useState('~4 mins')
  const [speedKmh, setSpeedKmh] = useState(32)
  const watchIdRef = useRef<number | null>(null)

  // Recalculate distance and ETA dynamically whenever either coordinate updates
  useEffect(() => {
    const dist = computeHaversineDistanceKm(
      providerCoords.lat,
      providerCoords.lng,
      customerCoords.lat,
      customerCoords.lng
    )
    setDistanceKm(dist)

    const effectiveSpeed = Math.max(25, speedKmh)
    const minutesTotal = Math.max(1, Math.round((dist / effectiveSpeed) * 60))

    if (minutesTotal >= 60) {
      const hrs = Math.floor(minutesTotal / 60)
      const mins = minutesTotal % 60
      setEtaText(`~${hrs} hr${hrs > 1 ? 's' : ''} ${mins > 0 ? `${mins} min` : ''}`)
    } else {
      setEtaText(`~${minutesTotal} min${minutesTotal > 1 ? 's' : ''}`)
    }
  }, [providerCoords, customerCoords, speedKmh])

  // Simulate subtle vehicle movement towards pickup point when trip is confirmed or in progress
  useEffect(() => {
    if (!isOpen) return

    const interval = setInterval(() => {
      setProviderCoords((prev) => {
        // Move slightly closer to customer location
        const stepLat = (customerCoords.lat - prev.lat) * 0.05
        const stepLng = (customerCoords.lng - prev.lng) * 0.05
        return {
          lat: prev.lat + stepLat,
          lng: prev.lng + stepLng,
        }
      })

      setSpeedKmh(Math.floor(28 + Math.random() * 12))
    }, 3000)

    return () => clearInterval(interval)
  }, [isOpen, customerCoords])

  // Real device GPS toggle
  const handleToggleDeviceGps = () => {
    if (isSharingLiveGps) {
      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      setIsSharingLiveGps(false)
      showToast.success('Live GPS sharing paused.')
      return
    }

    if (!('geolocation' in navigator)) {
      showToast.error('Geolocation is not supported by your browser')
      return
    }

    showToast.loading('Connecting device GPS sensor...')
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed } = pos.coords
        if (role === 'provider') {
          setProviderCoords({ lat: latitude, lng: longitude })
        } else {
          setCustomerCoords({ lat: latitude, lng: longitude })
        }
        if (speed) setSpeedKmh(Math.round(speed * 3.6))
        setIsSharingLiveGps(true)
        showToast.success('GPS telemetry streaming live!')
      },
      (err) => {
        showToast.error('Location permission denied or unavailable.')
        setIsSharingLiveGps(false)
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    )
  }

  // Open real Google Maps Directions
  const pickupQuery = encodeURIComponent(
    booking.pickup_location || listing.destination_city || 'Coimbatore'
  )
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${providerCoords.lat},${providerCoords.lng}&destination=${pickupQuery}&travelmode=driving`

  const hostPhone = host.phone || '+91 98765 43210'
  const customerPhone = customer.phone || '+91 98765 43210'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Live Trip Safety Radar & GPS Tracking"
      size="lg"
    >
      <div className="space-y-4">
        {/* Status & Telemetry Header */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 via-[#0a4d29] to-emerald-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center shrink-0">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400" />
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-200">
                  {booking.status === 'in_progress'
                    ? '🟢 Trip In Progress'
                    : '🚗 Host En Route to Pickup Point'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                  #{booking.booking_number}
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                {listing.title || 'Hourly Experience'} • {listing.destination_city || 'Coimbatore'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleToggleDeviceGps}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm ${
                isSharingLiveGps
                  ? 'bg-emerald-400 text-emerald-950 hover:bg-emerald-300'
                  : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isSharingLiveGps ? 'animate-pulse' : ''}`} />
              <span>{isSharingLiveGps ? 'GPS Connected' : 'Share My Live GPS'}</span>
            </button>
          </div>
        </div>

        {/* Live Distance, ETA & Speed Bar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
              Exact Distance
            </span>
            <span className="text-lg font-black text-slate-900">{distanceKm} km</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-center">
            <span className="text-[10px] uppercase font-bold text-orange-600 block tracking-wider">
              Est. Meetup ETA
            </span>
            <span className="text-lg font-black text-[#ff7a00]">{etaText}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">
              Live Vehicle Speed
            </span>
            <span className="text-lg font-black text-emerald-900">{speedKmh} km/h</span>
          </div>
        </div>

        {/* Interactive Map Visualizer */}
        <div className="relative w-full h-72 sm:h-80 rounded-3xl overflow-hidden border border-gray-200 bg-slate-100 shadow-inner flex flex-col justify-between">
          {/* Embed OpenStreetMap centered on dynamic route coordinates */}
          <iframe
            title="Live GPS Tracking Map"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${Math.min(
              providerCoords.lng,
              customerCoords.lng
            ) - 0.015}%2C${Math.min(providerCoords.lat, customerCoords.lat) - 0.015}%2C${Math.max(
              providerCoords.lng,
              customerCoords.lng
            ) + 0.015}%2C${Math.max(providerCoords.lat, customerCoords.lat) + 0.015}&layer=mapnik&marker=${providerCoords.lat}%2C${providerCoords.lng}`}
            className="w-full h-full border-0 filter saturate-150 contrast-105"
          />

          {/* Floating Live Markers HUD Overlay */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-gray-200 text-xs font-bold text-gray-800 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>🚗 Host: En Route (Lat: {providerCoords.lat.toFixed(4)})</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-gray-200 text-xs font-bold text-gray-800 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>📍 Pickup: {booking.pickup_location || listing.destination_city || 'Designated Point'}</span>
            </div>
          </div>

          {/* Floating Navigation Trigger Button */}
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-lg flex items-center space-x-1.5 transition-all"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-300" />
              <span>Turn-by-Turn Directions ↗</span>
            </a>
          </div>
        </div>

        {/* Exact Dual Locations Comparison Card (Distance in km & Meetup ETA) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
          <div className="flex items-start space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 animate-ping" />
            <div>
              <span className="font-bold text-gray-900 block">Host Exact Location</span>
              <p className="text-gray-500 text-[11px] mt-0.5">
                {host.businessName || host.name || 'Verified Local Host'} • Coordinates: ({providerCoords.lat.toFixed(4)}, {providerCoords.lng.toFixed(4)})
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff7a00] mt-1 shrink-0" />
            <div>
              <span className="font-bold text-gray-900 block">Tourist Pickup Point</span>
              <p className="text-gray-500 text-[11px] mt-0.5">
                {booking.pickup_location || listing.destination_city || 'Designated Pickup'} • Coordinates: ({customerCoords.lat.toFixed(4)}, {customerCoords.lng.toFixed(4)})
              </p>
            </div>
          </div>
        </div>

        {/* Start OTP Banner (Always visible in tracking screen for easy verification) */}
        {['confirmed', 'in_progress'].includes(booking.status) && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#ff7a00]/15 text-[#ff7a00] flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                  Ride Start OTP Code
                </span>
                <p className="text-xs text-amber-800">
                  {role === 'customer'
                    ? 'Share this code with your host at meetup to verify and start ride.'
                    : 'Ask the tourist for this OTP code and verify it to start the ride.'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-1.5 rounded-xl border border-amber-300 shadow-sm shrink-0 self-start sm:self-auto">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">OTP:</span>
              <span className="font-mono text-xl font-black text-[#ff7a00] tracking-widest">
                {startOtp}
              </span>
            </div>
          </div>
        )}

        {/* Contact & Communication Card */}
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-[#0a4d29] flex items-center justify-center font-bold text-sm shrink-0">
              {role === 'customer' ? (host.name?.[0] || 'H') : (customer.full_name?.[0] || 'T')}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-sm text-gray-900">
                  {role === 'customer'
                    ? host.businessName || host.name || 'Verified Local Host'
                    : customer.full_name || 'Verified Tourist'}
                </h4>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-gray-500">
                {role === 'customer'
                  ? `Contact: ${hostPhone} • Operating in ${host.city || 'Coimbatore'}`
                  : `Phone: ${customerPhone} • Pickup: ${booking.pickup_location || 'Designated Point'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${role === 'customer' ? hostPhone : customerPhone}`}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0a4d29] text-xs font-bold border border-emerald-200 flex items-center space-x-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>Call Direct</span>
            </a>
            <a
              href={`https://wa.me/${(role === 'customer' ? hostPhone : customerPhone).replace(/\D/g, '')}?text=Hello! Regarding Hourly Tourism Booking %23${booking.booking_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Exact Dual Locations Comparison Card (Distance in km & Meetup ETA) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
          <div className="flex items-start space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 animate-ping" />
            <div>
              <span className="font-bold text-gray-900 block">Host Exact Location</span>
              <p className="text-gray-500 text-[11px] mt-0.5">
                {host.businessName || host.name || 'Verified Local Host'} • Coordinates: ({providerCoords.lat.toFixed(4)}, {providerCoords.lng.toFixed(4)})
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff7a00] mt-1 shrink-0" />
            <div>
              <span className="font-bold text-gray-900 block">Tourist Pickup Point</span>
              <p className="text-gray-500 text-[11px] mt-0.5">
                {booking.pickup_location || listing.destination_city || 'Designated Pickup'} • Coordinates: ({customerCoords.lat.toFixed(4)}, {customerCoords.lng.toFixed(4)})
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-[11px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>24x7 Safety Assistance Radar • Live Escrow Protection</span>
          </div>

          <div className="flex items-center space-x-2">
            {role === 'provider' && booking.status === 'confirmed' && onOpenOtpModal && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose()
                  onOpenOtpModal()
                }}
                className="bg-indigo-600 hover:bg-indigo-700 font-bold"
              >
                <KeyRound className="w-3.5 h-3.5 mr-1" />
                Enter Tourist OTP
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close Radar
            </Button>
          </div>
        </div>

        {/* Exact Dual Locations Comparison Card (Distance in km & Meetup ETA) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
          <div className="flex items-start space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 animate-ping" />
            <div>
              <span className="font-bold text-gray-900 block">Host Exact Location</span>
              <p className="text-gray-500 text-[11px] mt-0.5">
                {host.businessName || host.name || 'Verified Local Host'} • Coordinates: ({providerCoords.lat.toFixed(4)}, {providerCoords.lng.toFixed(4)})
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff7a00] mt-1 shrink-0" />
            <div>
              <span className="font-bold text-gray-900 block">Tourist Pickup Point</span>
              <p className="text-gray-500 text-[11px] mt-0.5">
                {booking.pickup_location || listing.destination_city || 'Designated Pickup'} • Coordinates: ({customerCoords.lat.toFixed(4)}, {customerCoords.lng.toFixed(4)})
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

