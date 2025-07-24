-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'en',
  api_keys JSONB DEFAULT '{}'::jsonb,
  ai_providers JSONB DEFAULT '{
    "openai": {"enabled": false, "api_keys": {}},
    "gemini": {"enabled": false, "api_keys": {}},
    "mistral": {"enabled": false, "api_keys": {}},
    "claude": {"enabled": false, "api_keys": {}},
    "llama": {"enabled": false, "api_keys": {}},
    "deepseek": {"enabled": false, "api_keys": {}}
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policy for user_preferences
DROP POLICY IF EXISTS "Users can only access their own preferences" ON user_preferences;
CREATE POLICY "Users can only access their own preferences" 
  ON user_preferences FOR ALL 
  USING (auth.uid() = user_id);

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

-- User Backups table
CREATE TABLE IF NOT EXISTS user_backups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on user_backups
ALTER TABLE user_backups ENABLE ROW LEVEL SECURITY;

-- Create policy for user_backups
DROP POLICY IF EXISTS "Users can only access their own backups" ON user_backups;
CREATE POLICY "Users can only access their own backups"
  ON user_backups FOR ALL
  USING (auth.uid() = user_id);
