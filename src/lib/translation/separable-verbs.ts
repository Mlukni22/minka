/**
 * Separable verb detection and merging
 * Merges separable verbs in token lists (e.g., "sieht aus" → "aussehen")
 */

import { Token } from './tokenizer';

// Common German separable particles
export const SEPARABLE_PARTICLES = new Set([
  'ab', 'an', 'auf', 'aus', 'bei', 'ein', 'fern', 'fest', 'fort', 'gegen',
  'her', 'hin', 'mit', 'nach', 'vor', 'zu', 'zurück', 'zusammen', 'einher',
  'über', 'unter', 'weg', 'los', 'durch', 'um', 'dabei', 'daran', 'darauf',
  'darin', 'damit', 'davon', 'dazu', 'dagegen', 'darüber', 'darunter'
]);

// Inseparable prefixes (these are NOT separable)
export const INSEPARABLE_PREFIXES = new Set([
  'be', 'ver', 'emp', 'ent', 'er', 'ge', 'miss', 'zer'
]);

/**
 * Merged token representing a separable verb
 * Example: "sieht aus" → baseForm: "aussehen"
 */
export interface MergedToken extends Token {
  baseForm: string;
  originalTokens: Token[];
  isMerged: true;
}

/**
 * Type guard to check if a token is a MergedToken
 */
export function isMergedToken(token: Token | MergedToken): token is MergedToken {
  return 'isMerged' in token && token.isMerged === true;
}

/**
 * Normalize a word for comparison
 */
function normalize(word: string): string {
  return word.toLowerCase().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
}

/**
 * Simple lemmatizer for verbs
 * Converts conjugated forms to infinitive (very naive approach)
 */
function naiveLemmatize(word: string): string {
  const w = normalize(word);
  if (w.endsWith('en')) return w; // Could be infinitive already
  // Strip common suffixes — not perfect
  return w.replace(/(st|t|te)$/, 'en');
}

/**
 * Check if a word looks like a verb
 */
function isVerbLike(token: Token): boolean {
  const norm = token.normalized;
  // Common verb endings
  return /t$|st$|en$|e$|te$/.test(norm) && norm.length >= 3;
}

/**
 * Check if a token is a separable particle
 */
function isSeparableParticle(token: Token): boolean {
  return SEPARABLE_PARTICLES.has(token.normalized);
}

/**
 * Check if a word has an inseparable prefix
 */
function hasInseparablePrefix(word: string): boolean {
  const norm = normalize(word);
  return Array.from(INSEPARABLE_PREFIXES).some(prefix => norm.startsWith(prefix));
}

/**
 * Merge separable verbs in a token array
 * Example: ["Er", "sieht", "gut", "aus", "."] → ["Er", MergedToken("sieht aus", "aussehen"), "gut", "."]
 */
export function mergeSeparableVerbs(tokens: Token[]): (Token | MergedToken)[] {
  const merged: (Token | MergedToken)[] = [];
  const n = tokens.length;

  for (let i = 0; i < n; i++) {
    const t = tokens[i];

    // Only consider tokens that look like verbs
    if (!isVerbLike(t)) {
      merged.push(t);
      continue;
    }

    // Skip if it has an inseparable prefix
    if (hasInseparablePrefix(t.text)) {
      merged.push(t);
      continue;
    }

    // 1) Check immediate next token for a separable particle
    const next = tokens[i + 1];
    if (next && isSeparableParticle(next)) {
      const lemma = naiveLemmatize(t.text);
      const base = normalize(next.text) + lemma; // e.g., "aus" + "sehen" = "aussehen"
      
      const mergedToken: MergedToken = {
        text: `${t.text} ${next.text}`,
        startIndex: t.startIndex,
        endIndex: next.endIndex,
        normalized: `${t.normalized} ${next.normalized}`,
        baseForm: base,
        originalTokens: [t, next],
        isMerged: true,
      };
      
      merged.push(mergedToken);
      i++; // Skip next token
      continue;
    }

    // 2) Check for particle at clause end: search within next N tokens (e.g., up to 8)
    let foundIndex = -1;
    for (let j = i + 1; j < Math.min(n, i + 9); j++) {
      const candidate = tokens[j];
      if (isSeparableParticle(candidate)) {
        foundIndex = j;
        break;
      }
    }

    if (foundIndex !== -1) {
      const particle = tokens[foundIndex];
      const lemma = naiveLemmatize(t.text);
      const base = normalize(particle.text) + lemma;
      
      // Create merged token from all tokens between i and foundIndex
      const originalTokens = tokens.slice(i, foundIndex + 1);
      const mergedToken: MergedToken = {
        text: originalTokens.map(x => x.text).join(' '),
        startIndex: t.startIndex,
        endIndex: tokens[foundIndex].endIndex,
        normalized: originalTokens.map(x => x.normalized).join(' '),
        baseForm: base,
        originalTokens: originalTokens,
        isMerged: true,
      };
      
      merged.push(mergedToken);
      i = foundIndex; // Advance past all merged tokens
      continue;
    }

    // Otherwise push original token
    merged.push(t);
  }

  return merged;
}

// Explicit export to ensure module is recognized
export {};
