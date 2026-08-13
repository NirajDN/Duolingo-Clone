'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth, PUBLIC_ROUTES } from '@/context/AuthContext';
import { AppShell } from '@/components/AppShell';
import PathSkeleton from '@/components/PathSkeleton';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (loading) {
    return null;
  }

  if (!user && !isPublic) {
    return null;
  }

  if (user && isPublic) {
    return (
      <AppShell>
        <PathSkeleton />
      </AppShell>
    );
  }

  return <>{children}</>;
}
