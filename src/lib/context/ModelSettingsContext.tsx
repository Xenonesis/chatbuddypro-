'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type AIProvider = 'openai' | 'gemini' | 'mistral' | 'claude' | 'llama' | 'deepseek';
export type ChatMode = 'thoughtful' | 'quick' | 'creative' | 'technical' | 'learning';

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
}

const ModelSettingsContext = createContext<ModelSettingsContextType | undefined>(undefined);

export function ModelSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ModelSettings>(defaultSettings);
  const [currentProvider, setCurrentProvider] = useState<AIProvider>(defaultSettings.defaultProvider);

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

      // Load API keys from localStorage
      const openaiKey = localStorage.getItem('NEXT_PUBLIC_OPENAI_API_KEY');
      const geminiKey = localStorage.getItem('NEXT_PUBLIC_GEMINI_API_KEY');
      const mistralKey = localStorage.getItem('NEXT_PUBLIC_MISTRAL_API_KEY');
      const claudeKey = localStorage.getItem('NEXT_PUBLIC_CLAUDE_API_KEY');
      const llamaKey = localStorage.getItem('NEXT_PUBLIC_LLAMA_API_KEY');
      const deepseekKey = localStorage.getItem('NEXT_PUBLIC_DEEPSEEK_API_KEY');

      if (openaiKey || geminiKey || mistralKey || claudeKey || llamaKey || deepseekKey) {
        setSettings(prev => ({
          ...prev,
          openai: {
            ...prev.openai,
            apiKey: openaiKey || prev.openai.apiKey
          },
          gemini: {
            ...prev.gemini,
            apiKey: geminiKey || prev.gemini.apiKey
          },
          mistral: {
            ...prev.mistral,
            apiKey: mistralKey || prev.mistral.apiKey
          },
          claude: {
            ...prev.claude,
            apiKey: claudeKey || prev.claude.apiKey
          },
          llama: {
            ...prev.llama,
            apiKey: llamaKey || prev.llama.apiKey
          },
          deepseek: {
            ...prev.deepseek,
            apiKey: deepseekKey || prev.deepseek.apiKey
          }
        }));
      }
    }
  }, []);

  const updateSettings = (newSettings: ModelSettings) => {
    setSettings(newSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiSettings', JSON.stringify(newSettings));
      
      // Update current provider if the default has changed
      if (newSettings.defaultProvider !== settings.defaultProvider) {
        setCurrentProvider(newSettings.defaultProvider);
      }
      
      // Also save API keys to localStorage
      if (newSettings.openai.apiKey) {
        localStorage.setItem('NEXT_PUBLIC_OPENAI_API_KEY', newSettings.openai.apiKey);
      }
      if (newSettings.gemini.apiKey) {
        localStorage.setItem('NEXT_PUBLIC_GEMINI_API_KEY', newSettings.gemini.apiKey);
      }
      if (newSettings.mistral.apiKey) {
        localStorage.setItem('NEXT_PUBLIC_MISTRAL_API_KEY', newSettings.mistral.apiKey);
      }
      if (newSettings.claude.apiKey) {
        localStorage.setItem('NEXT_PUBLIC_CLAUDE_API_KEY', newSettings.claude.apiKey);
      }
      if (newSettings.llama.apiKey) {
        localStorage.setItem('NEXT_PUBLIC_LLAMA_API_KEY', newSettings.llama.apiKey);
      }
      if (newSettings.deepseek.apiKey) {
        localStorage.setItem('NEXT_PUBLIC_DEEPSEEK_API_KEY', newSettings.deepseek.apiKey);
      }
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

  const setChatMode = (mode: ChatMode) => {
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
  };

  const toggleShowThinking = () => {
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
    toggleContinuousListening
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