-- Add missing columns to user_profiles table
-- This migration adds profession, organization_name, and mobile_number columns

-- Add profession column if it doesn't exist
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS profession TEXT;

-- Add organization_name column if it doesn't exist
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS organization_name TEXT;

-- Add mobile_number column if it doesn't exist
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS mobile_number BIGINT;

-- Update the gender constraint to match UI values
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_gender_check;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_gender_check
CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.profession IS 'User profession or job title';
COMMENT ON COLUMN user_profiles.organization_name IS 'User organization or company name';
COMMENT ON COLUMN user_profiles.mobile_number IS 'User mobile phone number';