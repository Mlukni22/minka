'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { VocabularyItem, Exercise } from '@/types';
import { Card, Button } from './layout';
import { FadeIn, BounceIn } from './animations';

interface VocabularyCardProps {
  vocabulary: VocabularyItem;
  onReview: (vocabularyId: string, performance: 'correct' | 'incorrect' | 'easy' | 'hard') => void;
}

export function VocabularyCard({ vocabulary, onReview }: VocabularyCardProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const masteryLevel = 'learning'; // Simplified since repetitions not available

  const masteryColors = {
    learning: 'border-blue-200 bg-blue-50',
    reviewing: 'border-yellow-200 bg-yellow-50',
    mastered: 'border-green-200 bg-green-50'
  };

  return (
    <Card className={`${masteryColors[masteryLevel]} transition-all duration-300`}>
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {vocabulary.german}
            </h3>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTranslation(!showTranslation)}
            >
              {showTranslation ? 'Hide' : 'Show'} Translation
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExample(!showExample)}
            >
              {showExample ? 'Hide' : 'Show'} Example
            </Button>
          </div>
        </div>

        {showTranslation && (
          <FadeIn>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2">Translation:</h4>
              <p className="text-lg text-gray-800">{vocabulary.english}</p>
            </div>
          </FadeIn>
        )}

        {showExample && (
          <FadeIn>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2">Example:</h4>
              <p className="text-gray-800 mb-2">{vocabulary.german}</p>
              <p className="text-gray-600 italic">{vocabulary.english}</p>
            </div>
          </FadeIn>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            <span className="capitalize">{masteryLevel}</span>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReview(vocabulary.german, 'incorrect')}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Incorrect
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReview(vocabulary.german, 'hard')}
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              Hard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReview(vocabulary.german, 'correct')}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Correct
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReview(vocabulary.german, 'easy')}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              Easy
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface ExerciseCardProps {
  exercise: Exercise;
  onSubmit: (answer: string | string[]) => void;
}

export function ExerciseCard({ exercise, onSubmit }: ExerciseCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[] | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    // For now, simple check - in real app, would handle different exercise types
    const correct = exercise.correct !== undefined && selectedAnswer !== null;
    
    setIsCorrect(correct);
    setShowResult(true);
    onSubmit(selectedAnswer);
  };

  const handleAnswerChange = (answer: string) => {
    if (exercise.type === 'multiple-choice') {
      setSelectedAnswer(answer);
    } else {
      setSelectedAnswer(answer);
    }
  };

  const renderQuestion = () => {
    switch (exercise.type) {
      case 'fill-blank':
        return (
          <div className="space-y-4">
            <p className="text-lg text-gray-800">{exercise.question}</p>
            <input
              type="text"
              value={selectedAnswer as string || ''}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              placeholder="Type your answer here..."
            />
          </div>
        );
      
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            <p className="text-lg text-gray-800">{exercise.question}</p>
            <div className="space-y-2">
              {exercise.options?.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={() => handleAnswerChange(option)}
                    className="text-orange-500 focus:ring-orange-300"
                  />
                  <span className="text-gray-800">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );
      
      case 'translation':
        return (
          <div className="space-y-4">
            <p className="text-lg text-gray-800">{exercise.question}</p>
            <textarea
              value={selectedAnswer as string || ''}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-transparent h-24 resize-none"
              placeholder="Type your translation here..."
            />
          </div>
        );
      
      default:
        return <p className="text-lg text-gray-800">{exercise.question}</p>;
    }
  };

  return (
    <Card>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-800">
            Exercise
          </h3>
          <div className="text-sm text-gray-500">
            {exercise.type.replace('-', ' ')}
          </div>
        </div>

        {renderQuestion()}

        {showResult && (
          <BounceIn>
            <div className={`p-4 rounded-lg border-2 ${
              isCorrect 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">{isCorrect ? '✅' : '❌'}</span>
                <span className="font-semibold">
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
            </div>
          </BounceIn>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {showResult ? (isCorrect ? '+XP' : 'Try again!') : ''}
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={selectedAnswer === null || showResult}
            className="px-6"
          >
            {showResult ? 'Next Exercise' : 'Submit Answer'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
