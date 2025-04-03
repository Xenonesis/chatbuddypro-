'use client';

import { useState, useEffect } from 'react';
import { validateApiConfiguration } from '@/lib/api';
import { Button } from './ui/button';
import { Settings, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { AIProvider } from '@/lib/context/ModelSettingsContext';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Badge } from './ui/badge';
import { useModelSettings } from '@/lib/context/ModelSettingsContext';

type ApiDiagnosticsProps = {
  provider: AIProvider;
};

export default function ApiDiagnostics({ provider }: ApiDiagnosticsProps) {
  const { settings } = useModelSettings();
  const [diagnostics, setDiagnostics] = useState<ReturnType<typeof validateApiConfiguration> | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const providerSettings = settings[provider];
  const hasApiKey = Boolean(providerSettings?.apiKey);
  
  useEffect(() => {
    // Run validation on mount
    const config = validateApiConfiguration();
    setDiagnostics(config);
    
    // Log to console for debugging
    console.log('API Configuration Diagnostics:', config);
  }, []);
  
  if (!diagnostics) {
    return null;
  }
  
  // If a specific provider is specified, only show a simplified status for that provider
  if (provider) {
    const isConfigured = diagnostics[provider]?.configured;
    
    // Return a minimal indicator
    return (
      <Link href="/settings" className="inline-flex">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-8 px-2 text-xs sm:text-sm flex items-center gap-1.5 ${
            isConfigured 
              ? 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300' 
              : 'text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300'
          } dark:hover:bg-slate-700`}
        >
          {isConfigured ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">API Key</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Set API Key</span>
            </>
          )}
        </Button>
      </Link>
    );
  }
  
  // Utility functions
  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'text-green-600 dark:text-green-400 border-green-500'
      : 'text-red-600 dark:text-red-400 border-red-500';
  };
  
  const getProviderDisplayName = (provider: AIProvider) => {
    switch(provider) {
      case 'openai': return 'OpenAI';
      case 'gemini': return 'Gemini';
      case 'mistral': return 'Mistral';
    }
  };
  
  const getModelDescription = (provider: AIProvider, model: string) => {
    if (provider === 'openai') {
      switch (model) {
        case 'gpt-4': return 'GPT-4 is OpenAI\'s most advanced model, excelling at complex tasks. Higher cost than GPT-3.5.';
        case 'gpt-4-turbo': return 'GPT-4 Turbo offers similar capabilities to GPT-4 with improved efficiency and cost.';
        case 'gpt-3.5-turbo': return 'GPT-3.5 Turbo is OpenAI\'s efficient, cost-effective model for most general tasks.';
        default: return 'OpenAI language model';
      }
    } else if (provider === 'gemini') {
      switch (model) {
        case 'gemini-pro': return 'Google\'s advanced language model optimized for text and reasoning.';
        case 'gemini-pro-vision': return 'Multimodal model that can process both text and images.';
        case 'gemini-1.5-pro': return 'Advanced model: $1.25/1M input tokens (up to 128K), $5/1M output tokens. Higher rate for longer prompts.';
        case 'gemini-1.5-flash': return 'Efficient model: 7.5¢/1M input tokens (up to 128K), 30¢/1M output tokens. Higher rate for longer prompts.';
        case 'gemini-2.0-flash': return 'Latest general model: 10¢/1M input tokens, 40¢/1M output tokens. Audio: 70¢/1M input tokens.';
        case 'gemini-2.0-flash-lite': return 'Lightweight model: 7.5¢/1M input tokens, 30¢/1M output tokens.';
        default: return 'Google Gemini language model';
      }
    } else if (provider === 'mistral') {
      switch (model) {
        case 'mistral-tiny': return 'Mistral Tiny is a lightweight, efficient model for general tasks.';
        case 'mistral-small': return 'Mistral Small balances performance and efficiency for most applications.';
        case 'mistral-medium': return 'Mistral Medium offers advanced capabilities for complex reasoning tasks.';
        default: return 'Mistral language model';
      }
    }
    
    return 'AI language model';
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 text-xs sm:text-sm flex items-center gap-1.5 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
        >
          <Settings className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="end">
        <div className="p-4 border-b dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">API Connection</h4>
            <Link href="/settings" passHref>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                Settings →
              </Button>
            </Link>
          </div>
          
          <div className="mt-2 space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Provider:</span>
                <Badge variant="outline" className={`${getStatusColor(true)} font-mono text-xs px-1.5 py-0`}>
                  {getProviderDisplayName(provider)}
                </Badge>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Model:</span>
                <Badge variant="outline" className="font-mono text-xs px-1.5 py-0">
                  {providerSettings.selectedModel}
                </Badge>
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {getModelDescription(provider, providerSettings.selectedModel)}
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>API Key:</span>
                <Badge variant={hasApiKey ? "outline" : "destructive"} className={`${getStatusColor(hasApiKey)} font-mono text-xs px-1.5 py-0`}>
                  {hasApiKey ? "Configured" : "Missing"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h4 className="font-medium mb-2">Model Parameters</h4>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Temperature:</span>
              <span className="font-mono">{providerSettings.temperature}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Max Tokens:</span>
              <span className="font-mono">{providerSettings.maxTokens}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Mode:</span>
              <Badge variant="outline" className="font-mono text-xs px-1.5 py-0">
                {settings.chatMode}
              </Badge>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 