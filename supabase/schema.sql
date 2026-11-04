-- ============================================================================
-- Hourly Tourism - Complete Database Schema
-- PostgreSQL / Supabase
-- ============================================================================
-- This schema defines ALL tables, enums, indexes, RLS policies, functions,
-- and triggers for the Hourly Tourism marketplace platform.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ENUM TYPES
-- ============================================================================

-- User roles
CREATE TYPE user_role AS ENUM ('customer', 'provider', 'company', 'admin');

-- Vehicle types (ONLY these 3 — strictly enforced)
CREATE TYPE vehicle_type AS ENUM ('bike', 'car', 'van');

-- Service categories
CREATE TYPE service_category AS ENUM (
  'bike', 'car', 'van', 'local_guide', 'sightseeing_tour', 'experience'
);

-- Booking statuses
CREATE TYPE booking_status AS ENUM (
  'pending', 'awaiting_confirmation', 'confirmed', 'payment_pending', 'paid',
  'in_progress', 'completed', 'cancelled', 'rejected', 'refund_pending', 'refunded'
);

-- Payment statuses
CREATE TYPE payment_status AS ENUM (
  'pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'
);

-- Provider verification status
CREATE TYPE verification_status AS ENUM (
  'pending', 'submitted', 'under_review', 'approved', 'rejected'
);

-- Listing status
CREATE TYPE listing_status AS ENUM (
  'draft', 'pending_approval', 'active', 'inactive', 'suspended', 'rejected'
);

-- Notification type
CREATE TYPE notification_type AS ENUM (
  'booking', 'payment', 'review', 'system', 'provider_status', 'listing_status'
);

-- Ticket status
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- ============================================================================
-- 2. HELPER FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Booking number generation: produces 'HT-YYYY-NNNNNN'
-- Uses a dedicated sequence for the numeric portion.
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS booking_number_seq START 1 INCREMENT 1;

CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  seq_val BIGINT;
  year_part TEXT;
BEGIN
  seq_val   := nextval('booking_number_seq');
  year_part := to_char(now(), 'YYYY');
  RETURN 'HT-' || year_part || '-' || lpad(seq_val::TEXT, 6, '0');
END;
$$;

-- ----------------------------------------------------------------------------
-- Generic updated_at trigger function
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- Trigger function: recalculate listing average_rating & total_reviews
-- Called whenever a review is inserted, updated, or deleted.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_listing_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  target_listing_id UUID;
  new_avg NUMERIC(3,2);
  new_count INTEGER;
BEGIN
  -- Determine which listing_id to update
  IF TG_OP = 'DELETE' THEN
    target_listing_id := OLD.listing_id;
  ELSE
    target_listing_id := NEW.listing_id;
  END IF;

  -- Recalculate from all visible reviews for this listing
  SELECT
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO new_avg, new_count
  FROM reviews
  WHERE listing_id = target_listing_id
    AND is_visible = TRUE;

  UPDATE service_listings
  SET average_rating = new_avg,
      total_reviews  = new_count,
      updated_at     = now()
  WHERE id = target_listing_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 3. TABLES (created in dependency order)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 profiles
-- Central user profile linked to Supabase Auth (auth.users).
-- ----------------------------------------------------------------------------
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  full_name  TEXT,
  phone      TEXT,
  avatar_url TEXT,
  role       user_role NOT NULL DEFAULT 'customer',
  is_active  BOOLEAN   NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE profiles IS 'Core user profiles – one per auth.users row.';

