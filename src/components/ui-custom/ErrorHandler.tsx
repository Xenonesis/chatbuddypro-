'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Settings, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/components/ui/use-toast';
import { ErrorAnalysis, ErrorSeverity } from '@/lib/errorHandler';
import { useState } from 'react';
import Link from 'next/link';

interface ErrorHandlerProps {
  error: Error;
  analysis: ErrorAnalysis;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  compact?: boolean;
}

export function ErrorHandler({ 
  error, 
  analysis, 
  onRetry, 
  onDismiss, 
  showDetails = false,
  compact = false 
}: ErrorHandlerProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(showDetails);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const getSeverityConfig = (severity: ErrorSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          color: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-200',
          iconColor: 'text-red-600 dark:text-red-400',
          badgeVariant: 'destructive' as const
        };
      case 'high':
        return {
          color: 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800',
          textColor: 'text-orange-800 dark:text-orange-200',
          iconColor: 'text-orange-600 dark:text-orange-400',
          badgeVariant: 'destructive' as const
        };
      case 'medium':
        return {
          color: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          badgeVariant: 'secondary' as const
        };
      case 'low':
        return {
          color: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800',
          textColor: 'text-blue-800 dark:text-blue-200',
          iconColor: 'text-blue-600 dark:text-blue-400',
          badgeVariant: 'outline' as const
        };
    }
  };

  const config = getSeverityConfig(analysis.severity);

  const copyErrorDetails = async () => {
    const errorDetails = `
Error: ${analysis.userMessage}
Technical Details: ${analysis.technicalMessage}
Category: ${analysis.category}
Severity: ${analysis.severity}
Retryable: ${analysis.retryable}
Timestamp: ${new Date().toISOString()}
${analysis.code ? `Code: ${analysis.code}` : ''}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorDetails);
      setCopied(true);
      toast({
        title: 'Error details copied',
        description: 'Error information has been copied to clipboard',
        duration: 3000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Copy failed',
        description: 'Could not copy error details to clipboard',
        variant: 'destructive',
      });
    }
  };

  if (compact) {
    return (
      <div className={`rounded-lg border p-3 ${config.color}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${config.textColor}`}>
              {analysis.userMessage}
            </p>
            <p className={`text-xs mt-1 ${config.textColor} opacity-80`}>
              {analysis.suggestions[0]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {analysis.retryable && onRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="h-7 px-2"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="h-7 px-2"
              >
                ×
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`${config.color}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className={`h-5 w-5 mt-0.5 ${config.iconColor}`} />
            <div>
              <CardTitle className={`text-base ${config.textColor}`}>
                {analysis.userMessage}
              </CardTitle>
              <CardDescription className={`${config.textColor} opacity-80`}>
                {analysis.suggestions[0]}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={config.badgeVariant} className="text-xs">
              {analysis.severity.toUpperCase()}
            </Badge>
            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {analysis.retryable && onRetry && (
            <Button
              size="sm"
              onClick={onRetry}
              className="h-8"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Try Again
            </Button>
          )}
          
          {analysis.category === 'api_key' && (
            <Link href="/settings">
              <Button size="sm" variant="outline" className="h-8">
                <Settings className="h-3 w-3 mr-2" />
                Check Settings
              </Button>
            </Link>
          )}
          
          {analysis.category === 'network' && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="h-8"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Refresh Page
            </Button>
          )}
        </div>

        {/* Suggestions */}
        {analysis.suggestions.length > 1 && (
          <div className="mb-4">
            <h4 className={`text-sm font-medium mb-2 ${config.textColor}`}>
              Suggested Solutions:
            </h4>
            <ul className={`text-sm space-y-1 ${config.textColor} opacity-90`}>
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-xs mt-1">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Error Details (Collapsible) */}
        <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 p-0 ${config.textColor} hover:bg-transparent`}
            >
              <span className="text-xs">
                {isDetailsOpen ? 'Hide' : 'Show'} Technical Details
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-3 border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Error Details
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyErrorDetails}
                  className="h-6 px-2"
                >
                  {copied ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-medium text-slate-600 dark:text-slate-400">Message:</span>
                  <pre className="mt-1 text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                    {analysis.technicalMessage}
                  </pre>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-slate-600 dark:text-slate-400">Category:</span>
                    <p className="text-slate-800 dark:text-slate-200">{analysis.category}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600 dark:text-slate-400">Retryable:</span>
                    <p className="text-slate-800 dark:text-slate-200">
                      {analysis.retryable ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
                {analysis.code && (
                  <div>
                    <span className="font-medium text-slate-600 dark:text-slate-400">Error Code:</span>
                    <p className="text-slate-800 dark:text-slate-200">{analysis.code}</p>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}