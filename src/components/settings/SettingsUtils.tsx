import { AIProvider, ChatMode } from '@/lib/context/ModelSettingsContext';
import { Brain, Zap, Lightbulb, Code, GraduationCap } from 'lucide-react';

// Provider utility functions
export const getProviderColor = (provider: AIProvider) => {
  switch(provider) {
    case 'openai': return 'border-green-400 bg-gradient-to-br from-green-50 to-green-100/70 dark:from-green-900/30 dark:to-green-800/20 dark:border-green-700';
    case 'gemini': return 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100/70 dark:from-blue-900/30 dark:to-blue-800/20 dark:border-blue-700';
    case 'mistral': return 'border-purple-400 bg-gradient-to-br from-purple-50 to-purple-100/70 dark:from-purple-900/30 dark:to-purple-800/20 dark:border-purple-700';
    case 'claude': return 'border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100/70 dark:from-amber-900/30 dark:to-amber-800/20 dark:border-amber-700';
    case 'llama': return 'border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100/70 dark:from-orange-900/30 dark:to-orange-800/20 dark:border-orange-700';
    case 'deepseek': return 'border-teal-400 bg-gradient-to-br from-teal-50 to-teal-100/70 dark:from-teal-900/30 dark:to-teal-800/20 dark:border-teal-700';
    case 'openrouter': return 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-indigo-100/70 dark:from-indigo-900/30 dark:to-indigo-800/20 dark:border-indigo-700';
    default: return 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100/70 dark:from-gray-800/30 dark:to-gray-700/20 dark:border-gray-600';
  }
};

export const getProviderTextColor = (provider: AIProvider) => {
  switch(provider) {
    case 'openai': return 'text-green-700 dark:text-green-400 font-medium';
    case 'gemini': return 'text-blue-700 dark:text-blue-400 font-medium';
    case 'mistral': return 'text-purple-700 dark:text-purple-400 font-medium';
    case 'claude': return 'text-amber-700 dark:text-amber-400 font-medium';
    case 'llama': return 'text-orange-700 dark:text-orange-400 font-medium';
    case 'deepseek': return 'text-teal-700 dark:text-teal-400 font-medium';
    case 'openrouter': return 'text-indigo-700 dark:text-indigo-400 font-medium';
    default: return 'text-gray-700 dark:text-gray-400 font-medium';
  }
};

export const getProviderButtonColor = (provider: AIProvider, isEnabled: boolean) => {
  if (!isEnabled) return 'bg-slate-200 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-600/50 text-slate-700 dark:text-slate-300 shadow-sm';
  
  switch(provider) {
    case 'openai': return 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md shadow-green-500/20 dark:shadow-green-900/30';
    case 'gemini': return 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md shadow-blue-500/20 dark:shadow-blue-900/30';
    case 'mistral': return 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md shadow-purple-500/20 dark:shadow-purple-900/30';
    case 'claude': return 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-500/20 dark:shadow-amber-900/30';
    case 'llama': return 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md shadow-orange-500/20 dark:shadow-orange-900/30';
    case 'deepseek': return 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-md shadow-teal-500/20 dark:shadow-teal-900/30';
    case 'openrouter': return 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md shadow-indigo-500/20 dark:shadow-indigo-900/30';
    default: return 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-md shadow-gray-500/20 dark:shadow-gray-900/30';
  }
};

// Chat mode utility functions
export const getChatModeIcon = (mode: ChatMode) => {
  switch(mode) {
    case 'thoughtful': return <Brain className="h-5 w-5" />;
    case 'quick': return <Zap className="h-5 w-5" />;
    case 'creative': return <Lightbulb className="h-5 w-5" />;
    case 'technical': return <Code className="h-5 w-5" />;
    case 'learning': return <GraduationCap className="h-5 w-5" />;
  }
};

export const getChatModeColor = (mode: ChatMode) => {
  switch(mode) {
    case 'thoughtful': return 'bg-gradient-to-br from-blue-100 to-blue-50 text-blue-800 dark:from-blue-900/40 dark:to-blue-800/20 dark:text-blue-300';
    case 'quick': return 'bg-gradient-to-br from-yellow-100 to-yellow-50 text-yellow-800 dark:from-yellow-900/40 dark:to-yellow-800/20 dark:text-yellow-300';
    case 'creative': return 'bg-gradient-to-br from-orange-100 to-orange-50 text-orange-800 dark:from-orange-900/40 dark:to-orange-800/20 dark:text-orange-300';
    case 'technical': return 'bg-gradient-to-br from-slate-200 to-slate-100 text-slate-800 dark:from-slate-700/40 dark:to-slate-600/20 dark:text-slate-300';
    case 'learning': return 'bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-800 dark:from-emerald-900/40 dark:to-emerald-800/20 dark:text-emerald-300';
  }
};

export const getChatModeButtonColor = (mode: ChatMode, isSelected: boolean) => {
  if (!isSelected) return 'bg-slate-200 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-600/50 text-slate-700 dark:text-slate-300 shadow-sm transition-all';
  
  switch(mode) {
    case 'thoughtful': return 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md shadow-blue-500/20 dark:shadow-blue-900/30 transition-all';
    case 'quick': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-md shadow-yellow-500/20 dark:shadow-yellow-900/30 transition-all';
    case 'creative': return 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md shadow-orange-500/20 dark:shadow-orange-900/30 transition-all';
    case 'technical': return 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white shadow-md shadow-slate-500/20 dark:shadow-slate-900/30 transition-all';
    case 'learning': return 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-md shadow-emerald-500/20 dark:shadow-emerald-900/30 transition-all';
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