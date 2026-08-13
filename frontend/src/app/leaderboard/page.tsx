'use client';

import React, { useEffect, useState } from 'react';
import { fetchLeaderboard, fetchUserStats, LeaderboardEntry, UserStats } from '@/lib/api';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { MascotOwl } from '@/components/MascotOwl';
import { Trophy, Shield, Zap, ChevronUp, Clock } from 'lucide-react';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lbData, statsData] = await Promise.all([fetchLeaderboard(), fetchUserStats()]);
      setEntries(lbData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex min-h-screen bg-white dark:bg-duo-dark text-gray-800 dark:text-gray-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <TopBar
          streak={stats?.streak}
          xp={stats?.xp}
          hearts={stats?.hearts}
          maxHearts={stats?.max_hearts}
          gems={stats?.gems}
          onStatsRefresh={loadData}
        />

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <MascotOwl emotion="happy" className="animate-bounce" />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full px-6 py-8 space-y-8">
            {/* Banner Header */}
            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 rounded-3xl p-6 text-white text-center shadow-lg relative overflow-hidden flex flex-col items-center">
              <Trophy className="w-16 h-16 fill-white text-yellow-600 mb-2 animate-bounce" />
              <h1 className="text-3xl font-black mb-1">Gold League</h1>
              <p className="font-bold text-sm text-yellow-100 flex items-center space-x-1">
                <Clock className="w-4 h-4 inline" />
                <span>Ends in 3 days • Top 3 advance to Sapphire League!</span>
              </p>
            </div>

            {/* Leaderboard Table List */}
            <div className="border-2 border-duo-gray dark:border-duo-dark-border rounded-3xl overflow-hidden bg-white dark:bg-duo-dark-card shadow-sm">
              <div className="p-4 bg-gray-50 dark:bg-duo-dark-card border-b-2 border-duo-gray dark:border-duo-dark-border grid grid-cols-12 font-black text-xs text-gray-500 uppercase tracking-wider">
                <span className="col-span-2 text-center">Rank</span>
                <span className="col-span-7">Learner</span>
                <span className="col-span-3 text-right">Weekly XP</span>
              </div>

              <div className="divide-y-2 divide-duo-gray dark:divide-duo-dark-border">
                {entries.map((entry, idx) => {
                  const rank = idx + 1;
                  const isCurrentLearner = entry.username === 'learner1';

                  return (
                    <div
                      key={entry.id || idx}
                      className={`p-4 grid grid-cols-12 items-center font-bold text-base transition-colors ${
                        isCurrentLearner ? 'bg-blue-50 dark:bg-blue-950/40 text-duo-blue' : 'hover:bg-gray-50 dark:hover:bg-duo-dark/50'
                      }`}
                    >
                      {/* Rank Column */}
                      <div className="col-span-2 flex items-center justify-center space-x-1">
                        {rank <= 3 ? (
                          <Shield
                            className={`w-6 h-6 fill-current ${
                              rank === 1 ? 'text-duo-gold' : rank === 2 ? 'text-gray-400' : 'text-amber-700'
                            }`}
                          />
                        ) : (
                          <span className="font-black text-gray-500">{rank}</span>
                        )}
                      </div>

                      {/* Learner Column */}
                      <div className="col-span-7 flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-duo-green/20 border-2 border-duo-green flex items-center justify-center font-black text-duo-green uppercase text-sm">
                          {entry.username.charAt(0)}
                        </div>
                        <span className="font-extrabold text-gray-800 dark:text-white">
                          {entry.username} {isCurrentLearner && '(You)'}
                        </span>
                      </div>

                      {/* XP Column */}
                      <div className="col-span-3 text-right flex items-center justify-end space-x-1 text-duo-gold font-black">
                        <Zap className="w-4 h-4 fill-duo-gold" />
                        <span>{entry.weekly_xp} XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
