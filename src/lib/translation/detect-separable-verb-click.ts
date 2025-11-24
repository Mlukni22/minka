/**
 * Detects separable verbs when a word is clicked in the UI
 */

export interface SeparableVerbMatch {
  verbText: string;
  particleText: string;
  baseForm: string; // e.g., "aussehen"
  fullText: string; // e.g., "sieht aus"
}

export interface WordForDetection {
  text: string;
  index: number;
  start: number;
  end: number;
}

// Common German separable particles
const SEPARABLE_PARTICLES = new Set([
  'ab', 'an', 'auf', 'aus', 'bei', 'ein', 'fern', 'fest', 'fort', 'gegen',
  'her', 'hin', 'mit', 'nach', 'vor', 'zu', 'zurück', 'zusammen', 'einher',
  'über', 'unter', 'weg', 'los', 'durch', 'um', 'dabei', 'daran', 'darauf',
  'darin', 'damit', 'davon', 'dazu', 'dagegen', 'darüber', 'darunter'
]);

function normalize(word: string): string {
  return word.toLowerCase().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
}

function naiveLemmatize(word: string): string {
  const w = normalize(word);
  // Very naive: handle common conjugation endings
  if (w.endsWith('en')) return w; // Could be infinitive already
  // Strip common suffixes — not perfect
  return w.replace(/(st|t|te)$/, 'en');
}

/**
 * Extracts words from text for detection, preserving indices
 */
export function extractWordsForDetection(text: string): WordForDetection[] {
  const words: WordForDetection[] = [];
  const wordRegex = /\b([A-Za-zÄÖÜäöüß]{2,})\b/g;
  let match: RegExpExecArray | null;
  
  while ((match = wordRegex.exec(text)) !== null) {
    words.push({
      text: match[1],
      index: words.length,
      start: match.index,
      end: match.index + match[1].length,
    });
  }
  
  return words;
}

/**
 * Detects if a clicked word is part of a separable verb
 * Returns the separable verb match if found, null otherwise
 */
export function detectSeparableVerbFromClick(
  clickedWord: string,
  allWords: WordForDetection[],
  clickedWordIndex: number
): SeparableVerbMatch | null {
  if (clickedWordIndex < 0 || clickedWordIndex >= allWords.length) {
    return null;
  }

  const clickedWordNormalized = normalize(clickedWord);
  const clickedToken = allWords[clickedWordIndex];
  
  // Check if clicked word is a separable particle
  if (SEPARABLE_PARTICLES.has(clickedWordNormalized)) {
    // Look for a verb nearby (within next 8 tokens)
    for (let i = clickedWordIndex + 1; i < Math.min(allWords.length, clickedWordIndex + 9); i++) {
      const candidate = allWords[i];
      const candidateNormalized = normalize(candidate.text);
      
      // Check if it looks like a verb (ends with common verb endings)
      if (/t$|st$|en$|e$/.test(candidateNormalized)) {
        const lemma = naiveLemmatize(candidate.text);
        const baseForm = clickedWordNormalized + lemma;
        
        return {
          verbText: candidate.text,
          particleText: clickedToken.text,
          baseForm: baseForm,
          fullText: `${candidate.text} ${clickedToken.text}`,
        };
      }
    }
  }
  
  // Check if clicked word is a verb and look for particle nearby
  if (/t$|st$|en$|e$/.test(clickedWordNormalized)) {
    // Look for particle immediately after
    if (clickedWordIndex + 1 < allWords.length) {
      const nextToken = allWords[clickedWordIndex + 1];
      const nextNormalized = normalize(nextToken.text);
      
      if (SEPARABLE_PARTICLES.has(nextNormalized)) {
        const lemma = naiveLemmatize(clickedWord);
        const baseForm = nextNormalized + lemma;
        
        return {
          verbText: clickedToken.text,
          particleText: nextToken.text,
          baseForm: baseForm,
          fullText: `${clickedToken.text} ${nextToken.text}`,
        };
      }
    }
    
    // Look for particle within next 8 tokens (at end of clause)
    for (let i = clickedWordIndex + 1; i < Math.min(allWords.length, clickedWordIndex + 9); i++) {
      const candidate = allWords[i];
      const candidateNormalized = normalize(candidate.text);
      
      if (SEPARABLE_PARTICLES.has(candidateNormalized)) {
        const lemma = naiveLemmatize(clickedWord);
        const baseForm = candidateNormalized + lemma;
        
        return {
          verbText: clickedToken.text,
          particleText: candidate.text,
          baseForm: baseForm,
          fullText: `${clickedToken.text} ${candidate.text}`,
        };
      }
    }
  }
  
  return null;
}
