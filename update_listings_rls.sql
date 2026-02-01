-- ==========================================================
-- ReTexValue Listings RLS Policy Update
-- ==========================================================
-- Enforce proper policies for the 'listings' table.

-- 1. Enable RLS on listings (ensure it is on)
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- 2. Allow public read access to all listings (both Pending and Live)
--    We filter them on the frontend, but the data must be readable.
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON public.listings;
CREATE POLICY "Listings are viewable by everyone" ON public.listings FOR SELECT USING ( true );

-- 3. Allow factories (authenticated users) to create their own listings
DROP POLICY IF EXISTS "Factories can create listings" ON public.listings;
CREATE POLICY "Factories can create listings" ON public.listings FOR INSERT WITH CHECK ( auth.uid() = factory_id );

-- 4. Allow factories to update their own listings
DROP POLICY IF EXISTS "Factories can update own listings" ON public.listings;
CREATE POLICY "Factories can update own listings" ON public.listings FOR UPDATE USING ( auth.uid() = factory_id );

-- 5. Allow factories to delete their own listings
DROP POLICY IF EXISTS "Factories can delete own listings" ON public.listings;
CREATE POLICY "Factories can delete own listings" ON public.listings FOR DELETE USING ( auth.uid() = factory_id );

-- 6. CRITICAL: Allow Admins to update ANY listing (e.g. Approve/Reject status)
DROP POLICY IF EXISTS "Admins can update any listing" ON public.listings;
CREATE POLICY "Admins can update any listing" ON public.listings FOR UPDATE TO authenticated 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- 7. Allow Admins to delete any listing
DROP POLICY IF EXISTS "Admins can delete any listing" ON public.listings;
CREATE POLICY "Admins can delete any listing" ON public.listings FOR DELETE TO authenticated 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
