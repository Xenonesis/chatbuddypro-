'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AIProvider = 'openai' | 'gemini' | 'mistral';
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
  defaultProvider: AIProvider;
  chatMode: ChatMode;
  showThinking: boolean;
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
              : defaultSettings.showThinking
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

      if (openaiKey || geminiKey || mistralKey) {
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
    }
  };

  const getApiKey = (provider: AIProvider): string => {
    return settings[provider].apiKey;
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

  return (
    <ModelSettingsContext.Provider
      value={{
        settings,
        currentProvider,
        setCurrentProvider,
        updateSettings,
        getApiKey,
        setChatMode,
        toggleShowThinking,
        getDefaultSettings
      }}
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