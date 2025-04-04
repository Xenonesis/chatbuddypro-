import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider } from '@/components/ui-custom/ThemeProvider';
import { ModelSettingsProvider } from '@/lib/context/ModelSettingsContext';
import { Navbar } from '@/components/Navbar';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';

export const metadata: Metadata = {
  title: 'ChatBuddy - Multiple AI Models Chat',
  description: 'Chat with AI models from OpenAI, Google Gemini, Anthropic Claude, Mistral and more. Use your own API keys.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950`}>
        <ThemeProvider>
          <ModelSettingsProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            <Toaster />
          </ModelSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
