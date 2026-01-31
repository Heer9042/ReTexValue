-- Database Tables for Admin Settings
-- Run this SQL in your Supabase Dashboard -> SQL Editor

-- 1. System Alerts Table
CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- info, warning, error, success
  priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
  target_audience VARCHAR(50) DEFAULT 'all', -- all, factory, buyer, admin
  expires_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_system_alerts_active ON system_alerts(active);
CREATE INDEX IF NOT EXISTS idx_system_alerts_type ON system_alerts(type);
CREATE INDEX IF NOT EXISTS idx_system_alerts_target ON system_alerts(target_audience);

-- Enable RLS
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for System Alerts
-- Admins can do everything
CREATE POLICY "Admins can manage alerts"
ON system_alerts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Everyone can read active alerts
CREATE POLICY "Everyone can read active alerts"
ON system_alerts
FOR SELECT
USING (active = true);

-- 2. Market Regions Table
CREATE TABLE IF NOT EXISTS market_regions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_market_regions_active ON market_regions(active);
CREATE INDEX IF NOT EXISTS idx_market_regions_code ON market_regions(code);

-- Enable RLS
ALTER TABLE market_regions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Market Regions
-- Admins can do everything
CREATE POLICY "Admins can manage regions"
ON market_regions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Everyone can read active regions
CREATE POLICY "Everyone can read active regions"
ON market_regions
FOR SELECT
USING (active = true);

-- Insert default regions
INSERT INTO market_regions (name, code, currency, timezone, active) VALUES
('India', 'IN', 'INR', 'Asia/Kolkata', true),
('United States', 'US', 'USD', 'America/New_York', true),
('United Kingdom', 'GB', 'GBP', 'Europe/London', true),
('Germany', 'DE', 'EUR', 'Europe/Berlin', true),
('France', 'FR', 'EUR', 'Europe/Paris', true),
('Japan', 'JP', 'JPY', 'Asia/Tokyo', true),
('China', 'CN', 'CNY', 'Asia/Shanghai', true),
('Australia', 'AU', 'AUD', 'Australia/Sydney', true)
ON CONFLICT (code) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to system_alerts
DROP TRIGGER IF EXISTS update_system_alerts_updated_at ON system_alerts;
CREATE TRIGGER update_system_alerts_updated_at
    BEFORE UPDATE ON system_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to market_regions
DROP TRIGGER IF EXISTS update_market_regions_updated_at ON market_regions;
CREATE TRIGGER update_market_regions_updated_at
    BEFORE UPDATE ON market_regions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

