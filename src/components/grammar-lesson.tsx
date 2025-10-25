import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/layout';
import { Book, CheckCircle, ArrowRight, ArrowLeft, Home } from 'lucide-react';

interface GrammarRule {
  title: string;
  explanation: string;
  examples: {
    german: string;
    english: string;
  }[];
  table?: {
    headers: string[];
    rows: string[][];
  };
}

interface GrammarExercise {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface GrammarLessonProps {
  title: string;
  rules: GrammarRule[];
  exercises: GrammarExercise[];
  onComplete: () => void;
  onBack: () => void;
}

export function GrammarLesson({ title, rules, exercises, onComplete, onBack }: GrammarLessonProps) {
  const [currentSection, setCurrentSection] = useState<'rules' | 'exercises'>('rules');
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<number, number>>({});
  const [showExerciseCorrection, setShowExerciseCorrection] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const currentRule = rules[currentRuleIndex];
  const currentExercise = exercises[currentExerciseIndex];
  const isLastRule = currentRuleIndex === rules.length - 1;
  const isLastExercise = currentExerciseIndex === exercises.length - 1;

  const handleNextRule = () => {
    if (isLastRule) {
      setCurrentSection('exercises');
    } else {
      setCurrentRuleIndex(prev => prev + 1);
    }
  };

  const handlePreviousRule = () => {
    if (currentRuleIndex > 0) {
      setCurrentRuleIndex(prev => prev - 1);
    }
  };

  const handleExerciseAnswer = (answerIndex: number) => {
    setExerciseAnswers(prev => ({
      ...prev,
      [currentExerciseIndex]: answerIndex
    }));
    setShowExerciseCorrection(true);

    const isCorrect = answerIndex === currentExercise.correct;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const handleNextExercise = () => {
    setShowExerciseCorrection(false);
    if (isLastExercise) {
      onComplete();
    } else {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  };

  const renderRule = () => {
    return (
      <motion.div
        key={currentRuleIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
      >
        <h2 className="text-3xl font-bold text-[#4B3F72] mb-6 flex items-center gap-3">
          <Book className="h-8 w-8" />
          {currentRule.title}
        </h2>

        <div className="prose prose-lg max-w-none mb-8">
          <p className="text-[#5E548E] leading-relaxed whitespace-pre-line">
            {currentRule.explanation}
          </p>
        </div>

        {/* Examples */}
        {currentRule.examples.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#4B3F72] mb-4">Examples:</h3>
            <div className="space-y-3">
              {currentRule.examples.map((example, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-r from-[#E8F6EB] to-[#FFF1E5] rounded-xl p-4"
                >
                  <div className="font-semibold text-[#2F6045] mb-1">{example.german}</div>
                  <div className="text-[#6E4D2B] italic">{example.english}</div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        {currentRule.table && (
          <div className="mb-8 overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-md">
              <thead>
                <tr className="bg-[#BCA6FF]">
                  {currentRule.table.headers.map((header, index) => (
                    <th key={index} className="px-4 py-3 text-left text-white font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRule.table.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-[#F8F5F0]' : 'bg-white'}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3 text-[#5E548E]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={handlePreviousRule}
            disabled={currentRuleIndex === 0}
            variant="outline"
            className="border-[#6D5B95]/30 text-[#6D5B95]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="text-sm text-[#6D5B95] self-center">
            Rule {currentRuleIndex + 1} of {rules.length}
          </div>
          <Button
            onClick={handleNextRule}
            className="bg-[#BCA6FF] hover:bg-[#A794FF] text-white"
          >
            {isLastRule ? 'Start Exercises' : 'Next'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    );
  };

  const renderExercise = () => {
    const userAnswer = exerciseAnswers[currentExerciseIndex];
    const isCorrect = userAnswer === currentExercise.correct;

    return (
      <motion.div
        key={currentExerciseIndex}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
      >
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-[#4B3F72]">Grammar Exercise {currentExerciseIndex + 1}</h3>
            <span className="text-sm text-[#6D5B95] bg-[#F8F5F0] px-3 py-1 rounded-full">
              {currentExerciseIndex + 1} of {exercises.length}
            </span>
          </div>
          <p className="text-[#5E548E] text-lg mb-6">{currentExercise.question}</p>
        </div>

        <div className="space-y-3 mb-6">
          {currentExercise.options.map((option, index) => {
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
                  {isCorrect ? 'Correct!' : 'Not quite right'}
                </h4>
                <p className={isCorrect ? 'text-green-700' : 'text-yellow-700'}>
                  {currentExercise.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex justify-between">
          <Button
            onClick={() => setCurrentSection('rules')}
            variant="outline"
            className="border-[#6D5B95]/30 text-[#6D5B95]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Rules
          </Button>
          <Button
            onClick={handleNextExercise}
            disabled={!showExerciseCorrection}
            className="bg-[#BCA6FF] hover:bg-[#A794FF] text-white"
          >
            {isLastExercise ? 'Complete Lesson' : 'Next Exercise'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F5F0] via-[#F3ECF9] to-[#E8DDF2] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#4B3F72]">{title}</h1>
              <p className="text-[#5E548E] mt-2">
                {currentSection === 'rules' ? 'Grammar Rules' : 'Practice Exercises'}
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

          {/* Progress indicator */}
          <div className="mt-4 flex gap-2">
            <div className={`flex-1 h-2 rounded-full ${currentSection === 'rules' ? 'bg-[#BCA6FF]' : 'bg-[#D9EDE6]'}`} />
            <div className={`flex-1 h-2 rounded-full ${currentSection === 'exercises' ? 'bg-[#BCA6FF]' : 'bg-gray-200'}`} />
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {currentSection === 'rules' ? renderRule() : renderExercise()}
        </AnimatePresence>

        {/* Score display for exercises */}
        {currentSection === 'exercises' && score.total > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-6 text-sm text-[#6D5B95]"
          >
            Score: {score.correct} / {score.total} ({Math.round((score.correct / score.total) * 100)}%)
          </motion.div>
        )}
      </div>
    </div>
  );
}

