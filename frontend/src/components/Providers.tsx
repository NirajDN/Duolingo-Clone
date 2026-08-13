'use client';

import React, { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { AuthGate } from '@/components/AuthGate';
import { keepBackendAlive, startBackendWake } from '@/lib/http';

function BackendPrewarm() {
  useEffect(() => {
    startBackendWake(25);
    return keepBackendAlive();
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
