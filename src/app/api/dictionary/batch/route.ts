import { NextRequest, NextResponse } from 'next/server';
import { batchLookupTranslations } from '@/lib/translation-service';

/**
 * POST /api/dictionary/batch
 * Batch lookup translations for multiple words
 * 
 * Body: { words: string[] }
 * Returns: { success: true, data: Map<string, TranslationResult> }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { words } = body;

    if (!words || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { error: 'Words array is required' },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    const maxBatchSize = 50;
    const wordsToProcess = words.slice(0, maxBatchSize);

    // Get translations for all words
    const results = await batchLookupTranslations(wordsToProcess);

    // Convert Map to object for JSON serialization
    const resultsObj: Record<string, any> = {};
    results.forEach((value, key) => {
      resultsObj[key] = value;
    });

    return NextResponse.json({
      success: true,
      data: resultsObj,
      processed: wordsToProcess.length,
      total: words.length,
    });
  } catch (error) {
    console.error('Error in batch dictionary lookup:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to lookup translations',
        data: {},
      },
      { status: 500 }
    );
  }
}

