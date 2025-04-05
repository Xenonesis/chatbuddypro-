'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MessageSquare, Settings, MoonIcon, SunIcon, Sparkles, Menu, X, User, LogOut, LogIn, UserPlus, Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { BrandLogo } from "@/components/ui-custom/BrandLogo";
import { SuggestionDrawer } from '@/components/ui-custom/SuggestionDrawer';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { UserMenu } from "@/components/ui-custom/UserMenu";
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { useModelSettings } from '@/lib/context/ModelSettingsContext';

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

// Navigation links configuration
const navLinks = [
  { href: '/chat', label: 'Chat', icon: <MessageSquare className="h-4 w-4" /> },
  { href: '/dashboard', label: 'My Chats', icon: <User className="h-4 w-4" /> },
  { href: '/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

export function Navbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { settings, toggleSuggestionsEnabled } = useModelSettings();
  const [showSuggestionsDrawer, setShowSuggestionsDrawer] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  // New states for notifications and animation
  const [hasNewNotification, setHasNewNotification] = useState(true);
  const [showNewFeature, setShowNewFeature] = useState(true);
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
  
  // Inject animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
      @keyframes slideDown {
        from { transform: translateY(-100%); }
        to { transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .animate-pulse-slow {
        animation: pulse 2s infinite ease-in-out;
      }
      .animate-slide-down {
        animation: slideDown 0.3s ease-out forwards;
      }
      .animate-fade-in {
        animation: fadeIn 0.3s ease-out forwards;
      }
      
      /* Optimize for mobile */
      @media (max-width: 640px) {
        .navbar-logo-text {
          font-size: 1rem;
        }
        .navbar-icon {
          width: 2rem;
          height: 2rem;
        }
        .navbar-container {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  const handleNotificationClick = () => {
    setHasNewNotification(false);
    setShowNewFeature(!showNewFeature);
  };

  const handleToggleSuggestions = () => {
    setShowSuggestionsDrawer(!showSuggestionsDrawer);
  };

  const isActiveLink = (path: string) => {
    if (path === '/chat' && pathname === '/') return true;
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-40 border-b transition-all duration-200 animate-slide-down",
        scrolled 
          ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-sm border-slate-200/80 dark:border-slate-800/80" 
          : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
      )}
    >
      <div className="container flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 navbar-container">
        {/* Logo and app title */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <Link href="/" className="flex items-center gap-1 sm:gap-1.5 font-bold text-lg text-slate-900 dark:text-white transition-transform hover:scale-105">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md navbar-icon">
              <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <span className="transition-colors navbar-logo-text">ChatBuddy</span>
            {appConfig.showEnvLabel && (
              <span className="text-[10px] sm:text-xs font-normal px-1 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                {process.env.NODE_ENV}
              </span>
            )}
          </Link>
        </div>

        {/* Nav Links - Only visible on md and larger screens */}
        <div className="hidden md:flex items-center justify-center">
          <div className="flex items-center gap-1">
            {navLinks.map(({ href, label, icon }) => (
              <Link key={href} href={href}>
                <Button 
                  variant={isActiveLink(href) ? "default" : "ghost"} 
                  size="sm" 
                  className={cn(
                    "flex items-center gap-1.5 transition-all relative",
                    isActiveLink(href) 
                      ? "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20" 
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {icon}
                  <span>{label}</span>
                  {isActiveLink(href) && (
                    <div className="absolute -bottom-[13px] left-0 right-0 mx-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Actions area */}
        <div className="flex items-center gap-0 xs:gap-1 sm:gap-2 flex-shrink-0">
          {/* Suggestions button - Now using settings from context */}
          {settings.suggestionsSettings.enabled && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex items-center"
                    onClick={handleToggleSuggestions}
                  >
                    <Sparkles className="h-4 w-4 mr-1.5 text-amber-500" /> Suggestions
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Get AI-powered suggestions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* New Feature Notification */}
          {mounted && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-8 w-8 sm:h-9 sm:w-9"
                    onClick={handleNotificationClick}
                  >
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                    {hasNewNotification && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 p-0 flex items-center justify-center animate-pulse-slow"
                      />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Theme toggle - Only render dynamic content after mounting to prevent hydration mismatch */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleTheme} 
                  aria-label="Toggle theme"
                  className="transition-transform hover:scale-110 h-8 w-8 sm:h-9 sm:w-9"
                >
                  {mounted ? (
                    resolvedTheme === 'dark' ? (
                      <SunIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                    ) : (
                      <MoonIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700" />
                    )
                  ) : (
                    <div className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Switch to {resolvedTheme === 'dark' ? 'light' : 'dark'} mode</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Mobile menu for smaller screens */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="sm:hidden h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 sm:w-72">
              <SheetHeader className="pb-4 border-b">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              
              <div className="py-4 space-y-3">
                {/* Mobile Nav Links */}
                {navLinks.map(({ href, label, icon }) => (
                  <Link 
                    key={href} 
                    href={href} 
                    className="w-full block" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button 
                      variant={isActiveLink(href) ? "default" : "ghost"} 
                      size="sm" 
                      className={cn(
                        "w-full justify-start",
                        isActiveLink(href) && "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20"
                      )}
                    >
                      <span className="mr-1.5">{icon}</span>
                      {label}
                      {isActiveLink(href) && (
                        <Badge variant="outline" className="ml-auto text-xs bg-primary/20 border-primary/30">
                          Current
                        </Badge>
                      )}
                    </Button>
                  </Link>
                ))}
                
                {/* Mobile Suggestions */}
                {settings.suggestionsSettings.enabled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      handleToggleSuggestions();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Sparkles className="h-4 w-4 mr-1.5 text-amber-500" /> Suggestions
                  </Button>
                )}
                
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
      
      {/* New Feature Banner - Conditionally rendered */}
      {showNewFeature && mounted && (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 text-center text-sm font-medium animate-fade-in">
          New feature available: Try our improved AI model selection! 
          <Button 
            variant="link" 
            size="sm" 
            className="text-white underline ml-2"
            onClick={() => setShowNewFeature(false)}
          >
            Dismiss
          </Button>
        </div>
      )}
      
      {/* Add the SuggestionDrawer component */}
      {mounted && <SuggestionDrawer open={showSuggestionsDrawer} onOpenChange={setShowSuggestionsDrawer} />}
    </header>
  );
} 