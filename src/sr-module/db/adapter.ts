/**
 * Database adapter for SR module
 * Connects the algorithm to Prisma database
 */

import { PrismaClient, Card as PrismaCard, Review as PrismaReview } from '@prisma/client';
import { Card, createCard, recordReview, calculateNextReview, getDueCards, resetLeech } from '../srAlgorithm';

// Prisma client singleton to avoid multiple instances
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * Convert Prisma Card to algorithm Card format
 */
function prismaCardToCard(prismaCard: PrismaCard): Card {
  return {
    id: prismaCard.id,
    front: prismaCard.front,
    back: prismaCard.back,
    createdAt: prismaCard.createdAt.toISOString(),
    updatedAt: prismaCard.updatedAt.toISOString(),
    easeFactor: prismaCard.easeFactor,
    intervalDays: prismaCard.intervalDays,
    lastIntervalDays: prismaCard.lastIntervalDays,
    reps: prismaCard.reps,
    nextReview: prismaCard.nextReview.toISOString(),
    totalReviews: prismaCard.totalReviews,
    totalFails: prismaCard.totalFails,
    consecutiveFails: prismaCard.consecutiveFails,
    isLeech: prismaCard.isLeech,
    leechNotes: prismaCard.leechNotes || undefined,
    tags: prismaCard.tags ? JSON.parse(prismaCard.tags) : [],
    userId: prismaCard.userId || undefined,
  };
}

/**
 * Convert algorithm Card to Prisma Card data
 */
function cardToPrismaData(card: Card): Partial<PrismaCard> {
  return {
    front: card.front,
    back: card.back,
    updatedAt: new Date(card.updatedAt),
    easeFactor: card.easeFactor,
    intervalDays: card.intervalDays,
    lastIntervalDays: card.lastIntervalDays,
    reps: card.reps,
    nextReview: new Date(card.nextReview),
    totalReviews: card.totalReviews,
    totalFails: card.totalFails,
    consecutiveFails: card.consecutiveFails,
    isLeech: card.isLeech,
    leechNotes: card.leechNotes,
    tags: card.tags && card.tags.length > 0 ? JSON.stringify(card.tags) : null,
    userId: card.userId || null,
  };
}

/**
 * Create a new card in the database
 */
export async function dbCreateCard(data: {
  front: string;
  back: string;
  tags?: string[];
  userId?: string;
}): Promise<Card> {
  const card = createCard(data);
  const prismaCard = await prisma.card.create({
    data: {
      id: card.id,
      front: card.front,
      back: card.back,
      createdAt: new Date(card.createdAt),
      updatedAt: new Date(card.updatedAt),
      easeFactor: card.easeFactor,
      intervalDays: card.intervalDays,
      lastIntervalDays: card.lastIntervalDays,
      reps: card.reps,
      nextReview: new Date(card.nextReview),
      totalReviews: card.totalReviews,
      totalFails: card.totalFails,
      consecutiveFails: card.consecutiveFails,
      isLeech: card.isLeech,
      leechNotes: card.leechNotes,
      tags: card.tags && card.tags.length > 0 ? JSON.stringify(card.tags) : null,
      userId: data.userId || null,
    },
  });
  return prismaCardToCard(prismaCard);
}

/**
 * Get a card by ID
 */
export async function dbGetCard(cardId: string, userId?: string): Promise<Card | null> {
  const prismaCard = await prisma.card.findFirst({
    where: {
      id: cardId,
      ...(userId ? { userId } : {}),
    },
  });
  return prismaCard ? prismaCardToCard(prismaCard) : null;
}

/**
 * Get all cards for a user
 */
export async function dbGetCards(userId?: string): Promise<Card[]> {
  const prismaCards = await prisma.card.findMany({
    where: userId ? { userId } : {},
    orderBy: { createdAt: 'desc' },
  });
  return prismaCards.map(prismaCardToCard);
}

/**
 * Get due cards on or before a specific date
 */
export async function dbGetDueCards(date?: Date, userId?: string): Promise<Card[]> {
  const checkDate = date || new Date();
  const prismaCards = await prisma.card.findMany({
    where: {
      nextReview: { lte: checkDate },
      ...(userId ? { userId } : {}),
    },
    orderBy: { nextReview: 'asc' },
  });
  const cards = prismaCards.map(prismaCardToCard);
  return getDueCards(cards, checkDate.toISOString());
}

/**
 * Record a review for a card
 */
export async function dbRecordReview(
  cardId: string,
  quality: number,
  userId?: string
): Promise<{ card: Card; review: PrismaReview }> {
  // Get the card
  const prismaCard = await prisma.card.findFirst({
    where: {
      id: cardId,
      ...(userId ? { userId } : {}),
    },
  });

  if (!prismaCard) {
    throw new Error(`Card not found: ${cardId}`);
  }

  const card = prismaCardToCard(prismaCard);

  // Calculate review result
  const reviewResult = recordReview(card, quality);

  // Update card in database
  const updatedPrismaCard = await prisma.card.update({
    where: { id: cardId },
    data: cardToPrismaData(reviewResult.card),
  });

  // Create review log entry
  const review = await prisma.review.create({
    data: {
      cardId: cardId,
      userId: userId || null,
      quality,
      timestamp: new Date(),
      intervalDays: reviewResult.intervalDays,
      easeFactor: reviewResult.easeFactor,
      reps: reviewResult.reps,
    },
  });

  return {
    card: prismaCardToCard(updatedPrismaCard),
    review,
  };
}

/**
 * Reset leech status for a card
 */
export async function dbResetLeech(cardId: string, userId?: string): Promise<Card> {
  const prismaCard = await prisma.card.findFirst({
    where: {
      id: cardId,
      ...(userId ? { userId } : {}),
    },
  });

  if (!prismaCard) {
    throw new Error(`Card not found: ${cardId}`);
  }

  const card = prismaCardToCard(prismaCard);
  const resetCard = resetLeech(card);

  const updatedPrismaCard = await prisma.card.update({
    where: { id: cardId },
    data: cardToPrismaData(resetCard),
  });

  return prismaCardToCard(updatedPrismaCard);
}

/**
 * Get review history for a card
 */
export async function dbGetReviewHistory(cardId: string, limit: number = 50): Promise<PrismaReview[]> {
  return prisma.review.findMany({
    where: { cardId },
    orderBy: { timestamp: 'desc' },
    take: limit,
  });
}

/**
 * Get review history for a user
 */
export async function dbGetUserReviewHistory(userId: string, limit: number = 100): Promise<PrismaReview[]> {
  return prisma.review.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    take: limit,
  });
}

/**
 * Check for leeches (cards that need attention)
 */
export async function dbGetLeeches(userId?: string): Promise<Card[]> {
  const prismaCards = await prisma.card.findMany({
    where: {
      isLeech: true,
      ...(userId ? { userId } : {}),
    },
    orderBy: { totalFails: 'desc' },
  });
  return prismaCards.map(prismaCardToCard);
}

