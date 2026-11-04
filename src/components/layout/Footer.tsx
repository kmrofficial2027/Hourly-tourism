import React from 'react'
import Link from 'next/link'
import {
  Compass,
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
} from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block bg-white rounded-2xl px-4 py-2.5 shadow-lg hover:scale-[1.02] transition-transform">
              <img
                src="/images/logo.png"
                alt="Hourly Tourism — Discover More. One Hour at a Time."
                className="h-16 sm:h-20 w-auto object-contain"
              />
            </Link>
            <p className="text-[#ff7a00] font-bold text-sm tracking-wide">
              Discover More. One Hour at a Time.
            </p>
            <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
              The premier marketplace for hourly travel services. Rent bikes, cars, and vans, hire
              expert local guides, and book unforgettable sightseeing tours and experiences—completely
              customized to your schedule.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-[#ff7a00] text-gray-300 hover:text-white flex items-center justify-center transition-all text-xs font-bold"
                aria-label="Instagram"
              >
                IG
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-[#ff7a00] text-gray-300 hover:text-white flex items-center justify-center transition-all text-xs font-bold"
                aria-label="Twitter"
              >
                X
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-[#ff7a00] text-gray-300 hover:text-white flex items-center justify-center transition-all text-xs font-bold"
                aria-label="Facebook"
              >
                FB
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-[#ff7a00] text-gray-300 hover:text-white flex items-center justify-center transition-all text-xs font-bold"
                aria-label="LinkedIn"
              >
                IN
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Hourly Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/explore?category=bike" className="hover:text-emerald-400 transition-colors">
                  Bikes by the Hour
                </Link>
              </li>
              <li>
                <Link href="/explore?category=car" className="hover:text-emerald-400 transition-colors">
                  Cars by the Hour
                </Link>
              </li>
              <li>
                <Link href="/explore?category=van" className="hover:text-emerald-400 transition-colors">
                  Vans by the Hour
                </Link>
              </li>
              <li>
                <Link href="/explore?category=local_guide" className="hover:text-emerald-400 transition-colors">
                  Local Guides by the Hour
                </Link>
              </li>
              <li>
                <Link href="/explore?category=sightseeing_tour" className="hover:text-emerald-400 transition-colors">
                  Sightseeing Tours
                </Link>
              </li>
              <li>
                <Link href="/explore?category=experience" className="hover:text-emerald-400 transition-colors">
                  Local Experiences
                </Link>
              </li>
              <li className="pt-2 border-t border-gray-800">
                <Link href="/coimbatore-guide" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors flex items-center">
                  <span>📍 Coimbatore Travel Guide</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Providers & Partners */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Providers & Operators
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/become-provider" className="hover:text-emerald-400 transition-colors font-medium text-emerald-400">
                  Become a Provider
                </Link>
              </li>
              <li>
                <Link href="/provider" className="hover:text-emerald-400 transition-colors">
                  Provider Dashboard
                </Link>
              </li>
              <li>
                <Link href="/company" className="hover:text-emerald-400 transition-colors">
                  Company Operator Portal
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-emerald-400 transition-colors">
                  How Earnings Work
                </Link>
              </li>
              <li>
                <Link href="/provider-guidelines" className="hover:text-emerald-400 transition-colors">
                  Quality Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Support & Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/cancellation-policy" className="hover:text-emerald-400 transition-colors">
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-emerald-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} Hourly Tourism Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span className="flex items-center text-emerald-500">
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              Verified Providers & Secure Booking
            </span>
            <span>•</span>
            <span className="flex items-center text-gray-400">
              <Clock className="w-4 h-4 mr-1.5" />
              Hourly Flexible Scheduling
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

