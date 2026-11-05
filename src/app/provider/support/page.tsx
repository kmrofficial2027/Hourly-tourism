'use client'

import React, { useState, useEffect } from 'react'
import {
  HelpCircle,
  Plus,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  LifeBuoy,
  ShieldCheck,
  Send,
  RefreshCw,
  CreditCard,
  Car,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { showToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'

export default function ProviderSupportPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Ticket Form State
  const [category, setCategory] = useState('Unpaid Overtime / Extra Hours')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('normal')
  const [bookingId, setBookingId] = useState('')

  const loadTickets = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/support/tickets')
      if (res.ok) {
        const data = await res.json()
        setTickets(data.tickets || [])
      }
    } catch (err) {
      console.error('Failed to load tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          rawCategoryName: category,
          subject,
          description,
          priority,
          bookingId,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast.success('Support ticket submitted to Admin Desk! Target SLA: Under 2 hours.')
        setShowCreateModal(false)
        setSubject('')
        setDescription('')
        setBookingId('')
        loadTickets()
      } else {
        showToast.error(data.error || 'Failed to submit ticket')
      }
    } catch (err: any) {
      showToast.error(err.message || 'Error submitting ticket')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="provider" title="Host & Driver Support Center">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-800 border border-orange-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-[#ff7a00]" /> Host Protection Desk
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 font-display">
              Host & Provider Support Desk
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Direct administrative escalation for tourist no-shows, unpaid overtime, safety disputes, and payouts.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={loadTickets} disabled={loading} className="rounded-xl">
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="rounded-xl font-bold bg-[#ff7a00] hover:bg-[#e06c00] border-none text-white shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Open Support Ticket
            </Button>
          </div>
        </div>

        {/* 3 Host Support Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#ff7a00] flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">Host Emergency Helpline</h4>
            <p className="text-xs text-gray-500">
              Immediate escalation for active rides, breakdown, or route distress.
            </p>
            <a
              href="tel:+9118002008899"
              className="text-xs font-black text-[#ff7a00] hover:underline block pt-1"
            >
              1800-200-8899 (Toll Free Priority)
            </a>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center font-bold">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">WhatsApp Host Operations</h4>
            <p className="text-xs text-gray-500">
              Live coordinator assistance for schedule adjustments and pickups.
            </p>
            <a
              href="https://wa.me/919842100000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-black text-green-700 hover:underline block pt-1"
            >
              +91 98421 00000 (Chat Now)
            </a>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">Guaranteed Escrow Payouts</h4>
            <p className="text-xs text-gray-500">
              Trip amounts are held securely in platform escrow and disbursed automatically.
            </p>
            <span className="text-xs font-black text-emerald-700 block pt-1">
              Protected Earnings Policy
            </span>
          </div>
        </div>

        {/* Existing Provider Tickets List */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 font-display">
              My Support & Resolution Tickets ({tickets.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-gray-400">Loading support cases...</div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <LifeBuoy className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-700">No support tickets raised</p>
              <p className="text-xs text-gray-400">
                Need help with a tourist no-show, overdue payout, or vehicle listing? Open a ticket above.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {tickets.map((t) => {
                const isOpen = t.status === 'open' || t.status === 'in_progress'
                const isResolved = t.status === 'resolved'
                return (
                  <div key={t.id} className="p-5 sm:p-6 hover:bg-gray-50/50 transition-colors space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-gray-400">
                            #{t.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 font-bold text-gray-700">
                            {t.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              t.priority === 'urgent'
                                ? 'bg-red-100 text-red-800'
                                : t.priority === 'high'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {t.priority}
                          </span>
                          {(t.booking_number || t.booking_id) && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">
                              Booking: {t.booking_number || t.booking?.booking_number || `BK-${t.booking_id.slice(0, 8).toUpperCase()}`}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-gray-900 mt-1">{t.subject}</h4>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          isResolved
                            ? 'bg-emerald-100 text-emerald-800'
                            : isOpen
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {isResolved ? 'Resolved by Admin' : isOpen ? 'In Review' : t.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{t.clean_description || t.description}</p>

                    {/* Admin Resolution Section if Resolved */}
                    {(t.resolution_notes || isResolved) && (
                      <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Official Admin Resolution & Verdict:</span>
                        </div>
                        <p className="text-xs text-emerald-950 font-medium pl-5 leading-relaxed">
                          {t.resolution_notes || 'Case verified and resolved by Antigravity Support Desk.'}
                        </p>
                        {t.resolved_at && (
                          <span className="text-[10px] text-emerald-700 block pl-5 pt-0.5">
                            Resolved on {formatDate(t.resolved_at)}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100">
                      <span>Submitted on {formatDate(t.created_at)}</span>
                      {isOpen && (
                        <span className="text-orange-600 font-semibold flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-orange-500" />
                          Priority Host SLA • Target Resolution Under 2h
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal: Create Support Ticket */}
        {showCreateModal && (
          <Modal
            isOpen={true}
            onClose={() => setShowCreateModal(false)}
            title="Open Provider Support or Dispute Ticket"
          >
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Issue Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 bg-white"
                >
                  <option value="Tourist No-Show / Late Arrival">Tourist No-Show or Late Arrival</option>
                  <option value="Unpaid Overtime / Extra Hours">Unpaid Overtime / Extra Tour Hours</option>
                  <option value="Tourist Misbehavior or Safety Concern">Tourist Misbehavior or Safety Concern</option>
                  <option value="Vehicle Damage or Accident Claim">Vehicle Damage or Accident Claim</option>
                  <option value="Payout, UPI or Bank Transfer Delay">Payout, UPI or Bank Transfer Delay</option>
                  <option value="Listing Verification or Approval Query">Listing Verification or Approval Query</option>
                  <option value="Technical App Issue">Technical App Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Subject / Summary <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Tourist exceeded 3 hours booking by 2 extra hours unpaid"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 bg-white font-medium"
                  >
                    <option value="normal">Normal (Standard Query)</option>
                    <option value="high">High (Action Needed on Payout/Booking)</option>
                    <option value="urgent">Urgent (Active Trip Emergency)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Booking # (Optional)</label>
                  <Input
                    placeholder="e.g. BK-98721345"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Detailed Explanation <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Please describe what happened, times, pickup location, extra hours, or any charges disputed..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={submitting}
                  className="font-bold bg-[#ff7a00] hover:bg-[#e06c00] border-none text-white"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Submit to Admin
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}

