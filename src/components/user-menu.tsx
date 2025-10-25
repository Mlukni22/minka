'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, LogOut, Settings, Award, BookOpen, TrendingUp, Zap } from 'lucide-react';
import { signOut } from '@/lib/auth';
import { User } from 'firebase/auth';
import { useLanguage } from '@/contexts/LanguageContext';

type UserMenuProps = {
  user: User;
  onSignOut?: () => void;
  onNavigate?: (page: 'progress' | 'achievements' | 'flashcards' | 'settings' | 'level') => void;
};

export function UserMenu({ user, onSignOut, onNavigate }: UserMenuProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      onSignOut?.();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="relative">
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#E7E0FF] hover:bg-[#D9D1FF] transition-colors"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-[#BCA6FF] grid place-items-center text-white font-semibold">
            {(user.displayName || user.email || 'U')[0].toUpperCase()}
          </div>
        )}
        <span className="hidden md:block text-sm font-medium text-[#4B3F72]">
          {user.displayName || 'Learner'}
        </span>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
            >
              {/* User Info */}
              <div className="bg-gradient-to-br from-[#BCA6FF] to-[#7B6AF5] p-4 text-white">
                <div className="flex items-center gap-3 mb-2">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="h-12 w-12 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-white/20 grid place-items-center text-white font-bold text-lg">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {user.displayName || 'Minka Learner'}
                    </p>
                    <p className="text-sm text-white/80 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <MenuItem
                  icon={<TrendingUp className="h-5 w-5" />}
                  text={t.profile.myProgress}
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate?.('progress');
                  }}
                />
                <MenuItem
                  icon={<Zap className="h-5 w-5" />}
                  text={t.profile.levelQuests}
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate?.('level');
                  }}
                />
                <MenuItem
                  icon={<Award className="h-5 w-5" />}
                  text={t.profile.achievements}
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate?.('achievements');
                  }}
                />
                <MenuItem
                  icon={<BookOpen className="h-5 w-5" />}
                  text={t.profile.myFlashcards}
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate?.('flashcards');
                  }}
                />
                <MenuItem
                  icon={<Settings className="h-5 w-5" />}
                  text={t.profile.settings}
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate?.('settings');
                  }}
                />
                
                <div className="my-2 border-t border-gray-200" />
                
                <MenuItem
                  icon={<LogOut className="h-5 w-5" />}
                  text={t.nav.signOut}
                  onClick={handleSignOut}
                  className="text-red-600 hover:bg-red-50"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

type MenuItemProps = {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
  className?: string;
};

function MenuItem({ icon, text, onClick, className = '' }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors hover:bg-gray-100 ${className}`}
    >
      <span className="text-[#6D5B95]">{icon}</span>
      <span className="text-[#4B3F72] font-medium">{text}</span>
    </button>
  );
}

