-- ============================================================================
-- Fix Foreign Keys for Clean Cascading Deletions
-- ============================================================================
-- This script replaces restrictive foreign keys with ON DELETE CASCADE / SET NULL,
-- allowing any user, provider, or listing to be deleted from Supabase Auth Dashboard
-- without encountering "Database error deleting user".
-- ============================================================================

-- 1. Allow service_listings to cascade-delete when provider or company is deleted
ALTER TABLE service_listings
  DROP CONSTRAINT IF EXISTS service_listings_provider_id_fkey,
  ADD CONSTRAINT service_listings_provider_id_fkey
    FOREIGN KEY (provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE;

ALTER TABLE service_listings
  DROP CONSTRAINT IF EXISTS service_listings_company_id_fkey,
  ADD CONSTRAINT service_listings_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES company_profiles(id) ON DELETE CASCADE;

-- 2. Allow bookings to cascade-delete when customer profile or listing is deleted
ALTER TABLE bookings
  DROP CONSTRAINT IF EXISTS bookings_customer_id_fkey,
  ADD CONSTRAINT bookings_customer_id_fkey
    FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE bookings
  DROP CONSTRAINT IF EXISTS bookings_listing_id_fkey,
  ADD CONSTRAINT bookings_listing_id_fkey
    FOREIGN KEY (listing_id) REFERENCES service_listings(id) ON DELETE CASCADE;

-- 3. Allow booking_status_history to set null when user is deleted
ALTER TABLE booking_status_history
  DROP CONSTRAINT IF EXISTS booking_status_history_changed_by_fkey,
  ADD CONSTRAINT booking_status_history_changed_by_fkey
    FOREIGN KEY (changed_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- 4. Allow provider_profiles to set null when admin verifier is deleted
ALTER TABLE provider_profiles
  DROP CONSTRAINT IF EXISTS provider_profiles_verified_by_fkey,
  ADD CONSTRAINT provider_profiles_verified_by_fkey
    FOREIGN KEY (verified_by) REFERENCES profiles(id) ON DELETE SET NULL;
