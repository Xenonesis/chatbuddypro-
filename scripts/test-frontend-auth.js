#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('ERROR: Missing Supabase credentials!');
  process.exit(1);
}

// Create client with anon key (like the frontend uses)
const supabase = createClient(supabaseUrl, anonKey);

async function testFrontendAuth() {
  console.log('🔍 Testing frontend authentication flow...');
  console.log('=====================================');
  
  try {
    // Step 1: Test anonymous access (should be blocked by RLS)
    console.log('1. Testing anonymous access to user_profiles...');
    
    const { data: anonData, error: anonError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (anonError) {
      if (anonError.message.includes('RLS') || 
          anonError.message.includes('policy') || 
          anonError.message.includes('permission')) {
        console.log('✅ RLS is working correctly (anonymous access blocked)');
        console.log('   Error:', anonError.message);
      } else {
        console.log('❌ Unexpected error with anonymous access:', anonError.message);
      }
    } else {
      console.log('⚠️  Anonymous access allowed - RLS might be disabled!');
      console.log(`   Retrieved ${anonData.length} profiles without authentication`);
    }
    
    // Step 2: Check current session
    console.log('\n2. Checking current session...');
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Error getting session:', sessionError.message);
    } else if (session) {
      console.log('✅ Active session found:');
      console.log(`   User ID: ${session.user.id}`);
      console.log(`   Email: ${session.user.email}`);
      console.log(`   Expires: ${new Date(session.expires_at * 1000).toISOString()}`);
      
      // Step 3: Test authenticated access
      console.log('\n3. Testing authenticated access...');
      
      const { data: authData, error: authError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (authError) {
        console.log('❌ Authenticated access failed:', authError.message);
      } else {
        console.log('✅ Authenticated access works');
        console.log(`   Found ${authData.length} profile(s) for authenticated user`);
        if (authData.length > 0) {
          console.log('   Profile data:', authData[0]);
        }
      }
      
      // Step 4: Test profile update
      console.log('\n4. Testing profile update...');
      
      if (authData.length > 0) {
        const testUpdate = {
          updated_at: new Date().toISOString()
        };
        
        const { data: updateData, error: updateError } = await supabase
          .from('user_profiles')
          .update(testUpdate)
          .eq('user_id', session.user.id)
          .select('*');
        
        if (updateError) {
          console.log('❌ Profile update failed:', updateError.message);
        } else {
          console.log('✅ Profile update works');
          console.log('   Updated profile:', updateData[0]);
        }
      } else {
        console.log('   Skipping update test (no profile found)');
      }
      
    } else {
      console.log('❌ No active session found');
      console.log('   User needs to log in to the application');
      
      // Step 3: List available users for testing
      console.log('\n3. Available users for testing:');
      
      // Use service role to list users
      const serviceSupabase = createClient(
        supabaseUrl, 
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          }
        }
      );
      
      const { data: users, error: usersError } = await serviceSupabase.auth.admin.listUsers();
      
      if (usersError) {
        console.log('❌ Cannot list users:', usersError.message);
      } else {
        console.log(`   Found ${users.users.length} registered users:`);
        users.users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} (${user.id})`);
        });
        console.log('\n   To test the frontend:');
        console.log('   1. Open the application in your browser');
        console.log('   2. Sign in with one of the above email addresses');
        console.log('   3. Navigate to Profile Settings');
        console.log('   4. Try to save profile data');
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    console.log('   Full error:', error);
  }
  
  console.log('\n=====================================');
  console.log('🏁 Frontend auth test completed!');
}

async function main() {
  await testFrontendAuth();
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
