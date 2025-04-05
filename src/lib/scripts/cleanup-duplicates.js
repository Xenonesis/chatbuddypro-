// Script to clean up duplicate user preferences
// Run with: node src/lib/scripts/cleanup-duplicates.js

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupDuplicateUserPreferences() {
  try {
    console.log('Cleaning up duplicate user preferences records...');
    
    // First identify all users with duplicate records
    const { data: duplicateData, error: queryError } = await supabase
      .from('user_preferences')
      .select('user_id, count(*)')
      .group('user_id')
      .having('count(*)', 'gt', 1);
    
    if (queryError) {
      console.error('Error identifying users with duplicate records:', queryError);
      return false;
    }
    
    if (!duplicateData || duplicateData.length === 0) {
      console.log('No users with duplicate preferences records found');
      return true;
    }
    
    console.log(`Found ${duplicateData.length} users with duplicate records`);
    
    // For each user with duplicates, keep only the most recently updated record
    let successCount = 0;
    for (const userRecord of duplicateData) {
      const userId = userRecord.user_id;
      
      try {
        // Get all preference records for this user, sorted by updated_at
        const { data: userPrefs, error: userPrefsError } = await supabase
          .from('user_preferences')
          .select('id, updated_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });
          
        if (userPrefsError || !userPrefs || userPrefs.length <= 1) {
          console.error(`Error fetching preferences for user ${userId}:`, userPrefsError);
          continue;
        }
        
        // Keep the most recent record, delete all others
        const mostRecentId = userPrefs[0].id;
        const idsToDelete = userPrefs.slice(1).map(p => p.id);
        
        console.log(`Keeping most recent record ${mostRecentId} for user ${userId}, deleting ${idsToDelete.length} older records`);
        
        if (idsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('user_preferences')
            .delete()
            .in('id', idsToDelete);
            
          if (deleteError) {
            console.error(`Error deleting duplicate records for user ${userId}:`, deleteError);
          } else {
            successCount++;
          }
        }
      } catch (userError) {
        console.error(`Error processing duplicates for user ${userId}:`, userError);
      }
    }
    
    console.log(`Successfully cleaned up duplicates for ${successCount} of ${duplicateData.length} users`);
    return true;
  } catch (error) {
    console.error('Error in cleanupDuplicateUserPreferences:', 
      error instanceof Error ? error.message : String(error));
    return false;
  }
}

// Execute the cleanup function
cleanupDuplicateUserPreferences()
  .then(() => {
    console.log('Cleanup completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }); 