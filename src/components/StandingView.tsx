import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Gauge,
  RotateCcw,
} from 'lucide-react';
import { MODULES } from '../data/bacse202Data';
import {
  getModuleRefresher,
  getModuleStandingQuestions,
  StandingQuestion,
} from '../data/standingData';
import {
  calculateAggregateStanding,
  calculateModuleStanding,
  getStandingGrade,
  ModuleId,
  ModuleStandingScore,
  StandingScoresMap,
  TIER_META,
  WeakTopicEntry,
} from '../utils/standingEngine';
import { RadarChart } from './RadarChart';
import { StandingRefresher } from './StandingRefresher';
import { StandingQuiz } from './StandingQuiz';
import { StandingResults } from './StandingResults';

interface StandingViewProps {
  divisionColors: Record<ModuleId, { hex: string; name: string; code: string; hours: number }>;
  standingAnswers: Record<string, number>;
  standingScores: StandingScoresMap;
  weakTopics: WeakTopicEntry[];
  onRecordStandingAnswer: (question: StandingQuestion, optionIndex: number) => void;
  onResetModuleStandingAnswers: (moduleId: ModuleId) => void;
  onSaveModuleScore: (moduleId: ModuleId, score: ModuleStandingScore) => void;
  onReviewWeakTopic: (questionId: string) => void;
  onToggleWeakTopicResolved: (questionId: string) => void;
  onClearResolvedWeakTopics: () => void;
  onGoToNotes: (moduleId: ModuleId) => void;
  onGoToLabs: (moduleId: ModuleId) => void;
  onGoToMock: (moduleId: ModuleId) => void;
  onReviewWeakTopics: (moduleId?: ModuleId) => void;
}

type DiagnosticStep = 'landing' | 'refresher' | 'quiz' | 'results';

