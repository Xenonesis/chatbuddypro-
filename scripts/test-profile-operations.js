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

async function testDatabaseOperations() {
  console.log('🧪 Testing database operations...');
  console.log('=====================================');
  
  try {
    // Test 1: Check table structure
    console.log('1. Checking user_profiles table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'user_profiles')
      .eq('table_schema', 'public');
    
    if (columnsError) {
      console.log('❌ Could not check table structure:', columnsError.message);
    } else {
      console.log('✅ Table structure:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
    // Test 2: Check if we can query the table
    console.log('\n2. Testing table access...');
    const { data: profiles, error: queryError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (queryError) {
      console.log('❌ Cannot query user_profiles table:', queryError.message);
      console.log('Error details:', queryError);
    } else {
      console.log('✅ Can query user_profiles table');
      console.log(`   Found ${profiles.length} profile(s)`);
    }
    
    // Test 3: Test insert operation (with a test user ID)
    console.log('\n3. Testing insert operation...');
    const testUserId = '00000000-0000-0000-0000-000000000001'; // Test UUID
    
    // First, clean up any existing test data
    await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', testUserId);
    
    const testProfile = {
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
      .insert(testProfile)
      .select('*')
      .single();
    
    if (insertError) {
      console.log('❌ Insert operation failed:', insertError.message);
      console.log('Error details:', insertError);
    } else {
      console.log('✅ Insert operation successful');
      console.log('   Inserted profile:', insertData);
      
      // Test 4: Test update operation
      console.log('\n4. Testing update operation...');
      const { data: updateData, error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          profession: 'Senior Software Developer',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', testUserId)
        .select('*')
        .single();
      
      if (updateError) {
        console.log('❌ Update operation failed:', updateError.message);
        console.log('Error details:', updateError);
      } else {
        console.log('✅ Update operation successful');
        console.log('   Updated profile:', updateData);
      }
      
      // Clean up test data
      await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', testUserId);
      
      console.log('✅ Test data cleaned up');
    }
    
    // Test 5: Check RLS policies
    console.log('\n5. Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'user_profiles');
    
    if (policiesError) {
      console.log('❌ Could not check RLS policies:', policiesError.message);
    } else {
      console.log('✅ RLS policies found:');
      policies.forEach(policy => {
        console.log(`   - ${policy.policyname}: ${policy.cmd} (${policy.permissive})`);
      });
    }
    
    console.log('\n=====================================');
    console.log('🎉 Database operations test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

async function main() {
  await testDatabaseOperations();
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
