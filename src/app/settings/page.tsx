"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useModelSettings, ModelSettings, AIProvider, ChatMode } from '@/lib/context/ModelSettingsContext';
import { ArrowLeft, Save, CheckCircle, Key, Thermometer, Dna, Laptop, Sliders, 
  Brain, Zap, Lightbulb, Code, GraduationCap, Eye, EyeOff, MessageSquare } from 'lucide-react';

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
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sliders className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            Settings
          </h1>
          <div className="flex gap-3">
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2 dark:border-slate-700 dark:text-slate-300">
                <ArrowLeft className="h-4 w-4" />
                Back to Chat
              </Button>
            </Link>
            <Button 
              onClick={handleSaveSettings} 
              className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2 transition-all"
            >
              {savedAnimation ? (
                <CheckCircle className="h-4 w-4 animate-pulse" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Settings
            </Button>
            <Button 
              variant="outline" 
              className="border-red-300 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
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
              Reset to Default
            </Button>
          </div>
        </div>

        {saveStatus && (
          <div className={`mb-6 p-4 rounded-lg ${
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Default Provider Settings Card */}
          <Card className="shadow-md border-0 overflow-hidden col-span-full">
            <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 border-b dark:border-slate-700">
              <CardTitle className="flex items-center gap-2">
                <Laptop className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                Default AI Provider
              </CardTitle>
              <CardDescription className="dark:text-slate-400">
                Choose which AI provider to use by default when starting a new chat
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                {(Object.keys(localSettings) as (keyof ModelSettings)[])
                  .filter(key => 
                    key !== 'defaultProvider' && 
                    key !== 'chatMode' && 
                    key !== 'showThinking' &&
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
                        className={`${getProviderButtonColor(providerKey, localSettings[providerKey].enabled)} transition-colors h-12 px-5`}
                        onClick={() => handleDefaultProviderChange(providerKey)}
                        disabled={!localSettings[providerKey].enabled}
                      >
                        <div className="flex flex-col items-center">
                          <span className="font-medium">
                            {providerKey.charAt(0).toUpperCase() + providerKey.slice(1)}
                          </span>
                          <span className="text-xs opacity-80">
                            {localSettings.defaultProvider === providerKey && 'Current Default'}
                          </span>
                        </div>
                      </Button>
                    );
                  })
                }
              </div>
            </CardContent>
          </Card>

          {/* Chat Mode Settings Card */}
          <Card className="shadow-md border-0 overflow-hidden col-span-full">
            <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 border-b dark:border-slate-700">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                Chat Mode Settings
              </CardTitle>
              <CardDescription className="dark:text-slate-400">
                Choose the default chat mode and display preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Default Chat Mode</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {(['thoughtful', 'quick', 'creative', 'technical', 'learning'] as ChatMode[]).map(mode => (
                  <div 
                    key={mode}
                    className={`border rounded-lg ${
                      localSettings.chatMode === mode 
                        ? 'border-blue-300 dark:border-blue-500 ring-1 ring-blue-300 dark:ring-blue-500' 
                        : 'border-slate-200 dark:border-slate-700'
                    } p-4 cursor-pointer transition-all hover:border-blue-200 dark:hover:border-blue-700`}
                    onClick={() => handleChatModeChange(mode)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded flex items-center justify-center ${
                          getChatModeColor(mode, localSettings.chatMode === mode).split(' ')[0]
                        } text-white`}>
                          {getChatModeIcon(mode)}
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                      </div>
                      {localSettings.chatMode === mode && (
                        <CheckCircle className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{getChatModeDescription(mode)}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Display Options</h3>
                <div className="border dark:border-slate-700 rounded-lg p-4">
                <div 
                    className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      localSettings.showThinking ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={handleToggleShowThinking}
                >
                  <div className="flex items-center gap-3">
                    {localSettings.showThinking ? (
                        <Eye className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    ) : (
                        <EyeOff className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    )}
                    <div>
                        <h4 className="font-medium text-slate-800 dark:text-slate-300">Show Thinking Process</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Thinking process will be hidden</p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${
                      localSettings.showThinking ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                        localSettings.showThinking ? 'translate-x-6' : ''
                    }`} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* API Key Settings */}
          <h2 className="text-xl font-semibold mb-5 col-span-full flex items-center gap-2 mt-4">
            <Key className="h-5 w-5 text-slate-700 dark:text-slate-300" /> 
            API Keys
          </h2>
          
          <Card className={`shadow-md border-l-4 ${getProviderColor('openai')}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Key className={`h-5 w-5 ${getProviderTextColor('openai')}`} />
                OpenAI API
              </CardTitle>
              <div className="flex justify-between items-center">
                <CardDescription className="dark:text-slate-400">
                  Connect to OpenAI models
                </CardDescription>
                <Button
                  size="sm"
                  onClick={() => handleToggleProvider('openai')}
                  className={`${getProviderButtonColor('openai', localSettings.openai.enabled)}`}
                >
                  {localSettings.openai.enabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
              <div>
                  <label htmlFor="openai-api-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    API Key
                  </label>
                <Textarea
                    id="openai-api-key"
                    value={localSettings.openai.apiKey || ''}
                  onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                    placeholder="Enter your OpenAI API key (starts with sk-...)"
                    className="font-mono text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                    rows={1}
                />
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex gap-1 items-center">
                    <span>Get your API key from the</span>
                    <a 
                      href="https://platform.openai.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      OpenAI platform
                    </a>
                </p>
              </div>
              <div>
                  <label htmlFor="openai-model" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Model
                </label>
                <select
                    id="openai-model"
                  value={localSettings.openai.selectedModel}
                  onChange={(e) => handleModelChange('openai', e.target.value)}
                    className="w-full rounded-md px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    disabled={!localSettings.openai.enabled}
                  >
                    <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                    <option value="gpt-3.5-turbo-16k">gpt-3.5-turbo-16k</option>
                    <option value="gpt-4">gpt-4</option>
                    <option value="gpt-4-turbo">gpt-4-turbo</option>
                    <option value="gpt-4o">gpt-4o</option>
                </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gemini API Card */}
          <Card className={`shadow-md border-l-4 ${getProviderColor('gemini')}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Key className={`h-5 w-5 ${getProviderTextColor('gemini')}`} />
                Google Gemini API
              </CardTitle>
              <div className="flex justify-between items-center">
                <CardDescription className="dark:text-slate-400">
                  Connect to Google AI Studio
                </CardDescription>
                <Button
                  size="sm"
                  onClick={() => handleToggleProvider('gemini')}
                  className={`${getProviderButtonColor('gemini', localSettings.gemini.enabled)}`}
                >
                  {localSettings.gemini.enabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
              <div>
                  <label htmlFor="gemini-api-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    API Key
                  </label>
                <Textarea
                    id="gemini-api-key"
                    value={localSettings.gemini.apiKey || ''}
                    onChange={(e) => handleApiKeyChange('gemini', e.target.value)}
                  placeholder="Enter your Gemini API key (starts with AIza...)"
                    className="font-mono text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                    rows={1}
                />
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex gap-1 items-center">
                    <span>Get your API key from the</span>
                    <a 
                      href="https://aistudio.google.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Google AI Studio
                    </a>
                </p>
              </div>
              <div>
                  <label htmlFor="gemini-model" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Model
                </label>
                <select
                    id="gemini-model"
                  value={localSettings.gemini.selectedModel}
                  onChange={(e) => handleModelChange('gemini', e.target.value)}
                    className="w-full rounded-md px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    disabled={!localSettings.gemini.enabled}
                  >
                    <option value="gemini-pro">gemini-pro</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                    <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mistral API Card */}
          <Card className={`shadow-md border-l-4 ${getProviderColor('mistral')}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Key className={`h-5 w-5 ${getProviderTextColor('mistral')}`} />
                Mistral API
              </CardTitle>
              <div className="flex justify-between items-center">
                <CardDescription className="dark:text-slate-400">
                  Connect to Mistral AI models
                </CardDescription>
                <Button
                  size="sm"
                  onClick={() => handleToggleProvider('mistral')}
                  className={`${getProviderButtonColor('mistral', localSettings.mistral.enabled)}`}
                >
                  {localSettings.mistral.enabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
              <div>
                  <label htmlFor="mistral-api-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    API Key
                  </label>
                <Textarea
                    id="mistral-api-key"
                    value={localSettings.mistral.apiKey || ''}
                    onChange={(e) => handleApiKeyChange('mistral', e.target.value)}
                  placeholder="Enter your Mistral API key"
                    className="font-mono text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                    rows={1}
                />
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex gap-1 items-center">
                    <span>Get your API key from the</span>
                    <a 
                      href="https://console.mistral.ai/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Mistral Console
                    </a>
                </p>
              </div>
              <div>
                  <label htmlFor="mistral-model" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Model
                </label>
                <select
                    id="mistral-model"
                  value={localSettings.mistral.selectedModel}
                  onChange={(e) => handleModelChange('mistral', e.target.value)}
                    className="w-full rounded-md px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    disabled={!localSettings.mistral.enabled}
                  >
                    <option value="mistral-small">mistral-small</option>
                    <option value="mistral-medium">mistral-medium</option>
                    <option value="mistral-large">mistral-large</option>
                </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Claude API Card */}
          <Card className={`shadow-md border-l-4 ${getProviderColor('claude')}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Key className={`h-5 w-5 ${getProviderTextColor('claude')}`} />
                Anthropic Claude API
              </CardTitle>
              <div className="flex justify-between items-center">
                <CardDescription className="dark:text-slate-400">
                  Connect to Anthropic Claude AI models
                </CardDescription>
                <Button
                  size="sm"
                  onClick={() => handleToggleProvider('claude')}
                  className={`${getProviderButtonColor('claude', localSettings.claude.enabled)}`}
                >
                  {localSettings.claude.enabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
              <div>
                  <label htmlFor="claude-api-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    API Key
                  </label>
                <Textarea
                    id="claude-api-key"
                    value={localSettings.claude.apiKey || ''}
                    onChange={(e) => handleApiKeyChange('claude', e.target.value)}
                  placeholder="Enter your Claude API key"
                    className="font-mono text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                    rows={1}
                />
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex gap-1 items-center">
                    <span>Get your API key from the</span>
                    <a 
                      href="https://console.anthropic.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Anthropic Console
                    </a>
                </p>
              </div>
              <div>
                  <label htmlFor="claude-model" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Model
                </label>
                <select
                    id="claude-model"
                  value={localSettings.claude.selectedModel}
                  onChange={(e) => handleModelChange('claude', e.target.value)}
                    className="w-full rounded-md px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    disabled={!localSettings.claude.enabled}
                  >
                    <option value="claude-3-5-sonnet-20240620">claude-3.5-sonnet</option>
                    <option value="claude-3-opus-20240229">claude-3-opus</option>
                    <option value="claude-3-sonnet-20240229">claude-3-sonnet</option>
                    <option value="claude-3-haiku-20240307">claude-3-haiku</option>
                </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Llama API Card */}
          <Card className={`shadow-md border-l-4 ${getProviderColor('llama')}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Key className={`h-5 w-5 ${getProviderTextColor('llama')}`} />
                Meta's Llama API
              </CardTitle>
              <div className="flex justify-between items-center">
                <CardDescription className="dark:text-slate-400">
                  Connect to Meta's Llama models via Together.ai
                </CardDescription>
                <Button
                  size="sm"
                  onClick={() => handleToggleProvider('llama')}
                  className={`${getProviderButtonColor('llama', localSettings.llama.enabled)}`}
                >
                  {localSettings.llama.enabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
              <div>
                  <label htmlFor="llama-api-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Together.ai API Key
                  </label>
                <Textarea
                    id="llama-api-key"
                    value={localSettings.llama.apiKey || ''}
                    onChange={(e) => handleApiKeyChange('llama', e.target.value)}
                  placeholder="Enter your Together.ai API key for Llama"
                    className="font-mono text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                    rows={1}
                />
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex gap-1 items-center">
                    <span>Get your API key from</span>
                    <a 
                      href="https://api.together.xyz/settings/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Together.ai
                    </a>
                </p>
              </div>
              <div>
                  <label htmlFor="llama-model" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Model
                </label>
                <select
                    id="llama-model"
                  value={localSettings.llama.selectedModel}
                  onChange={(e) => handleModelChange('llama', e.target.value)}
                    className="w-full rounded-md px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    disabled={!localSettings.llama.enabled}
                  >
                    <option value="llama-3-8b-instruct">llama-3-8b-instruct</option>
                    <option value="llama-3-70b-instruct">llama-3-70b-instruct</option>
                    <option value="llama-2-70b-chat">llama-2-70b-chat</option>
                </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deepseek API Card */}
          <Card className={`shadow-md border-l-4 ${getProviderColor('deepseek')}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Key className={`h-5 w-5 ${getProviderTextColor('deepseek')}`} />
                Deepseek API
              </CardTitle>
              <div className="flex justify-between items-center">
                <CardDescription className="dark:text-slate-400">
                  Connect to Deepseek AI models
                </CardDescription>
                <Button
                  size="sm"
                  onClick={() => handleToggleProvider('deepseek')}
                  className={`${getProviderButtonColor('deepseek', localSettings.deepseek.enabled)}`}
                >
                  {localSettings.deepseek.enabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
              <div>
                  <label htmlFor="deepseek-api-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    API Key
                  </label>
                <Textarea
                    id="deepseek-api-key"
                    value={localSettings.deepseek.apiKey || ''}
                    onChange={(e) => handleApiKeyChange('deepseek', e.target.value)}
                  placeholder="Enter your Deepseek API key"
                    className="font-mono text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                    rows={1}
                />
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex gap-1 items-center">
                    <span>Get your API key from the</span>
                    <a 
                      href="https://platform.deepseek.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Deepseek platform
                    </a>
                </p>
              </div>
              <div>
                  <label htmlFor="deepseek-model" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Model
                </label>
                <select
                    id="deepseek-model"
                  value={localSettings.deepseek.selectedModel}
                  onChange={(e) => handleModelChange('deepseek', e.target.value)}
                    className="w-full rounded-md px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    disabled={!localSettings.deepseek.enabled}
                >
                    <option value="deepseek-chat">deepseek-chat</option>
                    <option value="deepseek-coder">deepseek-coder</option>
                </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 border-t dark:border-slate-700 pt-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your settings are stored locally on your device.
          </p>
          <Button 
            onClick={handleSaveSettings} 
            className="bg-blue-500 hover:bg-blue-600 mt-4 transition-all"
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