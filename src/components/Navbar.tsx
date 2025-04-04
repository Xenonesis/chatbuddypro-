'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MessageSquare, Settings, MoonIcon, SunIcon, Sparkles, Menu, X, Shield, User, LogOut, LogIn, UserPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { BrandLogo } from "@/components/ui-custom/BrandLogo";
import { SuggestionDrawer } from '@/components/ui-custom/SuggestionDrawer';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { UserMenu } from "@/components/ui-custom/UserMenu";
import { useAuth } from '@/contexts/AuthContext';

// App config for environment labels
const appConfig = {
  showEnvLabel: process.env.NODE_ENV === 'development'
};

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
  const { user, signOut } = useAuth();
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
    <header className="sticky top-0 z-40 bg-white/75 dark:bg-slate-950/75 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="container flex items-center justify-between h-16 px-4">
        {/* Logo and app title */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1 font-bold text-lg text-slate-900 dark:text-white">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white">
              <MessageSquare className="h-4 w-4" />
            </div>
            ChatBuddy
            {appConfig.showEnvLabel && (
              <span className="text-xs font-normal px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                {process.env.NODE_ENV}
              </span>
            )}
          </Link>
        </div>

        {/* Actions area */}
        <div className="flex items-center gap-2">
          {/* Suggestions button */}
          {showSuggestions && (
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex items-center"
              onClick={() => setShowSuggestions(!showSuggestions)}
            >
              <Sparkles className="h-4 w-4 mr-1.5 text-amber-500" /> Suggestions
            </Button>
          )}

          {/* Admin link for logged in users */}
          {user && (
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="hidden sm:flex items-center">
                <Shield className="h-4 w-4 mr-1.5 text-orange-500" /> Admin
              </Button>
            </Link>
          )}

          {/* Settings button */}
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="hidden sm:flex items-center">
              <Settings className="h-4 w-4 mr-1.5" /> Settings
            </Button>
          </Link>

          {/* Theme toggle - Only render dynamic content after mounting to prevent hydration mismatch */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {mounted ? (
              resolvedTheme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )
            ) : (
              <div className="h-5 w-5" />
            )}
          </Button>

          {/* Mobile menu for smaller screens */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="sm:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 sm:w-72">
              <SheetHeader className="pb-4 border-b">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              
              <div className="py-4 space-y-3">
                {/* Mobile Suggestions */}
                {showSuggestions && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      setShowSuggestions(!showSuggestions);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Sparkles className="h-4 w-4 mr-1.5 text-amber-500" /> Suggestions
                  </Button>
                )}
                
                {/* Mobile Admin link for logged in users */}
                {user && (
                  <Link href="/admin" className="w-full block" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-1.5 text-orange-500" /> Admin
                    </Button>
                  </Link>
                )}
                
                {/* Mobile Settings */}
                <Link href="/settings" className="w-full block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-1.5" /> Settings
                  </Button>
                </Link>
                
                {/* Mobile Theme Toggle - Only use Switch after mounted */}
                {mounted && (
                  <div className="flex items-center justify-between px-1 py-1.5">
                    <span className="text-sm flex items-center">
                      <MoonIcon className="h-4 w-4 mr-1.5" /> Dark Mode
                    </span>
                    <Switch 
                      checked={resolvedTheme === 'dark'} 
                      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
                    />
                  </div>
                )}
              </div>

              {/* Auth section in mobile menu */}
              <div className="pt-4 border-t">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 mr-2">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="text-sm overflow-hidden">
                        <div className="font-medium truncate">{user.email}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Signed in</div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-red-600 dark:text-red-400"
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-1.5" /> Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/auth/login" className="w-full block" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="default" size="sm" className="w-full">
                        <LogIn className="h-4 w-4 mr-1.5" /> Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup" className="w-full block" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        <UserPlus className="h-4 w-4 mr-1.5" /> Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
          
          {/* User menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
} 