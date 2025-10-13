-- =====================================
-- Supabase Database Schema for TypeMeet
-- =====================================
-- This file contains the complete database schema including:
-- - Tables
-- - Indexes
-- - Row Level Security (RLS) policies
-- - Functions and Triggers
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id text UNIQUE PRIMARY KEY NOT NULL,
  email text NOT NULL,
  first_name text,
  last_name text,
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  analysis_text text,
  processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending', 'analyzing', 'completed', 'failed')),  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id text UNIQUE PRIMARY KEY NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  created_by text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  private_metadata jsonb DEFAULT '{}',
  public_metadata jsonb DEFAULT '{}',
  slug text DEFAULT NULL,
  updated_at timestamp with time zone DEFAULT now()
);



-- =====================================================
-- INDEXES
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);

-- Organizations indexes
CREATE INDEX IF NOT EXISTS idx_organizations_id ON organizations(id);
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);

-- Meetings indexes
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_processing_status ON meetings(processing_status);
CREATE INDEX IF NOT EXISTS idx_meetings_user_created ON meetings(user_id, created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

DROP POLICY IF EXISTS "Users can view their own meetings." ON meetings;
DROP POLICY IF EXISTS "Users can insert their own meetings." ON meetings;
DROP POLICY IF EXISTS "Users can update their own meetings." ON meetings;
DROP POLICY IF EXISTS "Users can delete their own meetings." ON meetings;

-- Users table policies
CREATE POLICY "Users can view own data" 
  ON users 
  FOR SELECT 
  USING (id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own data" 
  ON users 
  FOR INSERT 
  WITH CHECK (id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own data" 
  ON users 
  FOR UPDATE 
  USING (id = auth.jwt() ->> 'sub');

-- Meetings table policies
CREATE POLICY "Users can view their own meetings" 
  ON meetings 
  FOR SELECT 
  TO authenticated 
  USING (
    user_id IN (SELECT id FROM users WHERE id = auth.jwt() ->> 'sub')
  );


-- Meetings table policies
CREATE POLICY "Users can insert their own meetings" 
  ON meetings 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    user_id IN (SELECT id FROM users WHERE id = auth.jwt() ->> 'sub')
  );

CREATE POLICY "Users can update their own meetings" 
  ON meetings 
  FOR UPDATE 
  TO authenticated 
  USING (
    user_id IN (SELECT id FROM users WHERE id = auth.jwt() ->> 'sub')
  ) 
  WITH CHECK (
    user_id IN (SELECT id FROM users WHERE id = auth.jwt() ->> 'sub')
  );

CREATE POLICY "Users can delete their own meetings" 
  ON meetings 
  FOR DELETE 
  TO authenticated 
  USING (
    user_id IN (SELECT id FROM users WHERE id = auth.jwt() ->> 'sub')
  );

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meetings_updated_at ON meetings;
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database schema initialized successfully!';
  RAISE NOTICE '📊 Tables created: users, meetings';
  RAISE NOTICE '🔒 Row Level Security enabled on all tables';
  RAISE NOTICE '🔑 Indexes created for optimal performance';
  RAISE NOTICE '⚡ Triggers configured for automatic updates';
END $$;