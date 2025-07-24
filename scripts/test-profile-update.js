#!/usr/bin/env node

/**
 * Test script to verify profile update functionality
 * This script tests the profile save and refresh functionality
 */

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testProfileUpdate() {
  console.log('🧪 Testing Profile Update Functionality');
  console.log('=====================================\n');

  try {
    // First, check if there are any existing users we can use for testing
    console.log('1. Finding existing user for testing...');
    const { data: existingUsers, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    let testUserId;
    let testProfileId = uuidv4();
    let shouldCleanupUser = false;

    if (usersError || !existingUsers || existingUsers.length === 0) {
      console.log('   No existing users found, creating test user...');

      // Create a test user first
      testUserId = uuidv4();
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: `test-${testUserId}@example.com`,
        password: 'testpassword123',
        email_confirm: true
      });

      if (userError) {
        console.error('❌ Failed to create test user:', userError);
        return false;
      }

      testUserId = userData.user.id;
      shouldCleanupUser = true;
      console.log('✅ Test user created:', testUserId);
    } else {
      testUserId = existingUsers[0].id;
      console.log('✅ Using existing user:', testUserId);
    }

    console.log('\n2. Creating test profile...');
    const initialProfile = {
      id: testProfileId,
      user_id: testUserId,
      full_name: 'Test User',
      age: 25,
      gender: 'other',
      profession: 'Software Developer',
      organization_name: 'Test Company',
      mobile_number: 1234567890,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: insertData, error: insertError } = await supabase
      .from('user_profiles')
      .insert(initialProfile)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to create test profile:', insertError);
      return false;
    }

    console.log('✅ Test profile created successfully');
    console.log('   Profile ID:', testProfileId);
    console.log('   User ID:', testUserId);

    // Test profile update
    console.log('\n2. Testing profile update...');
    const updatedData = {
      full_name: 'Test User Updated',
      age: 30,
      profession: 'Senior Software Developer',
      organization_name: 'Updated Company',
      mobile_number: 9876543210,
      updated_at: new Date().toISOString()
    };

    const { data: updateData, error: updateError } = await supabase
      .from('user_profiles')
      .update(updatedData)
      .eq('id', testProfileId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Failed to update test profile:', updateError);
      return false;
    }

    console.log('✅ Profile updated successfully');

    // Test profile retrieval to verify update
    console.log('\n3. Verifying updated data...');
    const { data: retrievedData, error: retrieveError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single();

    if (retrieveError) {
      console.error('❌ Failed to retrieve updated profile:', retrieveError);
      return false;
    }

    // Verify the data matches
    const fieldsToCheck = ['full_name', 'age', 'profession', 'organization_name', 'mobile_number'];
    let allFieldsMatch = true;

    console.log('\n   Field verification:');
    for (const field of fieldsToCheck) {
      const matches = retrievedData[field] === updatedData[field];
      console.log(`   ${field}: ${matches ? '✅' : '❌'} (${retrievedData[field]} ${matches ? '===' : '!=='} ${updatedData[field]})`);
      if (!matches) allFieldsMatch = false;
    }

    if (allFieldsMatch) {
      console.log('\n✅ All fields match - profile update working correctly!');
    } else {
      console.log('\n❌ Some fields don\'t match - there may be an issue with profile updates');
    }

    // Test real-time subscription simulation
    console.log('\n4. Testing real-time update simulation...');
    
    // Simulate another update
    const realtimeUpdate = {
      full_name: 'Real-time Updated User',
      updated_at: new Date().toISOString()
    };

    const { data: realtimeData, error: realtimeError } = await supabase
      .from('user_profiles')
      .update(realtimeUpdate)
      .eq('id', testProfileId)
      .select()
      .single();

    if (realtimeError) {
      console.error('❌ Failed real-time update test:', realtimeError);
    } else {
      console.log('✅ Real-time update simulation successful');
      console.log('   Updated name:', realtimeData.full_name);
    }

    // Cleanup - remove test profile
    console.log('\n5. Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', testProfileId);

    if (deleteError) {
      console.warn('⚠️  Failed to cleanup test profile:', deleteError);
    } else {
      console.log('✅ Test profile cleaned up successfully');
    }

    // Cleanup test user if we created one
    if (shouldCleanupUser) {
      try {
        const { error: userDeleteError } = await supabase.auth.admin.deleteUser(testUserId);
        if (userDeleteError) {
          console.warn('⚠️  Failed to cleanup test user:', userDeleteError);
        } else {
          console.log('✅ Test user cleaned up successfully');
        }
      } catch (error) {
        console.warn('⚠️  Error during user cleanup:', error.message);
      }
    }

    return allFieldsMatch;

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
}

async function main() {
  const success = await testProfileUpdate();
  
  console.log('\n🎯 Test Summary');
  console.log('===============');
  
  if (success) {
    console.log('✅ Profile update functionality is working correctly!');
    console.log('   - Profile creation: ✅');
    console.log('   - Profile updates: ✅');
    console.log('   - Data retrieval: ✅');
    console.log('   - Field verification: ✅');
    console.log('\n💡 Your profile save button should work properly in the UI.');
  } else {
    console.log('❌ Profile update functionality has issues!');
    console.log('   Please check the database schema and permissions.');
  }
  
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testProfileUpdate };
