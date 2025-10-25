/**
 * Flashcard Integration System
 * Automatically adds vocabulary to flashcards when lessons are completed
 */

import { VocabularyItem } from '@/types';

export type FlashcardWord = {
  id: string;
  de: string;
  en: string;
  exDe: string;
  exEn: string;
};

export type FlashcardCard = {
  id: string;
  wordId: string;
  dir: "de-en" | "en-de";
  prompt: string;
  answer: string;
  cloze: string;
  next: number;
  interval: number;
  ease: number;
  reps: number;
  lapses: number;
  new: boolean;
};

const FLASHCARD_STORAGE_KEY = "minka_flashcards_v1";

/**
 * Convert vocabulary items from lessons to flashcard format
 */
export function vocabularyToFlashcardWords(vocabulary: VocabularyItem[]): FlashcardWord[] {
  return vocabulary.map(item => ({
    id: `w-${item.german.toLowerCase().replace(/\s+/g, '-')}`,
    de: item.german,
    en: item.english,
    exDe: item.example || `___ ist ein Wort.`, // Fallback example
    exEn: `___ is a word.` // Fallback example
  }));
}

/**
 * Add vocabulary from a completed lesson to user's flashcard deck
 */
export function addVocabularyToFlashcards(vocabulary: VocabularyItem[]): number {
  try {
    // Load existing flashcards
    const existingCards = loadFlashcards();
    
    // Convert vocabulary to flashcard words
    const newWords = vocabularyToFlashcardWords(vocabulary);
    
    // Get existing word IDs to avoid duplicates
    const existingWordIds = new Set(
      existingCards.map(card => card.wordId)
    );
    
    // Filter out words that already exist
    const uniqueWords = newWords.filter(word => !existingWordIds.has(word.id));
    
    if (uniqueWords.length === 0) {
      return 0; // No new words to add
    }
    
    // Create new flashcards (2 per word: DE→EN and EN→DE)
    const now = Date.now();
    const newCards: FlashcardCard[] = [];
    
    for (const word of uniqueWords) {
      // German → English (recognition)
      newCards.push({
        id: `${word.id}:de-en`,
        wordId: word.id,
        dir: "de-en",
        prompt: word.de,
        answer: word.en,
        cloze: cloze(word.exDe, word.de),
        next: now,
        interval: 0,
        ease: 2.5,
        reps: 0,
        lapses: 0,
        new: true
      });
      
      // English → German (production)
      newCards.push({
        id: `${word.id}:en-de`,
        wordId: word.id,
        dir: "en-de",
        prompt: word.en,
        answer: word.de,
        cloze: cloze(word.exEn, word.en),
        next: now,
        interval: 0,
        ease: 2.5,
        reps: 0,
        lapses: 0,
        new: true
      });
    }
    
    // Merge with existing cards and save
    const updatedCards = [...existingCards, ...newCards];
    saveFlashcards(updatedCards);
    
    return newCards.length; // Return number of cards added
  } catch (error) {
    console.error('Error adding vocabulary to flashcards:', error);
    return 0;
  }
}

/**
 * Load flashcards from localStorage
 */
function loadFlashcards(): FlashcardCard[] {
  try {
    const raw = localStorage.getItem(FLASHCARD_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save flashcards to localStorage
 */
function saveFlashcards(cards: FlashcardCard[]): void {
  try {
    localStorage.setItem(FLASHCARD_STORAGE_KEY, JSON.stringify(cards));
  } catch (error) {
    console.error('Error saving flashcards:', error);
  }
}

/**
 * Simple cloze creation
 */
function cloze(sentence: string, target: string): string {
  if (sentence.includes("___")) return sentence;
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\b${escaped}\\b`, "i");
  return sentence.replace(re, "___");
}

/**
 * Get count of user's flashcards
 */
export function getFlashcardCount(): number {
  const cards = loadFlashcards();
  return cards.length;
}

/**
 * Get count of new (unstudied) flashcards
 */
export function getNewFlashcardCount(): number {
  const cards = loadFlashcards();
  return cards.filter(c => c.new).length;
}

/**
 * Get count of due flashcards
 */
export function getDueFlashcardCount(): number {
  const cards = loadFlashcards();
  const now = Date.now();
  return cards.filter(c => !c.new && c.next <= now).length;
}

