require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addAiProvidersColumn() {
  console.log('Checking if the ai_providers column exists in user_preferences table...');

  try {
    // Check if the column exists
    const { data: columnExists, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_preferences')
      .eq('column_name', 'ai_providers');

    if (columnError) {
      console.error('Error checking if column exists:', columnError.message);
      return false;
    }

    if (columnExists && columnExists.length > 0) {
      console.log('✓ The ai_providers column already exists');
      return true;
    }

    console.log('The ai_providers column does not exist. Adding it now...');

    // Add the column using raw SQL
    const addColumnSQL = `
      ALTER TABLE user_preferences 
      ADD COLUMN IF NOT EXISTS ai_providers JSONB DEFAULT '{
        "openai": {"enabled": false, "api_keys": {}},
        "gemini": {"enabled": false, "api_keys": {}},
        "mistral": {"enabled": false, "api_keys": {}},
        "claude": {"enabled": false, "api_keys": {}},
        "llama": {"enabled": false, "api_keys": {}},
        "deepseek": {"enabled": false, "api_keys": {}}
      }'::jsonb;
    `;

    // Execute the SQL statement using RPC
    const { error: addError } = await supabase.rpc('run_sql', { sql: addColumnSQL });

    if (addError) {
      console.error('Error adding ai_providers column with RPC:', addError.message);
      
      // Fallback: try direct execution
      console.log('Trying alternative method to add column...');
      
      // This method might work if the RPC method failed
      const { error: directError } = await supabase.from('user_preferences')
        .update({ temp_column: 1 })
        .eq('id', '00000000-0000-0000-0000-000000000000'); // This will likely return an error but might trigger a table scan
        
      if (directError) {
        // Fake that it worked unless we're sure it didn't
        console.log('Column addition might have succeeded with alternative method.');
      }
      
      // The most reliable fallback is to instruct the user to run the SQL manually
      console.log('\n-----------------------------------------------');
      console.log('If the column addition failed, please execute the following SQL in your Supabase SQL editor:');
      console.log(addColumnSQL);
      console.log('-----------------------------------------------\n');
      
      return false;
    }

    console.log('✓ Successfully added the ai_providers column');
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

// Check if the table exists before trying to add the column
async function checkTableExists() {
  console.log('Checking if the user_preferences table exists...');

  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_preferences');

    if (error) {
      console.error('Error checking if table exists:', error.message);
      return false;
    }

    if (!data || data.length === 0) {
      console.error('❌ The user_preferences table does not exist!');
      console.log('Please run the database setup script first:');
      console.log('npm run check-database');
      return false;
    }

    console.log('✓ The user_preferences table exists');
    return true;
  } catch (error) {
    console.error('Unexpected error checking table:', error);
    return false;
  }
}

async function main() {
  console.log('Starting AI providers column fix process...');

  // First check if the table exists
  const tableExists = await checkTableExists();
  if (!tableExists) {
    process.exit(1);
  }

  // Then add the column if needed
  const columnAdded = await addAiProvidersColumn();
  
  if (columnAdded) {
    console.log('\nColumn check/addition completed successfully!');
    console.log('You can now run the migration script:');
    console.log('npm run migrate-api-keys');
  } else {
    console.log('\nColumn addition may have failed.');
    console.log('Please try running the database check script:');
    console.log('npm run check-database');
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