'use client';

import React, { useEffect, useState } from 'react';
import { fetchProfile, ProfileData } from '@/lib/api';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { MascotOwl } from '@/components/MascotOwl';
import { Trophy, Flame, Zap, Shield, Calendar, Award } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchProfile();
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <div className="flex min-h-screen bg-white dark:bg-duo-dark text-gray-800 dark:text-gray-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <TopBar
          streak={profile?.stats?.streak}
          xp={profile?.stats?.xp}
          hearts={profile?.stats?.hearts}
          maxHearts={profile?.stats?.max_hearts}
          gems={profile?.stats?.gems}
          onStatsRefresh={loadProfile}
        />

        {loading || !profile ? (
          <div className="flex-1 flex items-center justify-center">
            <MascotOwl emotion="happy" className="animate-bounce" />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full px-6 py-8 space-y-8">
            {/* User Header Profile Card */}
            <div className="flex items-center space-x-6 p-6 bg-gray-50 dark:bg-duo-dark-card border-2 border-duo-gray dark:border-duo-dark-border rounded-3xl">
              <div className="relative">
                <MascotOwl width={90} height={90} emotion="happy" />
                <span className="absolute bottom-0 right-0 bg-duo-gold text-white text-xs font-black px-2 py-0.5 rounded-full">
                  PRO
                </span>
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-gray-800 dark:text-white">
                  {profile.username}
                </h1>
                <p className="text-sm font-bold text-gray-500 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-duo-blue" />
                  <span>Joined {new Date(profile.date_joined).toLocaleDateString()}</span>
                </p>
              </div>
            </div>

            {/* Statistics Grid */}
            <section className="space-y-4">
              <h2 className="text-xl font-black text-gray-800 dark:text-white">Statistics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 border-2 border-duo-gray dark:border-duo-dark-border rounded-2xl flex items-center space-x-3">
                  <Flame className="w-8 h-8 text-orange-500 fill-orange-500" />
                  <div>
                    <span className="block text-2xl font-black">{profile.stats.streak}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase">Day Streak</span>
                  </div>
                </div>

                <div className="p-4 border-2 border-duo-gray dark:border-duo-dark-border rounded-2xl flex items-center space-x-3">
                  <Zap className="w-8 h-8 text-duo-gold fill-duo-gold" />
                  <div>
                    <span className="block text-2xl font-black">{profile.stats.xp}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase">Total XP</span>
                  </div>
                </div>

                <div className="p-4 border-2 border-duo-gray dark:border-duo-dark-border rounded-2xl flex items-center space-x-3">
                  <Trophy className="w-8 h-8 text-duo-blue fill-duo-blue" />
                  <div>
                    <span className="block text-2xl font-black">Gold</span>
                    <span className="text-xs font-bold text-gray-500 uppercase">Current League</span>
                  </div>
                </div>

                <div className="p-4 border-2 border-duo-gray dark:border-duo-dark-border rounded-2xl flex items-center space-x-3">
                  <Shield className="w-8 h-8 text-duo-green fill-duo-green" />
                  <div>
                    <span className="block text-2xl font-black">#3</span>
                    <span className="text-xs font-bold text-gray-500 uppercase">Leaderboard Rank</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Achievements Grid */}
            <section className="space-y-4">
              <h2 className="text-xl font-black text-gray-800 dark:text-white flex items-center space-x-2">
                <Award className="w-6 h-6 text-duo-gold" />
                <span>Achievements</span>
              </h2>

              <div className="space-y-3">
                {profile.achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="p-4 border-2 border-duo-gray dark:border-duo-dark-border rounded-2xl flex items-center space-x-4 bg-white dark:bg-duo-dark-card"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        ach.is_unlocked ? 'bg-duo-gold/20 border-2 border-duo-gold' : 'bg-gray-100 dark:bg-duo-dark-border opacity-50'
                      }`}
                    >
                      <Award className={`w-8 h-8 ${ach.is_unlocked ? 'text-duo-gold' : 'text-gray-400'}`} />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-black text-base text-gray-800 dark:text-white">
                          {ach.title}
                        </h3>
                        <span className="text-xs font-bold text-gray-500">
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
        )}
      </main>
    </div>
  );
}
