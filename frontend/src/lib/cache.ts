const CACHE_TTL_MS = 10 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  ts: number;
}

function cacheKey(base: string, userId?: number) {
  return userId ? `${base}_${userId}` : base;
}

export function readCache<T>(base: string, userId?: number): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(cacheKey(base, userId));
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - entry.ts > CACHE_TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

export function writeCache<T>(base: string, data: T, userId?: number) {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry<T> = { data, ts: Date.now() };
    localStorage.setItem(cacheKey(base, userId), JSON.stringify(entry));
  } catch {
    /* ignore quota errors */
  }
}

export function readStaleCache<T>(base: string, userId?: number): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(cacheKey(base, userId));
    if (!raw) return null;
    return (JSON.parse(raw) as CacheEntry<T>).data;
  } catch {
    return null;
  }
}
