import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { User, GermanLevel } from '@/types/user';

const getDb = () => {
  if (!db) throw new Error('Firestore not initialized');
  return db;
};

/**
 * Get user data from Firestore
 */
export async function getUserData(userId: string): Promise<User | null> {
  try {
    const userRef = doc(getDb(), 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        id: userDoc.id,
        email: data.email || '',
        displayName: data.displayName || null,
        germanLevel: data.germanLevel || null,
        dailyGoalMinutes: data.dailyGoalMinutes || null,
        onboardingCompleted: data.onboardingCompleted || false,
        xpTotal: data.totalXP || 0,
        wordsLearned: data.wordsLearned || 0,
        storiesCompleted: data.storiesCompleted || 0,
        streak: data.streak || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

/**
 * Update user onboarding data
 */
export async function updateUserOnboarding(
  userId: string,
  data: {
    germanLevel?: GermanLevel;
    dailyGoalMinutes?: number;
    onboardingCompleted?: boolean;
  }
): Promise<void> {
  try {
    const userRef = doc(getDb(), 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user onboarding:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: {
    displayName?: string;
    germanLevel?: GermanLevel;
    dailyGoalMinutes?: number;
  }
): Promise<void> {
  try {
    const userRef = doc(getDb(), 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Award XP to user
 */
export async function awardXP(userId: string, amount: number): Promise<void> {
  try {
    const userRef = doc(getDb(), 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentXP = userDoc.data().totalXP || 0;
      await updateDoc(userRef, {
        totalXP: currentXP + amount,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error awarding XP:', error);
    throw error;
  }
}

/**
 * Increment words learned count
 */
export async function incrementWordsLearned(userId: string, count: number = 1): Promise<void> {
  try {
    const userRef = doc(getDb(), 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentCount = userDoc.data().wordsLearned || 0;
      await updateDoc(userRef, {
        wordsLearned: currentCount + count,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error incrementing words learned:', error);
    throw error;
  }
}

/**
 * Increment stories completed count
 */
export async function incrementStoriesCompleted(userId: string): Promise<void> {
  try {
    const userRef = doc(getDb(), 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentCount = userDoc.data().storiesCompleted || 0;
      await updateDoc(userRef, {
        storiesCompleted: currentCount + 1,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error incrementing stories completed:', error);
    throw error;
  }
}

/**
 * Update user data (generic update function)
 */
export async function updateUserData(userId: string, data: {
  xpTotal?: number;
  storiesCompleted?: number;
  wordsLearned?: number;
  streak?: number;
  lastActiveDate?: Date;
}): Promise<void> {
  try {
    const userRef = doc(getDb(), 'users', userId);
    const updateData: any = {};
    
    if (data.xpTotal !== undefined) {
      updateData.totalXP = data.xpTotal;
    }
    if (data.storiesCompleted !== undefined) {
      updateData.storiesCompleted = data.storiesCompleted;
    }
    if (data.wordsLearned !== undefined) {
      updateData.wordsLearned = data.wordsLearned;
    }
    if (data.streak !== undefined) {
      updateData.streak = data.streak;
    }
    
    updateData.updatedAt = serverTimestamp();
    
    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
}

