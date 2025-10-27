import { motion } from 'framer-motion';
import { Button } from '@/components/layout';
import { GrammarLesson } from '@/components/grammar-lesson';
import { Story } from '@/types';

interface GrammarViewProps {
  story: Story | null;
  onComplete: () => void;
  onBack: () => void;
  getGrammarLesson: (storyId: string) => any;
}

export default function GrammarView({ story, onComplete, onBack, getGrammarLesson }: GrammarViewProps) {
  if (!story) return null;
  
  const grammarLesson = getGrammarLesson(story.id);
  
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
            <Button onClick={onBack} className="bg-[#BCA6FF] hover:bg-[#A794FF] text-white">
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
      onComplete={onComplete}
      onBack={onBack}
    />
  );
}

