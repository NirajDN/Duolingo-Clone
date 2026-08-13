'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { X, Heart, Check, Volume2, Clock, RefreshCw, Flame, Unlock, Zap } from 'lucide-react';
import { fetchSkillLesson, resolveSkillLesson, submitLessonResult, Lesson, Exercise, LessonCompletionResult } from '@/lib/api';
import { MascotOwl } from '@/components/MascotOwl';
import { AnimatedCounter } from '@/components/AnimatedCounter';

interface Option {
  text: string;
  correct: boolean;
  image?: string;
}

interface Pair {
  left: string;
  right: string;
}

function buildWordBank(exercise?: Exercise): string[] {
  if (exercise?.type === 'translate') {
    return [...((exercise.content.word_bank as string[]) || [])].sort(() => Math.random() - 0.5);
  }
  return [];
}

function createLessonState(skillId: number) {
  const lesson = resolveSkillLesson(skillId);
  return {
    lesson,
    wordBank: buildWordBank(lesson?.exercises[0]),
  };
}

const OPTION_EMOJI: Record<string, string> = {
  boy: '👦',
  girl: '👧',
  man: '👨',
  woman: '👩',
  water: '💧',
  apple: '🍎',
};

function exerciseCanCheck(
  exercise: Exercise,
  selectedOption: Option | string | null,
  selectedWords: string[],
  typedAnswer: string,
  matchedPairs: string[],
): boolean {
  switch (exercise.type) {
    case 'multiple_choice':
      return selectedOption !== null;
    case 'translate':
      return selectedWords.length > 0;
    case 'match_pairs':
      return matchedPairs.length === ((exercise.content.pairs as Pair[]) || []).length;
    case 'fill_blank':
      return selectedOption !== null;
    case 'type_answer':
      return typedAnswer.trim().length > 0;
    default:
      return false;
  }
}

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const skillId = Number(params.skillId);
  const isLegendary = searchParams.get('legendary') === 'true';

  const [initial] = useState(() => createLessonState(skillId));
  const [lesson, setLesson] = useState<Lesson | null>(initial.lesson);
  const [loadError, setLoadError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [heartsLost, setHeartsLost] = useState(0);

  // Exercise State Management
  const [selectedOption, setSelectedOption] = useState<Option | string | null>(null);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [wordBank, setWordBank] = useState<string[]>(initial.wordBank);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [selectedPairLeft, setSelectedPairLeft] = useState<string | null>(null);

  // Status & Feedback
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [isOutOfHearts, setIsOutOfHearts] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionResult, setCompletionResult] = useState<LessonCompletionResult | null>(null);
  const [submittingResult, setSubmittingResult] = useState(false);

  // Timer for Legendary Mode
  const [timeLeft, setTimeLeft] = useState(60);

  const currentExercise: Exercise | undefined = lesson?.exercises[currentIndex];

  const setupExercise = (ex: Exercise) => {
    setStatus('idle');
    setSelectedOption(null);
    setSelectedWords([]);
    setTypedAnswer('');
    setMatchedPairs([]);
    setSelectedPairLeft(null);

    if (ex.type === 'translate') {
      const bank = [...((ex.content.word_bank as string[]) || [])].sort(() => Math.random() - 0.5);
      setWordBank(bank);
    }
  };

  // Sync from network in background; only block UI when nothing is cached yet
  useEffect(() => {
    let cancelled = false;
    const hadInitialLesson = Boolean(initial.lesson?.exercises.length);

    async function syncLesson() {
      if (!hadInitialLesson) setLoadError('');
      try {
        const data = await fetchSkillLesson(skillId);
        if (cancelled) return;
        setLesson(data);
        if (!hadInitialLesson && data.exercises.length > 0) {
          setupExercise(data.exercises[0]);
        }
      } catch (err) {
        console.error('Error fetching lesson:', err);
        if (!hadInitialLesson && !cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load lesson.');
        }
      }
    }

    syncLesson();
    return () => {
      cancelled = true;
    };
  }, [skillId, initial.lesson]);

  // Legendary Mode Timer
  useEffect(() => {
    if (!isLegendary || isCompleted || isOutOfHearts) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsOutOfHearts(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLegendary, isCompleted, isOutOfHearts]);

  const handleCheck = () => {
    if (!currentExercise) return;
    let isCorrect = false;

    if (currentExercise.type === 'multiple_choice') {
      isCorrect = (selectedOption as Option)?.correct === true;
    } else if (currentExercise.type === 'translate') {
      const userSentence = selectedWords.join(' ').toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
      const targetSentence = ((currentExercise.content.correct_words as string[]) || []).join(' ').toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
      isCorrect = userSentence === targetSentence;
    } else if (currentExercise.type === 'match_pairs') {
      const totalPairs = ((currentExercise.content.pairs as Pair[]) || []).length;
      isCorrect = matchedPairs.length === totalPairs;
    } else if (currentExercise.type === 'fill_blank') {
      isCorrect = selectedOption === currentExercise.content.correct_word;
    } else if (currentExercise.type === 'type_answer') {
      const cleanUser = typedAnswer.trim().toLowerCase();
      const accepted = ((currentExercise.content.accepted_answers as string[]) || []).map((a: string) => a.trim().toLowerCase());
      isCorrect = accepted.includes(cleanUser);
    }

    if (isCorrect) {
      setStatus('correct');
    } else {
      setStatus('incorrect');
      const newHearts = Math.max(0, hearts - 1);
      setHearts(newHearts);
      setHeartsLost((prev) => prev + 1);

      if (newHearts === 0) {
        setIsOutOfHearts(true);
      }
    }
  };

  const handleContinue = async () => {
    if (!lesson) return;

    if (currentIndex + 1 < lesson.exercises.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setupExercise(lesson.exercises[nextIdx]);
    } else {
      setIsCompleted(true);
      setSubmittingResult(true);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      const score = Math.round(((lesson.exercises.length - heartsLost) / lesson.exercises.length) * 100);
      submitLessonResult(lesson.id, Math.max(0, score), heartsLost, skillId)
        .then((result) => setCompletionResult(result))
        .catch((err) => console.error('Error submitting lesson results:', err))
        .finally(() => setSubmittingResult(false));
    }
  };

  if (loadError && !lesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-duo-dark space-y-4 px-6 text-center">
        <MascotOwl emotion="sad" width={90} height={90} />
        <p className="font-extrabold text-lg text-gray-700 dark:text-gray-200">{loadError}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-duo btn-duo-green px-6 py-3 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (!lesson || !currentExercise) {
    return (
      <div className="min-h-screen flex flex-col bg-duo-dark">
        <header className="max-w-4xl mx-auto w-full px-4 pt-5 pb-3">
          <div className="bg-duo-dark-border h-3 rounded-full overflow-hidden animate-pulse" />
        </header>
        <main className="max-w-2xl mx-auto w-full flex-1 px-4 py-8 space-y-6 animate-pulse">
          <div className="h-6 bg-duo-dark-border rounded-lg w-1/4" />
          <div className="h-8 bg-duo-dark-border rounded-xl w-3/4" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-28 bg-duo-dark-card border-2 border-duo-dark-border rounded-2xl" />
            <div className="h-28 bg-duo-dark-card border-2 border-duo-dark-border rounded-2xl" />
            <div className="h-28 bg-duo-dark-card border-2 border-duo-dark-border rounded-2xl" />
            <div className="h-28 bg-duo-dark-card border-2 border-duo-dark-border rounded-2xl" />
          </div>
        </main>
        <footer className="p-5 border-t-2 border-duo-dark-border bg-duo-dark-card">
          <p className="text-center font-extrabold text-duo-green text-sm">Preparing lesson...</p>
        </footer>
      </div>
    );
  }

  const progressPercent = ((currentIndex + 1) / lesson.exercises.length) * 100;
  const canCheck = exerciseCanCheck(
    currentExercise,
    selectedOption,
    selectedWords,
    typedAnswer,
    matchedPairs,
  );
  const accuracyPercent = Math.round(
    ((lesson.exercises.length - heartsLost) / lesson.exercises.length) * 100
  );

  return (
    <div className="min-h-screen flex flex-col justify-between bg-duo-dark text-gray-100">
      <header className="max-w-4xl mx-auto w-full px-4 pt-5 pb-3 flex items-center gap-3">
        <button
          onClick={() => setShowQuitModal(true)}
          className="text-duo-dark-border hover:text-white transition-colors p-1"
        >
          <X className="w-7 h-7 stroke-[3]" />
        </button>

        <div className="flex-1 bg-duo-dark-border h-3 rounded-full overflow-hidden">
          <div
            style={{ width: `${progressPercent}%` }}
            className="bg-duo-green h-full transition-all duration-300 rounded-full"
          />
        </div>

        {isLegendary ? (
          <div className="flex items-center gap-1.5 text-duo-gold font-black text-sm">
            <Clock className="w-5 h-5" />
            <span>{timeLeft}s</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-duo-red font-black">
            <Heart className="w-6 h-6 fill-duo-red stroke-red-600" />
            <span>{hearts}</span>
          </div>
        )}
      </header>

      <main className="max-w-2xl mx-auto w-full flex-1 px-4 py-6 flex flex-col">
        {currentExercise.type === 'multiple_choice' && (
          <span className="duo-badge-new w-fit mb-3">New word</span>
        )}

        <h1 className="text-xl sm:text-2xl font-black mb-6 text-white leading-snug">
          {currentExercise.prompt}
        </h1>

        {/* 1. MULTIPLE CHOICE */}
        {currentExercise.type === 'multiple_choice' && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-1 content-start">
            {((currentExercise.content.options as Option[]) || []).map((opt: Option, idx: number) => {
              const isSelected = (selectedOption as Option)?.text === opt.text;
              const emoji = opt.image ? OPTION_EMOJI[opt.image] : '📝';
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(opt)}
                  disabled={status !== 'idle'}
                  className={`duo-option-card p-4 sm:p-5 flex flex-col items-center justify-center gap-2 min-h-[120px] ${
                    isSelected ? 'duo-option-card-selected' : ''
                  }`}
                >
                  <span className="text-4xl">{emoji}</span>
                  <span className="font-extrabold text-sm sm:text-base text-center">{opt.text}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 2. TRANSLATE / WORD BANK */}
        {currentExercise.type === 'translate' && (
          <div className="space-y-6 flex-1">
            <div className="flex items-start gap-3">
              <MascotOwl emotion="happy" width={72} height={72} className="shrink-0" />
              <div className="duo-speech-bubble flex-1 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-duo-blue shrink-0 cursor-pointer" />
                <span className="text-lg font-bold text-white">
                  {currentExercise.content.source_text as string}
                </span>
              </div>
            </div>

            <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Tap the answer</p>

            <div className="min-h-[56px] border-b-2 border-duo-dark-border pb-3 flex flex-wrap gap-2 items-center">
              {selectedWords.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (status !== 'idle') return;
                    setSelectedWords(selectedWords.filter((_, i) => i !== idx));
                    setWordBank([...wordBank, word]);
                  }}
                  className="duo-word-chip"
                >
                  {word}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {wordBank.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (status !== 'idle') return;
                    setSelectedWords([...selectedWords, word]);
                    setWordBank(wordBank.filter((_, i) => i !== idx));
                  }}
                  className="duo-word-chip"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. MATCH PAIRS */}
        {currentExercise.type === 'match_pairs' && (
          <div className="grid grid-cols-2 gap-4">
            {((currentExercise.content.pairs as Pair[]) || []).map((pair: Pair, idx: number) => {
              const isMatched = matchedPairs.includes(pair.left);
              const isSelectedLeft = selectedPairLeft === pair.left;

              return (
                <React.Fragment key={idx}>
                  <button
                    onClick={() => {
                      if (isMatched || status !== 'idle') return;
                      setSelectedPairLeft(pair.left);
                    }}
                    disabled={isMatched}
                    className={`btn-duo py-4 text-base ${
                      isMatched ? 'bg-green-100 border-duo-green text-duo-green opacity-60' : isSelectedLeft ? 'btn-duo-blue' : 'btn-duo-gray'
                    }`}
                  >
                    {pair.left}
                  </button>

                  <button
                    onClick={() => {
                      if (isMatched || status !== 'idle' || !selectedPairLeft) return;
                      if (selectedPairLeft === pair.left) {
                        setMatchedPairs([...matchedPairs, pair.left]);
                        setSelectedPairLeft(null);
                      } else {
                        setSelectedPairLeft(null);
                      }
                    }}
                    disabled={isMatched}
                    className={`btn-duo py-4 text-base ${
                      isMatched ? 'bg-green-100 border-duo-green text-duo-green opacity-60' : 'btn-duo-gray'
                    }`}
                  >
                    {pair.right}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* 4. FILL IN THE BLANK */}
        {currentExercise.type === 'fill_blank' && (
          <div className="space-y-8 text-center">
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {((currentExercise.content.sentence_parts as string[]) || [])[0]}
              <span className="underline decoration-duo-blue decoration-4 px-3 py-1 font-black text-duo-blue">
                {(selectedOption as string) || '____'}
              </span>
              {((currentExercise.content.sentence_parts as string[]) || [])[1]}
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              {((currentExercise.content.options as string[]) || []).map((opt: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(opt)}
                  disabled={status !== 'idle'}
                  className={`btn-duo px-6 py-3 text-lg ${
                    selectedOption === opt ? 'btn-duo-blue' : 'btn-duo-gray'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. TYPE THE ANSWER */}
        {currentExercise.type === 'type_answer' && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-duo-dark-card border-2 border-duo-gray dark:border-duo-dark-border rounded-2xl">
              <span className="text-xl font-bold text-gray-800 dark:text-white">
                &quot;{currentExercise.content.prompt_text as string}&quot;
              </span>
            </div>

            <textarea
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              disabled={status !== 'idle'}
              placeholder="Type in English..."
              className="w-full p-4 rounded-2xl border-2 border-duo-gray dark:border-duo-dark-border dark:bg-duo-dark-card font-extrabold text-lg focus:border-duo-blue outline-none resize-none"
              rows={3}
            />
          </div>
        )}
      </main>

      <footer
        className={`p-4 sm:p-5 border-t-2 transition-all ${
          status === 'correct'
            ? 'duo-lesson-footer-correct'
            : status === 'incorrect'
            ? 'duo-lesson-footer-incorrect'
            : 'bg-duo-dark-card border-duo-dark-border'
        }`}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          {status === 'correct' ? (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-duo-green flex items-center justify-center shrink-0">
                <Check className="w-7 h-7 text-white stroke-[4]" />
              </div>
              <h3 className="text-xl font-black text-[#58A700]">Correct!</h3>
            </div>
          ) : status === 'incorrect' ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full bg-duo-red flex items-center justify-center shrink-0">
                <X className="w-7 h-7 text-white stroke-[4]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-black text-duo-red">Correct answer:</h3>
                <p className="font-bold text-gray-800 truncate">
                  {currentExercise.type === 'multiple_choice'
                    ? ((currentExercise.content.options as Option[]) || []).find((o: Option) => o.correct)?.text
                    : currentExercise.type === 'translate'
                    ? ((currentExercise.content.correct_words as string[]) || []).join(' ')
                    : currentExercise.type === 'fill_blank'
                    ? (currentExercise.content.correct_word as string)
                    : ((currentExercise.content.accepted_answers as string[]) || [])[0]}
                </p>
              </div>
            </div>
          ) : (
            <div />
          )}

          {status === 'idle' ? (
            <button
              onClick={handleCheck}
              disabled={!canCheck}
              className={`btn-duo px-8 sm:px-12 py-3 text-base sm:text-lg w-full sm:w-auto max-w-xs ${
                canCheck ? 'btn-duo-green' : 'btn-duo-disabled'
              }`}
            >
              CHECK
            </button>
          ) : (
            <button
              onClick={handleContinue}
              className={`btn-duo px-8 sm:px-12 py-3 text-base sm:text-lg w-full sm:w-auto max-w-xs ${
                status === 'correct' ? 'btn-duo-green' : 'btn-duo-red'
              }`}
            >
              CONTINUE
            </button>
          )}
        </div>
      </footer>

      {isOutOfHearts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-duo-dark-card border-4 border-duo-red rounded-3xl max-w-md w-full p-6 text-center shadow-2xl space-y-4">
            <MascotOwl emotion="sad" width={110} height={110} className="mx-auto" />
            <h2 className="text-3xl font-black text-duo-red">Out of Hearts!</h2>
            <p className="font-bold text-gray-600 dark:text-gray-300">
              You ran out of hearts in this lesson. Refill your hearts to keep practicing or return home!
            </p>
            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  setHearts(5);
                  setIsOutOfHearts(false);
                }}
                className="w-full btn-duo btn-duo-green py-3 text-lg"
              >
                REFILL HEARTS &amp; CONTINUE
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full btn-duo btn-duo-gray py-3 text-base"
              >
                BACK TO PATH
              </button>
            </div>
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="fixed inset-0 z-50 flex flex-col bg-duo-dark animate-fade-in overflow-y-auto">
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center space-y-6">
            <MascotOwl emotion="celebrating" width={140} height={140} />
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-duo-gold mb-2">
                {accuracyPercent === 100 ? 'Perfect lesson!' : 'Lesson complete!'}
              </h2>
              <p className="font-bold text-gray-400 text-sm sm:text-base">
                {accuracyPercent === 100
                  ? 'You made no mistakes in this lesson'
                  : 'Great work — keep your streak going!'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full max-w-md">
              <div className="duo-stat-pill duo-stat-pill-xp">
                <span className="block text-[10px] font-black uppercase tracking-wide opacity-80">Total XP</span>
                <span className="text-xl sm:text-2xl font-black flex items-center justify-center gap-1">
                  <Zap className="w-5 h-5 fill-current" />
                  {completionResult ? (
                    <AnimatedCounter value={completionResult.xp_gained} />
                  ) : (
                    lesson.xp_reward || 10
                  )}
                </span>
              </div>
              <div className="duo-stat-pill duo-stat-pill-accuracy">
                <span className="block text-[10px] font-black uppercase tracking-wide opacity-80">Accuracy</span>
                <span className="text-xl sm:text-2xl font-black">{accuracyPercent}%</span>
              </div>
              <div className="duo-stat-pill duo-stat-pill-streak">
                <span className="block text-[10px] font-black uppercase tracking-wide opacity-80">Streak</span>
                <span className="text-xl sm:text-2xl font-black flex items-center justify-center gap-1">
                  <Flame className="w-5 h-5 fill-current" />
                  {completionResult?.streak ?? '—'}
                </span>
              </div>
            </div>

            {completionResult?.next_skill_unlocked_id && (
              <div className="flex items-center justify-center gap-2 py-2 px-4 bg-duo-dark-card border-2 border-duo-green rounded-2xl">
                <Unlock className="w-5 h-5 text-duo-green" />
                <span className="font-black text-duo-green text-sm">Next lesson unlocked!</span>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6 border-t-2 border-duo-dark-border bg-duo-dark-card">
            <button
              onClick={() => router.push('/')}
              disabled={submittingResult}
              className="w-full max-w-lg mx-auto block btn-duo btn-duo-blue py-3.5 text-lg disabled:opacity-70"
            >
              {submittingResult ? 'Saving progress...' : 'CONTINUE'}
            </button>
          </div>
        </div>
      )}

      {showQuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-duo-dark-card border-4 border-duo-gray rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <h2 className="text-2xl font-black text-gray-800 dark:text-white">Are you sure you want to quit?</h2>
            <p className="font-bold text-gray-600 dark:text-gray-300 text-sm">
              All progress in this lesson will be lost.
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => router.push('/')}
                className="w-full btn-duo btn-duo-red py-2.5 text-base"
              >
                QUIT LESSON
              </button>
              <button
                onClick={() => setShowQuitModal(false)}
                className="w-full btn-duo btn-duo-gray py-2.5 text-base"
              >
                KEEP LEARNING
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
