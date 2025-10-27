import { SectionErrorBoundary } from '@/components/section-error-boundary';
import { VocabularyReview } from '@/components/vocabulary-review';
import { SRSVocabularyItem } from '@/lib/srs';

interface VocabularyViewProps {
  onComplete: (updatedItems: SRSVocabularyItem[]) => void;
  onBack: () => void;
}

export default function VocabularyView({ onComplete, onBack }: VocabularyViewProps) {
  return (
    <SectionErrorBoundary section="flashcards">
      <VocabularyReview
        onComplete={onComplete}
        onBack={onBack}
      />
    </SectionErrorBoundary>
  );
}

