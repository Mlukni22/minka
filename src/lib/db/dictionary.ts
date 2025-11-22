import { collection, doc, getDoc, setDoc, serverTimestamp, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { DictionaryCache, VerbForms } from '@/types/dictionary';

const getDb = () => {
  if (!db) throw new Error('Firestore not initialized');
  return db;
};

/**
 * Get cached dictionary entry
 */
export async function getCachedDictionaryEntry(word: string): Promise<DictionaryCache | null> {
  try {
    const normalizedWord = word.trim().toLowerCase();
    const cacheRef = collection(getDb(), 'dictionary_cache');
    const q = query(cacheRef, where('word', '==', normalizedWord));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      word: data.word,
      translation: data.translation,
      isVerb: data.isVerb || false,
      verbForms: data.verbForms || undefined,
      examples: data.examples || undefined,
      lastFetchedAt: data.lastFetchedAt?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as DictionaryCache;
  } catch (error) {
    console.error('Error getting cached dictionary entry:', error);
    return null;
  }
}

/**
 * Save dictionary entry to cache
 */
export async function saveDictionaryEntry(
  word: string,
  translation: string,
  isVerb: boolean,
  verbForms?: VerbForms,
  examples?: string[]
): Promise<void> {
  try {
    const normalizedWord = word.trim().toLowerCase();
    
    // Check if entry already exists
    const existing = await getCachedDictionaryEntry(word);
    
    const cacheData: any = {
      word: normalizedWord,
      translation: translation.trim(),
      isVerb,
      lastFetchedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    if (verbForms) {
      cacheData.verbForms = verbForms;
    }
    
    if (examples && examples.length > 0) {
      cacheData.examples = examples;
    }
    
    if (existing) {
      // Update existing entry
      const cacheRef = doc(getDb(), 'dictionary_cache', existing.id);
      await setDoc(cacheRef, cacheData, { merge: true });
    } else {
      // Create new entry
      const cacheRef = collection(getDb(), 'dictionary_cache');
      const newDocRef = doc(cacheRef);
      await setDoc(newDocRef, {
        ...cacheData,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error saving dictionary entry:', error);
    throw error;
  }
}

/**
 * Check if cache entry is still valid (within 90 days)
 */
export function isCacheValid(entry: DictionaryCache): boolean {
  const now = new Date();
  const daysSinceFetch = (now.getTime() - entry.lastFetchedAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceFetch < 90;
}

