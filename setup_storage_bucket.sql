-- ==========================================================
-- ReTexValue Product Storage Migration
-- ==========================================================

-- 1. Create the 'products' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Enable public read access for 'products'
DROP POLICY IF EXISTS "Products Public Access" ON storage.objects;
CREATE POLICY "Products Public Access" ON storage.objects 
FOR SELECT USING ( bucket_id = 'products' );

-- 3. Enable authenticated upload access for 'products'
DROP POLICY IF EXISTS "Authenticated users can upload products" ON storage.objects;
CREATE POLICY "Authenticated users can upload products" ON storage.objects 
FOR INSERT WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- 4. Enable authenticated delete access (optional, for management)
DROP POLICY IF EXISTS "Authenticated users can delete products" ON storage.objects;
CREATE POLICY "Authenticated users can delete products" ON storage.objects 
FOR DELETE USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );
