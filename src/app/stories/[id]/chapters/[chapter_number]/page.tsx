'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { onAuthChange } from '@/lib/auth';
import { 
  getStoryById, 
  getStoryChapters, 
  getChapterByNumber, 
  getChapterBlocks, 
  getChapterWords 
} from '@/lib/db/stories';
import { 
  getUserStoryProgress, 
  updateUserStoryProgress,
  getUserChapterProgress,
  updateUserChapterProgress 
} from '@/lib/db/user-progress';
import { updateUserData, getUserData, awardXP, incrementStoriesCompleted } from '@/lib/db/user';
import { addFlashcard, flashcardExists, createFlashcardWithContext, flashcardExistsForStoryWord, flashcardExistsByFrontText } from '@/lib/db/flashcards';
import { Story, StoryChapter, StoryBlock, StoryWord, UserStoryProgress, UserChapterProgress } from '@/types/story';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getTranslation, getTranslationWithFallback } from '@/lib/translations';

export default function ChapterReaderPage() {
  const router = useRouter();
  const params = useParams();
  const storyId = params.id as string;
  const chapterNumber = parseInt(params.chapter_number as string, 10);

  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<StoryChapter[]>([]);
  const [chapter, setChapter] = useState<StoryChapter | null>(null);
  const [blocks, setBlocks] = useState<StoryBlock[]>([]);
  const [words, setWords] = useState<StoryWord[]>([]);
  const [storyProgress, setStoryProgress] = useState<UserStoryProgress | null>(null);
  const [chapterProgress, setChapterProgress] = useState<UserChapterProgress | null>(null);
  const [clickedWords, setClickedWords] = useState<Set<string>>(new Set());
  const [clickedOccurrences, setClickedOccurrences] = useState<Set<string>>(new Set()); // Track specific occurrences by unique ID
  const [wordTranslations, setWordTranslations] = useState<Map<string, string>>(new Map());
  const [addedToFlashcards, setAddedToFlashcards] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [chapterCompleted, setChapterCompleted] = useState(false);
  const [storyCompleted, setStoryCompleted] = useState(false);
  const [wordsAdded, setWordsAdded] = useState(0);
  const [xpAwarded, setXpAwarded] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/auth/login');
        return;
      }

      setUserId(firebaseUser.uid);
      await loadChapterData(firebaseUser.uid);
    });

    return () => unsubscribe();
  }, [router, storyId, chapterNumber]);


  // Force re-render when clickedWords or addedToFlashcards changes
  const [renderKey, setRenderKey] = useState(0);
  const [flashcardMessage, setFlashcardMessage] = useState<string | null>(null);
  
  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [clickedWords, addedToFlashcards]);

  const loadChapterData = async (uid: string) => {
    try {
      const [storyData, chaptersData, chapterData, blocksData, wordsData, progress, chProgress] = await Promise.all([
        getStoryById(storyId),
        getStoryChapters(storyId),
        getChapterByNumber(storyId, chapterNumber),
        getChapterByNumber(storyId, chapterNumber).then(ch => ch ? getChapterBlocks(storyId, ch.id) : []),
        getChapterByNumber(storyId, chapterNumber).then(ch => ch ? getChapterWords(storyId, ch.id) : []),
        getUserStoryProgress(uid, storyId),
        getChapterByNumber(storyId, chapterNumber).then(ch => ch ? getUserChapterProgress(uid, ch.id) : null),
      ]);

      if (!storyData || !chapterData) {
        router.push(`/stories/${storyId}`);
        return;
      }

      setStory(storyData);
      setChapters(chaptersData);
      setChapter(chapterData);
      setBlocks(blocksData);
      setWords(wordsData);
      setStoryProgress(progress);
      setChapterProgress(chProgress);
      
      // Load existing flashcards for this user
      if (uid) {
        const existingFlashcards = new Set<string>();
        for (const word of wordsData) {
          const exists = await flashcardExists(uid, word.id);
          if (exists) {
            existingFlashcards.add(word.id);
          }
        }
        setAddedToFlashcards(existingFlashcards);
      }
      
      // Debug: Log words with images
      console.log('=== WORDS DEBUG ===');
      console.log('Total words loaded:', wordsData.length);
      wordsData.forEach(word => {
        if (word.imageUrl) {
          console.log('✅ Word with image:', word.phrase, 'Image URL:', word.imageUrl);
        } else {
          console.log('❌ Word without image:', word.phrase, 'Full word data:', word);
        }
      });
      console.log('==================');


      // Mark chapter as READING if not started
      if (!chProgress) {
        const newProgress: UserChapterProgress = {
          id: chapterData.id,
          userId: uid,
          chapterId: chapterData.id,
          status: 'READING',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await updateUserChapterProgress(newProgress);
        setChapterProgress(newProgress);
      } else if (chProgress.status === 'NOT_STARTED') {
        const updatedProgress = { ...chProgress, status: 'READING' as const };
        await updateUserChapterProgress(updatedProgress);
        setChapterProgress(updatedProgress);
      }

      // Update story progress to current chapter
      if (!progress) {
        const newStoryProgress: UserStoryProgress = {
          id: `${uid}_${storyId}`,
          userId: uid,
          storyId: storyId,
          currentChapterNumber: chapterNumber,
          completed: false,
          lastAccessedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await updateUserStoryProgress(newStoryProgress);
        setStoryProgress(newStoryProgress);
      } else if (!progress.currentChapterNumber || progress.currentChapterNumber < chapterNumber) {
        const updatedProgress = { ...progress, currentChapterNumber: chapterNumber, lastAccessedAt: new Date() };
        await updateUserStoryProgress(updatedProgress);
        setStoryProgress(updatedProgress);
      }

      // Check if chapter is completed
      if (chProgress?.status === 'COMPLETED') {
        setChapterCompleted(true);
      }
    } catch (error) {
      console.error('Error loading chapter:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWordClick = async (wordPhrase: string, wordTranslation?: string, wordId?: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const wordKey = wordPhrase.toLowerCase();
    
    // Get translation - check vocabulary first, then translation dictionary
    let translation = wordTranslation;
    if (!translation) {
      // Check if this word matches any vocabulary word (by full phrase or base word)
      const vocabWord = words.find(w => {
        const wPhraseLower = w.phrase.toLowerCase();
        const wBaseWord = wPhraseLower.replace(/^(der|die|das|ein|eine|dem|den|des|deren|dessen)\s+/, '').trim();
        return wPhraseLower === wordKey || wBaseWord === wordKey;
      });
      if (vocabWord) {
        translation = vocabWord.translation;
      } else {
        // Try to get translation from dictionary
        const dictTranslation = getTranslation(wordPhrase);
        if (dictTranslation) {
          translation = dictTranslation;
        }
      }
    }
    
    // Show translation above the word - track the specific occurrence that was clicked
    // Generate a unique ID for this occurrence based on the element's position
    const baseWordKey = wordPhrase.replace(/^(der|die|das|ein|eine|dem|den|des|deren|dessen)\s+/i, '').trim().toLowerCase();
    
    // Get the unique occurrence ID from the clicked element (if available)
    let occurrenceId = '';
    if (event?.target) {
      const target = event.target as HTMLElement;
      // First try to get from the target itself (set by click handler)
      occurrenceId = target.getAttribute('data-clicked-occurrence-id') || '';
      
      // If not found, try to get from the closest word element
      if (!occurrenceId) {
        const wordElement = target.closest('.clickable-word') as HTMLElement;
        if (wordElement) {
          occurrenceId = wordElement.getAttribute('data-occurrence-id') || '';
        }
      }
    }
    
    // Track both the specific occurrence AND the word (for highlighting all occurrences)
    // First, track the specific occurrence (for showing tooltip on clicked one only)
    // Toggle behavior: if already clicked, remove it; otherwise add it
    const wasAlreadyClicked = occurrenceId ? clickedOccurrences.has(occurrenceId) : false;
    
    if (occurrenceId) {
      setClickedOccurrences(prev => {
        const newSet = new Set(prev);
        if (newSet.has(occurrenceId)) {
          // Already clicked, remove it (toggle off)
          newSet.delete(occurrenceId);
        } else {
          // Not clicked, add it (toggle on)
          newSet.add(occurrenceId);
        }
        return newSet;
      });
    }
    
    // Also track the word at word level (so ALL occurrences get highlighted)
    // If toggling off and no other occurrences are clicked, remove word-level highlight
    const keysToAdd = new Set([wordKey, baseWordKey, wordPhrase]);
    if (wordId) {
      keysToAdd.add(wordId);
    }
    
    if (wasAlreadyClicked) {
      // Toggling off - check if there are other occurrences still clicked
      const hasOtherOccurrences = Array.from(clickedOccurrences).some(id => 
        id !== occurrenceId && (
          id.includes(wordKey) || 
          id.includes(baseWordKey) || 
          (wordId && id.startsWith(wordId))
        )
      );
      
      // If no other occurrences are clicked, remove word-level highlight
      if (!hasOtherOccurrences) {
        setClickedWords(prev => {
          const newSet = new Set(prev);
          keysToAdd.forEach(key => newSet.delete(key));
          return newSet;
        });
      }
    } else {
      // Toggling on - add word-level highlight
      setClickedWords(prev => new Set([...prev, ...Array.from(keysToAdd)]));
    }
    
    // Always set translation (so tooltip appears)
    // If no translation found, try one more time with getTranslationWithFallback
    if (!translation) {
      translation = getTranslationWithFallback(wordPhrase, `[${wordPhrase}]`);
    }
    
    // Store translation under multiple keys so all occurrences can find it
    setWordTranslations(prev => {
      const newMap = new Map(prev);
      const finalTranslation = translation || `[${wordPhrase}]`;
      
      // Store under all possible keys
      newMap.set(wordKey, finalTranslation);
      newMap.set(baseWordKey, finalTranslation);
      newMap.set(wordPhrase.toLowerCase(), finalTranslation);
      if (wordId) {
        newMap.set(wordId, finalTranslation);
      }
      
      return newMap;
    });
    
    // Force re-render to show translation
    setRenderKey(prev => prev + 1);
    
    console.log('Word clicked:', wordPhrase, 'Translation:', translation || 'not found', 'WordKey:', wordKey);
    
    // Add to flashcards - ONLY if translation is available
    if (!userId || !story || !chapter) return;
    
    // REQUIRE translation before creating flashcard
    if (!translation || translation.startsWith('[') || translation === `[${wordPhrase}]`) {
      console.warn('[Story Reader] Cannot create flashcard - missing translation:', {
        wordPhrase,
        translation,
        wordId,
      });
      return;
    }
    
    // Helper to find context sentence from blocks
    const findContextSentence = (targetWord: string): string => {
      const textBlocks = blocks.filter(b => b.type === 'TEXT' && b.textContent);
      const allText = textBlocks.map(b => b.textContent).join(' ');
      
      // Try to find a sentence containing the word
      const escapedWord = targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const sentenceRegex = new RegExp(`[^.!?]*\\b${escapedWord}\\b[^.!?]*[.!?]`, 'i');
      const match = allText.match(sentenceRegex);
      return match ? match[0].trim() : targetWord;
    };
    
    try {
      // If it's a vocabulary word with an ID
      if (wordId) {
        // Check if already added in this session first (faster check)
        if (addedToFlashcards.has(wordId)) {
          // Already added in this session - don't show message again
          return;
        }
        
        // Check if exists in database (by storyWordId or frontText)
        const word = words.find(w => w.id === wordId);
        if (!word) return;
        
        const existsById = await flashcardExistsForStoryWord(userId, wordId);
        const existsByText = await flashcardExistsByFrontText(userId, word.phrase);
        
        if (!existsById && !existsByText) {
          const contextSentence = word.exampleSentence || findContextSentence(word.phrase);
          
          // Validate before creating - REQUIRE translation
          if (!word.phrase || !word.translation || !word.translation.trim()) {
            console.error('[Story Reader] Cannot create flashcard - missing phrase or translation:', {
              phrase: word.phrase,
              translation: word.translation,
              word,
            });
            return;
          }
          
          console.log('[Story Reader] Creating flashcard:', {
            phrase: word.phrase,
            translation: word.translation,
            contextSentence,
            wordId: word.id,
          });
          
          await createFlashcardWithContext(userId, {
            languageCode: 'de',
            frontText: word.phrase.trim(),
            backText: word.translation.trim(),
            contextSentence: contextSentence.trim() || word.phrase.trim(),
            contextTranslation: word.exampleTranslation?.trim(),
            storyId: story.id,
            chapterId: chapter.id,
            storyWordId: word.id,
          });
          
          setAddedToFlashcards(prev => new Set([...prev, word.id]));
          await awardXP(userId, 3);
          setFlashcardMessage(`"${word.phrase}" added to flashcards – review later in Practice!`);
          setTimeout(() => setFlashcardMessage(null), 3000);
        } else {
          // Exists in database but not in session state - mark as added silently
          setAddedToFlashcards(prev => new Set([...prev, wordId]));
          // Don't show message if already in database
        }
      } else {
        // Regular word - create a flashcard (ONLY if translation is available)
        // Check if we can find this word in vocabulary by phrase match (full phrase or base word)
        const vocabWord = words.find(w => {
          const wPhraseLower = w.phrase.toLowerCase();
          const wBaseWord = wPhraseLower.replace(/^(der|die|das|ein|eine|dem|den|des|deren|dessen)\s+/, '').trim();
          return wPhraseLower === wordKey || wBaseWord === wordKey;
        });
        if (vocabWord) {
          // It's actually a vocabulary word, add it properly
          // Check if already added in this session first
          if (addedToFlashcards.has(vocabWord.id)) {
            // Already added in this session - don't show message again
            return;
          }
          
          const existsById = await flashcardExistsForStoryWord(userId, vocabWord.id);
          const existsByText = await flashcardExistsByFrontText(userId, vocabWord.phrase);
          
          if (!existsById && !existsByText) {
            const contextSentence = vocabWord.exampleSentence || findContextSentence(vocabWord.phrase);
            
            // Validate before creating - REQUIRE translation
            if (!vocabWord.phrase || !vocabWord.translation || !vocabWord.translation.trim()) {
              console.error('[Story Reader] Cannot create flashcard - missing phrase or translation:', {
                phrase: vocabWord.phrase,
                translation: vocabWord.translation,
                vocabWord,
              });
              return;
            }
            
            console.log('[Story Reader] Creating flashcard from vocab word:', {
              phrase: vocabWord.phrase,
              translation: vocabWord.translation,
              contextSentence,
              wordId: vocabWord.id,
            });
            
            await createFlashcardWithContext(userId, {
              languageCode: 'de',
              frontText: vocabWord.phrase.trim(),
              backText: vocabWord.translation.trim(),
              contextSentence: contextSentence.trim() || vocabWord.phrase.trim(),
              contextTranslation: vocabWord.exampleTranslation?.trim(),
              storyId: story.id,
              chapterId: chapter.id,
              storyWordId: vocabWord.id,
            });
            
            setAddedToFlashcards(prev => new Set([...prev, vocabWord.id]));
            await awardXP(userId, 3);
            setFlashcardMessage(`"${vocabWord.phrase}" added to flashcards – review later in Practice!`);
            setTimeout(() => setFlashcardMessage(null), 3000);
          } else {
            // Exists in database but not in session state - mark as added silently
            setAddedToFlashcards(prev => new Set([...prev, vocabWord.id]));
            // Don't show message if already in database
          }
        } else {
          // Regular word without vocabulary entry - check for duplicates and require translation
          // Check if already added in this session first
          if (addedToFlashcards.has(wordKey)) {
            // Already added in this session - don't show message again
            return;
          }
          
          // Check if exists by frontText
          const existsByText = await flashcardExistsByFrontText(userId, wordPhrase);
          if (existsByText) {
            // Already exists - mark as added silently
            setAddedToFlashcards(prev => new Set([...prev, wordKey]));
            return;
          }
          
          // REQUIRE valid translation (not a placeholder)
          if (!translation || translation.startsWith('[') || translation === `[Translation for "${wordPhrase}"]`) {
            console.warn('[Story Reader] Cannot create flashcard - missing valid translation:', {
              wordPhrase,
              translation,
              wordKey,
            });
            return;
          }
          
          const contextSentence = findContextSentence(wordPhrase).trim() || wordPhrase.trim();
          
          // Validate before creating
          if (!wordPhrase || !wordPhrase.trim()) {
            console.error('[Story Reader] Cannot create flashcard - empty word phrase:', {
              wordPhrase,
              translation,
              wordKey,
            });
            return;
          }
          
          console.log('[Story Reader] Creating flashcard for regular word:', {
            phrase: wordPhrase,
            translation: translation,
            contextSentence,
          });
          
          try {
            await createFlashcardWithContext(userId, {
              languageCode: 'de',
              frontText: wordPhrase.trim(),
              backText: translation.trim(),
              contextSentence,
              storyId: story.id,
              chapterId: chapter.id,
            });
            
            // Track by word phrase (lowercase) for regular words without IDs
            setAddedToFlashcards(prev => new Set([...prev, wordKey]));
            await awardXP(userId, 3);
            setFlashcardMessage(`"${wordPhrase}" added to flashcards – review later in Practice!`);
            setTimeout(() => setFlashcardMessage(null), 3000);
          } catch (error) {
            console.error('Error adding regular word to flashcards:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error adding word to flashcards:', error);
    }
  };

  // Sort vocabulary words by their first appearance in the text
  const getSortedWordsByAppearance = (text: string, wordsList: StoryWord[]): StoryWord[] => {
    if (!text || wordsList.length === 0) return wordsList;
    
    const textLower = text.toLowerCase();
    const wordPositions: Array<{ word: StoryWord; position: number }> = [];
    
    wordsList.forEach((word) => {
      // Extract base word without article
      const baseWord = word.phrase.replace(/^(der|die|das|ein|eine|dem|den|des|deren|dessen)\s+/i, '').trim();
      const phraseWithArticle = word.phrase;
      
      // Find first occurrence of either the full phrase or base word
      let position = -1;
      
      // Try full phrase first
      const fullPhraseIndex = textLower.indexOf(phraseWithArticle.toLowerCase());
      if (fullPhraseIndex !== -1) {
        position = fullPhraseIndex;
      } else {
        // Try base word
        const baseWordIndex = textLower.indexOf(baseWord.toLowerCase());
        if (baseWordIndex !== -1) {
          position = baseWordIndex;
        }
      }
      
      if (position !== -1) {
        wordPositions.push({ word, position });
      } else {
        // If not found, add at the end
        wordPositions.push({ word, position: text.length });
      }
    });
    
    // Sort by position
    wordPositions.sort((a, b) => a.position - b.position);
    
    return wordPositions.map(wp => wp.word);
  };

  // Escape HTML entities in text (for HTML attributes - includes quotes)
  const escapeHtml = (text: string): string => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  // Escape HTML entities in text content (for text nodes - does NOT escape quotes)
  const escapeHtmlContent = (text: string): string => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
    };
    return text.replace(/[&<>]/g, (m) => map[m]);
  };

  // Decode HTML entities to plain text (works on both client and server)
  const decodeHtmlEntities = (text: string): string => {
    if (!text) return '';
    
    // Decode in the correct order to avoid double-decoding
    // First, decode numeric entities
    let decoded = text
      // Decode numeric entities (hexadecimal)
      .replace(/&#x([0-9a-fA-F]+);/gi, (match, hex) => {
        try {
          return String.fromCharCode(parseInt(hex, 16));
        } catch {
          return match;
        }
      })
      // Decode numeric entities (decimal)
      .replace(/&#(\d+);/g, (match, dec) => {
        try {
          return String.fromCharCode(parseInt(dec, 10));
        } catch {
          return match;
        }
      });
    
    // Then decode named entities (must do &amp; last to avoid double-decoding)
    decoded = decoded
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/gi, "'")
      .replace(/&#x2F;/gi, '/')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&'); // Must be last
    
    // Handle any remaining &quot; that might have been missed (edge cases)
    decoded = decoded.replace(/&quot;/g, '"');
    
    return decoded;
  };

  // Strip any existing HTML tags from text to ensure we're working with plain text
  const stripHtml = (text: string): string => {
    if (!text) return '';
    
    // First, decode all HTML entities
    let decoded = decodeHtmlEntities(text);
    
    // Then remove any remaining HTML tags and attributes
    decoded = decoded
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/data-[a-z-]+="[^"]*"/gi, '') // Remove data-* attributes
      .replace(/data-[a-z-]+='[^']*'/gi, '') // Remove data-* attributes with single quotes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return decoded;
  };

  const highlightWords = (text: string): string => {
    if (!text) return text;

    // CRITICAL: First, completely strip all HTML to ensure we're working with clean plain text
    let cleanText = stripHtml(text);
    
    // Now build the highlighted HTML from scratch
    let highlightedText = '';
    let currentIndex = 0;
    const highlightedRanges: Array<{ start: number; end: number; word: StoryWord; match: string }> = [];
    
    // First, find all vocabulary words in the text (longest first to avoid partial matches)
    if (words.length > 0) {
      const sortedWords = [...words].sort((a, b) => b.phrase.length - a.phrase.length);
      
      sortedWords.forEach((word) => {
        const phraseWithArticle = word.phrase;
        const baseWord = phraseWithArticle.replace(/^(der|die|das|ein|eine|dem|den|des|deren|dessen)\s+/i, '').trim();
        
        // Try to find full phrase first
        const fullPhraseRegex = new RegExp(`\\b${phraseWithArticle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        let match: RegExpExecArray | null;
        while ((match = fullPhraseRegex.exec(cleanText)) !== null) {
          highlightedRanges.push({
            start: match.index,
            end: match.index + match[0].length,
            word: word,
            match: match[0]
          });
        }
        
        // Then try base word (if different from full phrase)
        if (baseWord !== phraseWithArticle) {
          const baseWordRegex = new RegExp(`\\b${baseWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
          while ((match = baseWordRegex.exec(cleanText)) !== null) {
            // Only add if not already covered by a longer match
            const isOverlapping = highlightedRanges.some(range => 
              match!.index >= range.start && match!.index < range.end ||
              match!.index + match![0].length > range.start && match!.index + match![0].length <= range.end ||
              match!.index < range.start && match!.index + match![0].length > range.end
            );
            if (!isOverlapping) {
              highlightedRanges.push({
                start: match.index,
                end: match.index + match[0].length,
                word: word,
                match: match[0]
              });
            }
          }
        }
      });
    }
    
    // Sort ranges by start position
    highlightedRanges.sort((a, b) => a.start - b.start);
    
    // Remove overlapping ranges (keep the longest)
    const nonOverlappingRanges: typeof highlightedRanges = [];
    for (const range of highlightedRanges) {
      const overlaps = nonOverlappingRanges.find(r => 
        (range.start >= r.start && range.start < r.end) ||
        (range.end > r.start && range.end <= r.end) ||
        (range.start < r.start && range.end > r.end)
      );
      if (!overlaps) {
        nonOverlappingRanges.push(range);
      } else if (range.end - range.start > overlaps.end - overlaps.start) {
        // Replace with longer range
        const index = nonOverlappingRanges.indexOf(overlaps);
        nonOverlappingRanges[index] = range;
      }
    }
    
    // Build the highlighted HTML
    let occurrenceCounter = 0;
    for (const range of nonOverlappingRanges) {
      // Add text before this range
      if (currentIndex < range.start) {
        const beforeText = cleanText.substring(currentIndex, range.start);
        highlightedText += escapeHtmlContent(beforeText);
      }
      
      // Add the highlighted word
      const word = range.word;
      const wordKey = word.phrase.toLowerCase();
      const baseWordKey = word.phrase.replace(/^(der|die|das|ein|eine|dem|den|des|deren|dessen)\s+/i, '').trim().toLowerCase();
      const matchKey = range.match.toLowerCase();
      
      // Generate unique occurrence ID for this specific instance
      const occurrenceId = `${word.id || wordKey}_${range.start}_${range.end}`;
      
      // Check if THIS SPECIFIC occurrence has been clicked
      const isThisOccurrenceClicked = clickedOccurrences.has(occurrenceId);
      
      // Check if ANY occurrence of this word has been clicked (for highlighting all occurrences)
      const wasWordClicked = clickedWords.has(word.id) || 
                            clickedWords.has(wordKey) || 
                            clickedWords.has(baseWordKey) ||
                            clickedWords.has(matchKey) ||
                            // Check if any occurrence of this word was clicked
                            Array.from(clickedOccurrences).some(clickedId => {
                              return clickedId.startsWith(word.id || wordKey) || 
                                     clickedId.includes(wordKey) ||
                                     clickedId.includes(matchKey);
                            });
      
      // Only show tooltip if THIS specific occurrence was clicked
      const showTooltip = isThisOccurrenceClicked;
      
      const isAdded = addedToFlashcards.has(word.id);
      
      // Get translation - prioritize from wordTranslations map, then fallback to word.translation
      let translation = word.translation;
      if (wordTranslations.has(word.id)) {
        translation = wordTranslations.get(word.id)!;
      } else if (wordTranslations.has(wordKey)) {
        translation = wordTranslations.get(wordKey)!;
      } else if (wordTranslations.has(baseWordKey)) {
        translation = wordTranslations.get(baseWordKey)!;
      } else if (wordTranslations.has(matchKey)) {
        translation = wordTranslations.get(matchKey)!;
      }
      
      // Highlight ALL occurrences if ANY occurrence was clicked, but only show tooltip on clicked one
      const clickClass = isAdded ? 'bg-green-100 text-green-700' : (wasWordClicked || isThisOccurrenceClicked ? 'bg-blue-50 text-blue-800' : 'text-gray-900 hover:text-gray-700');
      const escapedTranslation = escapeHtml(translation || 'Translation not available');
      const tooltip = showTooltip ? `<span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-3 py-2 rounded whitespace-nowrap z-[9999] pointer-events-none shadow-lg before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-gray-900" style="white-space: nowrap; max-width: none; word-wrap: normal; overflow: visible; text-overflow: clip;">${escapedTranslation}</span>` : '';
      const escapedPhrase = escapeHtml(word.phrase);
      const escapedWordTranslation = escapeHtml(word.translation);
      const escapedMatch = escapeHtmlContent(range.match);
      const escapedOccurrenceId = escapeHtml(occurrenceId);
      
      highlightedText += `<span class="word-highlight clickable-word cursor-pointer font-bold ${clickClass} relative inline-block pointer-events-auto" data-word-id="${word.id || ''}" data-word-phrase="${escapedPhrase}" data-word-translation="${escapedWordTranslation}" data-word-key="${escapeHtml(matchKey)}" data-occurrence-id="${escapedOccurrenceId}" style="overflow: visible;">${tooltip}${escapedMatch}</span>`;
      
      currentIndex = range.end;
      occurrenceCounter++;
    }
    
    // Add remaining text after last range
    if (currentIndex < cleanText.length) {
      const remainingText = cleanText.substring(currentIndex);
      highlightedText += escapeHtmlContent(remainingText);
    }
    
    // Now make remaining words clickable (not already highlighted)
    // Use a regex-based approach that properly handles nested spans by using a balanced matching approach
    let regularWordCounter = 0;
    
    // Split by spans, handling nested spans properly
    // This regex matches complete span tags including nested ones
    const spanRegex = /(<span[^>]*>(?:[^<]|<(?!\/?span\b))*<\/span>)/gi;
    const parts: string[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    
    // Reset regex
    spanRegex.lastIndex = 0;
    
    // Find all complete span tags (handles nested spans)
    const spanMatches: Array<{ start: number; end: number; content: string }> = [];
    let depth = 0;
    let inSpan = false;
    let spanStart = -1;
    
    for (let i = 0; i < highlightedText.length; i++) {
      if (highlightedText.substring(i).startsWith('<span')) {
        const tagEnd = highlightedText.indexOf('>', i);
        if (tagEnd !== -1) {
          if (!inSpan) {
            spanStart = i;
          }
          inSpan = true;
          depth++;
          i = tagEnd;
        }
      } else if (highlightedText.substring(i).startsWith('</span>')) {
        depth--;
        if (depth === 0 && inSpan) {
          spanMatches.push({
            start: spanStart,
            end: i + 7,
            content: highlightedText.substring(spanStart, i + 7)
          });
          inSpan = false;
          spanStart = -1;
        }
        i += 6; // -1 because loop will increment
      }
    }
    
    // Now split text by these spans
    let processedText = '';
    let textIndex = 0;
    
    for (const spanMatch of spanMatches) {
      // Add text before the span (process it)
      if (textIndex < spanMatch.start) {
        const plainText = highlightedText.substring(textIndex, spanMatch.start);
        processedText += processPlainTextForWords(plainText);
      }
      
      // Add the span as-is
      processedText += spanMatch.content;
      textIndex = spanMatch.end;
    }
    
    // Add remaining text at the end
    if (textIndex < highlightedText.length) {
      const plainText = highlightedText.substring(textIndex);
      processedText += processPlainTextForWords(plainText);
    }
    
    // Process plain text to make words clickable (only called for text NOT inside spans)
    function processPlainTextForWords(text: string): string {
      if (!text || text.trim().length === 0) return text;
      
      // Capture regularWordCounter in closure
      let localCounter = regularWordCounter;
      const result = text.replace(
        /\b([A-Za-zÄÖÜäöüß]{3,})\b/g,
        (match, wordText, offset) => {
          const skipWords = ['der', 'die', 'das', 'ein', 'eine', 'und', 'oder', 'ist', 'sind', 'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'mit', 'von', 'zu', 'auf', 'in', 'für', 'an', 'am', 'im', 'zum', 'zur', 'den', 'dem', 'des', 'aber', 'auch', 'nicht', 'nur', 'wie', 'was', 'wer', 'wo', 'wann', 'warum'];
          const wordKey = wordText.toLowerCase();
          if (skipWords.includes(wordKey)) {
            return match;
          }
          
          // Generate unique occurrence ID for this regular word
          const baseWordKey = wordText.replace(/^(der|die|das|ein|eine|dem|den|des|deren|dessen)\s+/i, '').trim().toLowerCase();
          const regularOccurrenceId = `regular_${wordKey}_${offset}_${localCounter++}`;
          
          // Check if THIS SPECIFIC occurrence has been clicked
          const isThisOccurrenceClicked = clickedOccurrences.has(regularOccurrenceId);
          
          // Check if ANY occurrence of this word has been clicked (for highlighting all occurrences)
          const wasWordClicked = clickedWords.has(wordKey) || 
                               clickedWords.has(baseWordKey) ||
                               clickedWords.has(wordText) ||
                               // Check if any occurrence of this word was clicked
                               Array.from(clickedOccurrences).some(clickedId => {
                                 return clickedId.includes(wordKey) || 
                                        clickedId.includes(baseWordKey) ||
                                        clickedId.startsWith(`regular_${wordKey}`);
                               });
          
          // Only show tooltip if THIS specific occurrence was clicked
          const showTooltip = isThisOccurrenceClicked;
          
          const vocabWord = words.find(w => {
            const wPhraseLower = w.phrase.toLowerCase();
            const wBaseWord = wPhraseLower.replace(/^(der|die|das|ein|eine|dem|den|des|deren|dessen)\s+/, '').trim();
            return wPhraseLower === wordKey || wBaseWord === wordKey || wPhraseLower === baseWordKey || wBaseWord === baseWordKey;
          });
          
          // Get translation - prioritize from wordTranslations, then vocabWord, then dictionary
          let translation = '';
          if (wordTranslations.has(wordKey)) {
            translation = wordTranslations.get(wordKey)!;
          } else if (wordTranslations.has(baseWordKey)) {
            translation = wordTranslations.get(baseWordKey)!;
          } else if (wordTranslations.has(wordText.toLowerCase())) {
            translation = wordTranslations.get(wordText.toLowerCase())!;
          } else if (vocabWord) {
            translation = vocabWord.translation;
          } else {
            translation = getTranslation(wordText) || '';
          }
          
          const escapedTranslation = escapeHtml(translation || 'Translation not available');
          const tooltip = showTooltip && translation ? `<span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-3 py-2 rounded whitespace-nowrap z-[9999] pointer-events-none shadow-lg before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-gray-900" style="white-space: nowrap; max-width: none; word-wrap: normal; overflow: visible; text-overflow: clip;">${escapedTranslation}</span>` : '';
          // Highlight ALL occurrences if ANY occurrence was clicked, but only show tooltip on clicked one
          const clickClass = isThisOccurrenceClicked || wasWordClicked ? 'bg-blue-100 text-blue-700' : 'text-gray-900 hover:text-blue-600';
          const escapedWordText = escapeHtml(wordText);
          const escapedWordKey = escapeHtml(wordKey);
          const escapedOccurrenceId = escapeHtml(regularOccurrenceId);
          
          return `<span class="clickable-word cursor-pointer ${clickClass} relative inline-block" data-word-phrase="${escapedWordText}" data-word-key="${escapedWordKey}" data-occurrence-id="${escapedOccurrenceId}" style="overflow: visible;">${tooltip}${match}</span>`;
        }
      );
      // Update the counter after processing
      regularWordCounter = localCounter;
      return result;
    };
    
    return processedText || highlightedText;
  };

  const handleCompleteChapter = async () => {
    if (!userId || !chapter || chapterCompleted) return;

    try {
      // Update chapter progress
      const updatedChapterProgress: UserChapterProgress = {
        id: chapter.id,
        userId: userId,
        chapterId: chapter.id,
        status: 'COMPLETED',
        completedAt: new Date(),
        createdAt: chapterProgress?.createdAt || new Date(),
        updatedAt: new Date(),
      };
      await updateUserChapterProgress(updatedChapterProgress);
      setChapterProgress(updatedChapterProgress);
      setChapterCompleted(true);

      // Update story progress
      const isLastChapter = chapterNumber === chapters.length;
      const updatedStoryProgress: UserStoryProgress = {
        id: `${userId}_${storyId}`,
        userId: userId,
        storyId: storyId,
        currentChapterNumber: isLastChapter ? chapters.length : chapterNumber + 1,
        completed: isLastChapter,
        lastAccessedAt: new Date(),
        createdAt: storyProgress?.createdAt || new Date(),
        updatedAt: new Date(),
      };
      await updateUserStoryProgress(updatedStoryProgress);
      setStoryProgress(updatedStoryProgress);

      // Award XP and show story completion modal
      if (isLastChapter && !storyProgress?.completed) {
        await awardXP(userId, 20);
        await incrementStoriesCompleted(userId);
        setStoryCompleted(true);
        setXpAwarded(20);
        setWordsAdded(words.length);
      }
    } catch (error) {
      console.error('Error completing chapter:', error);
    }
  };

  const handleNextChapter = () => {
    if (chapterNumber < chapters.length) {
      router.push(`/stories/${storyId}/chapters/${chapterNumber + 1}`);
    }
  };

  const handlePreviousChapter = () => {
    if (chapterNumber > 1) {
      router.push(`/stories/${storyId}/chapters/${chapterNumber - 1}`);
    }
  };

  const handleStartExercises = () => {
    router.push(`/stories/${storyId}/chapters/${chapterNumber}/exercises`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (!story || !chapter || blocks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Chapter not found</p>
          <Link href="/dashboard">
            <Button variant="accent">← Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentChapterIndex = chapters.findIndex(ch => ch.id === chapter.id);
  const isFirstChapter = currentChapterIndex === 0;
  const isLastChapter = currentChapterIndex === chapters.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Flashcard Notification */}
      {flashcardMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-5 duration-300">
          <p className="font-semibold">{flashcardMessage}</p>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                {story.level}
              </span>
              <span className="text-sm text-gray-600">
                Chapter {chapterNumber} of {chapters.length}
              </span>
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{story.title}</h1>
          <p className="text-sm text-gray-600 mt-1">{chapter.title || `Chapter ${chapterNumber}`}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Story Blocks (Center - 2 columns on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Combined Text Block */}
            {blocks.some(block => block.type === 'TEXT' && block.textContent) && (
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10" style={{ overflow: 'visible' }}>
                <div
                  key={renderKey}
                  className="text-base sm:text-lg md:text-xl leading-relaxed sm:leading-loose text-gray-900"
                  style={{
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    lineHeight: '1.9',
                    letterSpacing: '0.015em',
                    overflow: 'visible',
                    position: 'relative',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: blocks
                      .filter(block => block.type === 'TEXT' && block.textContent)
                      .map(block => {
                        // Strip any existing HTML and normalize whitespace
                        let text = stripHtml(block.textContent || '');
                        text = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                        if (!text) return '';
                        const highlighted = highlightWords(text);
                        return `<p class="mb-4 last:mb-0">${highlighted}</p>`;
                      })
                      .join(''),
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const target = e.target as HTMLElement;
                    // Skip if clicking on tooltip
                    if (target.classList.contains('pointer-events-none') || target.closest('.pointer-events-none')) {
                      return;
                    }
                    
                    // Find the closest clickable word element
                    const wordElement = target.closest('.clickable-word') as HTMLElement;
                    if (!wordElement) return;
                    
                    // Get occurrence ID first
                    const occurrenceId = wordElement.getAttribute('data-occurrence-id') || '';
                    
                    // Get word phrase from data attribute first (most reliable)
                    let wordPhrase = wordElement.getAttribute('data-word-phrase') || '';
                    
                    // If data attribute is empty or invalid, extract from actual displayed text
                    if (!wordPhrase || wordPhrase === 'span' || wordPhrase === 'span>' || wordPhrase.startsWith('<') || wordPhrase.includes('span')) {
                      // Clone the element to safely extract text without modifying the original
                      const clone = wordElement.cloneNode(true) as HTMLElement;
                      
                      // Remove all tooltip elements (they have pointer-events-none class)
                      clone.querySelectorAll('.pointer-events-none').forEach(el => el.remove());
                      
                      // Get the text content - should only be the word now
                      let text = (clone.textContent || clone.innerText || '').trim();
                      
                      // Clean up the text - remove any HTML artifacts and broken tags
                      text = text
                        .replace(/<[^>]*>/g, '') // Remove any HTML tags
                        .replace(/span>/gi, '') // Remove "span>" artifacts
                        .replace(/span/gi, '') // Remove "span" artifacts
                        .replace(/\s+/g, ' ') // Normalize whitespace
                        .trim();
                      
                      // Split by newline and take first line (tooltip text is often on new line)
                      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
                      text = lines.length > 0 ? lines[0] : text;
                      
                      // Take only the first word (in case translation is included)
                      const wordsInText = text.split(/\s+/).filter(w => w && w.length >= 2 && w !== 'span' && w !== 'span>');
                      text = wordsInText.length > 0 ? wordsInText[0] : text;
                      
                      wordPhrase = text;
                      
                      // Fallback 1: try data-word-key attribute (should be the actual word)
                      if (!wordPhrase || wordPhrase === 'span' || wordPhrase === 'span>' || wordPhrase.length < 2) {
                        const wordKey = wordElement.getAttribute('data-word-key');
                        if (wordKey && wordKey !== 'span' && wordKey !== 'span>' && wordKey.length >= 2 && !wordKey.includes('<')) {
                          wordPhrase = wordKey;
                        }
                      }
                      
                      // Fallback 2: get from direct text nodes only (excluding any child elements)
                      if (!wordPhrase || wordPhrase === 'span' || wordPhrase === 'span>' || wordPhrase.length < 2) {
                        const directTextNodes: string[] = [];
                        // Only get direct text nodes, not from child elements
                        for (const node of Array.from(wordElement.childNodes)) {
                          if (node.nodeType === Node.TEXT_NODE) {
                            const nodeText = (node as Text).textContent?.trim();
                            if (nodeText && nodeText.length >= 2) {
                              // Take only first word from text node
                              const firstWord = nodeText.split(/\s+/)[0];
                              if (firstWord && firstWord !== 'span' && firstWord !== 'span>') {
                                directTextNodes.push(firstWord);
                              }
                            }
                          }
                        }
                        if (directTextNodes.length > 0) {
                          wordPhrase = directTextNodes[0]; // Take first valid word
                        }
                      }
                    }
                    
                    // Final cleanup and validation - remove any HTML artifacts
                    wordPhrase = wordPhrase
                      .replace(/<[^>]*>/g, '') // Remove HTML tags
                      .replace(/span>/gi, '') // Remove "span>" artifacts
                      .replace(/span/gi, '') // Remove "span" artifacts
                      .trim();
                    
                    // Skip if invalid - must be a valid word
                    if (!wordPhrase || 
                        wordPhrase === 'span' || 
                        wordPhrase === 'span>' || 
                        wordPhrase.length < 2 || 
                        wordPhrase.includes('<') ||
                        wordPhrase.includes('>') ||
                        /^[^a-zA-ZÄÖÜäöüß]/.test(wordPhrase)) { // Must start with a letter
                      console.warn('Invalid word phrase from click:', wordPhrase, 'Element:', wordElement, 'Data attributes:', {
                        'data-word-phrase': wordElement.getAttribute('data-word-phrase'),
                        'data-word-key': wordElement.getAttribute('data-word-key'),
                        'data-word-id': wordElement.getAttribute('data-word-id'),
                      });
                      return;
                    }
                    
                    const wordId = wordElement.getAttribute('data-word-id');
                    const wordTranslation = wordElement.getAttribute('data-word-translation') || '';
                    const wordKey = wordElement.getAttribute('data-word-key') || wordPhrase.toLowerCase();
                    
                    // Store occurrence ID in the event target for handleWordClick to use
                    if (occurrenceId && e.target) {
                      (e.target as HTMLElement).setAttribute('data-clicked-occurrence-id', occurrenceId);
                    }
                    
                    // If it's a vocabulary word (has word-id), use the word object
                    if (wordId) {
                      const word = words.find((w) => w.id === wordId);
                      if (word) {
                        handleWordClick(word.phrase, word.translation, word.id, e as any);
                      }
                    } else {
                      // It's a regular word - check if it matches any vocabulary word
                      const vocabWord = words.find(w => {
                        const wPhraseLower = w.phrase.toLowerCase();
                        const wBaseWord = wPhraseLower.replace(/^(der|die|das|ein|eine|dem|den|des|deren|dessen)\s+/, '').trim();
                        return wPhraseLower === wordKey || wBaseWord === wordKey || wPhraseLower === wordPhrase.toLowerCase() || wBaseWord === wordPhrase.toLowerCase();
                      });
                      if (vocabWord) {
                        // It's actually a vocabulary word, use it
                        handleWordClick(vocabWord.phrase, vocabWord.translation, vocabWord.id, e as any);
                      } else {
                        // Regular word without translation
                        handleWordClick(wordPhrase, wordTranslation || undefined, undefined, e as any);
                      }
                    }
                  }}
                />
              </div>
            )}

            {/* Image Blocks */}
            {blocks.map((block, index) => (
              block.type === 'IMAGE' && block.imageUrl && (
                <div key={block.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="relative w-full aspect-video mb-4">
                    <Image
                      src={block.imageUrl}
                      alt={block.imageAlt || `Chapter ${chapterNumber} image ${index + 1}`}
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                  {block.caption && (
                    <p className="text-sm text-gray-600 text-center italic">{block.caption}</p>
                  )}
                </div>
              )
            ))}

            {/* Chapter Complete Message */}
            {chapterCompleted && !storyCompleted && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  You&apos;ve finished Chapter {chapterNumber}!
                </h2>
                <p className="text-gray-600 mb-4">
                  Great job! New words from this chapter have been added to your review deck.
                </p>
                <div className="flex gap-4 justify-center">
                  {!isLastChapter && (
                    <Button onClick={handleNextChapter} variant="accent">
                      Next Chapter
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                  <Button onClick={handleStartExercises} variant="secondary">
                    Start Exercises
                  </Button>
                </div>
              </div>
            )}

            {/* Chapter Complete Button */}
            {!chapterCompleted && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <Button onClick={handleCompleteChapter} variant="accent" size="lg" className="w-full">
                  Mark Chapter as Complete
                </Button>
              </div>
            )}

            {/* Bottom Navigation */}
            <div className="flex items-center justify-between bg-white rounded-xl shadow-lg p-6">
              {!isFirstChapter && (
                <Button
                  onClick={handlePreviousChapter}
                  variant="secondary"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous Chapter
                </Button>
              )}
              {isFirstChapter && <div />}
              {!isLastChapter && (
                <Button
                  onClick={handleNextChapter}
                  variant="accent"
                  disabled={!chapterCompleted}
                  className={isFirstChapter ? '' : 'ml-auto'}
                >
                  Next Chapter
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
              {isLastChapter && chapterCompleted && (
                <Link href="/dashboard" className={isFirstChapter ? '' : 'ml-auto'}>
                  <Button variant="accent">
                    Next Chapter
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Vocabulary Panel (Right Sidebar - Top) */}
          <div className="lg:col-span-1">
            {words.length > 0 && (() => {
              const allTextContent = blocks
                .filter(block => block.type === 'TEXT' && block.textContent)
                .map(block => block.textContent!)
                .join('\n\n');
              const sortedWords = getSortedWordsByAppearance(allTextContent, words);
              
              return (
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vocabulary</h3>
                  <div className="space-y-2">
                    {sortedWords.map((word) => (
                      <div key={word.id} className="text-base leading-relaxed">
                        <strong className="font-semibold text-gray-900">{word.phrase}</strong>
                        {', '}
                        <span className="text-gray-700">{word.translation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </main>

      {/* Story Completion Modal */}
      {storyCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Story Completed!</h2>
            <p className="text-gray-600 mb-6">
              You finished <strong>{story?.title}</strong>. Great job!
            </p>
            <p className="text-gray-600 mb-6">
              New words from this story have been added to your review deck.
            </p>
            <div className="bg-purple-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Chapters completed:</span>
                <span className="font-semibold text-gray-900">{chapters.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Words learned:</span>
                <span className="font-semibold text-gray-900">{wordsAdded}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">XP gained:</span>
                <span className="font-semibold text-purple-600">+{xpAwarded} XP</span>
              </div>
            </div>
            <div className="flex gap-4">
              <Link href="/dashboard">
                <Button variant="secondary" className="flex-1">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/practice">
                <Button variant="accent" className="flex-1">
                  Start Review Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

