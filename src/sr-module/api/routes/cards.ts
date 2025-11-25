/**
 * Express API routes for cards
 */

import { Router, Request, Response } from 'express';
import {
  dbCreateCard,
  dbGetCard,
  dbGetCards,
  dbGetDueCards,
  dbRecordReview,
  dbResetLeech,
  dbGetReviewHistory,
} from '../../db/adapter';

const router = Router();

/**
 * POST /cards
 * Create a new card
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { front, back, tags, userId } = req.body;

    if (!front || !back) {
      return res.status(400).json({
        error: 'Missing required fields: front and back are required',
      });
    }

    const card = await dbCreateCard({
      front: String(front),
      back: String(back),
      tags: Array.isArray(tags) ? tags : undefined,
      userId: userId || req.headers['x-user-id'] as string,
    });

    res.status(201).json(card);
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({
      error: 'Failed to create card',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /cards
 * Get all cards (optionally filtered by userId)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
    const cards = await dbGetCards(userId);
    res.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({
      error: 'Failed to fetch cards',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /cards/due
 * Get cards due for review on or before the specified date
 * Query params: date (ISO string, optional, defaults to now)
 */
router.get('/due', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
    const dateParam = req.query.date as string;
    const date = dateParam ? new Date(dateParam) : new Date();

    if (isNaN(date.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format. Use ISO 8601 format (e.g., 2025-11-24T09:00:00Z)',
      });
    }

    const dueCards = await dbGetDueCards(date, userId);
    res.json(dueCards);
  } catch (error) {
    console.error('Error fetching due cards:', error);
    res.status(500).json({
      error: 'Failed to fetch due cards',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /cards/:id
 * Get a specific card by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
    
    const card = await dbGetCard(id, userId);
    
    if (!card) {
      return res.status(404).json({
        error: 'Card not found',
      });
    }

    res.json(card);
  } catch (error) {
    console.error('Error fetching card:', error);
    res.status(500).json({
      error: 'Failed to fetch card',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /cards/:id/review
 * Record a review for a card
 * Body: { quality: number (0-5) }
 */
router.post('/:id/review', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quality } = req.body;
    const userId = (req.body.userId as string) || (req.headers['x-user-id'] as string);

    if (quality === undefined || quality === null) {
      return res.status(400).json({
        error: 'Missing required field: quality (0-5)',
      });
    }

    const qualityNum = Number(quality);
    if (!Number.isInteger(qualityNum) || qualityNum < 0 || qualityNum > 5) {
      return res.status(400).json({
        error: 'Quality must be an integer between 0 and 5',
      });
    }

    const { card, review } = await dbRecordReview(id, qualityNum, userId);
    
    res.json({
      card,
      review: {
        id: review.id,
        cardId: review.cardId,
        userId: review.userId,
        quality: review.quality,
        timestamp: review.timestamp.toISOString(),
        intervalDays: review.intervalDays,
        easeFactor: review.easeFactor,
        reps: review.reps,
      },
    });
  } catch (error) {
    console.error('Error recording review:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: 'Failed to record review',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /cards/:id/reset-leech
 * Reset leech status for a card
 */
router.post('/:id/reset-leech', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.body.userId as string) || (req.headers['x-user-id'] as string);

    const card = await dbResetLeech(id, userId);
    res.json(card);
  } catch (error) {
    console.error('Error resetting leech:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: 'Failed to reset leech status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /cards/:id/reviews
 * Get review history for a card
 */
router.get('/:id/reviews', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 50;

    const reviews = await dbGetReviewHistory(id, limit);
    
    res.json(reviews.map(review => ({
      id: review.id,
      cardId: review.cardId,
      userId: review.userId,
      quality: review.quality,
      timestamp: review.timestamp.toISOString(),
      intervalDays: review.intervalDays,
      easeFactor: review.easeFactor,
      reps: review.reps,
    })));
  } catch (error) {
    console.error('Error fetching review history:', error);
    res.status(500).json({
      error: 'Failed to fetch review history',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

