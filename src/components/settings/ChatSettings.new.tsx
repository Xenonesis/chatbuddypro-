import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Info } from 'lucide-react';
import { useModelSettings } from '@/lib/context/ModelSettingsContext';
import { cn } from '@/lib/utils';

export default function ChatSettings() {
  const { settings, updateSettings } = useModelSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  
  return (
    <div className="w-full space-y-6 animate-fadeIn">
      <Card className="overflow-hidden border-primary/10">
        <CardHeader className="relative pb-2">
          <div className="absolute inset-0 h-12 bg-gradient-to-r from-primary/10 to-primary/5"></div>
          <CardTitle className="flex items-center gap-2 pt-4 z-10 relative">
            <MessageSquare className="h-5 w-5 text-primary" />
            Chat Settings
          </CardTitle>
          <CardDescription className="z-10 relative">
            Configure your AI chat experience and response style
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              Chat Mode
            </h3>
            
            <div>
              <Button>
                Test Button
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 