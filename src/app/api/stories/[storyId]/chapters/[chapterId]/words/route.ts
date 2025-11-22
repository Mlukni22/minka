import { NextRequest, NextResponse } from 'next/server';
import { createStoryWord, wordExistsInChapter, getChapterWords } from '@/lib/db/stories';
import { onAuthChange } from '@/lib/auth';

/**
 * POST /api/stories/[storyId]/chapters/[chapterId]/words
 * Add vocabulary words to a chapter
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { storyId: string; chapterId: string } }
) {
  try {
    const { storyId, chapterId } = params;
    const body = await request.json();
    const { words } = body;

    if (!words || !Array.isArray(words)) {
      return NextResponse.json(
        { error: 'Words array is required' },
        { status: 400 }
      );
    }

    // Check authentication (optional - can be removed if not needed)
    // const user = await getCurrentUser();
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const results = {
      added: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Get existing words to check for duplicates
    const existingWords = await getChapterWords(storyId, chapterId);
    const existingPhrases = new Set(
      existingWords.map(w => w.phrase.trim().toLowerCase())
    );

    // Add words in order
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      if (!word.phrase || !word.translation) {
        results.errors.push(`Word at index ${i} is missing phrase or translation`);
        continue;
      }

      const normalizedPhrase = word.phrase.trim().toLowerCase();
      
      // Check for duplicates
      if (existingPhrases.has(normalizedPhrase)) {
        results.skipped++;
        continue;
      }

      try {
        await createStoryWord(storyId, chapterId, {
          phrase: word.phrase.trim(),
          translation: word.translation.trim(),
          exampleSentence: word.exampleSentence?.trim(),
          exampleTranslation: word.exampleTranslation?.trim(),
          isKeyWord: word.isKeyWord !== undefined ? word.isKeyWord : true,
          orderIndex: word.orderIndex !== undefined ? word.orderIndex : i,
        });
        
        existingPhrases.add(normalizedPhrase);
        results.added++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Error adding "${word.phrase}": ${errorMsg}`);
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error('Error adding words:', error);
    return NextResponse.json(
      { error: 'Failed to add words', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

