require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment variables:');
console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('SERVICE_KEY:', supabaseServiceKey ? 'Set' : 'Not set');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('\nTesting connection to Supabase...');
    
    // Try to query the user_profiles table
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Error querying user_profiles:', error);
      
      if (error.code === '42P01') {
        console.log('\nTable user_profiles does not exist. This is the source of your 404 error.');
        console.log('You need to create the database schema in your Supabase project.');
        return false;
      }
    } else {
      console.log('✓ user_profiles table exists and is accessible');
      return true;
    }
  } catch (err) {
    console.error('Connection test failed:', err);
    return false;
  }
}

async function createUserProfilesTable() {
  try {
    console.log('\nAttempting to create user_profiles table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        full_name TEXT,
        age INTEGER,
        gender TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      
      -- Enable RLS (Row Level Security) on user_profiles
      ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
      
      -- Create policy for user_profiles
      DROP POLICY IF EXISTS "Users can only access their own profiles" ON user_profiles;
      CREATE POLICY "Users can only access their own profiles" 
        ON user_profiles FOR ALL 
        USING (auth.uid() = user_id);
    `;
    
    const { error } = await supabase.rpc('exec', { sql: createTableSQL });
    
    if (error) {
      console.error('Error creating table:', error);
      return false;
    }
    
    console.log('✓ user_profiles table created successfully');
    return true;
  } catch (err) {
    console.error('Error creating table:', err);
    return false;
  }
}

async function main() {
  const connectionWorks = await testConnection();
  
  if (!connectionWorks) {
    console.log('\nAttempting to create the missing table...');
    const tableCreated = await createUserProfilesTable();
    
    if (tableCreated) {
      console.log('\nTesting connection again...');
      await testConnection();
    }
  }
  
  console.log('\n=== SUMMARY ===');
  console.log('The 404 error you\'re seeing is because the user_profiles table doesn\'t exist in your Supabase database.');
  console.log('To fix this, you need to run your database schema in Supabase.');
  console.log('\nRecommended steps:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Open your project: oybdzbyqormgynyjwyyc');
  console.log('3. Go to SQL Editor');
  console.log('4. Copy and paste the contents of supabase_schema.sql');
  console.log('5. Run the SQL to create all tables');
}

main().catch(console.error);
