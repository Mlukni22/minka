import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { UserStoryProgress, UserChapterProgress, UserChapterExerciseAttempt } from '@/types/story';

const getDb = () => {
  if (!db) throw new Error('Firestore not initialized');
  return db;
};

// ==================== STORY PROGRESS ====================

/**
 * Get user's story progress
 */
export async function getUserStoryProgress(userId: string, storyId: string): Promise<UserStoryProgress | null> {
  try {
    const progressRef = doc(getDb(), 'users', userId, 'storyProgress', storyId);
    const progressDoc = await getDoc(progressRef);
    
    if (progressDoc.exists()) {
      const data = progressDoc.data();
      return {
        id: progressDoc.id,
        userId: data.userId,
        storyId: data.storyId,
        currentChapterNumber: data.currentChapterNumber,
        completed: data.completed || false,
        lastAccessedAt: data.lastAccessedAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user story progress:', error);
    return null;
  }
}

/**
 * Create or update user story progress
 */
export async function updateUserStoryProgress(progress: UserStoryProgress): Promise<void> {
  try {
    const progressRef = doc(getDb(), 'users', progress.userId, 'storyProgress', progress.storyId);
    await setDoc(progressRef, {
      userId: progress.userId,
      storyId: progress.storyId,
      currentChapterNumber: progress.currentChapterNumber,
      completed: progress.completed,
      lastAccessedAt: Timestamp.fromDate(progress.lastAccessedAt),
      updatedAt: serverTimestamp(),
      createdAt: progress.createdAt ? Timestamp.fromDate(progress.createdAt) : serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating user story progress:', error);
    throw error;
  }
}

/**
 * Get all user's story progress
 */
export async function getAllUserStoryProgress(userId: string): Promise<UserStoryProgress[]> {
  try {
    const progressRef = collection(getDb(), 'users', userId, 'storyProgress');
    const q = query(progressRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        storyId: data.storyId,
        currentChapterNumber: data.currentChapterNumber,
        completed: data.completed || false,
        lastAccessedAt: data.lastAccessedAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }) as UserStoryProgress[];
  } catch (error) {
    console.error('Error getting all user story progress:', error);
    return [];
  }
}

// ==================== CHAPTER PROGRESS ====================

/**
 * Get user's chapter progress
 */
export async function getUserChapterProgress(userId: string, chapterId: string): Promise<UserChapterProgress | null> {
  try {
    const progressRef = doc(getDb(), 'users', userId, 'chapterProgress', chapterId);
    const progressDoc = await getDoc(progressRef);
    
    if (progressDoc.exists()) {
      const data = progressDoc.data();
      return {
        id: progressDoc.id,
        userId: data.userId,
        chapterId: data.chapterId,
        status: data.status || 'NOT_STARTED',
        completedAt: data.completedAt?.toDate(),
        exerciseScore: data.exerciseScore ?? null,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user chapter progress:', error);
    return null;
  }
}

/**
 * Create or update user chapter progress
 */
export async function updateUserChapterProgress(progress: UserChapterProgress): Promise<void> {
  try {
    const progressRef = doc(getDb(), 'users', progress.userId, 'chapterProgress', progress.chapterId);
    const data: any = {
      userId: progress.userId,
      chapterId: progress.chapterId,
      status: progress.status,
      completedAt: progress.completedAt ? Timestamp.fromDate(progress.completedAt) : null,
      updatedAt: serverTimestamp(),
      createdAt: progress.createdAt ? Timestamp.fromDate(progress.createdAt) : serverTimestamp(),
    };
    
    // Only include exerciseScore if it's not undefined (Firebase doesn't allow undefined)
    if (progress.exerciseScore !== undefined) {
      data.exerciseScore = progress.exerciseScore;
    }
    
    await setDoc(progressRef, data, { merge: true });
  } catch (error) {
    console.error('Error updating user chapter progress:', error);
    throw error;
  }
}

/**
 * Get all chapter progress for a user
 */
export async function getAllUserChapterProgress(userId: string): Promise<UserChapterProgress[]> {
  try {
    const progressRef = collection(getDb(), 'users', userId, 'chapterProgress');
    const q = query(progressRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        chapterId: data.chapterId,
        status: data.status || 'NOT_STARTED',
        completedAt: data.completedAt?.toDate(),
        exerciseScore: data.exerciseScore ?? null,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }) as UserChapterProgress[];
  } catch (error) {
    console.error('Error getting all user chapter progress:', error);
    return [];
  }
}

// ==================== EXERCISE ATTEMPTS ====================

/**
 * Save user exercise attempt
 */
export async function saveExerciseAttempt(attempt: UserChapterExerciseAttempt): Promise<void> {
  try {
    const attemptRef = doc(
      getDb(),
      'users',
      attempt.userId,
      'exerciseAttempts',
      attempt.id || `${attempt.exerciseId}_${Date.now()}`
    );
    
    // Build the data object, only including defined fields
    const attemptData: any = {
      userId: attempt.userId,
      exerciseId: attempt.exerciseId,
      isCorrect: attempt.isCorrect,
      score: attempt.score || (attempt.isCorrect ? 1 : 0),
      attemptedAt: Timestamp.fromDate(attempt.attemptedAt),
    };
    
    // Only include selectedOptionId if it's defined
    if (attempt.selectedOptionId !== undefined) {
      attemptData.selectedOptionId = attempt.selectedOptionId;
    }
    
    // Only include userAnswerText if it's defined
    if (attempt.userAnswerText !== undefined) {
      attemptData.userAnswerText = attempt.userAnswerText;
    }
    
    await setDoc(attemptRef, attemptData, { merge: true });
  } catch (error) {
    console.error('Error saving exercise attempt:', error);
    throw error;
  }
}

/**
 * Get all exercise attempts for a user
 */
export async function getUserExerciseAttempts(userId: string, exerciseId?: string): Promise<UserChapterExerciseAttempt[]> {
  try {
    const attemptsRef = collection(getDb(), 'users', userId, 'exerciseAttempts');
    const q = exerciseId
      ? query(attemptsRef, where('userId', '==', userId), where('exerciseId', '==', exerciseId))
      : query(attemptsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        exerciseId: data.exerciseId,
        selectedOptionId: data.selectedOptionId,
        userAnswerText: data.userAnswerText,
        isCorrect: data.isCorrect || false,
        attemptedAt: data.attemptedAt?.toDate() || new Date(),
        score: data.score,
      };
    }) as UserChapterExerciseAttempt[];
  } catch (error) {
    console.error('Error getting user exercise attempts:', error);
    return [];
  }
}

// Legacy functions for backward compatibility

/**
 * Create or update user story progress (legacy - for backward compatibility)
 * @deprecated Use updateUserStoryProgress instead
 */
export async function saveUserStoryProgress(
  userId: string,
  storyId: string,
  currentSectionIndex: number,
  completed: boolean = false
): Promise<void> {
  const progress: UserStoryProgress = {
    id: `${userId}_${storyId}`,
    userId,
    storyId,
    currentChapterNumber: currentSectionIndex, // Map section index to chapter number
    completed,
    lastAccessedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await updateUserStoryProgress(progress);
}
