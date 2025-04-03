"use client"

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
  // Regular expression to match markdown code blocks with various formats:
  // 1. Standard ```language\ncode```
  // 2. No language specified ```\ncode```
  // 3. Handles optional spaces between backticks and language
  // 4. Handles language with or without newline
  const codeBlockRegex = /```([a-zA-Z0-9_+\-.*]*)?([\s\n])([\s\S]*?)```/g;
  
  const codeBlocks: CodeBlock[] = [];
  let lastIndex = 0;
  let preBlockText = '';
  let match;
  
  // Find all code blocks in the text
  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Store the text before the code block
    preBlockText = text.substring(lastIndex, match.index);
    
    // Process the code block
    const language = (match[1] || 'plaintext').trim();
    // The actual code is in group 3 after the newline
    const code = match[3].trim();
    
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
  
  // Process each block to fix up the pre/post text
  // This handles multiple consecutive code blocks correctly
  for (let i = 1; i < codeBlocks.length; i++) {
    const prevBlock = codeBlocks[i - 1];
    const currentBlock = codeBlocks[i];
    
    // The post text of the previous block becomes the pre text of the current block
    prevBlock.postBlockText = currentBlock.preBlockText;
    // Current block pre text is already set correctly
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
  const codeBlockRegex = /```([a-zA-Z0-9_+\-.*]*)?([\s\n])([\s\S]*?)```/;
  return codeBlockRegex.test(text);
}

// Function to detect if a message is likely a coding question
export function isCodingQuestion(text: string): boolean {
  const codingKeywords = [
    // General programming terms
    'code', 'function', 'class', 'method', 'api', 'programming', 'syntax', 'snippet',
    
    // Languages
    'javascript', 'js', 'typescript', 'ts', 'python', 'java', 'c#', 'c++', 'ruby', 'php', 'go',
    
    // JavaScript specific
    'es6', 'es2015', 'es2020', 'es2021', 'es2022', 'ecmascript', 'node', 'nodejs', 'npm', 'yarn', 'pnpm',
    'promise', 'async', 'await', 'callback', 'closure', 'prototype', 'this', 'arrow function',
    'spread', 'destructuring', 'module', 'import', 'export', 'json', 'dom', 'event', 'listener',
    
    // Frameworks and libraries
    'react', 'angular', 'vue', 'svelte', 'next', 'nuxt', 'express', 'jquery', 'axios', 'fetch',
    'redux', 'mobx', 'zustand', 'recoil', 'webpack', 'vite', 'rollup', 'babel', 'eslint', 'jest',
    'mocha', 'chai', 'cypress', 'playwright', 'tailwind', 'bootstrap', 'material ui', 'chakra',
    
    // Web technologies
    'component', 'html', 'css', 'scss', 'less', 'styled', 'animation', 'transition', 'grid', 'flexbox',
    'responsive', 'media query', 'selector', 'pseudo', 'specificity', 'variable', 'property',
    
    // Data structures and patterns
    'algorithm', 'data structure', 'framework', 'library', 'pattern', 'middleware',
    'hook', 'state', 'props', 'context', 'render', 'component', 'virtual dom'
  ];
  
  const lowerText = text.toLowerCase();
  
  // Check for common coding question patterns
  if (lowerText.includes('how do i') || 
      lowerText.includes('how to') || 
      lowerText.includes('can you help') || 
      lowerText.includes('example of') ||
      lowerText.includes('write a') ||
      lowerText.includes('implement a') ||
      lowerText.includes('create a') ||
      lowerText.includes('fix this') ||
      lowerText.includes('debug this') ||
      lowerText.includes('explain this code') ||
      lowerText.includes('what does this') ||
      lowerText.includes('error in my')) {
    
    // Check if it contains any coding keywords
    return codingKeywords.some(keyword => lowerText.includes(keyword));
  }
  
  // Check if it contains code blocks already
  if (containsCodeBlock(text)) {
    return true;
  }
  
  // Check for specific code patterns that suggest code content
  const codePatterns = [
    /function\s*\w*\s*\(/i, // function declarations
    /const|let|var\s+\w+\s*=/i, // variable declarations
    /import\s+[\w\s{}]+\s+from/i, // ES6 imports
    /export\s+/i, // ES6 exports
    /class\s+\w+/i, // class declarations
    /if\s*\(.+\)\s*{/i, // if statements
    /for\s*\(.+\)\s*{/i, // for loops
    /=>/i, // arrow functions
    /\.then\s*\(/i, // promise chains
    /\$\(.*\)\./i, // jQuery patterns
    /document\.get/i, // DOM manipulation
    /console\.log/i, // console logs
    /\<\w+(\s+\w+=".*")*\s*\>/i, // HTML tags
    /\{\s*\w+:.*\}/i, // Object literals
  ];
  
  return codePatterns.some(pattern => pattern.test(text));
} 