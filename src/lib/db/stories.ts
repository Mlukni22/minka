import { collection, doc, getDoc, getDocs, query, where, setDoc, serverTimestamp, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Story,
  StoryChapter,
  StorySection,
  StoryBlock,
  StoryWord,
  ChapterExercise,
  ChapterExerciseOption,
  StoryLevel,
} from '@/types/story';

const getDb = () => {
  if (!db) throw new Error('Firestore not initialized');
  return db;
};

// ==================== STORIES ====================

/**
 * Get all stories
 */
export async function getAllStories(): Promise<Story[]> {
  try {
    const storiesRef = collection(getDb(), 'stories');
    const snapshot = await getDocs(storiesRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Story[];
  } catch (error) {
    console.error('Error getting stories:', error);
    return [];
  }
}

/**
 * Get stories by level
 */
export async function getStoriesByLevel(level: StoryLevel): Promise<Story[]> {
  try {
    const storiesRef = collection(getDb(), 'stories');
    const q = query(storiesRef, where('level', '==', level));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Story[];
  } catch (error) {
    console.error('Error getting stories by level:', error);
    return [];
  }
}

/**
 * Get a single story by ID
 */
export async function getStoryById(storyId: string): Promise<Story | null> {
  try {
    const storyRef = doc(getDb(), 'stories', storyId);
    const storyDoc = await getDoc(storyRef);
    
    if (storyDoc.exists()) {
      const data = storyDoc.data();
      return {
        id: storyDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Story;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting story:', error);
    return null;
  }
}

// ==================== CHAPTERS ====================

/**
 * Get all chapters for a story
 */
export async function getStoryChapters(storyId: string): Promise<StoryChapter[]> {
  try {
    const chaptersRef = collection(getDb(), 'stories', storyId, 'chapters');
    const q = query(chaptersRef, orderBy('chapterNumber', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        storyId: data.storyId,
        chapterNumber: data.chapterNumber,
        title: data.title,
        shortSummaryEn: data.shortSummaryEn,
        estimatedTimeMinutes: data.estimatedTimeMinutes,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }) as StoryChapter[];
  } catch (error) {
    console.error('Error getting story chapters:', error);
    return [];
  }
}

/**
 * Get a single chapter by ID
 */
export async function getChapterById(storyId: string, chapterId: string): Promise<StoryChapter | null> {
  try {
    const chapterRef = doc(getDb(), 'stories', storyId, 'chapters', chapterId);
    const chapterDoc = await getDoc(chapterRef);
    
    if (chapterDoc.exists()) {
      const data = chapterDoc.data();
      return {
        id: chapterDoc.id,
        storyId: data.storyId,
        chapterNumber: data.chapterNumber,
        title: data.title,
        shortSummaryEn: data.shortSummaryEn,
        estimatedTimeMinutes: data.estimatedTimeMinutes,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting chapter:', error);
    return null;
  }
}

/**
 * Get chapter by story ID and chapter number
 */
export async function getChapterByNumber(storyId: string, chapterNumber: number): Promise<StoryChapter | null> {
  try {
    const chaptersRef = collection(getDb(), 'stories', storyId, 'chapters');
    const q = query(chaptersRef, where('chapterNumber', '==', chapterNumber));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      storyId: data.storyId,
      chapterNumber: data.chapterNumber,
      title: data.title,
      shortSummaryEn: data.shortSummaryEn,
      estimatedTimeMinutes: data.estimatedTimeMinutes,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error getting chapter by number:', error);
    return null;
  }
}

// ==================== SECTIONS ====================

/**
 * Get all sections for a chapter
 */
export async function getChapterSections(storyId: string, chapterId: string): Promise<StorySection[]> {
  try {
    const sectionsRef = collection(getDb(), 'stories', storyId, 'chapters', chapterId, 'sections');
    const q = query(sectionsRef, orderBy('orderIndex', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        chapterId: data.chapterId,
        orderIndex: data.orderIndex || 0,
        germanText: data.germanText,
        englishHint: data.englishHint,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }) as StorySection[];
  } catch (error) {
    console.error('Error getting chapter sections:', error);
    return [];
  }
}

// ==================== BLOCKS ====================

/**
 * Get all blocks for a chapter (text and image blocks)
 */
export async function getChapterBlocks(storyId: string, chapterId: string): Promise<StoryBlock[]> {
  try {
    const blocksRef = collection(getDb(), 'stories', storyId, 'chapters', chapterId, 'blocks');
    const q = query(blocksRef, orderBy('orderIndex', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        chapterId: data.chapterId,
        orderIndex: data.orderIndex || 0,
        type: data.type as 'TEXT' | 'IMAGE',
        textContent: data.textContent,
        imageUrl: data.imageUrl,
        imageAlt: data.imageAlt,
        caption: data.caption,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }) as StoryBlock[];
  } catch (error) {
    console.error('Error getting chapter blocks:', error);
    return [];
  }
}

// ==================== WORDS ====================

/**
 * Get all words for a chapter
 */
export async function getChapterWords(storyId: string, chapterId: string): Promise<StoryWord[]> {
  try {
    const wordsRef = collection(getDb(), 'stories', storyId, 'chapters', chapterId, 'words');
    const snapshot = await getDocs(wordsRef);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        chapterId: data.chapterId,
        sectionId: data.sectionId,
        phrase: data.phrase,
        translation: data.translation,
        exampleSentence: data.exampleSentence,
        exampleTranslation: data.exampleTranslation,
        imageUrl: data.imageUrl,
        imageAlt: data.imageAlt,
        isKeyWord: data.isKeyWord !== undefined ? data.isKeyWord : true,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }) as StoryWord[];
  } catch (error) {
    console.error('Error getting chapter words:', error);
    return [];
  }
}

/**
 * Get key words for a chapter (isKeyWord = true)
 */
export async function getChapterKeyWords(storyId: string, chapterId: string): Promise<StoryWord[]> {
  const allWords = await getChapterWords(storyId, chapterId);
  return allWords.filter(word => word.isKeyWord);
}

// ==================== EXERCISES ====================

/**
 * Get all exercises for a chapter
 */
export async function getChapterExercises(storyId: string, chapterId: string): Promise<ChapterExercise[]> {
  try {
    const exercisesRef = collection(getDb(), 'stories', storyId, 'chapters', chapterId, 'exercises');
    const q = query(exercisesRef, orderBy('orderIndex', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        chapterId: data.chapterId,
        orderIndex: data.orderIndex || 0,
        type: data.type as 'MULTIPLE_CHOICE' | 'GAP_FILL' | 'TRANSLATION_SIMPLE',
        prompt: data.prompt,
        questionText: data.questionText,
        correctAnswer: data.correctAnswer,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }) as ChapterExercise[];
  } catch (error) {
    console.error('Error getting chapter exercises:', error);
    return [];
  }
}

/**
 * Get all options for an exercise
 */
export async function getExerciseOptions(storyId: string, chapterId: string, exerciseId: string): Promise<ChapterExerciseOption[]> {
  try {
    const optionsRef = collection(getDb(), 'stories', storyId, 'chapters', chapterId, 'exercises', exerciseId, 'options');
    const q = query(optionsRef, orderBy('orderIndex', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        exerciseId: data.exerciseId,
        optionText: data.optionText,
        isCorrect: data.isCorrect || false,
        orderIndex: data.orderIndex || 0,
      };
    }) as ChapterExerciseOption[];
  } catch (error) {
    console.error('Error getting exercise options:', error);
    return [];
  }
}

// Legacy functions for backward compatibility

/**
 * Get all sections for a story (legacy - for backward compatibility)
 * @deprecated Use getChapterSections instead
 */
export async function getStorySections(storyId: string): Promise<StorySection[]> {
  try {
    const sectionsRef = collection(getDb(), 'stories', storyId, 'sections');
    const snapshot = await getDocs(sectionsRef);
    
    return snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          chapterId: data.chapterId || storyId,
          orderIndex: data.orderIndex || 0,
          germanText: data.germanText,
          englishHint: data.englishHint,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      })
      .sort((a, b) => a.orderIndex - b.orderIndex) as StorySection[];
  } catch (error) {
    console.error('Error getting story sections:', error);
    return [];
  }
}

/**
 * Get words for a story section (legacy - for backward compatibility)
 * @deprecated Use getChapterWords instead
 */
export async function getStoryWords(sectionId: string): Promise<StoryWord[]> {
  try {
    const wordsRef = collection(getDb(), 'story_words');
    const q = query(wordsRef, where('storySectionId', '==', sectionId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as StoryWord[];
  } catch (error) {
    console.error('Error getting story words:', error);
    return [];
  }
}
