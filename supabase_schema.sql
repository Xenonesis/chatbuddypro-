-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables

-- Users table (managed by Supabase Auth)
-- This is automatically created by Supabase

-- User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (Row Level Security) on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for user_profiles
DROP POLICY IF EXISTS "Users can only access their own profiles" ON user_profiles;
CREATE POLICY "Users can only access their own profiles" 
  ON user_profiles FOR ALL 
  USING (auth.uid() = user_id);

-- User Preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'en',
  api_keys JSONB DEFAULT '{}'::jsonb, -- Encrypted API keys stored as JSON
  ai_providers JSONB DEFAULT '{
    "openai": {"enabled": false, "api_keys": {}},
    "gemini": {"enabled": false, "api_keys": {}},
    "mistral": {"enabled": false, "api_keys": {}},
    "claude": {"enabled": false, "api_keys": {}},
    "llama": {"enabled": false, "api_keys": {}},
    "deepseek": {"enabled": false, "api_keys": {}}
  }'::jsonb, -- Structured AI provider information
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (Row Level Security) on user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policy for user_preferences
DROP POLICY IF EXISTS "Users can only access their own preferences" ON user_preferences;
CREATE POLICY "Users can only access their own preferences" 
  ON user_preferences FOR ALL 
  USING (auth.uid() = user_id);

-- User API Keys table - new table to store API keys with provider information
CREATE TABLE IF NOT EXISTS user_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  api_key TEXT NOT NULL, -- Stored encrypted
  is_active BOOLEAN DEFAULT true,
  name TEXT DEFAULT 'default', -- Optional name for the key (e.g., "Production", "Development")
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider_name, name)
);

-- Enable RLS on user_api_keys
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy for user_api_keys
DROP POLICY IF EXISTS "Users can only access their own API keys" ON user_api_keys;
CREATE POLICY "Users can only access their own API keys" 
  ON user_api_keys FOR ALL 
  USING (auth.uid() = user_id);

-- Create an index for faster lookups by user_id and provider
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_provider 
  ON user_api_keys(user_id, provider_name);

-- Create an index for email lookups
CREATE INDEX IF NOT EXISTS idx_user_api_keys_email 
  ON user_api_keys(user_email);

-- Function to safely store encrypted API key
CREATE OR REPLACE FUNCTION store_api_key(
  p_user_id UUID,
  p_user_email TEXT,
  p_provider_name TEXT,
  p_api_key TEXT,
  p_name TEXT DEFAULT 'default'
)
RETURNS UUID AS $$
DECLARE
  v_existing_id UUID;
  v_new_id UUID;
BEGIN
  -- Check if a key with this name already exists for this user/provider
  SELECT id INTO v_existing_id 
  FROM user_api_keys 
  WHERE user_id = p_user_id 
    AND provider_name = p_provider_name
    AND name = p_name;
    
  -- If exists, update it
  IF v_existing_id IS NOT NULL THEN
    UPDATE user_api_keys
    SET api_key = p_api_key,
        is_active = true,
        updated_at = NOW()
    WHERE id = v_existing_id;
    
    RETURN v_existing_id;
  ELSE
    -- Otherwise insert new record
    INSERT INTO user_api_keys (
      user_id,
      user_email,
      provider_name,
      api_key,
      name
    ) VALUES (
      p_user_id,
      p_user_email,
      p_provider_name,
      p_api_key,
      p_name
    )
    RETURNING id INTO v_new_id;
    
    RETURN v_new_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Chat history table
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  last_message TEXT,
  model VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on chats
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Create policy for chats
DROP POLICY IF EXISTS "Users can only access their own chats" ON chats;
CREATE POLICY "Users can only access their own chats" 
  ON chats FOR ALL 
  USING (auth.uid() = user_id);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for chat_messages
DROP POLICY IF EXISTS "Users can only access their own messages" ON chat_messages;
CREATE POLICY "Users can only access their own messages" 
  ON chat_messages FOR ALL 
  USING (auth.uid() = user_id);

