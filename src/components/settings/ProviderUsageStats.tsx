import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AIProvider, PROVIDER_INFO } from '@/lib/context/ModelSettingsContext';
import { 
  Bot, 
  Cpu, 
  Cloud, 
  FlaskConical, 
  Flame, 
  Star,
  BarChartHorizontal,
  Clock,
  CalendarClock,
  BadgeDollarSign,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

// Mock data for demo purposes - in a real app, this would come from an API
interface ProviderUsageData {
  tokensUsed: number;
  tokensLimit: number;
  requestsCount: number;
  responseTime: number;
  costToDate: number;
  history: {
    date: string;
    tokens: number;
  }[];
  topModels: {
    name: string;
    percentage: number;
  }[];
  lastUpdated?: string;
}

const mockUsageData: Record<AIProvider, ProviderUsageData> = {
  'openai': {
    tokensUsed: 450000,
    tokensLimit: 1000000,
    requestsCount: 278,
    responseTime: 1.3,
    costToDate: 12.75,
    history: [
      { date: '2023-09-01', tokens: 38000 },
      { date: '2023-10-01', tokens: 92000 },
      { date: '2023-11-01', tokens: 105000 },
      { date: '2023-12-01', tokens: 215000 },
    ],
    topModels: [
      { name: 'gpt-3.5-turbo', percentage: 65 },
      { name: 'gpt-4', percentage: 25 },
      { name: 'gpt-4-turbo', percentage: 10 },
    ]
  },
  'gemini': {
    tokensUsed: 320000,
    tokensLimit: 500000,
    requestsCount: 156,
    responseTime: 1.5,
    costToDate: 9.20,
    history: [
      { date: '2023-09-01', tokens: 42000 },
      { date: '2023-10-01', tokens: 85000 },
      { date: '2023-11-01', tokens: 73000 },
      { date: '2023-12-01', tokens: 120000 },
    ],
    topModels: [
      { name: 'gemini-pro', percentage: 70 },
      { name: 'gemini-pro-vision', percentage: 20 },
      { name: 'gemini-1.5-pro', percentage: 10 },
    ]
  },
  'mistral': {
    tokensUsed: 280000,
    tokensLimit: 500000,
    requestsCount: 145,
    responseTime: 1.2,
    costToDate: 7.50,
    history: [
      { date: '2023-09-01', tokens: 25000 },
      { date: '2023-10-01', tokens: 65000 },
      { date: '2023-11-01', tokens: 85000 },
      { date: '2023-12-01', tokens: 105000 },
    ],
    topModels: [
      { name: 'mistral-small', percentage: 75 },
      { name: 'mistral-medium', percentage: 20 },
      { name: 'mistral-tiny', percentage: 5 },
    ]
  },
  'claude': {
    tokensUsed: 380000,
    tokensLimit: 750000,
    requestsCount: 192,
    responseTime: 1.8,
    costToDate: 14.35,
    history: [
      { date: '2023-09-01', tokens: 45000 },
      { date: '2023-10-01', tokens: 95000 },
      { date: '2023-11-01', tokens: 110000 },
      { date: '2023-12-01', tokens: 130000 },
    ],
    topModels: [
      { name: 'claude-3-sonnet', percentage: 60 },
      { name: 'claude-3-haiku', percentage: 25 },
      { name: 'claude-3-opus', percentage: 15 },
    ]
  },
  'llama': {
    tokensUsed: 180000,
    tokensLimit: 300000,
    requestsCount: 120,
    responseTime: 2.1,
    costToDate: 5.50,
    history: [
      { date: '2023-09-01', tokens: 22000 },
      { date: '2023-10-01', tokens: 43000 },
      { date: '2023-11-01', tokens: 55000 },
      { date: '2023-12-01', tokens: 60000 },
    ],
    topModels: [
      { name: 'llama-3-8b-instruct', percentage: 80 },
      { name: 'llama-3-70b-instruct', percentage: 20 },
    ]
  },
  'deepseek': {
    tokensUsed: 150000,
    tokensLimit: 250000,
    requestsCount: 85,
    responseTime: 1.7,
    costToDate: 4.25,
    history: [
      { date: '2023-09-01', tokens: 15000 },
      { date: '2023-10-01', tokens: 32000 },
      { date: '2023-11-01', tokens: 43000 },
      { date: '2023-12-01', tokens: 60000 },
    ],
    topModels: [
      { name: 'deepseek-coder', percentage: 70 },
      { name: 'deepseek-chat', percentage: 30 },
    ]
  }
};

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

const getProgressColor = (percentage: number) => {
  if (percentage < 50) return 'bg-green-500';
  if (percentage < 80) return 'bg-amber-500';
  return 'bg-red-500';
};

interface ProviderUsageStatsProps {
  provider: AIProvider;
}

export default function ProviderUsageStats({ provider }: ProviderUsageStatsProps) {
  const [usageData, setUsageData] = useState<ProviderUsageData>({
    ...mockUsageData[provider],
    lastUpdated: new Date().toLocaleString()
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  
  const providerDisplayName = PROVIDER_INFO[provider].displayName;
  const tokensPercentage = Math.round((usageData.tokensUsed / usageData.tokensLimit) * 100);
  
  const refreshData = () => {
    setIsRefreshing(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // For demo, slightly modify the data to show change
      const newData = { 
        ...usageData,
        tokensUsed: Math.min(usageData.tokensLimit, Math.floor(usageData.tokensUsed * (1 + Math.random() * 0.05))),
        requestsCount: usageData.requestsCount + Math.floor(Math.random() * 5),
        costToDate: usageData.costToDate + (Math.random() * 0.5),
        lastUpdated: new Date().toLocaleString()
      };
      
      setUsageData(newData);
      setIsRefreshing(false);
      
      toast({
        title: "Data refreshed",
        description: `Updated ${providerDisplayName} usage statistics`,
      });
    }, 1500);
  };
  
  return (
    <Card className="overflow-hidden border-primary/10">
      <CardHeader className="relative pb-2">
        <div className="absolute inset-0 h-12 bg-gradient-to-r from-primary/10 to-primary/5"></div>
        <CardTitle className="flex items-center gap-2 pt-4 z-10 relative">
          {getProviderIcon(provider)}
          {providerDisplayName} Usage Stats
        </CardTitle>
        <CardDescription className="z-10 relative">
          View your usage data and trends for {providerDisplayName}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BarChartHorizontal className="h-4 w-4 text-muted-foreground" />
              <span>Token Usage</span>
            </div>
            <Badge
              className={cn(
                "font-normal",
                tokensPercentage < 50 ? "bg-green-500/20 text-green-700 dark:text-green-300" :
                tokensPercentage < 80 ? "bg-amber-500/20 text-amber-700 dark:text-amber-300" :
                "bg-red-500/20 text-red-700 dark:text-red-300"
              )}
            >
              {tokensPercentage}% Used
            </Badge>
          </div>
          
          <Progress 
            value={tokensPercentage} 
            className="h-2" 
            indicatorClassName={getProgressColor(tokensPercentage)}
          />
          
          <div className="flex justify-between text-xs text-muted-foreground pt-1">
            <span>{usageData.tokensUsed.toLocaleString()} tokens used</span>
            <span>Limit: {usageData.tokensLimit.toLocaleString()} tokens</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-muted/20 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              <span>Total Requests</span>
            </div>
            <p className="text-xl font-semibold">{usageData.requestsCount.toLocaleString()}</p>
          </div>
          
          <div className="bg-muted/20 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Avg. Response Time</span>
            </div>
            <p className="text-xl font-semibold">{usageData.responseTime}s</p>
          </div>
          
          <div className="bg-muted/20 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <BadgeDollarSign className="h-3.5 w-3.5" />
              <span>Cost to Date</span>
            </div>
            <p className="text-xl font-semibold">${usageData.costToDate.toFixed(2)}</p>
          </div>
        </div>
        
        <Tabs defaultValue="models" className="pt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="models">Top Models</TabsTrigger>
            <TabsTrigger value="history">Usage History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="models" className="pt-4 space-y-4">
            {usageData.topModels.map((model, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>{model.name}</span>
                  </div>
                  <span className="text-xs font-medium">{model.percentage}%</span>
                </div>
                <Progress value={model.percentage} className="h-1.5" />
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="history" className="pt-4">
            <div className="space-y-3">
              {usageData.history.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm border-b pb-2">
                  <span>{item.date}</span>
                  <span className="font-medium">{item.tokens.toLocaleString()} tokens</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Last updated: {usageData.lastUpdated || 'Never'}
        </p>
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={refreshData}
          disabled={isRefreshing}
          className="flex items-center gap-1.5"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </Button>
      </CardFooter>
    </Card>
  );
} 