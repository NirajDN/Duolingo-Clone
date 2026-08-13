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
        'The server is waking up. Please wait a few seconds and try again.'
      );
    }
    throw new Error('Unexpected server response. Please try again.');
  }
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 2
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const res = await fetch(url, options);
      const contentType = res.headers.get('content-type') || '';

      if (
        !res.ok &&
        (res.status >= 502 || res.status === 503 || res.status === 504) &&
        attempt < retries
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
        continue;
      }

      if (!contentType.includes('application/json') && !res.ok) {
        const text = await res.clone().text();
        if (text.trimStart().startsWith('<') && attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
          continue;
        }
      }

      return res;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Network request failed');
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error('Network request failed');
}
