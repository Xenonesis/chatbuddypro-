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
      case 'openai': return 'border-green-400 bg-green-50';
      case 'gemini': return 'border-blue-400 bg-blue-50';
      case 'mistral': return 'border-purple-400 bg-purple-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  // Function to get provider text color
  const getProviderTextColor = (provider: AIProvider) => {
    switch(provider) {
      case 'openai': return 'text-green-700';
      case 'gemini': return 'text-blue-700';
      case 'mistral': return 'text-purple-700';
      default: return 'text-gray-700';
    }
  };

  const getProviderButtonColor = (provider: AIProvider, isEnabled: boolean) => {
    if (!isEnabled) return 'bg-slate-200 hover:bg-slate-300 text-slate-700';
    
    switch(provider) {
      case 'openai': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'gemini': return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'mistral': return 'bg-purple-500 hover:bg-purple-600 text-white';
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
    if (!isSelected) return 'bg-slate-200 hover:bg-slate-300 text-slate-700';
    
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
            <Sliders className="h-6 w-6 text-slate-700" />
            Settings
          </h1>
          <div className="flex gap-3">
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
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
              className="border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => {
                if (window.confirm('Reset all settings to default values? This will clear your API keys and preferences.')) {
                  localStorage.removeItem('aiSettings');
                  localStorage.removeItem('NEXT_PUBLIC_OPENAI_API_KEY');
                  localStorage.removeItem('NEXT_PUBLIC_GEMINI_API_KEY');
                  localStorage.removeItem('NEXT_PUBLIC_MISTRAL_API_KEY');
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
              ? 'bg-red-100 text-red-700 border border-red-300' 
              : 'bg-green-100 text-green-700 border border-green-300'
          } flex items-center gap-2 animate-fadeIn`}>
            {saveStatus.includes('Error') ? (
              <span className="text-red-500">⚠️</span>
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {saveStatus}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Default Provider Settings Card */}
          <Card className="shadow-md border-0 overflow-hidden col-span-full">
            <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Laptop className="h-5 w-5 text-slate-700" />
                Default AI Provider
              </CardTitle>
              <CardDescription>
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
                    const isAIProvider = provider === 'openai' || provider === 'gemini' || provider === 'mistral';
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
            <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-slate-700" />
                Chat Mode Settings
              </CardTitle>
              <CardDescription>
                Choose the default chat mode and display preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Default Chat Mode</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {(['thoughtful', 'quick', 'creative', 'technical', 'learning'] as ChatMode[]).map(mode => (
                  <div 
                    key={mode}
                    className={`border rounded-lg ${
                      localSettings.chatMode === mode 
                        ? 'border-blue-300 ring-1 ring-blue-300' 
                        : 'border-slate-200'
                    } p-4 cursor-pointer transition-all hover:border-blue-200`}
                    onClick={() => handleChatModeChange(mode)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded flex items-center justify-center ${
                          getChatModeColor(mode, localSettings.chatMode === mode).split(' ')[0]
                        } text-white`}>
                          {getChatModeIcon(mode)}
                        </div>
                        <span className="font-medium">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                      </div>
                      {localSettings.chatMode === mode && (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{getChatModeDescription(mode)}</p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-5 mt-2">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Display Options</h3>
                <div 
                  className={`border rounded-lg flex items-center justify-between p-4 cursor-pointer transition-all hover:border-blue-200 ${
                    localSettings.showThinking ? 'border-blue-300 bg-blue-50' : 'border-slate-200'
                  }`}
                  onClick={handleToggleShowThinking}
                >
                  <div className="flex items-center gap-3">
                    {localSettings.showThinking ? (
                      <Eye className="h-5 w-5 text-blue-500" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-slate-500" />
                    )}
                    <div>
                      <p className="font-medium">Show Thinking Process</p>
                      <p className="text-xs text-slate-600">
                        {localSettings.showThinking 
                          ? "Thinking process will be displayed when available" 
                          : "Thinking process will be hidden"
                        }
                      </p>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${
                    localSettings.showThinking ? 'bg-blue-500' : 'bg-slate-300'
                  }`}>
                    <div className={`absolute w-4 h-4 rounded-full bg-white top-0.5 transition-all ${
                      localSettings.showThinking ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* OpenAI Settings */}
          <Card className={`${localSettings.openai.enabled ? '' : 'opacity-75'} shadow-md border-t-4 ${getProviderColor('openai').split(' ')[0]} overflow-hidden`}>
            <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b p-5">
              <div className="flex justify-between items-center">
                <CardTitle className={`flex items-center gap-2 ${getProviderTextColor('openai')}`}>
                  OpenAI
                </CardTitle>
                <Button 
                  variant={localSettings.openai.enabled ? "default" : "outline"}
                  onClick={() => handleToggleProvider('openai')}
                  className={localSettings.openai.enabled ? 'bg-green-500 hover:bg-green-600' : ''}
                >
                  {localSettings.openai.enabled ? "Enabled" : "Disabled"}
                </Button>
              </div>
              <CardDescription>
                Configure your OpenAI API settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm font-medium mb-1">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-slate-500" /> API Key
                  </div>
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 hover:text-green-800"
                  >
                    Get OpenAI API Key →
                  </a>
                </label>
                <Textarea 
                  placeholder="Enter your OpenAI API key" 
                  value={localSettings.openai.apiKey}
                  onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                  className="font-mono text-sm resize-none h-[60px] border-slate-200 focus-visible:ring-green-400"
                  disabled={!localSettings.openai.enabled}
                />
                {localSettings.openai.enabled && !localSettings.openai.apiKey && (
                  <p className="text-xs text-orange-600 mt-1">
                    You'll need an API key to use OpenAI models
                  </p>
                )}
                {localSettings.openai.enabled && localSettings.openai.apiKey && (
                  <p className="text-xs text-green-600 mt-1">
                    API key saved ✓
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium mb-1">
                  <Dna className="h-4 w-4 text-slate-500" /> Model
                </label>
                <select 
                  className="w-full p-2.5 border rounded border-slate-200 focus:border-green-400 focus:ring-green-400 text-sm bg-white"
                  value={localSettings.openai.selectedModel}
                  onChange={(e) => handleModelChange('openai', e.target.value)}
                  aria-label="Select OpenAI model"
                  disabled={!localSettings.openai.enabled}
                >
                  {localSettings.openai.models.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium mb-1">
                    <Thermometer className="h-4 w-4 text-slate-500" /> 
                    Temperature: <span className="ml-1 text-green-600 font-semibold">{localSettings.openai.temperature.toFixed(1)}</span>
                  </label>
                  <div className="pt-1">
                    <input 
                      type="range" 
                      min="0" 
                      max="2" 
                      step="0.1"
                      value={localSettings.openai.temperature}
                      onChange={(e) => handleTemperatureChange('openai', parseFloat(e.target.value))}
                      className="w-full accent-green-500"
                      aria-label={`OpenAI temperature: ${localSettings.openai.temperature}`}
                      disabled={!localSettings.openai.enabled}
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Precise</span>
                      <span>Balanced</span>
                      <span>Creative</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium mb-1">
                    Max Tokens: <span className="ml-1 text-green-600 font-semibold">{localSettings.openai.maxTokens}</span>
                  </label>
                  <div className="pt-1">
                    <input 
                      type="range" 
                      min="100" 
                      max="2000" 
                      step="100"
                      value={localSettings.openai.maxTokens}
                      onChange={(e) => handleMaxTokensChange('openai', parseInt(e.target.value))}
                      className="w-full accent-green-500"
                      aria-label={`OpenAI max tokens: ${localSettings.openai.maxTokens}`}
                      disabled={!localSettings.openai.enabled}
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Short</span>
                      <span>Medium</span>
                      <span>Long</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gemini Settings */}
          <Card className={`${localSettings.gemini.enabled ? '' : 'opacity-75'} shadow-md border-t-4 ${getProviderColor('gemini').split(' ')[0]} overflow-hidden`}>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b p-5">
              <div className="flex justify-between items-center">
                <CardTitle className={`flex items-center gap-2 ${getProviderTextColor('gemini')}`}>
                  Google Gemini
                </CardTitle>
                <Button 
                  variant={localSettings.gemini.enabled ? "default" : "outline"}
                  onClick={() => handleToggleProvider('gemini')}
                  className={localSettings.gemini.enabled ? 'bg-blue-500 hover:bg-blue-600' : ''}
                >
                  {localSettings.gemini.enabled ? "Enabled" : "Disabled"}
                </Button>
              </div>
              <CardDescription>
                Configure your Google Gemini API settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm font-medium mb-1">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-slate-500" /> API Key
                  </div>
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Get Gemini API Key →
                  </a>
                </label>
                <Textarea 
                  placeholder="Enter your Gemini API key (starts with AIza...)" 
                  value={localSettings.gemini.apiKey}
                  onChange={(e) => handleApiKeyChange('gemini', e.target.value)}
                  className="font-mono text-sm resize-none h-[60px] border-slate-200 focus-visible:ring-blue-400"
                  disabled={!localSettings.gemini.enabled}
                />
                {localSettings.gemini.enabled && !localSettings.gemini.apiKey && (
                  <p className="text-xs text-orange-600 mt-1">
                    You'll need an API key to use Gemini models
                  </p>
                )}
                {localSettings.gemini.enabled && localSettings.gemini.apiKey && !localSettings.gemini.apiKey.startsWith('AIza') && (
                  <p className="text-xs text-red-600 mt-1">
                    Gemini API keys must start with 'AIza'
                  </p>
                )}
                {localSettings.gemini.enabled && localSettings.gemini.apiKey && localSettings.gemini.apiKey.startsWith('AIza') && (
                  <p className="text-xs text-green-600 mt-1">
                    API key saved ✓
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium mb-1">
                  <Dna className="h-4 w-4 text-slate-500" /> Model
                </label>
                <select 
                  className="w-full p-2.5 border rounded border-slate-200 focus:border-blue-400 focus:ring-blue-400 text-sm bg-white"
                  value={localSettings.gemini.selectedModel}
                  onChange={(e) => handleModelChange('gemini', e.target.value)}
                  aria-label="Select Gemini model"
                  disabled={!localSettings.gemini.enabled}
                >
                  {localSettings.gemini.models.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium mb-1">
                    <Thermometer className="h-4 w-4 text-slate-500" /> 
                    Temperature: <span className="ml-1 text-blue-600 font-semibold">{localSettings.gemini.temperature.toFixed(1)}</span>
                  </label>
                  <div className="pt-1">
                    <input 
                      type="range" 
                      min="0" 
                      max="2" 
                      step="0.1"
                      value={localSettings.gemini.temperature}
                      onChange={(e) => handleTemperatureChange('gemini', parseFloat(e.target.value))}
                      className="w-full accent-blue-500"
                      aria-label={`Gemini temperature: ${localSettings.gemini.temperature}`}
                      disabled={!localSettings.gemini.enabled}
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Precise</span>
                      <span>Balanced</span>
                      <span>Creative</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium mb-1">
                    Max Tokens: <span className="ml-1 text-blue-600 font-semibold">{localSettings.gemini.maxTokens}</span>
                  </label>
                  <div className="pt-1">
                    <input 
                      type="range" 
                      min="100" 
                      max="2000" 
                      step="100"
                      value={localSettings.gemini.maxTokens}
                      onChange={(e) => handleMaxTokensChange('gemini', parseInt(e.target.value))}
                      className="w-full accent-blue-500"
                      aria-label={`Gemini max tokens: ${localSettings.gemini.maxTokens}`}
                      disabled={!localSettings.gemini.enabled}
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Short</span>
                      <span>Medium</span>
                      <span>Long</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mistral Settings */}
          <Card className={`${localSettings.mistral.enabled ? '' : 'opacity-75'} shadow-md border-t-4 ${getProviderColor('mistral').split(' ')[0]} overflow-hidden md:col-span-2`}>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b p-5">
              <div className="flex justify-between items-center">
                <CardTitle className={`flex items-center gap-2 ${getProviderTextColor('mistral')}`}>
                  Mistral AI
                </CardTitle>
                <Button 
                  variant={localSettings.mistral.enabled ? "default" : "outline"}
                  onClick={() => handleToggleProvider('mistral')}
                  className={localSettings.mistral.enabled ? 'bg-purple-500 hover:bg-purple-600' : ''}
                >
                  {localSettings.mistral.enabled ? "Enabled" : "Disabled"}
                </Button>
              </div>
              <CardDescription>
                Configure your Mistral AI API settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm font-medium mb-1">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-slate-500" /> API Key
                  </div>
                  <a 
                    href="https://console.mistral.ai/api-keys/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 hover:text-purple-800"
                  >
                    Get Mistral API Key →
                  </a>
                </label>
                <Textarea 
                  placeholder="Enter your Mistral API key" 
                  value={localSettings.mistral.apiKey}
                  onChange={(e) => handleApiKeyChange('mistral', e.target.value)}
                  className="font-mono text-sm resize-none h-[60px] border-slate-200 focus-visible:ring-purple-400"
                  disabled={!localSettings.mistral.enabled}
                />
                {localSettings.mistral.enabled && !localSettings.mistral.apiKey && (
                  <p className="text-xs text-orange-600 mt-1">
                    You'll need an API key to use Mistral models
                  </p>
                )}
                {localSettings.mistral.enabled && localSettings.mistral.apiKey && (
                  <p className="text-xs text-green-600 mt-1">
                    API key saved ✓
                  </p>
                )}
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium mb-1">
                    <Dna className="h-4 w-4 text-slate-500" /> Model
                  </label>
                  <select 
                    className="w-full p-2.5 border rounded border-slate-200 focus:border-purple-400 focus:ring-purple-400 text-sm bg-white"
                    value={localSettings.mistral.selectedModel}
                    onChange={(e) => handleModelChange('mistral', e.target.value)}
                    aria-label="Select Mistral model"
                    disabled={!localSettings.mistral.enabled}
                  >
                    {localSettings.mistral.models.map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium mb-1">
                    <Thermometer className="h-4 w-4 text-slate-500" /> 
                    Temperature: <span className="ml-1 text-purple-600 font-semibold">{localSettings.mistral.temperature.toFixed(1)}</span>
                  </label>
                  <div className="pt-1">
                    <input 
                      type="range" 
                      min="0" 
                      max="2" 
                      step="0.1"
                      value={localSettings.mistral.temperature}
                      onChange={(e) => handleTemperatureChange('mistral', parseFloat(e.target.value))}
                      className="w-full accent-purple-500"
                      aria-label={`Mistral temperature: ${localSettings.mistral.temperature}`}
                      disabled={!localSettings.mistral.enabled}
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Precise</span>
                      <span>Balanced</span>
                      <span>Creative</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium mb-1">
                    Max Tokens: <span className="ml-1 text-purple-600 font-semibold">{localSettings.mistral.maxTokens}</span>
                  </label>
                  <div className="pt-1">
                    <input 
                      type="range" 
                      min="100" 
                      max="2000" 
                      step="100"
                      value={localSettings.mistral.maxTokens}
                      onChange={(e) => handleMaxTokensChange('mistral', parseInt(e.target.value))}
                      className="w-full accent-purple-500"
                      aria-label={`Mistral max tokens: ${localSettings.mistral.maxTokens}`}
                      disabled={!localSettings.mistral.enabled}
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Short</span>
                      <span>Medium</span>
                      <span>Long</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mt-8">
          <p className="text-sm text-slate-500">Your settings are stored locally on your device.</p>
          <Button 
            onClick={handleSaveSettings} 
            className={`${savedAnimation ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'} flex items-center gap-2 transition-all`}
          >
            {savedAnimation ? (
              <CheckCircle className="h-4 w-4 animate-pulse" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
} 