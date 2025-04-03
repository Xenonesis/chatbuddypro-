import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { metadata, viewport } from "./metadata";
import { ModelSettingsProvider } from '@/lib/context/ModelSettingsContext';
import { MessageSquare, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui-custom/ThemeToggle";
import { ThemeProvider } from "@/components/ui-custom/ThemeProvider";
import { BrandLogo } from "@/components/ui-custom/BrandLogo";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider>
          <ModelSettingsProvider>
            <header className="bg-white dark:bg-slate-900 shadow-sm py-2 sm:py-3 sticky top-0 z-10">
              <div className="container max-w-6xl mx-auto px-3 sm:px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Link href="/" className="flex items-center gap-1.5 sm:gap-2 text-slate-800 dark:text-slate-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                      <BrandLogo size="sm" className="hidden sm:block" />
                      <MessageSquare className="h-4 sm:h-5 w-4 sm:w-5 text-blue-500 dark:text-blue-400 sm:hidden" />
                      <span className="font-semibold text-sm sm:text-base">ChatBuddy</span>
                    </Link>
                    <div className="text-[10px] sm:text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 sm:px-2 py-0.5 rounded-full ml-1.5 sm:ml-2">
                      Multi-Model
                    </div>
                  </div>
                  
                  <nav className="flex items-center gap-2 sm:gap-4">
                    <Link href="/" className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors hidden sm:flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                      <span>Chat</span>
                    </Link>
                    <Link href="/settings" className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-1 sm:gap-1.5">
                      <SettingsIcon className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                      <span className="hidden sm:inline">Settings</span>
                    </Link>
                    <ThemeToggle />
                  </nav>
                </div>
              </div>
            </header>
            <main className="flex-grow flex flex-col container max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
              {children}
            </main>
            <Toaster />
          </ModelSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