-- ----------------------------------------------------------------------------
-- 3.2 provider_profiles
-- Extended profile for individual service providers.
-- ----------------------------------------------------------------------------
CREATE TABLE provider_profiles (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  business_name        TEXT,
  description          TEXT,
  address              TEXT,
  city                 TEXT,
  state                TEXT,
  country              TEXT,
  latitude             NUMERIC(10, 7),
  longitude            NUMERIC(10, 7),
  verification_status  verification_status NOT NULL DEFAULT 'pending',
  verified_at          TIMESTAMPTZ,
  verified_by          UUID REFERENCES profiles(id),
  commission_rate      NUMERIC(5, 2) NOT NULL DEFAULT 10.0,
  bank_account_details JSONB DEFAULT '{}'::JSONB,
  documents            JSONB DEFAULT '[]'::JSONB,
  languages            TEXT[] DEFAULT '{}',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_provider_profiles_updated_at
  BEFORE UPDATE ON provider_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE provider_profiles IS 'Extended profile for individual providers.';

-- ----------------------------------------------------------------------------
-- 3.3 company_profiles
-- Extended profile for company accounts.
-- ----------------------------------------------------------------------------
CREATE TABLE company_profiles (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  company_name         TEXT NOT NULL,
  registration_number  TEXT,
  description          TEXT,
  address              TEXT,
  city                 TEXT,
  state                TEXT,
  country              TEXT,
  website              TEXT,
  phone                TEXT,
  email                TEXT,
  logo_url             TEXT,
  verification_status  verification_status NOT NULL DEFAULT 'pending',
  commission_rate      NUMERIC(5, 2) NOT NULL DEFAULT 10.0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_company_profiles_updated_at
  BEFORE UPDATE ON company_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE company_profiles IS 'Extended profile for company accounts.';

-- ----------------------------------------------------------------------------
-- 3.4 service_listings
-- Core listing table — covers vehicles, guides, tours, and experiences.
-- ----------------------------------------------------------------------------
CREATE TABLE service_listings (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id           UUID REFERENCES provider_profiles(id) ON DELETE SET NULL,
  company_id            UUID REFERENCES company_profiles(id) ON DELETE SET NULL,
  title                 TEXT NOT NULL,
  description           TEXT,
  short_description     TEXT,
  category              service_category NOT NULL,
  destination_city      TEXT,
  destination_state     TEXT,
  destination_country   TEXT,
  address               TEXT,
  latitude              NUMERIC(10, 7),
  longitude             NUMERIC(10, 7),
  hourly_rate           NUMERIC(10, 2) NOT NULL,
  min_booking_hours     INTEGER NOT NULL DEFAULT 1,
  max_booking_hours     INTEGER NOT NULL DEFAULT 12,
  buffer_time_minutes   INTEGER NOT NULL DEFAULT 30,
  images                TEXT[] DEFAULT '{}',
  included_services     TEXT[] DEFAULT '{}',
  excluded_services     TEXT[] DEFAULT '{}',
  terms_and_conditions  TEXT,
  cancellation_policy   TEXT,
  meeting_point         TEXT,
  pickup_location       TEXT,
  max_participants      INTEGER,
  status                listing_status NOT NULL DEFAULT 'draft',
  is_featured           BOOLEAN NOT NULL DEFAULT FALSE,
  average_rating        NUMERIC(3, 2) NOT NULL DEFAULT 0,
  total_reviews         INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- At least one owner must be set
  CONSTRAINT chk_listing_owner
    CHECK (provider_id IS NOT NULL OR company_id IS NOT NULL),

  -- Booking-hour sanity
  CONSTRAINT chk_booking_hours
    CHECK (min_booking_hours >= 1 AND max_booking_hours >= min_booking_hours),

  -- Rate must be positive
  CONSTRAINT chk_hourly_rate_positive
    CHECK (hourly_rate > 0),

  -- Rating bounds
  CONSTRAINT chk_average_rating_range
    CHECK (average_rating >= 0 AND average_rating <= 5)
);

CREATE TRIGGER trg_service_listings_updated_at
  BEFORE UPDATE ON service_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE service_listings IS 'All service listings across every category.';

-- ----------------------------------------------------------------------------
-- 3.5 vehicle_details
-- Additional columns for bike / car / van listings.
-- ----------------------------------------------------------------------------
CREATE TABLE vehicle_details (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id          UUID NOT NULL UNIQUE REFERENCES service_listings(id) ON DELETE CASCADE,
  vehicle_type        vehicle_type NOT NULL,  -- ENFORCED: bike | car | van
  brand               TEXT,
  model               TEXT,
  year                INTEGER,
  color               TEXT,
  registration_number TEXT,
  passenger_capacity  INTEGER,
  fuel_type           TEXT,
  features            TEXT[] DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_vehicle_year
    CHECK (year IS NULL OR (year >= 1900 AND year <= EXTRACT(YEAR FROM now()) + 1))
);

COMMENT ON TABLE vehicle_details IS 'Vehicle-specific metadata (bike, car, van only).';

-- ----------------------------------------------------------------------------
-- 3.6 guide_details
-- Additional columns for local-guide / tour / experience listings.
-- ----------------------------------------------------------------------------
CREATE TABLE guide_details (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id       UUID NOT NULL UNIQUE REFERENCES service_listings(id) ON DELETE CASCADE,
  languages        TEXT[] DEFAULT '{}',
  specializations  TEXT[] DEFAULT '{}',
  experience_years INTEGER,
  certifications   TEXT[] DEFAULT '{}',
  max_group_size   INTEGER,
  itinerary        JSONB DEFAULT '[]'::JSONB,
  what_to_bring    TEXT[] DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_experience_years
    CHECK (experience_years IS NULL OR experience_years >= 0)
);

COMMENT ON TABLE guide_details IS 'Guide/tour-specific metadata.';

-- ----------------------------------------------------------------------------
-- 3.7 hourly_packages
-- Pre-defined duration+price packages for a listing.
-- ----------------------------------------------------------------------------
CREATE TABLE hourly_packages (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id     UUID NOT NULL REFERENCES service_listings(id) ON DELETE CASCADE,
  name           TEXT,
  duration_hours INTEGER NOT NULL,
  price          NUMERIC(10, 2) NOT NULL,
  description    TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_package_duration
    CHECK (duration_hours >= 1),
  CONSTRAINT chk_package_price_positive
    CHECK (price > 0)
);

COMMENT ON TABLE hourly_packages IS 'Pre-configured hourly pricing packages.';

-- ----------------------------------------------------------------------------
-- 3.8 provider_availability
-- Weekly recurring availability windows.
-- ----------------------------------------------------------------------------
CREATE TABLE provider_availability (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id   UUID NOT NULL REFERENCES service_listings(id) ON DELETE CASCADE,
  day_of_week  INTEGER NOT NULL,       -- 0 = Sunday … 6 = Saturday
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_day_of_week_range
    CHECK (day_of_week >= 0 AND day_of_week <= 6),
  CONSTRAINT chk_availability_times
    CHECK (end_time > start_time)
);

COMMENT ON TABLE provider_availability IS 'Weekly recurring schedule per listing.';

-- ----------------------------------------------------------------------------
-- 3.9 availability_exceptions
-- Date-specific overrides (block-outs, holidays, special hours).
-- ----------------------------------------------------------------------------
CREATE TABLE availability_exceptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id      UUID NOT NULL REFERENCES service_listings(id) ON DELETE CASCADE,
  exception_date  DATE NOT NULL,
  is_blocked      BOOLEAN NOT NULL DEFAULT TRUE,
  start_time      TIME,
  end_time        TIME,
  reason          TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE availability_exceptions IS 'Date-specific availability overrides.';

-- ----------------------------------------------------------------------------
-- 3.10 bookings
-- Core booking table with full financial breakdown.
-- ----------------------------------------------------------------------------
CREATE TABLE bookings (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number     TEXT NOT NULL UNIQUE DEFAULT generate_booking_number(),
  customer_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  listing_id         UUID NOT NULL REFERENCES service_listings(id) ON DELETE RESTRICT,
  provider_id        UUID REFERENCES provider_profiles(id) ON DELETE SET NULL,
  company_id         UUID REFERENCES company_profiles(id) ON DELETE SET NULL,
  package_id         UUID REFERENCES hourly_packages(id) ON DELETE SET NULL,
  booking_date       DATE NOT NULL,
  start_time         TIME NOT NULL,
  duration_hours     INTEGER NOT NULL,
  end_time           TIME NOT NULL,
  num_participants   INTEGER NOT NULL DEFAULT 1,
  pickup_location    TEXT,
  special_requests   TEXT,
  hourly_rate        NUMERIC(10, 2),
  base_price         NUMERIC(10, 2),
  platform_fee       NUMERIC(10, 2),
  tax_amount         NUMERIC(10, 2),
  total_amount       NUMERIC(10, 2),
  status             booking_status NOT NULL DEFAULT 'pending',
  payment_status     payment_status NOT NULL DEFAULT 'pending',
  confirmed_at       TIMESTAMPTZ,
  cancelled_at       TIMESTAMPTZ,
  completed_at       TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_booking_duration
    CHECK (duration_hours >= 1),
  CONSTRAINT chk_booking_participants
    CHECK (num_participants >= 1),
  CONSTRAINT chk_booking_total_positive
    CHECK (total_amount IS NULL OR total_amount >= 0)
);

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE bookings IS 'All bookings created by customers.';

-- ----------------------------------------------------------------------------
-- 3.11 booking_status_history
-- Audit trail for every booking-status transition.
-- ----------------------------------------------------------------------------
CREATE TABLE booking_status_history (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  old_status booking_status,
  new_status booking_status NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE booking_status_history IS 'Audit log for booking status changes.';

-- ----------------------------------------------------------------------------
-- 3.12 payments
-- Razorpay payment records.
-- ----------------------------------------------------------------------------
CREATE TABLE payments (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id           UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  razorpay_order_id    TEXT,
  razorpay_payment_id  TEXT,
  razorpay_signature   TEXT,
  amount               NUMERIC(10, 2) NOT NULL,
  currency             TEXT NOT NULL DEFAULT 'INR',
  status               payment_status NOT NULL DEFAULT 'pending',
  payment_method       TEXT,
  payment_data         JSONB DEFAULT '{}'::JSONB,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_payment_amount_positive
    CHECK (amount > 0)
);

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE payments IS 'Payment records linked to Razorpay.';

-- ----------------------------------------------------------------------------
-- 3.13 refunds
-- Refund records linked to a payment.
-- ----------------------------------------------------------------------------
CREATE TABLE refunds (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id         UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  booking_id         UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  razorpay_refund_id TEXT,
  amount             NUMERIC(10, 2) NOT NULL,
  reason             TEXT,
  status             payment_status NOT NULL DEFAULT 'pending',
  processed_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_refund_amount_positive
    CHECK (amount > 0)
);

COMMENT ON TABLE refunds IS 'Refund records for cancelled / disputed bookings.';

-- ----------------------------------------------------------------------------
-- 3.14 provider_earnings
-- Tracks provider payouts per booking.
-- ----------------------------------------------------------------------------
CREATE TABLE provider_earnings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id       UUID REFERENCES provider_profiles(id) ON DELETE SET NULL,
  company_id        UUID REFERENCES company_profiles(id) ON DELETE SET NULL,
  booking_id        UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  gross_amount      NUMERIC(10, 2) NOT NULL,
  commission_amount NUMERIC(10, 2) NOT NULL,
  net_amount        NUMERIC(10, 2) NOT NULL,
  payout_status     TEXT NOT NULL DEFAULT 'pending',
  payout_date       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_earnings_amounts
    CHECK (gross_amount >= 0 AND commission_amount >= 0 AND net_amount >= 0)
);

COMMENT ON TABLE provider_earnings IS 'Per-booking earnings breakdown & payout status.';

-- ----------------------------------------------------------------------------
-- 3.15 reviews
-- Customer reviews for completed bookings (one review per booking).
-- ----------------------------------------------------------------------------
CREATE TABLE reviews (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id           UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id           UUID NOT NULL REFERENCES service_listings(id) ON DELETE CASCADE,
  rating               INTEGER NOT NULL,
  review_text          TEXT,
  provider_response    TEXT,
  provider_responded_at TIMESTAMPTZ,
  is_reported          BOOLEAN NOT NULL DEFAULT FALSE,
  is_visible           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_review_rating_range
    CHECK (rating >= 1 AND rating <= 5)
);

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: recalculate listing rating on review changes
CREATE TRIGGER trg_reviews_update_listing_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_listing_rating();

COMMENT ON TABLE reviews IS 'Customer reviews — one per booking, rating 1–5.';

-- ----------------------------------------------------------------------------
-- 3.16 notifications
-- In-app notifications.
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       notification_type NOT NULL,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  data       JSONB DEFAULT '{}'::JSONB,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE notifications IS 'In-app notification feed.';

-- ----------------------------------------------------------------------------
-- 3.17 support_tickets
-- Customer / provider support requests.
-- ----------------------------------------------------------------------------
CREATE TABLE support_tickets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id  UUID REFERENCES bookings(id) ON DELETE SET NULL,
  subject     TEXT NOT NULL,
  description TEXT NOT NULL,
  status      ticket_status NOT NULL DEFAULT 'open',
  priority    TEXT NOT NULL DEFAULT 'medium',
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE support_tickets IS 'Support / help-desk tickets.';

-- ----------------------------------------------------------------------------
-- 3.18 promotional_codes
-- Discount codes for the platform.
-- ----------------------------------------------------------------------------
CREATE TABLE promotional_codes (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code               TEXT NOT NULL UNIQUE,
  description        TEXT,
  discount_type      TEXT NOT NULL,            -- 'percentage' | 'fixed'
  discount_value     NUMERIC(10, 2) NOT NULL,
  max_uses           INTEGER,
  current_uses       INTEGER NOT NULL DEFAULT 0,
  min_booking_amount NUMERIC(10, 2),
  valid_from         TIMESTAMPTZ,
  valid_until        TIMESTAMPTZ,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_promo_discount_type
    CHECK (discount_type IN ('percentage', 'fixed')),
  CONSTRAINT chk_promo_discount_value
    CHECK (discount_value > 0),
  CONSTRAINT chk_promo_date_range
    CHECK (valid_until IS NULL OR valid_from IS NULL OR valid_until > valid_from)
);

COMMENT ON TABLE promotional_codes IS 'Promotional / discount coupon codes.';

-- ----------------------------------------------------------------------------
-- 3.19 platform_settings
-- Key-value store for global platform configuration.
-- ----------------------------------------------------------------------------
CREATE TABLE platform_settings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT NOT NULL UNIQUE,
  value       JSONB NOT NULL DEFAULT '{}'::JSONB,
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_platform_settings_updated_at
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE platform_settings IS 'Global key-value platform configuration.';

-- ============================================================================
-- 4. INDEXES
-- ============================================================================

-- profiles
CREATE INDEX idx_profiles_role       ON profiles(role);
CREATE INDEX idx_profiles_email      ON profiles(email);

-- provider_profiles
CREATE INDEX idx_provider_profiles_user_id              ON provider_profiles(user_id);
CREATE INDEX idx_provider_profiles_verification_status  ON provider_profiles(verification_status);
CREATE INDEX idx_provider_profiles_city                 ON provider_profiles(city);

-- company_profiles
CREATE INDEX idx_company_profiles_user_id              ON company_profiles(user_id);
CREATE INDEX idx_company_profiles_verification_status  ON company_profiles(verification_status);

-- service_listings — search & filter
CREATE INDEX idx_listings_category          ON service_listings(category);
CREATE INDEX idx_listings_destination_city  ON service_listings(destination_city);
CREATE INDEX idx_listings_status            ON service_listings(status);
CREATE INDEX idx_listings_category_city_status
  ON service_listings(category, destination_city, status);
CREATE INDEX idx_listings_provider_id       ON service_listings(provider_id);
CREATE INDEX idx_listings_company_id        ON service_listings(company_id);
CREATE INDEX idx_listings_is_featured       ON service_listings(is_featured) WHERE is_featured = TRUE;

-- vehicle_details
CREATE INDEX idx_vehicle_details_listing_id ON vehicle_details(listing_id);
CREATE INDEX idx_vehicle_details_type       ON vehicle_details(vehicle_type);

-- guide_details
CREATE INDEX idx_guide_details_listing_id ON guide_details(listing_id);

-- hourly_packages
CREATE INDEX idx_hourly_packages_listing_id ON hourly_packages(listing_id);

-- provider_availability
CREATE INDEX idx_provider_availability_listing_day
  ON provider_availability(listing_id, day_of_week);

-- availability_exceptions
CREATE INDEX idx_availability_exceptions_listing_date
  ON availability_exceptions(listing_id, exception_date);

-- bookings — conflict checking & queries
CREATE INDEX idx_bookings_listing_date_time
  ON bookings(listing_id, booking_date, start_time);
CREATE INDEX idx_bookings_customer_id   ON bookings(customer_id);
CREATE INDEX idx_bookings_provider_id   ON bookings(provider_id);
CREATE INDEX idx_bookings_company_id    ON bookings(company_id);
CREATE INDEX idx_bookings_status        ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_booking_date  ON bookings(booking_date);

-- booking_status_history
CREATE INDEX idx_booking_status_history_booking_id
  ON booking_status_history(booking_id);

-- payments
CREATE INDEX idx_payments_booking_id         ON payments(booking_id);
CREATE INDEX idx_payments_razorpay_order_id  ON payments(razorpay_order_id);
CREATE INDEX idx_payments_status             ON payments(status);

-- refunds
CREATE INDEX idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX idx_refunds_booking_id ON refunds(booking_id);

-- provider_earnings
CREATE INDEX idx_provider_earnings_provider_id ON provider_earnings(provider_id);
CREATE INDEX idx_provider_earnings_company_id  ON provider_earnings(company_id);
CREATE INDEX idx_provider_earnings_booking_id  ON provider_earnings(booking_id);
CREATE INDEX idx_provider_earnings_payout      ON provider_earnings(payout_status);

-- reviews
CREATE INDEX idx_reviews_listing_id  ON reviews(listing_id);
CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX idx_reviews_rating      ON reviews(rating);

-- notifications
CREATE INDEX idx_notifications_user_read
  ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

-- support_tickets
CREATE INDEX idx_support_tickets_user_id  ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status   ON support_tickets(status);
CREATE INDEX idx_support_tickets_booking  ON support_tickets(booking_id);

-- promotional_codes
CREATE INDEX idx_promo_codes_code      ON promotional_codes(code);
CREATE INDEX idx_promo_codes_active    ON promotional_codes(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Helper: check whether the current JWT role is 'admin'
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Helper: get the provider_profile id for the current user
CREATE OR REPLACE FUNCTION current_provider_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT id FROM provider_profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Helper: get the company_profile id for the current user
CREATE OR REPLACE FUNCTION current_company_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT id FROM company_profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- ----------------------------- profiles ------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (id = auth.uid() OR is_admin());

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- ----------------------------- provider_profiles ---------------------------
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;

-- Public can read approved providers
CREATE POLICY provider_profiles_select_public ON provider_profiles
  FOR SELECT USING (
    verification_status = 'approved'
    OR user_id = auth.uid()
    OR is_admin()
  );

CREATE POLICY provider_profiles_insert_own ON provider_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY provider_profiles_update_own ON provider_profiles
  FOR UPDATE USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY provider_profiles_delete_admin ON provider_profiles
  FOR DELETE USING (is_admin());

-- ----------------------------- company_profiles ----------------------------
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_profiles_select_public ON company_profiles
  FOR SELECT USING (
    verification_status = 'approved'
    OR user_id = auth.uid()
    OR is_admin()
  );

CREATE POLICY company_profiles_insert_own ON company_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY company_profiles_update_own ON company_profiles
  FOR UPDATE USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY company_profiles_delete_admin ON company_profiles
  FOR DELETE USING (is_admin());

-- ----------------------------- service_listings ----------------------------
ALTER TABLE service_listings ENABLE ROW LEVEL SECURITY;

-- Anyone can read active listings
CREATE POLICY listings_select_public ON service_listings
  FOR SELECT USING (
    status = 'active'
    OR provider_id = current_provider_id()
    OR company_id  = current_company_id()
    OR is_admin()
  );

CREATE POLICY listings_insert_owner ON service_listings
  FOR INSERT WITH CHECK (
    provider_id = current_provider_id()
    OR company_id = current_company_id()
    OR is_admin()
  );

CREATE POLICY listings_update_owner ON service_listings
  FOR UPDATE USING (
    provider_id = current_provider_id()
    OR company_id = current_company_id()
    OR is_admin()
  )
  WITH CHECK (
    provider_id = current_provider_id()
    OR company_id = current_company_id()
    OR is_admin()
  );

CREATE POLICY listings_delete_admin ON service_listings
  FOR DELETE USING (is_admin());

-- ----------------------------- vehicle_details -----------------------------
ALTER TABLE vehicle_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY vehicle_details_select ON vehicle_details
  FOR SELECT USING (TRUE);  -- readable alongside listing

CREATE POLICY vehicle_details_manage ON vehicle_details
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM service_listings sl
      WHERE sl.id = vehicle_details.listing_id
        AND (sl.provider_id = current_provider_id()
             OR sl.company_id = current_company_id()
             OR is_admin())
    )
  );

-- ----------------------------- guide_details -------------------------------
ALTER TABLE guide_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY guide_details_select ON guide_details
  FOR SELECT USING (TRUE);

CREATE POLICY guide_details_manage ON guide_details
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM service_listings sl
      WHERE sl.id = guide_details.listing_id
        AND (sl.provider_id = current_provider_id()
             OR sl.company_id = current_company_id()
             OR is_admin())
    )
  );

