import type {
  ServiceCategoryOption,
  BookingStatusOption,
  BookingStatus,
  VehicleType,
} from '@/types'

// ============================================================================
// Service Categories
// ============================================================================

export const SERVICE_CATEGORIES: ServiceCategoryOption[] = [
  {
    label: 'Bike Tour & Ride',
    value: 'bike',
    icon: '🏍️',
    description: 'Explore scenic city spots & foothills on a bike with a friendly verified local rider in their free time.',
  },
  {
    label: 'Car Tour & Ride',
    value: 'car',
    icon: '🚗',
    description: 'Comfortable hourly car rides with local vehicle owners and chauffeurs visiting top attractions.',
  },
  {
    label: 'Van Group Tour',
    value: 'van',
    icon: '🚐',
    description: 'Spacious group trips with seasoned mountain & city drivers for families and travel groups.',
  },
  {
    label: 'Local Guide',
    value: 'local_guide',
    icon: '🧑‍🏫',
    description: 'Experienced local guides to show you hidden gems, cultural hotspots, and temple history.',
  },
  {
    label: 'Sightseeing Tour',
    value: 'sightseeing_tour',
    icon: '🗺️',
    description: 'Curated sightseeing tours covering top attractions and iconic landmarks.',
  },
  {
    label: 'Experience',
    value: 'experience',
    icon: '🎭',
    description: 'Unique local experiences—culinary walks, heritage circuits, and nature trails.',
  },
]

// ============================================================================
// Vehicle Types
// ============================================================================

export const VEHICLE_TYPES: { label: string; value: VehicleType; icon: string }[] = [
  { label: 'Bike', value: 'bike', icon: '🏍️' },
  { label: 'Car', value: 'car', icon: '🚗' },
  { label: 'Van', value: 'van', icon: '🚐' },
]

// ============================================================================
// Booking Statuses
// ============================================================================

export const BOOKING_STATUSES: BookingStatusOption[] = [
  { label: 'Pending', value: 'pending', color: '#F59E0B' },
  { label: 'Confirmed', value: 'confirmed', color: '#3B82F6' },
  { label: 'Provider Accepted', value: 'provider_accepted', color: '#10B981' },
  { label: 'Provider Rejected', value: 'provider_rejected', color: '#EF4444' },
  { label: 'In Progress', value: 'in_progress', color: '#8B5CF6' },
  { label: 'Completed', value: 'completed', color: '#059669' },
  { label: 'Cancelled by Customer', value: 'cancelled_by_customer', color: '#DC2626' },
  { label: 'Cancelled by Provider', value: 'cancelled_by_provider', color: '#DC2626' },
  { label: 'Cancelled by Admin', value: 'cancelled_by_admin', color: '#DC2626' },
  { label: 'Refund Initiated', value: 'refund_initiated', color: '#F97316' },
  { label: 'Refunded', value: 'refunded', color: '#6B7280' },
]

// ============================================================================
// Booking Status Maps (for quick lookup)
// ============================================================================

export const BOOKING_STATUS_LABEL_MAP: Record<BookingStatus, string> = Object.fromEntries(
  BOOKING_STATUSES.map((s) => [s.value, s.label])
) as Record<BookingStatus, string>

export const BOOKING_STATUS_COLOR_MAP: Record<BookingStatus, string> = Object.fromEntries(
  BOOKING_STATUSES.map((s) => [s.value, s.color])
) as Record<BookingStatus, string>

// ============================================================================
// Platform Defaults
// ============================================================================

export const PLATFORM_FEE_PERCENTAGE = 10

export const MIN_BOOKING_HOURS = 1
export const MAX_BOOKING_HOURS = 12

export const CURRENCY = 'INR'
export const CURRENCY_SYMBOL = '₹'

// ============================================================================
// Misc
// ============================================================================

export const USER_ROLES = [
  { label: 'Customer', value: 'customer' },
  { label: 'Provider', value: 'provider' },
  { label: 'Admin', value: 'admin' },
] as const

export const FUEL_TYPES = [
  { label: 'Petrol', value: 'petrol' },
  { label: 'Diesel', value: 'diesel' },
  { label: 'Electric', value: 'electric' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'CNG', value: 'cng' },
] as const

export const TRANSMISSION_TYPES = [
  { label: 'Manual', value: 'manual' },
  { label: 'Automatic', value: 'automatic' },
] as const

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
] as const

export const ITEMS_PER_PAGE = 12
export const MAX_IMAGE_UPLOAD_SIZE_MB = 5
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// ============================================================================
// Fallback initial featured listings
// ============================================================================

