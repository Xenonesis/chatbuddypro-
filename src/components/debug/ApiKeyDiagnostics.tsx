'use client';

import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/lib/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, AlertCircle, RefreshCw, Database, Smartphone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type ApiKeyStatus = {
  provider: string;
  valid: boolean;
  source: string;
  lastChecked: Date;
};

export function ApiKeyDiagnostics() {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<ApiKeyStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Providers to check - add more as needed
  const providers = ['openai', 'anthropic', 'google'];

  const checkAllApiKeys = useCallback(async () => {
    if (!user?.id) return;
    
    setIsChecking(true);
    setSyncMessage(null);
    
    try {
      const results: ApiKeyStatus[] = [];
      
      for (const provider of providers) {
        const status = await userService.checkApiKeyStatus(provider, user.id);
        results.push({
          provider,
          valid: status.valid,
          source: status.source,
          lastChecked: new Date(),
        });
      }
      
      setStatuses(results);
    } catch (error) {
      console.error('Error checking API keys:', error);
    } finally {
      setIsChecking(false);
    }
  }, [user?.id, providers]);
  
  // Sync API keys between localStorage and database
  const syncApiKeys = async () => {
    if (!user?.id) return;
    
    setIsChecking(true);
    setSyncMessage(null);
    
    try {
      const success = await userService.syncApiKeys(user.id);
      
      if (success) {
        setSyncMessage({
          type: 'success',
          text: 'API keys synchronized successfully'
        });
        // Refresh statuses
        await checkAllApiKeys();
      } else {
        setSyncMessage({
          type: 'error',
          text: 'Failed to synchronize API keys'
        });
      }
    } catch (error) {
      console.error('Error syncing API keys:', error);
      setSyncMessage({
        type: 'error',
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Check API keys on load
  useEffect(() => {
    if (user?.id) {
      checkAllApiKeys();
    }
  }, [user?.id, checkAllApiKeys]);

  const getSourceIcon = (source: string) => {
    if (source === 'localStorage') {
      return <Smartphone className="h-4 w-4 text-muted-foreground" />;
    } else if (source.startsWith('database')) {
      return <Database className="h-4 w-4 text-muted-foreground" />;
    }
    return null;
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Key Status</CardTitle>
          <CardDescription>Log in to view your API key status</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          API Key Status
          <Button 
            size="sm" 
            variant="outline" 
            onClick={checkAllApiKeys} 
            disabled={isChecking}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>Check if your API keys are properly configured and accessible</CardDescription>
      </CardHeader>
      <CardContent>
        {isChecking ? (
          <div className="space-y-2">
            {providers.map(provider => (
              <div key={provider} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {statuses.map((status) => (
              <div key={status.provider} className="flex items-center justify-between">
                <div className="flex items-center">
                  {status.valid ? (
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                  )}
                  <span className="font-medium capitalize">{status.provider}</span>
                  {status.source !== 'not_found' && status.source !== 'error' && (
                    <div className="ml-2 flex items-center text-xs text-muted-foreground">
                      {getSourceIcon(status.source)}
                      <span className="ml-1">
                        {status.source === 'localStorage' ? 'Local' : 'Database'}
                      </span>
                    </div>
                  )}
                </div>
                <span className={status.valid ? 'text-green-500' : 'text-amber-500'}>
                  {status.valid ? 'Valid' : status.source === 'not_found' ? 'Not Found' : 'Invalid'}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {syncMessage && (
          <div className={`mt-4 text-sm ${syncMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
            {syncMessage.text}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={syncApiKeys} 
          disabled={isChecking}
          variant="secondary"
          className="w-full"
        >
          <Database className="h-4 w-4 mr-2" />
          Sync API Keys Across Devices
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ApiKeyDiagnostics; 