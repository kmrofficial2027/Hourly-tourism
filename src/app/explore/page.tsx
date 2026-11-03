'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SearchBar } from '@/components/layout/SearchBar'
import { FilterSidebar, type FilterValues } from '@/components/listings/FilterSidebar'
import { ListingGrid } from '@/components/listings/ListingGrid'
import { Pagination } from '@/components/ui/Pagination'

// Fallback initial services for demo or when database is fresh
const mockListings = [
  {
    id: 'bike-cbe-01',
    title: 'Royal Enfield Hunter 350 — Isha & Velliangiri Foothills Ride',
    category: 'bike',
    short_description:
      'Cruise along palm-lined Western Ghats foothills to the 112-ft Adiyogi Shiva statue and Isha Yoga Center. Dual helmets and fuel included.',
    destination_city: 'Coimbatore',
    hourly_rate: 180,
    min_booking_hours: 2,
    max_booking_hours: 12,
    average_rating: 4.9,
    total_reviews: 58,
    is_featured: true,
    images: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    ],
    provider: { business_name: 'Kovai Foothill Riders' },
  },
  {
    id: 'car-cbe-02',
    title: 'Toyota Innova Crysta Chauffeur — Isha & Marudhamalai Circuit',
    category: 'car',
    short_description:
      'Premium AC SUV with courteous local chauffeur for family trips to Adiyogi, Dhyanalinga, Marudhamalai Temple, and Perur Pateeswarar.',
    destination_city: 'Coimbatore',
    hourly_rate: 650,
    min_booking_hours: 3,
    max_booking_hours: 12,
    average_rating: 5.0,
    total_reviews: 74,
    is_featured: true,
    images: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
    ],
    provider: { business_name: 'Kongu Chauffeur Mobility' },
  },
  {
    id: 'van-cbe-03',
    title: 'Force Urbania 12-Seater Luxury Van — Valparai 40 Hairpins Safari',
    category: 'van',
    short_description:
      'Spacious reclining seats and seasoned hill driver for Valparai tea estates, Aliyar Dam, Monkey Falls, and Anamalai Tiger Reserve.',
    destination_city: 'Pollachi',
    hourly_rate: 1100,
    min_booking_hours: 4,
    max_booking_hours: 12,
    average_rating: 4.9,
    total_reviews: 42,
    is_featured: true,
    images: [
      'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&w=800&q=80',
    ],
    provider: { business_name: 'Anamalai Luxury Fleet & Tours' },
  },
  {
    id: 'guide-cbe-04',
    title: 'Kongu Heritage, Silk & Ancient Temples Expert Guide',
    category: 'local_guide',
    short_description:
      'Explore 1500-year-old Chola carvings at Perur Pateeswarar Temple, historic textile mills, and handloom silk weaving centers in Coimbatore.',
    destination_city: 'Coimbatore',
    hourly_rate: 400,
    min_booking_hours: 2,
    max_booking_hours: 6,
    average_rating: 5.0,
    total_reviews: 69,
    is_featured: true,
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    ],
    provider: { business_name: 'Kovai Heritage Guild' },
  },
  {
    id: 'tour-cbe-05',
    title: 'Siruvani Sweet Water Reserve Forest & Waterfalls Tour',
    category: 'sightseeing_tour',
    short_description:
      'Eco-trip into pristine Western Ghats reserve forest to taste the world-renowned sweet Siruvani mineral water and visit lush cascades.',
    destination_city: 'Coimbatore',
    hourly_rate: 550,
    min_booking_hours: 3,
    max_booking_hours: 8,
    average_rating: 4.9,
    total_reviews: 51,
    is_featured: true,
    images: [
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    ],
    provider: { business_name: 'Western Ghats Eco Adventures' },
  },
  {
    id: 'exp-cbe-06',
    title: 'Kongunadu Traditional Culinary & Spices Tasting Trail',
    category: 'experience',
    short_description:
      'Sample authentic Kongunadu specialties in RS Puram: Pallipalayam, Arisi Paruppu Sadam, fresh tender coconut, and iconic Kovai filter coffee.',
    destination_city: 'Coimbatore',
    hourly_rate: 480,
    min_booking_hours: 2,
    max_booking_hours: 4,
    average_rating: 5.0,
    total_reviews: 83,
    is_featured: true,
    images: [
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80',
    ],
    provider: { business_name: 'Kongu Food Trails' },
  },
  {
    id: 'car-cbe-07',
    title: 'Mahindra Thar 4x4 — Pollachi Coconut Canal & Foothills Drive',
    category: 'car',
    short_description:
      'Open-air 4x4 drive along the famous scenic canal roads, movie shooting locations, and coconut groves of Pollachi.',
    destination_city: 'Pollachi',
    hourly_rate: 750,
    min_booking_hours: 3,
    max_booking_hours: 12,
    average_rating: 4.9,
    total_reviews: 37,
    is_featured: false,
    images: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
    ],
    provider: { business_name: 'Pollachi Rural Offroaders' },
  },
  {
    id: 'van-cbe-08',
    title: 'Force Traveller 9-Seater — Ooty & Coonoor Hill Hop (Nilgiri Ghats)',
    category: 'van',
    short_description:
      'Flexible hourly mountain van from Coimbatore/Mettupalayam to Coonoor Tea Estates and Dolphin’s Nose without full-day commitments.',
    destination_city: 'Mettupalayam',
    hourly_rate: 950,
    min_booking_hours: 6,
    max_booking_hours: 12,
    average_rating: 4.8,
    total_reviews: 44,
    is_featured: false,
    images: [
      'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&w=800&q=80',
    ],
    provider: { business_name: 'Nilgiri Hill Transit' },
  },
  {
    id: 'bike-cbe-09',
    title: 'Yamaha Aerox 155 Maxi-Scooter — Marudhamalai Hill & City Food Express',
    category: 'bike',
    short_description:
      'Zippy liquid-cooled maxi-scooter with under-seat helmet storage. Ideal for gliding up the Marudhamalai Murugan hill temple road and RS Puram cafes.',
    destination_city: 'Coimbatore',
    hourly_rate: 150,
    min_booking_hours: 2,
    max_booking_hours: 8,
    average_rating: 4.9,
    total_reviews: 39,
    is_featured: false,
    images: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    ],
    provider: { business_name: 'Kovai Foothill Riders' },
  },
  {
    id: 'bike-cbe-10',
    title: 'Royal Enfield Himalayan 450 — Siruvani Forest & Sadivayal Foothills',
    category: 'bike',
    short_description:
      'Rugged adventure tourer built for Western Ghats twisties, forest checkposts, and gravel paths towards the Siruvani river catchment.',
    destination_city: 'Coimbatore',
    hourly_rate: 220,
    min_booking_hours: 3,
    max_booking_hours: 10,
    average_rating: 5.0,
    total_reviews: 47,
    is_featured: false,
    images: [
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
    ],
    provider: { business_name: 'Velliangiri Moto Expeditions' },
  },
  {
    id: 'car-cbe-11',
    title: 'Maruti Suzuki Ertiga Hybrid — Perur Temple & Gedee Vintage Car Museum Tour',
    category: 'car',
    short_description:
      'Economical 6-seater AC car with driver for hassle-free city touring: Perur Pateeswarar Temple, Gedee Car Museum, Race Course, and shopping.',
    destination_city: 'Coimbatore',
    hourly_rate: 480,
    min_booking_hours: 2,
    max_booking_hours: 8,
    average_rating: 4.8,
    total_reviews: 52,
    is_featured: false,
    images: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
    ],
    provider: { business_name: 'Kongu Chauffeur Mobility' },
  },
  {
    id: 'van-cbe-12',
    title: 'Tempo Traveller 12-Seater — Baralikadu Coracle & Pillur Dam Eco-Picnic',
    category: 'van',
    short_description:
      'Family and group van for the scenic mountain drive through Karamadai forest to Baralikadu eco-tourism, parisal coracle boat rides, and Pillur dam.',
    destination_city: 'Karamadai',
    hourly_rate: 1050,
    min_booking_hours: 5,
    max_booking_hours: 12,
    average_rating: 4.9,
    total_reviews: 31,
    is_featured: false,
    images: [
      'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&w=800&q=80',
    ],
    provider: { business_name: 'Western Ghats Van Rentals' },
  },
  {
    id: 'guide-cbe-13',
    title: 'Isha Dhyanalinga & Adiyogi Certified Spiritual Concierge',
    category: 'local_guide',
    short_description:
      'Personal guide through the spiritual processes at Isha Yoga Center: Nada Aradhana, Surya Kund dip, Dhyanalinga silence, and Adiyogi light show narration.',
    destination_city: 'Coimbatore',
    hourly_rate: 380,
    min_booking_hours: 2,
    max_booking_hours: 6,
    average_rating: 5.0,
    total_reviews: 64,
    is_featured: false,
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    ],
    provider: { business_name: 'Velliangiri Spiritual Walkers' },
  },
  {
    id: 'tour-cbe-14',
    title: 'Topslip Wildlife & Sethumadai Village Countryside Safari',
    category: 'sightseeing_tour',
    short_description:
      'Hourly guided safari to Topslip elephant camp in Anamalai Tiger Reserve, teak plantations, and Sethumadai rural coconut farmlands.',
    destination_city: 'Pollachi',
    hourly_rate: 620,
    min_booking_hours: 4,
    max_booking_hours: 8,
    average_rating: 4.9,
    total_reviews: 43,
    is_featured: false,
    images: [
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    ],
    provider: { business_name: 'Anamalai Eco Trails' },
  },
  {
    id: 'exp-cbe-15',
    title: 'Gedee Car Museum & Kovai Industrial Innovation Guided Walk',
    category: 'experience',
    short_description:
      'Curated walk through India’s foremost vintage automobile collection, showcasing 70+ iconic classic cars and G.D. Naidu’s pioneering indigenous inventions.',
    destination_city: 'Coimbatore',
    hourly_rate: 350,
    min_booking_hours: 2,
    max_booking_hours: 4,
    average_rating: 5.0,
    total_reviews: 57,
    is_featured: false,
    images: [
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80',
    ],
    provider: { business_name: 'Kovai Science & Heritage Society' },
  },
]

