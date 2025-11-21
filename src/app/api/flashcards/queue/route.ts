import { NextRequest, NextResponse } from 'next/server';
import { getFlashcardQueue, getFlashcardPreferences, getFlashcardStats } from '@/lib/db/flashcards';
import { getStoryById } from '@/lib/db/stories';

export async function GET(request: NextRequest) {
  try {
    // Get user from session (you'll need to implement auth)
    // For now, we'll get userId from query params (in production, use proper auth)
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const storyId = searchParams.get('storyId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }
    
    // Get user preferences
    const preferences = await getFlashcardPreferences(userId);
    
    console.log('[Flashcard Queue API] ========== LOADING QUEUE ==========');
    console.log('[Flashcard Queue API] User ID:', userId);
    console.log('[Flashcard Queue API] Story ID:', storyId || '(none)');
    console.log('[Flashcard Queue API] Limit:', limit);
    console.log('[Flashcard Queue API] Max new cards:', preferences.maxNewCardsPerDay);
    
    // Get queue
    const queue = await getFlashcardQueue(userId, {
      storyId,
      limit,
      maxNewCards: preferences.maxNewCardsPerDay,
    });
    
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
    
    // Get stats
    const stats = await getFlashcardStats(userId);
    
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

