'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { MobileNav } from '@/components/MobileNav';
import { fetchDashboard, getCachedStats, UserStats } from '@/lib/api';

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
  const pathname = usePathname();
  const [cachedStats, setCachedStats] = useState<UserStats | null>(() => getCachedStats());

  const syncFromCache = useCallback(() => {
    const stats = getCachedStats();
    if (stats) setCachedStats(stats);
  }, []);

  useEffect(() => {
    syncFromCache();
  }, [pathname, syncFromCache]);

  const handleStatsRefresh = useCallback(async () => {
    onStatsRefresh?.();
    try {
      const data = await fetchDashboard();
      setCachedStats(data.stats);
    } catch {
      syncFromCache();
    }
  }, [onStatsRefresh, syncFromCache]);

  return (
    <div className="flex min-h-screen bg-white dark:bg-duo-dark text-gray-800 dark:text-gray-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <TopBar
          streak={streak ?? cachedStats?.streak}
          xp={xp ?? cachedStats?.xp}
          hearts={hearts ?? cachedStats?.hearts}
          maxHearts={maxHearts ?? cachedStats?.max_hearts}
          gems={gems ?? cachedStats?.gems}
          onStatsRefresh={handleStatsRefresh}
        />
        {children}
      </main>

      <MobileNav />
    </div>
  );
}
