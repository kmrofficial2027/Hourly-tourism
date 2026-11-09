'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Save,
  RotateCcw,
  ExternalLink,
  Plus,
  Trash2,
  DollarSign,
  Clock,
  HelpCircle,
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FullPageLoader } from '@/components/ui/LoadingSpinner'
import { showToast } from '@/components/ui/Toast'
import {
  DEFAULT_HUMAN_GUIDE_SETTINGS,
  HumanGuideSettings,
  HumanGuidePackage,
  HumanGuideUseCase,
  HumanGuideFAQ,
} from '@/lib/humanGuideSettings'

export default function AdminHumanGuidePage() {
  const [settings, setSettings] = useState<HumanGuideSettings>(DEFAULT_HUMAN_GUIDE_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'pricing' | 'packages' | 'useCases' | 'faqs'>('pricing')

  useEffect(() => {
    async function loadSettings() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/human-guide')
        if (res.ok) {
          const data = await res.json()
          if (data.settings) {
            setSettings(data.settings)
          }
        }
      } catch (err) {
        showToast.error('Failed to load Human-Ⅰ guide configuration')
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/human-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })

      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings)
        showToast.success('✨ Human-Ⅰ Guide & Pricing updated in Supabase! Reflects immediately on live page.')
      } else {
        const errData = await res.json().catch(() => ({}))
        showToast.error(errData.error || 'Failed to save settings')
      }
    } catch {
      showToast.error('Network error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const handleResetToDefaults = () => {
    if (confirm('Reset all Human-Ⅰ guide settings and pricing to system defaults?')) {
      setSettings(DEFAULT_HUMAN_GUIDE_SETTINGS)
      showToast.success('Reset to default values. Click Save to publish.')
    }
  }

  // Package Handlers
  const handlePackageChange = (index: number, field: keyof HumanGuidePackage, value: any) => {
    setSettings((prev) => {
      const updated = [...prev.packages]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, packages: updated }
    })
  }

  const handleAddPackage = () => {
    setSettings((prev) => ({
      ...prev,
      packages: [
        ...prev.packages,
        {
          id: `pkg-${Date.now()}`,
          name: 'Custom Package',
          duration_hours: 4,
          price: 999,
          discount_label: 'Custom Deal',
          description: 'Custom duration package description.',
        },
      ],
    }))
  }

  const handleRemovePackage = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      packages: prev.packages.filter((_, i) => i !== index),
    }))
  }

  // Use Case Handlers
  const handleUseCaseChange = (index: number, field: keyof HumanGuideUseCase, value: any) => {
    setSettings((prev) => {
      const updated = [...prev.useCases]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, useCases: updated }
    })
  }

  // FAQ Handlers
  const handleFaqChange = (index: number, field: keyof HumanGuideFAQ, value: string) => {
    setSettings((prev) => {
      const updated = [...prev.faqs]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, faqs: updated }
    })
  }

  const handleAddFaq = () => {
    setSettings((prev) => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        {
          q: 'New Question?',
          a: 'Explanation of how Human-Ⅰ handles this requirement.',
        },
      ],
    }))
  }

  const handleRemoveFaq = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }))
  }

  if (loading) {
    return (
      <DashboardLayout role="admin" title="Human-Ⅰ Guide & Pricing Manager">
        <FullPageLoader text="Loading Human-Ⅰ guide settings from Supabase..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin" title="Human-Ⅰ Guide & Pricing Manager">
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-purple-500/20">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Supabase Live Sync • Human-Ⅰ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              Human-Ⅰ Guide & Pricing Control
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/90 max-w-2xl">
              Configure base hourly rates, duration discount packages, use-case cards, and FAQ details. Any edits saved here store directly in Supabase and reflect on the public guide page immediately.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/guides/book-your-humani" target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                View Live Guide
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              isLoading={saving}
              onClick={handleSave}
              className="bg-[#ff7a00] hover:bg-[#e06c00] text-white font-black text-xs shadow-lg"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save to Supabase
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'pricing'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            💰 Pricing & Hero
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'packages'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            📦 Hourly Packages ({settings.packages.length})
          </button>
          <button
            onClick={() => setActiveTab('useCases')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'useCases'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            🤝 6 Use Cases ({settings.useCases.length})
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'faqs'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            ❓ FAQs ({settings.faqs.length})
          </button>
        </div>

        {/* TAB 1: Base Pricing & Hero Copy */}
        {activeTab === 'pricing' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-base font-black text-gray-900 font-display">
              1. Base Hourly Rate & Platform Limits
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Base Hourly Rate (₹ / hr)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-bold">₹</span>
                  <Input
                    type="number"
                    min={99}
                    max={1999}
                    value={settings.baseHourlyRate}
                    onChange={(e) =>
                      setSettings({ ...settings, baseHourlyRate: Number(e.target.value) || 299 })
                    }
                    className="pl-8 font-bold text-emerald-800"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Starting baseline charge per 1 hour.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Minimum Booking Hours
                </label>
                <Input
                  type="number"
                  min={1}
                  max={6}
                  value={settings.minimumHours}
                  onChange={(e) =>
                    setSettings({ ...settings, minimumHours: Number(e.target.value) || 1 })
                  }
                  className="font-bold text-gray-800"
                />
                <p className="text-[10px] text-gray-400 mt-1">Shortest session customer can book.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Maximum Booking Hours
                </label>
                <Input
                  type="number"
                  min={6}
                  max={24}
                  value={settings.maximumHours}
                  onChange={(e) =>
                    setSettings({ ...settings, maximumHours: Number(e.target.value) || 12 })
                  }
                  className="font-bold text-gray-800"
                />
                <p className="text-[10px] text-gray-400 mt-1">Max daily hours in single reservation.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-4">
              <h2 className="text-base font-black text-gray-900 font-display">
                2. Hero Banner Copy
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Hero Badge Text
                  </label>
                  <Input
                    value={settings.badgeText}
                    onChange={(e) => setSettings({ ...settings, badgeText: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Support Phone Number
                  </label>
                  <Input
                    value={settings.supportPhone}
                    onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Hero Main Headline
                </label>
                <Input
                  value={settings.heroHeadline}
                  onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
                  className="font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Hero Subheadline Description
                </label>
                <Textarea
                  rows={3}
                  value={settings.heroSubheadline}
                  onChange={(e) => setSettings({ ...settings, heroSubheadline: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Hourly Discount Packages */}
        {activeTab === 'packages' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-base font-black text-gray-900 font-display">
                  Hourly Duration Packages
                </h2>
                <p className="text-xs text-gray-500">
                  Pre-configured hourly options shown in the pricing table on the Human-Ⅰ guide.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddPackage}
                className="text-xs font-bold text-purple-700 border-purple-200"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Package
              </Button>
            </div>

            <div className="space-y-4">
              {settings.packages.map((pkg, idx) => (
                <div
                  key={pkg.id || idx}
                  className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase text-purple-800 tracking-wider">
                      Tier #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePackage(idx)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Remove package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Package Name
                      </label>
                      <Input
                        value={pkg.name}
                        onChange={(e) => handlePackageChange(idx, 'name', e.target.value)}
                        className="font-bold text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Duration (Hours)
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={24}
                        value={pkg.duration_hours}
                        onChange={(e) =>
                          handlePackageChange(idx, 'duration_hours', Number(e.target.value) || 1)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Price (₹)
                      </label>
                      <Input
                        type="number"
                        min={99}
                        value={pkg.price}
                        onChange={(e) =>
                          handlePackageChange(idx, 'price', Number(e.target.value) || 299)
                        }
                        className="font-bold text-emerald-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Discount / Savings Label
                      </label>
                      <Input
                        value={pkg.discount_label}
                        onChange={(e) => handlePackageChange(idx, 'discount_label', e.target.value)}
                        placeholder="e.g. Save 16%"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Package Description
                      </label>
                      <Input
                        value={pkg.description}
                        onChange={(e) => handlePackageChange(idx, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: 6 Use Cases */}
        {activeTab === 'useCases' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-black text-gray-900 font-display">
                6 Verified Human-Ⅰ Capabilities & Use Cases
              </h2>
              <p className="text-xs text-gray-500">
                These cards inform customers what tasks a verified Human-Ⅰ can be booked for.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settings.useCases.map((uc, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <Input
                      value={uc.icon}
                      onChange={(e) => handleUseCaseChange(idx, 'icon', e.target.value)}
                      className="w-12 text-center text-lg p-1 font-bold"
                      title="Emoji Icon"
                    />
                    <div className="flex-1">
                      <Input
                        value={uc.title}
                        onChange={(e) => handleUseCaseChange(idx, 'title', e.target.value)}
                        className="font-bold text-xs"
                        placeholder="Title"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={uc.subtitle}
                      onChange={(e) => handleUseCaseChange(idx, 'subtitle', e.target.value)}
                      className="text-[11px]"
                      placeholder="Subtitle"
                    />
                    <Input
                      value={uc.tag}
                      onChange={(e) => handleUseCaseChange(idx, 'tag', e.target.value)}
                      className="text-[11px] font-semibold text-purple-700"
                      placeholder="Badge Tag"
                    />
                  </div>

                  <Textarea
                    rows={2}
                    value={uc.description}
                    onChange={(e) => handleUseCaseChange(idx, 'description', e.target.value)}
                    className="text-xs"
                    placeholder="Description"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: FAQs */}
        {activeTab === 'faqs' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-base font-black text-gray-900 font-display">
                  Frequently Asked Questions
                </h2>
                <p className="text-xs text-gray-500">
                  Detailed Q&A answering customer questions about booking a Human-Ⅰ.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddFaq}
                className="text-xs font-bold text-purple-700 border-purple-200"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add FAQ
              </Button>
            </div>

            <div className="space-y-4">
              {settings.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900">FAQ #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(idx)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <Input
                    value={faq.q}
                    onChange={(e) => handleFaqChange(idx, 'q', e.target.value)}
                    className="font-bold text-xs"
                    placeholder="Question"
                  />
                  <Textarea
                    rows={2}
                    value={faq.a}
                    onChange={(e) => handleFaqChange(idx, 'a', e.target.value)}
                    className="text-xs"
                    placeholder="Answer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetToDefaults}
            className="text-xs text-gray-500 hover:text-red-600 border-gray-300"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset to Defaults
          </Button>

          <Button
            variant="primary"
            isLoading={saving}
            onClick={handleSave}
            className="bg-[#0a4d29] hover:bg-[#083c20] text-white font-black text-xs px-6 py-2.5 shadow-md"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Save & Publish to Live Guide
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

