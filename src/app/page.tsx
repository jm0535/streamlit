'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Authenticated users go to dashboard
        router.push('/dashboard');
      } else {
        // Visitors see the marketing landing page
        router.push('/home');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500 mx-auto mb-4" />
        <p className="text-white/50">
          {loading ? 'Loading...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}
