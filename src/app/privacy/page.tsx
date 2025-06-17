'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Eye, Database, Lock, Users, Globe, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Last Updated:</strong> January 2025
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700 dark:text-slate-300">
              At ChatBuddy, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
              disclose, and safeguard your information when you use our AI chat application. We are committed 
              to protecting your personal data and being transparent about our practices.
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              By using ChatBuddy, you agree to the collection and use of information in accordance with this policy.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Personal Information</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-4">
                <li>Email address (for account creation and authentication)</li>
                <li>Name (optional, for personalization)</li>
                <li>Profile information you choose to provide</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Usage Information</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-4">
                <li>Chat conversations and messages</li>
                <li>AI model preferences and settings</li>
                <li>Usage patterns and feature interactions</li>
                <li>Device information and browser type</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-300 mb-2">API Keys</h3>
              <p className="text-slate-700 dark:text-slate-300">
                We securely store your API keys for various AI providers. These are encrypted and used only 
                to make requests to AI services on your behalf.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>To provide and maintain our AI chat services</li>
              <li>To authenticate your account and ensure security</li>
              <li>To process your requests to AI models using your API keys</li>
              <li>To save your chat history and preferences (if enabled)</li>
              <li>To improve our services and user experience</li>
              <li>To send important service updates and notifications</li>
              <li>To provide customer support when requested</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700 dark:text-slate-300">
              We implement industry-standard security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-4">
              <li>All data is encrypted in transit using HTTPS/TLS</li>
              <li>API keys are encrypted at rest using strong encryption</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure cloud infrastructure with Supabase</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-orange-600" />
              Data Sharing and Third Parties
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700 dark:text-slate-300">
              We do not sell, trade, or rent your personal information to third parties. We may share 
              information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-4">
              <li>With AI service providers (OpenAI, Google, Anthropic, etc.) to process your chat requests</li>
              <li>With our hosting and infrastructure providers (Supabase, Netlify)</li>
              <li>When required by law or to protect our rights</li>
              <li>With your explicit consent</li>
            </ul>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Your Rights and Choices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700 dark:text-slate-300">You have the following rights regarding your data:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-4">
              <li>Access and review your personal information</li>
              <li>Update or correct your account information</li>
              <li>Delete your account and associated data</li>
              <li>Export your chat history and data</li>
              <li>Opt out of non-essential communications</li>
              <li>Control chat history saving preferences</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 dark:text-slate-300">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-slate-900 dark:text-white font-medium">Email: privacy@chatbuddypro.com</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-slate-600 dark:text-slate-400 mt-8">
          <p>© 2025 ChatBuddy. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
