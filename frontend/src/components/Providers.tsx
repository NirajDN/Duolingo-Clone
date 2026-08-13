'use client';

import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/context/AuthContext';
import { AuthGate } from '@/components/AuthGate';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export function Providers({ children }: { children: React.ReactNode }) {
  const app = (
    <AuthProvider>
      <AuthGate>{children}</AuthGate>
    </AuthProvider>
  );

  if (!googleClientId) {
    return app;
  }

  return <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider>;
}
