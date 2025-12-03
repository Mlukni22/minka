/**
 * Seed script to add "Minka ist neu" story with new chapter-based structure
 * 
 * Usage:
 * 1. Make sure Firebase is set up and .env.local has Firebase config
 * 2. Run: npx tsx scripts/seed-minka-ist-neu.ts
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

// Load environment variables
if (typeof require !== 'undefined') {
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (e) {
    console.log("❌ An error occured : ",e);
  }
}

const db = getFirestore(app);

const story = {
  id: 'minka-ist-neu',
  title: 'Minka ist neu',
  slug: 'minka-ist-neu',
  level: 'A1',
  description: 'Minka is a little cat who arrives at a new house. She meets Emma the mouse and discovers her new home.',
  estimatedTimeMinutes: 8,
  chapter: {
    chapterNumber: 1,
    title: 'Kapitel 1 – Minka ist neu',
    shortSummaryEn: 'Minka arrives at her new house and meets Emma the mouse.',
    estimatedTimeMinutes: 8,
    blocks: [
      {
        orderIndex: 0,
        type: 'TEXT',
        textContent: 'Minka ist neu\n\nMinka ist eine kleine Katze.\n\nHeute kommt Minka in ein neues Haus.\n\nMinka schaut. Alles ist neu.\n\nIm Haus ist es ruhig.',
      },
      {
        orderIndex: 1,
        type: 'TEXT',
        textContent: 'Minka hat ein kleines Bett.\n\nMinka hat einen Napf.\n\nMinka hat Wasser und Milch.',
      },
      {
        orderIndex: 2,
        type: 'TEXT',
        textContent: 'Da kommt eine kleine Maus.\n\nDie Maus heißt Emma.\n\n„Hallo, ich bin Emma", sagt Emma.\n\nMinka sagt: „Hallo. Ich bin Minka."',
      },
      {
        orderIndex: 3,
        type: 'TEXT',
        textContent: 'Emma zeigt auf die Küche.\n\n„Hier ist deine Milch", sagt Emma.\n\nMinka trinkt. Sie ist froh.',
      },
      {
        orderIndex: 4,
        type: 'TEXT',
        textContent: 'Emma zeigt in den Garten.\n\n„Hier scheint die Sonne", sagt Emma.\n\nMinka sieht Blumen. Minka hört Vögel.\n\nMinka lächelt.\n\n„Ich mag das neue Haus", sagt Minka.',
      },
    ],
    words: [
      {
        phrase: 'die Katze',
        translation: 'cat',
        exampleSentence: 'Minka ist eine kleine Katze.',
        exampleTranslation: 'Minka is a little cat.',
        isKeyWord: true,
      },
      {
        phrase: 'das Haus',
        translation: 'house',
        exampleSentence: 'ein neues Haus',
        exampleTranslation: 'a new house',
        isKeyWord: true,
      },
      {
        phrase: 'neu',
        translation: 'new',
        exampleSentence: 'Alles ist neu.',
        exampleTranslation: 'Everything is new.',
        isKeyWord: true,
      },
      {
        phrase: 'ruhig',
        translation: 'quiet',
        exampleSentence: 'Im Haus ist es ruhig.',
        exampleTranslation: 'In the house it is quiet.',
        isKeyWord: true,
      },
      {
        phrase: 'das Bett',
        translation: 'bed',
        exampleSentence: 'ein kleines Bett',
        exampleTranslation: 'a little bed',
        isKeyWord: true,
      },
      {
        phrase: 'der Napf',
        translation: 'bowl',
        exampleSentence: 'einen Napf',
        exampleTranslation: 'a bowl',
        isKeyWord: true,
      },
      {
        phrase: 'die Maus',
        translation: 'mouse',
        exampleSentence: 'eine kleine Maus',
        exampleTranslation: 'a little mouse',
        isKeyWord: true,
      },
      {
        phrase: 'Hallo',
        translation: 'hello',
        exampleSentence: 'Hallo, ich bin Emma.',
        exampleTranslation: 'Hello, I am Emma.',
        isKeyWord: true,
      },
      {
        phrase: 'Milch',
        translation: 'milk',
        exampleSentence: 'Minka trinkt Milch.',
        exampleTranslation: 'Minka drinks milk.',
        isKeyWord: true,
      },
      {
        phrase: 'trinken',
        translation: 'to drink',
        exampleSentence: 'Minka trinkt.',
        exampleTranslation: 'Minka drinks.',
        isKeyWord: true,
      },
      {
        phrase: 'Sonne',
        translation: 'sun',
        exampleSentence: 'Hier scheint die Sonne.',
        exampleTranslation: 'Here the sun shines.',
        isKeyWord: true,
      },
      {
        phrase: 'Vögel',
        translation: 'birds',
        exampleSentence: 'Minka hört Vögel.',
        exampleTranslation: 'Minka hears birds.',
        isKeyWord: true,
      },
      {
        phrase: 'mögen',
        translation: 'to like',
        exampleSentence: 'Ich mag das neue Haus.',
        exampleTranslation: 'I like the new house.',
        isKeyWord: true,
      },
    ],
    exercises: [
      {
        orderIndex: 0,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Choose the correct answer',
        questionText: 'Was ist Minka?',
        options: [
          { optionText: 'eine Katze', isCorrect: true, orderIndex: 0 },
          { optionText: 'ein Hund', isCorrect: false, orderIndex: 1 },
          { optionText: 'ein Vogel', isCorrect: false, orderIndex: 2 },
        ],
      },
      {
        orderIndex: 1,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Choose the correct answer',
        questionText: 'Wie heißt die Maus?',
        options: [
          { optionText: 'Lara', isCorrect: false, orderIndex: 0 },
          { optionText: 'Emma', isCorrect: true, orderIndex: 1 },
          { optionText: 'Anna', isCorrect: false, orderIndex: 2 },
        ],
      },
      {
        orderIndex: 2,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Choose the correct answer',
        questionText: 'Was trinkt Minka?',
        options: [
          { optionText: 'Wasser', isCorrect: false, orderIndex: 0 },
          { optionText: 'Saft', isCorrect: false, orderIndex: 1 },
          { optionText: 'Milch', isCorrect: true, orderIndex: 2 },
        ],
      },
      {
        orderIndex: 3,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Choose the correct answer',
        questionText: 'Wo scheint die Sonne?',
        options: [
          { optionText: 'im Haus', isCorrect: false, orderIndex: 0 },
          { optionText: 'im Garten', isCorrect: true, orderIndex: 1 },
          { optionText: 'im Keller', isCorrect: false, orderIndex: 2 },
        ],
      },
      {
        orderIndex: 4,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Choose the correct answer',
        questionText: 'Mag Minka das neue Haus?',
        options: [
          { optionText: 'Ja', isCorrect: true, orderIndex: 0 },
          { optionText: 'Nein', isCorrect: false, orderIndex: 1 },
          { optionText: 'Vielleicht', isCorrect: false, orderIndex: 2 },
        ],
      },
    ],
  },
};

async function seedStory() {
  console.log('🌱 Starting to seed "Minka ist neu" story...\n');

  try {
    // Create story document
    const now = Timestamp.now();
    const storyRef = doc(db, 'stories', story.id);
    await setDoc(storyRef, {
      title: story.title,
      slug: story.slug,
      level: story.level,
      description: story.description,
      estimatedTimeMinutes: story.estimatedTimeMinutes,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`✅ Created story: ${story.title}`);

    // Create chapter document
    const chaptersCollection = collection(db, 'stories', story.id, 'chapters');
    const chapterRef = doc(chaptersCollection);
    await setDoc(chapterRef, {
      storyId: story.id,
      chapterNumber: story.chapter.chapterNumber,
      title: story.chapter.title,
      shortSummaryEn: story.chapter.shortSummaryEn,
      estimatedTimeMinutes: story.chapter.estimatedTimeMinutes,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`  ✅ Created chapter: ${story.chapter.title}`);

    const chapterId = chapterRef.id;
    
    // Create blocks for the chapter
    const blocksCollection = collection(db, 'stories', story.id, 'chapters', chapterId, 'blocks');
    for (const block of story.chapter.blocks) {
      try {
        const blockRef = doc(blocksCollection);
        const blockData: any = {
          chapterId: chapterId,
          orderIndex: block.orderIndex,
          type: block.type,
          createdAt: now,
          updatedAt: now,
        };
        if (block.textContent) {
          blockData.textContent = block.textContent;
        }
        await setDoc(blockRef, blockData);
      } catch (error) {
        console.error(`      ❌ Error creating block ${block.orderIndex}:`, error);
      }
    }
    console.log(`    ✅ Created ${story.chapter.blocks.length} blocks`);

    // Create words for the chapter
    const wordsCollection = collection(db, 'stories', story.id, 'chapters', chapterId, 'words');
    for (const word of story.chapter.words) {
      try {
        const wordRef = doc(wordsCollection);
        const wordData: any = {
          chapterId: chapterId,
          phrase: word.phrase,
          translation: word.translation,
          isKeyWord: word.isKeyWord !== undefined ? word.isKeyWord : true,
          createdAt: now,
          updatedAt: now,
        };
        if (word.exampleSentence) {
          wordData.exampleSentence = word.exampleSentence;
        }
        if (word.exampleTranslation) {
          wordData.exampleTranslation = word.exampleTranslation;
        }
        await setDoc(wordRef, wordData);
      } catch (error) {
        console.error(`      ❌ Error creating word "${word.phrase}":`, error);
      }
    }
    console.log(`    ✅ Created ${story.chapter.words.length} words`);

    // Create exercises for the chapter
    const exercisesCollection = collection(db, 'stories', story.id, 'chapters', chapterId, 'exercises');
    for (const exercise of story.chapter.exercises) {
      try {
        const exerciseRef = doc(exercisesCollection);
        const exerciseData: any = {
          chapterId: chapterId,
          orderIndex: exercise.orderIndex,
          type: exercise.type,
          prompt: exercise.prompt,
          questionText: exercise.questionText,
          createdAt: now,
          updatedAt: now,
        };
        // Only add correctAnswer if it exists (for gap fill/translation exercises)
        await setDoc(exerciseRef, exerciseData);
        console.log(`    ✅ Created exercise: ${exercise.questionText}`);

        // Create options for multiple choice exercises
        if (exercise.type === 'MULTIPLE_CHOICE' && exercise.options) {
          const optionsCollection = collection(db, 'stories', story.id, 'chapters', chapterId, 'exercises', exerciseRef.id, 'options');
          for (const option of exercise.options) {
            try {
              const optionRef = doc(optionsCollection);
              await setDoc(optionRef, {
                exerciseId: exerciseRef.id,
                optionText: option.optionText,
                isCorrect: option.isCorrect || false,
                orderIndex: option.orderIndex || 0,
              });
            } catch (error) {
              console.error(`        ❌ Error creating option:`, error);
            }
          }
          console.log(`      ✅ Created ${exercise.options.length} options`);
        }
      } catch (error) {
        console.error(`    ❌ Error creating exercise:`, error);
      }
    }

    console.log('\n✨ Seeding complete!');
    console.log(`📚 Story available at: /stories/${story.id}`);
    console.log(`📖 Chapter available at: /stories/${story.id}/chapters/1`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding story:', error);
    process.exit(1);
  }
}

seedStory().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});

