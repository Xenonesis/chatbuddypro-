'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { userService } from '@/lib/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, decryptApiKey } from '@/lib/supabase';
import { useRealtimeSettings } from '@/hooks/useRealtimeSettings';

export type AIProvider = 'openai' | 'gemini' | 'mistral' | 'claude' | 'llama' | 'deepseek' | 'openrouter';
export type ChatMode = 'thoughtful' | 'quick' | 'creative' | 'technical' | 'learning';

// Provider information
export const PROVIDER_INFO: Record<AIProvider, { name: string, displayName: string }> = {
  'openai': { name: 'openai', displayName: 'OpenAI' },
  'gemini': { name: 'gemini', displayName: 'Google Gemini' },
  'mistral': { name: 'mistral', displayName: 'Mistral AI' },
  'claude': { name: 'claude', displayName: 'Anthropic Claude' },
  'llama': { name: 'llama', displayName: 'Meta Llama' },
  'deepseek': { name: 'deepseek', displayName: 'DeepSeek' },
  'openrouter': { name: 'openrouter', displayName: 'OpenRouter' }
};

export type ModelSettings = {
  openai: {
    enabled: boolean;
    apiKey: string;
    maxTokens: number;
    temperature: number;
    selectedModel: string;
  };
  gemini: {
    enabled: boolean;
    apiKey: string;
    maxTokens: number;
    temperature: number;
    selectedModel: string;
  };
  mistral: {
    enabled: boolean;
    apiKey: string;
    maxTokens: number;
    temperature: number;
    selectedModel: string;
  };
  claude: {
    enabled: boolean;
    apiKey: string;
    maxTokens: number;
    temperature: number;
    selectedModel: string;
  };
  llama: {
    enabled: boolean;
    apiKey: string;
    maxTokens: number;
    temperature: number;
    selectedModel: string;
  };
  deepseek: {
    enabled: boolean;
    apiKey: string;
    maxTokens: number;
    temperature: number;
    selectedModel: string;
  };
  openrouter: {
    enabled: boolean;
    apiKey: string;
    maxTokens: number;
    temperature: number;
    selectedModel: string;
  };
  suggestionsSettings: {
    enabled: boolean;
    saveHistory: boolean;
    maxHistoryItems: number;
    showFollowUpQuestions: boolean;
    showTopicSuggestions: boolean;
    showPromptRecommendations: boolean;
    useAI: boolean;
    favoritePrompts: string[];
  };
  voiceInputSettings: {
    enabled: boolean;
    language: string;
    continuous: boolean;
  };
  chatManagementSettings: {
    autoDeleteEnabled: boolean;
    retentionPeriodDays: number;
    lastCleanupDate?: string;
  };
  defaultProvider: AIProvider;
  chatMode: ChatMode;
  showThinking: boolean;
};

export type VoiceInputSettings = {
  enabled: boolean;
  language: string;
  continuous: boolean;
};

const defaultSettings: ModelSettings = {
  openai: {
    enabled: true,
    apiKey: '',
    maxTokens: 500,
    temperature: 0.7,
    selectedModel: 'gpt-3.5-turbo'
  },
  gemini: {
    enabled: true,
    apiKey: '',
    maxTokens: 500,
    temperature: 0.7,
    selectedModel: 'gemini-2.0-flash'
  },
  mistral: {
    enabled: true,
    apiKey: '',
    maxTokens: 500,
    temperature: 0.7,
    selectedModel: 'mistral-small'
  },
  claude: {
    enabled: true,
    apiKey: '',
    maxTokens: 500,
    temperature: 0.7,
    selectedModel: 'claude-3-5-sonnet-20240620'
  },
  llama: {
    enabled: true,
    apiKey: '',
    maxTokens: 500,
    temperature: 0.7,
    selectedModel: 'llama-3-8b-instruct'
  },
  deepseek: {
    enabled: true,
    apiKey: '',
    maxTokens: 500,
    temperature: 0.7,
    selectedModel: 'deepseek-chat'
  },
  openrouter: {
    enabled: true,
    apiKey: '',
    maxTokens: 500,
    temperature: 0.7,
    selectedModel: 'openai/gpt-3.5-turbo'
  },
  suggestionsSettings: {
    enabled: true,
    saveHistory: true,
    maxHistoryItems: 50,
    showFollowUpQuestions: true, 
    showTopicSuggestions: true,
    showPromptRecommendations: true,
    useAI: true,
    favoritePrompts: []
  },
  voiceInputSettings: {
    enabled: true,
    language: 'en-US',
    continuous: true
  },
  chatManagementSettings: {
    autoDeleteEnabled: false,
    retentionPeriodDays: 30,
    lastCleanupDate: undefined
  },
  defaultProvider: 'openai',
  chatMode: 'thoughtful',
  showThinking: false
};

