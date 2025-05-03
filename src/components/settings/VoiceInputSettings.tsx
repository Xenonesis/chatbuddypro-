import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mic, Volume2, Save, Loader, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useModelSettings } from '@/lib/context/ModelSettingsContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function VoiceInputSettings() {
  const { settings, updateSettings } = useModelSettings();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState({
    voiceInput: settings.voiceInputSettings?.enabled || false,
    continuousListening: settings.voiceInputSettings?.continuousListening || false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [isTesting, setIsTesting] = useState(false);

  // Check for microphone permissions
  useEffect(() => {
    async function checkMicrophonePermission() {
      try {
        if (navigator.permissions) {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setMicPermission(permissionStatus.state as 'granted' | 'denied' | 'prompt');
          
          permissionStatus.onchange = () => {
            setMicPermission(permissionStatus.state as 'granted' | 'denied' | 'prompt');
          };
        }
      } catch (error) {
        console.error('Error checking microphone permissions:', error);
        setMicPermission('unknown');
      }
    }
    
    checkMicrophonePermission();
  }, []);

  // Detect changes to settings
  useEffect(() => {
    setHasChanges(
      localSettings.voiceInput !== (settings.voiceInputSettings?.enabled || false) ||
      localSettings.continuousListening !== (settings.voiceInputSettings?.continuousListening || false)
    );
  }, [localSettings, settings]);

  // Save settings
  const handleSaveSettings = useCallback(() => {
    setIsSaving(true);
    
    setTimeout(() => {
      updateSettings({
        ...settings,
        voiceInputSettings: {
          enabled: localSettings.voiceInput,
          continuousListening: localSettings.continuousListening
        }
      });
      
      setIsSaving(false);
      setHasChanges(false);
      
      toast({
        title: "Voice settings saved",
        description: "Your voice input preferences have been updated.",
      });
    }, 500);
  }, [localSettings, settings, updateSettings, toast]);

  // Test microphone
  const handleTestMicrophone = useCallback(async () => {
    setIsTesting(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Show success message
      toast({
        title: "Microphone works!",
        description: "Your microphone is properly connected and accessible.",
        variant: "default",
      });
      
      // Stop all audio tracks
      stream.getTracks().forEach(track => track.stop());
      
      // Update permission state if needed
      setMicPermission('granted');
    } catch (error) {
      console.error('Microphone test failed:', error);
      
      toast({
        title: "Microphone test failed",
        description: "Please check your browser permissions and try again.",
        variant: "destructive",
      });
      
      // Update permission state if needed
      setMicPermission('denied');
    } finally {
      setIsTesting(false);
    }
  }, [toast]);

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      <Card className="overflow-hidden border-primary/10">
        <CardHeader className="relative pb-2">
          <div className="absolute inset-0 h-12 bg-gradient-to-r from-primary/10 to-primary/5"></div>
          <CardTitle className="flex items-center gap-2 pt-4 z-10 relative">
            <Mic className="h-5 w-5 text-primary" />
            Voice Input Settings
          </CardTitle>
          <CardDescription className="z-10 relative">
            Configure voice input options for hands-free chatting
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Permission Status */}
          {micPermission !== 'unknown' && (
            <div className={cn(
              "flex items-center px-4 py-3 rounded-lg border",
              micPermission === 'granted' 
                ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800/30 dark:text-green-400"
                : micPermission === 'denied'
                  ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-400"
                  : "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-400"
            )}>
              {micPermission === 'granted' ? (
                <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              ) : micPermission === 'denied' ? (
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              ) : (
                <Info className="h-4 w-4 mr-2 flex-shrink-0" />
              )}
              <p className="text-sm">
                {micPermission === 'granted'
                  ? "Microphone access is granted. Voice input is ready to use."
                  : micPermission === 'denied'
                    ? "Microphone access is blocked. Please enable it in your browser settings."
                    : "You'll need to allow microphone access when prompted."
                }
              </p>
            </div>
          )}
          
          {/* Voice Input Toggle */}
          <div className="flex justify-between items-center bg-muted/30 rounded-lg p-4">
            <div className="space-y-1">
              <Label htmlFor="voice-input-toggle" className="flex items-center font-medium">
                <Volume2 className="h-4 w-4 mr-2 text-blue-500" />
                Voice Input
              </Label>
              <p className="text-sm text-muted-foreground">
                Use your microphone to dictate messages
              </p>
            </div>
            <Switch 
              id="voice-input-toggle" 
              checked={localSettings.voiceInput} 
              onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, voiceInput: checked }))}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-600"
            />
          </div>
          
          {/* Test Microphone Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestMicrophone}
              disabled={isTesting}
              className="flex items-center gap-1.5"
            >
              {isTesting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Test Your Microphone
                </>
              )}
            </Button>
          </div>
          
          <Separator className="my-4 bg-primary/10" />
          
          {/* Continuous Listening */}
          {localSettings.voiceInput && (
            <div className="flex justify-between items-center bg-muted/30 rounded-lg p-4">
              <div className="space-y-1">
                <Label htmlFor="continuous-listening-toggle" className="flex items-center font-medium">
                  Continuous Listening
                </Label>
                <p className="text-sm text-muted-foreground">
                  Keep listening after sending a message
                </p>
              </div>
              <Switch 
                id="continuous-listening-toggle" 
                checked={localSettings.continuousListening} 
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, continuousListening: checked }))}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-600"
              />
            </div>
          )}
          
          {/* Voice Tips */}
          {localSettings.voiceInput && (
            <div className="rounded-lg border-2 border-dashed border-blue-200 dark:border-blue-800/40 p-4 bg-blue-50/40 dark:bg-blue-900/10">
              <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2 flex items-center">
                <Info className="h-3.5 w-3.5 mr-1.5" />
                Tips for best results
              </h4>
              <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1 list-disc pl-5">
                <li>Speak clearly and at a moderate pace</li>
                <li>Use "new paragraph" to create line breaks</li>
                <li>Say "send" or "submit" to send your message</li>
                <li>Say "stop listening" to temporarily pause</li>
                <li>Keep background noise to a minimum</li>
              </ul>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t bg-muted/20 px-6 py-4 justify-end">
          <Button 
            onClick={handleSaveSettings}
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <Loader className="h-4 w-4 animate-spin mr-1" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}