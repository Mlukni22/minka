import { collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc, serverTimestamp, Timestamp, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '../firebase';
import { Flashcard, FlashcardSRS, FlashcardReview, FlashcardPreferences, FlashcardRatingNumber } from '@/types/flashcard';
import { updateSRS, getDefaultSRS } from '../srs-scheduler';
import { FlashcardRating } from '@/types/flashcard';

const getDb = () => {
  if (!db) throw new Error('Firestore not initialized');
  return db;
};

/**
 * Get all flashcards for a user
 */
export async function getUserFlashcards(userId: string): Promise<Flashcard[]> {
  try {
    if (!userId) {
      console.warn('[Flashcard DB] getUserFlashcards: userId is required');
      return [];
    }
    
    // Verify authentication
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    console.log('[Flashcard DB] Getting flashcards for user:', userId);
    console.log('[Flashcard DB] Current authenticated user:', currentUser?.uid || 'NOT AUTHENTICATED');
    console.log('[Flashcard DB] User IDs match:', currentUser?.uid === userId);
    
    if (!currentUser) {
      console.error('[Flashcard DB] User is not authenticated! Cannot access flashcards.');
      return [];
    }
    
    if (currentUser.uid !== userId) {
      console.error('[Flashcard DB] User ID mismatch! Requested:', userId, 'Authenticated:', currentUser.uid);
      return [];
    }
    
    const flashcardsRef = collection(getDb(), 'users', userId, 'flashcards');
    console.log('[Flashcard DB] Collection path: users/', userId, '/flashcards');
    const snapshot = await getDocs(flashcardsRef);
    
    console.log('[Flashcard DB] Found', snapshot.size, 'flashcard documents');
    
    const flashcards = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Ensure every flashcard has an example sentence
      let contextSentence = (data.contextSentence || data.exampleSentence || '').toString().trim();
      const frontText = (data.frontText || data.front || '').toString().trim();
      if (!contextSentence && frontText) {
        // Create a simple example sentence if none exists
        const wordWithoutArticle = frontText.replace(/^(der|die|das|ein|eine|dem|den|des|deren|dessen)\s+/i, '').trim() || frontText;
        contextSentence = `Hier ist ${wordWithoutArticle}.`;
      }
      
      console.log('[Flashcard DB] Flashcard:', doc.id, {
        frontText: frontText || '(empty)',
        backText: data.backText || data.back || '(empty)',
        contextSentence: contextSentence || '(empty)',
        isActive: data.isActive,
      });
      return {
        id: doc.id,
        ...data,
        contextSentence: contextSentence,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Flashcard;
    });
    
    console.log('[Flashcard DB] Returning', flashcards.length, 'flashcards');
    return flashcards;
  } catch (error: any) {
    // Check if it's a permission error
    if (error?.code === 'permission-denied') {
      console.error('[Flashcard DB] Permission denied getting flashcards. Make sure Firestore rules are deployed and user is authenticated.');
      console.error('[Flashcard DB] User ID:', userId);
      console.error('[Flashcard DB] Error details:', error);
    } else {
      console.error('[Flashcard DB] Error getting user flashcards:', error);
    }
    return [];
  }
}

/**
 * Get flashcards due for review
 */
export async function getDueFlashcards(userId: string, limit: number = 20): Promise<Flashcard[]> {
  try {
    const flashcards = await getUserFlashcards(userId);
    const now = new Date();
    const dueFlashcards: Flashcard[] = [];
    
    for (const flashcard of flashcards) {
      const srs = await getFlashcardSRS(userId, flashcard.id);
      if (srs && srs.dueAt <= now) {
        dueFlashcards.push(flashcard);
        if (dueFlashcards.length >= limit) break;
      }
    }
    
    return dueFlashcards;
  } catch (error) {
    console.error('Error getting due flashcards:', error);
    return [];
  }
}

/**
 * Get SRS data for a flashcard
 */