interface ModelSettingsContextType {
  settings: ModelSettings;
  currentProvider: AIProvider;
  setCurrentProvider: (provider: AIProvider) => void;
  updateSettings: (newSettings: ModelSettings) => void;
  getApiKey: (provider: AIProvider) => string;
  setChatMode: (mode: ChatMode) => void;
  toggleShowThinking: () => void;
  getDefaultSettings: () => ModelSettings;
  addFavoritePrompt: (prompt: string) => void;
  removeFavoritePrompt: (prompt: string) => void;
  toggleSuggestionsEnabled: () => void;
  toggleSaveHistory: () => void;
  toggleFollowUpQuestions: () => void;
  toggleTopicSuggestions: () => void;
  togglePromptRecommendations: () => void;
  toggleUseAI: () => void;
  toggleVoiceInput: () => void;
  setVoiceLanguage: (language: string) => void;
  toggleContinuousListening: () => void;
  toggleAutoDeleteChats: () => void;
  setRetentionPeriod: (days: number) => void;
  updateLastCleanupDate: (date: string) => void;
  apiKeys: Record<string, string>;
  hasLoadedKeysFromSupabase: boolean;
  showAddApiKeyForm: boolean;
  setShowAddApiKeyForm: (show: boolean) => void;
}

const ModelSettingsContext = createContext<ModelSettingsContextType | undefined>(undefined);

