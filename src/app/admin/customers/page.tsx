'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Clock,
  ArrowUpDown,
  MoreVertical,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  UserCheck,
  UserX,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { showToast } from '@/components/ui/Toast'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all')
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)

  // Fetch customer list
  const loadCustomers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.customers || [])
      }
    } catch (err) {
      console.error(err)
      showToast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  // Filtered and searched customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone?.includes(searchQuery) ||
        c.city?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' ? true : c.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [customers, searchQuery, statusFilter])

  // Toggle customer account status
  const handleToggleStatus = async (customer: any) => {
    const newStatus = customer.status === 'active' ? 'suspended' : 'active'
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          status: newStatus,
        }),
      })

      if (res.ok) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === customer.id ? { ...c, status: newStatus } : c))
        )
        if (selectedCustomer?.id === customer.id) {
          setSelectedCustomer((prev: any) => ({ ...prev, status: newStatus }))
        }
        showToast.success(
          `Customer ${customer.full_name} is now ${newStatus.toUpperCase()}`
        )
      } else {
        throw new Error('Failed to update status')
      }
    } catch (err) {
      showToast.error('Could not update customer status')
    }
  }

  const metrics = useMemo(() => {
    const total = customers.length
    const active = customers.filter((c) => c.status === 'active').length
    const totalSpend = customers.reduce((acc, c) => acc + (c.total_spent || 0), 0)
    const totalBookings = customers.reduce((acc, c) => acc + (c.total_bookings || 0), 0)
    return { total, active, totalSpend, totalBookings }
  }, [customers])

  return (
    <DashboardLayout role="admin" title="Customer Management">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-[#0a4d29]">
                Verified Marketplace Travelers
              </span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 font-display mt-1">
              Customer Directory & Profiles
            </h1>
            <p className="text-xs text-gray-500">
              Audit tourist accounts, track hourly bookings, monitor spending volume, and manage compliance.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadCustomers}
              disabled={loading}
            >
              Refresh Directory
            </Button>
          </div>
        </div>

        {/* 4 Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Total Customers
            </span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-black text-gray-900">{metrics.total}</h3>
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-[11px] text-gray-500">Active travelers on platform</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Active & Verified
            </span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-black text-emerald-700">{metrics.active}</h3>
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-[11px] text-gray-500">Good standing with zero disputes</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
              Customer Lifetime Spend
            </span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-black text-gray-900">
                {formatCurrency(metrics.totalSpend)}
              </h3>
              <CreditCard className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-[11px] text-gray-500">Total volume across bookings</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Total Hourly Bookings
            </span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-black text-gray-900">{metrics.totalBookings}</h3>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-[11px] text-gray-500">Rides, tours & chauffeurs booked</p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, email, phone, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0a4d29]/20 focus:border-[#0a4d29]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 font-semibold hidden sm:inline">Status:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({customers.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Active ({customers.filter((c) => c.status === 'active').length})
            </button>
            <button
              onClick={() => setStatusFilter('suspended')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === 'suspended'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-800 hover:bg-red-100'
              }`}
            >
              Suspended ({customers.filter((c) => c.status === 'suspended').length})
            </button>
          </div>
        </div>

        {/* Customer Directory Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Hourly Bookings</th>
                  <th className="p-4">Lifetime Spend</th>
                  <th className="p-4">Last Circuit Booked</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        <span>Loading customer accounts...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      No customer accounts matching "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-green-50/30 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={customer.avatar_url}
                            alt={customer.full_name}
                            className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm"
                          />
                          <div>
                            <p className="font-bold text-gray-900">
                              {customer.full_name}
                            </p>
                            <span className="text-[10px] text-gray-400 font-mono">
                              ID: {customer.id.slice(0, 12)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center text-gray-600">
                            <Mail className="w-3 h-3 mr-1 text-gray-400" />
                            <span className="truncate max-w-[150px]">{customer.email}</span>
                          </div>
                          <div className="flex items-center text-gray-500 text-[11px]">
                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                            <span>{customer.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="p-4">
                        <div className="flex items-center text-gray-700">
                          <MapPin className="w-3 h-3 mr-1 text-emerald-600 shrink-0" />
                          <span className="truncate max-w-[130px]">{customer.city}</span>
                        </div>
                      </td>

                      {/* Bookings */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-gray-900">
                            {customer.total_bookings} rides/tours
                          </span>
                          <p className="text-[10px] text-gray-400">
                            Pref: {customer.preferred_category}
                          </p>
                        </div>
                      </td>

                      {/* Spend */}
                      <td className="p-4">
                        <span className="font-black text-[#0a4d29]">
                          {formatCurrency(customer.total_spent)}
                        </span>
                      </td>

                      {/* Last Circuit */}
                      <td className="p-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-orange-50 text-[#ff7a00] font-semibold text-[11px] border border-orange-200/50">
                          {customer.last_circuit}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {customer.status === 'active' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
                            <XCircle className="w-3 h-3 mr-1" />
                            Suspended
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCustomer(customer)}
                            className="text-[11px] h-7 px-2.5"
                          >
                            Profile
                          </Button>

                          <button
                            onClick={() => handleToggleStatus(customer)}
                            title={customer.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                            className={`p-1.5 rounded-lg border text-xs transition-colors ${
                              customer.status === 'active'
                                ? 'border-red-200 text-red-600 hover:bg-red-50'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {customer.status === 'active' ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Detail Drawer / Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedCustomer.avatar_url}
                    alt={selectedCustomer.full_name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                  />
                  <div>
                    <h3 className="text-lg font-black text-gray-900 font-display">
                      {selectedCustomer.full_name}
                    </h3>
                    <p className="text-xs text-gray-500">{selectedCustomer.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              {/* Customer Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Lifetime Spend
                  </span>
                  <p className="text-base font-black text-[#0a4d29] mt-0.5">
                    {formatCurrency(selectedCustomer.total_spent)}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Completed Bookings
                  </span>
                  <p className="text-base font-black text-gray-900 mt-0.5">
                    {selectedCustomer.total_bookings} Hourly Trips
                  </p>
                </div>
              </div>

              {/* Contact & Circuit Info */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-semibold text-gray-900">{selectedCustomer.phone}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Location:</span>
                  <span className="font-semibold text-gray-900">{selectedCustomer.city}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Favorite Vehicle Type:</span>
                  <span className="font-semibold text-[#0a4d29]">
                    {selectedCustomer.preferred_category}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Last Tourism Circuit:</span>
                  <span className="font-semibold text-[#ff7a00]">
                    {selectedCustomer.last_circuit}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Account Status:</span>
                  <span
                    className={`font-bold uppercase ${
                      selectedCustomer.status === 'active'
                        ? 'text-emerald-700'
                        : 'text-red-600'
                    }`}
                  >
                    {selectedCustomer.status}
                  </span>
                </div>
              </div>

              {/* Action buttons in modal */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Close
                </Button>
                <Button
                  variant={selectedCustomer.status === 'active' ? 'danger' : 'primary'}
                  size="sm"
                  onClick={() => handleToggleStatus(selectedCustomer)}
                >
                  {selectedCustomer.status === 'active'
                    ? 'Suspend Account'
                    : 'Activate Account'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

