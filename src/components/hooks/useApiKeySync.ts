'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { userService } from '@/lib/services/userService';

/**
 * Hook that syncs API keys between localStorage and database
 * @returns object with sync status and manual sync function
 */
export function useApiKeySync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const user = useUser();
  const supabase = useSupabaseClient();

  // Function to trigger sync manually
  const syncApiKeys = async () => {
    if (!user?.id) {
      setSyncError('Cannot sync API keys: User not logged in');
      return false;
    }

    setIsSyncing(true);
    setSyncError(null);
    
    try {
      const success = await userService.syncApiKeys(user.id);
      setLastSynced(new Date());
      return success;
    } catch (error) {
      console.error('Error in API key sync:', error);
      setSyncError(error instanceof Error ? error.message : 'Unknown error during sync');
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-sync when user logs in
  useEffect(() => {
    if (user?.id) {
      // Sync on user login (with error handling)
      syncApiKeys().catch(error => {
        console.error('Error during initial API key sync:', error);
      });
      
      // Add listener for auth changes
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.id) {
          console.log('User signed in, syncing API keys');
          syncApiKeys().catch(error => {
            console.error('Error during auth state change API key sync:', error);
          });
        }
      });
      
      // Cleanup listener on unmount
      return () => {
        authListener?.subscription.unsubscribe();
      };
    }
  }, [user?.id]);

  return {
    isSyncing,
    lastSynced,
    syncError,
    syncApiKeys, // Expose for manual sync
  };
}

export default useApiKeySync; 