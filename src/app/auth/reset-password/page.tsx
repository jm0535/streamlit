'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Music2, Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) throw error;

      setIsEmailSent(true);
      toast({
        title: 'Password reset email sent',
        description: 'Check your inbox for the reset link',
      });
    } catch (error: any) {
      toast({
        title: 'Reset failed',
        description: error.message || 'Could not send reset email',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-white hover:text-purple-300 transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Music2 className="h-10 w-10 text-purple-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Reset Password</h1>
          <p className="text-slate-400 mt-2">We&apos;ll send you a reset link</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">
              {isEmailSent ? 'Check Your Email' : 'Forgot Password?'}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {isEmailSent
                ? 'We sent you a password reset link'
                : 'Enter your email to receive a password reset link'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEmailSent ? (
              <div className="text-center py-8">
                <div className="p-4 bg-green-500/20 rounded-full w-fit mx-auto mb-4">
                  <CheckCircle className="h-12 w-12 text-green-400" />
                </div>
                <p className="text-slate-300 mb-4">
                  We&apos;ve sent a password reset link to:
                </p>
                <p className="text-purple-400 font-medium mb-6">{email}</p>
                <p className="text-slate-400 text-sm">
                  Didn&apos;t receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => setIsEmailSent(false)}
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    try again
                  </button>
                </p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="researcher@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-slate-400 text-sm">
              Remember your password?{' '}
              <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
