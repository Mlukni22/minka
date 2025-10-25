'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Sparkles, Award } from 'lucide-react';
import { DailyQuestSystem, DailyQuest } from '@/lib/daily-quests';

interface DailyQuestsProps {
  compact?: boolean;
}

export const DailyQuests: React.FC<DailyQuestsProps> = ({ compact = false }) => {
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [timeUntilReset, setTimeUntilReset] = useState('');
  const [completedAnimation, setCompletedAnimation] = useState(false);

  useEffect(() => {
    loadQuests();
    
    // Update time every minute
    const interval = setInterval(() => {
      setTimeUntilReset(DailyQuestSystem.getTimeUntilReset());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadQuests = () => {
    const dailyQuests = DailyQuestSystem.getDailyQuests();
    setQuests(dailyQuests);
    setTimeUntilReset(DailyQuestSystem.getTimeUntilReset());

    // Check if all completed for animation
    if (DailyQuestSystem.allQuestsCompleted()) {
      setCompletedAnimation(true);
      setTimeout(() => setCompletedAnimation(false), 3000);
    }
  };

  const stats = DailyQuestSystem.getStats();
  const allCompleted = stats.completedToday === stats.totalQuests;

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg px-4 py-3 border border-blue-500/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              Daily Quests
            </span>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {stats.completedToday}/{stats.totalQuests}
          </span>
        </div>
        <div className="flex gap-1">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className={`flex-1 h-2 rounded-full ${
                quest.completed
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-blue-200 dark:border-blue-900/30 shadow-lg relative overflow-hidden">
      {/* Background decoration */}
      {completedAnimation && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2 }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-500" />
            Daily Quests
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {allCompleted ? (
              <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                <Award className="w-4 h-4" />
                All quests completed! 🎉
              </span>
            ) : (
              `Complete quests to earn bonus XP`
            )}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Resets in</span>
          </div>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {timeUntilReset}
          </div>
        </div>
      </div>

      {/* Quest List */}
      <div className="space-y-3 relative z-10">
        {quests.map((quest, index) => (
          <QuestCard key={quest.id} quest={quest} index={index} />
        ))}
      </div>

      {/* Progress Summary */}
      <div className="mt-6 pt-6 border-t border-blue-200 dark:border-blue-900/30 relative z-10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700 dark:text-gray-300">
            Completed Today
          </span>
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {stats.completedToday} / {stats.totalQuests}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${(stats.completedToday / stats.totalQuests) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
};

// Individual Quest Card Component
interface QuestCardProps {
  quest: DailyQuest;
  index: number;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, index }) => {
  const progress = Math.min((quest.current / quest.target) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-lg p-4 border-2 transition-all ${
        quest.completed
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-500/50'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon & Status */}
        <div className="flex-shrink-0 mt-1">
          {quest.completed ? (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          ) : (
            <Circle className="w-6 h-6 text-gray-400" />
          )}
        </div>

        {/* Quest Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{quest.icon}</span>
              <h4 className={`font-bold ${
                quest.completed ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-white'
              }`}>
                {quest.title}
              </h4>
            </div>
            <span className="flex-shrink-0 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded">
              +{quest.xpReward} XP
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {quest.description}
          </p>

          {/* Progress Bar */}
          {!quest.completed && (
            <div className="mt-3">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  {quest.current} / {quest.target}
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {quest.completed && (
            <div className="mt-2 text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
              <Award className="w-3 h-3" />
              Quest completed!
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Quest Completion Notification
interface QuestCompletionProps {
  quest: DailyQuest | null;
  onComplete: () => void;
}

export const QuestCompletionNotification: React.FC<QuestCompletionProps> = ({ quest, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!quest) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-20 right-4 z-50"
    >
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 rounded-xl shadow-xl max-w-sm">
        <div className="flex items-start gap-3">
          <Award className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <div className="font-bold text-lg">Quest Complete!</div>
            <div className="text-sm opacity-90">{quest.title}</div>
            <div className="text-xs mt-2 bg-white/20 rounded px-2 py-1 inline-block">
              +{quest.xpReward} XP
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

