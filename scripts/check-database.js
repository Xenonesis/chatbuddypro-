require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Expected tables and their required columns
const expectedSchema = {
  'user_profiles': ['id', 'user_id', 'full_name', 'created_at', 'updated_at'],
  'user_preferences': ['id', 'user_id', 'theme', 'language', 'api_keys', 'ai_providers', 'created_at', 'updated_at'],
  'chats': ['id', 'user_id', 'title', 'model', 'created_at', 'updated_at'],
  'chat_messages': ['id', 'chat_id', 'user_id', 'role', 'content', 'created_at'],
  'user_backups': ['id', 'user_id', 'data', 'created_at']
};

// Helper functions
async function checkConnection() {
  try {
    console.log('Checking database connection...');
    const { data: connData, error: connError } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (connError) {
      console.error('Connection test failed:', connError.message);
      return false;
    }
    
    console.log('Database connection successful ✓');
    return true;
  } catch (error) {
    console.error('Connection test error:', error.message);
    return false;
  }
}

async function checkTablesExist() {
  try {
    console.log('\nChecking if required tables exist...');
    
    const tables = Object.keys(expectedSchema);
    const tableCheckResults = {};
    let allTablesExist = true;
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);
        if (error && error.code === '42P01') {
          console.error(`❌ Table '${table}' does not exist`);
          tableCheckResults[table] = false;
          allTablesExist = false;
        } else {
          console.log(`✓ Table '${table}' exists`);
          tableCheckResults[table] = true;
        }
      } catch (tableErr) {
        console.error(`Error checking table '${table}':`, tableErr.message);
        tableCheckResults[table] = false;
        allTablesExist = false;
      }
    }
    
    return { allTablesExist, tableCheckResults };
  } catch (error) {
    console.error('Error checking tables:', error.message);
    return { allTablesExist: false, tableCheckResults: {} };
  }
}

async function checkColumns(tableCheckResults) {
  try {
    console.log('\nChecking if required columns exist in each table...');
    
    const tables = Object.keys(expectedSchema).filter(table => tableCheckResults[table]);
    const columnCheckResults = {};
    let allColumnsExist = true;
    
    for (const table of tables) {
      const columns = expectedSchema[table];
      columnCheckResults[table] = {};
      
      // Get column information
      const { data, error } = await supabase.rpc('get_table_columns', { table_name: table });
      
      if (error) {
        console.error(`Error getting columns for table '${table}':`, error.message);
        columns.forEach(col => {
          columnCheckResults[table][col] = false;
        });
        allColumnsExist = false;
        continue;
      }
      
      const existingColumns = data || [];
      const columnNames = existingColumns.map(col => col.column_name);
      
      // Check each expected column
      for (const column of columns) {
        const exists = columnNames.includes(column);
        columnCheckResults[table][column] = exists;
        
        if (!exists) {
          console.error(`❌ Column '${column}' missing from table '${table}'`);
          allColumnsExist = false;
        } else {
          console.log(`✓ Column '${column}' exists in table '${table}'`);
        }
      }
    }
    
    return { allColumnsExist, columnCheckResults };
  } catch (error) {
    console.error('Error checking columns:', error.message);
    return { allColumnsExist: false, columnCheckResults: {} };
  }
}

