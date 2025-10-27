'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Clock, Sparkles, Book, Headphones, CheckCircle, Volume2 } from 'lucide-react';
import { User } from 'firebase/auth';
import { StoryEngine } from '@/lib/story-engine';
import { SRSAlgorithm, SRSVocabularyItem } from '@/lib/srs';
import { ProgressionSystem, UserProgressionState } from '@/lib/progression';
import { Story, StoryChapter, UserProgress } from '@/types';
import { Layout, Card, Button } from '@/components/layout';
import { FadeIn } from '@/components/animations';
import { ProgressOverview, StreakVisualization, VocabularyProgress, DailyGoal } from '@/components/progress';
import { EpisodeSelector } from '@/components/episode-selector';
import { StoryReader } from '@/components/story-reader';
import { VocabularyReview } from '@/components/vocabulary-review';
import { GrammarLesson } from '@/components/grammar-lesson';
import { getGrammarLessonByEpisode } from '@/data/grammar-lessons';
import { FlashcardSystem } from '@/lib/flashcard-system';
import { Dashboard } from '@/components/dashboard';
import { AuthModal } from '@/components/auth-modal';
import { ProgressPage } from '@/components/profile/progress-page';
import { AchievementsPage } from '@/components/profile/achievements-page';
import { FlashcardsPage } from '@/components/profile/flashcards-page';
import { SettingsPage } from '@/components/profile/settings-page';
import { LevelQuestsPage } from '@/components/profile/level-quests-page';
import { AboutPage } from '@/components/about-page';
import { DigitalReader } from '@/components/digital-reader';
import { LevelSystem, XP_REWARDS } from '@/lib/level-system';
import { DailyQuestSystem, QuestType, DailyQuest } from '@/lib/daily-quests';
import { XPNotification, LevelUpNotification } from '@/components/level-display';
import { QuestCompletionNotification } from '@/components/daily-quests';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/language-switcher';
import { StreakWidget } from '@/components/streak-widget';
import { UserMenu } from '@/components/user-menu';
import { SectionErrorBoundary } from '@/components/section-error-boundary';
import GameRoadmap from '@/components/game-roadmap';
import HomeView from '@/components/HomeView';
import { onAuthChange } from '@/lib/auth';
import { getUserProgress, getUserProgressionState, saveUserProgressionState, syncLocalStorageToFirestore } from '@/lib/user-data';
import { useUserState } from '@/hooks/useUserState';
import { useAppState, AppState } from '@/hooks/useAppState';
import ProgressView from '@/views/ProgressView';
import StoryView from '@/views/StoryView';
import VocabularyView from '@/views/VocabularyView';
import GrammarView from '@/views/GrammarView';
import GrammarLibraryView from '@/views/GrammarLibraryView';

