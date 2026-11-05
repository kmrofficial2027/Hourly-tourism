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
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { showToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'

export default function CustomerSupportPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Ticket Form State
  const [category, setCategory] = useState('Payment issue')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
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
      console.error(err)
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
        showToast.success('Ticket submitted successfully. Resolution SLA: Under 2 hours.')
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
    <DashboardLayout role="customer" title="Help & Support Center">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-display">
              Support & Dispute Resolution
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              24x7 customer mediation desk for hourly trip disputes, refunds, and emergency assistance.
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
              className="rounded-xl font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Open Support Ticket
            </Button>
          </div>
        </div>

        {/* 3 Support Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">24x7 Phone Assistance</h4>
            <p className="text-xs text-gray-500">
              Immediate escalation for live trips in progress.
            </p>
            <a
              href="tel:+9118002008899"
              className="text-xs font-black text-emerald-700 hover:underline block pt-1"
            >
              1800-200-8899 (Toll Free)
            </a>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center font-bold">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">WhatsApp Live Helpdesk</h4>
            <p className="text-xs text-gray-500">
              Chat with our Tamil Nadu travel coordinators.
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
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#ff7a00] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">Escrow Dispute Protection</h4>
            <p className="text-xs text-gray-500">
              Payments remain in escrow until trip is safely completed.
            </p>
            <span className="text-xs font-black text-[#ff7a00] block pt-1">
              Guaranteed 100% Policy Protection
            </span>
          </div>
        </div>

        {/* Existing Tickets List */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 font-display">
              My Support & Dispute Cases ({tickets.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-gray-400">Loading support cases...</div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <LifeBuoy className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-700">No active support tickets</p>
              <p className="text-xs text-gray-400">
                If you encounter any issues during an hourly booking, file a ticket here for priority resolution.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {tickets.map((t) => {
                const isOpen = t.status === 'open' || t.status === 'in_progress'
                return (
                  <div key={t.id} className="p-5 sm:p-6 hover:bg-gray-50/50 transition-colors space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-gray-400">
                            #{t.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 font-bold text-gray-700">
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
                          !isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {!isOpen ? 'Resolved by Admin' : 'In Review'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{t.clean_description || t.description}</p>

                    {/* Admin Resolution Section if Resolved */}
                    {(t.resolution_notes || !isOpen) && (
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
                        <span className="text-emerald-700 font-semibold flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Assigned to Support Agent • Target Response 2h
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
            title="Create Support or Dispute Ticket"
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
                  <option value="Payment issue">Payment & Refund Issue</option>
                  <option value="Trip cancellation">Trip Cancellation / Host No-Show</option>
                  <option value="Vehicle breakdown">Vehicle Breakdown / Mechanical Fault</option>
                  <option value="Rash driving">Rash Driving / Safety Concern</option>
                  <option value="Extra charge dispute">Extra Charge or Overtime Dispute</option>
                  <option value="Lost item">Lost Item Recovery in Vehicle</option>
                  <option value="General inquiry">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Subject / Summary <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Overcharged for extra 1 hour by host"
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 bg-white"
                  >
                    <option value="low">Low (General Query)</option>
                    <option value="medium">Medium (Post-Trip)</option>
                    <option value="high">High (Needs Refund Action)</option>
                    <option value="urgent">Urgent (Live Trip Emergency)</option>
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
                  placeholder="Please describe what happened, times, pickup location, or any charges disputed..."
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
                <Button type="submit" variant="primary" isLoading={submitting} className="font-bold">
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Submit Ticket
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}

