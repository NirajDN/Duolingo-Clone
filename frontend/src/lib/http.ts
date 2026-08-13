const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://duolingo-clone-6092.onrender.com/api';

export { API_BASE };

export async function parseJsonResponse<T = unknown>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    if (text.trimStart().startsWith('<')) {
      throw new Error(
        'The server is waking up. Wait 30 seconds and try again, or use the button below.'
      );
    }
    throw new Error('Unexpected server response. Please try again.');
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
      const res = await fetch(url, options);

      const shouldRetryStatus =
        res.status >= 502 || res.status === 503 || res.status === 504 || res.status === 429;

      const isHtml = await responseLooksLikeHtml(res);

      if ((shouldRetryStatus || isHtml) && attempt < retries) {
        await wait(2000 + attempt * 2000);
        continue;
      }

      return res;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Network request failed');
      if (attempt < retries) {
        await wait(2000 + attempt * 2000);
      }
    }
  }

  throw lastError ?? new Error('Network request failed');
}

/** Ping a public endpoint to wake Render free-tier backend before login. */
export async function wakeBackend(): Promise<boolean> {
  try {
    const res = await fetchWithRetry(`${API_BASE}/leaderboard/`, { cache: 'no-store' }, 6);
    return res.ok;
  } catch {
    return false;
  }
}
