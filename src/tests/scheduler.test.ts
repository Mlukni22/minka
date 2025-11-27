// src/tests/scheduler.test.ts
import { scheduleRunner } from "../scheduler/scheduleRunner";
import { getDueCards } from "../sr-module/srAlgorithm";

describe("scheduleRunner", () => {
  it("calls callback with due cards and returns correct count", async () => {
    const now = new Date();
    const past = new Date(now);
    past.setUTCDate(now.getUTCDate() - 2);
    const future = new Date(now);
    future.setUTCDate(now.getUTCDate() + 5);

    // Two mocked DB rows: one due (past), one not due (future)
    const mockCards = [
      {
        id: "card-due",
        userId: "user-1",
        front: "Due front",
        back: "Due back",
        nextReview: past.toISOString(),
        intervalDays: 1,
        reps: 1,
        easeFactor: 2.5,
        lastIntervalDays: 0,
        totalReviews: 0,
        totalFails: 0,
        consecutiveFails: 0,
        isLeech: false,
        tags: ["A1"],
      },
      {
        id: "card-future",
        userId: "user-1",
        front: "Future front",
        back: "Future back",
        nextReview: future.toISOString(),
        intervalDays: 6,
        reps: 2,
        easeFactor: 2.5,
        lastIntervalDays: 1,
        totalReviews: 2,
        totalFails: 0,
        consecutiveFails: 0,
        isLeech: false,
        tags: ["A1"],
      },
    ];

    const prismaMock = {
      card: {
        findMany: jest.fn().mockResolvedValue(mockCards),
      },
    };

    const cb = jest.fn(async (dueCards: any[]) => {
      // assert the callback receives the expected card(s)
      expect(Array.isArray(dueCards)).toBe(true);
      expect(dueCards.length).toBe(1);
      expect(dueCards[0].id).toBe("card-due");
    });

    const result = await scheduleRunner(prismaMock as any, "user-1", cb);

    expect(prismaMock.card.findMany).toHaveBeenCalledWith({ where: { userId: "user-1" } });
    expect(cb).toHaveBeenCalledTimes(1);
    expect(result.dueCount).toBe(1);
    expect(result.dueCards[0].id).toBe("card-due");
  });

  it("does not call callback when no cards are due", async () => {
    const now = new Date();
    const future1 = new Date(now); future1.setUTCDate(now.getUTCDate() + 2);
    const future2 = new Date(now); future2.setUTCDate(now.getUTCDate() + 10);

    const mockCards = [
      { id: "c1", userId: "u2", nextReview: future1.toISOString(), intervalDays: 1, reps: 1 },
      { id: "c2", userId: "u2", nextReview: future2.toISOString(), intervalDays: 6, reps: 2 },
    ];

    const prismaMock = {
      card: {
        findMany: jest.fn().mockResolvedValue(mockCards),
      },
    };

    const cb = jest.fn();

    const result = await scheduleRunner(prismaMock as any, "u2", cb);

    expect(prismaMock.card.findMany).toHaveBeenCalledWith({ where: { userId: "u2" } });
    expect(cb).not.toHaveBeenCalled();
    expect(result.dueCount).toBe(0);
    expect(result.dueCards.length).toBe(0);
  });

  it("honors the upToDateISO parameter (finds due cards up to that time)", async () => {
    // create a card whose nextReview is tomorrow
    const now = new Date();
    const tomorrow = new Date(now); tomorrow.setUTCDate(now.getUTCDate() + 1);
    const inThreeDays = new Date(now); inThreeDays.setUTCDate(now.getUTCDate() + 3);

    const mockCards = [
      { id: "c-1", userId: "u3", nextReview: tomorrow.toISOString(), intervalDays: 1, reps: 1 },
      { id: "c-2", userId: "u3", nextReview: inThreeDays.toISOString(), intervalDays: 6, reps: 2 },
    ];

    const prismaMock = {
      card: {
        findMany: jest.fn().mockResolvedValue(mockCards),
      },
    };

    const cb = jest.fn();

    // pass upToDateISO as two days from now -> should include tomorrow but not inThreeDays
    const cutoff = new Date(now); cutoff.setUTCDate(now.getUTCDate() + 2);
    const result = await scheduleRunner(prismaMock as any, "u3", cb, cutoff.toISOString());

    expect(cb).toHaveBeenCalledTimes(1);
    expect(result.dueCount).toBe(1);
    expect(result.dueCards[0].id).toBe("c-1");
  });
});
