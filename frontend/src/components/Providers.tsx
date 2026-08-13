'use client';

import React, { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { AuthGate } from '@/components/AuthGate';
import { wakeBackend } from '@/lib/http';

function BackendPrewarm() {
  useEffect(() => {
    wakeBackend(15);
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