-- ----------------------------- hourly_packages -----------------------------
ALTER TABLE hourly_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY hourly_packages_select ON hourly_packages
  FOR SELECT USING (TRUE);

CREATE POLICY hourly_packages_manage ON hourly_packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM service_listings sl
      WHERE sl.id = hourly_packages.listing_id
        AND (sl.provider_id = current_provider_id()
             OR sl.company_id = current_company_id()
             OR is_admin())
    )
  );

-- ----------------------------- provider_availability -----------------------
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY availability_select ON provider_availability
  FOR SELECT USING (TRUE);

CREATE POLICY availability_manage ON provider_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM service_listings sl
      WHERE sl.id = provider_availability.listing_id
        AND (sl.provider_id = current_provider_id()
             OR sl.company_id = current_company_id()
             OR is_admin())
    )
  );

-- ----------------------------- availability_exceptions ---------------------
ALTER TABLE availability_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY avail_exceptions_select ON availability_exceptions
  FOR SELECT USING (TRUE);

CREATE POLICY avail_exceptions_manage ON availability_exceptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM service_listings sl
      WHERE sl.id = availability_exceptions.listing_id
        AND (sl.provider_id = current_provider_id()
             OR sl.company_id = current_company_id()
             OR is_admin())
    )
  );

-- ----------------------------- bookings ------------------------------------
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY bookings_select ON bookings
  FOR SELECT USING (
    customer_id = auth.uid()
    OR provider_id = current_provider_id()
    OR company_id  = current_company_id()
    OR is_admin()
  );

