'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { onAuthChange } from '@/lib/auth';
import { 
  getStoryById, 
  getStoryChapters,
  getChapterByNumber, 
  getChapterExercises,
  getExerciseOptions 
} from '@/lib/db/stories';
import { 
  getUserChapterProgress,
  updateUserChapterProgress,
  saveExerciseAttempt 
} from '@/lib/db/user-progress';
import { awardXP } from '@/lib/db/user';
import { Story, StoryChapter, ChapterExercise, ChapterExerciseOption, UserChapterProgress, UserChapterExerciseAttempt } from '@/types/story';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, CheckCircle, X as XIcon } from 'lucide-react';

export default function ChapterExercisesPage() {
  const router = useRouter();
  const params = useParams();
  const storyId = params.id as string;
  const chapterNumber = parseInt(params.chapter_number as string, 10);

  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<StoryChapter[]>([]);
  const [chapter, setChapter] = useState<StoryChapter | null>(null);
  const [exercises, setExercises] = useState<ChapterExercise[]>([]);
  const [exerciseOptions, setExerciseOptions] = useState<Map<string, ChapterExerciseOption[]>>(new Map());
  const [userAnswers, setUserAnswers] = useState<Map<string, string>>(new Map()); // exerciseId -> answer
  const [selectedOptions, setSelectedOptions] = useState<Map<string, string>>(new Map()); // exerciseId -> optionId
  const [submitted, setSubmitted] = useState<Map<string, boolean>>(new Map()); // exerciseId -> submitted
  const [results, setResults] = useState<Map<string, { correct: boolean; feedback: string }>>(new Map());
  const [chapterProgress, setChapterProgress] = useState<UserChapterProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [exercisesCompleted, setExercisesCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/auth/login');
        return;
      }

      setUserId(firebaseUser.uid);
      await loadExerciseData(firebaseUser.uid);
    });

    return () => unsubscribe();
  }, [router, storyId, chapterNumber]);

  const loadExerciseData = async (uid: string) => {
    try {
      const [storyData, chaptersData, chapterData, exercisesData] = await Promise.all([
        getStoryById(storyId),
        getStoryChapters(storyId),
        getChapterByNumber(storyId, chapterNumber),
        getChapterByNumber(storyId, chapterNumber).then(ch => ch ? getChapterExercises(storyId, ch.id) : []),
      ]);

      if (!storyData || !chapterData) {
        router.push(`/stories/${storyId}`);
        return;
      }

      setStory(storyData);
      setChapters(chaptersData);
      setChapter(chapterData);
      setExercises(exercisesData);

      // Load options for each exercise
      const optionsMap = new Map<string, ChapterExerciseOption[]>();
      for (const exercise of exercisesData) {
        if (exercise.type === 'MULTIPLE_CHOICE') {
          const options = await getExerciseOptions(storyId, chapterData.id, exercise.id);
          optionsMap.set(exercise.id, options);
        }
      }
      setExerciseOptions(optionsMap);

      // Load chapter progress
      const progress = await getUserChapterProgress(uid, chapterData.id);
      setChapterProgress(progress);

      if (progress?.status === 'COMPLETED') {
        setExercisesCompleted(true);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitExercise = async (exercise: ChapterExercise) => {
    if (!userId || submitted.get(exercise.id)) return;

    let isCorrect = false;
    let feedback = '';

    if (exercise.type === 'MULTIPLE_CHOICE') {
      const selectedOptionId = selectedOptions.get(exercise.id);
      const options = exerciseOptions.get(exercise.id) || [];
      const correctOption = options.find(opt => opt.isCorrect);
      const selectedOption = options.find(opt => opt.id === selectedOptionId);

      isCorrect = correctOption?.id === selectedOptionId;
      feedback = isCorrect
        ? 'Correct! 🎉'
        : `Not quite. The correct answer is: ${correctOption?.optionText || 'Unknown'}`;

      // Save attempt
      const attempt: UserChapterExerciseAttempt = {
        id: `${userId}_${exercise.id}_${Date.now()}`,
        userId,
        exerciseId: exercise.id,
        selectedOptionId: selectedOptionId,
        isCorrect,
        attemptedAt: new Date(),
        score: isCorrect ? 1 : 0,
      };
      await saveExerciseAttempt(attempt);
    } else if (exercise.type === 'GAP_FILL' || exercise.type === 'TRANSLATION_SIMPLE') {
      const userAnswer = userAnswers.get(exercise.id)?.trim().toLowerCase() || '';
      const correctAnswer = (exercise.correctAnswer || '').trim().toLowerCase();

      isCorrect = userAnswer === correctAnswer;
      feedback = isCorrect
        ? 'Correct! 🎉'
        : `Not quite. The correct answer is: ${exercise.correctAnswer || 'Unknown'}`;

      // Save attempt
      const attempt: UserChapterExerciseAttempt = {
        id: `${userId}_${exercise.id}_${Date.now()}`,
        userId,
        exerciseId: exercise.id,
        userAnswerText: userAnswers.get(exercise.id),
        isCorrect,
        attemptedAt: new Date(),
        score: isCorrect ? 1 : 0,
      };
      await saveExerciseAttempt(attempt);
    }

    setResults(new Map([...results, [exercise.id, { correct: isCorrect, feedback }]]));
    setSubmitted(new Map([...submitted, [exercise.id, true]]));

    // Check if all exercises are completed
    const allSubmitted = exercises.every(ex => submitted.get(ex.id) || ex.id === exercise.id);
    if (allSubmitted && !exercisesCompleted) {
      await completeExercises();
    }
  };

  const completeExercises = async () => {
    if (!userId || !chapter || exercisesCompleted) return;

    // Calculate score
    const totalExercises = exercises.length;
    const correctCount = Array.from(results.values()).filter(r => r.correct).length;
    const calculatedScore = totalExercises > 0 ? Math.round((correctCount / totalExercises) * 100) : 0;

    setScore(calculatedScore);

    // Update chapter progress with exercise score
    const updatedProgress: UserChapterProgress = {
      id: chapter.id,
      userId,
      chapterId: chapter.id,
      status: 'COMPLETED',
      completedAt: chapterProgress?.completedAt || new Date(),
      exerciseScore: calculatedScore,
      createdAt: chapterProgress?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    await updateUserChapterProgress(updatedProgress);
    setChapterProgress(updatedProgress);
    setExercisesCompleted(true);

    // Award XP based on score (5 XP minimum, 10 XP if perfect)
    const xpAward = calculatedScore >= 90 ? 10 : 5;
    await awardXP(userId, xpAward);
  };

  const handleNextChapter = () => {
    const isLastChapter = chapterNumber >= chapters.length;
    if (isLastChapter) {
      router.push('/dashboard');
    } else {
      router.push(`/stories/${storyId}/chapters/${chapterNumber + 1}`);
    }
  };

  const handlePreviousChapter = () => {
    router.push(`/stories/${storyId}/chapters/${chapterNumber}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercises...</p>
        </div>
      </div>
    );
  }

  if (!story || !chapter || exercises.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No exercises found for this chapter</p>
          <Link href={`/stories/${storyId}/chapters/${chapterNumber}`}>
            <Button variant="accent">← Back to Chapter</Button>
          </Link>
        </div>
      </div>
    );
  }

  const correctCount = Array.from(results.values()).filter(r => r.correct).length;
  const totalExercises = exercises.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <Link href={`/stories/${storyId}/chapters/${chapterNumber}`}>
              <Button variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </Link>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
              {story.level}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Chapter {chapterNumber} Exercises</h1>
          <p className="text-sm text-gray-600 mt-1">{story.title}</p>
          <p className="text-xs text-gray-500 mt-2 italic">Exercises are optional - you can skip them and continue to the next chapter</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Summary */}
        {exercisesCompleted && score !== null && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Exercises Complete!
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              You answered {correctCount} out of {totalExercises} correctly.
            </p>
            <p className="text-2xl font-bold text-purple-600 mb-4">
              Score: {score}%
            </p>
            {score >= 90 && (
              <p className="text-green-600 font-semibold mb-4">
                Perfect! You earned 10 XP!
              </p>
            )}
            {score >= 70 && score < 90 && (
              <p className="text-green-600 font-semibold mb-4">
                Great job! You earned 5 XP!
              </p>
            )}
            {score < 70 && (
              <p className="text-orange-600 font-semibold mb-4">
                Keep practicing! You earned 5 XP!
              </p>
            )}
          </div>
        )}

        {/* Exercises List */}
        <div className="space-y-6">
          {exercises.map((exercise, index) => {
            const isSubmitted = submitted.get(exercise.id);
            const result = results.get(exercise.id);
            const options = exerciseOptions.get(exercise.id) || [];

            return (
              <div key={exercise.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Exercise {index + 1}
                  </h3>
                  {isSubmitted && (
                    <div className={`flex items-center gap-2 ${
                      result?.correct ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result?.correct ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <XIcon className="w-5 h-5" />
                      )}
                      <span className="font-semibold">
                        {result?.correct ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4">{exercise.prompt}</p>
                <p className="text-base text-gray-900 mb-6">{exercise.questionText}</p>

                {exercise.type === 'MULTIPLE_CHOICE' && (
                  <div className="space-y-3 mb-4">
                    {options.map((option) => {
                      const isSelected = selectedOptions.get(exercise.id) === option.id;
                      const isCorrect = option.isCorrect;
                      const showAnswer = isSubmitted;

                      return (
                        <button
                          key={option.id}
                          onClick={() => {
                            if (!isSubmitted) {
                              setSelectedOptions(new Map([...selectedOptions, [exercise.id, option.id]]));
                            }
                          }}
                          disabled={isSubmitted}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? showAnswer && isCorrect
                                ? 'border-green-500 bg-green-50'
                                : showAnswer && !isCorrect
                                ? 'border-red-500 bg-red-50'
                                : 'border-purple-500 bg-purple-50'
                              : showAnswer && isCorrect
                              ? 'border-green-300 bg-green-50'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                          } ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 ${
                              isSelected
                                ? 'bg-purple-500 border-purple-500'
                                : 'border-gray-300'
                            }`} />
                            <span className="flex-1">{option.optionText}</span>
                            {showAnswer && isCorrect && (
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            )}
                            {showAnswer && !isCorrect && isSelected && (
                              <XIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {(exercise.type === 'GAP_FILL' || exercise.type === 'TRANSLATION_SIMPLE') && (
                  <div className="mb-4">
                    <input
                      type="text"
                      value={userAnswers.get(exercise.id) || ''}
                      onChange={(e) => {
                        if (!isSubmitted) {
                          setUserAnswers(new Map([...userAnswers, [exercise.id, e.target.value]]));
                        }
                      }}
                      disabled={isSubmitted}
                      placeholder="Type your answer..."
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        isSubmitted
                          ? result?.correct
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
                      } disabled:cursor-not-allowed`}
                    />
                    {isSubmitted && !result?.correct && (
                      <p className="mt-2 text-sm text-gray-600">
                        Correct answer: <span className="font-semibold">{exercise.correctAnswer}</span>
                      </p>
                    )}
                  </div>
                )}

                {!isSubmitted && (
                  <Button
                    onClick={() => handleSubmitExercise(exercise)}
                    disabled={exercise.type === 'MULTIPLE_CHOICE' && !selectedOptions.get(exercise.id)}
                    variant="accent"
                    className="w-full"
                  >
                    Submit Answer
                  </Button>
                )}

                {isSubmitted && result && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    result.correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    {result.feedback}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 bg-white rounded-xl shadow-lg p-6">
          <Button
            onClick={handlePreviousChapter}
            variant="secondary"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Chapter
          </Button>

          <div className="flex gap-3">
            <Button
              onClick={handleNextChapter}
              variant="accent"
            >
              {chapterNumber >= chapters.length ? 'Back to Dashboard' : 'Next Chapter'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

