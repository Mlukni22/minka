import { motion } from 'framer-motion';
import { Story } from '@/types';
import { UserProgressionState } from '@/lib/progression';

interface GrammarLibraryViewProps {
  stories: Story[];
  progressionState: UserProgressionState | null;
  onSelectLesson: (story: Story) => void;
  onBack: () => void;
  getGrammarLesson: (storyId: string) => any;
}

export default function GrammarLibraryView({
  stories,
  progressionState,
  onSelectLesson,
  onBack,
  getGrammarLesson
}: GrammarLibraryViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F5F0] via-[#F3ECF9] to-[#E8DDF2] p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-[#4B3F72] mb-4">Grammar Library</h1>
          <p className="text-[#5E548E] text-lg">Explore grammar lessons for each chapter</p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-[#BCA6FF] hover:bg-[#A794FF] text-white rounded-lg transition-colors"
          >
            ← Back to Home
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story, index) => {
            const grammarLesson = getGrammarLesson(story.id);
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
                onClick={() => onSelectLesson(story)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">📚</div>
                  {isCompleted && <div className="text-green-500 text-xl">✓</div>}
                </div>
                
                <h3 className="text-xl font-bold text-[#4B3F72] mb-2">{story.title}</h3>
                <p className="text-[#5E548E] mb-4">{story.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Chapter {index + 1}</span>
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#4B3F72] mb-2">Grammar Learning Tips</h3>
            <p className="text-[#5E548E]">
              Complete chapters to unlock grammar lessons. Each lesson includes rules, examples, and exercises to help you master German grammar.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