export function ModelSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ModelSettings>(defaultSettings);
  const [currentProvider, setCurrentProvider] = useState<AIProvider>(defaultSettings.defaultProvider);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [hasLoadedKeysFromSupabase, setHasLoadedKeysFromSupabase] = useState(false);
  const [showAddApiKeyForm, setShowAddApiKeyForm] = useState(false);
  const { user, isAuthReady } = useAuth();
  const [loadingKeys, setLoadingKeys] = useState(false);
  const settingsLoadedForUserRef = useRef<string | null>(null);

  // Real-time settings update handlers
  const handleRealtimeSettingsUpdate = useCallback((newSettings: ModelSettings) => {
    console.log('Applying real-time settings update');
    setSettings(prevSettings => {
      const mergedSettings = { ...prevSettings, ...newSettings };
      
      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('aiSettings', JSON.stringify(mergedSettings));
      }
      
      // Update current provider if default provider changed
      if (newSettings.defaultProvider && newSettings.defaultProvider !== prevSettings.defaultProvider) {
        setCurrentProvider(newSettings.defaultProvider);
      }
      
      return mergedSettings;
    });
  }, []);

  const handleRealtimeApiKeysUpdate = useCallback((newApiKeys: Record<string, string>) => {
    console.log('Applying real-time API keys update');
    setApiKeys(prevKeys => ({ ...prevKeys, ...newApiKeys }));
    
    // Update settings with new API keys
    setSettings(prevSettings => {
      const updatedSettings = { ...prevSettings };
      
      Object.entries(newApiKeys).forEach(([provider, apiKey]) => {
        const typedProvider = provider as AIProvider;
        if (updatedSettings[typedProvider]) {
          updatedSettings[typedProvider].apiKey = apiKey;
          updatedSettings[typedProvider].enabled = true;
        }
      });
      
      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('aiSettings', JSON.stringify(updatedSettings));
      }
      
      return updatedSettings;
    });
  }, []);

  // Set up real-time subscription
  useRealtimeSettings({
    onSettingsUpdate: handleRealtimeSettingsUpdate,
    onApiKeysUpdate: handleRealtimeApiKeysUpdate
  });

  useEffect(() => {
    // Load settings from localStorage on client side
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('aiSettings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          
          // Create a clean version of settings without models and selectedModel
          const cleanSettings: ModelSettings = {
            ...defaultSettings
          };
          
          // For each provider, copy over the relevant properties
          Object.keys(PROVIDER_INFO).forEach(provider => {
            const providerKey = provider as AIProvider;
            if (parsedSettings[providerKey]) {
              cleanSettings[providerKey] = {
                enabled: parsedSettings[providerKey].enabled ?? defaultSettings[providerKey].enabled,
                apiKey: parsedSettings[providerKey].apiKey ?? '',
                maxTokens: parsedSettings[providerKey].maxTokens ?? defaultSettings[providerKey].maxTokens,
                temperature: parsedSettings[providerKey].temperature ?? defaultSettings[providerKey].temperature,
                selectedModel: parsedSettings[providerKey].selectedModel ?? defaultSettings[providerKey].selectedModel
              };
            }
          });
          
          // Copy other settings
          if (parsedSettings.defaultProvider) {
            cleanSettings.defaultProvider = parsedSettings.defaultProvider;
          }
          
          if (parsedSettings.chatMode) {
            cleanSettings.chatMode = parsedSettings.chatMode;
          }
          
          if (parsedSettings.showThinking !== undefined) {
            cleanSettings.showThinking = parsedSettings.showThinking;
          }
          
          if (parsedSettings.suggestionsSettings) {
            cleanSettings.suggestionsSettings = {
              ...defaultSettings.suggestionsSettings,
              ...parsedSettings.suggestionsSettings
            };
          }
          
          if (parsedSettings.voiceInputSettings) {
            cleanSettings.voiceInputSettings = {
              ...defaultSettings.voiceInputSettings,
              ...parsedSettings.voiceInputSettings
            };
          }
          
          setSettings(cleanSettings);
          
          // Update localStorage with the cleaned settings
          localStorage.setItem('aiSettings', JSON.stringify(cleanSettings));
          
          // If there's a default provider set, update the current provider
          if (cleanSettings.defaultProvider) {
            setCurrentProvider(cleanSettings.defaultProvider);
          }
        } catch (error) {
          console.error('Error parsing saved settings:', error);
          // In case of error, fall back to default settings
          setSettings(defaultSettings);
        }
      }
      
      // Load API keys from environment variables only
      const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const mistralKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY;
      const claudeKey = process.env.NEXT_PUBLIC_CLAUDE_API_KEY;
      const llamaKey = process.env.NEXT_PUBLIC_LLAMA_API_KEY;
      const deepseekKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
      const openrouterKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    
      if (openaiKey || geminiKey || mistralKey || claudeKey || llamaKey || deepseekKey || openrouterKey) {
        setSettings(prevSettings => ({
          ...prevSettings,
          openai: { ...prevSettings.openai, apiKey: openaiKey || '' },
          gemini: { ...prevSettings.gemini, apiKey: geminiKey || '' },
          mistral: { ...prevSettings.mistral, apiKey: mistralKey || '' },
          claude: { ...prevSettings.claude, apiKey: claudeKey || '' },
          llama: { ...prevSettings.llama, apiKey: llamaKey || '' },
          deepseek: { ...prevSettings.deepseek, apiKey: deepseekKey || '' },
          openrouter: { ...prevSettings.openrouter, apiKey: openrouterKey || '' },
        }));
      }
    }
  }, []);

  // Add this effect to load API keys and chat settings when the user state is ready
  useEffect(() => {
    if (user && isAuthReady && user.id) {
      // Only load if we haven't already loaded for this user
      if (settingsLoadedForUserRef.current !== user.id) {
        settingsLoadedForUserRef.current = user.id;
        
        loadAPIKeysFromSupabase().catch(error => {
          console.error('Error loading API keys from Supabase:', error);
        });
        
        // Also load chat settings from the new system
        loadChatSettingsFromSupabase().catch(error => {
          console.error('Error loading chat settings from Supabase:', error);
        });
      }
    } else if (!user) {
      // Reset when user logs out
      settingsLoadedForUserRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isAuthReady]);

  // Load chat settings from the new chat settings system
  const loadChatSettingsFromSupabase = async () => {
    if (!user?.id) {
      console.log('Cannot load chat settings: No user ID available');
      return;
    }

    try {
      console.log('Loading chat settings from Supabase for user:', user.id.substring(0, 8) + '...');
      
      const { chatSettingsService } = await import('@/lib/services/chatSettingsService');
      const chatSettings = await chatSettingsService.getChatSettings(user.id);
      
      if (chatSettings) {
        console.log('Loaded chat settings from database:', chatSettings);
        
        // Update the ModelSettings with the chat settings
        setSettings(prev => ({
          ...prev,
          chatMode: chatSettings.chatMode,
          showThinking: chatSettings.showThinking
        }));
        
        // Also update localStorage to keep both systems in sync
        if (typeof window !== 'undefined') {
          const currentAiSettings = JSON.parse(localStorage.getItem('aiSettings') || '{}');
          const updatedAiSettings = {
            ...currentAiSettings,
            chatMode: chatSettings.chatMode,
            showThinking: chatSettings.showThinking
          };
          localStorage.setItem('aiSettings', JSON.stringify(updatedAiSettings));
          
          // Update the chat settings localStorage as well
          localStorage.setItem('chatSettings', JSON.stringify(chatSettings));
        }
      }
    } catch (error) {
      console.error('Error loading chat settings from Supabase:', error);
    }
  };

  // Load API keys from Supabase
  const loadAPIKeysFromSupabase = async () => {
    if (!user?.id) {
      console.log('Cannot load API keys: No user ID available');
      return;
    }

    try {
      setLoadingKeys(true);
      // Get user ID from state (already validated)
      const userId = user.id;
      console.log('Loading API keys from Supabase for user:', userId.substring(0, 8) + '...');
      
      // Try to access user preferences
      const preferences = await userService.getUserPreferences(userId);
      if (!preferences) {
        console.log('No preferences found, creating default preferences');
        await userService.createDefaultPreferences(userId);
        setLoadingKeys(false);
        setHasLoadedKeysFromSupabase(true);
        return;
      }
      
      // Check new ai_providers structure first
      let currentApiKeys: Record<string, string> = {};
      if (preferences.ai_providers) {
        console.log('Found ai_providers structure in preferences');
        
        const newApiKeys: Record<string, string> = {};
        const newSettings = { ...settings };
        
        // Process each provider (need to use async/await for decryption)
        const providerPromises = Object.entries(preferences.ai_providers).map(async ([provider, providerInfo]) => {
          const validProvider = provider as AIProvider;
          if (validProvider && providerInfo && providerInfo.enabled && providerInfo.api_keys) {
            // Get the default key or first available key (these are encrypted)
            const encryptedApiKey = providerInfo.api_keys['default'] ||
                                  Object.values(providerInfo.api_keys)[0];

            if (encryptedApiKey) {
              try {
                console.log(`Found encrypted API key for ${provider} in ai_providers, decrypting...`);
                const decryptedApiKey = await decryptApiKey(encryptedApiKey, userId);

                console.log(`Successfully decrypted API key for ${provider}`);
                newApiKeys[provider] = decryptedApiKey;

                // Also update the settings
                if (newSettings[validProvider]) {
                  newSettings[validProvider].enabled = true;
                  newSettings[validProvider].apiKey = decryptedApiKey;
                }

                return { provider, success: true };
              } catch (error) {
                console.error(`Error decrypting API key for ${provider}:`, error);
                return { provider, success: false };
              }
            }
          }
          return { provider, success: false };
        });

        // Wait for all decryption operations to complete
        await Promise.all(providerPromises);
        
        // Update state with keys found
        if (Object.keys(newApiKeys).length > 0) {
          setApiKeys(newApiKeys);
          setSettings(newSettings);
          currentApiKeys = newApiKeys;
          console.log('Updated settings with API keys from ai_providers');
        } else {
          console.log('No API keys found in ai_providers structure');
        }
      }
      // Fall back to legacy api_keys structure if no keys found in ai_providers
      else if (preferences.api_keys && Object.keys(preferences.api_keys).length > 0) {
        console.log('Found legacy api_keys structure in preferences');
        
        // Extract API keys in the format we expect
        const apiKeysFromDB = { ...preferences.api_keys };
        
        // Update state with these keys
        const newSettings = { ...settings };
        
        // For each provider in our settings, check if we have a key (need async for decryption)
        const legacyPromises = Object.keys(PROVIDER_INFO).map(async (provider) => {
          const typedProvider = provider as AIProvider;
          const encryptedApiKey = apiKeysFromDB[provider];

          if (encryptedApiKey && typedProvider && newSettings[typedProvider]) {
            try {
              console.log(`Found encrypted API key for ${provider} in legacy structure, decrypting...`);
              const decryptedApiKey = await decryptApiKey(encryptedApiKey, userId);

              console.log(`Successfully decrypted legacy API key for ${provider}`);
              newSettings[typedProvider].enabled = true;
              newSettings[typedProvider].apiKey = decryptedApiKey;

              return { provider, success: true };
            } catch (error) {
              console.error(`Error decrypting legacy API key for ${provider}:`, error);
              return { provider, success: false };
            }
          }
          return { provider, success: false };
        });

        // Wait for all legacy decryption operations to complete
        await Promise.all(legacyPromises);

        // Create a new object with decrypted keys for the state
        const decryptedApiKeys: Record<string, string> = {};
        Object.keys(PROVIDER_INFO).forEach(provider => {
          const typedProvider = provider as AIProvider;
          if (newSettings[typedProvider]?.apiKey) {
            decryptedApiKeys[provider] = newSettings[typedProvider].apiKey;
          }
        });

        setApiKeys(decryptedApiKeys);
        setSettings(newSettings);
        console.log('Updated settings with decrypted API keys from legacy structure');

        // Update the currentApiKeys for the provider check below
        currentApiKeys = decryptedApiKeys;
      } else {
        console.log('No API keys found in user preferences');
      }
      
      // Get providers with API keys in the database (use the newly loaded keys)
      const providersWithApiKeys = Object.keys(currentApiKeys) as AIProvider[];
      console.log('Providers with API keys in database:', providersWithApiKeys);
      
      // Check if there's a defaultProvider in preferences and apply it
      if (preferences.preferences && preferences.preferences.settings && 
          preferences.preferences.settings.defaultProvider) {
            
        const defaultProviderFromPrefs = preferences.preferences.settings.defaultProvider as AIProvider;
        console.log(`Found defaultProvider in preferences: ${defaultProviderFromPrefs}`);
        
        // Verify the provider is valid and has an API key in the database
        if (providersWithApiKeys.includes(defaultProviderFromPrefs)) {
          // Valid provider with API key, set as current
          setCurrentProvider(defaultProviderFromPrefs);
          setSettings(current => ({
            ...current,
            defaultProvider: defaultProviderFromPrefs
          }));
          console.log(`Updated defaultProvider to: ${defaultProviderFromPrefs}`);
        } else {
          console.log(`Default provider ${defaultProviderFromPrefs} does not have an API key in the database`);
          
          // Set default provider to the first available provider with an API key
          if (providersWithApiKeys.length > 0) {
            const newDefaultProvider = providersWithApiKeys[0];
            setCurrentProvider(newDefaultProvider);
            setSettings(current => ({
              ...current,
              defaultProvider: newDefaultProvider
            }));
            console.log(`Setting default provider to ${newDefaultProvider} instead, as it has an API key in the database`);
          }
        }
      } else {
        // No default provider in preferences, set to first provider with API key
        if (providersWithApiKeys.length > 0) {
          const newDefaultProvider = providersWithApiKeys[0];
          setCurrentProvider(newDefaultProvider);
          setSettings(current => ({
            ...current,
            defaultProvider: newDefaultProvider
          }));
          console.log(`No default provider in preferences, setting to ${newDefaultProvider} as it has an API key in the database`);
        }
      }
    } catch (error) {
      console.error('Error loading API keys from Supabase:', error);
    } finally {
      setLoadingKeys(false);
      setHasLoadedKeysFromSupabase(true);
    }
  };

  const updateSettings = async (newSettings: ModelSettings) => {
    // Get providers with valid API keys in the database
    const providersWithApiKeys = Object.keys(apiKeys || {}) as AIProvider[];
    
    // Validate default provider has an API key in the database
    if (newSettings.defaultProvider !== settings.defaultProvider) {
      if (!providersWithApiKeys.includes(newSettings.defaultProvider)) {
        console.log(`Default provider ${newSettings.defaultProvider} does not have an API key in the database`);
        
        // Keep the current default provider if it has an API key
        if (providersWithApiKeys.includes(settings.defaultProvider)) {
          newSettings.defaultProvider = settings.defaultProvider;
          console.log(`Keeping current default provider ${settings.defaultProvider}`);
        }
        // Otherwise set to the first provider with an API key
        else if (providersWithApiKeys.length > 0) {
          newSettings.defaultProvider = providersWithApiKeys[0];
          console.log(`Setting default provider to ${providersWithApiKeys[0]} as it has an API key in the database`);
        }
      }
    }
    
    // Update settings in state
    setSettings(newSettings);
    
    // If the default provider has changed and it's enabled with an API key, update currentProvider
    if (newSettings.defaultProvider !== settings.defaultProvider &&
        newSettings[newSettings.defaultProvider]?.enabled &&
        providersWithApiKeys.includes(newSettings.defaultProvider)) {
      console.log(`Default provider changed to ${newSettings.defaultProvider}, updating current provider`);
      setCurrentProvider(newSettings.defaultProvider);
    }
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      console.log(`Saving settings to localStorage with defaultProvider: ${newSettings.defaultProvider}`);
      localStorage.setItem('aiSettings', JSON.stringify(newSettings));
    }
    
    // TODO: Migrate this to work with the new ai_providers structure

    // Save API keys to Supabase for each provider if changed
    if (user && user.id) {
      // Create a queue of API key update operations
      const apiKeyUpdatePromises: Promise<boolean>[] = [];
      
      // For each provider, check if the API key changed
      Object.keys(PROVIDER_INFO).forEach(providerKey => {
        const provider = providerKey as AIProvider;
        const oldApiKey = settings[provider].apiKey;
        const newApiKey = newSettings[provider].apiKey;
        
        // Only update if the key changed and the new key is valid
        if (newApiKey !== oldApiKey && newApiKey) {
          console.log(`API key for ${provider} has changed, updating in Supabase...`);
          
          // Store the API key with a name (default) for better organization
          apiKeyUpdatePromises.push(
            userService.storeApiKey(user.id, provider, newApiKey, 'default')
          );
        }
      });
      
      // Execute all API key updates in parallel
      if (apiKeyUpdatePromises.length > 0) {
        try {
          const results = await Promise.all(apiKeyUpdatePromises);
          const allSuccessful = results.every(result => result === true);
          
          if (allSuccessful) {
            console.log('All API key updates completed successfully');
              } else {
            console.warn('Some API key updates failed:', results);
          }
        } catch (error) {
          console.error('Error updating API keys:', error);
        }
      }
      
      // Update other settings in the database
      try {
        // Remove API keys from the settings object to avoid duplication
        const settingsWithoutApiKeys = { ...newSettings };
        Object.keys(PROVIDER_INFO).forEach(provider => {
          settingsWithoutApiKeys[provider as AIProvider].apiKey = '';
        });
        
        // Save settings to database
        await userService.saveUserSettings(user.id, { settings: settingsWithoutApiKeys });
        console.log('Settings saved to database');
      } catch (error) {
        console.error('Error saving settings to database:', error);
      }
          } else {
      console.log('User not logged in, settings will only be saved locally');
    }
  };

  const getApiKey = (provider: AIProvider): string => {
    // Get the API key from settings
    const apiKey = settings[provider].apiKey || '';

    console.log(`getApiKey called for ${provider}:`, {
      hasKey: !!apiKey,
      keyLength: apiKey.length,
      keyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'none'
    });

    // For mistral, apply more permissive validation
    if (provider === 'mistral') {
      // Don't block mistral keys based on length
      return apiKey;
    }

    // Different providers have different key formats, apply some basic validation
    switch (provider) {
      case 'openai':
        // OpenAI API keys are typically long strings starting with 'sk-'
        if (apiKey && (!apiKey.startsWith('sk-') || apiKey.length < 20)) {
          console.warn('OpenAI API key appears to be invalid (incorrect format)');
          return '';
        }
        break;
      case 'gemini':
        // Gemini API keys are typically long strings
        if (apiKey && apiKey.length < 20) {
          console.warn('Gemini API key appears to be invalid (too short)');
          return '';
        }
        break;
      case 'claude':
        // Claude API keys are typically long strings
        if (apiKey && apiKey.length < 20) {
          console.warn('Claude API key appears to be invalid (too short)');
          return '';
        }
        break;
      // Remove the mistral validation which was too strict
    }

    return apiKey;
  };

  const setChatMode = async (mode: ChatMode) => {
    setSettings(prev => ({
      ...prev,
      chatMode: mode
    }));
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiSettings', JSON.stringify({
        ...settings,
        chatMode: mode
      }));
      
      // Also update the chat settings localStorage
      const chatSettings = JSON.parse(localStorage.getItem('chatSettings') || '{}');
      localStorage.setItem('chatSettings', JSON.stringify({
        ...chatSettings,
        chatMode: mode
      }));
    }
    
    // Save to database if user is logged in
    if (user) {
      try {
        // Save to the old location for backward compatibility
        await userService.saveUserSettings(user.id, {
          ...settings,
          chatMode: mode
        });
        
        // Also save to the new chat settings location
        const { chatSettingsService } = await import('@/lib/services/chatSettingsService');
        await chatSettingsService.saveChatSettings(user.id, { chatMode: mode });
      } catch (error) {
        console.error('Error saving chatMode setting:', error);
      }
    }
  };

  const toggleShowThinking = async () => {
    const newShowThinking = !settings.showThinking;
    
    setSettings(prev => ({
      ...prev,
      showThinking: newShowThinking
    }));
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiSettings', JSON.stringify({
        ...settings,
        showThinking: newShowThinking
      }));
      
      // Also update the chat settings localStorage
      const chatSettings = JSON.parse(localStorage.getItem('chatSettings') || '{}');
      localStorage.setItem('chatSettings', JSON.stringify({
        ...chatSettings,
        showThinking: newShowThinking
      }));
    }
    
    // Save to database if user is logged in
    if (user) {
      try {
        // Save to the old location for backward compatibility
        await userService.saveUserSettings(user.id, {
          ...settings,
          showThinking: newShowThinking
        });
        
        // Also save to the new chat settings location
        const { chatSettingsService } = await import('@/lib/services/chatSettingsService');
        await chatSettingsService.saveChatSettings(user.id, { showThinking: newShowThinking });
      } catch (error) {
        console.error('Error saving showThinking setting:', error);
      }
    }
  };

  const getDefaultSettings = () => {
    return JSON.parse(JSON.stringify(defaultSettings));
  };

  const addFavoritePrompt = (prompt: string) => {
    setSettings(prev => {
      // Don't add duplicate prompts
      if (prev.suggestionsSettings.favoritePrompts.includes(prompt)) {
        return prev;
      }
      
      const updatedSettings = {
        ...prev,
        suggestionsSettings: {
          ...prev.suggestionsSettings,
          favoritePrompts: [...prev.suggestionsSettings.favoritePrompts, prompt]
        }
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('aiSettings', JSON.stringify(updatedSettings));
      }
      
      return updatedSettings;
    });
  };

  const removeFavoritePrompt = (prompt: string) => {
    setSettings(prev => {
      const updatedSettings = {
        ...prev,
        suggestionsSettings: {
          ...prev.suggestionsSettings,
          favoritePrompts: prev.suggestionsSettings.favoritePrompts.filter(p => p !== prompt)
        }
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('aiSettings', JSON.stringify(updatedSettings));
      }
      
      return updatedSettings;
    });
  };

  const toggleSuggestionsEnabled = () => {
    setSettings(prev => {
      const updatedSettings = {
        ...prev,
        suggestionsSettings: {
          ...prev.suggestionsSettings,
          enabled: !prev.suggestionsSettings.enabled
        }
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('aiSettings', JSON.stringify(updatedSettings));
      }
      
      return updatedSettings;
    });
  };

  const toggleSaveHistory = () => {
    setSettings(prev => {
      const updatedSettings = {
        ...prev,
        suggestionsSettings: {
          ...prev.suggestionsSettings,
          saveHistory: !prev.suggestionsSettings.saveHistory
        }
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('aiSettings', JSON.stringify(updatedSettings));
      }
      
      return updatedSettings;
    });
  };

  const toggleFollowUpQuestions = () => {
    setSettings(prev => {
      const updatedSettings = {
        ...prev,
        suggestionsSettings: {
          ...prev.suggestionsSettings,
          showFollowUpQuestions: !prev.suggestionsSettings.showFollowUpQuestions
        }
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('aiSettings', JSON.stringify(updatedSettings));
      }
      
      return updatedSettings;
    });
  };

  const toggleTopicSuggestions = () => {
    setSettings(prev => {
      const updatedSettings = {
        ...prev,
        suggestionsSettings: {
          ...prev.suggestionsSettings,
          showTopicSuggestions: !prev.suggestionsSettings.showTopicSuggestions
        }
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('aiSettings', JSON.stringify(updatedSettings));
      }
      
      return updatedSettings;
    });
  };

  const togglePromptRecommendations = () => {
    setSettings(prev => {
      const updatedSettings = {
        ...prev,
        suggestionsSettings: {
          ...prev.suggestionsSettings,
          showPromptRecommendations: !prev.suggestionsSettings.showPromptRecommendations
        }
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('aiSettings', JSON.stringify(updatedSettings));
      }
      
      return updatedSettings;
    });
  };

  const toggleUseAI = () => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        suggestionsSettings: {
          ...prev.suggestionsSettings,
          useAI: !prev.suggestionsSettings.useAI
        }
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('aiSettings', JSON.stringify(newSettings));
      }
      
      return newSettings;
    });
  };

  const toggleVoiceInput = useCallback(() => {
    setSettings((prev) => {
      const newSettings = {
        ...prev,
        voiceInputSettings: {
          ...prev.voiceInputSettings,
          enabled: !prev.voiceInputSettings.enabled
        }
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('aiSettings', JSON.stringify(newSettings));
      }
      
      return newSettings;
    });
  }, []);

  const setVoiceLanguage = useCallback((language: string) => {
    setSettings((prev) => {
      const newSettings = {
        ...prev,
        voiceInputSettings: {
          ...prev.voiceInputSettings,
          language
        }
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('aiSettings', JSON.stringify(newSettings));
      }
      
      return newSettings;
    });
  }, []);

  const toggleContinuousListening = useCallback(() => {
    setSettings((prev) => {
      const newSettings = {
        ...prev,
        voiceInputSettings: {
          ...prev.voiceInputSettings,
          continuous: !prev.voiceInputSettings.continuous
        }
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('aiSettings', JSON.stringify(newSettings));
      }
      
      return newSettings;
    });
  }, []);

  // Chat Management Settings Functions
  const toggleAutoDeleteChats = useCallback(() => {
    setSettings((prev) => {
      const newSettings = {
        ...prev,
        chatManagementSettings: {
          ...prev.chatManagementSettings,
          autoDeleteEnabled: !prev.chatManagementSettings.autoDeleteEnabled
        }
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('aiSettings', JSON.stringify(newSettings));
      }

      return newSettings;
    });
  }, []);

  const setRetentionPeriod = useCallback((days: number) => {
    setSettings((prev) => {
      const newSettings = {
        ...prev,
        chatManagementSettings: {
          ...prev.chatManagementSettings,
          retentionPeriodDays: days
        }
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('aiSettings', JSON.stringify(newSettings));
      }

      return newSettings;
    });
  }, []);

  const updateLastCleanupDate = useCallback((date: string) => {
    setSettings((prev) => {
      const newSettings = {
        ...prev,
        chatManagementSettings: {
          ...prev.chatManagementSettings,
          lastCleanupDate: date
        }
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('aiSettings', JSON.stringify(newSettings));
      }

      return newSettings;
    });
  }, []);

  const contextValue: ModelSettingsContextType = {
    settings,
    currentProvider,
    setCurrentProvider,
    updateSettings,
    getApiKey,
    setChatMode,
    toggleShowThinking,
    getDefaultSettings,
    addFavoritePrompt,
    removeFavoritePrompt,
    toggleSuggestionsEnabled,
    toggleSaveHistory,
    toggleFollowUpQuestions,
    toggleTopicSuggestions,
    togglePromptRecommendations,
    toggleUseAI,
    toggleVoiceInput,
    setVoiceLanguage,
    toggleContinuousListening,
    toggleAutoDeleteChats,
    setRetentionPeriod,
    updateLastCleanupDate,
    apiKeys,
    hasLoadedKeysFromSupabase,
    showAddApiKeyForm,
    setShowAddApiKeyForm
  };

  return (
    <ModelSettingsContext.Provider
      value={contextValue}
    >
      {children}
    </ModelSettingsContext.Provider>
  );
}

export function useModelSettings() {
  const context = useContext(ModelSettingsContext);
  if (context === undefined) {
    throw new Error('useModelSettings must be used within a ModelSettingsProvider');
  }
  return context;
} 