'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, TrendingUp } from 'lucide-react';
import { LevelSystem, LevelData } from '@/lib/level-system';

interface LevelDisplayProps {
  compact?: boolean;
  showTitle?: boolean;
}

export const LevelDisplay: React.FC<LevelDisplayProps> = ({ compact = false, showTitle = true }) => {
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const data = LevelSystem.getLevelData();
    setLevelData(data);
    setProgress(LevelSystem.getLevelProgress());
  }, []);

  if (!levelData) return null;

  const levelTitle = LevelSystem.getLevelTitle(levelData.level);

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg px-4 py-2 border border-amber-500/20">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold shadow-lg">
          {levelData.level}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
            Level {levelData.level}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {levelData.currentXP} / {levelData.xpForNextLevel} XP
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-amber-200 dark:border-amber-900/30 shadow-lg">
      <div className="flex items-start gap-4">
        {/* Level Badge */}
        <div className="relative">
          <motion.div
            className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 text-white font-bold text-3xl shadow-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {levelData.level}
          </motion.div>
          <div className="absolute -top-1 -right-1">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />
          </div>
        </div>

        {/* Level Info */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Level {levelData.level}
          </h3>
          {showTitle && (
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-3 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {levelTitle}
            </p>
          )}

          {/* XP Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {levelData.currentXP} / {levelData.xpForNextLevel} XP
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {levelData.xpForNextLevel - levelData.currentXP} XP until next level
            </p>
          </div>

          {/* Total XP */}
          <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-900/30">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-gray-700 dark:text-gray-300">
                Total XP: <span className="font-bold text-amber-600 dark:text-amber-400">{levelData.totalXP.toLocaleString()}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// XP Gain Notification Component
interface XPNotificationProps {
  amount: number;
  reason: string;
  onComplete: () => void;
}

export const XPNotification: React.FC<XPNotificationProps> = ({ amount, reason, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3">
        <Zap className="w-5 h-5 fill-white" />
        <div>
          <div className="font-bold text-lg">+{amount} XP</div>
          <div className="text-xs opacity-90">{reason}</div>
        </div>
      </div>
    </motion.div>
  );
};

// Level Up Notification Component
interface LevelUpNotificationProps {
  newLevel: number;
  onComplete: () => void;
}

export const LevelUpNotification: React.FC<LevelUpNotificationProps> = ({ newLevel, onComplete }) => {
  const levelTitle = LevelSystem.getLevelTitle(newLevel);

  const handleClick = (e: React.MouseEvent) => {
    console.log('Level up notification clicked!', { newLevel, event: e.type });
    e.preventDefault();
    e.stopPropagation();
    onComplete();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
      console.log('Level up notification key pressed!', e.key);
      e.preventDefault();
      e.stopPropagation();
      onComplete();
    }
  };

  useEffect(() => {
    console.log('Level up notification mounted!', { newLevel, levelTitle });
    
    // Focus the notification for keyboard accessibility
    const notificationElement = document.querySelector('[role="dialog"]') as HTMLElement;
    if (notificationElement) {
      notificationElement.focus();
    }
    
    const timer = setTimeout(() => {
      console.log('Level up notification auto-dismissed after 4 seconds');
      onComplete();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete, newLevel, levelTitle]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-pointer"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-up-title"
    >
      <div
        className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-2xl p-8 text-center shadow-2xl max-w-md cursor-pointer"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <Star className="w-20 h-20 text-white fill-white mx-auto mb-4" />
        
        <h2 id="level-up-title" className="text-4xl font-bold text-white mb-2">Level Up!</h2>
        <div className="text-6xl font-bold text-white mb-4">{newLevel}</div>
        <p className="text-xl text-white/90 font-medium">{levelTitle}</p>
        <p className="text-lg text-white/90 mt-4 font-medium animate-pulse">Click anywhere to continue</p>
      </div>
    </div>
  );
};

