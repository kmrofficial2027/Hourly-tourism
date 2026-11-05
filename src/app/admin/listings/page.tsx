'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Compass,
  Check,
  X,
  XCircle,
  Eye,
  ShieldCheck,
  RefreshCw,
  Edit,
  Trash2,
  AlertTriangle,
  Car,
  Bike,
  Truck,
  Image as ImageIcon,
  Save,
  MapPin,
  AlertCircle,
  Search,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { showToast } from '@/components/ui/Toast'
import { formatCurrency, normalizeListingImages } from '@/lib/utils'

export default function AdminListingsPage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingListing, setEditingListing] = useState<any | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: string; title: string } | null>(null)
  const [availableCities, setAvailableCities] = useState<string[]>(['Coimbatore'])

  // Status Moderation State
  const [rejectingItem, setRejectingItem] = useState<{ id: string; title: string; providerName: string } | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [submittingStatus, setSubmittingStatus] = useState<string | null>(null)
  const [adminTabFilter, setAdminTabFilter] = useState<'all' | 'active' | 'rejected' | 'inactive'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const loadListings = async () => {
    setLoading(true)
    try {
      const [listingsRes, destinationsRes] = await Promise.all([
        fetch('/api/services?scope=admin&all=true'),
        fetch(`/api/destinations?t=${Date.now()}`, { cache: 'no-store' }),
      ])

      if (listingsRes.ok) {
        const data = await listingsRes.json()
        setListings(data.listings || [])
      }

      if (destinationsRes.ok) {
        const destData = await destinationsRes.json()
        if (destData.cities && Array.isArray(destData.cities)) {
          setAvailableCities(destData.cities.map((c: any) => c.name))
        }
      }
    } catch (err) {
      console.error(err)
      showToast.error('Failed to load listings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadListings()
  }, [])

  // Quick 1-click Status Change (Active vs Rejected)
  const handleQuickStatusChange = async (
    listingId: string,
    title: string,
    newStatus: 'active' | 'rejected',
    reason?: string
  ) => {
    setSubmittingStatus(listingId)
    try {
      const res = await fetch(`/api/services/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          rejectionReason: reason,
        }),
      })

      if (res.ok) {
        if (newStatus === 'active') {
          showToast.success(`"${title}" is now ACTIVE and published to live marketplace!`)
        } else {
          showToast.success(`"${title}" has been REJECTED, taken offline, and moved to provider's Rejected tab.`)
        }
        setRejectingItem(null)
        setRejectionReason('')
        await loadListings()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast.error(err.error || 'Failed to update listing status')
      }
    } catch (err: any) {
      showToast.error(err.message || 'Error updating status')
    } finally {
      setSubmittingStatus(null)
    }
  }

  // Handle Admin Save Edit (Full Modal)
  const handleSaveListingEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingListing) return
    setSavingEdit(true)

    try {
      const res = await fetch(`/api/services/${editingListing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingListing.title,
          description: editingListing.description,
          shortDescription: editingListing.short_description,
          category: editingListing.category,
          destinationCity: editingListing.destination_city,
          hourlyRate: Number(editingListing.hourly_rate),
          minBookingHours: Number(editingListing.min_booking_hours || 1),
          status: editingListing.status,
          rejectionReason: editingListing.rejection_reason,
          images: editingListing.images,
          vehicleDetails: editingListing.vehicle_details
            ? {
                vehicleType: editingListing.category,
                make: editingListing.vehicle_details.make,
                model: editingListing.vehicle_details.model,
                year: editingListing.vehicle_details.year ? Number(editingListing.vehicle_details.year) : undefined,
                licensePlate: editingListing.vehicle_details.license_plate,
                seatingCapacity: Number(editingListing.vehicle_details.seating_capacity || 4),
                fuelType: editingListing.vehicle_details.fuel_type || 'Petrol',
              }
            : undefined,
        }),
      })

      if (res.ok) {
        showToast.success('Listing updated successfully by Admin')
        setEditingListing(null)
        await loadListings()
      } else {
        const errData = await res.json().catch(() => ({}))
        showToast.error(errData.error || 'Failed to update listing')
      }
    } catch (err: any) {
      console.error(err)
      showToast.error(err.message || 'Error updating listing')
    } finally {
      setSavingEdit(false)
    }
  }

  // Handle Admin Delete
  const handleDeleteListing = async () => {
    if (!deleteConfirmItem) return
    const id = deleteConfirmItem.id
    setDeletingId(id)

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        showToast.success('Listing permanently deleted by Admin')
        setListings((prev) => prev.filter((item) => item.id !== id))
        setDeleteConfirmItem(null)
      } else {
        const errorData = await res.json().catch(() => ({}))
        showToast.error(errorData.error || 'Failed to delete listing')
      }
    } catch (err: any) {
      console.error(err)
      showToast.error(err.message || 'Error deleting listing')
    } finally {
      setDeletingId(null)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'bike':
        return <Bike className="w-3.5 h-3.5 text-amber-600" />
      case 'van':
        return <Truck className="w-3.5 h-3.5 text-blue-600" />
      default:
        return <Car className="w-3.5 h-3.5 text-emerald-600" />
    }
  }

  // Filter listings
  const filteredListings = listings.filter((item) => {
    if (adminTabFilter === 'active' && item.status !== 'active') return false
    if (adminTabFilter === 'rejected' && item.status !== 'rejected') return false
    if (adminTabFilter === 'inactive' && (item.status === 'active' || item.status === 'rejected')) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchTitle = item.title?.toLowerCase().includes(q)
      const matchCity = item.destination_city?.toLowerCase().includes(q)
      const matchProvider = (item.provider?.business_name || item.provider?.profiles?.full_name)?.toLowerCase().includes(q)
      if (!matchTitle && !matchCity && !matchProvider) return false
    }
    return true
  })

  const activeCount = listings.filter((l) => l.status === 'active').length
  const rejectedCount = listings.filter((l) => l.status === 'rejected').length
  const otherCount = listings.filter((l) => l.status !== 'active' && l.status !== 'rejected').length

  return (
    <DashboardLayout role="admin" title="Listings Moderation & Full Control">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-800 border border-purple-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-purple-700" /> Catalog Moderation Authority
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 font-display">
              Listings Moderation & Full Control
            </h1>
            <p className="text-xs text-gray-500">
              Admin authority to inspect, set active status, reject non-compliant listings, or edit specifications.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadListings} disabled={loading} className="rounded-xl">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Transport Restriction Policy Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center space-x-3 text-xs text-emerald-800">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>
            <strong>Enforced Transport Category Rule:</strong> The platform strictly permits only{' '}
            <strong>Bike, Car, and Van</strong>. All rejected listings are taken offline immediately and moved into the provider's Rejected tab.
          </span>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-gray-100 p-1 rounded-2xl">
              <button
                onClick={() => setAdminTabFilter('all')}
                className={`px-3.5 py-1 text-xs font-bold rounded-xl transition-all ${
                  adminTabFilter === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                All ({listings.length})
              </button>
              <button
                onClick={() => setAdminTabFilter('active')}
                className={`px-3.5 py-1 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  adminTabFilter === 'active'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active Live ({activeCount})
              </button>
              <button
                onClick={() => setAdminTabFilter('rejected')}
                className={`px-3.5 py-1 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  adminTabFilter === 'rejected'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <XCircle className="w-3 h-3 text-rose-300" />
                Rejected ({rejectedCount})
              </button>
              <button
                onClick={() => setAdminTabFilter('inactive')}
                className={`px-3.5 py-1 text-xs font-bold rounded-xl transition-all ${
                  adminTabFilter === 'inactive'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Draft / Inactive ({otherCount})
              </button>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search title, city, provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 bg-gray-50"
            />
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-xs text-gray-400">
              <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#0a4d29] animate-spin mx-auto mb-3" />
              Loading listings catalog...
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Compass className="w-10 h-10 text-gray-200 mx-auto" />
              <p className="text-sm font-semibold text-gray-500">No listings found in this category</p>
              <p className="text-xs text-gray-400">
                Listings created by providers will appear here for admin moderation.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Vehicle / Listing</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Provider</th>
                    <th className="p-4">City</th>
                    <th className="p-4">Hourly Rate</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {filteredListings.map((item) => {
                    const primaryImage = normalizeListingImages(item.images, item.category)[0]
                    const isValidCategory = ['bike', 'car', 'van'].includes(item.category?.toLowerCase())
                    const providerName =
                      item.provider?.business_name ||
                      item.provider?.profiles?.full_name ||
                      item.company?.company_name ||
                      'Provider'
                    const isItemActive = item.status === 'active'
                    const isItemRejected = item.status === 'rejected'

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                        {/* Listing Title & Vehicle Image */}
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={primaryImage}
                              alt={item.title}
                              className="w-12 h-10 rounded-xl object-cover bg-gray-100 border border-gray-200 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 truncate max-w-xs">{item.title}</p>
                              {item.vehicle_details && (
                                <p className="text-[11px] text-gray-400">
                                  {[item.vehicle_details.make, item.vehicle_details.model].filter(Boolean).join(' ')}
                                  {item.vehicle_details.license_plate ? ` • ${item.vehicle_details.license_plate}` : ''}
                                </p>
                              )}
                              {isItemRejected && item.rejection_reason && (
                                <p className="text-[10px] text-rose-600 font-semibold truncate max-w-xs mt-0.5">
                                  Reason: {item.rejection_reason}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-4">
                          <span className="flex items-center gap-1 uppercase text-[10px] font-bold text-gray-800">
                            {getCategoryIcon(item.category)}
                            {item.category?.replace(/_/g, ' ')}
                          </span>
                        </td>

                        {/* Provider */}
                        <td className="p-4">
                          <span className="font-semibold text-gray-900">{providerName}</span>
                          {item.provider?.profiles?.email && (
                            <span className="block text-[10px] text-gray-400">
                              {item.provider.profiles.email}
                            </span>
                          )}
                        </td>

                        {/* City */}
                        <td className="p-4 text-gray-600">{item.destination_city || 'Coimbatore'}</td>

                        {/* Rate */}
                        <td className="p-4 font-bold text-emerald-700">
                          {formatCurrency(Number(item.hourly_rate))}/hr
                        </td>

                        {/* Status Badge */}
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                              isItemActive
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isItemRejected
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {isItemActive ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Active Live
                              </>
                            ) : isItemRejected ? (
                              <>
                                <XCircle className="w-3 h-3 text-rose-600" />
                                Rejected (Offline)
                              </>
                            ) : (
                              item.status || 'Draft'
                            )}
                          </span>
                        </td>

                        {/* Admin Action Buttons */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Set Active Button */}
                            {!isItemActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickStatusChange(item.id, item.title, 'active')}
                                disabled={submittingStatus === item.id}
                                className="text-emerald-700 hover:bg-emerald-50 border-emerald-300 font-bold text-xs rounded-xl"
                                title="Set Active (Publish to Marketplace)"
                              >
                                <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                                Set Active
                              </Button>
                            )}

                            {/* Set Rejected Button */}
                            {!isItemRejected && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setRejectingItem({ id: item.id, title: item.title, providerName })
                                  setRejectionReason('')
                                }}
                                disabled={submittingStatus === item.id}
                                className="text-rose-700 hover:bg-rose-50 border-rose-300 font-bold text-xs rounded-xl"
                                title="Set Rejected (Take Offline & Move to Provider Rejected Tab)"
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                                Reject
                              </Button>
                            )}

                            <Link href={`/services/${item.id}`} target="_blank">
                              <Button variant="secondary" size="sm" className="rounded-xl" title="View Public Listing">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </Link>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingListing(JSON.parse(JSON.stringify(item)))}
                              className="text-gray-700 hover:text-emerald-700 hover:border-emerald-500 rounded-xl"
                              title="Edit Listing as Admin"
                            >
                              <Edit className="w-3.5 h-3.5 mr-1" />
                              Edit
                            </Button>

                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setDeleteConfirmItem({ id: item.id, title: item.title })}
                              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl"
                              title="Delete Listing as Admin"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Reject Modal */}
        {rejectingItem && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base font-display">
                      Reject Listing & Take Offline
                    </h3>
                    <p className="text-xs text-gray-500">
                      Removed from public marketplace • Visible in provider's Rejected tab
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setRejectingItem(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/60 text-xs space-y-1">
                <div>Listing: <strong className="text-gray-900">{rejectingItem.title}</strong></div>
                <div>Host: <strong className="text-gray-900">{rejectingItem.providerName}</strong></div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Select or Type Rejection Feedback for Host:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {[
                    'Vehicle photos unclear or blurred',
                    'Registration plate does not match vehicle specs',
                    'Hourly rate exceeds platform category guidelines',
                    'Safety equipment / insurance documents missing',
                    'Operating outside active launch city boundaries',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectionReason(preset)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition ${
                        rejectionReason === preset
                          ? 'bg-rose-100 border-rose-300 text-rose-800'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-rose-200 hover:bg-rose-50/50'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this listing is being rejected so the provider can rectify and resubmit..."
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-rose-500 bg-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setRejectingItem(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() =>
                    handleQuickStatusChange(
                      rejectingItem.id,
                      rejectingItem.title,
                      'rejected',
                      rejectionReason || 'Listing rejected during moderation. Please update vehicle details to resubmit.'
                    )
                  }
                  disabled={submittingStatus === rejectingItem.id}
                  className="bg-rose-600 hover:bg-rose-700 font-bold"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1.5" />
                  Confirm Rejection & Take Offline
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Edit Listing Modal */}
        {editingListing && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg font-display">
                    Admin Listing Editor
                  </h3>
                  <p className="text-xs text-gray-500">
                    Modify listing details, hourly price, transport specs, and publication status.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveListingEdit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Listing Title</label>
                  <input
                    type="text"
                    required
                    value={editingListing.title || ''}
                    onChange={(e) => setEditingListing({ ...editingListing, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Category & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Transport Category (Strict Policy)
                    </label>
                    <select
                      value={editingListing.category || 'car'}
                      onChange={(e) => setEditingListing({ ...editingListing, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                    >
                      <option value="bike">Bike (Motorcycle / Scooter)</option>
                      <option value="car">Car (Sedan / Hatchback / SUV)</option>
                      <option value="van">Van (Tempo Traveller / Minivan)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Operating City (Admin Controlled)
                    </label>
                    <select
                      value={editingListing.destination_city || 'Coimbatore'}
                      onChange={(e) =>
                        setEditingListing({ ...editingListing, destination_city: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                    >
                      {availableCities.map((cityName) => (
                        <option key={cityName} value={cityName}>
                          {cityName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Hourly Rate & Min Hours & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Hourly Rate (₹)</label>
                    <input
                      type="number"
                      min="50"
                      step="10"
                      required
                      value={editingListing.hourly_rate || ''}
                      onChange={(e) =>
                        setEditingListing({ ...editingListing, hourly_rate: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Min Booking Hours
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={editingListing.min_booking_hours || 1}
                      onChange={(e) =>
                        setEditingListing({ ...editingListing, min_booking_hours: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Publication Status</label>
                    <select
                      value={editingListing.status || 'active'}
                      onChange={(e) => setEditingListing({ ...editingListing, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                    >
                      <option value="active">Active (Live in Marketplace)</option>
                      <option value="rejected">Rejected (Offline & in Provider Rejected Tab)</option>
                      <option value="draft">Draft (Hidden)</option>
                      <option value="inactive">Suspended / Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Rejection Feedback if Rejected */}
                {editingListing.status === 'rejected' && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                    <label className="block text-xs font-bold text-rose-800">
                      Rejection Feedback to Host:
                    </label>
                    <textarea
                      rows={2}
                      value={editingListing.rejection_reason || ''}
                      onChange={(e) =>
                        setEditingListing({ ...editingListing, rejection_reason: e.target.value })
                      }
                      placeholder="Explain why this listing is rejected so host can address and resubmit..."
                      className="w-full p-2.5 rounded-xl border border-rose-200 text-xs text-gray-900 bg-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                )}

                {/* Vehicle Details Sub-form */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                  <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider">
                    Vehicle Specifications
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Make</label>
                      <input
                        type="text"
                        placeholder="e.g. Toyota"
                        value={editingListing.vehicle_details?.make || ''}
                        onChange={(e) =>
                          setEditingListing({
                            ...editingListing,
                            vehicle_details: {
                              ...editingListing.vehicle_details,
                              make: e.target.value,
                            },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Model</label>
                      <input
                        type="text"
                        placeholder="e.g. Innova Crysta"
                        value={editingListing.vehicle_details?.model || ''}
                        onChange={(e) =>
                          setEditingListing({
                            ...editingListing,
                            vehicle_details: {
                              ...editingListing.vehicle_details,
                              model: e.target.value,
                            },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Year</label>
                      <input
                        type="number"
                        placeholder="2023"
                        value={editingListing.vehicle_details?.year || ''}
                        onChange={(e) =>
                          setEditingListing({
                            ...editingListing,
                            vehicle_details: {
                              ...editingListing.vehicle_details,
                              year: e.target.value,
                            },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">License Plate</label>
                      <input
                        type="text"
                        placeholder="TN 38 AB 1234"
                        value={editingListing.vehicle_details?.license_plate || ''}
                        onChange={(e) =>
                          setEditingListing({
                            ...editingListing,
                            vehicle_details: {
                              ...editingListing.vehicle_details,
                              license_plate: e.target.value,
                            },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editingListing.description || ''}
                    onChange={(e) => setEditingListing({ ...editingListing, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setEditingListing(null)}
                    disabled={savingEdit}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" isLoading={savingEdit}>
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save & Update Listing
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmItem && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="font-bold text-gray-900 text-base">Permanently Delete Listing?</h4>
                <p className="text-xs text-gray-500">
                  Are you sure you want to delete <strong className="text-gray-800">"{deleteConfirmItem.title}"</strong>?
                  This action is permanent.
                </p>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Button
                  variant="secondary"
                  className="w-1/2"
                  onClick={() => setDeleteConfirmItem(null)}
                  disabled={deletingId !== null}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  className="w-1/2"
                  onClick={handleDeleteListing}
                  isLoading={deletingId !== null}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
