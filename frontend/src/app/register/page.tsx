'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { MascotOwl } from '@/components/MascotOwl';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 6 characters', pass: password.length >= 6 },
    { label: 'Contains a number', pass: /\d/.test(password) },
    { label: 'Contains a letter', pass: /[a-zA-Z]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1">
      {checks.map((c) => (
        <div key={c.label} className={`flex items-center gap-1.5 text-xs font-bold ${c.pass ? 'text-[#58CC02]' : 'text-gray-400'}`}>
          <CheckCircle2 className={`w-3.5 h-3.5 ${c.pass ? 'text-[#58CC02]' : 'text-gray-300'}`} />
          {c.label}
        </div>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Username and password are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(username.trim(), email.trim(), password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1CB0F6] via-[#0d96d4] to-[#0a7ab0] flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Top accent */}
          <div className="h-2 bg-gradient-to-r from-[#1CB0F6] via-[#58CC02] to-[#FFC800]" />

          <div className="p-8">
            {/* Logo + Mascot */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-3">
                <MascotOwl emotion="excited" width={80} height={80} />
              </div>
              <h1 className="text-3xl font-black text-gray-800 tracking-tight">Create account</h1>
              <p className="text-gray-500 font-bold mt-1 text-sm">Join millions of learners today! 🌍</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-center gap-2 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl font-bold text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">
                  Username <span className="text-red-400">*</span>
                </label>
                <input
                  id="register-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  autoComplete="username"
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1CB0F6] transition-colors bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">
                  Email <span className="text-gray-400 font-bold normal-case text-xs">(optional)</span>
                </label>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1CB0F6] transition-colors bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1CB0F6] transition-colors bg-gray-50 focus:bg-white pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              {/* Submit */}
              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-[#1CB0F6] hover:bg-[#0d96d4] active:scale-95 text-white font-black text-lg tracking-wide border-b-4 border-[#0a7ab0] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'CREATE ACCOUNT'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google OAuth (visual) */}
            <button
              id="register-google"
              type="button"
              className="w-full py-3.5 rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-95 font-black text-gray-700 text-sm tracking-wide transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              Continue with Google
            </button>

            {/* Login link */}
            <p className="text-center mt-6 text-sm font-bold text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-[#58CC02] hover:underline font-black">
                Log in
              </Link>
            </p>

            {/* Terms */}
            <p className="text-center mt-3 text-xs text-gray-400 font-bold">
              By signing up you agree to our{' '}
              <span className="text-gray-500 underline cursor-pointer">Terms</span>
              {' '}and{' '}
              <span className="text-gray-500 underline cursor-pointer">Privacy Policy</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-white/70 text-xs font-bold">
          🦜 Duolingo Clone — Assignment Project
        </p>
      </div>
    </div>
  );
}
