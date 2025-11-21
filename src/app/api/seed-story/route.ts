import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';

const story = {
  id: 'minka-ist-neu',
  title: 'Minka und die Nacht',
  slug: 'minka-und-die-nacht',
  level: 'A1',
  description: 'Nora und ihre Katze Minka hören ein Geräusch in der Nacht. Minka geht zur Tür, aber niemand ist da.',
  estimatedTimeMinutes: 8,
  chapter: {
    chapterNumber: 1,
    title: 'Episode 1 – Minka und die Nacht',
    shortSummaryEn: 'Nora and her cat Minka hear a noise in the night. Minka goes to the door, but no one is there.',
    estimatedTimeMinutes: 8,
    blocks: [
      {
        orderIndex: 0,
        type: 'TEXT',
        textContent: 'Es ist Nacht. Das Zimmer ist leise.\n\nNora sitzt auf ihrem Bett.\n\nIhre Katze Minka liegt neben ihr.',
      },
      {
        orderIndex: 1,
        type: 'TEXT',
        textContent: 'Draußen ist dunkel. Der Mond scheint.\n\nNora schaut auf ihr Handy.\n\nSie schreibt ihrer Freundin Lara.',
      },
      {
        orderIndex: 2,
        type: 'TEXT',
        textContent: 'Nora hört ein kleines Geräusch.\n\nEs kommt von der Tür.\n\nMinka steht auf. Sie sieht zur Tür.',
      },
      {
        orderIndex: 3,
        type: 'TEXT',
        textContent: '„Ist da jemand?", fragt Nora.\n\nIhr Herz macht boom-boom. Sie hat Angst.',
      },
      {
        orderIndex: 4,
        type: 'TEXT',
        textContent: 'Minka geht langsam zur Tür.\n\nIhr Schwanz ist hoch.\n\nSie miaut leise.',
      },
      {
        orderIndex: 5,
        type: 'TEXT',
        textContent: 'Nora steht auch auf.\n\nSie geht barfuß zum Flur.\n\nDer Flur ist kalt und grau.',
      },
      {
        orderIndex: 6,
        type: 'TEXT',
        textContent: 'Sie öffnet die Tür.\n\nNiemand steht im Flur.\n\nNur ein langer, leerer Gang.',
      },
      {
        orderIndex: 7,
        type: 'TEXT',
        textContent: 'Minka schnuppert am Boden.\n\nSie kratzt leicht an der Wand.\n\nNora sieht nichts Besonderes.',
      },
      {
        orderIndex: 8,
        type: 'TEXT',
        textContent: '„Vielleicht ist es nur der Wind", sagt sie.\n\nAber Minka sieht noch immer zur Wand.\n\nIhre Augen sind groß und aufmerksam.',
      },
      {
        orderIndex: 9,
        type: 'TEXT',
        textContent: 'Nora schließt langsam die Tür.\n\nSie legt sich wieder ins Bett.\n\nMinka legt sich an ihre Füße.',
      },
      {
        orderIndex: 10,
        type: 'TEXT',
        textContent: 'Nora macht das Licht aus.\n\nSie sieht lange in die Dunkelheit.\n\nDas Geräusch kommt nicht noch einmal.\n\nAber die Angst bleibt in ihrem Bauch.',
      },
    ],
    words: [
      { phrase: 'die Nacht', translation: 'night', exampleSentence: 'Es ist Nacht.', exampleTranslation: 'It is night.', isKeyWord: true },
      { phrase: 'das Zimmer', translation: 'room', exampleSentence: 'Das Zimmer ist leise.', exampleTranslation: 'The room is quiet.', isKeyWord: true },
      { phrase: 'die Katze', translation: 'cat', exampleSentence: 'Ihre Katze Minka liegt neben ihr.', exampleTranslation: 'Her cat Minka lies next to her.', isKeyWord: true },
      { phrase: 'das Geräusch', translation: 'noise', exampleSentence: 'Nora hört ein kleines Geräusch.', exampleTranslation: 'Nora hears a small noise.', isKeyWord: true },
      { phrase: 'das Handy', translation: 'phone', exampleSentence: 'Nora schaut auf ihr Handy.', exampleTranslation: 'Nora looks at her phone.', isKeyWord: true },
      { phrase: 'das Icon', translation: 'app icon', exampleSentence: 'Das Icon ist klein.', exampleTranslation: 'The app icon is small.', isKeyWord: true },
      { phrase: 'die Tür', translation: 'door', exampleSentence: 'Es kommt von der Tür.', exampleTranslation: 'It comes from the door.', isKeyWord: true },
      { phrase: 'finden', translation: 'to find', exampleSentence: 'Nora findet nichts.', exampleTranslation: 'Nora finds nothing.', isKeyWord: true },
      { phrase: 'Angst', translation: 'fear', exampleSentence: 'Sie hat Angst.', exampleTranslation: 'She has fear.', isKeyWord: true },
      { phrase: 'öffnen', translation: 'to open', exampleSentence: 'Sie öffnet die Tür.', exampleTranslation: 'She opens the door.', isKeyWord: true },
      { phrase: 'der Flur', translation: 'hallway', exampleSentence: 'Sie geht barfuß zum Flur.', exampleTranslation: 'She goes barefoot to the hallway.', isKeyWord: true },
      { phrase: 'barfuß', translation: 'barefoot', exampleSentence: 'Sie geht barfuß zum Flur.', exampleTranslation: 'She goes barefoot to the hallway.', isKeyWord: true },
      { phrase: 'die Dunkelheit', translation: 'darkness', exampleSentence: 'Sie sieht lange in die Dunkelheit.', exampleTranslation: 'She looks long into the darkness.', isKeyWord: true },
      { phrase: 'aufmerksam', translation: 'attentive', exampleSentence: 'Ihre Augen sind groß und aufmerksam.', exampleTranslation: 'Her eyes are big and attentive.', isKeyWord: true },
      { phrase: 'ängstlich', translation: 'anxious', exampleSentence: 'Sie ist ängstlich.', exampleTranslation: 'She is anxious.', isKeyWord: true },
    ],
    exercises: [
      {
        orderIndex: 0,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Choose the correct answer',
        questionText: 'Wo ist Nora am Anfang?',
        options: [
          { optionText: 'im Flur', isCorrect: false, orderIndex: 0 },
          { optionText: 'auf ihrem Bett', isCorrect: true, orderIndex: 1 },
          { optionText: 'an der Tür', isCorrect: false, orderIndex: 2 },
          { optionText: 'im Garten', isCorrect: false, orderIndex: 3 },
        ],
      },
      {
        orderIndex: 1,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Choose the correct answer',
        questionText: 'Was macht Minka bei der Tür?',
        options: [
          { optionText: 'Sie schläft', isCorrect: false, orderIndex: 0 },
          { optionText: 'Sie schnuppert und kratzt', isCorrect: true, orderIndex: 1 },
          { optionText: 'Sie läuft weg', isCorrect: false, orderIndex: 2 },
          { optionText: 'Sie miaut laut', isCorrect: false, orderIndex: 3 },
        ],
      },
      {
        orderIndex: 2,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Choose the correct answer',
        questionText: 'Warum hat Nora Angst?',
        options: [
          { optionText: 'Weil es dunkel ist', isCorrect: false, orderIndex: 0 },
          { optionText: 'Weil sie ein Geräusch hört', isCorrect: true, orderIndex: 1 },
          { optionText: 'Weil Minka miaut', isCorrect: false, orderIndex: 2 },
          { optionText: 'Weil sie müde ist', isCorrect: false, orderIndex: 3 },
        ],
      },
    ],
  },
};

