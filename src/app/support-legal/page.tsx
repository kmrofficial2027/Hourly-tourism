'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  FileText,
  Lock,
  HelpCircle,
  Phone,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  Scale,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  DEFAULT_FOOTER_PAGES_SETTINGS,
  SupportLegalSettings,
} from '@/lib/footerCategoryPages'

export default function SupportAndLegalPage() {
  const [data, setData] = useState<SupportLegalSettings>(
    DEFAULT_FOOTER_PAGES_SETTINGS.support_legal
  )

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`/api/admin/footer-pages?t=${Date.now()}`, { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          if (json.settings?.support_legal) {
            setData(json.settings.support_legal)
          }
        }
      } catch (err) {
        console.error('Failed to fetch support legal settings:', err)
      }
    }
    fetchSettings()
  }, [])

  const DOC_ICONS = [ShieldCheck, FileText, Lock, HelpCircle, Phone, Scale]

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-purple-600 selection:text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 text-white py-16 sm:py-24 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 backdrop-blur-md border border-purple-400/30 text-xs font-black uppercase tracking-wider text-purple-300">
              <Scale className="w-3.5 h-3.5" />
              <span>{data.hero_eyebrow || 'Trust, Safety & Governance'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight leading-tight">
              {data.hero_title || 'Support & Legal Knowledge Center'}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              {data.hero_subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <a
                href={`tel:+91${(data.helpline_phone || '18002008899').replace(/[^0-9]/g, '')}`}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition-all shadow-lg flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call 24/7 Helpline: {data.helpline_phone || '1800-200-8899'}</span>
              </a>
              <Link
                href="/cancellation-policy"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all"
              >
                Read Escrow Policy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Legal Documents Directory */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-16">
        <div>
          <div className="max-w-2xl space-y-1 mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-purple-600">
              Policy & Support Directory
            </span>
            <h2 className="text-2xl font-black text-gray-900 font-display">
              Official Legal Policies & Help Channels
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.documents.map((doc, i) => {
              const Icon = DOC_ICONS[i % DOC_ICONS.length]
              return (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:border-purple-300"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold shadow-inner group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gray-100 text-gray-700">
                        {doc.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-gray-900 group-hover:text-purple-600 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {doc.tagline}
                      </p>
                    </div>

                    {doc.keyPoints?.length > 0 && (
                      <div className="pt-3 border-t border-gray-100 space-y-1.5">
                        {doc.keyPoints.map((pt, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-5 mt-4 border-t border-gray-100">
                    <Link
                      href={doc.link}
                      className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-800 text-xs font-black flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>Read Full Document</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Dispute Resolution Process Explainer */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-sm space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200">
              Dispute Protocol
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
              {data.dispute_title || 'How the 2-Hour Escrow Mediation Desk Works'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              {data.dispute_subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {data.dispute_steps.map((s, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 relative"
              >
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center mb-2">
                  {s.step}
                </div>
                <h4 className="text-sm font-black text-gray-900">{s.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Escalation Matrix */}
        <div className="rounded-3xl p-8 bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1">
            <h3 className="text-lg font-black font-display">Need Immediate Escalation on an Active Trip?</h3>
            <p className="text-xs text-slate-400">
              Our live trip coordinators are available 24/7 on WhatsApp and direct phone.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={`https://wa.me/${(data.whatsapp_number || '919842100000').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-black flex items-center gap-1.5 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Coordinator ({data.whatsapp_number || '+91 98421 00000'})</span>
            </a>
            <Link
              href="/contact"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition"
            >
              View Contact Directory
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
