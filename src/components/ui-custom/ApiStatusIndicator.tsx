'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Settings, ExternalLink, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AIProvider, useModelSettings } from '@/lib/context/ModelSettingsContext';
import { validateApiConfiguration } from '@/lib/api';
import Link from 'next/link';

export function ApiStatusIndicator() {
  const { settings } = useModelSettings();
  const [apiStatus, setApiStatus] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkApiStatus = async () => {
      setIsLoading(true);
      try {
        const status = validateApiConfiguration();
        setApiStatus(status);
      } catch (error) {
        console.error('Error checking API status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkApiStatus();
  }, [settings]);

  const getProviderStatus = (provider: AIProvider) => {
    // Check environment variables only
    const envKey = process.env[`NEXT_PUBLIC_${provider.toUpperCase()}_API_KEY`];
    if (envKey && envKey !== `your_${provider}_api_key_here`) {
      return { status: 'env', source: 'Environment Variable' };
    }

    // Check settings
    if (settings[provider]?.apiKey && settings[provider].apiKey !== `your_${provider}_api_key_here`) {
      return { status: 'settings', source: 'App Settings' };
    }

    return { status: 'missing', source: 'Not Configured' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'env':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'local':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'settings':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'env':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'local':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
      case 'settings':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300';
      default:
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
    }
  };

  const providers: AIProvider[] = ['openai', 'gemini', 'mistral', 'claude', 'llama', 'deepseek'];
  const configuredProviders = providers.filter(p => getProviderStatus(p).status !== 'missing');

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking API status...
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5" />
          AI Provider Status
          <Badge variant="outline" className="ml-auto">
            {configuredProviders.length}/{providers.length} Configured
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {providers.map(provider => {
          const status = getProviderStatus(provider);
          const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
          
          return (
            <div key={provider} className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                {getStatusIcon(status.status)}
                <div>
                  <div className="font-medium text-sm">{providerName}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {status.source}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-xs ${getStatusColor(status.status)}`}>
                  {status.status === 'missing' ? 'Not Set' : 'Configured'}
                </Badge>
                {status.status === 'missing' && (
                  <Link href="/settings">
                    <Button size="sm" variant="outline" className="h-6 text-xs">
                      Setup
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}

        {configuredProviders.length === 0 && (
          <div className="text-center py-4 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm font-medium mb-1">No API Keys Configured</p>
            <p className="text-xs mb-3">Configure at least one AI provider to start chatting</p>
            <Link href="/settings">
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                <Settings className="h-3 w-3 mr-1" />
                Go to Settings
              </Button>
            </Link>
          </div>
        )}

        <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Environment variables have highest priority</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-blue-500" />
              <span>Browser storage is used as fallback</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-purple-500" />
              <span>App settings are used last</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}