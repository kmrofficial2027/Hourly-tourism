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
  MapPin,
  Car,
  ShieldAlert,
  HelpCircle,
  Layers,
  BellRing,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { Logo } from '@/components/ui/Logo'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'

export interface DashboardLayoutProps {
  children: React.ReactNode
  role?: 'customer' | 'provider' | 'admin'
  title?: string
}

// Role badge colors
const roleBadgeMap: Record<string, string> = {
  customer: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  provider: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  admin: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
}

// Icon accent colors per nav item (by index, cycling)
const iconColors = [
  'text-emerald-400',
  'text-sky-400',
  'text-amber-400',
  'text-violet-400',
  'text-rose-400',
  'text-teal-400',
  'text-orange-400',
  'text-indigo-400',
  'text-pink-400',
  'text-lime-400',
  'text-cyan-400',
]

export function DashboardLayout({
  children,
  role = 'customer',
  title,
}: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showBottomNav, setShowBottomNav] = useState(true)

  // Smart mobile scroll listener: hide bottom nav when scrolling down to reveal full screen, show when scrolling up
  useEffect(() => {
    let lastY = typeof window !== 'undefined' ? window.scrollY : 0

    const handleScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastY

      // Scrolled down past header threshold -> hide bottom bar
      if (delta > 8 && currentY > 50) {
        setShowBottomNav(false)
      } else if (delta < -8 || currentY <= 30) {
        // Scrolled up or at top -> show bottom bar
        setShowBottomNav(true)
      }

      lastY = currentY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Enforce role-specific portal boundaries on client side
  useEffect(() => {
    if (!loading && profile?.role) {
      if (profile.role === 'provider' && role === 'customer') {
        window.location.replace('/provider')
      } else if (profile.role === 'customer' && role === 'provider') {
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
      { label: 'Support & Help', href: '/dashboard/support', icon: HelpCircle },
    ],
    provider: [
      { label: 'Overview', href: '/provider', icon: LayoutDashboard },
      { label: 'My Listings', href: '/provider/listings', icon: Compass },
      { label: 'Bookings & Requests', href: '/provider/bookings', icon: Calendar },
      { label: 'Payments & Payouts', href: '/provider/earnings', icon: CreditCard },
      { label: 'Availability & Hours', href: '/provider/availability', icon: Clock },
      { label: 'Verifications', href: '/provider/verification', icon: ShieldCheck },
      { label: 'Reviews', href: '/provider/reviews', icon: Star },
      { label: 'Provider Profile', href: '/provider/profile', icon: User },
      { label: 'Support & Help', href: '/provider/support', icon: HelpCircle },
    ],
    admin: [
      { label: 'Overview', href: '/admin', icon: LayoutDashboard },
      { label: 'Marketplace Analytics', href: '/admin/analytics', icon: TrendingUp },
      { label: 'Destinations & Cities', href: '/admin/destinations', icon: MapPin },
      { label: 'Footer & Category Pages', href: '/admin/footer-pages', icon: Layers },
      { label: 'Push Notifications', href: '/admin/push-notifications', icon: BellRing },
      { label: 'Customers', href: '/admin/customers', icon: Users },
      { label: 'Providers & Verifications', href: '/admin/providers', icon: ShieldCheck },
      { label: 'Listings Moderation', href: '/admin/listings', icon: Compass },
      { label: 'Bookings Monitor', href: '/admin/bookings', icon: Calendar },
      { label: 'Payments & Revenue', href: '/admin/payments', icon: CreditCard },
      { label: 'Disputes & Support', href: '/admin/disputes', icon: ShieldAlert },
      { label: 'Reviews Moderation', href: '/admin/reviews', icon: Star },
      { label: 'Platform Settings', href: '/admin/settings', icon: Settings },
    ],
  }

  const currentNav = navConfigs[role] || navConfigs.customer

  // Dedicated mobile bottom navigation items with clean, concise labels
  const getBottomTabs = () => {
    switch (role) {
      case 'provider':
        return [
          { label: 'Overview', href: '/provider', icon: LayoutDashboard },
          { label: 'Listings', href: '/provider/listings', icon: Compass },
          { label: 'Bookings', href: '/provider/bookings', icon: Calendar },
          { label: 'Earnings', href: '/provider/earnings', icon: CreditCard },
          { label: 'Profile', href: '/provider/profile', icon: User },
        ]
      case 'admin':
        return [
          { label: 'Overview', href: '/admin', icon: LayoutDashboard },
          { label: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
          { label: 'Cities', href: '/admin/destinations', icon: MapPin },
          { label: 'Bookings', href: '/admin/bookings', icon: Calendar },
          { label: 'Settings', href: '/admin/settings', icon: Settings },
        ]
      default: // customer
        return [
          { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
          { label: 'Reviews', href: '/dashboard/reviews', icon: Star },
          { label: 'Support', href: '/dashboard/support', icon: HelpCircle },
          { label: 'Profile', href: '/dashboard/profile', icon: User },
        ]
    }
  }

  const bottomTabs = getBottomTabs()

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'My Account'
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* ── Mobile Sidebar Overlay ─────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ───────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0f172a] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col shadow-2xl shadow-black/40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 bg-slate-900/60">
          <div className="flex flex-col">
            <Link
              href="/"
              className="bg-white rounded-2xl px-3 py-2 shadow-lg inline-block hover:scale-[1.02] transition-transform"
            >
              <img
                src="/images/logo.png"
                alt="Hourly Tourism"
                className="h-14 sm:h-16 w-auto object-contain"
              />
            </Link>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#ff7a00] mt-2 pl-1">
              {role} Portal
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── User Card ── */}
        <div className="mx-4 mt-4 mb-2 p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#ff7a00]/20 blur-2xl pointer-events-none" />
          <div className="relative flex items-center gap-3">
            <div className="relative">
              <Avatar
                src={profile?.avatar_url}
                name={profile?.full_name || user?.email}
                size="md"
              />
              {/* Online indicator */}
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0f172a]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              <span
                className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                  roleBadgeMap[role] || roleBadgeMap.customer
                }`}
              >
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* ── Navigation Links ── */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {currentNav.map((item, idx) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' &&
                item.href !== '/provider' &&
                item.href !== '/admin' &&
                pathname.startsWith(item.href))
            const Icon = item.icon
            const iconColor = iconColors[idx % iconColors.length]

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ff7a00] to-[#f59e0b] text-white shadow-lg shadow-orange-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/8'
                }`}
              >
                {/* Active left-edge pill indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white/60" />
                )}

                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? 'text-white' : iconColor
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-orange-200 flex-shrink-0" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* ── Bottom Actions ── */}
        <div className="p-4 border-t border-white/5 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/8 transition-all"
          >
            <Compass className="w-4 h-4 text-slate-500" />
            Back to Marketplace
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Top Header Bar (Taller, prominent & mobile-centered logo) ── */}
        <header className="sticky top-0 z-30 h-20 sm:h-22 bg-white/95 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shadow-sm">
          {/* Left: Hamburger (mobile) or Page Title (desktop) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 rounded-2xl text-gray-700 hover:text-gray-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 lg:hidden transition-colors shadow-xs"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Page title — desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-[#ff7a00] to-[#f59e0b]" />
              <div>
                <h1 className="text-xl font-black text-gray-900 tracking-tight">
                  {title || 'Dashboard'}
                </h1>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Hourly Tourism • {role} Portal
                </p>
              </div>
            </div>
          </div>

          {/* Center on mobile: Prominently Sized Centered Brand Logo */}
          <div className="lg:hidden flex-1 flex items-center justify-center px-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center p-1 bg-white rounded-2xl shadow-xs hover:scale-105 transition-transform"
            >
              <img
                src="/images/logo.png"
                alt="Hourly Tourism"
                className="h-14 sm:h-16 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Right: notifications + role badge + avatar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Real Live NotificationCenter */}
            <NotificationCenter role={role} />

            <div className="hidden sm:block h-6 w-px bg-gray-200" />

            {/* Role badge */}
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-50 text-[#ff7a00] border border-orange-200/60">
              {role}
            </span>

            {/* Avatar (desktop shortcut) */}
            <div className="hidden sm:block">
              <Avatar
                src={profile?.avatar_url}
                name={profile?.full_name || user?.email}
                size="sm"
              />
            </div>
          </div>
        </header>

        {/* ── Main Body (Unrestricted mobile scroll + generous bottom clearance) ── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-32 sm:pb-36 lg:pb-8">
          {children}
          {/* Physical spacer guaranteeing full visibility above mobile tabs & gesture bar */}
          <div className="h-16 lg:hidden pointer-events-none" aria-hidden="true" />
        </main>

        {/* ── MOBILE BOTTOM TAB BAR ──────────────────────────────────── */}
        <nav
          className={`fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl shadow-black/10 transition-transform duration-300 ease-in-out ${
            showBottomNav ? 'translate-y-0' : 'translate-y-full pointer-events-none'
          }`}
          style={{
            paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
          }}
        >
          <div className="flex items-center justify-around px-2 py-2">
            {bottomTabs.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' &&
                  item.href !== '/provider' &&
                  item.href !== '/admin' &&
                  pathname.startsWith(item.href))
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-2xl transition-all duration-200 group min-w-0 flex-1"
                >
                  <div
                    className={`p-1.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-br from-[#ff7a00] to-[#f59e0b] shadow-md shadow-orange-500/30'
                        : 'group-hover:bg-gray-100'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-gray-400'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-bold truncate transition-colors text-center w-full ${
                      isActive ? 'text-[#ff7a00]' : 'text-gray-500'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
