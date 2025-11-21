/**
 * Simple test script to check Firestore connection and create a minimal story
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

async function testFirestore() {
  console.log('🧪 Testing Firestore connection...\n');

  try {
    const now = Timestamp.now();
    const storyRef = doc(db, 'stories', 'minka-ist-neu');
    
    console.log('Creating story document...');
    await setDoc(storyRef, {
      title: 'Minka ist neu',
      slug: 'minka-ist-neu',
      level: 'A1',
      description: 'Minka is a little cat who arrives at a new house.',
      estimatedTimeMinutes: 8,
      createdAt: now,
      updatedAt: now,
    });
    console.log('✅ Story document created successfully!\n');

    // Try creating a chapter
    console.log('Creating chapter document...');
    const chapterRef = doc(collection(db, 'stories', 'minka-ist-neu', 'chapters'));
    await setDoc(chapterRef, {
      storyId: 'minka-ist-neu',
      chapterNumber: 1,
      title: 'Kapitel 1 – Minka ist neu',
      createdAt: now,
      updatedAt: now,
    });
    console.log('✅ Chapter document created successfully!\n');

    console.log('✨ All tests passed!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Load environment variables
if (typeof require !== 'undefined') {
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (e) {
    // dotenv not available
  }
}

testFirestore();

