import React from 'react';
import { useModelSettings, ChatMode } from '@/lib/context/ModelSettingsContext';
import { 
  Brain, Zap, Lightbulb, Code, GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ChatModeSidebarProps {
  className?: string;
  onModeChange?: (mode: ChatMode) => void;
}

export default function ChatModeSidebar({ className, onModeChange }: ChatModeSidebarProps) {
  const { settings, setChatMode } = useModelSettings();

  const handleModeChange = async (mode: ChatMode) => {
    await setChatMode(mode);
    onModeChange?.(mode);
  };

  const getModeIcon = (mode: ChatMode) => {
    switch (mode) {
      case 'thoughtful': return <Brain className="h-5 w-5" />;
      case 'quick': return <Zap className="h-5 w-5" />;
      case 'creative': return <Lightbulb className="h-5 w-5" />;
      case 'technical': return <Code className="h-5 w-5" />;
      case 'learning': return <GraduationCap className="h-5 w-5" />;
    }
  };

  const getModeColor = (mode: ChatMode) => {
    switch (mode) {
      case 'thoughtful': return 'text-blue-500';
      case 'quick': return 'text-yellow-500';
      case 'creative': return 'text-orange-500';
      case 'technical': return 'text-slate-500';
      case 'learning': return 'text-emerald-500';
    }
  };

  const getModeDescription = (mode: ChatMode) => {
    switch (mode) {
      case 'thoughtful': return 'Detailed, well-considered responses with comprehensive analysis';
      case 'quick': return 'Brief, to-the-point answers focusing on key information';
      case 'creative': return 'Imaginative, storytelling responses with creative flair';
      case 'technical': return 'Precise, structured information with technical accuracy';
      case 'learning': return 'Educational, explanatory responses perfect for learning';
    }
  };

  const modes: ChatMode[] = ['thoughtful', 'quick', 'creative', 'technical', 'learning'];

  return (
    <div className={cn(
      "flex flex-col bg-slate-900 dark:bg-slate-800 rounded-2xl p-3 space-y-3 min-w-[80px] shadow-lg border border-slate-700 dark:border-slate-600",
      className
    )}>
      {/* Active mode indicator at top */}
      <div className="relative">
        <div className="h-12 w-12 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white shadow-lg ring-4 ring-blue-500/20">
          {getModeIcon(settings.chatMode)}
        </div>
      </div>
      
      {/* Separator */}
      <div className="h-px bg-slate-700 dark:bg-slate-600 mx-2"></div>
      
      {/* Mode options */}
      <div className="space-y-2">
        {modes.map(mode => (
          <TooltipProvider key={mode} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleModeChange(mode)}
                  className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95",
                    settings.chatMode === mode
                      ? "bg-blue-500 dark:bg-blue-600 text-white shadow-lg ring-2 ring-blue-400/50"
                      : "bg-slate-700 dark:bg-slate-600 text-slate-300 hover:bg-slate-600 dark:hover:bg-slate-500 hover:text-white"
                  )}
                  aria-label={`Select ${mode} mode`}
                >
                  {getModeIcon(mode)}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                <div className="text-center max-w-[250px]">
                  <p className="font-medium">{mode.charAt(0).toUpperCase() + mode.slice(1)}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {getModeDescription(mode)}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}