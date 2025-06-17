import { AIProvider, ChatMode } from '@/lib/context/ModelSettingsContext';
import React, { ReactNode } from 'react';
import { 
  Bot, 
  Cpu, 
  Cloud, 
  FlaskConical, 
  Flame, 
  Star, 
  MoreHorizontal,
  Brain, 
  Zap, 
  Lightbulb, 
  Code, 
  GraduationCap
} from 'lucide-react';

// Provider helper functions
export function getProviderDisplayName(provider: AIProvider): string {
  switch(provider) {
    case 'openai': return 'OpenAI';
    case 'gemini': return 'Gemini';
    case 'mistral': return 'Mistral';
    case 'claude': return 'Claude';
    case 'llama': return 'Llama';
    case 'deepseek': return 'Deepseek';
    default: return (provider as string).charAt(0).toUpperCase() + (provider as string).slice(1);
  }
}

export function getProviderColor(provider: AIProvider): string {
  switch(provider) {
    case 'openai': return '#10B981'; // text-green-500
    case 'gemini': return '#3B82F6'; // text-blue-500
    case 'mistral': return '#8B5CF6'; // text-purple-500
    case 'claude': return '#F59E0B'; // text-amber-500
    case 'llama': return '#F97316'; // text-orange-500
    case 'deepseek': return '#14B8A6'; // text-teal-500
    default: return '#6B7280'; // text-gray-500
  }
}

export function getProviderGradient(provider: AIProvider, isDark: boolean = false): string {
  switch(provider) {
    case 'openai': return isDark ? 'bg-gradient-to-r from-green-900 to-emerald-800' : 'bg-gradient-to-r from-green-400 to-emerald-300';
    case 'gemini': return isDark ? 'bg-gradient-to-r from-blue-900 to-indigo-800' : 'bg-gradient-to-r from-blue-400 to-indigo-300';
    case 'mistral': return isDark ? 'bg-gradient-to-r from-purple-900 to-violet-800' : 'bg-gradient-to-r from-purple-400 to-violet-300';
    case 'claude': return isDark ? 'bg-gradient-to-r from-amber-900 to-yellow-800' : 'bg-gradient-to-r from-amber-400 to-yellow-300';
    case 'llama': return isDark ? 'bg-gradient-to-r from-orange-900 to-amber-800' : 'bg-gradient-to-r from-orange-400 to-amber-300';
    case 'deepseek': return isDark ? 'bg-gradient-to-r from-teal-900 to-cyan-800' : 'bg-gradient-to-r from-teal-400 to-cyan-300';
    default: return isDark ? 'bg-gradient-to-r from-gray-900 to-slate-800' : 'bg-gradient-to-r from-gray-400 to-slate-300';
  }
}

export function getProviderIcon(provider: AIProvider, size: number = 4): ReactNode {
  const className = `h-${size} w-${size}`;
  switch(provider) {
    case 'openai': return <Bot className={className} />;
    case 'gemini': return <Cpu className={className} />;
    case 'mistral': return <Cloud className={className} />;
    case 'claude': return <FlaskConical className={className} />;
    case 'llama': return <Flame className={className} />;
    case 'deepseek': return <Star className={className} />;
    default: return <MoreHorizontal className={className} />;
  }
}

// Mode helper functions
export function getModeDisplayName(mode?: ChatMode): string {
  if (!mode) return 'Thoughtful';
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

export function getModeIcon(mode?: ChatMode, size: number = 4): ReactNode {
  const className = `h-${size} w-${size}`;
  switch(mode) {
    case 'thoughtful': return <Brain className={className} />;
    case 'quick': return <Zap className={className} />;
    case 'creative': return <Lightbulb className={className} />;
    case 'technical': return <Code className={className} />;
    case 'learning': return <GraduationCap className={className} />;
    default: return <Brain className={className} />;
  }
}

export function getModeColor(mode: ChatMode): string {
  switch(mode) {
    case 'thoughtful': return '#3B82F6'; // blue-500
    case 'quick': return '#EAB308'; // yellow-500
    case 'creative': return '#F97316'; // orange-500
    case 'technical': return '#64748B'; // slate-500
    case 'learning': return '#10B981'; // emerald-500
    default: return '#3B82F6'; // blue-500
  }
}

export function getModeDescription(mode: ChatMode): string {
  switch(mode) {
    case 'thoughtful': return 'Balanced, thorough responses';
    case 'quick': return 'Fast, concise answers';
    case 'creative': return 'Imaginative, diverse ideas';
    case 'technical': return 'Precise, detailed solutions';
    case 'learning': return 'Educational, simplified explanations';
    default: return '';
  }
}

// Model helper functions
export function getModelPricingInfo(model: string): string | null {
  // Gemini models
  if (model.startsWith('gemini')) {
    switch(model) {
      case 'gemini-1.5-pro': 
        return '$1.25/$5 per 1M tokens';
      case 'gemini-1.5-flash': 
        return '7.5¢/30¢ per 1M tokens';
      case 'gemini-2.0-flash': 
        return '10¢/40¢ per 1M tokens';
      case 'gemini-2.0-flash-lite': 
        return '7.5¢/30¢ per 1M tokens';
      default:
        return null;
    }
  }
  
  // Claude models
  if (model.startsWith('claude')) {
    switch(model) {
      case 'claude-3-5-sonnet-20240620': 
        return '$3/$15 per 1M tokens';
      case 'claude-3-opus-20240229': 
        return '$15/$75 per 1M tokens';
      case 'claude-3-sonnet-20240229': 
        return '$3/$15 per 1M tokens';
      case 'claude-3-haiku-20240307': 
        return '$0.25/$1.25 per 1M tokens';
      default:
        return null;
    }
  }
  
  // Llama models
  if (model.startsWith('llama')) {
    return 'Pricing varies';
  }
  
  return null;
} 