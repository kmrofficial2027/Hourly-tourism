// ============================================================================
// Hourly Tourism - TypeScript Type Definitions
// ============================================================================

// --- Enums / Union Types ---

export type UserRole = 'customer' | 'provider' | 'company' | 'admin'

export type VehicleType = 'bike' | 'car' | 'van'

export type ServiceCategory =
  | 'bike'
  | 'car'
  | 'van'
  | 'local_guide'
  | 'sightseeing_tour'
  | 'experience'

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'provider_accepted'
  | 'provider_rejected'
  | 'in_progress'
  | 'completed'
  | 'cancelled_by_customer'
  | 'cancelled_by_provider'
  | 'cancelled_by_admin'
  | 'refund_initiated'
  | 'refunded'

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refund_initiated'
  | 'partially_refunded'
  | 'refunded'

export type VerificationStatus =
  | 'unverified'
  | 'pending'
  | 'verified'
  | 'rejected'

export type ListingStatus =
  | 'draft'
  | 'pending_review'
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'rejected'

export type NotificationType =
  | 'booking_created'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_completed'
  | 'payment_received'
  | 'payment_failed'
  | 'refund_processed'
  | 'review_received'
  | 'provider_accepted'
  | 'provider_rejected'
  | 'verification_approved'
  | 'verification_rejected'
  | 'listing_approved'
  | 'listing_rejected'
  | 'support_ticket_update'
  | 'promotional'
  | 'system'

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'awaiting_response'
  | 'resolved'
  | 'closed'

// --- Database Row Interfaces ---

export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  email_verified: boolean
  phone_verified: boolean
  created_at: string
  updated_at: string
}


export interface ProviderProfile {
  id: string
  user_id: string
  business_name: string | null
  description: string | null
  address: string | null
  city: string
  state: string
  pincode: string | null
  latitude: number | null
  longitude: number | null
  service_radius_km: number
  government_id_type: string | null
  government_id_number: string | null
  government_id_url: string | null
  verification_status: VerificationStatus
  verification_notes: string | null
  verified_at: string | null
  average_rating: number
  total_reviews: number
  total_bookings: number
  total_earnings: number
  bank_account_name: string | null
  bank_account_number: string | null
  bank_ifsc_code: string | null
  bank_name: string | null
  upi_id: string | null
  is_available: boolean
  auto_accept_bookings: boolean
  created_at: string
  updated_at: string
}


export interface CompanyProfile {
  id: string
  user_id: string
  company_name: string
  legal_name: string | null
  description: string | null
  logo_url: string | null
  website: string | null
  address: string
  city: string
  state: string
  pincode: string
  gst_number: string | null
  pan_number: string | null
  registration_certificate_url: string | null
  verification_status: VerificationStatus
  verification_notes: string | null
  verified_at: string | null
  contact_person_name: string
  contact_person_phone: string
  contact_person_email: string
  total_providers: number
  total_listings: number
  total_bookings: number
  total_revenue: number
  commission_rate: number
  bank_account_name: string | null
  bank_account_number: string | null
  bank_ifsc_code: string | null
  bank_name: string | null
  created_at: string
  updated_at: string
}


