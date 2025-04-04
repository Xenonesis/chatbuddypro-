'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MessageSquare, Settings, MoonIcon, SunIcon, Sparkles, Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { BrandLogo } from "@/components/ui-custom/BrandLogo";
import { SuggestionDrawer } from '@/components/ui-custom/SuggestionDrawer';
import { usePathname } from 'next/navigation';

// Throttle function to optimize scroll event handler
function throttle<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

export function Navbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  
  // Handle scroll effect for navbar with throttle for performance
  useEffect(() => {
    const handleScroll = throttle(() => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    }, 100); // 100ms throttle
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when changing routes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Fix for hydration mismatch - wait for client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  return (
    <>
      <nav 
        className={`sticky top-0 z-20 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 text-white backdrop-blur-sm transition-all duration-300 ${
          scrolled ? 'shadow-lg shadow-slate-900/20 py-1.5' : 'py-2.5'
        }`}
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex justify-between items-center">
            {/* Logo and brand */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link href="/" className="flex items-center group" aria-label="ChatBuddy Home">
                <div className="relative overflow-hidden rounded-full transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-blue-500/20">
                  <div className="animate-pulse-subtle">
                    <BrandLogo size="sm" />
                  </div>
                </div>
                <span className="font-bold ml-2 text-white group-hover:text-blue-300 transition-colors duration-300">ChatBuddy</span>
              </Link>
              <span className="text-xs py-0.5 px-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full shadow-sm">Multi-Model</span>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-slate-700/70 hover:text-blue-300 transition-all duration-200 flex items-center gap-2"
                aria-label="Smart Suggestions"
                onClick={() => setShowSuggestions(true)}
              >
                <Sparkles className="h-4 w-4" />
                <span>Suggestions</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-slate-700/70 hover:text-blue-300 transition-all duration-200"
                onClick={toggleTheme}
                aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                suppressHydrationWarning
              >
                {mounted ? (
                  <>
                    {resolvedTheme === 'dark' ? (
                      <SunIcon className="h-5 w-5" />
                    ) : (
                      <MoonIcon className="h-5 w-5" />
                    )}
                  </>
                ) : (
                  // Render an empty box with same dimensions to prevent layout shift
                  <div className="h-5 w-5" />
                )}
              </Button>
              
              <Link href="/settings">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-slate-700/70 hover:text-blue-300 transition-all duration-200 flex items-center gap-2"
                  aria-label="Settings"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Button>
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex md:hidden items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-slate-700/70 hover:text-blue-300 transition-all duration-200"
                aria-label="Smart Suggestions"
                onClick={() => setShowSuggestions(true)}
              >
                <Sparkles className="h-5 w-5" />
              </Button>
            
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-slate-700/70 transition-all duration-200"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Mobile menu - improved animation */}
          <div 
            className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
              mobileMenuOpen ? 'max-h-56 opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}
            aria-hidden="false"
            role="navigation"
          >
            <div className="flex flex-col space-y-2 pt-2 pb-3 border-t border-slate-700/70">
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full justify-start text-white hover:bg-slate-700/70 hover:text-blue-300 transition-all duration-200"
                onClick={toggleTheme}
                aria-label={`Toggle to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
                suppressHydrationWarning
              >
                {mounted ? (
                  <>
                    {resolvedTheme === 'dark' ? (
                      <SunIcon className="h-4 w-4 mr-2" />
                    ) : (
                      <MoonIcon className="h-4 w-4 mr-2" />
                    )}
                    <span>Toggle theme</span>
                  </>
                ) : (
                  <div className="h-4 w-4 mr-2" />
                )}
              </Button>
              
              <Link href="/settings" className="w-full">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-full justify-start text-white hover:bg-slate-700/70 hover:text-blue-300 transition-all duration-200"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Settings</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Suggestions Drawer */}
      <SuggestionDrawer 
        isOpen={showSuggestions} 
        onClose={() => setShowSuggestions(false)} 
      />
    </>
  );
} 