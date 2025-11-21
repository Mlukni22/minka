'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '@/lib/auth';
import { getDueFlashcards } from '@/lib/db/flashcards';
import { rateFlashcard } from '@/lib/db/flashcards';
import { awardXP } from '@/lib/db/user';
import { Flashcard, FlashcardRating } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { RotateCcw, ArrowLeft } from 'lucide-react';

export default function ReviewPage() {
  const router = useRouter();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [cardsReviewed, setCardsReviewed] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/auth/login');
        return;
      }

      setUserId(firebaseUser.uid);
      await loadFlashcards(firebaseUser.uid);
    });

    return () => unsubscribe();
  }, [router]);

  const loadFlashcards = async (uid: string) => {
    try {
      const dueCards = await getDueFlashcards(uid, 20);
      setFlashcards(dueCards);
      
      if (dueCards.length === 0) {
        setSessionComplete(true);
      }
    } catch (error) {
      console.error('Error loading flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleRate = async (rating: FlashcardRating) => {
    if (!userId || !flashcards[currentIndex]) return;

    setRating(true);

    try {
      await rateFlashcard(userId, flashcards[currentIndex].id, rating);
      await awardXP(userId, 5); // Award 5 XP per review

      const nextIndex = currentIndex + 1;
      setCardsReviewed(cardsReviewed + 1);

      if (nextIndex >= flashcards.length) {
        // Session complete
        setSessionComplete(true);
      } else {
        setCurrentIndex(nextIndex);
        setShowAnswer(false);
      }
    } catch (error) {
      console.error('Error rating flashcard:', error);
      alert('Failed to save rating. Please try again.');
    } finally {
      setRating(false);
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

  if (sessionComplete && flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Nothing to review right now</h2>
          <p className="text-gray-600 mb-6">
            Come back later or learn new words from stories.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/stories">
              <Button variant="accent" className="w-full">
                Browse Stories
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

  if (sessionComplete && flashcards.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Complete!</h2>
          <p className="text-gray-600 mb-2">
            Cards reviewed: <strong>{cardsReviewed}</strong>
          </p>
          <p className="text-gray-600 mb-6">
            Next reviews in: <strong>Tomorrow</strong>
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard">
              <Button variant="accent" className="w-full">
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/stories">
              <Button variant="secondary" className="w-full">
                Continue Learning
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          <div className="text-sm text-gray-600">
            {currentIndex + 1} / {flashcards.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 min-h-[400px] flex flex-col items-center justify-center">
          {!showAnswer ? (
            // Front (German)
            <div className="text-center w-full">
              <div className="text-sm text-gray-500 mb-4">German</div>
              <div className="text-3xl font-semibold text-gray-900 mb-8">
                {currentCard.front}
              </div>
              <Button
                onClick={handleShowAnswer}
                variant="accent"
                size="lg"
                disabled={rating}
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Show Answer
              </Button>
            </div>
          ) : (
            // Back (English + Example)
            <div className="text-center w-full">
              <div className="text-sm text-gray-500 mb-4">English</div>
              <div className="text-3xl font-semibold text-gray-900 mb-6">
                {currentCard.back}
              </div>
              {currentCard.exampleSentence && (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2 italic">
                    &quot;{currentCard.exampleSentence}&quot;
                  </div>
                </div>
              )}

              {/* Rating Buttons */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700 mb-4">
                  How well did you know this?
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Button
                    onClick={() => handleRate('again')}
                    variant="secondary"
                    className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                    disabled={rating}
                  >
                    Again
                  </Button>
                  <Button
                    onClick={() => handleRate('hard')}
                    variant="secondary"
                    className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
                    disabled={rating}
                  >
                    Hard
                  </Button>
                  <Button
                    onClick={() => handleRate('good')}
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                    disabled={rating}
                  >
                    Good
                  </Button>
                  <Button
                    onClick={() => handleRate('easy')}
                    variant="secondary"
                    className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                    disabled={rating}
                  >
                    Easy
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

