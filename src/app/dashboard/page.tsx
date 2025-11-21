'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthChange, getCurrentUser } from '@/lib/auth';
import { getUserData } from '@/lib/db/user';
import { getDueFlashcards, getUserFlashcards } from '@/lib/db/flashcards';
import { getAllUserStoryProgress } from '@/lib/db/user-progress';
import { getAllStories } from '@/lib/db/stories';
import { User } from '@/types/user';
import { Story } from '@/types/story';
import LearningDashboard from '@/components/LearningDashboard';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [wordsToReview, setWordsToReview] = useState(0);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [storyProgress, setStoryProgress] = useState<any>(null);
  const [firstStory, setFirstStory] = useState<Story | null>(null);
  const [storiesCompleted, setStoriesCompleted] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/auth/login');
        return;
      }

      try {
        // Get user data from Firestore
        const userData = await getUserData(firebaseUser.uid);
        
        // Check if onboarding is completed
        if (userData && !userData.onboardingCompleted) {
          router.push('/onboarding');
          return;
        }

        setUser(userData);

        // Get due flashcards count
        const [dueCards, userProgress, allStories, allFlashcards] = await Promise.all([
          getDueFlashcards(firebaseUser.uid),
          getAllUserStoryProgress(firebaseUser.uid),
          getAllStories(),
          getUserFlashcards(firebaseUser.uid),
        ]);

        setWordsToReview(dueCards.length);

        // Find current story in progress
        const inProgress = userProgress.find(p => !p.completed);
        if (inProgress) {
          const story = allStories.find(s => s.id === inProgress.storyId);
          if (story) {
            setCurrentStory(story);
            setStoryProgress(inProgress);
          }
        }
        
        // Set first available story for "Start Story" button
        if (allStories.length > 0) {
          setFirstStory(allStories[0]);
        }

        // Count completed stories
        const completedCount = userProgress.filter(p => p.completed).length;
        setStoriesCompleted(completedCount);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <LearningDashboard
        userName={user.displayName || 'Learner'}
        xp={user.xpTotal}
        level={Math.floor(user.xpTotal / 100) + 1}
        wordsToReview={wordsToReview}
        fullyLearnedWords={0} // TODO: Calculate from flashcards
        startedLearningWords={user.wordsLearned}
        storiesCompleted={storiesCompleted}
        currentStoryId={currentStory?.id || firstStory?.id}
        currentChapterNumber={storyProgress?.currentChapterNumber || 1}
      />
      
      {/* Start Story Section */}
      {currentStory && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Pick up where you left off
                </h3>
                <p className="text-gray-600 mb-4">{currentStory.title}</p>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                    {currentStory.level}
                  </span>
                  <span className="text-sm text-gray-500">
                    ⏱️ {currentStory.estimatedTimeMinutes} min
                  </span>
                </div>
              </div>
              <Link href={`/stories/${currentStory.id}/chapters/${storyProgress?.currentChapterNumber || 1}`}>
                <Button variant="accent" size="lg">
                  Start Story
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">More Practice</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/practice">
              <Button variant="secondary" className="w-full" disabled={wordsToReview === 0}>
                🧠 Test your knowledge
              </Button>
            </Link>
            <Button variant="secondary" className="w-full" disabled>
              📖 Grammar library
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

