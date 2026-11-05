'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  MapPin,
  Plus,
  Compass,
  Check,
  X,
  Edit,
  Trash2,
  RefreshCw,
  ExternalLink,
  Sparkles,
  UploadCloud,
  Image as ImageIcon,
  Camera,
  Navigation,
  BookOpen,
  Save,
  Eye,
  EyeOff,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { showToast } from '@/components/ui/Toast'
import {
  CityDestination,
  CitySpot,
  CityRegionalGuide,
  RegionalGuideCircuit,
  RegionalGuideDistance,
  RegionalGuideTip,
} from '@/lib/destinations'
import { CityLocationPicker } from '@/components/admin/CityLocationPicker'
import {
  DEFAULT_HOMEPAGE_FEATURED_SETTINGS,
  ShowcaseRiderHost,
  HomepageFeaturedSettings,
} from '@/lib/homepageFeatured'

export default function AdminDestinationsPage() {
  const [mainTab, setMainTab] = useState<'destinations' | 'showcase'>('destinations')
  const [destinations, setDestinations] = useState<CityDestination[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [states, setStates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Homepage Showcase & Region Bundles State
  const [featuredSettings, setFeaturedSettings] = useState<HomepageFeaturedSettings>(
    DEFAULT_HOMEPAGE_FEATURED_SETTINGS
  )
  const [featuredLoading, setFeaturedLoading] = useState(false)
  const [featuredSaving, setFeaturedSaving] = useState(false)
  const [selectedBundleRegion, setSelectedBundleRegion] = useState('Pollachi')
  const [showHostModal, setShowHostModal] = useState(false)
  const [editingHost, setEditingHost] = useState<ShowcaseRiderHost | null>(null)

  // Host modal form state
  const [hostBusinessName, setHostBusinessName] = useState('')
  const [hostTitle, setHostTitle] = useState('')
  const [hostTagline, setHostTagline] = useState('')
  const [hostRegion, setHostRegion] = useState('Coimbatore')
  const [hostCategory, setHostCategory] = useState<any>('bike')
  const [hostStartingRate, setHostStartingRate] = useState(180)
  const [hostImageUrl, setHostImageUrl] = useState('')
  const [hostBadge, setHostBadge] = useState('Top Rated Rider Host')
  const [hostFeatures, setHostFeatures] = useState('')
  const [hostExploreQuery, setHostExploreQuery] = useState('')

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'draft'>('all')

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCity, setEditingCity] = useState<CityDestination | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newStateName, setNewStateName] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [isGeneratingAiSpots, setIsGeneratingAiSpots] = useState(false)

  // Form states for Add/Edit
  const [cityName, setCityName] = useState('')
  const [cityState, setCityState] = useState('Tamil Nadu')
  const [cityCategory, setCityCategory] = useState('')
  const [cityDesc, setCityDesc] = useState('')
  const [cityImage, setCityImage] = useState('')
  const [cityLat, setCityLat] = useState('11.0168')
  const [cityLng, setCityLng] = useState('76.9558')
  const [cityIsActive, setCityIsActive] = useState(true)
  const [topSpots, setTopSpots] = useState<CitySpot[]>([])
  const [hiddenSpots, setHiddenSpots] = useState<CitySpot[]>([])
  const [cityGuide, setCityGuide] = useState<CityRegionalGuide | null>(null)
  const [modalTab, setModalTab] = useState<'spots' | 'guide'>('spots')

  const coverImageInputRef = useRef<HTMLInputElement>(null)
  const hostModalImageRef = useRef<HTMLInputElement>(null)
  const hostCardImageRef = useRef<HTMLInputElement>(null)
  const [targetHostIdForCardUpload, setTargetHostIdForCardUpload] = useState<string | null>(null)

  // Direct 1-click host card photo replacement
  const triggerHostCardImageUpload = (hostId: string) => {
    setTargetHostIdForCardUpload(hostId)
    if (hostCardImageRef.current) {
      hostCardImageRef.current.value = ''
      hostCardImageRef.current.click()
    }
  }

  const handleHostCardImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !targetHostIdForCardUpload) return

    if (!file.type.startsWith('image/')) {
      showToast.error('Please upload a valid image file (PNG, JPG, or WebP)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast.error('Image size must be less than 5 MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string
      const updatedHosts = (featuredSettings.hosts || []).map((h) =>
        h.id === targetHostIdForCardUpload ? { ...h, image_url: base64 } : h
      )
      const newSettings = { ...featuredSettings, hosts: updatedHosts }
      setFeaturedSettings(newSettings)
      handleSaveFeaturedSettings(newSettings)
      showToast.success('Showcase host photo updated and saved!')
      setTargetHostIdForCardUpload(null)
    }
    reader.readAsDataURL(file)
  }

  // Inside modal host photo upload
  const handleHostModalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast.error('Please upload a valid image file (PNG, JPG, or WebP)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast.error('Image size must be less than 5 MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string
      setHostImageUrl(base64)
      showToast.success('Host photo uploaded!')
    }
    reader.readAsDataURL(file)
  }

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast.error('Please upload a valid image file (PNG, JPG, or WebP)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast.error('Image size must be less than 5 MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string
      setCityImage(base64)
      showToast.success('City cover photo uploaded successfully!')
    }
    reader.readAsDataURL(file)
  }

  const handleSpotImageUpload = (file: File, spotIdx: number, isHidden: boolean = false) => {
    if (!file.type.startsWith('image/')) {
      showToast.error('Please upload a valid image file')
      return
    }
    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string
      if (isHidden) {
        const c = [...hiddenSpots]
        c[spotIdx].image_url = base64
        setHiddenSpots(c)
      } else {
        const c = [...topSpots]
        c[spotIdx].image_url = base64
        setTopSpots(c)
      }
      showToast.success('Spot photo attached!')
    }
    reader.readAsDataURL(file)
  }

  // Load all destinations from Admin API
  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/destinations')
      if (res.ok) {
        const data = await res.json()
        setDestinations(data.destinations || [])
        setCategories(data.categories || [])
        setStates(data.states || [])
      }
    } catch (err) {
      console.error(err)
      showToast.error('Failed to load destinations')
    } finally {
      setLoading(false)
    }
  }

  const loadFeaturedSettings = async () => {
    setFeaturedLoading(true)
    try {
      const res = await fetch(`/api/homepage-featured?t=${Date.now()}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data.settings) {
          setFeaturedSettings(data.settings)
        }
      }
    } catch (err) {
      console.error('Error loading featured settings:', err)
    } finally {
      setFeaturedLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    loadFeaturedSettings()
  }, [])

  const handleSaveFeaturedSettings = async (customSettings?: HomepageFeaturedSettings) => {
    const toSave = customSettings || featuredSettings
    setFeaturedSaving(true)
    try {
      const res = await fetch('/api/homepage-featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: toSave }),
      })
      if (res.ok) {
        showToast.success('Explore by Region & Showcase Rider Hosts saved!')
        setFeaturedSettings(toSave)
      } else {
        const err = await res.json().catch(() => ({}))
        showToast.error(err.error || 'Failed to save settings')
      }
    } catch {
      showToast.error('Network error saving settings')
    } finally {
      setFeaturedSaving(false)
    }
  }

  const handleOpenHostModal = (host?: ShowcaseRiderHost) => {
    if (host) {
      setEditingHost(host)
      setHostBusinessName(host.business_name)
      setHostTitle(host.title)
      setHostTagline(host.tagline)
      setHostRegion(host.region)
      setHostCategory(host.category)
      setHostStartingRate(host.starting_rate)
      setHostImageUrl(host.image_url)
      setHostBadge(host.badge || 'Top Rated Rider Host')
      setHostFeatures((host.features || []).join('\n'))
      setHostExploreQuery(host.explore_query || host.business_name)
    } else {
      setEditingHost(null)
      setHostBusinessName('')
      setHostTitle('')
      setHostTagline('')
      setHostRegion(destinations[0]?.name || 'Coimbatore')
      setHostCategory('bike')
      setHostStartingRate(180)
      setHostImageUrl('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80')
      setHostBadge('Top Rated Rider Host')
      setHostFeatures('Verified Rider Host\nSanitized Helmet Provided\nScenic Foothill Stops')
      setHostExploreQuery('')
    }
    setShowHostModal(true)
  }

  const handleHostModalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!hostBusinessName.trim() || !hostTitle.trim()) {
      showToast.error('Business Name and Title are required')
      return
    }

    const feats = hostFeatures
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0)

    let updatedHosts = [...(featuredSettings.hosts || [])]

    if (editingHost) {
      updatedHosts = updatedHosts.map((h) =>
        h.id === editingHost.id
          ? {
              ...h,
              business_name: hostBusinessName.trim(),
              title: hostTitle.trim(),
              tagline: hostTagline.trim(),
              region: hostRegion.trim(),
              category: hostCategory,
              starting_rate: Number(hostStartingRate) || 180,
              image_url: hostImageUrl.trim(),
              badge: hostBadge.trim(),
              features: feats,
              explore_query: hostExploreQuery.trim() || hostBusinessName.trim(),
            }
          : h
      )
    } else {
      const newHost: ShowcaseRiderHost = {
        id: `host-${Date.now()}`,
        business_name: hostBusinessName.trim(),
        title: hostTitle.trim(),
        tagline: hostTagline.trim(),
        region: hostRegion.trim(),
        category: hostCategory,
        starting_rate: Number(hostStartingRate) || 180,
        rating: 4.9,
        reviews_count: 50,
        image_url: hostImageUrl.trim(),
        badge: hostBadge.trim(),
        features: feats,
        explore_query: hostExploreQuery.trim() || hostBusinessName.trim(),
        is_active: true,
      }
      updatedHosts.push(newHost)
    }

    const newSettings = { ...featuredSettings, hosts: updatedHosts }
    setFeaturedSettings(newSettings)
    handleSaveFeaturedSettings(newSettings)
    setShowHostModal(false)
  }

  const handleDeleteHost = (id: string) => {
    if (!confirm('Are you sure you want to remove this showcase host card?')) return
    const updatedHosts = (featuredSettings.hosts || []).filter((h) => h.id !== id)
    const newSettings = { ...featuredSettings, hosts: updatedHosts }
    setFeaturedSettings(newSettings)
    handleSaveFeaturedSettings(newSettings)
  }

  const handleToggleHostActive = (id: string) => {
    const updatedHosts = (featuredSettings.hosts || []).map((h) =>
      h.id === id ? { ...h, is_active: !h.is_active } : h
    )
    const newSettings = { ...featuredSettings, hosts: updatedHosts }
    setFeaturedSettings(newSettings)
    handleSaveFeaturedSettings(newSettings)
  }

  // Toggle city active status
  const handleToggleCityStatus = async (city: CityDestination) => {
    try {
      const newActive = !city.is_active
      const res = await fetch('/api/admin/destinations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId: city.id,
          updates: { is_active: newActive },
        }),
      })

      if (res.ok) {
        setDestinations((prev) =>
          prev.map((d) => (d.id === city.id ? { ...d, is_active: newActive } : d))
        )
        showToast.success(
          newActive
            ? `${city.name} launched! Providers and tourists now have full access.`
            : `${city.name} disabled and hidden from public search.`
        )
      } else {
        showToast.error('Failed to update city status')
      }
    } catch {
      showToast.error('Network error updating status')
    }
  }

  // Delete city
  const handleDeleteCity = async (city: CityDestination) => {
    if (city.id === 'coimbatore') {
      showToast.error('Coimbatore is the primary launch city and cannot be deleted.')
      return
    }

    if (!window.confirm(`Are you sure you want to delete ${city.name}? This will remove all bundled tourist spots.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/destinations?id=${city.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setDestinations((prev) => prev.filter((d) => d.id !== city.id))
        showToast.success(`${city.name} removed successfully`)
      } else {
        showToast.error('Failed to delete city')
      }
    } catch {
      showToast.error('Network error deleting city')
    }
  }

  // Open edit modal
  const openEditModal = (city: CityDestination) => {
    setEditingCity(city)
    setCityName(city.name)
    setCityState(city.state)
    setCityCategory(city.category)
    setCityDesc(city.description || '')
    setCityImage(city.image_url || '')
    setCityLat(String(city.lat || '11.0168'))
    setCityLng(String(city.lng || '76.9558'))
    setCityIsActive(city.is_active)
    setTopSpots(city.top_spots || [])
    setHiddenSpots(city.hidden_spots || [])
    setCityGuide(city.guide || null)
    setModalTab('spots')
    setShowAddModal(true)
  }

  // Open modal directly on Regional Guide tab
  const openGuideModal = (city: CityDestination) => {
    openEditModal(city)
    setModalTab('guide')
  }

  // AI Spot & Gem Generation from Map Coordinates
  const handleAiGenerateSpots = async () => {
    if (!cityName.trim()) {
      showToast.error('Please enter the City Destination Name first.')
      return
    }

    setIsGeneratingAiSpots(true)
    try {
      const res = await fetch('/api/admin/destinations/generate-spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityName: cityName.trim(),
          lat: Number(cityLat) || 11.0168,
          lng: Number(cityLng) || 76.9558,
          state: cityState,
          category: cityCategory,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.top_spots?.length > 0) {
          setTopSpots(data.top_spots)
        }
        if (data.hidden_spots?.length > 0) {
          setHiddenSpots(data.hidden_spots)
        }
        if (!cityDesc.trim() && data.suggested_description) {
          setCityDesc(data.suggested_description)
        }
        if ((!cityImage || cityImage.includes('photo-1544717305')) && data.suggested_image_url) {
          setCityImage(data.suggested_image_url)
        }
        if ((!cityCategory || cityCategory === 'Kongu Heritage & Western Ghats Gateway') && data.suggested_category) {
          setCityCategory(data.suggested_category)
        }
        if (data.guide) {
          setCityGuide(data.guide)
        }

        showToast.success(
          `✨ AI discovered ${data.top_spots?.length || 0} Spots, ${data.hidden_spots?.length || 0} Gems & Regional Guide for ${cityName}!`
        )
      } else {
        const err = await res.json().catch(() => ({}))
        showToast.error(err.error || 'Failed to generate spots via AI')
      }
    } catch {
      showToast.error('Network error during AI spot generation')
    } finally {
      setIsGeneratingAiSpots(false)
    }
  }

  // Open add modal
  const openAddModal = () => {
    setEditingCity(null)
    setCityName('')
    setCityState(states[0]?.name || 'Tamil Nadu')
    setCityCategory(categories[0] || 'Kongu Heritage & Western Ghats Gateway')
    setCityDesc('')
    setCityImage('https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80')
    setCityLat('11.0168')
    setCityLng('76.9558')
    setCityIsActive(true) // ALWAYS ACTIVE BY DEFAULT
    setTopSpots([])
    setHiddenSpots([])
    setCityGuide(null)
    setModalTab('spots')
    setShowAddModal(true)
  }

  // Save City (Add or Edit)
  const handleSaveCity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cityName.trim() || !cityState.trim() || !cityCategory.trim()) {
      showToast.error('City Name, State, and Category are required.')
      return
    }

    setActionLoading(true)
    try {
      const cityPayload: CityDestination = {
        id: editingCity ? editingCity.id : cityName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: cityName.trim(),
        state: cityState.trim(),
        category: cityCategory.trim(),
        is_active: cityIsActive,
        description: cityDesc.trim(),
        image_url: cityImage.trim(),
        lat: Number(cityLat) || 11.0168,
        lng: Number(cityLng) || 76.9558,
        top_spots: topSpots.filter((s) => s.name.trim().length > 0),
        hidden_spots: hiddenSpots.filter((s) => s.name.trim().length > 0),
        guide: cityGuide || undefined,
      }

      const res = await fetch('/api/admin/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: cityPayload }),
      })

      if (res.ok) {
        showToast.success(`City "${cityName}" saved successfully!`)
        setShowAddModal(false)
        loadData()
      } else {
        const data = await res.json().catch(() => ({}))
        showToast.error(data.error || 'Failed to save city')
      }
    } catch {
      showToast.error('Network error saving city')
    } finally {
      setActionLoading(false)
    }
  }

  // Add category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    const cat = newCategoryName.trim()
    try {
      const res = await fetch('/api/admin/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_category', category: cat }),
      })
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories)
        setCityCategory(cat)
        setNewCategoryName('')
        showToast.success(`Category "${cat}" added & selected`)
      }
    } catch {
      showToast.error('Failed to add category')
    }
  }

  // Delete category
  const handleDeleteCategory = async (catName: string) => {
    if (categories.length <= 1) {
      showToast.error('At least one category must remain')
      return
    }
    if (!window.confirm(`Delete category "${catName}"?`)) return
    try {
      const res = await fetch('/api/admin/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_category', category: catName }),
      })
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories)
        if (cityCategory.toLowerCase() === catName.toLowerCase()) {
          setCityCategory(data.categories[0] || '')
        }
        showToast.success(`Category "${catName}" removed`)
      }
    } catch {
      showToast.error('Failed to remove category')
    }
  }

  // Add state
  const handleAddState = async () => {
    if (!newStateName.trim()) return
    const stateName = newStateName.trim()
    try {
      const res = await fetch('/api/admin/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_state', state: { name: stateName } }),
      })
      if (res.ok) {
        const data = await res.json()
        setStates(data.states)
        setCityState(stateName)
        setNewStateName('')
        showToast.success(`State "${stateName}" added & selected`)
      }
    } catch {
      showToast.error('Failed to add state')
    }
  }

  // Delete state
  const handleDeleteState = async (stateName: string) => {
    if (states.length <= 1) {
      showToast.error('At least one state must remain')
      return
    }
    if (!window.confirm(`Delete state "${stateName}"?`)) return
    try {
      const res = await fetch('/api/admin/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_state', state: { name: stateName } }),
      })
      if (res.ok) {
        const data = await res.json()
        setStates(data.states)
        if (cityState.toLowerCase() === stateName.toLowerCase()) {
          setCityState(data.states[0]?.name || 'Tamil Nadu')
        }
        showToast.success(`State "${stateName}" removed`)
      }
    } catch {
      showToast.error('Failed to remove state')
    }
  }

  // Filtering
  const filtered = destinations.filter((d) => {
    if (selectedCategory !== 'all' && d.category !== selectedCategory) return false
    if (selectedStatus === 'active' && !d.is_active) return false
    if (selectedStatus === 'draft' && d.is_active) return false
    return true
  })

  return (
    <DashboardLayout role="admin" title="Destinations & Regional Bundles Control">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 font-display">
              Destinations & Regional Bundles Manager
            </h1>
            <p className="text-xs text-gray-500">
              Manage launched destination cities, bundled spots, "Explore by Region" titles, and homepage showcase rider hosts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {mainTab === 'destinations' ? (
              <>
                <Button variant="primary" size="sm" onClick={openAddModal}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add New City
                </Button>
                <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </>
            ) : (
              <>
                <Button variant="primary" size="sm" onClick={() => handleOpenHostModal()}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Showcase Host
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSaveFeaturedSettings()}
                  disabled={featuredSaving}
                  className="bg-emerald-50 text-emerald-800 border-emerald-200 font-bold"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  {featuredSaving ? 'Saving...' : 'Save Showcase Settings'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Tab Switcher */}
        <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
          <button
            type="button"
            onClick={() => setMainTab('destinations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              mainTab === 'destinations'
                ? 'bg-[#0a4d29] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>📍 Destinations & Cities Control ({destinations.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMainTab('showcase')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              mainTab === 'showcase'
                ? 'bg-[#0a4d29] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>🌟 Explore by Region & Showcase Rider Hosts ({featuredSettings.hosts?.length || 9} Hosts)</span>
          </button>
        </div>

        {/* TAB 1: DESTINATIONS & CITIES CONTROL */}
        {mainTab === 'destinations' && (
          <div className="space-y-8">
            {/* 4 Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Cities</span>
                <span className="text-2xl font-black text-gray-900">{destinations.length}</span>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100 shadow-sm">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Launched & Active</span>
                <span className="text-2xl font-black text-emerald-700">
                  {destinations.filter((d) => d.is_active).length}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Top Tourist Spots</span>
                <span className="text-2xl font-black text-[#0a4d29]">
                  {destinations.reduce((acc, d) => acc + (d.top_spots?.length || 0), 0)}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-orange-50/70 border border-orange-100 shadow-sm">
                <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wider block">Hidden Gems Bundled</span>
                <span className="text-2xl font-black text-[#ff7a00]">
                  {destinations.reduce((acc, d) => acc + (d.hidden_spots?.length || 0), 0)}
                </span>
              </div>
            </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === 'all' ? 'bg-[#0a4d29] text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              All ({destinations.length})
            </button>
            <button
              onClick={() => setSelectedStatus('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === 'active' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              Launched ({destinations.filter((d) => d.is_active).length})
            </button>
            <button
              onClick={() => setSelectedStatus('draft')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === 'draft' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800'
              }`}
            >
              Draft / Disabled ({destinations.filter((d) => !d.is_active).length})
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold text-gray-500">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs p-2 rounded-xl border border-gray-200 outline-none bg-white font-medium"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* City Destination Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((city) => (
            <div
              key={city.id}
              className={`bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                city.is_active ? 'border-emerald-200' : 'border-gray-200 opacity-90'
              }`}
            >
              <div>
                {/* Image Banner */}
                <div className="aspect-[21/9] bg-gray-100 relative">
                  <img
                    src={city.image_url}
                    alt={city.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        city.is_active
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'bg-gray-800/90 text-gray-200'
                      }`}
                    >
                      {city.is_active ? 'Active & Launched' : 'Coming Soon / Disabled'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-gray-800">
                      {city.state}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="text-2xl font-black">{city.name}</h3>
                    <p className="text-xs text-emerald-300 font-semibold">{city.category}</p>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-6 space-y-4">
                  <p className="text-xs text-gray-600 leading-relaxed">{city.description}</p>

                  {/* Coordinates & Maps Link */}
                  <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      GPS: {city.lat.toFixed(4)}, {city.lng.toFixed(4)}
                    </span>
                    <a
                      href={`https://maps.google.com/?q=${city.lat},${city.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center"
                    >
                      Maps Link <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>

                  {/* Bundled Top Tourist Spots */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 block">
                      Top Tourist Spots ({city.top_spots?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {city.top_spots?.map((s) => (
                        <span
                          key={s.id}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-100"
                        >
                          {s.name} ({s.recommended_hours})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bundled Hidden Gems */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#ff7a00] flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      Hidden Spots / Secret Gems ({city.hidden_spots?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {city.hidden_spots?.map((s) => (
                        <span
                          key={s.id}
                          className="px-2.5 py-1 rounded-lg bg-orange-50 text-[#ff7a00] text-[11px] font-semibold border border-orange-100"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="p-5 pt-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                <Button
                  variant={city.is_active ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => handleToggleCityStatus(city)}
                  className="text-xs"
                >
                  {city.is_active ? (
                    <>
                      <X className="w-3.5 h-3.5 mr-1 text-red-500" /> Disable City
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" /> Launch City to Public
                    </>
                  )}
                </Button>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openGuideModal(city)}
                    className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200"
                    title="Edit Regional Guide Content"
                  >
                    <BookOpen className="w-3.5 h-3.5 mr-1 text-[#ff7a00]" /> Guide
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => openEditModal(city)}>
                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  {city.id !== 'coimbatore' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteCity(city)}
                      title="Delete City"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* TAB 2: EXPLORE BY REGION & SHOWCASE RIDER HOSTS */}
    {mainTab === 'showcase' && (
      <div className="space-y-8">
        {/* Section 1: Explore by Region & Bundles Header Settings */}
        <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#ff7a00] block mb-1">
                Homepage Hero Curations
              </span>
              <h3 className="text-lg font-black text-gray-900 font-display">
                "Explore by Region" Headings & Regional Bundles Copy
              </h3>
              <p className="text-xs text-gray-500">
                Configure the section title, eyebrow, and per-region bundle titles (e.g., Pollachi Regional Bundles).
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleSaveFeaturedSettings()}
              disabled={featuredSaving}
              className="rounded-xl font-bold"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {featuredSaving ? 'Saving...' : 'Save Region Copy'}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Section Eyebrow Pill Text
              </label>
              <input
                type="text"
                value={featuredSettings.section_eyebrow}
                onChange={(e) =>
                  setFeaturedSettings((prev) => ({ ...prev, section_eyebrow: e.target.value }))
                }
                placeholder="e.g. Explore by Region"
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Section Title / Instructions
              </label>
              <input
                type="text"
                value={featuredSettings.section_title}
                onChange={(e) =>
                  setFeaturedSettings((prev) => ({ ...prev, section_title: e.target.value }))
                }
                placeholder="e.g. Select an active region to view bundled tourist packages:"
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Region-Specific Bundle Editor */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-gray-500 mr-2 shrink-0">Configure Region:</span>
              {['Pollachi', 'Coimbatore', 'Ooty & Nilgiris'].map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => setSelectedBundleRegion(reg)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedBundleRegion === reg
                      ? 'bg-[#ff7a00] text-white shadow-sm ring-1 ring-orange-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📍 {reg} Bundles
                </button>
              ))}
            </div>

            {(() => {
              const currentCfg =
                featuredSettings.region_configs?.[selectedBundleRegion] || {
                  badge: `${selectedBundleRegion} Regional Bundles`,
                  title: `Featured Hourly Trips in & around ${selectedBundleRegion}`,
                  subtitle: `Tour cinema-famous coconut canal roads and scenic landscapes with verified local rider hosts.`,
                }

              return (
                <div className="p-4 rounded-2xl bg-orange-50/40 border border-orange-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-orange-950 uppercase tracking-wider">
                      📍 {selectedBundleRegion} Bundle Settings
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        Regional Badge (e.g. {selectedBundleRegion} Regional Bundles)
                      </label>
                      <input
                        type="text"
                        value={currentCfg.badge}
                        onChange={(e) => {
                          const val = e.target.value
                          setFeaturedSettings((prev) => ({
                            ...prev,
                            region_configs: {
                              ...prev.region_configs,
                              [selectedBundleRegion]: { ...currentCfg, badge: val },
                            },
                          }))
                        }}
                        className="w-full p-2 bg-white rounded-xl border border-orange-200 text-xs font-bold text-gray-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        Regional Title (e.g. Featured Hourly Trips in & around {selectedBundleRegion})
                      </label>
                      <input
                        type="text"
                        value={currentCfg.title}
                        onChange={(e) => {
                          const val = e.target.value
                          setFeaturedSettings((prev) => ({
                            ...prev,
                            region_configs: {
                              ...prev.region_configs,
                              [selectedBundleRegion]: { ...currentCfg, title: val },
                            },
                          }))
                        }}
                        className="w-full p-2 bg-white rounded-xl border border-orange-200 text-xs font-bold text-gray-900 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Regional Subtitle / Description
                    </label>
                    <textarea
                      rows={2}
                      value={currentCfg.subtitle}
                      onChange={(e) => {
                        const val = e.target.value
                        setFeaturedSettings((prev) => ({
                          ...prev,
                          region_configs: {
                            ...prev.region_configs,
                            [selectedBundleRegion]: { ...currentCfg, subtitle: val },
                          },
                        }))
                      }}
                      className="w-full p-2 bg-white rounded-xl border border-orange-200 text-xs text-gray-800 outline-none"
                    />
                  </div>
                </div>
              )
            })()}
          </div>
        </div>

        {/* Section 2: Showcase Rider Hosts Editor */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 bg-white rounded-3xl border border-gray-200 shadow-sm">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Homepage Showcase Posts
              </span>
              <h3 className="text-lg font-black text-gray-900 font-display mt-1">
                Showcase Rider Hosts ({featuredSettings.hosts?.length || 0})
              </h3>
              <p className="text-xs text-gray-500">
                These curated sample posts showcase verified hosts on the homepage. Clicking them routes tourists directly to /explore to book live active rides.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenHostModal()}
                className="rounded-xl"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Showcase Host
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSaveFeaturedSettings()}
                disabled={featuredSaving}
                className="rounded-xl bg-emerald-50 text-emerald-800 border-emerald-200 font-bold"
              >
                <Save className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                {featuredSaving ? 'Saving...' : 'Save All Hosts'}
              </Button>
            </div>
          </div>

          {/* Hidden input for 1-click card photo replacement */}
          <input
            type="file"
            ref={hostCardImageRef}
            accept="image/*"
            onChange={handleHostCardImageUpload}
            className="hidden"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(featuredSettings.hosts || []).map((host) => (
              <div
                key={host.id}
                className={`p-5 rounded-3xl bg-white border transition-all flex flex-col justify-between space-y-3 ${
                  host.is_active !== false ? 'border-gray-200 shadow-sm' : 'border-dashed border-gray-300 opacity-60'
                }`}
              >
                <div>
                  <div className="aspect-[16/10] rounded-2xl bg-gray-100 overflow-hidden relative mb-3 group">
                    <img
                      src={host.image_url}
                      alt={host.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 z-10 pointer-events-none">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                        {host.category}
                      </span>
                      {host.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white">
                          {host.badge}
                        </span>
                      )}
                    </div>

                    {/* 1-Click Replace Photo Button */}
                    <button
                      type="button"
                      onClick={() => triggerHostCardImageUpload(host.id)}
                      className="absolute bottom-2 right-2 z-20 px-2.5 py-1.5 rounded-xl bg-white/95 hover:bg-white text-gray-900 text-[11px] font-extrabold shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
                      title="Upload or replace photo for this host"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      Replace Photo
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                        📍 {host.region}
                      </span>
                      <h4 className="font-black text-sm text-gray-900">{host.business_name}</h4>
                      <p className="text-xs font-semibold text-gray-700 mt-0.5">{host.title}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-emerald-700 block">
                        ₹{host.starting_rate}/hr
                      </span>
                      <span className="text-[10px] text-gray-400">★ {host.rating}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                    {host.tagline}
                  </p>

                  {host.features?.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 space-y-1">
                      {host.features.map((f, i) => (
                        <div key={i} className="text-[11px] text-gray-600 flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleHostActive(host.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 ${
                      host.is_active !== false
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}
                  >
                    {host.is_active !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{host.is_active !== false ? 'Live' : 'Hidden'}</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenHostModal(host)}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                      title="Edit Host"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteHost(host.id)}
                      className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      title="Delete Host"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal for Adding/Editing Showcase Host */}
        {showHostModal && (
          <Modal
            isOpen={showHostModal}
            onClose={() => setShowHostModal(false)}
            title={editingHost ? `Edit Showcase Host: ${editingHost.business_name}` : 'Add New Showcase Rider Host'}
          >
            <form onSubmit={handleHostModalSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Business / Host Name * (e.g. Kovai Foothill Riders)
                  </label>
                  <input
                    type="text"
                    required
                    value={hostBusinessName}
                    onChange={(e) => setHostBusinessName(e.target.value)}
                    placeholder="e.g. Kovai Foothill Riders"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Region / City *
                  </label>
                  <select
                    value={hostRegion}
                    onChange={(e) => setHostRegion(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:border-emerald-500 outline-none"
                  >
                    {destinations.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.state})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Service Category
                  </label>
                  <select
                    value={hostCategory}
                    onChange={(e) => setHostCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:border-emerald-500 outline-none"
                  >
                    <option value="bike">🏍️ Bike Tour & Ride</option>
                    <option value="car">🚗 Private Car Chauffeur</option>
                    <option value="van">🚐 Luxury Touring Van</option>
                    <option value="local_guide">🧑‍🏫 Local Heritage Guide</option>
                    <option value="sightseeing_tour">🗺️ Sightseeing Tour</option>
                    <option value="experience">🎭 Local Experience</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Starting Tariff (₹ / hour)
                  </label>
                  <input
                    type="number"
                    min={50}
                    value={hostStartingRate}
                    onChange={(e) => setHostStartingRate(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tour Package Title *
                </label>
                <input
                  type="text"
                  required
                  value={hostTitle}
                  onChange={(e) => setHostTitle(e.target.value)}
                  placeholder="e.g. Isha Adiyogi & Marudhamalai Foothill Cruisers"
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tagline / Brief Summary
                </label>
                <textarea
                  rows={2}
                  value={hostTagline}
                  onChange={(e) => setHostTagline(e.target.value)}
                  placeholder="e.g. Certified motorcycle hosts with sanitized pillion helmets & GoPro mounts..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Host Cover Photo Upload & Preview */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Host Cover Photo
                </label>
                <input
                  type="file"
                  ref={hostModalImageRef}
                  accept="image/*"
                  onChange={handleHostModalImageUpload}
                  className="hidden"
                />

                {hostImageUrl ? (
                  <div className="relative rounded-2xl border border-gray-200 overflow-hidden bg-gray-900 mb-2 shadow-sm">
                    <img
                      src={hostImageUrl}
                      alt="Host cover"
                      className="w-full h-40 object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <div className="text-white text-xs font-bold drop-shadow">
                        {hostBusinessName || 'Showcase Rider Host'}
                        <span className="block text-[10px] font-normal text-white/80">
                          {hostImageUrl.startsWith('data:image') ? 'Uploaded image from device' : 'Web URL'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => hostModalImageRef.current?.click()}
                          className="bg-white/95 hover:bg-white text-gray-900 border-none font-bold text-xs"
                        >
                          <Camera className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Replace
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => setHostImageUrl('')}
                          className="bg-red-500/80 hover:bg-red-600 text-white border-none font-bold text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => hostModalImageRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition bg-gray-50/50 hover:bg-emerald-50/20 mb-2"
                  >
                    <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-700">Click or tap to upload host photo</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Supports PNG, JPG, WebP up to 5MB</p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={hostImageUrl.startsWith('data:image') ? '' : hostImageUrl}
                    onChange={(e) => setHostImageUrl(e.target.value)}
                    placeholder="Or paste an image URL (https://images.unsplash.com/...)"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-emerald-500 outline-none"
                  />
                  {hostImageUrl.startsWith('data:image') && (
                    <span className="text-[10px] text-emerald-700 font-bold shrink-0 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                      File Uploaded
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Featured Badge Text
                </label>
                <input
                  type="text"
                  value={hostBadge}
                  onChange={(e) => setHostBadge(e.target.value)}
                  placeholder="e.g. Top Rated Rider Host"
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Bullet Highlights (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={hostFeatures}
                  onChange={(e) => setHostFeatures(e.target.value)}
                  placeholder={"Royal Enfield Hunter 350\nComplimentary ISI Helmets\nSunset Stop"}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm font-mono focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Explore Search Keyword (when clicked)
                </label>
                <input
                  type="text"
                  value={hostExploreQuery}
                  onChange={(e) => setHostExploreQuery(e.target.value)}
                  placeholder="e.g. Kovai Foothill Riders"
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <Button type="button" variant="secondary" onClick={() => setShowHostModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={featuredSaving}>
                  {editingHost ? 'Save Changes' : 'Add Showcase Host'}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    )}

        {/* Add/Edit City Modal */}
        {showAddModal && (
          <Modal
            isOpen={true}
            size="lg"
            onClose={() => setShowAddModal(false)}
            title={editingCity ? `Destination & Regional Guide: ${editingCity.name}` : 'Add New City Destination'}
          >
            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                type="button"
                onClick={() => setModalTab('spots')}
                className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  modalTab === 'spots'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Destination & Spots ({topSpots.length + hiddenSpots.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('guide')}
                className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  modalTab === 'guide'
                    ? 'border-[#ff7a00] text-[#ff7a00]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Regional Guide ({cityGuide?.circuits?.length || 0} Circuits)</span>
              </button>
            </div>

            <form onSubmit={handleSaveCity} className="space-y-6 max-h-[72vh] overflow-y-auto pr-1">
              {modalTab === 'spots' && (
                <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City Name"
                  required
                  placeholder="e.g. Madurai, Pollachi, Kodaikanal"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    State / Region <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={cityState}
                    onChange={(e) => setCityState(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-semibold outline-none bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {states.map((st) => (
                      <option key={st.id || st.name} value={st.name}>
                        {st.name}
                      </option>
                    ))}
                  </select>

                  {/* Add & Delete State Controls */}
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                        Available States ({states.length})
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="New state (e.g. Telangana)..."
                        value={newStateName}
                        onChange={(e) => setNewStateName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddState()
                          }
                        }}
                        className="flex-1 p-1.5 rounded-lg border border-gray-200 text-xs bg-white outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddState}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shrink-0"
                      >
                        + Add State
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pt-0.5">
                      {states.map((st) => (
                        <span
                          key={st.id || st.name}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            cityState.toLowerCase() === st.name.toLowerCase()
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                              : 'bg-white text-gray-700 border-gray-200'
                          }`}
                        >
                          <span
                            className="cursor-pointer hover:underline"
                            onClick={() => setCityState(st.name)}
                            title="Click to select state"
                          >
                            {st.name}
                          </span>
                          {states.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteState(st.name)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              title={`Delete ${st.name}`}
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* City Category with Add & Delete */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  City Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={cityCategory}
                  onChange={(e) => setCityCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-semibold outline-none bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {/* Add & Delete Category Controls */}
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                      Available Categories ({categories.length})
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="New category (e.g. Eco-Tourism, Silk Heritage)..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddCategory()
                        }
                      }}
                      className="flex-1 p-1.5 rounded-lg border border-gray-200 text-xs bg-white outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shrink-0"
                    >
                      + Add Category
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pt-0.5">
                    {categories.map((c) => (
                      <span
                        key={c}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          cityCategory.toLowerCase() === c.toLowerCase()
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                            : 'bg-white text-gray-700 border-gray-200'
                        }`}
                      >
                        <span
                          className="cursor-pointer hover:underline truncate max-w-[180px]"
                          onClick={() => setCityCategory(c)}
                          title="Click to select category"
                        >
                          {c}
                        </span>
                        {categories.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(c)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title={`Delete ${c}`}
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Textarea
                label="City Summary & Tourism Pitch"
                rows={3}
                placeholder="Describe what makes this city unforgettable for hourly travel..."
                value={cityDesc}
                onChange={(e) => setCityDesc(e.target.value)}
              />

              {/* City Destination Cover Photo Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    City Cover Image
                  </label>
                  {cityImage && (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                      <Check className="w-3 h-3 mr-1" /> Image Attached
                    </span>
                  )}
                </div>

                <input
                  ref={coverImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                  className="hidden"
                />

                {cityImage ? (
                  <div className="relative rounded-2xl border border-gray-200 overflow-hidden group shadow-sm bg-gray-900">
                    <img
                      src={cityImage}
                      alt={cityName || 'City Cover'}
                      className="w-full h-44 object-cover object-center opacity-90 transition group-hover:scale-105 duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <div className="text-white text-xs font-bold drop-shadow">
                        {cityName || 'Destination Cover'}
                        <span className="block text-[10px] font-normal text-white/80">
                          {cityImage.startsWith('data:image') ? 'Uploaded from device' : 'Web URL'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => coverImageInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-gray-800 text-xs font-bold shadow-sm backdrop-blur-sm transition flex items-center"
                        >
                          <Camera className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => setCityImage('')}
                          className="px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-700 text-white text-xs font-bold shadow-sm backdrop-blur-sm transition flex items-center"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => coverImageInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition bg-gray-50/50 hover:bg-emerald-50/20 group"
                  >
                    <div className="w-12 h-12 mx-auto rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-emerald-600 group-hover:scale-110 transition">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="mt-3 text-xs font-bold text-gray-800">
                      Click to upload City Cover Photo
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Supports JPG, PNG, WebP up to 5 MB
                    </p>
                    <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-700 shadow-xs group-hover:border-emerald-300">
                      <Camera className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                      Choose Image File
                    </div>
                  </div>
                )}

                {/* Optional Web URL Input fallback */}
                <div className="pt-1">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                    <span>Or paste external image URL:</span>
                  </div>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={cityImage.startsWith('data:image') ? '' : cityImage}
                    onChange={(e) => setCityImage(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
              </div>

              {/* Interactive Map Location Pin Picker (Replacing manual Latitude/Longitude) */}
              <div className="space-y-1">
                <CityLocationPicker
                  lat={Number(cityLat) || 11.0168}
                  lng={Number(cityLng) || 76.9558}
                  cityName={cityName}
                  onChange={(newLat, newLng) => {
                    setCityLat(String(newLat))
                    setCityLng(String(newLng))
                  }}
                />
              </div>

              {/* AI Auto-Discovery & Spot Generation Banner from Map Intelligence */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#062413] via-[#0a4d29] to-[#0d5930] text-white shadow-xl space-y-3 border border-emerald-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500 text-white shadow">
                        AI Map Intelligence
                      </span>
                      <h4 className="font-black text-sm text-white flex items-center gap-1.5 font-display">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        Auto-Discover Bundled Spots from Map
                      </h4>
                    </div>
                    <p className="text-xs text-emerald-100/90 mt-1 max-w-xl leading-relaxed">
                      Scan selected map coordinates & city landmarks to automatically bundle Top Tourist Spots, Hidden Gems, durations, descriptions, and photography.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    disabled={isGeneratingAiSpots || !cityName.trim()}
                    onClick={handleAiGenerateSpots}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md whitespace-nowrap self-start sm:self-auto transition-transform hover:scale-105"
                  >
                    {isGeneratingAiSpots ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        AI Generating Spots...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        ✨ AI Generate Spots & Gems
                      </span>
                    )}
                  </Button>
                </div>
                {!cityName.trim() && (
                  <p className="text-[11px] text-amber-300 italic">
                    💡 Tip: Enter the City Name above and pinpoint the map to generate bundled tourist spots with one click.
                  </p>
                )}
              </div>

              {/* Status Toggle */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                cityIsActive ? 'bg-emerald-50/80 border-emerald-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">{cityIsActive ? '🚀' : '⏸️'}</span>
                  <div>
                    <span className="font-extrabold text-xs text-gray-900 block">
                      Launch Status: {cityIsActive ? 'Active & Published to Public' : 'Draft / Disabled'}
                    </span>
                    <span className="text-[11px] text-gray-600">
                      {cityIsActive
                        ? 'Active cities are immediately selectable by providers to create listings and visible to tourists for booking hourly rides.'
                        : 'Disabled cities are hidden from provider add listing and public tourist marketplace.'}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={cityIsActive}
                  onChange={(e) => setCityIsActive(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Bundled Top Spots */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900">
                    Bundled Top Tourist Spots ({topSpots.length})
                  </h4>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setTopSpots([
                        ...topSpots,
                        {
                          id: `spot-${Date.now()}`,
                          name: '',
                          category: 'Temple / Heritage',
                          description: '',
                          image_url:
                            'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
                          recommended_hours: '2 to 4 Hours',
                          is_hidden_gem: false,
                        },
                      ])
                    }
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Spot
                  </Button>
                </div>

                {topSpots.map((spot, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <div className="flex items-center gap-2">
                      {spot.image_url && (
                        <img
                          src={spot.image_url}
                          alt={spot.name || 'Spot'}
                          className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0"
                        />
                      )}
                      <input
                        type="text"
                        placeholder="Spot Name (e.g. Adiyogi Statue)"
                        value={spot.name}
                        onChange={(e) => {
                          const c = [...topSpots]
                          c[idx].name = e.target.value
                          setTopSpots(c)
                        }}
                        className="flex-1 p-2 rounded-lg border border-gray-200 text-xs font-bold bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Duration (e.g. 3 Hours)"
                        value={spot.recommended_hours}
                        onChange={(e) => {
                          const c = [...topSpots]
                          c[idx].recommended_hours = e.target.value
                          setTopSpots(c)
                        }}
                        className="w-28 p-2 rounded-lg border border-gray-200 text-xs bg-white"
                      />
                      <label
                        className="cursor-pointer flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 rounded-lg border border-gray-200 text-[11px] font-semibold transition shrink-0"
                        title="Upload photo for this spot"
                      >
                        <Camera className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleSpotImageUpload(file, idx, false)
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setTopSpots(topSpots.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="One-line description or highlight..."
                      value={spot.description}
                      onChange={(e) => {
                        const c = [...topSpots]
                        c[idx].description = e.target.value
                        setTopSpots(c)
                      }}
                      className="w-full p-2 rounded-lg border border-gray-200 text-xs bg-white text-gray-600"
                    />
                  </div>
                ))}
              </div>

              {/* Bundled Hidden Gems */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#ff7a00] flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Bundled Hidden Spots ({hiddenSpots.length})
                  </h4>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setHiddenSpots([
                        ...hiddenSpots,
                        {
                          id: `hidden-${Date.now()}`,
                          name: '',
                          category: 'Secret Forest / Falls',
                          description: '',
                          image_url:
                            'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
                          recommended_hours: '2 to 3 Hours',
                          is_hidden_gem: true,
                        },
                      ])
                    }
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Hidden Gem
                  </Button>
                </div>

                {hiddenSpots.map((spot, idx) => (
                  <div key={idx} className="p-3 bg-orange-50/50 rounded-xl border border-orange-200 space-y-2">
                    <div className="flex items-center gap-2">
                      {spot.image_url && (
                        <img
                          src={spot.image_url}
                          alt={spot.name || 'Hidden Spot'}
                          className="w-8 h-8 rounded-lg object-cover border border-orange-200 shrink-0"
                        />
                      )}
                      <input
                        type="text"
                        placeholder="Hidden Spot Name (e.g. Secret Bamboo Stream)"
                        value={spot.name}
                        onChange={(e) => {
                          const c = [...hiddenSpots]
                          c[idx].name = e.target.value
                          setHiddenSpots(c)
                        }}
                        className="flex-1 p-2 rounded-lg border border-orange-200 text-xs font-bold bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Duration"
                        value={spot.recommended_hours}
                        onChange={(e) => {
                          const c = [...hiddenSpots]
                          c[idx].recommended_hours = e.target.value
                          setHiddenSpots(c)
                        }}
                        className="w-24 p-2 rounded-lg border border-orange-200 text-xs bg-white"
                      />
                      <label
                        className="cursor-pointer flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-700 rounded-lg border border-orange-200 text-[11px] font-semibold transition shrink-0"
                        title="Upload photo for this hidden spot"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#ff7a00]" />
                        <span className="hidden sm:inline">Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleSpotImageUpload(file, idx, true)
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setHiddenSpots(hiddenSpots.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Insider Tip or secret directions..."
                      value={spot.description}
                      onChange={(e) => {
                        const c = [...hiddenSpots]
                        c[idx].description = e.target.value
                        setHiddenSpots(c)
                      }}
                      className="w-full p-2 rounded-lg border border-orange-200 text-xs bg-white text-gray-600"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {modalTab === 'guide' && (
            <div className="space-y-6">
              {/* AI Guide Trigger Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-orange-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#ff7a00]" />
                    AI Regional Guide Generator
                  </h4>
                  <p className="text-[11px] text-orange-900/80 mt-0.5">
                    Scan selected map coordinates & city landmarks to automatically populate circuits, distance matrix, and insider tips.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isGeneratingAiSpots || !cityName.trim()}
                  onClick={handleAiGenerateSpots}
                  className="bg-white hover:bg-orange-50 text-orange-700 border-orange-300 text-xs shrink-0 font-bold"
                >
                  {isGeneratingAiSpots ? 'Generating...' : '✨ Auto-Fill Guide with AI'}
                </Button>
              </div>

              {/* Headline & Overview */}
              <div className="space-y-4">
                <Input
                  label="Guide Page Headline Banner"
                  placeholder={`e.g. The Regional Hourly Travel & Day Escapes Guide for ${cityName || 'City'}`}
                  value={cityGuide?.headline || ''}
                  onChange={(e) =>
                    setCityGuide((prev) => ({
                      ...(prev || { circuits: [], distance_matrix: [], insider_tips: [] }),
                      headline: e.target.value,
                    }))
                  }
                />

                <Textarea
                  label="Guide Overview & Regional Touring Pitch"
                  rows={3}
                  placeholder="Describe the regional geography, why hourly booking works best here, scenic roads, and host standards..."
                  value={cityGuide?.overview || ''}
                  onChange={(e) =>
                    setCityGuide((prev) => ({
                      ...(prev || { circuits: [], distance_matrix: [], insider_tips: [] }),
                      overview: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Curated Hourly Circuits & Day Escapes */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-emerald-600" />
                      Curated Hourly Circuits & Day Escapes ({cityGuide?.circuits?.length || 0})
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      These curated circuits appear on the Regional Guide page for tourists to book hourly rides.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const newCircuit: RegionalGuideCircuit = {
                        id: `circuit-${Date.now()}`,
                        title: '',
                        category: 'Scenic Viewpoint & Culture',
                        tagline: '',
                        ideal_duration: '3 to 4 Hours',
                        best_time_of_day: 'Morning',
                        recommended_transport: 'Royal Enfield Cruiser or Sedan',
                        transport_type: 'bike',
                        estimated_rate: 250,
                        key_attractions: [],
                        pro_tip: '',
                        image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
                      }
                      setCityGuide((prev) => ({
                        ...(prev || { circuits: [], distance_matrix: [], insider_tips: [] }),
                        circuits: [...(prev?.circuits || []), newCircuit],
                      }))
                    }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Circuit
                  </Button>
                </div>

                {(cityGuide?.circuits || []).map((circuit, cIdx) => (
                  <div key={circuit.id || cIdx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center shrink-0">
                          {cIdx + 1}
                        </span>
                        <input
                          type="text"
                          placeholder="Circuit Title (e.g. Isha Adiyogi & Sunset Light Show)"
                          value={circuit.title}
                          onChange={(e) => {
                            const cList = [...(cityGuide?.circuits || [])]
                            cList[cIdx].title = e.target.value
                            setCityGuide((prev) => ({ ...prev!, circuits: cList }))
                          }}
                          className="flex-1 p-2 bg-white rounded-xl border border-gray-200 text-xs font-bold text-gray-900"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const cList = (cityGuide?.circuits || []).filter((_, i) => i !== cIdx)
                          setCityGuide((prev) => ({ ...prev!, circuits: cList }))
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove Circuit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Tagline (e.g. 112-ft bust and evening laser show)"
                        value={circuit.tagline}
                        onChange={(e) => {
                          const cList = [...(cityGuide?.circuits || [])]
                          cList[cIdx].tagline = e.target.value
                          setCityGuide((prev) => ({ ...prev!, circuits: cList }))
                        }}
                        className="sm:col-span-2 p-2 bg-white rounded-xl border border-gray-200 text-xs"
                      />
                      <select
                        value={circuit.transport_type}
                        onChange={(e) => {
                          const cList = [...(cityGuide?.circuits || [])]
                          cList[cIdx].transport_type = e.target.value as any
                          setCityGuide((prev) => ({ ...prev!, circuits: cList }))
                        }}
                        className="p-2 bg-white rounded-xl border border-gray-200 text-xs font-semibold"
                      >
                        <option value="bike">🏍️ Bike Ride</option>
                        <option value="car">🚗 Car Ride</option>
                        <option value="van">🚐 Van Tour</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Duration (e.g. 3 to 5 Hours)"
                        value={circuit.ideal_duration}
                        onChange={(e) => {
                          const cList = [...(cityGuide?.circuits || [])]
                          cList[cIdx].ideal_duration = e.target.value
                          setCityGuide((prev) => ({ ...prev!, circuits: cList }))
                        }}
                        className="p-2 bg-white rounded-xl border border-gray-200 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Best Time (e.g. 4 PM – 8 PM)"
                        value={circuit.best_time_of_day}
                        onChange={(e) => {
                          const cList = [...(cityGuide?.circuits || [])]
                          cList[cIdx].best_time_of_day = e.target.value
                          setCityGuide((prev) => ({ ...prev!, circuits: cList }))
                        }}
                        className="p-2 bg-white rounded-xl border border-gray-200 text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Starting Rate (₹)"
                        value={circuit.estimated_rate || ''}
                        onChange={(e) => {
                          const cList = [...(cityGuide?.circuits || [])]
                          cList[cIdx].estimated_rate = Number(e.target.value) || 0
                          setCityGuide((prev) => ({ ...prev!, circuits: cList }))
                        }}
                        className="p-2 bg-white rounded-xl border border-gray-200 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Transport name (e.g. RE Classic 350)"
                        value={circuit.recommended_transport}
                        onChange={(e) => {
                          const cList = [...(cityGuide?.circuits || [])]
                          cList[cIdx].recommended_transport = e.target.value
                          setCityGuide((prev) => ({ ...prev!, circuits: cList }))
                        }}
                        className="p-2 bg-white rounded-xl border border-gray-200 text-xs"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Attractions comma-separated (e.g. Adiyogi Statue, Dhyanalinga, Theerthakund)"
                      value={(circuit.key_attractions || []).join(', ')}
                      onChange={(e) => {
                        const cList = [...(cityGuide?.circuits || [])]
                        cList[cIdx].key_attractions = e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                        setCityGuide((prev) => ({ ...prev!, circuits: cList }))
                      }}
                      className="w-full p-2 bg-white rounded-xl border border-gray-200 text-xs"
                    />

                    <input
                      type="text"
                      placeholder="Local Pro-Tip (e.g. Park in Lot 2 for fast exit after 7 PM show)"
                      value={circuit.pro_tip}
                      onChange={(e) => {
                        const cList = [...(cityGuide?.circuits || [])]
                        cList[cIdx].pro_tip = e.target.value
                        setCityGuide((prev) => ({ ...prev!, circuits: cList }))
                      }}
                      className="w-full p-2 bg-white rounded-xl border border-gray-200 text-xs text-amber-900"
                    />
                  </div>
                ))}
              </div>

              {/* Distance & Driving Time Matrix */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      Distance & Driving Time Matrix ({cityGuide?.distance_matrix?.length || 0})
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Table displayed to tourists comparing driving times and ideal hours.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const newRow: RegionalGuideDistance = {
                        destination: '',
                        distance: '15 km',
                        drive_time: '30 mins',
                        ideal_hours: '2 to 3 Hours',
                        best_transport: 'Bike or Car',
                      }
                      setCityGuide((prev) => ({
                        ...(prev || { circuits: [], distance_matrix: [], insider_tips: [] }),
                        distance_matrix: [...(prev?.distance_matrix || []), newRow],
                      }))
                    }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
                  </Button>
                </div>

                <div className="space-y-2">
                  {(cityGuide?.distance_matrix || []).map((row, rIdx) => (
                    <div key={rIdx} className="grid grid-cols-1 sm:grid-cols-6 gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200 items-center">
                      <input
                        type="text"
                        placeholder="Destination name"
                        value={row.destination}
                        onChange={(e) => {
                          const dList = [...(cityGuide?.distance_matrix || [])]
                          dList[rIdx].destination = e.target.value
                          setCityGuide((prev) => ({ ...prev!, distance_matrix: dList }))
                        }}
                        className="sm:col-span-2 p-1.5 bg-white rounded-lg border border-gray-200 text-xs font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="Dist (e.g. 32 km)"
                        value={row.distance}
                        onChange={(e) => {
                          const dList = [...(cityGuide?.distance_matrix || [])]
                          dList[rIdx].distance = e.target.value
                          setCityGuide((prev) => ({ ...prev!, distance_matrix: dList }))
                        }}
                        className="p-1.5 bg-white rounded-lg border border-gray-200 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Time (e.g. 45 mins)"
                        value={row.drive_time}
                        onChange={(e) => {
                          const dList = [...(cityGuide?.distance_matrix || [])]
                          dList[rIdx].drive_time = e.target.value
                          setCityGuide((prev) => ({ ...prev!, distance_matrix: dList }))
                        }}
                        className="p-1.5 bg-white rounded-lg border border-gray-200 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Ideal Hours (e.g. 3 to 5 Hours)"
                        value={row.ideal_hours}
                        onChange={(e) => {
                          const dList = [...(cityGuide?.distance_matrix || [])]
                          dList[rIdx].ideal_hours = e.target.value
                          setCityGuide((prev) => ({ ...prev!, distance_matrix: dList }))
                        }}
                        className="p-1.5 bg-white rounded-lg border border-gray-200 text-xs"
                      />
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Transport (e.g. Bike / Car)"
                          value={row.best_transport}
                          onChange={(e) => {
                            const dList = [...(cityGuide?.distance_matrix || [])]
                            dList[rIdx].best_transport = e.target.value
                            setCityGuide((prev) => ({ ...prev!, distance_matrix: dList }))
                          }}
                          className="flex-1 p-1.5 bg-white rounded-lg border border-gray-200 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const dList = (cityGuide?.distance_matrix || []).filter((_, i) => i !== rIdx)
                            setCityGuide((prev) => ({ ...prev!, distance_matrix: dList }))
                          }}
                          className="text-red-500 hover:text-red-700 p-1 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insider Travel Tips */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Insider Secrets & Travel Tips ({cityGuide?.insider_tips?.length || 0})
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Local advice on timings, permits, clothing, and secrets.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const newTip: RegionalGuideTip = {
                        title: '',
                        content: '',
                      }
                      setCityGuide((prev) => ({
                        ...(prev || { circuits: [], distance_matrix: [], insider_tips: [] }),
                        insider_tips: [...(prev?.insider_tips || []), newTip],
                      }))
                    }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Tip
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {(cityGuide?.insider_tips || []).map((tip, tIdx) => (
                    <div key={tIdx} className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          placeholder="Tip Title (e.g. Best 7 PM Sunset Spot)"
                          value={tip.title}
                          onChange={(e) => {
                            const tList = [...(cityGuide?.insider_tips || [])]
                            tList[tIdx].title = e.target.value
                            setCityGuide((prev) => ({ ...prev!, insider_tips: tList }))
                          }}
                          className="flex-1 p-1.5 bg-white rounded-lg border border-amber-200 text-xs font-bold text-gray-900"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const tList = (cityGuide?.insider_tips || []).filter((_, i) => i !== tIdx)
                            setCityGuide((prev) => ({ ...prev!, insider_tips: tList }))
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Detailed advice or instructions for tourists..."
                        value={tip.content}
                        onChange={(e) => {
                          const tList = [...(cityGuide?.insider_tips || [])]
                          tList[tIdx].content = e.target.value
                          setCityGuide((prev) => ({ ...prev!, insider_tips: tList }))
                        }}
                        className="w-full p-2 bg-white rounded-lg border border-amber-200 text-xs text-gray-700"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

              {/* Submit CTA */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={actionLoading}>
                  {editingCity ? 'Save Changes' : 'Create City Destination'}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}

