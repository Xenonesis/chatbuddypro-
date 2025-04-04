"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useModelSettings, ModelSettings, AIProvider, ChatMode } from '@/lib/context/ModelSettingsContext';
import { ArrowLeft, Save, CheckCircle, Key, Thermometer, Dna, Laptop, Sliders, 
  Brain, Zap, Lightbulb, Code, GraduationCap, Eye, EyeOff, MessageSquare } from 'lucide-react';
import SuggestionsSettings from '@/components/settings/SuggestionsSettings';

export default function SettingsPage() {
  const { settings, updateSettings, getDefaultSettings } = useModelSettings();
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

  const handleToggleProvider = (provider: AIProvider) => {
    setLocalSettings(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        enabled: !prev[provider].enabled
      }
    }));
  };

  const handleApiKeyChange = (provider: AIProvider, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        apiKey: value
      }
    }));
  };

  const handleModelChange = (provider: AIProvider, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        selectedModel: value
      }
    }));
  };

  const handleDefaultProviderChange = (provider: AIProvider) => {
    setLocalSettings(prev => ({
      ...prev,
      defaultProvider: provider
    }));
  };

  const handleChatModeChange = (mode: ChatMode) => {
    setLocalSettings(prev => ({
      ...prev,
      chatMode: mode
    }));
  };

  const handleToggleShowThinking = () => {
    setLocalSettings(prev => ({
      ...prev,
      showThinking: !prev.showThinking
    }));
  };

  const handleTemperatureChange = (provider: AIProvider, value: number) => {
    setLocalSettings(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        temperature: value
      }
    }));
  };

  const handleMaxTokensChange = (provider: AIProvider, value: number) => {
    setLocalSettings(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        maxTokens: value
      }
    }));
  };

  // Function to get provider color
  const getProviderColor = (provider: AIProvider) => {
    switch(provider) {
      case 'openai': return 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20';
      case 'gemini': return 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'mistral': return 'border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20';
      case 'claude': return 'border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20';
      case 'llama': return 'border-orange-400 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'deepseek': return 'border-teal-400 dark:border-teal-600 bg-teal-50 dark:bg-teal-900/20';
      default: return 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800';
    }
  };

  // Function to get provider text color
  const getProviderTextColor = (provider: AIProvider) => {
    switch(provider) {
      case 'openai': return 'text-green-700 dark:text-green-400';
      case 'gemini': return 'text-blue-700 dark:text-blue-400';
      case 'mistral': return 'text-purple-700 dark:text-purple-400';
      case 'claude': return 'text-amber-700 dark:text-amber-400';
      case 'llama': return 'text-orange-700 dark:text-orange-400';
      case 'deepseek': return 'text-teal-700 dark:text-teal-400';
      default: return 'text-gray-700 dark:text-gray-400';
    }
  };

  const getProviderButtonColor = (provider: AIProvider, isEnabled: boolean) => {
    if (!isEnabled) return 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300';
    
    switch(provider) {
      case 'openai': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'gemini': return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'mistral': return 'bg-purple-500 hover:bg-purple-600 text-white';
      case 'claude': return 'bg-amber-500 hover:bg-amber-600 text-white';
      case 'llama': return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'deepseek': return 'bg-teal-500 hover:bg-teal-600 text-white';
      default: return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  // Function to get chat mode icon
  const getChatModeIcon = (mode: ChatMode) => {
    switch(mode) {
      case 'thoughtful': return <Brain className="h-4 w-4" />;
      case 'quick': return <Zap className="h-4 w-4" />;
      case 'creative': return <Lightbulb className="h-4 w-4" />;
      case 'technical': return <Code className="h-4 w-4" />;
      case 'learning': return <GraduationCap className="h-4 w-4" />;
    }
  };

  // Function to get chat mode color
  const getChatModeColor = (mode: ChatMode, isSelected: boolean) => {
    if (!isSelected) return 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300';
    
    switch(mode) {
      case 'thoughtful': return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'quick': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'creative': return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'technical': return 'bg-slate-700 hover:bg-slate-800 text-white';
      case 'learning': return 'bg-emerald-600 hover:bg-emerald-700 text-white';
    }
  };

  // Function to get chat mode description
  const getChatModeDescription = (mode: ChatMode) => {
    switch(mode) {
      case 'thoughtful': return 'Detailed, well-considered responses';
      case 'quick': return 'Faster, shorter responses';
      case 'creative': return 'Storytelling, content creation, and imaginative responses';
      case 'technical': return 'Coding, technical explanations, and structured data';
      case 'learning': return 'Educational contexts and explanations';
    }
  };

  return (
    <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sliders className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            Settings
          </h1>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2 dark:border-slate-700 dark:text-slate-300 text-sm h-9 px-3 sm:h-10 sm:px-4">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            </Link>
            <Button 
              onClick={handleSaveSettings} 
              className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2 transition-all text-sm h-9 px-3 sm:h-10 sm:px-4"
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
              className="border-red-300 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm h-9 px-3 sm:h-10 sm:px-4"
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
          <div className={`mb-6 p-3 sm:p-4 rounded-lg ${
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

        {/* Settings Tabs */}
        <div className="space-y-6">
          <ProviderSettings />
          <ChatSettings />
          <SuggestionsSettings />
        </div>

        <div className="mt-6 sm:mt-8 border-t dark:border-slate-700 pt-4 sm:pt-6 text-center">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Your settings are stored locally on your device.
          </p>
          <Button 
            onClick={handleSaveSettings} 
            className="bg-blue-500 hover:bg-blue-600 mt-3 sm:mt-4 transition-all text-sm h-9 px-4 sm:h-10 sm:px-6"
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

function ProviderSettings() {
  const { settings, updateSettings } = useModelSettings();
  const [localSettings, setLocalSettings] = useState<ModelSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleToggleProvider = (provider: AIProvider) => {
    setLocalSettings(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        enabled: !prev[provider].enabled
      }
    }));
  };

  const handleApiKeyChange = (provider: AIProvider, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        apiKey: value
      }
    }));
  };

  const getProviderColor = (provider: AIProvider) => {
    switch(provider) {
      case 'openai': return 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20';
      case 'gemini': return 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'mistral': return 'border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20';
      case 'claude': return 'border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20';
      case 'llama': return 'border-orange-400 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'deepseek': return 'border-teal-400 dark:border-teal-600 bg-teal-50 dark:bg-teal-900/20';
      default: return 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800';
    }
  };

  const getProviderTextColor = (provider: AIProvider) => {
    switch(provider) {
      case 'openai': return 'text-green-700 dark:text-green-400';
      case 'gemini': return 'text-blue-700 dark:text-blue-400';
      case 'mistral': return 'text-purple-700 dark:text-purple-400';
      case 'claude': return 'text-amber-700 dark:text-amber-400';
      case 'llama': return 'text-orange-700 dark:text-orange-400';
      case 'deepseek': return 'text-teal-700 dark:text-teal-400';
      default: return 'text-gray-700 dark:text-gray-400';
    }
  };

  const getProviderButtonColor = (provider: AIProvider, isEnabled: boolean) => {
    if (!isEnabled) return 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300';
    
    switch(provider) {
      case 'openai': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'gemini': return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'mistral': return 'bg-purple-500 hover:bg-purple-600 text-white';
      case 'claude': return 'bg-amber-500 hover:bg-amber-600 text-white';
      case 'llama': return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'deepseek': return 'bg-teal-500 hover:bg-teal-600 text-white';
      default: return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  return (
    <Card className="shadow-md border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 border-b dark:border-slate-700 px-4 py-3 sm:px-6 sm:py-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Key className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700 dark:text-slate-300" />
          AI Provider Settings
        </CardTitle>
        <CardDescription className="dark:text-slate-400 text-xs sm:text-sm">
          Configure your API keys for different AI providers
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Default Provider Selection */}
        <div>
          <h3 className="text-sm font-medium mb-2">Default AI Provider</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Choose which AI provider to use by default when starting a new chat
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(localSettings) as (keyof ModelSettings)[])
              .filter(key => 
                key !== 'defaultProvider' && 
                key !== 'chatMode' && 
                key !== 'showThinking' &&
                key !== 'suggestionsSettings' &&
                typeof localSettings[key] === 'object'
              )
              .map(provider => {
                // Check if this key is a valid AIProvider
                const isAIProvider = provider === 'openai' || provider === 'gemini' || provider === 'mistral' || provider === 'claude' || provider === 'llama' || provider === 'deepseek';
                if (!isAIProvider) return null;
                
                const providerKey = provider as AIProvider;
                return (
                  <Button 
                    key={providerKey}
                    className={`${getProviderButtonColor(providerKey, localSettings[providerKey].enabled)} transition-colors h-10 px-3 sm:h-12 sm:px-5 text-xs sm:text-sm flex-1 sm:flex-none min-w-20`}
                    onClick={() => {
                      setLocalSettings(prev => ({
                        ...prev,
                        defaultProvider: providerKey
                      }))
                    }}
                    disabled={!localSettings[providerKey].enabled}
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-medium">
                        {providerKey.charAt(0).toUpperCase() + providerKey.slice(1)}
                      </span>
                      <span className="text-[10px] sm:text-xs opacity-80">
                        {localSettings.defaultProvider === providerKey && 'Current Default'}
                      </span>
                    </div>
                  </Button>
                );
              })
            }
          </div>
        </div>

        {/* API Key Settings Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
          {/* Map through all provider keys */}
          {(Object.keys(localSettings) as (keyof ModelSettings)[])
            .filter(key => 
              key !== 'defaultProvider' && 
              key !== 'chatMode' && 
              key !== 'showThinking' &&
              key !== 'suggestionsSettings' &&
              typeof localSettings[key] === 'object'
            )
            .map(provider => {
              // Check if this key is a valid AIProvider
              const isAIProvider = provider === 'openai' || provider === 'gemini' || provider === 'mistral' || provider === 'claude' || provider === 'llama' || provider === 'deepseek';
              if (!isAIProvider) return null;
              
              const providerKey = provider as AIProvider;
              return (
                <Card key={providerKey} className={`shadow-md border-l-4 ${getProviderColor(providerKey)}`}>
                  <CardHeader className="pb-2 px-4 pt-4 sm:px-5 sm:pt-5">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Key className={`h-4 w-4 ${getProviderTextColor(providerKey)}`} />
                      {providerKey.charAt(0).toUpperCase() + providerKey.slice(1)} API
                    </CardTitle>
                    <div className="flex justify-between items-center">
                      <CardDescription className="dark:text-slate-400 text-xs">
                        {providerKey === 'openai' && 'Connect to OpenAI models'}
                        {providerKey === 'gemini' && 'Connect to Google AI Studio'}
                        {providerKey === 'mistral' && 'Connect to Mistral AI models'}
                        {providerKey === 'claude' && 'Connect to Anthropic Claude'}
                        {providerKey === 'llama' && 'Connect to Llama 3 models'}
                        {providerKey === 'deepseek' && 'Connect to Deepseek AI models'}
                      </CardDescription>
                      <Button
                        size="sm"
                        onClick={() => handleToggleProvider(providerKey)}
                        className={`${getProviderButtonColor(providerKey, localSettings[providerKey].enabled)} h-7 px-2 text-xs`}
                      >
                        {localSettings[providerKey].enabled ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label htmlFor={`${providerKey}-api-key`} className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          API Key
                        </label>
                        <Textarea
                          id={`${providerKey}-api-key`}
                          value={localSettings[providerKey].apiKey || ''}
                          onChange={(e) => handleApiKeyChange(providerKey, e.target.value)}
                          placeholder={`Enter your ${providerKey.charAt(0).toUpperCase() + providerKey.slice(1)} API key`}
                          className="font-mono text-xs sm:text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                          rows={1}
                        />
                        <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1 flex gap-1 items-center">
                          <span>Get your API key from the</span>
                          <a 
                            href={
                              providerKey === 'openai' ? 'https://platform.openai.com/api-keys' :
                              providerKey === 'gemini' ? 'https://aistudio.google.com/app/apikey' :
                              providerKey === 'mistral' ? 'https://console.mistral.ai/api-keys/' :
                              providerKey === 'claude' ? 'https://console.anthropic.com/keys' :
                              providerKey === 'llama' ? 'https://www.llamaapi.com/' :
                              'https://platform.deepseek.com/'
                            }
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {providerKey.charAt(0).toUpperCase() + providerKey.slice(1)} platform
                          </a>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          }
        </div>
      </CardContent>
    </Card>
  );
}

function ChatSettings() {
  const { settings, updateSettings } = useModelSettings();
  const [localSettings, setLocalSettings] = useState<ModelSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChatModeChange = (mode: ChatMode) => {
    const updatedSettings = {
      ...localSettings,
      chatMode: mode
    };
    setLocalSettings(updatedSettings);
    updateSettings(updatedSettings);
  };

  const handleToggleShowThinking = () => {
    const updatedSettings = {
      ...localSettings,
      showThinking: !localSettings.showThinking
    };
    setLocalSettings(updatedSettings);
    updateSettings(updatedSettings);
  };

  // Function to get chat mode icon
  const getChatModeIcon = (mode: ChatMode) => {
    switch(mode) {
      case 'thoughtful': return <Brain className="h-4 w-4" />;
      case 'quick': return <Zap className="h-4 w-4" />;
      case 'creative': return <Lightbulb className="h-4 w-4" />;
      case 'technical': return <Code className="h-4 w-4" />;
      case 'learning': return <GraduationCap className="h-4 w-4" />;
    }
  };

  // Function to get chat mode color
  const getChatModeColor = (mode: ChatMode) => {
    switch(mode) {
      case 'thoughtful': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'quick': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
      case 'creative': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
      case 'technical': return 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
      case 'learning': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    }
  };

  return (
    <Card className="shadow-md border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 border-b dark:border-slate-700 px-4 py-3 sm:px-6 sm:py-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700 dark:text-slate-300" />
          Chat Mode Settings
        </CardTitle>
        <CardDescription className="dark:text-slate-400 text-xs sm:text-sm">
          Configure chat modes and behavior preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Default Chat Mode</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {['thoughtful', 'quick', 'creative', 'technical', 'learning'].map((mode) => (
                <Button
                  key={mode}
                  variant="outline"
                  className={`flex flex-col items-center py-2 sm:py-3 h-auto gap-1 ${localSettings.chatMode === mode ? getChatModeColor(mode as ChatMode) : ''}`}
                  onClick={() => handleChatModeChange(mode as ChatMode)}
                >
                  {getChatModeIcon(mode as ChatMode)}
                  <span className="text-xs sm:text-sm capitalize">{mode}</span>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Show Thinking Process</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Show AI "thinking" steps during response generation
                </p>
              </div>
              <Button
                variant={localSettings.showThinking ? "default" : "outline"}
                size="sm"
                onClick={handleToggleShowThinking}
                className="gap-1.5"
              >
                {localSettings.showThinking ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {localSettings.showThinking ? "Visible" : "Hidden"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 