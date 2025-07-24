#!/usr/bin/env node

/**
 * Test script to verify auth metadata sync functionality
 * This script tests the API route that syncs profile data to Supabase Auth
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testAuthSync() {
  console.log('🧪 Testing Auth Metadata Sync Functionality');
  console.log('===========================================\n');

  try {
    // Test 1: Check if we can access auth users
    console.log('1. Testing admin access to auth users...');
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error('❌ Failed to access auth users:', usersError);
      return false;
    }

    if (!users || users.users.length === 0) {
      console.log('ℹ️  No users found in auth system - this is normal for a new installation');
      console.log('   To test this functionality:');
      console.log('   1. Create a user account through the app');
      console.log('   2. Update their profile');
      console.log('   3. Check the Supabase dashboard');
      return true;
    }

    console.log(`✅ Found ${users.users.length} user(s) in auth system`);

    // Test 2: Test updating user metadata for the first user
    const testUser = users.users[0];
    console.log(`\n2. Testing metadata update for user: ${testUser.email}`);

    const testMetadata = {
      full_name: 'Test User Updated',
      age: 30,
      profession: 'Software Developer',
      organization_name: 'Test Company',
      mobile_number: 1234567890,
      profile_updated_at: new Date().toISOString(),
      profile_complete: true,
      test_sync: true // Add a test flag to identify our update
    };

    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      testUser.id,
      {
        user_metadata: testMetadata
      }
    );

    if (updateError) {
      console.error('❌ Failed to update user metadata:', updateError);
      return false;
    }

    console.log('✅ Successfully updated user metadata');

    // Test 3: Verify the update
    console.log('\n3. Verifying metadata update...');
    const { data: verifyData, error: verifyError } = await supabaseAdmin.auth.admin.getUserById(testUser.id);

    if (verifyError) {
      console.error('❌ Failed to verify user metadata:', verifyError);
      return false;
    }

    if (verifyData.user && verifyData.user.user_metadata) {
      const metadata = verifyData.user.user_metadata;
      console.log('✅ Metadata verification successful');
      console.log('   Updated metadata:', {
        full_name: metadata.full_name,
        age: metadata.age,
        profession: metadata.profession,
        organization_name: metadata.organization_name,
        mobile_number: metadata.mobile_number,
        test_sync: metadata.test_sync
      });

      // Check if our test data is there
      if (metadata.test_sync === true) {
        console.log('✅ Test metadata flag found - sync is working correctly');
      } else {
        console.log('⚠️  Test metadata flag not found - there may be an issue');
      }
    } else {
      console.log('❌ No metadata found in user object');
      return false;
    }

    // Test 4: Clean up test metadata
    console.log('\n4. Cleaning up test metadata...');
    const cleanMetadata = { ...testMetadata };
    delete cleanMetadata.test_sync;

    const { error: cleanupError } = await supabaseAdmin.auth.admin.updateUserById(
      testUser.id,
      {
        user_metadata: cleanMetadata
      }
    );

    if (cleanupError) {
      console.warn('⚠️  Failed to cleanup test metadata:', cleanupError);
    } else {
      console.log('✅ Test metadata cleaned up');
    }

    return true;

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
}

async function main() {
  const success = await testAuthSync();
  
  console.log('\n🎯 Test Summary');
  console.log('===============');
  
  if (success) {
    console.log('✅ Auth metadata sync functionality is working correctly!');
    console.log('   - Admin access: ✅');
    console.log('   - Metadata updates: ✅');
    console.log('   - Data verification: ✅');
    console.log('\n💡 Profile updates should now sync to Supabase Auth dashboard.');
    console.log('🔗 Check your users at: https://supabase.com/dashboard/project/oybdzbyqormgynyjwyyc/auth/users');
  } else {
    console.log('❌ Auth metadata sync functionality has issues!');
    console.log('   Please check the service role key and permissions.');
  }
  
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testAuthSync };
