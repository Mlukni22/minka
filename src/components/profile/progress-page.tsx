'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, BookOpen, Calendar, Clock, Flame, Star, TrendingUp, Brain, Eye } from 'lucide-react';
import { UserProgressionState, ProgressionSystem } from '@/lib/progression';
import { Story } from '@/types';
import { FlashcardSystem } from '@/lib/flashcard-system';
import { HeatmapCalendar } from '@/components/heatmap-calendar';

interface ProgressPageProps {
  progressionState: UserProgressionState;
  stories: Story[];
  onBack: () => void;
}

export function ProgressPage({ progressionState, stories, onBack }: ProgressPageProps) {
  const stats = useMemo(() => {
    const episodes = Object.values(progressionState.episodeProgress);
    const totalEpisodes = episodes.length;
    const completedEpisodes = episodes.filter(e => e.completed).length;
    const totalChapters = episodes.reduce((sum, e) => sum + e.totalChapters, 0);
    const completedChapters = episodes.reduce((sum, e) => sum + e.chaptersCompleted, 0);
    const overallProgress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

    // Get words statistics
    const wordStats = ProgressionSystem.getWordsStats(progressionState);
    
    // Get flashcard count
    const flashcards = FlashcardSystem.loadFlashcards();
    const flashcardCount = flashcards.length;

    return {
      totalEpisodes,
      completedEpisodes,
      totalChapters,
      completedChapters,
      overallProgress,
      totalXP: progressionState.totalXP,
      currentStreak: progressionState.streak,
      wordsLearned: Math.max(wordStats.wordsLearned, flashcardCount), // Use flashcard count if higher
      wordsRead: wordStats.wordsRead,
    };
  }, [progressionState]);

  // Calculate study time (mock for now - would need to track actual time)
  const studyTimeMinutes = stats.completedChapters * 15; // Estimate 15min per chapter

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
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#2E3A28]">My Progress</h1>
          <p className="text-[#6A7A6A] mt-2 text-lg">Track your German learning journey</p>
        </div>

        {/* Overall Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur rounded-3xl border border-white shadow-[0_20px_60px_rgba(20,12,60,.08)] p-6 md:p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#2E3A28]">Overall Progress</h2>
              <p className="text-[#6A7A6A]">{stats.completedChapters} of {stats.totalChapters} chapters completed</p>
            </div>
            <div className="text-5xl font-extrabold text-[#7B6AF5]">
              {stats.overallProgress}%
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="bg-[#F1ECFF] rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.overallProgress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-[#BCA6FF] via-[#9AD8BA] to-[#7B6AF5] rounded-full"
            />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard
            icon={<Flame className="h-6 w-6" />}
            label="Current Streak"
            value={`${stats.currentStreak} days`}
            color="from-[#FFD7BF] to-[#FFA96E]"
            delay={0.3}
          />
          <StatCard
            icon={<Star className="h-6 w-6" />}
            label="Total XP"
            value={stats.totalXP}
            color="from-[#F1ECFF] to-[#CBB8FF]"
            delay={0.4}
          />
          <StatCard
            icon={<Brain className="h-6 w-6" />}
            label="Words Learned"
            value={stats.wordsLearned}
            color="from-[#D4F0FF] to-[#9AD8FF]"
            delay={0.45}
          />
          <StatCard
            icon={<Eye className="h-6 w-6" />}
            label="Words Read"
            value={stats.wordsRead}
            color="from-[#FFE9F5] to-[#FFB8D9]"
            delay={0.5}
          />
          <StatCard
            icon={<BookOpen className="h-6 w-6" />}
            label="Episodes"
            value={`${stats.completedEpisodes}/${stats.totalEpisodes}`}
            color="from-[#E7F7E8] to-[#9AD8BA]"
            delay={0.55}
          />
          <StatCard
            icon={<Clock className="h-6 w-6" />}
            label="Study Time"
            value={`${studyTimeMinutes} min`}
            color="from-[#FFF0DC] to-[#FFD8BF]"
            delay={0.6}
          />
        </div>

        {/* Episodes Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/80 backdrop-blur rounded-3xl border border-white shadow-[0_20px_60px_rgba(20,12,60,.08)] p-6 md:p-8"
        >
          <h2 className="text-2xl font-bold text-[#2E3A28] mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Episode Progress
          </h2>

          <div className="space-y-4">
            {stories.map((story, index) => {
              const progress = progressionState.episodeProgress[story.id];
              if (!progress) return null;

              const percentage = progress.totalChapters > 0
                ? Math.round((progress.chaptersCompleted / progress.totalChapters) * 100)
                : 0;

              return (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="bg-[#F7F5FF] rounded-2xl p-5 border border-[#E1D9FF]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-[#2E3A28] text-lg">{story.title}</h3>
                      <p className="text-sm text-[#6A7A6A] mt-1">
                        {progress.chaptersCompleted} of {progress.totalChapters} chapters
                      </p>
                    </div>
                    {progress.completed && (
                      <div className="flex items-center gap-1 bg-[#E7F7E8] text-[#41AD83] px-3 py-1 rounded-full text-sm font-semibold">
                        <Award className="h-4 w-4" />
                        Completed
                      </div>
                    )}
                  </div>

                  {/* Episode Progress Bar */}
                  <div className="relative">
                    <div className="bg-[#EDEAFF] rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.9 + index * 0.1 }}
                        className="h-full bg-gradient-to-r from-[#7B6AF5] to-[#9AD8BA] rounded-full"
                      />
                    </div>
                    <span className="absolute -top-6 right-0 text-sm font-bold text-[#7B6AF5]">
                      {percentage}%
                    </span>
                  </div>

                  {progress.completedAt && (
                    <div className="flex items-center gap-2 mt-3 text-xs text-[#6A7A6A]">
                      <Calendar className="h-3 w-3" />
                      Completed on {new Date(progress.completedAt).toLocaleDateString()}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Activity Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-8"
        >
          <HeatmapCalendar />
        </motion.div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  delay: number;
}

function StatCard({ icon, label, value, color, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-gradient-to-br ${color} rounded-2xl p-5 shadow-[0_8px_20px_rgba(20,12,60,.06)]`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-[#2E3A28] opacity-70">{icon}</div>
      </div>
      <div className="text-2xl font-extrabold text-[#2E3A28] mb-1">{value}</div>
      <div className="text-xs text-[#2E3A28]/70 font-medium">{label}</div>
    </motion.div>
  );
}

