'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Clock,
  Compass,
  Car,
  Bike,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  HelpCircle,
  Camera,
  Coffee,
  Trees,
} from 'lucide-react'

export interface CoimbatoreCircuit {
  id: string
  region: 'Coimbatore' | 'Pollachi'
  title: string
  category: 'Spiritual' | 'Hills & Ghats' | 'Eco & Rainforest' | 'Heritage & Culture' | 'Rural & Wildlife'
  tagline: string
  distanceKm: number
  idealDurationHours: string
  bestTimeOfDay: string
  recommendedTransport: string
  transportType: 'bike' | 'car' | 'van'
  estimatedStartingRate: number
  keyAttractions: string[]
  proTip: string
  image: string
  searchDestination: string
}

export const COIMBATORE_CIRCUITS: CoimbatoreCircuit[] = [
  {
    id: 'isha-adiyogi',
    region: 'Coimbatore',
    title: 'Isha Yoga & 112-ft Adiyogi Shiva Statue',
    category: 'Spiritual',
    tagline: 'Velliangiri Foothills sunset meditation & 3D projection show',
    distanceKm: 32,
    idealDurationHours: '3 to 5 Hours',
    bestTimeOfDay: '4:30 PM – 8:30 PM (7:00 PM Light Show)',
    recommendedTransport: 'Royal Enfield Cruiser Bike or Chauffeur SUV',
    transportType: 'bike',
    estimatedStartingRate: 180,
    keyAttractions: [
      '112-ft Adiyogi Bust (Guinness World Record)',
      'Dhyanalinga Dome & Nada Aradhana Meditation',
      'Theerthakund Sacred Water Dip',
      'Divya Darshanam 3D Sound & Light Projection',
    ],
    proTip: 'Park in Lot 2 for fastest exit after the 7 PM Divya Darshanam show. Wear modest attire with covered shoulders and knees.',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80',
    searchDestination: 'Isha',
  },
  {
    id: 'siruvani-rainforest',
    region: 'Coimbatore',
    title: 'Siruvani Waterfalls & Bio-Reserve Rainforest',
    category: 'Eco & Rainforest',
    tagline: 'Taste the world-renowned sweet mineral water in pristine Western Ghats',
    distanceKm: 35,
    idealDurationHours: '4 to 6 Hours',
    bestTimeOfDay: '10:00 AM – 2:30 PM (Forest permit hours)',
    recommendedTransport: 'Adventure Bike (Himalayan 450) or Family Car',
    transportType: 'car',
    estimatedStartingRate: 480,
    keyAttractions: [
      'Pure natural mineral water tasting direct from mountain springs',
      'Sadivayal Forest Check-post & eco-interpretive nature walk',
      'Cascading waterfalls & lush Muthikulam shola forest canopies',
      'Kovai Kutralam seasonal cascades',
    ],
    proTip: 'Strict zero-plastic zone. Forest gate permits entry until 3:30 PM only. Carry steel water bottles to taste the sweetest water.',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80',
    searchDestination: 'Siruvani',
  },
  {
    id: 'marudhamalai-hills',
    region: 'Coimbatore',
    title: 'Marudhamalai Murugan Hill Temple',
    category: 'Spiritual',
    tagline: '7th-century hill shrine enveloped in sacred Western Ghats herbal breezes',
    distanceKm: 12,
    idealDurationHours: '2 to 3 Hours',
    bestTimeOfDay: '6:30 AM – 9:30 AM or 5:00 PM – 7:30 PM',
    recommendedTransport: 'Maxi-Scooter (Aerox 155) or Chauffeur Sedan',
    transportType: 'bike',
    estimatedStartingRate: 150,
    keyAttractions: [
      'Ancient Hilltop Subramaniya Swamy Temple',
      'Pambatti Siddhar Cave & medicinal herbal air',
      'Panoramic 180-degree view of Coimbatore city skyline',
      'Scenic, well-paved winding ghat roadway to the summit',
    ],
    proTip: 'Two-wheelers and cars can drive directly to the summit parking lot. Visit during morning abishekam for maximum serenity.',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80',
    searchDestination: 'Marudhamalai',
  },
  {
    id: 'perur-heritage',
    region: 'Coimbatore',
    title: 'Perur Pateeswarar Temple & Chola Art Heritage',
    category: 'Heritage & Culture',
    tagline: '1500-year-old stone temple with the world-famous Kanaka Sabha hall',
    distanceKm: 7,
    idealDurationHours: '2 to 3 Hours',
    bestTimeOfDay: '8:00 AM – 11:00 AM or 4:30 PM – 7:00 PM',
    recommendedTransport: 'Local Chauffeur Car with Certified Heritage Guide',
    transportType: 'car',
    estimatedStartingRate: 400,
    keyAttractions: [
      'Monolithic Kanaka Sabha stone pillars with intricate Nataraja carvings',
      'Noyyal River heritage steps and ancient Chola inscriptions',
      'Gopuram architectural details from Karikala Chola to Vijayanagara era',
      'Sirumugai soft-silk handloom weaving connection',
    ],
    proTip: 'Book an hourly heritage guide to reveal hidden stone acoustic musical pillars and centuries-old Tamil inscriptions.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
    searchDestination: 'Perur',
  },
  {
    id: 'gedee-museum-food',
    region: 'Coimbatore',
    title: 'Gedee Car Museum & Kongunadu Culinary Trail',
    category: 'Heritage & Culture',
    tagline: '70+ vintage classic cars paired with legendary Kovai filter coffee & food',
    distanceKm: 3,
    idealDurationHours: '3 to 4 Hours',
    bestTimeOfDay: '10:30 AM – 2:30 PM or 4:00 PM – 8:00 PM',
    recommendedTransport: 'Hourly City Car with Driver or City Bike',
    transportType: 'car',
    estimatedStartingRate: 350,
    keyAttractions: [
      '70+ vintage automobiles including 1886 Benz Patent Motorwagen replica',
      'Rare European microcars and GD Naidu indigenous inventions',
      'Sree Annapoorna legendary roast dosa & authentic Kovai filter coffee',
      'RS Puram street snack trail & evening walk along Race Course',
    ],
    proTip: 'Gedee Car Museum is closed on Mondays. Plan your morning visit and walk to Race Course for authentic Kongunadu snacks.',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
    searchDestination: 'Gedee',
  },
  {
    id: 'baralikadu-eco',
    region: 'Coimbatore',
    title: 'Baralikadu Parisal Coracle & Pillur Dam Eco-Picnic',
    category: 'Eco & Rainforest',
    tagline: 'Forest river coracle ride and traditional Irula tribal feast in Bhavani valley',
    distanceKm: 65,
    idealDurationHours: '6 to 8 Hours',
    bestTimeOfDay: '9:00 AM – 3:30 PM (Weekend Forest Slots)',
    recommendedTransport: '12-Seater Tempo Traveller Van',
    transportType: 'van',
    estimatedStartingRate: 1050,
    keyAttractions: [
      'Parisal round coracle boat rides on Pillur Dam backwaters',
      'Scenic Karamadai forest mountain drive with Nilgiri views',
      'Authentic tribal buffet prepared with local spices and wild herbs',
      'Pillur Dam catchment viewpoints & mountain stream baths',
    ],
    proTip: 'Eco-tourism package is operated by the Tamil Nadu Forest Department primarily on weekends. Book a van for family group travel.',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
    searchDestination: 'Baralikadu',
  },
  // Pollachi Regional Circuits
  {
    id: 'pollachi-aliyar',
    region: 'Pollachi',
    title: 'Aliyar Dam, Reservoir Gardens & Monkey Falls',
    category: 'Eco & Rainforest',
    tagline: 'Scenic foothill reservoir, manicured park & refreshing natural waterfalls',
    distanceKm: 24,
    idealDurationHours: '3 to 5 Hours',
    bestTimeOfDay: '8:30 AM – 1:30 PM (Cool mountain water flow)',
    recommendedTransport: 'Royal Enfield Cruiser Bike or Chauffeur Sedan',
    transportType: 'bike',
    estimatedStartingRate: 190,
    keyAttractions: [
      'Aliyar Dam reservoir bund walk & manicured park gardens',
      'Monkey Falls natural cascades & natural spring baths',
      'Aliyar Contour Canal aqueduct walk through coconut groves',
      'Panoramic photography of towering Anamalai peaks',
    ],
    proTip: 'Visit Monkey Falls early before 11 AM. Carry extra clothes for natural stream dip.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    searchDestination: 'Pollachi',
  },
  {
    id: 'pollachi-valparai',
    region: 'Pollachi',
    title: 'Valparai 40 Hairpins & Cloud-Kissed Tea Plateaus',
    category: 'Hills & Ghats',
    tagline: 'Ascend 3,500 ft through 40 numbered mountain curves with wild Nilgiri Tahr sightings',
    distanceKm: 64,
    idealDurationHours: '6 to 10 Hours',
    bestTimeOfDay: 'Depart 6:30 AM for early morning ghat mist',
    recommendedTransport: '12-Seater Luxury Van or Chauffeur SUV',
    transportType: 'van',
    estimatedStartingRate: 1100,
    keyAttractions: [
      '40 numbered hairpin bends with bird-eye reservoir views',
      'Loam’s Viewpoint overlooking entire Pollachi plains',
      'High-altitude organic tea factories and sprawling plantations',
      'Rare wildlife spotting: Lion-tailed macaques & Nilgiri Tahr',
    ],
    proTip: 'Stop at the 9th hairpin bend for breathtaking valley photos. Dress in light woolens for the hill chill.',
    image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&w=1000&q=80',
    searchDestination: 'Valparai',
  },
  {
    id: 'pollachi-topslip',
    region: 'Pollachi',
    title: 'Topslip Tiger Reserve & Kozhikamuthi Elephant Safari',
    category: 'Rural & Wildlife',
    tagline: 'Dense evergreen rainforest safari & ethical elephant rehabilitation camp',
    distanceKm: 38,
    idealDurationHours: '5 to 7 Hours',
    bestTimeOfDay: '7:00 AM – 12:00 PM (Forest Department safari timings)',
    recommendedTransport: 'Mahindra Thar 4x4 or Rural Tour Van',
    transportType: 'car',
    estimatedStartingRate: 750,
    keyAttractions: [
      'Kozhikamuthi elephant camp feeding & bathing interaction',
      'Anamalai Tiger Reserve deep rainforest safari trail',
      'Canopy walking trails & bird-watching in bamboo thickets',
      'Scenic teak plantation drive through Sethumadai valley',
    ],
    proTip: 'Forest checkpost entry opens at 7 AM. Keep valid government ID handy for forest department entry tokens.',
    image: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1000&q=80',
    searchDestination: 'Topslip',
  },
  {
    id: 'pollachi-canal',
    region: 'Pollachi',
    title: 'Pollachi Coconut Canal & Film Countryside Trail',
    category: 'Rural & Wildlife',
    tagline: 'Lush canal roads beneath swaying coconut canopies made famous by cinema',
    distanceKm: 18,
    idealDurationHours: '2 to 4 Hours',
    bestTimeOfDay: '7:30 AM – 10:30 AM or 4:00 PM – 6:30 PM',
    recommendedTransport: 'Two-Wheeler Cruiser or Open-top 4x4',
    transportType: 'bike',
    estimatedStartingRate: 180,
    keyAttractions: [
      'PAP Irrigation Canal roads lined with tens of thousands of coconut palms',
      'Sethumadai farmlands & iconic movie shooting spots',
      'Fresh farm-gate tender coconut water (Samathur Elaneer)',
      'Masani Amman sacred temple riverbank heritage',
    ],
    proTip: 'Stop by Samathur village for sweet tender coconut straight from the trees at half city rates.',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80',
    searchDestination: 'Pollachi',
  },
]

