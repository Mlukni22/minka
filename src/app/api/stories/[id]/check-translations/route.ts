import { NextRequest, NextResponse } from 'next/server';
import { checkStoryTranslations } from '@/lib/translation/checkStoryTranslations';
import { getAuth } from 'firebase/auth';
import { auth } from '@/lib/firebase';

/**
 * POST /api/stories/[id]/check-translations
 * Check and ensure all words in a story have translations
 * 
 * Body: { sectionId?, text?, forceRefresh?, useMTFallback?: true }
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
    const { sectionId, text, forceRefresh, useMTFallback = true } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Run translation check
    const report = await checkStoryTranslations({
      storyId,
      sectionId: sectionId || null,
      text,
      options: {
        forceRefresh: forceRefresh || false,
        useMTFallback: useMTFallback !== false,
      },
    });

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('Error checking story translations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check story translations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stories/[id]/check-translations
 * Get translation status for a story
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

    // Get tokens from Firestore
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase');
    
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
      report: {
        totalTokens: total,
        translatedCount: translated,
        fallbackCount: fallback,
        missingCount: missing,
        tokens: tokens.slice(0, 1000), // Limit response size
      },
    });
  } catch (error) {
    console.error('Error getting story translation status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get story translation status',
      },
      { status: 500 }
    );
  }
}

