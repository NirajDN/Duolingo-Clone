'use client';

import React, { useState } from 'react';
import { Flame, Zap, Heart, Gem, Moon, Sun } from 'lucide-react';
import { refillHearts } from '@/lib/api';

interface TopBarProps {
  streak?: number;
  xp?: number;
  hearts?: number;
  maxHearts?: number;
  gems?: number;
  onStatsRefresh?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  streak = 0,
  xp = 0,
  hearts = 5,
  maxHearts = 5,
  gems = 500,
  onStatsRefresh,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showHeartModal, setShowHeartModal] = useState(false);
  const [loadingRefill, setLoadingRefill] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleRefill = async () => {
    try {
      setLoadingRefill(true);
      await refillHearts();
      if (onStatsRefresh) onStatsRefresh();
      setShowHeartModal(false);
    } catch (err) {
      console.error('Failed to refill hearts:', err);
    } finally {
      setLoadingRefill(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 bg-white dark:bg-duo-dark border-b-2 border-duo-gray dark:border-duo-dark-border">
        {/* Left: Language Course Switcher + mobile logo */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-duo-dark-card px-2 sm:px-3 py-1.5 rounded-2xl transition-colors">
            <span className="text-xl sm:text-2xl">🇪🇸</span>
            <span className="font-extrabold text-xs sm:text-sm tracking-wider uppercase text-gray-700 dark:text-gray-200">
              Spanish
            </span>
          </div>
        </div>

        {/* Right: Gamification Indicators */}
        <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 font-extrabold text-xs sm:text-sm md:text-base">
          {/* Streak Flame */}
          <div className="flex items-center space-x-1 text-orange-500 hover:scale-105 transition-transform cursor-default" title="Daily Streak">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 fill-orange-500 stroke-orange-600 animate-pulse" />
            <span>{streak}</span>
          </div>

          {/* XP Total */}
          <div className="flex items-center space-x-1 text-duo-gold hover:scale-105 transition-transform cursor-default" title="Total XP">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-duo-gold stroke-yellow-600" />
            <span>{xp}</span>
          </div>

          {/* Hearts Counter */}
          <div
            onClick={() => setShowHeartModal(true)}
            className="flex items-center space-x-1 text-duo-red cursor-pointer hover:scale-105 transition-transform bg-red-50 dark:bg-red-950/40 px-1.5 sm:px-2.5 py-1 rounded-xl border border-red-200 dark:border-red-900/50"
            title="Hearts (Click to Refill)"
          >
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-duo-red stroke-red-600" />
            <span>{hearts}/{maxHearts}</span>
          </div>

          {/* Gems - hidden on very small screens */}
          <div className="hidden sm:flex items-center space-x-1.5 text-duo-blue hover:scale-105 transition-transform cursor-default" title="Gems">
            <Gem className="w-6 h-6 fill-duo-blue stroke-blue-600" />
            <span>{gems}</span>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 sm:p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-duo-dark-card transition-colors"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-duo-gold" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </header>

      {/* Hearts Refill Modal */}
      {showHeartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-duo-dark-card border-4 border-duo-gray dark:border-duo-dark-border rounded-3xl max-w-md w-full p-6 text-center shadow-2xl relative">
            <div className="w-20 h-20 mx-auto mb-4 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 fill-duo-red text-duo-red animate-bounce" />
            </div>

            <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">
              Need More Hearts?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 font-bold mb-6">
              Hearts allow you to keep practicing. Refill your hearts instantly to keep learning without waiting!
            </p>

            <div className="space-y-3">
              <button
                onClick={handleRefill}
                disabled={loadingRefill}
                className="w-full btn-duo btn-duo-green py-3 text-lg"
              >
                {loadingRefill ? 'Refilling...' : 'REFILL HEARTS NOW (FREE)'}
              </button>
              <button
                onClick={() => setShowHeartModal(false)}
                className="w-full btn-duo btn-duo-gray py-3 text-base"
              >
                NO THANKS
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
