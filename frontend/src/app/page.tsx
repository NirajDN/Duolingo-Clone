'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchPath, fetchUserStats, Unit, Skill, UserStats } from '@/lib/api';
import { TopBar } from '@/components/TopBar';
import { Sidebar } from '@/components/Sidebar';
import { MascotOwl } from '@/components/MascotOwl';
import { Lock, Crown, Star, Play, CheckCircle2, Zap } from 'lucide-react';

export default function HomePage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [legendaryMode, setLegendaryMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pathData, statsData] = await Promise.all([fetchPath(), fetchUserStats()]);
      setUnits(pathData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading home data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute snaking horizontal offset for skill nodes in order
  const getHorizontalOffset = (index: number) => {
    const offsets = [0, -45, -30, 0, 30, 45, 20, 0, -25];
    return offsets[index % offsets.length];
  };

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
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-20">
            <MascotOwl emotion="happy" className="animate-bounce" width={100} height={100} />
            <p className="font-extrabold text-xl text-duo-green">Loading your learning path...</p>
          </div>
        ) : (
          <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 flex flex-col items-center">
            {/* Legendary Challenge Banner Toggle */}
            <div className="w-full mb-8 p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-duo-gold rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <Crown className="w-8 h-8 text-duo-gold fill-duo-gold" />
                <div>
                  <h3 className="font-black text-base text-amber-900 dark:text-amber-200">
                    Legendary Challenge Mode
                  </h3>
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
                    Earn double XP (+20 XP) with strict timer constraints!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLegendaryMode(!legendaryMode)}
                className={`btn-duo px-4 py-2 text-xs ${
                  legendaryMode ? 'btn-duo-gold' : 'btn-duo-gray'
                }`}
              >
                {legendaryMode ? 'LEGENDARY ON' : 'ENABLE'}
              </button>
            </div>

            {/* Units & Serpentine Skill Path */}
            <div className="w-full space-y-12 flex flex-col items-center">
              {units.map((unit) => (
                <div key={unit.id} className="w-full flex flex-col items-center">
                  {/* Unit Header Card */}
                  <div
                    style={{ backgroundColor: unit.hex_color }}
                    className="w-full max-w-lg rounded-3xl p-6 text-white shadow-lg mb-10 text-center relative overflow-hidden"
                  >
                    <div className="relative z-10">
                      <span className="inline-block px-3 py-1 bg-black/20 rounded-full font-black text-xs uppercase tracking-widest mb-2">
                        Unit {unit.order}
                      </span>
                      <h2 className="text-2xl font-black mb-1">{unit.title}</h2>
                      <p className="font-bold text-sm text-white/90">{unit.description}</p>
                    </div>
                  </div>

                  {/* Serpentine Skill Path Bubbles */}
                  <div className="flex flex-col items-center space-y-7 relative py-4">
                    {unit.skills.map((skill, sIdx) => {
                      const offset = getHorizontalOffset(sIdx);
                      const isNext = skill.is_unlocked && !skill.is_completed && skill.completed_lessons === 0;

                      return (
                        <div
                          key={skill.id}
                          style={{ transform: `translateX(${offset}px)` }}
                          className="relative flex flex-col items-center group transition-transform duration-300"
                        >
                          {/* Active / Next floating Mascot Tooltip */}
                          {isNext && (
                            <div className="absolute -top-12 z-20 bg-white dark:bg-duo-dark-card border-2 border-duo-green px-3 py-1 rounded-xl shadow-md font-black text-xs text-duo-green flex items-center space-x-1.5 animate-bounce">
                              <span>START</span>
                              <Play className="w-3 h-3 fill-duo-green" />
                            </div>
                          )}

                          {/* Skill Bubble Button */}
                          <button
                            onClick={() => {
                              if (skill.is_unlocked) setSelectedSkill(skill);
                            }}
                            disabled={!skill.is_unlocked}
                            className={`w-20 h-20 rounded-full flex items-center justify-center relative border-b-4 transition-all ${
                              skill.is_completed
                                ? 'bg-duo-gold border-yellow-600 text-white shadow-lg hover:scale-105'
                                : skill.is_unlocked
                                ? 'bg-duo-green border-green-700 text-white shadow-lg hover:scale-105 animate-pulse-glow'
                                : 'bg-gray-200 dark:bg-duo-dark-card border-gray-400 dark:border-duo-dark-border text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {skill.is_completed ? (
                              <Crown className="w-10 h-10 fill-white" />
                            ) : skill.is_unlocked ? (
                              <Star className="w-10 h-10 fill-white" />
                            ) : (
                              <Lock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            )}

                            {/* Crown Level Indicator Ring */}
                            {skill.is_unlocked && (
                              <span className="absolute -bottom-1 -right-1 bg-white dark:bg-duo-dark border-2 border-duo-gold text-duo-gold text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow">
                                {skill.current_crown}
                              </span>
                            )}
                          </button>

                          {/* Skill Label */}
                          <span className="mt-2 font-black text-sm tracking-wide text-gray-700 dark:text-gray-200 text-center max-w-[120px]">
                            {skill.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skill Start Popover Modal */}
        {selectedSkill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-duo-dark-card border-4 border-duo-green rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-950/40 rounded-full flex items-center justify-center border-4 border-duo-green">
                {selectedSkill.is_completed ? (
                  <Crown className="w-10 h-10 text-duo-gold fill-duo-gold" />
                ) : (
                  <Star className="w-10 h-10 text-duo-green fill-duo-green" />
                )}
              </div>

              <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-1">
                {selectedSkill.title}
              </h2>
              <p className="font-bold text-sm text-gray-500 dark:text-gray-400 mb-4">
                Crown {selectedSkill.current_crown} / {selectedSkill.total_crowns} • Lesson {selectedSkill.completed_lessons + 1} of {selectedSkill.total_lessons}
              </p>

              {/* Progress Bar inside modal */}
              <div className="w-full bg-gray-200 dark:bg-duo-dark-border h-3.5 rounded-full overflow-hidden mb-6">
                <div
                  style={{
                    width: `${((selectedSkill.completed_lessons) / selectedSkill.total_lessons) * 100}%`,
                  }}
                  className="bg-duo-green h-full transition-all duration-500"
                />
              </div>

              <div className="space-y-3">
                <Link
                  href={`/lesson/${selectedSkill.id}${legendaryMode ? '?legendary=true' : ''}`}
                  className="w-full btn-duo btn-duo-green py-3 text-lg flex items-center justify-center space-x-2"
                >
                  <Zap className="w-5 h-5 fill-white" />
                  <span>START +{legendaryMode ? 20 : 10} XP</span>
                </Link>
                <button
                  onClick={() => setSelectedSkill(null)}
                  className="w-full btn-duo btn-duo-gray py-2.5 text-sm"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