function ExploreContent() {
  const searchParams = useSearchParams()

  const destinationParam = searchParams.get('destination') || ''
  const categoryParam = searchParams.get('category') || ''
  const dateParam = searchParams.get('date') || ''
  const timeParam = searchParams.get('time') || ''
  const durationParam = searchParams.get('duration') ? Number(searchParams.get('duration')) : 2

  const [filters, setFilters] = useState<FilterValues>({
    category: categoryParam || undefined,
    destination: destinationParam || undefined,
    sortBy: 'recommended',
  })

  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 9

  useEffect(() => {
    // Sync filters with URL query parameters when URL changes
    setFilters((prev) => ({
      ...prev,
      category: searchParams.get('category') || undefined,
      destination: searchParams.get('destination') || undefined,
    }))
  }, [searchParams])

  // Fetch or filter listings
  useEffect(() => {
    async function loadListings() {
      setLoading(true)
      try {
        const queryParams = new URLSearchParams()
        if (filters.category) queryParams.set('category', filters.category)
        if (filters.destination) queryParams.set('destination', filters.destination)
        if (filters.minPrice) queryParams.set('minPrice', filters.minPrice.toString())
        if (filters.maxPrice) queryParams.set('maxPrice', filters.maxPrice.toString())
        if (filters.minRating) queryParams.set('minRating', filters.minRating.toString())
        if (filters.sortBy) queryParams.set('sortBy', filters.sortBy)

        const res = await fetch(`/api/services?${queryParams.toString()}`)
        if (res.ok) {
          const data = await res.json()
          if (data.listings && data.listings.length > 0) {
            setListings(data.listings)
            setLoading(false)
            return
          }
        }

        // Client-side fallback filter over mock listings if database is empty
        let result = [...mockListings]

        if (filters.category) {
          result = result.filter((l) => l.category === filters.category)
        }
        if (filters.destination) {
          const destLower = filters.destination.toLowerCase()
          result = result.filter(
            (l) =>
              l.destination_city?.toLowerCase().includes(destLower) ||
              l.title.toLowerCase().includes(destLower) ||
              l.short_description?.toLowerCase().includes(destLower)
          )
        }
        if (filters.minPrice) {
          result = result.filter((l) => Number(l.hourly_rate) >= (filters.minPrice || 0))
        }
        if (filters.maxPrice) {
          result = result.filter((l) => Number(l.hourly_rate) <= (filters.maxPrice || 999999))
        }
        if (filters.minRating) {
          result = result.filter((l) => Number(l.average_rating) >= (filters.minRating || 0))
        }

        if (filters.sortBy === 'price_asc') {
          result.sort((a, b) => a.hourly_rate - b.hourly_rate)
        } else if (filters.sortBy === 'price_desc') {
          result.sort((a, b) => b.hourly_rate - a.hourly_rate)
        } else if (filters.sortBy === 'rating_desc') {
          result.sort((a, b) => b.average_rating - a.average_rating)
        }

        setListings(result)
      } catch (err) {
        setListings(mockListings)
      } finally {
        setLoading(false)
      }
    }

    loadListings()
  }, [filters])

  const totalPages = Math.ceil(listings.length / pageSize) || 1
  const paginatedListings = listings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />

      {/* Top Search bar wrapper */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar
            compact
            initialDestination={destinationParam}
            initialCategory={categoryParam}
            initialDate={dateParam}
            initialTime={timeParam}
            initialDuration={durationParam}
          />
        </div>
      </div>

      {/* Main Browse Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onReset={() => setFilters({ sortBy: 'recommended' })}
            totalResults={listings.length}
          />

          {/* Results Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 font-display">
                {filters.category
                  ? `${filters.category.replace(/_/g, ' ').toUpperCase()} Services by the Hour`
                  : 'All Hourly Tourism Services'}
              </h1>
              <span className="text-xs text-gray-500 font-semibold hidden sm:block">
                Showing {listings.length} experiences
              </span>
            </div>

            <ListingGrid
              listings={paginatedListings}
              loading={loading}
              emptyTitle="No hourly services match your search"
              emptyDescription="Try clearing your category, price, or location filters to see more available options."
            />

            {/* Pagination */}
            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ExploreContent />
    </Suspense>
  )
}

