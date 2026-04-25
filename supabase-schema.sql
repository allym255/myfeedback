-- =============================================
-- LOCALIZER MVP - DATABASE SCHEMA
-- =============================================
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE: branches
-- =============================================
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- TABLE: feedback
-- =============================================
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5) NOT NULL,
  service_speed INTEGER CHECK (service_speed >= 1 AND service_speed <= 5) NOT NULL,
  staff_friendliness INTEGER CHECK (staff_friendliness >= 1 AND staff_friendliness <= 5) NOT NULL,
  cleanliness INTEGER CHECK (cleanliness >= 1 AND cleanliness <= 5) NOT NULL,
  comment TEXT,
  shift VARCHAR(20) CHECK (shift IN ('morning', 'afternoon', 'evening')) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- TABLE: users (managers/admins)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'manager')) NOT NULL,
  branch_id UUID REFERENCES branches(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_feedback_branch ON feedback(branch_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(overall_rating);
CREATE INDEX IF NOT EXISTS idx_feedback_shift ON feedback(shift);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit feedback (no auth required)
CREATE POLICY "Anyone can submit feedback" ON feedback
  FOR INSERT WITH CHECK (true);

-- Policy: Anyone can read branches (for feedback form dropdown)
CREATE POLICY "Anyone can view branches" ON branches
  FOR SELECT USING (true);

-- Policy: Authenticated users can view all feedback
CREATE POLICY "Authenticated users can view feedback" ON feedback
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy: Managers can only read their own branch feedback (optional - uncomment if needed)
-- CREATE POLICY "Managers view own branch feedback" ON feedback
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM users 
--       WHERE users.id = auth.uid() 
--       AND users.branch_id = feedback.branch_id
--     )
--   );

-- Policy: Admins can view all feedback
-- CREATE POLICY "Admins view all feedback" ON feedback
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM users 
--       WHERE users.id = auth.uid() 
--       AND users.role = 'admin'
--     )
--   );

-- =============================================
-- SAMPLE DATA (for testing)
-- =============================================

-- Insert sample branches
INSERT INTO branches (id, name, location) VALUES 
  ('123e4567-e89b-12d3-a456-426614174000', 'Downtown Cafe', 'Dubai Mall, Ground Floor'),
  ('123e4567-e89b-12d3-a456-426614174001', 'Airport Lounge', 'Terminal 3, Gate A12'),
  ('123e4567-e89b-12d3-a456-426614174002', 'Beach Restaurant', 'Jumeirah Beach Road')
ON CONFLICT (id) DO NOTHING;

-- Insert sample feedback
INSERT INTO feedback (branch_id, overall_rating, service_speed, staff_friendliness, cleanliness, comment, shift) VALUES
  ('123e4567-e89b-12d3-a456-426614174000', 5, 5, 5, 4, 'Amazing experience! Staff was incredibly friendly.', 'morning'),
  ('123e4567-e89b-12d3-a456-426614174000', 2, 2, 3, 2, 'Very disappointed. Long wait times and dirty tables.', 'afternoon'),
  ('123e4567-e89b-12d3-a456-426614174000', 4, 4, 5, 4, 'Good coffee and nice ambiance!', 'morning'),
  ('123e4567-e89b-12d3-a456-426614174000', 5, 5, 5, 5, 'Perfect! Everything was excellent.', 'evening'),
  ('123e4567-e89b-12d3-a456-426614174000', 3, 3, 4, 3, 'Average experience. Nothing special.', 'afternoon'),
  ('123e4567-e89b-12d3-a456-426614174000', 1, 1, 2, 1, 'Terrible service. Would not recommend.', 'evening'),
  ('123e4567-e89b-12d3-a456-426614174000', 4, 5, 4, 4, 'Quick service during lunch rush!', 'afternoon'),
  ('123e4567-e89b-12d3-a456-426614174000', 5, 4, 5, 5, 'Love this place! Staff remembers my order.', 'morning');

-- =============================================
-- ANALYTICS VIEW (optional - for faster queries)
-- =============================================
CREATE OR REPLACE VIEW feedback_analytics AS
SELECT 
  f.branch_id,
  b.name as branch_name,
  DATE(f.created_at) as feedback_date,
  f.shift,
  COUNT(*) as total_responses,
  ROUND(AVG(f.overall_rating)::numeric, 2) as avg_overall,
  ROUND(AVG(f.service_speed)::numeric, 2) as avg_speed,
  ROUND(AVG(f.staff_friendliness)::numeric, 2) as avg_staff,
  ROUND(AVG(f.cleanliness)::numeric, 2) as avg_cleanliness,
  COUNT(CASE WHEN f.overall_rating <= 2 THEN 1 END) as negative_count,
  ROUND(
    (COUNT(CASE WHEN f.overall_rating <= 2 THEN 1 END)::float / COUNT(*)::float * 100)::numeric, 
    2
  ) as negative_percentage
FROM feedback f
JOIN branches b ON f.branch_id = b.id
GROUP BY f.branch_id, b.name, DATE(f.created_at), f.shift;

-- =============================================
-- FUNCTION: Trigger email alert on negative feedback
-- =============================================
-- This would be implemented as a Supabase Edge Function
-- See /supabase/functions/alert-negative-feedback/ in the project

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '📊 Sample data inserted';
  RAISE NOTICE '🔒 Row Level Security enabled';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Copy your Supabase URL and anon key to .env.local';
  RAISE NOTICE '2. Run: npm install';
  RAISE NOTICE '3. Run: npm run dev';
  RAISE NOTICE '4. Visit: http://localhost:3000';
END $$;
