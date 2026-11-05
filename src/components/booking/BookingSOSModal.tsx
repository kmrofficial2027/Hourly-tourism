'use client'

import React, { useState } from 'react'
import { AlertTriangle, PhoneCall, ShieldAlert, Check, MapPin, Shield } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { showToast } from '@/components/ui/Toast'

export interface BookingSOSModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  bookingNumber: string
}

export function BookingSOSModal({
  isOpen,
  onClose,
  bookingId,
  bookingNumber,
}: BookingSOSModalProps) {
  const [triggered, setTriggered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [coords, setCoords] = useState<{ lat?: number; lng?: number } | null>(null)

  const handleTriggerSOS = async () => {
    setLoading(true)

    // Capture device coordinates if available
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setCoords({ lat, lng })
          await sendSOSPayload(lat, lng)
        },
        async () => {
          await sendSOSPayload()
        },
        { timeout: 5000 }
      )
    } else {
      await sendSOSPayload()
    }
  }

  const sendSOSPayload = async (lat?: number, lng?: number) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: lat || 11.0168,
          longitude: lng || 76.9558,
          timestamp: new Date().toISOString(),
        }),
      })

      if (res.ok) {
        setTriggered(true)
        showToast.success('Emergency SOS Activated. Support team and emergency contacts alerted.')
      } else {
        showToast.error('Could not activate SOS alert. Please dial 112 directly.')
      }
    } catch {
      showToast.error('Network failure. Please dial emergency 112 directly.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Emergency SOS & Trip Safety">
      <div className="space-y-5">
        {!triggered ? (
          <>
            <div className="p-4 rounded-3xl bg-red-50 border border-red-200 text-red-950 space-y-2">
              <div className="flex items-center space-x-2 text-red-700 font-black text-sm uppercase tracking-wide">
                <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce" />
                <span>Immediate Safety Alert</span>
              </div>
              <p className="text-xs leading-relaxed text-red-900">
                Triggering SOS shares your live GPS location with the Hourly Tourism emergency response team,
                notifies your registered emergency contact, and opens an immediate priority incident record.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-700 flex items-center justify-between">
              <div>
                <span className="font-bold block">Active Police & Ambulance Helpline</span>
                <span className="text-[11px] text-gray-500">National Emergency Support: 112</span>
              </div>
              <a
                href="tel:112"
                className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center space-x-1 shadow-md hover:bg-red-700"
              >
                <PhoneCall className="w-3.5 h-3.5 mr-1" />
                Call 112
              </a>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3 border-t border-gray-100">
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                isLoading={loading}
                onClick={handleTriggerSOS}
                className="bg-red-600 hover:bg-red-700 text-white font-black px-6"
              >
                Trigger SOS Alert
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-gray-900">
                SOS Beacon Active
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Incident logged for Booking #{bookingNumber}. Support coordinators are dispatching assistance and contacting you on your registered phone.
              </p>
            </div>

            <div className="p-3 bg-red-50 rounded-2xl text-xs font-bold text-red-800">
              Emergency Response Team: +91 94420 00000
            </div>

            <Button variant="secondary" fullWidth onClick={onClose}>
              Dismiss Alert Screen
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

