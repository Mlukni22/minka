import { NextRequest, NextResponse } from 'next/server';
import { getCachedDictionaryEntry, saveDictionaryEntry, isCacheValid } from '@/lib/db/dictionary';
import { scrapeVerbformen } from '@/lib/dictionary/scraper';
import { DictionaryResult } from '@/types/dictionary';

/**
 * GET /api/dictionary?word=WORD
 * Look up a German word in the dictionary
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const word = searchParams.get('word');
    
    if (!word || word.trim().length === 0) {
      return NextResponse.json(
        { error: 'Word parameter is required' },
        { status: 400 }
      );
    }
    
    const normalizedWord = word.trim().toLowerCase();
    
    // Check cache first
    const cachedEntry = await getCachedDictionaryEntry(normalizedWord);
    
    if (cachedEntry && isCacheValid(cachedEntry)) {
      const result: DictionaryResult = {
        word: cachedEntry.word,
        translation: cachedEntry.translation,
        isVerb: cachedEntry.isVerb,
        verbForms: cachedEntry.verbForms,
        examples: cachedEntry.examples,
        cached: true,
      };
      
      return NextResponse.json(result);
    }
    
    // If not cached or cache expired, scrape verbformen.com
    const scrapedResult = await scrapeVerbformen(normalizedWord);
    
    // Save to cache if we got a valid result
    if (scrapedResult.translation && scrapedResult.translation !== 'Not found' && !scrapedResult.error) {
      try {
        await saveDictionaryEntry(
          scrapedResult.word,
          scrapedResult.translation,
          scrapedResult.isVerb,
          scrapedResult.verbForms,
          scrapedResult.examples
        );
        scrapedResult.cached = false;
      } catch (error) {
        console.error('Error saving to cache:', error);
        // Continue even if cache save fails
      }
    }
    
    return NextResponse.json(scrapedResult);
  } catch (error) {
    console.error('Error in dictionary API:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch dictionary entry',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

