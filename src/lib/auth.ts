import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> {
  if (!auth) {
    throw new Error('Firebase auth is not initialized');
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with display name
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
      
      // Create user document in Firestore
      await createUserDocument(userCredential.user);
    }
    
    return userCredential;
  } catch (error: unknown) {
    console.error('Sign up error:', error);
    const errorCode = error instanceof Error && 'code' in error ? (error as any).code : 'unknown';
    throw new Error(getAuthErrorMessage(errorCode));
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<UserCredential> {
  if (!auth) {
    throw new Error('Firebase auth is not initialized');
  }
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: unknown) {
    console.error('Sign in error:', error);
    const errorCode = error instanceof Error && 'code' in error ? (error as any).code : 'unknown';
    throw new Error(getAuthErrorMessage(errorCode));
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  if (!auth || !db) {
    throw new Error('Firebase is not initialized');
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (!userDoc.exists()) {
      await createUserDocument(result.user);
    }
    
    return result;
  } catch (error: unknown) {
    console.error('Google sign in error:', error);
    const errorCode = error instanceof Error && 'code' in error ? (error as any).code : 'unknown';
    throw new Error(getAuthErrorMessage(errorCode));
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  if (!auth) {
    throw new Error('Firebase auth is not initialized');
  }
  try {
    await firebaseSignOut(auth);
  } catch (error: unknown) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out. Please try again.');
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  if (!auth) {
    throw new Error('Firebase auth is not initialized');
  }
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: unknown) {
    console.error('Password reset error:', error);
    const errorCode = error instanceof Error && 'code' in error ? (error as any).code : 'unknown';
    throw new Error(getAuthErrorMessage(errorCode));
  }
}

/**
 * Create user document in Firestore
 */
async function createUserDocument(user: User): Promise<void> {
  if (!user || !db) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    try {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Minka Learner',
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        lastActiveDate: serverTimestamp(),
        streak: 0,
        totalXP: 0,
        completedStories: [],
        completedChapters: [],
        vocabularyProgress: {},
        settings: {
          notifications: true,
          soundEnabled: true,
          dailyGoal: 15 // minutes
        }
      });
    } catch (error) {
      console.error('Error creating user document:', error);
    }
  }
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  return auth ? auth.currentUser : null;
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) {
    return () => {}; // Return no-op unsubscribe function
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Convert Firebase error codes to user-friendly messages
 */
function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: { [key: string]: string } = {
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/popup-closed-by-user': 'Sign in cancelled. Please try again.',
    'auth/cancelled-popup-request': 'Another sign in is in progress.',
  };
  
  return errorMessages[errorCode] || 'An error occurred. Please try again.';
}

