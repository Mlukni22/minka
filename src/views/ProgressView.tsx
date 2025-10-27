import { motion } from 'framer-motion';
import { FadeIn } from '@/components/animations';
import { ProgressOverview, StreakVisualization, VocabularyProgress, DailyGoal } from '@/components/progress';
import { UserProgress } from '@/types';

interface ProgressViewProps {
  progress: UserProgress;
  onBack: () => void;
}

export default function ProgressView({ progress, onBack }: ProgressViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <button 
              onClick={onBack}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              ← Back to Home
            </button>
          </div>
          
          <FadeIn>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Your Progress</h2>
          </FadeIn>

          <div className="space-y-8">
            <ProgressOverview progress={progress} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StreakVisualization streak={progress.streak} />
              <VocabularyProgress vocabularyProgress={progress.vocabularyProgress} />
            </div>
            
            <DailyGoal dailyGoal={15} timeSpent={8} />
          </div>
        </div>
      </div>
    </div>
  );
}

