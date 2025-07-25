'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { MessageSquare, Settings, MoonIcon, SunIcon, Sparkles, Menu, X, User, LogOut, LogIn, UserPlus, Bell, Calendar, CheckCircle, AlertCircle, LayoutDashboard, Shield, Home, ChevronDown } from 'lucide-react';
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
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// App config for environment labels
const appConfig = {
  showEnvLabel: false
};

// Recent updates data
const recentUpdates = [
  {
    id: 1,
    date: new Date(2023, 7, 1), // August 1, 2023
    title: "Improved Authentication Flow",
    description: "Enhanced security with better token management and session persistence.",
    type: "security"
  },
  {
    id: 2,
    date: new Date(2023, 8, 15), // September 15, 2023
    title: "Added Support for Claude 3",
    description: "Now you can chat with Anthropic's Claude 3 models directly from ChatBuddy.",
    type: "feature"
  },
  {
    id: 3,
    date: new Date(2023, 9, 5), // October 5, 2023
    title: "UI Redesign",
    description: "Refreshed user interface with improved dark mode and accessibility.",
    type: "design"
  },
  {
    id: 4,
    date: new Date(2023, 10, 20), // November 20, 2023
    title: "Chat History Enhancements",
    description: "Better organization and search for your conversation history.",
    type: "feature"
  },
  {
    id: 5,
    date: new Date(), // Today
    title: "Bug Fixes and Performance Improvements",
    description: "Fixed database connection issues and improved overall app responsiveness.",
    type: "bugfix"
  }
];

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
  const [hasNewNotification, setHasNewNotification] = useState(true);
  const [showNewFeature, setShowNewFeature] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const pathname = usePathname();
  const notificationsRef = useRef<HTMLDivElement>(null);
  
  // Check if we're on the home page
  const isHomePage = pathname === '/';

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
  
  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
      
      /* Mobile optimizations */
      @media (max-width: 640px) {
        .navbar-logo-text {
          font-size: 1rem;
          font-weight: 700;
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
      
      /* Prevent horizontal scroll on mobile */
      @media (max-width: 768px) {
        body {
          overflow-x: hidden;
        }
        
        /* Ensure buttons don't overflow */
        .mobile-auth-buttons {
          min-width: 0;
          flex-shrink: 1;
        }
        
        /* Better touch targets */
        .mobile-nav-item {
          min-height: 44px;
          min-width: 44px;
        }
      }
      
      /* Improve text readability on small screens */
      @media (max-width: 480px) {
        .hero-title {
          font-size: 1.75rem;
          line-height: 1.2;
        }
        
        .hero-subtitle {
          font-size: 1.125rem;
          line-height: 1.3;
        }
        
        .hero-description {
          font-size: 0.95rem;
          line-height: 1.5;
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
    setNotificationsRead(true);
    setShowNotifications(!showNotifications);
  };

  const handleToggleSuggestions = () => {
    setShowSuggestionsDrawer(!showSuggestionsDrawer);
  };

  const isActiveLink = (path: string) => {
    if (path === '/chat' && pathname === '/') return true;
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'feature':
        return <Sparkles className="h-4 w-4 text-amber-500" />;
      case 'design':
        return <LayoutDashboard className="h-4 w-4 text-purple-500" />;
      case 'bugfix':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
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
      <div className="container flex items-center justify-between h-16 px-3 sm:px-4 lg:px-8 navbar-container max-w-7xl mx-auto">
        {/* Logo and app title */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <Link href="/" className="flex items-center gap-1 sm:gap-1.5 font-bold text-base sm:text-lg text-slate-900 dark:text-white transition-transform hover:scale-105">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md navbar-icon">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="transition-colors navbar-logo-text">ChatBuddy</span>
            {appConfig.showEnvLabel && (
              <span className="text-[10px] sm:text-xs font-normal px-1 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                {process.env.NODE_ENV}
              </span>
            )}
          </Link>
        </div>

        {/* Nav Links - Only visible when logged in on desktop */}
        {user && !isHomePage && (
          <div className="hidden lg:flex items-center justify-center">
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
        )}

        {/* Actions area */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Suggestions button - Only when logged in on desktop */}
          {user && !isHomePage && settings.suggestionsSettings.enabled && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden lg:flex items-center"
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

          {/* Notifications Dropdown - Only when logged in on desktop */}
          {user && !isHomePage && mounted && (
            <div ref={notificationsRef} className="hidden sm:block">
              <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9"
                    onClick={handleNotificationClick}
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {hasNewNotification && !notificationsRead && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center animate-pulse-slow"
                      />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                  <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Recent Updates</span>
                    <Badge variant="outline" className="ml-auto">
                      {recentUpdates.length}
                    </Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-[300px] overflow-y-auto">
                    <DropdownMenuGroup>
                      {recentUpdates.map((update) => (
                        <DropdownMenuItem key={update.id} className="flex flex-col items-start p-3 cursor-default">
                          <div className="flex w-full">
                            <div className="mr-2 mt-0.5">
                              {getNotificationIcon(update.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{update.title}</div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                {update.description}
                              </p>
                              <div className="flex items-center text-xs text-gray-400 mt-1.5">
                                <Calendar className="h-3 w-3 mr-1" />
                                {format(update.date, 'MMM d, yyyy')}
                              </div>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="justify-center text-xs text-muted-foreground"
                    onClick={() => setHasNewNotification(false)}
                  >
                    Mark all as read
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Theme toggle - Always visible */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleTheme} 
                  aria-label="Toggle theme"
                  className="transition-transform hover:scale-110 h-9 w-9"
                >
                  {mounted ? (
                    resolvedTheme === 'dark' ? (
                      <SunIcon className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <MoonIcon className="h-5 w-5 text-slate-700" />
                    )
                  ) : (
                    <div className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Switch to {resolvedTheme === 'dark' ? 'light' : 'dark'} mode</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Mobile hamburger menu - Always visible on mobile when user is logged in OR for unauthenticated users */}
          {((user && !isHomePage) || !user) && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 sm:w-80">
                <SheetHeader className="pb-4 border-b">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                      <MessageSquare className="h-3 w-3" />
                    </div>
                    ChatBuddy Menu
                  </SheetTitle>
                </SheetHeader>
                
                <div className="py-6 space-y-4">
                  {/* Mobile Nav Links - Only when logged in */}
                  {user && !isHomePage && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-2">Navigation</h3>
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
                              "w-full justify-start h-12",
                              isActiveLink(href) && "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20"
                            )}
                          >
                            <span className="mr-3">{icon}</span>
                            {label}
                            {isActiveLink(href) && (
                              <Badge variant="outline" className="ml-auto text-xs bg-primary/20 border-primary/30">
                                Current
                              </Badge>
                            )}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {/* Mobile Suggestions - Only when logged in */}
                  {user && !isHomePage && settings.suggestionsSettings.enabled && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-2">Features</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-12"
                        onClick={() => {
                          handleToggleSuggestions();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Sparkles className="h-4 w-4 mr-3 text-amber-500" /> AI Suggestions
                      </Button>
                    </div>
                  )}

                  {/* Mobile Notifications - Only when logged in */}
                  {user && !isHomePage && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-2">Updates</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-12 relative"
                        onClick={() => {
                          handleNotificationClick();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Bell className="h-4 w-4 mr-3" />
                        Recent Updates
                        {hasNewNotification && !notificationsRead && (
                          <Badge 
                            variant="destructive" 
                            className="ml-auto h-2 w-2 p-0 animate-pulse-slow"
                          />
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {/* Mobile Theme Toggle */}
                  {mounted && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-2">Preferences</h3>
                      <div className="flex items-center justify-between px-3 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <span className="text-sm flex items-center font-medium">
                          <MoonIcon className="h-4 w-4 mr-3" /> Dark Mode
                        </span>
                        <Switch 
                          checked={resolvedTheme === 'dark'} 
                          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
                        />
                      </div>
                    </div>
                  )}

                  {/* Auth section in mobile menu */}
                  <div className="pt-4 border-t space-y-2">
                    {user ? (
                      <>
                        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-2">Account</h3>
                        <div className="flex items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 mr-3">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="text-sm overflow-hidden flex-1">
                            <div className="font-medium truncate">{user?.email || 'User'}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Signed in</div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-red-600 dark:text-red-400 h-12"
                          onClick={() => {
                            signOut();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-3" /> Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-2">Get Started</h3>
                        <div className="space-y-3">
                          <Link href="/auth/login" className="w-full block" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="default" size="sm" className="w-full h-12">
                              <LogIn className="h-4 w-4 mr-3" /> Sign In
                            </Button>
                          </Link>
                          <Link href="/auth/signup" className="w-full block" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="outline" size="sm" className="w-full h-12">
                              <UserPlus className="h-4 w-4 mr-3" /> Create Account
                            </Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
          
          {/* Desktop auth buttons - Only when not logged in */}
          {!user && (
            <div className="hidden sm:flex items-center gap-2 ml-2">
              <Link href="/auth/login">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="inline-flex items-center transition-all duration-200 hover:shadow-md"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="transition-all duration-200 hover:bg-primary/10 hover:border-primary"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          {/* User menu - Only when logged in and not on home page */}
          {user && !isHomePage && (
            <div className="hidden sm:block">
              <UserMenu />
            </div>
          )}
        </div>
      </div>
      
      {/* New Feature Banner - Only when logged in */}
      {user && !isHomePage && showNewFeature && mounted && (
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
      
      {/* Add the SuggestionDrawer component - Only when logged in */}
      {user && mounted && <SuggestionDrawer open={showSuggestionsDrawer} onOpenChange={setShowSuggestionsDrawer} />}
    </header>
  );
} 