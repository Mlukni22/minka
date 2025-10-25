'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Calendar, CheckCircle, Filter, Search, TrendingUp, ChevronDown, ChevronUp, Book } from 'lucide-react';
import { UserFlashcard } from '@/lib/flashcard-system';
import { grammarLessons } from '@/data/grammar-lessons';

interface FlashcardsPageProps {
  flashcards: UserFlashcard[];
  onBack: () => void;
  onPractice: () => void;
}

type FilterType = 'all' | 'recent' | 'reviewed' | 'new';
type SortType = 'date' | 'alpha' | 'reviews' | 'wordType';
type ViewMode = 'grid' | 'chapters';
type LanguageFilter = 'all' | 'german' | 'english';
type WordTypeFilter = 'all' | 'noun' | 'verb' | 'adjective' | 'phrase' | 'other';

// Chapter/Episode names mapping
const CHAPTER_NAMES: Record<string, string> = {
  'episode-0-hallo': 'Chapter 1 – Hallo!',
  'episode-1-willkommen': 'Chapter 2 – Willkommen in Minka\'s Dorf',
  'episode-2-verlorener-schluessel': 'Chapter 3 – Der verlorene Schlüssel',
  'episode-3-brief': 'Chapter 4 – Der Brief ohne Absender',
  'episode-4-spuren': 'Chapter 5 – Spuren im Regen',
  'episode-5-geheimnis': 'Chapter 6 – Das Geheimnis im Turm',
};