CREATE POLICY bookings_insert_customer ON bookings
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY bookings_update ON bookings
  FOR UPDATE USING (
    customer_id = auth.uid()
    OR provider_id = current_provider_id()
    OR company_id  = current_company_id()
    OR is_admin()
  );

CREATE POLICY bookings_delete_admin ON bookings
  FOR DELETE USING (is_admin());

-- ----------------------------- booking_status_history ----------------------
ALTER TABLE booking_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY status_history_select ON booking_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_status_history.booking_id
        AND (b.customer_id = auth.uid()
             OR b.provider_id = current_provider_id()
             OR b.company_id  = current_company_id()
             OR is_admin())
    )
  );

CREATE POLICY status_history_insert ON booking_status_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_status_history.booking_id
        AND (b.customer_id = auth.uid()
             OR b.provider_id = current_provider_id()
             OR b.company_id  = current_company_id()
             OR is_admin())
    )
  );

-- ----------------------------- payments ------------------------------------
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY payments_select ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = payments.booking_id
        AND (b.customer_id = auth.uid()
             OR b.provider_id = current_provider_id()
             OR b.company_id  = current_company_id()
             OR is_admin())
    )
  );

CREATE POLICY payments_insert ON payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = payments.booking_id
        AND (b.customer_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY payments_update ON payments
  FOR UPDATE USING (is_admin());

-- ----------------------------- refunds -------------------------------------
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY refunds_select ON refunds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = refunds.booking_id
        AND (b.customer_id = auth.uid()
             OR b.provider_id = current_provider_id()
             OR b.company_id  = current_company_id()
             OR is_admin())
    )
  );

