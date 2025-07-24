'use client';

import React from 'react';
import { AlertCircle, Settings, ExternalLink, RefreshCw, Key, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { AIProvider } from '@/lib/context/ModelSettingsContext';

interface EnhancedErrorFeedbackProps {
  error: Error;
  provider: AIProvider;
  onRetry?: () => void;
  onSwitchProvider?: (provider: AIProvider) => void;
  availableProviders?: AIProvider[];
}

export function EnhancedErrorFeedback({ 
  error, 
  provider, 
  onRetry, 
  onSwitchProvider, 
  availableProviders = [] 
}: EnhancedErrorFeedbackProps) {
  const getProviderDisplayName = (provider: AIProvider) => {
    const names = {
      openai: 'OpenAI',
      gemini: 'Google Gemini',
      mistral: 'Mistral AI',
      claude: 'Anthropic Claude',
      llama: 'Meta Llama',
      deepseek: 'DeepSeek'
    };
    return names[provider] || provider;
  };

  const getProviderDocsUrl = (provider: AIProvider) => {
    const urls = {
      openai: 'https://platform.openai.com/docs/api-reference',
      gemini: 'https://ai.google.dev/docs',
      mistral: 'https://docs.mistral.ai/',
      claude: 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api',
      llama: 'https://llama.meta.com/docs/',
      deepseek: 'https://platform.deepseek.com/docs'
    };
    return urls[provider] || '#';
  };

  const getProviderApiKeyUrl = (provider: AIProvider) => {
    const urls = {
      openai: 'https://platform.openai.com/api-keys',
      gemini: 'https://aistudio.google.com/app/apikey',
      mistral: 'https://console.mistral.ai/',
      claude: 'https://console.anthropic.com/',
      llama: 'https://together.ai/',
      deepseek: 'https://platform.deepseek.com/'
    };
    return urls[provider] || '#';
  };

  const analyzeError = (error: Error, provider: AIProvider) => {
    const message = error.message.toLowerCase();
    
    // API Key Issues
    if (message.includes('api key') || message.includes('invalid') || message.includes('unauthorized') || message.includes('403')) {
      return {
        type: 'api_key',
        title: 'API Key Issue',
        description: `Your ${getProviderDisplayName(provider)} API key is missing, invalid, or has insufficient permissions.`,
        severity: 'error' as const,
        solutions: [
          'Check if your API key is correctly set in Settings',
          'Verify the API key hasn\'t expired or been revoked',
          'Ensure the API key has the necessary permissions',
          'Try regenerating a new API key from the provider\'s dashboard'
        ]
      };
    }

    // Rate Limiting
    if (message.includes('rate limit') || message.includes('429') || message.includes('quota')) {
      return {
        type: 'rate_limit',
        title: 'Rate Limit Exceeded',
        description: `You've exceeded the rate limit for ${getProviderDisplayName(provider)}.`,
        severity: 'warning' as const,
        solutions: [
          'Wait a few minutes before trying again',
          'Consider upgrading your API plan for higher limits',
          'Switch to a different AI provider temporarily',
          'Reduce the frequency of your requests'
        ]
      };
    }

    // Network Issues
    if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
      return {
        type: 'network',
        title: 'Network Connection Issue',
        description: 'Unable to connect to the AI provider\'s servers.',
        severity: 'warning' as const,
        solutions: [
          'Check your internet connection',
          'Try again in a few moments',
          'Switch to a different AI provider',
          'Contact your network administrator if the issue persists'
        ]
      };
    }

    // Model Not Found
    if (message.includes('model not found') || message.includes('404') || message.includes('not available')) {
      return {
        type: 'model_error',
        title: 'Model Not Available',
        description: `The selected model is not available or doesn't exist for ${getProviderDisplayName(provider)}.`,
        severity: 'error' as const,
        solutions: [
          'Try switching to a different model in Settings',
          'Check if the model name is correct',
          'Some models may not be available in your region',
          'Contact the provider for model availability'
        ]
      };
    }

    // Server Errors
    if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('server error')) {
      return {
        type: 'server_error',
        title: 'Server Error',
        description: `${getProviderDisplayName(provider)}'s servers are experiencing issues.`,
        severity: 'error' as const,
        solutions: [
          'Try again in a few minutes',
          'Switch to a different AI provider',
          'Check the provider\'s status page for updates',
          'The issue is likely temporary'
        ]
      };
    }

    // Generic Error
    return {
      type: 'generic',
      title: 'Unexpected Error',
      description: `An unexpected error occurred with ${getProviderDisplayName(provider)}.`,
      severity: 'error' as const,
      solutions: [
        'Try sending your message again',
        'Switch to a different AI provider',
        'Check your API key configuration',
        'Contact support if the issue persists'
      ]
    };
  };

  const errorAnalysis = analyzeError(error, provider);

  const getSeverityColor = (severity: 'error' | 'warning') => {
    return severity === 'error' 
      ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
      : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20';
  };

  const getSeverityTextColor = (severity: 'error' | 'warning') => {
    return severity === 'error'
      ? 'text-red-700 dark:text-red-300'
      : 'text-amber-700 dark:text-amber-300';
  };

  const getSeverityIconColor = (severity: 'error' | 'warning') => {
    return severity === 'error'
      ? 'text-red-500 dark:text-red-400'
      : 'text-amber-500 dark:text-amber-400';
  };

  return (
    <div className={`rounded-lg border p-4 ${getSeverityColor(errorAnalysis.severity)}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`h-5 w-5 mt-0.5 ${getSeverityIconColor(errorAnalysis.severity)}`} />
        <div className="flex-1 space-y-3">
          <div>
            <h3 className={`font-semibold ${getSeverityTextColor(errorAnalysis.severity)}`}>
              {errorAnalysis.title}
            </h3>
            <p className={`text-sm mt-1 ${getSeverityTextColor(errorAnalysis.severity)}`}>
              {errorAnalysis.description}
            </p>
          </div>

          {/* Error Details */}
          <details className="text-xs">
            <summary className={`cursor-pointer ${getSeverityTextColor(errorAnalysis.severity)} opacity-75 hover:opacity-100`}>
              Technical Details
            </summary>
            <div className={`mt-2 p-2 rounded bg-white/50 dark:bg-black/20 font-mono text-xs ${getSeverityTextColor(errorAnalysis.severity)}`}>
              {error.message}
            </div>
          </details>

          {/* Solutions */}
          <div>
            <h4 className={`text-sm font-medium ${getSeverityTextColor(errorAnalysis.severity)} mb-2`}>
              Suggested Solutions:
            </h4>
            <ul className={`text-sm space-y-1 ${getSeverityTextColor(errorAnalysis.severity)}`}>
              {errorAnalysis.solutions.map((solution, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-xs mt-1">•</span>
                  <span>{solution}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {onRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="h-8 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}

            {errorAnalysis.type === 'api_key' && (
              <>
                <Link href="/settings">
                  <Button size="sm" variant="outline" className="h-8 text-xs">
                    <Settings className="h-3 w-3 mr-1" />
                    Settings
                  </Button>
                </Link>
                <a 
                  href={getProviderApiKeyUrl(provider)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="outline" className="h-8 text-xs">
                    <Key className="h-3 w-3 mr-1" />
                    Get API Key
                  </Button>
                </a>
              </>
            )}

            {availableProviders.length > 1 && onSwitchProvider && (
              <div className="flex gap-1">
                <span className="text-xs self-center opacity-75">Switch to:</span>
                {availableProviders
                  .filter(p => p !== provider)
                  .slice(0, 2)
                  .map(altProvider => (
                    <Button
                      key={altProvider}
                      size="sm"
                      variant="outline"
                      onClick={() => onSwitchProvider(altProvider)}
                      className="h-8 text-xs"
                    >
                      {getProviderDisplayName(altProvider)}
                    </Button>
                  ))}
              </div>
            )}

            <a 
              href={getProviderDocsUrl(provider)} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="outline" className="h-8 text-xs">
                <ExternalLink className="h-3 w-3 mr-1" />
                Docs
              </Button>
            </a>
          </div>

          {/* Provider Status */}
          <div className="pt-2 border-t border-current/20">
            <div className="flex items-center justify-between text-xs opacity-75">
              <span>Provider: {getProviderDisplayName(provider)}</span>
              <Badge variant="outline" className="text-xs">
                Error Code: {errorAnalysis.type}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}