export function FlashcardsPage({ flashcards, onBack, onPractice }: FlashcardsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('wordType');
  const [viewMode, setViewMode] = useState<ViewMode>('chapters');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>('all');
  const [wordTypeFilter, setWordTypeFilter] = useState<WordTypeFilter>('all');

  const stats = useMemo(() => {
    const total = flashcards.length;
    const reviewed = flashcards.filter(c => c.reviewCount > 0).length;
    const newCards = flashcards.filter(c => c.reviewCount === 0).length;
    const totalReviews = flashcards.reduce((sum, c) => sum + c.reviewCount, 0);

    return { total, reviewed, newCards, totalReviews };
  }, [flashcards]);

  // Group flashcards by chapter
  const flashcardsByChapter = useMemo(() => {
    const grouped: Record<string, UserFlashcard[]> = {};
    
    flashcards.forEach(card => {
      const episodeId = card.fromEpisode || 'unknown';
      if (!grouped[episodeId]) {
        grouped[episodeId] = [];
      }
      grouped[episodeId].push(card);
    });

    return grouped;
  }, [flashcards]);

  const filteredAndSortedCards = useMemo(() => {
    let filtered = flashcards;

    // Apply language filter
    if (languageFilter === 'german') {
      // Show only German-to-English cards (German side visible)
      filtered = filtered.filter(card => !card.german.match(/^[A-Za-z]/)); // Simple heuristic
    } else if (languageFilter === 'english') {
      // Show only English-to-German cards (English side visible)
      filtered = filtered.filter(card => card.german.match(/^[A-Za-z]/)); // Simple heuristic
    }

    // Apply word type filter
    if (wordTypeFilter !== 'all') {
      filtered = filtered.filter(card => card.wordType === wordTypeFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        card =>
          card.german.toLowerCase().includes(lower) ||
          card.english.toLowerCase().includes(lower)
      );
    }

    // Apply category filter
    if (filter === 'recent') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(card => new Date(card.addedAt) > weekAgo);
    } else if (filter === 'reviewed') {
      filtered = filtered.filter(card => card.reviewCount > 0);
    } else if (filter === 'new') {
      filtered = filtered.filter(card => card.reviewCount === 0);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sort === 'date') {
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      } else if (sort === 'alpha') {
        return a.german.localeCompare(b.german);
      } else if (sort === 'reviews') {
        return b.reviewCount - a.reviewCount;
      } else if (sort === 'wordType') {
        // Sort by word type: noun, verb, adjective, phrase, other
        const typeOrder: Record<string, number> = {
          'noun': 1,
          'verb': 2,
          'adjective': 3,
          'phrase': 4,
          'other': 5
        };
        const aOrder = typeOrder[a.wordType || 'other'] || 5;
        const bOrder = typeOrder[b.wordType || 'other'] || 5;
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
        // Within same type, sort alphabetically
        return a.german.localeCompare(b.german);
      }
      return 0;
    });

    return sorted;
  }, [flashcards, searchTerm, filter, sort, languageFilter, wordTypeFilter]);

  const toggleChapter = (episodeId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(episodeId)) {
        next.delete(episodeId);
      } else {
        next.add(episodeId);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(1000px_500px_at_10%_-10%,#E7F7E8_0%,transparent_60%),radial-gradient(900px_420px_at_90%_-10%,#F1ECFF_0%,transparent_60%),linear-gradient(180deg,#FFF9F3_0%,#FDFBFF_100%)] text-[#2E3A28]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-[#7B6AF5] hover:text-[#6B5AE5] font-semibold transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#2E3A28]">My Flashcards</h1>
              <p className="text-[#6A7A6A] mt-2 text-lg">Your personal vocabulary collection</p>
            </div>
            <button
              onClick={onPractice}
              className="hidden md:flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all bg-gradient-to-b from-[#BCA6FF] to-[#7B6AF5] hover:from-[#A794FF] hover:to-[#6A59E4]"
            >
              <BookOpen className="h-5 w-5" />
              Practice Now
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<BookOpen className="h-6 w-6" />}
            label="Total Cards"
            value={stats.total}
            color="from-[#F1ECFF] to-[#CBB8FF]"
          />
          <StatCard
            icon={<CheckCircle className="h-6 w-6" />}
            label="Reviewed"
            value={stats.reviewed}
            color="from-[#E7F7E8] to-[#9AD8BA]"
          />
          <StatCard
            icon={<Calendar className="h-6 w-6" />}
            label="New Cards"
            value={stats.newCards}
            color="from-[#FFD7BF] to-[#FFA96E]"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            label="Total Reviews"
            value={stats.totalReviews}
            color="from-[#FFF0DC] to-[#FFD8BF]"
          />
        </div>

        {/* Mobile Practice Button */}
        <button
          onClick={onPractice}
          className="md:hidden w-full mb-6 flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-semibold text-white shadow-lg bg-gradient-to-b from-[#BCA6FF] to-[#7B6AF5]"
        >
          <BookOpen className="h-5 w-5" />
          Practice Now
        </button>

        {/* View Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex justify-center gap-3 mb-6"
        >
          <button
            onClick={() => setViewMode('chapters')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              viewMode === 'chapters'
                ? 'bg-[#7B6AF5] text-white shadow-lg'
                : 'bg-white/80 text-[#6A7A6A] border border-[#EEE7FF] hover:bg-[#F7F5FF]'
            }`}
          >
            <Book className="h-5 w-5" />
            Library View
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              viewMode === 'grid'
                ? 'bg-[#7B6AF5] text-white shadow-lg'
                : 'bg-white/80 text-[#6A7A6A] border border-[#EEE7FF] hover:bg-[#F7F5FF]'
            }`}
          >
            <Filter className="h-5 w-5" />
            Grid View
          </button>
        </motion.div>

        {/* Filters and Search - Only show in Grid view */}
        {viewMode === 'grid' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur rounded-2xl border border-white shadow-sm p-4 mb-6"
          >
            {/* Language and Word Type Filters */}
            <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-gray-200">
              {/* Language Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Language:</span>
                <div className="flex gap-2">
                  <FilterButton
                    active={languageFilter === 'all'}
                    onClick={() => setLanguageFilter('all')}
                    label="All"
                  />
                  <FilterButton
                    active={languageFilter === 'german'}
                    onClick={() => setLanguageFilter('german')}
                    label="🇩🇪 German"
                  />
                  <FilterButton
                    active={languageFilter === 'english'}
                    onClick={() => setLanguageFilter('english')}
                    label="🇬🇧 English"
                  />
                </div>
              </div>

              {/* Word Type Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <div className="flex gap-2">
                  <FilterButton
                    active={wordTypeFilter === 'all'}
                    onClick={() => setWordTypeFilter('all')}
                    label="All"
                  />
                  <FilterButton
                    active={wordTypeFilter === 'noun'}
                    onClick={() => setWordTypeFilter('noun')}
                    label="Nouns"
                  />
                  <FilterButton
                    active={wordTypeFilter === 'verb'}
                    onClick={() => setWordTypeFilter('verb')}
                    label="Verbs"
                  />
                  <FilterButton
                    active={wordTypeFilter === 'adjective'}
                    onClick={() => setWordTypeFilter('adjective')}
                    label="Adjectives"
                  />
                  <FilterButton
                    active={wordTypeFilter === 'phrase'}
                    onClick={() => setWordTypeFilter('phrase')}
                    label="Phrases"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6A7A6A]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search flashcards..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#EEE7FF] bg-white outline-none focus:border-[#BCA6FF] focus:ring-2 focus:ring-[#EDEAFF] transition-all"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                <FilterButton
                  active={filter === 'all'}
                  onClick={() => setFilter('all')}
                  label="All"
                />
                <FilterButton
                  active={filter === 'recent'}
                  onClick={() => setFilter('recent')}
                  label="Recent"
                />
                <FilterButton
                  active={filter === 'new'}
                  onClick={() => setFilter('new')}
                  label="New"
                />
                <FilterButton
                  active={filter === 'reviewed'}
                  onClick={() => setFilter('reviewed')}
                  label="Reviewed"
                />
              </div>

              {/* Sort */}
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortType)}
                className="px-4 py-2 rounded-xl border border-[#EEE7FF] bg-white outline-none focus:border-[#BCA6FF] focus:ring-2 focus:ring-[#EDEAFF] transition-all text-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="alpha">Sort Alphabetically</option>
                <option value="reviews">Sort by Reviews</option>
                <option value="wordType">Sort by Word Type</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Flashcards Content */}
        {viewMode === 'grid' ? (
          // Grid View
          filteredAndSortedCards.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur rounded-2xl border border-white shadow-sm p-12 text-center"
            >
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-[#2E3A28] mb-2">
                {searchTerm || filter !== 'all' ? 'No cards found' : 'No flashcards yet'}
              </h3>
              <p className="text-[#6A7A6A]">
                {searchTerm || filter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Complete lessons to add vocabulary to your flashcards'}
              </p>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filteredAndSortedCards.map((card, index) => (
                  <FlashcardItem key={card.german} card={card} index={index} />
                ))}
              </motion.div>
              <div className="mt-6 text-center text-sm text-[#6A7A6A]">
                Showing {filteredAndSortedCards.length} of {flashcards.length} cards
              </div>
            </>
          )
        ) : (
          // Library/Chapters View
          <div className="space-y-4">
            {Object.keys(flashcardsByChapter).length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur rounded-2xl border border-white shadow-sm p-12 text-center"
              >
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-2xl font-bold text-[#2E3A28] mb-2">No flashcards yet</h3>
                <p className="text-[#6A7A6A]">Complete lessons to add vocabulary to your flashcards</p>
              </motion.div>
            ) : (
              Object.entries(flashcardsByChapter).map(([episodeId, cards], chapterIndex) => (
                <ChapterSection
                  key={episodeId}
                  episodeId={episodeId}
                  cards={cards}
                  chapterIndex={chapterIndex}
                  isExpanded={expandedChapters.has(episodeId)}
                  onToggle={() => toggleChapter(episodeId)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${color} rounded-2xl p-5 shadow-[0_8px_20px_rgba(20,12,60,.06)]`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-[#2E3A28] opacity-70">{icon}</div>
      </div>
      <div className="text-2xl font-extrabold text-[#2E3A28] mb-1">{value}</div>
      <div className="text-xs text-[#2E3A28]/70 font-medium">{label}</div>
    </motion.div>
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

function FilterButton({ active, onClick, label }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
        active
          ? 'bg-[#BCA6FF] text-white shadow-md'
          : 'bg-white text-[#6A7A6A] border border-[#EEE7FF] hover:bg-[#F7F5FF]'
      }`}
    >
      {label}
    </button>
  );
}

interface FlashcardItemProps {
  card: UserFlashcard;
  index: number;
}

function FlashcardItem({ card, index }: FlashcardItemProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => setFlipped(!flipped)}
      className="cursor-pointer perspective-1000"
    >
      <div
        className={`relative rounded-2xl p-6 min-h-[180px] transition-all duration-500 transform ${
          flipped ? 'rotate-y-180' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front Side (German) */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#F7F5FF] to-[#E7F7E8] rounded-2xl border-2 border-[#E1D9FF] p-6 flex flex-col justify-between shadow-md"
          style={{
            backfaceVisibility: 'hidden',
          }}
        >
          <div>
            <div className="text-xs text-[#7B6AF5] font-semibold mb-2">
              🇩🇪 German {card.wordType && `• ${card.wordType}`}
            </div>
            <div className="text-2xl font-extrabold text-[#2E3A28]">
              {card.wordType === 'noun' && card.article
                ? `${card.article} ${card.german}`
                : card.german}
            </div>
            {card.wordType === 'noun' && card.plural && (
              <div className="text-xs text-[#7E7A95] mt-1">
                <span className="font-medium">Plural:</span> {card.plural}
              </div>
            )}
            {card.wordType === 'verb' && card.conjugation && (
              <div className="text-xs text-[#7E7A95] mt-3 space-y-1 bg-white/50 rounded-lg p-2">
                <div className="font-semibold mb-1">Present Tense:</div>
                <div className="grid grid-cols-2 gap-1">
                  <div><span className="font-medium">ich:</span> {card.conjugation.ich}</div>
                  <div><span className="font-medium">wir:</span> {card.conjugation.wir}</div>
                  <div><span className="font-medium">du:</span> {card.conjugation.du}</div>
                  <div><span className="font-medium">ihr:</span> {card.conjugation.ihr}</div>
                  <div className="col-span-2"><span className="font-medium">er/sie/es:</span> {card.conjugation.er_sie_es}</div>
                  <div className="col-span-2"><span className="font-medium">sie/Sie:</span> {card.conjugation.sie_Sie}</div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-[#6A7A6A] mt-4">
            <span>{card.reviewCount} reviews</span>
            {card.reviewCount === 0 && (
              <span className="bg-[#FFD7BF] text-[#B84F2D] px-2 py-1 rounded-full font-semibold">
                New
              </span>
            )}
          </div>
        </div>

        {/* Back Side (English) */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#E7F7E8] to-[#9AD8BA] rounded-2xl border-2 border-[#9AD8BA] p-6 flex flex-col justify-between shadow-md"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div>
            <div className="text-xs text-[#265E40] font-semibold mb-2">
              🇬🇧 English {card.wordType && `• ${card.wordType}`}
            </div>
            <div className="text-2xl font-extrabold text-[#2E3A28]">{card.english}</div>
            {card.wordType === 'verb' && (
              <div className="text-sm text-[#265E40] mt-2 italic">
                (infinitive form)
              </div>
            )}
          </div>
          <div className="text-xs text-[#265E40] mt-4">
            Added {new Date(card.addedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface ChapterSectionProps {
  episodeId: string;
  cards: UserFlashcard[];
  chapterIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function ChapterSection({ episodeId, cards, chapterIndex, isExpanded, onToggle }: ChapterSectionProps) {
  const chapterName = CHAPTER_NAMES[episodeId] || `Chapter ${chapterIndex + 1}`;
  const grammarLesson = grammarLessons.find(lesson => lesson.episodeId === episodeId);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: chapterIndex * 0.1 }}
      className="bg-white/80 backdrop-blur rounded-2xl border border-white shadow-sm overflow-hidden"
    >
      {/* Chapter Header */}
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-[#F7F5FF] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-[#BCA6FF] to-[#7B6AF5] rounded-xl p-3 text-white">
            <Book className="h-6 w-6" />
          </div>
          <div className="text-left">
            <h3 className="text-2xl font-bold text-[#2E3A28]">{chapterName}</h3>
            <p className="text-sm text-[#6A7A6A] mt-1">
              {cards.length} word{cards.length !== 1 ? 's' : ''} • {grammarLesson ? 'Grammar included' : 'No grammar'}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-6 w-6 text-[#7B6AF5]" />
        ) : (
          <ChevronDown className="h-6 w-6 text-[#7B6AF5]" />
        )}
      </button>

      {/* Chapter Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-[#EEE7FF]"
          >
            <div className="p-6 space-y-6">
              {/* Vocabulary Section */}
              <div>
                <h4 className="text-lg font-bold text-[#2E3A28] mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#41AD83]" />
                  Vocabulary ({cards.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cards.map((card, index) => (
                    <FlashcardItem key={card.german} card={card} index={index} />
                  ))}
                </div>
              </div>

              {/* Grammar Section */}
              {grammarLesson && (
                <div className="border-t border-[#EEE7FF] pt-6">
                  <h4 className="text-lg font-bold text-[#2E3A28] mb-4 flex items-center gap-2">
                    📘 {grammarLesson.title}
                  </h4>
                  <div className="space-y-4">
                    {grammarLesson.rules.map((rule, ruleIndex) => (
                      <div key={ruleIndex} className="bg-[#F8F5F0] rounded-xl p-4">
                        <h5 className="font-semibold text-[#4B3F72] mb-2">{rule.title}</h5>
                        <p className="text-[#5E548E] mb-3 text-sm">{rule.explanation}</p>
                        {rule.examples && rule.examples.length > 0 && (
                          <div className="space-y-2">
                            {rule.examples.slice(0, 3).map((example, exIdx) => (
                              <div
                                key={exIdx}
                                className="bg-white rounded-lg p-3 border-l-4 border-[#BCA6FF]"
                              >
                                <div className="font-medium text-[#4B3F72] text-sm">
                                  {example.german}
                                </div>
                                <div className="text-xs text-[#6D5B95]">{example.english}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

