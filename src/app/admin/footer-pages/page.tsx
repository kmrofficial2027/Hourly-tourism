'use client'

import React, { useState, useEffect } from 'react'
import {
  FileText,
  Save,
  RefreshCw,
  ExternalLink,
  Layers,
  Bike,
  User,
  Briefcase,
  Scale,
  Phone,
  Check,
  Plus,
  Trash2,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Compass,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { showToast } from '@/components/ui/Toast'
import {
  DEFAULT_FOOTER_PAGES_SETTINGS,
  FooterPagesSettings,
  HourlyServiceItem,
  TouristPortalFeature,
  TouristStep,
  HostOperatorClass,
  LegalDocumentItem,
} from '@/lib/footerCategoryPages'

export default function AdminFooterPagesManagement() {
  const [activeTab, setActiveTab] = useState<
    'hourly_services' | 'tourist_portal' | 'providers_hosts' | 'support_legal' | 'footer_contacts'
  >('hourly_services')

  const [settings, setSettings] = useState<FooterPagesSettings>(DEFAULT_FOOTER_PAGES_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/footer-pages?t=${Date.now()}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data.settings) {
          setSettings(data.settings)
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
      showToast.error('Could not load current settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/footer-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast.success('Footer category pages and copy updated live!')
      } else {
        showToast.error(data.error || 'Failed to save changes')
      }
    } catch {
      showToast.error('Network error saving changes')
    } finally {
      setSaving(false)
    }
  }

  // Helpers to update sub-objects
  const updateHourly = (key: string, val: any) => {
    setSettings((prev) => ({
      ...prev,
      hourly_services: { ...prev.hourly_services, [key]: val },
    }))
  }

  const updateTourist = (key: string, val: any) => {
    setSettings((prev) => ({
      ...prev,
      tourist_portal: { ...prev.tourist_portal, [key]: val },
    }))
  }

  const updateHosts = (key: string, val: any) => {
    setSettings((prev) => ({
      ...prev,
      providers_hosts: { ...prev.providers_hosts, [key]: val },
    }))
  }

  const updateLegal = (key: string, val: any) => {
    setSettings((prev) => ({
      ...prev,
      support_legal: { ...prev.support_legal, [key]: val },
    }))
  }

  const updateContacts = (key: string, val: any) => {
    setSettings((prev) => ({
      ...prev,
      footer_contacts: { ...prev.footer_contacts, [key]: val },
    }))
  }

  const getPreviewLink = () => {
    switch (activeTab) {
      case 'hourly_services':
        return '/hourly-services'
      case 'tourist_portal':
        return '/tourist-portal'
      case 'providers_hosts':
        return '/providers-hosts'
      case 'support_legal':
        return '/support-legal'
      case 'footer_contacts':
        return '/'
    }
  }

  return (
    <DashboardLayout role="admin" title="Footer & Category Pages Control">
      <div className="space-y-6 max-w-6xl">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-emerald-600" /> Public Pages CMS
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 font-display">
              Footer & Category Pages Control
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Edit hero copy, tariffs, operator guides, protections, and helpline details across all footer category landing pages.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={getPreviewLink()}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-1.5 transition"
            >
              <span>Live Preview</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
            </a>

            <Button
              variant="outline"
              size="sm"
              onClick={loadSettings}
              disabled={loading}
              className="rounded-xl"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Reload
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl font-bold shadow-md"
            >
              <Save className="w-3.5 h-3.5 mr-1.5 text-emerald-300" />
              {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar gap-2 sm:gap-6 text-xs sm:text-sm font-bold">
          <button
            onClick={() => setActiveTab('hourly_services')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'hourly_services'
                ? 'border-[#0a4d29] text-[#0a4d29]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>1. Hourly Services Page</span>
          </button>

          <button
            onClick={() => setActiveTab('tourist_portal')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'tourist_portal'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4" />
            <span>2. Tourist Portal Page</span>
          </button>

          <button
            onClick={() => setActiveTab('providers_hosts')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'providers_hosts'
                ? 'border-[#ff7a00] text-[#ff7a00]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>3. Providers & Hosts Page</span>
          </button>

          <button
            onClick={() => setActiveTab('support_legal')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'support_legal'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>4. Support & Legal Page</span>
          </button>

          <button
            onClick={() => setActiveTab('footer_contacts')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'footer_contacts'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>5. Footer Contacts & Socials</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: HOURLY SERVICES PAGE                                    */}
        {/* ============================================================== */}
        {activeTab === 'hourly_services' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-black text-gray-900 font-display">
                Hero Header Configuration
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Hero Eyebrow Badge"
                  value={settings.hourly_services.hero_eyebrow}
                  onChange={(e) => updateHourly('hero_eyebrow', e.target.value)}
                />
                <Input
                  label="Hero Headline Title"
                  value={settings.hourly_services.hero_title}
                  onChange={(e) => updateHourly('hero_title', e.target.value)}
                />
              </div>
              <Textarea
                label="Hero Subtitle & Introduction"
                rows={2}
                value={settings.hourly_services.hero_subtitle}
                onChange={(e) => updateHourly('hero_subtitle', e.target.value)}
              />
            </div>

            {/* Service Items Editor */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-900 font-display uppercase tracking-wider">
                Hourly Offerings & Tariffs ({settings.hourly_services.services.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {settings.hourly_services.services.map((svc, idx) => (
                  <div
                    key={svc.id}
                    className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
                        Service #{idx + 1}: {svc.category}
                      </span>
                      <Input
                        label=""
                        value={svc.badge}
                        onChange={(e) => {
                          const updated = [...settings.hourly_services.services]
                          updated[idx].badge = e.target.value
                          updateHourly('services', updated)
                        }}
                        placeholder="Badge text"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Service Title"
                        value={svc.title}
                        onChange={(e) => {
                          const updated = [...settings.hourly_services.services]
                          updated[idx].title = e.target.value
                          updateHourly('services', updated)
                        }}
                      />
                      <Input
                        label="Starting Rate (₹ / hr)"
                        type="number"
                        value={String(svc.startingRate)}
                        onChange={(e) => {
                          const updated = [...settings.hourly_services.services]
                          updated[idx].startingRate = Number(e.target.value) || 0
                          updateHourly('services', updated)
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Min Booking Hours"
                        type="number"
                        value={String(svc.minHours)}
                        onChange={(e) => {
                          const updated = [...settings.hourly_services.services]
                          updated[idx].minHours = Number(e.target.value) || 1
                          updateHourly('services', updated)
                        }}
                      />
                      <Input
                        label="Max Allowed Hours"
                        type="number"
                        value={String(svc.maxHours)}
                        onChange={(e) => {
                          const updated = [...settings.hourly_services.services]
                          updated[idx].maxHours = Number(e.target.value) || 12
                          updateHourly('services', updated)
                        }}
                      />
                    </div>

                    <Textarea
                      label="Short Tagline"
                      rows={2}
                      value={svc.tagline}
                      onChange={(e) => {
                        const updated = [...settings.hourly_services.services]
                        updated[idx].tagline = e.target.value
                        updateHourly('services', updated)
                      }}
                    />

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Inclusions (1 per line)
                      </label>
                      <textarea
                        rows={3}
                        value={svc.inclusions.join('\n')}
                        onChange={(e) => {
                          const updated = [...settings.hourly_services.services]
                          updated[idx].inclusions = e.target.value.split('\n').filter((l) => l.trim())
                          updateHourly('services', updated)
                        }}
                        className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom CTA Banner */}
            <div className="p-6 bg-white rounded-3xl border border-gray-200 space-y-3">
              <h3 className="text-sm font-black text-gray-900 font-display">Bottom Banner Callout</h3>
              <Input
                label="Banner Headline"
                value={settings.hourly_services.cta_title}
                onChange={(e) => updateHourly('cta_title', e.target.value)}
              />
              <Textarea
                label="Banner Description"
                rows={2}
                value={settings.hourly_services.cta_subtitle}
                onChange={(e) => updateHourly('cta_subtitle', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: TOURIST PORTAL PAGE                                     */}
        {/* ============================================================== */}
        {activeTab === 'tourist_portal' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-black text-gray-900 font-display">
                Tourist Portal Hero Configuration
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Eyebrow Badge"
                  value={settings.tourist_portal.hero_eyebrow}
                  onChange={(e) => updateTourist('hero_eyebrow', e.target.value)}
                />
                <Input
                  label="Headline Title"
                  value={settings.tourist_portal.hero_title}
                  onChange={(e) => updateTourist('hero_title', e.target.value)}
                />
              </div>
              <Textarea
                label="Introduction Description"
                rows={2}
                value={settings.tourist_portal.hero_subtitle}
                onChange={(e) => updateTourist('hero_subtitle', e.target.value)}
              />
            </div>

            {/* 4 Feature Cards */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-900 font-display uppercase tracking-wider">
                Tourist Quick Action Cards (4)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {settings.tourist_portal.features.map((feat, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-700">Card #{i + 1}</span>
                      <Input
                        label=""
                        value={feat.badge}
                        onChange={(e) => {
                          const updated = [...settings.tourist_portal.features]
                          updated[i].badge = e.target.value
                          updateTourist('features', updated)
                        }}
                        placeholder="Badge"
                      />
                    </div>
                    <Input
                      label="Card Title"
                      value={feat.title}
                      onChange={(e) => {
                        const updated = [...settings.tourist_portal.features]
                        updated[i].title = e.target.value
                        updateTourist('features', updated)
                      }}
                    />
                    <Textarea
                      label="Description"
                      rows={2}
                      value={feat.description}
                      onChange={(e) => {
                        const updated = [...settings.tourist_portal.features]
                        updated[i].description = e.target.value
                        updateTourist('features', updated)
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 5 Steps to Perfect Trip */}
            <div className="p-6 bg-white rounded-3xl border border-gray-200 space-y-4">
              <h3 className="text-sm font-black text-gray-900 font-display">
                5-Step Booking Workflow Explainer
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {settings.tourist_portal.steps.map((st, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                    <span className="text-xs font-black text-blue-600 block">Step {st.step}</span>
                    <Input
                      label="Step Title"
                      value={st.title}
                      onChange={(e) => {
                        const updated = [...settings.tourist_portal.steps]
                        updated[i].title = e.target.value
                        updateTourist('steps', updated)
                      }}
                    />
                    <textarea
                      rows={3}
                      value={st.description}
                      onChange={(e) => {
                        const updated = [...settings.tourist_portal.steps]
                        updated[i].description = e.target.value
                        updateTourist('steps', updated)
                      }}
                      className="w-full p-2 rounded-lg border border-gray-200 text-xs text-gray-700 outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: PROVIDERS & HOSTS PAGE                                  */}
        {/* ============================================================== */}
        {activeTab === 'providers_hosts' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-black text-gray-900 font-display">
                Providers & Hosts Hero Configuration
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Eyebrow Badge"
                  value={settings.providers_hosts.hero_eyebrow}
                  onChange={(e) => updateHosts('hero_eyebrow', e.target.value)}
                />
                <Input
                  label="Headline Title"
                  value={settings.providers_hosts.hero_title}
                  onChange={(e) => updateHosts('hero_title', e.target.value)}
                />
              </div>
              <Textarea
                label="Partner Value Pitch"
                rows={2}
                value={settings.providers_hosts.hero_subtitle}
                onChange={(e) => updateHosts('hero_subtitle', e.target.value)}
              />
            </div>

            {/* Operator Classes */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-900 font-display uppercase tracking-wider">
                Operator Models & Daily Earning Ranges (4)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {settings.providers_hosts.operator_classes.map((cls, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-orange-600">Model #{i + 1}</span>
                      <Input
                        label="Daily Potential"
                        value={cls.earningRange}
                        onChange={(e) => {
                          const updated = [...settings.providers_hosts.operator_classes]
                          updated[i].earningRange = e.target.value
                          updateHosts('operator_classes', updated)
                        }}
                      />
                    </div>
                    <Input
                      label="Class Title"
                      value={cls.title}
                      onChange={(e) => {
                        const updated = [...settings.providers_hosts.operator_classes]
                        updated[i].title = e.target.value
                        updateHosts('operator_classes', updated)
                      }}
                    />
                    <Textarea
                      label="Tagline Description"
                      rows={2}
                      value={cls.tagline}
                      onChange={(e) => {
                        const updated = [...settings.providers_hosts.operator_classes]
                        updated[i].tagline = e.target.value
                        updateHosts('operator_classes', updated)
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 4 Host Benefits */}
            <div className="p-6 bg-white rounded-3xl border border-gray-200 space-y-4">
              <h3 className="text-sm font-black text-gray-900 font-display">
                Key Host Protection & Earning Guarantees (4)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {settings.providers_hosts.benefits.map((ben, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                    <Input
                      label="Benefit Title"
                      value={ben.title}
                      onChange={(e) => {
                        const updated = [...settings.providers_hosts.benefits]
                        updated[i].title = e.target.value
                        updateHosts('benefits', updated)
                      }}
                    />
                    <textarea
                      rows={2}
                      value={ben.description}
                      onChange={(e) => {
                        const updated = [...settings.providers_hosts.benefits]
                        updated[i].description = e.target.value
                        updateHosts('benefits', updated)
                      }}
                      className="w-full p-2 rounded-lg border border-gray-200 text-xs text-gray-700 outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: SUPPORT & LEGAL PAGE                                    */}
        {/* ============================================================== */}
        {activeTab === 'support_legal' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-black text-gray-900 font-display">
                Support & Legal Hub Hero Configuration
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Eyebrow Badge"
                  value={settings.support_legal.hero_eyebrow}
                  onChange={(e) => updateLegal('hero_eyebrow', e.target.value)}
                />
                <Input
                  label="Headline Title"
                  value={settings.support_legal.hero_title}
                  onChange={(e) => updateLegal('hero_title', e.target.value)}
                />
              </div>
              <Textarea
                label="Compliance & Standards Introduction"
                rows={2}
                value={settings.support_legal.hero_subtitle}
                onChange={(e) => updateLegal('hero_subtitle', e.target.value)}
              />
            </div>

            {/* Direct Escalation Contacts */}
            <div className="p-6 bg-white rounded-3xl border border-gray-200 space-y-4">
              <h3 className="text-sm font-black text-gray-900 font-display">
                Emergency & Grievance Contact Channels
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="24/7 Helpline (Toll Free)"
                  value={settings.support_legal.helpline_phone}
                  onChange={(e) => updateLegal('helpline_phone', e.target.value)}
                />
                <Input
                  label="WhatsApp Desk Number"
                  value={settings.support_legal.whatsapp_number}
                  onChange={(e) => updateLegal('whatsapp_number', e.target.value)}
                />
                <Input
                  label="Grievance Officer Email"
                  value={settings.support_legal.support_email}
                  onChange={(e) => updateLegal('support_email', e.target.value)}
                />
              </div>
            </div>

            {/* 6 Legal Documents */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-900 font-display uppercase tracking-wider">
                Official Legal Policies & Governance Cards (6)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {settings.support_legal.documents.map((doc, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-purple-700">Policy #{i + 1}</span>
                      <Input
                        label=""
                        value={doc.badge}
                        onChange={(e) => {
                          const updated = [...settings.support_legal.documents]
                          updated[i].badge = e.target.value
                          updateLegal('documents', updated)
                        }}
                        placeholder="Badge"
                      />
                    </div>
                    <Input
                      label="Document Title"
                      value={doc.title}
                      onChange={(e) => {
                        const updated = [...settings.support_legal.documents]
                        updated[i].title = e.target.value
                        updateLegal('documents', updated)
                      }}
                    />
                    <Textarea
                      label="Brief Summary"
                      rows={2}
                      value={doc.tagline}
                      onChange={(e) => {
                        const updated = [...settings.support_legal.documents]
                        updated[i].tagline = e.target.value
                        updateLegal('documents', updated)
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: FOOTER CONTACTS & SOCIALS                               */}
        {/* ============================================================== */}
        {activeTab === 'footer_contacts' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-black text-gray-900 font-display">
                Footer Brand & Contact Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="24/7 Helpline Phone"
                  value={settings.footer_contacts.helpline_phone}
                  onChange={(e) => updateContacts('helpline_phone', e.target.value)}
                />
                <Input
                  label="WhatsApp Desk Number"
                  value={settings.footer_contacts.whatsapp_number}
                  onChange={(e) => updateContacts('whatsapp_number', e.target.value)}
                />
              </div>
              <Input
                label="Footer Brand Tagline"
                value={settings.footer_contacts.tagline}
                onChange={(e) => updateContacts('tagline', e.target.value)}
              />
              <Textarea
                label="Footer Bio & Mission Description"
                rows={2}
                value={settings.footer_contacts.bio}
                onChange={(e) => updateContacts('bio', e.target.value)}
              />
            </div>

            {/* Social Media Links */}
            <div className="p-6 bg-white rounded-3xl border border-gray-200 space-y-4">
              <h3 className="text-sm font-black text-gray-900 font-display">Social Media Channels</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Instagram Profile URL"
                  value={settings.footer_contacts.instagram_url}
                  onChange={(e) => updateContacts('instagram_url', e.target.value)}
                />
                <Input
                  label="Twitter / X Profile URL"
                  value={settings.footer_contacts.twitter_url}
                  onChange={(e) => updateContacts('twitter_url', e.target.value)}
                />
                <Input
                  label="Facebook Page URL"
                  value={settings.footer_contacts.facebook_url}
                  onChange={(e) => updateContacts('facebook_url', e.target.value)}
                />
                <Input
                  label="LinkedIn Profile URL"
                  value={settings.footer_contacts.linkedin_url}
                  onChange={(e) => updateContacts('linkedin_url', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Floating Bottom Save Action Bar */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 flex items-center justify-between shadow-sm">
          <span className="text-xs text-gray-500">
            Changes to footer category pages persist directly to live platform settings.
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl font-bold shadow-md"
          >
            <Save className="w-3.5 h-3.5 mr-1.5 text-emerald-300" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

