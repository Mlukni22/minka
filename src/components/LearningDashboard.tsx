'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Flame, User, BookOpen, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LearningDashboardProps {
  userName?: string;
  xp?: number;
  level?: number;
  wordsToReview?: number;
  fullyLearnedWords?: number;
  startedLearningWords?: number;
  storiesCompleted?: number;
  currentStoryId?: string;
  currentChapterNumber?: number;
}

export default function LearningDashboard({
  userName = 'Maria',
  xp = 0,
  level = 1,
  wordsToReview = 0,
  fullyLearnedWords = 0,
  startedLearningWords = 0,
  storiesCompleted = 0,
  currentStoryId,
  currentChapterNumber = 1,
}: LearningDashboardProps) {
  const [selectedArc, setSelectedArc] = useState(1);
  const arcs = [1, 2, 3, 4, 5];

  // Calculate progress percentage correctly
  // Each level requires 100 XP
  // Level 1: 0-100 XP, Level 2: 100-200 XP, etc.
  const xpForCurrentLevel = (level - 1) * 100; // XP at start of current level
  const xpForNextLevel = level * 100; // XP needed for next level
  const xpInCurrentLevel = xp - xpForCurrentLevel; // XP earned in current level
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel; // XP needed for current level (always 100)
  const progressPercentage = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100));

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5e5e5] px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/images/logo.png"
              alt="Minka"
              width={40}
              height={40}
              className="h-8 w-8 object-contain"
            />
            <div>
              <h1 className="text-lg font-semibold text-[#111111]">
                Hallo, {userName} 👋
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-[#ff6b35]" />
              <span className="text-sm font-medium text-[#111111]">0</span>
            </div>
            <Link href="/profile" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="h-8 w-8 rounded-full bg-[#e5e5e5] flex items-center justify-center cursor-pointer hover:bg-[#d5d5d5] transition-colors">
                <User className="h-5 w-5 text-[#666]" />
              </div>
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-7xl mx-auto mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#111111]">{xp} XP</span>
            <span className="text-sm font-medium text-[#111111]">Level {level}</span>
          </div>
          <div className="w-full h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4a90e2] transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </header>

      {/* Arc Navigation */}
      <nav className="bg-white border-b border-[#e5e5e5] px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {arcs.map((arc) => (
            <button
              key={arc}
              onClick={() => setSelectedArc(arc)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedArc === arc
                  ? 'bg-[#2c2c2c] text-white'
                  : 'text-[#2c2c2c] hover:bg-[#f5f5f5]'
              }`}
            >
              Arc {arc}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Wavy Path Section */}
        <div className="bg-[#f9f9f9] rounded-2xl p-8 mb-8 relative overflow-hidden min-h-[200px]">
          {/* Wavy path with nodes */}
          <div className="relative w-full h-32 mb-8">
            <svg
              viewBox="0 0 800 120"
              className="w-full h-full absolute top-0 left-0"
              preserveAspectRatio="none"
            >
              <path
                d="M 0,60 Q 150,20 300,60 T 600,60 T 800,60"
                stroke="#4a90e2"
                strokeWidth="3"
                fill="none"
                className="opacity-40"
              />
            </svg>
            
            {/* Nodes positioned along the path - all centered on the line */}
            <div className="relative w-full h-full">
              {[1, 2, 3, 4, 5].map((node, index) => {
                const positions = [
                  { left: '5%' },
                  { left: '25%' },
                  { left: '50%' },
                  { left: '75%' },
                  { left: '95%' },
                ];
                const pos = positions[index];
                // Determine state: active (current), completed (before active), locked (after active)
                // Active node is based on stories completed (1 story = node 1, 2 stories = node 2, etc.)
                // If no stories completed, node 1 is active
                const activeNode = Math.max(1, Math.min(5, storiesCompleted + 1));
                const isActive = node === activeNode;
                const isCompleted = node < activeNode;
                const isLocked = node > activeNode;
                
                return (
                  <div
                    key={node}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: pos.left, top: '50%' }}
                  >
                    <div
                      className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center transition-all relative ${
                        isActive
                          ? 'border-2 border-[#4a90e2] bg-white shadow-lg ring-4 ring-[#4a90e2]/20'
                          : isCompleted
                          ? 'bg-[#4a90e2] border-2 border-[#4a90e2]'
                          : 'bg-[#d5d5d5] border-2 border-[#d5d5d5]'
                      }`}
                    >
                      {isActive ? (
                        <span className="text-[#4a90e2] text-sm sm:text-base font-bold">{node}</span>
                      ) : isCompleted ? (
                        <svg className="h-6 w-6 sm:h-7 sm:w-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 sm:h-6 sm:w-6 text-[#999]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review Section */}
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-base text-[#2c2c2c] mb-4">
                {wordsToReview > 0 ? (
                  <>You have <strong>{wordsToReview}</strong> words to review</>
                ) : (
                  <>No reviews due. Great job! 🐾</>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/practice">
                <Button
                  variant="secondary"
                  className="bg-white border border-[#e5e5e5] text-[#2c2c2c] hover:bg-[#f5f5f5]"
                  disabled={wordsToReview === 0}
                >
                  Review words
                </Button>
              </Link>
              <Link href={currentStoryId ? `/stories/${currentStoryId}/chapters/${currentChapterNumber}` : '/dashboard'}>
                <Button
                  variant="accent"
                  className="bg-[#2c2c2c] text-white hover:bg-[#1a1a1a]"
                  disabled={!currentStoryId}
                >
                  Start Story
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Fully Learned Card */}
          <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
            <h3 className="text-sm font-medium text-[#666] mb-3">
              You&apos;ve fully learned
            </h3>
            <p className="text-3xl font-bold text-[#2c2c2c] mb-4">
              {fullyLearnedWords} words so far.
            </p>
          </div>

          {/* Started Learning Card */}
          <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
            <h3 className="text-sm font-medium text-[#666] mb-3">
              You&apos;ve started learning
            </h3>
            <p className="text-3xl font-bold text-[#2c2c2c]">
              {startedLearningWords} words so far.
            </p>
          </div>
        </div>

        {/* Start Story Button */}
        <div className="flex justify-center mb-8">
          <Link href={currentStoryId ? `/stories/${currentStoryId}/chapters/${currentChapterNumber}` : '/dashboard'}>
            <Button
              size="lg"
              variant="accent"
              className="bg-[#8C6BFF] text-white hover:bg-[#7a59ef] px-8 py-6 text-lg font-semibold"
              disabled={!currentStoryId}
            >
              Start Story
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

