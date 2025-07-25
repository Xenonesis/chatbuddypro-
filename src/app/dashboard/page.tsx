'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Settings, LogOut, CheckCircle, User, Clock, TrendingUp, Sparkles, BarChart3, Activity, Zap, Brain, Calendar, Star, Bookmark, Archive, Search, Filter, ArrowUpRight, ChevronRight, Bot, Mic, FileText, Image, Code, Lightbulb, Target, Gauge } from 'lucide-react';
import Link from 'next/link';
import { testDatabaseConnection } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ModernDashboardWidget, AnimatedStatCard, QuickActionCard } from '@/components/dashboard/ModernDashboardWidget';

import { userService } from '@/lib/services/userService';
import { chatService } from '@/lib/services/chatService';

const quickActions = [
  {
    title: 'New Chat',
    description: 'Start a fresh conversation',
    icon: <MessageSquare className="h-5 w-5" />,
    href: '/chat',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-600 dark:text-blue-400',
    category: 'primary'
  },
  {
    title: 'Voice Chat',
    description: 'Talk to AI with voice input',
    icon: <Mic className="h-5 w-5" />,
    href: '/chat?voice=true',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    category: 'primary'
  },
  {
    title: 'Code Assistant',
    description: 'Get help with programming',
    icon: <Code className="h-5 w-5" />,
    href: '/chat?mode=technical',
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-600 dark:text-purple-400',
    category: 'primary'
  },
  {
    title: 'Creative Writing',
    description: 'Brainstorm and create content',
    icon: <Lightbulb className="h-5 w-5" />,
    href: '/chat?mode=creative',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    textColor: 'text-amber-600 dark:text-amber-400',
    category: 'secondary'
  },
  {
    title: 'Browse Models',
    description: 'Explore AI providers & models',
    icon: <Brain className="h-5 w-5" />,
    href: '/settings',
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    category: 'secondary'
  },
  {
    title: 'Settings',
    description: 'Customize your experience',
    icon: <Settings className="h-5 w-5" />,
    href: '/settings',
    color: 'from-slate-500 to-gray-600',
    bgColor: 'bg-slate-50 dark:bg-slate-900/20',
    textColor: 'text-slate-600 dark:text-slate-400',
    category: 'secondary'
  }
];

