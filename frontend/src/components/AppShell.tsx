'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { MobileNav } from '@/components/MobileNav';

interface AppShellProps {
  children: React.ReactNode;
  streak?: number;
  xp?: number;
  hearts?: number;
  maxHearts?: number;
  gems?: number;
  onStatsRefresh?: () => void;
}

export function AppShell({
  children,
  streak,
  xp,
  hearts,
  maxHearts,
  gems,
  onStatsRefresh,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-duo-dark text-gray-800 dark:text-gray-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <TopBar
          streak={streak}
          xp={xp}
          hearts={hearts}
          maxHearts={maxHearts}
          gems={gems}
          onStatsRefresh={onStatsRefresh}
        />
        {children}
      </main>

      <MobileNav />
    </div>
  );
}