export async function POST() {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 });
    }

    const now = Timestamp.now();

    // Delete existing chapter 1 if it exists (to replace it)
    try {
      const chaptersCollection = collection(db, 'stories', story.id, 'chapters');
      const existingChapters = await getDocs(chaptersCollection);
      
      for (const chapterDoc of existingChapters.docs) {
        const chapterData = chapterDoc.data();
        if (chapterData.chapterNumber === 1) {
          const chapterId = chapterDoc.id;
          
          // Delete blocks
          const blocksCollection = collection(db, 'stories', story.id, 'chapters', chapterId, 'blocks');
          const blocks = await getDocs(blocksCollection);
          for (const block of blocks.docs) {
            await deleteDoc(block.ref);
          }
          
          // Delete words
          const wordsCollection = collection(db, 'stories', story.id, 'chapters', chapterId, 'words');
          const words = await getDocs(wordsCollection);
          for (const word of words.docs) {
            await deleteDoc(word.ref);
          }
          
          // Delete exercises and options
          const exercisesCollection = collection(db, 'stories', story.id, 'chapters', chapterId, 'exercises');
          const exercises = await getDocs(exercisesCollection);
          for (const exercise of exercises.docs) {
            const optionsCollection = collection(db, 'stories', story.id, 'chapters', chapterId, 'exercises', exercise.id, 'options');
            const options = await getDocs(optionsCollection);
            for (const option of options.docs) {
              await deleteDoc(option.ref);
            }
            await deleteDoc(exercise.ref);
          }
          
          // Delete chapter
          await deleteDoc(chapterDoc.ref);
        }
      }
    } catch (error) {
      // Chapter might not exist, that's fine
    }

    // Create/update story document
    const storyRef = doc(db, 'stories', story.id);
    await setDoc(storyRef, {
      title: story.title,
      slug: story.slug,
      level: story.level,
      description: story.description,
      estimatedTimeMinutes: story.estimatedTimeMinutes,
      createdAt: now,
      updatedAt: now,
    }, { merge: true });

    // Create chapter document
    const chapterRef = doc(collection(db, 'stories', story.id, 'chapters'));
    await setDoc(chapterRef, {
      storyId: story.id,
      chapterNumber: story.chapter.chapterNumber,
      title: story.chapter.title,
      shortSummaryEn: story.chapter.shortSummaryEn,
      estimatedTimeMinutes: story.chapter.estimatedTimeMinutes,
      createdAt: now,
      updatedAt: now,
    });

    const chapterId = chapterRef.id;

    // Create blocks
    const blocksCollection = collection(db, 'stories', story.id, 'chapters', chapterId, 'blocks');
    for (const block of story.chapter.blocks) {
      const blockRef = doc(blocksCollection);
      await setDoc(blockRef, {
        chapterId: chapterId,
        orderIndex: block.orderIndex,
        type: block.type,
        textContent: block.textContent,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Create words
    const wordsCollection = collection(db, 'stories', story.id, 'chapters', chapterId, 'words');
    for (const word of story.chapter.words) {
      const wordRef = doc(wordsCollection);
      const wordData: any = {
        chapterId: chapterId,
        phrase: word.phrase,
        translation: word.translation,
        isKeyWord: word.isKeyWord,
        createdAt: now,
        updatedAt: now,
      };
      if (word.exampleSentence) wordData.exampleSentence = word.exampleSentence;
      if (word.exampleTranslation) wordData.exampleTranslation = word.exampleTranslation;
      await setDoc(wordRef, wordData);
    }

    // Create exercises
    const exercisesCollection = collection(db, 'stories', story.id, 'chapters', chapterId, 'exercises');
    for (const exercise of story.chapter.exercises) {
      const exerciseRef = doc(exercisesCollection);
      await setDoc(exerciseRef, {
        chapterId: chapterId,
        orderIndex: exercise.orderIndex,
        type: exercise.type,
        prompt: exercise.prompt,
        questionText: exercise.questionText,
        createdAt: now,
        updatedAt: now,
      });

      // Create options
      if (exercise.type === 'MULTIPLE_CHOICE' && exercise.options) {
        const optionsCollection = collection(db, 'stories', story.id, 'chapters', chapterId, 'exercises', exerciseRef.id, 'options');
        for (const option of exercise.options) {
          const optionRef = doc(optionsCollection);
          await setDoc(optionRef, {
            exerciseId: exerciseRef.id,
            optionText: option.optionText,
            isCorrect: option.isCorrect,
            orderIndex: option.orderIndex,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Story seeded successfully',
      storyId: story.id,
    });
  } catch (error: any) {
    console.error('Error seeding story:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to seed story' },
      { status: 500 }
    );
  }
}

