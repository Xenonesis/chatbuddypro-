#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function debugProfileSave() {
  console.log('🔍 Debugging profile save issues...');
  console.log('=====================================');
  
  try {
    // Step 1: Check if we can list users
    console.log('1. Checking authentication and users...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('❌ Cannot list users:', usersError.message);
      return;
    }
    
    console.log(`✅ Found ${users.users.length} user(s)`);
    
    if (users.users.length === 0) {
      console.log('❌ No users found! You need to be logged in to save profile data.');
      console.log('   Please sign up or sign in to the application first.');
      return;
    }
    
    const testUser = users.users[0];
    console.log(`   Using user: ${testUser.email} (${testUser.id})`);
    
    // Step 2: Check current profile data
    console.log('\n2. Checking current profile data...');
    const { data: currentProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', testUser.id)
      .maybeSingle();
    
    if (fetchError) {
      console.log('❌ Error fetching profile:', fetchError.message);
      console.log('   Error details:', fetchError);
    } else if (currentProfile) {
      console.log('✅ Found existing profile:');
      console.log('   Profile data:', currentProfile);
    } else {
      console.log('⚠️  No profile found for this user');
    }
    
    // Step 3: Test creating/updating profile
    console.log('\n3. Testing profile save operation...');
    
    const testProfileData = {
      full_name: 'Test User Updated',
      age: 30,
      gender: 'other',
      profession: 'Software Engineer',
      organization_name: 'Tech Company',
      mobile_number: 9876543210
    };
    
    if (currentProfile) {
      // Update existing profile
      console.log('   Updating existing profile...');
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          ...testProfileData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', testUser.id)
        .select('*')
        .single();
      
      if (updateError) {
        console.log('❌ Update failed:', updateError.message);
        console.log('   Error details:', updateError);
        
        // Check if it's a column issue
        if (updateError.message.includes('column') && 
            (updateError.message.includes('profession') || 
             updateError.message.includes('organization_name') || 
             updateError.message.includes('mobile_number'))) {
          console.log('   🚨 COLUMN MISSING: The database columns were not properly added!');
          console.log('   You need to run the SQL migration again.');
        }
      } else {
        console.log('✅ Profile updated successfully!');
        console.log('   Updated data:', updatedProfile);
      }
    } else {
      // Create new profile
      console.log('   Creating new profile...');
      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: testUser.id,
          ...testProfileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();
      
      if (insertError) {
        console.log('❌ Insert failed:', insertError.message);
        console.log('   Error details:', insertError);
        
        // Check if it's a column issue
        if (insertError.message.includes('column') && 
            (insertError.message.includes('profession') || 
             insertError.message.includes('organization_name') || 
             insertError.message.includes('mobile_number'))) {
          console.log('   🚨 COLUMN MISSING: The database columns were not properly added!');
          console.log('   You need to run the SQL migration again.');
        }
      } else {
        console.log('✅ Profile created successfully!');
        console.log('   New profile data:', newProfile);
      }
    }
    
    // Step 4: Check RLS policies
    console.log('\n4. Checking Row Level Security policies...');
    
    // Test with anon key (like the frontend uses)
    const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // Try to query as anonymous user
    const { data: anonData, error: anonError } = await anonSupabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (anonError) {
      if (anonError.message.includes('RLS') || anonError.message.includes('policy')) {
        console.log('✅ RLS is working (anonymous access blocked)');
      } else {
        console.log('❌ Unexpected error with anon access:', anonError.message);
      }
    } else {
      console.log('⚠️  Anonymous access allowed (RLS might be disabled)');
    }
    
    // Step 5: Test with authenticated user simulation
    console.log('\n5. Testing authenticated access...');
    
    // This simulates what happens when a user is logged in
    const { data: authTest, error: authError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', testUser.id);
    
    if (authError) {
      console.log('❌ Authenticated access failed:', authError.message);
    } else {
      console.log('✅ Authenticated access works');
      console.log(`   Found ${authTest.length} profile(s) for user`);
    }
    
  } catch (error) {
    console.log('❌ Debug failed with error:', error.message);
    console.log('   Full error:', error);
  }
  
  console.log('\n=====================================');
  console.log('🏁 Debug completed!');
  console.log('\nNext steps:');
  console.log('1. Check browser console for JavaScript errors');
  console.log('2. Verify you are logged in to the application');
  console.log('3. Check network tab for failed API requests');
}

async function main() {
  await debugProfileSave();
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
