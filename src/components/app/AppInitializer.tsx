'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModelSettings } from '@/lib/context/ModelSettingsContext';
import { chatCleanupService } from '@/lib/services/chatCleanupService';

export function AppInitializer() {
  const { user } = useAuth();
  const { settings, updateLastCleanupDate } = useModelSettings();

  useEffect(() => {
    // Minimal initialization to avoid React errors
    console.log('App initialized');

    // Only add the JS class, skip error handling override
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('js-ready');
    }
  }, []);

  // Run chat cleanup when user is authenticated and has auto-deletion enabled
  useEffect(() => {
    if (!user?.id || !settings.chatManagementSettings.autoDeleteEnabled) {
      return;
    }

    const runCleanup = async () => {
      try {
        const lastCleanup = settings.chatManagementSettings.lastCleanupDate;
        const now = new Date();

        // Only run cleanup if it hasn't been run in the last 24 hours
        if (lastCleanup) {
          const lastCleanupDate = new Date(lastCleanup);
          const hoursSinceLastCleanup = (now.getTime() - lastCleanupDate.getTime()) / (1000 * 60 * 60);

          if (hoursSinceLastCleanup < 24) {
            console.log('Chat cleanup skipped - ran recently');
            return;
          }
        }

        console.log('Running automatic chat cleanup...');
        const result = await chatCleanupService.cleanupUserChats(
          user.id,
          settings.chatManagementSettings.retentionPeriodDays
        );

        if (result.success && result.deletedChatsCount > 0) {
          console.log(`Cleanup completed: deleted ${result.deletedChatsCount} chats and ${result.deletedMessagesCount} messages`);

          // Update the last cleanup date in settings
          updateLastCleanupDate(now.toISOString());
        }
      } catch (error) {
        console.error('Error during automatic cleanup:', error);
      }
    };

    // Run cleanup after a short delay to avoid blocking app initialization
    const timeoutId = setTimeout(runCleanup, 5000);

    return () => clearTimeout(timeoutId);
  }, [user?.id, settings.chatManagementSettings, updateLastCleanupDate]);

  return null;
}