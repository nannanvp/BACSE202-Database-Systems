import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Dices,
  Eye,
  Flame,
  RotateCcw,
  Target,
  XCircle,
} from 'lucide-react';
import {
  DRILL_CATEGORIES,
  DrillCategory,
  DrillGradeResult,
  generateNumericalProblem,
  gradeDrillAnswer,
} from '../utils/numericalDrillEngine';
import { LabId } from './InteractiveLabsView';

interface NumericalDrillLabProps {
  solvedCount: number;
  bestStreak: number;
  onRecordResult: (correct: boolean) => void;
  onResetDrillStats: () => void;
  onJumpToLab: (lab: LabId) => void;
}

const MODULE_COLORS: Record<'m1' | 'm2' | 'm3' | 'm4' | 'm5', { hex: string; ink: string }> = {
  m1: { hex: '#E5B82E', ink: '#1C1B18' },
  m2: { hex: '#E06D2B', ink: '#1C1B18' },
  m3: { hex: '#4F8A3D', ink: '#FAF7F0' },
  m4: { hex: '#147E7B', ink: '#FAF7F0' },
  m5: { hex: '#22559C', ink: '#FAF7F0' },
};

export const NumericalDrillLab: React.FC<NumericalDrillLabProps> = ({
  solvedCount,
  bestStreak,
  onRecordResult,
  onResetDrillStats,
  onJumpToLab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<DrillCategory | 'mix'>('mix');
  const [seed, setSeed] = useState<number>(1);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [grade, setGrade] = useState<DrillGradeResult | null>(null);
  const [hasRecordedCurrent, setHasRecordedCurrent] = useState<boolean>(false);
  const [showRubric, setShowRubric] = useState<boolean>(false);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const activeCategory: DrillCategory = useMemo(() => {
    if (selectedCategory !== 'mix') return selectedCategory;
    return DRILL_CATEGORIES[(seed - 1) % DRILL_CATEGORIES.length].id;
  }, [selectedCategory, seed]);

  const problem = useMemo(
    () => generateNumericalProblem(activeCategory, seed),
    [activeCategory, seed]
  );

  // Per-problem pacing timer (pauses once graded)
  useEffect(() => {
    if (grade !== null) return;
    const id = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [grade, seed, activeCategory]);

  const loadProblem = (nextCat: DrillCategory | 'mix', nextSeed: number) => {
    setSelectedCategory(nextCat);
    setSeed(nextSeed);
    setUserAnswer('');
    setGrade(null);
    setHasRecordedCurrent(false);
    setShowRubric(false);
    setElapsedSeconds(0);
  };

  const handleGrade = (overrideInput?: string) => {
    const answerToCheck = overrideInput !== undefined ? overrideInput : userAnswer;
    const res = gradeDrillAnswer(problem, answerToCheck);
    setGrade(res);
    setShowRubric(true);

    if (!hasRecordedCurrent && answerToCheck.trim().length > 0) {
      setHasRecordedCurrent(true);
      onRecordResult(res.correct);
      setCurrentStreak((prev) => (res.correct ? prev + 1 : 0));
    }
  };

  const handleNextProblem = () => {
    loadProblem(selectedCategory, seed + 1);
  };

  const modColor = MODULE_COLORS[problem.moduleId];
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const overBudget = elapsedSeconds > problem.targetSeconds;

  return (
    <div data-testid="numerical-drill-lab" className="space-y-5">
      {/* Header & Scoreboard */}
      <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#1C1B18] tracking-tight">
            95+ Unlimited FAT Numerical Drill Arena
          </h2>
          <p className="text-xs font-mono text-[#6E695D]">
            FRESH PROCEDURAL EXAM NUMERICALS · 60/100 DETERMINISTIC MARKS (NF, INDEX I/O, B+ BOUNDS, SERIALIZABILITY, WAL, SEMIJOIN)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div
            data-testid="drill-solved-counter"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px] font-mono text-xs font-bold text-[#1C1B18] tabular-nums"
          >
            <Target className="w-3.5 h-3.5 text-[#4F8A3D]" aria-hidden="true" />
            <span>Solved: {solvedCount}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px] font-mono text-xs font-bold text-[#1C1B18] tabular-nums">
            <Flame className="w-3.5 h-3.5 text-[#E06D2B]" aria-hidden="true" />
            <span>Streak: {currentStreak} (Best {Math.max(bestStreak, currentStreak)})</span>
          </div>
          {solvedCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setCurrentStreak(0);
                onResetDrillStats();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono text-[#434038] hover:text-[#1C1B18] bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] step-hinge"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Strip */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => loadProblem('mix', seed + 1)}
          className={`px-2.5 py-1.5 text-xs font-mono font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
            selectedCategory === 'mix'
              ? 'bg-[#E5B82E] text-[#1C1B18]'
              : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
          }`}
        >
          All 6 Mix
        </button>
        {DRILL_CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => loadProblem(cat.id, seed + 1)}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                active
                  ? 'bg-[#E5B82E] text-[#1C1B18]'
                  : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
              }`}
            >
              <span className="font-mono opacity-75 mr-1">{cat.moduleLabel}</span>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Main Drill Card */}
      <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] overflow-hidden">
        {/* Card Header Bar */}
        <div className="px-5 py-3 bg-[#EAE4D7] border-b border-[#1C1B18] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              style={{ backgroundColor: modColor.hex, color: modColor.ink }}
              className="px-2 py-0.5 text-[11px] font-mono font-bold rounded-[2px] border border-[#1C1B18]"
            >
              {problem.moduleLabel}
            </span>
            <span className="font-mono text-xs font-bold text-[#1C1B18]">
              {problem.fatTag}
            </span>
            <span className="font-mono text-[11px] text-[#6E695D] tabular-nums">
              · Variant #{problem.seed}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] border border-[#1C1B18] font-mono text-xs font-bold tabular-nums ${
                overBudget
                  ? 'bg-[#A62B2B] text-[#FAF7F0]'
                  : 'bg-[#FAF7F0] text-[#1C1B18]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')} /{' '}
                {Math.floor(problem.targetSeconds / 60)}:
                {String(problem.targetSeconds % 60).padStart(2, '0')} target
              </span>
            </span>
            <button
              type="button"
              data-testid="next-drill-problem"
              onClick={handleNextProblem}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold bg-[#E5B82E] hover:bg-[#d8aa22] text-[#1C1B18] border border-[#1C1B18] rounded-[4px] step-hinge"
            >
              <Dices className="w-3.5 h-3.5" aria-hidden="true" />
              <span>New Problem</span>
            </button>
          </div>
        </div>

        {/* Problem Body */}
        <div className="p-5 sm:p-6 space-y-5">
          <div className="space-y-1.5">
            <h3 data-testid="drill-problem-title" className="text-base sm:text-lg font-extrabold text-[#1C1B18]">
              {problem.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#434038] leading-relaxed">{problem.prompt}</p>
          </div>

          <pre
            data-testid="drill-given-block"
            className="bg-[#1C1B18] text-[#FAF7F0] rounded-[4px] p-4 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap"
          >
            {problem.givenBlock}
          </pre>

          <div className="space-y-3 pt-1">
            <div className="text-sm font-bold text-[#1C1B18]">{problem.questionLine}</div>

            {problem.inputKind === 'choice' && problem.choices ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {problem.choices.map((choice) => {
                  const isSelected = userAnswer === choice;
                  const isCorrectChoice = grade !== null && choice === problem.expectedAnswer;
                  const isWrongPick = grade !== null && isSelected && !grade.correct;
                  return (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => {
                        setUserAnswer(choice);
                        if (grade === null) {
                          handleGrade(choice);
                        }
                      }}
                      className={`px-4 py-3 text-left text-xs sm:text-sm font-mono font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                        isCorrectChoice
                          ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                          : isWrongPick
                          ? 'bg-[#A62B2B] text-[#FAF7F0]'
                          : isSelected
                          ? 'bg-[#E5B82E] text-[#1C1B18]'
                          : 'bg-[#F4EFE4] hover:bg-[#EAE4D7] text-[#1C1B18]'
                      }`}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleGrade();
                }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
              >
                <label htmlFor="drill-answer-input" className="sr-only">
                  Your answer
                </label>
                <input
                  id="drill-answer-input"
                  data-testid="drill-answer-input"
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder={problem.unitHint ? `Enter ${problem.unitHint}` : 'Enter your answer'}
                  className="flex-1 h-11 px-3.5 text-sm font-mono bg-[#FFFFFF] border border-[#1C1B18] rounded-[4px] text-[#1C1B18]"
                />
                <button
                  type="submit"
                  data-testid="grade-drill-btn"
                  className="px-5 h-11 text-xs font-mono font-extrabold uppercase tracking-wider bg-[#E5B82E] hover:bg-[#d8aa22] text-[#1C1B18] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap"
                >
                  Check My Answer
                </button>
              </form>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowRubric((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#434038] hover:text-[#1C1B18] underline underline-offset-4"
              >
                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{showRubric ? 'Hide 10M Marking Scheme' : 'Peek 10M Marking Scheme'}</span>
              </button>

              <button
                type="button"
                onClick={() => onJumpToLab(problem.matchingLab)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-[#1C1B18] bg-[#F4EFE4] hover:bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px] step-hinge"
              >
                <span>Open Matching Visual Simulator</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Grading Verdict Banner */}
          {grade && (
            <div
              data-testid="drill-verdict"
              className={`border border-[#1C1B18] rounded-[4px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                grade.correct
                  ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                  : 'bg-[#A62B2B] text-[#FAF7F0]'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {grade.correct ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                ) : (
                  <XCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                )}
                <div className="space-y-0.5">
                  <div className="text-sm font-extrabold">
                    {grade.correct ? 'FULL MARKS — EXACT MATCH' : 'CHECK STEPS — RETRY OR NEXT VARIANT'}
                  </div>
                  <p className="text-xs opacity-95 leading-relaxed">{grade.feedback}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextProblem}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-extrabold bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#E5B82E] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap self-start sm:self-auto shrink-0"
              >
                <span>Next Problem</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Step-by-Step 10-Mark FAT Rubric Solution */}
          {showRubric && (
            <div
              data-testid="drill-rubric"
              className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-4 space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C5BEB0] pb-2">
                <h4 className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#1C1B18]">
                  VIT FAT 10-Mark Answer Booklet Breakdown
                </h4>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-[#E5B82E] text-[#1C1B18] border border-[#1C1B18] rounded-[2px]">
                  Answer: {problem.expectedAnswer}
                </span>
              </div>
              <ol className="space-y-1.5 text-xs font-mono text-[#1C1B18] leading-relaxed">
                {problem.rubricSteps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