interface CoimbatoreTripPlannerProps {
  initialRegion?: string
}

export function CoimbatoreTripPlanner({ initialRegion = 'Coimbatore' }: CoimbatoreTripPlannerProps) {
  const [activeCities, setActiveCities] = useState<any[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion)
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [loading, setLoading] = useState(false)

  // Fetch active launched destinations
  React.useEffect(() => {
    async function loadCities() {
      try {
        const res = await fetch(`/api/destinations?t=${Date.now()}`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          const list = data.destinations || data.cities || []
          if (list.length > 0) {
            setActiveCities(list)
            // If initialRegion is not in list, pick the first one
            const exists = list.some((c: any) => c.name.toLowerCase() === selectedRegion.toLowerCase())
            if (!exists) {
              setSelectedRegion(list[0].name)
            }
          }
        }
      } catch (err) {
        console.warn('Could not load destinations in trip planner:', err)
      }
    }
    loadCities()
  }, [])

  // Find active city object
  const currentCityObj = activeCities.find(
    (c: any) => c.name.toLowerCase() === selectedRegion.toLowerCase()
  )

  // Build circuits for current city
  const regionCircuits: CoimbatoreCircuit[] = React.useMemo(() => {
    // 1. If Coimbatore or Pollachi and hardcoded circuits exist
    const hardcoded = COIMBATORE_CIRCUITS.filter(
      (c) => c.region.toLowerCase() === selectedRegion.toLowerCase()
    )

    // 2. If current city has guide circuits, convert them
    if (currentCityObj?.guide?.circuits && currentCityObj.guide.circuits.length > 0) {
      const guideCircuits = currentCityObj.guide.circuits.map((gc: any, idx: number) => ({
        id: gc.id || `circuit-${idx}`,
        region: selectedRegion as any,
        title: gc.title,
        category: (gc.category || 'Hills & Ghats') as any,
        tagline: gc.tagline || `Discover scenic landmarks and viewpoints in ${selectedRegion}`,
        distanceKm: gc.distance_km || 25,
        idealDurationHours: gc.ideal_duration || '3 to 5 Hours',
        bestTimeOfDay: gc.best_time_of_day || '9:00 AM – 2:00 PM',
        recommendedTransport: gc.recommended_transport || 'Cruiser Bike or AC Sedan',
        transportType: (gc.transport_type || 'bike') as any,
        estimatedStartingRate: gc.estimated_rate || 200,
        keyAttractions: gc.key_attractions || [],
        proTip: gc.pro_tip || `Enjoy the fresh hill breeze and plan with local certified hosts.`,
        image: gc.image_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
        searchDestination: selectedRegion,
      }))

      // If hardcoded exists and is non-empty, merge or prioritize
      if (hardcoded.length > 0 && (selectedRegion.toLowerCase() === 'coimbatore' || selectedRegion.toLowerCase() === 'pollachi')) {
        return hardcoded
      }
      return guideCircuits
    }

    if (hardcoded.length > 0) return hardcoded

    // 3. If no circuits yet, generate fallback circuits from top_spots
    if (currentCityObj?.top_spots?.length) {
      return currentCityObj.top_spots.slice(0, 3).map((spot: any, idx: number) => ({
        id: spot.id || `spot-${idx}`,
        region: selectedRegion as any,
        title: spot.name,
        category: 'Hills & Ghats' as any,
        tagline: spot.description,
        distanceKm: 20 + idx * 8,
        idealDurationHours: spot.recommended_hours || '3 to 4 Hours',
        bestTimeOfDay: '8:30 AM – 1:30 PM',
        recommendedTransport: 'Cruiser Bike or AC Sedan',
        transportType: 'car' as any,
        estimatedStartingRate: 350,
        keyAttractions: [spot.name, `${selectedRegion} City Center`, 'Local Scenic Viewpoint'],
        proTip: spot.insider_tip || 'Start early morning for clear views and breezy drives.',
        image: spot.image_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
        searchDestination: selectedRegion,
      }))
    }

    return COIMBATORE_CIRCUITS.slice(0, 3)
  }, [selectedRegion, currentCityObj])

  const [selectedCircuit, setSelectedCircuit] = useState<CoimbatoreCircuit>(
    regionCircuits[0] || COIMBATORE_CIRCUITS[0]
  )

  // Keep selected circuit in sync when region changes
  React.useEffect(() => {
    if (regionCircuits.length > 0) {
      setSelectedCircuit(regionCircuits[0])
    }
  }, [regionCircuits])

  const handleRegionChange = (newRegion: string) => {
    setSelectedRegion(newRegion)
    setActiveFilter('All')
  }

  // Extract dynamic categories from active circuits
  const dynamicCategories = React.useMemo(() => {
    const cats = new Set<string>()
    cats.add('All')
    regionCircuits.forEach((c) => {
      if (c.category) cats.add(c.category)
    })
    return Array.from(cats)
  }, [regionCircuits])

  const filteredCircuits =
    activeFilter === 'All'
      ? regionCircuits
      : regionCircuits.filter((c) => c.category === activeFilter)

  const regionBadge = `${selectedRegion} Hourly Curations`
  const regionTitle = `Featured Hourly Trips in & around ${selectedRegion}`
  const regionSubtitle =
    currentCityObj?.guide?.overview ||
    currentCityObj?.description ||
    `Explore ${selectedRegion} on your terms with verified local riders and chauffeurs. No rigid full-day tariffs—book hourly circuits and discover monuments, secret waterfalls, and panoramic viewpoints.`

  const regionExploreLink = `/explore?destination=${encodeURIComponent(selectedRegion)}`
  const regionExploreText = `View All ${selectedRegion} Curations`

  // Cities to render in the pill bar (from activeCities or defaults)
  const displayCities =
    activeCities.length > 0
      ? activeCities
      : [{ id: 'coimbatore', name: 'Coimbatore' }, { id: 'pollachi', name: 'Pollachi' }]

  return (
    <div className="bg-gradient-to-b from-emerald-950 via-gray-900 to-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-[40px] my-10 shadow-2xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Region Switcher Pills — Dynamically displays ALL active cities */}
        <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-white/10">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mr-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Select Active Region:</span>
          </span>

          {displayCities.map((city: any) => {
            const isSelected = selectedRegion.toLowerCase() === city.name.toLowerCase()
            return (
              <button
                key={city.id || city.name}
                type="button"
                onClick={() => handleRegionChange(city.name)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span>📍 {city.name}</span>
                {city.is_active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            )
          })}
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/30">
              <MapPin className="w-3.5 h-3.5" />
              <span>{regionBadge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white">
              {regionTitle}
            </h2>
            <p className="text-gray-300 text-sm sm:text-base mt-3 leading-relaxed">
              {regionSubtitle}
            </p>
          </div>

          <Link
            href={regionExploreLink}
            className="mt-6 md:mt-0 inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md transition-all border border-white/10"
          >
            <span>{regionExploreText}</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {dynamicCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === cat
                  ? 'bg-[#ff7a00] text-white shadow-lg shadow-orange-500/25'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Interactive Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Circuit Navigation List */}
          <div className="lg:col-span-5 space-y-3">
            {filteredCircuits.map((circuit) => {
              const isSelected = selectedCircuit.id === circuit.id
              return (
                <button
                  key={circuit.id}
                  onClick={() => setSelectedCircuit(circuit)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl transition-all border flex items-center justify-between group ${
                    isSelected
                      ? 'bg-emerald-900/60 border-emerald-500/60 shadow-lg ring-1 ring-emerald-500/50'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15'
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center space-x-2 text-[11px] font-semibold text-emerald-400 mb-1">
                      <span className="uppercase tracking-wider">{circuit.category}</span>
                      <span>•</span>
                      <span>{circuit.idealDurationHours}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                      {circuit.title}
                    </h3>
                    <p className="text-xs text-gray-400 truncate mt-1">
                      {circuit.tagline}
                    </p>
                  </div>

                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-xs font-bold text-emerald-400">
                      ₹{circuit.estimatedStartingRate}<span className="text-[10px] text-gray-400">/hr</span>
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1">
                      ~{circuit.distanceKm} km
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Interactive Circuit Detailed Showcase Card */}
          <div className="lg:col-span-7 bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            {/* Top Badge & Title */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                  {selectedCircuit.category} Circuit
                </span>
                <div className="flex items-center space-x-3 text-xs text-gray-300 font-medium">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>~{selectedCircuit.distanceKm} km from City Center</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{selectedCircuit.idealDurationHours}</span>
                  </span>
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
                {selectedCircuit.title}
              </h3>
              <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                {selectedCircuit.tagline}
              </p>

              {/* Trip Key Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Best Time of Day</span>
                  </span>
                  <p className="text-xs font-semibold text-white mt-1">
                    {selectedCircuit.bestTimeOfDay}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center space-x-1">
                    <Car className="w-3 h-3" />
                    <span>Recommended Vehicle</span>
                  </span>
                  <p className="text-xs font-semibold text-white mt-1">
                    {selectedCircuit.recommendedTransport}
                  </p>
                </div>
              </div>

              {/* What to Experience */}
              <div className="mt-6">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-gray-400 mb-3 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Highlights & Key Experiences</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedCircuit.keyAttractions.map((att, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs text-gray-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{att}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Local Insider Tip */}
              <div className="mt-6 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-200 leading-relaxed">
                  <strong className="text-emerald-300 font-bold block mb-0.5">Local Insider Tip:</strong>
                  {selectedCircuit.proTip}
                </div>
              </div>
            </div>

            {/* Bottom Booking Action */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-gray-400 block">Hourly Rates Starting From</span>
                <span className="text-2xl font-black text-white">
                  ₹{selectedCircuit.estimatedStartingRate}
                  <span className="text-xs font-normal text-gray-300"> / hour</span>
                </span>
              </div>

              <Link
                href={`/explore?destination=${encodeURIComponent(selectedCircuit.searchDestination)}`}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#ff7a00] to-[#f59e0b] hover:from-[#ea6f00] hover:to-[#d97706] text-white font-black text-sm shadow-xl shadow-orange-500/30 active:scale-95 transition-all"
              >
                <span>Book Hourly Ride to {selectedCircuit.searchDestination}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const RegionalTripPlanner = CoimbatoreTripPlanner

