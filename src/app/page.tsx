import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Compass,
  Clock,
  ShieldCheck,
  Star,
  Users,
  MapPin,
  ChevronRight,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  CalendarCheck,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SearchBar } from '@/components/layout/SearchBar'
import { ServiceCard } from '@/components/listings/ServiceCard'
import { Button } from '@/components/ui/Button'
import { SERVICE_CATEGORIES } from '@/lib/constants'
import { CoimbatoreTripPlanner } from '@/components/coimbatore/CoimbatoreTripPlanner'

// Sample initial services for showcase when database is newly seeded
const initialFeaturedServices = [
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
]

export default function HomePage({
  searchParams,
}: {
  searchParams?: { code?: string }
}) {
  if (searchParams?.code) {
    redirect(`https://hourlytourism.netlify.app/auth/callback?code=${searchParams.code}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden bg-gradient-to-b from-green-50/60 via-emerald-50/20 to-white">
        {/* Decorative background blurs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-green-200/40 via-emerald-200/30 to-orange-100/20 blur-3xl -z-10 rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            {/* Pill tag */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#ff7a00] text-xs font-bold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#ff7a00]" />
              <span>Discover More. One Hour at a Time.</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0a4d29] tracking-tight font-display leading-[1.1]">
              Explore Destinations on Your Schedule,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff7a00] to-[#f59e0b]">
                By the Hour
              </span>
            </h1>

            {/* Supporting text */}
            <p className="mt-6 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Explore your destination at your own pace. Book bikes, cars, vans, local guides,
              sightseeing tours, and unique experiences by the hour. Predefined packages or
              custom durations.
            </p>
          </div>

          {/* Search Engine Form */}
          <div className="max-w-5xl mx-auto relative z-20">
            <SearchBar />
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-gray-500">
            <span className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#ff7a00]" />
              <span>1 to 12 Hours Flexible Booking</span>
            </span>
            <span className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#15803d]" />
              <span>100% Verified Local Hosts</span>
            </span>
            <span className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Verified Customer Reviews</span>
            </span>
            <span className="flex items-center space-x-2">
              <CalendarCheck className="w-4 h-4 text-[#15803d]" />
              <span>Zero Overlap Scheduling</span>
            </span>
          </div>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#ff7a00] mb-1">
                Explore Categories
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a4d29] font-display">
                What would you like to book hourly?
              </h2>
            </div>
            <p className="text-sm text-gray-500 max-w-md mt-2 md:mt-0">
              Only verified Bikes, Cars, Vans, and Local Experts. Transparent pricing with zero hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {SERVICE_CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`/explore?category=${cat.value}`}
                className="group p-5 rounded-3xl bg-gray-50 hover:bg-orange-50/60 border border-gray-200/60 hover:border-orange-300 transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#ff7a00] mb-1">
                  {cat.label}
                </h3>
                <p className="text-[11px] text-gray-400 line-clamp-2">
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#ff7a00] mb-1">
                Coimbatore Startup Launch Edition
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a4d29] font-display">
                Featured Hourly Trips in & around Coimbatore
              </h2>
            </div>
            <Link
              href="/explore?destination=Coimbatore"
              className="mt-4 sm:mt-0 inline-flex items-center text-sm font-bold text-[#ff7a00] hover:text-[#ea6f00]"
            >
              <span>View all Coimbatore services</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialFeaturedServices.map((listing) => (
              <ServiceCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Coimbatore & Regional Western Ghats Trip Planner */}
      <section className="bg-gray-50/50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CoimbatoreTripPlanner />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#ff7a00] mb-2">
              Simple 5-Step Process
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a4d29] font-display">
              How Hourly Tourism Works
            </h2>
            <p className="text-sm text-gray-500 mt-3">
              No locked-in full-day packages. Pay only for the exact hours you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              {
                step: '01',
                title: 'Choose Destination',
                desc: 'Pick your travel city, heritage town, or holiday destination.',
                icon: MapPin,
              },
              {
                step: '02',
                title: 'Select a Service',
                desc: 'Choose from Bikes, Cars, Vans, Guides, Tours, or Experiences.',
                icon: Compass,
              },
              {
                step: '03',
                title: 'Pick Your Hours',
                desc: 'Select a predefined hourly package or pick exact custom hours.',
                icon: Clock,
              },
              {
                step: '04',
                title: 'Confirm Booking',
                desc: 'Instant conflict check, transparent price calculation, and payment.',
                icon: ShieldCheck,
              },
              {
                step: '05',
                title: 'Explore & Enjoy',
                desc: 'Meet your guide or pickup your vehicle and discover on your terms.',
                icon: Sparkles,
              },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={item.step}
                  className="relative p-6 rounded-3xl bg-gray-50 border border-gray-100 text-center flex flex-col items-center"
                >
                  <span className="text-xs font-black text-[#ff7a00] mb-2">
                    STEP {item.step}
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-white text-[#15803d] shadow-sm flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Become a Provider Banner */}
      <section className="py-20 bg-gradient-to-br from-[#0a4d29] via-[#15803d] to-[#065f46] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ff7a00]/20 text-orange-200 border border-orange-400/30">
                Partner with Hourly Tourism
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight leading-tight">
                Turn your vehicle or local knowledge into hourly revenue.
              </h2>
              <p className="text-emerald-100 text-sm sm:text-base leading-relaxed max-w-lg">
                Whether you own a bike, car, or van, or are an authorized tour guide, list your
                services on India’s leading hourly marketplace. Set your own hourly packages, control
                your availability, and receive verified direct bookings.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/become-provider">
                  <Button
                    variant="primary"
                    size="lg"
                    className="font-bold px-8 shadow-xl"
                  >
                    Start Hosting by the Hour
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-white hover:bg-white/10 border border-white/20"
                  >
                    Learn About Earnings
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2">
                <TrendingUp className="w-8 h-8 text-emerald-300" />
                <h4 className="text-2xl font-black">Flexible Earnings</h4>
                <p className="text-xs text-emerald-200">
                  Earn ₹300 to ₹1,200+ per hour with custom packages.
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2">
                <Clock className="w-8 h-8 text-emerald-300" />
                <h4 className="text-2xl font-black">Zero Lock-in</h4>
                <p className="text-xs text-emerald-200">
                  Set custom availability, buffer times, and block off dates.
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-300" />
                <h4 className="text-2xl font-black">Secure Payouts</h4>
                <p className="text-xs text-emerald-200">
                  Automated payouts directly to your verified bank account.
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2">
                <Award className="w-8 h-8 text-emerald-300" />
                <h4 className="text-2xl font-black">Provider Portal</h4>
                <p className="text-xs text-emerald-200">
                  Dedicated dashboard to accept requests, manage fleet & track revenue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Customer Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#ff7a00] mb-2">
              Verified Reviews Only
            </p>
            <h2 className="text-3xl font-extrabold text-[#0a4d29] font-display">
              Loved by Tourists Across India
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Ananya Sharma',
                city: 'Bengaluru',
                role: 'Solo Traveler',
                rating: 5,
                service: 'Royal Enfield Classic — 4 Hours in Goa',
                comment:
                  'Booking by the hour was a lifesaver. I had a 5-hour layover in Goa before my train, booked a bike instantly, and explored the coast without paying for a whole day!',
              },
              {
                name: 'Vikram Mehta',
                city: 'Delhi',
                role: 'Family Vacation',
                rating: 5,
                service: '9-Seater Luxury Van — 6 Hours in Kochi',
                comment:
                  'We traveled with elderly parents and kids. Booking the van for 6 hours let us visit Fort Kochi, do some shopping, and get dropped at the airport right on time. Outstanding driver.',
              },
              {
                name: 'David Miller',
                city: 'London, UK',
                role: 'International Tourist',
                rating: 5,
                service: 'Jaipur Heritage Guide — 3 Hours in Amber Fort',
                comment:
                  'Our guide Ramesh was incredible! He explained the architecture and history in fluent English. Predefined 3-hour package was clear, transparent, and fairly priced.',
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-gray-50 border border-gray-100 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center space-x-1 text-amber-400 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed italic">
                    "{t.comment}"
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="font-bold text-sm text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">
                    {t.role} • {t.city}
                  </p>
                  <p className="text-[11px] font-semibold text-[#ff7a00] mt-1">
                    Booked: {t.service}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
