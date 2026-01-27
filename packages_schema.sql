-- Premium Packages Table for ReTexValue

CREATE TABLE IF NOT EXISTS packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_days INTEGER NOT NULL, -- Subscription duration in days
  features JSONB, -- Array of features as JSON
  max_listings INTEGER, -- Max listings allowed
  max_bulk_requests INTEGER, -- Max bulk requests
  priority_support BOOLEAN DEFAULT false,
  ai_credits INTEGER DEFAULT 0, -- AI classification credits
  status VARCHAR(50) DEFAULT 'active', -- active, inactive
  badge_color VARCHAR(50) DEFAULT 'blue', -- UI badge color
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_featured ON packages(is_featured);

-- Sample Premium Packages
INSERT INTO packages (name, description, price, duration_days, features, max_listings, max_bulk_requests, priority_support, ai_credits, badge_color, is_featured) VALUES
('Free Starter', 'Perfect for small factories getting started', 0, 30, 
 '["5 Listings per month", "Basic AI Classification", "Email Support", "Community Access"]'::jsonb,
 5, 2, false, 10, 'slate', false),

('Professional', 'Best for growing businesses', 999, 30,
 '["50 Listings per month", "Advanced AI Classification", "Priority Email Support", "Analytics Dashboard", "Bulk Upload", "Featured Listings"]'::jsonb,
 50, 10, true, 100, 'blue', true),

('Enterprise', 'For large-scale operations', 2999, 30,
 '["Unlimited Listings", "Premium AI Classification", "24/7 Phone Support", "Custom Analytics", "API Access", "Dedicated Account Manager", "White-label Option"]'::jsonb,
 999999, 999999, true, 999999, 'purple', true),

('Buyer Plus', 'Enhanced buying power', 499, 30,
 '["Priority Access to Listings", "Advanced Filters", "Price Alerts", "Bulk Discounts", "Faster Checkout"]'::jsonb,
 0, 20, false, 0, 'emerald', false);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER packages_updated_at_trigger
BEFORE UPDATE ON packages
FOR EACH ROW
EXECUTE FUNCTION update_packages_updated_at();
