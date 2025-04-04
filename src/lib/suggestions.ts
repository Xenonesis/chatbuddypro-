/**
 * Utility functions for generating smart suggestions
 */

/**
 * Extracts potential follow-up suggestions directly from an AI response text
 */
export function extractSuggestionsFromText(text: string): string[] {
  if (!text) return [];

  // Look for common patterns in AI responses that indicate follow-up suggestions
  const patterns = [
    // Pattern: "You could ask me about X, Y, or Z"
    /(?:you (?:could|can|might) (?:also )?(?:ask|try)(?:\s+me)?(?:\s+about)?)[^.?!]+(?:[.?!])/gi,
    
    // Pattern: "Some questions you might consider:"
    /(?:some (?:questions|things) (?:you|to) (?:might|could|can|may)(?:\s+want to)?(?:\s+consider|ask|explore|investigate)(?:\s+include)?:)(?:\s+[-*•]?[^.?!]+[.?!])+/gi,
    
    // Pattern: "Here are some follow-up questions..."
    /(?:here are some (?:follow-up|related|additional|suggested|possible) (?:questions|prompts|queries)(?:\s+you can ask)?:?)(?:\s+[-*•]?[^.?!]+[.?!])+/gi,
    
    // Pattern: "You might want to ask about X"
    /(?:you (?:might|could|can|may)(?:\s+want to)?(?:\s+ask|explore|investigate)(?:\s+about)?)[^.?!]+(?:[.?!])/gi,
    
    // Pattern: List items with numbers or bullets
    /(?:^|\n)(?:\d+[\.\)]\s*|\*\s*|•\s*|-\s*)(?:"[^"]+"|[^.?!\n]+(?:[.?!]))/gm,
    
    // Pattern: "To learn more, ask about X"
    /(?:to (?:learn|find out|explore|understand|discover) more(?:\s+about this)?(?:,| you can) (?:ask|try)(?:\s+asking)?(?:\s+about)?)[^.?!]+(?:[.?!])/gi
  ];

  let suggestions: string[] = [];
  
  // Try to extract suggestions using each pattern
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      // Process each match to extract the actual question/suggestion
      for (const match of matches) {
        let cleanedSuggestion = match
          .replace(/^(?:\d+[\.\)]\s*|\*\s*|•\s*|-\s*|"\s*|\s*"$)/g, '') // Remove bullets, numbers, quotes
          .replace(/^(?:you (?:might|could|can|may)(?:\s+want to)?(?:\s+ask|explore|investigate)(?:\s+about)?:?\s*)/gi, '') // Remove "You might want to ask about"
          .replace(/^(?:to (?:learn|find out|explore|understand|discover) more(?:\s+about this)?(?:,| you can) (?:ask|try)(?:\s+asking)?(?:\s+about)?:?\s*)/gi, '') // Remove "To learn more, ask about"
          .trim();

        // Remove "questions like" and similar phrases
        cleanedSuggestion = cleanedSuggestion.replace(/^(?:questions like|for example|such as|questions such as):?\s*/gi, '');
        
        // Format as a question if it's not already
        if (!cleanedSuggestion.endsWith('?') && !cleanedSuggestion.includes('?')) {
          if (cleanedSuggestion.match(/^(?:what|how|why|when|where|who|which|can|could|would|will|is|are|do|does|did)/i)) {
            cleanedSuggestion += '?';
          }
        }
        
        // Filter out short or invalid suggestions
        if (cleanedSuggestion.length > 10 && cleanedSuggestion.length < 100) {
          suggestions.push(cleanedSuggestion);
        }
      }
    }
  }
  
  // Deduplicate suggestions
  suggestions = [...new Set(suggestions)];
  
  // Sort by length (shorter questions first)
  suggestions.sort((a, b) => a.length - b.length);
  
  // Return up to 5 suggestions
  return suggestions.slice(0, 5);
}

/**
 * Generate a follow-up question based on the latest message
 */
export async function generateFollowUpQuestion(message: string): Promise<string | null> {
  // Extract simple follow-up questions based on common patterns
  const keywords = [
    { keyword: 'example', question: 'Can you provide a specific example?' },
    { keyword: 'comparison', question: 'How does this compare to alternatives?' },
    { keyword: 'explain', question: 'Could you explain that in simpler terms?' },
    { keyword: 'code', question: 'Can you show me the code for this?' },
    { keyword: 'learn', question: 'What resources would you recommend to learn more?' },
    { keyword: 'best practice', question: 'What are the best practices for this?' },
    { keyword: 'advantage', question: 'What are the main advantages of this approach?' },
    { keyword: 'limitation', question: 'What are the limitations or drawbacks?' },
    { keyword: 'implement', question: 'How would I implement this in practice?' },
    { keyword: 'future', question: 'How might this evolve in the future?' }
  ];
  
  // Check if any keywords match
  for (const { keyword, question } of keywords) {
    if (message.toLowerCase().includes(keyword.toLowerCase())) {
      return question;
    }
  }

  // Default questions if no keyword matches
  const defaultQuestions = [
    'Could you elaborate on that?',
    'How would this work in practice?',
    'What are the key considerations?',
    'Can you provide more details?',
    'Why is this approach recommended?'
  ];
  
  // Return a random default question
  return defaultQuestions[Math.floor(Math.random() * defaultQuestions.length)];
}

/**
 * Get a list of general suggestion prompts
 */
export function getGeneralSuggestions(): string[] {
  return [
    'What are the best practices for this?',
    'Can you explain how this works?',
    'What are the alternatives?',
    'Can you give a practical example?',
    'What are the limitations?',
    'How would you implement this?',
    'Can you summarize the key points?',
    'What resources would you recommend for learning more?',
    'What are the common mistakes to avoid?'
  ];
} 