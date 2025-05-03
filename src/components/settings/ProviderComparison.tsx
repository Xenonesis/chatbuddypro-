import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AIProvider, PROVIDER_INFO } from '@/lib/context/ModelSettingsContext';
import { 
  Bot, 
  Cpu, 
  Cloud, 
  FlaskConical, 
  Flame, 
  Star,
  Check,
  X,
  DollarSign,
  Zap,
  Languages,
  FileCode,
  Image,
  Database
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

interface ProviderFeature {
  name: string;
  icon: React.ReactNode;
  tooltip: string;
  values: {
    [provider in AIProvider]: {
      supported: boolean;
      notes?: string;
    };
  };
}

const PROVIDER_FEATURES: ProviderFeature[] = [
  {
    name: 'Pricing',
    icon: <DollarSign className="h-4 w-4" />,
    tooltip: 'Pricing model for using the API',
    values: {
      'openai': {
        supported: true,
        notes: 'Pay-per-token model with tiered pricing'
      },
      'gemini': {
        supported: true,
        notes: 'Free tier available, then pay-per-request model'
      },
      'mistral': {
        supported: true,
        notes: 'Pay-per-token model with different rates per model'
      },
      'claude': {
        supported: true,
        notes: 'Pay-per-token model with input/output tokens'
      },
      'llama': {
        supported: true,
        notes: 'Open-source with hosting options or self-host'
      },
      'deepseek': {
        supported: true,
        notes: 'Pay-per-token model with specialized rates'
      }
    }
  },
  {
    name: 'Performance',
    icon: <Zap className="h-4 w-4" />,
    tooltip: 'Overall reasoning and problem-solving capabilities',
    values: {
      'openai': {
        supported: true,
        notes: 'Excellent for general tasks and coding'
      },
      'gemini': {
        supported: true,
        notes: 'Strong reasoning with multimodal capabilities'
      },
      'mistral': {
        supported: true,
        notes: 'Efficient reasoning with compact models'
      },
      'claude': {
        supported: true,
        notes: 'Exceptional reasoning and instruction following'
      },
      'llama': {
        supported: true,
        notes: 'Good open-source performance with tradeoffs'
      },
      'deepseek': {
        supported: true,
        notes: 'Specialized in coding and technical domains'
      }
    }
  },
  {
    name: 'Multilingual',
    icon: <Languages className="h-4 w-4" />,
    tooltip: 'Support for multiple languages',
    values: {
      'openai': {
        supported: true,
        notes: 'Excellent support for many languages'
      },
      'gemini': {
        supported: true,
        notes: 'Good multilingual capabilities'
      },
      'mistral': {
        supported: true,
        notes: 'Primarily focused on English with some language support'
      },
      'claude': {
        supported: true,
        notes: 'Strong support for major languages'
      },
      'llama': {
        supported: true,
        notes: 'Variable support depending on training data'
      },
      'deepseek': {
        supported: true,
        notes: 'Good support for technical languages'
      }
    }
  },
  {
    name: 'Code Generation',
    icon: <FileCode className="h-4 w-4" />,
    tooltip: 'Ability to generate and understand programming code',
    values: {
      'openai': {
        supported: true,
        notes: 'Excellent for multiple programming languages'
      },
      'gemini': {
        supported: true,
        notes: 'Strong code generation capabilities'
      },
      'mistral': {
        supported: true,
        notes: 'Good code generation with some limitations'
      },
      'claude': {
        supported: true,
        notes: 'Excellent code generation and understanding'
      },
      'llama': {
        supported: true,
        notes: 'Decent code generation with some limitations'
      },
      'deepseek': {
        supported: true,
        notes: 'Specialized in code-related tasks'
      }
    }
  },
  {
    name: 'Image Understanding',
    icon: <Image className="h-4 w-4" />,
    tooltip: 'Ability to process and understand images',
    values: {
      'openai': {
        supported: true,
        notes: 'Supported in GPT-4 Vision models'
      },
      'gemini': {
        supported: true,
        notes: 'Strong image understanding in Pro Vision models'
      },
      'mistral': {
        supported: false,
        notes: 'Not supported in current models'
      },
      'claude': {
        supported: true,
        notes: 'Excellent image understanding'
      },
      'llama': {
        supported: false,
        notes: 'Limited or no support in current versions'
      },
      'deepseek': {
        supported: false,
        notes: 'Limited support in current models'
      }
    }
  },
  {
    name: 'Context Length',
    icon: <Database className="h-4 w-4" />,
    tooltip: 'Maximum amount of text the model can process at once',
    values: {
      'openai': {
        supported: true,
        notes: 'Up to 128K tokens in GPT-4 Turbo'
      },
      'gemini': {
        supported: true,
        notes: 'Up to 1M tokens in Gemini 1.5'
      },
      'mistral': {
        supported: true,
        notes: 'Up to 32K tokens'
      },
      'claude': {
        supported: true,
        notes: 'Up to 200K tokens'
      },
      'llama': {
        supported: true,
        notes: 'Up to 8K tokens in most configurations'
      },
      'deepseek': {
        supported: true,
        notes: 'Up to 32K tokens'
      }
    }
  }
];

interface ProviderComparisonProps {
  selectedProviders?: AIProvider[];
}

export default function ProviderComparison({ selectedProviders }: ProviderComparisonProps) {
  const providers = selectedProviders || Object.keys(PROVIDER_INFO) as AIProvider[];
  
  return (
    <Card className="overflow-hidden border-primary/10">
      <CardHeader className="relative pb-2">
        <div className="absolute inset-0 h-12 bg-gradient-to-r from-primary/10 to-primary/5"></div>
        <CardTitle className="flex items-center gap-2 pt-4 z-10 relative">
          <Bot className="h-5 w-5 text-primary" />
          AI Provider Comparison
        </CardTitle>
        <CardDescription className="z-10 relative">
          Compare capabilities across different AI providers
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Feature</TableHead>
                {providers.map(provider => (
                  <TableHead key={provider} className="min-w-[140px]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        {getProviderIcon(provider)}
                      </div>
                      <span>{PROVIDER_INFO[provider].displayName}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {PROVIDER_FEATURES.map(feature => (
                <TableRow key={feature.name}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-full bg-muted">
                        {feature.icon}
                      </div>
                      <span>{feature.name}</span>
                    </div>
                  </TableCell>
                  
                  {providers.map(provider => {
                    const value = feature.values[provider];
                    return (
                      <TableCell key={`${feature.name}-${provider}`} className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div>
                            {value.supported ? (
                              <Badge className="bg-green-500 hover:bg-green-600">
                                <Check className="h-3.5 w-3.5 mr-1" />
                                Supported
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-red-200 text-red-500">
                                <X className="h-3.5 w-3.5 mr-1" />
                                Not Supported
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{value.notes}</p>
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
} 