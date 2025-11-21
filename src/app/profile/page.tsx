'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange, signOut } from '@/lib/auth';
import { getUserData, updateUserProfile } from '@/lib/db/user';
import { getAllUserStoryProgress } from '@/lib/db/user-progress';
import { getUserFlashcards } from '@/lib/db/flashcards';
import { User, GermanLevel } from '@/types/user';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, LogOut, Edit2, Save, X } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [storiesCompleted, setStoriesCompleted] = useState(0);
  const [totalFlashcards, setTotalFlashcards] = useState(0);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [germanLevel, setGermanLevel] = useState<GermanLevel | null>(null);
  const [dailyGoal, setDailyGoal] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/auth/login');
        return;
      }

      await loadUserData(firebaseUser.uid);
    });

    return () => unsubscribe();
  }, [router]);

  const loadUserData = async (userId: string) => {
    try {
      const [userData, progress, flashcards] = await Promise.all([
        getUserData(userId),
        getAllUserStoryProgress(userId),
        getUserFlashcards(userId),
      ]);

      if (userData) {
        setUser(userData);
        setDisplayName(userData.displayName || '');
        setGermanLevel(userData.germanLevel);
        setDailyGoal(userData.dailyGoalMinutes);
      }

      const completedCount = progress.filter(p => p.completed).length;
      setStoriesCompleted(completedCount);
      setTotalFlashcards(flashcards.length);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateUserProfile(user.id, {
        displayName: displayName || undefined,
        germanLevel: germanLevel || undefined,
        dailyGoalMinutes: dailyGoal || undefined,
      });
      setEditing(false);
      await loadUserData(user.id);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentLevel = Math.floor(user.xpTotal / 100) + 1;
  const xpForNextLevel = currentLevel * 100;
  const progressPercentage = ((user.xpTotal % 100) / 100) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          <Button onClick={handleSignOut} variant="secondary" size="sm">
            <LogOut className="w-4 h-4 mr-1" />
            Sign Out
          </Button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="secondary" size="sm">
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => {
                  setEditing(false);
                  setDisplayName(user.displayName || '');
                  setGermanLevel(user.germanLevel);
                  setDailyGoal(user.dailyGoalMinutes);
                }} variant="ghost" size="sm">
                  <X className="w-4 h-4" />
                </Button>
                <Button onClick={handleSave} variant="accent" size="sm" disabled={saving}>
                  <Save className="w-4 h-4 mr-1" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>

          {/* Display Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
            {editing ? (
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Your name"
              />
            ) : (
              <p className="text-lg text-gray-900">{user.displayName || 'Not set'}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <p className="text-lg text-gray-900">{user.email}</p>
          </div>

          {/* German Level */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">German Level</label>
            {editing ? (
              <select
                value={germanLevel || ''}
                onChange={(e) => setGermanLevel(e.target.value as GermanLevel || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select level</option>
                <option value="BEGINNER">Just starting</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1_PLUS">B1+</option>
              </select>
            ) : (
              <p className="text-lg text-gray-900">
                {user.germanLevel ? user.germanLevel.replace('_', ' ') : 'Not set'}
              </p>
            )}
          </div>

          {/* Daily Goal */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Daily Goal</label>
            {editing ? (
              <select
                value={dailyGoal || ''}
                onChange={(e) => setDailyGoal(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">No goal</option>
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="20">20 minutes</option>
              </select>
            ) : (
              <p className="text-lg text-gray-900">
                {user.dailyGoalMinutes ? `${user.dailyGoalMinutes} minutes` : 'Not set'}
              </p>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* XP Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-1">Total XP</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{user.xpTotal}</div>
            <div className="text-xs text-gray-500">Level {currentLevel}</div>
            <div className="mt-3 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Words Learned */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-1">Words Learned</div>
            <div className="text-3xl font-bold text-gray-900">{user.wordsLearned}</div>
          </div>

          {/* Stories Completed */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-1">Stories Completed</div>
            <div className="text-3xl font-bold text-gray-900">{storiesCompleted}</div>
          </div>

          {/* Flashcards */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-1">Total Flashcards</div>
            <div className="text-3xl font-bold text-gray-900">{totalFlashcards}</div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Account</h2>
          <p className="text-gray-600 mb-4">
            Account created: {new Date(user.createdAt).toLocaleDateString()}
          </p>
          <Button onClick={handleSignOut} variant="secondary">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

