/**
 * Comprehensive translation service with lemmatization and external API fallback
 * Ensures every word gets a translation
 */

import { getTranslation } from './translations';
import { fetchDictionaryDefinition, getDictionaryTranslation, getYandexTranslation, getGermanEnglishTranslation, getLibreTranslate, getTranslationWithFallback } from './dictionary-api';

export interface TranslationResult {
  original: string;
  baseForm: string;
  translation: string;
  source: 'local' | 'api' | 'fallback' | 'mt';
  isVerb?: boolean;
  isNoun?: boolean;
  isAdjective?: boolean;
  examples?: string[];
}

// Cache for translations
const translationCache = new Map<string, TranslationResult>();

/**
 * German verb endings that indicate conjugation
 */
const VERB_ENDINGS = [
  't',      // 3rd person: bleibt, schließt, schnuppert
  'st',     // 2nd person: bleibst, schließt
  'e',      // 1st person: bleibe, schließe
  'en',     // infinitive/plural: bleiben, schließen
  'te',     // past: bliebte
  'ten',    // past plural: bliebten
  'test',   // past 2nd person: bliebtest
  'tet',    // past 2nd person plural: bliebtet
  'est',    // 2nd person (some verbs): schnupprest
  'et',     // 3rd person (some verbs): schnuppret
];

/**
 * German noun endings that indicate plural
 */
const NOUN_PLURAL_ENDINGS = [
  'e',      // Kind -> Kinder
  'er',     // Kind -> Kinder
  'en',     // Frau -> Frauen
  'n',      // Auto -> Autos (sometimes)
  's',      // Auto -> Autos
];

/**
 * German adjective endings that indicate declension
 */
const ADJECTIVE_ENDINGS = [
  'e',      // groß -> große
  'er',     // groß -> größer
  'es',     // groß -> großes
  'en',     // groß -> großen
  'em',     // groß -> großem
];

/**
 * Lemmatize German word - convert to base form
 */
function lemmatizeGerman(word: string): { baseForm: string; isVerb: boolean; isNoun: boolean; isAdjective: boolean } {
  const normalized = word.toLowerCase().trim();
  let baseForm = normalized;
  let isVerb = false;
  let isNoun = false;
  let isAdjective = false;

  // Try verb endings first (most common in stories)
  for (const ending of VERB_ENDINGS) {
    if (normalized.endsWith(ending) && normalized.length > ending.length) {
      const stem = normalized.slice(0, -ending.length);
      
      // For verbs ending in 't' or 'st', add 'en' to get infinitive
      if (ending === 't' || ending === 'st') {
        // Try 'en' first (most common) - e.g., kratzt -> kratzen
        const infinitive = stem + 'en';
        if (getTranslation(infinitive)) {
          return { baseForm: infinitive, isVerb: true, isNoun: false, isAdjective: false };
        }
        // Also check if the conjugated form itself is in dictionary (e.g., kratzt)
        if (getTranslation(normalized)) {
          return { baseForm: normalized, isVerb: true, isNoun: false, isAdjective: false };
        }
        // Try 'n' for some verbs (e.g., tun -> tust)
        const infinitiveN = stem + 'n';
        if (getTranslation(infinitiveN)) {
          return { baseForm: infinitiveN, isVerb: true, isNoun: false, isAdjective: false };
        }
        // For verbs with 'ß', try replacing with 'ss' (schließt -> schließen)
        if (stem.includes('ß')) {
          const stemWithSS = stem.replace(/ß/g, 'ss');
          const infinitiveSS = stemWithSS + 'en';
          if (getTranslation(infinitiveSS)) {
            return { baseForm: infinitiveSS, isVerb: true, isNoun: false, isAdjective: false };
          }
        }
        // For verbs with 'ss', try replacing with 'ß' (barfus -> barfuß)
        if (stem.includes('ss')) {
          const stemWithEszett = stem.replace(/([aeiouäöü])ss/gi, '$1ß');
          if (stemWithEszett !== stem) {
            const infinitiveEszett = stemWithEszett + 'en';
            if (getTranslation(infinitiveEszett)) {
              return { baseForm: infinitiveEszett, isVerb: true, isNoun: false, isAdjective: false };
            }
          }
        }
      }
      
      // For verbs ending in 'e', try adding 'en' to get infinitive
      if (ending === 'e' && normalized.length > 2) {
        const infinitive = stem + 'en';
        if (getTranslation(infinitive)) {
          return { baseForm: infinitive, isVerb: true, isNoun: false, isAdjective: false };
        }
      }
    }
  }

  // Try noun plural endings
  for (const ending of NOUN_PLURAL_ENDINGS) {
    if (normalized.endsWith(ending) && normalized.length > ending.length) {
      const stem = normalized.slice(0, -ending.length);
      // Check if singular form exists
      if (getTranslation(stem)) {
        return { baseForm: stem, isVerb: false, isNoun: true, isAdjective: false };
      }
      // Try adding 'e' for some nouns
      const withE = stem + 'e';
      if (getTranslation(withE)) {
        return { baseForm: withE, isVerb: false, isNoun: true, isAdjective: false };
      }
    }
  }

  // Try adjective endings
  for (const ending of ADJECTIVE_ENDINGS) {
    if (normalized.endsWith(ending) && normalized.length > ending.length) {
      const stem = normalized.slice(0, -ending.length);
      if (getTranslation(stem)) {
        return { baseForm: stem, isVerb: false, isNoun: false, isAdjective: true };
      }
    }
  }

  return { baseForm: normalized, isVerb: false, isNoun: false, isAdjective: false };
}

