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
    id: 'valparai-ghats',
    title: 'Valparai 40 Hairpin Ghats & Tea Estates',
    category: 'Hills & Ghats',
    tagline: 'Scenic mountain climb to 3,500 ft amidst cloud-kissed tea plateaus',
    distanceKm: 105,
    idealDurationHours: '8 to 12 Hours',
    bestTimeOfDay: 'Early Morning (Depart 6:30 AM)',
    recommendedTransport: '12-Seater Luxury Van (Force Urbania) or 4x4 SUV',
    transportType: 'van',
    estimatedStartingRate: 1100,
    keyAttractions: [
      '40 Numbered Hairpin Bends overlooking Aliyar Dam',
      'Loam’s View Point & Carver Marsh Memorial',
      'Endangered Nilgiri Tahr & Lion-tailed Macaque spotting',
      'Heritage High-Altitude Tea Factories & Estates',
    ],
    proTip: 'Check-in at Aliyar forest gate before 9:00 AM. A hill-experienced chauffeur is recommended for hairpins 15 to 28.',
    image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&w=1000&q=80',
    searchDestination: 'Valparai',
  },
  {
    id: 'siruvani-falls',
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
    id: 'pollachi-country',
    title: 'Pollachi Coconut Groves & PAP Canal Roads',
    category: 'Rural & Wildlife',
    tagline: 'Cinema-famous canal roads, Topslip elephant safari, and rural tranquility',
    distanceKm: 42,
    idealDurationHours: '5 to 7 Hours',
    bestTimeOfDay: 'Morning 7:30 AM or Late Afternoon 3:30 PM',
    recommendedTransport: 'Mahindra Thar 4x4 or 9-Seater Van',
    transportType: 'car',
    estimatedStartingRate: 750,
    keyAttractions: [
      'PAP Irrigation Canal roads lined with tens of thousands of coconut palms',
      'Sethumadai village farmlands & film shooting locations',
      'Topslip Anamalai Tiger Reserve & Kozhikamuthi Elephant Camp',
      'Organic jaggery mills & roadside tender coconut pitstops',
    ],
    proTip: 'Stop for sweet Samathur tender coconut (Elaneer) by the canal bridge. Topslip forest safari requires entry before 2 PM.',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80',
    searchDestination: 'Pollachi',
  },
  {
    id: 'perur-heritage',
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
]

export function CoimbatoreTripPlanner() {
  const [selectedCircuit, setSelectedCircuit] = useState<CoimbatoreCircuit>(COIMBATORE_CIRCUITS[0])
  const [activeFilter, setActiveFilter] = useState<string>('All')

  const categories = ['All', 'Spiritual', 'Hills & Ghats', 'Eco & Rainforest', 'Heritage & Culture', 'Rural & Wildlife']

  const filteredCircuits = activeFilter === 'All'
    ? COIMBATORE_CIRCUITS
    : COIMBATORE_CIRCUITS.filter(c => c.category === activeFilter)

  return (
    <div className="bg-gradient-to-b from-emerald-950 via-gray-900 to-gray-900 text-white py-20 px-4 sm:px-6 lg:px-8 rounded-[40px] my-12 shadow-2xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/30">
              <MapPin className="w-3.5 h-3.5" />
              <span>Coimbatore Startup Launch Edition</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white">
              Discover Coimbatore by the Hour
            </h2>
            <p className="text-gray-300 text-sm sm:text-base mt-3 leading-relaxed">
              Explore temples, mountain ghats, sweet water cascades, and tea plateaus without paying for a full-day driver.
              Select a circuit to see the optimal hours, vehicle, and insider tips.
            </p>
          </div>

          <Link
            href="/explore?destination=Coimbatore"
            className="mt-6 md:mt-0 inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md transition-all border border-white/10"
          >
            <span>View All 15+ Coimbatore Listings</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map((cat) => (
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

