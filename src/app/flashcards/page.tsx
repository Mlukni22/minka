'use client';

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Brain, Calendar, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { FlashcardSystem } from "@/lib/flashcard-system";
import { LevelSystem, XP_REWARDS } from "@/lib/level-system";
import { DailyQuestSystem } from "@/lib/daily-quests";
import { useLanguage } from '@/contexts/LanguageContext';

/* ──────────────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────────────── */
type Dir = "de-en" | "en-de";

type Word = {
  id: string;
  de: string;          // lemma in German
  en: string;          // translation in English
  exDe: string;        // example DE sentence (contains the German word)
  exEn: string;        // example EN sentence (contains the English word)
  article?: 'der' | 'die' | 'das';  // Article for nouns
  plural?: string;     // Plural form for nouns
  wordType?: 'noun' | 'verb' | 'adjective' | 'phrase' | 'other';
};

type Card = {
  id: string;          // `${wordId}:${dir}`
  wordId: string;
  dir: Dir;
  prompt: string;      // the headword to recall (e.g., "Hallo" or "Hello")
  answer: string;      // expected answer ("Hello" or "Hallo")
  cloze: string;       // example sentence with the target blanked out
  next: number;        // next review time (ms since epoch)
  interval: number;    // days
  ease: number;        // ease factor (e.g., 2.5)
  reps: number;        // successful reviews in a row
  lapses: number;
  new: boolean;        // never reviewed
  article?: 'der' | 'die' | 'das';  // Article for nouns
  plural?: string;     // Plural form for nouns
  wordType?: 'noun' | 'verb' | 'adjective' | 'phrase' | 'other';
};

/* ──────────────────────────────────────────────────────────────────────────
   Episode vocabulary (imported when user completes lessons)
   NEW USERS START WITH EMPTY DECK - cards are added from lessons
   ──────────────────────────────────────────────────────────────────────── */
const ALL_VOCABULARY: Word[] = [
  // Episode 0 - Hallo!
  { id: "w-hallo", de: "Hallo", en: "Hello", exDe: "___, Lisa! Ich bin Minka.", exEn: "___, Lisa! I am Minka.", wordType: "other" },
  { id: "w-wie-heisst-du", de: "Wie heißt du?", en: "What is your name?", exDe: "___, Lisa?", exEn: "___, Lisa?", wordType: "phrase" },
  { id: "w-ich-heisse", de: "Ich heiße", en: "My name is", exDe: "___ Minka.", exEn: "___ Minka.", wordType: "phrase" },
  { id: "w-ich-bin", de: "Ich bin", en: "I am", exDe: "___ Minka.", exEn: "___ Minka.", wordType: "phrase" },
  { id: "w-maus", de: "Maus", en: "mouse", exDe: "Eine kleine ___.", exEn: "A small ___.", article: "die", plural: "Mäuse", wordType: "noun" },
  { id: "w-park", de: "Park", en: "park", exDe: "Im ___ sitzt Pinko.", exEn: "Pinko sits in the ___.", article: "der", plural: "Parks", wordType: "noun" },
  { id: "w-malen", de: "malen", en: "to paint", exDe: "Er malt ein Bild.", exEn: "He ___ a picture.", wordType: "verb" },
  { id: "w-danke", de: "Danke", en: "Thank you", exDe: "___!", exEn: "___!", wordType: "phrase" },
  { id: "w-bitte", de: "Bitte", en: "Please / You're welcome", exDe: "___!", exEn: "___!", wordType: "phrase" },
  { id: "w-guten-morgen", de: "Guten Morgen", en: "Good morning", exDe: "___!", exEn: "___!", wordType: "phrase" },
  { id: "w-auf-wiedersehen", de: "Auf Wiedersehen", en: "Goodbye", exDe: "___!", exEn: "___!", wordType: "phrase" },
  { id: "w-tschuess", de: "Tschüss", en: "Bye", exDe: "___!", exEn: "___!", wordType: "phrase" },
  
  // Episode 1 - Willkommen im Dorf
  { id: "w-dorf", de: "Dorf", en: "village", exDe: "Willkommen im ___!", exEn: "Welcome to the ___!", article: "das", plural: "Dörfer", wordType: "noun" },
  { id: "w-baeckerei", de: "Bäckerei", en: "bakery", exDe: "Minka geht zur ___.", exEn: "Minka goes to the ___.", article: "die", plural: "Bäckereien", wordType: "noun" },
  { id: "w-brot", de: "Brot", en: "bread", exDe: "Ich möchte ein ___.", exEn: "I would like some ___.", article: "das", plural: "Brote", wordType: "noun" },
  { id: "w-moechte", de: "möchte", en: "would like", exDe: "Ich ___ ein Brot.", exEn: "I ___ some bread.", wordType: "verb" },
  { id: "w-bitte-schoen", de: "Bitte schön", en: "Here you are", exDe: "___!", exEn: "___!", wordType: "phrase" },
  { id: "w-euro", de: "Euro", en: "euro", exDe: "Das kostet drei ___.", exEn: "That costs three ___.", article: "der", plural: "Euro", wordType: "noun" },
  
  // Episode 2 - Der verlorene Schlüssel
  { id: "w-schluessel", de: "Schlüssel", en: "key", exDe: "Der verlorene ___.", exEn: "The lost ___.", article: "der", plural: "Schlüssel", wordType: "noun" },
  { id: "w-haus", de: "Haus", en: "house", exDe: "Ich bin zu ___  gegangen.", exEn: "I went to ___ .", article: "das", plural: "Häuser", wordType: "noun" },
  { id: "w-suchen", de: "suchen", en: "to search", exDe: "Ich ___ den Schlüssel.", exEn: "I ___ for the key.", wordType: "verb" },
  { id: "w-finden", de: "finden", en: "to find", exDe: "Ich kann es nicht ___.", exEn: "I can't ___ it.", wordType: "verb" },
  { id: "w-hilfe", de: "Hilfe", en: "help", exDe: "Ich brauche ___!", exEn: "I need ___!", article: "die", plural: "Hilfen", wordType: "noun" },
  
  // Episode 3 - Der Brief
  { id: "w-brief", de: "Brief", en: "letter", exDe: "Ein ___ für dich.", exEn: "A ___ for you.", article: "der", plural: "Briefe", wordType: "noun" },
  { id: "w-post", de: "Post", en: "mail", exDe: "Die ___ ist da.", exEn: "The ___ is here.", article: "die", plural: "-", wordType: "noun" },
  { id: "w-lesen", de: "lesen", en: "to read", exDe: "Ich ___ den Brief.", exEn: "I ___ the letter.", wordType: "verb" },
  { id: "w-schreiben", de: "schreiben", en: "to write", exDe: "Ich ___ einen Brief.", exEn: "I ___ a letter.", wordType: "verb" },
  
  // Episode 4 - Die Spuren
  { id: "w-spur", de: "Spur", en: "track/trace", exDe: "Ich folge der ___.", exEn: "I follow the ___.", article: "die", plural: "Spuren", wordType: "noun" },
  { id: "w-wald", de: "Wald", en: "forest", exDe: "Im ___ sind viele Bäume.", exEn: "In the ___ are many trees.", article: "der", plural: "Wälder", wordType: "noun" },
  { id: "w-baum", de: "Baum", en: "tree", exDe: "Ein großer ___.", exEn: "A big ___.", article: "der", plural: "Bäume", wordType: "noun" },
  { id: "w-tier", de: "Tier", en: "animal", exDe: "Ein kleines ___.", exEn: "A small ___.", article: "das", plural: "Tiere", wordType: "noun" },
  
  // Episode 5 - Das Geheimnis
  { id: "w-geheimnis", de: "Geheimnis", en: "secret", exDe: "Das ___!", exEn: "The ___!", article: "das", plural: "Geheimnisse", wordType: "noun" },
  { id: "w-verstecken", de: "verstecken", en: "to hide", exDe: "Wo ist es ___?", exEn: "Where is it ___?", wordType: "verb" },
  { id: "w-freund", de: "Freund", en: "friend", exDe: "Mein bester ___.", exEn: "My best ___.", article: "der", plural: "Freunde", wordType: "noun" },
  { id: "w-zusammen", de: "zusammen", en: "together", exDe: "Wir sind ___.", exEn: "We are ___.", wordType: "other" },
];

