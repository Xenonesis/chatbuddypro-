import { AIProvider, ChatMode } from '@/lib/context/ModelSettingsContext';
import { Brain, Zap, Lightbulb, Code, GraduationCap } from 'lucide-react';

// Provider utility functions
export const getProviderColor = (provider: AIProvider) => {
  switch(provider) {
    case 'openai': return 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20';
    case 'gemini': return 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20';
    case 'mistral': return 'border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20';
    case 'claude': return 'border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20';
    case 'llama': return 'border-orange-400 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20';
    case 'deepseek': return 'border-teal-400 dark:border-teal-600 bg-teal-50 dark:bg-teal-900/20';
    default: return 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800';
  }
};

export const getProviderTextColor = (provider: AIProvider) => {
  switch(provider) {
    case 'openai': return 'text-green-700 dark:text-green-400';
    case 'gemini': return 'text-blue-700 dark:text-blue-400';
    case 'mistral': return 'text-purple-700 dark:text-purple-400';
    case 'claude': return 'text-amber-700 dark:text-amber-400';
    case 'llama': return 'text-orange-700 dark:text-orange-400';
    case 'deepseek': return 'text-teal-700 dark:text-teal-400';
    default: return 'text-gray-700 dark:text-gray-400';
  }
};

export const getProviderButtonColor = (provider: AIProvider, isEnabled: boolean) => {
  if (!isEnabled) return 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300';
  
  switch(provider) {
    case 'openai': return 'bg-green-500 hover:bg-green-600 text-white';
    case 'gemini': return 'bg-blue-500 hover:bg-blue-600 text-white';
    case 'mistral': return 'bg-purple-500 hover:bg-purple-600 text-white';
    case 'claude': return 'bg-amber-500 hover:bg-amber-600 text-white';
    case 'llama': return 'bg-orange-500 hover:bg-orange-600 text-white';
    case 'deepseek': return 'bg-teal-500 hover:bg-teal-600 text-white';
    default: return 'bg-gray-500 hover:bg-gray-600 text-white';
  }
};

// Chat mode utility functions
export const getChatModeIcon = (mode: ChatMode) => {
  switch(mode) {
    case 'thoughtful': return <Brain className="h-4 w-4" />;
    case 'quick': return <Zap className="h-4 w-4" />;
    case 'creative': return <Lightbulb className="h-4 w-4" />;
    case 'technical': return <Code className="h-4 w-4" />;
    case 'learning': return <GraduationCap className="h-4 w-4" />;
  }
};

export const getChatModeColor = (mode: ChatMode) => {
  switch(mode) {
    case 'thoughtful': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    case 'quick': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
    case 'creative': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
    case 'technical': return 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    case 'learning': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
  }
};

export const getChatModeButtonColor = (mode: ChatMode, isSelected: boolean) => {
  if (!isSelected) return 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300';
  
  switch(mode) {
    case 'thoughtful': return 'bg-blue-600 hover:bg-blue-700 text-white';
    case 'quick': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    case 'creative': return 'bg-orange-500 hover:bg-orange-600 text-white';
    case 'technical': return 'bg-slate-700 hover:bg-slate-800 text-white';
    case 'learning': return 'bg-emerald-600 hover:bg-emerald-700 text-white';
  }
};

export const getChatModeDescription = (mode: ChatMode) => {
  switch(mode) {
    case 'thoughtful': return 'Detailed, well-considered responses';
    case 'quick': return 'Faster, shorter responses';
    case 'creative': return 'Storytelling, content creation, and imaginative responses';
    case 'technical': return 'Coding, technical explanations, and structured data';
    case 'learning': return 'Educational contexts and explanations';
  }
}; 