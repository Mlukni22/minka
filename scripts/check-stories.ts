/**
 * Quick script to check if stories exist in Firestore
 * 
 * Usage:
 * npx tsx scripts/check-stories.ts
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function checkStories() {
  console.log('🔍 Checking for stories in Firestore...\n');

  try {
    const storiesRef = collection(db, 'stories');
    const snapshot = await getDocs(storiesRef);

    if (snapshot.empty) {
      console.log('❌ No stories found in Firestore.');
      console.log('\n📝 To add stories, run:');
      console.log('   npx tsx scripts/seed-minka-ist-neu.ts');
      console.log('\n📚 Or add stories manually in Firebase Console.');
    } else {
      console.log(`✅ Found ${snapshot.size} story/stories:\n`);
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        console.log(`   - ${data.title} (${data.level}) - ID: ${doc.id}`);
      });
    }
  } catch (error) {
    console.error('❌ Error checking stories:', error);
    console.log('\n⚠️  Make sure:');
    console.log('   1. Firebase is configured in .env.local');
    console.log('   2. Firestore is enabled in Firebase Console');
    console.log('   3. Firestore security rules allow reads');
  }

  process.exit(0);
}

// Load environment variables
if (typeof require !== 'undefined') {
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (e) {
    // dotenv not available, assume env vars are set
  }
}

checkStories().catch((error) => {
  console.error('❌ Check failed:', error);
  process.exit(1);
});

