export type GermanLevel = 'BEGINNER' | 'A1' | 'A2' | 'B1_PLUS';

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  germanLevel: GermanLevel | null;
  dailyGoalMinutes: number | null;
  onboardingCompleted: boolean;
  xpTotal: number;
  wordsLearned: number;
  storiesCompleted: number;
  streak: number;
  createdAt: Date;
  updatedAt: Date;
}

