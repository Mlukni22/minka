export interface Flashcard {
  id: string;
  userId: string;
  languageCode: string; // e.g. "de"
  frontText: string; // German word/phrase (target language)
  backText: string; // English translation (user's base language)
  contextSentence: string; // German sentence where the word appears
  contextTranslation?: string; // Optional translation of the sentence
  // Links to content
  storyId?: string; // FK to stories
  chapterId?: string; // FK to chapters
  storyWordId?: string; // FK to story_words
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean; // In case user suspends a card
  // Legacy fields for backward compatibility
  wordId?: string; // Reference to StoryWord.id (deprecated, use storyWordId)
  front?: string; // Deprecated, use frontText
  back?: string; // Deprecated, use backText
  exampleSentence?: string; // Deprecated, use contextSentence
}

export interface FlashcardSRS {
  id: string;
  flashcardId: string;
  dueAt: Date;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lastReviewedAt: Date | null;
  lastTypeAAt: Date | null; // Last time shown as Type A
  lastTypeBAt: Date | null; // Last time shown as Type B
}

export interface FlashcardReview {
  id: string;
  flashcardId: string;
  userId: string;
  rating: number; // 0-3 (Again, Hard, Good, Easy)
  reviewedAt: Date;
  previousIntervalDays: number;
  newIntervalDays: number;
  previousEaseFactor: number;
  newEaseFactor: number;
  cardType: 'A' | 'B'; // Which type was shown
  userAnswer?: string; // For Type B: user's typed answer
  isCorrect?: boolean; // For Type B: whether answer was correct
}

export interface FlashcardPreferences {
  id: string;
  userId: string;
  maxNewCardsPerDay: number; // Default 15
  maxReviewsPerDay: number; // Default 100
  learningLanguageCode: string; // e.g. "de"
  showBackAutomatically: boolean; // Default false
  sessionGoalCards: number; // Default 20
  createdAt: Date;
  updatedAt: Date;
}

export type FlashcardRating = 'again' | 'hard' | 'good' | 'easy';

// Rating as number (0-3) for API
export type FlashcardRatingNumber = 0 | 1 | 2 | 3;

