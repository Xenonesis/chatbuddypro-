'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Clock,
  Star,
  Bookmark,
  Trash2,
  Edit3,
  Share,
  Download,
  TrendingUp,
  Users,
  Zap,
  Brain,
  Code,
  GraduationCap,
  Sparkles,
  Calendar,
  BarChart3,
  Activity,
  Globe,
  Shield,
  Database,
  ChevronRight,
  ArrowUpRight,
  Folder,
  Tag,
  Eye,
  Heart,
  MessageCircle,
  RefreshCw
} from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { ModernInput } from '@/components/ui/modern-input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Chat {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  model: string;
  messageCount: number;
  isBookmarked: boolean;
  isStarred: boolean;
  tags: string[];
  category: 'work' | 'personal' | 'research' | 'creative';
}

interface Stat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface Activity {
  id: string;
  type: 'chat' | 'bookmark' | 'share' | 'export';
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ReactNode;
}

const mockChats: Chat[] = [
  {
    id: '1',
    title: 'React Performance Optimization',
    preview: 'How can I optimize my React application for better performance?',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    model: 'GPT-4',
    messageCount: 12,
    isBookmarked: true,
    isStarred: false,
    tags: ['react', 'performance', 'optimization'],
    category: 'work'
  },
  {
    id: '2',
    title: 'Creative Writing Assistant',
    preview: 'Help me write a short story about time travel...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    model: 'Claude-3',
    messageCount: 8,
    isBookmarked: false,
    isStarred: true,
    tags: ['creative', 'writing', 'story'],
    category: 'creative'
  },
  {
    id: '3',
    title: 'Machine Learning Concepts',
    preview: 'Explain the difference between supervised and unsupervised learning',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    model: 'Gemini Pro',
    messageCount: 15,
    isBookmarked: true,
    isStarred: true,
    tags: ['ml', 'learning', 'concepts'],
    category: 'research'
  },
  {
    id: '4',
    title: 'Personal Finance Planning',
    preview: 'What are some good investment strategies for beginners?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    model: 'GPT-4',
    messageCount: 6,
    isBookmarked: false,
    isStarred: false,
    tags: ['finance', 'investment', 'planning'],
    category: 'personal'
  }
];

const stats: Stat[] = [
  {
    label: 'Total Chats',
    value: '127',
    change: '+12%',
    trend: 'up',
    icon: <MessageSquare className="h-5 w-5" />,
    color: 'from-blue-500 to-indigo-600'
  },
  {
    label: 'Messages Sent',
    value: '2,341',
    change: '+8%',
    trend: 'up',
    icon: <Activity className="h-5 w-5" />,
    color: 'from-emerald-500 to-teal-600'
  },
  {
    label: 'Time Saved',
    value: '47h',
    change: '+23%',
    trend: 'up',
    icon: <Clock className="h-5 w-5" />,
    color: 'from-purple-500 to-pink-600'
  },
  {
    label: 'Bookmarks',
    value: '34',
    change: '+5%',
    trend: 'up',
    icon: <Bookmark className="h-5 w-5" />,
    color: 'from-yellow-500 to-orange-600'
  }
];

const recentActivity: Activity[] = [
  {
    id: '1',
    type: 'chat',
    title: 'Started new chat',
    description: 'React Performance Optimization',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    icon: <MessageSquare className="h-4 w-4" />
  },
  {
    id: '2',
    type: 'bookmark',
    title: 'Bookmarked chat',
    description: 'Machine Learning Concepts',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    icon: <Bookmark className="h-4 w-4" />
  },
  {
    id: '3',
    type: 'share',
    title: 'Shared conversation',
    description: 'Creative Writing Assistant',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    icon: <Share className="h-4 w-4" />
  }
];

const modelIcons = {
  'GPT-4': <Brain className="h-4 w-4" />,
  'Claude-3': <Sparkles className="h-4 w-4" />,
  'Gemini Pro': <Zap className="h-4 w-4" />,
  'Mistral': <Code className="h-4 w-4" />
};

const categoryColors = {
  work: 'from-blue-