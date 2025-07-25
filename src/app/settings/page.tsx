"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useModelSettings, ModelSettings, AIProvider, ChatMode } from '@/lib/context/ModelSettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Sliders, RefreshCw, AlertCircle } from 'lucide-react';
import ProviderSettings from '@/components/settings/ProviderSettings';
import ChatSettings from '@/components/settings/ChatSettings';
import SuggestionsSettings from '@/components/settings/SuggestionsSettings';
import VoiceInputSettings from '@/components/settings/VoiceInputSettings';
import ProfileSettings from '@/components/settings/ProfileSettings';
import { RealtimeStatusIndicator } from '@/components/settings/RealtimeStatusIndicator';
import { useSettingsSync } from '@/hooks/useSettingsSync';
import { AutoSyncBanner } from '@/components/ui/AutoSyncIndicator';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function SettingsPage() {
  const { settings, updateSettings, getDefaultSettings } = useModelSettings();
  const { user } = useAuth();
  const [localSettings, setLocalSettings] = useState<ModelSettings>(settings);

  // Use the settings sync hook for real-time updates with faster auto-sync
  const {
    isSyncing,
    lastSyncTime,
    syncError,
    hasUnsavedChanges,
    syncSettings,
    forceSyncFromDatabase,
    clearSyncError
  } = useSettingsSync(localSettings, updateSettings, {
    autoSave: true,
    autoSaveDelay: 500 // Even faster auto-sync for better UX
  });

  useEffect(() => {
    // Initialize local settings with context settings
    setLocalSettings(settings);
  }, [settings]);

  const handleForceSync = async () => {
    await forceSyncFromDatabase();
  };

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 sm:mb-8 gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
              <Sliders className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700 dark:text-slate-300" />
              Settings
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Your changes are automatically saved and synced across devices
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Link href="/" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 dark:border-slate-700 dark:text-slate-300 h-10"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto border-red-300 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 h-10"
              onClick={() => {
                if (window.confirm('Reset all settings to default values? This will clear your API keys and preferences.')) {
                  localStorage.removeItem('aiSettings');
                  localStorage.removeItem('NEXT_PUBLIC_OPENAI_API_KEY');
                  localStorage.removeItem('NEXT_PUBLIC_GEMINI_API_KEY');
                  localStorage.removeItem('NEXT_PUBLIC_MISTRAL_API_KEY');
                  localStorage.removeItem('NEXT_PUBLIC_CLAUDE_API_KEY');
                  localStorage.removeItem('NEXT_PUBLIC_LLAMA_API_KEY');
                  localStorage.removeItem('NEXT_PUBLIC_DEEPSEEK_API_KEY');
                  updateSettings(getDefaultSettings());
                }
              }}
            >
              <span>Reset</span>
            </Button>
          </div>
        </div>

        {/* Auto-Sync Status Banner */}
        {user && (
          <AutoSyncBanner
            isSyncing={isSyncing}
            hasUnsavedChanges={hasUnsavedChanges}
            lastSyncTime={lastSyncTime}
            syncError={syncError}
            onManualSync={forceSyncFromDatabase}
            className="mb-4 sm:mb-6"
          />
        )}

        {/* Settings Tabs - Optimized for mobile */}
        <div className="space-y-4 sm:space-y-6">
          <ProfileSettings />
          <ProviderSettings />
          <ChatSettings />
          <VoiceInputSettings />
          <SuggestionsSettings />
        </div>

        <div className="mt-6 border-t dark:border-slate-700 pt-4 text-center">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {user ? 
              "Your settings and API keys are automatically saved to your account and synced across all devices." : 
              "Your settings are stored locally on your device. Sign in to sync across devices."}
          </p>
        </div>
      </div>
    </div>
  );
} 