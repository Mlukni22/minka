'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Brain, 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  Award, 
  Target,
  BarChart3,
  Clock,
  Star,
  Flame,
  Play,
  CheckCircle,
  Zap,
  Crown,
  Heart,
  ChevronRight
} from 'lucide-react';
import { LevelDisplay, XPNotification, LevelUpNotification } from '@/components/level-display';
import { DailyQuests, QuestCompletionNotification } from '@/components/daily-quests';
import { StreakWidget } from '@/components/streak-widget';
import { HeatmapCalendar } from '@/components/heatmap-calendar';
import { ReviewForecast } from '@/components/review-forecast';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserProgressionState, ProgressionSystem } from '@/lib/progression';
import { LevelSystem } from '@/lib/level-system';
import { DailyQuestSystem, DailyQuest } from '@/lib/daily-quests';
import { FlashcardSystem } from '@/lib/flashcard-system';
import { StoryEngine } from '@/lib/story-engine';
import { Story } from '@/types';

interface DashboardProps {
  user: any;
  progressionState: UserProgressionState | null;
  onNavigateToStory: (story: Story) => void;
  onNavigateToFlashcards: () => void;
  onNavigateToProfile: (page: string) => void;
  onNavigateToRoadmap: () => void;
}

export function Dashboard({ 
  user, 
  progressionState, 
  onNavigateToStory, 
  onNavigateToFlashcards,
  onNavigateToProfile,
  onNavigateToRoadmap
}: DashboardProps) {
  const { t } = useLanguage();
  const [storyEngine] = useState(new StoryEngine());
  const [xpNotification, setXPNotification] = useState<{ amount: number; reason: string } | null>(null);
  const [levelUpNotification, setLevelUpNotification] = useState<number | null>(null);
  const [questNotification, setQuestNotification] = useState<DailyQuest | null>(null);

  // Award XP function
  const awardXP = (amount: number, reason: string) => {
    const result = LevelSystem.addXP(amount, reason);
    if (result.leveledUp && result.newLevel !== undefined) {
      setLevelUpNotification(result.newLevel);
    }
    setXPNotification({ amount, reason });
    setTimeout(() => setXPNotification(null), 3000);
  };

  // Update quest progress
  const updateQuestProgress = (type: 'complete_chapters' | 'review_flashcards' | 'complete_exercises' | 'study_minutes' | 'add_words' | 'perfect_exercises', amount?: number) => {
    const result = DailyQuestSystem.updateQuest(type, amount);
    
    if (result.questCompleted && result.quest) {
      setQuestNotification(result.quest);
      awardXP(result.quest.xpReward, `Quest: ${result.quest.title}`);
    }
  };

  // State for review forecast
  const [reviewForecast, setReviewForecast] = useState<{
    today: Array<{ hour: number; count: number; cumulative: number }>;
    week: Array<{ date: Date; count: number; cumulative: number }>;
    cardsDueNow: number;
  } | null>(null);

  // Load review forecast
  useEffect(() => {
    if (!user?.uid) return;
    
    async function loadForecast() {
      try {
        const { getReviewForecast } = await import('@/lib/db/flashcards');
        const forecast = await getReviewForecast(user.uid);
        // Convert Firestore Timestamps to Dates if needed
        const processedForecast = {
          ...forecast,
          week: forecast.week.map(day => ({
            ...day,
            date: day.date instanceof Date ? day.date : (day.date?.toDate?.() || new Date(day.date)),
            hours: day.hours || [],
          })),
        };
        setReviewForecast(processedForecast);
      } catch (error) {
        console.error('Error loading review forecast:', error);
      }
    }
    
    loadForecast();
  }, [user?.uid]);

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!progressionState) return null;

    const flashcards = FlashcardSystem.loadFlashcards();
    const flashcardStats = FlashcardSystem.getStudyStats();
    
    const stories = progressionState.episodeProgress;
    const completedEpisodes = Object.values(stories).filter(ep => ep.completed).length;
    const totalEpisodes = Object.keys(stories).length;

    const studyTimeMinutes = Math.floor((Date.now() - new Date(progressionState.lastActivityDate || Date.now()).getTime()) / (1000 * 60));

    return {
      currentStreak: progressionState.streak || 0,
      totalXP: progressionState.totalXP || 0,
      wordsLearned: progressionState.wordsLearned || 0,
      wordsRead: progressionState.wordsRead || 0,
      completedEpisodes,
      totalEpisodes,
      studyTimeMinutes,
      flashcardStats
    };
  }, [progressionState]);


  if (!user || !progressionState || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#58CC02] mx-auto mb-4"></div>
          <p className="text-gray-600">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-6">
        {/* Duolingo-style Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#58CC02] rounded-full flex items-center justify-center">
              <span className="text-2xl">🐾</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Minka</h1>
              <p className="text-sm text-gray-600">German Learning</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <StreakWidget progressionState={progressionState} />
            <LevelDisplay compact />
          </div>
        </motion.div>

        {/* Review Forecast Section - Full Width */}
        {reviewForecast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="h-6 w-6" />
                Review Forecast
              </h2>
              <ReviewForecast forecast={reviewForecast} />
            </div>
          </motion.div>
        )}

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Main Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Daily Goal Progress */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Daily Goal</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target className="h-4 w-4" />
                  {stats.flashcardStats.due} due
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Progress Ring */}
                <div className="flex items-center justify-center">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#58CC02"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(stats.flashcardStats.due / Math.max(stats.flashcardStats.due, 1)) * 251.2} 251.2`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-[#58CC02]">
                        {stats.flashcardStats.due}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={onNavigateToFlashcards}
                    className="flex items-center justify-center gap-2 p-4 bg-[#58CC02] text-white rounded-xl hover:bg-[#4BA302] transition-colors font-semibold"
                  >
                    <Play className="h-5 w-5" />
                    Practice
                  </button>
                  <button
                    onClick={() => {
                      const stories = storyEngine.getStories();
                      const nextStory = stories.find(story => {
                        const progress = progressionState.episodeProgress[story.id];
                        return !progress?.completed;
                      });
                      if (nextStory) {
                        onNavigateToStory(nextStory);
                      }
                    }}
                    className="flex items-center justify-center gap-2 p-4 bg-[#1CB0F6] text-white rounded-xl hover:bg-[#0A9DE8] transition-colors font-semibold"
                  >
                    <BookOpen className="h-5 w-5" />
                    Continue
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={<Flame className="h-6 w-6" />}
                label="Streak"
                value={`${stats.currentStreak} days`}
                color="from-[#FF9600] to-[#FFB84D]"
                delay={0.3}
              />
              <StatCard
                icon={<Star className="h-6 w-6" />}
                label="XP"
                value={stats.totalXP}
                color="from-[#58CC02] to-[#7ED321]"
                delay={0.4}
              />
              <StatCard
                icon={<Brain className="h-6 w-6" />}
                label="Learned"
                value={stats.flashcardStats.learned}
                color="from-[#1CB0F6] to-[#4FC3F7]"
                delay={0.5}
              />
              <StatCard
                icon={<BookOpen className="h-6 w-6" />}
                label="Chapters"
                value={`${stats.completedEpisodes}/${stats.totalEpisodes}`}
                color="from-[#CE82FF] to-[#E1A3FF]"
                delay={0.6}
              />
            </div>
          </motion.div>

          {/* Right Column - Roadmap and Quests */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Learning Path Button */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Learning Path
              </h2>
              <div className="text-center">
                <button
                  onClick={onNavigateToRoadmap}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#58CC02] to-[#7ED321] text-white rounded-xl hover:from-[#4BA302] hover:to-[#6BC01A] transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center justify-center gap-3">
                    <BarChart3 className="h-6 w-6" />
                    <span>View Learning Path</span>
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </button>
                <p className="text-sm text-gray-600 mt-3">
                  Explore chapters, track progress, and continue your journey
                </p>
              </div>
            </div>

            {/* Daily Quests */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Daily Quests
              </h2>
              <DailyQuests compact />
            </div>
          </motion.div>
        </div>

        {/* Bottom Section - Additional Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <button
            onClick={() => onNavigateToProfile('progress')}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <TrendingUp className="h-6 w-6 text-[#58CC02]" />
            <div className="text-left">
              <div className="font-semibold text-gray-800">My Progress</div>
              <div className="text-sm text-gray-600">View detailed stats</div>
            </div>
          </button>
          
          <button
            onClick={() => onNavigateToProfile('achievements')}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <Crown className="h-6 w-6 text-[#FF9600]" />
            <div className="text-left">
              <div className="font-semibold text-gray-800">Achievements</div>
              <div className="text-sm text-gray-600">Unlock badges</div>
            </div>
          </button>
          
          <button
            onClick={() => onNavigateToProfile('flashcards')}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <Brain className="h-6 w-6 text-[#1CB0F6]" />
            <div className="text-left">
              <div className="font-semibold text-gray-800">My Flashcards</div>
              <div className="text-sm text-gray-600">Manage vocabulary</div>
            </div>
          </button>
        </motion.div>

        {/* Activity Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <HeatmapCalendar />
        </motion.div>

        {/* Notifications */}
        {xpNotification && (
          <XPNotification 
            amount={xpNotification.amount}
            reason={xpNotification.reason}
            onComplete={() => setXPNotification(null)} 
          />
        )}
        {levelUpNotification && (
          <LevelUpNotification 
            newLevel={levelUpNotification} 
            onComplete={() => setLevelUpNotification(null)} 
          />
        )}
        <QuestCompletionNotification 
          quest={questNotification} 
          onComplete={() => setQuestNotification(null)} 
        />
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  icon, 
  label, 
  value, 
  color, 
  delay = 0 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  color: string; 
  delay?: number; 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-gradient-to-br ${color} rounded-xl p-4 shadow-sm`}
    >
      <div className="flex items-center gap-3">
        <div className="text-white">
          {icon}
        </div>
        <div>
          <div className="text-xs text-white/80 font-medium">
            {label}
          </div>
          <div className="text-lg font-bold text-white">
            {value}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
