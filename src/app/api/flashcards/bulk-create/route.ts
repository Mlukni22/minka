import { NextRequest, NextResponse } from 'next/server';
import { createFlashcardWithContext, flashcardExistsForStoryWord } from '@/lib/db/flashcards';
import { getChapterWords } from '@/lib/db/stories';
import { getChapterBlocks } from '@/lib/db/stories';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, storyId, chapterId } = body;
    
    if (!userId || !storyId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, storyId' },
        { status: 400 }
      );
    }
    
    // Get all words from the story (or specific chapter)
    let words;
    let blocks;
    
    if (chapterId) {
      words = await getChapterWords(storyId, chapterId);
      blocks = await getChapterBlocks(storyId, chapterId);
    } else {
      // Get words from all chapters (would need to implement getAllStoryWords)
      return NextResponse.json(
        { error: 'Chapter ID required for bulk create' },
        { status: 400 }
      );
    }
    
    // Get text blocks for context
    const textBlocks = blocks.filter(b => b.type === 'TEXT' && b.textContent);
    const allText = textBlocks.map(b => b.textContent).join(' ');
    
    const created: string[] = [];
    const skipped: string[] = [];
    
    // Create flashcards for each word
    for (const word of words) {
      // Check if flashcard already exists
      if (word.id && await flashcardExistsForStoryWord(userId, word.id)) {
        skipped.push(word.id);
        continue;
      }
      
      // Find context sentence (find the sentence containing this word)
      let contextSentence = word.exampleSentence || '';
      if (!contextSentence && allText) {
        // Try to find the word in the text
        const wordRegex = new RegExp(`[^.!?]*\\b${word.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b[^.!?]*[.!?]`, 'i');
        const match = allText.match(wordRegex);
        if (match) {
          contextSentence = match[0].trim();
        }
      }
      
      try {
        const flashcardId = await createFlashcardWithContext(userId, {
          languageCode: 'de',
          frontText: word.phrase,
          backText: word.translation,
          contextSentence: contextSentence || word.phrase,
          contextTranslation: word.exampleTranslation,
          storyId,
          chapterId,
          storyWordId: word.id,
        });
        
        created.push(flashcardId);
      } catch (error) {
        console.error(`Error creating flashcard for word ${word.id}:`, error);
        skipped.push(word.id);
      }
    }
    
    return NextResponse.json({
      success: true,
      created: created.length,
      skipped: skipped.length,
      flashcardIds: created,
    });
  } catch (error) {
    console.error('Error bulk creating flashcards:', error);
    return NextResponse.json(
      { error: 'Failed to bulk create flashcards' },
      { status: 500 }
    );
  }
}


