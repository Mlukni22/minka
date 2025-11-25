# Example Review Sequences

This document shows expected outcomes for various review sequences using the SM-2 algorithm.

## Sequence 1: Perfect Recall (5, 5, 5)

**Starting State:**
- EF = 2.5
- reps = 0
- intervalDays = 0
- lastIntervalDays = 0

**Review 1: quality = 5**
- EF' = 2.5 + (0.1 - (5-5) * (0.08 + (5-5) * 0.02))
- EF' = 2.5 + 0.1 = 2.6
- reps = 1
- intervalDays = 1 (first review)
- nextReview = today + 1 day

**Review 2: quality = 5** (after 1 day)
- EF' = 2.6 + 0.1 = 2.7
- reps = 2
- intervalDays = 6 (second review)
- nextReview = today + 6 days

**Review 3: quality = 5** (after 6 days)
- EF' = 2.7 + 0.1 = 2.8
- reps = 3
- intervalDays = round(6 * 2.7) = round(16.2) = 16
- nextReview = today + 16 days

## Sequence 2: Good Progress (5, 5, 4)

**Starting State:**
- EF = 2.5
- reps = 0

**Review 1: quality = 5**
- EF = 2.6
- reps = 1
- intervalDays = 1

**Review 2: quality = 5**
- EF = 2.7
- reps = 2
- intervalDays = 6

**Review 3: quality = 4**
- EF' = 2.7 + (0.1 - (5-4) * (0.08 + (5-4) * 0.02))
- EF' = 2.7 + (0.1 - 1 * 0.1) = 2.7 + 0 = 2.7
- reps = 3
- intervalDays = round(6 * 2.7) = 16

## Sequence 3: With Failure (4, 3, 2, 0, 5)

**Starting State:**
- EF = 2.5
- reps = 0

**Review 1: quality = 4**
- EF' = 2.5 + (0.1 - (5-4) * (0.08 + (5-4) * 0.02))
- EF' = 2.5 + (0.1 - 0.1) = 2.5
- reps = 1
- intervalDays = 1

**Review 2: quality = 3**
- EF' = 2.5 + (0.1 - (5-3) * (0.08 + (5-3) * 0.02))
- EF' = 2.5 + (0.1 - 2 * 0.12) = 2.5 - 0.14 = 2.36
- reps = 2
- intervalDays = 6

**Review 3: quality = 2 (failure)**
- reps = 0 (reset)
- intervalDays = 1
- totalFails = 1
- consecutiveFails = 1
- EF' = max(2.36 - 0.02, 1.3) = 2.34

**Review 4: quality = 0 (total failure)**
- reps = 0
- intervalDays = 1
- totalFails = 2
- consecutiveFails = 2
- EF' = max(2.34 - 0.02, 1.3) = 2.32

**Review 5: quality = 5 (recovery)**
- consecutiveFails = 0 (reset)
- reps = 1
- intervalDays = 1
- EF' = 2.32 + 0.1 = 2.42

## Sequence 4: Leech Detection

**Scenario:** Card fails 10 times within 30 reviews

**Starting State:**
- totalReviews = 25
- totalFails = 8
- consecutiveFails = 3

**Review: quality = 2**
- totalReviews = 26
- totalFails = 9
- consecutiveFails = 4
- **Leech detected** (9 fails > 8 threshold)
- isLeech = true

## Expected Test Results

Use these sequences to verify algorithm correctness:

```typescript
// Sequence 1: 5, 5, 5
expect(result1.reps).toBe(1);
expect(result1.intervalDays).toBe(1);
expect(result1.easeFactor).toBeCloseTo(2.6, 1);

expect(result2.reps).toBe(2);
expect(result2.intervalDays).toBe(6);
expect(result2.easeFactor).toBeCloseTo(2.7, 1);

expect(result3.reps).toBe(3);
expect(result3.intervalDays).toBe(16);
expect(result3.easeFactor).toBeCloseTo(2.8, 1);
```


