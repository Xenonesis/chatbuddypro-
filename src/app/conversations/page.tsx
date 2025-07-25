'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/lib/services/userService';
import { chatService } from '@/lib/services/chatService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  MessageSquare, 
  Clock, 
  Plus,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Tag,
  MoreVertical,
  Archive,
  Trash2,
  Edit3,
  Bot,
  Sparkles,
  TrendingUp,
  Activity,
  Grid3X3,
  List,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { Chat } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ConversationStats {
  totalChats: number;
  totalMessages: number;
  recentChats: number;
  archivedChats: number;
}

export default function ConversationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [stats, setStats] = useState<ConversationStats>({
    totalChats: 0,
    totalMessages: 0,
    recentChats: 0,
    archivedChats: 0,
  });
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated_at' | 'created_at' | 'title'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'archived'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [chatsData, statsData] = await Promise.all([
        userService.getAllChats(user!.id),
        chatService.getChatStats(user!.id)
      ]);

      setChats(chatsData || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique tags
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    chats.forEach(chat => {
      if (chat.tags) {
        chat.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  }, [chats]);

  // Filter and sort chats
  const filteredAndSortedChats = useMemo(() => {
    let filtered = chats.filter(chat => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = chat.title?.toLowerCase().includes(query);
        const matchesContent = chat.last_message?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesContent) return false;
      }
      
      // Archive filter
      if (filterBy === 'archived' && !chat.is_archived) return false;
      if (filterBy === 'recent' && chat.is_archived) return false;
      if (filterBy === 'recent') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        if (new Date(chat.created_at) < sevenDaysAgo) return false;
      }
      
      // Tags filter
      if (selectedTags.length > 0) {
        const chatTags = chat.tags || [];
        if (!selectedTags.some(tag => chatTags.includes(tag))) return false;
      }
      
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'updated_at':
        default:
          aValue = new Date(a.last_message_at || a.updated_at);
          bValue = new Date(b.last_message_at || b.updated_at);
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [chats, searchQuery, sortBy, sortOrder, filterBy, selectedTags]);

  const handleChatClick = (chatId: string) => {
    router.push(`/chat?id=${chatId}`);
  };

  const handleArchiveChat = async (chatId: string, archived: boolean) => {
    try {
      const success = await chatService.archiveChat(chatId, user!.id, archived);
      if (success) {
        toast({
          title: "Success",
          description: `Chat ${archived ? 'archived' : 'unarchived'} successfully.`,
        });
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${archived ? 'archive' : 'unarchive'} chat.`,
        variant: "destructive",
      });
    }
  };

  const getModelDisplayName = (model?: string) => {
    if (!model) return 'Unknown';
    return model.replace(/^(gpt-|claude-|gemini-|mistral-|llama-|deepseek-)/, '').toUpperCase();
  };

  const getModelColor = (model?: string) => {
    if (!model) return 'bg-gray-100 text-gray-800';
    
    if (model.includes('gpt')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (model.includes('claude')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    if (model.includes('gemini')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    if (model.includes('mistral')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    if (model.includes('llama')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    if (model.includes('deepseek')) return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
    
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Please log in to view your conversations.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                    My Conversations
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-base lg:text-lg">
                    Manage and explore your AI chat history
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => router.push('/chat')} 
                className="flex items-center gap-2 h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-5 w-5" />
                New Chat
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200/50 dark:border-blue-800/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalChats}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border-emerald-200/50 dark:border-emerald-800/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Recent</p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{stats.recentChats}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border-amber-200/50 dark:border-amber-800/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Archived</p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.archivedChats}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <Archive className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-purple-200/50 dark:border-purple-800/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Messages</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalMessages}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mb-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Chats</SelectItem>
                      <SelectItem value="recent">Recent</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="updated_at">Last Activity</SelectItem>
                      <SelectItem value="created_at">Created Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </Button>

                  <div className="flex border rounded-lg">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-r-none"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tags Filter */}
              {availableTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                  <span className="text-sm font-medium">Tags:</span>
                  {availableTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedTags(prev =>
                          prev.includes(tag)
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        );
                      }}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Conversations Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {isLoading ? (
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAndSortedChats.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No conversations found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || selectedTags.length > 0 || filterBy !== 'all'
                    ? "Try adjusting your search or filters"
                    : "Start a new conversation to see your chat history here"
                  }
                </p>
                <Button onClick={() => router.push('/chat')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Chat
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              <AnimatePresence>
                {filteredAndSortedChats.map((chat, index) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0" onClick={() => handleChatClick(chat.id)}>
                            <h3 className="font-semibold text-lg truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {chat.title || 'Untitled Chat'}
                            </h3>
                            {chat.is_archived && (
                              <Badge variant="secondary" className="mt-1">
                                <Archive className="h-3 w-3 mr-1" />
                                Archived
                              </Badge>
                            )}
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleChatClick(chat.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Open Chat
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleArchiveChat(chat.id, !chat.is_archived)}>
                                <Archive className="h-4 w-4 mr-2" />
                                {chat.is_archived ? 'Unarchive' : 'Archive'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="space-y-3" onClick={() => handleChatClick(chat.id)}>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge className={cn("text-xs", getModelColor(chat.model))}>
                              <Bot className="h-3 w-3 mr-1" />
                              {getModelDisplayName(chat.model)}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(chat.last_message_at || chat.updated_at))} ago
                            </span>
                          </div>
                          
                          {chat.last_message && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {chat.last_message}
                            </p>
                          )}
                          
                          {chat.tags && chat.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {chat.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {chat.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{chat.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Results Info */}
        {!isLoading && filteredAndSortedChats.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 text-center text-sm text-muted-foreground"
          >
            Showing {filteredAndSortedChats.length} of {chats.length} conversations
          </motion.div>
        )}
      </div>
    </div>
  );
}