import { NextRequest, NextResponse } from 'next/server';
import { preTranslateStory, ensureWordTranslation } from '@/lib/translation/pre-translate-story';
import { checkStoryTranslations } from '@/lib/translation/checkStoryTranslations';

/**
 * POST /api/stories/[id]/ensure-translations
 * Ensures all words in a story have translations
 * This is a proactive endpoint that can be called to fix missing translations
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id;
    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { text, sectionId, forceRefresh = false } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Pre-translate the story
    const preTranslationResult = await preTranslateStory({
      storyId,
      text,
      sectionId,
    });

    // If there are still missing words, try to fix them
    if (preTranslationResult.missingWords.length > 0) {
      const fixedWords: string[] = [];
      const failedWords: string[] = [];

      for (const word of preTranslationResult.missingWords) {
        try {
          const translation = await ensureWordTranslation(word);
          if (translation && translation !== word && !translation.startsWith('[')) {
            fixedWords.push(word);
          } else {
            failedWords.push(word);
          }
        } catch (error) {
          console.error(`Failed to ensure translation for word: ${word}`, error);
          failedWords.push(word);
        }
      }

      return NextResponse.json({
        success: failedWords.length === 0,
        report: preTranslationResult.report,
        fixedWords,
        failedWords,
        needsAttention: failedWords.length > 0,
        message: failedWords.length === 0
          ? 'All words now have translations'
          : `${failedWords.length} word(s) still need attention`,
      });
    }

    return NextResponse.json({
      success: true,
      report: preTranslationResult.report,
      fixedWords: [],
      failedWords: [],
      needsAttention: false,
      message: 'All words already have translations',
    });
  } catch (error) {
    console.error('Error ensuring story translations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to ensure story translations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stories/[id]/ensure-translations
 * Check translation status for a story
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id;
    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      );
    }

    // Get translation status from check-translations endpoint
    const { collection, getDocs } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase');
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const tokensRef = collection(db, 'stories', storyId, 'tokens');
    const snapshot = await getDocs(tokensRef);

    const tokens = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const total = tokens.length;
    const translated = tokens.filter((t: any) => t.status === 'translated').length;
    const fallback = tokens.filter((t: any) => t.status === 'fallback').length;
    const missing = tokens.filter((t: any) => t.status === 'missing').length;

    return NextResponse.json({
      success: true,
      status: {
        totalTokens: total,
        translatedCount: translated,
        fallbackCount: fallback,
        missingCount: missing,
        coverage: total > 0 ? ((translated + fallback) / total * 100).toFixed(2) : '0',
        needsAttention: missing > 0,
      },
    });
  } catch (error) {
    console.error('Error getting translation status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get translation status',
      },
      { status: 500 }
    );
  }
}

