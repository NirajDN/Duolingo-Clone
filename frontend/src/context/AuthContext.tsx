'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { API_BASE, fetchWithRetry, parseJsonResponse, ensureBackendReady } from '@/lib/http';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

export const PUBLIC_ROUTES = ['/login', '/register'];

async function authRequest<T>(url: string, options: RequestInit): Promise<T> {
  const res = await fetchWithRetry(url, options);
  const data = await parseJsonResponse<T & { detail?: string }>(res);

  if (!res.ok) {
    const message =
      typeof data === 'object' && data && 'detail' in data && data.detail
        ? String(data.detail)
        : 'Request failed';
    throw new Error(message);
  }

  return data;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('duo_access');
    const storedUser = localStorage.getItem('duo_user');
    if (stored && storedUser) {
      setToken(stored);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Route guard
  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_ROUTES.includes(pathname);
    if (!user && !isPublic) {
      router.replace('/login');
    } else if (user && isPublic) {
      router.replace('/');
    }
  }, [user, loading, pathname, router]);

  const persistSession = useCallback(
    (data: { access: string; refresh: string; user: AuthUser }) => {
      localStorage.setItem('duo_access', data.access);
      localStorage.setItem('duo_refresh', data.refresh);
      localStorage.setItem('duo_user', JSON.stringify(data.user));
      setToken(data.access);
      setUser(data.user);
    },
    []
  );

  const login = useCallback(async (username: string, password: string) => {
    await ensureBackendReady();
    const data = await authRequest<{
      access: string;
      refresh: string;
      user: AuthUser;
    }>(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    persistSession(data);
    router.replace('/');
  }, [router, persistSession]);

  const register = useCallback(async (username: string, email: string, password: string) => {
    await ensureBackendReady();
    const data = await authRequest<{
      access: string;
      refresh: string;
      user: AuthUser;
    }>(`${API_BASE}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    persistSession(data);
    router.replace('/');
  }, [router, persistSession]);

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('duo_refresh');
    try {
      if (refresh) {
        await fetchWithRetry(`${API_BASE}/auth/logout/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        });
      }
    } catch {
      /* ignore */
    }
    localStorage.removeItem('duo_access');
    localStorage.removeItem('duo_refresh');
    localStorage.removeItem('duo_user');
    setToken(null);
    setUser(null);
    router.replace('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
