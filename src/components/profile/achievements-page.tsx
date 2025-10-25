'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, Lock, TrendingUp } from 'lucide-react';
import { Achievement, AchievementSystem } from '@/lib/achievements';
import { UserProgressionState } from '@/lib/progression';
import { UserFlashcard } from '@/lib/flashcard-system';

interface AchievementsPageProps {
  progressionState: UserProgressionState;
  flashcards: UserFlashcard[];
  onBack: () => void;
}

export function AchievementsPage({ progressionState, flashcards, onBack }: AchievementsPageProps) {
  const achievements = useMemo(() => {
    return AchievementSystem.calculateAchievements(progressionState, flashcards);
  }, [progressionState, flashcards]);

  const stats = useMemo(() => {
    return AchievementSystem.getStats(achievements);
  }, [achievements]);

  const achievementsByCategory = useMemo(() => {
    return {
      episodes: achievements.filter(a => a.category === 'episodes'),
      streak: achievements.filter(a => a.category === 'streak'),
      flashcards: achievements.filter(a => a.category === 'flashcards'),
      practice: achievements.filter(a => a.category === 'practice'),
    };
  }, [achievements]);

  return (
    <div className="min-h-screen bg-[radial-gradient(1000px_500px_at_10%_-10%,#E7F7E8_0%,transparent_60%),radial-gradient(900px_420px_at_90%_-10%,#F1ECFF_0%,transparent_60%),linear-gradient(180deg,#FFF9F3_0%,#FDFBFF_100%)] text-[#2E3A28]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-[#7B6AF5] hover:text-[#6B5AE5] font-semibold transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </button>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#2E3A28]">Achievements</h1>
          <p className="text-[#6A7A6A] mt-2 text-lg">Your learning milestones and badges</p>
        </div>

        {/* Overall Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur rounded-3xl border border-white shadow-[0_20px_60px_rgba(20,12,60,.08)] p-6 md:p-8 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#2E3A28] mb-2">Achievement Progress</h2>
              <p className="text-[#6A7A6A]">
                {stats.unlocked} of {stats.total} achievements unlocked
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-extrabold text-[#7B6AF5] mb-1">
                {stats.percentage}%
              </div>
              <div className="text-sm text-[#6A7A6A]">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 bg-[#F1ECFF] rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.percentage}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-[#FFD7BF] via-[#BCA6FF] to-[#9AD8BA] rounded-full"
            />
          </div>
        </motion.div>

        {/* Recent Unlocks */}
        {stats.recentUnlocks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[#F1ECFF] to-[#E7F7E8] rounded-2xl p-6 mb-6 border border-white"
          >
            <h3 className="text-lg font-bold text-[#2E3A28] mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recently Unlocked
            </h3>
            <div className="flex flex-wrap gap-3">
              {stats.recentUnlocks.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-white rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm"
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <div className="font-semibold text-sm text-[#2E3A28]">{achievement.title}</div>
                    <div className="text-xs text-[#6A7A6A]">
                      {achievement.unlockedAt && new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Achievement Categories */}
        <div className="space-y-8">
          <AchievementSection
            title="Episode Completion"
            icon="🎯"
            achievements={achievementsByCategory.episodes}
            delay={0.4}
          />
          <AchievementSection
            title="Study Streaks"
            icon="🔥"
            achievements={achievementsByCategory.streak}
            delay={0.5}
          />
          <AchievementSection
            title="Flashcard Mastery"
            icon="📚"
            achievements={achievementsByCategory.flashcards}
            delay={0.6}
          />
          <AchievementSection
            title="Practice Excellence"
            icon="⭐"
            achievements={achievementsByCategory.practice}
            delay={0.7}
          />
        </div>
      </div>
    </div>
  );
}

interface AchievementSectionProps {
  title: string;
  icon: string;
  achievements: Achievement[];
  delay: number;
}

function AchievementSection({ title, icon, achievements, delay }: AchievementSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/80 backdrop-blur rounded-3xl border border-white shadow-[0_20px_60px_rgba(20,12,60,.08)] p-6 md:p-8"
    >
      <h2 className="text-2xl font-bold text-[#2E3A28] mb-6 flex items-center gap-2">
        <span className="text-3xl">{icon}</span>
        {title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement, index) => (
          <AchievementCard key={achievement.id} achievement={achievement} index={index} />
        ))}
      </div>
    </motion.div>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
  index: number;
}

function AchievementCard({ achievement, index }: AchievementCardProps) {
  const isLocked = !achievement.unlocked;
  const hasProgress = achievement.progress !== undefined && achievement.total !== undefined;
  const progressPercent = hasProgress
    ? Math.round((achievement.progress! / achievement.total!) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-2xl p-5 border-2 transition-all ${
        isLocked
          ? 'bg-gray-50 border-gray-200 opacity-60'
          : 'bg-gradient-to-br from-[#F7F5FF] to-[#FFF9F3] border-[#E1D9FF] shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`text-4xl ${isLocked ? 'grayscale' : ''}`}>
          {isLocked ? <Lock className="h-10 w-10 text-gray-400" /> : achievement.icon}
        </div>
        {achievement.unlocked && (
          <div className="bg-[#E7F7E8] text-[#41AD83] px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Award className="h-3 w-3" />
            Unlocked
          </div>
        )}
      </div>

      <h3 className={`font-bold text-lg mb-1 ${isLocked ? 'text-gray-600' : 'text-[#2E3A28]'}`}>
        {achievement.title}
      </h3>
      <p className={`text-sm mb-3 ${isLocked ? 'text-gray-500' : 'text-[#6A7A6A]'}`}>
        {achievement.description}
      </p>

      {hasProgress && !achievement.unlocked && (
        <div>
          <div className="flex items-center justify-between text-xs text-[#6A7A6A] mb-1">
            <span>Progress</span>
            <span className="font-bold">
              {achievement.progress} / {achievement.total}
            </span>
          </div>
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#BCA6FF] to-[#7B6AF5] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {achievement.unlocked && achievement.unlockedAt && (
        <div className="text-xs text-[#6A7A6A] mt-2">
          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
        </div>
      )}
    </motion.div>
  );
}

