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

async function executeSQL(sql, description) {
  console.log(`\n🔧 ${description}...`);
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // If exec_sql doesn't exist, try direct query
      console.log(`   ⚠️  exec_sql function not available, trying direct execution...`);
      
      // For ALTER TABLE commands, we need to use a different approach
      if (sql.includes('ALTER TABLE')) {
        console.log(`   ❌ Cannot execute ALTER TABLE directly through Supabase client`);
        return false;
      }
      
      const result = await supabase.from('_').select('*').limit(0);
      console.log(`   ❌ Failed: ${error.message}`);
      return false;
    }
    
    console.log(`   ✅ Success: ${description}`);
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function checkTableStructure() {
  console.log('\n📋 Checking current table structure...');
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'user_profiles')
      .eq('table_schema', 'public')
      .order('ordinal_position');
    
    if (error) {
      console.log('   ❌ Could not check table structure:', error.message);
      return null;
    }
    
    console.log('   ✅ Current columns:');
    data.forEach(col => {
      console.log(`      - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    return data;
  } catch (error) {
    console.log('   ❌ Error checking table structure:', error.message);
    return null;
  }
}

async function testInsertOperation() {
  console.log('\n🧪 Testing insert operation with new columns...');
  
  const testUserId = '00000000-0000-0000-0000-000000000001';
  
  try {
    // Clean up any existing test data
    await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', testUserId);
    
    // Test insert with all columns
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
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(testProfile)
      .select('*')
      .single();
    
    if (error) {
      console.log(`   ❌ Insert failed: ${error.message}`);
      console.log(`   📝 Error details:`, error);
      return false;
    }
    
    console.log('   ✅ Insert successful!');
    console.log('   📄 Inserted data:', data);
    
    // Clean up test data
    await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', testUserId);
    
    console.log('   🧹 Test data cleaned up');
    return true;
    
  } catch (error) {
    console.log(`   ❌ Test failed: ${error.message}`);
    return false;
  }
}

async function manualColumnAddition() {
  console.log('\n🔨 Attempting manual column addition...');
  
  // Since we can't execute ALTER TABLE through Supabase client,
  // let's try to detect if columns exist by attempting an insert
  const testUserId = '00000000-0000-0000-0000-000000000002';
  
  try {
    // Try inserting with new columns to see which ones fail
    const testData = {
      user_id: testUserId,
      full_name: 'Column Test',
      profession: 'Test Profession',
      organization_name: 'Test Organization',
      mobile_number: 9876543210
    };
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(testData)
      .select('*')
      .single();
    
    if (error) {
      if (error.message.includes('profession') || 
          error.message.includes('organization_name') || 
          error.message.includes('mobile_number')) {
        console.log('   ❌ Missing columns detected in error:', error.message);
        return false;
      } else {
        console.log('   ⚠️  Different error occurred:', error.message);
        return false;
      }
    }
    
    console.log('   ✅ All columns exist and working!');
    
    // Clean up
    await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', testUserId);
    
    return true;
    
  } catch (error) {
    console.log(`   ❌ Manual test failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting comprehensive database fix...');
  console.log('=====================================');
  
  // Step 1: Check current table structure
  const currentStructure = await checkTableStructure();
  
  // Step 2: Test if columns already exist
  const columnsExist = await manualColumnAddition();
  
  if (columnsExist) {
    console.log('\n🎉 All columns already exist! Testing full functionality...');
    const testResult = await testInsertOperation();
    
    if (testResult) {
      console.log('\n✅ Database is fully functional!');
      console.log('   The profile settings page should now work correctly.');
    } else {
      console.log('\n❌ Database has issues that need manual fixing.');
    }
  } else {
    console.log('\n❌ Missing columns detected!');
    console.log('\n📋 MANUAL ACTION REQUIRED:');
    console.log('   You need to run the following SQL commands in Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/oybdzbyqormgynyjwyyc/sql');
    console.log('');
    console.log('   Copy and paste this SQL:');
    console.log('   ----------------------------------------');
    console.log('   ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profession TEXT;');
    console.log('   ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS organization_name TEXT;');
    console.log('   ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS mobile_number BIGINT;');
    console.log('   ');
    console.log('   ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_gender_check;');
    console.log('   ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_gender_check');
    console.log('   CHECK (gender IN (\'male\', \'female\', \'other\', \'prefer_not_to_say\'));');
    console.log('   ----------------------------------------');
  }
  
  console.log('\n=====================================');
  console.log('🏁 Database fix process completed!');
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
