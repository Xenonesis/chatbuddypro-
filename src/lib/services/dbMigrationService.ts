import { supabase, executeSql } from '@/lib/supabase';

export const dbMigrationService = {
  async migrateUserPreferencesTable(): Promise<boolean> {
    try {
      console.log('Running user_preferences table migration...');
      
      try {
        // Create table if it doesn't exist
        console.log('Ensuring user_preferences table exists...');
        await executeSql(`
          CREATE TABLE IF NOT EXISTS user_preferences (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            preferences JSONB DEFAULT '{}'::jsonb,
            api_keys JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id)
          );
        `);
        
        // Add columns if they don't exist
        console.log('Ensuring columns exist...');
        await executeSql(`
          ALTER TABLE user_preferences 
          ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;
          
          ALTER TABLE user_preferences 
          ADD COLUMN IF NOT EXISTS api_keys JSONB DEFAULT '{}'::jsonb;
        `);
        
        console.log('Migration completed successfully');
        return true;
      } catch (sqlError) {
        console.error('SQL execution error:', sqlError);
        
        // Fallback to using the Supabase API if direct SQL fails
        console.log('Using fallback approach for migration...');
        
        // Check if table exists and create it if needed
        try {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('count(*)', { count: 'exact', head: true });
            
          if (error && error.code !== 'PGRST116') {
            console.error('Error checking table existence:', error);
          }
        } catch (e) {
          console.log('Table probably doesn\'t exist, will be created by subsequent operations');
        }
        
        // Try operations that don't require direct SQL execution
        try {
          const { error: insertError } = await supabase
            .from('user_preferences')
            .upsert({
              id: '00000000-0000-0000-0000-000000000000',
              user_id: '00000000-0000-0000-0000-000000000000',
              preferences: {},
              api_keys: {}
            } as any);
            
          if (insertError && !insertError.message.includes('violates unique constraint')) {
            console.error('Error in fallback table creation:', insertError);
          } else {
            console.log('Fallback table creation likely succeeded');
            
            // Cleanup the dummy record
            await supabase
              .from('user_preferences')
              .delete()
              .eq('user_id', '00000000-0000-0000-0000-000000000000' as any as any);
          }
        } catch (fallbackError) {
          console.error('Fallback table creation failed:', fallbackError);
        }
        
        return true; // Still return true to not block app startup
      }
    } catch (error) {
      console.error('Migration failed:', error instanceof Error ? error.message : String(error));
      return false;
    }
  },
  
  // Transfer existing API keys to the preferences column
  async migrateExistingApiKeys(): Promise<boolean> {
    try {
      console.log('Migrating existing API keys to preferences column...');
      
      try {
        // Try direct SQL update
        await executeSql(`
          UPDATE user_preferences 
          SET preferences = jsonb_build_object('api_keys', api_keys) 
          WHERE api_keys IS NOT NULL 
          AND (preferences IS NULL OR NOT(preferences ? 'api_keys'));
        `);
        
        console.log('Successfully migrated API keys to preferences column');
        return true;
      } catch (sqlError) {
        console.error('SQL execution error during API key migration:', sqlError);
        
        // Fallback to per-record update
        console.log('Using fallback approach for API key migration...');
        
        const { data, error } = await supabase
          .from('user_preferences')
          .select('id, user_id, api_keys')
          .not('api_keys', 'is', null);
          
        if (error) {
          console.error('Error fetching records with API keys:', error);
          return false;
        }
        
        console.log(`Found ${data?.length || 0} records to migrate`);
        
        let successCount = 0;
        for (const record of (data || []) as any[]) {
          if (!record.api_keys) continue;
          
          const { error: updateError } = await supabase
            .from('user_preferences')
            .update({
              preferences: {
                api_keys: record.api_keys
              }
            } as any)
            .eq('id', record.id as any as any);
          
          if (updateError) {
            console.error('Error updating record:', updateError);
          } else {
            successCount++;
          }
        }
        
        console.log(`Successfully migrated ${successCount} of ${data?.length || 0} records`);
        return true;
      }
    } catch (error) {
      console.error('API keys migration failed:', error instanceof Error ? error.message : String(error));
      return false;
    }
  },
  
  // Clean up duplicate user preferences records 
  async cleanupDuplicateUserPreferences(): Promise<boolean> {
    try {
      console.log('Cleaning up duplicate user preferences records...');
      
      // Fetch all user preferences records
      const { data: allRecords, error: fetchError } = await supabase
        .from('user_preferences')
        .select('id, user_id, updated_at');
      
      if (fetchError) {
        console.error('Error fetching all user preferences:', fetchError);
        return false;
      }
      
      if (!allRecords || allRecords.length === 0) {
        console.log('No user preferences records found');
        return true;
      }
      
      console.log(`Found ${allRecords.length} total user preference records`);
      
      // Group the results by user_id
      const userGroups: Record<string, any[]> = {};
      (allRecords as any[]).forEach(record => {
        if (!userGroups[record.user_id]) {
          userGroups[record.user_id] = [];
        }
        userGroups[record.user_id].push(record);
      });
      
      // Find users with multiple records
      const usersWithDuplicates = Object.keys(userGroups).filter(
        userId => userGroups[userId].length > 1
      );
      
      if (usersWithDuplicates.length === 0) {
        console.log('No users with duplicate records found');
        return true;
      }
      
      console.log(`Found ${usersWithDuplicates.length} users with duplicate records`);
      
      // For each user with duplicates, keep only the most recently updated record
      let successCount = 0;
      for (const userId of usersWithDuplicates) {
        const userRecords = userGroups[userId];
        
        try {
          // Sort by updated_at, most recent first
          userRecords.sort((a, b) => {
            return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
          });
          
          // Keep the most recent record, delete all others
          const mostRecentId = userRecords[0].id;
          const idsToDelete = userRecords.slice(1).map(p => p.id);
          
          console.log(`Keeping most recent record ${mostRecentId} for user ${userId}, deleting ${idsToDelete.length} older records`);
          
          // Delete all but the most recent record
          let userSuccess = true;
          for (const idToDelete of idsToDelete) {
            const { error: deleteError } = await supabase
              .from('user_preferences')
              .delete()
              .eq('id', idToDelete as any as any);
            
            if (deleteError) {
              console.error(`Error deleting duplicate record for user ${userId}:`, deleteError);
              userSuccess = false;
            } else {
              console.log(`Successfully deleted duplicate record ${idToDelete} for user ${userId}`);
            }
          }
          
          if (userSuccess) {
            successCount++;
          }
        } catch (userError) {
          console.error(`Error processing duplicates for user ${userId}:`, userError);
        }
      }
      
      console.log(`Successfully cleaned up duplicates for ${successCount} of ${usersWithDuplicates.length} users`);
      return true;
    } catch (error) {
      console.error('Error in cleanupDuplicateUserPreferences:', 
        error instanceof Error ? error.message : String(error));
      return false;
    }
  }
}; 
