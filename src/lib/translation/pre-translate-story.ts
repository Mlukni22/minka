/**
 * Pre-translate Story System
 * Proactively ensures all words in a story have translations before display
 */

import { checkStoryTranslations, TranslationReport } from './checkStoryTranslations';
import { getTranslationAlways } from '../translation-service';

export interface PreTranslationResult {
  success: boolean;
  report: TranslationReport;
  missingWords: string[];
  needsAttention: boolean;
}

/**
 * Pre-translate all words in a story before it's displayed
 * This ensures users never encounter untranslated words
 */
export async function preTranslateStory({
  storyId,
  text,
  sectionId,
}: {
  storyId: string;
  text: string;
  sectionId?: string;
}): Promise<PreTranslationResult> {
  try {
    // Run the translation checker
    const report = await checkStoryTranslations({
      storyId,
      sectionId: sectionId || null,
      text,
      options: {
        forceRefresh: false, // Use cache if available
        useMTFallback: true, // Always use MT fallback
      },
    });

    // Identify words that still need attention (missing or fallback)
    const missingWords: string[] = [];
    const fallbackWords: string[] = [];

    for (const token of report.tokens) {
      if (token.status === 'missing') {
        missingWords.push(token.tokenText);
      } else if (token.status === 'fallback' && token.translation === token.normalized) {
        // Word is using itself as translation - needs better translation
        missingWords.push(token.tokenText);
      } else if (token.status === 'fallback') {
        fallbackWords.push(token.tokenText);
      }
    }

    // For any missing words, try to get translations proactively
    const uniqueMissing = Array.from(new Set(missingWords));
    let fixedCount = 0;

    for (const word of uniqueMissing) {
      try {
        const result = await getTranslationAlways(word);
        if (result.translation && result.translation !== word && !result.translation.startsWith('[')) {
          fixedCount++;
        }
      } catch (error) {
        console.error(`Failed to translate missing word: ${word}`, error);
      }
    }

    return {
      success: report.missingCount === 0 && fixedCount >= uniqueMissing.length,
      report,
      missingWords: uniqueMissing,
      needsAttention: report.missingCount > 0 || uniqueMissing.length > 0,
    };
  } catch (error) {
    console.error('Error pre-translating story:', error);
    return {
      success: false,
      report: {
        totalTokens: 0,
        translatedCount: 0,
        fallbackCount: 0,
        missingCount: 0,
        tokens: [],
      },
      missingWords: [],
      needsAttention: true,
    };
  }
}

/**
 * Ensure a single word has a translation (used when user clicks a word)
 * This is a guaranteed translation function - it will never return null
 */
export async function ensureWordTranslation(word: string): Promise<string> {
  try {
    const result = await getTranslationAlways(word);
    
    // If we got a valid translation, return it
    if (result.translation && result.translation !== word && !result.translation.startsWith('[')) {
      return result.translation;
    }
    
    // If translation is the word itself or placeholder, try MT one more time
    try {
      const { getLibreTranslate } = await import('../dictionary-api');
      const mtTranslation = await getLibreTranslate(word, 'de', 'en');
      if (mtTranslation && mtTranslation.trim() && mtTranslation !== word) {
        return mtTranslation.trim();
      }
    } catch (error) {
      console.error('MT fallback failed for word:', word, error);
    }
    
    // Last resort: return the word itself (better than nothing)
    return word;
  } catch (error) {
    console.error('Error ensuring word translation:', error);
    // Return word itself as absolute last resort
    return word;
  }
}

/**
 * Batch ensure translations for multiple words
 * Used when loading a story to pre-translate all words
 */
export async function ensureWordTranslations(words: string[]): Promise<Map<string, string>> {
  const translations = new Map<string, string>();
  
  // Process in parallel batches to speed up
  const batchSize = 10;
  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (word) => {
        const translation = await ensureWordTranslation(word);
        translations.set(word.toLowerCase().trim(), translation);
      })
    );
  }
  
  return translations;
}

