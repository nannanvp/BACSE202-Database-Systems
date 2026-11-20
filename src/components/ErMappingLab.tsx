import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import {
  EerCompleteness,
  EerDisjointness,
  ER_MAPPING_DRILLS,
  evaluateErQuizScore,
  recommendEerMappingOptions,
} from '../utils/erFlashcardEngine';

type SubTab = 'quiz' | 'eer_matrix';

export const ErMappingLab: React.FC = () => {
  const [subTab, setSubTab] = useState<SubTab>('quiz');
  const [questionIdx, setQuestionIdx] = useState<number>(0);
  const [selections, setSelections] = useState<Record<string, number>>({});

  // EER Option 8A-8D Recommender state
  const [disjointness, setDisjointness] = useState<EerDisjointness>('disjoint');
  const [completeness, setCompleteness] = useState<EerCompleteness>('total');

  const activeQuestion = ER_MAPPING_DRILLS[questionIdx];
  const chosenOption = selections[activeQuestion.id];
  const isAnswered = chosenOption !== undefined;
  const isCorrect = isAnswered && chosenOption === activeQuestion.correctIndex;

  const score = useMemo(() => evaluateErQuizScore(selections), [selections]);
  const eerEvaluations = useMemo(
    () => recommendEerMappingOptions(disjointness, completeness),
    [disjointness, completeness]
  );

  const handleSelectOption = (optIndex: number) => {
    setSelections((prev) => ({ ...prev, [activeQuestion.id]: optIndex }));
  };

  const handleResetQuiz = () => {
    setSelections({});
    setQuestionIdx(0);
  };

  return (
    <div data-testid="er-mapping-lab" className="space-y-5">
      {/* Header + Sub-Tab Switcher */}
      <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#1C1B18] tracking-tight">
              Module 2 · ER/EER 7-Step &amp; Options 8A–8D Schema Mapper
            </h2>
            <p className="text-xs font-mono text-[#6E695D] mt-0.5">
              A2 Q3 · MODEL Q1 — WEAK ENTITIES, 1:1 / 1:N / M:N / N-ARY RULES &amp; EER SPECIALIZATION MAPPING
            </p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-[4px] bg-[#E06D2B] text-[#1C1B18] border border-[#1C1B18] font-mono text-[11px] font-bold self-start sm:self-auto whitespace-nowrap shrink-0">
            M2 · ER/EER MAPPING
          </span>
        </div>

        <div
          role="tablist"
          aria-label="ER and EER Mapping Tools"
          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'quiz'}
            onClick={() => setSubTab('quiz')}
            className={`px-3.5 py-2.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge text-left flex items-center justify-between gap-2 ${
              subTab === 'quiz'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#F4EFE4] text-[#1C1B18] hover:bg-[#EAE4D7]'
            }`}
          >
            <span>7-Step + 8A–8D Schema Mapper Drill (10 Qs)</span>
            <span className="font-mono text-[10px] opacity-80 shrink-0">
              {score.correctCount}/{score.totalCount}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'eer_matrix'}
            onClick={() => setSubTab('eer_matrix')}
            className={`px-3.5 py-2.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge text-left flex items-center justify-between gap-2 ${
              subTab === 'eer_matrix'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#F4EFE4] text-[#1C1B18] hover:bg-[#EAE4D7]'
            }`}
          >
            <span>EER Option 8A–8D Decision Matrix</span>
            <span className="font-mono text-[10px] opacity-80 shrink-0">d/o × t/p</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: 7-STEP + 8A-8D INTERACTIVE SCHEMA MAPPER DRILL                */}
      {/* ==================================================================== */}
      {subTab === 'quiz' && (
        <div data-testid="er-quiz-panel" className="space-y-4">
          {/* Score Strip & Step Jump Rail */}
          <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  data-testid="er-quiz-score"
                  className="px-2.5 py-1 rounded-[4px] border border-[#1C1B18] bg-[#EAE4D7] font-mono text-xs font-extrabold tabular-nums"
                >
                  Score: {score.correctCount} / {score.totalCount} Correct ({score.answeredCount}{' '}
                  Answered)
                </span>
                {score.answeredCount > 0 && (
                  <span className="font-mono text-xs text-[#6E695D] tabular-nums">
                    Accuracy: {score.accuracyPct}%
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleResetQuiz}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-[4px] border border-[#1C1B18] bg-[#F4EFE4] hover:bg-[#EAE4D7] text-[#1C1B18]"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Reset Drill
              </button>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {ER_MAPPING_DRILLS.map((q, idx) => {
                const ans = selections[q.id];
                const isCur = idx === questionIdx;
                const right = ans !== undefined && ans === q.correctIndex;
                const wrong = ans !== undefined && ans !== q.correctIndex;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setQuestionIdx(idx)}
                    aria-label={`Jump to question ${idx + 1}: ${q.stepTag}`}
                    className={`py-1.5 text-xs font-mono font-bold rounded-[3px] border border-[#1C1B18] tabular-nums step-hinge ${
                      isCur
                        ? 'bg-[#E5B82E] text-[#1C1B18] ring-2 ring-[#1C1B18]/40'
                        : right
                        ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                        : wrong
                        ? 'bg-[#A62B2B] text-[#FAF7F0]'
                        : 'bg-[#F4EFE4] text-[#1C1B18] hover:bg-[#EAE4D7]'
                    }`}
                  >
                    Q{idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question Card */}
          <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1C1B18]/20 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-[3px] border border-[#1C1B18] bg-[#E06D2B] text-[#1C1B18] font-mono text-[11px] font-bold">
                  {activeQuestion.stepTag}
                </span>
                <span className="font-mono text-[11px] text-[#6E695D]">
                  {activeQuestion.examRef}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-[#6E695D] tabular-nums">
                Drill {questionIdx + 1} / {ER_MAPPING_DRILLS.length}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-[#1C1B18]">
                {activeQuestion.constructTitle}
              </h3>
              <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-3.5 font-mono text-xs text-[#1C1B18] leading-relaxed">
                <span className="font-extrabold text-[#E06D2B]">ER SCENARIO: </span>
                {activeQuestion.erScenario}
              </div>
              <p className="text-sm font-bold text-[#1C1B18] pt-1">
                {activeQuestion.questionPrompt}
              </p>
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-2">
              {activeQuestion.options.map((opt, idx) => {
                const picked = chosenOption === idx;
                const isAnswer = idx === activeQuestion.correctIndex;
                let rowStyle = 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#F4EFE4]';
                if (isAnswered) {
                  if (isAnswer) {
                    rowStyle = 'bg-[#4F8A3D] text-[#FAF7F0]';
                  } else if (picked) {
                    rowStyle = 'bg-[#A62B2B] text-[#FAF7F0]';
                  } else {
                    rowStyle = 'bg-[#F4EFE4]/60 text-[#6E695D]';
                  }
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left px-3.5 py-3 rounded-[4px] border border-[#1C1B18] text-xs sm:text-sm font-medium step-hinge flex items-start gap-2.5 ${rowStyle}`}
                  >
                    <span className="font-mono font-extrabold shrink-0">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Instant Schema Verdict & Rule Feedback */}
            {isAnswered && (
              <div
                data-testid="er-quiz-feedback"
                className={`border border-[#1C1B18] rounded-[4px] p-4 space-y-2.5 ${
                  isCorrect ? 'bg-[#EDF6EB]' : 'bg-[#FFF3F3]'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-extrabold">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#4F8A3D] shrink-0" aria-hidden="true" />
                      <span className="text-[#2D5A22]">EXACT FAT MAPPING — FULL MARKS!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-[#A62B2B] shrink-0" aria-hidden="true" />
                      <span className="text-[#A62B2B]">
                        INCORRECT — CHECK THE EXACT ELMASRI RULE BELOW
                      </span>
                    </>
                  )}
                </div>

                <div className="bg-[#1C1B18] text-[#FAF7F0] rounded-[4px] px-3 py-2 font-mono text-xs leading-relaxed">
                  SCHEMA: {activeQuestion.mappedSchema}
                </div>

                <p className="text-xs text-[#1C1B18] leading-relaxed">
                  {activeQuestion.ruleExplanation}
                </p>
              </div>
            )}

            {/* Prev / Next Navigation */}
            <div className="flex items-center justify-between pt-2 border-t border-[#1C1B18]/15">
              <button
                type="button"
                disabled={questionIdx === 0}
                onClick={() => setQuestionIdx((i) => Math.max(0, i - 1))}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] bg-[#F4EFE4] hover:bg-[#EAE4D7] disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                Previous Step
              </button>
              <button
                type="button"
                disabled={questionIdx >= ER_MAPPING_DRILLS.length - 1}
                onClick={() =>
                  setQuestionIdx((i) => Math.min(ER_MAPPING_DRILLS.length - 1, i + 1))
                }
                className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] bg-[#E5B82E] hover:bg-[#d6a920] text-[#1C1B18] disabled:opacity-40"
              >
                Next Step
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: EER OPTION 8A–8D DECISION MATRIX                              */}
      {/* ==================================================================== */}
      {subTab === 'eer_matrix' && (
        <div data-testid="eer-matrix-panel" className="space-y-4">
          {/* Interactive Constraint Toggles */}
          <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-xs font-extrabold text-[#1C1B18]">
                1. Disjointness Constraint (Circle Symbol)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDisjointness('disjoint')}
                  className={`px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                    disjointness === 'disjoint'
                      ? 'bg-[#E06D2B] text-[#1C1B18]'
                      : 'bg-[#F4EFE4] text-[#1C1B18] hover:bg-[#EAE4D7]'
                  }`}
                >
                  Disjoint (d)
                </button>
                <button
                  type="button"
                  onClick={() => setDisjointness('overlapping')}
                  className={`px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                    disjointness === 'overlapping'
                      ? 'bg-[#E06D2B] text-[#1C1B18]'
                      : 'bg-[#F4EFE4] text-[#1C1B18] hover:bg-[#EAE4D7]'
                  }`}
                >
                  Overlapping (o)
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-extrabold text-[#1C1B18]">
                2. Completeness Constraint (Line Style)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCompleteness('total')}
                  className={`px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                    completeness === 'total'
                      ? 'bg-[#E06D2B] text-[#1C1B18]'
                      : 'bg-[#F4EFE4] text-[#1C1B18] hover:bg-[#EAE4D7]'
                  }`}
                >
                  Total (Double Line)
                </button>
                <button
                  type="button"
                  onClick={() => setCompleteness('partial')}
                  className={`px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                    completeness === 'partial'
                      ? 'bg-[#E06D2B] text-[#1C1B18]'
                      : 'bg-[#F4EFE4] text-[#1C1B18] hover:bg-[#EAE4D7]'
                  }`}
                >
                  Partial (Single Line)
                </button>
              </div>
            </div>
          </div>

          {/* 4 Option Evaluation Cards (8A, 8B, 8C, 8D) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eerEvaluations.map((ev) => {
              const badgeClasses =
                ev.status === 'RECOMMENDED'
                  ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                  : ev.status === 'VALID'
                  ? 'bg-[#E5B82E] text-[#1C1B18]'
                  : 'bg-[#A62B2B] text-[#FAF7F0]';
              return (
                <div
                  key={ev.optionId}
                  data-testid={`eer-option-${ev.optionId}`}
                  className={`border border-[#1C1B18] rounded-[4px] p-4 space-y-3 ${
                    ev.status === 'INVALID' ? 'bg-[#FFF3F3]' : 'bg-[#FAF7F0]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-[#1C1B18] leading-snug">
                      {ev.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-[3px] border border-[#1C1B18] font-mono text-[10px] font-extrabold whitespace-nowrap shrink-0 ${badgeClasses}`}
                    >
                      {ev.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#1C1B18] leading-relaxed">{ev.reason}</p>

                  <div className="bg-[#1C1B18] text-[#FAF7F0] rounded-[4px] p-3 space-y-1 font-mono text-[11px]">
                    {ev.exampleTables.map((tbl, i) => (
                      <div key={i}>{tbl}</div>
                    ))}
                  </div>

                  <p className="text-[11px] font-mono text-[#6E695D]">
                    Trade-off: {ev.tradeoff}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
