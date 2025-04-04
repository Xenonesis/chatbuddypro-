'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs, tomorrow, atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check, Code, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  language: string;
  value: string;
  className?: string;
}

export default function CodeBlock({ language, value, className, ...props }: CodeBlockProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  
  const lineCount = value.split('\n').length;
  const isLongCode = lineCount > 15;
  const isVeryLongCode = lineCount > 100 || value.length > 3000;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy: ', error);
    }
  };

  // Extract language from markdown code fence if available
  const extractedLanguage = language.includes('```') 
    ? language.replace('```', '').trim() 
    : language;
    
  // Normalize language identifiers
  const normalizedLanguage = (() => {
    const lang = extractedLanguage.toLowerCase();
    
    // JavaScript and variants
    if (['js', 'javascript', 'jsx', 'es6', 'typescript', 'tsx', 'ts', 'mjs', 'cjs', 'vue', 'node'].includes(lang)) {
      if (lang.includes('tsx') || lang.includes('jsx')) return 'jsx';
      if (lang.includes('ts')) return 'typescript';
      if (lang === 'vue') return 'jsx'; // Vue template highlighting
      return 'javascript';
    }
    
    // CSS and variants
    if (['css', 'scss', 'less', 'stylus', 'postcss'].includes(lang)) return 'css';
    
    // HTML/XML
    if (['html', 'xml', 'xhtml', 'svg', 'jsx', 'vue', 'svelte'].includes(lang)) return 'markup';
    
    // Shell
    if (['sh', 'bash', 'shell', 'zsh', 'cmd', 'powershell', 'ps', 'terminal', 'console'].includes(lang)) return 'bash';
    
    // JSON
    if (['json', 'jsonc', 'json5', 'geojson', 'jsonld'].includes(lang)) return 'json';
    
    // Return as is for other languages
    return lang || 'plaintext';
  })();

  // Calculate height based on expanded state and line count
  const getCodeHeight = () => {
    if (fullScreen) return 'calc(85vh - 80px)';
    if (expanded) return 'none';
    if (isVeryLongCode) return '500px';
    if (isLongCode) return '350px';
    return 'none';
  };
  
  // Select the appropriate theme
  const getThemeStyle = () => {
    if (theme === 'dark') {
      // For JavaScript and TypeScript, use a more vibrant theme
      if (['javascript', 'typescript', 'jsx', 'tsx'].includes(normalizedLanguage)) {
        return atomDark;
      }
      return vscDarkPlus;
    } else {
      // Light theme with better JS highlighting
      if (['javascript', 'typescript', 'jsx', 'tsx'].includes(normalizedLanguage)) {
        return tomorrow;
      }
      return vs;
    }
  };

  const codeHeight = getCodeHeight();
  const shouldShowExpand = isLongCode && !fullScreen;
  const shouldShowFullScreen = isVeryLongCode || lineCount > 30;

  // Full screen overlay for very large code blocks
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col p-4 overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="font-medium text-sm">{extractedLanguage || 'plaintext'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              title="Copy code"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="ml-2 text-sm">{copied ? 'Copied!' : 'Copy'}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFullScreen(false)}
              title="Exit full screen"
            >
              <Minimize2 className="h-4 w-4" />
              <span className="ml-2 text-sm">Exit full screen</span>
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <SyntaxHighlighter
            language={normalizedLanguage}
            style={getThemeStyle()}
            showLineNumbers={true}
            wrapLines={false}
            customStyle={{
              margin: 0,
              padding: '1rem',
              backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
              fontSize: '0.9rem',
              borderRadius: 0,
              overflowX: 'auto',
              tabSize: 2,
              height: '100%',
            }}
            codeTagProps={{
              style: {
                fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                lineHeight: 1.5,
              }
            }}
          >
            {value}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative group rounded-md overflow-hidden my-4', className)}>
      <div className="bg-slate-800 dark:bg-slate-900 flex items-center justify-between px-4 py-1.5 text-xs text-slate-300 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="uppercase">{language || 'Code'}</span>
        </div>
        <button
          className="transition-colors text-slate-400 hover:text-slate-100 focus:outline-none"
          onClick={copyToClipboard}
          aria-label="Copy code"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <pre className="bg-slate-800 dark:bg-slate-900 p-4 rounded-b-md overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
        <code className="text-slate-200 dark:text-slate-300 text-sm">{value}</code>
      </pre>
    </div>
  );
} 