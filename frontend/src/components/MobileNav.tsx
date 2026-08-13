'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, User, Settings } from 'lucide-react';

const navItems = [
  { label: 'Learn', href: '/', icon: Home },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-duo-dark border-t-2 border-duo-gray dark:border-duo-dark-border safe-area-bottom">
      <div className="grid grid-cols-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2.5 px-1 transition-colors ${
                isActive
                  ? 'text-duo-blue'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className="text-[10px] font-black uppercase tracking-wide mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
