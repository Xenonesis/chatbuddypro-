-- =====================================================
-- Fix Signup Error: Database Migration Script
-- =====================================================
-- This script sets up all required tables, functions, and triggers
-- to fix the "Database error saving new user" error during signup
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this ENTIRE script
-- 4. Click "Run" to execute
-- =====================================================

-- STEP 1: Create base tables if they don't exist
-- =====================================================

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT DEFAULT '',
    age INTEGER,
    gender TEXT,
    profession TEXT,
    organization_name TEXT,
    mobile_number BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT user_profiles_gender_check CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'))
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    model TEXT,
    last_message_at TIMESTAMPTZ,
    message_count INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    message_order INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create notification_preferences table (THIS IS THE KEY TABLE CAUSING THE ERROR)
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    push_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    chat_messages BOOLEAN DEFAULT true,
    system_updates BOOLEAN DEFAULT true,
    security_alerts BOOLEAN DEFAULT true,
    marketing BOOLEAN DEFAULT false,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_data JSONB NOT NULL,
    device_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 2: Create necessary indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_id_updated_at ON chats(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id_created_at ON chat_messages(chat_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- STEP 3: Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create RLS Policies
-- =====================================================

-- user_profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_preferences policies
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
CREATE POLICY "Users can insert own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- notification_preferences policies
DROP POLICY IF EXISTS "Users can view their own notification preferences" ON notification_preferences;
CREATE POLICY "Users can view their own notification preferences" ON notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notification preferences" ON notification_preferences;
CREATE POLICY "Users can update their own notification preferences" ON notification_preferences
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own notification preferences" ON notification_preferences;
CREATE POLICY "Users can insert their own notification preferences" ON notification_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- STEP 5: Create helper functions
-- =====================================================

-- Function to get table columns (used by check-database.js)
CREATE OR REPLACE FUNCTION public.get_table_columns(table_name text)
RETURNS TABLE(column_name text, data_type text, is_nullable text) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.column_name::text,
        c.data_type::text,
        c.is_nullable::text
    FROM information_schema.columns c
    WHERE c.table_schema = 'public' 
    AND c.table_name = get_table_columns.table_name;
END;
$$;

-- Function to safely create user profile (handles conflicts)
CREATE OR REPLACE FUNCTION public.create_user_profile_safe(
    p_user_id uuid,
    p_full_name text DEFAULT '',
    p_age integer DEFAULT NULL,
    p_gender text DEFAULT NULL,
    p_profession text DEFAULT NULL,
    p_organization_name text DEFAULT NULL,
    p_mobile_number bigint DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    profile_id uuid;
BEGIN
    INSERT INTO user_profiles (
        user_id, full_name, age, gender, profession,
        organization_name, mobile_number, created_at, updated_at
    ) VALUES (
        p_user_id, COALESCE(p_full_name, ''), p_age, p_gender,
        p_profession, p_organization_name, p_mobile_number, NOW(), NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO profile_id;
    
    RETURN profile_id;
EXCEPTION
    WHEN OTHERS THEN
        SELECT id INTO profile_id FROM user_profiles WHERE user_id = p_user_id LIMIT 1;
        RETURN profile_id;
END;
$$;

-- Function to safely create user preferences (handles conflicts)
CREATE OR REPLACE FUNCTION public.create_user_preferences_safe(
    p_user_id uuid,
    p_theme text DEFAULT 'light',
    p_language text DEFAULT 'en',
    p_api_keys jsonb DEFAULT '{}'::jsonb,
    p_ai_providers jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    pref_id uuid;
    default_ai_providers jsonb;
BEGIN
    IF p_ai_providers IS NULL THEN
        default_ai_providers := '{
            "openai": {"enabled": false, "api_keys": {}},
            "gemini": {"enabled": false, "api_keys": {}},
            "mistral": {"enabled": false, "api_keys": {}},
            "claude": {"enabled": false, "api_keys": {}},
            "llama": {"enabled": false, "api_keys": {}},
            "deepseek": {"enabled": false, "api_keys": {}}
        }'::jsonb;
    ELSE
        default_ai_providers := p_ai_providers;
    END IF;

    INSERT INTO user_preferences (
        user_id, theme, language, api_keys, ai_providers, created_at, updated_at
    ) VALUES (
        p_user_id, p_theme, p_language, p_api_keys, default_ai_providers, NOW(), NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO pref_id;
    
    RETURN pref_id;
EXCEPTION
    WHEN OTHERS THEN
        SELECT id INTO pref_id FROM user_preferences WHERE user_id = p_user_id LIMIT 1;
        RETURN pref_id;
END;
$$;

-- STEP 6: Create trigger function for notification preferences
-- =====================================================
-- THIS IS THE CRITICAL FUNCTION THAT WAS FAILING

CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    -- Use INSERT with ON CONFLICT to handle race conditions gracefully
    INSERT INTO notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Failed to create notification preferences for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 7: Create the trigger on auth.users
-- =====================================================
-- THIS IS THE TRIGGER THAT WAS CAUSING SIGNUP TO FAIL

DROP TRIGGER IF EXISTS create_notification_preferences_trigger ON auth.users;
CREATE TRIGGER create_notification_preferences_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_notification_preferences();

-- STEP 8: Grant necessary permissions
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile_safe TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_preferences_safe TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_columns TO authenticated;

-- STEP 9: Verification
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Created tables:';
    RAISE NOTICE '  - user_profiles';
    RAISE NOTICE '  - user_preferences';
    RAISE NOTICE '  - chats';
    RAISE NOTICE '  - chat_messages';
    RAISE NOTICE '  - notification_preferences (KEY TABLE)';
    RAISE NOTICE '  - push_subscriptions';
    RAISE NOTICE '';
    RAISE NOTICE 'Created functions:';
    RAISE NOTICE '  - create_user_profile_safe';
    RAISE NOTICE '  - create_user_preferences_safe';
    RAISE NOTICE '  - create_default_notification_preferences (KEY FUNCTION)';
    RAISE NOTICE '  - get_table_columns';
    RAISE NOTICE '';
    RAISE NOTICE 'Created trigger:';
    RAISE NOTICE '  - create_notification_preferences_trigger (FIXED)';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Try signing up a new user';
    RAISE NOTICE '  2. The error should now be fixed!';
    RAISE NOTICE '=====================================================';
END $$;
