import { Story } from '@/types';

export interface EpisodeProgress {
  episodeId: string;
  unlocked: boolean;
  completed: boolean;
  chaptersCompleted: number;
  totalChapters: number;
  score: number;
  completedAt?: Date;
  currentChapterIndex?: number; // Track where user left off
  currentSceneIndex?: number; // Track current scene within chapter
}

export interface UserProgressionState {
  currentEpisode: string;
  episodeProgress: Record<string, EpisodeProgress>;
  totalXP: number;
  streak: number;
  wordsLearned?: number; // Total unique words added to flashcards
  wordsRead?: number; // Total words encountered in stories
  lastActivityDate?: string; // ISO date string of last activity
  bestStreak?: number; // Highest streak achieved
}

export class ProgressionSystem {
  private static readonly EPISODE_ORDER = [
    'episode-0-hallo',
    'episode-1-willkommen',
    'episode-2-verlorener-schluessel',
    'episode-3-brief',
    'episode-4-spuren',
    'episode-5-geheimnis'
  ];

  /**
   * Initialize progression state for a new user
   */
  static initializeProgression(stories: Story[]): UserProgressionState {
    const episodeProgress: Record<string, EpisodeProgress> = {};
    
    stories.forEach((story, index) => {
      episodeProgress[story.id] = {
        episodeId: story.id,
        unlocked: true, // All episodes unlocked for now
        completed: false,
        chaptersCompleted: 0,
        totalChapters: story.chapters.length,
        score: 0
      };
    });

    return {
      currentEpisode: this.EPISODE_ORDER[0],
      episodeProgress,
      totalXP: 0,
      streak: 0,
      wordsLearned: 0,
      wordsRead: 0,
      lastActivityDate: new Date().toISOString().split('T')[0],
      bestStreak: 0
    };
  }

  /**
   * Check if an episode is unlocked
   */
  static isEpisodeUnlocked(
    episodeId: string,
    progressionState: UserProgressionState
  ): boolean {
    return progressionState.episodeProgress[episodeId]?.unlocked || false;
  }

  /**
   * Check if an episode is completed
   */
  static isEpisodeCompleted(
    episodeId: string,
    progressionState: UserProgressionState
  ): boolean {
    return progressionState.episodeProgress[episodeId]?.completed || false;
  }

  /**
   * Mark a chapter as completed and update progression
   */
  static completeChapter(
    episodeId: string,
    progressionState: UserProgressionState,
    story: Story
  ): UserProgressionState {
    const episodeProgress = { ...progressionState.episodeProgress };
    const currentProgress = episodeProgress[episodeId];

    if (!currentProgress) return progressionState;

    // Update chapter count
    const chaptersCompleted = Math.min(
      currentProgress.chaptersCompleted + 1,
      currentProgress.totalChapters
    );

    // Check if episode is now completed
    const completed = chaptersCompleted >= currentProgress.totalChapters;

    // Update episode progress
    episodeProgress[episodeId] = {
      ...currentProgress,
      chaptersCompleted,
      completed,
      completedAt: completed ? new Date() : currentProgress.completedAt
    };

    // Unlock next episode if current is completed
    if (completed) {
      const currentIndex = this.EPISODE_ORDER.indexOf(episodeId);
      const nextEpisodeId = this.EPISODE_ORDER[currentIndex + 1];
      
      if (nextEpisodeId && episodeProgress[nextEpisodeId]) {
        episodeProgress[nextEpisodeId] = {
          ...episodeProgress[nextEpisodeId],
          unlocked: true
        };
      }
    }

    return {
      ...progressionState,
      episodeProgress,
      currentEpisode: completed && this.EPISODE_ORDER[this.EPISODE_ORDER.indexOf(episodeId) + 1] 
        ? this.EPISODE_ORDER[this.EPISODE_ORDER.indexOf(episodeId) + 1]
        : progressionState.currentEpisode,
      totalXP: progressionState.totalXP + 50 // XP for completing a chapter
    };
  }

  /**
   * Get the next recommended episode
   */
  static getNextEpisode(progressionState: UserProgressionState): string | null {
    for (const episodeId of this.EPISODE_ORDER) {
      const progress = progressionState.episodeProgress[episodeId];
      if (progress && progress.unlocked && !progress.completed) {
        return episodeId;
      }
    }
    return null;
  }

  /**
   * Get progression statistics
   */
  static getProgressionStats(progressionState: UserProgressionState): {
    totalEpisodes: number;
    completedEpisodes: number;
    unlockedEpisodes: number;
    currentEpisodeProgress: number;
    overallProgress: number;
  } {
    const episodes = Object.values(progressionState.episodeProgress);
    const totalEpisodes = episodes.length;
    const completedEpisodes = episodes.filter(e => e.completed).length;
    const unlockedEpisodes = episodes.filter(e => e.unlocked).length;

    const currentEpisode = progressionState.episodeProgress[progressionState.currentEpisode];
    const currentEpisodeProgress = currentEpisode
      ? (currentEpisode.chaptersCompleted / currentEpisode.totalChapters) * 100
      : 0;

    const totalChapters = episodes.reduce((sum, e) => sum + e.totalChapters, 0);
    const completedChapters = episodes.reduce((sum, e) => sum + e.chaptersCompleted, 0);
    const overallProgress = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

    return {
      totalEpisodes,
      completedEpisodes,
      unlockedEpisodes,
      currentEpisodeProgress,
      overallProgress
    };
  }

