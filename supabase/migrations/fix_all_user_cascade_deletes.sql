-- ============================================================================
-- Complete Cascade Delete Fix for Supabase Auth Users
-- ============================================================================
-- Run this in your Supabase Project Dashboard -> SQL Editor -> Run
-- This ensures that deleting any user, provider, customer, or listing
-- from the Supabase Dashboard never throws "Database error deleting user".
-- ============================================================================

-- 1. Service Listings (cascade when provider or company is deleted)
ALTER TABLE service_listings
  DROP CONSTRAINT IF EXISTS service_listings_provider_id_fkey,
  ADD CONSTRAINT service_listings_provider_id_fkey
    FOREIGN KEY (provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE;

ALTER TABLE service_listings
  DROP CONSTRAINT IF EXISTS service_listings_company_id_fkey,
  ADD CONSTRAINT service_listings_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES company_profiles(id) ON DELETE CASCADE;

-- 2. Bookings (cascade when customer or listing is deleted)
ALTER TABLE bookings
  DROP CONSTRAINT IF EXISTS bookings_customer_id_fkey,
  ADD CONSTRAINT bookings_customer_id_fkey
    FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE bookings
  DROP CONSTRAINT IF EXISTS bookings_listing_id_fkey,
  ADD CONSTRAINT bookings_listing_id_fkey
    FOREIGN KEY (listing_id) REFERENCES service_listings(id) ON DELETE CASCADE;

-- 3. Payments (cascade when booking is deleted)
ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_booking_id_fkey,
  ADD CONSTRAINT payments_booking_id_fkey
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

-- 4. Refunds (cascade when payment or booking is deleted)
ALTER TABLE refunds
  DROP CONSTRAINT IF EXISTS refunds_payment_id_fkey,
  ADD CONSTRAINT refunds_payment_id_fkey
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE;

ALTER TABLE refunds
  DROP CONSTRAINT IF EXISTS refunds_booking_id_fkey,
  ADD CONSTRAINT refunds_booking_id_fkey
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

-- 5. Provider Earnings (cascade when booking, provider, or company is deleted)
ALTER TABLE provider_earnings
  DROP CONSTRAINT IF EXISTS provider_earnings_booking_id_fkey,
  ADD CONSTRAINT provider_earnings_booking_id_fkey
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

ALTER TABLE provider_earnings
  DROP CONSTRAINT IF EXISTS provider_earnings_provider_id_fkey,
  ADD CONSTRAINT provider_earnings_provider_id_fkey
    FOREIGN KEY (provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE;

ALTER TABLE provider_earnings
  DROP CONSTRAINT IF EXISTS provider_earnings_company_id_fkey,
  ADD CONSTRAINT provider_earnings_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES company_profiles(id) ON DELETE CASCADE;

-- 6. Booking Status History (set null when user is deleted)
ALTER TABLE booking_status_history
  DROP CONSTRAINT IF EXISTS booking_status_history_changed_by_fkey,
  ADD CONSTRAINT booking_status_history_changed_by_fkey
    FOREIGN KEY (changed_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- 7. Verification Admin FKs (set null when verifying admin is deleted)
ALTER TABLE provider_profiles
  DROP CONSTRAINT IF EXISTS provider_profiles_verified_by_fkey,
  ADD CONSTRAINT provider_profiles_verified_by_fkey
    FOREIGN KEY (verified_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE company_profiles
  DROP CONSTRAINT IF EXISTS company_profiles_verified_by_fkey,
  ADD CONSTRAINT company_profiles_verified_by_fkey
    FOREIGN KEY (verified_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- 8. Platform Settings (set null when admin who updated is deleted)
ALTER TABLE platform_settings
  DROP CONSTRAINT IF EXISTS platform_settings_updated_by_fkey,
  ADD CONSTRAINT platform_settings_updated_by_fkey
    FOREIGN KEY (updated_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- 9. Support Tickets (set null when assigned admin is deleted)
ALTER TABLE support_tickets
  DROP CONSTRAINT IF EXISTS support_tickets_assigned_to_fkey,
  ADD CONSTRAINT support_tickets_assigned_to_fkey
    FOREIGN KEY (assigned_to) REFERENCES profiles(id) ON DELETE SET NULL;

