'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs, tomorrow, atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check, Code, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
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
  const [expanded, setExpanded] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  
  const lineCount = code.split('\n').length;
  const isLongCode = lineCount > 15;
  const isVeryLongCode = lineCount > 100 || code.length > 3000;

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
            showLineNumbers={showLineNumbers}
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
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }

  return (
    <div className="relative my-4 font-mono text-sm rounded-lg overflow-hidden border dark:border-slate-700">
      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b dark:border-slate-700">
        <div className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center">
          <Code className="h-3.5 w-3.5 mr-1.5 text-slate-500 dark:text-slate-400" />
          {extractedLanguage || 'plaintext'}
        </div>
        <div className="flex items-center gap-1">
          {shouldShowFullScreen && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              onClick={() => setFullScreen(true)}
              title="View full screen"
            >
              <Maximize2 className="h-4 w-4" />
              <span className="ml-1.5 text-xs font-medium sr-only sm:not-sr-only">Full Screen</span>
            </Button>
          )}
          {shouldShowExpand && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              onClick={() => setExpanded(!expanded)}
              title={expanded ? "Collapse code" : "Expand code"}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span className="ml-1.5 text-xs font-medium sr-only sm:not-sr-only">{expanded ? 'Collapse' : 'Expand'}</span>
            </Button>
          )}
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
            <span className="ml-1.5 text-xs font-medium sr-only sm:not-sr-only">{copied ? 'Copied!' : 'Copy'}</span>
          </Button>
        </div>
      </div>
      <div className="overflow-auto" style={{ maxHeight: codeHeight }}>
        <SyntaxHighlighter
          language={normalizedLanguage}
          style={getThemeStyle()}
          showLineNumbers={showLineNumbers}
          wrapLines={false}
          customStyle={{
            margin: 0,
            padding: '1rem',
            backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
            fontSize: '0.85rem',
            borderRadius: 0,
            overflowX: 'auto',
            tabSize: 2,
          }}
          codeTagProps={{
            style: {
              fontFamily: 'Menlo, Monaco, "Courier New", monospace',
              lineHeight: 1.5,
            }
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
      {isLongCode && !expanded && !fullScreen && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-100 dark:from-slate-800 to-transparent pointer-events-none flex items-end justify-center"
          aria-hidden="true"
        >
          <div className="bg-slate-100/80 dark:bg-slate-800/80 text-xs text-slate-500 dark:text-slate-400 py-1 px-3 rounded-t-md backdrop-blur-sm">
            {lineCount} lines total - {expanded ? 'collapse' : 'expand'} to {expanded ? 'hide' : 'view'} all
          </div>
        </div>
      )}
    </div>
  );
} 