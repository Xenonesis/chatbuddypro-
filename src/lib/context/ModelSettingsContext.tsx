'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { userService } from '@/lib/services/userService';
import { useAuth } from '@/contexts/AuthContext';

export type AIProvider = 'openai' | 'gemini' | 'mistral' | 'claude' | 'llama' | 'deepseek';
export type ChatMode = 'thoughtful' | 'quick' | 'creative' | 'technical' | 'learning';

// Provider information
export const PROVIDER_INFO: Record<AIProvider, { name: string, displayName: string }> = {
  'openai': { name: 'openai', displayName: 'OpenAI' },
  'gemini': { name: 'gemini', displayName: 'Google Gemini' },
  'mistral': { name: 'mistral', displayName: 'Mistral AI' },
  'claude': { name: 'claude', displayName: 'Anthropic Claude' },
  'llama': { name: 'llama', displayName: 'Meta Llama' },
  'deepseek': { name: 'deepseek', displayName: 'DeepSeek' }
};

export type ModelSettings = {
  openai: {
    enabled: boolean;
    apiKey: string;
    models: string[];
    selectedModel: string;
    maxTokens: number;
    temperature: number;
  };
  gemini: {
    enabled: boolean;
    apiKey: string;
    models: string[];
    selectedModel: string;
    maxTokens: number;
    temperature: number;
  };
  mistral: {
    enabled: boolean;
    apiKey: string;
    models: string[];
    selectedModel: string;
    maxTokens: number;
    temperature: number;
  };
  claude: {
    enabled: boolean;
    apiKey: string;
    models: string[];
    selectedModel: string;
    maxTokens: number;
    temperature: number;
  };
  llama: {
    enabled: boolean;
    apiKey: string;
    models: string[];
    selectedModel: string;
    maxTokens: number;
    temperature: number;
  };
  deepseek: {
    enabled: boolean;
    apiKey: string;
    models: string[];
    selectedModel: string;
    maxTokens: number;
    temperature: number;
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
    models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
    selectedModel: 'gpt-3.5-turbo',
    maxTokens: 500,
    temperature: 0.7
  },
  gemini: {
    enabled: true,
    apiKey: '',
    models: [
      'gemini-pro', 
      'gemini-pro-vision', 
      'gemini-1.5-pro', 
      'gemini-1.5-flash',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite'
    ],
    selectedModel: 'gemini-pro',
    maxTokens: 500,
    temperature: 0.7
  },
  mistral: {
    enabled: true,
    apiKey: '',
    models: ['mistral-tiny', 'mistral-small', 'mistral-medium'],
    selectedModel: 'mistral-small',
    maxTokens: 500,
    temperature: 0.7
  },
  claude: {
    enabled: true,
    apiKey: '',
    models: ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    selectedModel: 'claude-3-5-sonnet-20240620',
    maxTokens: 500,
    temperature: 0.7
  },
  llama: {
    enabled: true,
    apiKey: '',
    models: ['llama-3-8b-instruct', 'llama-3-70b-instruct', 'llama-3-8b', 'llama-3-70b'],
    selectedModel: 'llama-3-8b-instruct',
    maxTokens: 500,
    temperature: 0.7
  },
  deepseek: {
    enabled: true,
    apiKey: '',
    models: ['deepseek-coder', 'deepseek-chat', 'deepseek-llm'],
    selectedModel: 'deepseek-chat',
    maxTokens: 500,
    temperature: 0.7
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

  useEffect(() => {
    // Load settings from localStorage on client side
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('aiSettings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          
          // Ensure model names are in the correct format
          if (parsedSettings.gemini) {
            // Update to simplified model names for better API compatibility
            if (parsedSettings.gemini.selectedModel === 'gemini-1.0-pro') {
              parsedSettings.gemini.selectedModel = 'gemini-pro';
            }
            if (parsedSettings.gemini.models) {
              parsedSettings.gemini.models = parsedSettings.gemini.models.map(
                (model: string) => model === 'gemini-1.0-pro' ? 'gemini-pro' : 
                                   model === 'gemini-1.0-pro-vision' ? 'gemini-pro-vision' : model
              );
            }
          }
          
          // Ensure we have a chatMode even if it's missing from saved settings
          const mergedSettings = {
            ...defaultSettings,
            ...parsedSettings,
            chatMode: parsedSettings.chatMode || defaultSettings.chatMode,
            showThinking: parsedSettings.showThinking !== undefined 
              ? parsedSettings.showThinking 
              : defaultSettings.showThinking,
            // Initialize the new providers from default settings if they don't exist
            claude: parsedSettings.claude || defaultSettings.claude,
            llama: parsedSettings.llama || defaultSettings.llama,
            deepseek: parsedSettings.deepseek || defaultSettings.deepseek
          };
          
          // Make sure gemini models are correct
          if (mergedSettings.gemini) {
            mergedSettings.gemini.models = defaultSettings.gemini.models;
            // Use the simplified model format
            if (mergedSettings.gemini.selectedModel.includes('gemini-1.0')) {
              if (mergedSettings.gemini.selectedModel.includes('vision')) {
                mergedSettings.gemini.selectedModel = 'gemini-pro-vision';
              } else {
                mergedSettings.gemini.selectedModel = 'gemini-pro';
              }
            }
          }
          
          setSettings(mergedSettings);
          setCurrentProvider(mergedSettings.defaultProvider);
          
          // Update localStorage with corrected settings
          localStorage.setItem('aiSettings', JSON.stringify(mergedSettings));
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      }

      // Load API keys from localStorage if not logged in
      if (!user) {
        const openaiKey = localStorage.getItem('NEXT_PUBLIC_OPENAI_API_KEY');
        const geminiKey = localStorage.getItem('NEXT_PUBLIC_GEMINI_API_KEY');
        const mistralKey = localStorage.getItem('NEXT_PUBLIC_MISTRAL_API_KEY');
        const claudeKey = localStorage.getItem('NEXT_PUBLIC_CLAUDE_API_KEY');
        const llamaKey = localStorage.getItem('NEXT_PUBLIC_LLAMA_API_KEY');
        const deepseekKey = localStorage.getItem('NEXT_PUBLIC_DEEPSEEK_API_KEY');
      
        if (openaiKey || geminiKey || mistralKey || claudeKey || llamaKey || deepseekKey) {
          setSettings(prevSettings => ({
            ...prevSettings,
            openai: { ...prevSettings.openai, apiKey: openaiKey || '' },
            gemini: { ...prevSettings.gemini, apiKey: geminiKey || '' },
            mistral: { ...prevSettings.mistral, apiKey: mistralKey || '' },
            claude: { ...prevSettings.claude, apiKey: claudeKey || '' },
            llama: { ...prevSettings.llama, apiKey: llamaKey || '' },
            deepseek: { ...prevSettings.deepseek, apiKey: deepseekKey || '' },
          }));
        }
      }
    }
  }, []);

  // Load API keys from Supabase
  useEffect(() => {
    const loadAPIKeysFromSupabase = async () => {
      if (!user || !isAuthReady) return;
      
      try {
        console.log('Loading API keys from Supabase...');
        const loadedKeys: Record<string, string> = {};
        let anyKeysLoaded = false;
        
        // First try to load using the user preferences table - which should have 
        // fixed the duplicate records issue
        for (const provider of Object.keys(PROVIDER_INFO)) {
          try {
            console.log(`Loading ${provider} API key...`);
            
            try {
              // Get the API key with name
              let keyInfo = null;
              try {
                keyInfo = await userService.getApiKeyByName(provider, 'default', user.id);
              } catch (nameKeyError) {
                console.error(`Error in getApiKeyByName for ${provider}:`, 
                  nameKeyError instanceof Error ? nameKeyError.message : String(nameKeyError));
                keyInfo = null;
              }
              
              if (keyInfo && keyInfo.key) {
                loadedKeys[provider] = keyInfo.key;
                localStorage.setItem(`NEXT_PUBLIC_${provider.toUpperCase()}_API_KEY`, keyInfo.key);
                anyKeysLoaded = true;
                console.log(`Loaded ${provider} API key with name: ${keyInfo.name}`)
                continue;
              }
              
              // Fall back to the old method if named key isn't found
              try {
                const apiKey = await userService.getApiKey(provider, user.id);
                if (apiKey) {
                  loadedKeys[provider] = apiKey;
                  localStorage.setItem(`NEXT_PUBLIC_${provider.toUpperCase()}_API_KEY`, apiKey);
                  anyKeysLoaded = true;
                  console.log(`Loaded ${provider} API key (without name)`)
                  
                  // Try to migrate the key to named format if it was found
                  try {
                    await userService.storeApiKeyWithName(user.id, provider, apiKey, 'default');
                    console.log(`Migrated ${provider} API key to named format`);
                  } catch (migrationError) {
                    console.warn(`Failed to migrate ${provider} API key to named format:`, 
                      migrationError instanceof Error ? migrationError.message : String(migrationError));
                  }
                  
                  continue;
                }
              } catch (apiKeyError) {
                console.error(`Error getting regular API key for ${provider}:`, 
                  apiKeyError instanceof Error ? apiKeyError.message : String(apiKeyError));
              }
              
              // Fallback: Check localStorage for previously saved key
              const localStorageKey = localStorage.getItem(`NEXT_PUBLIC_${provider.toUpperCase()}_API_KEY`);
              if (localStorageKey) {
                loadedKeys[provider] = localStorageKey;
                console.log(`Using existing localStorage key for ${provider}`);
                
                // Try to save it to Supabase for future use
                try {
                  await userService.storeApiKeyWithName(user.id, provider, localStorageKey, 'default');
                  console.log(`Saved localStorage ${provider} key to Supabase`);
                } catch (saveError) {
                  console.warn(`Failed to save localStorage ${provider} key to Supabase:`, 
                    saveError instanceof Error ? saveError.message : String(saveError));
                }
                
                anyKeysLoaded = true;
              } else {
                console.log(`No ${provider} API key found in localStorage`);
              }
            } catch (providerError) {
              console.error(`Overall error loading ${provider} API key:`, providerError);
            }
          } catch (outerError) {
            console.error(`Critical error handling provider ${provider}:`, outerError);
          }
        }
        
        setApiKeys(loadedKeys);
        setHasLoadedKeysFromSupabase(true);
        
        // If we couldn't load any keys, show UI to add them
        if (!anyKeysLoaded) {
          setShowAddApiKeyForm(true);
        }

        // Load other user settings from database
        try {
          console.log('Loading user settings from database...');
          const userPreferences = await userService.getUserPreferences(user.id);
          
          if (userPreferences && userPreferences.preferences && userPreferences.preferences.settings) {
            const savedSettings = userPreferences.preferences.settings;
            
            // Merge the saved settings with current settings
            const mergedSettings = {
              ...settings,
              ...savedSettings,
              // Ensure providers are not overwritten
              openai: { ...settings.openai },
              gemini: { ...settings.gemini },
              mistral: { ...settings.mistral },
              claude: { ...settings.claude },
              llama: { ...settings.llama },
              deepseek: { ...settings.deepseek }
            };
            
            // Update API keys in merged settings
            for (const [provider, apiKey] of Object.entries(loadedKeys)) {
              if (apiKey && mergedSettings[provider]) {
                mergedSettings[provider].apiKey = apiKey;
              }
            }
            
            console.log('Loaded user settings from database');
            setSettings(mergedSettings);
          }
        } catch (settingsError) {
          console.error('Error loading user settings:', settingsError);
        }
      } catch (error) {
        try {
          console.error('Error loading API keys from Supabase:', 
            error instanceof Error ? error.message : String(error));
          
          // Additional debugging info
          if (error instanceof Error && error.stack) {
            console.error('Error stack:', error.stack);
          }
          
          // Log user info for debugging (without sensitive data)
          console.error('User context during error:', {
            hasUser: !!user,
            userId: user ? user.id : null,
            authReady: isAuthReady
          });
        } catch (loggingError) {
          console.error('Failed to log API key loading error');
        }
      }
    };
    
    if (isAuthReady) {
      loadAPIKeysFromSupabase();
    } else {
      console.log('Waiting for auth to be ready before loading API keys');
    }
  }, [user, isAuthReady]);

  const updateSettings = async (newSettings: ModelSettings) => {
    try {
      setSettings(newSettings);
      localStorage.setItem('aiSettings', JSON.stringify(newSettings));
      
      // Update current provider if the default has changed
      if (newSettings.defaultProvider !== settings.defaultProvider) {
        setCurrentProvider(newSettings.defaultProvider);
      }
      
      // Save API keys to localStorage for compatibility
      localStorage.setItem('NEXT_PUBLIC_OPENAI_API_KEY', newSettings.openai.apiKey);
      localStorage.setItem('NEXT_PUBLIC_GEMINI_API_KEY', newSettings.gemini.apiKey);
      localStorage.setItem('NEXT_PUBLIC_MISTRAL_API_KEY', newSettings.mistral.apiKey);
      localStorage.setItem('NEXT_PUBLIC_CLAUDE_API_KEY', newSettings.claude.apiKey);
      localStorage.setItem('NEXT_PUBLIC_LLAMA_API_KEY', newSettings.llama.apiKey);
      localStorage.setItem('NEXT_PUBLIC_DEEPSEEK_API_KEY', newSettings.deepseek.apiKey);
      
      // If user is logged in, save to Supabase
      if (user) {
        // Define the provider names
        const providerNames: Record<AIProvider, string> = {
          'openai': 'OpenAI',
          'gemini': 'Google Gemini',
          'mistral': 'Mistral AI',
          'claude': 'Anthropic Claude',
          'llama': 'Meta Llama',
          'deepseek': 'DeepSeek'
        };
        
        // Save API keys to Supabase with provider name as the key name
        const providers: [AIProvider, string, string][] = [
          ['openai', newSettings.openai.apiKey, providerNames.openai],
          ['gemini', newSettings.gemini.apiKey, providerNames.gemini],
          ['mistral', newSettings.mistral.apiKey, providerNames.mistral],
          ['claude', newSettings.claude.apiKey, providerNames.claude],
          ['llama', newSettings.llama.apiKey, providerNames.llama],
          ['deepseek', newSettings.deepseek.apiKey, providerNames.deepseek]
        ];
        
        // Store each API key that has a value with its name
        for (const [provider, apiKey, providerName] of providers) {
          if (apiKey) {
            await userService.storeApiKeyWithName(user.id, provider, apiKey, providerName);
            // Also store in the older format for backward compatibility
            await userService.storeApiKey(user.id, provider, apiKey);
          }
        }
        
        // Create a clean version of settings without API keys
        const settingsForStorage = {
          defaultProvider: newSettings.defaultProvider,
          chatMode: newSettings.chatMode,
          showThinking: newSettings.showThinking,
          suggestionsSettings: newSettings.suggestionsSettings,
          voiceInputSettings: newSettings.voiceInputSettings
        };
        
        // Save to database
        await userService.saveUserSettings(user.id, settingsForStorage);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const getApiKey = (provider: AIProvider): string => {
    const apiKey = settings[provider].apiKey;
    
    // Validate API keys
    if (provider === 'gemini' && apiKey && !apiKey.startsWith('AIza')) {
      console.warn('Invalid Gemini API key format, should start with AIza');
      return ''; // Return empty string to trigger fallbacks
    }
    
    // Mistral API keys are typically long strings
    if (provider === 'mistral' && apiKey && apiKey.length < 30) {
      console.warn('Mistral API key appears to be invalid (too short)');
      return ''; // Return empty string to trigger fallbacks
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
    }
    
    // Save to database if user is logged in
    if (user) {
      try {
        await userService.saveUserSettings(user.id, {
          ...settings,
          chatMode: mode
        });
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
    }
    
    // Save to database if user is logged in
    if (user) {
      try {
        await userService.saveUserSettings(user.id, {
          ...settings,
          showThinking: newShowThinking
        });
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