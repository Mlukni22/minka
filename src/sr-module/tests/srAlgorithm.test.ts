/**
 * Unit tests for SR Algorithm
 */

import {
  Card,
  createCard,
  recordReview,
  calculateNextReview,
  getDueCards,
  resetLeech,
} from '../srAlgorithm';

describe('SR Algorithm', () => {
  describe('createCard', () => {
    it('should create a card with default values', () => {
      const card = createCard({
        front: 'Das Haus',
        back: 'The house',
      });

      expect(card.front).toBe('Das Haus');
      expect(card.back).toBe('The house');
      expect(card.easeFactor).toBe(2.5);
      expect(card.reps).toBe(0);
      expect(card.intervalDays).toBe(0);
      expect(card.totalReviews).toBe(0);
      expect(card.totalFails).toBe(0);
      expect(card.isLeech).toBe(false);
    });

    it('should create a card with tags', () => {
      const card = createCard({
        front: 'Guten Tag',
        back: 'Hello',
        tags: ['A1', 'greeting'],
      });

      expect(card.tags).toEqual(['A1', 'greeting']);
    });

    it('should create a card with userId', () => {
      const card = createCard({
        front: 'Test',
        back: 'Test',
        userId: 'user-123',
      });

      expect(card.userId).toBe('user-123');
    });
  });

  describe('calculateNextReview', () => {
    let card: Card;

    beforeEach(() => {
      card = createCard({
        front: 'Das Haus',
        back: 'The house',
      });
    });

    it('should handle quality 5 (perfect) on first review', () => {
      const result = calculateNextReview(card, 5);

      expect(result.reps).toBe(1);
      expect(result.intervalDays).toBe(1);
      expect(result.easeFactor).toBeGreaterThan(2.5);
      expect(result.consecutiveFails).toBe(0);
      expect(result.totalFails).toBe(0);
    });

    it('should handle quality 5 -> 5 -> 4 sequence', () => {
      // First review: quality 5
      let result = calculateNextReview(card, 5);
      expect(result.reps).toBe(1);
      expect(result.intervalDays).toBe(1);

      // Update card for second review
      card = {
        ...card,
        ...result,
        lastIntervalDays: result.intervalDays,
      };

      // Second review: quality 5
      result = calculateNextReview(card, 5);
      expect(result.reps).toBe(2);
      expect(result.intervalDays).toBe(6); // Second review should be 6 days

      // Update card for third review
      card = {
        ...card,
        ...result,
        lastIntervalDays: result.intervalDays,
      };

      // Third review: quality 4
      result = calculateNextReview(card, 4);
      expect(result.reps).toBe(3);
      expect(result.intervalDays).toBeGreaterThan(6); // Should use EF * previous interval
    });

    it('should reset reps when quality < 3', () => {
      card.reps = 5;
      card.lastIntervalDays = 30;

      const result = calculateNextReview(card, 2);

      expect(result.reps).toBe(0);
      expect(result.intervalDays).toBe(1);
      expect(result.totalFails).toBe(1);
      expect(result.consecutiveFails).toBe(1);
      expect(result.easeFactor).toBeLessThanOrEqual(card.easeFactor);
    });

    it('should handle quality 0 (totally forgot)', () => {
      const result = calculateNextReview(card, 0);

      expect(result.reps).toBe(0);
      expect(result.intervalDays).toBe(1);
      expect(result.totalFails).toBe(1);
      expect(result.consecutiveFails).toBe(1);
    });

    it('should increment consecutiveFails on failure', () => {
      card.consecutiveFails = 2;

      const result = calculateNextReview(card, 1);

      expect(result.consecutiveFails).toBe(3);
    });

    it('should reset consecutiveFails on success', () => {
      card.consecutiveFails = 3;

      const result = calculateNextReview(card, 4);

      expect(result.consecutiveFails).toBe(0);
    });

    it('should cap intervalDays at 3650', () => {
      card.reps = 100;
      card.lastIntervalDays = 2000;
      card.easeFactor = 3.0;

      const result = calculateNextReview(card, 5);

      expect(result.intervalDays).toBeLessThanOrEqual(3650);
    });

    it('should enforce minimum ease factor of 1.3', () => {
      card.easeFactor = 1.3;

      // Multiple failures
      let result = calculateNextReview(card, 1);
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);

      card = { ...card, ...result, lastIntervalDays: result.intervalDays };
      result = calculateNextReview(card, 0);
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('should calculate correct nextReview date', () => {
      const now = new Date();
      const result = calculateNextReview(card, 5);

      const nextReviewDate = new Date(result.nextReview);
      const expectedDate = new Date(now);
      expectedDate.setDate(expectedDate.getDate() + result.intervalDays);

      // Allow 1 second difference for timing
      expect(Math.abs(nextReviewDate.getTime() - expectedDate.getTime())).toBeLessThan(1000);
    });
  });

  describe('recordReview', () => {
    it('should update card and increment totalReviews', () => {
      const card = createCard({
        front: 'Test',
        back: 'Test',
      });

      const result = recordReview(card, 5);

      expect(result.card.totalReviews).toBe(1);
      expect(result.card.reps).toBe(1);
      expect(result.intervalDays).toBe(1);
    });

    it('should increment totalFails on failure', () => {
      const card = createCard({
        front: 'Test',
        back: 'Test',
      });

      const result = recordReview(card, 2);

      expect(result.card.totalFails).toBe(1);
      expect(result.card.totalReviews).toBe(1);
    });

    it('should throw error for invalid quality', () => {
      const card = createCard({
        front: 'Test',
        back: 'Test',
      });

      expect(() => recordReview(card, 6)).toThrow('Quality must be an integer between 0 and 5');
      expect(() => recordReview(card, -1)).toThrow('Quality must be an integer between 0 and 5');
      expect(() => recordReview(card, 2.5)).toThrow('Quality must be an integer between 0 and 5');
    });

    it('should update updatedAt timestamp', async () => {
      const card = createCard({
        front: 'Test',
        back: 'Test',
      });
      const originalUpdatedAt = card.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      const beforeUpdate = new Date().toISOString();
      const result = recordReview(card, 5);
      const afterUpdate = new Date().toISOString();

      expect(result.card.updatedAt).not.toBe(originalUpdatedAt);
      expect(result.card.updatedAt >= beforeUpdate && result.card.updatedAt <= afterUpdate).toBe(true);
    });
  });

  describe('getDueCards', () => {
    it('should return cards due on or before the date', () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      const card1 = createCard({ front: 'Due', back: 'Due' });
      card1.nextReview = yesterday.toISOString();

      const card2 = createCard({ front: 'Not Due', back: 'Not Due' });
      card2.nextReview = tomorrow.toISOString();

      const card3 = createCard({ front: 'Due Today', back: 'Due Today' });
      card3.nextReview = now.toISOString();

      const dueCards = getDueCards([card1, card2, card3], now.toISOString());

      expect(dueCards.length).toBe(2);
      expect(dueCards.map(c => c.front)).toContain('Due');
      expect(dueCards.map(c => c.front)).toContain('Due Today');
      expect(dueCards.map(c => c.front)).not.toContain('Not Due');
    });

    it('should default to now if no date provided', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const card = createCard({ front: 'Due', back: 'Due' });
      card.nextReview = yesterday.toISOString();

      const dueCards = getDueCards([card]);

      expect(dueCards.length).toBe(1);
    });
  });

  describe('resetLeech', () => {
    it('should reset leech status', () => {
      const card: Card = {
        ...createCard({ front: 'Leech', back: 'Leech' }),
        isLeech: true,
        leechNotes: 'Too many failures',
      };

      const reset = resetLeech(card);

      expect(reset.isLeech).toBe(false);
      expect(reset.leechNotes).toBeUndefined();
    });

    it('should update updatedAt timestamp', async () => {
      const card = createCard({ front: 'Test', back: 'Test' });
      const originalUpdatedAt = card.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      const reset = resetLeech(card);

      expect(reset.updatedAt).not.toBe(originalUpdatedAt);
    });
  });

  describe('Example review sequence', () => {
    it('should follow the exact sequence: q=5, q=5, q=4', () => {
      // Start with EF=2.5, reps=0, interval=0
      let card = createCard({
        front: 'Das Haus',
        back: 'The house',
      });
      expect(card.easeFactor).toBe(2.5);
      expect(card.reps).toBe(0);

      // Review q=5 -> reps=1, interval=1, EF should increase
      let result = recordReview(card, 5);
      card = result.card;
      expect(card.reps).toBe(1);
      expect(result.intervalDays).toBe(1);
      expect(card.easeFactor).toBeGreaterThan(2.5);
      const efAfterFirst = card.easeFactor;

      // Update lastIntervalDays for next calculation
      card.lastIntervalDays = result.intervalDays;

      // Review q=5 -> reps=2, interval=6, EF should increase
      result = recordReview(card, 5);
      card = result.card;
      expect(card.reps).toBe(2);
      expect(result.intervalDays).toBe(6);
      expect(card.easeFactor).toBeGreaterThan(efAfterFirst);
      const efAfterSecond = card.easeFactor;

      // Update lastIntervalDays for next calculation
      card.lastIntervalDays = result.intervalDays;

      // Review q=4 -> reps=3, interval=round(6 * EF), EF updated
      result = recordReview(card, 4);
      card = result.card;
      expect(card.reps).toBe(3);
      // The interval should be round(6 * efAfterSecond) since lastIntervalDays was 6
      expect(result.intervalDays).toBe(Math.round(6 * efAfterSecond));
      // q=4 keeps EF same (formula: EF + (0.1 - (5-4) * (0.08 + (5-4) * 0.02)) = EF + 0)
      expect(card.easeFactor).toBeLessThanOrEqual(efAfterSecond);
    });
  });
});

