// src/scheduler/scheduleRunner.ts
import { getDueCards, Card } from "../sr-module/srAlgorithm";

export type PrismaLike = {
  card: {
    findMany: (args: any) => Promise<any[]>;
  };
};

/**
 * scheduleRunner
 *
 * Queries cards for a user (via prisma.card.findMany), finds those due up to `upToDateISO`
 * using the sr.getDueCards helper, and calls the provided callback with the due cards.
 *
 * Returns an object: { dueCount, dueCards } to make assertions easy in tests.
 *
 * - prisma: Prisma-like client with `.card.findMany({ where: { userId } })`
 * - userId: string
 * - upToDateISO: optional ISO string cutoff (default now)
 * - callback: (dueCards[]) => Promise<void> | void
 */
export async function scheduleRunner(
  prisma: PrismaLike,
  userId: string,
  callback: (dueCards: Card[]) => Promise<void> | void,
  upToDateISO?: string
): Promise<{ dueCount: number; dueCards: Card[] }> {
  if (!userId) throw new Error("userId required");

  // Fetch all cards for user. Keep it flexible: caller can implement pagination if needed.
  const rows = await prisma.card.findMany({ where: { userId } });

  // Map DB rows to the Card shape expected by getDueCards
  const mapped: Card[] = rows.map((r) => ({
    id: r.id,
    front: r.front,
    back: r.back,
    createdAt: r.createdAt ? (r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt)) : new Date().toISOString(),
    updatedAt: r.updatedAt ? (r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt)) : new Date().toISOString(),
    easeFactor: r.easeFactor ?? 2.5,
    intervalDays: r.intervalDays ?? 0,
    lastIntervalDays: r.lastIntervalDays ?? 0,
    reps: r.reps ?? 0,
    // if nextReview is Date, convert; if absent, set epoch
    nextReview: r.nextReview ? (r.nextReview instanceof Date ? r.nextReview.toISOString() : String(r.nextReview)) : new Date(0).toISOString(),
    totalReviews: r.totalReviews ?? 0,
    totalFails: r.totalFails ?? 0,
    consecutiveFails: r.consecutiveFails ?? 0,
    isLeech: r.isLeech ?? false,
    leechNotes: r.leechNotes,
    tags: r.tags,
    userId: r.userId ?? userId,
  }));

  const due = getDueCards(mapped, upToDateISO);

  if (due.length > 0) {
    // allow the callback to be async
    await Promise.resolve(callback(due));
  }

  return { dueCount: due.length, dueCards: due };
}

export default scheduleRunner;


