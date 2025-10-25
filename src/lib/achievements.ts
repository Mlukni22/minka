import { UserProgressionState } from './progression';
import { UserFlashcard } from './flashcard-system';

export type AchievementCategory = 'episodes' | 'streak' | 'flashcards' | 'practice';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  total?: number;
}

export interface UserAchievements {
  achievements: Achievement[];
  lastUpdated: Date;
}

export class AchievementSystem {
  private static readonly STORAGE_KEY = 'minka-achievements';

  /**
   * Define all available achievements
   */
  private static readonly ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
    // Episode Completion
    { id: 'ep0-complete', title: 'First Steps', description: 'Complete Episode 0: Hallo!', icon: '🐾', category: 'episodes', total: 1 },
    { id: 'ep1-complete', title: 'Village Explorer', description: 'Complete Episode 1: Willkommen im Dorf', icon: '🏡', category: 'episodes', total: 1 },
    { id: 'ep2-complete', title: 'Key Finder', description: 'Complete Episode 2: Der verlorene Schlüssel', icon: '🔑', category: 'episodes', total: 1 },
    { id: 'ep3-complete', title: 'Mystery Solver', description: 'Complete Episode 3: Der Brief', icon: '✉️', category: 'episodes', total: 1 },
    { id: 'ep4-complete', title: 'Tracker', description: 'Complete Episode 4: Die Spuren', icon: '🔍', category: 'episodes', total: 1 },
    { id: 'ep5-complete', title: 'Secret Keeper', description: 'Complete Episode 5: Das Geheimnis', icon: '🎭', category: 'episodes', total: 1 },
    { id: 'all-episodes', title: 'Story Master', description: 'Complete all episodes', icon: '👑', category: 'episodes', total: 6 },
    
    // Streaks
    { id: 'streak-3', title: 'Consistent Learner', description: 'Maintain a 3-day streak', icon: '🔥', category: 'streak', total: 3 },
    { id: 'streak-7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⚡', category: 'streak', total: 7 },
    { id: 'streak-14', title: 'Two Week Champion', description: 'Maintain a 14-day streak', icon: '💪', category: 'streak', total: 14 },
    { id: 'streak-30', title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '🏆', category: 'streak', total: 30 },
    
    // Flashcards
    { id: 'flashcards-10', title: 'Vocabulary Starter', description: 'Add 10 words to flashcards', icon: '📝', category: 'flashcards', total: 10 },
    { id: 'flashcards-50', title: 'Word Collector', description: 'Add 50 words to flashcards', icon: '📚', category: 'flashcards', total: 50 },
    { id: 'flashcards-100', title: 'Vocabulary Builder', description: 'Add 100 words to flashcards', icon: '📖', category: 'flashcards', total: 100 },
    { id: 'flashcards-250', title: 'Word Master', description: 'Add 250 words to flashcards', icon: '🌟', category: 'flashcards', total: 250 },
    { id: 'reviews-50', title: 'Practice Beginner', description: 'Review 50 flashcards', icon: '🎯', category: 'flashcards', total: 50 },
    { id: 'reviews-200', title: 'Practice Pro', description: 'Review 200 flashcards', icon: '🎪', category: 'flashcards', total: 200 },
    { id: 'reviews-500', title: 'Review Champion', description: 'Review 500 flashcards', icon: '🏅', category: 'flashcards', total: 500 },
    
