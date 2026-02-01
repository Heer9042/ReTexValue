-- ==========================================================
-- ReTexValue Schema Update
-- ==========================================================

-- 1. Check if 'fabric_category' column exists in 'listings' table, if not add it.
DO $$ 
BEGIN 
    ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS fabric_category TEXT;
END $$;
