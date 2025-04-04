import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useModelSettings, ModelSettings, AIProvider } from '@/lib/context/ModelSettingsContext';
import { Key, Laptop, EyeOff, Eye, Bot, Cpu, Cloud, FlaskConical, Flame, Star, Save, Info, Lock, CheckCircle2 } from 'lucide-react';
import { getProviderColor, getProviderTextColor, getProviderButtonColor } from './SettingsUtils';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

export default function ProviderSettings() {
  const { settings, updateSettings } = useModelSettings();
  const [localSettings, setLocalSettings] = useState<ModelSettings>(settings);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [activeView, setActiveView] = useState('list');
  const { toast } = useToast();
  
  // Initialize settings from props
  useEffect(() => {
    console.log("Initializing settings from props:", settings);
    setLocalSettings({...settings});
    
    // Initialize showApiKeys state for all providers
    const initialShowApiKeys: Record<string, boolean> = {};
    Object.keys(settings)
      .filter(key => 
        key !== 'defaultProvider' && 
        key !== 'chatMode' && 
        key !== 'showThinking' &&
        key !== 'suggestionsSettings' &&
        key !== 'voiceInputSettings' &&
        typeof (settings as Record<string, unknown>)[key] === 'object'
      )
      .forEach(provider => {
        initialShowApiKeys[provider] = false;
      });
    setShowApiKeys(initialShowApiKeys);
  }, [settings]);

  // Check for changes between local and global settings
  useEffect(() => {
    // Convert settings to JSON for deep comparison
    const settingsJson = JSON.stringify(settings);
    const localSettingsJson = JSON.stringify(localSettings);
    setHasChanges(settingsJson !== localSettingsJson);
  }, [settings, localSettings]);

  // Handle view toggle with forced state reset to ensure clean rendering
  const handleViewToggle = useCallback((view: string) => {
    console.log(`Switching to ${view} view`);
    setActiveView(view);
  }, []);

  // Completely rewritten toggle handler with guaranteed state updates
  const handleToggleProvider = useCallback((provider: AIProvider) => {
    console.log(`Toggling provider ${provider} status`);
    
    setLocalSettings(currentSettings => {
      // Create a deep copy to avoid mutation issues
      const newSettings = JSON.parse(JSON.stringify(currentSettings)) as ModelSettings;
      
      // Get current status
      const isCurrentlyEnabled = (newSettings as Record<string, any>)[provider].enabled;
      const isCurrentDefault = newSettings.defaultProvider === provider;
      
      // Toggle the enabled status
      (newSettings as Record<string, any>)[provider].enabled = !isCurrentlyEnabled;
      
      // If we're disabling the current default provider, we need to pick a new default
      if (isCurrentDefault && isCurrentlyEnabled) {
        // Find the first enabled provider to be the new default
        const firstEnabledProvider = Object.keys(newSettings)
          .filter(key => 
            key !== 'defaultProvider' && 
            key !== 'chatMode' && 
            key !== 'showThinking' &&
            key !== 'suggestionsSettings' &&
            key !== 'voiceInputSettings' &&
            typeof (newSettings as Record<string, unknown>)[key] === 'object' &&
            key !== provider &&
            (newSettings as Record<string, any>)[key].enabled
          )[0] as AIProvider | undefined;
          
        if (firstEnabledProvider) {
          console.log(`Setting new default provider: ${firstEnabledProvider}`);
          newSettings.defaultProvider = firstEnabledProvider;
        }
      }
      
      console.log('Updated settings:', newSettings);
      return newSettings;
    });
  }, []);

  // Set default provider with guaranteed state update
  const handleSetDefaultProvider = useCallback((provider: AIProvider) => {
    console.log(`Setting default provider to ${provider}`);
    
    setLocalSettings(currentSettings => {
      // Create a deep copy to avoid mutation issues
      const newSettings = JSON.parse(JSON.stringify(currentSettings)) as ModelSettings;
      
      if (newSettings[provider].enabled) {
        newSettings.defaultProvider = provider;
        console.log('Updated settings:', newSettings);
      }
      
      return newSettings;
    });
  }, []);

  const handleApiKeyChange = useCallback((provider: AIProvider, value: string) => {
    setLocalSettings(current => {
      const newSettings = JSON.parse(JSON.stringify(current)) as ModelSettings;
      (newSettings as Record<string, any>)[provider].apiKey = value;
      return newSettings;
    });
  }, []);

  const handleSaveChanges = useCallback(() => {
    console.log('Saving changes:', localSettings);
    updateSettings(localSettings);
    toast({
      title: "Settings saved",
      description: "Your AI provider settings have been updated.",
    });
  }, [localSettings, updateSettings, toast]);

  const toggleShowApiKey = useCallback((provider: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  }, []);

  const getProviderIcon = useCallback((provider: AIProvider) => {
    switch(provider) {
      case 'openai': return <Bot className="h-5 w-5" />;
      case 'gemini': return <Cpu className="h-5 w-5" />;
      case 'mistral': return <Cloud className="h-5 w-5" />;
      case 'claude': return <FlaskConical className="h-5 w-5" />;
      case 'llama': return <Flame className="h-5 w-5" />;
      case 'deepseek': return <Star className="h-5 w-5" />;
      default: return <Bot className="h-5 w-5" />;
    }
  }, []);

  // Filter valid providers once instead of repeatedly
  const validProviders = Object.keys(localSettings)
    .filter(key => 
      key !== 'defaultProvider' && 
      key !== 'chatMode' && 
      key !== 'showThinking' &&
      key !== 'suggestionsSettings' &&
      key !== 'voiceInputSettings' &&
      typeof (localSettings as Record<string, unknown>)[key] === 'object'
    )
    .filter(provider => 
      provider === 'openai' || 
      provider === 'gemini' || 
      provider === 'mistral' || 
      provider === 'claude' || 
      provider === 'llama' || 
      provider === 'deepseek'
    )
    .map(provider => provider as AIProvider);

  // Render provider list view with optimized rendering
  const renderProviderList = useCallback(() => (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-500" />
          Select Your Default Provider
        </h3>

        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md p-3 mb-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {validProviders.map(providerKey => (
              <TooltipProvider key={`list-default-${providerKey}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button"
                      className={cn(
                        "w-full h-auto py-2 px-1 flex flex-col items-center gap-1 transition-all",
                        localSettings.defaultProvider === providerKey 
                          ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-600 scale-105"
                          : ""
                      )}
                      variant={localSettings[providerKey].enabled ? "outline" : "ghost"}
                      onClick={() => handleSetDefaultProvider(providerKey)}
                      disabled={!localSettings[providerKey].enabled}
                    >
                      <div className={cn(
                        "rounded-full p-2",
                        getProviderTextColor(providerKey)
                      )}>
                        {getProviderIcon(providerKey)}
                      </div>
                      <span className="text-xs font-medium">
                        {providerKey.charAt(0).toUpperCase() + providerKey.slice(1)}
                      </span>
                      {localSettings.defaultProvider === providerKey && (
                        <CheckCircle2 className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {localSettings[providerKey].enabled 
                        ? (localSettings.defaultProvider === providerKey 
                          ? "Current default provider" 
                          : "Set as default provider") 
                        : "Enable this provider first"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        {validProviders.map(providerKey => (
          <div 
            key={`list-provider-${providerKey}`}
            className={cn(
              "border rounded-lg px-4 py-3 transition-all", 
              localSettings[providerKey].enabled 
                ? getProviderColor(providerKey) 
                : "border-slate-200 dark:border-slate-700 opacity-70"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-1.5 rounded",
                  getProviderTextColor(providerKey)
                )}>
                  {getProviderIcon(providerKey)}
                </div>
                <div>
                  <h3 className="font-medium text-sm">
                    {providerKey.charAt(0).toUpperCase() + providerKey.slice(1)}
                    {localSettings.defaultProvider === providerKey && (
                      <Badge variant="outline" className="ml-2 py-0 text-[10px]">Default</Badge>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {providerKey === 'openai' && 'Access OpenAI models like GPT-3.5 and GPT-4'}
                    {providerKey === 'gemini' && 'Access Google Gemini Pro and Gemini Flash'}
                    {providerKey === 'mistral' && 'Access Mistral AI language models'}
                    {providerKey === 'claude' && 'Access Anthropic Claude models'}
                    {providerKey === 'llama' && 'Access Meta\'s Llama 3 models'}
                    {providerKey === 'deepseek' && 'Access Deepseek AI models'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <Switch
                    id={`enable-${providerKey}-list`}
                    checked={!!localSettings[providerKey].enabled}
                    onCheckedChange={() => handleToggleProvider(providerKey)}
                  />
                  <Label htmlFor={`enable-${providerKey}-list`} className="text-xs sr-only">
                    {localSettings[providerKey].enabled ? 'Enabled' : 'Disabled'}
                  </Label>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center mb-1">
                <Label htmlFor={`${providerKey}-api-key-list`} className="text-xs font-medium">
                  API Key
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-1"
                  onClick={() => toggleShowApiKey(providerKey)}
                >
                  {showApiKeys[providerKey] ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                  <span className="sr-only">
                    {showApiKeys[providerKey] ? 'Hide API Key' : 'Show API Key'}
                  </span>
                </Button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-2 h-3.5 w-3.5 text-slate-500" />
                <Input
                  id={`${providerKey}-api-key-list`}
                  type={showApiKeys[providerKey] ? 'text' : 'password'}
                  value={localSettings[providerKey].apiKey || ''}
                  onChange={(e) => handleApiKeyChange(providerKey, e.target.value)}
                  placeholder={`Enter your ${providerKey} API key`}
                  className="pl-8 font-mono text-xs h-8"
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
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
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                >
                  Get API key
                  <svg width="10" height="10" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 ml-0.5">
                    <path d="M3 2C2.44772 2 2 2.44772 2 3V12C2 12.5523 2.44772 13 3 13H12C12.5523 13 13 12.5523 13 12V8.5C13 8.22386 12.7761 8 12.5 8C12.2239 8 12 8.22386 12 8.5V12H3V3H6.5C6.77614 3 7 2.77614 7 2.5C7 2.22386 6.77614 2 6.5 2H3ZM12.8536 2.14645C12.9015 2.19439 12.9377 2.24964 12.9621 2.30861C12.9861 2.36669 12.9996 2.4303 13 2.497L13 2.5V2.50049V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3.70711L6.85355 8.85355C6.65829 9.04882 6.34171 9.04882 6.14645 8.85355C5.95118 8.65829 5.95118 8.34171 6.14645 8.14645L11.2929 3H9.5C9.22386 3 9 2.77614 9 2.5C9 2.22386 9.22386 2 9.5 2H12.4999H12.5C12.5678 2 12.6324 2.01349 12.6914 2.03794C12.7504 2.06234 12.8056 2.09851 12.8536 2.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </a>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ), [validProviders, localSettings, showApiKeys, getProviderIcon, handleSetDefaultProvider, handleToggleProvider, handleApiKeyChange, toggleShowApiKey]);

  // Render provider card view with optimized rendering  
  const renderProviderCards = useCallback(() => (
    <CardContent className="space-y-6">
      {/* Default Provider Selection */}
      <div>
        <h3 className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-500" />
          Default AI Provider
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
          {validProviders.map(providerKey => (
            <Button 
              key={`card-default-${providerKey}`}
              type="button"
              className={cn(
                "flex flex-col items-center gap-1 transition-all h-auto py-2",
                getProviderButtonColor(providerKey, localSettings[providerKey].enabled),
                localSettings.defaultProvider === providerKey && localSettings[providerKey].enabled
                  ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-600"
                  : ""
              )}
              onClick={() => handleSetDefaultProvider(providerKey)}
              disabled={!localSettings[providerKey].enabled}
            >
              <div className="flex items-center justify-center">
                {getProviderIcon(providerKey)}
              </div>
              <div className="flex flex-col items-center">
                <span className="font-medium text-xs sm:text-sm">
                  {providerKey.charAt(0).toUpperCase() + providerKey.slice(1)}
                </span>
                {localSettings.defaultProvider === providerKey && (
                  <span className="text-[10px] sm:text-xs whitespace-nowrap">
                    Default
                  </span>
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* API Key Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {validProviders.map(providerKey => (
          <Card key={`card-provider-${providerKey}`} className={`shadow-md border-l-4 ${getProviderColor(providerKey)}`}>
            <CardHeader className="pb-2 px-4 pt-4 sm:px-5 sm:pt-5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-1.5 rounded",
                    getProviderTextColor(providerKey)
                  )}>
                    {getProviderIcon(providerKey)}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <CardTitle className="text-base">
                        {providerKey.charAt(0).toUpperCase() + providerKey.slice(1)}
                      </CardTitle>
                      {localSettings.defaultProvider === providerKey && (
                        <Badge variant="outline" className="ml-2 py-0 text-[10px]">Default</Badge>
                      )}
                    </div>
                    <CardDescription className="dark:text-slate-400 text-xs">
                      {providerKey === 'openai' && 'GPT-3.5, GPT-4, and more'}
                      {providerKey === 'gemini' && 'Gemini Pro and Gemini Flash'}
                      {providerKey === 'mistral' && 'Mistral Small, Medium, and Large'}
                      {providerKey === 'claude' && 'Claude 3 Haiku, Sonnet, and Opus'}
                      {providerKey === 'llama' && 'Llama 3 8B and 70B'}
                      {providerKey === 'deepseek' && 'Deepseek Coder and Chat'}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">
                    {localSettings[providerKey].enabled ? 'Active' : 'Inactive'}
                  </span>
                  <Switch
                    id={`enable-${providerKey}-card`}
                    checked={!!localSettings[providerKey].enabled}
                    onCheckedChange={() => handleToggleProvider(providerKey)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center mb-1.5">
                    <Label htmlFor={`${providerKey}-api-key-card`} className="text-xs font-medium flex items-center">
                      <Key className="h-3.5 w-3.5 mr-1.5" />
                      API Key
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-1"
                      onClick={() => toggleShowApiKey(providerKey)}
                    >
                      {showApiKeys[providerKey] ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                      <span className="sr-only">
                        {showApiKeys[providerKey] ? 'Hide API Key' : 'Show API Key'}
                      </span>
                    </Button>
                  </div>
                  <Input
                    id={`${providerKey}-api-key-card`}
                    type={showApiKeys[providerKey] ? 'text' : 'password'}
                    value={localSettings[providerKey].apiKey || ''}
                    onChange={(e) => handleApiKeyChange(providerKey, e.target.value)}
                    placeholder={`Enter your ${providerKey} API key`}
                    className="font-mono text-xs h-9 dark:bg-slate-800 dark:border-slate-700"
                  />
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1.5 flex items-center">
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
                      className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
                    >
                      Get your API key from the {providerKey.charAt(0).toUpperCase() + providerKey.slice(1)} platform
                      <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 ml-0.5">
                        <path d="M3 2C2.44772 2 2 2.44772 2 3V12C2 12.5523 2.44772 13 3 13H12C12.5523 13 13 12.5523 13 12V8.5C13 8.22386 12.7761 8 12.5 8C12.2239 8 12 8.22386 12 8.5V12H3V3H6.5C6.77614 3 7 2.77614 7 2.5C7 2.22386 6.77614 2 6.5 2H3ZM12.8536 2.14645C12.9015 2.19439 12.9377 2.24964 12.9621 2.30861C12.9861 2.36669 12.9996 2.4303 13 2.497L13 2.5V2.50049V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3.70711L6.85355 8.85355C6.65829 9.04882 6.34171 9.04882 6.14645 8.85355C5.95118 8.65829 5.95118 8.34171 6.14645 8.14645L11.2929 3H9.5C9.22386 3 9 2.77614 9 2.5C9 2.22386 9.22386 2 9.5 2H12.4999H12.5C12.5678 2 12.6324 2.01349 12.6914 2.03794C12.7504 2.06234 12.8056 2.09851 12.8536 2.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                      </svg>
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </CardContent>
  ), [validProviders, localSettings, showApiKeys, getProviderIcon, handleSetDefaultProvider, handleToggleProvider, handleApiKeyChange, toggleShowApiKey]);

  return (
    <Card className="border dark:border-slate-700 shadow-sm">
      <CardHeader className="pb-2 sm:pb-4 bg-slate-50 dark:bg-slate-900 rounded-t-lg border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Laptop className="h-5 w-5 text-blue-500" />
          AI Providers
        </CardTitle>
        <CardDescription>
          Enable and configure the AI providers you want to use
        </CardDescription>
      </CardHeader>

      <div className="px-4 sm:px-6 pt-4">
        <div className="flex space-x-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
          <Button
            type="button"
            variant={activeView === 'list' ? 'default' : 'ghost'}
            className={cn(
              "flex-1 justify-center py-1.5 text-sm font-medium rounded-md",
              activeView === 'list' 
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            onClick={() => handleViewToggle('list')}
          >
            List View
          </Button>
          <Button
            type="button"
            variant={activeView === 'cards' ? 'default' : 'ghost'}
            className={cn(
              "flex-1 justify-center py-1.5 text-sm font-medium rounded-md",
              activeView === 'cards' 
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            onClick={() => handleViewToggle('cards')}
          >
            Card View
          </Button>
        </div>
      </div>

      <div className="mt-2">
        {activeView === 'list' ? renderProviderList() : renderProviderCards()}
      </div>

      <CardFooter className="bg-slate-50 dark:bg-slate-900 rounded-b-lg border-t border-slate-100 dark:border-slate-800 py-4">
        <Button 
          onClick={handleSaveChanges} 
          disabled={!hasChanges}
          className="ml-auto"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
} 