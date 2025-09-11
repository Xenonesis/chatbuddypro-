'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ModelSettings } from '@/lib/context/ModelSettingsContext';
import { realtimeSettingsService } from '@/lib/services/realtimeSettingsService';

interface UseRealtimeSettingsProps {
  onSettingsUpdate: (settings: ModelSettings) => void;
  onApiKeysUpdate: (apiKeys: Record<string, string>) => void;
}

export function useRealtimeSettings({ onSettingsUpdate, onApiKeysUpdate }: UseRealtimeSettingsProps) {
  const { user } = useAuth();
  const cleanupRef = useRef<(() => void) | null>(null);
  const callbacksRef = useRef({ onSettingsUpdate, onApiKeysUpdate });
  
  // Update callbacks ref without causing re-subscription
  useEffect(() => {
    callbacksRef.current = { onSettingsUpdate, onApiKeysUpdate };
  }, [onSettingsUpdate, onApiKeysUpdate]);

  const handleRealtimeUpdate = useCallback(async (data: any) => {
    console.log('Real-time settings update received:', data);
    
    if (!user?.id) return;

    try {
      // Handle settings updates
      if (data.preferences?.settings) {
        console.log('Settings updated in real-time');
        callbacksRef.current.onSettingsUpdate(data.preferences.settings);
      }

      // Handle API keys updates
      if (data.ai_providers || data.api_keys) {
        console.log('API keys updated in real-time');
        const apiKeys: Record<string, string> = {};
        
        // Process ai_providers structure
        if (data.ai_providers) {
          for (const [provider, providerInfo] of Object.entries(data.ai_providers)) {
            if (providerInfo?.api_keys?.default) {
              try {
                const { decryptApiKey } = await import('@/lib/supabase');
                const decryptedKey = await decryptApiKey(providerInfo.api_keys.default, user.id);
                apiKeys[provider] = decryptedKey;
              } catch (error) {
                console.error(`Error decrypting API key for ${provider}:`, error);
              }
            }
          }
        }
        
        // Process legacy api_keys structure
        if (data.api_keys && Object.keys(apiKeys).length === 0) {
          for (const [provider, encryptedKey] of Object.entries(data.api_keys)) {
            try {
              const { decryptApiKey } = await import('@/lib/supabase');
              const decryptedKey = await decryptApiKey(encryptedKey as string, user.id);
              apiKeys[provider] = decryptedKey;
            } catch (error) {
              console.error(`Error decrypting legacy API key for ${provider}:`, error);
            }
          }
        }
        
        if (Object.keys(apiKeys).length > 0) {
          callbacksRef.current.onApiKeysUpdate(apiKeys);
        }
      }
    } catch (error) {
      console.error('Error processing real-time settings update:', error);
    }
  }, [user?.id]); // Only depend on user ID

  useEffect(() => {
    if (!user?.id) {
      // Clean up existing subscription if user logs out
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      return;
    }

    console.log('Setting up real-time subscription for settings updates');
    
    // Subscribe to real-time updates using the service
    const cleanup = realtimeSettingsService.subscribeToSettingsChanges(
      user.id,
      handleRealtimeUpdate
    );

    cleanupRef.current = cleanup;

    // Cleanup subscription on unmount or user change
    return () => {
      console.log('Cleaning up real-time settings subscription');
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [user?.id, handleRealtimeUpdate]);

  // Return cleanup function for manual cleanup if needed
  return useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
  }, []);
}