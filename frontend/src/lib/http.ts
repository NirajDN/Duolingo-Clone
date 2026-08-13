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

async function pingOnce(timeoutMs = 30000): Promise<boolean> {
  const urls = [`${API_BASE}/health/`, `${API_BASE}/leaderboard/`];

  for (const url of urls) {
    const res = await fetchPing(url, timeoutMs);
    if (!res || res.status >= 502) continue;

    if (url.endsWith('/health/')) {
      if (res.status === 404) return true;
      if (res.ok) {
        try {
          const data = await res.json();
          if (data?.status === 'ok') return true;
        } catch {
          return true;
        }
      }
      continue;
    }

    if (res.ok) return true;
  }

  return false;
}

/** Wake Render free-tier backend — keeps trying until success or max time. */
export async function wakeBackend(maxAttempts = 25): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const timeoutMs = Math.min(8000 + attempt * 1500, 25000);
    if (await pingOnce(timeoutMs)) return true;
    await wait(Math.min(600 + attempt * 200, 2500));
  }
  return false;
}

let wakePromise: Promise<boolean> | null = null;

/** Start waking the backend once per session (shared across all API calls). */
export function startBackendWake(maxAttempts = 20): Promise<boolean> {
  if (!wakePromise) {
    wakePromise = wakeBackend(maxAttempts);
  }
  return wakePromise;
}

export async function ensureBackendReady(): Promise<void> {
  const ready = await wakeBackend(30);
  if (!ready) {
    throw new Error('Server is still starting. Wait 30 seconds and tap Retry.');
  }
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
  retries = 5
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const timeoutMs = Math.min(10000 + attempt * 5000, 25000);
      const res = await fetch(url, {
        ...options,
        signal: options.signal ?? timeoutSignal(timeoutMs),
      });

      const shouldRetryStatus =
        res.status >= 502 || res.status === 503 || res.status === 504 || res.status === 429;

      const isHtml = await responseLooksLikeHtml(res);

      if ((shouldRetryStatus || isHtml) && attempt < retries) {
        await wait(500 + attempt * 700);
        continue;
      }

      return res;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Network request failed');
      if (attempt < retries) {
        await wait(500 + attempt * 700);
      }
    }
  }

  throw lastError ?? new Error('Network request failed');
}
