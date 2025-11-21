export type StoryLevel = 'A1' | 'A2' | 'B1';

export type StoryBlockType = 'TEXT' | 'IMAGE';

export type ExerciseType = 'MULTIPLE_CHOICE' | 'GAP_FILL' | 'TRANSLATION_SIMPLE';

export type ChapterProgressStatus = 'NOT_STARTED' | 'READING' | 'COMPLETED';

// Base Story
export interface Story {
  id: string;
  title: string;
  slug: string;
  level: StoryLevel;
  description: string;
  estimatedTimeMinutes: number;
  coverImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Story Chapter
export interface StoryChapter {
  id: string;
  storyId: string;
  chapterNumber: number; // 1, 2, 3...
  title?: string; // e.g., "Kapitel 1 – Der Brief"
  shortSummaryEn?: string;
  estimatedTimeMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Story Section (optional fine-grain inside a chapter)
export interface StorySection {
  id: string;
  chapterId: string;
  orderIndex: number;
  germanText: string;
  englishHint?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Story Block (text or image blocks within a chapter)
export interface StoryBlock {
  id: string;
  chapterId: string;
  orderIndex: number;
  type: StoryBlockType; // 'TEXT' | 'IMAGE'
  textContent?: string; // Used when type = TEXT
  imageUrl?: string; // Used when type = IMAGE
  imageAlt?: string; // Alt text for accessibility
  caption?: string; // Short description under the picture
  createdAt: Date;
  updatedAt: Date;
}

// Story Word (vocabulary for each chapter)
export interface StoryWord {
  id: string;
  chapterId: string;
  sectionId?: string; // Optional, if linking to sections
  phrase: string; // German word/phrase
  translation: string; // English translation
  exampleSentence?: string; // German example
  exampleTranslation?: string; // English example
  imageUrl?: string; // Optional image for the word
  imageAlt?: string; // Alt text for the image
  isKeyWord: boolean; // Default true, for "New words" list
  createdAt: Date;
  updatedAt: Date;
}

// User Story Progress
export interface UserStoryProgress {
  id: string;
  userId: string;
  storyId: string;
  currentChapterNumber?: number; // Which chapter they're on
  completed: boolean;
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User Chapter Progress
export interface UserChapterProgress {
  id: string;
  userId: string;
  chapterId: string;
  status: ChapterProgressStatus; // 'NOT_STARTED' | 'READING' | 'COMPLETED'
  completedAt?: Date;
  exerciseScore?: number; // Percentage or points
  createdAt: Date;
  updatedAt: Date;
}

// Chapter Exercise
export interface ChapterExercise {
  id: string;
  chapterId: string;
  orderIndex: number;
  type: ExerciseType; // 'MULTIPLE_CHOICE' | 'GAP_FILL' | 'TRANSLATION_SIMPLE'
  prompt: string; // Instruction in English
  questionText: string; // German/English text or sentence with gap
  correctAnswer?: string; // Used for gap fill / short answer
  createdAt: Date;
  updatedAt: Date;
}

// Chapter Exercise Option (for multiple choice)
export interface ChapterExerciseOption {
  id: string;
  exerciseId: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

// User Chapter Exercise Attempt
export interface UserChapterExerciseAttempt {
  id: string;
  userId: string;
  exerciseId: string;
  selectedOptionId?: string; // Used for MCQ
  userAnswerText?: string; // Used for gap/translation
  isCorrect: boolean;
  attemptedAt: Date;
  score?: number; // 0 or 1
}
