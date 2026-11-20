import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Layers,
  XCircle,
} from 'lucide-react';
import { StandingQuestion } from '../data/standingData';
import { StandingTier, TIER_META } from '../utils/standingEngine';

interface StandingQuizProps {
  moduleNumber: number;
  moduleTitle: string;
  questions: StandingQuestion[];
  sessionAnswers: Record<string, number>;
  onSelectAnswer: (question: StandingQuestion, optionIndex: number) => void;
  onBackToRefresher: () => void;
  onExitToLanding: () => void;
  onCompleteQuiz: () => void;
}

const TIER_ORDER: StandingTier[] = ['foundation', 'application', 'analysis'];

export const StandingQuiz: React.FC<StandingQuizProps> = ({
  moduleNumber,
  moduleTitle,
  questions,
  sessionAnswers,
  onSelectAnswer,
  onBackToRefresher,
  onExitToLanding,
  onCompleteQuiz,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [transitionBannerTier, setTransitionBannerTier] = useState<StandingTier | null>(null);

  const currentQ = questions[currentIdx];
  const tierQuestions = useMemo(
    () => questions.filter((q) => q.tier === currentQ.tier),
    [questions, currentQ.tier]
  );
  const indexInTier = tierQuestions.findIndex((q) => q.id === currentQ.id);
  const tierMeta = TIER_META[currentQ.tier];

  const chosenOption = sessionAnswers[currentQ.id];
  const isAnswered = chosenOption !== undefined;
  const isCorrect = chosenOption === currentQ.correctIndex;

  const tierScoreSummary = useMemo(() => {
    const counts: Record<StandingTier, { correct: number; answered: number; total: number }> = {
      foundation: { correct: 0, answered: 0, total: 0 },
      application: { correct: 0, answered: 0, total: 0 },
      analysis: { correct: 0, answered: 0, total: 0 },
    };
    for (const q of questions) {
      counts[q.tier].total += 1;
      const ans = sessionAnswers[q.id];
      if (ans !== undefined) {
        counts[q.tier].answered += 1;
        if (ans === q.correctIndex) counts[q.tier].correct += 1;
      }
    }
    return counts;
  }, [questions, sessionAnswers]);

  const handleNext = () => {
    if (currentIdx >= questions.length - 1) {
      onCompleteQuiz();
      return;
    }
    const nextQ = questions[currentIdx + 1];
    if (nextQ.tier !== currentQ.tier) {
      setTransitionBannerTier(nextQ.tier);
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  const handleContinueAfterTransition = () => {
    setTransitionBannerTier(null);
    setCurrentIdx((i) => Math.min(questions.length - 1, i + 1));
  };

  const prevTierForTransition: StandingTier | null =
    transitionBannerTier === 'application'
      ? 'foundation'
      : transitionBannerTier === 'analysis'
      ? 'application'
      : null;

  return (
    <div className="space-y-5" data-testid="standing-quiz-view">
      {/* Top Diagnostic Header & Tier Progress Bar */}
      <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <button
              type="button"
              onClick={onExitToLanding}
              className="inline-flex items-center gap-1.5 font-semibold text-[#434038] hover:text-[#1C1B18] step-hinge whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Standing</span>
            </button>
            <span className="text-[#C5BEB0]" aria-hidden="true">/</span>
            <button
              type="button"
              onClick={onBackToRefresher}
              className="inline-flex items-center gap-1.5 font-semibold text-[#6B21A8] hover:underline whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Cheat Sheet</span>
            </button>
          </div>

          <div className="text-xs font-mono font-bold text-[#434038] tabular-nums">
            Module {moduleNumber} · Question {currentIdx + 1} of {questions.length}
          </div>
        </div>

        {/* 3-Tier Segmented Progress Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TIER_ORDER.map((tierKey) => {
            const meta = TIER_META[tierKey];
            const stats = tierScoreSummary[tierKey];
            const isActiveTier = !transitionBannerTier && currentQ.tier === tierKey;
            const pct = stats.total > 0 ? Math.round((stats.answered / stats.total) * 100) : 0;

            return (
              <div
                key={tierKey}
                className={`rounded-[4px] border p-3 space-y-2 transition-colors ${
                  isActiveTier
                    ? 'bg-[#F4EFE4] border-[#1C1B18]'
                    : 'bg-[#FAF7F0] border-[#C5BEB0]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs font-mono tabular-nums">
                  <span className="font-bold text-[#1C1B18] whitespace-nowrap">
                    {meta.label}
                  </span>
                  <span className="text-[#6E695D] font-semibold">
                    {stats.answered}/{stats.total}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#EAE4D7] rounded-[2px] overflow-hidden border border-[#C5BEB0]/70">
                  <div
                    className={`h-full ${meta.barClass} transition-all duration-200`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Quiz Stage or Tier Transition Interstitial */}
      <AnimatePresence mode="wait">
        {transitionBannerTier ? (
          <motion.div
            key={`transition-${transitionBannerTier}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-8 sm:p-10 text-center space-y-5 max-w-2xl mx-auto"
            data-testid="tier-transition-card"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-[4px] border border-[#1C1B18] bg-[#6B21A8]/10 text-[#6B21A8] mx-auto">
              <Layers className="w-6 h-6" aria-hidden="true" />
            </div>

            {prevTierForTransition && (
              <div className="text-xs font-mono font-bold text-[#434038] tabular-nums">
                {TIER_META[prevTierForTransition].label} Complete · Score:{' '}
                <span className="text-[#1C1B18]">
                  {tierScoreSummary[prevTierForTransition].correct}/
                  {tierScoreSummary[prevTierForTransition].total}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[#1C1B18]">
                Entering {TIER_META[transitionBannerTier].label}{' '}
                <span className="font-mono text-base text-[#6E695D]">
                  ({TIER_META[transitionBannerTier].stars})
                </span>
              </h2>
              <p className="text-sm text-[#434038]">
                {TIER_META[transitionBannerTier].subtitle} — 10 questions ahead for Module {moduleNumber}: {moduleTitle}.
              </p>
            </div>

            <button
              type="button"
              onClick={handleContinueAfterTransition}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-mono font-bold text-[#FAF7F0] bg-[#6B21A8] hover:bg-[#581C87] border border-[#1C1B18] rounded-[4px] step-hinge"
            >
              <span>Continue to {TIER_META[transitionBannerTier].shortLabel} →</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-6 sm:p-8 space-y-6"
            data-testid="standing-question-card"
          >
            {/* Tier & Question Meta Line (unboxed text with separators) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#C5BEB0]">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums">
                <span
                  className="w-2.5 h-2.5 rounded-[2px] border border-[#1C1B18] shrink-0"
                  style={{ backgroundColor: tierMeta.colorHex }}
                  aria-hidden="true"
                />
                <span className={`font-bold ${tierMeta.textClass}`}>
                  {tierMeta.label} {indexInTier + 1}/{tierQuestions.length}
                </span>
                <span className="text-[#6E695D]" aria-hidden="true">·</span>
                <span className="text-[#434038]">{tierMeta.subtitle}</span>
              </div>

              <span className="text-xs font-mono font-bold text-[#434038] tabular-nums">
                Difficulty {tierMeta.stars}
              </span>
            </div>

            {/* Question Prompt */}
            <h2 className="text-lg sm:text-xl font-display font-extrabold text-[#1C1B18] leading-snug">
              {currentQ.prompt}
            </h2>

            {currentQ.codeOrSchema && (
              <div className="font-mono text-xs sm:text-sm bg-[#26231E] border border-[#1C1B18] rounded-[4px] px-4 py-3 text-[#FAF7F0] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {currentQ.codeOrSchema}
              </div>
            )}

            {/* 4 Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, idx) => {
                const isSelected = chosenOption === idx;
                const isOptionCorrect = idx === currentQ.correctIndex;

                let stateClasses =
                  'bg-[#FAF7F0] border-[#C5BEB0] hover:border-[#1C1B18] hover:bg-[#F4EFE4] text-[#1C1B18]';
                if (isAnswered) {
                  if (isOptionCorrect) {
                    stateClasses =
                      'bg-emerald-500/15 border-emerald-700 text-[#1C1B18] font-semibold';
                  } else if (isSelected) {
                    stateClasses = 'bg-rose-500/15 border-rose-700 text-[#1C1B18]';
                  } else {
                    stateClasses = 'bg-[#FAF7F0] border-[#C5BEB0] text-[#6E695D]';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => onSelectAnswer(currentQ, idx)}
                    className={`w-full text-left p-4 rounded-[4px] border text-sm step-hinge flex items-start justify-between gap-3 disabled:cursor-default ${stateClasses}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs font-bold text-[#6E695D] mt-0.5 shrink-0">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <span className="leading-relaxed">{opt}</span>
                    </div>
                    {isAnswered && isOptionCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
                    )}
                    {isAnswered && isSelected && !isOptionCorrect && (
                      <XCircle className="w-5 h-5 text-rose-700 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Immediate Feedback Explanation */}
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16 }}
                className={`p-4 rounded-[4px] border space-y-1.5 ${
                  isCorrect
                    ? 'bg-emerald-500/10 border-emerald-700'
                    : 'bg-rose-500/10 border-rose-700'
                }`}
                data-testid="standing-feedback"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono font-bold">
                  <span className={isCorrect ? 'text-emerald-800' : 'text-rose-800'}>
                    {isCorrect
                      ? 'Correct — Diagnostic Point Earned'
                      : 'Incorrect — Logged to Weak Topics'}
                  </span>
                  <span className="text-[#434038] tabular-nums">
                    {tierMeta.shortLabel}: {tierScoreSummary[currentQ.tier].correct}/
                    {tierScoreSummary[currentQ.tier].answered}
                  </span>
                </div>
                <p className="text-sm text-[#2C2A25] leading-relaxed">
                  {currentQ.explanation}
                </p>
              </motion.div>
            )}

            {/* Footer Controls */}
            <div className="pt-4 border-t border-[#C5BEB0] flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                className="px-4 py-2 text-xs font-mono font-bold text-[#1C1B18] bg-[#FAF7F0] border border-[#1C1B18] hover:bg-[#EAE4D7] disabled:opacity-40 disabled:cursor-not-allowed rounded-[4px] step-hinge whitespace-nowrap shrink-0"
              >
                ← Previous
              </button>

              <button
                type="button"
                disabled={!isAnswered}
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-mono font-bold text-[#FAF7F0] bg-[#6B21A8] hover:bg-[#581C87] border border-[#1C1B18] disabled:opacity-40 disabled:cursor-not-allowed rounded-[4px] step-hinge whitespace-nowrap shrink-0"
              >
                <span>
                  {currentIdx >= questions.length - 1
                    ? 'View Results Dashboard →'
                    : questions[currentIdx + 1]?.tier !== currentQ.tier
                    ? `Finish ${tierMeta.shortLabel} →`
                    : 'Next Question →'}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
