-- ============================================================================
-- Marketplace Production Upgrade Migration
-- Hourly Tourism Platform
-- ============================================================================

-- 1. Fleet Vehicles Table (Bikes, Cars, Vans managed by providers)
CREATE TABLE IF NOT EXISTS fleet_vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('bike', 'car', 'van')),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  registration_number TEXT NOT NULL,
  color TEXT NOT NULL,
  fuel_type TEXT NOT NULL DEFAULT 'petrol' CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid', 'cng')),
  transmission TEXT NOT NULL DEFAULT 'manual' CHECK (transmission IN ('manual', 'automatic')),
  seating_capacity INTEGER NOT NULL DEFAULT 2,
  luggage_capacity INTEGER DEFAULT 1,
  features TEXT[] DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  rc_document_url TEXT,
  insurance_document_url TEXT,
  insurance_expiry DATE,
  permit_expiry DATE,
  fitness_expiry DATE,
  pollution_expiry DATE,
  maintenance_status TEXT NOT NULL DEFAULT 'available' CHECK (maintenance_status IN ('available', 'under_maintenance', 'unavailable')),
  assigned_driver_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Fleet Drivers Table (Chauffeurs and Guides assigned by providers)
CREATE TABLE IF NOT EXISTS fleet_drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  license_number TEXT NOT NULL,
  license_expiry DATE,
  license_document_url TEXT,
  experience_years INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_trip')),
  assigned_vehicle_id UUID REFERENCES fleet_vehicles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. In-App Booking Messages Table (Secure customer-provider communication)
CREATE TABLE IF NOT EXISTS booking_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('customer', 'provider', 'admin', 'system')),
  message TEXT NOT NULL,
  attachment_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Booking Disputes Table (Customer-Provider disputes with evidence)
CREATE TABLE IF NOT EXISTS booking_disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE RESTRICT,
  dispute_category TEXT NOT NULL CHECK (dispute_category IN ('late_pickup', 'wrong_vehicle', 'damage_claim', 'unfair_cancellation', 'safety_behavior', 'refund_issue', 'other')),
  description TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'awaiting_evidence', 'resolved', 'closed')),
  resolution_type TEXT CHECK (resolution_type IN ('full_refund', 'partial_refund', 'provider_favored', 'mutual_settlement', 'dismissed')),
  refund_amount NUMERIC(10, 2) DEFAULT 0,
  admin_notes TEXT,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Safety & SOS Incidents Table (Active trip emergencies)
CREATE TABLE IF NOT EXISTS safety_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  address TEXT,
  emergency_contacts_notified BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved')),
  incident_notes TEXT,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('booking', 'payment', 'refund', 'cancellation', 'safety', 'listing', 'account', 'technical')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed')),
  attachments TEXT[] DEFAULT '{}',
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Customer Favorites / Wishlist
CREATE TABLE IF NOT EXISTS customer_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES service_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id, listing_id)
);

-- 8. Customer Saved Addresses
CREATE TABLE IF NOT EXISTS customer_saved_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL, -- e.g. Home, Hotel, Airport, Office
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Admin Audit Logs (Immutable ledger of all sensitive operations)
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL, -- e.g. 'refund_approved', 'provider_suspended', 'booking_overridden', 'settings_changed'
  target_type TEXT NOT NULL, -- 'booking', 'provider', 'listing', 'user', 'settings'
  target_id TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Provider Scorecards Table
CREATE TABLE IF NOT EXISTS provider_scorecards (
  provider_id UUID PRIMARY KEY REFERENCES provider_profiles(id) ON DELETE CASCADE,
  acceptance_rate NUMERIC(5, 2) DEFAULT 100.00,
  rejection_rate NUMERIC(5, 2) DEFAULT 0.00,
  avg_response_time_minutes INTEGER DEFAULT 5,
  cancellation_rate NUMERIC(5, 2) DEFAULT 0.00,
  completion_rate NUMERIC(5, 2) DEFAULT 100.00,
  no_show_rate NUMERIC(5, 2) DEFAULT 0.00,
  punctuality_score NUMERIC(5, 2) DEFAULT 98.00,
  customer_rating NUMERIC(3, 2) DEFAULT 5.00,
  repeat_customer_rate NUMERIC(5, 2) DEFAULT 25.00,
  total_revenue NUMERIC(12, 2) DEFAULT 0.00,
  score_updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_fleet_vehicles_provider ON fleet_vehicles(provider_id);
CREATE INDEX IF NOT EXISTS idx_fleet_drivers_provider ON fleet_drivers(provider_id);
CREATE INDEX IF NOT EXISTS idx_booking_messages_booking ON booking_messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_disputes_booking ON booking_disputes(booking_id);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_booking ON safety_incidents(booking_id);
CREATE INDEX IF NOT EXISTS idx_customer_favorites_user ON customer_favorites(customer_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs(action);

