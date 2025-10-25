'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, BookOpen, Sparkles, Users, Globe, Zap } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

export function AboutPage({ onBack }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(1000px_500px_at_10%_-10%,#E7F7E8_0%,transparent_60%),radial-gradient(900px_420px_at_90%_-10%,#F1ECFF_0%,transparent_60%),linear-gradient(180deg,#FFF9F3_0%,#FDFBFF_100%)] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={onBack}
            className="mb-4 text-[#7B6AF5] hover:text-[#6B5AE5] font-semibold flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
          <h1 className="text-5xl font-extrabold text-[#2E3A28] mb-2">About Minka</h1>
          <p className="text-xl text-[#637063]">Learn German through stories and emotional connection</p>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Mission Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-8 w-8 text-[#FF8F6E]" />
              <h2 className="text-3xl font-bold text-[#4B3F72]">Our Mission</h2>
            </div>
            <p className="text-lg text-[#5E548E] leading-relaxed">
              Minka makes learning German feel natural and enjoyable. Through engaging stories about a curious cat
              named Minka and her friends, you'll learn German in context, building real connections with the language
              instead of memorizing isolated words.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="h-6 w-6 text-[#7B6AF5]" />
                <h3 className="text-xl font-bold text-[#4B3F72]">Story-Based Learning</h3>
              </div>
              <p className="text-[#5E548E]">
                Follow Minka through meaningful adventures. Learn vocabulary and grammar naturally as the story unfolds,
                with interactive dialogues and beautiful illustrations.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="h-6 w-6 text-[#41AD83]" />
                <h3 className="text-xl font-bold text-[#4B3F72]">Spaced Repetition</h3>
              </div>
              <p className="text-[#5E548E]">
                Our smart flashcard system uses the proven SM-2 algorithm to help you review words exactly when you need to,
                maximizing retention and minimizing study time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-3">
                <Zap className="h-6 w-6 text-[#FFA96E]" />
                <h3 className="text-xl font-bold text-[#4B3F72]">Interactive Vocabulary</h3>
              </div>
              <p className="text-[#5E548E]">
                Hover over any German word in the stories to see instant translations. Click to add words to your personal
                flashcard collection for later review.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-6 w-6 text-[#C7B8FF]" />
                <h3 className="text-xl font-bold text-[#4B3F72]">Progress Tracking</h3>
              </div>
              <p className="text-[#5E548E]">
                Watch your German skills grow! Track your progress through chapters, monitor your vocabulary collection,
                and earn achievements as you learn.
              </p>
            </motion.div>
          </div>

          {/* Learning Method Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-[#F1ECFF] to-[#E7F7E8] rounded-2xl p-8 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <Globe className="h-8 w-8 text-[#7B6AF5]" />
              <h2 className="text-3xl font-bold text-[#4B3F72]">Our Learning Method</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-white/60 rounded-xl p-4">
                <h4 className="font-semibold text-[#4B3F72] mb-2">1. Comprehensible Input</h4>
                <p className="text-[#5E548E]">
                  Stories provide context for new vocabulary, making words meaningful and memorable from the start.
                </p>
              </div>
              <div className="bg-white/60 rounded-xl p-4">
                <h4 className="font-semibold text-[#4B3F72] mb-2">2. Active Engagement</h4>
                <p className="text-[#5E548E]">
                  Click words to add them to flashcards, complete exercises, and practice speaking – learning by doing!
                </p>
              </div>
              <div className="bg-white/60 rounded-xl p-4">
                <h4 className="font-semibold text-[#4B3F72] mb-2">3. Spaced Repetition</h4>
                <p className="text-[#5E548E]">
                  Review vocabulary at scientifically optimal intervals to move words from short-term to long-term memory.
                </p>
              </div>
              <div className="bg-white/60 rounded-xl p-4">
                <h4 className="font-semibold text-[#4B3F72] mb-2">4. Emotional Connection</h4>
                <p className="text-[#5E548E]">
                  Stories create emotional engagement, which research shows dramatically improves language retention.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Story Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          >
            <h2 className="text-3xl font-bold text-[#4B3F72] mb-4">The Story of Minka</h2>
            <div className="space-y-3 text-[#5E548E]">
              <p className="leading-relaxed">
                Minka is a curious lavender-banded cat who lives in a cozy German village. Together with her friends –
                Lisa the rabbit, Pinko the pig, Boby the dog, and Emma the mouse – she goes on gentle adventures that
                help you learn German naturally.
              </p>
              <p className="leading-relaxed">
                Through 6 chapters and 21 lessons, you'll follow Minka as she:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Makes new friends and learns greetings</li>
                <li>Explores her village and discovers everyday vocabulary</li>
                <li>Solves mysteries and practices past tense</li>
                <li>Reads mysterious letters and learns about German culture</li>
                <li>Follows clues through forests and learns directional phrases</li>
                <li>Uncovers village secrets and masters complex sentences</li>
              </ul>
              <p className="leading-relaxed font-semibold text-[#7B6AF5] mt-4">
                Every story is crafted to teach A1-level German in the most natural, enjoyable way possible. 🐱💜
              </p>
            </div>
          </motion.div>

          {/* CEFR Level Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          >
            <h2 className="text-3xl font-bold text-[#4B3F72] mb-4">Level: A1 (Beginner)</h2>
            <p className="text-[#5E548E] leading-relaxed mb-4">
              Minka is designed for complete beginners and early learners following the CEFR A1 level. By the end of the course,
              you'll be able to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#5E548E]">
              <li>Understand and use familiar everyday expressions</li>
              <li>Introduce yourself and others</li>
              <li>Ask and answer simple questions about personal details</li>
              <li>Interact in a simple way if the other person talks slowly and clearly</li>
              <li>Read and understand basic German texts</li>
              <li>Write simple messages and fill out forms</li>
            </ul>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-gradient-to-br from-[#BCA6FF] to-[#7B6AF5] rounded-2xl p-8 shadow-lg text-white text-center"
          >
            <h2 className="text-3xl font-bold mb-3">Ready to Start Your Journey?</h2>
            <p className="text-lg mb-6 opacity-90">
              Join Minka and her friends on a cozy adventure through the German language!
            </p>
            <button
              onClick={onBack}
              className="bg-white text-[#7B6AF5] px-8 py-3 rounded-xl font-semibold text-lg hover:bg-[#F8F5FF] transition-all shadow-lg hover:shadow-xl"
            >
              Start Learning →
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

