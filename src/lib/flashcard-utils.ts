/**
 * Replace the target word in a sentence with a blank
 * Uses word boundaries to match only complete words
 * Replaces only the FIRST occurrence
 * ALWAYS ensures there is a blank space, even if word is not found
 * Returns a sentence with underscores representing the blank
 */
export function createClozeSentence(sentence: string, targetWord: string): string {
  if (!sentence || !sentence.trim()) {
    // If no sentence, create a blank space with placeholder text
    const wordLength = targetWord ? targetWord.length : 5;
    const blankLength = Math.max(wordLength, Math.ceil(wordLength * 1.5));
    return `_____${'_'.repeat(blankLength)}_____`;
  }
  
  if (!targetWord || !targetWord.trim()) {
    // If no target word, return sentence with a generic blank
    return `${sentence.trim()} [_____]`;
  }
  
  // Normalize both sentence and target word for better matching
  // Remove punctuation from target word for matching, but keep original for replacement
  const targetWordClean = targetWord.replace(/[.,!?;:'"]/g, '').trim();
  
  // Normalize umlauts for matching (ä->a, ö->o, ü->u, ß->ss)
  const normalizeUmlauts = (str: string) => {
    return str
      .replace(/ä/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u')
      .replace(/ß/g, 'ss')
      .toLowerCase();
  };
  
  const targetWordNormalized = normalizeUmlauts(targetWordClean);
  const escapedWord = targetWordClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Try multiple matching strategies:
  // 1. Exact match with word boundaries (case-insensitive)
  // 2. Match with umlaut normalization
  // 3. Match without punctuation
  // 4. Match the base word (without articles)
  
  let regex: RegExp;
  let match: RegExpMatchArray | null = null;
  
  // Strategy 1: Exact word with word boundaries (case-insensitive)
  regex = new RegExp(`\\b${escapedWord}\\b`, 'i');
  match = sentence.match(regex);
  
  // Strategy 2: If not found, try matching with umlaut normalization
  if (!match) {
    // Split sentence into words and try to find a match with normalized comparison
    const words = sentence.split(/\b/);
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordNormalized = normalizeUmlauts(word.replace(/[.,!?;:'"]/g, ''));
      if (wordNormalized === targetWordNormalized) {
        // Found match - create regex for this specific word
        const wordEscaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        regex = new RegExp(wordEscaped, 'i');
        match = sentence.match(regex);
        break;
      }
    }
  }
  
  // Strategy 3: If not found, try matching without punctuation in sentence
  if (!match) {
    const sentenceWithoutPunctuation = sentence.replace(/[.,!?;:'"]/g, ' ');
    regex = new RegExp(`\\b${escapedWord}\\b`, 'i');
    match = sentenceWithoutPunctuation.match(regex);
    if (match) {
      // Reconstruct regex for original sentence
      regex = new RegExp(`\\b${escapedWord}\\b`, 'i');
    }
  }
  
  // Strategy 4: If still not found, try base word (remove articles)
  if (!match) {
    const baseWord = targetWordClean.replace(/^(der|die|das|ein|eine|dem|den|des|deren|dessen)\s+/i, '').trim();
    if (baseWord && baseWord !== targetWordClean) {
      const escapedBaseWord = baseWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      regex = new RegExp(`\\b${escapedBaseWord}\\b`, 'i');
      match = sentence.match(regex);
    }
  }
  
  // Create a blank based on word length
  // Use approximately 1.5x the word length for better visibility
  const wordLength = targetWord.length;
  const blankLength = Math.max(wordLength, Math.ceil(wordLength * 1.5));
  const blanks = '_'.repeat(blankLength);
  
  if (!match) {
    // Word not found - try one more strategy: find any word that contains the target word
    // This handles cases where the word might be part of a compound word or have different capitalization
    const words = sentence.split(/\b/);
    let foundWord: string | null = null;
    
    for (const word of words) {
      const wordNormalized = normalizeUmlauts(word.replace(/[.,!?;:'"]/g, ''));
      const targetNormalized = normalizeUmlauts(targetWordClean);
      
      // Check if word contains target or target contains word (for compound words)
      if (wordNormalized.includes(targetNormalized) || targetNormalized.includes(wordNormalized)) {
        foundWord = word;
        break;
      }
    }
    
    if (foundWord) {
      // Replace the found word with blank
      const wordEscaped = foundWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return sentence.replace(new RegExp(wordEscaped, 'i'), blanks);
    }
    
    // Still not found - insert blank in a natural position
    // Try to find a good spot (before punctuation, or at the end)
    const trimmedSentence = sentence.trim();
    const lastPunctuation = trimmedSentence.search(/[.!?]$/);
    if (lastPunctuation > 0) {
      // Insert blank before punctuation
      return `${trimmedSentence.slice(0, lastPunctuation)} [${blanks}]${trimmedSentence.slice(lastPunctuation)}`;
    } else {
      // Append blank at the end
      return `${trimmedSentence} [${blanks}]`;
    }
  }
  
  // Replace first occurrence with blank
  // Use the regex that found the match
  return sentence.replace(regex, blanks);
}

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Create matrix
  const matrix: number[][] = [];
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }
  
  return matrix[len1][len2];
}

/**
 * Validate user answer against correct answer
 * Returns: { isCorrect: boolean; isAlmostCorrect: boolean; distance: number }
 */
export function validateAnswer(userAnswer: string, correctAnswer: string): {
  isCorrect: boolean;
  isAlmostCorrect: boolean;
  distance: number;
} {
  // Normalize: trim and lowercase
  const normalizedUser = userAnswer.trim().toLowerCase();
  const normalizedCorrect = correctAnswer.trim().toLowerCase();
  
  // Exact match
  if (normalizedUser === normalizedCorrect) {
    return { isCorrect: true, isAlmostCorrect: false, distance: 0 };
  }
  
  // Calculate Levenshtein distance
  const distance = levenshteinDistance(normalizedUser, normalizedCorrect);
  const maxLength = Math.max(normalizedUser.length, normalizedCorrect.length);
  const similarity = 1 - (distance / maxLength);
  
  // Consider "almost correct" if similarity > 0.8 and distance <= 2
  const isAlmostCorrect = similarity > 0.8 && distance <= 2;
  
  return {
    isCorrect: false,
    isAlmostCorrect,
    distance,
  };
}

/**
 * Generate hint for a word (first letter + underscores)
 */
export function generateHint(word: string): string {
  if (word.length === 0) return '';
  if (word.length === 1) return word;
  
  const firstLetter = word[0];
  const rest = '_'.repeat(word.length - 1);
  return `${firstLetter}${rest}`;
}

