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
    label: 'Bike',
    value: 'bike',
    icon: '🏍️',
    description: 'Rent bikes and scooters for exploring the city at your own pace.',
  },
  {
    label: 'Car',
    value: 'car',
    icon: '🚗',
    description: 'Hire a car with or without a driver for comfortable travel.',
  },
  {
    label: 'Van',
    value: 'van',
    icon: '🚐',
    description: 'Spacious vans for group travel and family trips.',
  },
  {
    label: 'Local Guide',
    value: 'local_guide',
    icon: '🧑‍🏫',
    description: 'Experienced local guides to show you hidden gems and cultural hotspots.',
  },
  {
    label: 'Sightseeing Tour',
    value: 'sightseeing_tour',
    icon: '🗺️',
    description: 'Curated sightseeing tours covering top attractions and landmarks.',
  },
  {
    label: 'Experience',
    value: 'experience',
    icon: '🎭',
    description: 'Unique local experiences—cooking classes, art walks, adventure sports, and more.',
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
  { label: 'Company', value: 'company' },
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
