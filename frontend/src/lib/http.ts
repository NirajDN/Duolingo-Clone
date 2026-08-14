import { API_BASE } from './constants';

export { API_BASE };

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function timeoutSignal(ms: number): AbortSignal {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

async function fetchPing(url: string, timeoutMs: number): Promise<Response | null> {
  try {
    return await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      mode: 'cors',
      credentials: 'omit',
      signal: timeoutSignal(timeoutMs),
    });
  } catch {
    return null;
  }
}

function urlIsAwake(res: Response, url: string): boolean {
  if (!res || res.status >= 502) return false;
  if (url.endsWith('/health/')) {
    if (res.status === 404) return true;
    if (res.ok) return true;
    return false;
  }
  return res.ok;
}

async function pingOnce(timeoutMs = 12000): Promise<boolean> {
  const urls = [`${API_BASE}/health/`, `${API_BASE}/health/`, `${API_BASE}/leaderboard/`];
  const results = await Promise.all(
    urls.map(async (url) => {
      const res = await fetchPing(url, timeoutMs);
      return res ? urlIsAwake(res, url) : false;
    })
  );
  return results.some(Boolean);
}

/** Wake Render free-tier backend — parallel pings, fast retries. */
export async function wakeBackend(maxAttempts = 25): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const timeoutMs = Math.min(6000 + attempt * 1000, 15000);
    if (await pingOnce(timeoutMs)) return true;
    await wait(Math.min(400 + attempt * 150, 2000));
  }
  return false;
}

let wakePromise: Promise<boolean> | null = null;

export function startBackendWake(maxAttempts = 20): Promise<boolean> {
  if (!wakePromise) {
    wakePromise = wakeBackend(maxAttempts).finally(() => {
      wakePromise = null;
    });
  }
  return wakePromise;
}

/** Give wake a short head-start without blocking the UI for long. */
export async function warmBackendBriefly(maxWaitMs = 2500): Promise<void> {
  await Promise.race([startBackendWake(), wait(maxWaitMs)]);
}

export async function parseJsonResponse<T = unknown>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    if (text.trimStart().startsWith('<')) {
      throw new Error('Server is still starting. Please wait and try again.');
    }
    throw new Error('Unexpected server response. Please try again.');
  }
}

async function responseLooksLikeHtml(res: Response): Promise<boolean> {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return false;
  const text = await res.clone().text();
  return text.trimStart().startsWith('<');
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 4
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const timeoutMs = Math.min(8000 + attempt * 4000, 20000);
      const res = await fetch(url, {
        ...options,
        signal: options.signal ?? timeoutSignal(timeoutMs),
      });

      const shouldRetryStatus =
        res.status >= 502 || res.status === 503 || res.status === 504 || res.status === 429;

      const isHtml = await responseLooksLikeHtml(res);

      if ((shouldRetryStatus || isHtml) && attempt < retries) {
        await wait(300 + attempt * 500);
        continue;
      }

      return res;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Network request failed');
      if (attempt < retries) {
        await wait(300 + attempt * 500);
      }
    }
  }

  throw lastError ?? new Error('Network request failed');
}

export function keepBackendAlive(intervalMs = 4 * 60 * 1000) {
  if (typeof window === 'undefined') return () => {};

  const ping = () => {
    if (document.visibilityState !== 'visible') return;
    void fetch(`${API_BASE}/health/`, { cache: 'no-store', mode: 'cors' }).catch(() => {});
  };

  ping();
  const id = window.setInterval(ping, intervalMs);
  return () => window.clearInterval(id);
}
