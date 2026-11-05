'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  RefreshCw,
  FileSpreadsheet,
  ExternalLink,
  MessageCircle,
  DollarSign,
  Clock,
  ArrowRight,
  ShieldCheck,
  LifeBuoy,
  Users,
  Briefcase,
  Phone,
  Mail,
  Send,
  HelpCircle,
  Check,
  Search,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { showToast } from '@/components/ui/Toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { exportToCSV } from '@/lib/exportUtils'

export default function AdminDisputesAndSupportPage() {
  const [activeSection, setActiveSection] = useState<'support_tickets' | 'booking_disputes'>('support_tickets')

  // --- SUPPORT TICKETS STATE ---
  const [supportTickets, setSupportTickets] = useState<any[]>([])
  const [supportLoading, setSupportLoading] = useState(true)
  const [supportStatusFilter, setSupportStatusFilter] = useState<'all' | 'open' | 'resolved'>('all')
  const [supportRoleFilter, setSupportRoleFilter] = useState<'all' | 'customer' | 'provider'>('all')
  const [supportSearch, setSupportSearch] = useState('')

  // Support Ticket Verification & Solving Modal State
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null)
  const [ticketStatus, setTicketStatus] = useState<'resolved' | 'in_progress' | 'waiting_for_customer' | 'closed'>('resolved')
  const [ticketResolutionNotes, setTicketResolutionNotes] = useState('')
  const [ticketSubmitting, setTicketSubmitting] = useState(false)

  // --- BOOKING DISPUTES STATE ---
  const [disputes, setDisputes] = useState<any[]>([])
  const [disputesLoading, setDisputesLoading] = useState(true)
  const [disputeFilterTab, setDisputeFilterTab] = useState<'all' | 'open' | 'resolved'>('all')

  // Dispute Resolution Modal State
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null)
  const [resolutionType, setResolutionType] = useState<'full_refund' | 'partial_refund' | 'penalty_host' | 'dismiss'>('full_refund')
  const [refundAmount, setRefundAmount] = useState(0)
  const [disputeResolutionNotes, setDisputeResolutionNotes] = useState('')
  const [disputeSubmitting, setDisputeSubmitting] = useState(false)

  // Load Support Tickets
  const loadSupportTickets = async () => {
    setSupportLoading(true)
    try {
      const res = await fetch('/api/admin/support-tickets')
      if (res.ok) {
        const data = await res.json()
        setSupportTickets(data.tickets || [])
      }
    } catch (err) {
      console.error('Failed to load support tickets:', err)
    } finally {
      setSupportLoading(false)
    }
  }

  // Load Disputes
  const loadDisputes = async () => {
    setDisputesLoading(true)
    try {
      const res = await fetch('/api/admin/disputes')
      if (res.ok) {
        const data = await res.json()
        setDisputes(data.disputes || [])
      }
    } catch (err) {
      console.error('Failed to load disputes:', err)
    } finally {
      setDisputesLoading(false)
    }
  }

  useEffect(() => {
    loadSupportTickets()
    loadDisputes()
  }, [])

  // Filtered Support Tickets
  const filteredSupportTickets = supportTickets.filter((t) => {
    if (supportStatusFilter === 'open' && t.status === 'resolved') return false
    if (supportStatusFilter === 'resolved' && t.status !== 'resolved') return false
    if (supportRoleFilter !== 'all' && t.userRole !== supportRoleFilter) return false
    if (supportSearch.trim()) {
      const q = supportSearch.toLowerCase()
      const matchSubject = t.subject?.toLowerCase().includes(q)
      const matchName = t.userName?.toLowerCase().includes(q)
      const matchEmail = t.userEmail?.toLowerCase().includes(q)
      const matchId = t.id?.toLowerCase().includes(q)
      const matchBooking = t.bookingNumber?.toLowerCase().includes(q)
      if (!matchSubject && !matchName && !matchEmail && !matchId && !matchBooking) return false
    }
    return true
  })

  // Filtered Disputes
  const filteredDisputes = disputes.filter((d) => {
    if (disputeFilterTab === 'all') return true
    if (disputeFilterTab === 'open') return d.status === 'opened' || d.status === 'under_review'
    if (disputeFilterTab === 'resolved') return d.status === 'resolved'
    return true
  })

  // Open Solve Modal for Support Ticket
  const openSolveTicketModal = (ticket: any) => {
    setSelectedTicket(ticket)
    setTicketStatus(ticket.status === 'resolved' ? 'resolved' : 'resolved')
    setTicketResolutionNotes(ticket.resolutionNotes || '')
  }

  // Submit Support Ticket Resolution
  const handleResolveTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket) return
    setTicketSubmitting(true)
    try {
      const res = await fetch('/api/admin/support-tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          status: ticketStatus,
          resolutionNotes: ticketResolutionNotes,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast.success(data.message || 'Support ticket verified and solved!')
        setSelectedTicket(null)
        loadSupportTickets()
      } else {
        showToast.error(data.error || 'Failed to update support ticket')
      }
    } catch (err: any) {
      showToast.error(err.message || 'Error resolving support ticket')
    } finally {
      setTicketSubmitting(false)
    }
  }

  // Open Dispute Resolution Modal
  const openResolutionModal = (dispute: any) => {
    setSelectedDispute(dispute)
    setRefundAmount(dispute.refundRequested || dispute.totalAmount || 0)
    setDisputeResolutionNotes('')
  }

  // Submit Dispute Ruling
  const handleResolveDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDispute) return
    setDisputeSubmitting(true)
    try {
      const res = await fetch('/api/admin/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeId: selectedDispute.id,
          bookingId: selectedDispute.bookingId,
          resolutionType,
          refundAmount: resolutionType.includes('refund') ? refundAmount : 0,
          notes: disputeResolutionNotes,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast.success('Dispute case successfully resolved and customer notified')
        setSelectedDispute(null)
        loadDisputes()
      } else {
        showToast.error(data.error || 'Failed to resolve dispute')
      }
    } catch (err: any) {
      showToast.error(err.message || 'Error resolving dispute')
    } finally {
      setDisputeSubmitting(false)
    }
  }

  // Export CSV Handler
  const handleExportCSV = () => {
    if (activeSection === 'support_tickets') {
      const columns = [
        { header: 'Ticket ID', key: 'id' },
        { header: 'Requester Role', key: 'userRole' },
        { header: 'User Name', key: 'userName' },
        { header: 'Email', key: 'userEmail' },
        { header: 'Category', key: 'category' },
        { header: 'Priority', key: 'priority' },
        { header: 'Status', key: 'status' },
        { header: 'Subject', key: 'subject' },
        { header: 'Booking Number', key: 'bookingNumber' },
        { header: 'Resolution', key: 'resolutionNotes' },
        { header: 'Date', key: 'createdAt' },
      ]
      exportToCSV(`support-tickets-${supportStatusFilter}`, filteredSupportTickets, columns)
    } else {
      const columns = [
        { header: 'Case ID', key: 'id' },
        { header: 'Booking Number', key: 'bookingNumber' },
        { header: 'Customer', key: 'customerName' },
        { header: 'Category', key: 'category' },
        { header: 'Status', key: 'status' },
        { header: 'Refund Requested', key: 'refundRequested' },
        { header: 'Resolution', key: 'resolution' },
        { header: 'Date', key: 'createdAt' },
      ]
      exportToCSV(`booking-disputes-${disputeFilterTab}`, filteredDisputes, columns)
    }
  }

  const openTicketsCount = supportTickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed').length
  const openDisputesCount = disputes.filter((d) => d.status !== 'resolved').length

  return (
    <DashboardLayout role="admin" title="Disputes & Support Workbench">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-800 border border-purple-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-purple-700" /> Administrative Mediation Desk
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 font-display">
              Support Tickets & Dispute Resolution
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Verify customer and provider support tickets, provide official solutions, and arbitrate booking escrow disputes.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadSupportTickets()
                loadDisputes()
              }}
              disabled={supportLoading || disputesLoading}
              className="rounded-xl"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${supportLoading || disputesLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="rounded-xl">
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* 2 Main Mode Tabs */}
        <div className="flex border-b border-gray-200 gap-4">
          <button
            onClick={() => setActiveSection('support_tickets')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeSection === 'support_tickets'
                ? 'border-[#0a4d29] text-[#0a4d29]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            Support & Help Tickets ({supportTickets.length})
            {openTicketsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                {openTicketsCount} Open
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('booking_disputes')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeSection === 'booking_disputes'
                ? 'border-[#0a4d29] text-[#0a4d29]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Trip Escrow Disputes ({disputes.length})
            {openDisputesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800">
                {openDisputesCount} Active
              </span>
            )}
          </button>
        </div>

        {/* ============================================================== */}
        {/* SECTION 1: SUPPORT & HELP TICKETS (TOURISTS & PROVIDERS)        */}
        {/* ============================================================== */}
        {activeSection === 'support_tickets' && (
          <div className="space-y-6">
            {/* 3 Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Pending Review</span>
                <h3 className="text-2xl font-black text-amber-700 font-display">{openTicketsCount}</h3>
                <p className="text-[11px] text-amber-600">Requiring verification & solution</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Solved & Resolved</span>
                <h3 className="text-2xl font-black text-emerald-700 font-display">
                  {supportTickets.filter((t) => t.status === 'resolved').length}
                </h3>
                <p className="text-[11px] text-emerald-600">Solution sent to user</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">From Hosts / Providers</span>
                <h3 className="text-2xl font-black text-[#ff7a00] font-display">
                  {supportTickets.filter((t) => t.userRole === 'provider').length}
                </h3>
                <p className="text-[11px] text-gray-400">Driver & listing queries</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">From Tourists</span>
                <h3 className="text-2xl font-black text-blue-700 font-display">
                  {supportTickets.filter((t) => t.userRole !== 'provider').length}
                </h3>
                <p className="text-[11px] text-gray-400">Rider inquiries & bookings</p>
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                {/* Role Filter */}
                <div className="flex items-center bg-gray-100 p-1 rounded-2xl">
                  {[
                    { id: 'all', label: 'All Users' },
                    { id: 'customer', label: 'Tourists' },
                    { id: 'provider', label: 'Hosts & Providers' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSupportRoleFilter(tab.id as any)}
                      className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                        supportRoleFilter === tab.id
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Status Filter */}
                <div className="flex items-center bg-gray-100 p-1 rounded-2xl">
                  {[
                    { id: 'all', label: 'All Status' },
                    { id: 'open', label: 'Open / Pending' },
                    { id: 'resolved', label: 'Resolved' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSupportStatusFilter(tab.id as any)}
                      className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                        supportStatusFilter === tab.id
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search ticket, name, booking..."
                  value={supportSearch}
                  onChange={(e) => setSupportSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 bg-gray-50"
                />
              </div>
            </div>

            {/* Support Tickets Cards List */}
            {supportLoading ? (
              <div className="p-16 text-center text-xs text-gray-400 bg-white rounded-3xl border border-gray-100">
                Loading support tickets...
              </div>
            ) : filteredSupportTickets.length === 0 ? (
              <div className="p-16 text-center space-y-2 bg-white rounded-3xl border border-gray-100">
                <LifeBuoy className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm font-bold text-gray-700">No support tickets found</p>
                <p className="text-xs text-gray-400">
                  Tickets raised by tourists and providers will appear here for admin verification and solution.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSupportTickets.map((t) => {
                  const isProvider = t.userRole === 'provider'
                  const isResolved = t.status === 'resolved'
                  const isOpen = t.status === 'open' || t.status === 'in_progress'

                  return (
                    <div
                      key={t.id}
                      className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-4"
                    >
                      {/* Top Row: User & Meta */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black text-gray-400">
                            #{t.id.slice(0, 8).toUpperCase()}
                          </span>

                          {/* Role Badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                              isProvider
                                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {isProvider ? (
                              <>
                                <Briefcase className="w-3 h-3" /> Host / Provider
                              </>
                            ) : (
                              <>
                                <Users className="w-3 h-3" /> Tourist / Rider
                              </>
                            )}
                          </span>

                          {/* Category Badge */}
                          <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 text-[11px] font-bold">
                            {t.category}
                          </span>

                          {/* Priority Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              t.priority === 'urgent'
                                ? 'bg-red-100 text-red-800'
                                : t.priority === 'high'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {t.priority}
                          </span>

                          {/* Linked Booking */}
                          {t.bookingNumber && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                              Booking: {t.bookingNumber}
                              {t.bookingAmount ? ` (₹${t.bookingAmount})` : ''}
                            </span>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${
                              isResolved
                                ? 'bg-emerald-100 text-emerald-800'
                                : isOpen
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {isResolved ? 'Resolved & Solved' : isOpen ? 'In Review' : t.status}
                          </span>
                        </div>
                      </div>

                      {/* Requester Contact Strip */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 bg-gray-50/70 p-3 rounded-2xl">
                        <div>
                          <strong className="text-gray-900">{t.userName}</strong>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <a href={`mailto:${t.userEmail}`} className="hover:text-emerald-700 hover:underline">
                            {t.userEmail}
                          </a>
                        </div>
                        {t.userPhone && t.userPhone !== 'N/A' && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <a href={`tel:${t.userPhone}`} className="hover:text-emerald-700 hover:underline">
                              {t.userPhone}
                            </a>
                          </div>
                        )}
                        <span className="text-gray-400 ml-auto">
                          Raised on {formatDate(t.createdAt)}
                        </span>
                      </div>

                      {/* Subject & Description */}
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-black text-gray-900">{t.subject}</h4>
                        <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{t.description}</p>
                      </div>

                      {/* Admin Resolution Display if Resolved */}
                      {isResolved && (
                        <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 space-y-1">
                          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Official Admin Resolution & Solution Provided:</span>
                          </div>
                          <p className="text-xs text-emerald-950 font-medium pl-5 leading-relaxed">
                            {t.resolutionNotes || 'Verified and resolved by Antigravity Support Desk.'}
                          </p>
                          {t.resolvedAt && (
                            <span className="text-[10px] text-emerald-700 block pl-5 pt-0.5">
                              Solved on {formatDate(t.resolvedAt)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions Strip */}
                      <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <a
                            href={`mailto:${t.userEmail}?subject=Support Ticket #${t.id.slice(0, 8).toUpperCase()}: ${encodeURIComponent(t.subject)}`}
                            className="inline-flex items-center text-xs font-semibold text-gray-600 hover:text-emerald-700 bg-gray-100 hover:bg-emerald-50 px-3 py-1.5 rounded-xl transition"
                          >
                            <Mail className="w-3.5 h-3.5 mr-1 text-gray-500" />
                            Email Requester
                          </a>
                          {t.userPhone && t.userPhone !== 'N/A' && (
                            <a
                              href={`tel:${t.userPhone}`}
                              className="inline-flex items-center text-xs font-semibold text-gray-600 hover:text-emerald-700 bg-gray-100 hover:bg-emerald-50 px-3 py-1.5 rounded-xl transition"
                            >
                              <Phone className="w-3.5 h-3.5 mr-1 text-gray-500" />
                              Call Phone
                            </a>
                          )}
                        </div>

                        <Button
                          variant={isResolved ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => openSolveTicketModal(t)}
                          className="rounded-xl font-bold"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                          {isResolved ? 'Edit Resolution' : 'Verify & Solve Issue'}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 2: TRIP & ESCROW BOOKING DISPUTES (EXISTING FEATURE)    */}
        {/* ============================================================== */}
        {activeSection === 'booking_disputes' && (
          <div className="space-y-6">
            {/* 3 Dispute Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Active Disputes</span>
                <h3 className="text-2xl font-black text-amber-700 font-display">
                  {disputes.filter((d) => d.status !== 'resolved').length}
                </h3>
                <p className="text-[11px] text-amber-600">Requiring escrow mediation</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Resolved Disputes</span>
                <h3 className="text-2xl font-black text-emerald-700 font-display">
                  {disputes.filter((d) => d.status === 'resolved').length}
                </h3>
                <p className="text-[11px] text-emerald-600">Ruling executed</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Protected Escrow</span>
                <h3 className="text-2xl font-black text-purple-700 font-display">
                  {formatCurrency(disputes.reduce((acc, d) => acc + (d.totalAmount || 0), 0))}
                </h3>
                <p className="text-[11px] text-gray-400">Under arbitration protection</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-2xl w-fit">
              {[
                { id: 'all', label: 'All Disputes' },
                { id: 'open', label: 'Active Escrow Holds' },
                { id: 'resolved', label: 'Resolved Rulings' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDisputeFilterTab(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    disputeFilterTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Disputes Table */}
            {disputesLoading ? (
              <div className="p-16 text-center text-xs text-gray-400 bg-white rounded-3xl border border-gray-100">
                Loading dispute arbitrations...
              </div>
            ) : filteredDisputes.length === 0 ? (
              <div className="p-16 text-center space-y-2 bg-white rounded-3xl border border-gray-100">
                <ShieldAlert className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm font-bold text-gray-700">No active dispute arbitrations</p>
                <p className="text-xs text-gray-400">
                  When a customer files a booking dispute or cancellation claim, it will appear here.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-400 uppercase font-black tracking-wider text-[10px] border-b border-gray-100">
                    <tr>
                      <th className="py-4 px-6">Case / Booking</th>
                      <th className="py-4 px-6">Customer</th>
                      <th className="py-4 px-6">Issue Category</th>
                      <th className="py-4 px-6">Escrow Amount</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Arbitration Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredDisputes.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-gray-900">
                          {d.bookingNumber}
                          <span className="block text-[10px] font-normal text-gray-400 font-sans">
                            {formatDate(d.createdAt)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-gray-800 block">{d.customerName}</span>
                          <span className="text-[11px] text-gray-400">{d.customerPhone || d.customerEmail}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 font-bold text-[11px]">
                            {d.category}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-black text-gray-900">
                          {formatCurrency(d.totalAmount)}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                              d.status === 'resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {d.status === 'resolved' ? 'Resolved' : 'Escrow Held'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button
                            variant={d.status === 'resolved' ? 'outline' : 'primary'}
                            size="sm"
                            onClick={() => openResolutionModal(d)}
                            className="rounded-xl font-bold"
                          >
                            {d.status === 'resolved' ? 'View Ruling' : 'Arbitrate & Refund'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: VERIFY & SOLVE SUPPORT TICKET                           */}
        {/* ============================================================== */}
        {selectedTicket && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedTicket(null)}
            title={`Verify & Solve Support Ticket #${selectedTicket.id.slice(0, 8).toUpperCase()}`}
          >
            <form onSubmit={handleResolveTicketSubmit} className="space-y-4">
              {/* Requester Context Box */}
              <div className="p-4 bg-gray-50 rounded-2xl text-xs space-y-2 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        selectedTicket.userRole === 'provider'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {selectedTicket.userRole === 'provider' ? 'Host / Provider' : 'Tourist / Customer'}
                    </span>
                    <strong className="text-gray-900">{selectedTicket.userName}</strong>
                  </div>
                  <span className="text-[11px] text-gray-500">{selectedTicket.userEmail}</span>
                </div>

                <div className="text-gray-700">
                  <span className="font-bold text-gray-900 block">Issue Subject:</span>
                  <p className="font-medium text-gray-900">{selectedTicket.subject}</p>
                </div>

                <div className="text-gray-600 bg-white p-3 rounded-xl border border-gray-200/60 leading-relaxed italic">
                  "{selectedTicket.description}"
                </div>

                {selectedTicket.bookingNumber && (
                  <div className="text-[11px] text-gray-600 font-semibold pt-1">
                    Related Booking: <span className="text-gray-900 font-mono font-bold">{selectedTicket.bookingNumber}</span>
                    {selectedTicket.bookingAmount && ` • Amount: ₹${selectedTicket.bookingAmount}`}
                  </div>
                )}
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Ticket Resolution Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 bg-white"
                >
                  <option value="resolved">Resolved (Issue Verified & Solved)</option>
                  <option value="in_progress">In Progress (Under Active Investigation)</option>
                  <option value="waiting_for_customer">Waiting for Requester Response</option>
                  <option value="closed">Closed (No Action Required)</option>
                </select>
              </div>

              {/* Official Admin Solution Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Official Admin Solution & Explanation <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Explain the solution provided to the tourist or provider (e.g. 'Verified with host. Additional 1 hour overtime credit of ₹450 released to host wallet. Customer cautioned regarding overtime limits.')..."
                  value={ticketResolutionNotes}
                  onChange={(e) => setTicketResolutionNotes(e.target.value)}
                  rows={4}
                  required
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  This official response will be displayed directly inside the user's Support & Help dashboard.
                </p>
              </div>

              {/* Modal Action CTA */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <Button type="button" variant="secondary" onClick={() => setSelectedTicket(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={ticketSubmitting} className="font-bold">
                  <Check className="w-4 h-4 mr-1.5" />
                  Confirm & Solve Ticket
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* ============================================================== */}
        {/* MODAL: DISPUTE RESOLUTION WORKBENCH (EXISTING)                 */}
        {/* ============================================================== */}
        {selectedDispute && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedDispute(null)}
            title={`Mediation Ruling • #${selectedDispute.bookingNumber}`}
          >
            <form onSubmit={handleResolveDisputeSubmit} className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-2xl text-xs space-y-1">
                <span className="font-bold text-gray-800 block">Customer Complaint:</span>
                <p className="text-gray-600 leading-relaxed italic">"{selectedDispute.description}"</p>
                <div className="pt-1 text-gray-500">
                  Total Booking Escrow: <strong className="text-gray-900">{formatCurrency(selectedDispute.totalAmount)}</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Ruling & Resolution Action <span className="text-red-500">*</span>
                </label>
                <select
                  value={resolutionType}
                  onChange={(e) => setResolutionType(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 bg-white"
                >
                  <option value="full_refund">Award Full Refund to Customer (100%)</option>
                  <option value="partial_refund">Award Partial Refund (Custom Amount)</option>
                  <option value="penalty_host">Impose Host Penalty (Zero Customer Refund)</option>
                  <option value="dismiss">Dismiss Dispute (Release Escrow to Host)</option>
                </select>
              </div>

              {resolutionType.includes('refund') && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Refund Amount to Credit Customer (₹)
                  </label>
                  <Input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                    max={selectedDispute.totalAmount}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mediation Ruling Notes & Justification <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Explain why this decision was reached based on photos, GPS timestamps, or policy terms..."
                  value={disputeResolutionNotes}
                  onChange={(e) => setDisputeResolutionNotes(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <Button type="button" variant="secondary" onClick={() => setSelectedDispute(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={disputeSubmitting} className="font-bold">
                  Execute Ruling & Notify Parties
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}
