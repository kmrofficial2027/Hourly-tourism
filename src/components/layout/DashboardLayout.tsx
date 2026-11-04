'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Compass,
  Star,
  User,
  Settings,
  CreditCard,
  Clock,
  ShieldCheck,
  Building2,
  Users,
  Briefcase,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { Logo } from '@/components/ui/Logo'

export interface DashboardLayoutProps {
  children: React.ReactNode
  role?: 'customer' | 'provider' | 'company' | 'admin'
  title?: string
}

export function DashboardLayout({
  children,
  role = 'customer',
  title,
}: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Enforce role-specific portal boundaries on client side
  useEffect(() => {
    if (!loading && profile?.role) {
      if (profile.role === 'provider' && role === 'customer') {
        window.location.replace('/provider')
      } else if (profile.role === 'company' && role === 'customer') {
        window.location.replace('/company')
      } else if (profile.role === 'customer' && (role === 'provider' || role === 'company')) {
        window.location.replace('/dashboard')
      }
    }
  }, [profile, role, loading])

  // Navigation configurations per role
  const navConfigs = {
    customer: [
      { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { label: 'My Bookings', href: '/dashboard/bookings', icon: Calendar },
      { label: 'Reviews & Ratings', href: '/dashboard/reviews', icon: Star },
      { label: 'Profile Settings', href: '/dashboard/profile', icon: User },
    ],
    provider: [
      { label: 'Overview', href: '/provider', icon: LayoutDashboard },
      { label: 'My Listings', href: '/provider/listings', icon: Compass },
      { label: 'Bookings & Requests', href: '/provider/bookings', icon: Calendar },
      { label: 'Earnings & Payouts', href: '/provider/earnings', icon: TrendingUp },
      { label: 'Availability & Hours', href: '/provider/availability', icon: Clock },
      { label: 'Verification', href: '/provider/verification', icon: ShieldCheck },
      { label: 'Reviews', href: '/provider/reviews', icon: Star },
      { label: 'Provider Profile', href: '/provider/profile', icon: User },
    ],
    company: [
      { label: 'Overview', href: '/company', icon: LayoutDashboard },
      { label: 'Fleet & Services', href: '/company/services', icon: Briefcase },
      { label: 'All Bookings', href: '/company/bookings', icon: Calendar },
      { label: 'Revenue & Reports', href: '/company/revenue', icon: CreditCard },
      { label: 'Company Profile', href: '/company/profile', icon: Building2 },
    ],
    admin: [
      { label: 'Overview', href: '/admin', icon: LayoutDashboard },
      { label: 'Customers', href: '/admin/customers', icon: Users },
      { label: 'Providers', href: '/admin/providers', icon: Briefcase },
      { label: 'Listings Approval', href: '/admin/listings', icon: Compass },
      { label: 'Bookings Monitor', href: '/admin/bookings', icon: Calendar },
      { label: 'Payments & Revenue', href: '/admin/payments', icon: CreditCard },
      { label: 'Reviews Moderation', href: '/admin/reviews', icon: Star },
      { label: 'Platform Settings', href: '/admin/settings', icon: Settings },
    ],
  }

  const currentNav = navConfigs[role] || navConfigs.customer

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            <Logo variant="compact" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff7a00] mt-1 pl-1">
              {role} Portal
            </span>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card in Sidebar */}
        <div className="p-4 mx-4 my-3 rounded-2xl bg-green-50/70 border border-green-200/60 flex items-center space-x-3">
          <Avatar
            src={profile?.avatar_url}
            name={profile?.full_name || user?.email}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {profile?.full_name || 'My Account'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {currentNav.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ff7a00] to-[#f59e0b] text-white shadow-md shadow-orange-500/25'
                    : 'text-gray-600 hover:text-[#0a4d29] hover:bg-green-50/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#15803d]'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-orange-200" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <Link
            href="/"
            className="flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Compass className="w-4 h-4 mr-2.5 text-gray-400" />
            Back to Marketplace
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2.5 text-red-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              {title || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard?tab=notifications"
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </Link>
            <div className="h-6 w-px bg-gray-200" />
            <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-orange-50 text-[#ff7a00] border border-orange-200/60">
              {role}
            </span>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

