/**
 * Dictionary API integration using dictionaryapi.dev
 * API Documentation: https://github.com/meetDeveloper/freeDictionaryAPI
 * API Endpoint: https://api.dictionaryapi.dev/api/v2/entries/<language>/<word>
 * 
 * Also includes:
 * - Yandex-based Dictionary API
 *   Repository: https://github.com/Juandavid716/Dictionary-API
 *   API Endpoint: https://dictionary-translator-api.herokuapp.com/
 * 
 * - German-English Dictionary API
 *   Repository: https://github.com/enamoria/German-English-Dictionary-API
 *   API Endpoint: https://german-english-dictionary-api.uc.r.appspot.com/
 * 
 * - LibreTranslate (Free and Open Source Machine Translation)
 *   Repository: https://github.com/LibreTranslate/LibreTranslate
 *   Public Instance: https://libretranslate.com/
 */

export interface DictionaryDefinition {
  definition: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics: Array<{
    text?: string;
    audio?: string;
  }>;
  origin?: string;
  meanings: DictionaryMeaning[];
}

/**
 * Fetch word definition from Dictionary API
 * @param word - Word to look up
 * @param language - Language code (default: 'en' for English)
 * @returns Dictionary entry or null if not found
 */
export async function fetchDictionaryDefinition(
  word: string,
  language: string = 'en'
): Promise<DictionaryEntry[] | null> {
  try {
    const normalizedWord = word.trim().toLowerCase();
    if (!normalizedWord) return null;

    const url = `https://api.dictionaryapi.dev/api/v2/entries/${language}/${encodeURIComponent(normalizedWord)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // 404 means word not found, which is fine
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Dictionary API error: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error('Error fetching dictionary definition:', error);
    return null;
  }
}

/**
 * Get the first English translation/definition from Dictionary API
 * Useful for getting a quick translation when local dictionary doesn't have it
 * @param word - Word to look up
 * @returns First definition or null
 */
export async function getDictionaryTranslation(word: string): Promise<string | null> {
  try {
    const entries = await fetchDictionaryDefinition(word, 'en');
    if (!entries || entries.length === 0) return null;

    // Get the first definition from the first meaning
    const firstEntry = entries[0];
    if (firstEntry.meanings && firstEntry.meanings.length > 0) {
      const firstMeaning = firstEntry.meanings[0];
      if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
        return firstMeaning.definitions[0].definition;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting dictionary translation:', error);
    return null;
  }
}

/**
 * Get all definitions for a word
 * @param word - Word to look up
 * @returns Array of definitions grouped by part of speech
 */
export async function getDictionaryDefinitions(word: string): Promise<DictionaryMeaning[] | null> {
  try {
    const entries = await fetchDictionaryDefinition(word, 'en');
    if (!entries || entries.length === 0) return null;

    // Combine meanings from all entries
    const allMeanings: DictionaryMeaning[] = [];
    entries.forEach(entry => {
      if (entry.meanings) {
        allMeanings.push(...entry.meanings);
      }
    });

    return allMeanings.length > 0 ? allMeanings : null;
  } catch (error) {
    console.error('Error getting dictionary definitions:', error);
    return null;
  }
}

/**
 * Get phonetic pronunciation for a word
 * @param word - Word to look up
 * @returns Phonetic text or null
 */
export async function getDictionaryPhonetic(word: string): Promise<string | null> {
  try {
    const entries = await fetchDictionaryDefinition(word, 'en');
    if (!entries || entries.length === 0) return null;

    const firstEntry = entries[0];
    return firstEntry.phonetic || firstEntry.phonetics?.[0]?.text || null;
  } catch (error) {
    console.error('Error getting dictionary phonetic:', error);
    return null;
  }
}

/**
 * Yandex-based Dictionary API for German-English translations
 * Repository: https://github.com/Juandavid716/Dictionary-API
 * API Endpoint: https://dictionary-translator-api.herokuapp.com/
 */

export interface YandexTranslationResult {
  translation?: string;
  original?: string;
  source?: string;
  target?: string;
}

/**
 * Get translation using Yandex Dictionary API
 * @param word - Word to translate
 * @param fromLang - Source language (default: 'de' for German)
 * @param toLang - Target language (default: 'en' for English)
 * @returns Translation string or null
 */
export async function getYandexTranslation(
  word: string,
  fromLang: string = 'de',
  toLang: string = 'en'
): Promise<string | null> {
  try {
    const normalizedWord = word.trim();
    if (!normalizedWord) return null;

    // Try the API endpoint - common patterns for translation APIs
    const baseUrl = 'https://dictionary-translator-api.herokuapp.com';
    
    // Try different possible endpoint patterns
    const endpoints = [
      `/translate?word=${encodeURIComponent(normalizedWord)}&from=${fromLang}&to=${toLang}`,
      `/api/translate?word=${encodeURIComponent(normalizedWord)}&from=${fromLang}&to=${toLang}`,
      `/translate/${fromLang}/${toLang}/${encodeURIComponent(normalizedWord)}`,
      `/api/translate/${fromLang}/${toLang}/${encodeURIComponent(normalizedWord)}`,
      `/?word=${encodeURIComponent(normalizedWord)}&from=${fromLang}&to=${toLang}`,
    ];

    for (const endpoint of endpoints) {
      try {
        const url = `${baseUrl}${endpoint}`;
        
        // Add timeout to prevent long waits
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          
          // Handle different possible response formats
          if (typeof data === 'string') {
            return data;
          }
          if (data.translation) {
            return data.translation;
          }
          if (data.text) {
            return data.text;
          }
          if (data.result) {
            return data.result;
          }
          if (Array.isArray(data) && data.length > 0) {
            return typeof data[0] === 'string' ? data[0] : data[0].translation || data[0].text;
          }
        }
      } catch (err) {
        // Continue to next endpoint (including timeout errors)
        continue;
      }
    }

    return null;
  } catch (error) {
    // Don't log timeout errors to avoid spam
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('Error fetching Yandex translation:', error);
    }
    return null;
  }
}

/**
 * German-English Dictionary API
 * Repository: https://github.com/enamoria/German-English-Dictionary-API
 * API Documentation: https://german-english-dictionary-api.uc.r.appspot.com/
 */

export interface GermanEnglishDictionaryResult {
  search_term: string;
  count: number;
  limit: number;
  page: number;
  has_more: boolean;
  results: Array<{
    german: {
      term: string;
      examples: string[];
    };
    english: {
      term: string;
      examples: string[];
    };
  }>;
}

// Cache to track if German-English Dictionary API is blocked
let germanEnglishApiBlocked = false;
let germanEnglishApiBlockedUntil: number | null = null;
let libreTranslateApiBlockedUntil: number | null = null;
const BLOCK_DURATION = 5 * 60 * 1000; // Block for 5 minutes if 403

/**
 * Get translation using German-English Dictionary API
 * Searches over 300,000 words and phrases
 * @param word - Word or phrase to translate
 * @param limit - Results limit (default: 1)
 * @returns Translation string or null
 */
export async function getGermanEnglishTranslation(
  word: string,
  limit: number = 1
): Promise<string | null> {
  // Skip if API is currently blocked
  if (germanEnglishApiBlocked) {
    if (germanEnglishApiBlockedUntil && Date.now() < germanEnglishApiBlockedUntil) {
      return null; // Still blocked
    }
    // Block expired, reset
    germanEnglishApiBlocked = false;
    germanEnglishApiBlockedUntil = null;
  }

  try {
    const normalizedWord = word.trim();
    if (!normalizedWord) return null;

    const baseUrl = 'https://german-english-dictionary-api.uc.r.appspot.com';
    const url = `${baseUrl}/translate?term=${encodeURIComponent(normalizedWord)}&limit=${limit}`;

    // Add timeout to prevent long waits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Handle different error statuses gracefully
      if (response.status === 404) {
        return null; // Word not found
      }
      if (response.status === 403) {
        // API is blocking requests - skip it for a while
        germanEnglishApiBlocked = true;
        germanEnglishApiBlockedUntil = Date.now() + BLOCK_DURATION;
        // Only log once to avoid spam
        if (!germanEnglishApiBlockedUntil || Date.now() > germanEnglishApiBlockedUntil - BLOCK_DURATION + 1000) {
          console.warn('German-English Dictionary API returned 403. Temporarily skipping this API for 5 minutes.');
        }
        return null; // Return null to allow fallback to other APIs
      }
      if (response.status === 429) {
        // Rate limit exceeded - block temporarily
        germanEnglishApiBlocked = true;
        germanEnglishApiBlockedUntil = Date.now() + BLOCK_DURATION;
        console.warn('German-English Dictionary API rate limit exceeded. Temporarily skipping for 5 minutes.');
        return null;
      }
      // For other errors, log but don't throw - allow fallback
      console.warn(`German-English Dictionary API error: ${response.status}`);
      return null;
    }

    const data: GermanEnglishDictionaryResult = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    // Get the first result
    const firstResult = data.results[0];
    
    // Determine if the input is German or English based on the search term
    // If we're looking for German->English, return the English term
    // If we're looking for English->German, return the German term
    // For now, we'll assume German->English translation
    if (firstResult.english && firstResult.english.term) {
      // Extract just the translation part (remove phonetic/pronunciation info)
      const englishTerm = firstResult.english.term.split(';')[0].split('/')[0].trim();
      return englishTerm;
    }

    return null;
  } catch (error) {
    // Handle timeout or network errors
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        // Timeout - block API temporarily
        germanEnglishApiBlocked = true;
        germanEnglishApiBlockedUntil = Date.now() + BLOCK_DURATION;
        return null;
      }
    }
    // Don't log every error to avoid spam
    return null;
  }
}

/**
 * LibreTranslate API
 * Free and Open Source Machine Translation API
 * Repository: https://github.com/LibreTranslate/LibreTranslate
 * Documentation: https://docs.libretranslate.com/
 */

export interface LibreTranslateResponse {
  translatedText: string;
}

/**
 * Get translation using LibreTranslate API
 * @param word - Word or phrase to translate
 * @param fromLang - Source language code (default: 'de' for German)
 * @param toLang - Target language code (default: 'en' for English)
 * @param apiUrl - Optional custom API URL (default: public instance)
 * @returns Translation string or null
 */
export async function getLibreTranslate(
  word: string,
  fromLang: string = 'de',
  toLang: string = 'en',
  apiUrl?: string
): Promise<string | null> {
  try {
    const normalizedWord = word.trim();
    if (!normalizedWord) return null;

    // Check if API is temporarily blocked due to rate limiting
    const BLOCK_DURATION = 5 * 60 * 1000; // 5 minutes
    if (libreTranslateApiBlockedUntil && Date.now() < libreTranslateApiBlockedUntil) {
      return null; // Silently skip if blocked
    }

    // Use public instance or custom URL
    const baseUrl = apiUrl || 'https://libretranslate.com';
    const url = `${baseUrl}/translate`;

    // Add timeout to prevent long waits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        q: normalizedWord,
        source: fromLang,
        target: toLang,
        format: 'text',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 400 || response.status === 404) {
        return null;
      }
      if (response.status === 429) {
        // Rate limit exceeded - block temporarily
        libreTranslateApiBlockedUntil = Date.now() + BLOCK_DURATION;
        console.warn('LibreTranslate API rate limit exceeded. Temporarily skipping for 5 minutes.');
        return null; // Return null instead of throwing
      }
      // For other errors, log but don't throw - return null to allow fallback
      console.warn(`LibreTranslate API error: ${response.status}`);
      return null;
    }

    const data: LibreTranslateResponse = await response.json();

    if (data.translatedText) {
      return data.translatedText.trim();
    }

    return null;
  } catch (error) {
    // Don't log timeout errors to avoid spam
    if (error instanceof Error && error.name !== 'AbortError') {
      console.warn('Error fetching LibreTranslate translation:', error);
    }
    return null;
  }
}

/**
 * Get translation with fallback to multiple APIs
 * Tries all available APIs in order of preference
 * @param word - Word to translate
 * @param fromLang - Source language (default: 'de')
 * @param toLang - Target language (default: 'en')
 * @returns Translation string or null
 */
export async function getTranslationWithFallback(
  word: string,
  fromLang: string = 'de',
  toLang: string = 'en'
): Promise<string | null> {
  // For German to English, try all German-specific APIs first
  if (fromLang === 'de' && toLang === 'en') {
    // 1. Try German-English Dictionary API (most comprehensive for German)
    const germanEnglishTranslation = await getGermanEnglishTranslation(word, 1);
    if (germanEnglishTranslation) {
      return germanEnglishTranslation;
    }

    // 2. Try Yandex API
    const yandexTranslation = await getYandexTranslation(word, fromLang, toLang);
    if (yandexTranslation) {
      return yandexTranslation;
    }

    // 3. Try LibreTranslate (machine translation)
    const libreTranslation = await getLibreTranslate(word, fromLang, toLang);
    if (libreTranslation) {
      return libreTranslation;
    }
  }

  // Fallback to dictionaryapi.dev for English definitions
  if (toLang === 'en') {
    const dictTranslation = await getDictionaryTranslation(word);
    if (dictTranslation) {
      return dictTranslation;
    }
  }

  // Try LibreTranslate as fallback
  const libreTranslation = await getLibreTranslate(word, fromLang, toLang);
  if (libreTranslation) {
    return libreTranslation;
  }

  // Final fallback: try Yandex
  return await getYandexTranslation(word, fromLang, toLang);
}

