'use client';

import React from 'react';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Copy, Trash, PencilLine, MoreVertical, RotateCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Markdown from 'react-markdown';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs2015 as vscDarkPlus, vs } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
// Register only the languages we actually use
import javascript from 'react-syntax-highlighter/dist/cjs/languages/hljs/javascript';
import typescript from 'react-syntax-highlighter/dist/cjs/languages/hljs/typescript';
import python from 'react-syntax-highlighter/dist/cjs/languages/hljs/python';
import css from 'react-syntax-highlighter/dist/cjs/languages/hljs/css';
import json from 'react-syntax-highlighter/dist/cjs/languages/hljs/json';

// Register languages
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('json', json);
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MessageRendererProps {
  message: Message;
  onCopy?: (content: string) => void;
  onEdit?: (id: string, content: string) => void;
  onDelete?: () => void;
  showThinking?: boolean;
  isLoading?: boolean;
  thinking?: string;
}

export default function MessageRenderer({
  message,
  onCopy,
  onEdit,
  onDelete,
  showThinking = false,
  isLoading = false,
  thinking = '',
}: MessageRendererProps) {
  const isUser = message.role === 'user';
  const formattedTimestamp = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    : '';

  const handleCopy = () => {
    if (onCopy) {
      onCopy(message.content);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(message.id, message.content);
    }
  };
  
  // Process markdown with code blocks
  const renderMessageContent = () => {
    return (
      <div className="prose prose-slate dark:prose-invert max-w-none break-words">
        <Markdown
          components={{
            code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            return !inline && match ? (
              <div className="relative group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full bg-secondary/80 hover:bg-secondary"
                    onClick={() => onCopy && onCopy(String(children).replace(/\n$/, ''))}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={language}
                  customStyle={{
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginTop: '0.5rem',
                    marginBottom: '0.5rem',
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={`${className || ''} p-1 rounded bg-gray-200 dark:bg-gray-800`} {...props}>
                {children}
              </code>
            );
          },
        }}
        >
          {message.content}
        </Markdown>
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
      <div 
        className={cn(
          "max-w-[85%] sm:max-w-[80%] rounded-lg px-4 py-3 shadow-sm flex flex-col space-y-2",
          isUser 
            ? "bg-blue-600 dark:bg-blue-700 text-white rounded-br-none" 
            : "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none"
        )}
      >
        <div className="flex justify-between items-start">
          <div 
            className={cn(
              "text-xs opacity-75",
              isUser ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
            )}
          >
            {isUser ? 'You' : 'Assistant'} • {formattedTimestamp}
          </div>
          
          {!isLoading && (
            <div className="ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "h-6 w-6 rounded-full",
                      isUser 
                        ? "text-blue-100 hover:bg-blue-700 hover:text-white" 
                        : "text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-700"
                    )}
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </DropdownMenuItem>
                  {isUser && (
                    <DropdownMenuItem onClick={handleEdit}>
                      <PencilLine className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={onDelete}
                    className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          
          {isLoading && (
            <div className="ml-2">
              <div
                className="h-6 w-6 flex items-center justify-center rounded-full text-slate-500"
              >
                <RotateCw className="h-3.5 w-3.5 animate-spin" />
              </div>
            </div>
          )}
        </div>
        
        <div className="message-content">
          {renderMessageContent()}
        </div>
        
        {isLoading && thinking && showThinking && (
          <div className="mt-3 p-2 bg-slate-300/50 dark:bg-slate-700/50 rounded text-xs text-slate-700 dark:text-slate-300 font-mono overflow-auto max-h-32">
            <div className="font-semibold mb-1 text-slate-900 dark:text-white flex items-center">
              <RotateCw className="h-3 w-3 mr-2 animate-spin" />
              Thinking...
            </div>
            {thinking}
          </div>
        )}
        
        {message.responseTime && !isUser && (
          <div className="text-right text-xs text-slate-500 dark:text-slate-400 mt-1">
            {message.responseTime}s
          </div>
        )}
      </div>
    </div>
  );
} 