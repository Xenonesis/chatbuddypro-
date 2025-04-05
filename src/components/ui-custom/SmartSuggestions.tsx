import React, { useState, useEffect } from 'react';
import { Sparkles, MessageCircle, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  extractSuggestionsFromText,
  getGeneralSuggestions
} from '@/lib/suggestions';
import {
  generateFollowUpQuestions,
  generateAISuggestions,
  ChatHistoryItem 
} from '@/lib/utils';
import { useModelSettings } from '@/lib/context/ModelSettingsContext';

interface SmartSuggestionsProps {
  latestMessage: string;
  onSuggestionClick: (suggestion: string) => void;
  messages?: { role: 'user' | 'assistant', content: string }[];
}

export function SmartSuggestions({ latestMessage, onSuggestionClick, messages = [] }: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { settings, currentProvider, getApiKey } = useModelSettings();
  
  useEffect(() => {
    // Only generate suggestions if the feature is enabled
    if (!settings.suggestionsSettings?.enabled) {
      setSuggestions([]);
      return;
    }

    const generateSuggestions = async () => {
      setLoading(true);
      try {
        let newSuggestions: string[] = [];
        
        // First try to extract suggestions directly from the latest message
        const extractedSuggestions = extractSuggestionsFromText(latestMessage);
        
        // If AI-powered suggestions are enabled, use the current provider's API
        if (settings.suggestionsSettings.useAI && messages.length > 0) {
          try {
            // Convert messages to the expected ChatHistoryItem format
            const chatHistory: ChatHistoryItem[] = messages.map((msg, index) => ({
              id: String(index),
              content: msg.content,
              role: msg.role,
              timestamp: new Date()
            }));
            
            // Get the API key for the current provider
            const apiKey = getApiKey(currentProvider);
            
            if (apiKey) {
              console.log(`Using ${currentProvider} for AI-powered suggestions`);
              const aiSuggestions = await generateAISuggestions(
                chatHistory,
                currentProvider,
                apiKey
              );
              
              // Combine all suggestion types, prioritizing follow-up questions
              const combinedSuggestions = [
                ...aiSuggestions.followUpQuestions,
                ...aiSuggestions.topicSuggestions,
                ...aiSuggestions.recommendedPrompts
              ];
              
              if (combinedSuggestions.length > 0) {
                // If AI generated suggestions, use those (limit to 5)
                newSuggestions = combinedSuggestions.slice(0, 5);
              }
            } else {
              console.log('No API key available for the current provider, falling back to basic suggestions');
            }
          } catch (aiError) {
            console.error('Error generating AI-powered suggestions:', aiError);
          }
        }
        
        // If we have extracted suggestions from the text and no AI suggestions,
        // or if AI suggestions failed, use the extracted ones
        if (newSuggestions.length === 0 && extractedSuggestions.length > 0) {
          newSuggestions = extractedSuggestions.slice(0, 5);
        } 
        
        // If we still don't have enough suggestions, generate follow-up questions
        if (newSuggestions.length === 0 && latestMessage) {
          const followUpQuestions = generateFollowUpQuestions(latestMessage);
          if (followUpQuestions.length > 0) {
            newSuggestions = [...newSuggestions, ...followUpQuestions.slice(0, 3)];
          }
        }
        
        // If we still couldn't generate enough suggestions, add some general ones
        if (newSuggestions.length < 3) {
          const generalSuggestions = getGeneralSuggestions();
          newSuggestions = [...newSuggestions, ...generalSuggestions].slice(0, 5);
        }
        
        setSuggestions(newSuggestions);
      } catch (error) {
        console.error('Error generating suggestions:', error);
        // Fallback to general suggestions if there's an error
        setSuggestions(getGeneralSuggestions().slice(0, 3));
      } finally {
        setLoading(false);
      }
    };
    
    if (latestMessage) {
      generateSuggestions();
    } else {
      setSuggestions(getGeneralSuggestions().slice(0, 3));
    }
  }, [latestMessage, settings.suggestionsSettings?.enabled, settings.suggestionsSettings.useAI, messages, currentProvider, getApiKey]);

  if (!settings.suggestionsSettings?.enabled || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="suggestions-container">
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 items-center">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="smart-suggestion"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
              <span className="truncate max-w-[220px] sm:max-w-[250px]">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 