CREATE POLICY refunds_manage_admin ON refunds
  FOR ALL USING (is_admin());

-- ----------------------------- provider_earnings ---------------------------
ALTER TABLE provider_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY earnings_select ON provider_earnings
  FOR SELECT USING (
    provider_id = current_provider_id()
    OR company_id = current_company_id()
    OR is_admin()
  );

CREATE POLICY earnings_manage_admin ON provider_earnings
  FOR ALL USING (is_admin());

-- ----------------------------- reviews -------------------------------------
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read visible reviews
CREATE POLICY reviews_select_public ON reviews
  FOR SELECT USING (is_visible = TRUE OR customer_id = auth.uid() OR is_admin());

CREATE POLICY reviews_insert_customer ON reviews
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY reviews_update_own ON reviews
  FOR UPDATE USING (customer_id = auth.uid() OR is_admin())
  WITH CHECK (customer_id = auth.uid() OR is_admin());

CREATE POLICY reviews_delete_admin ON reviews
  FOR DELETE USING (is_admin());

-- ----------------------------- notifications -------------------------------
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select_own ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY notifications_insert ON notifications
  FOR INSERT WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY notifications_delete_own ON notifications
  FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- ----------------------------- support_tickets -----------------------------
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY tickets_select ON support_tickets
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY tickets_insert_own ON support_tickets
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY tickets_update ON support_tickets
  FOR UPDATE USING (user_id = auth.uid() OR is_admin());