export async function getFlashcardSRS(userId: string, flashcardId: string): Promise<FlashcardSRS | null> {
  try {
    const srsRef = doc(getDb(), 'users', userId, 'flashcards', flashcardId, 'srs', 'data');
    const srsDoc = await getDoc(srsRef);
    
    if (srsDoc.exists()) {
      const data = srsDoc.data();
      return {
        id: srsDoc.id,
        flashcardId: data.flashcardId,
        dueAt: data.dueAt?.toDate() || new Date(),
        intervalDays: data.intervalDays || 1,
        easeFactor: data.easeFactor || 2.5,
        repetitions: data.repetitions || 0,
        lastReviewedAt: data.lastReviewedAt?.toDate() || null,
        lastTypeAAt: data.lastTypeAAt?.toDate() || null,
        lastTypeBAt: data.lastTypeBAt?.toDate() || null,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting flashcard SRS:', error);
    return null;
  }
}

/**
 * Create a flashcard
 */
export async function createFlashcard(
  userId: string,
  wordId: string,
  front: string,
  back: string,
  exampleSentence?: string
): Promise<string> {
  try {
    const flashcardsRef = collection(getDb(), 'users', userId, 'flashcards');
    const newFlashcardRef = doc(flashcardsRef);
    
    await setDoc(newFlashcardRef, {
      userId,
      wordId,
      front,
      back,
      exampleSentence: exampleSentence || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Create default SRS data
    const defaultSRS = getDefaultSRS();
    const srsRef = doc(getDb(), 'users', userId, 'flashcards', newFlashcardRef.id, 'srs', 'data');
    await setDoc(srsRef, {
      flashcardId: newFlashcardRef.id,
      ...defaultSRS,
      lastReviewedAt: null,
    });
    
    return newFlashcardRef.id;
  } catch (error) {
    console.error('Error creating flashcard:', error);
    throw error;
  }
}

/**
 * Rate a flashcard (update SRS) - legacy function for backward compatibility
 */
export async function rateFlashcard(
  userId: string,
  flashcardId: string,
  rating: FlashcardRating
): Promise<void> {
  try {
    const srs = await getFlashcardSRS(userId, flashcardId);
    if (!srs) {
      throw new Error('SRS data not found for flashcard');
    }
    
    // Convert string rating to number
    const ratingNumber: FlashcardRatingNumber = 
      rating === 'again' ? 0 : 
      rating === 'hard' ? 1 : 
      rating === 'good' ? 2 : 3;
    
    // Default to Type A for legacy calls
    await saveFlashcardReview(userId, flashcardId, ratingNumber, srs, 'A');
  } catch (error) {
    console.error('Error rating flashcard:', error);
    throw error;
  }
}

/**
 * Check if flashcard exists by wordId (legacy field)
 */
export async function flashcardExistsByWordId(userId: string, wordId: string): Promise<boolean> {
  try {
    const flashcardsRef = collection(getDb(), 'users', userId, 'flashcards');
    const q = query(flashcardsRef, where('wordId', '==', wordId));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking flashcard existence by wordId:', error);
    return false;
  }
}

/**
 * Add flashcard from StoryWord (wrapper for createFlashcard)
 */
export async function addFlashcard(userId: string, word: { id: string; phrase: string; translation: string; exampleSentence?: string }): Promise<string> {
  return createFlashcard(userId, word.id, word.phrase, word.translation, word.exampleSentence);
}

/**
 * Get flashcard by word ID
 */
export async function getFlashcardById(userId: string, wordId: string): Promise<Flashcard | null> {
  try {
    const flashcardsRef = collection(getDb(), 'users', userId, 'flashcards');
    const q = query(flashcardsRef, where('wordId', '==', wordId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Flashcard;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting flashcard by word ID:', error);
    return null;
  }
}

/**
 * Create a flashcard with full context (new extended model)
 */
export async function createFlashcardWithContext(
  userId: string,
  data: {
    languageCode: string;
    frontText: string;
    backText: string;
    contextSentence: string;
    contextTranslation?: string;
    storyId?: string;
    chapterId?: string;
    storyWordId?: string;
  }
): Promise<string> {
  try {
    const flashcardsRef = collection(getDb(), 'users', userId, 'flashcards');
    const newFlashcardRef = doc(flashcardsRef);
    
    // Trim and validate required fields
    const trimmedFrontText = (data.frontText || '').toString().trim();
    const trimmedBackText = (data.backText || '').toString().trim();
    
    // Validate that required fields are present and non-empty
    if (!trimmedFrontText || !trimmedBackText) {
      console.error('[Flashcard DB] Attempting to create flashcard with empty text:', {
        frontText: data.frontText,
        backText: data.backText,
        trimmedFrontText,
        trimmedBackText,
        data,
      });
      throw new Error(`Cannot create flashcard with empty frontText or backText. frontText: "${trimmedFrontText}", backText: "${trimmedBackText}"`);
    }
    
    // Helper function to create a simple example sentence if none exists
    const createExampleSentence = (word: string, translation: string): string => {
      // Remove article if present
      const wordWithoutArticle = word.replace(/^(der|die|das|ein|eine|dem|den|des|deren|dessen)\s+/i, '').trim() || word;
      // Create a simple sentence: "Das Wort ist [word]." or "Hier ist [word]."
      return `Hier ist ${wordWithoutArticle}.`;
    };
    
    // Ensure contextSentence contains the frontText (the clicked word)
    // If contextSentence doesn't contain frontText, create a proper example sentence
    let contextSentence = (data.contextSentence || '').toString().trim();
    
    // If no context sentence provided, create one
    if (!contextSentence) {
      contextSentence = createExampleSentence(trimmedFrontText, trimmedBackText);
      console.log('[Flashcard DB] No context sentence provided, created example:', contextSentence);
    }
    
    // Check if contextSentence contains the frontText (case-insensitive)
    const frontTextLower = trimmedFrontText.toLowerCase();
    const contextLower = contextSentence.toLowerCase();
    
    // Try to find the word with word boundaries (more accurate than simple includes)
    const escapedWord = frontTextLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const wordBoundaryRegex = new RegExp(`\\b${escapedWord}\\b`, 'i');
    const wordFound = wordBoundaryRegex.test(contextSentence);
    
    if (!wordFound) {
      // Word not found in sentence - create a proper example sentence
      console.warn('[Flashcard DB] Clicked word not found in context sentence, creating example:', {
        frontText: trimmedFrontText,
        contextSentence: contextSentence,
      });
      contextSentence = createExampleSentence(trimmedFrontText, trimmedBackText);
    }
    
    const flashcardData: any = {
      userId,
      languageCode: data.languageCode || 'de',
      frontText: trimmedFrontText,
      backText: trimmedBackText,
      contextSentence: contextSentence,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    // Only add optional fields if they exist
    if (data.contextTranslation) {
      flashcardData.contextTranslation = data.contextTranslation.toString().trim();
    }
    if (data.storyId) {
      flashcardData.storyId = data.storyId.toString();
    }
    if (data.chapterId) {
      flashcardData.chapterId = data.chapterId.toString();
    }
    if (data.storyWordId) {
      flashcardData.storyWordId = data.storyWordId.toString();
    }
    
    console.log('[Flashcard DB] Creating flashcard with data:', {
      id: newFlashcardRef.id,
      userId,
      frontText: flashcardData.frontText,
      backText: flashcardData.backText,
      contextSentence: flashcardData.contextSentence,
      storyId: flashcardData.storyId,
      chapterId: flashcardData.chapterId,
      storyWordId: flashcardData.storyWordId,
    });
    
    try {
      await setDoc(newFlashcardRef, flashcardData);
      console.log('[Flashcard DB] ✅ Successfully created flashcard:', newFlashcardRef.id);
      console.log('[Flashcard DB] Flashcard data:', {
        frontText: flashcardData.frontText,
        backText: flashcardData.backText,
        isActive: flashcardData.isActive,
      });
    } catch (error: any) {
      console.error('[Flashcard DB] ❌ Error saving flashcard to Firestore:', error);
      if (error?.code === 'permission-denied') {
        console.error('[Flashcard DB] Permission denied! Make sure Firestore rules are deployed.');
        console.error('[Flashcard DB] User ID:', userId);
      }
      console.error('[Flashcard DB] Flashcard data that failed:', {
        flashcardData,
        docId: newFlashcardRef.id,
      });
      throw error;
    }
    
    // Create default SRS data
    try {
      const defaultSRS = getDefaultSRS();
      const srsRef = doc(getDb(), 'users', userId, 'flashcards', newFlashcardRef.id, 'srs', 'data');
      await setDoc(srsRef, {
        flashcardId: newFlashcardRef.id,
        dueAt: Timestamp.fromDate(defaultSRS.dueAt),
        intervalDays: defaultSRS.intervalDays,
        easeFactor: defaultSRS.easeFactor,
        repetitions: defaultSRS.repetitions,
        lastReviewedAt: null,
        lastTypeAAt: null,
        lastTypeBAt: null,
      });
      console.log('[Flashcard DB] ✅ Successfully created SRS data for flashcard:', newFlashcardRef.id);
    } catch (srsError: any) {
      console.error('[Flashcard DB] ❌ Error creating SRS data:', srsError);
      if (srsError?.code === 'permission-denied') {
        console.error('[Flashcard DB] Permission denied creating SRS! Make sure Firestore rules are deployed.');
      }
      // Don't throw - flashcard was created, SRS can be created later
    }
    
    return newFlashcardRef.id;
  } catch (error) {
    console.error('Error creating flashcard with context:', error);
    throw error;
  }
}

/**
 * Check if flashcard exists for user and story word
 */
export async function flashcardExistsForStoryWord(userId: string, storyWordId: string): Promise<boolean> {
  try {
    const flashcardsRef = collection(getDb(), 'users', userId, 'flashcards');
    const q = query(flashcardsRef, where('storyWordId', '==', storyWordId));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking flashcard existence:', error);
    return false;
  }
}

/**
 * Check if flashcard exists for user by frontText (to prevent duplicates)
 */
export async function flashcardExistsByFrontText(userId: string, frontText: string): Promise<boolean> {
  try {
    const trimmedText = frontText.trim();
    const flashcardsRef = collection(getDb(), 'users', userId, 'flashcards');
    // Check exact match (case-sensitive)
    const q = query(flashcardsRef, where('frontText', '==', trimmedText));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return true;
    
    // Also check case-insensitive match by getting all and comparing
    const allSnapshot = await getDocs(flashcardsRef);
    for (const doc of allSnapshot.docs) {
      const data = doc.data();
      if (data.frontText && data.frontText.trim().toLowerCase() === trimmedText.toLowerCase()) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking flashcard existence by frontText:', error);
    return false;
  }
}

/**
 * Check if flashcard exists by wordId, storyWordId, or frontText
 */
export async function flashcardExists(
  userId: string, 
  wordId?: string, 
  storyWordId?: string, 
  frontText?: string
): Promise<boolean> {
  // First check by wordId if provided (legacy)
  if (wordId) {
    const existsByWordId = await flashcardExistsByWordId(userId, wordId);
    if (existsByWordId) return true;
  }
  
  // Then check by storyWordId if provided
  if (storyWordId) {
    const existsById = await flashcardExistsForStoryWord(userId, storyWordId);
    if (existsById) return true;
  }
  
  // Finally check by frontText if provided
  if (frontText) {
    const existsByText = await flashcardExistsByFrontText(userId, frontText);
    if (existsByText) return true;
  }
  
  return false;
}

/**
 * Determine which display type to use for a flashcard
 */
function determineDisplayType(srs: FlashcardSRS): 'A' | 'B' {
  // Get timestamps - they should already be Date objects from getFlashcardSRS
  const lastTypeAAt = srs.lastTypeAAt;
  const lastTypeBAt = srs.lastTypeBAt;
  
  // If card has never been reviewed (no timestamps), it's a new card - start with Type A
  if (!lastTypeAAt && !lastTypeBAt) {
    return 'A';
  }
  
  // Card has been reviewed - alternate based on which type was used last
  // If only lastTypeAAt exists (reviewed as Type A but not Type B yet), use Type B
  if (lastTypeAAt && !lastTypeBAt) {
    return 'B';
  }
  
  // If only lastTypeBAt exists (shouldn't happen normally, but handle it), use Type A
  if (lastTypeBAt && !lastTypeAAt) {
    return 'A';
  }
  
  // Both timestamps exist - alternate based on which was used more recently
  // Compare as Date objects (they should already be Date objects from getFlashcardSRS)
  if (lastTypeBAt && lastTypeAAt) {
    // If Type B was used more recently, show Type A next
    if (lastTypeBAt > lastTypeAAt) {
      return 'A';
    }
    // If Type A was used more recently (or they're equal), show Type B next
    return 'B';
  }
  
  // Fallback (shouldn't reach here)
  return 'A';
}

/**
 * Get flashcard queue (due cards + new cards) with display types
 */
export async function getFlashcardQueue(
  userId: string,
  options: {
    storyId?: string;
    limit?: number;
    maxNewCards?: number;
  } = {}
): Promise<Array<Flashcard & { displayType: 'A' | 'B'; srs: FlashcardSRS }>> {
  try {
    if (!userId) {
      console.warn('[Flashcard DB] getFlashcardQueue: userId is required');
      return [];
    }
    
    // Verify authentication (only works client-side)
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (currentUser && currentUser.uid !== userId) {
        console.error('[Flashcard DB] User ID mismatch in getFlashcardQueue. Requested:', userId, 'Authenticated:', currentUser.uid);
        return [];
      }
    } catch (authError) {
      // If auth check fails (e.g., server-side), continue anyway
      // Server-side calls will fail at Firestore level if rules don't allow
      console.warn('[Flashcard DB] Could not verify auth (might be server-side):', authError);
    }
    
    const { storyId, limit = 20, maxNewCards = 15 } = options;
    const now = new Date();
    
    // Get all active flashcards (or flashcards without isActive field, for backward compatibility)
    const flashcardsRef = collection(getDb(), 'users', userId, 'flashcards');
    let q = query(flashcardsRef);
    
    if (storyId) {
      q = query(flashcardsRef, where('storyId', '==', storyId));
    }
    
    console.log('[Flashcard DB] Querying flashcards for user:', userId);
    const snapshot = await getDocs(q);
    console.log('[Flashcard DB] Found', snapshot.size, 'flashcard documents in query');
    const cardsWithSRS: Array<{ card: Flashcard; srs: FlashcardSRS }> = [];
    
    // Get SRS data for each flashcard
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      
      // Skip inactive cards (default to active if field doesn't exist for backward compatibility)
      if (data.isActive === false) continue;
      
      // Skip if storyId filter is set and doesn't match
      if (storyId && data.storyId !== storyId) continue;
      
      let srs = await getFlashcardSRS(userId, docSnap.id);
      
      if (!srs) {
        // Create default SRS data if missing (for backward compatibility)
        console.log(`Creating missing SRS data for flashcard ${docSnap.id}`);
        const defaultSRS = getDefaultSRS();
        const srsRef = doc(getDb(), 'users', userId, 'flashcards', docSnap.id, 'srs', 'data');
        try {
          await setDoc(srsRef, {
            flashcardId: docSnap.id,
            dueAt: Timestamp.fromDate(defaultSRS.dueAt),
            intervalDays: defaultSRS.intervalDays,
            easeFactor: defaultSRS.easeFactor,
            repetitions: defaultSRS.repetitions,
            lastReviewedAt: null,
            lastTypeAAt: null,
            lastTypeBAt: null,
          });
          // Fetch the newly created SRS
          srs = await getFlashcardSRS(userId, docSnap.id);
          if (!srs) {
            console.warn(`Failed to create SRS data for flashcard ${docSnap.id}`);
            continue;
          }
        } catch (error) {
          console.error(`Error creating SRS data for flashcard ${docSnap.id}:`, error);
          continue;
        }
      }
      
      // Extract text fields with proper fallbacks
      const frontText = (data.frontText || data.front || '').toString().trim();
      const backText = (data.backText || data.back || '').toString().trim();
      let contextSentence = (data.contextSentence || data.exampleSentence || '').toString().trim();
      
      // Ensure every flashcard has an example sentence
      if (!contextSentence && frontText) {
        // Create a simple example sentence if none exists
        const wordWithoutArticle = frontText.replace(/^(der|die|das|ein|eine|dem|den|des|deren|dessen)\s+/i, '').trim() || frontText;
        contextSentence = `Hier ist ${wordWithoutArticle}.`;
        console.log('[Flashcard DB] Added missing example sentence for flashcard:', {
          id: docSnap.id,
          frontText,
          contextSentence,
        });
      }
      
      // Debug: Log raw Firestore data if empty
      if (!frontText || !backText) {
        console.error(`[Flashcard DB] Card ${docSnap.id} has empty text:`, {
          id: docSnap.id,
          dataKeys: Object.keys(data),
          rawFrontText: data.frontText,
          rawFront: data.front,
          rawBackText: data.backText,
          rawBack: data.back,
          processedFrontText: frontText,
          processedBackText: backText,
          allData: data,
        });
        // Skip cards with no text
        continue;
      }
      
      const flashcard: Flashcard = {
        id: docSnap.id,
        userId,
        languageCode: (data.languageCode || 'de').toString(),
        frontText,
        backText,
        contextSentence,
        contextTranslation: data.contextTranslation?.toString().trim() || undefined,
        storyId: data.storyId?.toString() || undefined,
        chapterId: data.chapterId?.toString() || undefined,
        storyWordId: (data.storyWordId || data.wordId)?.toString() || undefined,
        isActive: data.isActive !== false, // Default to true if not set
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        // Legacy fields for backward compatibility
        wordId: data.wordId?.toString() || undefined,
        front: data.front?.toString() || undefined,
        back: data.back?.toString() || undefined,
        exampleSentence: data.exampleSentence?.toString() || undefined,
      };
      
      // Final validation
      if (!flashcard.frontText || !flashcard.backText) {
        console.error(`[Flashcard DB] Card ${docSnap.id} failed final validation:`, {
          flashcard,
          rawData: data,
        });
        continue; // Skip invalid cards
      }
      
      cardsWithSRS.push({ card: flashcard, srs });
    }
    
    // Separate due cards and new cards, determine display type
    const dueCards: Array<Flashcard & { displayType: 'A' | 'B'; srs: FlashcardSRS }> = [];
    const newCards: Array<Flashcard & { displayType: 'A' | 'B'; srs: FlashcardSRS }> = [];
    
    for (const { card, srs } of cardsWithSRS) {
      // Determine display type
      const displayType = determineDisplayType(srs);
      
      // Debug logging for cards (only log if there's an issue)
      // Only log if card should be Type B but isn't, or if timestamps suggest it should alternate
      if (card.frontText && srs.lastTypeAAt && !srs.lastTypeBAt && displayType !== 'B') {
        console.warn('[Flashcard Queue] Card should be Type B but got Type A:', {
          frontText: card.frontText,
          displayType,
          repetitions: srs.repetitions,
          lastTypeAAt: srs.lastTypeAAt,
          lastTypeBAt: srs.lastTypeBAt,
        });
      }
      
      const cardWithType = {
        ...card,
        displayType,
        srs,
      };
      
      if (srs.repetitions === 0 && srs.dueAt <= now) {
        newCards.push(cardWithType);
      } else if (srs.dueAt <= now) {
        dueCards.push(cardWithType);
      }
    }
    
    // Mix new cards with due cards (limit new cards)
    const selectedNewCards = newCards.slice(0, maxNewCards);
    const queue = [...dueCards, ...selectedNewCards].slice(0, limit);
    
    return queue;
  } catch (error: any) {
    // Check if it's a permission error
    if (error?.code === 'permission-denied') {
      console.warn('Permission denied getting flashcard queue. Make sure Firestore rules are deployed and user is authenticated.');
    } else {
      console.error('Error getting flashcard queue:', error);
    }
    // Return empty array instead of throwing
    return [];
  }
}

/**
 * Save a flashcard review
 */
export async function saveFlashcardReview(
  userId: string,
  flashcardId: string,
  rating: FlashcardRatingNumber,
  previousSRS: FlashcardSRS,
  cardType: 'A' | 'B',
  userAnswer?: string,
  isCorrect?: boolean
): Promise<FlashcardReview> {
  try {
    const reviewsRef = collection(getDb(), 'users', userId, 'flashcards', flashcardId, 'reviews');
    const reviewRef = doc(reviewsRef);
    
    // Calculate new SRS
    const newSRS = updateSRS(
      rating,
      previousSRS.intervalDays,
      previousSRS.easeFactor,
      previousSRS.repetitions
    );
    
    const now = new Date();
    const review: FlashcardReview = {
      id: reviewRef.id,
      flashcardId,
      userId,
      rating,
      reviewedAt: now,
      previousIntervalDays: previousSRS.intervalDays,
      newIntervalDays: newSRS.intervalDays,
      previousEaseFactor: previousSRS.easeFactor,
      newEaseFactor: newSRS.easeFactor,
      cardType,
      userAnswer,
      isCorrect,
    };
    
    // Build Firestore document - only include optional fields if they're defined
    const reviewData: any = {
      id: review.id,
      flashcardId: review.flashcardId,
      userId: review.userId,
      rating: review.rating,
      reviewedAt: Timestamp.fromDate(review.reviewedAt),
      previousIntervalDays: review.previousIntervalDays,
      newIntervalDays: review.newIntervalDays,
      previousEaseFactor: review.previousEaseFactor,
      newEaseFactor: review.newEaseFactor,
      cardType: review.cardType,
    };
    
    // Only include userAnswer and isCorrect if they're defined
    if (userAnswer !== undefined) {
      reviewData.userAnswer = userAnswer;
    }
    if (isCorrect !== undefined) {
      reviewData.isCorrect = isCorrect;
    }
    
    await setDoc(reviewRef, reviewData);
    
    // Update SRS data - update the appropriate lastType*At timestamp
    const srsUpdate: any = {
      dueAt: Timestamp.fromDate(newSRS.dueAt),
      intervalDays: newSRS.intervalDays,
      easeFactor: newSRS.easeFactor,
      repetitions: newSRS.repetitions,
      lastReviewedAt: Timestamp.now(),
    };
    
    if (cardType === 'A') {
      srsUpdate.lastTypeAAt = Timestamp.now();
    } else {
      srsUpdate.lastTypeBAt = Timestamp.now();
    }
    
    const srsRef = doc(getDb(), 'users', userId, 'flashcards', flashcardId, 'srs', 'data');
    await updateDoc(srsRef, srsUpdate);
    
    return review;
  } catch (error) {
    console.error('Error saving flashcard review:', error);
    throw error;
  }
}

/**
 * Get detailed review forecast grouped by date and hour
 */
export async function getReviewForecast(userId: string): Promise<{
  today: Array<{ hour: number; count: number; cumulative: number }>;
  week: Array<{ 
    date: Date; 
    count: number; 
    cumulative: number;
    hours: Array<{ hour: number; count: number; cumulative: number }>;
  }>;
  cardsDueNow: number;
}> {
  try {
    if (!userId) {
      return { today: [], week: [], cardsDueNow: 0 };
    }
    
    const flashcardsRef = collection(getDb(), 'users', userId, 'flashcards');
    const snapshot = await getDocs(flashcardsRef);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    // Group reviews by date and hour
    const reviewsByDateHour: Map<string, number> = new Map();
    let cardsDueNow = 0;
    
    for (const docSnap of snapshot.docs) {
      try {
        const data = docSnap.data();
        
        // Skip inactive cards
        if (data.isActive === false) continue;
        
        const srs = await getFlashcardSRS(userId, docSnap.id);
        if (!srs) continue;
        
        const dueAt = srs.dueAt instanceof Date ? srs.dueAt : srs.dueAt.toDate();
        
        // Count cards due now
        if (dueAt <= now) {
          cardsDueNow++;
        }
        
        // Only include future reviews within the week
        if (dueAt > now && dueAt < weekEnd) {
          const dateKey = `${dueAt.getFullYear()}-${dueAt.getMonth()}-${dueAt.getDate()}-${dueAt.getHours()}`;
          reviewsByDateHour.set(dateKey, (reviewsByDateHour.get(dateKey) || 0) + 1);
        }
      } catch (error) {
        console.error(`Error processing flashcard ${docSnap.id} for forecast:`, error);
        continue;
      }
    }
    
    // Build today's hourly breakdown
    const todayHours: Array<{ hour: number; count: number; cumulative: number }> = [];
    let todayCumulative = cardsDueNow;
    
    // Start from current hour
    const currentHour = now.getHours();
    for (let hour = currentHour; hour < 24; hour++) {
      const dateKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}-${hour}`;
      const count = reviewsByDateHour.get(dateKey) || 0;
      if (hour === currentHour) {
        // For current hour, cumulative starts with cards due now
        todayCumulative = cardsDueNow + count;
      } else {
        todayCumulative += count;
      }
      todayHours.push({ hour, count, cumulative: todayCumulative });
    }
    
    // Build week's daily breakdown with hourly data
    const weekDays: Array<{ 
      date: Date; 
      count: number; 
      cumulative: number;
      hours: Array<{ hour: number; count: number; cumulative: number }>;
    }> = [];
    let weekCumulative = cardsDueNow;
    
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() + day);
      
      let dayCount = 0;
      const dayHours: Array<{ hour: number; count: number; cumulative: number }> = [];
      
      // For today, start cumulative from cardsDueNow, for other days start from previous day's cumulative
      let dayStartCumulative = day === 0 ? cardsDueNow : weekCumulative;
      let dayCumulative = dayStartCumulative;
      
      // For today, only show hours from current hour onwards
      const startHour = (day === 0) ? currentHour : 0;
      
      for (let hour = startHour; hour < 24; hour++) {
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${hour}`;
        const hourCount = reviewsByDateHour.get(dateKey) || 0;
        dayCount += hourCount;
        dayCumulative += hourCount;
        dayHours.push({ hour, count: hourCount, cumulative: dayCumulative });
      }
      
      // Update week cumulative (only count future hours for today)
      if (day === 0) {
        // For today, only count future hours
        weekCumulative += dayCount;
      } else {
        weekCumulative += dayCount;
      }
      
      weekDays.push({ 
        date, 
        count: dayCount, 
        cumulative: weekCumulative,
        hours: dayHours,
      });
    }
    
    return {
      today: todayHours,
      week: weekDays,
      cardsDueNow,
    };
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      console.warn('Permission denied getting review forecast. Make sure Firestore rules are deployed and user is authenticated.');
    } else {
      console.error('Error getting review forecast:', error);
    }
    return { today: [], week: [], cardsDueNow: 0 };
  }
}

/**
 * Get next review forecast (earliest scheduled review date) - legacy function
 */
export async function getNextReviewForecast(userId: string): Promise<{
  nextReviewDate: Date | null;
  cardsDue: number;
}> {
  try {
    const forecast = await getReviewForecast(userId);
    const nextReviewDate = forecast.today.length > 0 && forecast.today[0].count > 0
      ? new Date(new Date().setHours(forecast.today[0].hour, 0, 0, 0))
      : (forecast.week.find(d => d.count > 0)?.date || null);
    
    return {
      nextReviewDate,
      cardsDue: forecast.cardsDueNow,
    };
  } catch (error) {
    console.error('Error getting next review forecast:', error);
    return { nextReviewDate: null, cardsDue: 0 };
  }
}

/**
 * Get flashcard statistics
 */
export async function getFlashcardStats(userId: string): Promise<{
  dueToday: number;
  newToday: number;
  learned: number; // repetitions >= 3
  total: number;
  byStory: Record<string, number>;
}> {
  try {
    if (!userId) {
      console.warn('getFlashcardStats: userId is required');
      return {
        dueToday: 0,
        newToday: 0,
        learned: 0,
        total: 0,
        byStory: {},
      };
    }
    
    // Get all flashcards (don't filter by isActive in query - handle in loop for backward compatibility)
    const flashcardsRef = collection(getDb(), 'users', userId, 'flashcards');
    const snapshot = await getDocs(flashcardsRef);
    
    const now = new Date();
    let dueToday = 0;
    let newToday = 0;
    let learned = 0;
    const byStory: Record<string, number> = {};
    
    for (const docSnap of snapshot.docs) {
      try {
        const data = docSnap.data();
        
        // Skip inactive cards (default to active if field doesn't exist for backward compatibility)
        if (data.isActive === false) continue;
        
        const srs = await getFlashcardSRS(userId, docSnap.id);
        
        // If SRS is missing, create it (for backward compatibility)
        if (!srs) {
          try {
            const defaultSRS = getDefaultSRS();
            const srsRef = doc(getDb(), 'users', userId, 'flashcards', docSnap.id, 'srs', 'data');
            await setDoc(srsRef, {
              flashcardId: docSnap.id,
              dueAt: Timestamp.fromDate(defaultSRS.dueAt),
              intervalDays: defaultSRS.intervalDays,
              easeFactor: defaultSRS.easeFactor,
              repetitions: defaultSRS.repetitions,
              lastReviewedAt: null,
              lastTypeAAt: null,
              lastTypeBAt: null,
            });
            // Re-fetch SRS
            const newSrs = await getFlashcardSRS(userId, docSnap.id);
            if (!newSrs) continue;
            
            // Use the new SRS for calculations
            if (newSrs.dueAt <= now) {
              if (newSrs.repetitions === 0) {
                newToday++;
              } else {
                dueToday++;
              }
            }
            if (newSrs.repetitions >= 3) {
              learned++;
            }
          } catch (srsErr) {
            console.warn(`Failed to create SRS for stats calculation: ${docSnap.id}`, srsErr);
            continue;
          }
        } else {
          // SRS exists, use it for calculations
          if (srs.dueAt <= now) {
            if (srs.repetitions === 0) {
              newToday++;
            } else {
              dueToday++;
            }
          }
          
          if (srs.repetitions >= 3) {
            learned++;
          }
        }
        
        if (data.storyId) {
          byStory[data.storyId] = (byStory[data.storyId] || 0) + 1;
        }
      } catch (cardError) {
        console.warn(`Error processing flashcard ${docSnap.id} for stats:`, cardError);
        // Continue with next card
        continue;
      }
    }
    
    return {
      dueToday,
      newToday,
      learned,
      total: snapshot.size,
      byStory,
    };
  } catch (error: any) {
    // Check if it's a permission error
    if (error?.code === 'permission-denied') {
      console.error('Permission denied getting flashcard stats. Make sure Firestore rules are deployed and user is authenticated.');
    } else {
      console.error('Error getting flashcard stats:', error);
    }
    // Return default values instead of throwing
    return {
      dueToday: 0,
      newToday: 0,
      learned: 0,
      total: 0,
      byStory: {},
    };
  }
}

/**
 * Get or create flashcard preferences
 */
export async function getFlashcardPreferences(userId: string): Promise<FlashcardPreferences> {
  try {
    if (!userId) {
      console.warn('getFlashcardPreferences: userId is required');
      // Return default preferences
      return {
        id: 'default',
        userId: userId || '',
        maxNewCardsPerDay: 15,
        maxReviewsPerDay: 100,
        learningLanguageCode: 'de',
        showBackAutomatically: false,
        sessionGoalCards: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    
    const prefsRef = doc(getDb(), 'users', userId, 'flashcardPreferences', 'settings');
    const prefsDoc = await getDoc(prefsRef);
    
    if (prefsDoc.exists()) {
      const data = prefsDoc.data();
      return {
        id: prefsDoc.id,
        userId,
        maxNewCardsPerDay: data.maxNewCardsPerDay || 15,
        maxReviewsPerDay: data.maxReviewsPerDay || 100,
        learningLanguageCode: data.learningLanguageCode || 'de',
        showBackAutomatically: data.showBackAutomatically || false,
        sessionGoalCards: data.sessionGoalCards || 20,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }
    
    // Create default preferences
    const defaultPrefs: FlashcardPreferences = {
      id: prefsRef.id,
      userId,
      maxNewCardsPerDay: 15,
      maxReviewsPerDay: 100,
      learningLanguageCode: 'de',
      showBackAutomatically: false,
      sessionGoalCards: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(prefsRef, {
      ...defaultPrefs,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return defaultPrefs;
  } catch (error: any) {
    // Check if it's a permission error
    if (error?.code === 'permission-denied') {
      console.warn('Permission denied getting flashcard preferences. Using defaults. Make sure Firestore rules are deployed and user is authenticated.');
    } else {
      console.error('Error getting flashcard preferences:', error);
    }
    // Return defaults on error instead of throwing
    return {
      id: 'default',
      userId,
      maxNewCardsPerDay: 15,
      maxReviewsPerDay: 100,
      learningLanguageCode: 'de',
      showBackAutomatically: false,
      sessionGoalCards: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

