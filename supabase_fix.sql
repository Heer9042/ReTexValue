-- Run this SQL in your Supabase Dashboard -> SQL Editor
-- This fixes the issue where Phone and Location were not saving during registration.

-- 1. Ensure the profiles table has necessary columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS gst text,
ADD COLUMN IF NOT EXISTS capacity text,
ADD COLUMN IF NOT EXISTS company_name text;

-- 2. Update or Create the Trigger Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, role, email, phone, location, gst, capacity, company_name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    COALESCE(new.raw_user_meta_data->>'role', 'buyer'),
    new.email, -- Ensure email is copied from auth.users
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'location',
    new.raw_user_meta_data->>'gst',
    new.raw_user_meta_data->>'capacity',
    new.raw_user_meta_data->>'company_name'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    location = EXCLUDED.location;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure the Trigger exists (Drop and Recreate to be safe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Enable RLS on profiles if not already (Security Best Practice)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Add Policies (Example: Users can read everyone, but only update themselves)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING ( true );

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING ( auth.uid() = id );
