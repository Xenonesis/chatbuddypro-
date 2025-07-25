import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { chatSettingsService, ChatSettings, ChatMode, ViewMode } from '@/lib/services/chatSettingsService';
import { useToast } from '@/components/ui/use-toast';

const DEFAULT_SETTINGS: ChatSettings = {
  chatMode: 'thoughtful',
  showThinking: false,
  showPreview: false,
  viewMode: 'grid'
};

export function useChatSettings() {
  const { user, isAuthReady } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [localSettings, setLocalSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('chatSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          const validSettings = {
            chatMode: parsed.chatMode || DEFAULT_SETTINGS.chatMode,
            showThinking: parsed.showThinking ?? DEFAULT_SETTINGS.showThinking,
            showPreview: parsed.showPreview ?? DEFAULT_SETTINGS.showPreview,
            viewMode: parsed.viewMode || DEFAULT_SETTINGS.viewMode
          };
          setSettings(validSettings);
          setLocalSettings(validSettings);
        } catch (error) {
          console.error('Error parsing saved chat settings:', error);
        }
      }
    }
  }, []);

  // Load settings from database when user is ready
  useEffect(() => {
    if (user && isAuthReady) {
      loadSettingsFromDatabase();
    } else if (isAuthReady) {
      setIsLoading(false);
    }
  }, [user, isAuthReady]);

  // Check for changes between settings and localSettings
  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(localSettings);
    setHasChanges(hasChanges);
  }, [settings, localSettings]);

  const loadSettingsFromDatabase = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const dbSettings = await chatSettingsService.getChatSettings(user.id);
      
      if (dbSettings) {
        setSettings(dbSettings);
        setLocalSettings(dbSettings);
        
        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('chatSettings', JSON.stringify(dbSettings));
        }
      }
    } catch (error) {
      console.error('Error loading chat settings:', error);
      toast({
        title: "Error loading settings",
        description: "Failed to load your chat settings. Using defaults.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = useCallback(async (newSettings?: ChatSettings) => {
    const settingsToSave = newSettings || localSettings;
    
    try {
      setIsSaving(true);
      
      // Update local state
      setSettings(settingsToSave);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('chatSettings', JSON.stringify(settingsToSave));
      }
      
      // Save to database if user is logged in
      if (user?.id) {
        const success = await chatSettingsService.saveChatSettings(user.id, settingsToSave);
        
        if (success) {
          toast({
            title: "Settings saved",
            description: "Your chat settings have been updated.",
          });
        } else {
          throw new Error('Failed to save to database');
        }
      }
      
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving chat settings:', error);
      toast({
        title: "Error saving settings",
        description: "Failed to save your chat settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [localSettings, user?.id, toast]);

  const updateLocalSettings = useCallback((updates: Partial<ChatSettings>) => {
    setLocalSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const resetChanges = useCallback(() => {
    setLocalSettings(settings);
  }, [settings]);

  const updateChatMode = useCallback((chatMode: ChatMode) => {
    updateLocalSettings({ chatMode });
  }, [updateLocalSettings]);

  const updateShowThinking = useCallback((showThinking: boolean) => {
    updateLocalSettings({ showThinking });
  }, [updateLocalSettings]);

  const updateShowPreview = useCallback((showPreview: boolean) => {
    updateLocalSettings({ showPreview });
  }, [updateLocalSettings]);

  const updateViewMode = useCallback((viewMode: ViewMode) => {
    updateLocalSettings({ viewMode });
  }, [updateLocalSettings]);

  // Auto-save individual settings if user is logged in
  const saveChatMode = useCallback(async (chatMode: ChatMode) => {
    if (user?.id) {
      try {
        await chatSettingsService.updateChatMode(user.id, chatMode);
        setSettings(prev => ({ ...prev, chatMode }));
        setLocalSettings(prev => ({ ...prev, chatMode }));
        
        // Update localStorage
        if (typeof window !== 'undefined') {
          const updated = { ...settings, chatMode };
          localStorage.setItem('chatSettings', JSON.stringify(updated));
        }
      } catch (error) {
        console.error('Error saving chat mode:', error);
      }
    } else {
      updateChatMode(chatMode);
    }
  }, [user?.id, settings, updateChatMode]);

  const saveShowThinking = useCallback(async (showThinking: boolean) => {
    if (user?.id) {
      try {
        await chatSettingsService.updateShowThinking(user.id, showThinking);
        setSettings(prev => ({ ...prev, showThinking }));
        setLocalSettings(prev => ({ ...prev, showThinking }));
        
        // Update localStorage
        if (typeof window !== 'undefined') {
          const updated = { ...settings, showThinking };
          localStorage.setItem('chatSettings', JSON.stringify(updated));
        }
      } catch (error) {
        console.error('Error saving show thinking:', error);
      }
    } else {
      updateShowThinking(showThinking);
    }
  }, [user?.id, settings, updateShowThinking]);

  const saveViewMode = useCallback(async (viewMode: ViewMode) => {
    if (user?.id) {
      try {
        await chatSettingsService.updateViewMode(user.id, viewMode);
        setSettings(prev => ({ ...prev, viewMode }));
        setLocalSettings(prev => ({ ...prev, viewMode }));
        
        // Update localStorage
        if (typeof window !== 'undefined') {
          const updated = { ...settings, viewMode };
          localStorage.setItem('chatSettings', JSON.stringify(updated));
        }
      } catch (error) {
        console.error('Error saving view mode:', error);
      }
    } else {
      updateViewMode(viewMode);
    }
  }, [user?.id, settings, updateViewMode]);

  return {
    // Current settings state
    settings,
    localSettings,
    
    // Loading states
    isLoading,
    isSaving,
    hasChanges,
    
    // Update functions for local changes
    updateLocalSettings,
    updateChatMode,
    updateShowThinking,
    updateShowPreview,
    updateViewMode,
    
    // Save functions
    saveSettings,
    saveChatMode,
    saveShowThinking,
    saveViewMode,
    
    // Utility functions
    resetChanges,
    loadSettingsFromDatabase
  };
}