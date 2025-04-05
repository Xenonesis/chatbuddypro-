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
import { dbMigrationService } from '@/lib/services/dbMigrationService';

export const metadata: Metadata = {
  title: 'ChatBuddy - Multiple AI Models Chat',
  description: 'Chat with AI models from OpenAI, Google Gemini, Anthropic Claude, Mistral and more. Use your own API keys.',
};

// Run migrations on app initialization
if (typeof window !== 'undefined') {
  // Only run in browser environment
  (async () => {
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
  })();
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950`}>
        <ThemeProvider>
          <AuthProvider>
            <ModelSettingsProvider>
              <EnhancedUIProvider>
                <Navbar />
                <main className="flex-1 flex flex-col">
                  {children}
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
