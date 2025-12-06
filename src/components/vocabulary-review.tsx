import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SRSVocabularyItem, SRSAlgorithm } from '@/lib/srs';
import { FlashcardSystem } from '@/lib/flashcard-system';
import { Button } from '@/components/layout';
import { AudioPlayer } from '@/components/audio-player';
import { Volume2, CheckCircle, XCircle, ThumbsUp, ThumbsDown, ArrowRight, ArrowLeft, Home, BookOpen } from 'lucide-react';

interface VocabularyReviewProps {
  items?: SRSVocabularyItem[];
  onComplete: (updatedItems: SRSVocabularyItem[]) => void;
  onBack: () => void;
}

export function VocabularyReview({ items: propItems, onComplete, onBack }: VocabularyReviewProps) {
  // Load user's personal flashcards and convert to SRSVocabularyItem
  // For now, just use propItems and ignore loaded flashcards
  // In the future, this can be enhanced to properly map flashcard data
  const items = propItems || [];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedItems, setReviewedItems] = useState<SRSVocabularyItem[]>([]);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });

  // useEffect to load flashcards removed - using propItems only for now

  const currentItem = items[currentIndex];
  const isLastItem = currentIndex === items.length - 1;
  const progress = ((currentIndex + 1) / items.length) * 100;

  const handleReveal = () => {
    setShowAnswer(true);
  };

  const handleResponse = (performance: 'correct' | 'incorrect' | 'easy' | 'hard') => {
    const updatedItem = SRSAlgorithm.calculateNextReview(currentItem, performance);
    const newReviewedItems = [...reviewedItems, updatedItem];
    setReviewedItems(newReviewedItems);

    // Update flashcard review stats
    FlashcardSystem.updateReviewStats(currentItem.german);

    // Update stats
    if (performance === 'correct' || performance === 'easy') {
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }

    // Move to next item or complete
    if (isLastItem) {
      onComplete(newReviewedItems);
    } else {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const handleSkip = () => {
    // Mark as incorrect and move on
    handleResponse('incorrect');
  };

  // Show empty state if no flashcards
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F8F5F0] via-[#F3ECF9] to-[#E8DDF2] p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-[#6D5B95]" />
            <h2 className="text-2xl font-bold text-[#4B3F72] mb-4">No Flashcards Yet!</h2>
            <p className="text-[#5E548E] mb-6">
              Your flashcard deck is empty. Complete lessons or click on vocabulary words in dialogues to add them to your personal collection.
            </p>
            <Button onClick={onBack} className="bg-[#BCA6FF] hover:bg-[#A794FF] text-white">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentItem) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F5F0] via-[#F3ECF9] to-[#E8DDF2] p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#4B3F72]">Vocabulary Review</h1>
              <p className="text-[#5E548E] mt-2">
                Card {currentIndex + 1} of {items.length}
              </p>
            </div>
            <Button
              onClick={onBack}
              variant="outline"
              className="border-[#6D5B95]/30 text-[#6D5B95]"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#BCA6FF] to-[#D9EDE6] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>{stats.correct} correct</span>
            </div>
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-4 w-4" />
              <span>{stats.incorrect} incorrect</span>
            </div>
          </div>
        </motion.div>

        {/* Flashcard */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl min-h-[400px] flex flex-col justify-center items-center"
          >
            {/* Front of card - German word */}
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-[#4B3F72] mb-6">
                {currentItem.german}
              </div>
              <AudioPlayer 
                text={currentItem.german}
                audioUrl={currentItem.audio}
                showText={false}
                size="lg"
                className="justify-center"
              />
            </div>

            {/* Answer section */}
            <AnimatePresence>
              {showAnswer ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center w-full"
                >
                  <div className="text-3xl text-[#5E548E] mb-8">
                    {currentItem.english}
                  </div>

                  {/* Response buttons */}
                  <div className="flex flex-col gap-3 max-w-md mx-auto">
                    <div className="text-sm text-[#6D5B95] mb-2">How well did you know this?</div>
                    
                    <Button
                      onClick={() => handleResponse('incorrect')}
                      className="bg-red-100 hover:bg-red-200 text-red-700 border-2 border-red-300"
                    >
                      <XCircle className="h-5 w-5 mr-2" />
                      Didn&apos;t Know
                    </Button>

                    <Button
                      onClick={() => handleResponse('hard')}
                      className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border-2 border-yellow-300"
                    >
                      <ThumbsDown className="h-5 w-5 mr-2" />
                      Hard
                    </Button>

                    <Button
                      onClick={() => handleResponse('correct')}
                      className="bg-green-100 hover:bg-green-200 text-green-700 border-2 border-green-300"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Good
                    </Button>

                    <Button
                      onClick={() => handleResponse('easy')}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 border-2 border-blue-300"
                    >
                      <ThumbsUp className="h-5 w-5 mr-2" />
                      Easy
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-4"
                >
                  <Button
                    onClick={handleReveal}
                    className="bg-[#BCA6FF] hover:bg-[#A794FF] text-white px-8 py-4 text-lg"
                  >
                    Show Answer
                  </Button>
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    className="border-[#6D5B95]/30 text-[#6D5B95]"
                  >
                    Skip
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Navigation hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-sm text-[#6D5B95]"
        >
          {!showAnswer ? (
            <p>Click "Show Answer" to reveal the translation</p>
          ) : (
            <p>Rate how well you knew this word to optimize your learning</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

