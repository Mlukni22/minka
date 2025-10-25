// Core types for Minka language learning app

export interface Story {
  id: string;
  title: string;
  description: string;
  chapters: StoryChapter[];
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  estimatedTime: number; // in minutes
  progress: {
    completed: boolean;
    currentChapter: number;
    vocabularyLearned: number;
    exercisesCompleted: number;
  };
}

export interface StoryChapter {
  id: string;
  title: string;
  content: string;
  vocabulary: VocabularyItem[];
  exercises: Exercise[];
}

export interface StoryContent {
  type: 'text' | 'dialogue' | 'narration';
  text: string;
  translation?: string;
  speaker?: string;
  image?: string;
  animation?: string;
}

export interface VocabularyItem {
  german: string;
  english: string;
  audio?: string;
  article?: 'der' | 'die' | 'das'; // German article for nouns
  plural?: string; // Plural form for nouns
  wordType?: 'noun' | 'verb' | 'adjective' | 'phrase' | 'other'; // To know when to show article/plural
  conjugation?: {
    ich: string;
    du: string;
    er_sie_es: string;
    wir: string;
    ihr: string;
    sie_Sie: string;
  }; // Present tense conjugation for verbs
}

export interface Exercise {
  type: 'fill-blank' | 'multiple-choice' | 'translation' | 'matching';
  question: string;
  options?: string[];
  correct: number; // index of correct option for multiple choice, or correct answer for fill-blank
}

export interface UserProgress {
  userId: string;
  currentStory?: string;
  currentChapter?: string;
  completedStories: string[];
  completedChapters: string[];
  vocabularyProgress: Record<string, VocabularyProgress>;
  streak: number;
  totalXP: number;
  lastActiveDate: Date;
}

export interface VocabularyProgress {
  vocabularyId: string;
  mastered: boolean;
  correctAnswers: number;
  totalAttempts: number;
  lastReviewDate: Date;
  nextReviewDate: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  showTranslations: boolean;
  autoPlayAudio: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  dailyGoal: number; // minutes
  reminderTime?: string; // HH:MM format
}

export interface SRSAlgorithm {
  calculateNextReview: (
    item: VocabularyItem,
    performance: 'correct' | 'incorrect' | 'easy' | 'hard'
  ) => VocabularyItem;
}

export interface StoryEngine {
  getCurrentChapter: (storyId: string) => StoryChapter | null;
  getNextChapter: (storyId: string) => StoryChapter | null;
  markChapterComplete: (storyId: string, chapterId: string) => void;
  extractVocabulary: (content: StoryContent[]) => VocabularyItem[];
}
