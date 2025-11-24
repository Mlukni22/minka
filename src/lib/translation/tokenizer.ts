/**
 * Tokenization utilities for story text
 * Tokenizes text while preserving character positions for highlighting
 */

export interface Token {
  text: string;
  startIndex: number;
  endIndex: number;
  normalized: string;
}

/**
 * Normalize a token: lowercase, trim, remove punctuation (except apostrophes inside words)
 */
export function normalizeToken(text: string): string {
  // Remove leading/trailing punctuation but keep apostrophes inside words
  let normalized = text.trim().toLowerCase();
  
  // Remove punctuation at start/end, but preserve apostrophes in middle (e.g., "don't")
  normalized = normalized.replace(/^[^\p{L}\p{N}']+|[^\p{L}\p{N}']+$/gu, '');
  
  return normalized;
}

/**
 * Tokenize text with character position indices
 * Handles German compound words, multi-word phrases, and special characters
 */
export function tokenizeWithIndices(text: string): Token[] {
  const tokens: Token[] = [];
  let currentIndex = 0;
  
  // Regex to match words (including German characters: ä, ö, ü, ß)
  // Also handles compound words and multi-word phrases
  const wordRegex = /\b[\p{L}\p{N}]+(?:['-][\p{L}\p{N}]+)*\b/gu;
  
  let match;
  while ((match = wordRegex.exec(text)) !== null) {
    const tokenText = match[0];
    const startIndex = match.index;
    const endIndex = startIndex + tokenText.length;
    const normalized = normalizeToken(tokenText);
    
    // Only add tokens with letters (skip pure numbers or punctuation)
    if (/\p{L}/u.test(tokenText)) {
      tokens.push({
        text: tokenText,
        startIndex,
        endIndex,
        normalized,
      });
    }
    
    currentIndex = endIndex;
  }
  
  return tokens;
}

/**
 * Tokenize and merge separable verbs
 * This is the main function to use for German text processing
 */
export function tokenizeWithSeparableVerbs(text: string): (Token | import('./separable-verbs').MergedToken)[] {
  const { mergeSeparableVerbs } = require('./separable-verbs');
  const tokens = tokenizeWithIndices(text);
  return mergeSeparableVerbs(tokens);
}

/**
 * Detect multi-word phrases (n-grams) in tokens
 * Useful for phrasal verbs and separable verbs in German
 */
export function detectPhrases(tokens: Token[], maxN: number = 4): Token[] {
  const phrases: Token[] = [];
  
  for (let n = maxN; n >= 2; n--) {
    for (let i = 0; i <= tokens.length - n; i++) {
      const phraseTokens = tokens.slice(i, i + n);
      const phraseText = phraseTokens.map(t => t.text).join(' ');
      const normalized = normalizeToken(phraseText);
      
      phrases.push({
        text: phraseText,
        startIndex: phraseTokens[0].startIndex,
        endIndex: phraseTokens[phraseTokens.length - 1].endIndex,
        normalized,
      });
    }
  }
  
  return phrases;
}

/**
 * Attempt to decompound German compound words
 * Example: Donaudampfschifffahrt → Donau, Dampf, Schiff, Fahrt
 */
export function decompoundWord(word: string): string[] {
  const compounds: string[] = [];
  const normalized = word.toLowerCase();
  
  // Common German word parts (simplified - could be expanded)
  const commonParts = [
    'haus', 'schiff', 'dampf', 'donau', 'fahrt', 'wagen', 'platz', 'straße',
    'tür', 'fenster', 'buch', 'tisch', 'stuhl', 'bett', 'zimmer', 'küche',
    'wasser', 'feuer', 'luft', 'erde', 'sonne', 'mond', 'stern', 'tag',
    'nacht', 'morgen', 'abend', 'jahr', 'monat', 'woche', 'stunde',
  ];
  
  // Try to find compound parts
  for (const part of commonParts) {
    if (normalized.includes(part) && normalized.length > part.length) {
      const index = normalized.indexOf(part);
      if (index > 0) {
        const before = normalized.substring(0, index);
        const after = normalized.substring(index + part.length);
        if (before.length >= 3) compounds.push(before);
        compounds.push(part);
        if (after.length >= 3) compounds.push(after);
        break;
      }
    }
  }
  
  return compounds.length > 0 ? compounds : [normalized];
}

