'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, User, Settings, Sparkles } from 'lucide-react';
import { MascotOwl } from './MascotOwl';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'LEARN', href: '/', icon: Home, color: 'text-duo-green' },
    { label: 'LEADERBOARD', href: '/leaderboard', icon: Trophy, color: 'text-duo-gold' },
    { label: 'PROFILE', href: '/profile', icon: User, color: 'text-duo-blue' },
    { label: 'SETTINGS', href: '/settings', icon: Settings, color: 'text-gray-400' },
  ];

  return (
    <aside className="w-64 hidden md:flex flex-col border-r-2 border-duo-gray dark:border-duo-dark-border h-screen sticky top-0 bg-white dark:bg-duo-dark p-4 z-40">
      {/* Brand Header */}
      <Link href="/" className="flex items-center space-x-3 px-3 py-4 mb-4 hover:opacity-90 transition-opacity">
        <MascotOwl width={44} height={44} emotion="happy" />
        <span className="font-black text-2xl tracking-wider text-duo-green dark:text-duo-green">
          duolingo
        </span>
      </Link>

      {/* Navigation Links */}
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-4 px-4 py-3.5 rounded-2xl font-extrabold text-sm tracking-wider transition-all ${
                isActive
                  ? 'bg-blue-50 dark:bg-duo-dark-card border-2 border-duo-blue text-duo-blue'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-duo-dark-card'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-duo-blue' : item.color}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Info Card */}
      <div className="p-4 bg-green-50 dark:bg-duo-dark-card border-2 border-duo-green/30 rounded-2xl text-center space-y-2">
        <div className="flex justify-center">
          <Sparkles className="w-6 h-6 text-duo-gold animate-spin" />
        </div>
        <p className="font-extrabold text-xs text-duo-green uppercase tracking-wider">
          Legendary Status
        </p>
        <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
          Complete skills to unlock special crown challenges!
        </p>
      </div>
    </aside>
  );
};
