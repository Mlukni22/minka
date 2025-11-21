'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange, getCurrentUser } from '@/lib/auth';
import { updateUserOnboarding } from '@/lib/db/user';
import { GermanLevel } from '@/types/user';
import { Button } from '@/components/ui/button';

type OnboardingStep = 'welcome' | 'level' | 'goal' | 'finish';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [germanLevel, setGermanLevel] = useState<GermanLevel | null>(null);
  const [dailyGoal, setDailyGoal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/auth/login');
        return;
      }

      setUserId(firebaseUser.uid);

      // Check if already completed onboarding
      try {
        const { getUserData } = await import('@/lib/db/user');
        const userData = await getUserData(firebaseUser.uid);
        if (userData?.onboardingCompleted) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleNext = () => {
    if (currentStep === 'welcome') {
      setCurrentStep('level');
    } else if (currentStep === 'level' && germanLevel) {
      setCurrentStep('goal');
    } else if (currentStep === 'goal') {
      setCurrentStep('finish');
    }
  };

  const handleFinish = async () => {
    if (!userId || !germanLevel) return;

    setLoading(true);
    try {
      await updateUserOnboarding(userId, {
        germanLevel,
        dailyGoalMinutes: dailyGoal || undefined,
        onboardingCompleted: true,
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Failed to save your preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progress = {
    welcome: 1,
    level: 2,
    goal: 3,
    finish: 4,
  }[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 sm:p-12">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {progress} of 4</span>
            <span className="text-sm font-medium text-gray-600">{Math.round((progress / 4) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${(progress / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Welcome Step */}
        {currentStep === 'welcome' && (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🐾</div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to Minka 🐾
            </h1>
            <p className="text-lg text-gray-600">
              Let&apos;s personalize your German journey.
            </p>
            <p className="text-base text-gray-500">
              We&apos;ll ask you a few quick questions to get started.
            </p>
            <Button onClick={handleNext} size="lg" variant="accent" className="mt-6">
              Next
            </Button>
          </div>
        )}

        {/* Level Selection Step */}
        {currentStep === 'level' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                What&apos;s your current German level?
              </h2>
              <p className="text-gray-600">Choose the option that best describes you</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { value: 'BEGINNER' as GermanLevel, label: 'Just starting', desc: 'New to German' },
                { value: 'A1' as GermanLevel, label: 'A1', desc: 'Basic beginner' },
                { value: 'A2' as GermanLevel, label: 'A2', desc: 'Elementary' },
                { value: 'B1_PLUS' as GermanLevel, label: 'B1+', desc: 'Intermediate+' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGermanLevel(option.value)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    germanLevel === option.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 bg-white'
                  }`}
                >
                  <div className="font-semibold text-lg text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{option.desc}</div>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setCurrentStep('welcome')}
                variant="secondary"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                variant="accent"
                className="flex-1"
                disabled={!germanLevel}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Goal Selection Step */}
        {currentStep === 'goal' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                How much time can you spend most days?
              </h2>
              <p className="text-gray-600">This helps us personalize your learning plan</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[5, 10, 15, 20].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => setDailyGoal(minutes)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    dailyGoal === minutes
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 bg-white'
                  }`}
                >
                  <div className="font-semibold text-xl text-gray-900">{minutes} min</div>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setCurrentStep('level')}
                variant="secondary"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                variant="accent"
                className="flex-1"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Finish Step */}
        {currentStep === 'finish' && (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900">
              You&apos;re all set!
            </h2>
            <p className="text-lg text-gray-600">
              Let&apos;s meet your stories and start learning German the Minka way.
            </p>
            <Button
              onClick={handleFinish}
              size="lg"
              variant="accent"
              className="mt-6"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Go to Dashboard'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

