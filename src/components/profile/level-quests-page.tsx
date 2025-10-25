'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, TrendingUp, Zap } from 'lucide-react';
import { LevelDisplay } from '@/components/level-display';
import { DailyQuests } from '@/components/daily-quests';
import { LevelSystem } from '@/lib/level-system';

interface LevelQuestsPageProps {
  onBack: () => void;
}

export const LevelQuestsPage: React.FC<LevelQuestsPageProps> = ({ onBack }) => {
  const xpHistory = LevelSystem.getXPHistory();
  const recentHistory = xpHistory.slice(0, 20);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Level & Progress</h1>
            <p className="text-gray-600 mt-1">Track your learning journey and complete daily quests</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Level Display */}
          <LevelDisplay showTitle />

          {/* Daily Quests */}
          <DailyQuests />
        </div>

        {/* XP History */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          </div>

          {recentHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No activity yet. Complete chapters and exercises to earn XP!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentHistory.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white fill-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.reason}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-amber-600">
                      +{item.amount} XP
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Level Milestones */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            Level Milestones
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { level: 5, title: 'Eager Learner' },
              { level: 10, title: 'Dedicated Student' },
              { level: 15, title: 'Intermediate Speaker' },
              { level: 20, title: 'Advanced Student' },
              { level: 30, title: 'Fluent Learner' },
              { level: 40, title: 'Expert Speaker' },
              { level: 50, title: 'German Master' },
            ].map((milestone) => {
              const levelData = LevelSystem.getLevelData();
              const achieved = levelData.level >= milestone.level;
              
              return (
                <div
                  key={milestone.level}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    achieved
                      ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300'
                      : 'bg-gray-50 border-gray-200 opacity-50'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${achieved ? 'text-purple-600' : 'text-gray-400'}`}>
                      {milestone.level}
                    </div>
                    <div className={`text-xs mt-1 ${achieved ? 'text-purple-700' : 'text-gray-500'}`}>
                      {milestone.title}
                    </div>
                    {achieved && (
                      <Award className="w-5 h-5 mx-auto mt-2 text-purple-500 fill-purple-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

