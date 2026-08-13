'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  fetchLeaderboard,
  getCachedLeaderboard,
  getCachedStats,
  normalizeLeaderboardEntries,
  LeaderboardEntry,
  UserStats,
} from '@/lib/api';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Trophy, Shield, Zap, Clock } from 'lucide-react';

function LeaderboardSkeleton() {
  return (
    <div className="max-w-3xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-8 space-y-6 animate-pulse">
      <div className="h-36 bg-amber-200/60 dark:bg-amber-900/30 rounded-3xl" />
      <div className="border-2 border-duo-gray dark:border-duo-dark-border rounded-3xl overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 border-b border-duo-gray dark:border-duo-dark-border bg-gray-100 dark:bg-duo-dark-card" />
        ))}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => getCachedLeaderboard() ?? []);
  const [stats, setStats] = useState<UserStats | null>(() => getCachedStats());
  const [loading, setLoading] = useState(() => !(getCachedLeaderboard()?.length));

  const loadData = useCallback(async () => {
    try {
      const lbData = normalizeLeaderboardEntries(await fetchLeaderboard());
      setEntries(lbData);
      const cachedStats = getCachedStats();
      if (cachedStats) setStats(cachedStats);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    loadData();
  }, [authLoading, user, loadData]);

  const showContent = entries.length > 0;
  const leagueName = 'Gold';

  return (
    <AppShell
      streak={stats?.streak}
      xp={stats?.xp}
      hearts={stats?.hearts}
      maxHearts={stats?.max_hearts}
      gems={stats?.gems}
      onStatsRefresh={loadData}
    >
      {loading && !showContent ? (
        <LeaderboardSkeleton />
      ) : (
        <div className="max-w-3xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          <div className="bg-gradient-to-r from-amber-400 to-yellow-500 rounded-3xl p-4 sm:p-6 text-white text-center shadow-lg relative overflow-hidden flex flex-col items-center">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 fill-white text-yellow-600 mb-2 animate-bounce" />
            <h1 className="text-2xl sm:text-3xl font-black mb-1">{leagueName} League</h1>
            <p className="font-bold text-xs sm:text-sm text-yellow-100 flex items-center space-x-1">
              <Clock className="w-4 h-4 inline shrink-0" />
              <span>Ends in 3 days • Top 3 advance to Sapphire League!</span>
            </p>
          </div>

          <div className="border-2 border-duo-gray dark:border-duo-dark-border rounded-3xl overflow-hidden bg-white dark:bg-duo-dark-card shadow-sm">
            <div className="p-3 sm:p-4 bg-gray-50 dark:bg-duo-dark-card border-b-2 border-duo-gray dark:border-duo-dark-border grid grid-cols-12 font-black text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">
              <span className="col-span-2 text-center">Rank</span>
              <span className="col-span-7">Learner</span>
              <span className="col-span-3 text-right">Weekly XP</span>
            </div>

            <div className="divide-y-2 divide-duo-gray dark:divide-duo-dark-border">
              {entries.map((entry, idx) => {
                const rank = idx + 1;
                const isCurrentLearner = entry.username === user?.username;

                return (
                  <div
                    key={entry.id || `${entry.username}-${rank}`}
                    className={`p-3 sm:p-4 grid grid-cols-12 items-center font-bold text-sm sm:text-base transition-colors ${
                      isCurrentLearner ? 'bg-blue-50 dark:bg-blue-950/40 text-duo-blue' : 'hover:bg-gray-50 dark:hover:bg-duo-dark/50'
                    }`}
                  >
                    <div className="col-span-2 flex items-center justify-center space-x-1">
                      {rank === 1 ? (
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-duo-gold" />
                      ) : rank === 2 ? (
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-gray-400" />
                      ) : rank === 3 ? (
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-amber-700" />
                      ) : (
                        <span className="font-black text-gray-500">{rank}</span>
                      )}
                    </div>

                    <div className="col-span-7 flex items-center space-x-2 sm:space-x-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full bg-duo-green/20 border-2 border-duo-green flex items-center justify-center font-black text-duo-green uppercase text-xs sm:text-sm">
                        {entry.username.charAt(0)}
                      </div>
                      <span className="font-extrabold text-gray-800 dark:text-white truncate">
                        {entry.username} {isCurrentLearner && '(You)'}
                      </span>
                    </div>

                    <div className="col-span-3 text-right flex items-center justify-end space-x-1 text-duo-gold font-black text-xs sm:text-base">
                      <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-duo-gold shrink-0" />
                      <span>{entry.weekly_xp}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
