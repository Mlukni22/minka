import React from 'react';
import { motion } from 'framer-motion';
import { Story } from '@/types';
import { ProgressionSystem, UserProgressionState } from '@/lib/progression';
import { Button } from '@/components/layout';
import { Lock, CheckCircle, PlayCircle, ArrowRight, Home } from 'lucide-react';

interface EpisodeSelectorProps {
  stories: Story[];
  progressionState: UserProgressionState;
  onSelectEpisode: (episodeId: string) => void;
  onBack: () => void;
}

export function EpisodeSelector({ stories, progressionState, onSelectEpisode, onBack }: EpisodeSelectorProps) {
  const stats = ProgressionSystem.getProgressionStats(progressionState);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F5F0] via-[#F3ECF9] to-[#E8DDF2] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#4B3F72]">Your Learning Journey</h1>
              <p className="text-[#5E548E] mt-2">
                {stats.completedEpisodes} of {stats.totalEpisodes} episodes completed
              </p>
            </div>
            <Button
              onClick={onBack}
              variant="outline"
              className="border-[#6D5B95]/30 text-[#6D5B95]"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>

          {/* Overall Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-sm text-[#6D5B95] mb-2">
              <span>Overall Progress</span>
              <span>{Math.round(stats.overallProgress)}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-4 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#BCA6FF] to-[#D9EDE6] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${stats.overallProgress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-gradient-to-br from-[#E8F6EB] to-[#D9EDE6] rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-[#2F6045]">{stats.unlockedEpisodes}</div>
              <div className="text-xs text-[#3E5C4A]">Unlocked</div>
            </div>
            <div className="bg-gradient-to-br from-[#FFF1E5] to-[#FCE0D8] rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-[#6E4D2B]">{stats.completedEpisodes}</div>
              <div className="text-xs text-[#6E4D2B]">Completed</div>
            </div>
            <div className="bg-gradient-to-br from-[#EEE9FF] to-[#E8DDF2] rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-[#4E4789]">{progressionState.totalXP}</div>
              <div className="text-xs text-[#4E4789]">Total XP</div>
            </div>
          </div>
        </motion.div>

        {/* Episode List */}
        <div className="space-y-4">
          {stories.map((story, index) => {
            const displayInfo = ProgressionSystem.getEpisodeDisplayInfo(
              story.id,
              progressionState,
              story
            );

            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg transition-all ${
                  displayInfo.isLocked 
                    ? 'opacity-60' 
                    : 'hover:shadow-xl hover:scale-[1.02]'
                }`}
              >
                <div className="flex items-start gap-6">
                  {/* Episode Number Badge */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${
                    displayInfo.isCompleted
                      ? 'bg-green-100 text-green-700'
                      : displayInfo.isLocked
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-[#BCA6FF] text-white'
                  }`}>
                    {displayInfo.isCompleted ? (
                      <CheckCircle className="h-8 w-8" />
                    ) : displayInfo.isLocked ? (
                      <Lock className="h-8 w-8" />
                    ) : (
                      index
                    )}
                  </div>

                  {/* Episode Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-[#4B3F72] mb-1">
                          {story.title}
                        </h3>
                        <p className="text-[#5E548E] text-sm mb-2">
                          {story.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-[#6D5B95]">
                          <span className="flex items-center gap-1">
                            📚 {story.chapters.length} chapters
                          </span>
                          <span className="flex items-center gap-1">
                            ⏱️ {story.estimatedTime} min
                          </span>
                          <span className="flex items-center gap-1">
                            📊 {story.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        displayInfo.isCompleted
                          ? 'bg-green-100 text-green-700'
                          : displayInfo.isLocked
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-[#BCA6FF]/20 text-[#4B3F72]'
                      }`}>
                        {displayInfo.statusText}
                      </div>
                    </div>

                    {/* Progress Bar (if started) */}
                    {!displayInfo.isLocked && displayInfo.progress > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-[#6D5B95] mb-1">
                          <span>Progress</span>
                          <span>{Math.round(displayInfo.progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#BCA6FF] to-[#A794FF] rounded-full transition-all duration-500"
                            style={{ width: `${displayInfo.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="flex gap-2">
                      {displayInfo.canStart && (
                        <Button
                          onClick={() => onSelectEpisode(story.id)}
                          className="bg-[#BCA6FF] hover:bg-[#A794FF] text-white"
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          {displayInfo.progress > 0 ? 'Continue' : 'Start Episode'}
                        </Button>
                      )}
                      {displayInfo.isCompleted && (
                        <Button
                          onClick={() => onSelectEpisode(story.id)}
                          variant="outline"
                          className="border-[#6D5B95]/30 text-[#6D5B95]"
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      )}
                      {displayInfo.isLocked && (
                        <div className="text-sm text-gray-500 italic">
                          Complete previous episodes to unlock
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Motivational Message */}
        {stats.completedEpisodes > 0 && stats.completedEpisodes < stats.totalEpisodes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 bg-gradient-to-r from-[#FCE0D8] to-[#E8DDF2] rounded-2xl p-6 text-center"
          >
            <div className="text-4xl mb-2">🌟</div>
            <h3 className="text-xl font-bold text-[#4B3F72] mb-2">
              Great Progress!
            </h3>
            <p className="text-[#5E548E]">
              You've completed {stats.completedEpisodes} episode{stats.completedEpisodes > 1 ? 's' : ''}! 
              Keep going to unlock more adventures with Minka.
            </p>
          </motion.div>
        )}

        {/* All Complete Message */}
        {stats.completedEpisodes === stats.totalEpisodes && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 bg-gradient-to-r from-[#D9EDE6] to-[#BCA6FF] rounded-2xl p-8 text-center"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-[#4B3F72] mb-2">
              Congratulations!
            </h3>
            <p className="text-[#5E548E] text-lg">
              You've completed all episodes! You're now fluent in Minka's world. 
              Feel free to review any episode or continue practicing vocabulary.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

