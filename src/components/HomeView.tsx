'use client';

import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { Card } from '@/components/layout';
import { LanguageSwitcher } from '@/components/language-switcher';
import { UserMenu } from '@/components/user-menu';
import { StreakWidget } from '@/components/streak-widget';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserProgressionState } from '@/lib/progression';
import { User } from 'firebase/auth';
import { Story } from '@/types';

interface HomeViewProps {
  user: User | null;
  progressionState: UserProgressionState | null;
  storyEngine: any;
  onNavigate: (state: any) => void;
  onShowAuth: () => void;
  onSignOut: () => void;
  onStartStory: (story: Story) => void;
}

export default function HomeView({
  user,
  progressionState,
  storyEngine,
  onNavigate,
  onShowAuth,
  onSignOut,
  onStartStory
}: HomeViewProps) {
  const { t } = useLanguage();

  return (
    <div className="w-full font-[Poppins] text-[#2D3B2E]">
      {/* Top Section with Forest Background */}
      <TopSection
        user={user}
        progressionState={progressionState}
        onNavigate={onNavigate}
        onShowAuth={onShowAuth}
        onSignOut={onSignOut}
        onStartStory={onStartStory}
        storyEngine={storyEngine}
      />

      {/* World cards section */}
      <WorldCards onNavigate={onNavigate} />
    </div>
  );
}

function TopSection({
  user,
  progressionState,
  onNavigate,
  onShowAuth,
  onSignOut,
  onStartStory,
  storyEngine
}: any) {
  const { t } = useLanguage();
  
  const findNextStory = () => {
    const stories = storyEngine.getStories();
    let nextStory = null;
    
    for (const story of stories) {
      const progress = progressionState?.episodeProgress[story.id];
      if (!progress?.completed) {
        nextStory = story;
        break;
      }
    }
    
    return nextStory || stories[0];
  };

  const nextStory = user && progressionState ? findNextStory() : null;
  const progress = progressionState?.episodeProgress[nextStory?.id] || {};
  const hasStarted = (progress.currentChapterIndex || 0) > 0 || 
                     (progress.currentSceneIndex || 0) > 0 || 
                     (progress.chaptersCompleted || 0) > 0;

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-green-100 to-green-50">
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

      <header className="relative z-20 flex items-center justify-between px-6 pt-8">
        <div className="flex items-center gap-3">
          <motion.div 
            initial={{ opacity: 0, rotate: -10 }} 
            animate={{ opacity: 1, rotate: 0 }} 
            transition={{ duration: 0.6 }} 
            className="grid h-10 w-10 place-items-center rounded-2xl bg-[#D9EDE6] shadow-md"
          >
            <span className="text-xl">🐾</span>
          </motion.div>
        </div>
        <nav className="hidden gap-8 text-[#6D5B95] md:flex">
          <a href="#features" className="hover:opacity-80">{t.nav.features}</a>
          <button onClick={() => onNavigate('roadmap')} className="hover:opacity-80">{t.nav.roadmap}</button>
          <button onClick={() => onNavigate('about')} className="hover:opacity-80">{t.nav.about}</button>
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {user && <StreakWidget progressionState={progressionState} />}
          {user ? (
            <UserMenu 
              user={user} 
              onSignOut={onSignOut}
              onNavigate={(page) => onNavigate(`profile-${page}`)}
            />
          ) : (
            <button onClick={onShowAuth} className="btn btn-primary">
              {t.nav.signIn}
            </button>
          )}
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-24 text-center">
        {user ? (
          <>
            <h1 className="hero-title">Welcome back, {user.displayName || 'Learner'}! 👋</h1>
            <p className="hero-subtext">Ready to continue your German learning journey?</p>
            <QuickStats progressionState={progressionState} />
            <div className="mt-8 flex justify-center gap-4 flex-wrap">
              <button 
                className="btn btn-primary text-xl px-10 py-5 relative"
                style={{ borderRadius: '32px' }}
                onClick={() => nextStory && onStartStory(nextStory)}
              >
                <span className="flex items-center gap-3">
                  <span>{hasStarted ? t.home.continueChapter : t.home.startChapter}</span>
                  <span className="text-sm opacity-80">({nextStory?.title})</span>
                </span>
              </button>
              <button 
                className="btn btn-secondary text-lg px-8 py-4 relative"
                style={{ borderRadius: '24px' }}
                onClick={() => onNavigate('dashboard')}
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Dashboard</span>
                </span>
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="hero-title">{t.home.tagline}</h1>
            <p className="hero-subtext">{t.home.subtitle}</p>
            <div className="mt-8 flex justify-center gap-4 flex-wrap">
              <button 
                className="btn btn-primary text-xl px-10 py-5 relative"
                style={{ borderRadius: '32px' }}
                onClick={() => {
                  const firstStory = storyEngine.getStory('episode-0-hallo');
                  if (firstStory) onStartStory(firstStory);
                }}
              >
                <span className="flex items-center gap-3">
                  <span>Start Your Journey</span>
                  <span className="text-sm opacity-80">(Chapter 1)</span>
                </span>
              </button>
            </div>
          </>
        )}

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
            style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' }}
          />
        </motion.div>
      </div>
    </div>
  );
}

function QuickStats({ progressionState }: { progressionState: any }) {
  return (
    <div className="mt-8 max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm">
        <div className="text-2xl font-bold text-[#7B6AF5]">
          {progressionState ? Object.values(progressionState.episodeProgress).filter((e: any) => e.completed).length : 0}
        </div>
        <div className="text-sm text-gray-600">Chapters</div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm">
        <div className="text-2xl font-bold text-green-600">{progressionState?.streak || 0}</div>
        <div className="text-sm text-gray-600">Day Streak</div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm">
        <div className="text-2xl font-bold text-orange-600">0</div>
        <div className="text-sm text-gray-600">Words Learned</div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm">
        <div className="text-2xl font-bold text-purple-600">1</div>
        <div className="text-sm text-gray-600">Level</div>
      </div>
    </div>
  );
}

function WorldCards({ onNavigate }: any) {
  return (
    <div className="relative z-10 bg-[#FFF9F2]/90 backdrop-blur-sm py-12 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <motion.div
          className="world-card forest"
          onClick={() => { window.location.href = '/flashcards'; }}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <div className="world-card-content">
            <h3 className="world-card-title">Forest</h3>
            <p className="world-card-subtitle">My Flashcards<br />Review</p>
          </div>
        </motion.div>

        <motion.div
          className="world-card library"
          onClick={() => onNavigate('grammar-library')}
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
  );
}