export interface ServiceListing {
  id: string
  provider_id: string
  company_id: string | null
  title: string
  slug: string
  description: string
  short_description: string | null
  category: ServiceCategory
  status: ListingStatus
  hourly_rate: number
  minimum_hours: number
  maximum_hours: number
  deposit_amount: number
  cancellation_hours: number
  cancellation_fee_percent: number
  images: string[]
  thumbnail_url: string | null
  city: string
  state: string
  address: string | null
  latitude: number | null
  longitude: number | null
  service_radius_km: number
  vehicle_details: VehicleDetails | null
  guide_details: GuideDetails | null
  features: string[]
  included_items: string[]
  excluded_items: string[]
  requirements: string[]
  hourly_packages: HourlyPackage[]
  average_rating: number
  total_reviews: number
  total_bookings: number
  is_featured: boolean
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

export type ServiceListingWithDetails = ServiceListing

export interface VehicleDetails {
  vehicle_type: VehicleType
  make: string
  model: string
  year: number
  color: string
  registration_number: string
  fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'cng'
  transmission: 'manual' | 'automatic'
  seating_capacity: number
  luggage_capacity: number | null
  has_ac: boolean
  has_gps: boolean
  has_music_system: boolean
  has_first_aid: boolean
  insurance_valid_until: string | null
  fitness_valid_until: string | null
  permit_valid_until: string | null
  registration_certificate_url: string | null
  insurance_url: string | null
}

export interface GuideDetails {
  languages: string[]
  specializations: string[]
  experience_years: number
  certification: string | null
  certification_url: string | null
  max_group_size: number
  provides_transportation: boolean
  provides_meals: boolean
  provides_equipment: boolean
}

export interface HourlyPackage {
  hours: number
  label: string
  rate: number
  discount_percent: number
  description: string | null
}

export interface ProviderAvailability {
  id: string
  provider_id: string
  listing_id: string | null
  day_of_week: number // 0=Sunday, 6=Saturday
  start_time: string  // HH:mm format
  end_time: string    // HH:mm format
  is_available: boolean
  created_at: string
}

export interface AvailabilityException {
  id: string
  provider_id: string
  listing_id: string | null
  date: string
  start_time: string | null
  end_time: string | null
  is_available: boolean
  reason: string | null
  created_at: string
}

export interface Booking {
  id: string
  booking_number: string
  customer_id: string
  provider_id: string
  listing_id: string
  status: BookingStatus
  booking_date: string
  start_time: string
  end_time: string
  total_hours: number
  hourly_rate: number
  subtotal: number
  platform_fee: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  deposit_amount: number
  promotional_code_id: string | null
  pickup_address: string | null
  pickup_latitude: number | null
  pickup_longitude: number | null
  dropoff_address: string | null
  dropoff_latitude: number | null
  dropoff_longitude: number | null
  special_requests: string | null
  customer_notes: string | null
  provider_notes: string | null
  admin_notes: string | null
  cancellation_reason: string | null
  cancelled_by: string | null
  cancelled_at: string | null
  started_at: string | null
  completed_at: string | null
  customer_name: string
  customer_phone: string
  customer_email: string
  created_at: string
  updated_at: string
  // Joined fields (optional, populated by queries)
  listing?: ServiceListing
  customer?: Profile
  provider?: Profile
  provider_profile?: ProviderProfile
  payment?: Payment
  review?: Review
}

export interface BookingStatusHistory {
  id: string
  booking_id: string
  from_status: BookingStatus | null
  to_status: BookingStatus
  changed_by: string | null
  reason: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface Payment {
  id: string
  booking_id: string
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  razorpay_signature: string | null
  amount: number
  currency: string
  status: PaymentStatus
  method: string | null
  bank: string | null
  wallet: string | null
  vpa: string | null
  fee: number | null
  tax: number | null
  error_code: string | null
  error_description: string | null
  error_source: string | null
  notes: Record<string, string> | null
  refund_amount: number | null
  refund_id: string | null
  refunded_at: string | null
  captured_at: string | null
  created_at: string
  updated_at: string
}


export interface Refund {
  id: string
  payment_id: string
  booking_id: string
  razorpay_refund_id: string | null
  amount: number
  reason: string | null
  status: 'pending' | 'processed' | 'failed'
  initiated_by: string
  processed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}


export interface ProviderEarning {
  id: string
  provider_id: string
  booking_id: string
  payment_id: string
  gross_amount: number
  platform_fee: number
  tax_deducted: number
  net_amount: number
  status: 'pending' | 'available' | 'paid' | 'on_hold'
  payout_id: string | null
  paid_at: string | null
  available_at: string
  created_at: string
}

export interface Review {
  id: string
  booking_id: string
  listing_id: string
  reviewer_id: string
  provider_id: string
  rating: number
  title: string | null
  comment: string | null
  images: string[]
  provider_response: string | null
  provider_responded_at: string | null
  is_visible: boolean
  is_flagged: boolean
  flag_reason: string | null
  helpful_count: number
  created_at: string
  updated_at: string
  // Joined fields
  reviewer?: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, unknown> | null
  is_read: boolean
  read_at: string | null
  action_url: string | null
  created_at: string
}

export interface SupportTicket {
  id: string
  ticket_number: string
  user_id: string
  booking_id: string | null
  subject: string
  description: string
  category: 'booking' | 'payment' | 'refund' | 'technical' | 'account' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: TicketStatus
  assigned_to: string | null
  resolution: string | null
  resolved_at: string | null
  attachments: string[]
  messages: TicketMessage[]
  created_at: string
  updated_at: string
  // Joined fields
  user?: Profile
  booking?: Booking
}

export interface TicketMessage {
  id: string
  sender_id: string
  sender_role: UserRole
  message: string
  attachments: string[]
  created_at: string
}

export interface PromotionalCode {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_discount_amount: number | null
  min_booking_amount: number | null
  max_uses: number | null
  used_count: number
  valid_from: string
  valid_until: string
  applicable_categories: ServiceCategory[]
  applicable_cities: string[]
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}


export interface PlatformSettings {
  id: string
  key: string
  value: string
  description: string | null
  category: 'general' | 'payment' | 'booking' | 'notification' | 'seo' | 'legal'
  is_public: boolean
  updated_by: string | null
  created_at: string
  updated_at: string
}


// --- Form / Filter Interfaces ---

export interface SearchFilters {
  query: string | null
  category: ServiceCategory | null
  city: string | null
  state: string | null
  date: string | null
  start_time: string | null
  hours: number | null
  min_price: number | null
  max_price: number | null
  min_rating: number | null
  vehicle_type: VehicleType | null
  fuel_type: string | null
  transmission: string | null
  has_ac: boolean | null
  seating_capacity: number | null
  languages: string[]
  sort_by: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'reviews' | 'newest'
  page: number
  per_page: number
  latitude: number | null
  longitude: number | null
  radius_km: number | null
}

export interface BookingFormData {
  listing_id: string
  booking_date: string
  start_time: string
  total_hours: number
  pickup_address: string | null
  pickup_latitude: number | null
  pickup_longitude: number | null
  dropoff_address: string | null
  dropoff_latitude: number | null
  dropoff_longitude: number | null
  special_requests: string | null
  customer_name: string
  customer_phone: string
  customer_email: string
  promotional_code: string | null
}

export interface PriceCalculation {
  hourly_rate: number
  total_hours: number
  subtotal: number
  platform_fee: number
  tax_amount: number
  discount_amount: number
  total_amount: number
}

// --- API Response Types ---

export interface ApiResponse<T = unknown> {
  data: T | null
  error: string | null
  status: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// --- Component Prop Helpers ---

export interface SelectOption {
  label: string
  value: string
}

export interface ServiceCategoryOption {
  label: string
  value: ServiceCategory
  icon: string
  description: string
}

export interface BookingStatusOption {
  label: string
  value: BookingStatus
  color: string
}
