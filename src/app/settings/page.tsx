"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useModelSettings, ModelSettings, AIProvider, ChatMode } from '@/lib/context/ModelSettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Save, CheckCircle, Sliders } from 'lucide-react';
import ProviderSettings from '@/components/settings/ProviderSettings';
import ChatSettings from '@/components/settings/ChatSettings';
import SuggestionsSettings from '@/components/settings/SuggestionsSettings';
import VoiceInputSettings from '@/components/settings/VoiceInputSettings';
import ProfileSettings from '@/components/settings/ProfileSettings';

export default function SettingsPage() {
  const { settings, updateSettings, getDefaultSettings } = useModelSettings();
  const { user } = useAuth();
  const [localSettings, setLocalSettings] = useState<ModelSettings>(settings);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [savedAnimation, setSavedAnimation] = useState(false);

  useEffect(() => {
    // Initialize local settings with context settings
    setLocalSettings(settings);
  }, [settings]);

  const handleSaveSettings = () => {
    try {
      updateSettings(localSettings);
      setSaveStatus('Settings saved successfully!');
      setSavedAnimation(true);
      
      // Clear status message and animation after a delay
      setTimeout(() => {
        setSaveStatus('');
        setSavedAnimation(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('Error saving settings');
    }
  };

  return (
    <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-8 gap-3">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Sliders className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700 dark:text-slate-300" />
            Settings
          </h1>
          <div className="flex flex-wrap gap-2">
            <Link href="/" className="flex-1 sm:flex-initial">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 dark:border-slate-700 dark:text-slate-300 h-10 sm:h-10"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            </Link>
            <Button 
              onClick={handleSaveSettings} 
              className="bg-blue-500 hover:bg-blue-600 flex items-center justify-center gap-2 transition-all h-10 sm:h-10 flex-1 sm:flex-initial"
            >
              {savedAnimation ? (
                <CheckCircle className="h-4 w-4 animate-pulse" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Save</span>
            </Button>
            <Button 
              variant="outline" 
              className="border-red-300 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 h-10 sm:h-10 flex-1 sm:flex-initial"
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
                  setSaveStatus('Settings reset to defaults');
                  setSavedAnimation(true);
                  setTimeout(() => {
                    setSaveStatus('');
                    setSavedAnimation(false);
                  }, 3000);
                }
              }}
            >
              <span>Reset</span>
            </Button>
          </div>
        </div>

        {saveStatus && (
          <div className={`mb-4 sm:mb-6 p-3 rounded-lg ${
            saveStatus.includes('Error') 
              ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800' 
              : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-800'
          } flex items-center gap-2 animate-fadeIn`}>
            {saveStatus.includes('Error') ? (
              <span className="text-red-500 dark:text-red-400">⚠️</span>
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
            )}
            {saveStatus}
          </div>
        )}

        {/* Settings Tabs - Optimized for mobile */}
        <div className="space-y-4 sm:space-y-6">
          <ProfileSettings />
          <ProviderSettings />
          <ChatSettings />
          <VoiceInputSettings />
          <SuggestionsSettings />
        </div>

        <div className="mt-6 border-t dark:border-slate-700 pt-4 text-center sticky-bottom safe-area-bottom bg-white/80 dark:bg-slate-950/80">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {user ? 
              "Your settings and API keys are securely saved to your account and will be available on any device." : 
              "Your settings are stored locally on your device."}
          </p>
          <Button 
            onClick={handleSaveSettings} 
            className="bg-blue-500 hover:bg-blue-600 mt-3 w-full sm:w-auto transition-all h-10 sm:h-10 px-4 sm:px-6"
          >
            {savedAnimation ? (
              <CheckCircle className="h-4 w-4 mr-2 animate-pulse" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
} 