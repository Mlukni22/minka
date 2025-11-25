import { NextRequest, NextResponse } from 'next/server';
import { getFlashcardQueue, getFlashcardPreferences, getFlashcardStats } from '@/lib/db/flashcards';
import { getStoryById } from '@/lib/db/stories';

export async function GET(request: NextRequest) {
  try {
    // Get user from query params
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const storyId = searchParams.get('storyId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }
    
    // NOTE: API routes run server-side without auth context
    // Firestore rules require authentication, so these calls will fail
    // The client should call Firestore directly instead of using this API route
    // For now, return empty to avoid errors
    console.warn('[Flashcard Queue API] ⚠️ API routes run server-side without auth. Client should call Firestore directly.');
    
    // Try to get preferences (will fail if no auth, but we'll handle it)
    let preferences;
    try {
      preferences = await getFlashcardPreferences(userId);
    } catch (error: any) {
      console.warn('[Flashcard Queue API] Could not get preferences (server-side auth issue), using defaults');
      preferences = {
        id: 'default',
        userId,
        maxNewCardsPerDay: 15,
        maxReviewsPerDay: 100,
        learningLanguageCode: 'de',
        showBackAutomatically: false,
        sessionGoalCards: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    
    console.log('[Flashcard Queue API] ========== LOADING QUEUE ==========');
    console.log('[Flashcard Queue API] User ID:', userId);
    console.log('[Flashcard Queue API] Story ID:', storyId || '(none)');
    console.log('[Flashcard Queue API] Limit:', limit);
    console.log('[Flashcard Queue API] Max new cards:', preferences.maxNewCardsPerDay);
    
    // Try to get queue (will fail if no auth, but we'll handle it)
    let queue;
    try {
      queue = await getFlashcardQueue(userId, {
        storyId,
        limit,
        maxNewCards: preferences.maxNewCardsPerDay,
      });
    } catch (error: any) {
      if (error?.code === 'permission-denied') {
        console.warn('[Flashcard Queue API] Permission denied (server-side auth issue). Returning empty queue.');
        console.warn('[Flashcard Queue API] Client should call Firestore directly instead of using this API route.');
        queue = [];
      } else {
        throw error;
      }
    }
    
    console.log(`[Flashcard Queue API] ✅ Found ${queue.length} cards for user ${userId}`);
    
    // Debug: Log raw queue data
    if (queue.length > 0) {
      console.log('[Flashcard Queue API] 📚 RAW QUEUE DATA (first 3 cards):', 
        queue.slice(0, 3).map((card, idx) => {
          const cardData = {
            index: idx,
            id: card.id,
            frontText: card.frontText || '(EMPTY)',
            backText: card.backText || '(EMPTY)',
            contextSentence: card.contextSentence || '(EMPTY)',
            hasSRS: !!card.srs,
            displayType: card.displayType,
            allKeys: Object.keys(card),
          };
          console.log(`[Flashcard Queue API] Card ${idx}:`, cardData);
          return cardData;
        })
      );
    } else {
      console.warn('[Flashcard Queue API] ⚠️ No cards found in queue!');
    }
    
    // Enrich with story titles and filter out nulls
    const enrichedQueue = (await Promise.all(
      queue.map(async (card) => {
        let storyTitle: string | undefined;
        if (card.storyId) {
          try {
            const story = await getStoryById(card.storyId);
            storyTitle = story?.title;
          } catch (error) {
            console.error('Error fetching story:', error);
          }
        }
        
        // Map with proper fallbacks and validation
        const frontText = (card.frontText || card.front || '').toString().trim();
        const backText = (card.backText || card.back || '').toString().trim();
        const contextSentence = (card.contextSentence || card.exampleSentence || '').toString().trim();
        
        // Debug: Log if card has empty text
        if (!frontText || !backText) {
          console.error(`[Flashcard Queue API] Card ${card.id} has empty text, skipping:`, {
            id: card.id,
            frontText: frontText,
            backText: backText,
            cardFrontText: card.frontText,
            cardFront: card.front,
            cardBackText: card.backText,
            cardBack: card.back,
            fullCard: card,
          });
          // Return null to filter out
          return null;
        }
        
        const mapped = {
          id: card.id,
          frontText,
          backText,
          contextSentence,
          contextTranslation: card.contextTranslation?.toString().trim() || undefined,
          storyTitle,
          displayType: card.displayType, // 'A' or 'B'
        };
        
        return mapped;
      })
    )).filter((card): card is NonNullable<typeof card> => card !== null);
    
    // Try to get stats (will fail if no auth, but we'll handle it)
    let stats;
    try {
      stats = await getFlashcardStats(userId);
    } catch (error: any) {
      if (error?.code === 'permission-denied') {
        console.warn('[Flashcard Queue API] Permission denied getting stats (server-side auth issue). Using defaults.');
        stats = {
          dueToday: 0,
          newToday: 0,
          learned: 0,
          total: 0,
          byStory: {},
        };
      } else {
        throw error;
      }
    }
    
    return NextResponse.json({
      cards: enrichedQueue,
      stats: {
        dueToday: stats.dueToday,
        newToday: stats.newToday,
        remainingInSession: Math.max(0, preferences.sessionGoalCards - enrichedQueue.length),
      },
    });
  } catch (error) {
    console.error('Error getting flashcard queue:', error);
    return NextResponse.json(
      { error: 'Failed to get flashcard queue' },
      { status: 500 }
    );
  }
}

