/**
 * Story Translation Checker
 * Checks and ensures all words in a story have translations
 */

import { tokenizeWithIndices, tokenizeWithSeparableVerbs, normalizeToken } from './tokenizer';
import { mergeSeparableVerbs, isMergedToken, MergedToken } from './separable-verbs';
import { getTranslationAlways } from '../translation-service';
import { getLibreTranslate } from '../dictionary-api';
import { db } from '../firebase';
import { collection, doc, getDoc, setDoc, query, where, getDocs, writeBatch } from 'firebase/firestore';

export interface TranslationResult {
  translation: string | null;
  source: string;
  baseForm?: string;
  isVerb?: boolean;
  isNoun?: boolean;
  isAdjective?: boolean;
}

export interface StoryToken {
  id?: string;
  storyId: string;
  sectionId?: string;
  tokenText: string;
  normalized: string;
  startIndex: number;
  endIndex: number;
  wordId?: string;
  translation: string | null;
  translateSource: string | null;
  status: 'translated' | 'fallback' | 'missing';
}

export interface TranslationReport {
  totalTokens: number;
  translatedCount: number;
  fallbackCount: number;
  missingCount: number;
  tokens: StoryToken[];
}

/**
 * Get or create dictionary cache entry
 */
async function getDictionaryCache(normalized: string): Promise<TranslationResult | null> {
  try {
    if (!db) {
      console.error('Firestore not initialized');
      return null;
    }
    const cacheRef = doc(db, 'dictionaryCache', normalized);
    const cacheDoc = await getDoc(cacheRef);
    
    if (cacheDoc.exists()) {
      const data = cacheDoc.data();
      return {
        translation: data.translation || null,
        source: data.source || 'unknown',
        baseForm: data.baseForm,
        isVerb: data.isVerb,
        isNoun: data.isNoun,
        isAdjective: data.isAdjective,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting dictionary cache:', error);
    return null;
  }
}

/**
 * Save translation to dictionary cache
 */
async function saveDictionaryCache(
  normalized: string,
  original: string,
  result: TranslationResult
): Promise<void> {
  try {
    if (!db) {
      console.error('Firestore not initialized');
      return;
    }
    const cacheRef = doc(db, 'dictionaryCache', normalized);
    await setDoc(cacheRef, {
      normalized,
      original,
      baseForm: result.baseForm || null,
      translation: result.translation || null,
      source: result.source || 'unknown',
      isVerb: result.isVerb || false,
      isNoun: result.isNoun || false,
      isAdjective: result.isAdjective || false,
      lastFetched: new Date(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving dictionary cache:', error);
  }
}

/**
 * Bulk get dictionary cache entries
 * Firestore doesn't support document ID queries with 'in', so we do individual lookups in parallel
 */
async function bulkGetDictionaryCache(normalizedTokens: string[]): Promise<Map<string, TranslationResult>> {
  const cacheMap = new Map<string, TranslationResult>();
  
  // Process in parallel batches to speed up
  const batchSize = 20;
  for (let i = 0; i < normalizedTokens.length; i += batchSize) {
    const batch = normalizedTokens.slice(i, i + batchSize);
    
    // Get all cache entries in parallel for this batch
    const batchPromises = batch.map(token => getDictionaryCache(token));
    const batchResults = await Promise.all(batchPromises);
    
    batch.forEach((token, index) => {
      const result = batchResults[index];
      if (result) {
        cacheMap.set(token, result);
      }
    });
  }
  
  return cacheMap;
}

/**
 * Check and ensure all words in a story have translations
 */
export async function checkStoryTranslations({
  storyId,
  sectionId = null,
  text,
  options = {},
}: {
  storyId: string;
  sectionId?: string | null;
  text: string;
  options?: {
    forceRefresh?: boolean;
    useMTFallback?: boolean;
    apiPriority?: string[];
  };
}): Promise<TranslationReport> {
  const { forceRefresh = false, useMTFallback = true } = options;

  // 1. Tokenize text
  const rawTokens = tokenizeWithIndices(text);
  
  // 2. Merge separable verbs (e.g., "sieht aus" → "aussehen")
  const tokensWithSeparableVerbs = mergeSeparableVerbs(rawTokens);
  
  // 3. Filter valid tokens
  const filtered = tokensWithSeparableVerbs.filter(t => {
    if (isMergedToken(t)) {
      return t.baseForm && t.baseForm.length >= 1;
    }
    return t.normalized.length >= 1;
  });

  // 4. Build set of unique normalized tokens (use baseForm for merged verbs)
  const uniqueNorms = Array.from(new Set(
    filtered.map(t => {
      if (isMergedToken(t)) {
        return t.baseForm;
      }
      return t.normalized;
    })
  )).filter(n => n && n.length > 0);

  // 5. Bulk load cache
  const cacheMap = forceRefresh 
    ? new Map<string, TranslationResult>()
    : await bulkGetDictionaryCache(uniqueNorms);

  const resultsMap = new Map<string, TranslationResult>();

  // 6. For missing tokens, call translation pipeline
  const missingTokens = uniqueNorms.filter(norm => !cacheMap.has(norm));
  
  // Process missing tokens in parallel batches (limit concurrency)
  const batchSize = 10;
  for (let i = 0; i < missingTokens.length; i += batchSize) {
    const batch = missingTokens.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (norm) => {
        if (!norm) return;

        let resolved: TranslationResult | null = null;

        try {
          // Use the comprehensive translation service
          const translationResult = await getTranslationAlways(norm);
          resolved = {
            translation: translationResult.translation,
            source: translationResult.source,
            baseForm: translationResult.baseForm,
            isVerb: translationResult.isVerb,
            isNoun: translationResult.isNoun,
            isAdjective: translationResult.isAdjective,
          };
        } catch (err) {
          console.error('Translation pipeline error for', norm, err);
        }

        // MT fallback if still missing (always try, even if translation exists but is placeholder)
        if ((!resolved || !resolved.translation || resolved.translation.startsWith('[') || resolved.translation === norm) && useMTFallback) {
          try {
            const mtTranslation = await getLibreTranslate(norm, 'de', 'en');
            if (mtTranslation && mtTranslation.trim() && mtTranslation !== norm && !mtTranslation.startsWith('[')) {
              resolved = {
                translation: mtTranslation.trim(),
                source: 'mt',
                baseForm: norm,
              };
            }
          } catch (e) {
            console.error('MT fallback failed for', norm, e);
          }
        }

        // If still no translation, use word itself as last resort (better than null)
        if (!resolved || !resolved.translation || resolved.translation.startsWith('[')) {
          resolved = {
            translation: norm, // Use normalized word as translation (better than nothing)
            source: 'fallback',
            baseForm: norm,
          };
        }

        // Save to cache
        if (resolved.translation && resolved.translation !== `[${norm}]`) {
          await saveDictionaryCache(norm, norm, resolved);
        }

        resultsMap.set(norm, resolved);
      })
    );
  }

  // Add cached results to results map
  cacheMap.forEach((value, key) => {
    resultsMap.set(key, value);
  });

  // 7. Create StoryToken records
  const tokenRows: StoryToken[] = filtered.map((t) => {
    // For merged tokens, use baseForm; otherwise use normalized
    const norm = isMergedToken(t) ? t.baseForm : t.normalized;
    const res = resultsMap.get(norm) || {
      translation: null,
      source: 'missing',
      baseForm: norm,
    };

    // Determine status - if we have a translation (even if it's the word itself), it's not missing
    let status: 'translated' | 'fallback' | 'missing' = 'missing';
    if (res.translation) {
      // If translation is the same as the word, it's a fallback
      if (res.translation === norm || res.translation.startsWith('[')) {
        status = 'fallback';
      } else if (res.source === 'mt' || res.source === 'fallback') {
        status = 'fallback';
      } else {
        status = 'translated';
      }
    }

    return {
      storyId,
      sectionId: sectionId || undefined,
      tokenText: t.text, // Keep original text for display (e.g., "sieht aus")
      normalized: norm, // Use base form for lookup (e.g., "aussehen")
      startIndex: t.startIndex,
      endIndex: t.endIndex,
      translation: res.translation,
      translateSource: res.source,
      status,
    };
  });

  // 8. Save tokens to Firestore (optional - can be done async)
  try {
    if (db) {
      const batch = writeBatch(db);
      const tokensRef = collection(db, 'stories', storyId, 'tokens');
      
      // Delete old tokens for this section if sectionId provided
      if (sectionId) {
        const oldTokensQuery = query(tokensRef, where('sectionId', '==', sectionId));
        const oldSnapshot = await getDocs(oldTokensQuery);
        oldSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
      }

      // Add new tokens (limit batch size to 500 - Firestore limit)
      const tokensToSave = tokenRows.slice(0, 500);
      tokensToSave.forEach((token, index) => {
        const tokenRef = doc(tokensRef, `${token.startIndex}_${token.endIndex}_${index}`);
        batch.set(tokenRef, {
          ...token,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      await batch.commit();
    }
  } catch (error) {
    console.error('Error saving story tokens:', error);
    // Continue even if save fails
  }

  // 9. Build report
  const total = tokenRows.length;
  const translated = tokenRows.filter((r) => r.status === 'translated').length;
  const fallback = tokenRows.filter((r) => r.status === 'fallback').length;
  const missing = tokenRows.filter((r) => r.status === 'missing').length;

  return {
    totalTokens: total,
    translatedCount: translated,
    fallbackCount: fallback,
    missingCount: missing,
    tokens: tokenRows.slice(0, 10000), // Limit if giant
  };
}

