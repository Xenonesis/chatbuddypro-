'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check, Code } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({ code, language = 'javascript', showLineNumbers = true }: CodeBlockProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Extract language from markdown code fence if available
  const extractedLanguage = language.includes('```') 
    ? language.replace('```', '').trim() 
    : language;

  return (
    <div className="relative my-4 font-mono text-sm rounded-lg overflow-hidden border dark:border-slate-700">
      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b dark:border-slate-700">
        <div className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center">
          <Code className="h-3.5 w-3.5 mr-1.5 text-slate-500 dark:text-slate-400" />
          {extractedLanguage}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          onClick={copyToClipboard}
          title="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span className="ml-1.5 text-xs font-medium">{copied ? 'Copied!' : 'Copy'}</span>
        </Button>
      </div>
      <SyntaxHighlighter
        language={extractedLanguage}
        style={theme === 'dark' ? vscDarkPlus : vs}
        showLineNumbers={showLineNumbers}
        wrapLines={true}
        customStyle={{
          margin: 0,
          padding: '1rem',
          backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
          fontSize: '0.8rem',
          borderRadius: 0,
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
} 