'use client';

import React from 'react';
import { CheckCircle, RefreshCw, AlertCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AutoSyncIndicatorProps {
  isSyncing: boolean;
  hasUnsavedChanges: boolean;
  lastSyncTime?: Date | null;
  syncError?: string | null;
  onManualSync?: () => void;
  className?: string;
  variant?: 'compact' | 'full' | 'minimal';
  showManualSync?: boolean;
}

export function AutoSyncIndicator({
  isSyncing,
  hasUnsavedChanges,
  lastSyncTime,
  syncError,
  onManualSync,
  className = '',
  variant = 'full',
  showManualSync = true
}: AutoSyncIndicatorProps) {
  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 10) return 'Just now';
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const getSyncStatus = () => {
    if (syncError) return { text: 'Sync failed', color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20', icon: AlertCircle };
    if (isSyncing) return { text: 'Syncing...', color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20', icon: RefreshCw };
    if (hasUnsavedChanges) return { text: 'Auto-saving...', color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-900/20', icon: Clock };
    return { text: 'All changes saved', color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20', icon: CheckCircle };
  };

  const status = getSyncStatus();
  const IconComponent = status.icon;

  if (variant === 'minimal') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-1", className)}>
              <IconComponent 
                className={cn(
                  "h-3 w-3",
                  status.color,
                  isSyncing && "animate-spin"
                )} 
              />
              <div className={cn("h-2 w-2 rounded-full", 
                syncError ? "bg-red-500" :
                isSyncing ? "bg-blue-500 animate-pulse" :
                hasUnsavedChanges ? "bg-orange-500 animate-pulse" :
                "bg-green-500"
              )} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <div>{status.text}</div>
              {lastSyncTime && !syncError && (
                <div className="text-muted-foreground">
                  Last sync: {formatLastSync(lastSyncTime)}
                </div>
              )}
              {syncError && (
                <div className="text-red-400 mt-1">{syncError}</div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
        status.bgColor,
        status.color,
        className
      )}>
        <IconComponent 
          className={cn(
            "h-3 w-3",
            isSyncing && "animate-spin"
          )} 
        />
        <span>{status.text}</span>
        {lastSyncTime && !syncError && !isSyncing && !hasUnsavedChanges && (
          <span className="text-muted-foreground">
            • {formatLastSync(lastSyncTime)}
          </span>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border transition-all",
      status.bgColor,
      "border-current/20",
      className
    )}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <IconComponent 
            className={cn(
              "h-4 w-4",
              status.color,
              isSyncing && "animate-spin"
            )} 
          />
          <span className={cn("text-sm font-medium", status.color)}>
            {status.text}
          </span>
        </div>
        
        {lastSyncTime && !syncError && (
          <span className="text-xs text-muted-foreground">
            Last sync: {formatLastSync(lastSyncTime)}
          </span>
        )}
        
        {syncError && (
          <span className="text-xs text-red-500">
            {syncError}
          </span>
        )}
      </div>
      
      {showManualSync && onManualSync && (
        <Button
          variant="outline"
          size="sm"
          onClick={onManualSync}
          disabled={isSyncing}
          className="text-xs h-7"
        >
          <RefreshCw className={cn("h-3 w-3 mr-1", isSyncing && "animate-spin")} />
          Sync Now
        </Button>
      )}
    </div>
  );
}

// Auto-sync banner for prominent display
export function AutoSyncBanner({
  isSyncing,
  hasUnsavedChanges,
  lastSyncTime,
  syncError,
  onManualSync,
  className = ''
}: AutoSyncIndicatorProps) {
  const status = React.useMemo(() => {
    if (syncError) return { 
      text: 'Auto-sync failed', 
      subtext: 'Your changes are saved locally but not synced to the cloud',
      color: 'text-red-600 dark:text-red-400', 
      bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      icon: AlertCircle 
    };
    if (isSyncing) return { 
      text: 'Auto-syncing your changes...', 
      subtext: 'Your settings are being saved to the cloud',
      color: 'text-blue-600 dark:text-blue-400', 
      bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      icon: RefreshCw 
    };
    if (hasUnsavedChanges) return { 
      text: 'Auto-save in progress...', 
      subtext: 'Your changes will be saved automatically',
      color: 'text-orange-600 dark:text-orange-400', 
      bgColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      icon: Clock 
    };
    return { 
      text: 'All changes auto-saved', 
      subtext: 'Your settings are synced across all devices',
      color: 'text-green-600 dark:text-green-400', 
      bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      icon: CheckCircle 
    };
  }, [syncError, isSyncing, hasUnsavedChanges]);

  const IconComponent = status.icon;

  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-lg border transition-all",
      status.bgColor,
      className
    )}>
      <div className="flex items-center gap-3">
        <IconComponent 
          className={cn(
            "h-5 w-5 flex-shrink-0",
            status.color,
            isSyncing && "animate-spin"
          )} 
        />
        <div>
          <div className={cn("font-medium", status.color)}>
            {status.text}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">
            {status.subtext}
          </div>
          {lastSyncTime && !syncError && !isSyncing && !hasUnsavedChanges && (
            <div className="text-xs text-muted-foreground mt-1">
              Last synced: {lastSyncTime.toLocaleString()}
            </div>
          )}
        </div>
      </div>
      
      {syncError && onManualSync && (
        <Button
          variant="outline"
          size="sm"
          onClick={onManualSync}
          className="text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry Sync
        </Button>
      )}
    </div>
  );
}