export const StandingView: React.FC<StandingViewProps> = ({
  divisionColors,
  standingAnswers,
  standingScores,
  weakTopics,
  onRecordStandingAnswer,
  onResetModuleStandingAnswers,
  onSaveModuleScore,
  onReviewWeakTopic,
  onToggleWeakTopicResolved,
  onClearResolvedWeakTopics,
  onGoToNotes,
  onGoToLabs,
  onGoToMock,
  onReviewWeakTopics,
}) => {
  const [step, setStep] = useState<DiagnosticStep>('landing');
  const [selectedModuleId, setSelectedModuleId] = useState<ModuleId>('m1');
  const [sessionWrongCount, setSessionWrongCount] = useState<number>(0);

  const aggregate = useMemo(
    () => calculateAggregateStanding(standingScores),
    [standingScores]
  );

  const unresolvedStandingWeakCount = useMemo(
    () => weakTopics.filter((w) => w.source === 'standing' && !w.resolved).length,
    [weakTopics]
  );

  const selectedModule = useMemo(
    () => MODULES.find((m) => m.id === selectedModuleId) ?? MODULES[0],
    [selectedModuleId]
  );
  const selectedQuestions = useMemo(
    () => getModuleStandingQuestions(selectedModuleId),
    [selectedModuleId]
  );
  const selectedRefresher = useMemo(
    () => getModuleRefresher(selectedModuleId),
    [selectedModuleId]
  );

  const handleOpenModule = (moduleId: ModuleId, startFresh = false) => {
    setSelectedModuleId(moduleId);
    if (startFresh) {
      onResetModuleStandingAnswers(moduleId);
      setSessionWrongCount(0);
      setStep('refresher');
      return;
    }
    // Always enter Step 1: Quick Refresher when clicking a module card
    onResetModuleStandingAnswers(moduleId);
    setSessionWrongCount(0);
    setStep('refresher');
  };

  const handleOpenSavedResults = (moduleId: ModuleId) => {
    setSelectedModuleId(moduleId);
    const savedScore = standingScores[moduleId];
    if (savedScore) {
      const total = savedScore.foundation + savedScore.application + savedScore.analysis;
      setSessionWrongCount(30 - total);
      setStep('results');
    } else {
      handleOpenModule(moduleId, true);
    }
  };

  const handleCompleteQuiz = () => {
    const breakdown = calculateModuleStanding(
      selectedModuleId,
      selectedQuestions,
      standingAnswers
    );
    const scoreRecord: ModuleStandingScore = {
      foundation: breakdown.foundation,
      application: breakdown.application,
      analysis: breakdown.analysis,
      completedAt: new Date().toISOString(),
    };
    onSaveModuleScore(selectedModuleId, scoreRecord);
    setSessionWrongCount(breakdown.wrongQuestionIds.length);
    setStep('results');
  };

  // --- STEP 1: QUICK REFRESHER ---
  if (step === 'refresher') {
    return (
      <StandingRefresher
        refresher={selectedRefresher}
        moduleNumber={selectedModule.number}
        moduleHours={selectedModule.hours}
        accentHex={divisionColors[selectedModuleId].hex}
        onBack={() => setStep('landing')}
        onStartQuiz={() => setStep('quiz')}
      />
    );
  }

  // --- STEP 2: 30-QUESTION 3-TIER QUIZ ---
  if (step === 'quiz') {
    return (
      <StandingQuiz
        moduleNumber={selectedModule.number}
        moduleTitle={selectedModule.title}
        questions={selectedQuestions}
        sessionAnswers={standingAnswers}
        onSelectAnswer={onRecordStandingAnswer}
        onBackToRefresher={() => setStep('refresher')}
        onExitToLanding={() => setStep('landing')}
        onCompleteQuiz={handleCompleteQuiz}
      />
    );
  }

  // --- STEP 3: RESULTS DASHBOARD ---
  if (step === 'results') {
    const currentScore: ModuleStandingScore = standingScores[selectedModuleId] ?? {
      foundation: 0,
      application: 0,
      analysis: 0,
      completedAt: new Date().toISOString(),
    };
    return (
      <StandingResults
        moduleId={selectedModuleId}
        moduleNumber={selectedModule.number}
        moduleTitle={selectedModule.title}
        accentHex={divisionColors[selectedModuleId].hex}
        divisionColors={divisionColors}
        score={currentScore}
        wrongCountInAttempt={sessionWrongCount}
        weakTopics={weakTopics}
        onReviewWeakTopic={onReviewWeakTopic}
        onToggleWeakTopicResolved={onToggleWeakTopicResolved}
        onClearResolvedWeakTopics={onClearResolvedWeakTopics}
        onBackToLanding={() => setStep('landing')}
        onRetake={() => {
          onResetModuleStandingAnswers(selectedModuleId);
          setSessionWrongCount(0);
          setStep('quiz');
        }}
        onGoToNotes={() => onGoToNotes(selectedModuleId)}
        onGoToLabs={() => onGoToLabs(selectedModuleId)}
        onGoToMock={() => onGoToMock(selectedModuleId)}
        onReviewWeakTopics={() => onReviewWeakTopics(selectedModuleId)}
      />
    );
  }

  // --- LANDING PAGE: 5 MODULE CARDS + CROSS-MODULE RADAR & AGGREGATE SCORE ---
  return (
    <div className="space-y-6" data-testid="standing-landing-view">
      {/* Header Banner */}
      <section className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-6 sm:p-7 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#6B21A8] font-bold">
              <Gauge className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Pre-Study Diagnostic · Start Here First</span>
              <span className="text-[#C5BEB0]" aria-hidden="true">·</span>
              <span className="text-[#434038] tabular-nums">
                {aggregate.assessedCount}/5 Modules Assessed
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#1C1B18] leading-tight text-balance">
              BACSE202 Standing Diagnostic
            </h1>
            <p className="text-sm text-[#434038] leading-relaxed">
              Pinpoint your exact exam standing across Modules 1–5 before spending hours studying. Each module runs a 5-minute cheat sheet followed by 30 tiered questions (10 Foundation · 10 Application · 10 Analysis) with immediate worked explanations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {unresolvedStandingWeakCount > 0 && (
              <button
                type="button"
                onClick={() => onReviewWeakTopics()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-bold text-[#1C1B18] bg-[#E5B82E] hover:bg-[#d8aa22] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0 tabular-nums"
              >
                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Weak Topics ({unresolvedStandingWeakCount}) →</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                const nextUnassessed =
                  MODULES.find((m) => !standingScores[m.id])?.id ?? 'm1';
                handleOpenModule(nextUnassessed, true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-[0.05em] text-[#FAF7F0] bg-[#6B21A8] hover:bg-[#581C87] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0"
            >
              <span>
                {aggregate.assessedCount === 0
                  ? 'Start Module 1 Diagnostic →'
                  : aggregate.assessedCount < 5
                  ? `Assess Next Module (M${
                      (MODULES.find((m) => !standingScores[m.id])?.number ?? 1)
                    }) →`
                  : 'Re-Assess Module 1 →'}
              </span>
            </button>
          </div>
        </div>

        {/* Tier Difficulty Key (unboxed metadata) */}
        <div className="pt-3 border-t border-[#C5BEB0] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-[#434038]">
          {(['foundation', 'application', 'analysis'] as const).map((tierKey) => {
            const meta = TIER_META[tierKey];
            return (
              <div key={tierKey} className="inline-flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-[2px] border border-[#1C1B18] shrink-0"
                  style={{ backgroundColor: meta.colorHex }}
                  aria-hidden="true"
                />
                <span className="font-bold text-[#1C1B18]">{meta.shortLabel}</span>
                <span className="text-[#434038]">{meta.stars}</span>
                <span>({meta.subtitle})</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cross-Module Overview: Radar Chart + Aggregate Score / 150 (unlocked when >= 2 modules assessed) */}
      {aggregate.showRadar ? (
        <section
          className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-6 sm:p-7"
          aria-label="Cross-module standing overview"
          data-testid="cross-module-overview"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6 flex justify-center">
              <RadarChart scores={standingScores} divisionColors={divisionColors} />
            </div>

            <div className="lg:col-span-6 space-y-5">
              <div className="space-y-1.5 border-b border-[#1C1B18] pb-4">
                <div className="text-xs font-mono font-bold text-[#6B21A8]">
                  Cross-Module Standing Overview · {aggregate.assessedCount} of 5 Assessed
                </div>
                <div className="flex items-baseline gap-3">
                  <span
                    className="font-mono text-4xl sm:text-5xl font-extrabold text-[#1C1B18] tabular-nums"
                    data-testid="aggregate-standing-score"
                  >
                    {aggregate.totalScore}
                  </span>
                  <span className="font-mono text-lg text-[#6E695D] font-semibold tabular-nums">
                    / {aggregate.maxScore} Standing Score
                  </span>
                </div>
                <p
                  className="text-base font-display font-bold text-[#1C1B18] pt-1"
                  data-testid="aggregate-standing-verdict"
                >
                  {aggregate.verdict}
                </p>
              </div>

              {/* Per-module compact ledger */}
              <div className="space-y-2">
                {MODULES.map((mod) => {
                  const sc = standingScores[mod.id];
                  const tot = sc ? sc.foundation + sc.application + sc.analysis : null;
                  return (
                    <div
                      key={mod.id}
                      className="flex items-center justify-between gap-3 py-1.5 border-b border-[#EAE4D7] last:border-b-0 text-xs font-mono tabular-nums"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-[2px] border border-[#1C1B18] shrink-0"
                          style={{ backgroundColor: divisionColors[mod.id].hex }}
                          aria-hidden="true"
                        />
                        <span className="font-bold text-[#1C1B18] shrink-0">M{mod.number}</span>
                        <span className="text-[#434038] truncate font-sans">{mod.title}</span>
                      </div>
                      {sc && tot !== null ? (
                        <span className="font-bold text-[#1C1B18] shrink-0">
                          {tot}/30 ({getStandingGrade(tot)})
                        </span>
                      ) : (
                        <span className="text-[#6E695D] shrink-0">Not assessed</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <BarChart3 className="w-5 h-5 text-[#6B21A8] shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
            <div className="text-xs sm:text-sm text-[#2C2A25]">
              <span className="font-bold text-[#1C1B18]">Cross-Module Radar Chart Locked:</span>{' '}
              Complete at least <strong className="font-mono">2 modules</strong> to visualize Foundation, Application, and Analysis balance across all 5 syllabus axes ({aggregate.assessedCount}/2 done).
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-[#6B21A8] tabular-nums whitespace-nowrap shrink-0">
            {aggregate.totalScore} / 150 pts
          </span>
        </section>
      )}

      {/* 5 Module Diagnostic Cards (Responsive: 1 col mobile, 2–3 cols desktop) */}
      <section aria-label="Module diagnostics" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-display font-extrabold text-[#1C1B18]">
            Select a Module to Assess
          </h2>
          <span className="text-xs font-mono text-[#6E695D] tabular-nums">
            150 total questions (30 per module)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          {MODULES.map((mod) => {
            const colorInfo = divisionColors[mod.id];
            const score = standingScores[mod.id];
            const total = score ? score.foundation + score.application + score.analysis : null;
            const grade = total !== null ? getStandingGrade(total) : null;

            return (
              <motion.div
                key={mod.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] overflow-hidden flex flex-col justify-between"
                data-testid={`standing-module-card-${mod.id}`}
              >
                {/* Top Module Color Strip from DIVISION_WHEEL */}
                <div
                  className="h-2 w-full border-b border-[#1C1B18]"
                  style={{ backgroundColor: colorInfo.hex }}
                  aria-hidden="true"
                />

                <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs font-mono tabular-nums">
                      <span className="font-bold text-[#1C1B18]">
                        Module {mod.number} · {mod.hours} hrs
                      </span>
                      {grade ? (
                        <span className="font-bold text-[#6B21A8] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>
                            Grade {grade} ({total}/30)
                          </span>
                        </span>
                      ) : (
                        <span className="text-[#6E695D]">Not assessed</span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-display font-extrabold text-[#1C1B18] leading-snug">
                      {mod.title}
                    </h3>

                    <p className="text-xs text-[#434038] leading-relaxed">
                      {mod.examFocus}
                    </p>
                  </div>

                  {/* Previous Score Breakdown OR Ready-to-Start Prompt */}
                  {score ? (
                    <div className="space-y-3 pt-3 border-t border-[#EAE4D7]">
                      <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs tabular-nums">
                        <div className="bg-[#F4EFE4] border border-[#C5BEB0] rounded-[3px] py-1.5 px-1">
                          <div className="text-[10px] text-emerald-800 font-bold">FOUND.</div>
                          <div className="font-extrabold text-[#1C1B18]">
                            {score.foundation}/10
                          </div>
                        </div>
                        <div className="bg-[#F4EFE4] border border-[#C5BEB0] rounded-[3px] py-1.5 px-1">
                          <div className="text-[10px] text-amber-800 font-bold">APPL.</div>
                          <div className="font-extrabold text-[#1C1B18]">
                            {score.application}/10
                          </div>
                        </div>
                        <div className="bg-[#F4EFE4] border border-[#C5BEB0] rounded-[3px] py-1.5 px-1">
                          <div className="text-[10px] text-rose-800 font-bold">ANALYS.</div>
                          <div className="font-extrabold text-[#1C1B18]">
                            {score.analysis}/10
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenSavedResults(mod.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-mono font-bold text-[#1C1B18] bg-[#F4EFE4] hover:bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap"
                        >
                          <span>View Results</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenModule(mod.id, true)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-mono font-bold text-[#FAF7F0] bg-[#6B21A8] hover:bg-[#581C87] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap"
                          aria-label={`Retake Module ${mod.number} diagnostic`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Retake</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-[#EAE4D7]">
                      <button
                        type="button"
                        onClick={() => handleOpenModule(mod.id, true)}
                        className="w-full inline-flex items-center justify-between px-4 py-2.5 text-xs font-mono font-bold text-[#1C1B18] bg-[#F4EFE4] hover:bg-[#6B21A8] hover:text-[#FAF7F0] border border-[#1C1B18] rounded-[4px] step-hinge"
                      >
                        <span>Start M{mod.number} Diagnostic (30 Qs)</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
