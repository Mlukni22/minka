'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Target, CheckCircle2, Calendar, TrendingUp } from 'lucide-react';
import { DailyQuestSystem } from '@/lib/daily-quests';
import { UserProgressionState } from '@/lib/progression';

interface StreakWidgetProps {
  progressionState: UserProgressionState | null;
}

export const StreakWidget: React.FC<StreakWidgetProps> = ({ progressionState }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [dailyGoals, setDailyGoals] = useState<{
    chaptersToday: number;
    questsCompleted: number;
    totalQuests: number;
  }>({ chaptersToday: 0, questsCompleted: 0, totalQuests: 3 });

  useEffect(() => {
    const stats = DailyQuestSystem.getStats();
    setDailyGoals({
      chaptersToday: 0, // This would need to be tracked separately
      questsCompleted: stats.completedToday,
      totalQuests: stats.totalQuests,
    });
  }, [progressionState]);

  if (!progressionState) return null;

  const streak = progressionState.streak || 0;
  const allQuestsCompleted = dailyGoals.questsCompleted === dailyGoals.totalQuests;

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Streak Icon */}
      <motion.div
        className="cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          {/* Animated background glow */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-red-500 blur-lg opacity-50"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Main icon container */}
          <div className="relative bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full p-3 border-2 border-orange-300 dark:border-orange-700 shadow-lg">
            <div className="flex items-center gap-2">
              {/* Fire emoji with animation */}
              <motion.div
                className="text-2xl"
                animate={{
                  rotate: [-5, 5, -5],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                🔥
              </motion.div>
              
              {/* Streak number */}
              <div className="flex flex-col items-center">
                <span className="text-xl font-extrabold text-orange-600 dark:text-orange-400 leading-none">
                  {streak}
                </span>
                <span className="text-[10px] font-medium text-orange-500 dark:text-orange-500 leading-none">
                  day{streak !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Completion indicator */}
            {allQuestsCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1"
              >
                <CheckCircle2 className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 z-50 w-80"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
                <div className="flex items-center gap-3">
                  <Flame className="w-6 h-6" />
                  <div>
                    <h3 className="font-bold text-lg">
                      {streak}-Day Streak!
                    </h3>
                    <p className="text-sm text-white/90">
                      Keep learning every day
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Daily Goals */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-blue-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Today's Goals
                    </h4>
                  </div>

                  {/* Daily Quests Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Daily Quests
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {dailyGoals.questsCompleted} / {dailyGoals.totalQuests}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${(dailyGoals.questsCompleted / dailyGoals.totalQuests) * 100}%` 
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Streak Stats */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Streak Stats
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <StatBox
                      label="Current Streak"
                      value={`${streak} day${streak !== 1 ? 's' : ''}`}
                      icon="🔥"
                    />
                    <StatBox
                      label="Best Streak"
                      value={`${progressionState.bestStreak || streak} days`}
                      icon="⭐"
                    />
                  </div>
                </div>

                {/* Motivation Message */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-3">
                  <p className="text-sm text-center text-gray-700 dark:text-gray-300">
                    {allQuestsCompleted ? (
                      <>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          🎉 All goals completed!
                        </span>
                        <br />
                        Amazing work today!
                      </>
                    ) : streak === 0 ? (
                      <>
                        Start your streak today!
                        <br />
                        Complete a quest to begin.
                      </>
                    ) : streak < 7 ? (
                      <>
                        Great start! Keep it up!
                        <br />
                        {7 - streak} more days to reach 1 week.
                      </>
                    ) : streak < 30 ? (
                      <>
                        You're on fire! 🔥
                        <br />
                        {30 - streak} days to reach 1 month.
                      </>
                    ) : (
                      <>
                        Incredible dedication! 🏆
                        <br />
                        You're a learning champion!
                      </>
                    )}
                  </p>
                </div>

                {/* Time until reset */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>Resets in {DailyQuestSystem.getTimeUntilReset()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper component for stat boxes
interface StatBoxProps {
  label: string;
  value: string;
  icon: string;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, icon }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
        {label}
      </div>
      <div className="text-sm font-bold text-gray-900 dark:text-white">
        {value}
      </div>
    </div>
  );
};

