import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChatBuddy | Multi-Model",
  description: "A chatbot application supporting multiple AI providers like OpenAI, Google Gemini, and Mistral",
  icons: {
    icon: [
      { url: '/chatbuddy-favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: { url: '/chatbuddy-logo.svg', type: 'image/svg+xml' },
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: "cover",
}; 