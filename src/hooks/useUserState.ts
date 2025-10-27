import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Story, UserProgress } from '@/types';
import { UserProgressionState } from '@/lib/progression';
import { SRSVocabularyItem } from '@/lib/srs';
import { onAuthChange } from '@/lib/auth';
import { getUserProgress, getUserProgressionState, saveUserProgressionState } from '@/lib/user-data';

export interface AppContext {
  user: User | null;
  authLoading: boolean;
  userProgress: UserProgress;
  progressionState: UserProgressionState | null;
  vocabularyToReview: SRSVocabularyItem[];
  allSRSVocabulary: SRSVocabularyItem[];
}

export function useUserState(storyEngine: any) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    userId: 'demo-user',
    completedStories: [],
    completedChapters: [],
    vocabularyProgress: {},
    streak: 7,
    totalXP: 150,
    lastActiveDate: new Date()
  });
  const [progressionState, setProgressionState] = useState<UserProgressionState | null>(null);
  const [vocabularyToReview, setVocabularyToReview] = useState<SRSVocabularyItem[]>([]);
  const [allSRSVocabulary, setAllSRSVocabulary] = useState<SRSVocabularyItem[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      setAuthLoading(true);
      setUser(authUser);
      
      if (authUser) {
        try {
          const progress = await getUserProgress(authUser.uid);
          if (progress) {
            setUserProgress(progress);
          }
          
          const progression = await getUserProgressionState(authUser.uid);
          if (progression) {
            setProgressionState(progression);
          } else {
            const ProgressionSystem = await import('@/lib/progression').then(m => m.ProgressionSystem);
            const newProgression = ProgressionSystem.initializeProgression(storyEngine.getStories());
            setProgressionState(newProgression);
            await saveUserProgressionState(authUser.uid, newProgression);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        const ProgressionSystem = await import('@/lib/progression').then(m => m.ProgressionSystem);
        const savedProgression = ProgressionSystem.loadFromLocalStorage();
        if (savedProgression) {
          setProgressionState(savedProgression);
        } else {
          const newProgression = ProgressionSystem.initializeProgression(storyEngine.getStories());
          setProgressionState(newProgression);
        }
      }
      
      setAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, [storyEngine]);

  return {
    user,
    authLoading,
    userProgress,
    progressionState,
    vocabularyToReview,
    allSRSVocabulary,
    setUser,
    setUserProgress,
    setProgressionState
  };
}

