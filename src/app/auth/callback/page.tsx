'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if we have a session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard');
      }
    });

    // Listen for the auth state change (handling the code exchange)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User clicked a password reset link — send them to the update-password form
        router.push('/auth/update-password');
      } else if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard');
      }
    });

    // Fallback: If nothing happens after a timeout (e.g. 5s), redirect to login
    const timeout = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
           router.push('/auth/login?error=timeout');
        }
      });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white">Completing sign in...</h2>
        <p className="text-slate-400 mt-2">Please wait while we verify your credentials</p>
      </div>
    </div>
  );
}
