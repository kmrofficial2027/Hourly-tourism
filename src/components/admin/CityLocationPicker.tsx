'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  MapPin,
  Search,
  Navigation,
  Compass,
  CheckCircle2,
  Crosshair,
  Sparkles,
  Move,
} from 'lucide-react'

export interface CityLocationPickerProps {
  lat: number
  lng: number
  cityName?: string
  onChange: (lat: number, lng: number) => void
}

// Well-known South Indian regional coordinate presets for instant pinpointing
const REGIONAL_PRESETS: Record<string, { lat: number; lng: number; name: string }> = {
  coimbatore: { lat: 11.0168, lng: 76.9558, name: 'Coimbatore, TN' },
  pollachi: { lat: 10.658, lng: 77.009, name: 'Pollachi, TN' },
  valparai: { lat: 10.326, lng: 76.955, name: 'Valparai, TN' },
  ooty: { lat: 11.4102, lng: 76.695, name: 'Ooty (Udhagamandalam), TN' },
  kodaikanal: { lat: 10.2381, lng: 77.4892, name: 'Kodaikanal, TN' },
  madurai: { lat: 9.9252, lng: 78.1198, name: 'Madurai, TN' },
  munnar: { lat: 10.0889, lng: 77.0595, name: 'Munnar, KL' },
  wayanad: { lat: 11.6854, lng: 76.132, name: 'Wayanad, KL' },
  mysuru: { lat: 12.2958, lng: 76.6394, name: 'Mysuru, KA' },
  bengaluru: { lat: 12.9716, lng: 77.5946, name: 'Bengaluru, KA' },
  chennai: { lat: 13.0827, lng: 80.2707, name: 'Chennai, TN' },
  kochi: { lat: 9.9312, lng: 76.2673, name: 'Kochi, KL' },
}

