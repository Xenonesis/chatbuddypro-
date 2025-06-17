-- Fix permissions for user_preferences

-- Make sure extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant access to public schema 
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Ensure the user_preferences table has Row Level Security enabled
ALTER TABLE IF EXISTS user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can only access their own preferences" ON user_preferences;

-- Create separate policies for different operations
CREATE POLICY "Users can select their own preferences" 
  ON user_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
  ON user_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own preferences" 
  ON user_preferences FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create user_preferences if it doesn't exist
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'en',
  api_keys JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Recreate trigger for updated_at field
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;

-- Create function to update updated_at timestamp  
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Grant all permissions on user_preferences to authenticated users
GRANT ALL ON user_preferences TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE user_preferences_id_seq TO authenticated; 