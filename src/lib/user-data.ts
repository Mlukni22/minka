import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from './firebase';
import { Firestore } from 'firebase/firestore';
import { UserProgress } from '@/types';
import { UserProgressionState } from './progression';
import { SRSVocabularyItem } from './srs';

// Helper to ensure db is defined
const getDb = (): Firestore => {
  if (!db) throw new Error('Firestore not initialized');
  return db;
};

/**
 * Get user progress from Firestore
 */
export async function getUserProgress(userId: string): Promise<UserProgress | null> {
  try {
    const userRef = doc(getDb(), 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        userId: data.uid,
        completedStories: data.completedStories || [],
        completedChapters: data.completedChapters || [],
        vocabularyProgress: data.vocabularyProgress || {},
        streak: data.streak || 0,
        totalXP: data.totalXP || 0,
        lastActiveDate: data.lastActiveDate?.toDate() || new Date()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user progress:', error);
    return null;
  }
}

/**
 * Update user progress in Firestore
 */
export async function updateUserProgress(
  userId: string,
  progress: Partial<UserProgress>
): Promise<void> {
  try {
    const userRef = doc(getDb(), 'users', userId);
    await updateDoc(userRef, {
      ...progress,
      lastActiveDate: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
}

/**
 * Get user progression state from Firestore
 */
export async function getUserProgressionState(
  userId: string
): Promise<UserProgressionState | null> {
  try {
    const progressionRef = doc(getDb(), 'progressions', userId);
    const progressionDoc = await getDoc(progressionRef);
    
    if (progressionDoc.exists()) {
      return progressionDoc.data() as UserProgressionState;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting progression state:', error);
    return null;
  }
}

/**
 * Save user progression state to Firestore
 */
export async function saveUserProgressionState(
  userId: string,
  state: UserProgressionState
): Promise<void> {
  try {
    const progressionRef = doc(getDb(), 'progressions', userId);
    await setDoc(progressionRef, {
      ...state,
      lastUpdated: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving progression state:', error);
    throw error;
  }
}

/**
 * Get user's flashcards from Firestore
 */
export async function getUserFlashcards(userId: string): Promise<SRSVocabularyItem[]> {
  try {
    if (!userId) {
      console.warn('getUserFlashcards: userId is required');
      return [];
    }
    
    const flashcardsRef = collection(getDb(), 'users', userId, 'flashcards');
    const snapshot = await getDocs(flashcardsRef);
    
    const flashcards: SRSVocabularyItem[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      flashcards.push({
        ...data,
        nextReview: data.nextReview?.toDate() || new Date()
      } as SRSVocabularyItem);
    });
    
    return flashcards;
  } catch (error: any) {
    // Check if it's a permission error
    if (error?.code === 'permission-denied') {
      console.warn('Permission denied getting flashcard sets. Make sure Firestore rules are deployed and user is authenticated.');
      console.warn('User ID:', userId);
    } else {
      console.error('Error getting flashcard sets:', error);
    }
    return [];
  }
}

/**
 * Save user's flashcards to Firestore
 */
export async function saveUserFlashcards(
  userId: string,
  flashcards: SRSVocabularyItem[]
): Promise<void> {
  try {
    const batch: Promise<void>[] = [];
    
    flashcards.forEach((card) => {
      const cardRef = doc(getDb(), 'users', userId, 'flashcards', card.id);
      batch.push(setDoc(cardRef, card, { merge: true }));
    });
    
    await Promise.all(batch);
  } catch (error) {
    console.error('Error saving flashcards:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export interface UserSettings {
  language?: string;
  notifications?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  audioEnabled?: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export async function updateUserProfile(
  userId: string,
  updates: {
    displayName?: string;
    photoURL?: string;
    settings?: UserSettings;
  }
): Promise<void> {
  try {
    const userRef = doc(getDb(), 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const usersRef = collection(getDb(), 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as User;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

/**
 * Sync local storage data to Firestore (for migration)
 */
export async function syncLocalStorageToFirestore(userId: string): Promise<void> {
  try {
    // Get data from localStorage
    const progressionData = localStorage.getItem('minka-progression');
    const flashcardsData = localStorage.getItem('minka-flashcards');
    
    if (progressionData) {
      const progression = JSON.parse(progressionData);
      await saveUserProgressionState(userId, progression);
    }
    
    if (flashcardsData) {
      const flashcards = JSON.parse(flashcardsData);
      await saveUserFlashcards(userId, flashcards);
    }
    
    console.log('Local data synced to Firestore successfully');
  } catch (error) {
    console.error('Error syncing local storage to Firestore:', error);
  }
}

