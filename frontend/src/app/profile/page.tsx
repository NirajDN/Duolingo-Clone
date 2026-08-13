'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fetchProfile, getCachedProfile, ProfileData } from '@/lib/api';
import { AppShell } from '@/components/AppShell';
import { MascotOwl } from '@/components/MascotOwl';
import { useAuth } from '@/context/AuthContext';
import { Trophy, Flame, Zap, Shield, Calendar, Award } from 'lucide-react';

function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-8 space-y-6 animate-pulse">
      <div className="h-32 bg-gray-200 dark:bg-duo-dark-card rounded-3xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-duo-dark-card rounded-2xl" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-duo-dark-card rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(() => getCachedProfile());
  const [loading, setLoading] = useState(() => !getCachedProfile());

  const loadProfile = useCallback(async () => {
    try {
      const data = await fetchProfile();
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    loadProfile();
  }, [authLoading, user, loadProfile]);

  const showContent = profile !== null;

  return (
    <AppShell
      streak={profile?.stats?.streak}
      xp={profile?.stats?.xp}
      hearts={profile?.stats?.hearts}
      maxHearts={profile?.stats?.max_hearts}
      gems={profile?.stats?.gems}
      onStatsRefresh={loadProfile}
    >
      {loading && !showContent ? (
        <ProfileSkeleton />
      ) : profile ? (
        <div className="max-w-4xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-gray-50 dark:bg-duo-dark-card border-2 border-duo-gray dark:border-duo-dark-border rounded-3xl">
            <div className="relative self-center sm:self-auto">
              <MascotOwl width={90} height={90} emotion="happy" />
              <span className="absolute bottom-0 right-0 bg-duo-gold text-white text-xs font-black px-2 py-0.5 rounded-full">
                PRO
              </span>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white">
                {profile.username}
              </h1>
              <p className="text-sm font-bold text-gray-500 flex items-center justify-center sm:justify-start space-x-1.5">
                <Calendar className="w-4 h-4 text-duo-blue" />
                <span>Joined {new Date(profile.date_joined).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-800 dark:text-white">Statistics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 border-2 border-duo-gray dark:border-duo-dark-border rounded-2xl flex items-center space-x-2 sm:space-x-3">
                <Flame className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500 fill-orange-500 shrink-0" />
                <div>
                  <span className="block text-xl sm:text-2xl font-black">{profile.stats.streak}</span>
                  <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Day Streak</span>
                </div>
              </div>

              <div className="p-3 sm:p-4 border-2 border-duo-gray dark:border-duo-dark-border rounded-2xl flex items-center space-x-2 sm:space-x-3">
                <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-duo-gold fill-duo-gold shrink-0" />
                <div>
                  <span className="block text-xl sm:text-2xl font-black">{profile.stats.xp}</span>
                  <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Total XP</span>
                </div>
              </div>

              <div className="p-3 sm:p-4 border-2 border-duo-gray dark:border-duo-dark-border rounded-2xl flex items-center space-x-2 sm:space-x-3">
                <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-duo-blue fill-duo-blue shrink-0" />
                <div>
                  <span className="block text-xl sm:text-2xl font-black">
                    {profile.leaderboard?.league ?? 'Gold'}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Current League</span>
                </div>
              </div>

              <div className="p-3 sm:p-4 border-2 border-duo-gray dark:border-duo-dark-border rounded-2xl flex items-center space-x-2 sm:space-x-3">
                <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-duo-green fill-duo-green shrink-0" />
                <div>
                  <span className="block text-xl sm:text-2xl font-black">
                    #{profile.leaderboard?.rank ?? '—'}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Leaderboard Rank</span>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-800 dark:text-white flex items-center space-x-2">
              <Award className="w-6 h-6 text-duo-gold" />
              <span>Achievements</span>
            </h2>

            <div className="space-y-3">
              {profile.achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-3 sm:p-4 border-2 border-duo-gray dark:border-duo-dark-border rounded-2xl flex items-center space-x-3 sm:space-x-4 bg-white dark:bg-duo-dark-card"
                >
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl flex items-center justify-center ${
                      ach.is_unlocked ? 'bg-duo-gold/20 border-2 border-duo-gold' : 'bg-gray-100 dark:bg-duo-dark-border opacity-50'
                    }`}
                  >
                    <Award className={`w-7 h-7 sm:w-8 sm:h-8 ${ach.is_unlocked ? 'text-duo-gold' : 'text-gray-400'}`} />
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <h3 className="font-black text-sm sm:text-base text-gray-800 dark:text-white truncate">
                        {ach.title}
                      </h3>
                      <span className="text-xs font-bold text-gray-500 shrink-0">
                        {ach.current_progress} / {ach.max_progress}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      {ach.description}
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-duo-dark-border h-2.5 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min(100, (ach.current_progress / ach.max_progress) * 100)}%`,
                        }}
                        className="bg-duo-gold h-full transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}