async function runRepair(tableCheckResults, columnCheckResults) {
  console.log('\nAttempting to repair database issues...');

  try {
    // Load the schema SQL file
    const schemaPath = path.join(process.cwd(), 'supabase_schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.error('Schema file not found at:', schemaPath);
      return false;
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Loaded schema SQL file');

    // Execute the schema SQL to create/fix tables and columns
    const { error } = await supabase.rpc('run_sql', { sql: schemaSql });
    
    if (error) {
      console.error('Error running schema SQL:', error.message);
      
      // If the RPC function doesn't exist or fails, we'll try to fix the most critical tables directly
      console.log('Falling back to direct table creation for critical tables...');
      
      // Check if user_preferences table needs to be created
      if (!tableCheckResults['user_preferences']) {
        console.log('Creating user_preferences table...');
        await supabase.rpc('run_sql', {
          sql: `
          CREATE TABLE IF NOT EXISTS user_preferences (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            theme VARCHAR(20) DEFAULT 'light',
            language VARCHAR(10) DEFAULT 'en',
            api_keys JSONB DEFAULT '{}'::jsonb,
            ai_providers JSONB DEFAULT '{
              "openai": {"enabled": false, "api_keys": {}},
              "gemini": {"enabled": false, "api_keys": {}},
              "mistral": {"enabled": false, "api_keys": {}},
              "claude": {"enabled": false, "api_keys": {}},
              "llama": {"enabled": false, "api_keys": {}},
              "deepseek": {"enabled": false, "api_keys": {}}
            }'::jsonb,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );`
        });
      }
      
      // Add ai_providers column if it's missing
      if (tableCheckResults['user_preferences'] && 
          columnCheckResults['user_preferences'] && 
          !columnCheckResults['user_preferences']['ai_providers']) {
        console.log('Adding ai_providers column to user_preferences table...');
        await supabase.rpc('run_sql', {
          sql: `
          ALTER TABLE user_preferences 
          ADD COLUMN IF NOT EXISTS ai_providers JSONB DEFAULT '{
            "openai": {"enabled": false, "api_keys": {}},
            "gemini": {"enabled": false, "api_keys": {}},
            "mistral": {"enabled": false, "api_keys": {}},
            "claude": {"enabled": false, "api_keys": {}},
            "llama": {"enabled": false, "api_keys": {}},
            "deepseek": {"enabled": false, "api_keys": {}}
          }'::jsonb;`
        });
      }
      
      return false;
    }
    
    console.log('Database schema has been repaired successfully');
    return true;
  } catch (error) {
    console.error('Error repairing database:', error.message);
    return false;
  }
}

async function runMigration() {
  console.log('\nRunning API keys migration...');
  
  try {
    // Check if migration function exists in the database
    const { data: fnExists, error: fnError } = await supabase.rpc('function_exists', {
      function_name: 'migrate_api_keys_to_ai_providers'
    });
    
    if (fnError || !fnExists) {
      console.log('Migration function does not exist in database, using JavaScript implementation');
      
      // Run the JS migration function
      const migrationPath = path.join(process.cwd(), 'scripts', 'migrate-api-keys.js');
      if (!fs.existsSync(migrationPath)) {
        console.error('Migration script not found at:', migrationPath);
        return false;
      }
      
      // Execute the migration script directly
      require('./migrate-api-keys');
      return true;
    }
    
    // Run the SQL migration function
    const { error: migrationError } = await supabase.rpc('migrate_api_keys_to_ai_providers');
    
    if (migrationError) {
      console.error('Error running migration function:', migrationError.message);
      return false;
    }
    
    console.log('Migration completed successfully');
    return true;
  } catch (error) {
    console.error('Error running migration:', error.message);
    return false;
  }
}

async function checkDatabaseHealth() {
  // Check connection first
  const connectionOk = await checkConnection();
  if (!connectionOk) {
    console.error('\nCannot proceed with database checks due to connection issues');
    process.exit(1);
  }
  
  // Check tables
  const { allTablesExist, tableCheckResults } = await checkTablesExist();
  
  // Check columns
  const { allColumnsExist, columnCheckResults } = await checkColumns(tableCheckResults);
  
  // Determine if repair is needed
  const needsRepair = !allTablesExist || !allColumnsExist;
  
  console.log('\nDatabase Health Check Summary:');
  console.log('-----------------------------');
  console.log(`Connection: ${connectionOk ? '✓' : '❌'}`);
  console.log(`All Required Tables Exist: ${allTablesExist ? '✓' : '❌'}`);
  console.log(`All Required Columns Exist: ${allColumnsExist ? '✓' : '❌'}`);
  console.log(`Database Needs Repair: ${needsRepair ? 'YES' : 'NO'}`);
  
  // Attempt repair if needed
  if (needsRepair) {
    console.log('\nDatabase requires repair. Attempting to fix issues...');
    const repairSuccessful = await runRepair(tableCheckResults, columnCheckResults);
    console.log(`Repair ${repairSuccessful ? 'completed successfully' : 'had some issues'}`);
  }
  
  // Run migration regardless (it will check if already migrated)
  await runMigration();
  
  return {
    connectionOk,
    allTablesExist,
    allColumnsExist,
    needsRepair
  };
}

// Execute the health check
checkDatabaseHealth()
  .then(result => {
    if (result.needsRepair) {
      console.log('\nDatabase check and repair completed. Please run this script again to verify all issues have been fixed.');
    } else {
      console.log('\nDatabase is healthy and ready to use!');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('\nFatal error during database health check:', error);
    process.exit(1);
  }); 