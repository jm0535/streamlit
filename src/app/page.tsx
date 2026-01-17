'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Always redirect to /home (Landing Page)
    // Authenticated users will see "Go to Dashboard" on the landing page
    router.push('/home');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500 mx-auto mb-4" />
        <p className="text-white/50">
          Redirecting to home...
        </p>
      </div>
    </div>
  );
}
