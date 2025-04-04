import React, { useState, useEffect } from 'react';
import { Sparkles, MessageCircle, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { extractSuggestionsFromText, getGeneralSuggestions, generateFollowUpQuestion } from '@/lib/suggestions';
import { useModelSettings } from '@/lib/context/ModelSettingsContext';

interface SmartSuggestionsProps {
  latestMessage: string;
  onSuggestionClick: (suggestion: string) => void;
}

export function SmartSuggestions({ latestMessage, onSuggestionClick }: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { settings } = useModelSettings();
  
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
        
        // First try to extract suggestions directly from the message
        const extractedSuggestions = extractSuggestionsFromText(latestMessage);
        
        if (extractedSuggestions.length > 0) {
          // If we found suggestions in the text, use those
          newSuggestions = extractedSuggestions.slice(0, 5);
        } else if (latestMessage) {
          // Otherwise generate follow-up questions based on the message
          const followUpQuestion = await generateFollowUpQuestion(latestMessage);
          if (followUpQuestion) {
            newSuggestions.push(followUpQuestion);
          }
        }
        
        // If we couldn't generate enough suggestions, add some general ones
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
  }, [latestMessage, settings.suggestionsSettings?.enabled]);

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