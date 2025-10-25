'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { signUp, signIn, signInWithGoogle, resetPassword } from '@/lib/auth';
import { Button, Card } from './layout';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

type AuthMode = 'signin' | 'signup' | 'reset';

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signUp(email, password, displayName || 'Minka Learner');
      } else if (mode === 'signin') {
        await signIn(email, password);
      } else if (mode === 'reset') {
        await resetPassword(email);
        setResetEmailSent(true);
        setLoading(false);
        return;
      }

      // Success - close modal and notify parent
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Google.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
    setResetEmailSent(false);
  };

  const switchMode = (newMode: AuthMode) => {
    resetForm();
    setMode(newMode);
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
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md"
            >
              <Card className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="relative bg-gradient-to-br from-[#BCA6FF] to-[#7B6AF5] p-8 text-white">
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-12 w-12 rounded-full bg-white/20 grid place-items-center">
                      <span className="text-2xl">🐱</span>
                    </div>
                    <h2 className="text-2xl font-bold">Minka</h2>
                  </div>
                  
                  <p className="text-white/90">
                    {mode === 'signin' && 'Welcome back! Sign in to continue your learning journey.'}
                    {mode === 'signup' && 'Start your German learning adventure with Minka!'}
                    {mode === 'reset' && 'Reset your password and get back to learning.'}
                  </p>
                </div>

                {/* Form */}
                <div className="p-8">
                  {resetEmailSent ? (
                    <div className="text-center">
                      <div className="text-5xl mb-4">📧</div>
                      <h3 className="text-xl font-semibold text-[#4B3F72] mb-2">
                        Check your email
                      </h3>
                      <p className="text-[#5E548E] mb-6">
                        We've sent you a password reset link. Please check your inbox.
                      </p>
                      <Button
                        onClick={() => switchMode('signin')}
                        className="w-full bg-[#BCA6FF] hover:bg-[#A794FF]"
                      >
                        Back to Sign In
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                        >
                          {error}
                        </motion.div>
                      )}

                      {mode === 'signup' && (
                        <div>
                          <label className="block text-sm font-medium text-[#4B3F72] mb-2">
                            Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6D5B95]" />
                            <input
                              type="text"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              placeholder="Your name"
                              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#BCA6FF] focus:border-transparent outline-none transition-all"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-[#4B3F72] mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6D5B95]" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#BCA6FF] focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>

                      {mode !== 'reset' && (
                        <div>
                          <label className="block text-sm font-medium text-[#4B3F72] mb-2">
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6D5B95]" />
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              required
                              minLength={6}
                              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#BCA6FF] focus:border-transparent outline-none transition-all"
                            />
                          </div>
                          {mode === 'signin' && (
                            <button
                              type="button"
                              onClick={() => switchMode('reset')}
                              className="mt-2 text-sm text-[#7B6AF5] hover:underline"
                            >
                              Forgot password?
                            </button>
                          )}
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#BCA6FF] hover:bg-[#A794FF] text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Processing...
                          </span>
                        ) : (
                          <>
                            {mode === 'signin' && 'Sign In'}
                            {mode === 'signup' && 'Create Account'}
                            {mode === 'reset' && 'Send Reset Link'}
                          </>
                        )}
                      </Button>

                      {mode !== 'reset' && (
                        <>
                          <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-4 bg-white text-[#6D5B95]">Or continue with</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                              <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              />
                              <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              />
                              <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              />
                              <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              />
                            </svg>
                            <span className="text-[#5E548E] font-medium">Google</span>
                          </button>
                        </>
                      )}

                      <div className="text-center text-sm text-[#6D5B95] mt-4">
                        {mode === 'signin' ? (
                          <>
                            Don't have an account?{' '}
                            <button
                              type="button"
                              onClick={() => switchMode('signup')}
                              className="text-[#7B6AF5] font-semibold hover:underline"
                            >
                              Sign up
                            </button>
                          </>
                        ) : mode === 'signup' ? (
                          <>
                            Already have an account?{' '}
                            <button
                              type="button"
                              onClick={() => switchMode('signin')}
                              className="text-[#7B6AF5] font-semibold hover:underline"
                            >
                              Sign in
                            </button>
                          </>
                        ) : (
                          <>
                            Remember your password?{' '}
                            <button
                              type="button"
                              onClick={() => switchMode('signin')}
                              className="text-[#7B6AF5] font-semibold hover:underline"
                            >
                              Sign in
                            </button>
                          </>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

