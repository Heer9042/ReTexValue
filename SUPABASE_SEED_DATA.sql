-- Seed Data with Auth Users - v3
-- Run this in Supabase Dashboard SQL Editor

-- 1. Insert into auth.users first
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'a0a0a0a0-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'contact@greentex.com', 'scrypt:$2b$10$dummyhashdummyhashdummyhashdummyhash', NOW(), NULL, NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0a0a0a0-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'info@ecoweave.in', 'scrypt:$2b$10$dummyhashdummyhashdummyhashdummyhash', NOW(), NULL, NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0a0a0a0-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'procurement@fashionhub.com', 'scrypt:$2b$10$dummyhashdummyhashdummyhashdummyhash', NOW(), NULL, NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0a0a0a0-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'alice@threads.co', 'scrypt:$2b$10$dummyhashdummyhashdummyhashdummyhash', NOW(), NULL, NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0a0a0a0-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'sales@bluedenim.com', 'scrypt:$2b$10$dummyhashdummyhashdummyhashdummyhash', NOW(), NULL, NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '')
ON CONFLICT DO NOTHING;

-- 2. Insert into public.profiles
INSERT INTO public.profiles (id, username, full_name, role, email, status, type, location, created_at)
VALUES 
  ('a0a0a0a0-0000-0000-0000-000000000001', 'GreenTex', 'Green Textiles Ltd', 'factory', 'contact@greentex.com', 'Verified', 'Recycler', 'Surat, Gujarat', NOW() - INTERVAL '5 days'),
  ('a0a0a0a0-0000-0000-0000-000000000002', 'EcoWeave', 'Eco Weave Industries', 'factory', 'info@ecoweave.in', 'Verified', 'Manufacturer', 'Ahmedabad, Gujarat', NOW() - INTERVAL '12 days'),
  ('a0a0a0a0-0000-0000-0000-000000000003', 'FashionHub', 'Fashion Hub Inc', 'buyer', 'procurement@fashionhub.com', 'Verified', 'Brand', 'Mumbai, Maharashtra', NOW() - INTERVAL '20 days'),
  ('a0a0a0a0-0000-0000-0000-000000000004', 'SustainableThreads', 'Sustainable Threads', 'buyer', 'alice@threads.co', 'Pending', 'Designer', 'Delhi', NOW() - INTERVAL '1 day'),
  ('a0a0a0a0-0000-0000-0000-000000000005', 'BlueDenim', 'Blue Denim Factory', 'factory', 'sales@bluedenim.com', 'Blocked', 'Mill', 'Jaipur, Rajasthan', NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username, full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- 3. Create Listings (With Specific IDs so we can link transactions)
INSERT INTO public.listings (id, factory_id, fabric_type, quantity, price, description, status, location, image_url, shop_name, email, created_at)
VALUES
  ('c0c0c0c0-0000-0000-0000-000000000001', 'a0a0a0a0-0000-0000-0000-000000000001', 'Cotton', 500, 45, 'High quality pure cotton offcuts.', 'Live', 'Surat, Gujarat', 'https://images.unsplash.com/photo-1596484552834-3115469446d3?e=1&w=400', 'Green Textiles Ltd', 'contact@greentex.com', NOW() - INTERVAL '2 days'),
  ('c0c0c0c0-0000-0000-0000-000000000002', 'a0a0a0a0-0000-0000-0000-000000000001', 'Polyester', 200, 25, 'Mixed polyester scraps.', 'Pending', 'Surat, Gujarat', 'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?e=1&w=400', 'Green Textiles Ltd', 'contact@greentex.com', NOW()),
  ('c0c0c0c0-0000-0000-0000-000000000003', 'a0a0a0a0-0000-0000-0000-000000000002', 'Denim', 1200, 60, 'Blue denim waste.', 'Sold', 'Ahmedabad, Gujarat', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?e=1&w=400', 'Eco Weave Industries', 'info@ecoweave.in', NOW() - INTERVAL '8 days'),
  ('c0c0c0c0-0000-0000-0000-000000000004', 'a0a0a0a0-0000-0000-0000-000000000002', 'Silk', 50, 200, 'Premium silk cutouts.', 'Live', 'Ahmedabad, Gujarat', 'https://images.unsplash.com/photo-1563203493-27dc24c32b53?e=1&w=400', 'Eco Weave Industries', 'info@ecoweave.in', NOW() - INTERVAL '6 days'),
  -- Dummy sold listings for history
  ('c0c0c0c0-0000-0000-0000-000000000099', 'a0a0a0a0-0000-0000-0000-000000000001', 'Cotton', 1000, 50, 'Historical Cotton', 'Sold', 'Surat, Gujarat', '', 'Green Textiles', 'old@test.com', NOW() - INTERVAL '15 days'),
  ('c0c0c0c0-0000-0000-0000-000000000098', 'a0a0a0a0-0000-0000-0000-000000000002', 'Linen', 200, 60, 'Historical Linen', 'Sold', 'Ahmedabad', '', 'Eco Weave', 'old@test.com', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- 4. Create Transactions (Corrected Schema: No seller_id)
INSERT INTO public.transactions (listing_id, buyer_id, amount, commission, status, created_at, date)
VALUES
  ('c0c0c0c0-0000-0000-0000-000000000003', 'a0a0a0a0-0000-0000-0000-000000000003', 72000, 3600, 'Completed', NOW() - INTERVAL '4 days', CURRENT_DATE - 4),
  ('c0c0c0c0-0000-0000-0000-000000000099', 'a0a0a0a0-0000-0000-0000-000000000003', 50000, 2500, 'Completed', NOW() - INTERVAL '15 days', CURRENT_DATE - 15),
  ('c0c0c0c0-0000-0000-0000-000000000098', 'a0a0a0a0-0000-0000-0000-000000000004', 12000, 600, 'Completed', NOW() - INTERVAL '3 days', CURRENT_DATE - 3);

-- 5. Create Bulk Requests
INSERT INTO public.bulk_requests (buyer_id, fabric_type, quantity, target_price, deadline, status, description, created_at)
VALUES
  ('a0a0a0a0-0000-0000-0000-000000000003', 'Organic Cotton', 2000, 50, '2024-05-01', 'Open', 'Looking for certified organic cotton waste for new clothing line.', NOW() - INTERVAL '1 day'),
  ('a0a0a0a0-0000-0000-0000-000000000004', 'Nylon', 500, 30, '2024-03-20', 'Matched', 'Industrial grade nylon scraps required.', NOW() - INTERVAL '10 days');
