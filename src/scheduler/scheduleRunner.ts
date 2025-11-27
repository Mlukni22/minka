// src/scheduler/scheduleRunner.ts
import { getDueCards } from "../sr-module/srAlgorithm";

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
  callback: (dueCards: any[]) => Promise<void> | void,
  upToDateISO?: string
): Promise<{ dueCount: number; dueCards: any[] }> {
  if (!userId) throw new Error("userId required");

  // Fetch all cards for user. Keep it flexible: caller can implement pagination if needed.
  const rows = await prisma.card.findMany({ where: { userId } });

  // Map DB rows to the Card shape expected by sr.getDueCards
  const mapped = rows.map((r) => ({
    ...r,
    // if nextReview is Date, convert; if absent, set epoch
    nextReview: r.nextReview ? (r.nextReview instanceof Date ? r.nextReview.toISOString() : String(r.nextReview)) : new Date(0).toISOString(),
    intervalDays: r.intervalDays ?? 0,
    reps: r.reps ?? 0,
  }));

  const due = getDueCards(mapped, upToDateISO);

  if (due.length > 0) {
    // allow the callback to be async
    await Promise.resolve(callback(due));
  }

  return { dueCount: due.length, dueCards: due };
}

export default scheduleRunner;