export default function Home() {
  const { t } = useLanguage();
  const [currentState, setCurrentState] = useState<AppState>('home');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [currentChapter, setCurrentChapter] = useState<StoryChapter | null>(null);
  const [storyEngine] = useState(new StoryEngine());
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    userId: 'demo-user',
    completedStories: [],
    completedChapters: [],
    vocabularyProgress: {},
    streak: 7,
    totalXP: 150,
    lastActiveDate: new Date()
  });
  const [vocabularyToReview, setVocabularyToReview] = useState<SRSVocabularyItem[]>([]);
  const [allSRSVocabulary, setAllSRSVocabulary] = useState<SRSVocabularyItem[]>([]);
  const [progressionState, setProgressionState] = useState<UserProgressionState | null>(null);
  
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Level and Quest notifications
  const [xpNotification, setXPNotification] = useState<{ amount: number; reason: string } | null>(null);
  const [levelUpNotification, setLevelUpNotification] = useState<number | null>(null);
  const [questNotification, setQuestNotification] = useState<DailyQuest | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      setAuthLoading(true);
      setUser(authUser);
      
      if (authUser) {
        // User is signed in - load their data from Firestore
        try {
          // Load user progress
          const progress = await getUserProgress(authUser.uid);
          if (progress) {
            setUserProgress(progress);
          }
          
          // Load progression state
          const progression = await getUserProgressionState(authUser.uid);
          if (progression) {
            setProgressionState(progression);
          } else {
            // Initialize new progression for this user
            const newProgression = ProgressionSystem.initializeProgression(storyEngine.getStories());
            setProgressionState(newProgression);
            await saveUserProgressionState(authUser.uid, newProgression);
          }
          
          // Sync any local data on first login
          const hasLocalData = localStorage.getItem('minka-progression');
          if (hasLocalData && !progression) {
            await syncLocalStorageToFirestore(authUser.uid);
          }
        } catch (error) {
          console.error(t.errors.loadingUserData, error);
          // Fallback to local storage
          loadLocalData();
        }
      } else {
        // User is signed out - use local storage
        loadLocalData();
      }
      
      setAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, [storyEngine]);
  
  // Helper function to load local data
  const loadLocalData = () => {
    const savedProgression = ProgressionSystem.loadFromLocalStorage();
    if (savedProgression) {
      // Check and update streak on load
      const streakStatus = ProgressionSystem.checkStreakStatus(savedProgression);
      if (streakStatus.isBroken && savedProgression.streak > 0) {
        // Streak was broken, reset to 0
        const updatedState = {
          ...savedProgression,
          streak: 0
        };
        setProgressionState(updatedState);
        ProgressionSystem.saveToLocalStorage(updatedState);
      } else {
        setProgressionState(savedProgression);
      }
    } else {
      const newProgression = ProgressionSystem.initializeProgression(storyEngine.getStories());
      setProgressionState(newProgression);
      ProgressionSystem.saveToLocalStorage(newProgression);
    }
  };

  // Helper function to award XP
  const awardXP = (amount: number, reason: string) => {
    const result = LevelSystem.addXP(amount, reason);
    
    // Show XP notification
    setXPNotification({ amount, reason });
    
    // Show level up notification if leveled up
    if (result.leveledUp && result.newLevel) {
      setLevelUpNotification(result.newLevel);
    }
  };

  // Helper function to update quest progress
  const updateQuestProgress = (type: QuestType, amount: number = 1) => {
    const result = DailyQuestSystem.updateQuest(type, amount);
    
    // Show quest completion notification
    if (result.questCompleted && result.quest) {
      setQuestNotification(result.quest);
      // Award XP for quest completion
      awardXP(result.quest.xpReward, `Quest: ${result.quest.title}`);
    }
  };

  // Helper function to track words read
  const handleWordsRead = (count: number) => {
    if (progressionState) {
      const updatedState = ProgressionSystem.incrementWordsRead(progressionState, count);
      setProgressionState(updatedState);
    }
  };

  // Helper function to track words learned
  const handleWordLearned = () => {
    if (progressionState) {
      const updatedState = ProgressionSystem.incrementWordsLearned(progressionState, 1);
      setProgressionState(updatedState);
      updateQuestProgress('add_words');
    }
  };

  const handleStorySelect = (storyId: string) => {
    const story = storyEngine.getStory(storyId);
    if (story && progressionState) {
      // Check if episode is unlocked
      const isUnlocked = ProgressionSystem.isEpisodeUnlocked(storyId, progressionState);
      if (isUnlocked) {
        setSelectedStory(story);
        setCurrentState('story');
      } else {
        // Show locked message or redirect to episode selector
        alert(t.errors.episodeLocked);
      }
    }
  };

  const handleChapterComplete = async () => {
    if (selectedStory && currentChapter) {
      storyEngine.markChapterComplete(selectedStory.id, currentChapter.id);
      
      const newProgress = {
        ...userProgress,
        completedChapters: [...userProgress.completedChapters, currentChapter.id],
        totalXP: userProgress.totalXP + 50
      };
      
      // Update local state
      setUserProgress(newProgress);
      
      // Award XP and update quests
      awardXP(XP_REWARDS.COMPLETE_CHAPTER, t.success.chapterCompleted);
      updateQuestProgress('complete_chapters');
      
      // Update streak
      if (progressionState) {
        const updatedState = ProgressionSystem.updateStreak(progressionState);
        setProgressionState(updatedState);
      }
      
      // Sync to Firestore if user is logged in
      if (user) {
        try {
          const { updateUserProgress } = await import('@/lib/user-data');
          await updateUserProgress(user.uid, newProgress);
        } catch (error) {
          console.error(t.errors.syncingProgress, error);
        }
      }

      // Move to next chapter or back to home
      // Note: Chapter navigation now handled by StoryReader component
      setCurrentState('home');
      setSelectedStory(null);
      setCurrentChapter(null);
    }
  };

  const handleVocabularyReviewComplete = async (updatedItems: SRSVocabularyItem[]) => {
    // Update the SRS vocabulary with reviewed items
    const updatedAllVocabulary = allSRSVocabulary.map(item => {
      const reviewed = updatedItems.find(r => r.id === item.id);
      return reviewed || item;
    });
    setAllSRSVocabulary(updatedAllVocabulary);
    
    // Update items due for review
    const dueItems = SRSAlgorithm.getItemsDueForReview(updatedAllVocabulary);
    setVocabularyToReview(dueItems);
    
    const newProgress = {
      ...userProgress,
      totalXP: userProgress.totalXP + (updatedItems.length * 10)
    };
    
    // Update local state
    setUserProgress(newProgress);
    
    // Award XP for each flashcard reviewed
    updatedItems.forEach(() => {
      awardXP(XP_REWARDS.REVIEW_FLASHCARD_CORRECT, t.success.flashcardReviewed);
    });
    updateQuestProgress('review_flashcards', updatedItems.length);
    
    // Sync to Firestore if user is logged in
    if (user) {
      try {
        const { updateUserProgress, saveUserFlashcards } = await import('@/lib/user-data');
        await updateUserProgress(user.uid, newProgress);
        await saveUserFlashcards(user.uid, updatedItems);
      } catch (error) {
        console.error(t.errors.syncingVocabulary, error);
      }
    }
    
    // Return to home
    setCurrentState('home');
  };

  const renderHome = () => (
    <div className="w-full font-[Poppins] text-[#2D3B2E]">
      {/* Top Section with Forest Background */}
      <div className="relative overflow-hidden bg-gradient-to-b from-green-100 to-green-50">
        {/* Forest background image - pure, unedited, only at top */}
        <motion.div
          className="absolute inset-0 bg-[url('/images/forest-background.png')] bg-cover bg-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{
            backgroundImage: "url('/images/forest-background.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Navigation Header */}
        <header className="relative z-20 flex items-center justify-between px-6 pt-8" role="banner">
          <div className="flex items-center gap-3">
            <motion.div 
              initial={{ opacity: 0, rotate: -10 }} 
              animate={{ opacity: 1, rotate: 0 }} 
              transition={{ duration: 0.6 }} 
              className="grid h-10 w-10 place-items-center rounded-2xl bg-[#D9EDE6] shadow-md"
              aria-hidden="true"
            >
              <span className="text-xl">🐾</span>
            </motion.div>
          </div>
          <nav className="hidden gap-8 text-[#6D5B95] md:flex" role="navigation" aria-label="Main navigation">
            <a href="#features" className="hover:opacity-80">{t.nav.features}</a>
            <button onClick={() => setCurrentState('roadmap')} className="hover:opacity-80">{t.nav.roadmap}</button>
            <button onClick={() => setCurrentState('about')} className="hover:opacity-80">{t.nav.about}</button>
          </nav>
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Streak Widget - visible for logged in users */}
            {user && (
              <StreakWidget progressionState={progressionState} />
            )}
            
            {user ? (
              <UserMenu 
                user={user} 
                onSignOut={() => setUser(null)}
                onNavigate={(page) => {
                  setCurrentState(`profile-${page}` as AppState);
                }}
              />
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="btn btn-primary"
              >
                {t.nav.signIn}
              </button>
            )}
          </div>
        </header>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-24 text-center">

        {/* Conditional Content Based on User State */}
        {user ? (
          /* Logged-in User Content */
          <>
            {/* Welcome Back Message */}
            <h1 className="hero-title">
              Welcome back, {user.displayName || 'Learner'}! 👋
            </h1>
            <p className="hero-subtext">
              Ready to continue your German learning journey?
            </p>

            {/* Quick Stats for Logged-in Users */}
            <div className="mt-8 max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-[#7B6AF5]">
                  {progressionState ? Object.values(progressionState.episodeProgress).filter(e => e.completed).length : 0}
                </div>
                <div className="text-sm text-gray-600">Chapters</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600">
                  {progressionState?.streak || 0}
                </div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-orange-600">
                  {FlashcardSystem.getStudyStats().learned}
                </div>
                <div className="text-sm text-gray-600">Words Learned</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">
                  {LevelSystem.getLevelData().level}
                </div>
                <div className="text-sm text-gray-600">Level</div>
              </div>
            </div>
          </>
        ) : (
          /* New User Content */
          <>
            {/* Headline */}
            <h1 className="hero-title">
              {t.home.tagline}
            </h1>
            <p className="hero-subtext">
              {t.home.subtitle}
            </p>
          </>
        )}

        {/* Level and Daily Quests */}
        {user && (
          <div className="mt-8 max-w-3xl mx-auto">
            {/* Level and Quest info moved to Dashboard */}
          </div>
        )}

        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          {/* Conditional Action Buttons Based on User State */}
          {user ? (
            /* Logged-in User Actions */
            <>
              {/* Continue Learning Button */}
              {progressionState && (() => {
                // Find the next chapter to continue
                const stories = storyEngine.getStories();
                let nextStory = null;
                
                // Find first incomplete chapter
                for (const story of stories) {
                  const progress = progressionState.episodeProgress[story.id];
                  if (!progress?.completed) {
                    nextStory = story;
                    break;
                  }
                }
                
                // If all completed, show first story
                if (!nextStory) {
                  nextStory = stories[0];
                }
                
                const progress = progressionState.episodeProgress[nextStory.id];
                const chapterIndex = progress?.currentChapterIndex ?? 0;
                const sceneIndex = progress?.currentSceneIndex ?? 0;
                const hasStarted = (chapterIndex > 0 || sceneIndex > 0 || (progress?.chaptersCompleted ?? 0) > 0);
                
                return (
                  <button 
                    className="btn btn-primary text-xl px-10 py-5 relative"
                    style={{ borderRadius: '32px' }}
                    onClick={() => {
                      setSelectedStory(nextStory);
                      setCurrentState('story');
                    }}
                  >
                    <span className="flex items-center gap-3">
                      <span>{hasStarted ? t.home.continueChapter : t.home.startChapter}</span>
                      <span className="text-sm opacity-80">
                        ({nextStory.title})
                      </span>
                    </span>
                  </button>
                );
              })()}
              
              {/* Dashboard Button */}
              <button 
                className="btn btn-secondary text-lg px-8 py-4 relative"
                style={{ borderRadius: '24px' }}
                onClick={() => setCurrentState('dashboard')}
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Dashboard</span>
                </span>
              </button>
            </>
          ) : (
            /* New User Actions */
            <button 
              className="btn btn-primary text-xl px-10 py-5 relative"
              style={{ borderRadius: '32px' }}
              onClick={() => {
                const firstStory = storyEngine.getStory('episode-0-hallo');
                if (firstStory) {
                  setSelectedStory(firstStory);
                  setCurrentState('story');
                }
              }}
            >
              <span className="flex items-center gap-3">
                <span>Start Your Journey</span>
                <span className="text-sm opacity-80">
                  (Chapter 1)
                </span>
              </span>
            </button>
          )}
        </div>

        {/* Animated Minka Illustration */}
        <motion.div
          className="flex justify-center"
          style={{ marginTop: '50px' }}
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <motion.img
            src="/images/minka-cat.png"
            alt="Minka the cat"
            className="h-[28rem] w-auto"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            style={{
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))'
            }}
          />
        </motion.div>
        </div>
      </div>

      {/* World cards section */}
      <div className="relative z-10 bg-[#FFF9F2]/90 backdrop-blur-sm py-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Forest */}
          <motion.div
            className="world-card forest"
            onClick={() => {
              // Navigate to new flashcard system
              window.location.href = '/flashcards';
            }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="world-card-content">
              <h3 className="world-card-title">Forest</h3>
              <p className="world-card-subtitle">My Flashcards<br />Review</p>
            </div>
          </motion.div>

          {/* Library */}
          <motion.div
            className="world-card library"
            onClick={() => {
              setCurrentState('grammar-library');
            }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="world-card-content">
              <h3 className="world-card-title">Library</h3>
              <p className="world-card-subtitle">Grammar<br />Insights</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Additional Homepage Design Section */}
      <div className="relative z-10 bg-gradient-to-b from-[#F8F5F0] via-[#F3ECF9] to-[#E8DDF2] py-20 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Hero Section */}
          <section className="grid items-center gap-8 md:grid-cols-[1.1fr_0.9fr] mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <h2 className="mb-4 text-4xl font-bold md:text-5xl text-[#4B3F72]">Learn German Through Stories</h2>
              <p className="mb-6 max-w-xl text-lg text-[#5E548E]">
                Step into Minka's cozy world and learn naturally with short, heart‑warming episodes, interactive moments, and spaced repetition.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button 
                  className="btn btn-primary text-lg"
                  onClick={() => {
                    const firstStory = storyEngine.getStory('episode-0-hallo');
                    if (firstStory) handleStorySelect(firstStory.id);
                  }}
                >
                  Start Your Journey
                </button>
              </div>
              <p className="mt-4 text-sm text-[#6D5B95]">No pressure. No tests first. Just a gentle beginning.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative mx-auto w-full max-w-md">
              <Card className="rounded-2xl border-none bg-white/60 backdrop-blur-xl shadow-xl">
                <div className="p-6">
                  <div className="mb-3 text-sm font-medium text-[#6D5B95]">Chapter • 5–8 min</div>
                  <div className="rounded-xl bg-gradient-to-br from-[#FCE0D8] to-[#E8DDF2] p-5">
                    <p className="text-sm uppercase tracking-wide text-[#6D5B95]">Preview</p>
                    <h3 className="mt-1 text-2xl font-semibold">Guten Morgen im Dorf</h3>
                    <p className="mt-2 text-[#5E548E]">Meet Minka and friends on a rainy morning. Learn greetings, numbers and names—A1‑friendly.</p>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-[#6D5B95]">
                      <Clock className="h-4 w-4" />
                      <span>Daily goal: 10 min</span>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        const firstStory = storyEngine.getStory('episode-0-hallo');
                        if (firstStory) handleStorySelect(firstStory.id);
                      }}
                    >
                      Try Intro
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </section>

          {/* Animated Minka Illustration */}
          <motion.div 
            id="about" 
            initial={{ opacity: 0, y: 10 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.6 }} 
            className="mb-16"
          >
            <Card className="border-none bg-white/50 backdrop-blur-xl">
              <div className="grid grid-cols-1 items-center gap-8 p-8 md:grid-cols-2">
                <div>
                  <h3 className="text-2xl font-semibold text-[#4B3F72]">Meet Minka 🐱</h3>
                  <p className="mt-2 text-[#5E548E]">
                    Your friendly cat guide. Minka speaks gently, repeats new words in context, and celebrates every small win.
                  </p>
                </div>
                <motion.svg
                  role="img"
                  aria-label="Animated illustration of Minka the cat"
                  initial={{ y: 0 }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  viewBox="0 0 200 160"
                  className="mx-auto h-48 w-72"
                >
                  <defs>
                    <linearGradient id="fur" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FFF6EF" />
                      <stop offset="100%" stopColor="#F3E3D9" />
                    </linearGradient>
                  </defs>
                  <ellipse cx="100" cy="120" rx="70" ry="18" fill="#D9EDE6" opacity="0.5" />
                  <g>
                    <circle cx="100" cy="70" r="38" fill="url(#fur)" stroke="#D9C7B9" />
                    <path d="M70 60 L85 35 L90 60" fill="#F3E3D9" stroke="#D9C7B9" />
                    <path d="M130 60 L115 35 L110 60" fill="#F3E3D9" stroke="#D9C7B9" />
                    <circle cx="88" cy="70" r="4" fill="#4B3F72" />
                    <circle cx="112" cy="70" r="4" fill="#4B3F72" />
                    <path d="M96 78 Q100 82 104 78" stroke="#4B3F72" fill="none" strokeWidth="2" />
                    <circle cx="100" cy="85" r="3" fill="#F5A6A0" />
                    <path d="M70 105 Q100 120 130 105" stroke="#D9C7B9" fill="none" />
                    <path d="M55 95 Q50 110 65 115" stroke="#D9C7B9" />
                    <path d="M145 95 Q150 110 135 115" stroke="#D9C7B9" />
                  </g>
                </motion.svg>
              </div>
            </Card>
          </motion.div>

          {/* Features */}
          <section id="features" className="mb-16">
            <h3 className="mb-6 text-center text-2xl font-semibold text-[#4B3F72]">Made for Complete Beginners</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Sparkles, title: t.features.storyFirstLessons, text: t.features.storyFirstLessonsDesc },
                { icon: Book, title: t.features.smartWordbook, text: t.features.smartWordbookDesc },
                { icon: Headphones, title: t.features.listenSpeak, text: t.features.listenSpeakDesc },
                { icon: Clock, title: t.features.tinyDailyGoals, text: t.features.tinyDailyGoalsDesc },
              ].map((item, i) => (
                <motion.div 
                  key={item.title} 
                  initial={{ opacity: 0, y: 10 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <Card className="h-full border-none bg-white/60 backdrop-blur-xl">
                    <div className="flex h-full flex-col gap-3 p-5">
                      <item.icon className="h-6 w-6 text-[#6D5B95]" />
                      <h4 className="text-lg font-semibold text-[#4B3F72]">{item.title}</h4>
                      <p className="text-sm text-[#5E548E]">{item.text}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Story Preview */}
          <section id="stories" className="mb-16">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <h3 className="text-2xl font-semibold text-[#4B3F72]">Chapter 1: Guten Morgen im Dorf</h3>
                <p className="mt-2 text-[#5E548E]">A gentle morning in a small village. Learn greetings, names and numbers 0–20 with Minka and friends.</p>
                <ul className="mt-4 list-disc pl-5 text-[#5E548E]">
                  <li>A1-friendly vocabulary with images</li>
                  <li>Tap-to-translate and audio for every word</li>
                  <li>One-tap flashcards for later review</li>
                </ul>
                <div className="mt-6 flex gap-4">
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      const firstStory = storyEngine.getStory('episode-0-hallo');
                      if (firstStory) handleStorySelect(firstStory.id);
                    }}
                  >
                    Start Chapter
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowFlashcards(true)}
                  >
                    Preview Words
                  </button>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mx-auto w-full max-w-md">
                <Card className="overflow-hidden rounded-2xl border-none bg-white/60 backdrop-blur-xl shadow-xl">
                  <div className="p-0">
                    <div className="h-56 w-full bg-gradient-to-br from-[#D9EDE6] to-[#E8DDF2]" />
                    <div className="p-5">
                      <p className="text-sm text-[#6D5B95]">Sample lines</p>
                      <div className="mt-2 rounded-xl bg-[#F8F5F0] p-4 text-sm">
                        <p><strong>Minka:</strong> Guten Morgen!</p>
                        <p><strong>Emma:</strong> Hallo, Minka!</p>
                        <p className="text-[#6D5B95]">Tap words to hear pronunciation.</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </section>

          {/* Digital Reader Section */}
          <section className="mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.6 }}
            >
              <Card className="border-none bg-gradient-to-br from-[#E8DDF2] via-[#FCE0D8] to-[#D9EDE6] overflow-hidden">
                <div className="grid items-center gap-8 p-8 md:grid-cols-2">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full mb-4">
                      <BookOpen className="h-5 w-5 text-[#7B6AF5]" />
                      <span className="text-sm font-semibold text-[#7B6AF5]">Our Digital Reader</span>
                    </div>
                    <h3 className="text-3xl font-bold text-[#4B3F72] mb-4">
                      Comprehensible Input Meets Interactive Practice
                    </h3>
                    <p className="text-[#5E548E] mb-6">
                      Learn naturally with our specially designed reader that brings everything together in one place:
                    </p>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-[#41ad83] mt-0.5 flex-shrink-0" />
                        <span className="text-[#5E548E]"><strong>On-click translations</strong> — no need to stop and look things up</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-[#41ad83] mt-0.5 flex-shrink-0" />
                        <span className="text-[#5E548E]"><strong>Native audio</strong> for natural pronunciation</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-[#41ad83] mt-0.5 flex-shrink-0" />
                        <span className="text-[#5E548E]"><strong>Fill-in-the-blank</strong> practice directly on texts</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-[#41ad83] mt-0.5 flex-shrink-0" />
                        <span className="text-[#5E548E]"><strong>Comprehension quizzes</strong> to check understanding</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-[#41ad83] mt-0.5 flex-shrink-0" />
                        <span className="text-[#5E548E]"><strong>Flashcards</strong> for review and recall</span>
                      </li>
                    </ul>
                    <button
                      onClick={() => setCurrentState('reader')}
                      className="btn btn-primary text-lg"
                    >
                      Try Digital Reader Demo
                    </button>
                  </div>
                  <div className="relative">
                    <div className="bg-white rounded-xl shadow-2xl p-6 transform rotate-1 hover:rotate-0 transition-transform">
                      <div className="text-sm text-[#6D5B95] mb-3">Interactive Text</div>
                      <div className="space-y-2 text-[#2D3B2E]">
                        <p>
                          Li <span className="border-b-2 border-dashed border-[#7B6AF5] cursor-pointer">plant</span> eine{' '}
                          <span className="border-b-2 border-dashed border-[#7B6AF5] cursor-pointer">Reise</span> nach Paris.
                        </p>
                        <p className="text-xs text-[#6D5B95] italic">← Click any underlined word for instant translation</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-[#5E548E]">
                          <Volume2 className="h-4 w-4" />
                          <span>Audio available for pronunciation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </section>

          {/* CTA Section */}
          <section className="mb-16">
            <Card className="border-none bg-gradient-to-r from-[#FCE0D8] to-[#E8DDF2]">
              <div className="grid items-center gap-6 p-8 md:grid-cols-[1.3fr_0.7fr]">
                <div>
                  <h3 className="text-2xl font-semibold text-[#4B3F72]">Begin your first mini-lesson today</h3>
                  <p className="mt-2 text-[#5E548E]">No login required. Start, then save your progress if you like it.</p>
                  <div className="mt-4 flex gap-3">
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        const firstStory = storyEngine.getStory('episode-0-hallo');
                        if (firstStory) handleStorySelect(firstStory.id);
                      }}
                    >
                      Start Free
                    </button>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="rounded-2xl bg-white/50 p-5 text-sm text-[#6D5B95] backdrop-blur"
                >
                  <p className="font-medium">What you'll do in 5 minutes:</p>
                  <ol className="mt-2 list-decimal pl-5">
                    <li>Learn 5 greeting phrases</li>
                    <li>Hear native audio</li>
                    <li>Create your first 5 flashcards</li>
                  </ol>
                </motion.div>
              </div>
            </Card>
          </section>

          {/* Footer */}
          <footer className="text-center text-sm text-[#6D5B95] opacity-80">
            © 2025 Minka — Learn German with heart and stories.
          </footer>
        </div>
      </div>

      {/* Flashcard modal */}
      {showFlashcards && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-xl max-w-md w-full mx-6 p-6 relative"
          >
            <button
              onClick={() => setShowFlashcards(false)}
              className="absolute right-4 top-4 p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
            <h4 className="text-2xl font-bold text-[#2F6045] mb-4">Smart Flashcards 🌿</h4>
            <p className="text-[#3A4A3F] mb-4">Minka automatically creates flashcards from each story you read — with images, audio, and short examples. You'll review them just before you forget, keeping progress stress‑free.</p>
            <ul className="text-sm text-[#3E5C4A] space-y-2 list-disc ml-5">
              <li>Auto‑generated from story scenes</li>
              <li>Spaced repetition review timing</li>
              <li>Audio and pronunciation practice</li>
            </ul>
          </motion.div>
        </div>
      )}
    </div>
  );

  const renderStory = () => {
    if (!selectedStory || !progressionState) return null;
    
    // Get saved position for this episode
    const savedPosition = ProgressionSystem.getSavedPosition(selectedStory.id, progressionState);
    
    return (
      <SectionErrorBoundary section="story">
        <StoryReader
        story={selectedStory}
        initialChapterIndex={savedPosition.chapterIndex}
        initialSceneIndex={savedPosition.sceneIndex}
        onComplete={() => {
          // Reload progression state from localStorage to get latest data
          const latestProgression = ProgressionSystem.loadFromLocalStorage();
          if (latestProgression) {
            setProgressionState(latestProgression);
          }
          setCurrentState('home');
          setSelectedStory(null);
        }}
        onBack={() => {
          // Reload progression state when going back
          const latestProgression = ProgressionSystem.loadFromLocalStorage();
          if (latestProgression) {
            setProgressionState(latestProgression);
          }
          setCurrentState('home');
          setSelectedStory(null);
        }}
        onNavigateToVocabulary={() => {
          // Navigate to flashcards page
          window.location.href = '/flashcards';
        }}
        onAwardXP={awardXP}
        onUpdateQuest={updateQuestProgress}
        onWordsRead={handleWordsRead}
        onWordLearned={handleWordLearned}
      />
      </SectionErrorBoundary>
    );
  };

  const renderVocabulary = () => {
    // VocabularyReview component now loads flashcards directly from FlashcardSystem
    // No need to pass items prop - it will use user's personal flashcards
    return (
      <SectionErrorBoundary section="flashcards">
        <VocabularyReview
          onComplete={handleVocabularyReviewComplete}
          onBack={() => setCurrentState('home')}
        />
      </SectionErrorBoundary>
    );
  };

  const renderProgress = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <button 
              onClick={() => setCurrentState('home')}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              ← Back to Home
            </button>
          </div>
          
          <FadeIn>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Your Progress</h2>
          </FadeIn>

          <div className="space-y-8">
            <ProgressOverview progress={userProgress} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StreakVisualization streak={userProgress.streak} />
              <VocabularyProgress vocabularyProgress={userProgress.vocabularyProgress} />
            </div>
            
            <DailyGoal dailyGoal={15} timeSpent={8} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderGrammar = () => {
    if (!selectedStory) return null;
    
    const grammarLesson = getGrammarLessonByEpisode(selectedStory.id);
    if (!grammarLesson) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#F8F5F0] via-[#F3ECF9] to-[#E8DDF2] p-6 flex items-center justify-center">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
            >
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-3xl font-bold text-[#4B3F72] mb-4">Grammar Lesson Coming Soon!</h2>
              <p className="text-[#5E548E] text-lg mb-6">
                Grammar lessons for this episode are being prepared.
              </p>
              <Button
                onClick={() => setCurrentState('home')}
                className="bg-[#BCA6FF] hover:bg-[#A794FF] text-white"
              >
                Back to Home
              </Button>
            </motion.div>
          </div>
        </div>
      );
    }

    return (
      <GrammarLesson
        title={grammarLesson.title}
        rules={grammarLesson.rules}
        exercises={grammarLesson.exercises}
        onComplete={() => {
          setCurrentState('home');
          setSelectedStory(null);
        }}
        onBack={() => {
          setCurrentState('home');
          setSelectedStory(null);
        }}
      />
    );
  };

  const renderGrammarLibrary = () => {
    const stories = storyEngine.getStories();
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F8F5F0] via-[#F3ECF9] to-[#E8DDF2] p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-[#4B3F72] mb-4">Grammar Library</h1>
            <p className="text-[#5E548E] text-lg">Explore grammar lessons for each chapter</p>
            <button
              onClick={() => setCurrentState('home')}
              className="mt-4 px-6 py-2 bg-[#BCA6FF] hover:bg-[#A794FF] text-white rounded-lg transition-colors"
            >
              ← Back to Home
            </button>
          </motion.div>

          {/* Grammar Lessons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story, index) => {
              const grammarLesson = getGrammarLessonByEpisode(story.id);
              const isCompleted = progressionState?.episodeProgress[story.id]?.completed || false;
              
              return (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                    isCompleted ? 'ring-2 ring-green-200' : ''
                  }`}
                  onClick={() => {
                    setSelectedStory(story);
                    setCurrentState('grammar');
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl">📚</div>
                    {isCompleted && (
                      <div className="text-green-500 text-xl">✓</div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#4B3F72] mb-2">
                    {story.title}
                  </h3>
                  
                  <p className="text-[#5E548E] mb-4">
                    {story.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Chapter {index + 1}
                    </span>
                    {grammarLesson ? (
                      <span className="px-3 py-1 bg-[#BCA6FF] text-white text-sm rounded-full">
                        Available
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[#4B3F72] mb-2">
                Grammar Learning Tips
              </h3>
              <p className="text-[#5E548E]">
                Complete chapters to unlock grammar lessons. Each lesson includes rules, examples, and exercises to help you master German grammar.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  const renderEpisodes = () => {
    if (!progressionState) return null;

    return (
      <EpisodeSelector
        stories={storyEngine.getStories()}
        progressionState={progressionState}
        onSelectEpisode={(episodeId) => {
          handleStorySelect(episodeId);
        }}
        onBack={() => setCurrentState('home')}
      />
    );
  };

  const renderDigitalReader = () => {
    // Sample text from your example
    const sampleText = "Li plant eine Reise nach Paris. Sie bucht ein Hotel im Stadtzentrum, weil sie die Sehenswürdigkeiten in der Nähe sehen möchte. Das ist zwar etwas teurer, aber dafür muss sie kein Geld für die U-Bahn oder den Bus ausgeben.";
    
    const sampleVocabulary = [
      { german: "plant", english: "plans" },
      { german: "Reise", english: "trip/journey" },
      { german: "nach", english: "to" },
      { german: "bucht", english: "books" },
      { german: "Hotel", english: "hotel" },
      { german: "Stadtzentrum", english: "city center" },
      { german: "weil", english: "because" },
      { german: "Sehenswürdigkeiten", english: "sights/attractions" },
      { german: "Nähe", english: "proximity/vicinity" },
      { german: "sehen", english: "to see" },
      { german: "möchte", english: "would like" },
      { german: "zwar", english: "indeed/certainly" },
      { german: "etwas", english: "somewhat/a bit" },
      { german: "teurer", english: "more expensive" },
      { german: "dafür", english: "for that/in return" },
      { german: "muss", english: "must" },
      { german: "Geld", english: "money" },
      { german: "U-Bahn", english: "subway" },
      { german: "Bus", english: "bus" },
      { german: "ausgeben", english: "to spend" }
    ];

    const fillInBlanks = [
      {
        sentence: "Li plant eine ___ nach Paris.",
        blanks: [{ position: 15, answer: "Reise", options: ["Reise", "Hotel", "Stadt", "Bahn"] }]
      },
      {
        sentence: "Sie bucht ein Hotel im ___, weil sie die Sehenswürdigkeiten in der Nähe sehen möchte.",
        blanks: [{ position: 23, answer: "Stadtzentrum", options: ["Stadtzentrum", "Zentrum", "Dorf", "Land"] }]
      },
      {
        sentence: "Das ist zwar etwas ___, aber dafür muss sie kein Geld für die U-Bahn oder den Bus ausgeben.",
        blanks: [{ position: 19, answer: "teurer" }]
      }
    ];

    const comprehensionQuiz = [
      {
        question: "Wohin plant Li zu reisen?",
        options: ["Berlin", "Paris", "London", "Rom"],
        correct: 1,
        explanation: "Li plant eine Reise nach Paris."
      },
      {
        question: "Warum bucht Li ein Hotel im Stadtzentrum?",
        options: [
          "Weil es billiger ist",
          "Weil sie die Sehenswürdigkeiten in der Nähe sehen möchte",
          "Weil sie die U-Bahn mag",
          "Weil es größer ist"
        ],
        correct: 1,
        explanation: "Sie bucht das Hotel im Stadtzentrum, weil sie die Sehenswürdigkeiten in der Nähe sehen möchte."
      },
      {
        question: "Was ist ein Vorteil vom Hotel im Stadtzentrum?",
        options: [
          "Es ist billiger",
          "Es ist größer",
          "Sie muss kein Geld für die U-Bahn oder den Bus ausgeben",
          "Es hat einen Pool"
        ],
        correct: 2,
        explanation: "Der Vorteil ist, dass sie kein Geld für die U-Bahn oder den Bus ausgeben muss."
      }
    ];

    return (
      <DigitalReader
        title={t.digitalReader.title}
        text={sampleText}
        vocabulary={sampleVocabulary}
        fillInBlanks={fillInBlanks}
        comprehensionQuiz={comprehensionQuiz}
        onBack={() => setCurrentState('home')}
        onComplete={() => {
          alert(t.digitalReader.congratulations + ' ' + t.digitalReader.completedExercise);
          setCurrentState('home');
        }}
      />
    );
  };

  const renderDashboard = () => {
    if (!progressionState) return null;

    return (
      <Dashboard
        user={user}
        progressionState={progressionState}
        onNavigateToStory={(story) => {
          setSelectedStory(story);
          setCurrentState('story');
        }}
        onNavigateToFlashcards={() => {
          window.location.href = '/flashcards';
        }}
        onNavigateToProfile={(page) => {
          setCurrentState(`profile-${page}` as AppState);
        }}
        onNavigateToRoadmap={() => {
          setCurrentState('roadmap');
        }}
      />
    );
  };

  const renderRoadmap = () => {
    if (!progressionState) return null;

    return (
      <GameRoadmap
        stories={storyEngine.getStories()}
        progressionState={progressionState}
        onSelectEpisode={(episodeId) => {
          const story = storyEngine.getStories().find(s => s.id === episodeId);
          if (story) {
            setSelectedStory(story);
            setCurrentState('story');
          }
        }}
        onBack={() => setCurrentState('home')}
        onNavigateToFlashcards={() => {
          window.location.href = '/flashcards';
        }}
      />
    );
  };

  const renderProfileProgress = () => {
    if (!progressionState) return null;

    return (
      <SectionErrorBoundary section="progress">
        <ProgressPage
          progressionState={progressionState}
          stories={storyEngine.getStories()}
          onBack={() => setCurrentState('home')}
        />
      </SectionErrorBoundary>
    );
  };

  const renderProfileAchievements = () => {
    if (!progressionState) return null;

    const flashcards = FlashcardSystem.loadFlashcards();
    
    return (
      <AchievementsPage
        progressionState={progressionState}
        flashcards={flashcards}
        onBack={() => setCurrentState('home')}
      />
    );
  };

  const renderProfileFlashcards = () => {
    const flashcards = FlashcardSystem.loadFlashcards();
    
    return (
      <FlashcardsPage
        flashcards={flashcards}
        onBack={() => setCurrentState('home')}
        onPractice={() => {
          // Navigate to flashcards practice page
          if (typeof window !== 'undefined') {
            window.location.href = '/flashcards';
          }
        }}
      />
    );
  };

  const renderProfileLevel = () => {
    return (
      <LevelQuestsPage
        onBack={() => setCurrentState('home')}
      />
    );
  };

  const renderProfileSettings = () => {
    return (
      <SettingsPage
        user={user}
        onBack={() => setCurrentState('home')}
        onSave={(settings) => {
          console.log('Settings saved:', settings);
          // You can add additional logic here like updating user profile in Firestore
        }}
        onResetProgress={() => {
          // Reset all progress
          if (typeof window !== 'undefined') {
            localStorage.removeItem('minka-progression');
            localStorage.removeItem('minka-user-flashcards');
            localStorage.removeItem('minka-flashcards_v1');
            localStorage.removeItem('minka-achievements');
            window.location.reload();
          }
        }}
      />
    );
  };

  const renderAbout = () => {
    return <AboutPage onBack={() => setCurrentState('home')} />;
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="text-6xl mb-4 animate-bounce">🐱</div>
            <h2 className="text-2xl font-semibold text-[#4B3F72]">Loading Minka...</h2>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {currentState === 'home' && renderHome()}
      {currentState === 'story' && renderStory()}
      {currentState === 'vocabulary' && renderVocabulary()}
      {currentState === 'progress' && renderProgress()}
      {currentState === 'grammar' && renderGrammar()}
      {currentState === 'grammar-library' && renderGrammarLibrary()}
      {currentState === 'episodes' && renderEpisodes()}
      {currentState === 'reader' && renderDigitalReader()}
      {currentState === 'dashboard' && renderDashboard()}
      {currentState === 'roadmap' && renderRoadmap()}
      {currentState === 'profile-progress' && renderProfileProgress()}
      {currentState === 'profile-achievements' && renderProfileAchievements()}
      {currentState === 'profile-flashcards' && renderProfileFlashcards()}
      {currentState === 'profile-level' && renderProfileLevel()}
      {currentState === 'profile-settings' && renderProfileSettings()}
      {currentState === 'about' && renderAbout()}
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          // Auth state change will be handled by useEffect
          setShowAuthModal(false);
        }}
      />

      {/* Level and Quest Notifications */}
      <AnimatePresence>
        {xpNotification && (
          <XPNotification
            amount={xpNotification.amount}
            reason={xpNotification.reason}
            onComplete={() => setXPNotification(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {levelUpNotification && (
          <LevelUpNotification
            newLevel={levelUpNotification}
            onComplete={() => setLevelUpNotification(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {questNotification && (
          <QuestCompletionNotification
            quest={questNotification}
            onComplete={() => setQuestNotification(null)}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}
