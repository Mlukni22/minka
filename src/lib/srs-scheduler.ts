import { FlashcardRating, FlashcardRatingNumber } from '@/types/flashcard';

export interface SRSUpdate {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  dueAt: Date;
}

/**
 * SM-2 style spaced repetition scheduler (exact specification)
 * Ratings: 0 = Again, 1 = Hard, 2 = Good, 3 = Easy
 */
export function updateSRS(
  rating: FlashcardRating | FlashcardRatingNumber,
  currentIntervalDays: number,
  currentEaseFactor: number,
  currentRepetitions: number
): SRSUpdate {
  const now = new Date();
  
  // Convert string rating to number if needed
  const q: number = typeof rating === 'string' 
    ? rating === 'again' ? 0 : rating === 'hard' ? 1 : rating === 'good' ? 2 : 3
    : rating;
  
  let EF = currentEaseFactor;
  let newReps = currentRepetitions;
  let newInterval = currentIntervalDays;

  // Update ease factor (SM-2 style)
  // EF = EF + (0.1 - (3 - q) * (0.08 + (3 - q) * 0.02))
  EF = EF + (0.1 - (3 - q) * (0.08 + (3 - q) * 0.02));
  if (EF < 1.3) EF = 1.3;

  if (q < 2) {
    // Again (0) or Hard (1) → reset repetitions
    newReps = 0;
    newInterval = 1; // review next day
  } else {
    // Good (2) or Easy (3)
    newReps = currentRepetitions + 1;
    if (newReps === 1) {
      newInterval = 1; // 1 day
    } else if (newReps === 2) {
      newInterval = 3; // 3 days
    } else {
      newInterval = Math.round(currentIntervalDays * EF);
    }
  }

  // Calculate next due date
  const nextDue = new Date(now);
  nextDue.setDate(nextDue.getDate() + newInterval);

  return {
    intervalDays: newInterval,
    easeFactor: EF,
    repetitions: newReps,
    dueAt: nextDue,
  };
}

/**
 * Get default SRS values for a new flashcard
 * Default: due_at = now (so it can appear immediately)
 */
export function getDefaultSRS(): Omit<SRSUpdate, 'dueAt'> & { dueAt: Date } {
  const now = new Date();

  return {
    intervalDays: 0,
    easeFactor: 2.5,
    repetitions: 0,
    dueAt: now, // Due immediately for new cards
  };
}

