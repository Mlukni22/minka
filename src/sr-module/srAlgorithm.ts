/**
 * SM-2 Spaced Repetition Algorithm
 * 
 * Implementation of the SuperMemo-2 algorithm with enhancements:
 * - Leech detection
 * - Initial intervals (1 day, 6 days)
 * - Ease factor floor (1.3 minimum)
 * - Maximum interval cap (3650 days / 10 years)
 * - Quality scale 0-5 (0 = totally forgot, 5 = perfect)
 */

export interface Card {
  id: string;
  front: string;
  back: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  easeFactor: number; // EF, minimum 1.3
  intervalDays: number; // Current interval in days
  lastIntervalDays: number; // Previous interval before last update
  reps: number; // Number of successful consecutive reviews
  nextReview: string; // ISO date string
  totalReviews: number; // Total number of reviews
  totalFails: number; // Total number of failed reviews (quality < 3)
  consecutiveFails: number; // Current streak of failures
  isLeech: boolean; // Marked as leech if too many failures
  leechNotes?: string; // Optional notes about why it's a leech
  tags?: string[]; // Optional tags
  userId?: string; // Optional user ID for multi-user support
}

export interface ReviewResult {
  card: Card;
  nextReview: string; // ISO date string
  intervalDays: number;
  easeFactor: number;
  reps: number;
  wasLeechDetected: boolean;
}

export interface CardData {
  front: string;
  back: string;
  tags?: string[];
  userId?: string;
}

// Constants
const INITIAL_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const MAX_INTERVAL_DAYS = 3650; // 10 years
const MIN_INTERVAL_DAYS = 1;

// Leech detection constants
const LEECH_FAIL_THRESHOLD_30_REVIEWS = 8; // Fails within 30 reviews
const LEECH_FAIL_THRESHOLD_TOTAL = 12; // Total fails
const LEECH_REVIEW_WINDOW = 30; // Reviews to check

/**
 * Creates a new card with default SRS values
 * @param cardData - Card front, back, optional tags and userId
 * @returns New card object with initialized SRS fields
 */
export function createCard(cardData: CardData): Card {
  const now = new Date().toISOString();
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + 1); // Due tomorrow initially

  return {
    id: generateId(),
    front: cardData.front,
    back: cardData.back,
    createdAt: now,
    updatedAt: now,
    easeFactor: INITIAL_EASE_FACTOR,
    intervalDays: 0,
    lastIntervalDays: 0,
    reps: 0,
    nextReview: nextReviewDate.toISOString(),
    totalReviews: 0,
    totalFails: 0,
    consecutiveFails: 0,
    isLeech: false,
    tags: cardData.tags || [],
    userId: cardData.userId,
  };
}

/**
 * Records a review and updates the card using SM-2 algorithm
 * @param card - The card to review
 * @param quality - Quality rating 0-5 (0 = totally forgot, 5 = perfect)
 * @returns Updated card and review result
 */
export function recordReview(card: Card, quality: number): ReviewResult {
  // Validate quality
  if (quality < 0 || quality > 5 || !Number.isInteger(quality)) {
    throw new Error('Quality must be an integer between 0 and 5');
  }

  const result = calculateNextReview(card, quality);
  const updatedCard: Card = {
    ...card,
    ...result,
    updatedAt: new Date().toISOString(),
    totalReviews: card.totalReviews + 1,
  };

  // Check for leech detection
  const wasLeechDetected = checkAndMarkLeech(updatedCard);

  return {
    card: updatedCard,
    nextReview: result.nextReview,
    intervalDays: result.intervalDays,
    easeFactor: result.easeFactor,
    reps: result.reps,
    wasLeechDetected,
  };
}

/**
 * Calculates the next review date and updates SRS parameters
 * Implements SM-2 algorithm with the exact rules specified
 * @param card - The card to calculate next review for
 * @param quality - Quality rating 0-5
 * @returns Updated SRS parameters
 */
