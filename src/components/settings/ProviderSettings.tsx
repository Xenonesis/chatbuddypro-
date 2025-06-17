import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useModelSettings, ModelSettings, AIProvider } from '@/lib/context/ModelSettingsContext';
import { 
  Key, 
  Laptop, 
  EyeOff, 
  Eye, 
  Bot, 
  Cpu, 
  Cloud, 
  FlaskConical, 
  Flame, 
  Star, 
  Save, 
  Info, 
  Lock, 
  CheckCircle2, 
  ExternalLink, 
  RotateCcw,
  AlertTriangle,
  Loader,
  Trash,
  CheckCircle,
  XCircle,
  PlayCircle,
  FileText,
  ChevronRight,
  BarChartHorizontal,
  LayoutGrid,
  LayoutList
} from 'lucide-react';
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { userService } from '@/lib/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { callAI } from '@/lib/api';
import ModelDetails from './ModelDetails';
import ProviderComparison from './ProviderComparison';
import ProviderUsageStats from './ProviderUsageStats';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { useTheme } from '@/components/ui/use-theme';

const formatProviderName = (provider: string) => {
  return provider.charAt(0).toUpperCase() + provider.slice(1);
};

const getProviderDocsUrl = (provider: string) => {
  switch(provider) {
    case 'openai': return 'https://platform.openai.com/docs/api-reference';
    case 'gemini': return 'https://ai.google.dev/docs';
    case 'mistral': return 'https://docs.mistral.ai/';
    case 'claude': return 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api';
    case 'llama': return 'https://llama.meta.com/docs/';
    case 'deepseek': return 'https://platform.deepseek.com/docs';
    default: return '#';
  }
};

const getModelDescription = (provider: string, modelId: string) => {
  return "Selected model";
};

const getProviderIcon = (provider: AIProvider) => {
  switch(provider) {
    case 'openai': return <Bot className="h-5 w-5" />;
    case 'gemini': return <Cpu className="h-5 w-5" />;
    case 'mistral': return <Cloud className="h-5 w-5" />;
    case 'claude': return <FlaskConical className="h-5 w-5" />;
    case 'llama': return <Flame className="h-5 w-5" />;
    case 'deepseek': return <Star className="h-5 w-5" />;
    default: return <Bot className="h-5 w-5" />;
  }
};

const styles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.animate-pulse-slow {
  animation: pulse 2s infinite ease-in-out;
}

