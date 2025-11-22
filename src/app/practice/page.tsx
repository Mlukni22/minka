'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Lightbulb } from 'lucide-react';
import { getStoryById } from '@/lib/db/stories';
import { createClozeSentence, validateAnswer, generateHint } from '@/lib/flashcard-utils';

interface FlashcardDTO {
  id: string;
  frontText: string;
  backText: string;
  contextSentence: string;
  contextTranslation?: string;
  storyTitle?: string;
  displayType: 'A' | 'B';
}

interface QueueStats {
  dueToday: number;
  newToday: number;
  remainingInSession: number;
}

export default function PracticePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [cards, setCards] = useState<FlashcardDTO[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<QueueStats>({ dueToday: 0, newToday: 0, remainingInSession: 0 });
  const [selectedStoryId, setSelectedStoryId] = useState<string>('');
  const [stories, setStories] = useState<Array<{ id: string; title: string }>>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [cardsReviewed, setCardsReviewed] = useState(0);
  
  // Type B (Cloze) state
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isCorrect: boolean;
    isAlmostCorrect: boolean;
    distance: number;
  } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/auth/login');
        return;
      }

      setUserId(firebaseUser.uid);
      await loadQueue(firebaseUser.uid);
    });

    return () => {
      unsubscribe();
    };
  }, [router, selectedStoryId]);

  // Reset Type B state when card changes
  useEffect(() => {
    setUserAnswer('');
    setShowHint(false);
    setValidationResult(null);
    setShowResult(false);
    setShowAnswer(false);
    // Focus input for Type B
    if (cards[currentIndex]?.displayType === 'B') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentIndex, cards]);

  const loadQueue = async (uid: string) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        userId: uid,
        limit: '20',
      });
      
      if (selectedStoryId) {
        params.append('storyId', selectedStoryId);
      }
      
      const url = `/api/flashcards/queue?${params}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to load queue: ${response.status}`);
      }
      
      const data = await response.json();
      
      setCards(data.cards || []);
      setStats(data.stats || { dueToday: 0, newToday: 0, remainingInSession: 0 });
      
      if (!data.cards || data.cards.length === 0) {
        setSessionComplete(true);
      } else {
        setCurrentIndex(0);
        setShowAnswer(false);
        setSessionComplete(false);
      }
    } catch (error) {
      console.error('Error loading flashcards:', error);
      alert('Failed to load flashcards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeBCheck = async () => {
    if (!cards[currentIndex] || !userId) return;
    
    const card = cards[currentIndex];
    const validation = validateAnswer(userAnswer, card.frontText);
    setValidationResult(validation);
    setShowResult(true);
    
    // If answer is correct, automatically submit review with rating 3 (Good) and move to next card
    if (validation.isCorrect) {
      // Immediately advance to next card
      (async () => {
        try {
          const response = await fetch('/api/flashcards/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              flashcardId: card.id,
              rating: 3, // "Good" rating for correct answer
              cardType: card.displayType,
              userAnswer: userAnswer,
              isCorrect: true,
            }),
          });

          if (!response.ok) throw new Error('Failed to save review');

          setCardsReviewed(cardsReviewed + 1);

          // Reset Type B state
          setUserAnswer('');
          setShowHint(false);
          setValidationResult(null);
          setShowResult(false);

          // Move to next card
          const nextIndex = currentIndex + 1;
          if (nextIndex >= cards.length) {
            setSessionComplete(true);
          } else {
            setCurrentIndex(nextIndex);
            setShowAnswer(false);
            // Focus input for Type B
            if (cards[nextIndex]?.displayType === 'B') {
              setTimeout(() => inputRef.current?.focus(), 100);
            }
          }
        } catch (error) {
          console.error('Error reviewing flashcard:', error);
          alert('Failed to save review. Please try again.');
        }
      })();
    }
  };

  const handleReview = async (rating: 0 | 1 | 2 | 3) => {
    if (!userId || !cards[currentIndex]) return;

    const card = cards[currentIndex];
    let userAnswerValue: string | undefined;
    let isCorrectValue: boolean | undefined;

    // For Type B, use validation result
    if (card.displayType === 'B' && validationResult) {
      userAnswerValue = userAnswer;
      isCorrectValue = validationResult.isCorrect;
    }

    try {
      const response = await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          flashcardId: card.id,
          rating,
          cardType: card.displayType,
          userAnswer: userAnswerValue,
          isCorrect: isCorrectValue,
        }),
      });

      if (!response.ok) throw new Error('Failed to save review');

      setCardsReviewed(cardsReviewed + 1);

      // Reset Type B state
      setUserAnswer('');
      setShowHint(false);
      setValidationResult(null);
      setShowResult(false);

      // After Type A review, show Type B for the same card
      if (card.displayType === 'A') {
        // Update the card's display type to B
        const updatedCards = [...cards];
        updatedCards[currentIndex] = {
          ...card,
          displayType: 'B',
        };
        setCards(updatedCards);
        // Reset to show Type B (cloze)
        setShowAnswer(false);
        // Focus input for Type B
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        // Type B was reviewed, move to next card
        const nextIndex = currentIndex + 1;
        if (nextIndex >= cards.length) {
          setSessionComplete(true);
        } else {
          setCurrentIndex(nextIndex);
          setShowAnswer(false);
          // Focus input for Type B
          if (cards[nextIndex]?.displayType === 'B') {
            setTimeout(() => inputRef.current?.focus(), 100);
          }
        }
      }
    } catch (error) {
      console.error('Error reviewing flashcard:', error);
      alert('Failed to save review. Please try again.');
    }
  };

  const insertGermanChar = (char: string) => {
    if (!inputRef.current) return;
    const input = inputRef.current;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const newValue = userAnswer.slice(0, start) + char + userAnswer.slice(end);
    setUserAnswer(newValue);
    
    // Set cursor position after inserted character
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + char.length, start + char.length);
    }, 0);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (sessionComplete || loading || !cards[currentIndex]) return;

      const card = cards[currentIndex];
      const isTypeB = card.displayType === 'B';

      if (isTypeB) {
        // Type B: Enter checks answer, Space shows hint
        if (e.key === 'Enter' && !showResult && userAnswer.trim()) {
          e.preventDefault();
          handleTypeBCheck();
        } else if (e.key === ' ' && !showResult) {
          e.preventDefault();
          setShowHint(true);
        } else if (showResult && validationResult && !validationResult.isCorrect) {
          // After result shown (and incorrect), use number keys for rating
          // If correct, auto-advance happens, so no rating needed
          if (e.key === '1') handleReview(0);
          else if (e.key === '2') handleReview(1);
          else if (e.key === '3') handleReview(2);
          else if (e.key === '4') handleReview(3);
        }
      } else {
        // Type A: Space/Enter toggles reveal
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (!showAnswer) {
            setShowAnswer(true);
          }
        } else if (showAnswer) {
          if (e.key === '1') handleReview(0);
          else if (e.key === '2') handleReview(1);
          else if (e.key === '3') handleReview(2);
          else if (e.key === '4') handleReview(3);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showAnswer, showResult, sessionComplete, loading, currentIndex, cards, userAnswer, validationResult]);

  // Highlight word in context sentence
  const highlightWordInContext = (sentence: string, word: string): string => {
    if (!sentence || !word) return sentence || '';
    try {
      const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      return sentence.replace(regex, (match) => 
        `<span class="bg-purple-100 underline font-semibold">${match}</span>`
      );
    } catch (error) {
      console.error('Error highlighting word in context:', error, { sentence, word });
      return sentence;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (sessionComplete && cards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            You&apos;re done for today!
          </h2>
          <p className="text-gray-600 mb-6">
            Come back tomorrow or continue reading a story to save new words.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/stories">
              <Button variant="accent" className="w-full">
                Back to Stories
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" className="w-full">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (sessionComplete && cards.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Complete!</h2>
          <p className="text-gray-600 mb-2">
            Cards reviewed: <strong>{cardsReviewed}</strong>
          </p>
          <div className="flex flex-col gap-3 mt-6">
            <Button
              onClick={() => {
                setSessionComplete(false);
                setCurrentIndex(0);
                setShowAnswer(false);
                setCardsReviewed(0);
                if (userId) loadQueue(userId);
              }}
              variant="accent"
              className="w-full"
            >
              Review More
            </Button>
            <Link href="/dashboard">
              <Button variant="secondary" className="w-full">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  
  if (!currentCard) {
    return null;
  }

  const progress = ((currentIndex + 1) / cards.length) * 100;
  const sessionProgress = stats.remainingInSession > 0 
    ? ((cardsReviewed) / (cards.length + stats.remainingInSession)) * 100 
    : progress;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </Link>
            <div className="text-sm text-gray-600">
              {currentIndex + 1} / {cards.length}
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Practice Words</h1>
              <p className="text-sm text-gray-600 mt-1">
                Practice the words you saved from stories
              </p>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div>Due today: <strong>{stats.dueToday}</strong></div>
              <div>New: <strong>{stats.newToday}</strong></div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${sessionProgress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Flashcard */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 min-h-[400px] flex flex-col items-center justify-center" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
          {currentCard.displayType === 'A' ? (
            // Type A: German Front / Translation Back
            !showAnswer ? (
              // Front
              <div className="text-center w-full">
                <div className="text-sm text-gray-500 mb-4">German</div>
                <div 
                  className="text-4xl font-bold mb-8" 
                  style={{ 
                    color: '#111827',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-inter), system-ui, sans-serif'
                  }}
                >
                  {currentCard?.frontText || '(No word)'}
                </div>
                
                {/* Context Sentence - Always visible */}
                {currentCard.contextSentence && currentCard.contextSentence.trim() && (
                  <div className="mb-8 w-full">
                    <div className="text-sm text-gray-500 mb-3 font-medium">Example sentence:</div>
                    <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                      <div
                        className="text-xl text-gray-800 italic leading-relaxed"
                        style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
                        dangerouslySetInnerHTML={{
                          __html: highlightWordInContext(currentCard.contextSentence, currentCard.frontText || ''),
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Story Tag */}
                {currentCard.storyTitle && (
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      <BookOpen className="w-3 h-3" />
                      {currentCard.storyTitle}
                    </span>
                  </div>
                )}

                <Button
                  onClick={() => setShowAnswer(true)}
                  variant="accent"
                  size="lg"
                >
                  Show Answer
                </Button>
                <p className="text-xs text-gray-500 mt-4">
                  Press <kbd className="px-2 py-1 bg-gray-100 rounded">Space</kbd> or <kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd> to reveal
                </p>
              </div>
            ) : (
              // Back
              <div className="text-center w-full">
                <div className="text-sm text-gray-500 mb-4">English</div>
                <div 
                  className="text-4xl font-bold mb-6" 
                  style={{ 
                    color: '#111827',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-inter), system-ui, sans-serif'
                  }}
                >
                  {currentCard?.backText || '(No translation)'}
                </div>

                {/* Context Sentence + Translation - Always visible */}
                {currentCard.contextSentence && currentCard.contextSentence.trim() && (
                  <div className="mb-6 w-full">
                    <div className="text-sm text-gray-500 mb-3 font-medium">Example sentence:</div>
                    <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                      <div className="text-xl text-gray-800 italic leading-relaxed" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
                        {currentCard.contextSentence}
                      </div>
                      {currentCard.contextTranslation && currentCard.contextTranslation.trim() && (
                        <div className="text-lg text-gray-600 italic border-t border-gray-200 pt-3" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
                          &quot;{currentCard.contextTranslation}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rating Buttons */}
                <div className="space-y-4">
                  <div className="text-sm font-medium text-gray-700 mb-4">
                    How well did you know this?
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Button
                      onClick={() => handleReview(0)}
                      variant="secondary"
                      className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                    >
                      Again
                      <span className="ml-2 text-xs opacity-75">(1)</span>
                    </Button>
                    <Button
                      onClick={() => handleReview(1)}
                      variant="secondary"
                      className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
                    >
                      Hard
                      <span className="ml-2 text-xs opacity-75">(2)</span>
                    </Button>
                    <Button
                      onClick={() => handleReview(2)}
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                    >
                      Good
                      <span className="ml-2 text-xs opacity-75">(3)</span>
                    </Button>
                    <Button
                      onClick={() => handleReview(3)}
                      variant="secondary"
                      className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                    >
                      Easy
                      <span className="ml-2 text-xs opacity-75">(4)</span>
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    Press <kbd className="px-2 py-1 bg-gray-100 rounded">1-4</kbd> to rate
                  </p>
                </div>
              </div>
            )
          ) : (
            // Type B: Cloze (Fill in the Missing Word)
            !showResult ? (
              // Input phase
              <div className="text-center w-full max-w-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Type the missing word</h2>
                
                {/* Cloze Sentence - Always visible, one continuous line */}
                {currentCard.contextSentence && currentCard.contextSentence.trim() && (
                  <div className="mb-6 w-full">
                    <div className="text-sm text-gray-500 mb-3 font-medium">Complete the sentence:</div>
                    <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 overflow-x-auto">
                      <div 
                        className="text-2xl text-gray-800 font-medium"
                        style={{ 
                          whiteSpace: 'nowrap',
                          display: 'block',
                          overflow: 'visible',
                          fontFamily: 'var(--font-inter), system-ui, sans-serif'
                        }}
                      >
                        {createClozeSentence(currentCard.contextSentence, currentCard.frontText || '')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Meaning */}
                <div className="mb-6">
                  <span className="text-base text-gray-600">Meaning: </span>
                  <span className="text-2xl font-bold text-gray-900">{currentCard.backText}</span>
                </div>

                {/* German Character Buttons */}
                <div className="mb-4 flex justify-center gap-2">
                  {['ä', 'ö', 'ü', 'ß'].map((char) => (
                    <button
                      key={char}
                      onClick={() => insertGermanChar(char)}
                      className="px-3 py-2 bg-black text-white hover:bg-gray-800 rounded-lg text-lg font-medium transition-colors"
                    >
                      {char}
                    </button>
                  ))}
                </div>

                {/* Input Field */}
                <div className="mb-4">
                  <input
                    ref={inputRef}
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type in German"
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-gray-900 bg-white"
                    style={{ color: '#111827', fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
                    autoFocus
                  />
                </div>

                {/* Show Hint Button */}
                <div className="mb-6">
                  <Button
                    onClick={() => setShowHint(true)}
                    variant="ghost"
                    size="sm"
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Show Hint
                  </Button>
                  {showHint && (
                    <div className="mt-2 text-sm text-gray-600">
                      Hint: <span className="font-mono font-semibold">{generateHint(currentCard.frontText)}</span>
                    </div>
                  )}
                </div>

                {/* Check Button */}
                <Button
                  onClick={handleTypeBCheck}
                  variant="accent"
                  size="lg"
                  disabled={!userAnswer.trim()}
                  className="w-full"
                >
                  Check
                </Button>
                <p className="text-xs text-gray-500 mt-4">
                  Press <kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd> to check, <kbd className="px-2 py-1 bg-gray-100 rounded">Space</kbd> for hint
                </p>
              </div>
            ) : (
              // Result phase
              <div className="text-center w-full max-w-lg">
                {validationResult?.isCorrect ? (
                  // Correct - Immediately advancing
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-green-600 mb-4">Correct! ✓</div>
                    <div className="p-4 bg-green-50 rounded-lg mb-4">
                      <div
                        className="text-lg text-gray-800"
                        dangerouslySetInnerHTML={{
                          __html: currentCard.contextSentence.replace(
                            new RegExp(`\\b${currentCard.frontText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
                            (match) => `<span class="bg-green-200 font-semibold">${match}</span>`
                          ),
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  // Incorrect
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-red-600 mb-4">Incorrect ✗</div>
                    <div className="p-4 bg-red-50 rounded-lg mb-4 space-y-2">
                      <div className="text-sm text-gray-600">Your answer:</div>
                      <div className="text-lg font-semibold text-gray-900">{userAnswer || '(empty)'}</div>
                      <div className="text-sm text-gray-600 mt-4">Correct answer:</div>
                      <div className="text-lg font-semibold text-green-700">{currentCard.frontText}</div>
                      <div className="text-sm text-gray-600 mt-2">Translation: <span className="font-semibold">{currentCard.backText}</span></div>
                    </div>
                  </div>
                )}

                {/* Rating Buttons - Only show if answer is incorrect */}
                {!validationResult?.isCorrect && (
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-gray-700 mb-4">
                      How well did you know this?
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Button
                        onClick={() => handleReview(0)}
                        variant="secondary"
                        className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                      >
                        Again
                        <span className="ml-2 text-xs opacity-75">(1)</span>
                      </Button>
                      <Button
                        onClick={() => handleReview(1)}
                        variant="secondary"
                        className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
                      >
                        Hard
                        <span className="ml-2 text-xs opacity-75">(2)</span>
                      </Button>
                      <Button
                        onClick={() => handleReview(2)}
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                      >
                        Good
                        <span className="ml-2 text-xs opacity-75">(3)</span>
                      </Button>
                      <Button
                        onClick={() => handleReview(3)}
                        variant="secondary"
                        className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                      >
                        Easy
                        <span className="ml-2 text-xs opacity-75">(4)</span>
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      Press <kbd className="px-2 py-1 bg-gray-100 rounded">1-4</kbd> to rate
                    </p>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}