CREATE POLICY tickets_delete_admin ON support_tickets
  FOR DELETE USING (is_admin());

-- ----------------------------- promotional_codes ---------------------------
ALTER TABLE promotional_codes ENABLE ROW LEVEL SECURITY;

-- Active codes are readable by anyone (for validation)
CREATE POLICY promo_codes_select ON promotional_codes
  FOR SELECT USING (is_active = TRUE OR is_admin());

CREATE POLICY promo_codes_manage_admin ON promotional_codes
  FOR ALL USING (is_admin());

-- ----------------------------- platform_settings ---------------------------
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Read-only for authenticated users; writable only by admin
CREATE POLICY settings_select ON platform_settings
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY settings_manage_admin ON platform_settings
  FOR ALL USING (is_admin());

-- ============================================================================
-- 6. SEED PLATFORM SETTINGS (sensible defaults)
-- ============================================================================

INSERT INTO platform_settings (key, value, description) VALUES
  ('platform_name',       '"Hourly Tourism"'::JSONB,   'Name of the platform'),
  ('default_currency',    '"INR"'::JSONB,              'Default currency code'),
  ('default_commission',  '10.0'::JSONB,               'Default provider commission rate (%)'),
  ('min_booking_hours',   '1'::JSONB,                  'Global minimum booking duration (hours)'),
  ('max_booking_hours',   '12'::JSONB,                 'Global maximum booking duration (hours)'),
  ('support_email',       '"support@hourlytourism.com"'::JSONB, 'Support email address'),
  ('tax_rate',            '18.0'::JSONB,               'GST tax rate (%)'),
  ('razorpay_enabled',    'true'::JSONB,               'Whether Razorpay payments are enabled')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 7. AUTO-CREATE PROFILE ON AUTH SIGNUP (Supabase trigger)
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'customer')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- 8. PROVIDER QR CODE FOR DIRECT PAYMENT COLLECTION
-- ============================================================================

-- Provider QR code for direct payment collection
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS payment_qr_url TEXT;

-- ============================================================================
-- End of schema
-- ============================================================================
