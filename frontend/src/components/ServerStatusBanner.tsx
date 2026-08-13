'use client';

import React from 'react';
import { Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ServerStatusBannerProps {
  wakingServer: boolean;
  serverReady: boolean;
  onRetry: () => void;
}

export function ServerStatusBanner({ wakingServer, serverReady, onRetry }: ServerStatusBannerProps) {
  if (serverReady) {
    return (
      <div className="mb-5 flex items-center gap-2 bg-green-50 border-2 border-green-200 text-green-800 px-4 py-3 rounded-2xl font-bold text-sm">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        Server connected — you can log in now.
      </div>
    );
  }

  if (wakingServer) {
    return (
      <div className="mb-5 flex items-center gap-2 bg-amber-50 border-2 border-amber-200 text-amber-800 px-4 py-3 rounded-2xl font-bold text-sm">
        <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
        Waking server… free tier can take up to 60s. You can still try logging in.
      </div>
    );
  }

  return (
    <div className="mb-5 flex flex-col gap-2 bg-amber-50 border-2 border-amber-200 text-amber-800 px-4 py-3 rounded-2xl font-bold text-sm">
      <span>Server is slow to respond. Try logging in — we will retry automatically.</span>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center justify-center gap-2 text-xs font-black text-amber-900 underline"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Retry connection
      </button>
    </div>
  );
}
