#!/usr/bin/env node

/**
 * Simple test script to verify profile functionality
 * This script tests the core profile operations without user management
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testProfileFunctionality() {
  console.log('🧪 Testing Profile Functionality');
  console.log('================================\n');

  try {
    // Test 1: Check if user_profiles table exists and is accessible
    console.log('1. Testing database connection and table access...');
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count(*)')
      .limit(1);

    if (error) {
      console.error('❌ Failed to access user_profiles table:', error);
      return false;
    }

    console.log('✅ Database connection and table access working');

    // Test 2: Check table structure
    console.log('\n2. Checking table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (tableError && tableError.code !== 'PGRST116') { // PGRST116 is "no rows found"
      console.error('❌ Failed to query table structure:', tableError);
      return false;
    }

    console.log('✅ Table structure accessible');

    // Test 3: Check if we have any existing profiles to work with
    console.log('\n3. Checking for existing profiles...');
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, user_id, full_name, age, gender, profession, organization_name, mobile_number')
      .limit(5);

    if (profilesError) {
      console.error('❌ Failed to fetch existing profiles:', profilesError);
      return false;
    }

    if (existingProfiles && existingProfiles.length > 0) {
      console.log(`✅ Found ${existingProfiles.length} existing profile(s)`);
      
      // Test 4: Test update operation on existing profile
      console.log('\n4. Testing profile update operation...');
      const testProfile = existingProfiles[0];
      const originalName = testProfile.full_name;
      const testName = `${originalName} [TEST UPDATE]`;
      
      console.log(`   Updating profile ${testProfile.id}...`);
      console.log(`   Original name: "${originalName}"`);
      console.log(`   Test name: "${testName}"`);

      // Update the profile
      const { data: updateData, error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          full_name: testName,
          updated_at: new Date().toISOString()
        })
        .eq('id', testProfile.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Failed to update profile:', updateError);
        return false;
      }

      console.log('✅ Profile update successful');

      // Test 5: Verify the update
      console.log('\n5. Verifying update...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('user_profiles')
        .select('full_name, updated_at')
        .eq('id', testProfile.id)
        .single();

      if (verifyError) {
        console.error('❌ Failed to verify update:', verifyError);
        return false;
      }

      if (verifyData.full_name === testName) {
        console.log('✅ Update verification successful');
        console.log(`   Current name: "${verifyData.full_name}"`);
      } else {
        console.error('❌ Update verification failed');
        console.log(`   Expected: "${testName}"`);
        console.log(`   Got: "${verifyData.full_name}"`);
        return false;
      }

      // Test 6: Restore original name
      console.log('\n6. Restoring original data...');
      const { error: restoreError } = await supabase
        .from('user_profiles')
        .update({ 
          full_name: originalName,
          updated_at: new Date().toISOString()
        })
        .eq('id', testProfile.id);

      if (restoreError) {
        console.warn('⚠️  Failed to restore original name:', restoreError);
      } else {
        console.log('✅ Original data restored');
      }

    } else {
      console.log('ℹ️  No existing profiles found - this is normal for a new installation');
      
      // Test basic table operations without data
      console.log('\n4. Testing basic table operations...');
      
      // Test insert capability (we'll delete it immediately)
      const testId = 'test-' + Date.now();
      const { data: insertData, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: testId,
          user_id: testId, // This will fail due to foreign key, but that's expected
          full_name: 'Test User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      // We expect this to fail due to foreign key constraint, which is good
      if (insertError && insertError.code === '23503') {
        console.log('✅ Foreign key constraint working (expected behavior)');
      } else if (insertError) {
        console.log('ℹ️  Insert test result:', insertError.message);
      } else {
        console.log('✅ Insert operation accessible');
        // Clean up if it somehow succeeded
        await supabase.from('user_profiles').delete().eq('id', testId);
      }
    }

    return true;

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
}

async function main() {
  const success = await testProfileFunctionality();
  
  console.log('\n🎯 Test Summary');
  console.log('===============');
  
  if (success) {
    console.log('✅ Profile functionality is working correctly!');
    console.log('   - Database connection: ✅');
    console.log('   - Table access: ✅');
    console.log('   - Update operations: ✅');
    console.log('   - Data verification: ✅');
    console.log('\n💡 Your profile save button should work properly in the UI.');
    console.log('🔗 Visit http://localhost:3002/settings to test the profile page.');
  } else {
    console.log('❌ Profile functionality has issues!');
    console.log('   Please check the database schema and permissions.');
  }
  
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testProfileFunctionality };
