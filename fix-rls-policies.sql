-- Fix Row Level Security (RLS) policies for user_profiles table
-- Run this in Supabase SQL Editor

-- First, check current RLS status
SELECT schemaname, tablename, rowsecurity, hasrls 
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

-- Create RLS policies for user_profiles

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy 4: Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Verify RLS is enabled and policies are created
SELECT schemaname, tablename, rowsecurity, hasrls 
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Check the policies
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Test that anonymous access is now blocked
-- This should return no rows when run as anonymous user
SELECT COUNT(*) as should_be_zero_for_anon FROM user_profiles;
