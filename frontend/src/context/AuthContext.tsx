'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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

const PUBLIC_ROUTES = ['/login', '/register'];
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://duolingo-clone-6092.onrender.com/api';

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
      router.push('/login');
    } else if (user && isPublic) {
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('duo_access', data.access);
    localStorage.setItem('duo_refresh', data.refresh);
    localStorage.setItem('duo_user', JSON.stringify(data.user));
    setToken(data.access);
    setUser(data.user);
    router.push('/');
  }, [router]);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }
    const data = await res.json();
    localStorage.setItem('duo_access', data.access);
    localStorage.setItem('duo_refresh', data.refresh);
    localStorage.setItem('duo_user', JSON.stringify(data.user));
    setToken(data.access);
    setUser(data.user);
    router.push('/');
  }, [router]);

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('duo_refresh');
    try {
      if (refresh) {
        await fetch(`${API_BASE}/auth/logout/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        });
      }
    } catch { /* ignore */ }
    localStorage.removeItem('duo_access');
    localStorage.removeItem('duo_refresh');
    localStorage.removeItem('duo_user');
    setToken(null);
    setUser(null);
    router.push('/login');
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
