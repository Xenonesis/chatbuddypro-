-- Direct ALTER TABLE statements for Supabase SQL editor
-- Add preferences column if it doesn't exist
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Add api_keys column if it doesn't exist
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS api_keys JSONB DEFAULT '{}'::jsonb;

-- Add description
COMMENT ON TABLE user_preferences IS 'User preferences including API keys and settings';
COMMENT ON COLUMN user_preferences.preferences IS 'User preferences data including API keys and settings';
COMMENT ON COLUMN user_preferences.api_keys IS 'Legacy column for storing API keys'; 