'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Settings, MoonIcon, SunIcon, Sparkles, Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { BrandLogo } from "@/components/ui-custom/BrandLogo";
import { SuggestionDrawer } from '@/components/ui-custom/SuggestionDrawer';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  
  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
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
  
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <nav 
        className={`sticky top-0 z-20 bg-slate-800 border-b border-slate-700 text-white transition-shadow duration-300 ${
          scrolled ? 'shadow-md' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex justify-between items-center">
            {/* Logo and brand */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link href="/" className="flex items-center group">
                <div className="relative overflow-hidden rounded-full transition-transform group-hover:scale-110 duration-300">
                  <BrandLogo size="sm" />
                </div>
                <span className="font-bold ml-2 text-white group-hover:text-blue-300 transition-colors duration-300">ChatBuddy</span>
              </Link>
              <span className="text-xs py-0.5 px-2 bg-blue-600 text-white rounded-full">Multi-Model</span>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-blue-300 transition-colors flex items-center gap-2"
                aria-label="Smart Suggestions"
                onClick={() => setShowSuggestions(true)}
              >
                <Sparkles className="h-4 w-4" />
                <span>Suggestions</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-slate-700 hover:text-blue-300 transition-colors"
                onClick={toggleTheme}
                suppressHydrationWarning
              >
                {mounted ? (
                  <>
                    {resolvedTheme === 'dark' ? (
                      <>
                        <SunIcon className="h-5 w-5" />
                        <span className="sr-only">Switch to light mode</span>
                      </>
                    ) : (
                      <>
                        <MoonIcon className="h-5 w-5" />
                        <span className="sr-only">Switch to dark mode</span>
                      </>
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
                  className="text-white hover:bg-slate-700 hover:text-blue-300 transition-colors flex items-center gap-2"
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
                className="text-white hover:bg-slate-700 hover:text-blue-300 transition-colors"
                aria-label="Smart Suggestions"
                onClick={() => setShowSuggestions(true)}
              >
                <Sparkles className="h-5 w-5" />
              </Button>
            
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-slate-700 transition-colors"
                aria-label="Toggle mobile menu"
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
          
          {/* Mobile menu */}
          <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            mobileMenuOpen ? 'max-h-56 opacity-100 mt-2' : 'max-h-0 opacity-0'
          }`}>
            <div className="flex flex-col space-y-2 pt-2 pb-3 border-t border-slate-700">
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full justify-start text-white hover:bg-slate-700 hover:text-blue-300 transition-colors"
                onClick={toggleTheme}
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
                  className="w-full justify-start text-white hover:bg-slate-700 hover:text-blue-300 transition-colors"
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