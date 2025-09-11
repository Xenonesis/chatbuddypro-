// Script to clean up duplicate user preferences
// Run with: node scripts/cleanup-duplicates.js
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials!');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓' : '✗');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Initializing Supabase client...');

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test connection by checking if we can access the database
async function testConnection() {
  console.log('Testing database connection...');
  try {
    // Try a simple query to test connection
    const { count, error } = await supabase
      .from('user_preferences')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error testing connection:', error);
      return false;
    }
    
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Exception during connection test:', error);
    return false;
  }
}

// Check for duplicate records in user_preferences
async function checkForDuplicates() {
  try {
    console.log('Checking for duplicate user_preferences records...');
    
    // First get all user_preferences records
    const { data, error } = await supabase
      .from('user_preferences')
      .select('id, user_id, updated_at');
    
    if (error) {
      console.error('Error fetching user_preferences:', error);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('No user_preferences records found');
      return { 
        hasDuplicates: false,
        records: [] 
      };
    }
    
    console.log(`Found ${data.length} total user_preferences records`);
    
    // Group by user_id
    const userGroups = {};
    data.forEach(record => {
      if (!userGroups[record.user_id]) {
        userGroups[record.user_id] = [];
      }
      userGroups[record.user_id].push(record);
    });
    
    // Find users with multiple records
    const usersWithDuplicates = [];
    Object.entries(userGroups).forEach(([userId, records]) => {
      if (records.length > 1) {
        usersWithDuplicates.push({
          userId,
          recordCount: records.length,
          records
        });
      }
    });
    
    const hasDuplicates = usersWithDuplicates.length > 0;
    console.log(hasDuplicates 
      ? `Found ${usersWithDuplicates.length} users with duplicate records` 
      : 'No duplicate records found');
      
    if (hasDuplicates) {
      usersWithDuplicates.forEach(user => {
        console.log(`User ${user.userId} has ${user.recordCount} records`);
      });
    }
    
    return {
      hasDuplicates,
      duplicates: usersWithDuplicates,
      allRecords: data
    };
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return { 
      hasDuplicates: false,
      error: error.message 
    };
  }
}

// Delete duplicate records, keeping only the most recent one for each user
async function deleteDuplicateRecords() {
  try {
    console.log('Checking for duplicates before deletion...');
    const { hasDuplicates, duplicates } = await checkForDuplicates();
    
    if (!hasDuplicates) {
      console.log('No duplicates to delete');
      return true;
    }
    
    console.log(`Found ${duplicates.length} users with duplicate records to clean up`);
    
    let successCount = 0;
    let deletedCount = 0;
    
    for (const user of duplicates) {
      console.log(`Processing user ${user.userId} with ${user.records.length} records`);
      
      // Sort records by updated_at (most recent first)
      const sortedRecords = [...user.records].sort((a, b) => {
        return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
      });
      
      // Keep the most recent record
      const [mostRecent, ...toDelete] = sortedRecords;
      
      console.log(`Keeping most recent record ${mostRecent.id}, deleting ${toDelete.length} others`);
      
      let userSuccess = true;
      
      // Delete each duplicate
      for (const record of toDelete) {
        try {
          console.log(`  Deleting record ${record.id}`);
          const { error } = await supabase
            .from('user_preferences')
            .delete()
            .eq('id', record.id);
            
          if (error) {
            console.error(`  Error deleting record ${record.id}:`, error);
            userSuccess = false;
          } else {
            console.log(`  Successfully deleted record ${record.id}`);
            deletedCount++;
          }
        } catch (err) {
          console.error(`  Exception deleting record ${record.id}:`, err);
          userSuccess = false;
        }
      }
      
      if (userSuccess) {
        successCount++;
      }
    }
    
    console.log(`=== DELETION SUMMARY ===`);
    console.log(`Users with duplicates: ${duplicates.length}`);
    console.log(`Users successfully cleaned: ${successCount}`);
    console.log(`Total records deleted: ${deletedCount}`);
    
    return successCount === duplicates.length;
  } catch (error) {
    console.error('Error in deleteDuplicateRecords:', error);
    return false;
  }
}

// Main function
async function main() {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Failed to connect to the database');
      return false;
    }
    
    // Delete duplicate records if any exist
    const success = await deleteDuplicateRecords();
    
    return success;
  } catch (error) {
    console.error('Error in main:', error);
    return false;
  }
}

// Run the main function
main()
  .then(success => {
    console.log(success ? 'Cleanup completed successfully' : 'Cleanup completed with errors');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  }); 