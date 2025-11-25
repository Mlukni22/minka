/**
 * API integration tests using supertest
 */

import request from 'supertest';
import app from '../api/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./test.db',
    },
  },
});

// Clean up database before and after tests
beforeAll(async () => {
  // Clear database
  await prisma.review.deleteMany();
  await prisma.card.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Cards API', () => {
  let cardId: string;
  const userId = 'test-user-123';

  describe('POST /cards', () => {
    it('should create a new card', async () => {
      const response = await request(app)
        .post('/cards')
        .send({
          front: 'Das Haus',
          back: 'The house',
          tags: ['A1', 'house'],
          userId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.front).toBe('Das Haus');
      expect(response.body.back).toBe('The house');
      expect(response.body.easeFactor).toBe(2.5);
      expect(response.body.reps).toBe(0);
      expect(response.body.totalReviews).toBe(0);

      cardId = response.body.id;
    });

    it('should reject card without front and back', async () => {
      await request(app)
        .post('/cards')
        .send({
          front: 'Test',
        })
        .expect(400);
    });
  });

  describe('GET /cards', () => {
    it('should get all cards', async () => {
      const response = await request(app)
        .get('/cards')
        .query({ userId })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /cards/:id', () => {
    it('should get a specific card', async () => {
      const response = await request(app)
        .get(`/cards/${cardId}`)
        .query({ userId })
        .expect(200);

      expect(response.body.id).toBe(cardId);
      expect(response.body.front).toBe('Das Haus');
    });

    it('should return 404 for non-existent card', async () => {
      await request(app)
        .get('/cards/non-existent-id')
        .expect(404);
    });
  });

  describe('GET /cards/due', () => {
    it('should get due cards', async () => {
      const response = await request(app)
        .get('/cards/due')
        .query({ userId })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should accept date parameter', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      
      const response = await request(app)
        .get('/cards/due')
        .query({
          date: futureDate.toISOString(),
          userId,
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject invalid date format', async () => {
      await request(app)
        .get('/cards/due')
        .query({
          date: 'invalid-date',
          userId,
        })
        .expect(400);
    });
  });

  describe('POST /cards/:id/review', () => {
    it('should record a review with quality 5', async () => {
      const response = await request(app)
        .post(`/cards/${cardId}/review`)
        .send({
          quality: 5,
          userId,
        })
        .expect(200);

      expect(response.body).toHaveProperty('card');
      expect(response.body).toHaveProperty('review');
      expect(response.body.card.totalReviews).toBe(1);
      expect(response.body.card.reps).toBe(1);
      expect(response.body.card.intervalDays).toBe(1);
      expect(response.body.review.quality).toBe(5);
    });

    it('should record a review with quality 4', async () => {
      const response = await request(app)
        .post(`/cards/${cardId}/review`)
        .send({
          quality: 4,
          userId,
        })
        .expect(200);

      expect(response.body.card.reps).toBe(2);
      expect(response.body.card.intervalDays).toBe(6); // Second review = 6 days
    });

    it('should handle failure (quality < 3)', async () => {
      const response = await request(app)
        .post(`/cards/${cardId}/review`)
        .send({
          quality: 2,
          userId,
        })
        .expect(200);

      expect(response.body.card.reps).toBe(0); // Reset on failure
      expect(response.body.card.intervalDays).toBe(1);
      expect(response.body.card.totalFails).toBeGreaterThan(0);
    });

    it('should reject invalid quality values', async () => {
      await request(app)
        .post(`/cards/${cardId}/review`)
        .send({
          quality: 6,
          userId,
        })
        .expect(400);

      await request(app)
        .post(`/cards/${cardId}/review`)
        .send({
          quality: -1,
          userId,
        })
        .expect(400);
    });

    it('should reject missing quality', async () => {
      await request(app)
        .post(`/cards/${cardId}/review`)
        .send({
          userId,
        })
        .expect(400);
    });

    it('should return 404 for non-existent card', async () => {
      await request(app)
        .post('/cards/non-existent-id/review')
        .send({
          quality: 5,
          userId,
        })
        .expect(404);
    });
  });

  describe('POST /cards/:id/reset-leech', () => {
    it('should reset leech status', async () => {
      // First, mark card as leech by creating many failures
      // (In a real scenario, this would happen naturally)
      
      const response = await request(app)
        .post(`/cards/${cardId}/reset-leech`)
        .send({
          userId,
        })
        .expect(200);

      expect(response.body.isLeech).toBe(false);
    });

    it('should return 404 for non-existent card', async () => {
      await request(app)
        .post('/cards/non-existent-id/reset-leech')
        .send({
          userId,
        })
        .expect(404);
    });
  });

  describe('GET /cards/:id/reviews', () => {
    it('should get review history for a card', async () => {
      const response = await request(app)
        .get(`/cards/${cardId}/reviews`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('quality');
      expect(response.body[0]).toHaveProperty('timestamp');
    });
  });

  describe('Full workflow test', () => {
    it('should complete full workflow: create -> review -> check due', async () => {
      // Create a new card
      const createResponse = await request(app)
        .post('/cards')
        .send({
          front: 'Guten Tag',
          back: 'Hello',
          userId,
        })
        .expect(201);

      const newCardId = createResponse.body.id;

      // Review it multiple times
      await request(app)
        .post(`/cards/${newCardId}/review`)
        .send({ quality: 5, userId })
        .expect(200);

      await request(app)
        .post(`/cards/${newCardId}/review`)
        .send({ quality: 5, userId })
        .expect(200);

      // Get the updated card
      const cardResponse = await request(app)
        .get(`/cards/${newCardId}`)
        .query({ userId })
        .expect(200);

      expect(cardResponse.body.totalReviews).toBe(2);
      expect(cardResponse.body.reps).toBe(2);

      // Check review history
      const historyResponse = await request(app)
        .get(`/cards/${newCardId}/reviews`)
        .expect(200);

      expect(historyResponse.body.length).toBe(2);
    });
  });
});

describe('Health check', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});

