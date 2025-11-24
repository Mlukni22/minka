import { NextRequest, NextResponse } from 'next/server';
import { getTranslationAlways } from '@/lib/translation-service';

/**
 * GET /api/dictionary/lookup?word={word}
 * Guaranteed translation lookup for German words
 * 
 * Returns a translation for any German word, using:
 * - Local dictionary cache
 * - Lemmatization (conjugations → infinitive)
 * - External Dictionary API
 * - Fallback heuristics
 * 
 * @example
 * GET /api/dictionary/lookup?word=schnuppert
 * Returns: { original: "schnuppert", baseForm: "schnuppern", translation: "to sniff", source: "local", isVerb: true }
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const word = searchParams.get('word');

  if (!word || word.trim().length === 0) {
    return NextResponse.json(
      { error: 'Word parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Get guaranteed translation
    const result = await getTranslationAlways(word.trim());

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in dictionary lookup:', error);
    const wordValue = word || '';
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to lookup translation',
        data: {
          original: wordValue,
          baseForm: wordValue,
          translation: `[${wordValue}]`,
          source: 'fallback' as const,
        },
      },
      { status: 500 }
    );
  }
}

