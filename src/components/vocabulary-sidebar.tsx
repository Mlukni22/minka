'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Volume2, Plus, Check } from 'lucide-react';
import { VocabularyItem } from '@/types';
import { FlashcardSystem } from '@/lib/flashcard-system';
import { AudioPlayer } from './audio-player';

interface VocabularySidebarProps {
  vocabulary: VocabularyItem[];
  isOpen: boolean;
  onClose: () => void;
  onWordAdded?: (word: VocabularyItem) => void;
  episodeId: string;
}

export function VocabularySidebar({ 
  vocabulary, 
  isOpen, 
  onClose, 
  onWordAdded,
  episodeId 
}: VocabularySidebarProps) {
  const [addedWords, setAddedWords] = useState<Set<string>>(new Set());

  const handleAddWord = (word: VocabularyItem) => {
    FlashcardSystem.addWordToFlashcards(word, episodeId, true);
    setAddedWords(prev => new Set([...prev, word.german.toLowerCase()]));
    
    if (onWordAdded) {
      onWordAdded(word);
    }
  };

  const isWordAdded = (word: string) => {
    return addedWords.has(word.toLowerCase()) || FlashcardSystem.isWordInFlashcards(word.toLowerCase());
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-[#7B6AF5]" />
                  <h2 className="text-xl font-bold text-gray-800">New Words</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Click words in the text or here to add them to your flashcards
              </p>
            </div>

            {/* Vocabulary List */}
            <div className="p-6 space-y-4">
              {vocabulary.map((word, index) => {
                const isAdded = isWordAdded(word.german);
                
                return (
                  <motion.div
                    key={word.german}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isAdded 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-white hover:border-[#7B6AF5] hover:bg-purple-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Word Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-800">
                            {word.wordType === 'noun' && word.article 
                              ? `${word.article} ${word.german}`
                              : word.german}
                          </h3>
                          {word.wordType && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                              {word.wordType}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-2">{word.english}</p>
                        
                        {word.plural && (
                          <p className="text-sm text-gray-500 mb-2">
                            <span className="font-medium">Plural:</span> {word.plural}
                          </p>
                        )}
                        
                        {word.conjugation && (
                          <div className="text-xs text-gray-500 mb-2">
                            <span className="font-medium">Present:</span> {word.conjugation.ich}
                          </div>
                        )}

                        {/* Audio Player */}
                        {word.audio && (
                          <div className="mb-3">
                            <AudioPlayer text={word.german} audioUrl={word.audio} showText={false} size="sm" />
                          </div>
                        )}

                        {/* Add Button */}
                        <button
                          onClick={() => handleAddWord(word)}
                          disabled={isAdded}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isAdded
                              ? 'bg-green-100 text-green-700 cursor-not-allowed'
                              : 'bg-[#7B6AF5] text-white hover:bg-[#6A59E4] hover:shadow-md'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="h-4 w-4" />
                              Added
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4" />
                              Add to Flashcards
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  {vocabulary.length} new words in this lesson
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
