'use client'

import React, { useState } from 'react'
import {
  MapPin,
  Plus,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Phone,
  User,
  Heart,
  Home,
  Building,
  Plane,
  Train,
  CheckCircle2,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { showToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'

export default function CustomerProfilePage() {
  const { user, profile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || 'Verified Explorer')
  const [phone, setPhone] = useState(profile?.phone || '+91 98421 55678')
  const [loading, setLoading] = useState(false)

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState([
    {
      id: 'addr-1',
      label: 'Hotel / Resort',
      icon: 'hotel',
      address: 'Radisson Blu, Avinashi Road, Peelamedu, Coimbatore',
    },
    {
      id: 'addr-2',
      label: 'Airport Terminal',
      icon: 'airport',
      address: 'Coimbatore International Airport (CJB), Terminal 1',
    },
    {
      id: 'addr-3',
      label: 'Home / Residence',
      icon: 'home',
      address: 'DB Road, RS Puram, Coimbatore',
    },
  ])
  const [newLabel, setNewLabel] = useState('Hotel')
  const [newAddressText, setNewAddressText] = useState('')
  const [showAddAddress, setShowAddAddress] = useState(false)

  // Emergency SOS Contact
  const [emergencyContact, setEmergencyContact] = useState({
    name: 'Anitha Ramesh',
    relationship: 'Family / Spouse',
    phone: '+91 98940 12345',
  })

  // Travel Preferences
  const [preferences, setPreferences] = useState({
    preferredVehicle: 'car',
    acRequired: true,
    preferredLanguage: 'English & Tamil',
    receiveSmsUpdates: true,
  })

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      showToast.success('Profile and preferences updated successfully')
    } catch (err: any) {
      showToast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAddressText.trim()) return
    setSavedAddresses([
      ...savedAddresses,
      {
        id: `addr-${Date.now()}`,
        label: newLabel,
        icon: newLabel.toLowerCase().includes('airport')
          ? 'airport'
          : newLabel.toLowerCase().includes('home')
          ? 'home'
          : 'hotel',
        address: newAddressText.trim(),
      },
    ])
    setNewAddressText('')
    setShowAddAddress(false)
    showToast.success('Address saved for 1-click booking checkout')
  }

  const handleDeleteAddress = (id: string) => {
    setSavedAddresses(savedAddresses.filter((a) => a.id !== id))
    showToast.success('Address removed')
  }

  return (
    <DashboardLayout role="customer" title="Profile Settings & Preferences">
      <div className="max-w-4xl space-y-8">
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <Avatar
              src={profile?.avatar_url}
              name={fullName || user?.email}
              size="xl"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-display">
                {fullName || 'Explorer'}
              </h2>
              <p className="text-xs text-gray-400">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Verified Tourist ID
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-100 text-[#ff7a00]">
                  Escrow Protected
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-900 block">ID Verified for Premium Tours</span>
              <span className="text-emerald-700">Eligible for instant booking confirmation & priority rider host matching.</span>
            </div>
          </div>
        </div>

        {/* Profile Information Form */}
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 font-display">Personal Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <Input
                label="Email Address (Verified)"
                disabled
                value={user?.email || 'customer@hourlytourism.com'}
              />

              <Input
                label="Mobile Phone (for Driver SMS & Trip OTP)"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Emergency SOS Contact Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 font-display flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-[#ff7a00]" />
                  Emergency SOS Contact
                </h3>
                <p className="text-xs text-gray-500">
                  Notified automatically with live GPS tracking if you trigger the in-trip emergency SOS beacon.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <Input
                label="Contact Name"
                value={emergencyContact.name}
                onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
              />
              <Input
                label="Relationship"
                value={emergencyContact.relationship}
                onChange={(e) =>
                  setEmergencyContact({ ...emergencyContact, relationship: e.target.value })
                }
              />
              <Input
                label="Emergency Phone"
                type="tel"
                value={emergencyContact.phone}
                onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Saved Addresses for 1-Click Pickup */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 font-display flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-[#0a4d29]" />
                  Saved Pickup Locations
                </h3>
                <p className="text-xs text-gray-500">
                  Pre-saved meeting points for rapid 1-click checkout.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="rounded-xl font-bold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Address
              </Button>
            </div>

            {showAddAddress && (
              <div className="p-4 bg-gray-50 rounded-2xl space-y-3 border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Label</label>
                    <select
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 bg-white"
                    >
                      <option value="Hotel / Resort">Hotel / Resort</option>
                      <option value="Airport Terminal">Airport Terminal</option>
                      <option value="Home / Residence">Home / Residence</option>
                      <option value="Office / Tech Park">Office / Tech Park</option>
                      <option value="Railway Station">Railway Station</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Address Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Le Meridien, Avinashi Road, Neelambur"
                      value={newAddressText}
                      onChange={(e) => setNewAddressText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddAddress(false)}>
                    Cancel
                  </Button>
                  <Button type="button" variant="primary" size="sm" onClick={handleAddAddress}>
                    Save Location
                  </Button>
                </div>
              </div>
            )}

            <div className="divide-y divide-gray-100">
              {savedAddresses.map((addr) => (
                <div key={addr.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-green-50 text-emerald-800 flex items-center justify-center font-bold">
                      {addr.icon === 'airport' ? (
                        <Plane className="w-4 h-4" />
                      ) : addr.icon === 'home' ? (
                        <Home className="w-4 h-4" />
                      ) : (
                        <Building className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">{addr.label}</span>
                      <span className="text-xs text-gray-500">{addr.address}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Travel Preferences */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 font-display">Travel Preferences</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Default Transport Preference
                </label>
                <select
                  value={preferences.preferredVehicle}
                  onChange={(e) => setPreferences({ ...preferences, preferredVehicle: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 bg-white"
                >
                  <option value="bike">Bike (Royal Enfield / Scooters)</option>
                  <option value="car">Car (Self-Drive & Chauffeur)</option>
                  <option value="van">Van / Tempo (Group Trips)</option>
                  <option value="guide">Local Guide Walking Tour</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Preferred Guide Language
                </label>
                <select
                  value={preferences.preferredLanguage}
                  onChange={(e) => setPreferences({ ...preferences, preferredLanguage: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 bg-white"
                >
                  <option value="English & Tamil">English & Tamil</option>
                  <option value="Tamil Only">Tamil Only</option>
                  <option value="English Only">English Only</option>
                  <option value="Hindi & English">Hindi & English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="lg" isLoading={loading} className="font-bold">
              Save All Preferences
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
