import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useChatSettings } from '@/hooks/useChatSettings';
import { ChatMode } from '@/lib/services/chatSettingsService';
import { 
  Eye, EyeOff, MessageSquare, Brain, Zap, Lightbulb, Code, GraduationCap, 
  Info, LayoutGrid, AlignJustify, Check, Bot, Save, Loader2
} from 'lucide-react';
import { getChatModeIcon, getChatModeColor, getChatModeDescription, getChatModeButtonColor } from './SettingsUtils';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Add keyframe animation at the top of the file after the imports
const styles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@media (max-width: 480px) {
  .xs\\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (hover: none) {
  .touch-manipulation {
    touch-action: manipulation;
  }
}
`;

export default function ChatSettings() {
  const {
    settings,
    localSettings,
    isLoading,
    isSaving,
    hasChanges,
    updateChatMode,
    updateShowThinking,
    updateShowPreview,
    updateViewMode,
    saveSettings,
    resetChanges
  } = useChatSettings();
  
  const [activeView, setActiveView] = useState(localSettings.viewMode || 'grid');

  // Update active view when settings change
  useEffect(() => {
    setActiveView(localSettings.viewMode || 'grid');
  }, [localSettings.viewMode]);

  // Add the styles to the document head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleChatModeChange = (mode: ChatMode) => {
    updateChatMode(mode);
  };

  const handleToggleShowThinking = () => {
    updateShowThinking(!localSettings.showThinking);
  };

  const handleViewChange = (view: 'grid' | 'list' | 'sidebar') => {
    setActiveView(view);
    updateViewMode(view);
  };

  const handleToggleShowPreview = () => {
    updateShowPreview(!localSettings.showPreview);
  };

  const handleSaveSettings = async () => {
    await saveSettings();
  };

  // Render a chat bubble to preview the current mode
  const renderPreview = () => {
    return (
      <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-start gap-3 mb-4">
          <div className="h-9 w-9 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium mb-1">You</div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm">
              Tell me about the solar system in {localSettings.chatMode} mode
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center text-white flex-shrink-0">
            <Bot className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium mb-1">AI Assistant ({localSettings.chatMode} mode)</div>
            
            {localSettings.showThinking && (
              <div className="p-3 mb-2 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-xs italic border border-dashed border-slate-300 dark:border-slate-600">
                <div className="font-medium mb-1 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">Thinking...</div>
                I should provide information about the solar system in a{' '}
                {localSettings.chatMode === 'thoughtful' && 'detailed, comprehensive way with well-structured facts'}
                {localSettings.chatMode === 'quick' && 'concise, to-the-point manner focusing on key facts'}
                {localSettings.chatMode === 'creative' && 'creative, engaging way that sparks imagination'}
                {localSettings.chatMode === 'technical' && 'technically precise way with scientific data and terminology'}
                {localSettings.chatMode === 'learning' && 'educational format suitable for learning with clear explanations'}
              </div>
            )}
            
            <div className="p-3 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm">
              {localSettings.chatMode === 'thoughtful' && 
                'The solar system is a complex and fascinating celestial structure consisting of our Sun, eight planets, dwarf planets, moons, asteroids, comets, and other objects bound by gravity. Each planet has unique characteristics: Mercury is closest to the Sun with extreme temperature variations; Venus has a thick atmosphere creating a runaway greenhouse effect; Earth is the only known planet with life; Mars has evidence of ancient water; Jupiter is the largest planet with a strong magnetic field; Saturn is known for its extensive ring system; Uranus rotates on its side; and Neptune has strong winds and storms despite its distance from the Sun...'}
              
              {localSettings.chatMode === 'quick' && 
                'The solar system contains the Sun and objects orbiting it: 8 planets (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune), dwarf planets, moons, asteroids, and comets.'}
              
              {localSettings.chatMode === 'creative' && 
                'Imagine a cosmic dance of celestial bodies, with our radiant Sun as the lead performer! Eight planets twirl around this fiery star, each with their own personality. Mercury dashes closest to the spotlight, while distant Neptune waltzes slowly at the edge of the ballroom. Earth, our blue-green haven, performs the perfect choreography for life to flourish, while Mars dons a rusty costume and dreams of ancient rivers. Jupiter struts with its massive presence, while Saturn adorns itself with magnificent rings like cosmic jewelry...'}
              
              {localSettings.chatMode === 'technical' && 
                'The solar system is composed of the G-type main-sequence star (G2V) Sol with a mass of 1.989 × 10^30 kg, constituting 99.86% of the system\'s total mass. Orbiting Sol are eight planets in approximately elliptical orbits, ranging from Mercury at 0.39 AU to Neptune at 30.07 AU. The terrestrial planets (Mercury, Venus, Earth, Mars) are primarily composed of silicate rocks and metals with mean densities of 3.9-5.5 g/cm³, while the gas giants (Jupiter, Saturn) and ice giants (Uranus, Neptune) are predominantly composed of hydrogen, helium, and ices with mean densities of 0.7-1.6 g/cm³...'}
              
              {localSettings.chatMode === 'learning' && 
                'The solar system is our cosmic neighborhood! At the center is our Sun, a star that provides light and heat. Around the Sun orbit eight planets. The inner, rocky planets are Mercury, Venus, Earth, and Mars. Earth is special because it has liquid water and life! The outer planets are gas giants Jupiter and Saturn, and ice giants Uranus and Neptune. Let\'s learn about what makes each planet unique. Mercury is closest to the Sun and has no atmosphere, so it gets very hot during the day but very cold at night. Venus has thick clouds that trap heat, making it the hottest planet even though it\'s not closest to the Sun...'}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
          {/* View Toggle */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              Chat Mode
            </h3>
            
            <div className="flex items-center space-x-1 rounded-md bg-slate-100 dark:bg-slate-800 p-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "px-2.5 text-xs",
                  activeView === 'sidebar' 
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm" 
                    : "text-slate-600 dark:text-slate-400"
                )}
                onClick={() => handleViewChange('sidebar')}
              >
                <div className="h-3.5 w-3.5 mr-1 flex flex-col gap-0.5">
                  <div className="h-1 w-1 bg-current rounded-full"></div>
                  <div className="h-1 w-1 bg-current rounded-full"></div>
                  <div className="h-1 w-1 bg-current rounded-full"></div>
                </div>
                Sidebar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "px-2.5 text-xs",
                  activeView === 'grid' 
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm" 
                    : "text-slate-600 dark:text-slate-400"
                )}
                onClick={() => handleViewChange('grid')}
              >
                <LayoutGrid className="h-3.5 w-3.5 mr-1" />
                Grid
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                className={cn(
                  "px-2.5 text-xs",
                  activeView === 'list' 
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm" 
                    : "text-slate-600 dark:text-slate-400"
                )}
                onClick={() => handleViewChange('list')}
              >
                <AlignJustify className="h-3.5 w-3.5 mr-1" />
                List
              </Button>
            </div>
          </div>
          
          {/* Chat Mode Selection - Grid View */}
          {activeView === 'grid' && (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
              {(['thoughtful', 'quick', 'creative', 'technical', 'learning'] as ChatMode[]).map(mode => (
                <TooltipProvider key={mode} delayDuration={700}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline"
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 h-auto min-h-24 py-4 relative border-2 w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
                          localSettings.chatMode === mode 
                            ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-600 border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20"
                            : "hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        )}
                        onClick={() => handleChatModeChange(mode)}
                      >
                        <div className={cn(
                          "rounded-full p-3 mb-1",
                          mode === 'thoughtful' && "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
                          mode === 'quick' && "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",
                          mode === 'creative' && "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
                          mode === 'technical' && "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
                          mode === 'learning' && "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
                          "transform transition-transform duration-200",
                          localSettings.chatMode === mode ? "scale-110" : ""
                        )}>
                          {mode === 'thoughtful' && <Brain className="h-5 w-5" />}
                          {mode === 'quick' && <Zap className="h-5 w-5" />}
                          {mode === 'creative' && <Lightbulb className="h-5 w-5" />}
                          {mode === 'technical' && <Code className="h-5 w-5" />}
                          {mode === 'learning' && <GraduationCap className="h-5 w-5" />}
                        </div>
                        <div className="text-center px-1">
                          <div className="font-medium text-sm mb-0.5">
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 max-w-[120px] mx-auto">
                            {mode === 'thoughtful' && "Detailed, well-considered"}
                            {mode === 'quick' && "Brief, to the point"}
                            {mode === 'creative' && "Imaginative, storytelling"}
                            {mode === 'technical' && "Precise, structured"}
                            {mode === 'learning' && "Educational, explanatory"}
                          </div>
                        </div>
                        
                        {localSettings.chatMode === mode && (
                          <div className="absolute top-1.5 right-1.5 animate-fadeIn">
                            <div className="h-4 w-4 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white shadow-sm">
                              <Check className="h-3 w-3" />
                            </div>
                          </div>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={5} className="text-xs max-w-[200px] text-center">
                      <p>{getChatModeDescription(mode)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}
          
          {/* Chat Mode Selection - Sidebar View */}
          {activeView === 'sidebar' && (
            <div className="flex items-start gap-6">
              {/* Vertical Sidebar */}
              <div className="flex flex-col bg-slate-900 dark:bg-slate-800 rounded-2xl p-3 space-y-3 min-w-[80px]">
                {/* Active mode indicator at top */}
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white shadow-lg ring-4 ring-blue-500/20">
                    {localSettings.chatMode === 'thoughtful' && <Brain className="h-6 w-6" />}
                    {localSettings.chatMode === 'quick' && <Zap className="h-6 w-6" />}
                    {localSettings.chatMode === 'creative' && <Lightbulb className="h-6 w-6" />}
                    {localSettings.chatMode === 'technical' && <Code className="h-6 w-6" />}
                    {localSettings.chatMode === 'learning' && <GraduationCap className="h-6 w-6" />}
                  </div>
                </div>
                
                {/* Separator */}
                <div className="h-px bg-slate-700 dark:bg-slate-600 mx-2"></div>
                
                {/* Mode options */}
                <div className="space-y-2">
                  {(['thoughtful', 'quick', 'creative', 'technical', 'learning'] as ChatMode[]).map(mode => (
                    <TooltipProvider key={mode} delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleChatModeChange(mode)}
                            className={cn(
                              "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95",
                              localSettings.chatMode === mode
                                ? "bg-blue-500 dark:bg-blue-600 text-white shadow-lg ring-2 ring-blue-400/50"
                                : "bg-slate-700 dark:bg-slate-600 text-slate-300 hover:bg-slate-600 dark:hover:bg-slate-500 hover:text-white"
                            )}
                            aria-label={`Select ${mode} mode`}
                          >
                            {mode === 'thoughtful' && <Brain className="h-5 w-5" />}
                            {mode === 'quick' && <Zap className="h-5 w-5" />}
                            {mode === 'creative' && <Lightbulb className="h-5 w-5" />}
                            {mode === 'technical' && <Code className="h-5 w-5" />}
                            {mode === 'learning' && <GraduationCap className="h-5 w-5" />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10}>
                          <div className="text-center">
                            <p className="font-medium">{mode.charAt(0).toUpperCase() + mode.slice(1)}</p>
                            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                              {getChatModeDescription(mode)}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
              
              {/* Content Area */}
              <div className="flex-1 space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    {localSettings.chatMode === 'thoughtful' && <Brain className="h-5 w-5 text-blue-500" />}
                    {localSettings.chatMode === 'quick' && <Zap className="h-5 w-5 text-yellow-500" />}
                    {localSettings.chatMode === 'creative' && <Lightbulb className="h-5 w-5 text-orange-500" />}
                    {localSettings.chatMode === 'technical' && <Code className="h-5 w-5 text-slate-500" />}
                    {localSettings.chatMode === 'learning' && <GraduationCap className="h-5 w-5 text-emerald-500" />}
                    {localSettings.chatMode.charAt(0).toUpperCase() + localSettings.chatMode.slice(1)} Mode
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {getChatModeDescription(localSettings.chatMode)}
                  </p>
                  
                  {/* Mode-specific details */}
                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    {localSettings.chatMode === 'thoughtful' && (
                      <div className="space-y-1">
                        <p>• Provides comprehensive, well-researched responses</p>
                        <p>• Takes time to consider multiple perspectives</p>
                        <p>• Includes relevant context and background information</p>
                      </div>
                    )}
                    {localSettings.chatMode === 'quick' && (
                      <div className="space-y-1">
                        <p>• Delivers concise, direct answers</p>
                        <p>• Focuses on key points without elaboration</p>
                        <p>• Perfect for quick questions and fast responses</p>
                      </div>
                    )}
                    {localSettings.chatMode === 'creative' && (
                      <div className="space-y-1">
                        <p>• Uses imaginative language and storytelling</p>
                        <p>• Explores creative solutions and ideas</p>
                        <p>• Engages with metaphors and vivid descriptions</p>
                      </div>
                    )}
                    {localSettings.chatMode === 'technical' && (
                      <div className="space-y-1">
                        <p>• Provides precise, structured information</p>
                        <p>• Uses technical terminology appropriately</p>
                        <p>• Focuses on accuracy and detailed specifications</p>
                      </div>
                    )}
                    {localSettings.chatMode === 'learning' && (
                      <div className="space-y-1">
                        <p>• Breaks down complex topics into digestible parts</p>
                        <p>• Provides examples and analogies for clarity</p>
                        <p>• Encourages understanding through explanation</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Mode Selection - List View */}
          {activeView === 'list' && (
            <div className="space-y-2.5">
              {(['thoughtful', 'quick', 'creative', 'technical', 'learning'] as ChatMode[]).map(mode => (
                <div
                  key={mode}
                  className={cn(
                    "flex items-center gap-3 p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50",
                    "touch-manipulation active:scale-[0.99]",
                    localSettings.chatMode === mode 
                      ? "ring-2 ring-offset-1 ring-blue-500 dark:ring-blue-600 border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                  onClick={() => handleChatModeChange(mode)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${mode} chat mode${localSettings.chatMode === mode ? ' (currently selected)' : ''}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleChatModeChange(mode);
                    }
                  }}
                >
                  <div className={cn(
                    "rounded-full p-3 flex-shrink-0 transition-all duration-200",
                    mode === 'thoughtful' && "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
                    mode === 'quick' && "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",
                    mode === 'creative' && "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
                    mode === 'technical' && "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
                    mode === 'learning' && "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
                    localSettings.chatMode === mode ? "scale-110" : ""
                  )}>
                    {mode === 'thoughtful' && <Brain className="h-5 w-5" />}
                    {mode === 'quick' && <Zap className="h-5 w-5" />}
                    {mode === 'creative' && <Lightbulb className="h-5 w-5" />}
                    {mode === 'technical' && <Code className="h-5 w-5" />}
                    {mode === 'learning' && <GraduationCap className="h-5 w-5" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm sm:text-base flex items-center flex-wrap gap-2">
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      {localSettings.chatMode === mode && (
                        <Badge className="ml-1" variant="secondary">Current</Badge>
                      )}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate sm:whitespace-normal">
                      {getChatModeDescription(mode)}
                    </p>
                  </div>
                  
                  {localSettings.chatMode === mode ? (
                    <Check className="h-4 w-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-600 flex-shrink-0"></div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Preview Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleToggleShowPreview}
                className="text-xs h-8 px-3"
              >
                {localSettings.showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                See how responses will look
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="thinking-mode" 
                  checked={localSettings.showThinking}
                  onCheckedChange={handleToggleShowThinking}
                />
                <Label htmlFor="thinking-mode" className="text-xs cursor-pointer">
                  {localSettings.showThinking ? (
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      Show Thinking
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <EyeOff className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                      Hide Thinking
                    </span>
                  )}
                </Label>
              </div>
            </div>
          </div>
          
          {/* Preview area */}
          {localSettings.showPreview && (
            <div className="mt-4 animate-fadeIn">
              {renderPreview()}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2">
            {hasChanges && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetChanges}
                className="text-xs"
              >
                Reset
              </Button>
            )}
            
            <Button
              onClick={handleSaveSettings}
              size="sm"
              disabled={!hasChanges || isSaving}
              className={cn(
                "text-xs",
                !hasChanges && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSaving ? (
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Save className="h-3.5 w-3.5 mr-1" />
                  Save Settings
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 