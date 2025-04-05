import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider } from '@/components/ui-custom/ThemeProvider';
import { ModelSettingsProvider } from '@/lib/context/ModelSettingsContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Toaster } from "@/components/ui/toaster";
import { EnhancedUIProvider } from '@/lib/context/EnhancedUIContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChatBuddy - Multiple AI Models Chat',
  description: 'Chat with AI models from OpenAI, Google Gemini, Anthropic Claude, Mistral and more. Use your own API keys.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://chatbuddypro.com'),
};

// Preload critical fonts
export const fontSans = GeistSans;
export const fontMono = GeistMono;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://gphdrsfbypnckxbdjjap.supabase.co" />
        <link rel="dns-prefetch" href="https://gphdrsfbypnckxbdjjap.supabase.co" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950`}>
        <ThemeProvider>
          <AuthProvider>
            <ModelSettingsProvider>
              <EnhancedUIProvider>
                <AppInitializer />
                <Navbar />
                <main className="flex-1 flex flex-col">
                  <ErrorBoundary fallback={<ErrorFallback />}>
                    <Suspense fallback={<LoadingIndicator />}>
                      {children}
                    </Suspense>
                  </ErrorBoundary>
                </main>
                <Toaster />
              </EnhancedUIProvider>
            </ModelSettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

// Client-side initialization component
'use client';
import { useEffect } from 'react';
import { dbMigrationService } from '@/lib/services/dbMigrationService';
import { Suspense, ErrorBoundary as ReactErrorBoundary } from 'react';

function AppInitializer() {
  useEffect(() => {
    const runMigrations = async () => {
      try {
        console.log('Checking and running database migrations if needed...');
        await dbMigrationService.migrateUserPreferencesTable();
        await dbMigrationService.migrateExistingApiKeys();
        
        // Clean up duplicate records
        console.log('Checking for duplicate user preference records...');
        await dbMigrationService.cleanupDuplicateUserPreferences();
      } catch (error) {
        console.error('Failed to run migrations:', error);
      }
    };
    
    runMigrations();
  }, []);
  
  return null;
}

// Simple loading indicator component
function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center min-h-[200px] w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

// Error fallback component
function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center p-4 text-center min-h-[300px]">
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-4">We're sorry, but there was an error loading this page.</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

// Custom error boundary component
function ErrorBoundary({ children, fallback }: { children: React.ReactNode, fallback: React.ReactNode }) {
  return (
    <ReactErrorBoundary fallback={fallback}>
      {children}
    </ReactErrorBoundary>
  );
}
