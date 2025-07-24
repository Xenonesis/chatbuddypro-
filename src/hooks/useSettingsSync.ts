'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ModelSettings } from '@/lib/context/ModelSettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/lib/services/userService';

interface UseSettingsSyncOptions {
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export function useSettingsSync(
  settings: ModelSettings,
  updateSettings: (settings: ModelSettings) => void,
  options: UseSettingsSyncOptions = {}
) {
  const { autoSave = false, autoSaveDelay = 2000 } = options;
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSettingsRef = useRef<ModelSettings>(settings);

  // Track changes to settings
  useEffect(() => {
    const settingsChanged = JSON.stringify(settings) !== JSON.stringify(lastSettingsRef.current);
    
    if (settingsChanged) {
      setHasUnsavedChanges(true);
      lastSettingsRef.current = settings;
      
      // Auto-save if enabled
      if (autoSave && user) {
        // Clear existing timeout
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        
        // Set new timeout for auto-save
        autoSaveTimeoutRef.current = setTimeout(() => {
          syncSettings();
        }, autoSaveDelay);
      }
    }
  }, [settings, autoSave, autoSaveDelay, user]);

  const syncSettings = useCallback(async () => {
    if (!user?.id) {
      setSyncError('User not authenticated');
      return false;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      // Use real-time service for immediate database update
      const { realtimeSettingsService } = await import('@/lib/services/realtimeSettingsService');
      const success = await realtimeSettingsService.updateSettingsRealtime(user.id, settings);
      
      if (success) {
        // Also update through the context for localStorage
        updateSettings(settings);
        
        setHasUnsavedChanges(false);
        setLastSyncTime(new Date());
        setIsSyncing(false);
        
        return true;
      } else {
        throw new Error('Failed to sync settings to database');
      }
    } catch (error) {
      console.error('Error syncing settings:', error);
      setSyncError(error instanceof Error ? error.message : 'Failed to sync settings');
      setIsSyncing(false);
      return false;
    }
  }, [settings, updateSettings, user?.id]);

  const forceSyncFromDatabase = useCallback(async () => {
    if (!user?.id) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      // Use real-time service to get latest settings
      const { realtimeSettingsService } = await import('@/lib/services/realtimeSettingsService');
      const latestSettings = await realtimeSettingsService.getLatestSettings(user.id);
      
      if (latestSettings?.preferences?.settings) {
        updateSettings(latestSettings.preferences.settings);
        setHasUnsavedChanges(false);
        setLastSyncTime(new Date());
      } else {
        // Fallback to userService if real-time service fails
        const preferences = await userService.getUserPreferences(user.id);
        
        if (preferences?.preferences?.settings) {
          updateSettings(preferences.preferences.settings);
          setHasUnsavedChanges(false);
          setLastSyncTime(new Date());
        }
      }
      
      setIsSyncing(false);
    } catch (error) {
      console.error('Error force syncing from database:', error);
      setSyncError('Failed to sync from database');
      setIsSyncing(false);
    }
  }, [user?.id, updateSettings]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    isSyncing,
    lastSyncTime,
    syncError,
    hasUnsavedChanges,
    syncSettings,
    forceSyncFromDatabase,
    clearSyncError: () => setSyncError(null)
  };
}