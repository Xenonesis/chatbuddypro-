import React from 'react';
import { useModelSettings } from '@/lib/context/ModelSettingsContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Calendar, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ChatManagementSettings() {
  const { 
    settings, 
    toggleAutoDeleteChats, 
    setRetentionPeriod 
  } = useModelSettings();
  const { chatManagementSettings } = settings;

  const retentionOptions = [
    { value: 7, label: '7 days' },
    { value: 14, label: '2 weeks' },
    { value: 30, label: '1 month' },
    { value: 60, label: '2 months' },
    { value: 90, label: '3 months' },
    { value: 180, label: '6 months' },
    { value: 365, label: '1 year' }
  ];

  const handleRetentionChange = (value: string) => {
    setRetentionPeriod(parseInt(value));
  };

  return (
    <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-500" />
          Chat Management
        </CardTitle>
        <CardDescription>
          Configure automatic chat deletion and storage management
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Auto-delete toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-delete-enabled">Automatic Chat Deletion</Label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Automatically delete old chats to keep your storage clean
            </p>
          </div>
          <Switch
            id="auto-delete-enabled"
            checked={chatManagementSettings.autoDeleteEnabled}
            onCheckedChange={toggleAutoDeleteChats}
          />
        </div>

        {/* Retention period selector */}
        {chatManagementSettings.autoDeleteEnabled && (
          <div className="space-y-3">
            <div className="space-y-0.5">
              <Label htmlFor="retention-period">Retention Period</Label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chats older than this period will be automatically deleted
              </p>
            </div>
            <Select 
              value={chatManagementSettings.retentionPeriodDays.toString()} 
              onValueChange={handleRetentionChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select retention period" />
              </SelectTrigger>
              <SelectContent>
                {retentionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Warning alert */}
        {chatManagementSettings.autoDeleteEnabled && (
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Warning:</strong> Deleted chats cannot be recovered. Make sure to export any important conversations before they are automatically deleted.
            </AlertDescription>
          </Alert>
        )}

        {/* Info about last cleanup */}
        {chatManagementSettings.autoDeleteEnabled && chatManagementSettings.lastCleanupDate && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-800 dark:text-blue-200">
                <strong>Last cleanup:</strong> {new Date(chatManagementSettings.lastCleanupDate).toLocaleDateString()}
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                Cleanup runs automatically when you visit the app
              </p>
            </div>
          </div>
        )}

        {/* Manual cleanup info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Manual Chat Deletion
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 ml-6">
            You can always delete individual chats manually from the chat history. 
            Use the three-dot menu next to any chat to delete it immediately.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
