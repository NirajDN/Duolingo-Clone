'use client';

import React from 'react';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Settings as SettingsIcon, Volume2, Globe, User, ShieldCheck, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex items-center space-x-3 pb-4 border-b-2 border-duo-gray dark:border-duo-dark-border">
          <SettingsIcon className="w-7 h-7 sm:w-8 sm:h-8 text-duo-blue" />
          <h1 className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white">Settings</h1>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="p-4 sm:p-6 border-2 border-duo-gray dark:border-duo-dark-border rounded-3xl space-y-3 bg-white dark:bg-duo-dark-card">
            <div className="flex items-center space-x-3">
              <Globe className="w-6 h-6 text-duo-green" />
              <h2 className="text-lg sm:text-xl font-black text-gray-800 dark:text-white">Learning Language</h2>
            </div>
            <p className="text-sm font-bold text-gray-500">
              Currently learning: <span className="text-duo-green font-black">Spanish 🇪🇸</span>
            </p>
            <div className="pt-2">
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-extrabold text-xs rounded-full">
                More languages coming soon!
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-6 border-2 border-duo-gray dark:border-duo-dark-border rounded-3xl space-y-3 bg-white dark:bg-duo-dark-card">
            <div className="flex items-center space-x-3">
              <Volume2 className="w-6 h-6 text-duo-gold" />
              <h2 className="text-lg sm:text-xl font-black text-gray-800 dark:text-white">Sound & Effects</h2>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">Sound Effects</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-duo-green cursor-pointer" />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">Motivational Messages</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-duo-green cursor-pointer" />
            </div>
          </div>

          <div className="p-4 sm:p-6 border-2 border-duo-gray dark:border-duo-dark-border rounded-3xl space-y-3 bg-white dark:bg-duo-dark-card">
            <div className="flex items-center space-x-3">
              <User className="w-6 h-6 text-duo-blue" />
              <h2 className="text-lg sm:text-xl font-black text-gray-800 dark:text-white">Account Details</h2>
            </div>
            <div className="space-y-2 text-sm font-bold text-gray-600 dark:text-gray-300">
              <p>
                Username:{' '}
                <span className="font-black text-gray-800 dark:text-white">
                  {user?.username ?? '—'}
                </span>
              </p>
              <p>
                Email:{' '}
                <span className="font-black text-gray-800 dark:text-white">
                  {user?.email || 'No email'}
                </span>
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6 border-2 border-duo-gray dark:border-duo-dark-border rounded-3xl space-y-3 bg-white dark:bg-duo-dark-card">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-6 h-6 text-duo-purple" />
              <h2 className="text-lg sm:text-xl font-black text-gray-800 dark:text-white">Privacy & Security</h2>
            </div>
            <p className="text-sm font-bold text-gray-500">
              Public Profile: <span className="text-duo-green font-black">Active</span>
            </p>
          </div>

          {/* Log out — primary action for mobile (sidebar logout is desktop-only) */}
          <div className="p-4 sm:p-6 border-2 border-red-200 dark:border-red-900/40 rounded-3xl bg-red-50/50 dark:bg-red-950/20 space-y-3">
            <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
              Signed in as{' '}
              <span className="font-black text-gray-800 dark:text-white">{user?.username}</span>
            </p>
            <button
              id="settings-logout"
              type="button"
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-black text-red-600 dark:text-red-400 bg-white dark:bg-duo-dark-card border-2 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 active:scale-[0.98] transition-all"
            >
              <LogOut className="w-5 h-5" />
              LOG OUT
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
