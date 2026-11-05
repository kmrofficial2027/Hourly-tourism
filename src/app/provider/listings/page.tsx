'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Compass,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  CheckCircle2,
  Clock,
  MapPin,
  Image as ImageIcon,
  AlertTriangle,
  Car,
  Bike,
  Truck,
  ExternalLink,
  Sparkles,
  Timer,
  AlertCircle,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { showToast } from '@/components/ui/Toast'
import { formatCurrency, normalizeListingImages, formatDate } from '@/lib/utils'

export default function ProviderListingsPage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tabFilter, setTabFilter] = useState<'all' | 'active' | 'rejected' | 'inactive'>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: string; title: string; isExpired?: boolean } | null>(null)
  const [purgingExpired, setPurgingExpired] = useState(false)

  const loadListings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/services?scope=provider')
      if (res.ok) {
        const data = await res.json()
        setListings(data.listings || [])
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

  const handleDeleteListing = async () => {
    if (!deleteConfirmItem) return
    const id = deleteConfirmItem.id
    setDeletingId(id)

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        showToast.success('Listing deleted. Past booking and transaction records are safely preserved.')
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

  // Purge all expired listings
  const handlePurgeAllExpired = async () => {
    const expired = listings.filter((l) => l.is_expired || l.status === 'inactive')
    if (expired.length === 0) return

    if (!window.confirm(`Purge ${expired.length} expired listings from database? Past rides and transactions will remain safe in your portal.`)) {
      return
    }

    setPurgingExpired(true)
    try {
      let count = 0
      for (const item of expired) {
        const res = await fetch(`/api/services/${item.id}`, { method: 'DELETE' })
        if (res.ok) count++
      }
      showToast.success(`Purged ${count} expired listings. All transaction and ride details remain safe.`)
      loadListings()
    } catch {
      showToast.error('Error during purge.')
    } finally {
      setPurgingExpired(false)
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

  // Partition listings
  const activeListings = listings.filter((l) => !l.is_expired && l.status === 'active')
  const rejectedListings = listings.filter((l) => l.status === 'rejected')
  const inactiveOrExpiredListings = listings.filter(
    (l) => l.status !== 'rejected' && (l.is_expired || l.status !== 'active')
  )

  const displayedListings =
    tabFilter === 'active'
      ? activeListings
      : tabFilter === 'rejected'
      ? rejectedListings
      : tabFilter === 'inactive'
      ? inactiveOrExpiredListings
      : listings

  return (
    <DashboardLayout role="provider" title="My Service Listings">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-display">Manage Hourly Listings</h1>
            <p className="text-xs text-gray-500">
              Manage your vehicles, active operational hours, planned routes, and moderation status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {inactiveOrExpiredListings.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePurgeAllExpired}
                disabled={purgingExpired}
                className="rounded-2xl text-xs font-bold border-amber-300 text-amber-800 hover:bg-amber-50"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1 text-amber-600" />
                {purgingExpired ? 'Purging...' : `Purge Expired (${inactiveOrExpiredListings.length})`}
              </Button>
            )}

            <Link href="/provider/listings/new">
              <Button variant="primary" size="md" className="rounded-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 border-none">
                <Plus className="w-4 h-4 mr-1.5" />
                Add New Listing
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Filters: All, Active, Rejected, Inactive/Expired */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
          <button
            onClick={() => setTabFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              tabFilter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            All Listings ({listings.length})
          </button>
          <button
            onClick={() => setTabFilter('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              tabFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Active Live ({activeListings.length})</span>
          </button>
          <button
            onClick={() => setTabFilter('rejected')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              tabFilter === 'rejected'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-300" />
            <span>Rejected ({rejectedListings.length})</span>
          </button>
          <button
            onClick={() => setTabFilter('inactive')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              tabFilter === 'inactive'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Expired / Inactive ({inactiveOrExpiredListings.length})</span>
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-gray-400">
            <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#0a4d29] animate-spin mx-auto mb-3" />
            Loading your listings...
          </div>
        ) : displayedListings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <Compass className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-900 text-lg">
              {tabFilter === 'rejected'
                ? 'No Rejected Listings'
                : tabFilter === 'inactive'
                ? 'No Expired or Inactive Listings'
                : 'No Listings Found'}
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {tabFilter === 'rejected'
                ? 'None of your listings have been rejected by the admin team. All compliant listings are active.'
                : tabFilter === 'inactive'
                ? 'All your listings are currently active and running live on the marketplace.'
                : 'Create hourly listings with planned tourist routes and vehicle photos to receive bookings.'}
            </p>
            {tabFilter === 'all' && (
              <Link href="/provider/listings/new">
                <Button variant="primary">Create Your First Listing</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedListings.map((item) => {
              const images: string[] = normalizeListingImages(item.images, item.category)
              const primaryImage = images[0]
              const isRejected = item.status === 'rejected'
              const isExpired = !isRejected && (item.is_expired || item.status === 'inactive')
              const unseenCount = item.unseen_spots?.length || 0
              const hiddenCount = item.hidden_spots?.length || 0

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl overflow-hidden border shadow-sm hover:shadow-md transition-all flex flex-col justify-between group ${
                    isRejected
                      ? 'border-rose-300 bg-rose-50/20'
                      : isExpired
                      ? 'border-amber-200 opacity-90'
                      : 'border-gray-100'
                  }`}
                >
                  <div>
                    {/* Vehicle Photo Container */}
                    <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                      <img
                        src={primaryImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

                      {/* Category Badge */}
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/95 text-emerald-800 shadow-sm flex items-center gap-1.5">
                        {getCategoryIcon(item.category)}
                        {item.category?.replace(/_/g, ' ')}
                      </span>

                      {/* Status / Expiry Badge */}
                      <span
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm flex items-center gap-1 ${
                          isRejected
                            ? 'bg-rose-600 text-white'
                            : isExpired
                            ? 'bg-red-600 text-white'
                            : item.active_until
                            ? 'bg-blue-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isRejected ? (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Rejected (Offline)</span>
                          </>
                        ) : isExpired ? (
                          <>
                            <AlertCircle className="w-3 h-3" />
                            <span>Expired</span>
                          </>
                        ) : item.active_until ? (
                          <>
                            <Timer className="w-3 h-3" />
                            <span>Timed Active</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-ping" />
                            <span>Active Live</span>
                          </>
                        )}
                      </span>

                      {/* Photo Gallery Count Pill */}
                      {images.length > 1 && (
                        <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 backdrop-blur-sm text-white flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          {images.length} photos
                        </span>
                      )}

                      {/* Expiry Countdown / Date Tag */}
                      {item.active_until && !isRejected && (
                        <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 backdrop-blur-sm text-white flex items-center gap-1">
                          <Clock className="w-3 h-3 text-orange-400" />
                          {isExpired
                            ? `Expired on ${new Date(item.active_until).toLocaleDateString()}`
                            : `Live until ${new Date(item.active_until).toLocaleDateString()}`}
                        </span>
                      )}
                    </div>

                    {/* Listing Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-bold text-base text-gray-900 line-clamp-1 group-hover:text-emerald-700 transition-colors font-display">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                          {item.short_description || item.description || 'Hourly tourist transport with verified driver.'}
                        </p>
                      </div>

                      {/* Creative Tourist Spots Badge */}
                      {(unseenCount > 0 || hiddenCount > 0) && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {hiddenCount > 0 && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-orange-500" />
                              {hiddenCount} Hidden Gems
                            </span>
                          )}
                          {unseenCount > 0 && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <Compass className="w-3 h-3 text-emerald-600" />
                              {unseenCount} Unseen Spots
                            </span>
                          )}
                        </div>
                      )}

                      {/* Location & Minimum Booking */}
                      <div className="flex items-center space-x-3 text-xs text-gray-400 pt-1">
                        <span className="flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          {item.destination_city || 'Coimbatore'}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          Min {item.min_booking_hours || 1} hr
                        </span>
                      </div>
                    </div>

                    {/* Rejection Feedback Box if Rejected */}
                    {isRejected && (
                      <div className="p-4 mx-5 mb-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1.5">
                        <div className="font-bold flex items-center gap-1.5 text-rose-800">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Listing Rejected by Admin (Removed from Marketplace)</span>
                        </div>
                        <p className="pl-5 text-rose-950 font-medium leading-relaxed">
                          {item.rejection_reason || 'This listing does not meet platform standards or details require revision. Please update details to resubmit.'}
                        </p>
                        {item.rejected_at && (
                          <span className="text-[10px] text-rose-600 block pl-5 pt-0.5">
                            Feedback sent on {formatDate(item.rejected_at)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="p-5 pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Hourly Rate
                      </span>
                      <span className="text-base font-black text-emerald-700">
                        {formatCurrency(Number(item.hourly_rate))}
                        <span className="text-xs font-normal text-gray-400">/hr</span>
                      </span>
                    </div>

                    {/* Actions: View, Edit/Fix, Delete */}
                    <div className="flex items-center space-x-2">
                      {!isRejected && (
                        <Link href={`/services/${item.id}`} target="_blank">
                          <Button variant="secondary" size="sm" title="View Public Listing">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      )}

                      <Link href={`/provider/listings/${item.id}/edit`}>
                        <Button
                          variant={isRejected ? 'primary' : 'outline'}
                          size="sm"
                          className={
                            isRejected
                              ? 'bg-rose-600 hover:bg-rose-700 text-white font-bold'
                              : 'hover:border-emerald-500 hover:text-emerald-700'
                          }
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          {isRejected ? 'Fix & Resubmit' : 'Edit'}
                        </Button>
                      </Link>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setDeleteConfirmItem({
                            id: item.id,
                            title: item.title,
                            isExpired,
                          })
                        }
                        className="text-rose-600 hover:bg-rose-50"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
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
                  Past bookings and transactions will remain safely recorded in your earnings.
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
