'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, LogOut, Settings, User, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { userService } from '@/lib/services/userService';

export function UserMenu() {
  const { user, signOut, isLoading } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowSignOutDialog(false);
      router.push('/');
      toast({
        title: 'Signed out successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    
    setIsExporting(true);
    
    try {
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
      
      toast({
        title: 'Data exported successfully',
        description: 'Your data has been downloaded as a JSON file',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!user) {
    return (
      <div className="flex gap-2">
        <Link href="/auth/login">
          <Button variant="outline" size="sm">
            Sign in
          </Button>
        </Link>
        <Link href="/auth/signup">
          <Button size="sm">
            Sign up
          </Button>
        </Link>
      </div>
    );
  }

  // First letter of email or 'U' as fallback
  const initials = user.email ? user.email[0].toUpperCase() : 'U';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={user.email || 'User'} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.email}</p>
              <p className="text-xs leading-none text-muted-foreground">
                Account
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleExportData}
            disabled={isExporting}
            className="cursor-pointer"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                <span>Export data</span>
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowSignOutDialog(true)}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignOutDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSignOut}>
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}