  /**
   * Get episode display info (for UI)
   */
  static getEpisodeDisplayInfo(
    episodeId: string,
    progressionState: UserProgressionState,
    story: Story
  ): {
    isLocked: boolean;
    isCompleted: boolean;
    progress: number;
    canStart: boolean;
    statusText: string;
  } {
    const progress = progressionState.episodeProgress[episodeId];
    
    if (!progress) {
      return {
        isLocked: true,
        isCompleted: false,
        progress: 0,
        canStart: false,
        statusText: 'Locked'
      };
    }

    const isLocked = !progress.unlocked;
    const isCompleted = progress.completed;
    const progressPercent = (progress.chaptersCompleted / progress.totalChapters) * 100;
    const canStart = progress.unlocked && !progress.completed;

    let statusText = '';
    if (isLocked) {
      statusText = '🔒 Locked';
    } else if (isCompleted) {
      statusText = '✅ Completed';
    } else if (progress.chaptersCompleted > 0) {
      statusText = `📖 In Progress (${progress.chaptersCompleted}/${progress.totalChapters})`;
    } else {
      statusText = '▶️ Start';
    }

    return {
      isLocked,
      isCompleted,
      progress: progressPercent,
      canStart,
      statusText
    };
  }

  /**
   * Save progression state to localStorage
   */
  static saveToLocalStorage(progressionState: UserProgressionState): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('minka-progression', JSON.stringify(progressionState));
    }
  }

  /**
   * Load progression state from localStorage
   */
  static loadFromLocalStorage(): UserProgressionState | null {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('minka-progression');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Convert date strings back to Date objects
          Object.values(parsed.episodeProgress).forEach((ep: EpisodeProgress) => {
            if (ep.completedAt) {
              ep.completedAt = new Date(ep.completedAt);
            }
          });
          return parsed;
        } catch (e) {
          console.error('Failed to parse progression state:', e);
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Save current position in story
   */
  static saveCurrentPosition(
    episodeId: string,
    chapterIndex: number,
    sceneIndex: number,
    progressionState: UserProgressionState
  ): UserProgressionState {
    const updatedState = {
      ...progressionState,
      episodeProgress: {
        ...progressionState.episodeProgress,
        [episodeId]: {
          ...progressionState.episodeProgress[episodeId],
          currentChapterIndex: chapterIndex,
          currentSceneIndex: sceneIndex
        }
      }
    };
    this.saveToLocalStorage(updatedState);
    return updatedState;
  }

  /**
   * Get saved position for an episode
   */
  static getSavedPosition(
    episodeId: string,
    progressionState: UserProgressionState
  ): { chapterIndex: number; sceneIndex: number } {
    const progress = progressionState.episodeProgress[episodeId];
    return {
      chapterIndex: progress?.currentChapterIndex ?? 0,
      sceneIndex: progress?.currentSceneIndex ?? 0
    };
  }

  /**
   * Reset progression (for testing or new user)
   */
  static resetProgression(stories: Story[]): UserProgressionState {
    const newState = this.initializeProgression(stories);
    this.saveToLocalStorage(newState);
    return newState;
  }

  /**
   * Increment words learned count (when adding to flashcards)
   */
  static incrementWordsLearned(
    progressionState: UserProgressionState,
    count: number = 1
  ): UserProgressionState {
    const updatedState = {
      ...progressionState,
      wordsLearned: (progressionState.wordsLearned || 0) + count
    };
    this.saveToLocalStorage(updatedState);
    return updatedState;
  }

  /**
   * Increment words read count (when reading stories)
   */
  static incrementWordsRead(
    progressionState: UserProgressionState,
    count: number
  ): UserProgressionState {
    const updatedState = {
      ...progressionState,
      wordsRead: (progressionState.wordsRead || 0) + count
    };
    this.saveToLocalStorage(updatedState);
    return updatedState;
  }

  /**
   * Get words statistics
   */
  static getWordsStats(progressionState: UserProgressionState): {
    wordsLearned: number;
    wordsRead: number;
  } {
    return {
      wordsLearned: progressionState.wordsLearned || 0,
      wordsRead: progressionState.wordsRead || 0
    };
  }

  /**
   * Update streak - call this when user completes any activity
   */
  static updateStreak(progressionState: UserProgressionState): UserProgressionState {
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = progressionState.lastActivityDate;

    // If already updated today, no change
    if (lastActivity === today) {
      return progressionState;
    }

    // Calculate days since last activity
    let newStreak = progressionState.streak || 0;
    
    if (lastActivity) {
      const lastDate = new Date(lastActivity);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Consecutive day - increment streak
        newStreak += 1;
      } else if (daysDiff > 1) {
        // Streak broken - reset to 1
        newStreak = 1;
      }
    } else {
      // First activity
      newStreak = 1;
    }

    // Update best streak
    const bestStreak = Math.max(progressionState.bestStreak || 0, newStreak);

    const updatedState = {
      ...progressionState,
      streak: newStreak,
      lastActivityDate: today,
      bestStreak
    };

    this.saveToLocalStorage(updatedState);
    return updatedState;
  }

  /**
   * Check if streak is broken (more than 1 day since last activity)
   */
  static checkStreakStatus(progressionState: UserProgressionState): {
    isBroken: boolean;
    daysInactive: number;
  } {
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = progressionState.lastActivityDate;

    if (!lastActivity) {
      return { isBroken: false, daysInactive: 0 };
    }

    const lastDate = new Date(lastActivity);
    const todayDate = new Date(today);
    const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      isBroken: daysDiff > 1,
      daysInactive: daysDiff
    };
  }
}

