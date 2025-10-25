import { VocabularyItem } from '@/types';

export interface UserFlashcard extends VocabularyItem {
  addedAt: Date;
  reviewCount: number;
  lastReviewed?: Date;
  nextReview?: Date; // When this card should be reviewed next
  interval?: number; // Days between reviews
  ease?: number; // Difficulty factor (SM-2 algorithm)
  fromEpisode: string;
  clickedToAdd: boolean; // true if user clicked word, false if auto-added from lesson
  // Cloze sentence fields
  clozeSentence?: string; // The sentence from which the word was clicked
  clozeWord?: string; // The word that was clicked (for cloze deletion)
}

export class FlashcardSystem {
  private static readonly STORAGE_KEY = 'minka-user-flashcards';

  /**
   * Load user's flashcards from local storage
   */
  static loadFlashcards(): UserFlashcard[] {
    if (typeof window === 'undefined') return [];
    
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) return [];

    try {
      const flashcards = JSON.parse(saved);
      // Convert date strings back to Date objects
      return flashcards.map((card: UserFlashcard) => ({
        ...card,
        addedAt: new Date(card.addedAt),
        lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined
      }));
    } catch (error) {
      console.error('Error loading flashcards:', error);
      return [];
    }
  }

  /**
   * Save flashcards to local storage
   */
  static saveFlashcards(flashcards: UserFlashcard[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(flashcards));
    } catch (error) {
      console.error('Error saving flashcards:', error);
    }
  }

  /**
   * Add a single word to flashcards (when user clicks a word)
   */
  static addWordToFlashcards(
    word: VocabularyItem,
    episodeId: string,
    clickedToAdd: boolean = true
  ): UserFlashcard[] {
    const flashcards = this.loadFlashcards();
    
    // Check if word already exists
    const exists = flashcards.some(
      card => card.german.toLowerCase() === word.german.toLowerCase()
    );

    if (exists) {
      return flashcards;
    }

    // Add new flashcard
    const newCard: UserFlashcard = {
      ...word,
      addedAt: new Date(),
      reviewCount: 0,
      fromEpisode: episodeId,
      clickedToAdd
    };

    const updatedFlashcards = [...flashcards, newCard];
    this.saveFlashcards(updatedFlashcards);
    
    return updatedFlashcards;
  }

  /**
   * Add all vocabulary from a completed lesson
   * Returns array of NEW cards that were added (not all flashcards)
   */
  static addLessonVocabulary(
    vocabulary: VocabularyItem[],
    episodeId: string
  ): UserFlashcard[] {
    const flashcards = this.loadFlashcards();
    const existingWords = new Set(
      flashcards.map(card => card.german.toLowerCase())
    );

    // Only add words that don't exist yet
    const newCards: UserFlashcard[] = vocabulary
      .filter(word => !existingWords.has(word.german.toLowerCase()))
      .map(word => ({
        ...word,
        addedAt: new Date(),
        reviewCount: 0,
        fromEpisode: episodeId,
        clickedToAdd: false
      }));

    if (newCards.length === 0) {
      return []; // Return empty array if no new cards
    }

    const updatedFlashcards = [...flashcards, ...newCards];
    this.saveFlashcards(updatedFlashcards);
    
    return newCards; // Return ONLY the new cards that were added
  }

  /**
   * Check if a word is in user's flashcards
   */
  static isWordInFlashcards(word: string): boolean {
    const flashcards = this.loadFlashcards();
    return flashcards.some(
      card => card.german.toLowerCase() === word.toLowerCase()
    );
  }

  /**
   * Update review stats when user reviews a flashcard
   */
  static updateReviewStats(wordGerman: string): void {
    const flashcards = this.loadFlashcards();
    const updated = flashcards.map(card => {
      if (card.german.toLowerCase() === wordGerman.toLowerCase()) {
        return {
          ...card,
          reviewCount: card.reviewCount + 1,
          lastReviewed: new Date()
        };
      }
      return card;
    });
    this.saveFlashcards(updated);
  }

  /**
   * Get total number of flashcards
   */
  static getFlashcardCount(): number {
    return this.loadFlashcards().length;
  }

  /**
   * Get cards that are due for review
   */
  static getDueCards(): UserFlashcard[] {
    const now = new Date();
    return this.loadFlashcards().filter(card => {
      if (!card.nextReview) return true; // New cards are due
      return card.nextReview <= now;
    });
  }

  /**
   * Get new cards (never reviewed)
   */
  static getNewCards(limit: number = 10): UserFlashcard[] {
    return this.loadFlashcards()
      .filter(card => card.reviewCount === 0)
      .slice(0, limit);
  }

  /**
   * Update card after review (SM-2 algorithm)
   */
  static updateCardAfterReview(
    cardId: string, 
    quality: 0 | 2 | 3 | 4
  ): UserFlashcard | null {
    const flashcards = this.loadFlashcards();
    const cardIndex = flashcards.findIndex(card => 
      card.german.toLowerCase() === cardId.toLowerCase()
    );
    
    if (cardIndex === -1) return null;

    const card = flashcards[cardIndex];
    const now = new Date();
    
    // Initialize ease factor if not set
    let ease = card.ease || 2.5;
    let interval = card.interval || 0;
    let reps = card.reviewCount;

    if (quality < 3) {
      // Failed - reset interval
      interval = 0;
      reps = 0;
    } else {
      // Passed
      reps += 1;
      
      if (reps === 1) {
        interval = 1; // First review: 1 day
      } else if (reps === 2) {
        interval = 6; // Second review: 6 days
      } else {
        interval = Math.round(interval * ease);
      }
      
      // Update ease factor
      ease = Math.max(1.3, ease + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    }

    // Calculate next review date
    const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

    // Update card
    const updatedCard: UserFlashcard = {
      ...card,
      reviewCount: reps,
      lastReviewed: now,
      nextReview,
      interval,
      ease
    };

    flashcards[cardIndex] = updatedCard;
    this.saveFlashcards(flashcards);
    
    return updatedCard;
  }

  /**
   * Get study statistics
   */
  static getStudyStats(): {
    total: number;
    new: number;
    due: number;
    learned: number;
    streak: number;
  } {
    const cards = this.loadFlashcards();
    const now = new Date();
    
    const total = cards.length;
    const newCards = cards.filter(card => card.reviewCount === 0).length;
    const dueCards = cards.filter(card => 
      !card.nextReview || card.nextReview <= now
    ).length;
    const learnedCards = cards.filter(card => card.reviewCount >= 3).length;
    
    // Calculate streak (consecutive days with reviews)
    const reviewDates = cards
      .filter(card => card.lastReviewed)
      .map(card => card.lastReviewed!.toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort();
    
    let streak = 0;
    const today = new Date().toDateString();
    let currentDate = new Date();
    
    for (let i = 0; i < 365; i++) {
      const dateStr = currentDate.toDateString();
      if (reviewDates.includes(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      total,
      new: newCards,
      due: dueCards,
      learned: learnedCards,
      streak
    };
  }

  /**
   * Add a cloze sentence flashcard from clicked word
   */
  static addClozeFlashcard(
    word: VocabularyItem, 
    sentence: string, 
    episodeId: string, 
    clickedToAdd: boolean = true
  ): UserFlashcard {
    const clozeCard: UserFlashcard = {
      ...word,
      addedAt: new Date(),
      reviewCount: 0,
      fromEpisode: episodeId,
      clickedToAdd,
      // Add cloze-specific fields
      clozeSentence: sentence,
      clozeWord: word.german
    };

    const flashcards = this.loadFlashcards();
    flashcards.push(clozeCard);
    this.saveFlashcards(flashcards);
    
    return clozeCard;
  }

  /**
   * Clear all flashcards (for testing)
   */
  static clearAllFlashcards(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

