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
    const flashcardsRef = collection(getDb(), 'users', userId, 'flashcards');
    const snapshot = await getDocs(flashcardsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Flashcard[];
  } catch (error) {
    console.error('Error getting user flashcards:', error);
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
    
    const flashcardData: any = {
      userId,
      languageCode: data.languageCode || 'de',
      frontText: trimmedFrontText,
      backText: trimmedBackText,
      contextSentence: (data.contextSentence || '').toString().trim() || trimmedFrontText,
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
      console.log('[Flashcard DB] Successfully created flashcard:', newFlashcardRef.id);
    } catch (error) {
      console.error('[Flashcard DB] Error saving flashcard to Firestore:', error, {
        flashcardData,
        docId: newFlashcardRef.id,
      });
      throw error;
    }
    
    // Create default SRS data
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
  // New cards (repetitions = 0) always start with Type A
  if (srs.repetitions === 0) {
    return 'A';
  }
  
  // Alternate between Type A and Type B
  // If lastTypeBAt is null or much older than lastTypeAAt, use Type B
  // Otherwise use Type A
  if (!srs.lastTypeBAt || !srs.lastTypeAAt) {
    return srs.lastTypeBAt ? 'A' : 'B';
  }
  
  // If Type B was used more recently, use Type A
  if (srs.lastTypeBAt > srs.lastTypeAAt) {
    return 'A';
  }
  
  // Otherwise use Type B
  return 'B';
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
    const { storyId, limit = 20, maxNewCards = 15 } = options;
    const now = new Date();
    
    // Get all active flashcards (or flashcards without isActive field, for backward compatibility)
    const flashcardsRef = collection(getDb(), 'users', userId, 'flashcards');
    let q = query(flashcardsRef);
    
    if (storyId) {
      q = query(flashcardsRef, where('storyId', '==', storyId));
    }
    
    const snapshot = await getDocs(q);
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
      const contextSentence = (data.contextSentence || data.exampleSentence || '').toString().trim();
      
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
  } catch (error) {
    console.error('Error getting flashcard queue:', error);
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
    const flashcardsRef = collection(getDb(), 'users', userId, 'flashcards');
    const q = query(flashcardsRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);
    
    const now = new Date();
    let dueToday = 0;
    let newToday = 0;
    let learned = 0;
    const byStory: Record<string, number> = {};
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const srs = await getFlashcardSRS(userId, docSnap.id);
      if (!srs) continue;
      
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
      
      if (data.storyId) {
        byStory[data.storyId] = (byStory[data.storyId] || 0) + 1;
      }
    }
    
    return {
      dueToday,
      newToday,
      learned,
      total: snapshot.size,
      byStory,
    };
  } catch (error) {
    console.error('Error getting flashcard stats:', error);
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
  } catch (error) {
    console.error('Error getting flashcard preferences:', error);
    // Return defaults on error
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