export function calculateNextReview(
  card: Card,
  quality: number
): {
  nextReview: string;
  intervalDays: number;
  easeFactor: number;
  reps: number;
  lastIntervalDays: number;
  totalFails: number;
  consecutiveFails: number;
} {
  const now = new Date();
  let { easeFactor, intervalDays, reps, totalFails, consecutiveFails } = card;
  const lastIntervalDays = intervalDays;

  // Step 1: If quality < 3 (failed)
  if (quality < 3) {
    // Increment failure counters
    totalFails = card.totalFails + 1;
    consecutiveFails = card.consecutiveFails + 1;

    // Reset reps
    reps = 0;

    // Set interval to 1 day
    intervalDays = MIN_INTERVAL_DAYS;

    // Optionally slightly decrease EF, but ensure EF >= 1.3
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.02);

    // Next review = today + 1 day
    const nextReviewDate = new Date(now);
    nextReviewDate.setDate(nextReviewDate.getDate() + 1);

    return {
      nextReview: nextReviewDate.toISOString(),
      intervalDays,
      easeFactor,
      reps,
      lastIntervalDays,
      totalFails,
      consecutiveFails,
    };
  }

  // Step 2: quality >= 3 (passed)
  // Reset consecutive failures
  consecutiveFails = 0;

  // Increment reps
  reps = card.reps + 1;

  // Calculate new interval based on reps
  if (reps === 1) {
    intervalDays = 1;
  } else if (reps === 2) {
    intervalDays = 6;
  } else {
    // reps > 2: intervalDays = round(previousIntervalDays * EF)
    intervalDays = Math.round(card.lastIntervalDays * easeFactor);
  }

  // Update ease factor using SM-2 formula
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const q = quality;
  const efUpdate = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  easeFactor = easeFactor + efUpdate;
  
  // Clamp EF >= 1.3
  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor);

  // Step 3: Cap intervalDays at 3650 (max) and min 1
  intervalDays = Math.max(MIN_INTERVAL_DAYS, Math.min(MAX_INTERVAL_DAYS, intervalDays));

  // Calculate next review date
  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

  return {
    nextReview: nextReviewDate.toISOString(),
    intervalDays,
    easeFactor,
    reps,
    lastIntervalDays,
    totalFails: card.totalFails, // No change if quality >= 3
    consecutiveFails,
  };
}

/**
 * Gets cards that are due for review on or before the given date
 * @param cards - Array of cards to filter
 * @param date - Optional date to check (defaults to now)
 * @returns Array of due cards
 */
export function getDueCards(cards: Card[], date?: string): Card[] {
  const checkDate = date ? new Date(date) : new Date();
  
  return cards.filter(card => {
    const nextReviewDate = new Date(card.nextReview);
    return nextReviewDate <= checkDate;
  });
}

/**
 * Checks if a card should be marked as a leech and updates it
 * Leech detection rules:
 * - More than 8 fails within the last 30 reviews, OR
 * - More than 12 total fails
 * @param card - Card to check
 * @returns true if leech was detected/updated, false otherwise
 */
function checkAndMarkLeech(card: Card): boolean {
  // This is a simplified check - in a real DB system, we'd check the last 30 reviews
  // For now, we use total fails and consecutive fails as proxy
  // Full implementation would require querying review history
  
  const shouldBeLeech = 
    card.totalFails > LEECH_FAIL_THRESHOLD_TOTAL ||
    (card.totalReviews >= LEECH_REVIEW_WINDOW && 
     card.totalFails > LEECH_FAIL_THRESHOLD_30_REVIEWS);

  if (shouldBeLeech && !card.isLeech) {
    card.isLeech = true;
    card.leechNotes = `Marked as leech: ${card.totalFails} total fails, ${card.consecutiveFails} consecutive fails`;
    return true;
  }

  return false;
}

/**
 * Resets leech status for a card
 * @param card - Card to reset
 * @returns Card with leech status reset
 */
export function resetLeech(card: Card): Card {
  return {
    ...card,
    isLeech: false,
    leechNotes: undefined,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generates a unique ID for cards
 * Uses simple UUID-like format (can be replaced with actual UUID library)
 */
function generateId(): string {
  return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates that a card has all required fields
 * @param card - Card to validate
 * @returns true if valid, throws error if invalid
 */
export function validateCard(card: Partial<Card>): card is Card {
  if (!card.id || !card.front || !card.back) {
    throw new Error('Card must have id, front, and back fields');
  }
  if (card.easeFactor !== undefined && card.easeFactor < MIN_EASE_FACTOR) {
    throw new Error(`Ease factor must be >= ${MIN_EASE_FACTOR}`);
  }
  if (card.intervalDays !== undefined && card.intervalDays < MIN_INTERVAL_DAYS) {
    throw new Error(`Interval days must be >= ${MIN_INTERVAL_DAYS}`);
  }
  return true;
}


