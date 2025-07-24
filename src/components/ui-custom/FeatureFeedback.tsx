'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Info, Zap, Clock, Cpu, Wifi, WifiOff, Mic, MicOff, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AIProvider } from '@/lib/context/ModelSettingsContext';

interface FeatureFeedbackProps {
  provider: AIProvider;
  model: string;
  responseTime?: number;
  tokenCount?: number;
  isVoiceEnabled?: boolean;
  isThinkingEnabled?: boolean;
  networkStatus?: 'online' | 'offline';
  onFeatureToggle?: (feature: string) => void;
}

export function FeatureFeedback({
  provider,
  model,
  responseTime,
  tokenCount,
  isVoiceEnabled = false,
  isThinkingEnabled = false,
  networkStatus = 'online',
  onFeatureToggle
}: FeatureFeedbackProps) {
  const [showDetails, setShowDetails] = useState(false);

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

  const getProviderColor = (provider: AIProvider) => {
    const colors = {
      openai: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
      gemini: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
      mistral: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
      claude: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
      llama: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
      deepseek: 'bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300'
    };
    return colors[provider] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
  };

  const getResponseTimeColor = (time?: number) => {
    if (!time) return 'text-gray-500';
    if (time < 2) return 'text-green-600 dark:text-green-400';
    if (time < 5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getResponseTimeLabel = (time?: number) => {
    if (!time) return 'Unknown';
    if (time < 1) return 'Very Fast';
    if (time < 3) return 'Fast';
    if (time < 6) return 'Normal';
    return 'Slow';
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Response Generated
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="h-6 px-2 text-xs"
        >
          {showDetails ? 'Less' : 'Details'}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className={getProviderColor(provider)}>
          {getProviderDisplayName(provider)}
        </Badge>
        
        <Badge variant="outline" className="text-xs">
          {model}
        </Badge>

        {responseTime && (
          <Badge variant="outline" className={`text-xs ${getResponseTimeColor(responseTime)}`}>
            <Clock className="h-3 w-3 mr-1" />
            {responseTime.toFixed(1)}s ({getResponseTimeLabel(responseTime)})
          </Badge>
        )}

        <Badge variant="outline" className="text-xs">
          <Wifi className={`h-3 w-3 mr-1 ${networkStatus === 'online' ? 'text-green-500' : 'text-red-500'}`} />
          {networkStatus === 'online' ? 'Online' : 'Offline'}
        </Badge>
      </div>

      {/* Detailed Information */}
      {showDetails && (
        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
          {/* Performance Metrics */}
          <div>
            <h4 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Performance Metrics
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Response Time:</span>
                <span className={getResponseTimeColor(responseTime)}>
                  {responseTime ? `${responseTime.toFixed(2)}s` : 'N/A'}
                </span>
              </div>
              {tokenCount && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Tokens:</span>
                  <span className="text-slate-700 dark:text-slate-300">{tokenCount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Model:</span>
                <span className="text-slate-700 dark:text-slate-300">{model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Provider:</span>
                <span className="text-slate-700 dark:text-slate-300">{getProviderDisplayName(provider)}</span>
              </div>
            </div>
          </div>

          {/* Feature Status */}
          <div>
            <h4 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Active Features
            </h4>
            <div className="flex flex-wrap gap-2">
              <div 
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                  isVoiceEnabled 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' 
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}
                onClick={() => onFeatureToggle?.('voice')}
              >
                {isVoiceEnabled ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
                Voice Input
              </div>
              
              <div 
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                  isThinkingEnabled 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}
                onClick={() => onFeatureToggle?.('thinking')}
              >
                {isThinkingEnabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                Show Thinking
              </div>

              <div className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                <Zap className="h-3 w-3" />
                Smart Suggestions
              </div>

              <div className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                <Cpu className="h-3 w-3" />
                Code Highlighting
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
            <div className="flex items-start gap-2">
              <Info className="h-3 w-3 text-blue-500 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Pro Tips:</p>
                <ul className="space-y-0.5 text-xs opacity-90">
                  <li>• Use voice input for hands-free interaction</li>
                  <li>• Enable "Show Thinking" to see AI reasoning</li>
                  <li>• Try different chat modes for varied responses</li>
                  <li>• Switch providers for different capabilities</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}