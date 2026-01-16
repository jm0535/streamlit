'use client';

import { usePathname } from 'next/navigation';
import { AppLayout } from '@/components/enterprise-layout';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return <AppLayout>{children}</AppLayout>;
}
