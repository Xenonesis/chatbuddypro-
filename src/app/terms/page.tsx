'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, Scale, AlertTriangle, Shield, Users, Zap, Ban } from 'lucide-react';

export default function TermsOfService() {
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
            <FileText className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Terms of Service</h1>
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
              <Scale className="h-5 w-5 text-blue-600" />
              Agreement to Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700 dark:text-slate-300">
              Welcome to ChatBuddy! These Terms of Service ("Terms") govern your use of our AI chat application 
              and services. By accessing or using ChatBuddy, you agree to be bound by these Terms.
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              If you do not agree to these Terms, please do not use our services.
            </p>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              Service Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700 dark:text-slate-300">
              ChatBuddy is a web application that allows you to interact with various AI language models 
              including OpenAI GPT, Google Gemini, Anthropic Claude, and others. Our service:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-4">
              <li>Provides access to multiple AI models through a unified interface</li>
              <li>Allows you to use your own API keys for AI services</li>
              <li>Offers chat history and conversation management</li>
              <li>Includes customizable settings and preferences</li>
            </ul>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              User Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700 dark:text-slate-300">By using ChatBuddy, you agree to:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-4">
              <li>Provide accurate and complete information when creating your account</li>
              <li>Keep your account credentials secure and confidential</li>
              <li>Use the service in compliance with all applicable laws and regulations</li>
              <li>Respect the terms of service of third-party AI providers</li>
              <li>Not use the service for illegal, harmful, or malicious purposes</li>
              <li>Not attempt to reverse engineer or compromise our systems</li>
              <li>Be responsible for all costs associated with your API usage</li>
            </ul>
          </CardContent>
        </Card>

        {/* API Keys and Third-Party Services */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600" />
              API Keys and Third-Party Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700 dark:text-slate-300">
              ChatBuddy requires you to provide your own API keys for AI services. You acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-4">
              <li>You are responsible for obtaining and maintaining valid API keys</li>
              <li>All usage costs are billed directly by the AI service providers</li>
              <li>We are not responsible for charges incurred through API usage</li>
              <li>You must comply with each provider's terms of service</li>
              <li>API key security is your responsibility</li>
              <li>We store API keys securely but cannot guarantee absolute security</li>
            </ul>
          </CardContent>
        </Card>

        {/* Prohibited Uses */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-600" />
              Prohibited Uses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700 dark:text-slate-300">You may not use ChatBuddy to:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-4">
              <li>Generate illegal, harmful, or malicious content</li>
              <li>Harass, threaten, or harm others</li>
              <li>Violate intellectual property rights</li>
              <li>Spread misinformation or false information</li>
              <li>Attempt to bypass AI safety measures</li>
              <li>Use the service for commercial purposes without permission</li>
              <li>Share or distribute inappropriate content</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Disclaimers and Limitations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Service Availability</h3>
              <p className="text-slate-700 dark:text-slate-300">
                We provide ChatBuddy "as is" without warranties. We do not guarantee uninterrupted 
                service availability and may experience downtime for maintenance or technical issues.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">AI-Generated Content</h3>
              <p className="text-slate-700 dark:text-slate-300">
                AI responses are generated by third-party models. We are not responsible for the 
                accuracy, completeness, or appropriateness of AI-generated content.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Limitation of Liability</h3>
              <p className="text-slate-700 dark:text-slate-300">
                To the maximum extent permitted by law, we shall not be liable for any indirect, 
                incidental, special, or consequential damages arising from your use of our service.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Termination */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-600" />
              Account Termination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700 dark:text-slate-300">
              We reserve the right to suspend or terminate your account if you violate these Terms. 
              You may also delete your account at any time through the settings page.
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              Upon termination, your access to the service will cease, and we may delete your data 
              in accordance with our Privacy Policy.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Changes to Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700 dark:text-slate-300">
              We may update these Terms from time to time. We will notify you of any material changes 
              by posting the new Terms on this page and updating the "Last Updated" date.
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              Your continued use of ChatBuddy after any changes constitutes acceptance of the new Terms.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 dark:text-slate-300">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-slate-900 dark:text-white font-medium">Email: legal@chatbuddypro.com</p>
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