export const initialFeaturedServices: any[] = [
  {
    id: 'bike-cbe-01',
    title: 'Royal Enfield Hunter 350 — Isha & Velliangiri Foothills Ride',
    category: 'bike',
    short_description:
      'Ride as pillion with verified local rider across scenic Western Ghats foothills to the 112-ft Adiyogi Shiva statue. Dual helmets and fuel included.',
    destination_city: 'Coimbatore',
    hourly_rate: 180,
    min_booking_hours: 2,
    max_booking_hours: 12,
    average_rating: 4.9,
    total_reviews: 58,
    is_featured: true,
    planned_spots: [
      { id: 'spot-1', name: 'Isha Yoga & 112-ft Adiyogi', duration: '1.5 Hours', category: 'Spiritual' },
      { id: 'spot-2', name: 'Velliangiri Foothill Groves', duration: '45 Mins', category: 'Nature' },
      { id: 'spot-3', name: 'Thondamuthur Village Chai Stop', duration: '30 Mins', category: 'Local Experience' },
    ],
    images: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    ],
    provider: { business_name: 'Kovai Foothill Riders & Hosts' },
  },
  {
    id: 'car-cbe-02',
    title: 'Toyota Innova Crysta Chauffeur — Isha & Marudhamalai Circuit',
    category: 'car',
    short_description:
      'Chauffeured hourly sightseeing in clean AC SUV with knowledgeable local driver for family trips to Adiyogi, Marudhamalai Temple, and Perur.',
    destination_city: 'Coimbatore',
    hourly_rate: 650,
    min_booking_hours: 3,
    max_booking_hours: 12,
    average_rating: 5.0,
    total_reviews: 74,
    is_featured: true,
    planned_spots: [
      { id: 'spot-1', name: 'Marudhamalai Murugan Hill Temple', duration: '1 Hour', category: 'Temple' },
      { id: 'spot-2', name: 'Isha Yoga & 112-ft Adiyogi', duration: '1.5 Hours', category: 'Spiritual' },
      { id: 'spot-3', name: 'Perur Pateeswarar Ancient Temple', duration: '45 Mins', category: 'Heritage' },
    ],
    images: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
    ],
    provider: { business_name: 'Kongu Chauffeur Tours' },
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
    planned_spots: [
      { id: 'spot-1', name: 'Aliyar Dam & Reservoir Gardens', duration: '1 Hour', category: 'Scenic' },
      { id: 'spot-2', name: 'Monkey Falls Foothills', duration: '45 Mins', category: 'Nature' },
      { id: 'spot-3', name: 'Valparai 40 Hairpin Ghat View', duration: '1.5 Hours', category: 'Safari' },
    ],
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
    id: 'bike-pol-01',
    title: 'Royal Enfield Classic 350 — Aliyar Dam & Monkey Falls Eco Trail',
    category: 'bike',
    short_description:
      'Ride as pillion with verified local rider to Aliyar Reservoir, Monkey Falls, and the scenic contour canal aqueduct. Dual helmets and fuel included.',
    destination_city: 'Pollachi',
    hourly_rate: 190,
    min_booking_hours: 2,
    max_booking_hours: 8,
    average_rating: 4.9,
    total_reviews: 46,
    is_featured: true,
    planned_spots: [
      { id: 'spot-1', name: 'Aliyar Dam & Reservoir Gardens', duration: '1 Hour', category: 'Scenic Nature' },
      { id: 'spot-2', name: 'Monkey Falls Foothills', duration: '45 Mins', category: 'Natural Springs' },
      { id: 'spot-3', name: 'Aliyar Contour Canal Aqueduct', duration: '30 Mins', category: 'Secret Trail' },
    ],
    images: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    ],
    provider: { business_name: 'Anamalai Foothill Riders' },
  },
  {
    id: 'car-pol-02',
    title: 'Mahindra Thar 4x4 Chauffeur — Topslip Rainforest & Canal Safari',
    category: 'car',
    short_description:
      'Chauffeured open-view 4x4 SUV safari covering Topslip elephant camp, Sethumadai teak forests, and iconic coconut canal movie locations.',
    destination_city: 'Pollachi',
    hourly_rate: 750,
    min_booking_hours: 3,
    max_booking_hours: 10,
    average_rating: 5.0,
    total_reviews: 53,
    is_featured: true,
    planned_spots: [
      { id: 'spot-1', name: 'Topslip Elephant Camp & Safari', duration: '2 Hours', category: 'Wildlife Sanctuary' },
      { id: 'spot-2', name: 'Pollachi Coconut Canal Road Trail', duration: '1 Hour', category: 'Countryside' },
      { id: 'spot-3', name: 'Sethumadai Teak Forest Drive', duration: '45 Mins', category: 'Secret Forest' },
    ],
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    ],
    provider: { business_name: 'Pollachi Countryside Mobility' },
  },
  {
    id: 'tour-pol-03',
    title: 'Anamalai Heritage & Ancient River Shrine Guided Tour',
    category: 'sightseeing_tour',
    short_description:
      'Guided cultural and spiritual tour of historic Masani Amman Temple, Aliyar river banks, and traditional jaggery farm estates in Pollachi.',
    destination_city: 'Pollachi',
    hourly_rate: 520,
    min_booking_hours: 2,
    max_booking_hours: 6,
    average_rating: 4.9,
    total_reviews: 38,
    is_featured: true,
    planned_spots: [
      { id: 'spot-1', name: 'Masani Amman Sacred Temple', duration: '1.5 Hours', category: 'Heritage' },
      { id: 'spot-2', name: 'Aliyar Contour Canal Aqueduct Walk', duration: '1 Hour', category: 'Engineering' },
      { id: 'spot-3', name: 'Pollachi Coconut Canal Road Trail', duration: '45 Mins', category: 'Scenic' },
    ],
    images: [
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    ],
    provider: { business_name: 'Anamalai Heritage Expeditions' },
  },
]
