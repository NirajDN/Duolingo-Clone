'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { MascotOwl } from '@/components/MascotOwl';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#58CC02] via-[#46a302] to-[#3d8c02] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#58CC02] via-[#FFC800] to-[#FF4B4B]" />

          <div className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-3">
                <MascotOwl emotion="happy" width={80} height={80} />
              </div>
              <h1 className="text-3xl font-black text-gray-800 tracking-tight">Welcome back!</h1>
              <p className="text-gray-500 font-bold mt-1 text-sm">Log in to continue your streak 🔥</p>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-2 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl font-bold text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">
                  Username or Email
                </label>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                  autoComplete="username"
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#58CC02] transition-colors bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    autoComplete="current-password"
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#58CC02] transition-colors bg-gray-50 focus:bg-white pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-[#58CC02] hover:bg-[#46a302] active:scale-95 text-white font-black text-lg tracking-wide border-b-4 border-[#3d8c02] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'LOG IN'
                )}
              </button>
            </form>

            <p className="text-center mt-6 text-sm font-bold text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#1CB0F6] hover:underline font-black">
                Sign up FREE
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-6 text-white/70 text-xs font-bold">
          🦜 Duolingo Clone
        </p>
      </div>
    </div>
  );
}
