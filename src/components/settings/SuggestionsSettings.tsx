import React from 'react';
import { useModelSettings } from '@/lib/context/ModelSettingsContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Star, Lightbulb, MessageSquare, History, Trash2, BookOpen, PenTool, Code } from 'lucide-react';
import { PROMPT_CATEGORIES } from '@/lib/utils';

export default function SuggestionsSettings() {
  const { 
    settings, 
    toggleSuggestionsEnabled, 
    toggleSaveHistory, 
    toggleFollowUpQuestions, 
    toggleTopicSuggestions,
    togglePromptRecommendations,
    toggleUseAI,
    removeFavoritePrompt
  } = useModelSettings();
  const { suggestionsSettings } = settings;

  const handleRemoveFavorite = (prompt: string) => {
    removeFavoritePrompt(prompt);
  };

  return (
    <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Smart Suggestions
        </CardTitle>
        <CardDescription>
          Configure how smart suggestions work to enhance your chat experience
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="suggestions-enabled">Enable Smart Suggestions</Label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Show intelligent prompt suggestions based on your chat history
            </p>
          </div>
          <Switch
            id="suggestions-enabled"
            checked={suggestionsSettings.enabled}
            onCheckedChange={toggleSuggestionsEnabled}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="save-history">Save Chat History</Label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Store your chat history for better suggestions (local storage only)
            </p>
          </div>
          <Switch
            id="save-history"
            checked={suggestionsSettings.saveHistory}
            onCheckedChange={toggleSaveHistory}
            disabled={!suggestionsSettings.enabled}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="follow-up">Follow-up Questions</Label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Show contextual follow-up questions based on the conversation
            </p>
          </div>
          <Switch
            id="follow-up"
            checked={suggestionsSettings.showFollowUpQuestions}
            onCheckedChange={toggleFollowUpQuestions}
            disabled={!suggestionsSettings.enabled}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="topic-suggestions">Topic Suggestions</Label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Suggest topics based on your chat history and interests
            </p>
          </div>
          <Switch
            id="topic-suggestions"
            checked={suggestionsSettings.showTopicSuggestions}
            onCheckedChange={toggleTopicSuggestions}
            disabled={!suggestionsSettings.enabled}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="prompt-recommendations">Prompt Recommendations</Label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Show recommended prompts based on common use cases and context
            </p>
          </div>
          <Switch
            id="prompt-recommendations"
            checked={suggestionsSettings.showPromptRecommendations}
            onCheckedChange={togglePromptRecommendations}
            disabled={!suggestionsSettings.enabled}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="use-ai">AI-Powered Suggestions</Label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Use AI to generate more relevant and context-aware suggestions
            </p>
          </div>
          <Switch
            id="use-ai"
            checked={suggestionsSettings.useAI}
            onCheckedChange={toggleUseAI}
            disabled={!suggestionsSettings.enabled}
          />
        </div>
        
        {/* Category Descriptions */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-emerald-500" />
            Prompt Categories
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-md">
              <div className="flex items-center gap-1.5 mb-1">
                <Code className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs font-medium">{PROMPT_CATEGORIES.CODING}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Programming, debugging, and development prompts
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-md">
              <div className="flex items-center gap-1.5 mb-1">
                <PenTool className="h-3.5 w-3.5 text-purple-500" />
                <span className="text-xs font-medium">{PROMPT_CATEGORIES.WRITING}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Content creation, editing, and communication prompts
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-md">
              <div className="flex items-center gap-1.5 mb-1">
                <MessageSquare className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-medium">{PROMPT_CATEGORIES.LEARNING}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Educational, explanatory, and concept-based prompts
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-md">
              <div className="flex items-center gap-1.5 mb-1">
                <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
                <span className="text-xs font-medium">{PROMPT_CATEGORIES.CREATIVE}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Brainstorming, ideation, and creative writing prompts
              </p>
            </div>
          </div>
        </div>
        
        {/* Favorite Prompts Section */}
        {suggestionsSettings.favoritePrompts.length > 0 && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <Star className="h-4 w-4 text-yellow-500" />
              Favorite Prompts
            </h3>
            <div className="space-y-2">
              {suggestionsSettings.favoritePrompts.map((prompt, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2 rounded-md">
                  <p className="text-xs mr-2">{prompt}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-slate-500 hover:text-red-500 flex-shrink-0"
                    onClick={() => handleRemoveFavorite(prompt)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 