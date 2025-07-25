import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/lib/services/userService';
import { chatService } from '@/lib/services/chatService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  MessageSquare, 
  Clock, 
  RefreshCw, 
  Archive, 
  Trash2, 
  Edit3, 
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Tag,
  MoreVertical,
  Plus
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { Chat } from '@/lib/supabase';
import {
  ChatRenameDialog,
  ChatTagsDialog,
  ChatDeleteDialog,
  BulkChatActions
} from '@/components/ChatManagement';
import { Checkbox } from '@/components/ui/checkbox';

interface ChatStats {
  totalChats: number;
  totalMessages: number;
  archivedChats: number;
  recentChats: number;
}

interface EnhancedChatHistoryProps {
  refreshKey?: number;
}

export default function EnhancedChatHistory({ refreshKey = 0 }: EnhancedChatHistoryProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [stats, setStats] = useState<ChatStats>({
    totalChats: 0,
    totalMessages: 0,
    archivedChats: 0,
    recentChats: 0,
  });
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated_at' | 'created_at' | 'title'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'archived'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25); // Show more chats by default

  // Selection and management state
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showTagsDialog, setShowTagsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  // Load data on mount and when refreshKey changes
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, refreshKey]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load chats and stats in parallel
      const [chatsData, statsData] = await Promise.all([
        userService.getAllChats(user!.id),
        chatService.getChatStats(user!.id)
      ]);

      console.log('Loaded chats data:', chatsData?.length || 0, 'chats');
      console.log('Stats data:', statsData);
      setChats(chatsData || []);
      setStats(statsData);

      // If we have many chats, increase the page size to show more by default
      if (chatsData && chatsData.length > 25 && itemsPerPage === 25) {
        setItemsPerPage(50);
      }
    } catch (error) {
      console.error('Error loading chat data:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique tags from all chats
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

  // Paginate results
  const paginatedChats = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedChats.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedChats, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedChats.length / itemsPerPage);

  // Chat actions
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
        loadData(); // Refresh data
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${archived ? 'archive' : 'unarchive'} chat.`,
        variant: "destructive",
      });
    }
  };

  // Chat management actions
  const handleRenameChat = (chat: Chat) => {
    setSelectedChat(chat);
    setShowRenameDialog(true);
  };

  const handleManageTags = (chat: Chat) => {
    setSelectedChat(chat);
    setShowTagsDialog(true);
  };

  const handleDeleteChat = (chat: Chat) => {
    setSelectedChat(chat);
    setShowDeleteDialog(true);
  };

  // Selection management
  const handleSelectChat = (chatId: string, selected: boolean) => {
    if (selected) {
      setSelectedChats([...selectedChats, chatId]);
    } else {
      setSelectedChats(selectedChats.filter(id => id !== chatId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedChats(paginatedChats.map(chat => chat.id));
    } else {
      setSelectedChats([]);
    }
  };

  const clearSelection = () => {
    setSelectedChats([]);
  };

  const getModelDisplayName = (model?: string) => {
    if (!model) return 'Unknown';
    return model.replace(/^(gpt-|claude-|gemini-|mistral-|llama-|deepseek-)/, '').toUpperCase();
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please log in to view your chat history.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Chats</p>
                <p className="text-2xl font-bold">{stats.totalChats}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Recent</p>
                <p className="text-2xl font-bold">{stats.recentChats}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Archive className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Archived</p>
                <p className="text-2xl font-bold">{stats.archivedChats}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Messages</p>
                <p className="text-2xl font-bold">{stats.totalMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="flex-shrink-0">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat History
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button onClick={loadData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => {
                  setItemsPerPage(filteredAndSortedChats.length || 1000);
                  setCurrentPage(1);
                }}
                variant="outline"
                size="sm"
                className="bg-blue-50 hover:bg-blue-100 border-blue-200"
              >
                📜 View All ({filteredAndSortedChats.length})
              </Button>
              <Button onClick={() => router.push('/chat')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chats</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[140px]">
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

            <Select value={itemsPerPage.toString()} onValueChange={(value) => {
              setItemsPerPage(value === 'all' ? filteredAndSortedChats.length || 1000 : parseInt(value));
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-full sm:w-[100px]">
                <SelectValue placeholder="Per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="all">Show All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
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

          {/* Bulk Selection */}
          {paginatedChats.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedChats.length === paginatedChats.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm">Select all on this page</span>
              {selectedChats.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({selectedChats.length} selected)
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <BulkChatActions
        selectedChats={selectedChats}
        userId={user!.id}
        onUpdate={loadData}
        onClearSelection={clearSelection}
      />

      {/* Chat List */}
      <div
        className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-2"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9'
        }}
      >
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : paginatedChats.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No chats found</h3>
              <p className="text-muted-foreground mb-4">
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
          <>
            {/* Scroll indicator */}
            {paginatedChats.length < filteredAndSortedChats.length && (
              <div className="text-center py-2 text-sm text-muted-foreground bg-blue-50 rounded-lg border border-blue-200">
                📜 Showing {paginatedChats.length} of {filteredAndSortedChats.length} chats - Scroll down or use "View All" to see more
              </div>
            )}

            {paginatedChats.map(chat => (
            <Card key={chat.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedChats.includes(chat.id)}
                    onCheckedChange={(checked) => handleSelectChat(chat.id, checked as boolean)}
                    className="mt-1"
                  />
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleChatClick(chat.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium truncate">{chat.title || 'Untitled Chat'}</h3>
                      {chat.is_archived && (
                        <Badge variant="secondary" className="text-xs">
                          <Archive className="h-3 w-3 mr-1" />
                          Archived
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Badge variant="outline" className="text-xs">
                        {getModelDisplayName(chat.model)}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(chat.last_message_at || chat.updated_at))} ago
                      </span>
                      {chat.message_count && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {chat.message_count} messages
                        </span>
                      )}
                    </div>
                    
                    {chat.last_message && (
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.last_message}
                      </p>
                    )}
                    
                    {chat.tags && chat.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {chat.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleChatClick(chat.id)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Open Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRenameChat(chat)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleManageTags(chat)}>
                        <Tag className="h-4 w-4 mr-2" />
                        Manage Tags
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchiveChat(chat.id, !chat.is_archived)}>
                        <Archive className="h-4 w-4 mr-2" />
                        {chat.is_archived ? 'Unarchive' : 'Archive'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteChat(chat)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between flex-shrink-0 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedChats.length)} of {filteredAndSortedChats.length} chats
            {process.env.NODE_ENV === 'development' && (
              <span className="ml-2 text-xs text-blue-500">
                (Total loaded: {chats.length}, Filtered: {filteredAndSortedChats.length}, Page size: {itemsPerPage})
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Management Dialogs */}
      {selectedChat && (
        <>
          <ChatRenameDialog
            chat={selectedChat}
            userId={user!.id}
            isOpen={showRenameDialog}
            onClose={() => {
              setShowRenameDialog(false);
              setSelectedChat(null);
            }}
            onUpdate={loadData}
          />

          <ChatTagsDialog
            chat={selectedChat}
            userId={user!.id}
            isOpen={showTagsDialog}
            onClose={() => {
              setShowTagsDialog(false);
              setSelectedChat(null);
            }}
            onUpdate={loadData}
            availableTags={availableTags}
          />

          <ChatDeleteDialog
            chat={selectedChat}
            userId={user!.id}
            isOpen={showDeleteDialog}
            onClose={() => {
              setShowDeleteDialog(false);
              setSelectedChat(null);
            }}
            onUpdate={loadData}
          />
        </>
      )}
    </div>
  );
}
