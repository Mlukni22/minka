'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Globe, Moon, Save, Sun, Target, Trash2, User, AlertTriangle } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { deleteAllUserData } from '@/lib/delete-user-data';

interface SettingsPageProps {
  user: FirebaseUser | null;
  onBack: () => void;
  onSave?: (settings: UserSettings) => void;
  onResetProgress?: () => void;
}

export interface UserSettings {
  displayName: string;
  dailyGoal: number;
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'de';
  notifications: boolean;
  soundEffects: boolean;
}

export function SettingsPage({ user, onBack, onSave, onResetProgress }: SettingsPageProps) {
  // Load settings from localStorage or use defaults
  const [settings, setSettings] = useState<UserSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('minka-settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // Fall through to defaults
        }
      }
    }
    
    return {
      displayName: user?.displayName || '',
      dailyGoal: 20,
      theme: 'light',
      language: 'en',
      notifications: true,
      soundEffects: true,
    };
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('minka-settings', JSON.stringify(settings));
    }
    
    onSave?.(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    onResetProgress?.();
    setShowResetConfirm(false);
  };

  const handleDeleteAllData = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      await deleteAllUserData(user.uid);
      alert('All your data has been successfully deleted. You will be signed out.');
      // Sign out the user
      const { signOut } = await import('firebase/auth');
      const { getAuth } = await import('firebase/auth');
      await signOut(getAuth());
      // Reload the page to reset the app state
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting user data:', error);
      alert('Failed to delete data. Please try again or contact support.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(1000px_500px_at_10%_-10%,#E7F7E8_0%,transparent_60%),radial-gradient(900px_420px_at_90%_-10%,#F1ECFF_0%,transparent_60%),linear-gradient(180deg,#FFF9F3_0%,#FDFBFF_100%)] text-[#2E3A28]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-[#7B6AF5] hover:text-[#6B5AE5] font-semibold transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </button>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#2E3A28]">Settings</h1>
          <p className="text-[#6A7A6A] mt-2 text-lg">Customize your learning experience</p>
        </div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur rounded-3xl border border-white shadow-[0_20px_60px_rgba(20,12,60,.08)] p-6 md:p-8 mb-6"
        >
          <h2 className="text-2xl font-bold text-[#2E3A28] mb-6 flex items-center gap-2">
            <User className="h-6 w-6" />
            Profile
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#2E3A28] mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={settings.displayName}
                onChange={e => setSettings({ ...settings, displayName: e.target.value })}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#EEE7FF] bg-white outline-none focus:border-[#BCA6FF] focus:ring-4 focus:ring-[#EDEAFF] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2E3A28] mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 rounded-xl border-2 border-[#EEE7FF] bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-[#6A7A6A] mt-1">Email cannot be changed</p>
            </div>
          </div>
        </motion.div>

        {/* Learning Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur rounded-3xl border border-white shadow-[0_20px_60px_rgba(20,12,60,.08)] p-6 md:p-8 mb-6"
        >
          <h2 className="text-2xl font-bold text-[#2E3A28] mb-6 flex items-center gap-2">
            <Target className="h-6 w-6" />
            Learning Preferences
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#2E3A28] mb-2">
                Daily Goal (minutes)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={settings.dailyGoal}
                  onChange={e => setSettings({ ...settings, dailyGoal: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-2xl font-bold text-[#7B6AF5] w-16 text-center">
                  {settings.dailyGoal}
                </span>
              </div>
              <div className="flex justify-between text-xs text-[#6A7A6A] mt-1">
                <span>5 min</span>
                <span>60 min</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2E3A28] mb-2">
                Interface Language
              </label>
              <select
                value={settings.language}
                onChange={e => setSettings({ ...settings, language: e.target.value as 'en' | 'de' })}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#EEE7FF] bg-white outline-none focus:border-[#BCA6FF] focus:ring-4 focus:ring-[#EDEAFF] transition-all"
              >
                <option value="en">English</option>
                <option value="de">Deutsch (Coming soon)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur rounded-3xl border border-white shadow-[0_20px_60px_rgba(20,12,60,.08)] p-6 md:p-8 mb-6"
        >
          <h2 className="text-2xl font-bold text-[#2E3A28] mb-6 flex items-center gap-2">
            <Sun className="h-6 w-6" />
            Appearance
          </h2>

          <div>
            <label className="block text-sm font-semibold text-[#2E3A28] mb-3">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              <ThemeButton
                icon={<Sun className="h-5 w-5" />}
                label="Light"
                active={settings.theme === 'light'}
                onClick={() => setSettings({ ...settings, theme: 'light' })}
              />
              <ThemeButton
                icon={<Moon className="h-5 w-5" />}
                label="Dark"
                active={settings.theme === 'dark'}
                onClick={() => setSettings({ ...settings, theme: 'dark' })}
                disabled
              />
              <ThemeButton
                icon={<Globe className="h-5 w-5" />}
                label="Auto"
                active={settings.theme === 'auto'}
                onClick={() => setSettings({ ...settings, theme: 'auto' })}
                disabled
              />
            </div>
            <p className="text-xs text-[#6A7A6A] mt-2">Dark and Auto themes coming soon</p>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur rounded-3xl border border-white shadow-[0_20px_60px_rgba(20,12,60,.08)] p-6 md:p-8 mb-6"
        >
          <h2 className="text-2xl font-bold text-[#2E3A28] mb-6 flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications & Sounds
          </h2>

          <div className="space-y-4">
            <ToggleSetting
              label="Daily Reminders"
              description="Get notified to practice daily"
              checked={settings.notifications}
              onChange={checked => setSettings({ ...settings, notifications: checked })}
            />
            <ToggleSetting
              label="Sound Effects"
              description="Play sounds for actions and achievements"
              checked={settings.soundEffects}
              onChange={checked => setSettings({ ...settings, soundEffects: checked })}
            />
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-red-50 backdrop-blur rounded-3xl border-2 border-red-200 p-6 md:p-8 mb-6"
        >
          <h2 className="text-2xl font-bold text-red-800 mb-6 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Danger Zone
          </h2>

          <div className="space-y-4">
            {/* Reset Progress */}
            <div className="bg-white rounded-2xl p-5">
              <h3 className="font-bold text-red-800 mb-2">Reset All Progress</h3>
              <p className="text-sm text-red-600 mb-4">
                This will permanently delete all your progress, achievements, and flashcards. This action cannot be undone.
              </p>
              {!showResetConfirm ? (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 rounded-xl border-2 border-red-500 text-red-700 font-semibold hover:bg-red-50 transition-all"
                >
                  Reset Progress
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-red-800">
                    Are you absolutely sure? This cannot be undone!
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all"
                    >
                      Yes, Reset Everything
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-4 py-2 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Delete All Account Data */}
            <div className="bg-white rounded-2xl p-5 border-2 border-red-400">
              <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Delete All Account Data
              </h3>
              <p className="text-sm text-red-700 mb-4">
                This will permanently delete ALL your data including your account, progress, flashcards, and all associated information. This action cannot be undone and you will be signed out.
              </p>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-red-700 text-white font-semibold hover:bg-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete All Data
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-red-100 border border-red-300 rounded-xl p-4">
                    <p className="text-sm font-bold text-red-900 mb-2">
                      ⚠️ Final Warning
                    </p>
                    <p className="text-sm text-red-800 mb-2">
                      This will delete:
                    </p>
                    <ul className="text-sm text-red-700 list-disc list-inside mb-3 space-y-1">
                      <li>Your user account</li>
                      <li>All flashcards and review history</li>
                      <li>All story and chapter progress</li>
                      <li>All exercise attempts</li>
                      <li>All achievements and statistics</li>
                    </ul>
                    <p className="text-sm font-semibold text-red-900">
                      This action is PERMANENT and CANNOT be undone!
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAllData}
                      disabled={isDeleting}
                      className="px-4 py-2 rounded-xl bg-red-800 text-white font-semibold hover:bg-red-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Yes, Delete Everything
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                      className="px-4 py-2 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white shadow-lg hover:shadow-xl transition-all ${
              saved
                ? 'bg-gradient-to-b from-[#9AD8BA] to-[#41AD83]'
                : 'bg-gradient-to-b from-[#BCA6FF] to-[#7B6AF5] hover:from-[#A794FF] hover:to-[#6A59E4]'
            }`}
          >
            {saved ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  ✓
                </motion.div>
                Saved!
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Settings
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

interface ThemeButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function ThemeButton({ icon, label, active, onClick, disabled }: ThemeButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
        active
          ? 'bg-[#BCA6FF] border-[#7B6AF5] text-white shadow-md'
          : 'bg-white border-[#EEE7FF] text-[#6A7A6A] hover:bg-[#F7F5FF]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon}
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleSetting({ label, description, checked, onChange }: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-[#F7F5FF] border border-[#E1D9FF]">
      <div className="flex-1">
        <div className="font-semibold text-[#2E3A28]">{label}</div>
        <div className="text-sm text-[#6A7A6A]">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-all ${
          checked ? 'bg-[#9AD8BA]' : 'bg-gray-300'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all ${
            checked ? 'left-7' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}

