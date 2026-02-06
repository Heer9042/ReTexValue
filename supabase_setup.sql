-- ReTexValue Admin Reports & Activity Logging Setup
-- Run this entire file in Supabase SQL Editor
-- Created: 2026-02-06

-- ============================================
-- 1. REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  link TEXT,
  generated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_generated_by ON reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);

-- ============================================
-- 2. ADMIN ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  admin_name VARCHAR(255),
  details TEXT,
  resource_type VARCHAR(100),
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON admin_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource_type ON admin_activity_logs(resource_type);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on both tables
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Reports Table Policies
CREATE POLICY "reports_admin_select" ON reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "reports_admin_insert" ON reports
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "reports_admin_delete" ON reports
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "reports_admin_update" ON reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Activity Logs Policies
CREATE POLICY "activity_logs_admin_select" ON admin_activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "activity_logs_insert" ON admin_activity_logs
  FOR INSERT
  WITH CHECK (TRUE);

-- ============================================
-- 4. GRANTS (if using a service role)
-- ============================================
-- Uncomment if using a service role for backend operations
-- GRANT ALL ON reports TO authenticated;
-- GRANT ALL ON admin_activity_logs TO authenticated;

-- ============================================
-- 5. VERIFICATION QUERIES
-- ============================================
-- Run these to verify everything was created correctly:
-- SELECT * FROM reports ORDER BY created_at DESC LIMIT 10;
-- SELECT * FROM admin_activity_logs ORDER BY created_at DESC LIMIT 10;
