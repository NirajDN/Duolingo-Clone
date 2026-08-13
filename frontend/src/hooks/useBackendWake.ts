'use client';

import { useCallback, useEffect, useState } from 'react';
import { wakeBackend } from '@/lib/http';

export function useBackendWake() {
  const [serverReady, setServerReady] = useState(false);
  const [wakingServer, setWakingServer] = useState(true);

  const runWake = useCallback(async () => {
    setWakingServer(true);
    const ok = await wakeBackend(30);
    setServerReady(ok);
    setWakingServer(false);
    return ok;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await wakeBackend(30);
      if (!cancelled) {
        setServerReady(ok);
        setWakingServer(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { serverReady, wakingServer, retryWake: runWake };
}
