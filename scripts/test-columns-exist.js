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

async function testColumnsExist() {
  console.log('🔍 Testing if new columns exist...');
  console.log('=====================================');
  
  try {
    // Test by trying to select the new columns
    console.log('1. Testing column selection...');
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, user_id, full_name, age, gender, profession, organization_name, mobile_number')
      .limit(1);
    
    if (error) {
      if (error.message.includes('profession') || 
          error.message.includes('organization_name') || 
          error.message.includes('mobile_number')) {
        console.log('❌ Missing columns detected:', error.message);
        return false;
      } else {
        console.log('⚠️  Other error (columns might exist):', error.message);
      }
    } else {
      console.log('✅ All columns can be selected successfully!');
      console.log(`   Found ${data.length} profile(s)`);
      if (data.length > 0) {
        console.log('   Sample profile structure:', Object.keys(data[0]));
      }
      return true;
    }
    
    // Test 2: Try to get existing profiles and see their structure
    console.log('\n2. Checking existing profile structure...');
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (profileError) {
      console.log('❌ Could not fetch profiles:', profileError.message);
      return false;
    }
    
    if (profiles.length > 0) {
      const profile = profiles[0];
      console.log('✅ Found existing profile with columns:');
      Object.keys(profile).forEach(key => {
        console.log(`   - ${key}: ${typeof profile[key]} (${profile[key] === null ? 'null' : 'has value'})`);
      });
      
      // Check if new columns exist
      const hasNewColumns = 'profession' in profile && 
                           'organization_name' in profile && 
                           'mobile_number' in profile;
      
      if (hasNewColumns) {
        console.log('\n✅ All new columns are present in the database!');
        return true;
      } else {
        console.log('\n❌ Some new columns are missing:');
        if (!('profession' in profile)) console.log('   - profession: MISSING');
        if (!('organization_name' in profile)) console.log('   - organization_name: MISSING');
        if (!('mobile_number' in profile)) console.log('   - mobile_number: MISSING');
        return false;
      }
    } else {
      console.log('⚠️  No existing profiles found to check structure');
      return null; // Unknown
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    return false;
  }
}

async function testProfileOperations() {
  console.log('\n🧪 Testing profile operations...');
  
  try {
    // Get the first real user from auth.users if any exist
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError || !users.users || users.users.length === 0) {
      console.log('⚠️  No real users found to test with');
      return null;
    }
    
    const testUser = users.users[0];
    console.log(`Using real user for test: ${testUser.id}`);
    
    // Try to get or create a profile for this user
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', testUser.id)
      .maybeSingle();
    
    if (fetchError) {
      console.log('❌ Could not fetch user profile:', fetchError.message);
      return false;
    }
    
    if (existingProfile) {
      console.log('✅ Found existing profile for user');
      console.log('   Profile has new columns:', {
        profession: 'profession' in existingProfile,
        organization_name: 'organization_name' in existingProfile,
        mobile_number: 'mobile_number' in existingProfile
      });
      
      // Try to update with new columns
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          profession: 'Test Profession',
          organization_name: 'Test Organization',
          mobile_number: 1234567890
        })
        .eq('user_id', testUser.id)
        .select('*')
        .single();
      
      if (updateError) {
        console.log('❌ Update with new columns failed:', updateError.message);
        return false;
      } else {
        console.log('✅ Successfully updated profile with new columns!');
        console.log('   Updated values:', {
          profession: updatedProfile.profession,
          organization_name: updatedProfile.organization_name,
          mobile_number: updatedProfile.mobile_number
        });
        return true;
      }
    } else {
      console.log('⚠️  No existing profile found for user');
      return null;
    }
    
  } catch (error) {
    console.log('❌ Profile operations test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing database columns and operations...');
  
  const columnsExist = await testColumnsExist();
  
  if (columnsExist === true) {
    console.log('\n🎉 SUCCESS: All columns exist!');
    
    const operationsWork = await testProfileOperations();
    
    if (operationsWork === true) {
      console.log('\n✅ COMPLETE SUCCESS: Database is fully functional!');
      console.log('   The profile settings page should now work correctly.');
      console.log('   You can now save and update profile data including:');
      console.log('   - Profession');
      console.log('   - Organization Name');
      console.log('   - Mobile Number');
    } else if (operationsWork === null) {
      console.log('\n⚠️  Could not test operations (no users found), but columns exist');
      console.log('   The profile settings page should work when you log in.');
    } else {
      console.log('\n❌ Columns exist but operations failed');
      console.log('   There may be permission or constraint issues.');
    }
  } else if (columnsExist === false) {
    console.log('\n❌ COLUMNS MISSING: You need to run the SQL migration');
    console.log('   Please execute the SQL commands in Supabase SQL Editor');
  } else {
    console.log('\n⚠️  Could not determine column status');
  }
  
  console.log('\n=====================================');
  console.log('🏁 Test completed!');
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
