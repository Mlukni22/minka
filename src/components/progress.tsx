'use client';

import { motion } from 'framer-motion';
import { UserProgress } from '@/types';
import { Card, ProgressBar } from './layout';
import { FadeIn, Pulse } from './animations';

interface ProgressOverviewProps {
  progress: UserProgress;
}

export function ProgressOverview({ progress }: ProgressOverviewProps) {
  const totalStories = 2; // Based on our current stories
  const completedStories = progress.completedStories.length;
  const storyProgress = (completedStories / totalStories) * 100;

  const vocabularyMastered = Object.values(progress.vocabularyProgress)
    .filter(vp => vp.mastered).length;
  const totalVocabulary = Object.keys(progress.vocabularyProgress).length;
  const vocabularyProgress = totalVocabulary > 0 ? (vocabularyMastered / totalVocabulary) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <div className="text-center">
          <div className="text-3xl mb-2">🔥</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Streak</h3>
          <div className="text-3xl font-bold text-orange-600">
            {progress.streak}
          </div>
          <p className="text-sm text-gray-500">days in a row</p>
        </div>
      </Card>

      <Card>
        <div className="text-center">
          <div className="text-3xl mb-2">⭐</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Total XP</h3>
          <div className="text-3xl font-bold text-amber-600">
            {progress.totalXP}
          </div>
          <p className="text-sm text-gray-500">experience points</p>
        </div>
      </Card>

      <Card>
        <div className="text-center">
          <div className="text-3xl mb-2">📚</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Stories</h3>
          <div className="text-3xl font-bold text-green-600">
            {completedStories}/{totalStories}
          </div>
          <p className="text-sm text-gray-500">completed</p>
        </div>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress Overview</h3>
        <div className="space-y-4">
          <div>
            <ProgressBar 
              progress={storyProgress} 
              label="Story Completion"
            />
          </div>
          <div>
            <ProgressBar 
              progress={vocabularyProgress} 
              label="Vocabulary Mastery"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

interface StreakVisualizationProps {
  streak: number;
  maxStreak?: number;
}

export function StreakVisualization({ streak, maxStreak = 30 }: StreakVisualizationProps) {
  const flameIntensity = Math.min(streak / maxStreak, 1);
  
  return (
    <Card className="text-center">
      <Pulse>
        <div className="text-6xl mb-4" style={{ 
          filter: `brightness(${0.5 + flameIntensity * 0.5}) saturate(${1 + flameIntensity})` 
        }}>
          🔥
        </div>
      </Pulse>
      
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        {streak} Day Streak!
      </h3>
      
      <p className="text-gray-600 mb-4">
        Keep learning to maintain your streak!
      </p>
      
      <div className="w-full bg-gray-200 rounded-full h-3">
        <motion.div 
          className="h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(streak / maxStreak) * 100}%` }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>0</span>
        <span>{maxStreak} days</span>
      </div>
    </Card>
  );
}

interface VocabularyProgressProps {
  vocabularyProgress: Record<string, VocabularyProgressItem>;
}

interface VocabularyProgressItem {
  mastered: boolean;
  totalAttempts: number;
}

export function VocabularyProgress({ vocabularyProgress }: VocabularyProgressProps) {
  const progressItems = Object.values(vocabularyProgress) as VocabularyProgressItem[];
  const mastered = progressItems.filter((item) => item.mastered).length;
  const learning = progressItems.filter((item) => !item.mastered && item.totalAttempts > 0).length;
  const newWords = progressItems.filter((item) => item.totalAttempts === 0).length;

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Vocabulary Progress</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl mb-1">🆕</div>
          <div className="text-xl font-bold text-blue-600">{newWords}</div>
          <div className="text-xs text-gray-500">New Words</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl mb-1">📖</div>
          <div className="text-xl font-bold text-yellow-600">{learning}</div>
          <div className="text-xs text-gray-500">Learning</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-xl font-bold text-green-600">{mastered}</div>
          <div className="text-xs text-gray-500">Mastered</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Mastery Progress</span>
          <span>{Math.round((mastered / progressItems.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div 
            className="h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(mastered / progressItems.length) * 100}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
      </div>
    </Card>
  );
}

interface DailyGoalProps {
  dailyGoal: number; // in minutes
  timeSpent: number; // in minutes
}

export function DailyGoal({ dailyGoal, timeSpent }: DailyGoalProps) {
  const progress = Math.min((timeSpent / dailyGoal) * 100, 100);
  const isCompleted = timeSpent >= dailyGoal;

  return (
    <Card className={`${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
      <div className="text-center">
        <div className="text-3xl mb-2">{isCompleted ? '🎉' : '🎯'}</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Daily Goal</h3>
        
        <div className="text-2xl font-bold text-gray-800 mb-2">
          {timeSpent} / {dailyGoal} min
        </div>
        
        <ProgressBar 
          progress={progress} 
          className="mb-2"
        />
        
        <p className="text-sm text-gray-500">
          {isCompleted 
            ? 'Goal completed! Great job! 🎉' 
            : `${dailyGoal - timeSpent} minutes remaining`
          }
        </p>
      </div>
    </Card>
  );
}
