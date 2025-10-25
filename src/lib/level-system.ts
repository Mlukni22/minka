/**
 * Level System - XP and progression tracking
 */

export interface LevelData {
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  totalXP: number;
}

export interface XPHistoryItem {
  amount: number;
  reason: string;
  timestamp: Date;
}

export class LevelSystem {
  private static readonly STORAGE_KEY = 'minka-level-data';
  private static readonly XP_HISTORY_KEY = 'minka-xp-history';

  // XP required for each level (exponential growth)
  static calculateXPForLevel(level: number): number {
    // Formula: 100 * level^1.5
    return Math.floor(100 * Math.pow(level, 1.5));
  }

  // Get current level data
  static getLevelData(): LevelData {
    if (typeof window === 'undefined') {
      return { level: 1, currentXP: 0, xpForNextLevel: 100, totalXP: 0 };
    }

    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) {
      return { level: 1, currentXP: 0, xpForNextLevel: 100, totalXP: 0 };
    }

    try {
      return JSON.parse(saved);
    } catch {
      return { level: 1, currentXP: 0, xpForNextLevel: 100, totalXP: 0 };
    }
  }

  // Save level data
  static saveLevelData(data: LevelData): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  // Add XP and handle level ups
  static addXP(amount: number, reason: string): { leveledUp: boolean; newLevel?: number; data: LevelData } {
    const data = this.getLevelData();
    
    // Add XP
    data.currentXP += amount;
    data.totalXP += amount;

    // Save to history
    this.addToHistory({ amount, reason, timestamp: new Date() });

    // Check for level up
    let leveledUp = false;
    let newLevel: number | undefined;

    while (data.currentXP >= data.xpForNextLevel) {
      data.currentXP -= data.xpForNextLevel;
      data.level += 1;
      data.xpForNextLevel = this.calculateXPForLevel(data.level);
      leveledUp = true;
      newLevel = data.level;
    }

    this.saveLevelData(data);

    return { leveledUp, newLevel, data };
  }

  // Get XP history
  static getXPHistory(): XPHistoryItem[] {
    if (typeof window === 'undefined') return [];

    const saved = localStorage.getItem(this.XP_HISTORY_KEY);
    if (!saved) return [];

    try {
      const history = JSON.parse(saved);
      return history.map((item: XPHistoryItem) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    } catch {
      return [];
    }
  }

  // Add to XP history (keep last 50)
  static addToHistory(reward: XPHistoryItem): void {
    if (typeof window === 'undefined') return;

    const history = this.getXPHistory();
    history.unshift(reward);
    
    // Keep only last 50
    const trimmed = history.slice(0, 50);
    localStorage.setItem(this.XP_HISTORY_KEY, JSON.stringify(trimmed));
  }

  // Get level progress percentage
  static getLevelProgress(): number {
    const data = this.getLevelData();
    return Math.round((data.currentXP / data.xpForNextLevel) * 100);
  }

  // Calculate level from total XP (for display purposes)
  static calculateLevelFromTotalXP(totalXP: number): number {
    let level = 1;
    let xpNeeded = 0;

    while (xpNeeded <= totalXP) {
      xpNeeded += this.calculateXPForLevel(level);
      if (xpNeeded <= totalXP) level++;
    }

    return level;
  }

  // Get level title based on level
  static getLevelTitle(level: number): string {
    if (level >= 50) return 'German Master';
    if (level >= 40) return 'Expert Speaker';
    if (level >= 30) return 'Fluent Learner';
    if (level >= 20) return 'Advanced Student';
    if (level >= 15) return 'Intermediate Speaker';
    if (level >= 10) return 'Dedicated Student';
    if (level >= 5) return 'Eager Learner';
    return 'Beginner';
  }
}

// XP Rewards Configuration
export const XP_REWARDS = {
  COMPLETE_SCENE: 10,
  COMPLETE_EXERCISE_CORRECT: 15,
  COMPLETE_EXERCISE_WRONG: 5,
  COMPLETE_CHAPTER: 50,
  COMPLETE_EPISODE: 100,
  REVIEW_FLASHCARD_CORRECT: 5,
  REVIEW_FLASHCARD_WRONG: 2,
  ADD_WORD_TO_FLASHCARDS: 3,
  DAILY_STREAK: 20,
  COMPLETE_DAILY_QUEST: 30,
  GRAMMAR_LESSON_COMPLETE: 25,
  PERFECT_CHAPTER: 75, // All exercises correct
};