export function CityLocationPicker({
  lat,
  lng,
  cityName = '',
  onChange,
}: CityLocationPickerProps) {
  const [currentLat, setCurrentLat] = useState(lat || 11.0168)
  const [currentLng, setCurrentLng] = useState(lng || 76.9558)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerInstanceRef = useRef<any>(null)

  // Sync internal state when parent props change
  useEffect(() => {
    if (lat && lng && (lat !== currentLat || lng !== currentLng)) {
      setCurrentLat(lat)
      setCurrentLng(lng)
      if (markerInstanceRef.current && mapInstanceRef.current) {
        markerInstanceRef.current.setLatLng([lat, lng])
        mapInstanceRef.current.panTo([lat, lng])
      }
    }
  }, [lat, lng])

  // Load Leaflet dynamically on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Inject Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // 2. Inject Leaflet JS
    const checkLeaflet = () => {
      const L = (window as any).L
      if (L) {
        setLeafletLoaded(true)
        return
      }

      if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script')
        script.id = 'leaflet-js'
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.async = true
        script.onload = () => {
          setLeafletLoaded(true)
        }
        document.body.appendChild(script)
      } else {
        const interval = setInterval(() => {
          if ((window as any).L) {
            setLeafletLoaded(true)
            clearInterval(interval)
          }
        }, 150)
        return () => clearInterval(interval)
      }
    }

    checkLeaflet()
  }, [])

  // Initialize Leaflet Map once loaded
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return
    const L = (window as any).L
    if (!L) return

    // Clean up any existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    try {
      const initialCoords = [currentLat, currentLng]
      const map = L.map(mapContainerRef.current, {
        center: initialCoords,
        zoom: 11,
        zoomControl: true,
      })

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      // Custom Pin Icon
      const customPinIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: #ff7a00;
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })

      // Add Draggable Marker
      const marker = L.marker(initialCoords, {
        draggable: true,
        icon: customPinIcon,
      }).addTo(map)

      // Drag event
      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        const newLat = Number(pos.lat.toFixed(6))
        const newLng = Number(pos.lng.toFixed(6))
        setCurrentLat(newLat)
        setCurrentLng(newLng)
        onChange(newLat, newLng)
      })

      // Map Click event: click anywhere to drop the pin
      map.on('click', (e: any) => {
        const newLat = Number(e.latlng.lat.toFixed(6))
        const newLng = Number(e.latlng.lng.toFixed(6))
        marker.setLatLng([newLat, newLng])
        setCurrentLat(newLat)
        setCurrentLng(newLng)
        onChange(newLat, newLng)
      })

      mapInstanceRef.current = map
      markerInstanceRef.current = marker

      // Small delay to invalidate size after modal renders
      setTimeout(() => {
        map.invalidateSize()
      }, 250)
    } catch (err) {
      console.warn('Leaflet initialization warning:', err)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [leafletLoaded])

  // Move pin to specific coords
  const pointLocation = (newLat: number, newLng: number) => {
    setCurrentLat(newLat)
    setCurrentLng(newLng)
    onChange(newLat, newLng)

    if (mapInstanceRef.current && markerInstanceRef.current) {
      markerInstanceRef.current.setLatLng([newLat, newLng])
      mapInstanceRef.current.flyTo([newLat, newLng], 12, { duration: 1 })
    }
  }

  // Handle Search input
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) return

    const q = searchQuery.trim().toLowerCase()
    setIsSearching(true)

    // Check regional presets first
    const presetKey = Object.keys(REGIONAL_PRESETS).find(
      (k) => q.includes(k) || k.includes(q)
    )

    if (presetKey) {
      const preset = REGIONAL_PRESETS[presetKey]
      pointLocation(preset.lat, preset.lng)
      setIsSearching(false)
      return
    }

    // Fallback: Geocode with OpenStreetMap Nominatim
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery + ', India'
      )}&limit=1`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (data && data.length > 0) {
          const foundLat = Number(Number(data[0].lat).toFixed(6))
          const foundLng = Number(Number(data[0].lon).toFixed(6))
          pointLocation(foundLat, foundLng)
        }
      }
    } catch {
      // silent
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Header and Quick Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-emerald-600" />
          Point Location on Map <span className="text-red-500">*</span>
        </label>

        {/* Selected Coordinates Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-mono font-bold shadow-xs">
          <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {currentLat.toFixed(4)}° N, {currentLng.toFixed(4)}° E
          </span>
        </div>
      </div>

      {/* Map Search & Quick-Jump Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSearch()
              }
            }}
            placeholder="Search town or landmark (e.g. Pollachi, Valparai, Ooty)..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <button
          type="button"
          onClick={() => handleSearch()}
          disabled={isSearching}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 transition-colors flex items-center gap-1"
        >
          {isSearching ? 'Locating...' : 'Locate'}
        </button>
      </div>

      {/* Popular City Quick-Jump Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
        <span className="text-gray-400 font-bold shrink-0 text-[10px] uppercase">
          Quick Jump:
        </span>
        {Object.entries(REGIONAL_PRESETS).map(([key, item]) => {
          const isCurrent =
            Math.abs(currentLat - item.lat) < 0.05 &&
            Math.abs(currentLng - item.lng) < 0.05
          return (
            <button
              key={key}
              type="button"
              onClick={() => pointLocation(item.lat, item.lng)}
              className={`px-2.5 py-0.5 rounded-lg shrink-0 font-semibold transition-all border ${
                isCurrent
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              📍 {item.name.split(',')[0]}
            </button>
          )
        })}
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative w-full h-[280px] rounded-2xl overflow-hidden border-2 border-gray-200 bg-slate-900 shadow-inner group">
        {/* Leaflet Map mount node */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Fallback interactive canvas if Leaflet is still loading */}
        {!leafletLoaded && (
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const clickX = e.clientX - rect.left
              const clickY = e.clientY - rect.top
              // map click to coordinate delta
              const deltaLat = ((rect.height / 2 - clickY) / rect.height) * 0.5
              const deltaLng = ((clickX - rect.width / 2) / rect.width) * 0.5
              pointLocation(
                Number((currentLat + deltaLat).toFixed(6)),
                Number((currentLng + deltaLng).toFixed(6))
              )
            }}
            className="absolute inset-0 flex flex-col items-center justify-center p-4 cursor-crosshair z-0 bg-slate-900 text-white"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 animate-pulse">
              <Compass className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold">Interactive Radar Map Ready</p>
            <p className="text-[10px] text-gray-400 mt-1">
              Click anywhere on the grid to drop the exact city destination pin.
            </p>
          </div>
        )}

        {/* Overlay instructions pill */}
        <div className="absolute bottom-2.5 left-2.5 z-20 pointer-events-none bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-white text-[10px] flex items-center gap-1.5 shadow-sm">
          <Move className="w-3 h-3 text-[#ff7a00]" />
          <span>Click anywhere or drag the orange pin to place destination</span>
        </div>
      </div>
    </div>
  )
}

