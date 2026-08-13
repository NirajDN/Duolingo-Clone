'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { Settings as SettingsIcon, Volume2, Globe, User, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-white dark:bg-duo-dark text-gray-800 dark:text-gray-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="max-w-3xl mx-auto w-full px-6 py-8 space-y-8">
          <div className="flex items-center space-x-3 pb-4 border-b-2 border-duo-gray dark:border-duo-dark-border">
            <SettingsIcon className="w-8 h-8 text-duo-blue" />
            <h1 className="text-3xl font-black text-gray-800 dark:text-white">Settings</h1>
          </div>

          <div className="space-y-6">
            {/* Language Switch Section */}
            <div className="p-6 border-2 border-duo-gray dark:border-duo-dark-border rounded-3xl space-y-3 bg-white dark:bg-duo-dark-card">
              <div className="flex items-center space-x-3">
                <Globe className="w-6 h-6 text-duo-green" />
                <h2 className="text-xl font-black text-gray-800 dark:text-white">Learning Language</h2>
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

            {/* Sound & Haptics Section */}
            <div className="p-6 border-2 border-duo-gray dark:border-duo-dark-border rounded-3xl space-y-3 bg-white dark:bg-duo-dark-card">
              <div className="flex items-center space-x-3">
                <Volume2 className="w-6 h-6 text-duo-gold" />
                <h2 className="text-xl font-black text-gray-800 dark:text-white">Sound & Effects</h2>
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

            {/* Account Settings Section */}
            <div className="p-6 border-2 border-duo-gray dark:border-duo-dark-border rounded-3xl space-y-3 bg-white dark:bg-duo-dark-card">
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6 text-duo-blue" />
                <h2 className="text-xl font-black text-gray-800 dark:text-white">Account Details</h2>
              </div>
              <div className="space-y-2 text-sm font-bold text-gray-600 dark:text-gray-300">
                <p>Username: <span className="font-black text-gray-800 dark:text-white">learner1</span></p>
                <p>Email: <span className="font-black text-gray-800 dark:text-white">learner1@duolingo.clone</span></p>
              </div>
            </div>

            {/* Privacy Section */}
            <div className="p-6 border-2 border-duo-gray dark:border-duo-dark-border rounded-3xl space-y-3 bg-white dark:bg-duo-dark-card">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-6 h-6 text-duo-purple" />
                <h2 className="text-xl font-black text-gray-800 dark:text-white">Privacy & Security</h2>
              </div>
              <p className="text-sm font-bold text-gray-500">
                Public Profile: <span className="text-duo-green font-black">Active</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
