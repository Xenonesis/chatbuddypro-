'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Missing email',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to send reset email',
          variant: 'destructive',
        });
        return;
      }
      
      setIsSubmitted(true);
      toast({
        title: 'Email sent',
        description: 'Check your inbox for password reset instructions',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We've sent password reset instructions to your email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg flex flex-col items-center">
              <MailCheck className="h-12 w-12 text-blue-500 mb-3" />
              <p className="text-center text-gray-700 dark:text-gray-300">
                Please check your email inbox and follow the instructions to reset your password.
              </p>
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

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending email...
                </>
              ) : (
                'Send reset link'
              )}
            </Button>
            <div className="text-center text-sm">
              <Link
                href="/auth/login"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 