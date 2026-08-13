'use client';

import React, { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/context/AuthContext';
import { AuthGate } from '@/components/AuthGate';
import { GOOGLE_CLIENT_ID } from '@/lib/constants';
import { wakeBackend } from '@/lib/http';

function BackendPrewarm() {
  useEffect(() => {
    wakeBackend(8);
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BackendPrewarm />
        <AuthGate>{children}</AuthGate>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
