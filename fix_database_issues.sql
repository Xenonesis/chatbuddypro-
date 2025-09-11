-- Fix Database Issues for ChatBuddy
-- This script addresses the database errors causing signup failures

-- 1. Create missing database functions
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

-- 2. Clean up duplicate user profiles
-- First, let's identify and keep only the most recent profile for each user
WITH ranked_profiles AS (
    SELECT 
        id,
        user_id,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC, created_at DESC) as rn
    FROM user_profiles
),
profiles_to_delete AS (
    SELECT id 
    FROM ranked_profiles 
    WHERE rn > 1
)
DELETE FROM user_profiles 
WHERE id IN (SELECT id FROM profiles_to_delete);

-- 3. Add unique constraint to prevent future duplicates
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_user_id_unique;

ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);

-- 4. Create or replace function to safely create user profile
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
    -- Try to insert, but handle conflicts gracefully
    INSERT INTO user_profiles (
        user_id,
        full_name,
        age,
        gender,
        profession,
        organization_name,
        mobile_number,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        COALESCE(p_full_name, ''),
        p_age,
        p_gender,
        p_profession,
        p_organization_name,
        p_mobile_number,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        updated_at = NOW()
    RETURNING id INTO profile_id;
    
    RETURN profile_id;
EXCEPTION
    WHEN OTHERS THEN
        -- If there's still an error, try to get existing profile
        SELECT id INTO profile_id 
        FROM user_profiles 
        WHERE user_id = p_user_id 
        LIMIT 1;
        
        RETURN profile_id;
END;
$$;

-- 5. Create or replace function to safely create user preferences
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
    -- Set default AI providers if not provided
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

    -- Try to insert, but handle conflicts gracefully
    INSERT INTO user_preferences (
        user_id,
        theme,
        language,
        api_keys,
        ai_providers,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        p_theme,
        p_language,
        p_api_keys,
        default_ai_providers,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        updated_at = NOW()
    RETURNING id INTO pref_id;
    
    RETURN pref_id;
EXCEPTION
    WHEN OTHERS THEN
        -- If there's still an error, try to get existing preferences
        SELECT id INTO pref_id 
        FROM user_preferences 
        WHERE user_id = p_user_id 
        LIMIT 1;
        
        RETURN pref_id;
END;
$$;

-- 6. Ensure RLS policies are properly set
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.create_user_profile_safe TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_preferences_safe TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_columns TO authenticated;

-- 8. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- 9. Add comments for documentation
COMMENT ON FUNCTION public.create_user_profile_safe IS 'Safely creates a user profile, handling conflicts gracefully';
COMMENT ON FUNCTION public.create_user_preferences_safe IS 'Safely creates user preferences, handling conflicts gracefully';
COMMENT ON FUNCTION public.get_table_columns IS 'Returns column information for a given table';

-- 10. Verify the fixes by checking for remaining duplicates
DO $$
DECLARE
    duplicate_count integer;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT user_id, COUNT(*) as profile_count
        FROM user_profiles
        GROUP BY user_id
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF duplicate_count > 0 THEN
        RAISE NOTICE 'Warning: Still found % users with duplicate profiles', duplicate_count;
    ELSE
        RAISE NOTICE 'Success: No duplicate profiles found';
    END IF;
END $$;