'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';
import { GOOGLE_CLIENT_ID } from '@/lib/constants';
import { ensureBackendReady } from '@/lib/http';

interface GoogleSignInProps {
  onSuccess: (credential: string) => Promise<void>;
  onError: (message: string) => void;
  disabled?: boolean;
  buttonId?: string;
  serverReady?: boolean;
}

export function GoogleSignIn({
  onSuccess,
  onError,
  disabled = false,
  buttonId,
  serverReady = true,
}: GoogleSignInProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [btnWidth, setBtnWidth] = useState(320);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const updateWidth = () => {
      const width = containerRef.current?.offsetWidth ?? 320;
      setBtnWidth(Math.min(Math.max(width, 200), 400));
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [mounted]);

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      onError('Google sign-in failed. No credential received.');
      return;
    }

    setGoogleLoading(true);
    try {
      await ensureBackendReady();
      await onSuccess(response.credential);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  const blocked = disabled || googleLoading || !serverReady;

  return (
    <div id={buttonId} ref={containerRef} className="w-full relative min-h-[44px]">
      {googleLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 rounded-2xl">
          <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
        </div>
      )}

      {!serverReady && !googleLoading && (
        <p className="mb-2 text-center text-xs font-bold text-amber-700">
          Waiting for server… Google sign-in unlocks when ready.
        </p>
      )}

      <div
        className={`w-full flex justify-center overflow-hidden ${
          blocked ? 'opacity-60 pointer-events-none' : ''
        }`}
      >
        {mounted ? (
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => onError('Google sign-in was cancelled. Please try again.')}
            theme="outline"
            size="large"
            width={String(btnWidth)}
            text="continue_with"
            shape="rectangular"
            logo_alignment="left"
            useOneTap={false}
          />
        ) : (
          <div className="h-11 w-full max-w-[320px] rounded-xl border-2 border-gray-200 bg-gray-50 animate-pulse" />
        )}
      </div>
    </div>
  );
}
