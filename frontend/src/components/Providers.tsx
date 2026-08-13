'use client';

import React, { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { AuthGate } from '@/components/AuthGate';
import { startBackendWake } from '@/lib/http';

function BackendPrewarm() {
  useEffect(() => {
    startBackendWake(20);
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BackendPrewarm />
      <AuthGate>{children}</AuthGate>
    </AuthProvider>
  );
}
