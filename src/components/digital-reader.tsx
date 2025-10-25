'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, BookOpen, CheckCircle, XCircle, Eye, EyeOff, RotateCcw, ArrowLeft, Lightbulb } from 'lucide-react';
import { AudioPlayer } from '@/components/audio-player';

interface Word {
  german: string;
  english: string;
  audio?: string;
}

interface FillInBlank {
  sentence: string;
  blanks: { position: number; answer: string; options?: string[] }[];
}

interface ComprehensionQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

interface DigitalReaderProps {
  title: string;
  text: string;
  vocabulary: Word[];
  fillInBlanks?: FillInBlank[];
  comprehensionQuiz?: ComprehensionQuestion[];
  onComplete?: () => void;
  onBack?: () => void;
}

export function DigitalReader({
  title,
  text,
  vocabulary,
  fillInBlanks = [],
  comprehensionQuiz = [],
  onComplete,
  onBack
}: DigitalReaderProps) {
  const [mode, setMode] = useState<'read' | 'practice' | 'quiz' | 'flashcards'>('read');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [showTranslations, setShowTranslations] = useState(false);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, string>>({});
  const [showPracticeResults, setShowPracticeResults] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Create a map of German words to their translations
  const wordMap = new Map(vocabulary.map(v => [v.german.toLowerCase(), v]));

  const handleWordClick = (word: string, event: React.MouseEvent) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
    const wordData = wordMap.get(cleanWord);
    
    if (wordData) {
      setSelectedWord(wordData);
      setClickPosition({ x: event.clientX, y: event.clientY });
    }
  };

  const renderInteractiveText = () => {
    const words = text.split(/\s+/);
    
    return (
      <div className="card-glass p-8 text-lg leading-relaxed">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[var(--ink-900)]">{title}</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setShowTranslations(!showTranslations)}
              className="btn btn-ghost text-sm flex items-center gap-2"
            >
              {showTranslations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showTranslations ? 'Hide' : 'Show'} Translations
            </button>
            <AudioPlayer 
              text={text} 
              showText={false}
              size="md"
            />
          </div>
        </div>

        <div className="text-[var(--ink-900)]">
          {words.map((word, index) => {
            const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
            const isVocab = wordMap.has(cleanWord);
            const punctuation = word.match(/[.,!?;:]$/)?.[0] || '';
            const displayWord = word.replace(/[.,!?;:]$/, '');
            
            return (
              <span key={index}>
                {isVocab ? (
                  <span
                    onClick={(e) => handleWordClick(word, e)}
                    className="cursor-pointer border-b-2 border-dashed border-[var(--lav-500)] hover:bg-[var(--lav-50)] transition-colors relative inline-block"
                    title="Click for translation"
                  >
                    {displayWord}
                    {showTranslations && (
                      <span className="absolute -top-6 left-0 bg-[var(--lav-500)] text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {wordMap.get(cleanWord)?.english}
                      </span>
                    )}
                  </span>
                ) : (
                  <span>{displayWord}</span>
                )}
                {punctuation}
                {' '}
              </span>
            );
          })}
        </div>

        {/* Word Translation Popup */}
        <AnimatePresence>
          {selectedWord && clickPosition && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setSelectedWord(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed z-50 bg-white rounded-xl shadow-2xl p-4 max-w-xs"
                style={{
                  left: `${Math.min(clickPosition.x, window.innerWidth - 250)}px`,
                  top: `${Math.min(clickPosition.y, window.innerHeight - 150)}px`,
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-xl font-bold text-[var(--lav-500)]">{selectedWord.german}</div>
                    <div className="text-sm text-[var(--ink-700)]">{selectedWord.english}</div>
                  </div>
                  {selectedWord.audio && (
                    <AudioPlayer 
                      text={selectedWord.german}
                      audioUrl={selectedWord.audio}
                      showText={false}
                      size="sm"
                    />
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderPracticeMode = () => {
    return (
      <div className="card-glass p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[var(--ink-900)] flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-[var(--gold-500)]" />
            Fill in the Blanks
          </h2>
          <button
            onClick={() => {
              setPracticeAnswers({});
              setShowPracticeResults(false);
            }}
            className="btn btn-ghost text-sm flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>

        <div className="space-y-6">
          {fillInBlanks.map((item, itemIndex) => {
            const parts = [];
            let lastIndex = 0;

            // Sort blanks by position
            const sortedBlanks = [...item.blanks].sort((a, b) => a.position - b.position);

            sortedBlanks.forEach((blank, blankIndex) => {
              // Add text before blank
              parts.push(
                <span key={`text-${itemIndex}-${blankIndex}`}>
                  {item.sentence.substring(lastIndex, blank.position)}
                </span>
              );

              const userAnswer = practiceAnswers[`${itemIndex}-${blankIndex}`] || '';
              const isCorrect = userAnswer.toLowerCase().trim() === blank.answer.toLowerCase().trim();
              const showResult = showPracticeResults;

              // Add blank input
              parts.push(
                <span key={`blank-${itemIndex}-${blankIndex}`} className="inline-block mx-1">
                  {blank.options ? (
                    <select
                      value={userAnswer}
                      onChange={(e) => setPracticeAnswers({
                        ...practiceAnswers,
                        [`${itemIndex}-${blankIndex}`]: e.target.value
                      })}
                      className={`border-2 rounded px-2 py-1 ${
                        showResult
                          ? isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-[var(--lav-300)]'
                      }`}
                      disabled={showResult}
                    >
                      <option value="">---</option>
                      {blank.options.map((opt, optIdx) => (
                        <option key={optIdx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setPracticeAnswers({
                        ...practiceAnswers,
                        [`${itemIndex}-${blankIndex}`]: e.target.value
                      })}
                      className={`border-2 rounded px-2 py-1 w-32 ${
                        showResult
                          ? isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-[var(--lav-300)]'
                      }`}
                      disabled={showResult}
                      placeholder="..."
                    />
                  )}
                  {showResult && !isCorrect && (
                    <span className="ml-2 text-sm text-green-600 font-medium">
                      ({blank.answer})
                    </span>
                  )}
                </span>
              );

              lastIndex = blank.position;
            });

            // Add remaining text
            parts.push(
              <span key={`text-${itemIndex}-end`}>
                {item.sentence.substring(lastIndex)}
              </span>
            );

            return (
              <div key={itemIndex} className="text-lg leading-relaxed">
                {parts}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          {!showPracticeResults ? (
            <button
              onClick={() => setShowPracticeResults(true)}
              className="btn btn-primary"
            >
              Check Answers
            </button>
          ) : (
            <button
              onClick={() => {
                setPracticeAnswers({});
                setShowPracticeResults(false);
              }}
              className="btn btn-primary"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderQuizMode = () => {
    if (comprehensionQuiz.length === 0) {
      return (
        <div className="card-glass p-8 text-center">
          <p className="text-[var(--ink-700)]">No comprehension questions available.</p>
        </div>
      );
    }

    const currentQuestion = comprehensionQuiz[currentQuizIndex];
    const userAnswer = quizAnswers[currentQuizIndex];
    const isCorrect = userAnswer === currentQuestion.correct;

    return (
      <div className="card-glass p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[var(--ink-900)]">Comprehension Quiz</h2>
            <span className="text-sm text-[var(--ink-500)]">
              Question {currentQuizIndex + 1} / {comprehensionQuiz.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[var(--lav-500)] h-2 rounded-full transition-all"
              style={{ width: `${((currentQuizIndex + 1) / comprehensionQuiz.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <p className="text-xl mb-6 text-[var(--ink-900)]">{currentQuestion.question}</p>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!showQuizResult) {
                    setQuizAnswers({ ...quizAnswers, [currentQuizIndex]: index });
                    setShowQuizResult(true);
                  }
                }}
                disabled={showQuizResult}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  showQuizResult
                    ? index === currentQuestion.correct
                      ? 'border-green-500 bg-green-50'
                      : index === userAnswer
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                    : userAnswer === index
                    ? 'border-[var(--lav-500)] bg-[var(--lav-50)]'
                    : 'border-gray-300 hover:border-[var(--lav-300)] hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showQuizResult && index === currentQuestion.correct && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {showQuizResult && index === userAnswer && index !== currentQuestion.correct && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {showQuizResult && currentQuestion.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded"
            >
              <p className="text-sm text-blue-900">{currentQuestion.explanation}</p>
            </motion.div>
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => {
              setCurrentQuizIndex(Math.max(0, currentQuizIndex - 1));
              setShowQuizResult(false);
            }}
            disabled={currentQuizIndex === 0}
            className="btn btn-ghost"
          >
            Previous
          </button>
          {currentQuizIndex < comprehensionQuiz.length - 1 ? (
            <button
              onClick={() => {
                setCurrentQuizIndex(currentQuizIndex + 1);
                setShowQuizResult(false);
              }}
              disabled={!showQuizResult}
              className="btn btn-primary"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => {
                setMode('read');
                if (onComplete) onComplete();
              }}
              disabled={!showQuizResult}
              className="btn btn-primary"
            >
              Complete
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderFlashcards = () => {
    if (vocabulary.length === 0) {
      return (
        <div className="card-glass p-8 text-center">
          <p className="text-[var(--ink-700)]">No vocabulary available.</p>
        </div>
      );
    }

    const currentCard = vocabulary[currentFlashcardIndex];

    return (
      <div className="card-glass p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[var(--ink-900)]">Vocabulary Flashcards</h2>
            <span className="text-sm text-[var(--ink-500)]">
              {currentFlashcardIndex + 1} / {vocabulary.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[var(--mint-500)] h-2 rounded-full transition-all"
              style={{ width: `${((currentFlashcardIndex + 1) / vocabulary.length) * 100}%` }}
            />
          </div>
        </div>

        <div 
          className="min-h-[300px] flex flex-col items-center justify-center cursor-pointer"
          onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
        >
          <AnimatePresence mode="wait">
            {!showFlashcardAnswer ? (
              <motion.div
                key="german"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="text-5xl font-bold text-[var(--lav-500)] mb-4">
                  {currentCard.german}
                </div>
                {currentCard.audio && (
                  <AudioPlayer
                    text={currentCard.german}
                    audioUrl={currentCard.audio}
                    showText={false}
                    size="lg"
                    className="justify-center"
                  />
                )}
                <p className="text-sm text-[var(--ink-500)] mt-6">Click to reveal</p>
              </motion.div>
            ) : (
              <motion.div
                key="english"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="text-3xl text-[var(--mint-500)] mb-2">
                  {currentCard.german}
                </div>
                <div className="text-4xl font-semibold text-[var(--ink-900)]">
                  {currentCard.english}
                </div>
                <p className="text-sm text-[var(--ink-500)] mt-6">Click to flip back</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => {
              setCurrentFlashcardIndex(Math.max(0, currentFlashcardIndex - 1));
              setShowFlashcardAnswer(false);
            }}
            disabled={currentFlashcardIndex === 0}
            className="btn btn-ghost"
          >
            Previous
          </button>
          <button
            onClick={() => {
              if (currentFlashcardIndex < vocabulary.length - 1) {
                setCurrentFlashcardIndex(currentFlashcardIndex + 1);
                setShowFlashcardAnswer(false);
              } else {
                setMode('read');
              }
            }}
            className="btn btn-primary"
          >
            {currentFlashcardIndex < vocabulary.length - 1 ? 'Next' : 'Finish'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="minka-shell p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="header-card mb-6">
          <div className="flex items-center justify-between">
            <h1 className="glow-title text-2xl">Digital Reader</h1>
            <button onClick={onBack} className="home-chip flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>

          {/* Mode Selector */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              onClick={() => setMode('read')}
              className={`btn ${mode === 'read' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Read
            </button>
            {fillInBlanks.length > 0 && (
              <button
                onClick={() => setMode('practice')}
                className={`btn ${mode === 'practice' ? 'btn-primary' : 'btn-ghost'}`}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Practice
              </button>
            )}
            {comprehensionQuiz.length > 0 && (
              <button
                onClick={() => setMode('quiz')}
                className={`btn ${mode === 'quiz' ? 'btn-primary' : 'btn-ghost'}`}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Quiz
              </button>
            )}
            {vocabulary.length > 0 && (
              <button
                onClick={() => setMode('flashcards')}
                className={`btn ${mode === 'flashcards' ? 'btn-primary' : 'btn-ghost'}`}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Flashcards
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {mode === 'read' && renderInteractiveText()}
            {mode === 'practice' && renderPracticeMode()}
            {mode === 'quiz' && renderQuizMode()}
            {mode === 'flashcards' && renderFlashcards()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