-- User backups table (for automated backup)
CREATE TABLE IF NOT EXISTS user_backups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL, -- Full backup of user data
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on user_backups
ALTER TABLE user_backups ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own backups, but not modify them
DROP POLICY IF EXISTS "Users can only view their own backups" ON user_backups;
CREATE POLICY "Users can only view their own backups" 
  ON user_backups FOR SELECT 
  USING (auth.uid() = user_id);

-- Create indexes for better performance (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_profiles_user_id') THEN
    CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_preferences_user_id') THEN
    CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_chats_user_id') THEN
    CREATE INDEX idx_chats_user_id ON chats(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_chat_messages_chat_id') THEN
    CREATE INDEX idx_chat_messages_chat_id ON chat_messages(chat_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_chat_messages_user_id') THEN
    CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_backups_user_id') THEN
    CREATE INDEX idx_user_backups_user_id ON user_backups(user_id);
  END IF;
END$$;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (drop first if they exist)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_chats_updated_at ON chats;
CREATE TRIGGER update_chats_updated_at
BEFORE UPDATE ON chats
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_api_keys_updated_at ON user_api_keys;
CREATE TRIGGER update_user_api_keys_updated_at
BEFORE UPDATE ON user_api_keys
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Create a view for analytics (admin only) if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'chat_analytics') THEN
    CREATE VIEW chat_analytics AS
    SELECT
      u.email,
      COUNT(DISTINCT c.id) as chat_count,
      COUNT(m.id) as message_count,
      MIN(c.created_at) as first_chat,
      MAX(c.created_at) as last_chat
    FROM
      auth.users u
    LEFT JOIN
      chats c ON u.id = c.user_id
    LEFT JOIN
      chat_messages m ON c.id = m.chat_id
    GROUP BY
      u.id, u.email;
  END IF;
END$$;

-- Create a view for API keys analytics (admin only)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'api_keys_analytics') THEN
    CREATE VIEW api_keys_analytics AS
    SELECT
      u.email,
      ak.provider_name,
      COUNT(ak.id) as key_count,
      MIN(ak.created_at) as first_key_added,
      MAX(ak.updated_at) as last_key_updated
    FROM
      auth.users u
    LEFT JOIN
      user_api_keys ak ON u.id = ak.user_id
    GROUP BY
      u.id, u.email, ak.provider_name;
  END IF;
END$$;

-- Secure the analytics views
REVOKE ALL ON chat_analytics FROM PUBLIC;
REVOKE ALL ON api_keys_analytics FROM PUBLIC;
GRANT SELECT ON chat_analytics TO service_role; -- Only service_role can access
GRANT SELECT ON api_keys_analytics TO service_role; -- Only service_role can access

-- Migration helper function to populate ai_providers from existing api_keys
CREATE OR REPLACE FUNCTION migrate_api_keys_to_ai_providers()
RETURNS void AS $$
DECLARE
  pref_rec RECORD;
  api_key_rec RECORD;
  provider_name TEXT;
  encrypted_key TEXT;
  column_exists BOOLEAN;
BEGIN
  -- First check if the ai_providers column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_preferences' 
    AND column_name = 'ai_providers'
  ) INTO column_exists;
  
  -- If column doesn't exist, try to add it
  IF NOT column_exists THEN
    BEGIN
      RAISE NOTICE 'ai_providers column does not exist, adding it now';
      EXECUTE 'ALTER TABLE user_preferences ADD COLUMN ai_providers JSONB DEFAULT ''{"openai": {"enabled": false, "api_keys": {}}, "gemini": {"enabled": false, "api_keys": {}}, "mistral": {"enabled": false, "api_keys": {}}, "claude": {"enabled": false, "api_keys": {}}, "llama": {"enabled": false, "api_keys": {}}, "deepseek": {"enabled": false, "api_keys": {}}}''::jsonb';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error adding ai_providers column: %', SQLERRM;
      RETURN;
    END;
  END IF;
  
  -- Now process each record
  FOR pref_rec IN SELECT id, user_id, api_keys FROM user_preferences WHERE api_keys IS NOT NULL AND api_keys::text <> '{}'::text LOOP
    -- Check if ai_providers is NULL for this record
    EXECUTE 'SELECT ai_providers IS NULL FROM user_preferences WHERE id = $1' INTO column_exists USING pref_rec.id;
    
    -- Initialize ai_providers if NULL
    IF column_exists THEN
      EXECUTE 'UPDATE user_preferences SET ai_providers = ''{"openai": {"enabled": false, "api_keys": {}}, "gemini": {"enabled": false, "api_keys": {}}, "mistral": {"enabled": false, "api_keys": {}}, "claude": {"enabled": false, "api_keys": {}}, "llama": {"enabled": false, "api_keys": {}}, "deepseek": {"enabled": false, "api_keys": {}}}''::jsonb WHERE id = $1' USING pref_rec.id;
    END IF;
    
    -- For each provider in api_keys, update the corresponding ai_providers entry
    FOR provider_name, encrypted_key IN SELECT * FROM jsonb_each_text(pref_rec.api_keys) LOOP
      EXECUTE 'UPDATE user_preferences 
      SET ai_providers = jsonb_set(
        ai_providers,
        ARRAY[$1],
        jsonb_build_object(''enabled'', true, ''api_keys'', jsonb_build_object(''default'', $2))
      )
      WHERE id = $3' USING provider_name, encrypted_key, pref_rec.id;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Migration completed successfully';
