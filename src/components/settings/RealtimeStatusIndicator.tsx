'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface RealtimeStatusIndicatorProps {
  className?: string;
}

export function RealtimeStatusIndicator({ className = '' }: RealtimeStatusIndicatorProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      setIsConnected(false);
      return;
    }

    // Monitor Supabase connection status
    const channel = supabase.channel(`status-${user.id}`);
    
    channel
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true);
      })
      .on('presence', { event: 'join' }, () => {
        setIsConnected(true);
      })
      .on('presence', { event: 'leave' }, () => {
        setIsConnected(false);
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Listen for settings updates to show activity
    const settingsChannel = supabase
      .channel(`settings-activity-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_preferences',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          setIsUpdating(true);
          setLastUpdate(new Date());
          
          // Reset updating indicator after a short delay
          setTimeout(() => {
            setIsUpdating(false);
          }, 1000);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      settingsChannel.unsubscribe();
    };
  }, [user?.id]);

  if (!user) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <div className="flex items-center gap-1">
        {isUpdating ? (
          <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
        ) : isConnected ? (
          <Wifi className="h-3 w-3 text-green-500" />
        ) : (
          <WifiOff className="h-3 w-3 text-red-500" />
        )}
        
        <span className={`${
          isUpdating ? 'text-blue-600 dark:text-blue-400' :
          isConnected ? 'text-green-600 dark:text-green-400' : 
          'text-red-600 dark:text-red-400'
        }`}>
          {isUpdating ? 'Syncing...' :
           isConnected ? 'Live' : 
           'Offline'}
        </span>
      </div>
      
      {lastUpdate && (
        <span className="text-slate-500 dark:text-slate-400">
          Last sync: {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}