/**
 * Replace the target word in a sentence with a blank
 * Uses word boundaries to match only complete words
 * Replaces only the FIRST occurrence
 * Returns a continuous line of underscores with spaces: _ _ _ _ _ _
 */
export function createClozeSentence(sentence: string, targetWord: string): string {
  // Escape special regex characters in target word
  const escapedWord = targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Match word with word boundaries, case-insensitive
  const regex = new RegExp(`\\b${escapedWord}\\b`, 'i');
  
  // Find first match
  const match = sentence.match(regex);
  if (!match) {
    // Word not found, return original sentence
    return sentence;
  }
  
  // Create a single continuous line of underscores (no spaces) based on word length
  // Use approximately 1.5x the word length for better visibility
  const wordLength = targetWord.length;
  const blankLength = Math.max(wordLength, Math.ceil(wordLength * 1.5));
  const blanks = '_'.repeat(blankLength);
  
  // Replace first occurrence
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

