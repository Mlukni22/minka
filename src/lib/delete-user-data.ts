import { 
  collection, 
  doc, 
  getDocs, 
  deleteDoc, 
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from './firebase';

const BATCH_SIZE = 500; // Firestore batch limit

/**
 * Delete all data for the current authenticated user
 * This includes:
 * - User document
 * - All flashcards and subcollections (srs, reviews)
 * - Flashcard preferences
 * - Story progress
 * - Chapter progress
 * - Exercise attempts
 * - Legacy progressions
 */
export async function deleteAllUserData(userId: string): Promise<void> {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('User must be authenticated to delete data');
  }

  if (currentUser.uid !== userId) {
    throw new Error('User can only delete their own data');
  }

  console.log('[Delete User Data] Starting deletion for user:', userId);

  try {
    // Delete all flashcards and their subcollections
    await deleteFlashcards(userId);

    // Delete flashcard preferences
    await deleteCollection(`users/${userId}/flashcardPreferences`);

    // Delete story progress
    await deleteCollection(`users/${userId}/storyProgress`);

    // Delete chapter progress
    await deleteCollection(`users/${userId}/chapterProgress`);

    // Delete exercise attempts
    await deleteCollection(`users/${userId}/exerciseAttempts`);

    // Delete legacy progressions
    const progressionRef = doc(db, 'progressions', userId);
    const progressionDoc = await getDoc(progressionRef);
    if (progressionDoc.exists()) {
      await deleteDoc(progressionRef);
      console.log('[Delete User Data] Deleted progression document');
    }

    // Delete main user document (this should be last)
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      await deleteDoc(userRef);
      console.log('[Delete User Data] Deleted user document');
    }

    console.log('[Delete User Data] Successfully deleted all user data');
  } catch (error) {
    console.error('[Delete User Data] Error deleting user data:', error);
    throw error;
  }
}

/**
 * Delete all flashcards and their subcollections (srs, reviews)
 */
async function deleteFlashcards(userId: string): Promise<void> {
  const flashcardsRef = collection(db, 'users', userId, 'flashcards');
  const flashcardsSnapshot = await getDocs(flashcardsRef);

  console.log(`[Delete User Data] Found ${flashcardsSnapshot.size} flashcards to delete`);

  for (const flashcardDoc of flashcardsSnapshot.docs) {
    const flashcardId = flashcardDoc.id;
    
    // Delete SRS subcollection
    await deleteCollection(`users/${userId}/flashcards/${flashcardId}/srs`);
    
    // Delete reviews subcollection
    await deleteCollection(`users/${userId}/flashcards/${flashcardId}/reviews`);
    
    // Delete the flashcard document itself
    await deleteDoc(flashcardDoc.ref);
  }

  console.log('[Delete User Data] Deleted all flashcards');
}

/**
 * Delete all documents in a collection (handles batching for large collections)
 */
async function deleteCollection(collectionPath: string): Promise<void> {
  const collectionRef = collection(db, collectionPath);
  const snapshot = await getDocs(collectionRef);

  if (snapshot.empty) {
    return;
  }

  console.log(`[Delete User Data] Deleting ${snapshot.size} documents from ${collectionPath}`);

  // Delete in batches
  const batches: any[] = [];
  let currentBatch = writeBatch(db);
  let operationCount = 0;

  for (const docSnapshot of snapshot.docs) {
    currentBatch.delete(docSnapshot.ref);
    operationCount++;

    if (operationCount >= BATCH_SIZE) {
      batches.push(currentBatch);
      currentBatch = writeBatch(db);
      operationCount = 0;
    }
  }

  // Add the last batch if it has operations
  if (operationCount > 0) {
    batches.push(currentBatch);
  }

  // Execute all batches
  for (const batch of batches) {
    await batch.commit();
  }

  console.log(`[Delete User Data] Deleted ${snapshot.size} documents from ${collectionPath}`);
}