END;
$$ LANGUAGE plpgsql;

-- Function to migrate keys from user_preferences to user_api_keys table
CREATE OR REPLACE FUNCTION migrate_keys_to_user_api_keys()
RETURNS void AS $$
DECLARE
  pref_rec RECORD;
  user_rec RECORD;
  provider_name TEXT;
  encrypted_key TEXT;
  user_email TEXT;
BEGIN
  RAISE NOTICE 'Starting migration of API keys to user_api_keys table...';
  
  -- Process each record in user_preferences
  FOR pref_rec IN 
    SELECT 
      p.id, 
      p.user_id, 
      p.api_keys, 
      p.ai_providers
    FROM 
      user_preferences p
    WHERE 
      (p.api_keys IS NOT NULL AND p.api_keys::text <> '{}'::text) OR
      (p.ai_providers IS NOT NULL AND p.ai_providers::text <> '{}'::text)
  LOOP
    -- Get user email from auth.users
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = pref_rec.user_id;
    
    IF user_email IS NULL THEN
      RAISE NOTICE 'User with ID % not found in auth.users, skipping', pref_rec.user_id;
      CONTINUE;
    END IF;
    
    -- First try the ai_providers structure
    IF pref_rec.ai_providers IS NOT NULL THEN
      FOR provider_name IN 
        SELECT key
        FROM jsonb_each(pref_rec.ai_providers)
      LOOP
        -- Check if there's an API key for this provider
        IF pref_rec.ai_providers->provider_name->'api_keys' IS NOT NULL AND 
           pref_rec.ai_providers->provider_name->'api_keys'->>'default' IS NOT NULL THEN
          
          encrypted_key := pref_rec.ai_providers->provider_name->'api_keys'->>'default';
          
          -- Insert into user_api_keys using the function
          PERFORM store_api_key(
            pref_rec.user_id, 
            user_email, 
            provider_name, 
            encrypted_key
          );
          
          RAISE NOTICE 'Migrated key for provider % for user %', provider_name, user_email;
        END IF;
      END LOOP;
    END IF;
    
    -- Then try the legacy api_keys structure
    IF pref_rec.api_keys IS NOT NULL THEN
      FOR provider_name, encrypted_key IN 
        SELECT * FROM jsonb_each_text(pref_rec.api_keys)
      LOOP
        -- Insert into user_api_keys using the function
        PERFORM store_api_key(
          pref_rec.user_id, 
          user_email, 
          provider_name, 
          encrypted_key
        );
        
        RAISE NOTICE 'Migrated legacy key for provider % for user %', provider_name, user_email;
      END LOOP;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'API keys migration completed successfully';
END;
$$ LANGUAGE plpgsql;

-- Run migrations (can be commented out after initial run)
SELECT migrate_api_keys_to_ai_providers();
SELECT migrate_keys_to_user_api_keys(); 