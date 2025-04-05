'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MailCheck, ArrowLeft } from 'lucide-react';

export default function VerifyPage() {
  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to your email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg flex flex-col items-center">
            <MailCheck className="h-12 w-12 text-blue-500 mb-3" />
            <p className="text-center text-gray-700 dark:text-gray-300">
              Please check your email inbox and click the verification link to complete your signup.
            </p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            <p>If you don't see the email:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Check your spam folder</li>
              <li>Make sure you entered the correct email</li>
              <li>Allow a few minutes for the email to arrive</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Link href="/auth/login" className="w-full">
            <Button variant="outline" className="w-full flex gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 