import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useModelSettings, ModelSettings, ChatMode } from '@/lib/context/ModelSettingsContext';
import { 
  Eye, EyeOff, MessageSquare 
} from 'lucide-react';
import { getChatModeIcon, getChatModeColor, getChatModeDescription } from './SettingsUtils';

export default function ChatSettings() {
  const { settings, updateSettings } = useModelSettings();
  const [localSettings, setLocalSettings] = useState<ModelSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChatModeChange = (mode: ChatMode) => {
    const updatedSettings = {
      ...localSettings,
      chatMode: mode
    };
    setLocalSettings(updatedSettings);
    updateSettings(updatedSettings);
  };

  const handleToggleShowThinking = () => {
    const updatedSettings = {
      ...localSettings,
      showThinking: !localSettings.showThinking
    };
    setLocalSettings(updatedSettings);
    updateSettings(updatedSettings);
  };

  return (
    <Card className="border dark:border-slate-700">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-indigo-500" />
          Chat Settings
        </CardTitle>
        <CardDescription>
          Configure your chat experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chat Mode Selection */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
            Chat Mode
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(['thoughtful', 'quick', 'creative', 'technical', 'learning'] as ChatMode[]).map(mode => (
              <Button 
                key={mode}
                className={`${getChatModeColor(mode)} transition-colors h-auto py-2 px-2`}
                onClick={() => handleChatModeChange(mode)}
              >
                <div className="flex flex-col items-center gap-1 w-full">
                  {getChatModeIcon(mode)}
                  <span className="font-medium text-xs sm:text-sm">
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </span>
                </div>
              </Button>
            ))}
          </div>
          
          <p className="text-xs sm:text-sm mt-2 text-slate-600 dark:text-slate-400">
            {getChatModeDescription(localSettings.chatMode)}
          </p>
        </div>
        
        {/* Show Thinking Toggle */}
        <div className="pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Show Thinking Process
              </h3>
              <div className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5">
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">New</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={`h-9 w-9 p-0 ${
                localSettings.showThinking
                  ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                  : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}
              onClick={handleToggleShowThinking}
            >
              {localSettings.showThinking ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs sm:text-sm mt-1 text-slate-600 dark:text-slate-400">
            When enabled, you'll see the AI's thinking process before it responds
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 