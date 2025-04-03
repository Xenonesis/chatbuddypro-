'use client';

import React from 'react';
import { containsCodeBlock, parseCodeBlocks } from '@/lib/utils';
import { CodeBlock } from './CodeBlock';

interface FormattedMessageProps {
  content: string;
}

export function FormattedMessage({ content }: FormattedMessageProps) {
  // If there are no code blocks, just return the content as is
  if (!containsCodeBlock(content)) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  // Parse the code blocks from the content
  const codeBlocks = parseCodeBlocks(content);
  
  if (codeBlocks.length === 0) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  // Check if content has file headers (common in code examples)
  const detectFileHeaders = (text: string) => {
    // Look for patterns like:
    // - filename.js
    // - File: filename.js
    // - In filename.js:
    const fileHeaderRegex = /(?:^|\n)(?:(?:File|In):?\s+)?([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)[:]*\s*(?:\n|$)/g;
    const matches = [];
    let match;
    
    while ((match = fileHeaderRegex.exec(text)) !== null) {
      if (match[1]) {
        matches.push({ 
          fullMatch: match[0], 
          filename: match[1], 
          index: match.index 
        });
      }
    }
    
    return matches;
  };
  
  // Process block text to identify file headers and enhance the display
  const processBlockText = (text: string) => {
    const fileHeaders = detectFileHeaders(text);
    
    if (fileHeaders.length === 0) {
      return <div className="whitespace-pre-wrap">{text}</div>;
    }
    
    // Split text based on file headers
    const parts = [];
    let lastIndex = 0;
    
    fileHeaders.forEach((header, i) => {
      // Add text before this header
      if (header.index > lastIndex) {
        parts.push(
          <div key={`text-${i}`} className="whitespace-pre-wrap">
            {text.substring(lastIndex, header.index)}
          </div>
        );
      }
      
      // Add the filename header with styling
      parts.push(
        <div key={`file-${i}`} className="font-medium text-sm text-blue-600 dark:text-blue-400 mt-3 mb-1 flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1.5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {header.filename}
        </div>
      );
      
      // Update lastIndex to include the file header
      lastIndex = header.index + header.fullMatch.length;
    });
    
    // Add any remaining text
    if (lastIndex < text.length) {
      parts.push(
        <div key="text-final" className="whitespace-pre-wrap">
          {text.substring(lastIndex)}
        </div>
      );
    }
    
    return <>{parts}</>;
  };

  // Render the message with code blocks
  return (
    <div className="w-full space-y-4">
      {codeBlocks.map((block, index) => (
        <React.Fragment key={index}>
          {/* Text before code block */}
          {block.preBlockText && processBlockText(block.preBlockText)}
          
          {/* Code block */}
          <div className="w-full">
            <CodeBlock 
              code={block.code} 
              language={block.language} 
              showLineNumbers={true} 
            />
          </div>
          
          {/* Text after code block */}
          {block.postBlockText && processBlockText(block.postBlockText)}
        </React.Fragment>
      ))}
    </div>
  );
} 