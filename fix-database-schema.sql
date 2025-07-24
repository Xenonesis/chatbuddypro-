-- Fix user_profiles table schema
-- This script will add missing columns and fix constraints

-- First, check current table structure
\echo 'Current user_profiles table structure:'
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
\echo 'Adding missing columns...'

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS profession TEXT;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS organization_name TEXT;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS mobile_number BIGINT;

-- Update the gender constraint to match UI values
\echo 'Updating gender constraint...'

ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_gender_check;

ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_gender_check 
CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));

-- Verify the changes
\echo 'Updated user_profiles table structure:'
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test insert to verify all columns work
\echo 'Testing insert operation...'

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
  '00000000-0000-0000-0000-000000000001',
  'Test User',
  25,
  'other',
  'Software Developer',
  'Test Company',
  1234567890,
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  age = EXCLUDED.age,
  gender = EXCLUDED.gender,
  profession = EXCLUDED.profession,
  organization_name = EXCLUDED.organization_name,
  mobile_number = EXCLUDED.mobile_number,
  updated_at = NOW();

\echo 'Test insert successful!'

-- Clean up test data
DELETE FROM user_profiles WHERE user_id = '00000000-0000-0000-0000-000000000001';

\echo 'Database schema fix completed successfully!'
