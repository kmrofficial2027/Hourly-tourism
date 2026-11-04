'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  User,
  LogOut,
  Bell,
  Compass,
  Calendar,
  Shield,
  Briefcase,
  ChevronDown,
  Layers,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'

export function Header() {
  const pathname = usePathname()
  const { user, profile, signOut, loading } = useAuth()
  const { unreadCount } = useNotifications(user?.id)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdowns on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setUserDropdownOpen(false)
  }, [pathname])

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Explore', href: '/explore' },
    { label: 'Vehicles', href: '/vehicles' },
    { label: 'Local Guides', href: '/guides' },
    { label: 'Tours & Experiences', href: '/tours' },
    { label: 'Coimbatore Guide', href: '/coimbatore-guide' },
  ]

  const getDashboardHref = () => {
    if (!profile) return '/dashboard'
    switch (profile.role) {
      case 'admin':
        return '/admin'
      case 'provider':
        return '/provider'
      case 'company':
        return '/company'
      default:
        return '/dashboard'
    }
  }

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-3'
          : 'bg-white/80 backdrop-blur-sm border-b border-gray-100 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Logo variant="header" />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-[#15803d] bg-green-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Become a Provider Button */}
            {(!profile || profile.role === 'customer') && (
              <Link
                href="/become-provider"
                className="text-sm font-semibold text-[#15803d] hover:text-[#0a4d29] px-3 py-2 rounded-xl hover:bg-green-50 transition-colors"
              >
                Become a Provider
              </Link>
            )}

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <div className="flex items-center space-x-3 relative">
                {/* Notification icon */}
                <Link
                  href="/dashboard?tab=notifications"
                  className="p-2.5 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 relative transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <Avatar
                      src={profile?.avatar_url}
                      name={profile?.full_name || user.email}
                      size="sm"
                    />
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-bold text-gray-800 max-w-[120px] truncate leading-tight">
                        {profile?.full_name || 'My Account'}
                      </p>
                      <p className="text-[10px] text-[#ff7a00] font-semibold uppercase">
                        {profile?.role || 'Customer'}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-scale-in">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {profile?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          href={getDashboardHref()}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-[#15803d]"
                        >
                          <Layers className="w-4 h-4 mr-3 text-gray-400" />
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard?tab=bookings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-[#15803d]"
                        >
                          <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                          My Bookings
                        </Link>
                        <Link
                          href="/dashboard?tab=profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-[#15803d]"
                        >
                          <User className="w-4 h-4 mr-3 text-gray-400" />
                          Profile Settings
                        </Link>

                        {profile?.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="flex items-center px-4 py-2 text-sm text-amber-700 font-medium hover:bg-amber-50"
                          >
                            <Shield className="w-4 h-4 mr-3 text-amber-500" />
                            Admin Console
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={() => signOut()}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-3 text-red-400" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center md:hidden space-x-2">
            {user && (
              <Link
                href="/dashboard?tab=notifications"
                className="p-2 text-gray-500 hover:text-gray-800 relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full" />
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-6 animate-slide-down shadow-xl">
          {/* Logo in mobile drawer */}
          <div className="pb-3 mb-3 border-b border-gray-100 flex items-center">
            <Logo variant="header" />
          </div>
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-[#15803d]"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/become-provider"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#15803d] bg-green-50"
            >
              Become a Provider
            </Link>

            <div className="border-t border-gray-100 pt-3 mt-2">
              {user ? (
                <div className="flex flex-col space-y-2">
                  <Link
                    href={getDashboardHref()}
                    className="flex items-center px-4 py-2 text-sm font-semibold text-gray-800"
                  >
                    <Layers className="w-4 h-4 mr-3 text-[#15803d]" />
                    Dashboard ({profile?.role})
                  </Link>
                  <Link
                    href="/dashboard?tab=bookings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700"
                  >
                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                    My Bookings
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center px-4 py-2 text-sm font-semibold text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link href="/login" className="w-full">
                    <Button variant="secondary" fullWidth size="md">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup" className="w-full">
                    <Button variant="primary" fullWidth size="md">
                      Create Account
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

