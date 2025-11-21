/**
 * Seed script to add "Der Brief ohne Namen" story (replaces chapter 1)
 * 
 * Usage:
 * 1. Make sure Firebase is set up and .env.local has Firebase config
 * 2. Run: npx tsx scripts/seed-brief-ohne-namen.ts
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, Timestamp, deleteDoc } from 'firebase/firestore';

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

const story = {
  id: 'minka-ist-neu', // Keep same ID to replace existing story
  title: 'Briefe ohne Namen',
  slug: 'briefe-ohne-namen',
  level: 'A1',
  description: 'Leo bekommt einen geheimnisvollen Brief von einem Mädchen namens Elyra. Die Katze Minka bringt ihm einen verbrannten Umschlag ohne Absender.',
  estimatedTimeMinutes: 7,
  chapter: {
    chapterNumber: 1,
    title: 'Kapitel 1: Der Brief ohne Namen',
    shortSummaryEn: 'Leo gets a mysterious letter from a girl called Elyra. The old post office is on fire, and the cat Minka brings him a burned envelope with his name.',
    estimatedTimeMinutes: 7,
    blocks: [
      {
        orderIndex: 0,
        type: 'TEXT',
        textContent: 'Es ist Abend. Der Himmel ist grau.\n\nLeo sitzt in seinem Zimmer.\n\nAuf dem Tisch liegt ein Brief.\n\nDer Brief ist ein bisschen verbrannt.',
      },
      {
        orderIndex: 1,
        type: 'TEXT',
        textContent: 'Leo öffnet den Brief langsam.\n\nIm Brief steht:\n\n„Wenn ich verschwinde … such mich nicht."',
      },
      {
        orderIndex: 2,
        type: 'TEXT',
        textContent: 'Leo ist schockiert.\n\nDer Brief ist von einem Mädchen.\n\nSie heißt Elyra.\n\nLeo und Elyra schreiben seit einem Jahr Briefe.\n\nAber sie kennen sich nicht persönlich.',
      },
      {
        orderIndex: 3,
        type: 'TEXT',
        textContent: 'Plötzlich hört Leo ein lautes Geräusch.\n\nEr läuft zum Fenster.\n\nDas alte Postamt brennt.\n\nÜberall Feuer und Rauch.',
      },
      {
        orderIndex: 4,
        type: 'TEXT',
        textContent: 'Leo rennt nach draußen.',
      },
      {
        orderIndex: 5,
        type: 'TEXT',
        textContent: 'Vor dem Postamt sitzt eine kleine graue Katze.\n\nSie heißt Minka.\n\nMinka hat einen Umschlag im Maul.',
      },
      {
        orderIndex: 6,
        type: 'TEXT',
        textContent: 'Die Katze legt den Umschlag auf den Boden.\n\nLeo nimmt ihn.\n\nAuf dem Umschlag steht:\n\n„Für Leo"',
      },
      {
        orderIndex: 7,
        type: 'TEXT',
        textContent: 'Aber es gibt keine Adresse.\n\nNur seinen Namen.',
      },
      {
        orderIndex: 8,
        type: 'TEXT',
        textContent: 'Leo ist verwirrt.\n\n„Wer bist du, Elyra?", sagt er leise.',
      },
      {
        orderIndex: 9,
        type: 'TEXT',
        textContent: 'Der Wind weht den Rauch über die Straße.\n\nMinka läuft weg.\n\nLeo steht allein da.\n\nMit dem verbrannten Brief.\n\nUnd einem schlechten Gefühl.',
      },
    ],
    words: [
      {
        phrase: 'Abend',
        translation: 'evening',
        exampleSentence: 'Es ist Abend.',
        exampleTranslation: 'It is evening.',
        isKeyWord: true,
      },
      {
        phrase: 'Himmel',
        translation: 'sky',
        exampleSentence: 'Der Himmel ist grau.',
        exampleTranslation: 'The sky is gray.',
        isKeyWord: true,
      },
      {
        phrase: 'Zimmer',
        translation: 'room',
        exampleSentence: 'Leo sitzt in seinem Zimmer.',
        exampleTranslation: 'Leo sits in his room.',
        isKeyWord: true,
      },
      {
        phrase: 'Tisch',
        translation: 'table',
        exampleSentence: 'Auf dem Tisch liegt ein Brief.',
        exampleTranslation: 'There is a letter on the table.',
        isKeyWord: true,
      },
      {
        phrase: 'Brief',
        translation: 'letter',
        exampleSentence: 'Der Brief ist ein bisschen verbrannt.',
        exampleTranslation: 'The letter is a bit burned.',
        isKeyWord: true,
      },
      {
        phrase: 'Mädchen',
        translation: 'girl',
        exampleSentence: 'Der Brief ist von einem Mädchen.',
        exampleTranslation: 'The letter is from a girl.',
        isKeyWord: true,
      },
      {
        phrase: 'schreiben',
        translation: 'to write',
        exampleSentence: 'Leo und Elyra schreiben seit einem Jahr Briefe.',
        exampleTranslation: 'Leo and Elyra have been writing letters for a year.',
        isKeyWord: true,
      },
      {
        phrase: 'hören',
        translation: 'to hear',
        exampleSentence: 'Plötzlich hört Leo ein lautes Geräusch.',
        exampleTranslation: 'Suddenly Leo hears a loud noise.',
        isKeyWord: true,
      },
      {
        phrase: 'Fenster',
        translation: 'window',
        exampleSentence: 'Er läuft zum Fenster.',
        exampleTranslation: 'He runs to the window.',
        isKeyWord: true,
      },
      {
        phrase: 'Katze',
        translation: 'cat',
        exampleSentence: 'Vor dem Postamt sitzt eine kleine graue Katze.',
        exampleTranslation: 'In front of the post office sits a small grey cat.',
        isKeyWord: true,
      },
      {
        phrase: 'Adresse',
        translation: 'address',
        exampleSentence: 'Aber es gibt keine Adresse.',
        exampleTranslation: 'But there is no address.',
        isKeyWord: true,
      },
      {
        phrase: 'Name',
        translation: 'name',
        exampleSentence: 'Nur seinen Namen.',
        exampleTranslation: 'Only his name.',
        isKeyWord: true,
      },
      {
        phrase: 'allein',
        translation: 'alone',
        exampleSentence: 'Leo steht allein da.',
        exampleTranslation: 'Leo stands there alone.',
        isKeyWord: true,
      },
      {
        phrase: 'Gefühl',
        translation: 'feeling',
        exampleSentence: 'Und einem schlechten Gefühl.',
        exampleTranslation: 'And a bad feeling.',
        isKeyWord: true,
      },
    ],
    exercises: [
      {
        orderIndex: 0,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Choose the correct answer',
        questionText: 'Wie heißt der Junge?',
        options: [
          { optionText: 'Leo', isCorrect: true, orderIndex: 0 },
          { optionText: 'Elyra', isCorrect: false, orderIndex: 1 },
          { optionText: 'Minka', isCorrect: false, orderIndex: 2 },
        ],
      },
      {
        orderIndex: 1,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Choose the correct answer',
        questionText: 'Welches Tier sitzt vor dem Postamt?',
        options: [
          { optionText: 'ein Hund', isCorrect: false, orderIndex: 0 },
          { optionText: 'eine Katze', isCorrect: true, orderIndex: 1 },
          { optionText: 'eine Maus', isCorrect: false, orderIndex: 2 },
        ],
      },
      {
        orderIndex: 2,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Choose the correct answer',
        questionText: 'Was steht auf dem Umschlag?',
        options: [
          { optionText: 'Für Elyra', isCorrect: false, orderIndex: 0 },
          { optionText: 'Für Leo', isCorrect: true, orderIndex: 1 },
          { optionText: 'Für Minka', isCorrect: false, orderIndex: 2 },
        ],
      },
    ],
  },
};

async function seedStory() {
  console.log('🌱 Starting to seed "Der Brief ohne Namen" story...\n');

  // Validate Firebase config
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];

  const missingVars: string[] = [];
  const invalidVars: string[] = [];

  for (const varName of requiredEnvVars) {
    const value = process.env[varName];
    if (!value || value === 'your_value_here' || value.includes('your_')) {
      if (!value) {
        missingVars.push(varName);
      } else {
        invalidVars.push(varName);
      }
    }
  }

  if (missingVars.length > 0 || invalidVars.length > 0) {
    console.error('❌ Firebase configuration is missing or invalid!\n');
    if (missingVars.length > 0) {
      console.error('Missing variables:');
      missingVars.forEach(v => console.error(`  - ${v}`));
    }
    if (invalidVars.length > 0) {
      console.error('\nVariables with placeholder values:');
      invalidVars.forEach(v => console.error(`  - ${v}`));
    }
    console.error('\n📋 Please update .env.local with your actual Firebase configuration values.');
    console.error('   Get them from: https://console.firebase.google.com/');
    console.error('   → Project Settings → Your apps → Web app → Config\n');
    process.exit(1);
  }

  console.log('✅ Firebase configuration validated\n');

  // Test Firestore connection
  try {
    console.log('🔌 Testing Firestore connection...');
    const testRef = doc(db, '_test', 'connection');
    await setDoc(testRef, { test: true, timestamp: Timestamp.now() });
    await deleteDoc(testRef);
    console.log('✅ Firestore connection successful\n');
  } catch (error: any) {
    console.error('❌ Firestore connection failed:', error.message);
    console.error('\nThis could mean:');
    console.error('1. Firestore is not enabled in your Firebase project');
    console.error('2. Your Firebase project ID is incorrect');
    console.error('3. Your internet connection is not working');
    console.error('4. Firestore security rules are blocking access\n');
    process.exit(1);
  }

  try {
    const now = Timestamp.now();
    
    // Validate story ID (must be valid Firestore document ID)
    if (!story.id || story.id.length === 0 || story.id.length > 1500) {
      throw new Error('Invalid story ID');
    }
    
    // Create/update story document first (must exist before subcollections)
    const storyRef = doc(db, 'stories', story.id);
    const storyData = {
      title: story.title || '',
      slug: story.slug || story.id,
      level: story.level || 'A1',
      description: story.description || '',
      estimatedTimeMinutes: story.estimatedTimeMinutes || 7,
      createdAt: now,
      updatedAt: now,
    };
    
    // Remove any undefined values
    Object.keys(storyData).forEach(key => {
      if ((storyData as any)[key] === undefined) {
        delete (storyData as any)[key];
      }
    });
    
    await setDoc(storyRef, storyData, { merge: true });
    console.log(`✅ Created/updated story: ${story.title}`);

    // Get existing chapters to find and replace chapter 1
    // Only query if story document exists
    let existingChapters: any = { docs: [] };
    try {
      const chaptersCollection = collection(db, 'stories', story.id, 'chapters');
      existingChapters = await getDocs(chaptersCollection);
    } catch (error: any) {
      console.log(`  ℹ️  No existing chapters found (this is normal for new stories)`);
    }
    
    // Delete existing chapter 1 if it exists
    for (const chapterDoc of existingChapters.docs) {
      const chapterData = chapterDoc.data();
      if (chapterData.chapterNumber === 1) {
        console.log(`  ⚠️  Found existing chapter 1, deleting it...`);
        try {
          // Delete all subcollections first
          const chapterId = chapterDoc.id;
          
          // Delete blocks
          try {
            const blocksCollection = collection(db, 'stories', story.id, 'chapters', chapterId, 'blocks');
            const blocks = await getDocs(blocksCollection);
            for (const block of blocks.docs) {
              try {
                await deleteDoc(block.ref);
              } catch (err) {
                // Ignore individual delete errors
              }
            }
          } catch (err) {
            // Collection might not exist, that's fine
          }
          
          // Delete words
          try {
            const wordsCollection = collection(db, 'stories', story.id, 'chapters', chapterId, 'words');
            const words = await getDocs(wordsCollection);
            for (const word of words.docs) {
              try {
                await deleteDoc(word.ref);
              } catch (err) {
                // Ignore individual delete errors
              }
            }
          } catch (err) {
            // Collection might not exist, that's fine
          }
          
          // Delete exercises and their options
          try {
            const exercisesCollection = collection(db, 'stories', story.id, 'chapters', chapterId, 'exercises');
            const exercises = await getDocs(exercisesCollection);
            for (const exercise of exercises.docs) {
              try {
                const optionsCollection = collection(db, 'stories', story.id, 'chapters', chapterId, 'exercises', exercise.id, 'options');
                const options = await getDocs(optionsCollection);
                for (const option of options.docs) {
                  try {
                    await deleteDoc(option.ref);
                  } catch (err) {
                    // Ignore individual delete errors
                  }
                }
              } catch (err) {
                // Options collection might not exist
              }
              try {
                await deleteDoc(exercise.ref);
              } catch (err) {
                // Ignore individual delete errors
              }
            }
          } catch (err) {
            // Collection might not exist, that's fine
          }
          
          // Delete chapter
          await deleteDoc(chapterDoc.ref);
          console.log(`  ✅ Deleted existing chapter 1`);
        } catch (error) {
          console.log(`  ⚠️  Error deleting chapter 1, will continue anyway:`, error);
        }
      }
    }

    // Create new chapter document
    const chaptersCollection = collection(db, 'stories', story.id, 'chapters');
    const chapterRef = doc(chaptersCollection);
    const chapterData = {
      storyId: story.id,
      chapterNumber: story.chapter.chapterNumber || 1,
      title: story.chapter.title || '',
      shortSummaryEn: story.chapter.shortSummaryEn || '',
      estimatedTimeMinutes: story.chapter.estimatedTimeMinutes || 7,
      createdAt: now,
      updatedAt: now,
    };
    
    // Remove any undefined values
    Object.keys(chapterData).forEach(key => {
      if ((chapterData as any)[key] === undefined) {
        delete (chapterData as any)[key];
      }
    });
    
    await setDoc(chapterRef, chapterData);
    console.log(`  ✅ Created chapter: ${story.chapter.title}`);

    const chapterId = chapterRef.id;
    
    // Create blocks for the chapter
    const blocksCollection = collection(db, 'stories', story.id, 'chapters', chapterId, 'blocks');
    let blocksCreated = 0;
    for (const block of story.chapter.blocks) {
      try {
        const blockRef = doc(blocksCollection);
        const blockData: any = {
          chapterId: chapterId,
          orderIndex: block.orderIndex || 0,
          type: block.type || 'TEXT',
          createdAt: now,
          updatedAt: now,
        };
        if (block.textContent) {
          blockData.textContent = block.textContent;
        }
        // Ensure no undefined values
        Object.keys(blockData).forEach(key => {
          if (blockData[key] === undefined) {
            delete blockData[key];
          }
        });
        await setDoc(blockRef, blockData);
        blocksCreated++;
      } catch (error) {
        console.error(`      ❌ Error creating block ${block.orderIndex}:`, error);
      }
    }
    console.log(`    ✅ Created ${blocksCreated} blocks`);

    // Create words for the chapter
    const wordsCollection = collection(db, 'stories', story.id, 'chapters', chapterId, 'words');
    let wordsCreated = 0;
    for (const word of story.chapter.words) {
      try {
        const wordRef = doc(wordsCollection);
        const wordData: any = {
          chapterId: chapterId,
          phrase: word.phrase || '',
          translation: word.translation || '',
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
        // Ensure no undefined values
        Object.keys(wordData).forEach(key => {
          if (wordData[key] === undefined) {
            delete wordData[key];
          }
        });
        await setDoc(wordRef, wordData);
        wordsCreated++;
      } catch (error) {
        console.error(`      ❌ Error creating word "${word.phrase}":`, error);
      }
    }
    console.log(`    ✅ Created ${wordsCreated} words`);

    // Create exercises for the chapter
    const exercisesCollection = collection(db, 'stories', story.id, 'chapters', chapterId, 'exercises');
    let exercisesCreated = 0;
    for (const exercise of story.chapter.exercises) {
      try {
        const exerciseRef = doc(exercisesCollection);
        const exerciseData: any = {
          chapterId: chapterId,
          orderIndex: exercise.orderIndex || 0,
          type: exercise.type || 'MULTIPLE_CHOICE',
          prompt: exercise.prompt || '',
          questionText: exercise.questionText || '',
          createdAt: now,
          updatedAt: now,
        };
        // Ensure no undefined values
        Object.keys(exerciseData).forEach(key => {
          if (exerciseData[key] === undefined) {
            delete exerciseData[key];
          }
        });
        await setDoc(exerciseRef, exerciseData);
        exercisesCreated++;
        console.log(`    ✅ Created exercise: ${exercise.questionText}`);

        // Create options for multiple choice exercises
        if (exercise.type === 'MULTIPLE_CHOICE' && exercise.options && exercise.options.length > 0) {
          const optionsCollection = collection(db, 'stories', story.id, 'chapters', chapterId, 'exercises', exerciseRef.id, 'options');
          let optionsCreated = 0;
          for (const option of exercise.options) {
            try {
              const optionRef = doc(optionsCollection);
              const optionData: any = {
                exerciseId: exerciseRef.id,
                optionText: option.optionText || '',
                isCorrect: option.isCorrect !== undefined ? option.isCorrect : false,
                orderIndex: option.orderIndex !== undefined ? option.orderIndex : 0,
              };
              // Ensure no undefined values
              Object.keys(optionData).forEach(key => {
                if (optionData[key] === undefined) {
                  delete optionData[key];
                }
              });
              await setDoc(optionRef, optionData);
              optionsCreated++;
            } catch (error) {
              console.error(`        ❌ Error creating option:`, error);
            }
          }
          console.log(`      ✅ Created ${optionsCreated} options`);
        }
      } catch (error) {
        console.error(`    ❌ Error creating exercise:`, error);
      }
    }
    console.log(`    ✅ Created ${exercisesCreated} exercises`);

    console.log('\n✨ Seeding complete!');
    console.log(`📚 Story available at: /stories/${story.id}`);
    console.log(`📖 Chapter available at: /stories/${story.id}/chapters/1`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding story:', error);
    process.exit(1);
  }
}

// Load environment variables
if (typeof require !== 'undefined') {
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (e) {
    // dotenv not available, assume env vars are set
  }
}

seedStory().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});