    // Practice
    { id: 'perfect-chapter', title: 'Perfectionist', description: 'Complete a chapter with 100% accuracy', icon: '💯', category: 'practice', total: 1 },
    { id: 'quick-learner', title: 'Speed Reader', description: 'Complete a chapter in under 5 minutes', icon: '⏱️', category: 'practice', total: 1 },
  ];

  /**
   * Calculate which achievements should be unlocked based on user progress
   */
  static calculateAchievements(
    progressionState: UserProgressionState,
    flashcards: UserFlashcard[]
  ): Achievement[] {
    const achievements: Achievement[] = [];
    const now = new Date();

    // Load existing achievements to preserve unlock dates
    const existing = this.loadAchievements();
    const existingMap = new Map(existing.achievements.map(a => [a.id, a]));

    for (const def of this.ACHIEVEMENT_DEFINITIONS) {
      const existingAch = existingMap.get(def.id);
      let unlocked = existingAch?.unlocked || false;
      let progress = 0;

      // Check episode completions
      if (def.category === 'episodes') {
        if (def.id === 'all-episodes') {
          const completed = Object.values(progressionState.episodeProgress).filter(ep => ep.completed).length;
          progress = completed;
          unlocked = completed >= 6;
        } else if (def.id.startsWith('ep')) {
          const epNum = def.id.match(/ep(\d+)/)?.[1];
          const epId = `episode-${epNum}-`;
          const episode = Object.values(progressionState.episodeProgress).find(ep => ep.episodeId.includes(epId));
          progress = episode?.completed ? 1 : 0;
          unlocked = episode?.completed || false;
        }
      }

      // Check streaks
      if (def.category === 'streak') {
        progress = progressionState.streak;
        unlocked = progressionState.streak >= (def.total || 0);
      }

      // Check flashcard achievements
      if (def.category === 'flashcards') {
        if (def.id.startsWith('flashcards-')) {
          progress = flashcards.length;
          unlocked = flashcards.length >= (def.total || 0);
        } else if (def.id.startsWith('reviews-')) {
          const totalReviews = flashcards.reduce((sum, card) => sum + card.reviewCount, 0);
          progress = totalReviews;
          unlocked = totalReviews >= (def.total || 0);
        }
      }

      // For practice achievements, check if already unlocked (these are event-based)
      if (def.category === 'practice') {
        unlocked = existingAch?.unlocked || false;
        progress = unlocked ? 1 : 0;
      }

      achievements.push({
        ...def,
        unlocked,
        unlockedAt: unlocked && !existingAch?.unlocked ? now : existingAch?.unlockedAt,
        progress: def.total ? progress : undefined,
      });
    }

    return achievements;
  }

  /**
   * Save achievements to localStorage
   */
  static saveAchievements(achievements: Achievement[]): void {
    if (typeof window === 'undefined') return;

    const data: UserAchievements = {
      achievements,
      lastUpdated: new Date(),
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  }

  /**
   * Load achievements from localStorage
   */
  static loadAchievements(): UserAchievements {
    if (typeof window === 'undefined') {
      return { achievements: [], lastUpdated: new Date() };
    }

    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) {
      return { achievements: [], lastUpdated: new Date() };
    }

    try {
      const data = JSON.parse(saved);
      // Convert date strings back to Date objects
      return {
        achievements: data.achievements.map((a: Achievement) => ({
          ...a,
          unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined,
        })),
        lastUpdated: new Date(data.lastUpdated),
      };
    } catch (error) {
      console.error('Error loading achievements:', error);
      return { achievements: [], lastUpdated: new Date() };
    }
  }

  /**
   * Update and save achievements based on current progress
   */
  static updateAchievements(
    progressionState: UserProgressionState,
    flashcards: UserFlashcard[]
  ): Achievement[] {
    const achievements = this.calculateAchievements(progressionState, flashcards);
    this.saveAchievements(achievements);
    return achievements;
  }

  /**
   * Get achievement statistics
   */
  static getStats(achievements: Achievement[]): {
    total: number;
    unlocked: number;
    percentage: number;
    recentUnlocks: Achievement[];
  } {
    const total = achievements.length;
    const unlocked = achievements.filter(a => a.unlocked).length;
    const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;
    
    const recentUnlocks = achievements
      .filter(a => a.unlocked && a.unlockedAt)
      .sort((a, b) => (b.unlockedAt!.getTime() - a.unlockedAt!.getTime()))
      .slice(0, 5);

    return { total, unlocked, percentage, recentUnlocks };
  }

  /**
   * Unlock a practice achievement manually (for perfect scores, speed runs, etc.)
   */
  static unlockPracticeAchievement(achievementId: string): void {
    const existing = this.loadAchievements();
    const updated = existing.achievements.map(a => {
      if (a.id === achievementId && !a.unlocked) {
        return {
          ...a,
          unlocked: true,
          unlockedAt: new Date(),
          progress: a.total,
        };
      }
      return a;
    });
    this.saveAchievements(updated);
  }
}

