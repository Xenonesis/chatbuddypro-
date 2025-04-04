import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useModelSettings, ModelSettings, AIProvider } from '@/lib/context/ModelSettingsContext';
import { Key, Laptop } from 'lucide-react';
import { getProviderColor, getProviderTextColor, getProviderButtonColor } from './SettingsUtils';

export default function ProviderSettings() {
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

  return (
    <Card className="border dark:border-slate-700">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Laptop className="h-5 w-5 text-blue-500" />
          AI Providers
        </CardTitle>
        <CardDescription>
          Enable and configure the AI providers you want to use
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Default Provider Selection */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
            Select Default Provider
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
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
                    className={`${getProviderButtonColor(providerKey, localSettings[providerKey].enabled)} transition-colors h-12 sm:h-12 px-2 sm:px-3 provider-btn`}
                    onClick={() => {
                      setLocalSettings(prev => ({
                        ...prev,
                        defaultProvider: providerKey
                      }))
                    }}
                    disabled={!localSettings[providerKey].enabled}
                  >
                    <div className="flex flex-col items-center w-full">
                      <span className="font-medium text-sm sm:text-base">
                        {providerKey.charAt(0).toUpperCase() + providerKey.slice(1)}
                      </span>
                      {localSettings.defaultProvider === providerKey && (
                        <span className="text-[10px] sm:text-xs opacity-80">
                          Current Default
                        </span>
                      )}
                    </div>
                  </Button>
                );
              })
            }
          </div>
        </div>

        {/* API Key Settings Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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