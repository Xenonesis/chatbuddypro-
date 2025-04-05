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
import { AppInitializer } from '@/components/app/AppInitializer';
import { ErrorBoundary, ErrorFallback, LoadingIndicator } from '@/components/app/ErrorComponents';
import { Suspense } from 'react';

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
                  <ErrorBoundary>
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