/* ──────────────────────────────────────────────────────────────────────────
   Utilities
   ──────────────────────────────────────────────────────────────────────── */

// Simple cloze: if sentence already has ___ use as-is; otherwise blank target
const cloze = (sentence: string, target: string) => {
  if (sentence.includes("___")) return sentence;
  const re = new RegExp(`\\b${escapeRegExp(target)}\\b`, "i");
  return sentence.replace(re, "___");
};
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// normalize user input with typo tolerance
const norm = (s: string) => s.trim().toLowerCase();

// Fuzzy matching for typos and variations
function fuzzyMatch(input: string, answer: string): boolean {
  const normalizedInput = norm(input);
  const normalizedAnswer = norm(answer);
  
  // Exact match
  if (normalizedInput === normalizedAnswer) return true;
  
  // Remove punctuation for comparison (handle "what's" vs "what is")
  const removePunct = (s: string) => s.replace(/[?!.,;:']/g, '');
  const inputNoPunct = removePunct(normalizedInput);
  const answerNoPunct = removePunct(normalizedAnswer);
  
  if (inputNoPunct === answerNoPunct) return true;
  
  // Handle contractions (what's = what is, you're = you are, etc.)
  const expandContractions = (s: string) => 
    s.replace(/what's/g, 'what is')
     .replace(/that's/g, 'that is')
     .replace(/it's/g, 'it is')
     .replace(/you're/g, 'you are')
     .replace(/i'm/g, 'i am')
     .replace(/we're/g, 'we are')
     .replace(/they're/g, 'they are')
     .replace(/isn't/g, 'is not')
     .replace(/aren't/g, 'are not')
     .replace(/don't/g, 'do not')
     .replace(/doesn't/g, 'does not');
  
  const inputExpanded = expandContractions(inputNoPunct);
  const answerExpanded = expandContractions(answerNoPunct);
  
  if (inputExpanded === answerExpanded) return true;
  
  // Levenshtein distance for minor typos (allow 1-2 character difference)
  const distance = levenshteinDistance(inputExpanded, answerExpanded);
  const maxAllowedDistance = Math.max(1, Math.floor(answerExpanded.length * 0.15)); // 15% tolerance
  
  return distance <= maxAllowedDistance;
}

// Calculate Levenshtein distance (edit distance between two strings)
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/* ──────────────────────────────────────────────────────────────────────────
   Card generation (2 directions per word with appropriate instructions)
   ──────────────────────────────────────────────────────────────────────── */
function makeCards(words: Word[]): Card[] {
  const now = Date.now();
  const base: Card[] = [];
  for (const w of words) {
    // German → English (recognition: "What's the meaning of...")
    base.push({
      id: `${w.id}:de-en`,
      wordId: w.id,
      dir: "de-en",
      prompt: w.de,        // Show German word
      answer: w.en,        // Type English meaning
      cloze: cloze(w.exDe, w.de),  // German example sentence
      next: now, interval: 0, ease: 2.5, reps: 0, lapses: 0, new: true,
      article: w.article,
      plural: w.plural,
      wordType: w.wordType
    });
    // English → German (production: "Translate to German:")
    base.push({
      id: `${w.id}:en-de`,
      wordId: w.id,
      dir: "en-de",
      prompt: w.en,        // Show English word
      answer: w.de,        // Type German word
      cloze: cloze(w.exDe, w.de),  // ALWAYS use German example sentence
      next: now, interval: 0, ease: 2.5, reps: 0, lapses: 0, new: true,
      article: w.article,
      plural: w.plural,
      wordType: w.wordType
    });
  }
  return base;
}

// Convert UserFlashcard to Card format
function convertUserFlashcardToCard(userCard: any): Card[] {
  const now = Date.now();
  const cards: Card[] = [];
  
  // Use cloze sentence if available, otherwise create from examples
  const clozeSentence = userCard.clozeSentence || userCard.exampleSentence || '';
  const clozeWord = userCard.clozeWord || userCard.german;
  
  // German → English
  cards.push({
    id: `${userCard.german}:de-en`,
    wordId: userCard.german,
    dir: "de-en",
    prompt: userCard.german,
    answer: userCard.english,
    cloze: clozeSentence ? cloze(clozeSentence, clozeWord) : '',
    next: userCard.nextReview?.getTime() || now,
    interval: userCard.interval || 0,
    ease: userCard.ease || 2.5,
    reps: userCard.reviewCount || 0,
    lapses: 0,
    new: userCard.reviewCount === 0,
    article: userCard.article,
    plural: userCard.plural,
    wordType: userCard.wordType
  });
  
  // English → German
  cards.push({
    id: `${userCard.german}:en-de`,
    wordId: userCard.german,
    dir: "en-de",
    prompt: userCard.english,
    answer: userCard.german,
    cloze: clozeSentence ? cloze(clozeSentence, clozeWord) : '',
    next: userCard.nextReview?.getTime() || now,
    interval: userCard.interval || 0,
    ease: userCard.ease || 2.5,
    reps: userCard.reviewCount || 0,
    lapses: 0,
    new: userCard.reviewCount === 0,
    article: userCard.article,
    plural: userCard.plural,
    wordType: userCard.wordType
  });
  
  return cards;
}

/* ──────────────────────────────────────────────────────────────────────────
   SM-2 scheduler (Anki-like)
   Q: 0=Again, 2=Hard, 3=Good, 4=Easy (mapped from UI)
   ──────────────────────────────────────────────────────────────────────── */
function schedule(card: Card, quality: 0 | 2 | 3 | 4): Card {
  const now = Date.now();
  let { ease, interval, reps } = card;

  if (quality < 2) {
    // FAIL
    reps = 0;
    interval = 0;
    ease = Math.max(1.3, ease - 0.2);
    return { 
      ...card, 
      next: now + 60 * 60 * 1000, // 1h again
      ease, 
      interval, 
      reps, 
      lapses: card.lapses + 1, 
      new: false 
    };
  }

  // PASS
  if (card.new) {
    interval = quality === 4 ? 3 : 1; // Easy → 3d, Good/Hard → 1d
    reps = 1;
  } else {
    ease = Math.max(1.3, ease + (quality === 4 ? 0.15 : quality === 3 ? 0 : -0.05));
    if (reps === 0) {
      interval = 1;
      reps = 1;
    } else {
      interval = Math.round(interval * ease);
      reps += 1;
    }
  }
  const next = now + interval * 24 * 60 * 60 * 1000;
  return { ...card, ease, interval, reps, next, new: false };
}

/* ──────────────────────────────────────────────────────────────────────────
   Persistence
   ──────────────────────────────────────────────────────────────────────── */
const LS_KEY = "minka_flashcards_v1";

function loadCards(): Card[] | null {
  try { 
    const raw = localStorage.getItem(LS_KEY); 
    if (!raw) return null;
    
    const data = JSON.parse(raw);
    
    // Check if it's the new UserFlashcard format
    if (Array.isArray(data) && data.length > 0 && data[0].clozeSentence !== undefined) {
      // Convert UserFlashcard format to Card format
      const cards: Card[] = [];
      for (const userCard of data) {
        cards.push(...convertUserFlashcardToCard(userCard));
      }
      return cards;
    }
    
    // Legacy format
    return data;
  }
  catch { return null; }
}
function saveCards(cards: Card[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(cards)); } catch {}
}

/* ──────────────────────────────────────────────────────────────────────────
   Session builder: prioritize newly clicked words → due cards → other new
   ──────────────────────────────────────────────────────────────────────── */
function buildQueue(cards: Card[], dailyNew = 8, dueLimit = 40): Card[] {
  const now = Date.now();
  
  // 1. NEWLY CLICKED WORDS (just added, never reviewed) - HIGHEST PRIORITY
  // These are cards that are new (never reviewed) and due now (or very recently)
  // Newly clicked words have: new=true, reps=0, next <= now (or within last 2 hours)
  const twoHoursAgo = now - (2 * 60 * 60 * 1000);
  const newlyClicked = cards.filter(c => 
    c.new && 
    c.reps === 0 &&
    c.next <= now &&
    c.next >= twoHoursAgo // Created within last 2 hours
  );
  
  // 2. DUE CARDS (scheduled reviews) - SECOND PRIORITY
  const due = cards.filter(c => c.next <= now && !c.new).slice(0, dueLimit);
  
  // 3. OTHER NEW CARDS (if any remaining slots)
  const usedSlots = newlyClicked.length + due.length;
  const remaining = dailyNew - usedSlots;
  const otherNew = cards.filter(c => 
    c.new && 
    !newlyClicked.includes(c)
  ).slice(0, remaining < 0 ? 0 : remaining);
  
  // Return: newly clicked first, then due, then other new
  return [...newlyClicked, ...due, ...otherNew];
}

/* ──────────────────────────────────────────────────────────────────────────
   Page Component
   ──────────────────────────────────────────────────────────────────────── */
export default function FlashcardsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  
  // Initialize state with empty arrays to avoid hydration mismatch
  const [cards, setCards] = useState<Card[]>([]);
  const [queue, setQueue] = useState<Card[]>([]);
  const [idx, setIdx] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [input, setInput] = useState("");
  const [sessionStats, setSessionStats] = useState<{
    studied: Card[];
    correct: number;
    incorrect: number;
  }>({ studied: [], correct: 0, incorrect: 0 });
  const [showSummary, setShowSummary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load cards after component mounts (client-side only)
  useEffect(() => {
    async function loadAllCards() {
      try {
        // Wait for auth to be ready
        const { getAuth, onAuthStateChanged } = await import('firebase/auth');
        const { getUserFlashcards } = await import('@/lib/db/flashcards');
        const { getFlashcardSRS } = await import('@/lib/db/flashcards');
        const auth = getAuth();
        
        // Wait for auth state to be determined
        const currentUser = await new Promise((resolve) => {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
          });
          // If auth is already ready, resolve immediately
          if (auth.currentUser) {
            unsubscribe();
            resolve(auth.currentUser);
          }
        });
        
        let allCards: Card[] = [];
        
        if (currentUser) {
          try {
            // Load from Firestore
            console.log('[Flashcard Page] Loading flashcards for user:', currentUser.uid);
            const firestoreCards = await getUserFlashcards(currentUser.uid);
            console.log('[Flashcard Page] Loaded', firestoreCards.length, 'flashcards from Firestore');
            
            for (const fc of firestoreCards) {
              try {
                // Skip inactive cards
                if (fc.isActive === false) continue;
                
                // Validate flashcard has required text
                const frontText = (fc.frontText || fc.front || '').toString().trim();
                const backText = (fc.backText || fc.back || '').toString().trim();
                if (!frontText || !backText) {
                  console.warn(`Skipping flashcard ${fc.id} - missing frontText or backText`);
                  continue;
                }
                
                let srs = await getFlashcardSRS(auth.currentUser!.uid, fc.id);
                
                // Create default SRS if missing (for backward compatibility)
                if (!srs) {
                  try {
                    const { getDefaultSRS } = await import('@/lib/srs-scheduler');
                    const { doc, setDoc, Timestamp } = await import('firebase/firestore');
                    const { db } = await import('@/lib/firebase');
                    const defaultSRS = getDefaultSRS();
                    const srsRef = doc(db, 'users', auth.currentUser!.uid, 'flashcards', fc.id, 'srs', 'data');
                    await setDoc(srsRef, {
                      flashcardId: fc.id,
                      dueAt: Timestamp.fromDate(defaultSRS.dueAt),
                      intervalDays: defaultSRS.intervalDays,
                      easeFactor: defaultSRS.easeFactor,
                      repetitions: defaultSRS.repetitions,
                      lastReviewedAt: null,
                      lastTypeAAt: null,
                      lastTypeBAt: null,
                    });
                    srs = await getFlashcardSRS(auth.currentUser!.uid, fc.id);
                  } catch (srsErr) {
                    console.warn(`Failed to create SRS for flashcard ${fc.id}:`, srsErr);
                  }
                }
                
                const now = Date.now();
                const dueAt = srs?.dueAt?.getTime() || now;
                const isNew = (srs?.repetitions || 0) === 0;
                const contextSentence = (fc.contextSentence || fc.exampleSentence || '').toString().trim();
                
                // Convert Firestore flashcard to Card format (2 cards: de-en and en-de)
                // German → English
                allCards.push({
                  id: `${fc.id}:de-en`,
                  wordId: fc.id,
                  dir: "de-en",
                  prompt: frontText,
                  answer: backText,
                  cloze: contextSentence ? cloze(contextSentence, frontText) : '',
                  next: dueAt,
                  interval: srs?.intervalDays || 0,
                  ease: srs?.easeFactor || 2.5,
                  reps: srs?.repetitions || 0,
                  lapses: 0,
                  new: isNew,
                });
                
                // English → German
                allCards.push({
                  id: `${fc.id}:en-de`,
                  wordId: fc.id,
                  dir: "en-de",
                  prompt: backText,
                  answer: frontText,
                  cloze: contextSentence ? cloze(contextSentence, frontText) : '',
                  next: dueAt,
                  interval: srs?.intervalDays || 0,
                  ease: srs?.easeFactor || 2.5,
                  reps: srs?.repetitions || 0,
                  lapses: 0,
                  new: isNew,
                });
              } catch (err) {
                console.warn('Error loading flashcard:', fc.id, err);
                // Continue with next card instead of breaking
              }
            }
          } catch (err) {
            console.warn('Error loading from Firestore, falling back to localStorage:', err);
          }
        }
        
        // Fallback to localStorage if Firestore didn't work or user not logged in
        if (allCards.length === 0) {
          console.log('[Flashcard Page] No Firestore cards, trying localStorage...');
          const localCards = loadCards() ?? [];
          console.log('[Flashcard Page] Loaded', localCards.length, 'cards from localStorage');
          allCards = localCards;
        }
        
        console.log('[Flashcard Page] Total cards loaded:', allCards.length);
        console.log('[Flashcard Page] Building queue...');
        const queue = buildQueue(allCards);
        console.log('[Flashcard Page] Queue built with', queue.length, 'cards');
        
        setCards(allCards);
        setQueue(queue);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading flashcards:', error);
        // Fallback to localStorage
        const loadedCards = loadCards() ?? [];
        setCards(loadedCards);
        setQueue(buildQueue(loadedCards));
        setIsLoading(false);
      }
    }
    
    loadAllCards();
  }, []);

  // recompute queue if deck changed
  useEffect(() => { 
    if (cards.length > 0) {
      saveCards(cards);
      // Also sync to Firestore if user is logged in
      syncCardsToFirestore(cards).catch(err => {
        console.warn('Failed to sync cards to Firestore:', err);
      });
      setQueue(buildQueue(cards)); 
      setIdx(0);
    }
  }, [cards]);
  
  // Helper function to sync cards to Firestore (called when cards are updated)
  async function syncCardsToFirestore(cardsToSync: Card[]) {
    // Cards are saved to localStorage immediately
    // Firestore sync happens when user reviews cards (via reviewFlashcard function)
    // This is just a placeholder for future sync if needed
  }
  
  const stats = useMemo(() => {
    const now = Date.now();
    const due = cards.filter(c => !c.new && c.next <= now).length;
    const newCount = cards.filter(c => c.new).length;
    const learned = cards.filter(c => !c.new && c.reps >= 3).length;
    return { due, newCount, learned, total: cards.length };
  }, [cards]);

  const current = queue[idx];
  
  // Calculate correctness early for use in useEffect
  const correct = current && input ? fuzzyMatch(input, current.answer) : false;

  // Auto-grade when answer is revealed based on correctness
  useEffect(() => {
    if (!reveal || !current) return;

    // Auto-grade after 1 second
    const timer = setTimeout(() => {
      // Determine quality based on correctness
      const quality: 0 | 3 = correct ? 3 : 0;
      grade(quality);
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reveal, current, correct]);

  // Define grade function
  function grade(quality: 0 | 2 | 3 | 4) {
    if (!current) return;
    
    // Update the card using the schedule function to set next review time
    const updated = schedule(current, quality);
    const newDeck = cards.map(c => (c.id === updated.id ? updated : c));
    setCards(newDeck);
    saveCards(newDeck);
    
    // Track session stats - ALWAYS track, regardless of update success
    setSessionStats(prev => ({
      studied: [...prev.studied, current],
      correct: quality >= 2 ? prev.correct + 1 : prev.correct,
      incorrect: quality < 2 ? prev.incorrect + 1 : prev.incorrect
    }));
    
    // Award XP and update quests
    if (quality >= 2) {
      // Correct answer
      LevelSystem.addXP(XP_REWARDS.REVIEW_FLASHCARD_CORRECT, t.success.flashcardReviewed);
    } else {
      // Incorrect answer
      LevelSystem.addXP(XP_REWARDS.REVIEW_FLASHCARD_WRONG, t.success.flashcardAttempt);
    }
    DailyQuestSystem.updateQuest('review_flashcards', 1);
    
    // advance within this session queue
    if (idx < queue.length - 1) {
      setIdx(idx + 1);
      setReveal(false);
      setInput("");
    } else {
      // Session complete - show summary
      setShowSummary(true);
    }
  }

  function check() {
    if (!current) return;
    setReveal(true);
  }

  // Show summary after completing session
  if (showSummary) {
    return (
      <Shell>
        <Header onBack={() => router.push('/dashboard')} />  {/* Normally, we are connected here. If really not, redirect to auth/login */}
        <SessionSummary 
          stats={sessionStats}
          onContinue={() => {
            setShowSummary(false);
            setSessionStats({ studied: [], correct: 0, incorrect: 0 });
            setQueue(buildQueue(cards));
            setIdx(0);
          }}
          onFinish={() => router.push('/')}
        />
      </Shell>
    );
  }

  if (!current) {
    return (
      <Shell>
        <Header onBack={() => router.push('/')} />
        <EmptyState 
          stats={stats} 
          hasCards={cards.length > 0}
          onStart={() => {
            setQueue(buildQueue(cards));
            setIdx(0);
          }}
          onImport={() => {
            // Import all vocabulary for testing
            const newCards = makeCards(ALL_VOCABULARY);
            setCards(newCards);
            saveCards(newCards);
          }}
        />
      </Shell>
    );
  }

  const progress = queue.length > 0 ? Math.round(((idx + 1) / queue.length) * 100) : 0;

  return (
    <Shell>
      <Header onBack={() => router.push('/dashboard')} />  {/* Normally, we are connected here. If really not, redirect to auth/login */}
      <main role="main" aria-label={t.flashcardStudy.studySession}>
        
        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto px-6 mb-4"
        >
        <div className="bg-white/60 backdrop-blur rounded-full h-3 border border-white shadow-sm overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-[#BCA6FF] via-[#9AD8BA] to-[#7B6AF5] rounded-full"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${t.flashcardStudy.progress}: ${progress}% complete`}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-sm">
          <span className="text-[#6A7A6A] font-medium">
            {t.flashcardStudy.card} {idx + 1} {t.flashcardStudy.of} {queue.length}
          </span>
          <span className="text-[#4D3C94] font-bold">
            {progress}% {t.common.continue}
          </span>
        </div>
      </motion.div>
      
      {/* Deck meta row */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-6 mb-6 grid sm:grid-cols-4 gap-3 text-sm"
      >
        <Chip icon={<Calendar className="h-4 w-4" />} title={t.flashcardStudy.due} value={stats.due} color="from-[#CBB8FF] to-[#9AD8BA]" />
        <Chip icon={<Sparkles className="h-4 w-4" />} title={t.flashcardStudy.new} value={stats.newCount} color="from-[#9AD8BA] to-[#CBB8FF]" />
        <Chip icon={<Brain className="h-4 w-4" />} title={t.flashcardStudy.learned} value={stats.learned} color="from-[#FFD7BF] to-[#F1ECFF]" />
        <Chip icon={<BookOpen className="h-4 w-4" />} title={t.flashcardStudy.total} value={stats.total} color="from-[#F1ECFF] to-[#FFD7BF]" />
      </motion.div>

      {/* Card */}
      <motion.div 
        key={current.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto px-6"
      >
        <div className="rounded-3xl bg-white/80 backdrop-blur border border-white shadow-[0_20px_60px_rgba(20,12,60,.08)] p-8">
          <div className="mb-4 flex items-center justify-between text-xs text-[#7E7A95]">
            <span>{idx + 1} / {queue.length}</span>
            <span className={`px-3 py-1 rounded-full font-medium ${
              current.dir === "de-en" 
                ? "bg-[#E7F7E8] text-[#265E40]" 
                : "bg-[#F1ECFF] text-[#4D3C94]"
            }`}>
              {current.dir === "de-en" ? "🇩🇪 → 🇬🇧" : "🇬🇧 → 🇩🇪"}
            </span>
          </div>

          <div className="mb-2 text-sm text-[#6A7A6A] font-medium">
            {current.dir === "de-en" 
              ? t.flashcardStudy.whatsTheMeaning 
              : t.flashcardStudy.translateToGerman}
          </div>
          <h2 className="text-3xl font-extrabold mb-1 text-[#2E3A28]">
            {current.dir === "de-en" && current.wordType === "noun" && current.article
              ? `${current.article} ${current.prompt}`
              : current.prompt}
          </h2>
          {current.wordType === "noun" && current.plural && (
            <div className="mb-3 text-sm text-[#7E7A95]">
              <span className="font-medium">{t.flashcardStudy.plural}</span> {current.plural}
            </div>
          )}

           <div id="example-sentence" className="mb-6 p-4 rounded-xl bg-gradient-to-br from-[#F7F5FF] to-[#FFF9F3] border border-[#E1D9FF]">
             <div className="text-xs text-[#7E7A95] mb-1 font-medium">{t.flashcardStudy.example}</div>
             <p className="text-[#2E3A28] text-lg leading-7 font-medium">
               {current.dir === "de-en" ? (
                 // For German → English: Show full sentence with German word highlighted
                 <>
                   {current.cloze.split("___").map((part, i, arr) => (
                     <React.Fragment key={i}>
                       {part}
                       {i < arr.length - 1 && (
                         <span className="font-extrabold text-[#7B6AF5] bg-[#EDEAFF] px-2 py-0.5 rounded">
                           {current.prompt}
                         </span>
                       )}
                     </React.Fragment>
                   ))}
                 </>
               ) : (
                 // For English → German: Show cloze (fill in the blank)
                 current.cloze
               )}
             </p>
           </div>

           {!reveal ? (
             <div className="flex flex-col sm:flex-row gap-3">
               <input
                 autoFocus
                 value={input}
                 onChange={e => setInput(e.target.value)}
                 onKeyDown={e => {
                   if (e.key === 'Enter') {
                     e.preventDefault();
                     e.stopPropagation(); // Prevent event from bubbling to window listener
                     check();
                     // Blur input so second Enter can trigger grade
                     setTimeout(() => {
                       (e.target as HTMLInputElement).blur();
                     }, 50);
                   }
                 }}
                 placeholder={current.dir === "de-en" 
                   ? t.flashcardStudy.typeEnglishMeaning 
                   : t.flashcardStudy.typeGermanWord}
                 className="flex-1 rounded-xl border-2 border-[#EEE7FF] bg-white px-4 py-3 outline-none focus:border-[#BCA6FF] focus:ring-4 focus:ring-[#EDEAFF] transition-all text-lg"
                 aria-label={`Type the ${current.dir === "de-en" ? "English" : "German"} translation for ${current.prompt}`}
                 aria-describedby="example-sentence"
               />
               <button
                 onClick={check}
                 className="rounded-xl px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all bg-gradient-to-b from-[#BCA6FF] to-[#7B6AF5] hover:from-[#A794FF] hover:to-[#6A59E4]"
               >
                 {t.flashcardStudy.check}
               </button>
             </div>
           ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border-2 px-5 py-4 ${
                correct 
                  ? 'bg-[#E7F7E8] border-[#9AD8BA] text-[#265E40]'
                  : 'bg-[#FFF9F3] border-[#FFD7BF] text-[#7C4B14]'
              }`}
            >
              <div className="text-sm opacity-80 font-medium">Correct answer:</div>
              <div className="text-xl font-extrabold mt-1">
                {current.dir === "en-de" && current.wordType === "noun" && current.article
                  ? `${current.article} ${current.answer}`
                  : current.answer}
              </div>
              {current.dir === "en-de" && current.wordType === "noun" && current.plural && (
                <div className="mt-1 text-sm opacity-90">
                  <span className="font-medium">{t.flashcardStudy.plural}</span> {current.plural}
                </div>
              )}
              <div className="mt-2 text-sm">
                {correct 
                  ? t.flashcardStudy.perfect 
                  : t.flashcardStudy.keepPracticing}
              </div>
              <div className="mt-3 text-xs opacity-70 italic">
                {correct ? "✓ Correct! Auto-advancing in 1 second..." : "✗ Incorrect. Auto-advancing in 1 second..."}
              </div>
            </motion.div>
          )}

           {/* Grade buttons - hidden with auto-grading enabled */}
           {false && reveal && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="mt-5"
             >
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                 <GradeBtn label={t.flashcardStudy.again} sub={t.flashcardStudy.oneHour} onClick={() => grade(0)} className="bg-[#FFE9E1] text-[#B84F2D] hover:bg-[#FFD7CE]" />
                 <GradeBtn label={t.flashcardStudy.hard} sub={t.flashcardStudy.oneDay} onClick={() => grade(2)} className="bg-[#FFF2DC] text-[#7C4B14] hover:bg-[#FFE9C8]" />
                 <GradeBtn label={t.flashcardStudy.good} sub={t.flashcardStudy.twoToFourDays} onClick={() => grade(3)} className="bg-[#E7F7E8] text-[#265E40] hover:bg-[#D4F0D6] ring-2 ring-[#9AD8BA] ring-offset-2" />
                 <GradeBtn label={t.flashcardStudy.easy} sub={t.flashcardStudy.oneWeek} onClick={() => grade(4)} className="bg-[#F1ECFF] text-[#4D3C94] hover:bg-[#E5DEFF]" />
               </div>
               <div className="mt-3 text-center text-xs text-[#6A7A6A]">
                 {t.flashcardStudy.pressEnterAgain}
               </div>
             </motion.div>
           )}
         </div>
       </motion.div>
       </main>
     </Shell>
   );
 }

/* ──────────────────────────────────────────────────────────────────────────
   Small pieces
   ──────────────────────────────────────────────────────────────────────── */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-[#2E3A28] bg-[radial-gradient(1000px_500px_at_10%_-10%,#E7F7E8_0%,transparent_60%),radial-gradient(900px_420px_at_90%_-10%,#F1ECFF_0%,transparent_60%),linear-gradient(180deg,#FFF9F3_0%,#FDFBFF_100%)]">
      {children}
    </div>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <header className="max-w-5xl mx-auto px-6 pt-10 pb-8">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-[#6A7A6A] hover:text-[#2E3A28] transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="font-medium">Back to Home</span>
      </button>
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#2E3A28]">
          Flashcards 🃏
        </h1>
        <p className="text-[#6A7A6A] mt-3 text-lg">
          Bidirectional practice (DE↔EN) with context-appropriate instructions and spaced repetition.
        </p>
      </div>
    </header>
  );
}

function Chip({ icon, title, value, color }:{ icon: React.ReactNode; title:string; value:number; color:string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`rounded-xl p-4 text-center bg-gradient-to-br ${color} shadow-[0_8px_20px_rgba(20,12,60,.06)]`}
    >
      <div className="flex items-center justify-center gap-1 text-xs text-[#2E3A28]/70 mb-1">
        {icon}
        <span>{title}</span>
      </div>
      <div className="text-2xl font-extrabold text-[#2E3A28]">{value}</div>
    </motion.div>
  );
}

function GradeBtn({ label, sub, className, onClick }:{
  label: string; sub: string; className?: string; onClick: ()=>void;
}) {
  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`rounded-xl px-4 py-3 font-semibold shadow-md hover:shadow-lg transition-all ${className}`}
      aria-label={`Grade as ${label.toLowerCase()} - next review in ${sub}`}
    >
      <div className="font-bold">{label}</div>
      <div className="text-xs opacity-70 mt-0.5">{sub}</div>
    </motion.button>
  );
}

function EmptyState({ stats, hasCards, onStart, onImport }:{ 
  stats:{due:number; newCount:number; learned:number; total:number}; 
  hasCards: boolean;
  onStart:()=>void;
  onImport:()=>void;
}) {
  if (!hasCards) {
    // New user with no flashcards yet
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center px-6 py-20"
      >
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-3xl font-bold text-[#2E3A28] mb-3">Welcome to Flashcards!</h2>
        <p className="text-lg text-[#6A7A6A] mb-6">
          You don&pos;t have any flashcards yet. Complete story lessons to add vocabulary cards automatically!
        </p>
        
        <div className="bg-white/60 backdrop-blur border border-white shadow-lg rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-[#2E3A28] mb-3">How it works:</h3>
          <div className="text-left space-y-2 text-[#6E6A80]">
            <div className="flex items-start gap-2">
              <span className="text-lg">1️⃣</span>
              <span>Complete a story lesson in the Village</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">2️⃣</span>
              <span>Vocabulary from the lesson is added here</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">3️⃣</span>
              <span>Review cards with spaced repetition</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">4️⃣</span>
              <span>Master German naturally! 🇩🇪</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={() => window.location.href = '/'}
            className="rounded-xl px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all bg-gradient-to-b from-[#BCA6FF] to-[#7B6AF5] hover:from-[#A794FF] hover:to-[#6A59E4]"
          >
            Go to Village →
          </button>
          <button 
            onClick={onImport}
            className="rounded-xl px-6 py-3 font-semibold border-2 border-[#BCA6FF] text-[#7B6AF5] hover:bg-[#F1ECFF] transition-all"
          >
            Import All Vocabulary (Test)
          </button>
        </div>
      </motion.div>
    );
  }
  
  // Has cards but none due
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto text-center px-6 py-20"
    >
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold text-[#2E3A28] mb-2">All caught up!</h2>
      <p className="text-lg text-[#6A7A6A]">No cards due right now.</p>
      <div className="mt-6 p-4 rounded-xl bg-white/60 backdrop-blur border border-white shadow-lg inline-block">
        <div className="text-sm text-[#6E6A80] space-y-1">
          <div>📚 <strong>{stats.newCount}</strong> new cards available</div>
          <div>🧠 <strong>{stats.learned}</strong> / {stats.total} learned</div>
        </div>
      </div>
      {stats.newCount > 0 && (
        <button 
          onClick={onStart}
          className="mt-8 rounded-xl px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all bg-gradient-to-b from-[#BCA6FF] to-[#7B6AF5] hover:from-[#A794FF] hover:to-[#6A59E4]"
        >
          Study new cards →
        </button>
      )}
    </motion.div>
  );
}

function SessionSummary({ stats, onContinue, onFinish }: {
  stats: { studied: Card[]; correct: number; incorrect: number };
  onContinue: () => void;
  onFinish: () => void;
}) {
  const totalStudied = stats.studied.length;
  const accuracy = totalStudied > 0 ? Math.round((stats.correct / totalStudied) * 100) : 0;
  
  // Group by next review time
  const now = Date.now();
  const reviewSchedule = stats.studied.reduce((acc, card) => {
    const hoursUntil = Math.round((card.next - now) / (1000 * 60 * 60));
    const key = hoursUntil < 24 
      ? `${hoursUntil}h` 
      : `${Math.round(hoursUntil / 24)}d`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(card);
    return acc;
  }, {} as Record<string, Card[]>);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto px-6 py-10"
    >
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">✨</div>
        <h2 className="text-3xl font-bold text-[#2E3A28] mb-2">Session Complete!</h2>
        <p className="text-lg text-[#6A7A6A]">Great work on your German practice!</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[#E7F7E8] to-[#D4F0D6] rounded-2xl p-6 text-center">
          <div className="text-3xl font-extrabold text-[#265E40]">{totalStudied}</div>
          <div className="text-sm text-[#6A7A6A] mt-1">Cards Studied</div>
        </div>
        <div className="bg-gradient-to-br from-[#F1ECFF] to-[#E5DEFF] rounded-2xl p-6 text-center">
          <div className="text-3xl font-extrabold text-[#4D3C94]">{accuracy}%</div>
          <div className="text-sm text-[#6A7A6A] mt-1">Accuracy</div>
        </div>
        <div className="bg-gradient-to-br from-[#FFE9E1] to-[#FFD7CE] rounded-2xl p-6 text-center">
          <div className="text-3xl font-extrabold text-[#B84F2D]">{stats.incorrect}</div>
          <div className="text-sm text-[#6A7A6A] mt-1">To Review</div>
        </div>
      </div>
      
      {/* Review Schedule */}
      <div className="bg-white/80 backdrop-blur rounded-2xl border border-white shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-[#2E3A28] mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Review Schedule
        </h3>
        <div className="space-y-3">
          {Object.entries(reviewSchedule)
            .sort(([a], [b]) => {
              const aVal = parseInt(a);
              const bVal = parseInt(b);
              return aVal - bVal;
            })
            .map(([time, cards]) => (
              <div key={time} className="flex items-center justify-between p-3 rounded-xl bg-[#F7F5FF]">
                <div>
                  <span className="font-semibold text-[#2E3A28]">In {time}</span>
                  <span className="text-sm text-[#6A7A6A] ml-2">
                    ({cards.length} card{cards.length !== 1 ? 's' : ''})
                  </span>
                </div>
                <div className="flex gap-1">
                  {cards.slice(0, 5).map(card => (
                    <span key={card.id} className="text-xs px-2 py-1 rounded bg-white text-[#6A7A6A]">
                      {card.prompt.slice(0, 10)}...
                    </span>
                  ))}
                  {cards.length > 5 && (
                    <span className="text-xs px-2 py-1 rounded bg-white text-[#6A7A6A]">
                      +{cards.length - 5}
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button 
          onClick={onContinue}
          className="flex-1 rounded-xl px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all bg-gradient-to-b from-[#BCA6FF] to-[#7B6AF5] hover:from-[#A794FF] hover:to-[#6A59E4]"
        >
          Continue Studying →
        </button>
        <button 
          onClick={onFinish}
          className="flex-1 rounded-xl px-6 py-3 font-semibold border-2 border-[#BCA6FF] text-[#7B6AF5] hover:bg-[#F1ECFF] transition-all"
        >
          Finish for Now
        </button>
      </div>
    </motion.div>
  );
}