@media (max-width: 480px) {
  .xs\\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (hover: none) {
  .touch-manipulation {
    touch-action: manipulation;
  }
}
`;

interface ModelCardProps {
  provider: AIProvider;
  isEnabled: boolean;
  apiKey: string;
  onEnableToggle: (checked: boolean) => void;
  onApiKeyChange: (key: string) => void;
  onApiKeyUpdate: () => void;
  onApiKeyDelete: () => void;
  isUpdating: boolean;
  isDefault?: boolean;
}

export function ModelCard({ 
  provider, 
  isEnabled,
  apiKey,
  onEnableToggle,
  onApiKeyChange,
  onApiKeyUpdate,
  onApiKeyDelete,
  isUpdating,
  isDefault
}: ModelCardProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<'unchecked' | 'checking' | 'valid' | 'invalid'>('unchecked');
  const { toast } = useToast();
  const [showModelDetails, setShowModelDetails] = useState(false);
  
  useEffect(() => {
    // Reset status when API key changes
    setApiKeyStatus('unchecked');
  }, [apiKey]);
  
  const getApiKeyStatusIcon = () => {
    switch (apiKeyStatus) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <Loader className="h-4 w-4 animate-spin text-amber-500" />;
      default:
        return null;
    }
  };
  
  // Show success toast after saving API key
  const handleSaveClick = () => {
    // Special handling for Mistral API keys which may have different formats
    if (provider === 'mistral' && apiKey.length < 30) {
      toast({
        title: "Mistral API Key Warning",
        description: "Your API key appears shorter than expected. It will be saved, but please verify it's correct.",
        variant: "warning",
      });
    }
    
    // Call the parent's API key update function
    onApiKeyUpdate();
  };
  
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      isEnabled ? getProviderColor(provider) : "bg-card border-muted-foreground/10"
    )}>
      <CardHeader className="pb-2 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getProviderIcon(provider)}
            <CardTitle className={cn(
              "text-base font-semibold capitalize",
              isEnabled ? getProviderTextColor(provider) : "text-muted-foreground"
            )}>
              {formatProviderName(provider)}
              {isDefault && (
                <Badge className="ml-2 text-xs bg-blue-500 dark:bg-blue-600">Default</Badge>
              )}
            </CardTitle>
          </div>
          <Switch 
            checked={isEnabled} 
            onCheckedChange={onEnableToggle}
            className={isEnabled ? "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-primary/80" : ""}
          />
        </div>
      </CardHeader>

      {isEnabled && (
        <>
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <Label htmlFor={`${provider}-api-key`} className="text-sm font-medium flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5" />
                  API Key
                  {apiKeyStatus !== 'unchecked' && getApiKeyStatusIcon()}
                </Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="h-7 px-2 text-xs"
                >
                  {showApiKey ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
                  {showApiKey ? "Hide" : "Show"}
                </Button>
              </div>
              
              <div className="relative">
                <Input
                  id={`${provider}-api-key`}
                  value={apiKey || ""}
                  onChange={(e) => onApiKeyChange(e.target.value)}
                  type={showApiKey ? "text" : "password"}
                  placeholder={`Enter your ${formatProviderName(provider)} API key`}
                  className={cn(
                    "pr-20 bg-background/50 focus:bg-background transition-all font-mono text-xs",
                    apiKeyStatus === 'valid' && "border-green-500 focus-visible:ring-green-500/20",
                    apiKeyStatus === 'invalid' && "border-red-500 focus-visible:ring-red-500/20"
                  )}
                />
                <div className="absolute right-1 top-1 flex space-x-1">
                  {apiKey && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={onApiKeyDelete}
                      disabled={isUpdating || !apiKey}
                      className="h-7"
                      title="Delete API key"
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleSaveClick}
                    disabled={isUpdating || !apiKey || apiKey.trim() === ""}
                    className={cn(
                      "h-7",
                      getProviderButtonColor(provider, true)
                    )}
                  >
                    {isUpdating ? (
                      <Loader className="h-3 w-3 animate-spin" />
                    ) : (
                      <Save className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {apiKeyStatus === 'valid' ? (
                    <span className="text-green-500 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> API key verified
                    </span>
                  ) : (
                    "Your API key is securely stored and never shared."
                  )}
                </p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="bg-background/30 border-t border-border/50 pt-4 pb-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <a
                href={getProviderDocsUrl(provider)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                API Documentation
              </a>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-xs h-7 text-primary"
                  >
                    <BarChartHorizontal className="h-3 w-3" />
                    View Usage
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {getProviderIcon(provider)}
                      {formatProviderName(provider)} Usage Stats
                    </DialogTitle>
                    <DialogDescription>
                      View usage statistics and trends
                    </DialogDescription>
                  </DialogHeader>
                  
                  <ProviderUsageStats provider={provider} />
                </DialogContent>
              </Dialog>
            </div>
            
            {apiKeyStatus === 'valid' && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                Ready to use
              </Badge>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
}

// Add utility function to format provider button styles more consistently
const getViewToggleButtonStyle = (isActive: boolean) => {
  return cn(
    "h-8 w-8 rounded-md flex items-center justify-center transition-all",
    isActive 
      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
  );
};

export default function ProviderSettings() {
  const { settings, updateSettings, apiKeys } = useModelSettings();
  const [localSettings, setLocalSettings] = useState<ModelSettings>(settings);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const theme = useTheme();
  const [activeCategory, setActiveCategory] = useState<'all' | 'enabled' | 'configured'>('all');
  const [showComparison, setShowComparison] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get providers that have API keys saved in the database
  const providersWithApiKeys = Object.keys(apiKeys || {}) as AIProvider[];
  console.log('Providers with API keys in database:', providersWithApiKeys);

  useEffect(() => {
    setLocalSettings({...settings});
    
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

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleToggleProvider = useCallback((provider: AIProvider) => {
    setLocalSettings(currentSettings => {
      const newSettings = JSON.parse(JSON.stringify(currentSettings)) as ModelSettings;
      
      const isCurrentlyEnabled = newSettings[provider].enabled;
      const isCurrentDefault = newSettings.defaultProvider === provider;
      
      newSettings[provider].enabled = !isCurrentlyEnabled;
      
      if (isCurrentDefault && isCurrentlyEnabled) {
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
          newSettings.defaultProvider = firstEnabledProvider;
        }
      }
      
      return newSettings;
    });
  }, []);

  const handleSetDefaultProvider = useCallback((provider: AIProvider) => {
    // Only allow setting default provider if it has an API key in the database
    if (!providersWithApiKeys.includes(provider)) {
      toast({
        title: "API Key Required",
        description: `${formatProviderName(provider)} cannot be set as default because its API key is not stored in the database.`,
        variant: "destructive"
      });
      return;
    }
    
    setLocalSettings(currentSettings => {
      const newSettings = JSON.parse(JSON.stringify(currentSettings)) as ModelSettings;
      
      if (newSettings[provider].enabled) {
        newSettings.defaultProvider = provider;
      }
      
      return newSettings;
    });
  }, [providersWithApiKeys, toast]);

  const handleApiKeyChange = useCallback((provider: AIProvider, value: string) => {
    setLocalSettings(current => {
      const newSettings = JSON.parse(JSON.stringify(current)) as ModelSettings;
      newSettings[provider].apiKey = value;
      return newSettings;
    });
  }, []);

  const handleApiKeyDelete = useCallback(async (provider: AIProvider) => {
    setIsSaving(true);
    
    try {
      // Update local state immediately for better UX
      setLocalSettings(current => {
        const newSettings = JSON.parse(JSON.stringify(current)) as ModelSettings;
        newSettings[provider].apiKey = '';
        return newSettings;
      });
      
      // Delete the API key from Supabase if user is logged in
      if (user && user.id) {
        const success = await userService.deleteApiKey(user.id, provider);
        
        if (!success) {
          console.error(`Failed to delete API key for ${provider}`);
          toast({
            title: "Error deleting API key",
            description: `There was a problem removing your ${formatProviderName(provider)} API key.`,
            variant: "destructive"
          });
          return;
        }
      }
      
      // Update global settings
      updateSettings({
        ...localSettings,
        [provider]: {
          ...localSettings[provider],
          apiKey: ''
        }
      });
      
      toast({
        title: "API key deleted",
        description: `Your ${formatProviderName(provider)} API key has been removed.`,
      });
    } catch (error) {
      console.error('Error during API key deletion:', error);
      toast({
        title: "Error deleting API key",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [localSettings, updateSettings, toast, user]);

  const handleSaveChanges = useCallback(() => {
    setIsSaving(true);
    
    try {
      // Log the default provider being saved
      console.log(`Saving settings with default provider: ${localSettings.defaultProvider}`);
      
      // Update the settings in context
      updateSettings(localSettings);
      
      // Explicitly save the defaultProvider to user preferences if logged in
      if (user && user.id) {
        // This is handled by the updateSettings function, which already saves to Supabase
        console.log(`Default AI provider set to: ${localSettings.defaultProvider}`);
      }
      
      toast({
        title: "Settings saved",
        description: "Your AI provider settings have been updated.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error saving settings",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [localSettings, updateSettings, toast, user]);

  const handleResetSettings = useCallback(() => {
    setLocalSettings(settings);
    setShowApiKeys({});
    
    toast({
      title: "Settings reset",
      description: "All provider settings have been reset to their original values.",
    });
  }, [settings, toast]);

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

  const enabledProviders = validProviders.filter(provider => localSettings[provider].enabled);
  const configuredProviders = validProviders.filter(provider => 
    localSettings[provider].apiKey && localSettings[provider].apiKey.trim() !== ''
  );

  const getFilteredProviders = () => {
    switch (activeCategory) {
      case 'enabled':
        return enabledProviders;
      case 'configured':
        return configuredProviders;
      case 'all':
      default:
        return validProviders;
    }
  };

  const getProviderCount = (category: 'all' | 'enabled' | 'configured') => {
    switch (category) {
      case 'enabled':
        return enabledProviders.length;
      case 'configured':
        return configuredProviders.length;
      case 'all':
      default:
        return validProviders.length;
    }
  };
  
  // Render providers in list view
  const renderProvidersListView = () => {
    return getFilteredProviders().map((provider) => (
      <div 
        key={provider} 
        className={cn(
          "rounded-lg border p-4 shadow-sm transition-all duration-200",
          localSettings[provider].enabled 
            ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" 
            : "bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-700/50"
        )}
      >
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors",
            localSettings[provider].enabled 
              ? getProviderColor(provider) 
              : "bg-muted text-muted-foreground"
          )}>
            {getProviderIcon(provider)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className={cn(
                  "font-medium",
                  localSettings[provider].enabled 
                    ? getProviderTextColor(provider) 
                    : "text-muted-foreground"
                )}>
                  {formatProviderName(provider)}
                </h3>
                {localSettings.defaultProvider === provider && (
                  <Badge className="ml-1 text-xs bg-blue-500 dark:bg-blue-600">Default</Badge>
                )}
              </div>
              
              <Switch 
                checked={localSettings[provider].enabled} 
                onCheckedChange={() => handleToggleProvider(provider)}
                className={localSettings[provider].enabled ? "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-primary/80" : ""}
              />
            </div>
            
            {localSettings[provider].enabled && (
              <>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`${provider}-api-key-list`} className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5" />
                      API Key
                    </Label>
                    <div className="relative">
                      <Input
                        id={`${provider}-api-key-list`}
                        value={localSettings[provider].apiKey || ""}
                        onChange={(e) => handleApiKeyChange(provider, e.target.value)}
                        type={showApiKeys[provider] ? "text" : "password"}
                        placeholder={`Enter your ${formatProviderName(provider)} API key`}
                        className="pr-20 bg-background/50 focus:bg-background transition-all font-mono text-xs"
                      />
                      <div className="absolute right-1 top-1 flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowApiKeys(prev => ({ ...prev, [provider]: !prev[provider] }))}
                          className="h-7 px-2 text-xs"
                        >
                          {showApiKeys[provider] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                        
                        {localSettings[provider].apiKey && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApiKeyDelete(provider)}
                            disabled={isSaving}
                            className="h-7"
                            title="Delete API key"
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          onClick={handleSaveChanges}
                          disabled={isSaving || !localSettings[provider].apiKey || localSettings[provider].apiKey.trim() === ""}
                          className={cn(
                            "h-7",
                            getProviderButtonColor(provider, true)
                          )}
                        >
                          {isSaving ? (
                            <Loader className="h-3 w-3 animate-spin" />
                          ) : (
                            <Save className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Your API key is securely stored and never shared.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
                  <a
                    href={getProviderDocsUrl(provider)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    API Documentation
                  </a>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleSetDefaultProvider(provider)}
                    disabled={localSettings.defaultProvider === provider || !providersWithApiKeys.includes(provider)}
                  >
                    {localSettings.defaultProvider === provider ? "Default" : "Set as Default"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      <Card className="overflow-hidden border-primary/10">
        <CardHeader className="relative pb-2">
          <div className="absolute inset-0 h-12 bg-gradient-to-r from-primary/10 to-primary/5"></div>
          <CardTitle className="flex items-center gap-2 pt-4 z-10 relative">
            <Cpu className="h-5 w-5 text-primary" />
            AI Providers
          </CardTitle>
          <CardDescription className="z-10 relative">
            Configure the AI providers you want to use for chat
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {configuredProviders.length === 0 && (
            <div className="flex items-center px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p className="text-sm">
                You need at least one provider enabled with a valid API key to use chat.
              </p>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 pb-2">
              <div className="bg-card rounded-lg p-1 flex items-center">
                <Button
                  variant={activeCategory === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveCategory('all')}
                  className="relative text-xs h-8"
                >
                  All
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "ml-1 text-[10px] h-4 min-w-4 px-1 rounded-full",
                      activeCategory === 'all' ? "bg-primary/20 text-primary-foreground" : "bg-muted"
                    )}
                  >
                    {getProviderCount('all')}
                  </Badge>
                </Button>
                
                <Button
                  variant={activeCategory === 'enabled' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveCategory('enabled')}
                  className="relative text-xs h-8"
                >
                  Enabled
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "ml-1 text-[10px] h-4 min-w-4 px-1 rounded-full",
                      activeCategory === 'enabled' ? "bg-primary/20 text-primary-foreground" : "bg-muted"
                    )}
                  >
                    {getProviderCount('enabled')}
                  </Badge>
                </Button>
                
                <Button
                  variant={activeCategory === 'configured' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveCategory('configured')}
                  className="relative text-xs h-8"
                >
                  Configured
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "ml-1 text-[10px] h-4 min-w-4 px-1 rounded-full",
                      activeCategory === 'configured' ? "bg-primary/20 text-primary-foreground" : "bg-muted"
                    )}
                  >
                    {getProviderCount('configured')}
                  </Badge>
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-muted/50 rounded-lg p-1 flex items-center border border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={getViewToggleButtonStyle(viewMode === 'grid')}
                  title="Grid View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={getViewToggleButtonStyle(viewMode === 'list')}
                  title="List View"
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>
            
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1.5"
                  >
                    <FileText className="h-4 w-4" />
                    Compare Providers
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" />
                      AI Provider Comparison
                    </DialogTitle>
                    <DialogDescription>
                      Compare capabilities across different AI providers
                    </DialogDescription>
                  </DialogHeader>
                  
                  <ProviderComparison 
                    selectedProviders={validProviders as AIProvider[]}
                  />
                  
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredProviders().map((provider) => (
                <ModelCard
                  key={provider}
                  provider={provider}
                  isEnabled={localSettings[provider].enabled}
                  apiKey={localSettings[provider].apiKey || ''}
                  onEnableToggle={() => handleToggleProvider(provider)}
                  onApiKeyChange={(key) => handleApiKeyChange(provider, key)}
                  onApiKeyUpdate={handleSaveChanges}
                  onApiKeyDelete={() => handleApiKeyDelete(provider)}
                  isUpdating={isSaving}
                  isDefault={localSettings.defaultProvider === provider}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {renderProvidersListView()}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-muted/30 rounded-lg p-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="default-provider" className="font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                Default AI Provider
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Select which provider to use by default when starting a new chat.
                Only providers with API keys stored in the database can be set as default.
              </p>
              <Select 
                value={localSettings.defaultProvider || ""} 
                onValueChange={(value) => handleSetDefaultProvider(value as AIProvider)}
                disabled={!validProviders.some(p => localSettings[p].enabled && providersWithApiKeys.includes(p as AIProvider))}
              >
                <SelectTrigger 
                  id="default-provider" 
                  className="w-full bg-card"
                >
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {validProviders
                    .filter(provider => 
                      localSettings[provider].enabled && 
                      providersWithApiKeys.includes(provider))
                    .map((provider) => (
                      <SelectItem 
                        key={provider} 
                        value={provider}
                        className="flex items-center"
                      >
                        <div className="flex items-center gap-2">
                          {getProviderIcon(provider)}
                          <span>{formatProviderName(provider)}</span>
                        </div>
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            
            <Separator className="hidden sm:block" orientation="vertical" />
            
            <div className="flex-1 space-y-2">
              <Label className="font-medium flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Actions
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Save your changes or reset to the original settings.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline"
                  onClick={handleResetSettings}
                  className="flex items-center gap-1.5 sm:flex-1"
                  disabled={isSaving}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
                
                <Button 
                  onClick={handleSaveChanges}
                  className="flex items-center gap-1.5 sm:flex-1"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 