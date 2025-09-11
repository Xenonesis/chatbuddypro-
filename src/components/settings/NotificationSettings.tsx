'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { pwaService } from '@/lib/services/pwaService';
import { Bell, BellOff, Shield, MessageSquare, Settings, Mail, Clock, Globe } from 'lucide-react';

interface NotificationPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  chat_messages: boolean;
  system_updates: boolean;
  security_alerts: boolean;
  marketing: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
}

export function NotificationSettings() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    push_enabled: true,
    email_enabled: true,
    chat_messages: true,
    system_updates: true,
    security_alerts: true,
    marketing: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    timezone: 'UTC'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pushStatus, setPushStatus] = useState<{
    isSubscribed: boolean;
    permission: NotificationPermission;
    subscription: PushSubscription | null;
  }>({
    isSubscribed: false,
    permission: 'default',
    subscription: null
  });

  // Load notification preferences on component mount
  useEffect(() => {
    loadPreferences();
    checkPushStatus();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      const data = await response.json();

      if (data.success) {
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkPushStatus = async () => {
    try {
      const status = await pwaService.getSubscriptionStatus();
      setPushStatus(status);
    } catch (error) {
      console.error('Failed to check push status:', error);
    }
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Notification preferences saved successfully'
        });
      } else {
        throw new Error(data.error || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePushToggle = async (enabled: boolean) => {
    try {
      if (enabled) {
        // Enable push notifications
        const permission = await pwaService.requestNotificationPermission();
        
        if (permission === 'granted') {
          await pwaService.setupPushNotifications();
          await checkPushStatus();
          
          setPreferences(prev => ({ ...prev, push_enabled: true }));
          
          toast({
            title: 'Success',
            description: 'Push notifications enabled successfully'
          });
        } else {
          toast({
            title: 'Permission Required',
            description: 'Please allow notifications in your browser settings',
            variant: 'destructive'
          });
        }
      } else {
        // Disable push notifications
        await pwaService.unsubscribeFromPush();
        await checkPushStatus();
        
        setPreferences(prev => ({ ...prev, push_enabled: false }));
        
        toast({
          title: 'Success',
          description: 'Push notifications disabled'
        });
      }
    } catch (error) {
      console.error('Failed to toggle push notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to update push notification settings',
        variant: 'destructive'
      });
    }
  };

  const testNotification = async () => {
    try {
      if (pushStatus.permission !== 'granted') {
        toast({
          title: 'Permission Required',
          description: 'Please enable push notifications first',
          variant: 'destructive'
        });
        return;
      }

      await pwaService.showNotification({
        title: 'Test Notification',
        body: 'This is a test notification from ChatBuddy!',
        tag: 'test-notification',
        url: '/chat'
      });

      toast({
        title: 'Test Sent',
        description: 'Test notification sent successfully'
      });
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send test notification',
        variant: 'destructive'
      });
    }
  };

  const timezones = [
    'UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo',
    'Asia/Shanghai', 'Asia/Kolkata', 'Australia/Sydney'
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Push Notifications Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Receive real-time notifications on this device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about new messages and important updates
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={pushStatus.permission === 'granted' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {pushStatus.permission}
              </Badge>
              <Switch
                checked={preferences.push_enabled && pushStatus.isSubscribed}
                onCheckedChange={handlePushToggle}
                disabled={pushStatus.permission === 'denied'}
              />
            </div>
          </div>

          {pushStatus.permission === 'denied' && (
            <Alert>
              <BellOff className="h-4 w-4" />
              <AlertDescription>
                Push notifications are blocked. Please enable them in your browser settings to receive notifications.
              </AlertDescription>
            </Alert>
          )}

          {pushStatus.permission === 'granted' && pushStatus.isSubscribed && (
            <div className="flex gap-2">
              <Button onClick={testNotification} variant="outline" size="sm">
                Send Test Notification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Categories
          </CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <div>
                  <Label>Chat Messages</Label>
                  <p className="text-sm text-muted-foreground">New messages and responses</p>
                </div>
              </div>
              <Switch
                checked={preferences.chat_messages}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, chat_messages: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-green-500" />
                <div>
                  <Label>System Updates</Label>
                  <p className="text-sm text-muted-foreground">App updates and new features</p>
                </div>
              </div>
              <Switch
                checked={preferences.system_updates}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, system_updates: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-500" />
                <div>
                  <Label>Security Alerts</Label>
                  <p className="text-sm text-muted-foreground">Important security notifications</p>
                </div>
              </div>
              <Switch
                checked={preferences.security_alerts}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, security_alerts: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-500" />
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
              </div>
              <Switch
                checked={preferences.email_enabled}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, email_enabled: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Set times when you don't want to receive notifications (except security alerts)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Select
                value={preferences.quiet_hours_start}
                onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, quiet_hours_start: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                        {hour}:00
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <Select
                value={preferences.quiet_hours_end}
                onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, quiet_hours_end: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                        {hour}:00
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Timezone
            </Label>
            <Select
              value={preferences.timezone}
              onValueChange={(value) => 
                setPreferences(prev => ({ ...prev, timezone: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}