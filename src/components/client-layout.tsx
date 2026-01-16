'use client';

import { usePathname } from 'next/navigation';
import { AppLayout } from '@/components/enterprise-layout';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages that should render without the app sidebar/layout
  const isFullScreenPage = pathname?.startsWith('/auth') ||
                           pathname === '/home' ||
                           pathname === '/privacy' ||
                           pathname === '/terms';

  if (isFullScreenPage) {
    return <>{children}</>;
  }

  return <AppLayout>{children}</AppLayout>;
}
