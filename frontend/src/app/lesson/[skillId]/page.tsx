'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { X, Heart, Check, AlertCircle, Volume2, Clock } from 'lucide-react';
import { fetchSkillLesson, submitLessonResult, Lesson, Exercise } from '@/lib/api';
import { MascotOwl } from '@/components/MascotOwl';

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const skillId = Number(params.skillId);
  const isLegendary = searchParams.get('legendary') === 'true';

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [heartsLost, setHeartsLost] = useState(0);

  // Exercise State Management
  const [selectedOption, setSelectedOption] = useState<any>(null); // For Multiple Choice & Fill Blank
  const [selectedWords, setSelectedWords] = useState<string[]>([]); // For Translate / Word Bank
  const [wordBank, setWordBank] = useState<string[]>([]);
  const [typedAnswer, setTypedAnswer] = useState(''); // For Type Answer
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); // For Match Pairs
  const [selectedPairLeft, setSelectedPairLeft] = useState<string | null>(null);

  // Status & Feedback
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [isOutOfHearts, setIsOutOfHearts] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Timer for Legendary Mode
  const [timeLeft, setTimeLeft] = useState(60);

  // Load Lesson Data
  useEffect(() => {
    async function loadLesson() {
      try {
        const data = await fetchSkillLesson(skillId);
        setLesson(data);
        if (data.exercises.length > 0) {
          setupExercise(data.exercises[0]);
        }
      } catch (err) {
        console.error('Error fetching lesson:', err);
      }
    }
    loadLesson();
  }, [skillId]);

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

  const currentExercise: Exercise | undefined = lesson?.exercises[currentIndex];

  // Setup current exercise state variables
  const setupExercise = (ex: Exercise) => {
    setStatus('idle');
    setSelectedOption(null);
    setSelectedWords([]);
    setTypedAnswer('');
    setMatchedPairs([]);
    setSelectedPairLeft(null);

    if (ex.type === 'translate') {
      const bank = [...(ex.content.word_bank || [])].sort(() => Math.random() - 0.5);
      setWordBank(bank);
    }
  };

  // Handle checking answers
  const handleCheck = () => {
    if (!currentExercise) return;
    let isCorrect = false;

    if (currentExercise.type === 'multiple_choice') {
      isCorrect = selectedOption?.correct === true;
    } else if (currentExercise.type === 'translate') {
      const userSentence = selectedWords.join(' ').toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
      const targetSentence = currentExercise.content.correct_words.join(' ').toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
      isCorrect = userSentence === targetSentence;
    } else if (currentExercise.type === 'match_pairs') {
      const totalPairs = currentExercise.content.pairs.length;
      isCorrect = matchedPairs.length === totalPairs;
    } else if (currentExercise.type === 'fill_blank') {
      isCorrect = selectedOption === currentExercise.content.correct_word;
    } else if (currentExercise.type === 'type_answer') {
      const cleanUser = typedAnswer.trim().toLowerCase();
      const accepted = (currentExercise.content.accepted_answers || []).map((a: string) => a.trim().toLowerCase());
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

  // Continue to next exercise or finish
  const handleContinue = async () => {
    if (!lesson) return;

    if (currentIndex + 1 < lesson.exercises.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setupExercise(lesson.exercises[nextIdx]);
    } else {
      // Lesson Finished! Submit result to API
      setIsCompleted(true);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      try {
        const score = Math.round(((lesson.exercises.length - heartsLost) / lesson.exercises.length) * 100);
        await submitLessonResult(lesson.id, Math.max(0, score), heartsLost);
      } catch (err) {
        console.error('Error submitting lesson results:', err);
      }
    }
  };

  if (!lesson || !currentExercise) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-duo-dark space-y-4">
        <MascotOwl emotion="happy" className="animate-bounce" />
        <p className="font-extrabold text-xl text-duo-green">Preparing lesson...</p>
      </div>
    );
  }

  const progressPercent = ((currentIndex) / lesson.exercises.length) * 100;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white dark:bg-duo-dark text-gray-800 dark:text-gray-100">
      {/* Top Bar Navigation */}
      <header className="max-w-4xl mx-auto w-full px-4 pt-6 pb-4 flex items-center space-x-4">
        <button
          onClick={() => setShowQuitModal(true)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
        >
          <X className="w-7 h-7 stroke-[3]" />
        </button>

        {/* Progress Bar */}
        <div className="flex-1 bg-gray-200 dark:bg-duo-dark-border h-4 rounded-full overflow-hidden">
          <div
            style={{ width: `${progressPercent}%` }}
            className="bg-duo-green h-full transition-all duration-300 rounded-full"
          />
        </div>

        {/* Legendary Mode Timer or Hearts */}
        {isLegendary ? (
          <div className="flex items-center space-x-1.5 text-amber-500 font-black">
            <Clock className="w-6 h-6 animate-pulse" />
            <span>{timeLeft}s</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 text-duo-red font-black">
            <Heart className="w-6 h-6 fill-duo-red stroke-red-600 animate-heart-break" />
            <span>{hearts}</span>
          </div>
        )}
      </header>

      {/* Main Exercise Area */}
      <main className="max-w-2xl mx-auto w-full flex-1 px-4 py-8 flex flex-col justify-center">
        <h1 className="text-2xl sm:text-3xl font-black mb-8 text-gray-800 dark:text-white">
          {currentExercise.prompt}
        </h1>

        {/* 1. MULTIPLE CHOICE */}
        {currentExercise.type === 'multiple_choice' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {currentExercise.content.options.map((opt: any, idx: number) => {
              const isSelected = selectedOption?.text === opt.text;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(opt)}
                  disabled={status !== 'idle'}
                  className={`btn-duo p-6 flex flex-col items-center justify-center space-y-3 text-lg lowercase tracking-wide ${
                    isSelected ? 'btn-duo-blue' : 'btn-duo-gray'
                  }`}
                >
                  <span className="font-extrabold text-xl">{opt.text}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 2. TRANSLATE / WORD BANK */}
        {currentExercise.type === 'translate' && (
          <div className="space-y-8">
            <div className="p-4 bg-gray-50 dark:bg-duo-dark-card border-2 border-duo-gray dark:border-duo-dark-border rounded-2xl flex items-center space-x-3">
              <Volume2 className="w-6 h-6 text-duo-blue cursor-pointer" />
              <span className="text-xl font-bold text-gray-800 dark:text-white">
                "{currentExercise.content.source_text}"
              </span>
            </div>

            {/* Answer Row */}
            <div className="min-h-[70px] border-b-2 border-duo-gray dark:border-duo-dark-border p-2 flex flex-wrap gap-2.5 items-center">
              {selectedWords.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (status !== 'idle') return;
                    setSelectedWords(selectedWords.filter((_, i) => i !== idx));
                    setWordBank([...wordBank, word]);
                  }}
                  className="btn-duo btn-duo-gray px-4 py-2 text-base font-extrabold"
                >
                  {word}
                </button>
              ))}
            </div>

            {/* Word Bank */}
            <div className="flex flex-wrap gap-2.5 justify-center">
              {wordBank.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (status !== 'idle') return;
                    setSelectedWords([...selectedWords, word]);
                    setWordBank(wordBank.filter((_, i) => i !== idx));
                  }}
                  className="btn-duo btn-duo-gray px-4 py-2 text-base font-extrabold"
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
            {currentExercise.content.pairs.map((pair: any, idx: number) => {
              const isMatched = matchedPairs.includes(pair.left);
              const isSelectedLeft = selectedPairLeft === pair.left;

              return (
                <React.Fragment key={idx}>
                  {/* Left item */}
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

                  {/* Right item */}
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
              {currentExercise.content.sentence_parts[0]}
              <span className="underline decoration-duo-blue decoration-4 px-3 py-1 font-black text-duo-blue">
                {selectedOption || '____'}
              </span>
              {currentExercise.content.sentence_parts[1]}
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              {currentExercise.content.options.map((opt: string, idx: number) => (
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
                "{currentExercise.content.prompt_text}"
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

      {/* Bottom Drawer Bar */}
      <footer
        className={`p-6 border-t-2 transition-all ${
          status === 'correct'
            ? 'bg-green-100 dark:bg-green-950/80 border-duo-green'
            : status === 'incorrect'
            ? 'bg-red-100 dark:bg-red-950/80 border-duo-red'
            : 'bg-white dark:bg-duo-dark border-duo-gray dark:border-duo-dark-border'
        }`}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {status === 'correct' ? (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-duo-green flex items-center justify-center">
                <Check className="w-8 h-8 text-white stroke-[4]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-duo-green">Nice job!</h3>
              </div>
            </div>
          ) : status === 'incorrect' ? (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-duo-red flex items-center justify-center">
                <X className="w-8 h-8 text-white stroke-[4]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-duo-red">Correct answer:</h3>
                <p className="font-bold text-gray-700 dark:text-gray-200">
                  {currentExercise.type === 'multiple_choice'
                    ? currentExercise.content.options.find((o: any) => o.correct)?.text
                    : currentExercise.type === 'translate'
                    ? currentExercise.content.correct_words.join(' ')
                    : currentExercise.type === 'fill_blank'
                    ? currentExercise.content.correct_word
                    : currentExercise.content.accepted_answers[0]}
                </p>
              </div>
            </div>
          ) : (
            <div />
          )}

          {status === 'idle' ? (
            <button
              onClick={handleCheck}
              className="btn-duo btn-duo-green px-10 py-3 text-lg"
            >
              CHECK
            </button>
          ) : (
            <button
              onClick={handleContinue}
              className={`btn-duo px-10 py-3 text-lg ${
                status === 'correct' ? 'btn-duo-green' : 'btn-duo-red'
              }`}
            >
              CONTINUE
            </button>
          )}
        </div>
      </footer>

      {/* Out of Hearts Modal */}
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
                REFILL HEARTS & CONTINUE
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

      {/* Lesson Complete Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-duo-dark-card border-4 border-duo-gold rounded-3xl max-w-md w-full p-6 text-center shadow-2xl space-y-5">
            <MascotOwl emotion="celebrating" width={130} height={130} className="mx-auto" />
            <h2 className="text-3xl font-black text-duo-gold">Lesson Complete!</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-duo-gold rounded-2xl">
                <span className="block text-xs font-black text-amber-700 uppercase">TOTAL XP</span>
                <span className="text-2xl font-black text-duo-gold">+{isLegendary ? 20 : 10} XP</span>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950/40 border-2 border-duo-green rounded-2xl">
                <span className="block text-xs font-black text-duo-green uppercase">ACCURACY</span>
                <span className="text-2xl font-black text-duo-green">
                  {Math.round(((lesson.exercises.length - heartsLost) / lesson.exercises.length) * 100)}%
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="w-full btn-duo btn-duo-green py-3 text-xl"
            >
              GREAT!
            </button>
          </div>
        </div>
      )}

      {/* Quit Confirmation Modal */}
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
