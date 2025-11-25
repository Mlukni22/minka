/**
 * React component for reviewing flashcards
 * Integrates with the SR module API
 */

'use client';

import React, { useState, useEffect } from 'react';

interface Card {
  id: string;
  front: string;
  back: string;
  nextReview: string;
  easeFactor: number;
  intervalDays: number;
  reps: number;
  totalReviews: number;
  isLeech: boolean;
}

interface ReviewPanelProps {
  apiUrl?: string;
  userId?: string;
  onReviewComplete?: (card: Card) => void;
}

export default function ReviewPanel({
  apiUrl = 'http://localhost:3001',
  userId,
  onReviewComplete,
}: ReviewPanelProps) {
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dueCards, setDueCards] = useState<Card[]>([]);
  const [reviewCount, setReviewCount] = useState(0);

  // Fetch due cards on mount
  useEffect(() => {
    fetchDueCards();
  }, []);

  const fetchDueCards = async () => {
    try {
      setIsLoading(true);
      const url = new URL(`${apiUrl}/cards/due`);
      if (userId) {
        url.searchParams.set('userId', userId);
      }

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch due cards');

      const cards = await response.json();
      setDueCards(cards);

      if (cards.length > 0) {
        setCurrentCard(cards[0]);
      }
    } catch (error) {
      console.error('Error fetching due cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitReview = async (quality: number) => {
    if (!currentCard) return;

    try {
      setIsLoading(true);

      const response = await fetch(`${apiUrl}/cards/${currentCard.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quality,
          userId,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit review');

      const data = await response.json();
      const updatedCard = data.card;

      // Callback
      if (onReviewComplete) {
        onReviewComplete(updatedCard);
      }

      // Update state
      setReviewCount((prev) => prev + 1);
      setIsRevealed(false);

      // Move to next card
      const remainingCards = dueCards.slice(1);
      setDueCards(remainingCards);

      if (remainingCards.length > 0) {
        setCurrentCard(remainingCards[0]);
      } else {
        // No more cards, fetch new ones
        await fetchDueCards();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!currentCard || isLoading) return;

    // Space or Enter to reveal
    if ((e.key === ' ' || e.key === 'Enter') && !isRevealed) {
      e.preventDefault();
      setIsRevealed(true);
      return;
    }

    // Number keys 0-5 to rate
    if (isRevealed) {
      const quality = parseInt(e.key);
      if (!isNaN(quality) && quality >= 0 && quality <= 5) {
        submitReview(quality);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress as any);
    return () => window.removeEventListener('keydown', handleKeyPress as any);
  }, [currentCard, isRevealed, isLoading]);

  if (isLoading && !currentCard) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading cards...</div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="text-xl font-semibold text-gray-700">
          🎉 No cards due for review!
        </div>
        <button
          onClick={fetchDueCards}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
    );
  }

  const qualityLabels = [
    { quality: 0, label: 'Again (0)', color: 'bg-red-500' },
    { quality: 1, label: 'Very Hard (1)', color: 'bg-orange-500' },
    { quality: 2, label: 'Hard (2)', color: 'bg-yellow-500' },
    { quality: 3, label: 'Good (3)', color: 'bg-green-500' },
    { quality: 4, label: 'Easy (4)', color: 'bg-blue-500' },
    { quality: 5, label: 'Perfect (5)', color: 'bg-purple-500' },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress */}
      <div className="mb-4 text-sm text-gray-600">
        Reviewed: {reviewCount} | Remaining: {dueCards.length}
      </div>

      {/* Card */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        {currentCard.isLeech && (
          <div className="mb-4 p-2 bg-yellow-100 border border-yellow-400 rounded text-yellow-800 text-sm">
            ⚠️ This card is marked as a leech (difficult to remember)
          </div>
        )}

        <div className="text-2xl font-bold mb-6 text-center">
          {currentCard.front}
        </div>

        {isRevealed ? (
          <>
            <div className="text-xl mb-6 text-center text-gray-700">
              {currentCard.back}
            </div>
            <div className="text-sm text-gray-500 mb-4 text-center">
              How well did you remember?
            </div>
            <div className="grid grid-cols-3 gap-2">
              {qualityLabels.map(({ quality, label, color }) => (
                <button
                  key={quality}
                  onClick={() => submitReview(quality)}
                  disabled={isLoading}
                  className={`${color} text-white px-4 py-3 rounded hover:opacity-90 disabled:opacity-50 text-sm font-medium`}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <button
            onClick={() => setIsRevealed(true)}
            className="w-full py-4 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-medium"
          >
            Show Answer (Space/Enter)
          </button>
        )}
      </div>

      {/* Card Stats */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>Reps: {currentCard.reps} | Total Reviews: {currentCard.totalReviews}</div>
        <div>
          Interval: {currentCard.intervalDays} days | EF: {currentCard.easeFactor.toFixed(2)}
        </div>
        <div>Next Review: {new Date(currentCard.nextReview).toLocaleDateString()}</div>
      </div>
    </div>
  );
}

/**
 * Usage example:
 * 
 * import ReviewPanel from '@/sr-module/frontend/ReviewPanel';
 * 
 * function App() {
 *   return (
 *     <ReviewPanel
 *       apiUrl="http://localhost:3001"
 *       userId="user-123"
 *       onReviewComplete={(card) => {
 *         console.log('Reviewed:', card);
 *       }}
 *     />
 *   );
 * }
 */


