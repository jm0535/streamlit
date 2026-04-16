'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { Music2, Lock, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Enable the form once we confirm a valid recovery session exists.
  // We use three complementary checks so timing differences across devices/
  // Supabase versions can't leave the button permanently disabled:
  //   1. getSession() immediately — in Supabase v2 this awaits internal init,
  //      so it returns the recovery session once the hash has been parsed.
  //   2. onAuthStateChange — catches PASSWORD_RECOVERY or INITIAL_SESSION with
  //      a session if getSession() somehow resolves before the hash is processed.
  //   3. 3-second timeout fallback — last resort redirect if there's no session.
  useEffect(() => {
    let done = false;

    const enable = () => {
      if (done) return;
      done = true;
      setSessionReady(true);
    };

    const redirectAway = () => {
      if (done) return;
      done = true;
      toast({
        title: 'Invalid or expired link',
        description: 'Please request a new password reset link.',
        variant: 'destructive',
      });
      router.push('/auth/reset-password');
    };

    // Check 1: immediate session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) enable();
    });

    // Check 2: auth state events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'INITIAL_SESSION' && session)) {
        enable();
      }
    });

    // Check 3: timeout redirect if no session found after 3 seconds
    const timer = setTimeout(async () => {
      if (done) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) enable(); else redirectAway();
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [router, toast]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: 'Password updated!',
        description: 'You can now sign in with your new password.',
      });

      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message || 'Could not update password',
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Music2 className="h-10 w-10 text-purple-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Set New Password</h1>
          <p className="text-slate-400 mt-2">Choose a strong password for your account</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">
              {isSuccess ? 'Password Updated!' : 'Create New Password'}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {isSuccess
                ? 'Redirecting you to the dashboard...'
                : 'Enter and confirm your new password below'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isSuccess ? (
              <div className="text-center py-8">
                <div className="p-4 bg-green-500/20 rounded-full w-fit mx-auto mb-4">
                  <CheckCircle className="h-12 w-12 text-green-400" />
                </div>
                <p className="text-slate-300">Your password has been updated successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-200">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Repeat your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isSubmitting || !sessionReady}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-slate-400 text-sm">
              <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium">
                Back to Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
