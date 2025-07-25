'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Settings, User, Home, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface MobileNavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
}

const navItems: MobileNavItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: <Home className="h-5 w-5" />,
  },
  {
    href: '/chat',
    label: 'Chat',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <User className="h-5 w-5" />,
    requiresAuth: true,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

export function MobileNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Don't show mobile nav on auth pages
  if (pathname?.startsWith('/auth/')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 md:hidden">
      <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
        {navItems.map((item) => {
          // Skip auth-required items if user is not logged in
          if (item.requiresAuth && !user) {
            return null;
          }

          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]',
                isActive
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              )}
            >
              <div className={cn(
                'transition-transform duration-200',
                isActive && 'scale-110'
              )}>
                {item.icon}
              </div>
              <span className="text-xs font-medium mt-1 leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
        
        {/* Quick action button */}
        <Link
          href="/chat"
          className="flex flex-col items-center justify-center px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 min-w-[60px] shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span className="text-xs font-medium mt-1 leading-none">New</span>
        </Link>
      </div>
    </nav>
  );
}

// Hook to add bottom padding when mobile nav is visible
export function useMobileNavPadding() {
  return 'pb-20 md:pb-0'; // 20 = height of mobile nav + safe area
}