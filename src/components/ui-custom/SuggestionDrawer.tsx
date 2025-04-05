'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, MessageCircle, Search, Brain, Book, Code, Lightbulb, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { extractSuggestionsFromText, getGeneralSuggestions } from '@/lib/utils';
import { useModelSettings } from '@/lib/context/ModelSettingsContext';

interface SuggestionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define suggestion categories
const CATEGORIES = {
  all: { name: 'All', icon: <Sparkles className="h-4 w-4" /> },
  general: { name: 'General', icon: <MessageCircle className="h-4 w-4" /> },
  technical: { name: 'Technical', icon: <Code className="h-4 w-4" /> },
  creative: { name: 'Creative', icon: <Lightbulb className="h-4 w-4" /> },
  learning: { name: 'Learning', icon: <Book className="h-4 w-4" /> },
  quick: { name: 'Quick', icon: <Zap className="h-4 w-4" /> }
};

type SuggestionCategory = keyof typeof CATEGORIES;

interface Suggestion {
  text: string;
  category: SuggestionCategory;
}

export function SuggestionDrawer({ open, onOpenChange }: SuggestionDrawerProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SuggestionCategory>('all');
  const { settings } = useModelSettings();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  
  // Function to close the drawer
  const handleClose = () => onOpenChange(false);
  
  // Load suggestions when drawer opens
  useEffect(() => {
    if (open) {
      setLoading(true);
      setSearchQuery('');
      
      // Focus the search input when drawer opens
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 300);
      
      // Get suggestions with categories
      const categorizedSuggestions: Suggestion[] = [
        // General suggestions
        ...getGeneralSuggestions().map(text => ({ 
          text, 
          category: 'general' as SuggestionCategory 
        })),
        
        // Technical suggestions
        { text: 'How do I implement authentication in my app?', category: 'technical' },
        { text: 'What are the best practices for API design?', category: 'technical' },
        { text: 'Can you explain how WebSockets work?', category: 'technical' },
        { text: 'How should I structure my React components?', category: 'technical' },
        { text: "What's the difference between REST and GraphQL?", category: 'technical' },
        
        // Creative suggestions
        { text: 'Generate a creative story based on three random words', category: 'creative' },
        { text: 'Help me brainstorm ideas for my project', category: 'creative' },
        { text: 'Suggest some design patterns for my user interface', category: 'creative' },
        { text: 'How can I make my content more engaging?', category: 'creative' },
        { text: 'Give me some creative ways to solve this problem', category: 'creative' },
        
        // Learning suggestions
        { text: 'Explain machine learning concepts in simple terms', category: 'learning' },
        { text: 'What resources would you recommend for learning JavaScript?', category: 'learning' },
        { text: 'How does blockchain technology work?', category: 'learning' },
        { text: 'What are the fundamentals of cloud computing?', category: 'learning' },
        { text: 'Can you summarize the key points of this concept?', category: 'learning' },
        
        // Quick suggestions
        { text: 'What are the core features of this app?', category: 'quick' },
        { text: 'How can I connect my own API keys?', category: 'quick' },
        { text: 'Tell me about the different AI models available', category: 'quick' },
        { text: 'What are the different chat modes?', category: 'quick' },
        { text: 'How secure is my data when using this app?', category: 'quick' }
      ];
      
      // Shuffle each category for variety
      const shuffled = [...categorizedSuggestions].sort(() => 0.5 - Math.random());
      
      setSuggestions(shuffled);
      setFilteredSuggestions(shuffled);
      setLoading(false);
    }
  }, [open]);
  
  // Filter suggestions based on tab and search query
  useEffect(() => {
    if (!suggestions.length) return;
    
    let filtered = [...suggestions];
    
    // Filter by category if not "all"
    if (activeTab !== 'all') {
      filtered = filtered.filter(suggestion => suggestion.category === activeTab);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(suggestion => 
        suggestion.text.toLowerCase().includes(query)
      );
    }
    
    setFilteredSuggestions(filtered);
  }, [activeTab, searchQuery, suggestions]);
  
  // Function to handle clicking on a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    // Add a small delay before closing to provide visual feedback
    setTimeout(() => {
      handleClose();
    }, 150);
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close on escape
      if (e.key === 'Escape') {
        handleClose();
      }
      
      // Focus search input on '/'
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);
  
  // Handle clicks outside the drawer
  useEffect(() => {
    if (!open) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    
    // Add the event listener after a short delay to prevent immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);
  
  // Copy selected suggestion to clipboard
  useEffect(() => {
    if (selectedSuggestion) {
      // Dispatch a custom event that the Chat component will listen for
      const event = new CustomEvent('suggestion:selected', { 
        detail: { suggestion: selectedSuggestion } 
      });
      window.dispatchEvent(event);
      setSelectedSuggestion(null);
    }
  }, [selectedSuggestion]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-200 flex items-start justify-center">
      <div 
        ref={drawerRef}
        className={`bg-white dark:bg-slate-900 shadow-lg max-h-[85vh] overflow-hidden w-full max-w-xl mx-auto mt-16 sm:mt-20 rounded-lg border border-slate-200 dark:border-slate-700 transition-all duration-300 opacity-0 translate-y-4 ${open ? 'opacity-100 translate-y-0' : ''}`}
        style={{ animationDelay: '10ms' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            <h2 className="text-lg font-semibold">Smart Suggestions</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600 mx-1 text-xs">/</kbd> to search
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleClose}
              className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-3 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search suggestions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as SuggestionCategory)}>
          <div className="px-3 pt-3 border-b border-slate-200 dark:border-slate-700">
            <TabsList className="w-full bg-slate-100 dark:bg-slate-800 overflow-x-auto flex-wrap">
              {Object.entries(CATEGORIES).map(([key, { name, icon }]) => (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
                >
                  {icon}
                  <span>{name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <div className="p-4 h-[calc(85vh-16rem)] sm:h-[calc(85vh-16rem)] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
                </div>
              </div>
            ) : filteredSuggestions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                <Brain className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No suggestions found for this search</p>
                <p className="text-sm mt-1">Try a different search term or category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="group flex items-center gap-2 p-3 text-left text-sm rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-150 transform hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    {CATEGORIES[suggestion.category].icon}
                    <span className="flex-1">{suggestion.text}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">Use</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Tabs>
        
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
          <div>
            {filteredSuggestions.length} suggestions available
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="h-7 text-xs"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
} 