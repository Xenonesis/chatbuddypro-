'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MessageSquare, Settings, MoonIcon, SunIcon, Menu, User, LogOut, LogIn, UserPlus, Bell, LayoutDashboard, Zap, Home, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { SuggestionDrawer } from '@/components/ui-custom/SuggestionDrawer';
import { RealNotifications } from '@/components/ui-custom/RealNotifications';
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


// App config for environment labels
const appConfig = {
  showEnvLabel: false
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
  { href: '/', label: 'Home', icon: <Home className="h-4 w-4" />, showOnHome: false },
  { href: '/chat', label: 'Chat', icon: <MessageSquare className="h-4 w-4" />, showOnHome: true },
  { href: '/conversations', label: 'History', icon: <Search className="h-4 w-4" />, showOnHome: true },
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, showOnHome: true },
  { href: '/settings', label: 'Settings', icon: <Settings className="h-4 w-4" />, showOnHome: true },
];

export function Navbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [showSuggestionsDrawer, setShowSuggestionsDrawer] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();


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



  // Inject modern animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes slideDown {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes scaleIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); }
        50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.6); }
      }
      
      .animate-slide-down {
        animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .animate-fade-in {
        animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .animate-scale-in {
        animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .animate-glow {
        animation: glow 2s ease-in-out infinite;
      }
      
      /* Modern navbar styles */
      .navbar-glass {
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .dark .navbar-glass {
        background: rgba(2, 6, 23, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      /* Enhanced logo animation */
      .logo-container:hover .logo-icon {
        transform: rotate(360deg);
        transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }
      
      /* Navigation link hover effects */
      .nav-link {
        position: relative;
        overflow: hidden;
      }
      .nav-link::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
      }
      .nav-link:hover::before {
        left: 100%;
      }
      
      /* Mobile optimizations */
      @media (max-width: 640px) {
        .navbar-container {
          padding-left: 1rem;
          padding-right: 1rem;
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
        "sticky top-0 z-50 transition-all duration-300 animate-slide-down",
        scrolled
          ? "navbar-glass shadow-lg shadow-black/5 dark:shadow-black/20"
          : "bg-white/95 dark:bg-slate-950/95 border-b border-slate-200/50 dark:border-slate-800/50"
      )}
    >
      <div className="container flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8 navbar-container max-w-7xl mx-auto">
        {/* Enhanced Logo */}
        <div className="flex items-center gap-3 flex-shrink-0 logo-container">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 logo-icon transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/40">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent transition-all duration-300">
                ChatBuddy
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium -mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                AI Assistant
              </span>
            </div>
            {appConfig.showEnvLabel && (
              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                {process.env.NODE_ENV}
              </Badge>
            )}
          </Link>
        </div>

        {/* Enhanced Navigation Links */}
        {user && (
          <nav className="hidden lg:flex items-center justify-center">
            <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm">
              {navLinks
                .filter(link => isHomePage ? link.showOnHome : true)
                .map(({ href, label, icon }) => (
                  <Link key={href} href={href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 nav-link relative",
                        isActiveLink(href)
                          ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-medium"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50"
                      )}
                    >
                      <span className={cn(
                        "transition-colors duration-200",
                        isActiveLink(href) ? "text-blue-600 dark:text-blue-400" : ""
                      )}>
                        {icon}
                      </span>
                      <span className="font-medium">{label}</span>
                      {isActiveLink(href) && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 animate-scale-in" />
                      )}
                    </Button>
                  </Link>
                ))}
            </div>
          </nav>
        )}

        {/* Enhanced Actions Area */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* AI Suggestions - Premium feature */}
          {user && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 text-amber-700 dark:text-amber-400 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-950/30 dark:hover:to-orange-950/30 transition-all duration-200 animate-glow"
                    onClick={handleToggleSuggestions}
                  >
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">AI Boost</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Get AI-powered suggestions and insights</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Notifications */}
          {user && mounted && (
            <div className="hidden sm:block">
              <RealNotifications />
            </div>
          )}

          {/* Enhanced Theme Toggle */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="h-10 w-10 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all duration-200 hover:scale-105"
                >
                  {mounted ? (
                    resolvedTheme === 'dark' ? (
                      <SunIcon className="h-5 w-5 text-yellow-500 transition-transform duration-200" />
                    ) : (
                      <MoonIcon className="h-5 w-5 text-slate-600 transition-transform duration-200" />
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

          {/* Enhanced Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-10 w-10 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all duration-200"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 sm:w-96 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-l border-slate-200/50 dark:border-slate-800/50">
              <SheetHeader className="pb-6 border-b border-slate-200/50 dark:border-slate-800/50">
                <SheetTitle className="flex items-center gap-3 text-lg">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-bold">
                    ChatBuddy
                  </span>
                </SheetTitle>
              </SheetHeader>

              <div className="py-6 space-y-6">
                {/* Mobile Navigation */}
                {user && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1 uppercase tracking-wider">Navigation</h3>
                    <div className="space-y-1">
                      {navLinks
                        .filter(link => isHomePage ? link.showOnHome : true)
                        .map(({ href, label, icon }) => (
                          <Link
                            key={href}
                            href={href}
                            className="w-full block"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Button
                              variant="ghost"
                              size="lg"
                              className={cn(
                                "w-full justify-start h-14 rounded-xl transition-all duration-200",
                                isActiveLink(href)
                                  ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50"
                                  : "hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                              )}
                            >
                              <span className={cn(
                                "mr-4 p-2 rounded-lg transition-colors",
                                isActiveLink(href)
                                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              )}>
                                {icon}
                              </span>
                              <span className="font-medium">{label}</span>
                              {isActiveLink(href) && (
                                <Badge variant="secondary" className="ml-auto text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 border-0">
                                  Active
                                </Badge>
                              )}
                            </Button>
                          </Link>
                        ))}
                    </div>
                  </div>
                )}

                {/* Mobile Features */}
                {user && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1 uppercase tracking-wider">Features</h3>
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        size="lg"
                        className="w-full justify-start h-14 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-950/30 dark:hover:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/30"
                        onClick={() => {
                          handleToggleSuggestions();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <span className="mr-4 p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                          <Zap className="h-4 w-4" />
                        </span>
                        <span className="font-medium text-amber-700 dark:text-amber-400">AI Boost</span>
                      </Button>

                      <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant="ghost"
                          size="lg"
                          className="w-full justify-start h-14 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                        >
                          <span className="mr-4 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            <Bell className="h-4 w-4" />
                          </span>
                          <span className="font-medium">Notifications</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Mobile Theme Toggle */}
                {mounted && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1 uppercase tracking-wider">Preferences</h3>
                    <div className="flex items-center justify-between px-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 min-h-[64px]">
                      <div className="flex items-center flex-1">
                        <span className="mr-4 p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                          {resolvedTheme === 'dark' ? (
                            <MoonIcon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                          ) : (
                            <SunIcon className="h-4 w-4 text-yellow-500" />
                          )}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            Dark Mode
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {resolvedTheme === 'dark' ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                      <Switch
                        checked={resolvedTheme === 'dark'}
                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                        className="ml-3 flex-shrink-0"
                      />
                    </div>
                  </div>
                )}

                {/* Enhanced Auth Section */}
                <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50 space-y-3">
                  {user ? (
                    <>
                      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1 uppercase tracking-wider">Account</h3>
                      <div className="flex items-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/30">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg mr-4">
                          <User className="h-6 w-6" />
                        </div>
                        <div className="text-sm overflow-hidden flex-1">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.email || 'User'}</div>
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Premium Member</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="lg"
                        className="w-full justify-start text-red-600 dark:text-red-400 h-14 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={() => {
                          signOut();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <span className="mr-4 p-2 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
                          <LogOut className="h-4 w-4" />
                        </span>
                        <span className="font-medium">Sign Out</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1 uppercase tracking-wider">Get Started</h3>
                      <div className="space-y-3">
                        <Link href="/auth/login" className="w-full block" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="default" size="lg" className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                            <LogIn className="h-5 w-5 mr-3" />
                            <span className="font-semibold">Sign In</span>
                          </Button>
                        </Link>
                        <Link href="/auth/signup" className="w-full block" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" size="lg" className="w-full h-14 rounded-xl border-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <UserPlus className="h-5 w-5 mr-3" />
                            <span className="font-semibold">Create Account</span>
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Enhanced Desktop Auth Buttons */}
          {!user && (
            <div className="hidden lg:flex items-center gap-3 ml-4">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-4 py-2 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all duration-200"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  <span className="font-medium">Sign In</span>
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  size="sm"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Enhanced User Menu */}
          {user && (
            <div className="hidden lg:block ml-3">
              <UserMenu />
            </div>
          )}
        </div>
      </div>

      {/* Add the SuggestionDrawer component */}
      {user && mounted && <SuggestionDrawer open={showSuggestionsDrawer} onOpenChange={setShowSuggestionsDrawer} />}
    </header>
  );
} 