'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  fetchDashboard,
  getCachedDashboard,
  consumeLessonCompleteHighlight,
  syncDashboardFromCache,
  getCachedSkillLesson,
  stageSkillLesson,
  cacheSkillLesson,
  Unit,
  Skill,
  UserStats,
  prefetchSkillLesson,
} from '@/lib/api';
import { AppShell } from '@/components/AppShell';
import PathSkeleton from '@/components/PathSkeleton';
import { useAuth } from '@/context/AuthContext';
import { Lock, Crown, Star, Play, Zap, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const cached = getCachedDashboard();
  const [units, setUnits] = useState<Unit[]>(() => cached?.path ?? []);
  const [stats, setStats] = useState<UserStats | null>(() => cached?.stats ?? null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [legendaryMode, setLegendaryMode] = useState(false);
  const [pathLoading, setPathLoading] = useState(() => !(cached?.path?.length));
  const [error, setError] = useState('');
  const [highlightSkillId, setHighlightSkillId] = useState<number | null>(null);

  const syncFromCache = useCallback(() => {
    const fresh = syncDashboardFromCache();
    if (fresh) {
      setUnits(fresh.path);
      setStats(fresh.stats);
    }
  }, []);

  const loadData = useCallback(async () => {
    setError('');
    try {
      const data = await fetchDashboard();
      setUnits(data.path);
      setStats(data.stats);
    } catch (err) {
      console.error('Error loading home data:', err);
      setError((prev) => prev || (err instanceof Error ? err.message : 'Failed to load learning path.'));
    } finally {
      setPathLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    syncFromCache();
    loadData();
  }, [authLoading, user, loadData, syncFromCache]);

  useEffect(() => {
    const highlight = consumeLessonCompleteHighlight();
    if (highlight?.nextSkillId) {
      setHighlightSkillId(highlight.nextSkillId);
      syncFromCache();
      const timer = setTimeout(() => setHighlightSkillId(null), 4000);
      return () => clearTimeout(timer);
    }
    if (highlight) syncFromCache();
  }, [syncFromCache]);

  useEffect(() => {
    if (selectedSkill) {
      if (selectedSkill.lesson?.exercises?.length) {
        cacheSkillLesson(selectedSkill.id, selectedSkill.lesson);
      } else {
        prefetchSkillLesson(selectedSkill.id);
      }
    }
  }, [selectedSkill]);

  const handleStartLesson = () => {
    if (!selectedSkill) return;
    const lesson =
      selectedSkill.lesson ??
      getCachedSkillLesson(selectedSkill.id);
    if (lesson?.exercises?.length) {
      stageSkillLesson(selectedSkill.id, lesson);
    }
    setSelectedSkill(null);
    router.push(
      `/lesson/${selectedSkill.id}${legendaryMode ? '?legendary=true' : ''}`
    );
  };

  const PATH_OFFSETS = [0, -58, -36, 0, 36, 58, 36, 0, -36, -58];
  const PATH_ROW_HEIGHT = 108;
  const PATH_CENTER_X = 140;

  const getHorizontalOffset = (index: number) =>
    PATH_OFFSETS[index % PATH_OFFSETS.length];

  const buildSkillPath = (count: number) => {
    if (count < 2) return '';
    const nodeY = (i: number) => 40 + i * PATH_ROW_HEIGHT;
    const nodeX = (i: number) => PATH_CENTER_X + getHorizontalOffset(i);
    let d = '';
    for (let i = 0; i < count - 1; i++) {
      const x1 = nodeX(i);
      const y1 = nodeY(i);
      const x2 = nodeX(i + 1);
      const y2 = nodeY(i + 1);
      const midY = (y1 + y2) / 2;
      d += `M ${x1} ${y1} C ${x1} ${midY} ${x2} ${midY} ${x2} ${y2} `;
    }
    return d.trim();
  };

  const showPath = units.length > 0;

  return (
    <AppShell
      streak={stats?.streak}
      xp={stats?.xp}
      hearts={stats?.hearts}
      maxHearts={stats?.max_hearts}
      gems={stats?.gems}
      onStatsRefresh={loadData}
    >
      {pathLoading && !showPath ? (
        <PathSkeleton />
      ) : error && !showPath ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-20 px-6 text-center">
          <p className="font-extrabold text-lg text-gray-700 dark:text-gray-200">{error}</p>
          <button onClick={loadData} className="btn-duo btn-duo-green px-6 py-3 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      ) : (
        <div className="flex-1 max-w-4xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-8 flex flex-col items-center">
          <div className="w-full mb-6 sm:mb-8 p-3 sm:p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-duo-gold rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
            <div className="flex items-center space-x-3">
              <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-duo-gold fill-duo-gold shrink-0" />
              <div>
                <h3 className="font-black text-sm sm:text-base text-amber-900 dark:text-amber-200">
                  Legendary Challenge Mode
                </h3>
                <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
                  Earn double XP (+20 XP) with strict timer constraints!
                </p>
              </div>
            </div>
            <button
              onClick={() => setLegendaryMode(!legendaryMode)}
              className={`btn-duo px-4 py-2 text-xs w-full sm:w-auto ${
                legendaryMode ? 'btn-duo-gold' : 'btn-duo-gray'
              }`}
            >
              {legendaryMode ? 'LEGENDARY ON' : 'ENABLE'}
            </button>
          </div>

          <div className="w-full space-y-10 sm:space-y-12 flex flex-col items-center">
            {units.map((unit) => (
                <div
                  key={unit.id}
                  className="w-full flex flex-col items-center"
                >
                  <div className="duo-unit-banner w-full max-w-lg mb-6 sm:mb-8 shadow-lg">
                    <div
                      style={{ backgroundColor: unit.hex_color }}
                      className="px-4 sm:px-6 py-4 sm:py-5 text-white text-center"
                    >
                      <span className="inline-block px-3 py-1 bg-black/25 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-widest mb-2">
                        Unit {unit.order}
                      </span>
                      <h2 className="text-lg sm:text-xl font-black mb-1">{unit.title}</h2>
                      <p className="font-bold text-xs sm:text-sm text-white/90">{unit.description}</p>
                    </div>
                  </div>

                <div
                  className="relative w-full max-w-[280px] mx-auto py-2"
                  style={{
                    minHeight: unit.skills.length * PATH_ROW_HEIGHT + 24,
                  }}
                >
                  {unit.skills.length > 1 && (
                    <svg
                      className="absolute left-1/2 top-2 -translate-x-1/2 w-[280px] pointer-events-none overflow-visible"
                      style={{ height: unit.skills.length * PATH_ROW_HEIGHT + 24 }}
                      viewBox={`0 0 280 ${unit.skills.length * PATH_ROW_HEIGHT + 24}`}
                      aria-hidden
                    >
                      <path
                        d={buildSkillPath(unit.skills.length)}
                        fill="none"
                        className="stroke-[#37464F] dark:stroke-[#37464F]"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}

                  <div className="relative z-10 flex flex-col items-center">
                  {unit.skills.map((skill, sIdx) => {
                    const offset = getHorizontalOffset(sIdx);
                    const isNext = skill.is_unlocked && !skill.is_completed && skill.completed_lessons === 0;
                    const isNewlyUnlocked = highlightSkillId === skill.id;

                    return (
                      <div
                        key={skill.id}
                        style={{
                          transform: `translateX(${offset}px)`,
                          height: PATH_ROW_HEIGHT,
                        }}
                        className="relative flex flex-col items-center justify-start group transition-transform duration-300"
                      >
                        {(isNext || isNewlyUnlocked) && (
                          <div className={`absolute -top-10 sm:-top-12 z-20 bg-white dark:bg-duo-dark-card border-2 border-duo-green px-3 py-1 rounded-xl shadow-md font-black text-xs text-duo-green flex items-center space-x-1.5 ${isNewlyUnlocked ? 'animate-bounce-in' : 'animate-bounce'}`}>
                            <span>{isNewlyUnlocked ? 'UNLOCKED!' : 'START'}</span>
                            <Play className="w-3 h-3 fill-duo-green" />
                          </div>
                        )}

                        <button
                          onClick={() => {
                            if (skill.is_unlocked) setSelectedSkill(skill);
                          }}
                          disabled={!skill.is_unlocked}
                          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center relative border-b-[5px] transition-all duration-500 ${
                            skill.is_completed
                              ? 'bg-duo-gold border-yellow-600 text-white shadow-lg hover:scale-105'
                              : skill.is_unlocked
                              ? `bg-duo-green border-green-700 text-white shadow-lg hover:scale-105 ${isNewlyUnlocked ? 'animate-unlock-pop' : 'animate-pulse-glow'}`
                              : 'bg-[#37464F] border-[#2B3B42] text-[#52656D] cursor-not-allowed opacity-70'
                          }`}
                        >
                          {skill.is_completed ? (
                            <Crown className="w-8 h-8 sm:w-10 sm:h-10 fill-white" />
                          ) : skill.is_unlocked ? (
                            <Star className="w-8 h-8 sm:w-10 sm:h-10 fill-white" />
                          ) : (
                            <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
                          )}

                          {skill.is_unlocked && (
                            <span className="absolute -bottom-1 -right-1 bg-white dark:bg-duo-dark border-2 border-duo-gold text-duo-gold text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow">
                              {skill.current_crown}
                            </span>
                          )}
                        </button>

                        <span className="mt-2 font-black text-xs sm:text-sm tracking-wide text-gray-700 dark:text-gray-200 text-center max-w-[120px]">
                          {skill.title}
                        </span>
                      </div>
                    );
                  })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
              Crown {selectedSkill.current_crown} / {selectedSkill.total_crowns} • Lesson{' '}
              {selectedSkill.completed_lessons + 1} of {selectedSkill.total_lessons}
            </p>

            <div className="w-full bg-gray-200 dark:bg-duo-dark-border h-3.5 rounded-full overflow-hidden mb-6">
              <div
                style={{
                  width: `${(selectedSkill.completed_lessons / selectedSkill.total_lessons) * 100}%`,
                }}
                className="bg-duo-green h-full transition-all duration-500"
              />
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleStartLesson}
                className="w-full btn-duo btn-duo-green py-3 text-lg flex items-center justify-center space-x-2"
              >
                <Zap className="w-5 h-5 fill-white" />
                <span>START +{legendaryMode ? 20 : 10} XP</span>
              </button>
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
    </AppShell>
  );
}
