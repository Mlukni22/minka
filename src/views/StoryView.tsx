import { Story } from '@/types';
import { UserProgressionState } from '@/lib/progression';
import { SectionErrorBoundary } from '@/components/section-error-boundary';
import { StoryReader } from '@/components/story-reader';
import { ProgressionSystem } from '@/lib/progression';

interface StoryViewProps {
  story: Story;
  progressionState: UserProgressionState | null;
  onComplete: () => void;
  onBack: () => void;
  onNavigateToVocabulary: () => void;
  onAwardXP: (amount: number, reason: string) => void;
  onUpdateQuest: (type: any, amount?: number) => void;
  onWordsRead: (count: number) => void;
  onWordLearned: () => void;
  onUpdateProgression: () => void;
}

export default function StoryView({
  story,
  progressionState,
  onComplete,
  onBack,
  onNavigateToVocabulary,
  onAwardXP,
  onUpdateQuest,
  onWordsRead,
  onWordLearned,
  onUpdateProgression
}: StoryViewProps) {
  if (!progressionState) return null;
  
  const savedPosition = ProgressionSystem.getSavedPosition(story.id, progressionState);
  
  return (
    <SectionErrorBoundary section="story">
      <StoryReader
        story={story}
        initialChapterIndex={savedPosition.chapterIndex}
        initialSceneIndex={savedPosition.sceneIndex}
        onComplete={() => {
          onUpdateProgression();
          onComplete();
        }}
        onBack={() => {
          onUpdateProgression();
          onBack();
        }}
        onNavigateToVocabulary={onNavigateToVocabulary}
        onAwardXP={onAwardXP}
        onUpdateQuest={onUpdateQuest}
        onWordsRead={onWordsRead}
        onWordLearned={onWordLearned}
      />
    </SectionErrorBoundary>
  );
}

