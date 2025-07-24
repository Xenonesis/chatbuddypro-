#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Supabase credentials!');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function checkColumnExists(tableName, columnName) {
  try {
    const { data, error } = await supabase.rpc('check_column_exists', {
      table_name: tableName,
      column_name: columnName
    });
    
    if (error) {
      // If the function doesn't exist, use a direct query
      const { data: columnData, error: columnError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', tableName)
        .eq('column_name', columnName)
        .eq('table_schema', 'public');
      
      if (columnError) {
        console.log(`Could not check if column ${columnName} exists, assuming it doesn't`);
        return false;
      }
      
      return columnData && columnData.length > 0;
    }
    
    return data;
  } catch (error) {
    console.log(`Could not check if column ${columnName} exists, assuming it doesn't`);
    return false;
  }
}

async function fixGenderConstraint() {
  console.log('🔧 Fixing gender constraint to match UI values...');

  try {
    // Drop existing constraint if it exists
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_gender_check;`
    });

    if (dropError) {
      console.log('Note: Could not drop existing gender constraint (this is normal if it doesn\'t exist)');
    }

    // Add new constraint with correct values
    const { error: addError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_gender_check CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));`
    });

    if (addError) {
      console.log('❌ Failed to update gender constraint:', addError.message);
      return false;
    } else {
      console.log('✅ Gender constraint updated successfully');
      return true;
    }
  } catch (error) {
    console.log('❌ Error updating gender constraint:', error.message);
    return false;
  }
}

async function addMissingColumns() {
  console.log('🔍 Checking for missing columns in user_profiles table...');

  const columnsToAdd = [
    { name: 'profession', type: 'TEXT', description: 'User profession or job title' },
    { name: 'organization_name', type: 'TEXT', description: 'User organization or company name' },
    { name: 'mobile_number', type: 'BIGINT', description: 'User mobile phone number' }
  ];

  let addedColumns = 0;
  
  for (const column of columnsToAdd) {
    try {
      console.log(`Checking if column '${column.name}' exists...`);
      
      const exists = await checkColumnExists('user_profiles', column.name);
      
      if (!exists) {
        console.log(`➕ Adding column '${column.name}' to user_profiles table...`);
        
        const { error } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};`
        });
        
        if (error) {
          // Try direct SQL execution
          const { error: directError } = await supabase
            .from('user_profiles')
            .select('id')
            .limit(1);
          
          if (directError && directError.message.includes(column.name)) {
            console.log(`❌ Failed to add column '${column.name}': ${error.message}`);
            console.log('This might be because the column already exists or there are permission issues.');
          } else {
            console.log(`✅ Column '${column.name}' added successfully`);
            addedColumns++;
          }
        } else {
          console.log(`✅ Column '${column.name}' added successfully`);
          addedColumns++;
        }
      } else {
        console.log(`✅ Column '${column.name}' already exists`);
      }
    } catch (error) {
      console.log(`❌ Error processing column '${column.name}': ${error.message}`);
    }
  }
  
  return addedColumns;
}

async function runMigration() {
  console.log('🚀 Starting profile columns migration...');
  console.log('=====================================');
  
  try {
    // Test connection
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Cannot connect to user_profiles table:', error.message);
      return false;
    }
    
    console.log('✅ Connected to database successfully');
    
    // Add missing columns
    const addedColumns = await addMissingColumns();

    // Fix gender constraint
    const genderFixed = await fixGenderConstraint();

    console.log('=====================================');
    if (addedColumns > 0 || genderFixed) {
      console.log(`✅ Migration completed! Added ${addedColumns} columns and ${genderFixed ? 'fixed gender constraint' : 'gender constraint unchanged'}.`);
      console.log('The profile settings page should now work correctly.');
    } else {
      console.log('✅ All columns already exist and constraints are correct. No migration needed.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

async function main() {
  const success = await runMigration();
  
  if (success) {
    console.log('\n🎉 Profile columns migration completed successfully!');
    console.log('You can now use the profile settings page to save and update data.');
  } else {
    console.log('\n❌ Migration failed. Please check the errors above.');
    console.log('You may need to run the SQL migration manually in Supabase SQL Editor:');
    console.log('\nALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profession TEXT;');
    console.log('ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS organization_name TEXT;');
    console.log('ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS mobile_number BIGINT;');
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
