import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AIProvider, PROVIDER_INFO } from '@/lib/context/ModelSettingsContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Bot,
  Cpu,
  Cloud,
  FlaskConical,
  Flame,
  Star,
  Sparkles,
  Clock,
  Shapes,
  Zap,
  MessageSquare,
  FileText,
  Check,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const getProviderIcon = (provider: AIProvider) => {
  switch(provider) {
    case 'openai': return <Bot className="h-5 w-5" />;
    case 'gemini': return <Cpu className="h-5 w-5" />;
    case 'mistral': return <Cloud className="h-5 w-5" />;
    case 'claude': return <FlaskConical className="h-5 w-5" />;
    case 'llama': return <Flame className="h-5 w-5" />;
    case 'deepseek': return <Star className="h-5 w-5" />;
    default: return <Bot className="h-5 w-5" />;
  }
};

interface ModelFeature {
  name: string;
  icon: React.ReactNode;
  supported: boolean;
}

interface ModelInfo {
  name: string;
  description: string;
  contextWindow: string;
  strengths: string[];
  features: ModelFeature[];
}

interface ProviderModels {
  [modelName: string]: ModelInfo;
}

const MODEL_INFO: Record<AIProvider, ProviderModels> = {
  'openai': {
    'gpt-3.5-turbo': {
      name: 'GPT-3.5 Turbo',
      description: 'Quick and cost-effective model for everyday use.',
      contextWindow: '16K tokens',
      strengths: ['Fast response times', 'Good at general knowledge', 'Cost-effective'],
      features: [
        { name: 'Code Generation', icon: <FileText className="h-4 w-4" />, supported: true },
        { name: 'Function Calling', icon: <Shapes className="h-4 w-4" />, supported: true },
        { name: 'Image Processing', icon: <Sparkles className="h-4 w-4" />, supported: false },
      ]
    },
    'gpt-4': {
      name: 'GPT-4',
      description: 'Advanced reasoning capabilities with good accuracy.',
      contextWindow: '8K tokens',
      strengths: ['Complex reasoning', 'Nuanced instructions', 'More accurate'],
      features: [
        { name: 'Code Generation', icon: <FileText className="h-4 w-4" />, supported: true },
        { name: 'Function Calling', icon: <Shapes className="h-4 w-4" />, supported: true },
        { name: 'Image Processing', icon: <Sparkles className="h-4 w-4" />, supported: false },
      ]
    },
    'gpt-4-turbo': {
      name: 'GPT-4 Turbo',
      description: 'Faster version of GPT-4 with larger context window.',
      contextWindow: '128K tokens',
      strengths: ['Complex reasoning', 'Nuanced instructions', 'Large context window'],
      features: [
        { name: 'Code Generation', icon: <FileText className="h-4 w-4" />, supported: true },
        { name: 'Function Calling', icon: <Shapes className="h-4 w-4" />, supported: true },
        { name: 'Image Processing', icon: <Sparkles className="h-4 w-4" />, supported: true },
      ]
    }
  },
  'gemini': {
    'gemini-pro-vision': {
      name: 'Gemini Pro Vision',
      description: 'Includes image understanding capabilities.',
      contextWindow: '32K tokens',
      strengths: ['Image understanding', 'Visual reasoning', 'Multimodal tasks'],
      features: [
        { name: 'Code Generation', icon: <FileText className="h-4 w-4" />, supported: true },
        { name: 'Function Calling', icon: <Shapes className="h-4 w-4" />, supported: true },
        { name: 'Image Processing', icon: <Sparkles className="h-4 w-4" />, supported: true },
      ]
    },
    'gemini-1.5-pro': {
      name: 'Gemini 1.5 Pro',
      description: 'Advanced model with improved reasoning and very large context window.',
      contextWindow: '1M tokens',
      strengths: ['Massive context window', 'Enhanced reasoning', 'Multimodal tasks'],
      features: [
        { name: 'Code Generation', icon: <FileText className="h-4 w-4" />, supported: true },
        { name: 'Function Calling', icon: <Shapes className="h-4 w-4" />, supported: true },
        { name: 'Image Processing', icon: <Sparkles className="h-4 w-4" />, supported: true },
      ]
    }
  },
  'mistral': {
    'mistral-tiny': {
      name: 'Mistral Tiny',
      description: 'Small, efficient model for basic tasks.',
      contextWindow: '8K tokens',
      strengths: ['Fast response times', 'Resource-efficient', 'Cost-effective'],
      features: [
        { name: 'Code Generation', icon: <FileText className="h-4 w-4" />, supported: true },
        { name: 'Function Calling', icon: <Shapes className="h-4 w-4" />, supported: false },
        { name: 'Image Processing', icon: <Sparkles className="h-4 w-4" />, supported: false },
      ]
    },
    'mistral-small': {
      name: 'Mistral Small',
      description: 'Well-balanced model for general use cases.',
      contextWindow: '32K tokens',
      strengths: ['Good reasoning', 'Efficient processing', 'Balanced capabilities'],
      features: [
        { name: 'Code Generation', icon: <FileText className="h-4 w-4" />, supported: true },
        { name: 'Function Calling', icon: <Shapes className="h-4 w-4" />, supported: true },
        { name: 'Image Processing', icon: <Sparkles className="h-4 w-4" />, supported: false },
      ]
    },
    'mistral-medium': {
      name: 'Mistral Medium',
      description: 'Advanced model with strong reasoning capabilities.',
      contextWindow: '32K tokens',
      strengths: ['Complex reasoning', 'Nuanced understanding', 'Higher accuracy'],
      features: [
        { name: 'Code Generation', icon: <FileText className="h-4 w-4" />, supported: true },
        { name: 'Function Calling', icon: <Shapes className="h-4 w-4" />, supported: true },
        { name: 'Image Processing', icon: <Sparkles className="h-4 w-4" />, supported: false },
      ]
    }
  },
  'claude': {
    'claude-3-5-sonnet-20240620': {
      name: 'Claude 3.5 Sonnet',
      description: 'Latest model with excellent reasoning and instruction following.',
      contextWindow: '200K tokens',
      strengths: ['Excellent reasoning', 'Nuanced understanding', 'Very accurate responses'],
      features: [
        { name: 'Code Generation', icon: <FileText className="h-4 w-4" />, supported: true },
        { name: 'Function Calling', icon: <Shapes className="h-4 w-4" />, supported: true },
        { name: 'Image Processing', icon: <Sparkles className="h-4 w-4" />, supported: true },
      ]
    },
    'claude-3-opus-20240229': {
      name: 'Claude 3 Opus',
      description: 'Most powerful Claude model with exceptional reasoning.',
      contextWindow: '200K tokens',
      strengths: ['Superior reasoning', 'Nuanced understanding', 'Complex task handling'],
      features: [
        { name: 'Code Generation', icon: <FileText className="h-4 w-4" />, supported: true },
        { name: 'Function Calling', icon: <Shapes className="h-4 w-4" />, supported: true },
        { name: 'Image Processing', icon: <Sparkles className="h-4 w-4" />, supported: true },
      ]
    },
    'claude-3-sonnet-20240229': {
      name: 'Claude 3 Sonnet',
      description: 'Balanced model with strong reasoning capabilities.',
      contextWindow: '200K tokens',
      strengths: ['Strong reasoning', 'Good balance of speed and quality', 'Cost-effective'],
      features: [
        { name: 'Code Generation', icon: <FileText className="h-4 w-4" />, supported: true },
        { name: 'Function Calling', icon: <Shapes className="h-4 w-4" />, supported: true },
        { name: 'Image Processing', icon: <Sparkles className="h-4 w-4" />, supported: true },
      ]
    }
  },
  'llama': {
    'llama-3-8b-instruct': {
      name: 'Llama 3 8B Instruct',
      description: 'Optimized for instruction following with efficient parameters.',
      contextWindow: '8K tokens',
      strengths: ['Instruction following', 'Efficient size', 'Open-weights model'],
      features: [
        { name: 'Code Generation', icon: <FileText className="h-4 w-4" />, supported: true },
        { name: 'Function Calling', icon: <Shapes className="h-4 w-4" />, supported: false },
        { name: 'Image Processing', icon: <Sparkles className="h-4 w-4" />, supported: false },
      ]
    },
    'llama-3-70b-instruct': {
      name: 'Llama 3 70B Instruct',
      description: 'Advanced Llama model with superior reasoning capabilities.',
      contextWindow: '8K tokens',
      strengths: ['Superior reasoning', 'Complex task handling', 'Open-weights model'],
      features: [
        { name: 'Code Generation', icon: <FileText className="h-4 w-4" />, supported: true },
        { name: 'Function Calling', icon: <Shapes className="h-4 w-4" />, supported: false },
        { name: 'Image Processing', icon: <Sparkles className="h-4 w-4" />, supported: false },
      ]
    }
  },
  'deepseek': {
    'deepseek-coder': {
      name: 'DeepSeek Coder',
      description: 'Specialized model for coding tasks and software development.',
      contextWindow: '16K tokens',
      strengths: ['Code generation', 'Code understanding', 'Technical problem solving'],
      features: [
        { name: 'Code Generation', icon: <FileText className="h-4 w-4" />, supported: true },
        { name: 'Function Calling', icon: <Shapes className="h-4 w-4" />, supported: false },
        { name: 'Image Processing', icon: <Sparkles className="h-4 w-4" />, supported: false },
      ]
    },
    'deepseek-chat': {
      name: 'DeepSeek Chat',
      description: 'General-purpose conversational model with good reasoning.',
      contextWindow: '32K tokens',
      strengths: ['Natural conversation', 'Reasoning capabilities', 'Knowledge tasks'],
      features: [
        { name: 'Code Generation', icon: <FileText className="h-4 w-4" />, supported: true },
        { name: 'Function Calling', icon: <Shapes className="h-4 w-4" />, supported: true },
        { name: 'Image Processing', icon: <Sparkles className="h-4 w-4" />, supported: false },
      ]
    }
  }
};

