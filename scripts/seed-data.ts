/**
 * Seed script to populate Firestore with sample stories
 * 
 * Usage:
 * 1. Make sure Firebase is set up and .env.local has Firebase config
 * 2. Run: npx tsx scripts/seed-data.ts
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Load environment variables
if (typeof require !== 'undefined') {
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (e) {
    console.log("❌ Error: ",e);
  }
}

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

const stories = [
  {
    id: 'der-erste-schultag',
    title: 'Der erste Schultag',
    slug: 'der-erste-schultag',
    level: 'A1',
    description: 'Minka\'s first day at school brings new friends and exciting adventures.',
    estimatedTimeMinutes: 10,
    sections: [
      {
        orderIndex: 0,
        germanText: 'Guten Morgen! Ich bin Minka. Heute ist mein erster Schultag. Ich bin aufgeregt!',
        englishHint: 'Minka introduces herself and mentions her first day at school.',
        words: [
          { phrase: 'Guten Morgen', translation: 'Good morning', exampleSentence: 'Guten Morgen, Lisa!', exampleTranslation: 'Good morning, Lisa!' },
          { phrase: 'ich bin', translation: 'I am', exampleSentence: 'Ich bin Minka.', exampleTranslation: 'I am Minka.' },
          { phrase: 'erster Schultag', translation: 'first day of school', exampleSentence: 'Heute ist mein erster Schultag.', exampleTranslation: 'Today is my first day of school.' },
          { phrase: 'aufgeregt', translation: 'excited', exampleSentence: 'Ich bin aufgeregt!', exampleTranslation: 'I am excited!' },
        ],
      },
      {
        orderIndex: 1,
        germanText: 'In der Klasse sehe ich viele neue Gesichter. Eine Maus sitzt neben mir. "Hallo!", sagt sie. "Ich heiße Lisa."',
        englishHint: 'Minka meets Lisa, a mouse who sits next to her in class.',
        words: [
          { phrase: 'Klasse', translation: 'class', exampleSentence: 'In der Klasse', exampleTranslation: 'In the class' },
          { phrase: 'viele', translation: 'many', exampleSentence: 'viele neue Gesichter', exampleTranslation: 'many new faces' },
          { phrase: 'neben', translation: 'next to', exampleSentence: 'neben mir', exampleTranslation: 'next to me' },
          { phrase: 'heiße', translation: 'am called / my name is', exampleSentence: 'Ich heiße Minka.', exampleTranslation: 'My name is Minka.' },
        ],
      },
      {
        orderIndex: 2,
        germanText: 'Die Lehrerin kommt herein. "Willkommen!", sagt sie. "Heute lernen wir Zahlen. Eins, zwei, drei..."',
        englishHint: 'The teacher arrives and starts teaching numbers.',
        words: [
          { phrase: 'Lehrerin', translation: 'teacher (female)', exampleSentence: 'Die Lehrerin kommt herein.', exampleTranslation: 'The teacher comes in.' },
          { phrase: 'herein', translation: 'in', exampleSentence: 'kommt herein', exampleTranslation: 'comes in' },
          { phrase: 'Willkommen', translation: 'Welcome', exampleSentence: 'Willkommen!', exampleTranslation: 'Welcome!' },
          { phrase: 'lernen', translation: 'to learn', exampleSentence: 'wir lernen Zahlen', exampleTranslation: 'we learn numbers' },
        ],
      },
    ],
  },
  {
    id: 'die-verlorene-nachricht',
    title: 'Die verlorene Nachricht',
    slug: 'die-verlorene-nachricht',
    level: 'A2',
    description: 'Minka finds a mysterious message and must solve a puzzle to help her friend.',
    estimatedTimeMinutes: 15,
    sections: [
      {
        orderIndex: 0,
        germanText: 'Minka findet einen Brief auf dem Weg zur Schule. Der Brief ist alt und gelb. Sie öffnet ihn vorsichtig.',
        englishHint: 'Minka finds an old letter on her way to school and opens it carefully.',
        words: [
          { phrase: 'findet', translation: 'finds', exampleSentence: 'Minka findet einen Brief.', exampleTranslation: 'Minka finds a letter.' },
          { phrase: 'Weg', translation: 'way / path', exampleSentence: 'auf dem Weg', exampleTranslation: 'on the way' },
          { phrase: 'Brief', translation: 'letter', exampleSentence: 'einen Brief', exampleTranslation: 'a letter' },
          { phrase: 'vorsichtig', translation: 'carefully', exampleSentence: 'vorsichtig öffnen', exampleTranslation: 'to open carefully' },
        ],
      },
      {
        orderIndex: 1,
        germanText: 'Im Brief steht: "Treffe mich im Park um 3 Uhr. Wichtig!" Minka denkt nach. Wer könnte das sein?',
        englishHint: 'The letter contains a mysterious message asking to meet in the park.',
        words: [
          { phrase: 'steht', translation: 'says / is written', exampleSentence: 'Im Brief steht...', exampleTranslation: 'In the letter it says...' },
          { phrase: 'treffe', translation: 'meet', exampleSentence: 'Treffe mich', exampleTranslation: 'Meet me' },
          { phrase: 'Park', translation: 'park', exampleSentence: 'im Park', exampleTranslation: 'in the park' },
          { phrase: 'Wichtig', translation: 'Important', exampleSentence: 'Wichtig!', exampleTranslation: 'Important!' },
        ],
      },
    ],
  },
  {
    id: 'minka-in-berlin',
    title: 'Minka in Berlin',
    slug: 'minka-in-berlin',
    level: 'A1',
    description: 'Minka visits Berlin for the first time and explores the famous sights.',
    estimatedTimeMinutes: 12,
    sections: [
      {
        orderIndex: 0,
        germanText: 'Minka fährt mit dem Zug nach Berlin. Die Reise dauert zwei Stunden. Sie liest ein Buch.',
        englishHint: 'Minka takes a train to Berlin for a two-hour journey.',
        words: [
          { phrase: 'fährt', translation: 'travels / goes', exampleSentence: 'fährt mit dem Zug', exampleTranslation: 'travels by train' },
          { phrase: 'Zug', translation: 'train', exampleSentence: 'mit dem Zug', exampleTranslation: 'by train' },
          { phrase: 'Reise', translation: 'journey / trip', exampleSentence: 'Die Reise dauert zwei Stunden.', exampleTranslation: 'The journey takes two hours.' },
          { phrase: 'dauert', translation: 'takes / lasts', exampleSentence: 'dauert zwei Stunden', exampleTranslation: 'takes two hours' },
        ],
      },
      {
        orderIndex: 1,
        germanText: 'In Berlin sieht Minka viele interessante Orte. Sie besucht das Brandenburger Tor und den Reichstag.',
        englishHint: 'Minka visits famous landmarks in Berlin.',
        words: [
          { phrase: 'interessante Orte', translation: 'interesting places', exampleSentence: 'viele interessante Orte', exampleTranslation: 'many interesting places' },
          { phrase: 'besucht', translation: 'visits', exampleSentence: 'besucht das Brandenburger Tor', exampleTranslation: 'visits the Brandenburg Gate' },
          { phrase: 'Tor', translation: 'gate', exampleSentence: 'Brandenburger Tor', exampleTranslation: 'Brandenburg Gate' },
        ],
      },
    ],
  },
  {
    id: 'ein-geheimnisvoller-brief',
    title: 'Ein geheimnisvoller Brief',
    slug: 'ein-geheimnisvoller-brief',
    level: 'A2',
    description: 'A mysterious letter arrives that changes everything for Minka and her friends.',
    estimatedTimeMinutes: 18,
    sections: [
      {
        orderIndex: 0,
        germanText: 'Eines Tages kommt ein geheimnisvoller Brief an. Minka öffnet ihn langsam. Der Inhalt ist überraschend.',
        englishHint: 'A mysterious letter arrives one day with surprising contents.',
        words: [
          { phrase: 'Eines Tages', translation: 'One day', exampleSentence: 'Eines Tages kommt ein Brief.', exampleTranslation: 'One day a letter arrives.' },
          { phrase: 'geheimnisvoll', translation: 'mysterious', exampleSentence: 'ein geheimnisvoller Brief', exampleTranslation: 'a mysterious letter' },
          { phrase: 'Inhalt', translation: 'content', exampleSentence: 'Der Inhalt ist überraschend.', exampleTranslation: 'The content is surprising.' },
          { phrase: 'überraschend', translation: 'surprising', exampleSentence: 'ist überraschend', exampleTranslation: 'is surprising' },
        ],
      },
    ],
  },
];

async function seedStories() {
  console.log('🌱 Starting to seed stories...\n');

  for (const story of stories) {
    try {
      // Create story document
      const storyRef = doc(db, 'stories', story.id);
      await setDoc(storyRef, {
        title: story.title,
        slug: story.slug,
        level: story.level,
        description: story.description,
        estimatedTimeMinutes: story.estimatedTimeMinutes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`✅ Created story: ${story.title}`);

      // Create sections as subcollection
      for (const section of story.sections) {
        const sectionRef = doc(collection(db, 'stories', story.id, 'sections'));
        await setDoc(sectionRef, {
          storyId: story.id,
          orderIndex: section.orderIndex,
          germanText: section.germanText,
          englishHint: section.englishHint,
          createdAt: serverTimestamp(),
        });
        console.log(`  ✅ Created section ${section.orderIndex + 1}`);

        // Create words for this section
        for (const word of section.words) {
          const wordRef = doc(collection(db, 'story_words'));
          await setDoc(wordRef, {
            storySectionId: sectionRef.id,
            phrase: word.phrase,
            translation: word.translation,
            exampleSentence: word.exampleSentence,
            exampleTranslation: word.exampleTranslation,
            createdAt: serverTimestamp(),
          });
        }
        console.log(`    ✅ Created ${section.words.length} words for section ${section.orderIndex + 1}`);
      }

      console.log('');
    } catch (error) {
      console.error(`❌ Error seeding story ${story.title}:`, error);
    }
  }

  console.log('✨ Seeding complete!');
  process.exit(0);
}

seedStories().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});