interface DashboardStats {
  totalChats: number;
  totalMessages: number;
  recentChats: number;
  archivedChats: number;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [dbStatus, setDbStatus] = useState<string>('Checking database...');
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalChats: 0,
    totalMessages: 0,
    recentChats: 0,
    archivedChats: 0
  });


  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const dashboardStats = await chatService.getChatStats(user.id);
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
    
    // Only test database connection in development
    if (process.env.NODE_ENV === 'development') {
      testDatabaseConnection().then(success => {
        setDbStatus(success ? 'Database connected' : 'Database connection failed');
      });
    }
    
    // Check if the user was redirected with an error message
    const urlParams = new URLSearchParams(window.location.search);
    const errorMsg = urlParams.get('error');
    if (errorMsg) {
      toast({
        title: "Error",
        description: decodeURIComponent(errorMsg),
        variant: "destructive"
      });
      
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user, toast]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      // Clear any potentially corrupted tokens
      localStorage.removeItem('sb-gphdrsfbypnckxbdjjap-auth-token');
      
      // Clear all Supabase-related items
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Force reload to clear any stuck state
      window.location.href = '/auth/login?error=' + encodeURIComponent('Error during sign out. Session has been reset.');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-slate-600 dark:text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 max-w-7xl pb-20 md:pb-8">
        {/* Modern Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                    Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-base lg:text-lg">
                    Ready to explore AI conversations and unlock new possibilities.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/chat" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 text-base font-medium">
                  <Plus className="h-5 w-5" />
                  <span>Start New Chat</span>
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/settings" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-6 border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 transition-all duration-300 text-base">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Enhanced Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <AnimatedStatCard
              title="Total Chats"
              value={stats.totalChats}
              subtitle="All conversations"
              icon={<MessageSquare className="h-7 w-7" />}
              gradient="from-blue-50 via-blue-50 to-indigo-100 dark:from-blue-950/50 dark:via-blue-900/30 dark:to-indigo-950/50 border-blue-200/60 dark:border-blue-800/50 text-blue-900 dark:text-blue-100"
              delay={0}
              isLoading={isLoading}
            />

            <AnimatedStatCard
              title="Messages"
              value={stats.totalMessages.toLocaleString()}
              subtitle="Total exchanges"
              icon={<BarChart3 className="h-7 w-7" />}
              gradient="from-emerald-50 via-emerald-50 to-teal-100 dark:from-emerald-950/50 dark:via-emerald-900/30 dark:to-teal-950/50 border-emerald-200/60 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-100"
              delay={0.1}
              isLoading={isLoading}
            />

            <AnimatedStatCard
              title="Recent"
              value={stats.recentChats}
              subtitle="Last 7 days"
              icon={<Clock className="h-7 w-7" />}
              gradient="from-purple-50 via-purple-50 to-violet-100 dark:from-purple-950/50 dark:via-purple-900/30 dark:to-violet-950/50 border-purple-200/60 dark:border-purple-800/50 text-purple-900 dark:text-purple-100"
              delay={0.2}
              isLoading={isLoading}
            />

            <AnimatedStatCard
              title="Performance"
              value={`${Math.round((stats.totalMessages / Math.max(stats.totalChats, 1)) * 10) / 10}`}
              subtitle="Avg. messages/chat"
              icon={<Gauge className="h-7 w-7" />}
              gradient="from-amber-50 via-amber-50 to-orange-100 dark:from-amber-950/50 dark:via-amber-900/30 dark:to-orange-950/50 border-amber-200/60 dark:border-amber-800/50 text-amber-900 dark:text-amber-100"
              delay={0.3}
              isLoading={isLoading}
            />
          </div>
        </motion.div>

        {/* Modern Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full lg:w-auto lg:inline-flex grid-cols-2 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 h-12 p-1 rounded-xl shadow-sm">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 rounded-lg transition-all duration-200"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Home</span>
              </TabsTrigger>
              <TabsTrigger
                value="account"
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 rounded-lg transition-all duration-200"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Account</span>
                <span className="sm:hidden">Profile</span>
              </TabsTrigger>
            </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Enhanced Quick Actions */}
              <div className="xl:col-span-2 space-y-6">
                <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
                          <CardDescription className="text-slate-600 dark:text-slate-400">
                            Jump into your most common tasks
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Primary Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {quickActions.filter(action => action.category === 'primary').map((action, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Link href={action.href}>
                            <Card className={cn(
                              "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 cursor-pointer border-0",
                              action.bgColor
                            )}>
                              <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center space-y-3">
                                  <div className={cn(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300",
                                    `bg-gradient-to-br ${action.color}`
                                  )}>
                                    <div className="text-white">
                                      {action.icon}
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <h3 className={cn("font-semibold text-base", action.textColor)}>
                                      {action.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                      {action.description}
                                    </p>
                                  </div>
                                  <ChevronRight className={cn("h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300", action.textColor)} />
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      ))}
                    </div>

                    {/* Secondary Actions */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">More Options</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {quickActions.filter(action => action.category === 'secondary').map((action, index) => (
                          <Link key={index} href={action.href}>
                            <Card className={cn(
                              "group transition-all duration-200 hover:shadow-md cursor-pointer border-0",
                              action.bgColor
                            )}>
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                    `bg-gradient-to-br ${action.color}`
                                  )}>
                                    <div className="text-white text-sm">
                                      {action.icon}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className={cn("font-medium text-sm", action.textColor)}>
                                      {action.title}
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                      {action.description}
                                    </p>
                                  </div>
                                  <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Modern Insights Sidebar */}
              <div className="space-y-6">
                {/* Quick Insights */}
                <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold">Quick Insights</CardTitle>
                        <CardDescription className="text-sm">Your AI usage at a glance</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-lg bg-blue-500 flex items-center justify-center">
                            <MessageSquare className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Active Chats</span>
                        </div>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{stats.recentChats}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <Target className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Efficiency</span>
                        </div>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {stats.totalChats > 0 ? `${Math.round((stats.totalMessages / stats.totalChats) * 10) / 10}` : '0'} avg
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                      <Link href="/chat">
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                          <Plus className="h-4 w-4 mr-2" />
                          Start New Conversation
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
                        <CardDescription className="text-sm">What's happening</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {stats.totalChats > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <MessageSquare className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Dashboard accessed</p>
                            <p className="text-xs text-slate-500">Just now</p>
                          </div>
                        </div>
                        <div className="text-center py-4">
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            More activity will appear here as you use the platform
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="h-12 w-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                          <Activity className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                          No recent activity yet
                        </p>
                        <Link href="/chat">
                          <Button variant="outline" size="sm">
                            Start your first chat
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="account" className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Enhanced User Profile */}
              <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">Profile Information</CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        Your account details and preferences
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {user && (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            {user.email?.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xl truncate">{user.email?.split('@')[0]}</h3>
                          <p className="text-slate-600 dark:text-slate-400 truncate">{user.email}</p>
                          <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified Account
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200/50 dark:border-green-800/50">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-medium text-green-900 dark:text-green-100">Account Status</span>
                          </div>
                          <Badge className="bg-green-500 text-white">
                            Active
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-slate-500 flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-medium">Member Since</span>
                          </div>
                          <span className="text-slate-600 dark:text-slate-400">
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-slate-500 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-medium">Last Sign In</span>
                          </div>
                          <span className="text-slate-600 dark:text-slate-400">
                            {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Today'}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Account Actions */}
              <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">Account Actions</CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        Manage your account and preferences
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/settings" className="w-full block">
                    <Button variant="outline" className="w-full justify-start h-12 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 group">
                      <Settings className="h-4 w-4 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                      <span className="flex-1 text-left">Manage Settings</span>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                    </Button>
                  </Link>

                  <Link href="/profile" className="w-full block">
                    <Button variant="outline" className="w-full justify-start h-12 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 group">
                      <User className="h-4 w-4 mr-3" />
                      <span className="flex-1 text-left">Edit Profile</span>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                    </Button>
                  </Link>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      variant="outline"
                      className="w-full justify-start h-12 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 transition-all duration-300 group"
                      disabled={isSigningOut}
                      onClick={handleSignOut}
                    >
                      {isSigningOut ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-3"></div>
                      ) : (
                        <LogOut className="h-4 w-4 mr-3" />
                      )}
                      <span className="flex-1 text-left">Sign Out</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </motion.div>

        {/* Floating Action Button - Hidden on mobile to avoid conflicts with mobile nav */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="fixed bottom-6 right-6 z-50 hidden md:block"
        >
          <Link href="/chat">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="h-14 w-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg hover:shadow-xl flex items-center justify-center cursor-pointer group"
            >
              <Plus className="h-6 w-6 text-white group-hover:rotate-90 transition-transform duration-300" />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}