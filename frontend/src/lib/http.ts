import { API_BASE } from './constants';

export { API_BASE };

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pingHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health/`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    if (res.ok) {
      const data = await res.json();
      return data?.status === 'ok';
    }
    // Server responded (e.g. 404 before health deploy) — still awake
    if (res.status === 404) return true;
    return false;
  } catch {
    return false;
  }
}

/** Wake Render free-tier backend — parallel pings, fast retries. */
export async function wakeBackend(maxAttempts = 10): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const results = await Promise.all([pingHealth(), pingHealth(), pingHealth()]);
    if (results.some(Boolean)) return true;
    await wait(Math.min(800 + attempt * 400, 3000));
  }
  return false;
}

export async function ensureBackendReady(): Promise<void> {
  const ready = await wakeBackend(12);
  if (!ready) {
    throw new Error('Server is waking up. Please wait 20 seconds and try again.');
  }
}

export async function parseJsonResponse<T = unknown>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    if (text.trimStart().startsWith('<')) {
      throw new Error('Server is waking up. Please wait a moment and try again.');
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
      const res = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000),
      });

      const shouldRetryStatus =
        res.status >= 502 || res.status === 503 || res.status === 504 || res.status === 429;

      const isHtml = await responseLooksLikeHtml(res);

      if ((shouldRetryStatus || isHtml) && attempt < retries) {
        await wait(1000 + attempt * 1000);
        continue;
      }

      return res;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Network request failed');
      if (attempt < retries) {
        await wait(1000 + attempt * 1000);
      }
    }
  }

  throw lastError ?? new Error('Network request failed');
}
