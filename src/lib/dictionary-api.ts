/**
 * Dictionary API integration using dictionaryapi.dev
 * API Documentation: https://github.com/meetDeveloper/freeDictionaryAPI
 * API Endpoint: https://api.dictionaryapi.dev/api/v2/entries/<language>/<word>
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

