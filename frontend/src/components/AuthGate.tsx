'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth, PUBLIC_ROUTES } from '@/context/AuthContext';
import { MascotOwl } from '@/components/MascotOwl';

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-white dark:bg-duo-dark flex flex-col items-center justify-center p-6">
      <MascotOwl emotion="happy" className="animate-bounce mb-4" width={88} height={88} />
      <p className="font-extrabold text-lg text-duo-green">Loading...</p>
    </div>
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user && !isPublic) {
    return <AuthLoadingScreen />;
  }

  if (user && isPublic) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}
