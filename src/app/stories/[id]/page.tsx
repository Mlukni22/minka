'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { onAuthChange } from '@/lib/auth';
import { getStoryById, getStoryChapters } from '@/lib/db/stories';
import { getUserStoryProgress, getAllUserChapterProgress } from '@/lib/db/user-progress';
import { Story, StoryChapter, UserStoryProgress, UserChapterProgress } from '@/types/story';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, BookOpen, CheckCircle, Circle } from 'lucide-react';

export default function StoryChaptersPage() {
  const router = useRouter();
  const params = useParams();
  const storyId = params.id as string;

  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<StoryChapter[]>([]);
  const [storyProgress, setStoryProgress] = useState<UserStoryProgress | null>(null);
  const [chapterProgress, setChapterProgress] = useState<UserChapterProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/auth/login');
        return;
      }

    const loadStoryData = async (uid: string) => {
      try {
        const [storyData, chaptersData, progress, allChapterProgress] = await Promise.all([
          getStoryById(storyId),
          getStoryChapters(storyId),
          getUserStoryProgress(uid, storyId),
          getAllUserChapterProgress(uid),
        ]);

        if (!storyData) {
          router.push('/stories');
          return;
        }

        setStory(storyData);
        setChapters(chaptersData);
        setStoryProgress(progress);
        
        // Filter chapter progress for this story's chapters
        const chapterIds = chaptersData.map(ch => ch.id);
        setChapterProgress(allChapterProgress.filter(cp => chapterIds.includes(cp.chapterId)));
      } catch (error) {
        console.error('Error loading story:', error);
      } finally {
        setLoading(false);
      }
    };

      setUserId(firebaseUser.uid);
      await loadStoryData(firebaseUser.uid);
    });

    return () => unsubscribe();
  }, [router, storyId]);

  const getChapterProgress = (chapterId: string): UserChapterProgress | undefined => {
    return chapterProgress.find(cp => cp.chapterId === chapterId);
  };

  const getNextChapterNumber = (): number => {
    if (!storyProgress) return 1;
    if (storyProgress.completed) return chapters.length; // Story completed, show last chapter
    return storyProgress.currentChapterNumber || 1;
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Story not found</p>
          <Link href="/stories">
            <Button variant="accent">← Back to Stories</Button>
          </Link>
        </div>
      </div>
    );
  }

  const completedChapters = chapterProgress.filter(cp => cp.status === 'COMPLETED').length;
  const totalChapters = chapters.length;
  const isStoryCompleted = storyProgress?.completed || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <Link href="/stories">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </Link>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
              {story.level}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{story.title}</h1>
          <p className="mt-2 text-sm text-gray-600">{story.description}</p>
          {storyProgress && (
            <div className="mt-3 text-sm text-gray-600">
              Progress: {completedChapters} / {totalChapters} chapters completed
              {storyProgress.currentChapterNumber && (
                <span className="ml-2">
                  • Current chapter: {storyProgress.currentChapterNumber}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Continue Reading Button */}
        {!isStoryCompleted && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Continue Reading
                </h2>
                <p className="text-gray-600">
                  {storyProgress?.currentChapterNumber
                    ? `Continue from Chapter ${storyProgress.currentChapterNumber}`
                    : 'Start reading the story'}
                </p>
              </div>
              <Link href={`/stories/${storyId}/chapters/${storyProgress?.currentChapterNumber || 1}`}>
                <Button variant="accent" size="lg">
                  {storyProgress?.currentChapterNumber ? 'Continue' : 'Start Story'}
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Chapters List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Chapters</h2>
          <div className="space-y-4">
            {chapters.map((chapter, index) => {
              const progress = getChapterProgress(chapter.id);
              const isCompleted = progress?.status === 'COMPLETED';
              const isReading = progress?.status === 'READING';
              const canRead = index === 0 || 
                             isCompleted || 
                             isReading || 
                             (index > 0 && getChapterProgress(chapters[index - 1].id)?.status === 'COMPLETED');

              return (
                <Link
                  key={chapter.id}
                  href={canRead ? `/stories/${storyId}/chapters/${chapter.chapterNumber}` : '#'}
                  className={`block p-4 rounded-lg border-2 transition-all ${
                    canRead
                      ? 'border-gray-200 hover:border-purple-300 hover:shadow-md cursor-pointer'
                      : 'border-gray-100 opacity-60 cursor-not-allowed'
                  }`}
                  onClick={(e) => {
                    if (!canRead) {
                      e.preventDefault();
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-green-100 text-green-700'
                            : isReading
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : isReading ? (
                            <BookOpen className="w-4 h-4" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {chapter.title || `Chapter ${chapter.chapterNumber}`}
                          </h3>
                          {chapter.shortSummaryEn && (
                            <p className="text-sm text-gray-600 mt-1">{chapter.shortSummaryEn}</p>
                          )}
                        </div>
                      </div>
                      {chapter.estimatedTimeMinutes && (
                        <div className="text-xs text-gray-500 ml-11">
                          ⏱️ {chapter.estimatedTimeMinutes} min
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {isCompleted && '✓ Completed'}
                      {isReading && 'Reading...'}
                      {!isCompleted && !isReading && index === 0 && 'Start'}
                      {!isCompleted && !isReading && index > 0 && !canRead && 'Locked'}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
