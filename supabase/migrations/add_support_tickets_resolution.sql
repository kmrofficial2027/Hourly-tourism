-- Add resolution and role fields to support_tickets if not already present
DO $$
BEGIN
  -- 1. Add resolution_notes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'support_tickets' 
    AND column_name = 'resolution_notes'
  ) THEN
    ALTER TABLE public.support_tickets ADD COLUMN resolution_notes TEXT;
  END IF;

  -- 2. Add resolved_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'support_tickets' 
    AND column_name = 'resolved_at'
  ) THEN
    ALTER TABLE public.support_tickets ADD COLUMN resolved_at TIMESTAMPTZ;
  END IF;

  -- 3. Add resolved_by column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'support_tickets' 
    AND column_name = 'resolved_by'
  ) THEN
    ALTER TABLE public.support_tickets ADD COLUMN resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;

  -- 4. Add role column (customer / provider)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'support_tickets' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.support_tickets ADD COLUMN role TEXT DEFAULT 'customer';
  END IF;

  -- 5. Add attachments column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'support_tickets' 
    AND column_name = 'attachments'
  ) THEN
    ALTER TABLE public.support_tickets ADD COLUMN attachments TEXT[] DEFAULT '{}';
  END IF;
END $$;

