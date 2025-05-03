require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableExists(tableName) {
  try {
    // This query checks if the table exists in the public schema
    const { data, error } = await supabase.rpc('check_table_exists', { 
      table_name: tableName 
    });
    
    if (error) {
      // If RPC doesn't exist, try direct query
      const { data: queryData, error: queryError } = await supabase.from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', tableName);
        
      if (queryError) {
        console.warn(`Could not check if table ${tableName} exists. Assuming it does.`);
        return true;
      }
      
      return queryData && queryData.length > 0;
    }
    
    return data;
  } catch (err) {
    console.warn(`Error checking if table ${tableName} exists:`, err);
    // Assume table exists to be safe
    return true;
  }
}

async function checkColumnExists(tableName, columnName) {
  try {
    // This query checks if the column exists in the specified table
    const { data, error } = await supabase.rpc('check_column_exists', { 
      table_name: tableName,
      column_name: columnName 
    });
    
    if (error) {
      // If RPC doesn't exist, try direct query
      const { data: queryData, error: queryError } = await supabase.from('information_schema.columns')
        .select('column_name')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .eq('column_name', columnName);
        
      if (queryError) {
        console.warn(`Could not check if column ${columnName} in table ${tableName} exists. Assuming it does.`);
        return true;
      }
      
      return queryData && queryData.length > 0;
    }
    
    return data;
  } catch (err) {
    console.warn(`Error checking if column ${columnName} in table ${tableName} exists:`, err);
    // Assume column exists to be safe
    return true;
  }
}

async function migrateApiKeys() {
  console.log('Starting API key migration from api_keys to ai_providers structure...');
  
  try {
    // First check if user_preferences table exists
    const tableExists = await checkTableExists('user_preferences');
    if (!tableExists) {
      console.error('user_preferences table does not exist. Please run the schema creation script first.');
      return;
    }
    
    // Check if ai_providers column exists
    const columnExists = await checkColumnExists('user_preferences', 'ai_providers');
    if (!columnExists) {
      console.error('ai_providers column does not exist in user_preferences table. Please run the schema update script first.');
      return;
    }
    
    // Get all user preferences records
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*');
    
    if (error) {
      throw new Error(`Failed to fetch user preferences: ${error.message}`);
    }
    
    console.log(`Found ${preferences?.length || 0} user preference records to process`);
    
    if (!preferences || preferences.length === 0) {
      console.log('No user preferences found to migrate.');
      return;
    }
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    let alreadyMigratedCount = 0;
    
    // Process each preferences record
    for (const pref of preferences) {
      try {
        // Skip records that don't have api_keys
        if (!pref.api_keys || Object.keys(pref.api_keys).length === 0) {
          skipCount++;
          continue;
        }
        
        // Check if the record already has populated ai_providers
        const hasPopulatedAiProviders = pref.ai_providers && 
          Object.values(pref.ai_providers).some(
            provider => provider.enabled && 
            provider.api_keys && 
            Object.keys(provider.api_keys).length > 0
          );
        
        if (hasPopulatedAiProviders) {
          console.log(`User ${pref.user_id?.slice(0, 8)}... already has migrated ai_providers`);
          alreadyMigratedCount++;
          continue;
        }
        
        // Initialize ai_providers if it doesn't exist or is null
        let aiProviders = pref.ai_providers || {
          "openai": { "enabled": false, "api_keys": {} },
          "gemini": { "enabled": false, "api_keys": {} },
          "mistral": { "enabled": false, "api_keys": {} },
          "claude": { "enabled": false, "api_keys": {} },
          "llama": { "enabled": false, "api_keys": {} },
          "deepseek": { "enabled": false, "api_keys": {} }
        };
        
        // Migrate each API key to the ai_providers structure
        let keysAdded = false;
        Object.entries(pref.api_keys).forEach(([provider, encryptedKey]) => {
          // Skip empty keys
          if (!encryptedKey) return;
          
          // Ensure the provider exists in aiProviders
          if (!aiProviders[provider]) {
            aiProviders[provider] = { "enabled": false, "api_keys": {} };
          }
          
          // Add the key and enable the provider
          aiProviders[provider].enabled = true;
          aiProviders[provider].api_keys = { 
            ...aiProviders[provider].api_keys,
            "default": encryptedKey 
          };
          keysAdded = true;
          
          console.log(`Migrated ${provider} key for user ${pref.user_id?.slice(0, 8) || 'unknown'}...`);
        });
        
        // Skip if no keys were added
        if (!keysAdded) {
          skipCount++;
          continue;
        }
        
        // Update the record with the new ai_providers structure
        const { error: updateError } = await supabase
          .from('user_preferences')
          .update({ ai_providers: aiProviders })
          .eq('id', pref.id);
        
        if (updateError) {
          throw new Error(`Failed to update preferences: ${updateError.message}`);
        }
        
        successCount++;
      } catch (prefError) {
        console.error(`Error processing preference record ${pref.id}:`, prefError);
        errorCount++;
      }
    }
    
    console.log('\nAPI key migration summary:');
    console.log(`- ${successCount} records successfully migrated`);
    console.log(`- ${alreadyMigratedCount} records already migrated (skipped)`);
    console.log(`- ${skipCount} records skipped (no API keys)`);
    console.log(`- ${errorCount} records encountered errors`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateApiKeys()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Unhandled error during migration:', error);
    process.exit(1);
  }); 