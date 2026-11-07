'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import {
  DEFAULT_FOOTER_PAGES_SETTINGS,
  FooterContactSettings,
} from '@/lib/footerCategoryPages'

let clientCachedContacts: FooterContactSettings | null = null

export function Footer() {
  const [contacts, setContacts] = useState<FooterContactSettings>(
    clientCachedContacts || DEFAULT_FOOTER_PAGES_SETTINGS.footer_contacts
  )

  useEffect(() => {
    if (clientCachedContacts) {
      setContacts(clientCachedContacts)
      return
    }

    async function loadContacts() {
      try {
        const res = await fetch('/api/admin/footer-pages')
        if (res.ok) {
          const json = await res.json()
          if (json.settings?.footer_contacts) {
            clientCachedContacts = json.settings.footer_contacts
            setContacts(json.settings.footer_contacts)
          }
        }
      } catch {
        // Fallback to default
      }
    }
    loadContacts()
  }, [])

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-gray-800">
          {/* Brand info (5 columns on desktop) */}
          <div className="md:col-span-2 lg:col-span-5 space-y-4">
            <Link
              href="/"
              className="inline-block bg-white rounded-2xl px-4 py-2.5 shadow-lg hover:scale-[1.02] transition-transform"
            >
              <img
                src="/images/logo.png"
                alt="Hourly Tourism — Discover More. One Hour at a Time."
                className="h-16 sm:h-20 w-auto object-contain"
              />
            </Link>

            <p className="text-[#ff7a00] font-bold text-sm tracking-wide">
              {contacts.tagline || 'Discover More. One Hour at a Time.'}
            </p>

            <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
              {contacts.bio ||
                'India’s premier on-demand hourly tourism platform. Book verified vehicles and local guides strictly for the hours you need with 100% escrow protection.'}
            </p>

            {/* Direct Contact */}
            <div className="pt-1 space-y-1.5 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Helpline:</span>
                <a
                  href={`tel:+91${(contacts.helpline_phone || '18002008899').replace(/[^0-9]/g, '')}`}
                  className="text-white hover:text-emerald-400 font-bold"
                >
                  {contacts.helpline_phone || '1800-200-8899'}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-green-400" />
                <span>WhatsApp:</span>
                <a
                  href={`https://wa.me/${(contacts.whatsapp_number || '919842100000').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white hover:text-green-400 font-bold"
                >
                  {contacts.whatsapp_number || '+91 98421 00000'}
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center space-x-2.5 pt-2">
              <a
                href={contacts.instagram_url || 'https://instagram.com'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-[#ff7a00] text-gray-300 hover:text-white flex items-center justify-center transition-all text-xs font-bold"
                aria-label="Instagram"
              >
                IG
              </a>
              <a
                href={contacts.twitter_url || 'https://twitter.com'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-[#ff7a00] text-gray-300 hover:text-white flex items-center justify-center transition-all text-xs font-bold"
                aria-label="Twitter"
              >
                X
              </a>
              <a
                href={contacts.facebook_url || 'https://facebook.com'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-[#ff7a00] text-gray-300 hover:text-white flex items-center justify-center transition-all text-xs font-bold"
                aria-label="Facebook"
              >
                FB
              </a>
              <a
                href={contacts.linkedin_url || 'https://linkedin.com'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-[#ff7a00] text-gray-300 hover:text-white flex items-center justify-center transition-all text-xs font-bold"
                aria-label="LinkedIn"
              >
                IN
              </a>
            </div>
          </div>

          {/* Column 1: HOURLY SERVICES */}
          <div className="md:col-span-1 lg:col-span-2">
            <Link href="/hourly-services" className="inline-block mb-4 group">
              <h4 className="text-white font-bold text-sm tracking-wider uppercase group-hover:text-emerald-400 transition-colors">
                Hourly Services
              </h4>
            </Link>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/explore?category=bike"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Bikes by the Hour
                </Link>
              </li>
              <li>
                <Link
                  href="/explore?category=car"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Cars by the Hour
                </Link>
              </li>
              <li>
                <Link
                  href="/explore?category=van"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Vans by the Hour
                </Link>
              </li>
              <li className="pt-2 border-t border-gray-800">
                <Link
                  href="/regional-guides"
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors flex items-center gap-1.5"
                >
                  <span>📍</span>
                  <span>Regional Hourly Travel Guides</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: PROVIDERS & HOSTS */}
          <div className="md:col-span-1 lg:col-span-2">
            <Link href="/providers-hosts" className="inline-block mb-4 group">
              <h4 className="text-white font-bold text-sm tracking-wider uppercase group-hover:text-emerald-400 transition-colors">
                Providers & Hosts
              </h4>
            </Link>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/become-provider"
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Become a Provider
                </Link>
              </li>
              <li>
                <Link
                  href="/provider"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Provider Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/how-earnings-work"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  How Earnings Work
                </Link>
              </li>
              <li>
                <Link
                  href="/quality-guidelines"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Quality Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: SUPPORT & LEGAL */}
          <div className="md:col-span-1 lg:col-span-3">
            <Link href="/support-legal" className="inline-block mb-4 group">
              <h4 className="text-white font-bold text-sm tracking-wider uppercase group-hover:text-emerald-400 transition-colors">
                Support & Legal
              </h4>
            </Link>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/cancellation-policy"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/faqs"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Hourly Tourism Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center text-emerald-400">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-500" />
              100% Escrow Protection
            </span>
            <span>•</span>
            <span className="flex items-center text-gray-400">
              <Clock className="w-4 h-4 mr-1.5 text-[#ff7a00]" />
              Hourly Flexible Scheduling
            </span>
            <span>•</span>
            <span className="flex items-center text-gray-400">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-blue-400" />
              Verified Local Hosts
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
