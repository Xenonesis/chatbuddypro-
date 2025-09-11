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
import { PWAInitializer } from '@/components/app/PWAInitializer';


import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'ChatBuddy - Multiple AI Models Chat',
  description: 'Chat with AI models from OpenAI, Google Gemini, Anthropic Claude, Mistral and more. Use your own API keys.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://chatbuddypro.com'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.png', sizes: '192x192' },
      { url: '/icon-512.png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ChatBuddy',
  },
  applicationName: 'ChatBuddy',
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'ChatBuddy',
    title: 'ChatBuddy - Multiple AI Models Chat',
    description: 'Chat with AI models from OpenAI, Google Gemini, Anthropic Claude, Mistral and more.',
    images: [{ url: '/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChatBuddy - Multiple AI Models Chat',
    description: 'Chat with AI models from OpenAI, Google Gemini, Anthropic Claude, Mistral and more.',
    images: [{ url: '/og-image.png' }],
  },
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
      <body 
        className={`${GeistSans.variable} ${GeistMono.variable} min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 overflow-x-hidden`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <ThemeProvider>
            <ErrorBoundary>
              <AuthProvider>
                <ErrorBoundary>
                  <ModelSettingsProvider>
                    <ErrorBoundary>
                      <EnhancedUIProvider>
                        <ErrorBoundary>
                          <AppInitializer />
                          <PWAInitializer />
                        </ErrorBoundary>
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
                    </ErrorBoundary>
                  </ModelSettingsProvider>
                </ErrorBoundary>
              </AuthProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
