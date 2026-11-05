'use client'

import React, { useState, useEffect } from 'react'
import {
  Star,
  Check,
  X,
  MessageSquare,
  Trash2,
  RefreshCw,
  FileSpreadsheet,
  Flag,
  Plus,
  Sparkles,
  Edit2,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { showToast } from '@/components/ui/Toast'
import { exportToCSV } from '@/lib/exportUtils'
import { DEFAULT_HOMEPAGE_REVIEWS, HomepageShowcaseReview } from '@/lib/homepageReviews'

export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState<'showcase' | 'live_moderation'>('showcase')

  // Live customer reviews state
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Homepage showcase reviews state
  const [showcaseReviews, setShowcaseReviews] = useState<HomepageShowcaseReview[]>(DEFAULT_HOMEPAGE_REVIEWS)
  const [showcaseLoading, setShowcaseLoading] = useState(true)
  const [showcaseSaving, setShowcaseSaving] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingReview, setEditingReview] = useState<HomepageShowcaseReview | null>(null)

  // Form state for adding/editing review
  const [formName, setFormName] = useState('')
  const [formCity, setFormCity] = useState('')
  const [formRole, setFormRole] = useState('Weekend Traveler')
  const [formRating, setFormRating] = useState(5)
  const [formService, setFormService] = useState('')
  const [formComment, setFormComment] = useState('')

  const loadLiveReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reviews')
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadShowcaseReviews = async () => {
    setShowcaseLoading(true)
    try {
      const res = await fetch(`/api/homepage-reviews?t=${Date.now()}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.reviews) && data.reviews.length > 0) {
          setShowcaseReviews(data.reviews)
        }
      }
    } catch (err) {
      console.error('Error loading showcase reviews:', err)
    } finally {
      setShowcaseLoading(false)
    }
  }

  useEffect(() => {
    loadLiveReviews()
    loadShowcaseReviews()
  }, [])

  const handleSaveShowcaseReviews = async (updatedList?: HomepageShowcaseReview[]) => {
    const listToSave = updatedList || showcaseReviews
    setShowcaseSaving(true)
    try {
      const res = await fetch('/api/homepage-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews: listToSave }),
      })
      if (res.ok) {
        showToast.success('Homepage showcase reviews updated successfully!')
        setShowcaseReviews(listToSave)
      } else {
        const data = await res.json().catch(() => ({}))
        showToast.error(data.error || 'Failed to update reviews')
      }
    } catch (err: any) {
      showToast.error(err.message || 'Error saving reviews')
    } finally {
      setShowcaseSaving(false)
    }
  }

  const handleOpenAddModal = (rev?: HomepageShowcaseReview) => {
    if (rev) {
      setEditingReview(rev)
      setFormName(rev.name)
      setFormCity(rev.city)
      setFormRole(rev.role)
      setFormRating(rev.rating)
      setFormService(rev.service)
      setFormComment(rev.comment)
    } else {
      setEditingReview(null)
      setFormName('')
      setFormCity('Coimbatore')
      setFormRole('Weekend Traveler')
      setFormRating(5)
      setFormService('')
      setFormComment('')
    }
    setShowAddModal(true)
  }

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formComment.trim() || !formService.trim()) {
      showToast.error('Name, Service, and Comment are required')
      return
    }

    if (editingReview) {
      const updated = showcaseReviews.map((r) =>
        r.id === editingReview.id
          ? {
              ...r,
              name: formName.trim(),
              city: formCity.trim(),
              role: formRole.trim(),
              rating: formRating,
              service: formService.trim(),
              comment: formComment.trim(),
            }
          : r
      )
      setShowcaseReviews(updated)
      handleSaveShowcaseReviews(updated)
    } else {
      const newRev: HomepageShowcaseReview = {
        id: `rev-${Date.now()}`,
        name: formName.trim(),
        city: formCity.trim(),
        role: formRole.trim(),
        rating: formRating,
        service: formService.trim(),
        comment: formComment.trim(),
        is_active: true,
        display_order: showcaseReviews.length + 1,
      }
      const updated = [...showcaseReviews, newRev]
      setShowcaseReviews(updated)
      handleSaveShowcaseReviews(updated)
    }

    setShowAddModal(false)
  }

  const handleDeleteShowcaseReview = (id: string) => {
    if (!confirm('Are you sure you want to delete this showcase review?')) return
    const updated = showcaseReviews.filter((r) => r.id !== id)
    setShowcaseReviews(updated)
    handleSaveShowcaseReviews(updated)
  }

  const handleToggleActiveShowcase = (id: string) => {
    const updated = showcaseReviews.map((r) =>
      r.id === id ? { ...r, is_active: !r.is_active } : r
    )
    setShowcaseReviews(updated)
    handleSaveShowcaseReviews(updated)
  }

  const handleLiveAction = async (id: string, action: 'approved' | 'hidden' | 'deleted') => {
    if (action === 'deleted') {
      try {
        await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' })
        setReviews((prev) => prev.filter((r) => r.id !== id))
        showToast.success('Review permanently removed')
      } catch {
        showToast.error('Delete failed')
      }
    } else {
      try {
        await fetch('/api/reviews', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: action }),
        })
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: action } : r)))
        showToast.success(`Review status updated to ${action}`)
      } catch {
        showToast.error('Update failed')
      }
    }
  }

  const handleExportCSV = () => {
    const columns = [
      { header: 'Review ID', key: 'id' },
      { header: 'Reviewer', key: 'reviewer_name' },
      { header: 'Rating', key: 'rating' },
      { header: 'Comment', key: 'comment' },
      { header: 'Status', key: 'status' },
      { header: 'Date', key: 'created_at' },
    ]
    exportToCSV('admin-reviews-export', reviews, columns)
  }

  return (
    <DashboardLayout role="admin" title="Reviews & Testimonials">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-display">
              Reviews & Testimonials Management
            </h1>
            <p className="text-xs text-gray-500">
              Control the showcase testimonials under "Loved by Tourists Across India" on the homepage and moderate live reviews.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {activeTab === 'showcase' ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadShowcaseReviews}
                  disabled={showcaseLoading}
                  className="rounded-xl"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${showcaseLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenAddModal()}
                  className="rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add Showcase Review
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={loadLiveReviews} disabled={loading} className="rounded-xl">
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCSV} className="rounded-xl">
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  Export CSV
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('showcase')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'showcase'
                ? 'bg-[#0a4d29] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>🌟 Homepage Showcase Reviews ({showcaseReviews.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('live_moderation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'live_moderation'
                ? 'bg-[#0a4d29] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>🛡️ Live Booking Customer Reviews ({reviews.length})</span>
          </button>
        </div>

        {/* TAB 1: HOMEPAGE SHOWCASE REVIEWS */}
        {activeTab === 'showcase' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <div className="text-xs text-emerald-900 font-medium">
                💡 <strong>Homepage Banner:</strong> These {showcaseReviews.length} reviews appear under{' '}
                <em>"Loved by Tourists Across India"</em> on the main landing page. Edit ratings, tourist quotes, or add reviews anytime.
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSaveShowcaseReviews()}
                disabled={showcaseSaving}
                className="shrink-0 rounded-xl"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {showcaseSaving ? 'Saving...' : 'Save All Changes'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showcaseReviews.map((rev) => (
                <div
                  key={rev.id}
                  className={`p-5 rounded-2xl bg-white border transition-all space-y-3 ${
                    rev.is_active ? 'border-gray-200 shadow-sm' : 'border-dashed border-gray-300 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-gray-900">{rev.name}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500">{rev.city}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                          {rev.role}
                        </span>
                      </div>

                      <div className="flex items-center text-amber-400 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleActiveShowcase(rev.id)}
                        className={`p-1.5 rounded-lg border text-xs font-bold ${
                          rev.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}
                        title={rev.is_active ? 'Visible on Homepage' : 'Hidden from Homepage'}
                      >
                        {rev.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenAddModal(rev)}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                        title="Edit Review"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteShowcaseReview(rev.id)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                        title="Delete Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-[#ff7a00]">
                    Booked: {rev.service}
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed italic bg-gray-50 p-3 rounded-xl border border-gray-100">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE BOOKING REVIEWS MODERATION */}
        {activeTab === 'live_moderation' && (
          <div>
            {loading ? (
              <div className="p-12 text-center text-xs text-gray-400">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
                <MessageSquare className="w-10 h-10 text-gray-200 mx-auto" />
                <p className="text-sm font-semibold text-gray-500">No live customer reviews yet</p>
                <p className="text-xs text-gray-400">
                  Customer reviews submitted after completed trips will appear here for moderation.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-gray-900">
                          {rev.reviewer_name || rev.profiles?.full_name || 'Anonymous'}
                        </span>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {rev.created_at ? new Date(rev.created_at).toLocaleDateString('en-IN') : '—'}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-[#0a4d29]">
                        {rev.service_listings?.title || rev.service_title || 'Service Review'}
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed italic">"{rev.comment || rev.review_text}"</p>

                      <div>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            rev.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rev.status === 'flagged'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {rev.status || 'pending'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {rev.status !== 'approved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLiveAction(rev.id, 'approved')}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </Button>
                      )}
                      {rev.status !== 'hidden' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLiveAction(rev.id, 'hidden')}
                        >
                          Hide
                        </Button>
                      )}
                      <button
                        onClick={() => handleLiveAction(rev.id, 'deleted')}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal for Adding/Editing Showcase Review */}
        {showAddModal && (
          <Modal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            title={editingReview ? 'Edit Showcase Review' : 'Add New Homepage Review'}
          >
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tourist Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Karthik Raja"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Origin City / Country
                  </label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="e.g. Coimbatore, Bengaluru, London"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Traveler Role / Persona
                  </label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Weekend Traveler, Family Trip, Backpacker"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Rating (Stars)
                  </label>
                  <select
                    value={formRating}
                    onChange={(e) => setFormRating(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:border-emerald-500 outline-none"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Service / Ride Booked *
                </label>
                <input
                  type="text"
                  required
                  value={formService}
                  onChange={(e) => setFormService(e.target.value)}
                  placeholder="e.g. Royal Enfield Hunter — 4 Hours to Marudhamalai"
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Testimonial Quote / Review *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="Tourist review text expressing satisfaction with hourly booking, local host, and trip experience..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={showcaseSaving}>
                  {editingReview ? 'Save Changes' : 'Add Review'}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}
