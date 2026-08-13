'use client';

import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface GoogleSignInProps {
  onSuccess: (credential: string) => Promise<void>;
  onError: (message: string) => void;
  disabled?: boolean;
  buttonId?: string;
}

export function GoogleSignIn({
  onSuccess,
  onError,
  disabled = false,
  buttonId,
}: GoogleSignInProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return (
      <p className="text-center text-xs font-bold text-gray-400 px-2">
        Google sign-in is not configured. Add{' '}
        <code className="text-[10px]">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to your environment.
      </p>
    );
  }

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      onError('Google sign-in failed. No credential received.');
      return;
    }
    try {
      await onSuccess(response.credential);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Google sign-in failed.');
    }
  };

  return (
    <div
      id={buttonId}
      className={`w-full flex justify-center overflow-hidden rounded-2xl ${
        disabled ? 'opacity-60 pointer-events-none' : ''
      }`}
    >
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError('Google sign-in was cancelled or failed.')}
        theme="outline"
        size="large"
        width={360}
        text="continue_with"
        shape="rectangular"
        logo_alignment="left"
      />
    </div>
  );
}
