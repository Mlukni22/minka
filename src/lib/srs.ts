import { VocabularyItem } from '@/types';

// Extended vocabulary item for SRS tracking
export interface SRSVocabularyItem extends VocabularyItem {
  id: string;
  interval: number; // days
  repetitions: number;
  easeFactor: number;
  lastReviewed?: Date;
  nextReview?: Date;
  difficulty: number; // 1-5 scale
}

export class SRSAlgorithm {
  private static readonly MIN_INTERVAL = 1; // 1 day
  private static readonly MAX_INTERVAL = 365; // 1 year
  private static readonly INITIAL_EASE_FACTOR = 2.5;
  private static readonly MIN_EASE_FACTOR = 1.3;

  /**
   * Convert basic vocabulary item to SRS item
   */
  static createSRSItem(item: VocabularyItem, difficulty: number = 1): SRSVocabularyItem {
    return {
      ...item,
      id: `${item.german}-${item.english}`.toLowerCase().replace(/\s+/g, '-'),
      interval: this.MIN_INTERVAL,
      repetitions: 0,
      easeFactor: this.INITIAL_EASE_FACTOR,
      difficulty,
      lastReviewed: undefined,
      nextReview: new Date(), // Due immediately for new items
    };
  }

  /**
   * Calculate next review date based on performance
   * Implements SM-2 algorithm with modifications
   */
  static calculateNextReview(
    item: SRSVocabularyItem,
    performance: 'correct' | 'incorrect' | 'easy' | 'hard'
  ): SRSVocabularyItem {
    let { interval, repetitions, easeFactor } = item;

    switch (performance) {
      case 'incorrect':
        // Reset repetitions and interval for incorrect answers
        repetitions = 0;
        interval = this.MIN_INTERVAL;
        break;

      case 'hard':
        // Reduce ease factor for hard answers
        easeFactor = Math.max(
          easeFactor - 0.2,
          this.MIN_EASE_FACTOR
        );
        if (repetitions === 0) {
          interval = this.MIN_INTERVAL;
        } else if (repetitions === 1) {
          interval = 6; // 6 days
        } else {
          interval = Math.round(interval * easeFactor);
        }
        repetitions++;
        break;

      case 'correct':
        // Standard progression
        if (repetitions === 0) {
          interval = this.MIN_INTERVAL;
        } else if (repetitions === 1) {
          interval = 6; // 6 days
        } else {
          interval = Math.round(interval * easeFactor);
        }
        repetitions++;
        break;

      case 'easy':
        // Increase ease factor for easy answers
        easeFactor = Math.min(easeFactor + 0.15, 2.5);
        if (repetitions === 0) {
          interval = 4; // 4 days
        } else if (repetitions === 1) {
          interval = 6; // 6 days
        } else {
          interval = Math.round(interval * easeFactor);
        }
        repetitions++;
        break;
    }

    // Cap the interval
    interval = Math.min(interval, this.MAX_INTERVAL);

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    return {
      ...item,
      interval,
      repetitions,
      easeFactor,
      nextReview,
      lastReviewed: new Date(),
    };
  }

  /**
   * Get vocabulary items due for review
   */
  static getItemsDueForReview(items: SRSVocabularyItem[]): SRSVocabularyItem[] {
    const now = new Date();
    return items.filter(item => {
      if (!item.nextReview) return true;
      return item.nextReview <= now;
    });
  }

  /**
   * Get vocabulary items by difficulty level
   */
  static getItemsByDifficulty(
    items: SRSVocabularyItem[],
    difficulty: number
  ): SRSVocabularyItem[] {
    return items.filter(item => item.difficulty === difficulty);
  }

  /**
   * Calculate mastery level based on repetitions and ease factor
   */
  static calculateMasteryLevel(item: SRSVocabularyItem): 'learning' | 'reviewing' | 'mastered' {
    if (item.repetitions === 0) return 'learning';
    if (item.repetitions < 3) return 'reviewing';
    if (item.repetitions >= 3 && item.easeFactor >= 2.0) return 'mastered';
    return 'reviewing';
  }

  /**
   * Get recommended daily review count based on user level
   */
  static getRecommendedDailyReviews(level: 'beginner' | 'intermediate' | 'advanced'): number {
    switch (level) {
      case 'beginner': return 10;
      case 'intermediate': return 20;
      case 'advanced': return 30;
      default: return 15;
    }
  }

  /**
   * Extract all vocabulary from story engine and convert to SRS items
   */
  static extractVocabularyFromStories(allVocabulary: VocabularyItem[]): SRSVocabularyItem[] {
    return allVocabulary.map((item, index) => 
      this.createSRSItem(item, Math.min(Math.floor(index / 10) + 1, 5))
    );
  }
}
