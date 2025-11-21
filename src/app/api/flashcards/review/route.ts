import { NextRequest, NextResponse } from 'next/server';
import { getFlashcardSRS, saveFlashcardReview, getFlashcardStats } from '@/lib/db/flashcards';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flashcardId, rating, userId, cardType, userAnswer, isCorrect } = body;
    
    if (!userId || !flashcardId || rating === undefined || !cardType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, flashcardId, rating, cardType' },
        { status: 400 }
      );
    }
    
    // Validate rating (0-3)
    const ratingNumber = typeof rating === 'number' ? rating : parseInt(rating, 10);
    if (isNaN(ratingNumber) || ratingNumber < 0 || ratingNumber > 3) {
      return NextResponse.json(
        { error: 'Rating must be between 0 and 3' },
        { status: 400 }
      );
    }
    
    // Validate cardType
    if (cardType !== 'A' && cardType !== 'B') {
      return NextResponse.json(
        { error: 'cardType must be "A" or "B"' },
        { status: 400 }
      );
    }
    
    // Get current SRS data
    const previousSRS = await getFlashcardSRS(userId, flashcardId);
    if (!previousSRS) {
      return NextResponse.json(
        { error: 'Flashcard not found' },
        { status: 404 }
      );
    }
    
    // Save review and update SRS
    const review = await saveFlashcardReview(
      userId,
      flashcardId,
      ratingNumber as 0 | 1 | 2 | 3,
      previousSRS,
      cardType as 'A' | 'B',
      userAnswer,
      isCorrect
    );
    
    // Get updated stats
    const stats = await getFlashcardStats(userId);
    
    return NextResponse.json({
      success: true,
      review,
      updatedFlashcard: {
        dueAt: review.reviewedAt, // This would be the new due date
        intervalDays: review.newIntervalDays,
        easeFactor: review.newEaseFactor,
        repetitions: review.newIntervalDays > 0 ? previousSRS.repetitions + 1 : 0,
      },
      stats: {
        dueToday: stats.dueToday,
        newToday: stats.newToday,
        learned: stats.learned,
      },
    });
  } catch (error) {
    console.error('Error reviewing flashcard:', error);
    return NextResponse.json(
      { error: 'Failed to save review' },
      { status: 500 }
    );
  }
}

