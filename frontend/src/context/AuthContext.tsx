'use client';

import React, { createContext, useContext, useLayoutEffect, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { API_BASE, fetchWithRetry, parseJsonResponse, startBackendWake } from '@/lib/http';
import { prefetchDashboard } from '@/lib/api';

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

const AuthContext = createContext<AuthContextValue | null>(null);

export const PUBLIC_ROUTES = ['/login', '/register'];

function readStoredSession(): { user: AuthUser | null; token: string | null } {
  if (typeof window === 'undefined') return { user: null, token: null };
  try {
    const token = localStorage.getItem('duo_access');
    const storedUser = localStorage.getItem('duo_user');
    if (token && storedUser) {
      return { token, user: JSON.parse(storedUser) as AuthUser };
    }
  } catch {
    /* ignore */
  }
  return { user: null, token: null };
}

async function authRequest<T>(url: string, options: RequestInit): Promise<T> {
  void startBackendWake();
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const stored = readStoredSession();
  const [user, setUser] = useState<AuthUser | null>(stored.user);
  const [token, setToken] = useState<string | null>(stored.token);
  const [loading, setLoading] = useState(() => typeof window === 'undefined');
  const router = useRouter();
  const pathname = usePathname();

  useLayoutEffect(() => {
    const session = readStoredSession();
    if (session.user) {
      setUser(session.user);
      setToken(session.token);
      prefetchDashboard(session.user.id);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    startBackendWake();
  }, []);

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
      prefetchDashboard(data.user.id);
    },
    []
  );

  const login = useCallback(async (username: string, password: string) => {
    void startBackendWake();
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
    void startBackendWake();
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
    const refresh = typeof window !== 'undefined' ? localStorage.getItem('duo_refresh') : null;
    try {
      if (refresh) {
        void fetchWithRetry(`${API_BASE}/auth/logout/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        }).catch(() => undefined);
      }
    } catch {
      /* ignore */
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('duo_access');
        localStorage.removeItem('duo_refresh');
        localStorage.removeItem('duo_user');
      }
      setToken(null);
      setUser(null);
      router.replace('/login');
      router.refresh();
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
