'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MessageCircle,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Bell,
  Home,
  History,
  BarChart3,
  Sparkles,
  Lock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const navigation = [
  { name: 'Home', href: '/', icon: Home, requiresAuth: false },
  { name: 'Chat', href: '/chat', icon: MessageCircle, requiresAuth: true },
  { name: 'History', href: '/conversations', icon: History, requiresAuth: true },
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3, requiresAuth: true },
  { name: 'Settings', href: '/settings', icon: Settings, requiresAuth: true },
];

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string>('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname?.startsWith(href)) return true;
    return false;
  };

  const handleNavClick = (e: React.MouseEvent, href: string, requiresAuth: boolean) => {
    if (requiresAuth && !user) {
      e.preventDefault();
      setPendingRoute(href);
      setShowLoginDialog(true);
    }
  };

  const handleLoginRedirect = () => {
    setShowLoginDialog(false);
    router.push(`/auth/login?redirect=${encodeURIComponent(pendingRoute)}`);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                ChatBuddy
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isProtected = item.requiresAuth && !user;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href, item.requiresAuth)}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative",
                      isActive(item.href)
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : isProtected
                          ? "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    {isProtected && (
                      <Lock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-9 h-9 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {mounted && (
                  <>
                    {theme === 'dark' ? (
                      <Sun className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Moon className="w-4 h-4 text-gray-600" />
                    )}
                  </>
                )}
              </Button>

              {/* Notifications */}
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-9 h-9 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                >
                  <Bell className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
                </Button>
              )}

              {/* User Menu or Auth Buttons */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-sm">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Free Plan</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/upgrade" className="cursor-pointer">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Upgrade Plan
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 dark:text-red-400"
                      onClick={() => signOut()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm" className="text-sm">
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm" className="text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden w-9 h-9 p-0"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
            <div className="px-4 py-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isProtected = item.requiresAuth && !user;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      handleNavClick(e, item.href, item.requiresAuth);
                      if (!isProtected) setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-colors relative",
                      isActive(item.href)
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : isProtected
                          ? "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                    {isProtected && (
                      <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 ml-auto" />
                    )}
                  </Link>
                );
              })}

              {/* Mobile auth buttons */}
              {!user && (
                <div className="pt-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-base">
                      <LogIn className="w-5 h-5 mr-3" />
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-start text-base bg-gradient-to-r from-blue-600 to-purple-600">
                      <UserPlus className="w-5 h-5 mr-3" />
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile user section */}
              {user && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3 px-3 py-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Free Plan</p>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <Link href="/upgrade" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-base">
                        <Sparkles className="w-5 h-5 mr-3" />
                        Upgrade Plan
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-base text-red-600 dark:text-red-400"
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16"></div>

      {/* Login Required Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              Login Required
            </DialogTitle>
            <DialogDescription className="text-left">
              You need to be logged in to access this feature. Please sign in to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button onClick={handleLoginRedirect} className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In to Continue
            </Button>
            <div className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link
                href="/auth/signup"
                className="text-blue-600 hover:underline font-medium"
                onClick={() => setShowLoginDialog(false)}
              >
                Sign up here
              </Link>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowLoginDialog(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}