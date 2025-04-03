import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useEffect, useState } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ClientOnly component to only render content on the client side
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient;
}

// Interface for code blocks extracted from text
export interface CodeBlock {
  code: string;
  language: string;
  preBlockText: string;
  postBlockText: string;
}

// Function to detect and parse code blocks from text
export function parseCodeBlocks(text: string): CodeBlock[] {
  // Regular expression to match markdown code blocks (```language\ncode```)
  const codeBlockRegex = /```([a-zA-Z0-9_+-]+)?\n([\s\S]*?)```/g;
  
  const codeBlocks: CodeBlock[] = [];
  let lastIndex = 0;
  let preBlockText = '';
  let match;
  
  // Find all code blocks in the text
  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Store the text before the code block
    preBlockText = text.substring(lastIndex, match.index);
    
    // Process the code block
    const language = match[1] || 'plaintext';
    const code = match[2];
    
    // Update last index to the end of this match
    lastIndex = match.index + match[0].length;
    
    // Store the text after the code block (will be overwritten if there are more code blocks)
    const postBlockText = text.substring(lastIndex);
    
    codeBlocks.push({
      code,
      language,
      preBlockText,
      postBlockText
    });
  }
  
  // If no code blocks were found, return the original text as non-code
  if (codeBlocks.length === 0) {
    return [];
  }
  
  // Add any remaining text after the last code block
  if (lastIndex < text.length) {
    const lastBlock = codeBlocks[codeBlocks.length - 1];
    lastBlock.postBlockText = text.substring(lastIndex);
  }
  
  return codeBlocks;
}

// Check if content contains code - for deciding if we should apply special formatting
export function containsCodeBlock(text: string): boolean {
  const codeBlockRegex = /```([a-zA-Z0-9_+-]+)?\n([\s\S]*?)```/;
  return codeBlockRegex.test(text);
}

// Function to detect if a message is likely a coding question
export function isCodingQuestion(text: string): boolean {
  const codingKeywords = [
    'code', 'function', 'class', 'method', 'api', 'programming', 
    'javascript', 'typescript', 'python', 'java', 'c#', 'c++', 
    'react', 'angular', 'vue', 'component', 'html', 'css', 
    'algorithm', 'data structure', 'framework', 'library'
  ];
  
  const lowerText = text.toLowerCase();
  
  // Check for common coding question patterns
  if (lowerText.includes('how do i') || 
      lowerText.includes('how to') || 
      lowerText.includes('can you help') || 
      lowerText.includes('example of') ||
      lowerText.includes('write a') ||
      lowerText.includes('implement a')) {
    
    // Check if it contains any coding keywords
    return codingKeywords.some(keyword => lowerText.includes(keyword));
  }
  
  // Check if it contains code blocks already
  if (containsCodeBlock(text)) {
    return true;
  }
  
  return false;
} 