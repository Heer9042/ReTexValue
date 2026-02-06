# Supabase Setup Guide - Admin Reports & Activity Logging

## Tables to Create in Supabase

### 1. `reports` Table
**Purpose:** Store all generated admin reports

```sql
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  link TEXT,
  generated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_generated_by ON reports(generated_by);
CREATE INDEX idx_reports_type ON reports(type);
```

### 2. `admin_activity_logs` Table
**Purpose:** Track all administrative actions for auditing

```sql
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,  -- e.g., REPORT_GENERATED, REPORT_DELETED, USER_APPROVED, etc.
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  admin_name VARCHAR(255),
  details TEXT,  -- Additional info about the action
  resource_type VARCHAR(100),  -- REPORT, USER, LISTING, etc.
  resource_id UUID,  -- ID of the affected resource
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_activity_logs_action ON admin_activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_resource_type ON admin_activity_logs(resource_type);
```

## Setting Up in Supabase Dashboard

1. Go to your Supabase Project
2. Navigate to **SQL Editor**
3. Copy and paste the SQL above
4. Click **Execute**

## Enable Row Level Security (RLS) - Optional but Recommended

```sql
-- Enable RLS on both tables
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all reports
CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Allow admins to manage reports
CREATE POLICY "Admins can create reports"
  ON reports FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Admins can delete reports"
  ON reports FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Allow admins to view activity logs
CREATE POLICY "Admins can view activity logs"
  ON admin_activity_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Allow service or admins to insert activity logs
CREATE POLICY "Admins can log activities"
  ON admin_activity_logs FOR INSERT
  WITH CHECK (TRUE);  -- Backend service will handle validation
```

## Features Now Available

### 1. **Report Generation**
- Admins can create reports with title and type (Financial, Operational, Security, Audit)
- Reports are stored in Supabase
- Activity is logged automatically

### 2. **Report Management**
- View all generated reports in chronological order
- Download reports as text files
- Delete reports with confirmation
- Shows today's report count and total count

### 3. **Admin Activity Logging**
- Automatic logging of:
  - Report generation
  - Report deletion
  - User approvals (when integrated)
  - Listing management
  - Settings changes

### 4. **Audit Trail**
- Complete history of all admin actions
- Shows who did what and when
- Searchable by action type and date

## API Endpoints Used

### GET Reports
```javascript
supabase.from('reports').select('*').order('created_at', { ascending: false })
```

### Create Report
```javascript
supabase.from('reports').insert([...]).select().single()
```

### Delete Report
```javascript
supabase.from('reports').delete().eq('id', reportId)
```

### Get Activity Logs
```javascript
supabase.from('admin_activity_logs').select('*').order('created_at', { ascending: false }).limit(50)
```

### Log Activity
```javascript
supabase.from('admin_activity_logs').insert([...])
```

## Next Steps

1. Run the SQL commands above in Supabase
2. Test report generation from `/admin/reports`
3. Verify activity logs are being recorded
4. Optional: Set up email notifications for important admin actions
5. Optional: Create a scheduled backup of activity logs

## Troubleshooting

### "Table does not exist" error
- Run the CREATE TABLE statements above
- Make sure you're in the correct Supabase project

### "Permission denied" error
- Check that your user has admin role
- Verify RLS policies are configured correctly

### Activity logs not showing
- Check browser console for errors
- Verify admin_activity_logs table exists
- Make sure user.id is available from context

