'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Settings, UserPlus, LogIn, Download, Loader2, Bug } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePathname } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { userService } from '@/lib/services/userService';
import { testSupabaseConnection } from '@/lib/utils';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const pathname = usePathname();
  const { toast } = useToast();
  
  // Ensure hydration
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.email) return '?';
    
    // Use first character of email or first two characters if no @ is found
    const emailParts = user.email.split('@');
    if (emailParts.length > 1 && emailParts[0].length > 0) {
      return emailParts[0].substring(0, 1).toUpperCase();
    }
    
    return user.email.substring(0, 1).toUpperCase();
  };
  
  // Get avatar background color based on user email (consistent for the same user)
  const getAvatarColor = () => {
    if (!user?.email) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    
    // Simple hash function for email to get a consistent color
    const hash = Array.from(user.email).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
      'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100'
    ];
    
    return colors[hash % colors.length];
  };
  
  // Handle sign out action
  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  // Handle export data action
  const handleExportData = async () => {
    if (!user) return;
    
    setIsExporting(true);
    setIsOpen(false);
    setDebugInfo('');
    
    try {
      // First test the connection
      if (isDebugMode) {
        setDebugInfo('Testing Supabase connection...');
        const connectionTest = await testSupabaseConnection();
        setDebugInfo(prev => prev + `\nConnection test: ${connectionTest.success ? 'SUCCESS' : 'FAILED'}`);
        if (connectionTest.latency) setDebugInfo(prev => prev + `\nLatency: ${connectionTest.latency}ms`);
        if (connectionTest.error) setDebugInfo(prev => prev + `\nError: ${connectionTest.error}`);
      }
      
      // Proceed with export
      const exportData = await userService.exportUserData(user.id);
      
      // Create and download the file
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chatbuddy-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      if (isDebugMode) {
        setDebugInfo(prev => prev + '\nExport successful! Data downloaded.');
        // Show full debug info toast
        toast({
          title: 'Debug Info',
          description: debugInfo,
          duration: 10000,
        });
      } else {
        toast({
          title: 'Data exported successfully',
          description: 'Your data has been downloaded as a JSON file',
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      setDebugInfo(prev => prev + `\nEXPORT ERROR: ${errorMessage}`);
      
      if (isDebugMode) {
        // Show technical error in debug mode
        toast({
          title: 'Export Failed (Debug)',
          description: (
            <div className="mt-2 max-h-[200px] overflow-auto rounded bg-slate-950 p-4 text-xs text-white">
              <p className="font-bold text-red-400">Error Details:</p>
              <pre className="mt-1 whitespace-pre-wrap">{errorMessage}</pre>
              <p className="mt-2 font-bold text-amber-400">Debug Info:</p>
              <pre className="mt-1 whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          ),
          variant: 'destructive',
          duration: 10000,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to export data. Try enabling debug mode for details.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Toggle debug mode
  const toggleDebugMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDebugMode(!isDebugMode);
    
    toast({
      title: `Debug Mode ${!isDebugMode ? 'Enabled' : 'Disabled'}`,
      description: !isDebugMode 
        ? 'Export will now show detailed debug information' 
        : 'Export will show standard notifications',
    });
  };
  
  if (!mounted) {
    return null; // Prevent hydration issues
  }
  
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/login">
          <Button 
            variant="default" 
            size="sm" 
            className="hidden sm:inline-flex items-center transition-all duration-200 hover:shadow-md"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        </Link>
        <Link href="/auth/signup" className="hidden sm:block">
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
    );
  }
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative h-8 w-8 rounded-full transition-transform hover:scale-110 focus:scale-110"
              >
                <Avatar className={cn(
                  "h-8 w-8 border-2 transition-all duration-200",
                  isOpen 
                    ? "border-primary dark:border-primary" 
                    : "border-white dark:border-slate-800"
                )}>
                  <AvatarImage src="" alt={user.email || 'User'} />
                  <AvatarFallback className={cn(
                    "transition-colors",
                    getAvatarColor()
                  )}>
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Account menu</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl" sideOffset={8}>
        <div className="flex items-center justify-start gap-2 p-2 mb-1 rounded-lg bg-slate-50 dark:bg-slate-900">
          <div className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full",
            getAvatarColor()
          )}>
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-medium truncate max-w-[150px]">{user.email}</p>
            <p className="text-xs text-muted-foreground">Signed in</p>
          </div>
        </div>
        
        <div className="py-1">
          <Link href="/settings" onClick={() => setIsOpen(false)}>
            <DropdownMenuItem className="cursor-pointer rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 mb-0.5 py-2">
              <Settings className="mr-2 h-4 w-4 text-slate-500" />
              <span>Settings</span>
              {pathname === '/settings' && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"></div>
              )}
            </DropdownMenuItem>
          </Link>
          
          <DropdownMenuItem 
            onClick={handleExportData}
            disabled={isExporting}
            className="cursor-pointer rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 py-2 relative"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 text-green-500 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4 text-green-500" />
                <span>Export Data</span>
              </>
            )}
            
            {/* Debug mode toggle */}
            <button 
              onClick={toggleDebugMode}
              aria-label="Toggle debug mode"
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center", 
                isDebugMode ? "text-amber-500" : "text-gray-400 opacity-50"
              )}
            >
              <Bug className="h-3 w-3" />
            </button>
          </DropdownMenuItem>
          
        </div>
        
        <DropdownMenuSeparator className="my-1" />
        
        <DropdownMenuItem 
          onClick={handleSignOut} 
          className="cursor-pointer rounded-lg transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 py-2 mt-1"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 