import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Story, StoryChapter, VocabularyItem, Exercise } from '@/types';
import { Button } from '@/components/layout';
import { AudioPlayer, VocabularyAudioCard } from '@/components/audio-player';
import { VocabularySidebar } from '@/components/vocabulary-sidebar';
import { FlashcardSystem } from '@/lib/flashcard-system';
import { getGrammarLessonByEpisode } from '@/data/grammar-lessons';
import { PlayCircle, Volume2, BookOpen, CheckCircle, XCircle, ArrowRight, ArrowLeft, Home } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface StoryReaderProps {
  story: Story;
  onComplete: () => void;
  onBack: () => void;
  onNavigateToVocabulary?: () => void;
  initialChapterIndex?: number;
  initialSceneIndex?: number;
  onAwardXP?: (amount: number, reason: string) => void;
  onUpdateQuest?: (type: 'complete_chapters' | 'review_flashcards' | 'complete_exercises' | 'study_minutes' | 'add_words' | 'perfect_exercises', amount?: number) => void;
  onWordsRead?: (count: number) => void;
  onWordLearned?: () => void;
}

export function StoryReader({ 
  story, 
  onComplete, 
  onBack, 
  onNavigateToVocabulary,
  initialChapterIndex = 0,
  initialSceneIndex = 0,
  onAwardXP,
  onUpdateQuest,
  onWordsRead,
  onWordLearned,
}: StoryReaderProps) {
  const { t } = useLanguage();
  const [currentChapterIndex, setCurrentChapterIndex] = useState(initialChapterIndex);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(initialSceneIndex);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [showVocabularySidebar, setShowVocabularySidebar] = useState(false);
  const [currentSentence, setCurrentSentence] = useState<string>('');
  const [showExercises, setShowExercises] = useState(false);
  const [showDigitalReader, setShowDigitalReader] = useState(false);
  const [showGrammar, setShowGrammar] = useState(false);
  const [showCompletionPage, setShowCompletionPage] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<number, number>>({});
  const [showExerciseCorrection, setShowExerciseCorrection] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [chapterStartTime, setChapterStartTime] = useState(Date.now());
  const [newWordsAdded, setNewWordsAdded] = useState<string[]>([]);
  const [allExerciseAnswers, setAllExerciseAnswers] = useState<Record<number, { userAnswer: number; correct: number; question: string; options: string[] }>>({});

  const currentChapter = story.chapters[currentChapterIndex];
  const isLastChapter = currentChapterIndex === story.chapters.length - 1;

  // Save position to localStorage whenever it changes (without causing re-renders)
  useEffect(() => {
    // Load progression state from localStorage
    const savedProgression = localStorage.getItem('minka-progression');
    if (savedProgression) {
      try {
        const progression = JSON.parse(savedProgression);
        // Update the current episode's position
        if (progression.episodeProgress && progression.episodeProgress[story.id]) {
          progression.episodeProgress[story.id].currentChapterIndex = currentChapterIndex;
          progression.episodeProgress[story.id].currentSceneIndex = currentSceneIndex;
          localStorage.setItem('minka-progression', JSON.stringify(progression));
        }
      } catch (e) {
        console.error(t.story.failedToSavePosition, e);
      }
    }
  }, [currentChapterIndex, currentSceneIndex, story.id]);

  // Parse scenes from content
  const getScenes = () => {
    return currentChapter.content.split('\n\n').filter(scene => scene.trim());
  };

  const scenes = getScenes();
  const totalScenes = scenes.length;
  const isLastScene = currentSceneIndex === totalScenes - 1;

  // Calculate overall progress within current chapter
  const getTotalProgress = () => {
    // Progress within the current chapter only
    const totalSteps = totalScenes + 1; // scenes + exercises
    let currentStep = currentSceneIndex;
    
    if (showExercises) {
      currentStep = totalScenes; // At exercises step
    }
    if (showVocabulary) {
      currentStep = totalSteps; // At vocabulary/completion step
    }
    
    return (currentStep / totalSteps) * 100;
  };

  const handleNextScene = () => {
    // Count words in the current scene
    if (onWordsRead && scenes[currentSceneIndex]) {
      const wordCount = countWordsInScene(scenes[currentSceneIndex]);
      onWordsRead(wordCount);
    }

    if (isLastScene) {
      // Move to exercises after last scene
      setShowExercises(true);
    } else {
      // Show exercises after each scene
      setShowExercises(true);
    }
  };

  // Helper function to count words in a scene
  const countWordsInScene = (sceneText: string): number => {
    // Count all words in the scene text
    return sceneText.split(/\s+/).filter((word: string) => word.trim().length > 0).length;
  };

  const handlePreviousScene = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(prev => prev - 1);
    }
  };

  const handleNextChapter = () => {
    // Auto-add all vocabulary from completed chapter to flashcards
    const newCards = FlashcardSystem.addLessonVocabulary(currentChapter.vocabulary, story.id);
    const newWords = newCards.map(card => card.german);
    setNewWordsAdded(newWords);
    
    // Show grammar section before completion
    setShowVocabulary(false);
    setShowGrammar(true);
  };

  const handleContinueToNextChapter = () => {
    setShowCompletionPage(false);
    
    // Mark current chapter as completed in localStorage
    const savedProgression = localStorage.getItem('minka-progression');
    if (savedProgression) {
      try {
        const progression = JSON.parse(savedProgression);
        if (progression.episodeProgress && progression.episodeProgress[story.id]) {
          // Increment chaptersCompleted
          progression.episodeProgress[story.id].chaptersCompleted = currentChapterIndex + 1;
          
          // If last chapter, mark episode as completed
          if (isLastChapter) {
            progression.episodeProgress[story.id].completed = true;
            progression.episodeProgress[story.id].completedAt = new Date().toISOString();
          }
          
          localStorage.setItem('minka-progression', JSON.stringify(progression));
        }
      } catch (e) {
        console.error(t.story.failedToSaveChapterCompletion, e);
      }
    }
    
    if (isLastChapter) {
      onComplete();
    } else {
      setCurrentChapterIndex(prev => prev + 1);
      setCurrentSceneIndex(0);
      setShowVocabulary(false);
      setShowExercises(false);
      setCurrentExerciseIndex(0);
      setExerciseAnswers({});
      setAllExerciseAnswers({}); // Reset for new chapter
      setShowExerciseCorrection(false);
      setShowResults(false);
      setChapterStartTime(Date.now());
      setNewWordsAdded([]);
    }
  };

  const handlePreviousChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(prev => prev - 1);
      setCurrentSceneIndex(0);
      setShowVocabulary(false);
      setShowExercises(false);
      setCurrentExerciseIndex(0);
      setExerciseAnswers({});
      setShowExerciseCorrection(false);
      setShowResults(false);
    }
  };

  const handleExerciseAnswer = (answerIndex: number) => {
    const exercise = currentChapter.exercises[currentExerciseIndex];
    const isCorrect = answerIndex === exercise.correct;
    
    // Store answer for current scene
    setExerciseAnswers(prev => ({
      ...prev,
      [currentExerciseIndex]: answerIndex
    }));
    
    // Store in global exercise tracking with full details
    const globalIndex = currentChapterIndex * 100 + currentSceneIndex * 10 + currentExerciseIndex;
    setAllExerciseAnswers(prev => ({
      ...prev,
      [globalIndex]: {
        userAnswer: answerIndex,
        correct: exercise.correct,
        question: exercise.question,
        options: exercise.options || []
      }
    }));
    
    // Award XP for exercise
    if (onAwardXP) {
      if (isCorrect) {
        onAwardXP(15, t.story.exerciseCorrect);
      } else {
        onAwardXP(5, t.story.exerciseAttempt);
      }
    }
    
    // Update quest progress
    if (onUpdateQuest) {
      onUpdateQuest('complete_exercises');
      if (isCorrect) {
        // Check if all exercises so far are correct
        const allCorrectSoFar = Object.values(allExerciseAnswers).every(a => a.userAnswer === a.correct) && isCorrect;
        if (allCorrectSoFar) {
          onUpdateQuest('perfect_exercises');
        }
      }
    }
    
    setShowExerciseCorrection(true);
  };

  const handleNextExercise = () => {
    setShowExerciseCorrection(false);
    if (currentExerciseIndex < currentChapter.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      // After completing all exercises for this scene
      setShowExercises(false);
      setCurrentExerciseIndex(0);
      setExerciseAnswers({});
      
      if (isLastScene) {
        // If last scene, show vocabulary then move to next chapter
        setShowVocabulary(true);
      } else {
        // Move to next scene
        setCurrentSceneIndex(prev => prev + 1);
      }
    }
  };

  const getExerciseScore = () => {
    let correct = 0;
    currentChapter.exercises.forEach((exercise, index) => {
      if (exerciseAnswers[index] === exercise.correct) {
        correct++;
      }
    });
    return { correct, total: currentChapter.exercises.length };
  };

  const renderProgressBar = () => {
    const progress = getTotalProgress();
    return (
      <div className="w-full bg-white/30 rounded-full h-3 mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#BCA6FF] to-[#D9EDE6] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    );
  };

  const getCharacterAvatar = (character: string) => {
    const char = character.toLowerCase();

    // Character image paths (you can replace these with actual PNG paths)
    const imageMap: Record<string, string> = {
      'minka': '/images/avatars/minka.png',
      'lisa': '/images/avatars/lisa.png',
      'pinko': '/images/avatars/pinko.png',
      'boby': '/images/avatars/boby.png',
      'emma': '/images/avatars/emma.png'
    };

    // Fallback emojis if images don't exist
    const emojiMap: Record<string, string> = {
      'minka': '🐱',
      'lisa': '👧',
      'pinko': '🐷',
      'boby': '🐶',
      'emma': '👩'
    };

    return {
      image: imageMap[char],
      emoji: emojiMap[char] || '👤'
    };
  };

  // Create a map of German words to their English translations
  const getVocabularyMap = () => {
    const map = new Map<string, string>();
    currentChapter.vocabulary.forEach(item => {
      // Add exact match
      map.set(item.german.toLowerCase(), item.english);
      
      // Also add matches with common variations (with/without capitalization, punctuation)
      const variations = [
        item.german.toLowerCase(),
        item.german.toLowerCase().replace(/[.,!?;:]/g, ''),
        item.german,
        item.german.replace(/[.,!?;:]/g, ''),
      ];
      
      variations.forEach(variation => {
        map.set(variation, item.english);
      });
    });
    return map;
  };

  // Render text with interactive vocabulary words - ALL GERMAN WORDS ARE CLICKABLE
  const renderInteractiveText = (text: string) => {
    const vocabItems = currentChapter.vocabulary || [];
    
    // Create a map for quick lookup - handle both exact matches and normalized versions
    const vocabMap = new Map<string, VocabularyItem>();
    vocabItems.forEach(item => {
      const normalized = item.german.toLowerCase();
      vocabMap.set(normalized, item);
      // Also map without special characters for better matching
      vocabMap.set(normalized.replace(/[.,!?;:'"]/g, ''), item);
    });
    
    const handleWordClick = (vocabItem: VocabularyItem, sentence: string, e: React.MouseEvent) => {
      e.stopPropagation();
      
      // Add as cloze sentence flashcard
      FlashcardSystem.addClozeFlashcard(vocabItem, sentence, story.id, true);
      
      // Track word learned
      if (onWordLearned) {
        onWordLearned();
      }
      
      // Award XP
      if (onAwardXP) {
        onAwardXP(3, t.story.wordAddedToFlashcards);
      }
      
      // Show a brief notification
      const notification = document.createElement('div');
      notification.textContent = `✓ "${vocabItem.german}" added to flashcards!`;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #41ad83;
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
      }, 2000);
    };
    
    // Use a more robust approach: split by spaces and punctuation, but keep them
    const tokens = text.split(/(\s+|[.,!?;:'"])/);
    const result: React.ReactNode[] = [];
    
    tokens.forEach((token, index) => {
      // Skip empty tokens and pure whitespace
      if (!token || !token.trim()) {
        result.push(token);
        return;
      }
      
      // Remove punctuation for lookup
      const cleanToken = token.toLowerCase().replace(/[.,!?;:'"]/g, '').trim();
      
      if (!cleanToken) {
        result.push(token);
        return;
      }
      
      const vocabItem = vocabMap.get(cleanToken);
      
      if (vocabItem) {
        const isInFlashcards = FlashcardSystem.isWordInFlashcards(cleanToken);
        const displayText = vocabItem.german;
        
        result.push(
          <span 
            key={`vocab-${cleanToken}-${index}`}
            className={`vocab-word inline-block ${isInFlashcards ? 'in-flashcards' : ''}`}
            onClick={(e) => handleWordClick(vocabItem, text, e)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
            title={`${vocabItem.english}${!isInFlashcards ? ' - Click to add to flashcards' : ' - Already in flashcards'}`}
          >
            {displayText}
            <span className="vocab-tooltip">
              <div className="flex items-center gap-2">
                {vocabItem.article && (
                  <span className="text-xs font-bold text-purple-600">{vocabItem.article}</span>
                )}
              </div>
              <div className="mt-2 font-semibold">{vocabItem.english}</div>
              {vocabItem.plural && (
                <div className="text-xs text-purple-200">Plural: {vocabItem.plural}</div>
              )}
              {!isInFlashcards && (
                <div className="tooltip-hint mt-2">Click to add to flashcards</div>
              )}
              {isInFlashcards && (
                <div className="tooltip-hint mt-2">✓ In flashcards</div>
              )}
            </span>
          </span>
        );
      } else {
        // Not a vocabulary word, render as-is
        result.push(<React.Fragment key={`plain-${index}`}>{token}</React.Fragment>);
      }
    });
    
    return <>{result}</>;
  };

  const renderScene = () => {
    const scene = scenes[currentSceneIndex];
    
    // Get all vocabulary words in the chapter
    const chapterVocab = currentChapter.vocabulary || [];
    
    // Check if it's a dialogue scene
    if (scene.includes(':')) {
      const lines = scene.split('\n').filter(line => line.trim());
      return (
        <div className="flex gap-6 items-start">
          <motion.div
            key={currentSceneIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="card-glass min-h-[400px] flex-1"
          >
            <ul className="dialogue">
            {lines.map((line, lineIndex) => {
              if (line.includes(':')) {
                const [speaker, text] = line.split(':');
                const speakerName = speaker.trim().toLowerCase();
                const characterClass = ['minka', 'lisa', 'pinko', 'boby', 'emma', 'maus'].includes(speakerName) ? speakerName : '';
                
                const avatar = getCharacterAvatar(speakerName);
                
                return (
                  <motion.li
                    key={lineIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: lineIndex * 0.2 }}
                    className={`line ${characterClass}`}
                  >
                    <div className="avatar">
                      {avatar.image ? (
                        <img 
                          src={avatar.image} 
                          alt={speaker.trim()}
                          onError={(e) => {
                            // Fallback to emoji if image fails to load
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextSibling) {
                              (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <span style={{ display: avatar.image ? 'none' : 'flex' }}>
                        {avatar.emoji}
                      </span>
                    </div>
                    <div className="message-content">
                      <div className="speaker">{speaker.trim()}</div>
                      <div className="bubble">{renderInteractiveText(text.trim())}</div>
                    </div>
                  </motion.li>
                );
              }
              // Narration or stage directions
              return (
                <motion.li
                  key={lineIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: lineIndex * 0.2 }}
                  className="my-3"
                >
                  <div className="bg-[#f6f5ff] border border-[#ebe8ff] rounded-2xl px-5 py-3 text-[var(--ink-700)] text-base italic max-w-2xl mx-auto">
                    {renderInteractiveText(line.trim())}
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>
        {/* Right sidebar with vocabulary */}
        {chapterVocab.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg sticky top-4 max-h-[600px] overflow-y-auto"
          >
            <h3 className="text-lg font-bold text-[#4B3F72] mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              New Words
            </h3>
            <div className="space-y-3">
              {chapterVocab.map((item, index) => {
                const isInFlashcards = FlashcardSystem.isWordInFlashcards(item.german.toLowerCase());
                return (
                  <motion.div
                    key={index}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      isInFlashcards 
                        ? 'bg-[#d4f0d6] border-[#9ad8ba]' 
                        : 'bg-white border-[#ebe8ff] hover:bg-[#f6f5ff]'
                    }`}
                    onClick={() => {
                      FlashcardSystem.addClozeFlashcard(item, scene.trim(), story.id, true);
                      if (onWordLearned) onWordLearned();
                      if (onAwardXP) onAwardXP(3, t.story.wordAddedToFlashcards);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#BCA6FF] to-[#9AD8BA] rounded-lg flex items-center justify-center text-2xl">
                        📝
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-[#2E3A28]">{item.german}</div>
                        <div className="text-sm text-[#6A7A6A]">{item.english}</div>
                        {isInFlashcards && (
                          <div className="text-xs text-[#265E40] mt-1">✓ In flashcards</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
        </div>
      );
    }
    
    // Regular narration - styled like dialogue with vocabulary sidebar
    return (
      <div className="flex gap-6 items-start">
        {/* Main text content */}
        <motion.div
          key={currentSceneIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="card-glass min-h-[400px] flex-1"
        >
          <div className="p-6">
            <div className="bg-[#f6f5ff] border border-[#ebe8ff] rounded-2xl p-6 text-[var(--ink-800)] leading-relaxed whitespace-pre-line text-xl max-w-3xl mx-auto">
              {renderInteractiveText(scene.trim())}
            </div>
          </div>
        </motion.div>
        
        {/* Right sidebar with vocabulary */}
        {chapterVocab.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg sticky top-4 max-h-[600px] overflow-y-auto"
          >
            <h3 className="text-lg font-bold text-[#4B3F72] mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              New Words
            </h3>
            <div className="space-y-3">
              {chapterVocab.map((item, index) => {
                const isInFlashcards = FlashcardSystem.isWordInFlashcards(item.german.toLowerCase());
                return (
                  <motion.div
                    key={index}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      isInFlashcards 
                        ? 'bg-[#d4f0d6] border-[#9ad8ba]' 
                        : 'bg-white border-[#ebe8ff] hover:bg-[#f6f5ff]'
                    }`}
                    onClick={() => {
                      FlashcardSystem.addClozeFlashcard(item, scene.trim(), story.id, true);
                      if (onWordLearned) onWordLearned();
                      if (onAwardXP) onAwardXP(3, t.story.wordAddedToFlashcards);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Simple icon instead of image */}
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#BCA6FF] to-[#9AD8BA] rounded-lg flex items-center justify-center text-2xl">
                        📝
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-[#2E3A28]">{item.german}</div>
                        <div className="text-sm text-[#6A7A6A]">{item.english}</div>
                        {isInFlashcards && (
                          <div className="text-xs text-[#265E40] mt-1">✓ In flashcards</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  const renderVocabulary = () => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
      >
        <h3 className="text-2xl font-bold text-[#4B3F72] mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Chapter Complete! 🎉
        </h3>
        <p className="text-[#5E548E] text-lg mb-6">
          Great job! You've completed this chapter. Here's what you learned:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {currentChapter.vocabulary.map((item, index) => (
            <VocabularyAudioCard
              key={index}
              german={item.german}
              english={item.english}
              audioUrl={item.audio}
            />
          ))}
        </div>
        <div className="flex justify-center">
          <button
            onClick={handleNextChapter}
            className="btn btn-primary text-lg px-8 py-3"
          >
            Continue to Grammar
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </motion.div>
    );
  };

  const renderGrammar = () => {
    const grammarLesson = getGrammarLessonByEpisode(story.id);
    
    if (!grammarLesson) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl text-center"
        >
          <h3 className="text-2xl font-bold text-[#4B3F72] mb-4">Grammar Coming Soon!</h3>
          <p className="text-[#5E548E] mb-6">Grammar lessons for this chapter are being prepared.</p>
          <button
            onClick={() => setShowCompletionPage(true)}
            className="btn btn-primary text-lg px-8 py-3"
          >
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
      >
        <h3 className="text-2xl font-bold text-[#4B3F72] mb-6 flex items-center gap-2">
          📘 Grammar Focus
        </h3>
        <h4 className="text-xl font-semibold text-[#5E548E] mb-4">{grammarLesson.title}</h4>
        
        {/* Grammar Rules */}
        <div className="space-y-4 mb-8">
          {grammarLesson.rules.map((rule, index) => (
            <div key={index} className="bg-[#F8F5F0] rounded-xl p-4">
              <h5 className="font-semibold text-[#4B3F72] mb-2">{rule.title}</h5>
              <p className="text-[#5E548E] mb-3">{rule.explanation}</p>
              {rule.examples && rule.examples.length > 0 && (
                <div className="space-y-2">
                  {rule.examples.map((example, exIdx) => (
                    <div key={exIdx} className="bg-white rounded-lg p-3 border-l-4 border-[#BCA6FF]">
                      <div className="font-medium text-[#4B3F72]">{example.german}</div>
                      <div className="text-sm text-[#6D5B95]">{example.english}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => {
              setShowGrammar(false);
              setShowCompletionPage(true);
            }}
            className="btn btn-primary text-lg px-8 py-3"
          >
            Complete Chapter
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </motion.div>
    );
  };

  const renderExercises = () => {
    const currentExercise = currentChapter.exercises[currentExerciseIndex];
    if (!currentExercise) return null;

    const userAnswer = exerciseAnswers[currentExerciseIndex];
    const isCorrect = userAnswer === currentExercise.correct;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
      >
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#4B3F72]">Exercise {currentExerciseIndex + 1}</h3>
            <span className="text-sm text-[#6D5B95] bg-[#F8F5F0] px-3 py-1 rounded-full">
              {currentExerciseIndex + 1} of {currentChapter.exercises.length}
            </span>
          </div>
          <p className="text-[#5E548E] text-lg mb-6">{currentExercise.question}</p>
        </div>

        <div className="space-y-3 mb-6">
          {currentExercise.options?.map((option, index) => {
            const isSelected = userAnswer === index;
            const isCorrectAnswer = index === currentExercise.correct;
            
            let buttonClass = 'w-full p-4 rounded-xl text-left transition-all border-2 ';
            
            if (showExerciseCorrection) {
              if (isCorrectAnswer) {
                buttonClass += 'bg-green-100 border-green-500 text-green-800';
              } else if (isSelected && !isCorrect) {
                buttonClass += 'bg-red-100 border-red-500 text-red-800';
              } else {
                buttonClass += 'bg-gray-100 border-gray-300 text-gray-600';
              }
            } else {
              if (isSelected) {
                buttonClass += 'bg-[#BCA6FF] border-[#BCA6FF] text-white shadow-md';
              } else {
                buttonClass += 'bg-[#F8F5F0] border-[#F8F5F0] text-[#5E548E] hover:bg-[#F3ECF9] hover:border-[#E8DDF2]';
              }
            }

            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => !showExerciseCorrection && handleExerciseAnswer(index)}
                disabled={showExerciseCorrection}
                className={buttonClass}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showExerciseCorrection && isCorrectAnswer && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {showExerciseCorrection && isSelected && !isCorrect && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {showExerciseCorrection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl mb-6 ${
              isCorrect 
                ? 'bg-green-50 border-2 border-green-200' 
                : 'bg-yellow-50 border-2 border-yellow-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              ) : (
                <div className="h-6 w-6 flex-shrink-0 mt-1">
                  <span className="text-2xl">💡</span>
                </div>
              )}
              <div>
                <h4 className={`font-semibold mb-1 ${isCorrect ? 'text-green-800' : 'text-yellow-800'}`}>
                  {isCorrect ? t.story.correct : t.story.notQuiteRight}
                </h4>
                <p className={isCorrect ? 'text-green-700' : 'text-yellow-700'}>
                  {isCorrect 
                    ? t.story.greatJob 
                    : `The correct answer is: "${currentExercise.options?.[currentExercise.correct]}"`
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex justify-between">
          <button
            onClick={() => {
              setShowExerciseCorrection(false);
              setCurrentExerciseIndex(prev => Math.max(0, prev - 1));
            }}
            disabled={currentExerciseIndex === 0}
            className="btn btn-ghost"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </button>
          <button
            onClick={handleNextExercise}
            disabled={!showExerciseCorrection}
            className="btn btn-primary"
          >
            {currentExerciseIndex === currentChapter.exercises.length - 1 
              ? (isLastScene ? t.story.completeChapter : t.story.nextScene) 
              : t.story.nextExercise}
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </motion.div>
    );
  };

  // Render completion page with stats
  const renderCompletionPage = () => {
    const timeSpent = Math.max(1, Math.round((Date.now() - chapterStartTime) / 1000 / 60)); // minutes, minimum 1
    
    // Calculate stats from all exercises across all scenes
    const allAnswers = Object.values(allExerciseAnswers);
    const totalExercises = allAnswers.length;
    const correctExercises = allAnswers.filter(a => a.userAnswer === a.correct).length;
    const accuracy = totalExercises > 0 ? Math.round((correctExercises / totalExercises) * 100) : 0;
    
    // Get mistakes
    const mistakes = allAnswers.filter(a => a.userAnswer !== a.correct);
    
    const encouragementMessages = [
      t.story.fantasticWork,
      t.story.youreDoingGreat,
      t.story.excellentProgress,
      t.story.keepUpAmazingWork,
      t.story.youreAStar,
      t.story.wonderfulJob
    ];
    const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];

    return (
      <div className="minka-shell p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-glass p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            
            <h2 className="text-3xl font-bold text-[var(--ink-900)] mb-2">
              Chapter Complete!
            </h2>
            <p className="text-xl text-[var(--lav-500)] mb-8 font-semibold">
              {randomMessage}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-[var(--mint-50)] p-6 rounded-xl">
                <div className="text-3xl font-bold text-[var(--mint-500)]">{correctExercises}/{totalExercises}</div>
                <div className="text-sm text-[var(--ink-700)]">Correct Exercises</div>
                <div className="text-xs text-[var(--mint-500)] mt-1">{accuracy}% accuracy</div>
              </div>
              <div className="bg-[var(--lav-50)] p-6 rounded-xl">
                <div className="text-3xl font-bold text-[var(--lav-500)]">{newWordsAdded.length}</div>
                <div className="text-sm text-[var(--ink-700)]">New Words Saved</div>
                <div className="text-xs text-[var(--lav-500)] mt-1">Added to flashcards</div>
              </div>
              <div className="bg-[var(--peach-50)] p-6 rounded-xl">
                <div className="text-3xl font-bold text-[var(--peach-400)]">{timeSpent}</div>
                <div className="text-sm text-[var(--ink-700)]">Minutes</div>
                <div className="text-xs text-[var(--peach-400)] mt-1">Time spent</div>
              </div>
            </div>

            {/* Mistakes Review */}
            {mistakes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8"
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-2xl">💡</span>
                  <h3 className="text-lg font-bold text-yellow-800">
                    Review Your Mistakes ({mistakes.length})
                  </h3>
                </div>
                <div className="space-y-4 text-left">
                  {mistakes.map((mistake, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-yellow-200">
                      <div className="font-semibold text-[var(--ink-900)] mb-2">
                        {mistake.question}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-red-600">
                            Your answer: <strong>{mistake.options[mistake.userAnswer]}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">
                            Correct answer: <strong>{mistake.options[mistake.correct]}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* New words added message */}
            {newWordsAdded.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8"
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-bold text-green-800">
                    ✓ {newWordsAdded.length} New Words Added to Flashcards!
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {newWordsAdded.map((word, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white rounded-full text-sm text-green-700 border border-green-200"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowVocabularySidebar(true)}
                className="btn btn-secondary text-lg"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                New Words
              </button>
              <button
                onClick={() => {
                  if (onNavigateToVocabulary) {
                    onNavigateToVocabulary();
                  } else if (onComplete) {
                    // If no specific navigation handler, go back to home and trigger vocabulary
                    onComplete();
                  }
                }}
                className="btn btn-primary text-lg"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Practice Flashcards
              </button>
              <button
                onClick={handleContinueToNextChapter}
                className="btn btn-primary text-lg"
              >
                {isLastChapter ? t.story.completeStory : t.story.nextChapter}
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  if (showCompletionPage) {
    return renderCompletionPage();
  }

  return (
    <main className="minka-shell p-6" role="main" aria-label={t.story.scene}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="header-card mb-6"
          role="banner"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="glow-title">{story.title}</h1>
              <div className="header-meta mt-3">
                <span className="pill">⏱️ {story.estimatedTime} min</span>
                {!showVocabulary && !showExercises && !showDigitalReader && !showGrammar && (
                  <span className="pill">📄 Scene {currentSceneIndex + 1}/{totalScenes}</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Go back to previous scene or chapter
                  if (currentSceneIndex > 0) {
                    setCurrentSceneIndex(currentSceneIndex - 1);
                  } else if (currentChapterIndex > 0) {
                    setCurrentChapterIndex(currentChapterIndex - 1);
                    setCurrentSceneIndex(scenes.length - 1);
                  } else {
                    onBack(); // If at the beginning, go to home
                  }
                }}
                className="home-chip flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={onBack}
                className="home-chip flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </button>
            </div>
          </div>
          <div className="progress mt-4">
            <span style={{ width: `${getTotalProgress()}%` }}></span>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {!showVocabulary && !showExercises && !showGrammar && (
            <motion.div
              key={`scene-${currentSceneIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderScene()}
            </motion.div>
          )}
          {showVocabulary && (
            <motion.div
              key="vocabulary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderVocabulary()}
            </motion.div>
          )}
          {showExercises && (
            <motion.div
              key="exercises"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderExercises()}
            </motion.div>
          )}
          {showGrammar && (
            <motion.div
              key="grammar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderGrammar()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scene Navigation */}
        {!showVocabulary && !showExercises && !showGrammar && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="controls mt-8"
          >
            <button
              onClick={handlePreviousScene}
              disabled={currentSceneIndex === 0}
              className="btn btn-ghost"
              aria-label="Go to previous scene"
              aria-describedby="scene-counter"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>
            <div id="scene-counter" className="text-sm text-[var(--ink-500)] text-center" aria-live="polite">
              Scene {currentSceneIndex + 1} / {totalScenes}
            </div>
            <button
              onClick={handleNextScene}
              className="btn btn-primary"
              aria-label={isLastScene ? "Go to exercises" : "Go to next scene"}
              aria-describedby="scene-counter"
            >
              {isLastScene ? t.story.exercises : t.story.next}
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {/* Chapter Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between mt-4"
        >
          <button
            onClick={handlePreviousChapter}
            disabled={currentChapterIndex === 0}
            className="btn btn-ghost opacity-50 hover:opacity-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous Chapter
          </button>
          <div className="text-sm text-[var(--ink-500)] self-center">
            Progress: {Math.round(getTotalProgress())}%
          </div>
          <button
            onClick={handleNextChapter}
            disabled={!showVocabulary}
            className="btn btn-primary opacity-50 hover:opacity-100 disabled:opacity-30"
          >
            {isLastChapter ? t.story.completeStory : t.story.nextChapter}
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </motion.div>
      </div>

      {/* Vocabulary Sidebar */}
      <VocabularySidebar
        vocabulary={currentChapter.vocabulary}
        isOpen={showVocabularySidebar}
        onClose={() => setShowVocabularySidebar(false)}
        onWordAdded={(word) => {
          if (onWordLearned) {
            onWordLearned();
          }
          if (onAwardXP) {
            onAwardXP(3, t.story.wordAddedToFlashcards);
          }
        }}
        episodeId={story.id}
      />
    </main>
  );
}