interface ModelDetailsProps {
  provider: AIProvider;
  selectedModel: string | null;
}

export default function ModelDetails({ provider, selectedModel }: ModelDetailsProps) {
  const providerDisplayName = PROVIDER_INFO[provider].displayName;
  const models = MODEL_INFO[provider] || {};
  const modelKeys = Object.keys(models);
  
  return (
    <Card className="overflow-hidden border-primary/10">
      <CardHeader className="relative pb-2">
        <div className="absolute inset-0 h-12 bg-gradient-to-r from-primary/10 to-primary/5"></div>
        <CardTitle className="flex items-center gap-2 pt-4 z-10 relative">
          {getProviderIcon(provider)}
          {providerDisplayName} Models
        </CardTitle>
        <CardDescription className="z-10 relative">
          Available models and their capabilities
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          {modelKeys.map((modelKey) => {
            const model = models[modelKey];
            const isSelected = selectedModel === modelKey;
            
            return (
              <AccordionItem 
                key={modelKey} 
                value={modelKey}
                className={cn(
                  "border-b", 
                  isSelected && "bg-primary/5"
                )}
              >
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2 text-left">
                    <span className="font-medium">{model.name}</span>
                    {isSelected && (
                      <Badge className="ml-2 bg-primary/20 text-primary">Selected</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{model.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <div className="text-xs font-medium flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Context Window
                        </div>
                        <p className="text-sm">{model.contextWindow}</p>
                      </div>
                      
                      <div className="space-y-1 col-span-2">
                        <div className="text-xs font-medium flex items-center gap-1">
                          <Zap className="h-3.5 w-3.5" />
                          Key Strengths
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {model.strengths.map((strength, index) => (
                            <Badge key={index} variant="outline" className="bg-primary/5 text-xs">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-xs font-medium flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Features
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {model.features.map((feature, index) => (
                          <div 
                            key={index} 
                            className={cn(
                              "flex items-center gap-2 border rounded-md p-2",
                              feature.supported 
                                ? "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-950/20" 
                                : "border-gray-200 bg-gray-50 dark:border-gray-900/40 dark:bg-gray-950/20"
                            )}
                          >
                            <div className="flex-shrink-0">
                              {feature.icon}
                            </div>
                            <span className="text-sm flex-grow">{feature.name}</span>
                            <div className="flex-shrink-0">
                              {feature.supported ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <X className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
} 