/**
 * Clean translation text - remove annotations like "(I)", "(you)", "(he/she/it)"
 * Also handles context-aware translations for possessive pronouns
 */
function cleanTranslation(translation: string, originalWord?: string): string {
  let cleaned = translation
    .replace(/\s*\(I\)/gi, '')
    .replace(/\s*\(you\)/gi, '')
    .replace(/\s*\(he\/she\/it\)/gi, '')
    .replace(/\s*\(he\)/gi, '')
    .replace(/\s*\(she\)/gi, '')
    .replace(/\s*\(it\)/gi, '')
    .trim();

  // Context-aware translation for possessive pronouns
  // "ihrem" and "ihre" can mean "her/their/your" but in context often means "hers"
  if (originalWord) {
    const wordLower = originalWord.toLowerCase().trim();
    // Check for possessive pronoun forms of "ihr"
    if (wordLower === 'ihrem' || wordLower === 'ihre' || wordLower === 'ihren' || wordLower === 'ihrer' || wordLower === 'ihres') {
      // If translation contains possessive forms, prioritize "hers" for clarity
      if (cleaned.includes('her/their/your') || cleaned.includes('her') || cleaned.includes('their') || cleaned.includes('your')) {
        // For standalone possessive pronouns, "hers" is clearer
        if (cleaned === 'her' || cleaned === 'their' || cleaned === 'your (formal)') {
          cleaned = 'hers';
        } else if (cleaned.includes('her/their/your')) {
          // Keep options but prioritize "hers"
          cleaned = cleaned.replace(/her\/their\/your \(formal\)/gi, 'hers/her/their/your (formal)');
          cleaned = cleaned.replace(/her\/their\/you \(formal\)/gi, 'hers/her/their/you (formal)');
        }
      }
    }
  }

  return cleaned;
}

/**
 * Normalize German word - handle ß/ss conversion
 * German "ß" can be written as "ss" in some contexts, and vice versa
 */
function normalizeGermanWord(word: string): string[] {
  const normalized = word.toLowerCase().trim().replace(/[.,!?;:]/g, '');
  const variants: string[] = [normalized];
  
  // If word contains ß, also try with ss
  if (normalized.includes('ß')) {
    variants.push(normalized.replace(/ß/g, 'ss'));
  }
  
  // If word contains ss, also try with ß (for words that might be stored with ß)
  // Common pattern: ss after vowels can sometimes be ß
  if (normalized.includes('ss')) {
    const withEszett = normalized.replace(/([aeiouäöü])ss/gi, '$1ß');
    if (withEszett !== normalized && !variants.includes(withEszett)) {
      variants.push(withEszett);
    }
  }
  
  return variants;
}

