import { NextRequest, NextResponse } from 'next/server';
import { getFlashcardStats } from '@/lib/db/flashcards';
import { getStoryById } from '@/lib/db/stories';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }
    
    const stats = await getFlashcardStats(userId);
    
    // Enrich story IDs with titles
    const byStory: Record<string, { count: number; title: string }> = {};
    for (const [storyId, count] of Object.entries(stats.byStory)) {
      try {
        const story = await getStoryById(storyId);
        byStory[storyId] = {
          count,
          title: story?.title || 'Unknown Story',
        };
      } catch (error) {
        console.error('Error fetching story:', error);
        byStory[storyId] = {
          count,
          title: 'Unknown Story',
        };
      }
    }
    
    return NextResponse.json({
      dueToday: stats.dueToday,
      newToday: stats.newToday,
      learned: stats.learned,
      total: stats.total,
      byStory,
    });
  } catch (error) {
    console.error('Error getting flashcard stats:', error);
    return NextResponse.json(
      { error: 'Failed to get flashcard stats' },
      { status: 500 }
    );
  }
}


