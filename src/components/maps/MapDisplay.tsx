import React from 'react'
import { MapPin, Navigation, Info } from 'lucide-react'

export interface MapDisplayProps {
  latitude?: number | null
  longitude?: number | null
  address?: string | null
  city?: string | null
  zoom?: number
  height?: string
  className?: string
}

export function MapDisplay({
  latitude,
  longitude,
  address,
  city,
  zoom = 14,
  height = '320px',
  className = '',
}: MapDisplayProps) {
  const apiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY

  const locationQuery = encodeURIComponent(
    address || city || (latitude && longitude ? `${latitude},${longitude}` : 'India')
  )

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border border-gray-200 bg-gray-100 flex flex-col justify-between ${className}`}
      style={{ height }}
    >
      {apiKey ? (
        <>
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${locationQuery}&zoom=${zoom}`}
            allowFullScreen
            loading="lazy"
            title="Service Location Map"
          />
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${locationQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-3 z-10 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-md text-xs font-bold text-gray-800 hover:text-[#ff7a00] border border-gray-200 hover:border-orange-300 transition-all"
          >
            <Navigation className="w-3.5 h-3.5 text-[#ff7a00]" />
            <span>Open Directions ↗</span>
          </a>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-gray-50 to-gray-100">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 shadow-sm">
            <MapPin className="w-7 h-7" />
          </div>

          <h4 className="text-base font-bold text-gray-900 mb-1">
            {address || city || 'Location Coordinates'}
          </h4>

          {city && <p className="text-xs text-emerald-700 font-semibold mb-2">{city}</p>}

          <div className="max-w-xs p-3 rounded-2xl bg-white/80 border border-gray-200 text-left text-xs text-gray-500 space-y-1">
            <div className="flex items-center text-gray-700 font-medium">
              <Navigation className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              <span>Meeting & Service Area</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Interactive map preview active when <code className="text-emerald-600">NEXT_PUBLIC_MAPS_API_KEY</code> is configured.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