/**
 * Get translation with comprehensive fallback system
 * Always returns a translation, never null
 */
export async function getTranslationAlways(word: string): Promise<TranslationResult> {
  const normalized = word.toLowerCase().trim().replace(/[.,!?;:]/g, '');
  
  // Get all variants (handling ß/ss)
  const variants = normalizeGermanWord(word);
  
  // Check cache first (try all variants)
  for (const variant of variants) {
    if (translationCache.has(variant)) {
      const cached = translationCache.get(variant)!;
      cached.translation = cleanTranslation(cached.translation, word);
      return cached;
    }
  }

  // Step 1: Try exact match in local dictionary (try all variants)
  let translation: string | null = null;
  let matchedVariant = normalized;
  
  for (const variant of variants) {
    translation = getTranslation(variant);
    if (translation) {
      matchedVariant = variant;
      break;
    }
  }
  
  if (translation) {
    translation = cleanTranslation(translation, word);
    const result: TranslationResult = {
      original: word,
      baseForm: matchedVariant,
      translation,
      source: 'local',
    };
    // Cache all variants for faster future lookups
    variants.forEach(v => translationCache.set(v, result));
    return result;
  }

  // Step 2: Lemmatize to find base form
  const { baseForm, isVerb, isNoun, isAdjective } = lemmatizeGerman(normalized);
  
  // Step 3: Try base form in local dictionary
  if (baseForm !== normalized) {
    translation = getTranslation(baseForm);
    if (translation) {
      translation = cleanTranslation(translation, word);
      const result: TranslationResult = {
        original: word,
        baseForm,
        translation,
        source: 'local',
        isVerb,
        isNoun,
        isAdjective,
      };
      translationCache.set(normalized, result);
      return result;
    }
  }

  // Step 4: Try external Dictionary APIs (for English words or as fallback)
  try {
    let apiTranslation: string | null = null;
    let examples: string[] = [];
    
    // Try APIs in parallel - prioritize by speed/size (smaller APIs first for faster response)
    // Order: 1. LibreTranslate (fast, machine translation), 2. Yandex (medium), 3. DictionaryAPI.dev (small), 4. German-English (large, may be slow/blocked)
    const apiPromises = [
      // 1. LibreTranslate (fastest - machine translation, usually responds quickly)
      getLibreTranslate(normalized, 'de', 'en'),
      // 2. Yandex API (medium speed)
      getYandexTranslation(normalized, 'de', 'en'),
      // 3. DictionaryAPI.dev (small API, usually fast)
      getDictionaryTranslation(normalized),
      // 4. German-English Dictionary API (largest, may be slow or blocked - try last)
      getGermanEnglishTranslation(normalized, 1),
    ];

    // Also try base form if different (same priority order)
    if (baseForm !== normalized) {
      apiPromises.push(
        getLibreTranslate(baseForm, 'de', 'en'),
        getYandexTranslation(baseForm, 'de', 'en'),
        getDictionaryTranslation(baseForm),
        getGermanEnglishTranslation(baseForm, 1),
      );
    }

    // Wait for results with timeout - use allSettled to get all results even if some fail
    // Reduced timeout to 2 seconds for faster response
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 2000) // 2 second overall timeout for faster response
    );

    try {
      const results = await Promise.race([
        Promise.allSettled(apiPromises),
        timeoutPromise,
      ]);

      // Find first successful result
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          apiTranslation = result.value;
          break;
        }
      }
    } catch (error) {
      // Timeout occurred - try to get any available results
      const settled = await Promise.allSettled(apiPromises);
      for (const result of settled) {
        if (result.status === 'fulfilled' && result.value) {
          apiTranslation = result.value;
          break;
        }
      }
    }

    // Try to get examples from Dictionary API
    if (apiTranslation) {
      try {
        const entries = await fetchDictionaryDefinition(normalized, 'en') || 
                       await fetchDictionaryDefinition(baseForm, 'en');
        if (entries && entries.length > 0) {
          const firstEntry = entries[0];
          if (firstEntry.meanings && firstEntry.meanings.length > 0) {
            for (const meaning of firstEntry.meanings) {
              if (meaning.definitions) {
                for (const def of meaning.definitions) {
                  if (def.example) {
                    examples.push(def.example);
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        // Examples are optional, continue without them
      }
    }

    if (apiTranslation) {
      apiTranslation = cleanTranslation(apiTranslation);
      const result: TranslationResult = {
        original: word,
        baseForm: baseForm !== normalized ? baseForm : normalized,
        translation: apiTranslation,
        source: 'api',
        isVerb,
        isNoun,
        isAdjective,
        examples: examples.length > 0 ? examples : undefined,
      };
      translationCache.set(normalized, result);
      return result;
    }
  } catch (error) {
    console.error('Error fetching from Dictionary API:', error);
  }

  // Step 5: Fallback heuristics - try stripping endings and retrying
  const fallbackStems: string[] = [];
  
  // For verbs: try removing endings and adding 'en'
  if (normalized.length > 3) {
    for (const ending of ['t', 'st', 'te', 'ten']) {
      if (normalized.endsWith(ending)) {
        const stem = normalized.slice(0, -ending.length);
        fallbackStems.push(stem + 'en');
        fallbackStems.push(stem + 'n');
      }
    }
  }

  // For nouns: try removing plural endings
  for (const ending of ['e', 'er', 'en', 'n', 's']) {
    if (normalized.endsWith(ending) && normalized.length > ending.length + 2) {
      const stem = normalized.slice(0, -ending.length);
      fallbackStems.push(stem);
      fallbackStems.push(stem + 'e');
    }
  }

  // Try each fallback stem
  for (const stem of fallbackStems) {
    translation = getTranslation(stem);
    if (translation) {
      translation = cleanTranslation(translation, word);
      const result: TranslationResult = {
        original: word,
        baseForm: stem,
        translation,
        source: 'fallback',
        isVerb: stem.endsWith('en') || stem.endsWith('n'),
        isNoun: !stem.endsWith('en') && !stem.endsWith('n'),
      };
      translationCache.set(normalized, result);
      return result;
    }
  }

  // Step 6: Enhanced fallback - try more aggressive stem extraction
  // Try removing multiple endings in sequence
  if (normalized.length > 4) {
    const aggressiveStems: string[] = [];
    
    // Try removing 1-3 characters and adding common endings
    for (let i = 1; i <= 3 && i < normalized.length; i++) {
      const stem = normalized.slice(0, -i);
      aggressiveStems.push(stem + 'en');
      aggressiveStems.push(stem + 'n');
      aggressiveStems.push(stem);
    }
    
    // Try each aggressive stem
    for (const stem of aggressiveStems) {
      if (stem.length >= 3) {
        translation = getTranslation(stem);
        if (translation) {
          translation = cleanTranslation(translation, word);
          const result: TranslationResult = {
            original: word,
            baseForm: stem,
            translation,
            source: 'fallback',
            isVerb: stem.endsWith('en') || stem.endsWith('n'),
            isNoun: !stem.endsWith('en') && !stem.endsWith('n'),
          };
          translationCache.set(normalized, result);
          return result;
        }
      }
    }
  }

  // Step 7: Last resort - try Dictionary API one more time with base form variations
  try {
    // Try with 'en' added if it doesn't already end with it
    if (!baseForm.endsWith('en') && !baseForm.endsWith('n')) {
      const withEn = baseForm + 'en';
      const apiTranslation = await getDictionaryTranslation(withEn);
      if (apiTranslation) {
        const cleanApi = cleanTranslation(apiTranslation, word);
        const result: TranslationResult = {
          original: word,
          baseForm: withEn,
          translation: cleanApi,
          source: 'api',
          isVerb: true,
        };
        translationCache.set(normalized, result);
        return result;
      }
    }
  } catch (error) {
    // Ignore errors in last resort
  }

  // Step 8: Final MT fallback - always try machine translation as last resort
  try {
    const mtTranslation = await getLibreTranslate(normalized, 'de', 'en');
    if (mtTranslation && mtTranslation.trim() && !mtTranslation.startsWith('[')) {
      const result: TranslationResult = {
        original: word,
        baseForm: baseForm !== normalized ? baseForm : normalized,
        translation: mtTranslation.trim(),
        source: 'mt',
        isVerb,
        isNoun,
        isAdjective,
      };
      translationCache.set(normalized, result);
      return result;
    }
    
    // Try base form with MT
    if (baseForm !== normalized) {
      const mtBaseTranslation = await getLibreTranslate(baseForm, 'de', 'en');
      if (mtBaseTranslation && mtBaseTranslation.trim() && !mtBaseTranslation.startsWith('[')) {
        const result: TranslationResult = {
          original: word,
          baseForm,
          translation: mtBaseTranslation.trim(),
          source: 'mt',
          isVerb,
          isNoun,
          isAdjective,
        };
        translationCache.set(normalized, result);
        return result;
      }
    }
  } catch (error) {
    console.error('MT fallback error:', error);
  }

  // Step 9: Absolute last resort - try one more MT call with timeout protection
  // This ensures we always have a translation, even if it's from MT
  try {
    // Use a shorter timeout for this final attempt
    const mtPromise = getLibreTranslate(normalized, 'de', 'en');
    const timeoutPromise = new Promise<string>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 3000)
    );
    
    const mtTranslation = await Promise.race([mtPromise, timeoutPromise]);
    if (mtTranslation && mtTranslation.trim() && mtTranslation !== normalized && !mtTranslation.startsWith('[')) {
      const result: TranslationResult = {
        original: word,
        baseForm: baseForm !== normalized ? baseForm : normalized,
        translation: mtTranslation.trim(),
        source: 'mt',
        isVerb,
        isNoun,
        isAdjective,
      };
      translationCache.set(normalized, result);
      return result;
    }
  } catch (error) {
    // Ignore errors - we'll use fallback
  }

  // Step 10: Absolute last resort - return word itself as translation (better than nothing)
  // This ensures we NEVER return null or undefined
  const result: TranslationResult = {
    original: word,
    baseForm: baseForm !== normalized ? baseForm : normalized,
    translation: normalized, // Return normalized word as translation (better than nothing)
    source: 'fallback',
    isVerb,
    isNoun,
    isAdjective,
  };
  translationCache.set(normalized, result);
  return result;
}

/**
 * Get simple translation string (backward compatibility)
 */
export async function getTranslationString(word: string): Promise<string> {
  const result = await getTranslationAlways(word);
  return result.translation;
}

/**
 * Clear translation cache
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: translationCache.size,
    entries: Array.from(translationCache.keys()),
  };
}

/**
 * Batch lookup translations for multiple words
 * Useful for pre-loading translations for a story
 */
export async function batchLookupTranslations(words: string[]): Promise<Map<string, TranslationResult>> {
  const results = new Map<string, TranslationResult>();
  
  // Process in parallel (but limit concurrency to avoid overwhelming the API)
  const batchSize = 10;
  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize);
    const promises = batch.map(word => getTranslationAlways(word));
    const batchResults = await Promise.all(promises);
    
    batchResults.forEach((result, index) => {
      results.set(batch[index].toLowerCase().trim(), result);
    });
  }
  
  return results;
}

/**
 * Pre-warm cache with common German words
 */
export async function prewarmCache(commonWords: string[]): Promise<void> {
  await batchLookupTranslations(commonWords);
}

