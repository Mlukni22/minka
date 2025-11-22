'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DictionaryResult, VerbForms } from '@/types/dictionary';
import { createFlashcardWithContext } from '@/lib/db/flashcards';
import { onAuthChange } from '@/lib/auth';
import { Search, Loader2, BookOpen, Plus, ChevronDown, ChevronUp } from 'lucide-react';

interface DictionaryProps {
  initialWord?: string;
  onWordClick?: (word: string) => void;
}

export function Dictionary({ initialWord = '', onWordClick }: DictionaryProps) {
  const [word, setWord] = useState(initialWord);
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingToFlashcards, setAddingToFlashcards] = useState(false);
  const [expandedVerbForms, setExpandedVerbForms] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID on mount
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        setUserId(firebaseUser.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const searchWord = async () => {
    if (!word.trim()) {
      setError('Please enter a word to search');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/dictionary?word=${encodeURIComponent(word.trim())}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch translation');
      }

      const data: DictionaryResult = await response.json();
      
      if (data.error || data.translation === 'Not found') {
        setError('Sorry, no translation found. Try another word.');
        setResult(null);
      } else {
        setResult(data);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch translation');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFlashcards = async () => {
    if (!result || !userId) {
      setError('You must be logged in to add words to flashcards');
      return;
    }

    setAddingToFlashcards(true);
    setError(null);

    try {
      // Use first example as context sentence if available
      const contextSentence = result.examples && result.examples.length > 0 
        ? result.examples[0] 
        : result.word;

      await createFlashcardWithContext(userId, {
        languageCode: 'de',
        frontText: result.word,
        backText: result.translation,
        contextSentence,
        contextTranslation: result.examples && result.examples.length > 0 ? result.examples[0] : undefined,
      });

      // Show success message
      setError(null);
      alert(`"${result.word}" has been added to your flashcards!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add word to flashcards');
    } finally {
      setAddingToFlashcards(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      searchWord();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-600" />
          Dictionary
        </h2>
        <p className="text-sm text-gray-600">Look up any German word</p>
      </div>

      {/* Search Input */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a German word..."
          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-gray-900"
          disabled={loading}
        />
        <Button
          onClick={searchWord}
          variant="accent"
          disabled={loading || !word.trim()}
          className="px-6"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Word and Translation */}
          <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{result.word}</h3>
                <p className="text-xl text-gray-700">{result.translation}</p>
              </div>
              {result.cached && (
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">Cached</span>
              )}
            </div>

            {/* Add to Flashcards Button */}
            {userId && (
              <Button
                onClick={handleAddToFlashcards}
                variant="secondary"
                disabled={addingToFlashcards}
                className="w-full mt-4"
              >
                {addingToFlashcards ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Flashcards
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Verb Forms */}
          {result.isVerb && result.verbForms && (
            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <button
                onClick={() => setExpandedVerbForms(!expandedVerbForms)}
                className="w-full flex items-center justify-between text-left mb-4"
              >
                <h4 className="text-lg font-semibold text-gray-900">Conjugation</h4>
                {expandedVerbForms ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {expandedVerbForms && (
                <div className="space-y-4">
                  {result.verbForms.infinitive && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Infinitive</p>
                      <p className="text-lg text-gray-900">{result.verbForms.infinitive}</p>
                    </div>
                  )}

                  {result.verbForms.present && result.verbForms.present.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Present (Präsens)</p>
                      <div className="grid grid-cols-2 gap-2">
                        {['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'].map((pronoun, i) => (
                          <div key={pronoun} className="flex justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">{pronoun}</span>
                            <span className="text-sm font-medium text-gray-900">
                              {result.verbForms!.present[i] || '-'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.verbForms.past && result.verbForms.past.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Past (Präteritum)</p>
                      <div className="grid grid-cols-2 gap-2">
                        {['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'].map((pronoun, i) => (
                          <div key={pronoun} className="flex justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">{pronoun}</span>
                            <span className="text-sm font-medium text-gray-900">
                              {result.verbForms!.past[i] || '-'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.verbForms.perfect && result.verbForms.perfect.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Perfect (Perfekt)</p>
                      <div className="grid grid-cols-2 gap-2">
                        {['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'].map((pronoun, i) => (
                          <div key={pronoun} className="flex justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">{pronoun}</span>
                            <span className="text-sm font-medium text-gray-900">
                              {result.verbForms!.perfect[i] || '-'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Example Sentences */}
          {result.examples && result.examples.length > 0 && (
            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Examples</h4>
              <ul className="space-y-2">
                {result.examples.map((example, i) => (
                  <li key={i} className="text-gray-700 italic border-l-4 border-purple-300 pl-4 py-2">
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

