-- ============================================================================
-- Complete Cascade Delete Fix for Supabase Auth Users & Profiles
-- ============================================================================
-- Run this script in: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- This automatically drops all restrictive / SET NULL foreign keys that cause
-- "Failed to delete user: Database error deleting user" and replaces them with
-- clean CASCADE / SET NULL rules.
-- ============================================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    -- 1. Dynamically find and drop all foreign key constraints on affected tables
    FOR r IN (
        SELECT DISTINCT tc.table_schema, tc.table_name, tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
          AND (
            (tc.table_name = 'service_listings' AND kcu.column_name IN ('provider_id', 'company_id')) OR
            (tc.table_name = 'bookings' AND kcu.column_name IN ('customer_id', 'listing_id', 'provider_id', 'company_id')) OR
            (tc.table_name = 'payments' AND kcu.column_name = 'booking_id') OR
            (tc.table_name = 'refunds' AND kcu.column_name IN ('payment_id', 'booking_id')) OR
            (tc.table_name = 'provider_earnings' AND kcu.column_name IN ('booking_id', 'provider_id', 'company_id')) OR
            (tc.table_name = 'booking_status_history' AND kcu.column_name = 'changed_by') OR
            (tc.table_name = 'provider_profiles' AND kcu.column_name = 'verified_by') OR
            (tc.table_name = 'company_profiles' AND kcu.column_name = 'verified_by') OR
            (tc.table_name = 'platform_settings' AND kcu.column_name = 'updated_by') OR
            (tc.table_name = 'support_tickets' AND kcu.column_name = 'assigned_to')
          )
    ) LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) || ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- 2. Service Listings (Cascade delete listings when provider or company profile is deleted)
ALTER TABLE public.service_listings
  ADD CONSTRAINT service_listings_provider_id_fkey
    FOREIGN KEY (provider_id) REFERENCES public.provider_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.service_listings
  ADD CONSTRAINT service_listings_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES public.company_profiles(id) ON DELETE CASCADE;

-- 3. Bookings (Cascade delete bookings when customer profile or service listing is deleted)
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_customer_id_fkey
    FOREIGN KEY (customer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_listing_id_fkey
    FOREIGN KEY (listing_id) REFERENCES public.service_listings(id) ON DELETE CASCADE;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_provider_id_fkey
    FOREIGN KEY (provider_id) REFERENCES public.provider_profiles(id) ON DELETE SET NULL;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES public.company_profiles(id) ON DELETE SET NULL;

-- 4. Payments (Cascade delete payments when booking is deleted)
ALTER TABLE public.payments
  ADD CONSTRAINT payments_booking_id_fkey
    FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;

-- 5. Refunds (Cascade delete refunds when payment or booking is deleted)
ALTER TABLE public.refunds
  ADD CONSTRAINT refunds_payment_id_fkey
    FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE;

ALTER TABLE public.refunds
  ADD CONSTRAINT refunds_booking_id_fkey
    FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;

-- 6. Provider Earnings (Cascade delete provider earnings when booking, provider, or company is deleted)
ALTER TABLE public.provider_earnings
  ADD CONSTRAINT provider_earnings_booking_id_fkey
    FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;

ALTER TABLE public.provider_earnings
  ADD CONSTRAINT provider_earnings_provider_id_fkey
    FOREIGN KEY (provider_id) REFERENCES public.provider_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.provider_earnings
  ADD CONSTRAINT provider_earnings_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES public.company_profiles(id) ON DELETE CASCADE;

-- 7. Audit & Verification References (Set NULL when referenced admin profile is deleted)
ALTER TABLE public.booking_status_history
  ADD CONSTRAINT booking_status_history_changed_by_fkey
    FOREIGN KEY (changed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.provider_profiles
  ADD CONSTRAINT provider_profiles_verified_by_fkey
    FOREIGN KEY (verified_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.company_profiles
  ADD CONSTRAINT company_profiles_verified_by_fkey
    FOREIGN KEY (verified_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.platform_settings
  ADD CONSTRAINT platform_settings_updated_by_fkey
    FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.support_tickets
  ADD CONSTRAINT support_tickets_assigned_to_fkey
    FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Ensure profiles cascading from auth.users is intact
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles
      DROP CONSTRAINT IF EXISTS profiles_id_fkey,
      ADD CONSTRAINT profiles_id_fkey
        FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;
