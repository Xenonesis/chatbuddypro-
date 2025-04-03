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

  // Render the message with code blocks
  return (
    <div>
      {codeBlocks.map((block, index) => (
        <React.Fragment key={index}>
          {/* Text before code block */}
          {block.preBlockText && (
            <div className="whitespace-pre-wrap mb-4">{block.preBlockText}</div>
          )}
          
          {/* Code block */}
          <CodeBlock 
            code={block.code} 
            language={block.language} 
            showLineNumbers={true} 
          />
          
          {/* Text after code block */}
          {block.postBlockText && (
            <div className="whitespace-pre-wrap mt-4">{block.postBlockText}</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
} 