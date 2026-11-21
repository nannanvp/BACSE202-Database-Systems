import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Pause,
  Play,
  Printer,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { FAT_QUESTIONS, MODULES } from '../data/bacse202Data';
import {
  A1_TA1_PAPER,
  A2_TA2_PAPER,
  D1_TD1_PAPER,
  GENERATED_SLOT_PAPER,
  GeneratedSlotOption,
  OFFICIAL_MODEL_PAPER,
  SLOT_BLUEPRINT_INSIGHTS,
  SLOT_PAPER_FORENSICS,
  SlotId,
} from '../data/slotPaperAnalysis';
import { ConceptDiagram } from './ConceptDiagrams';
import { MarkdownBlock } from './MarkdownBlock';
import { ModuleId, WeakTopicEntry } from '../utils/standingEngine';
import { DivisionColorMeta, WeakTopicsPanel } from './WeakTopicsPanel';

export interface MockPresetRequest {
  subView: 'mcq' | 'weak_topics';
  moduleId: 'all' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
  nonce: number;
}

interface FatMockViewProps {
  savedAnswers: Record<string, number>;
  onSelectAnswer: (questionId: string, optionIndex: number) => void;
  onResetAnswers: () => void;
  rubricScores?: Record<string, number>;
  onSetRubricScore?: (scoreKey: string, value: number | null) => void;
  onResetRubricScores?: (paperPrefix: string) => void;
  weakTopics?: WeakTopicEntry[];
  divisionColors?: Record<ModuleId, DivisionColorMeta>;
  onReviewWeakTopic?: (questionId: string) => void;
  onToggleWeakTopicResolved?: (questionId: string) => void;
  onClearResolvedWeakTopics?: () => void;
  presetRequest?: MockPresetRequest | null;
  onNavigateToTopic?: (moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5', topicId: string) => void;
}

type MockSubView = 'slot_paper' | 'forensics' | 'mcq' | 'weak_topics';
type PaperSetId = 'd1' | 'a1' | 'a2' | 'model' | 'predicted';
type ModuleFilter = 'all' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
type PartFilter = 'all' | 'Part A (Short)' | 'Part B (Analytical)';
type SlotFilter = 'ALL' | SlotId;

const THREE_HOURS_SECONDS = 3 * 60 * 60;

const MODULE_SWATCHES: Record<'m1' | 'm2' | 'm3' | 'm4' | 'm5', { bg: string; text: string }> = {
  m1: { bg: '#E5B82E', text: '#1C1B18' },
  m2: { bg: '#E06D2B', text: '#1C1B18' },
  m3: { bg: '#4F8A3D', text: '#FAF7F0' },
  m4: { bg: '#147E7B', text: '#FAF7F0' },
  m5: { bg: '#22559C', text: '#FAF7F0' },
};

function normalizeQAnchor(qNo: string): string {
  const m = qNo.match(/Q\d+/i);
  return m ? m[0].toUpperCase() : qNo.trim();
}

export const FatMockView: React.FC<FatMockViewProps> = ({
  savedAnswers,
  onSelectAnswer,
  onResetAnswers,
  rubricScores = {},
  onSetRubricScore,
  onResetRubricScores,
  weakTopics = [],
  divisionColors,
  onReviewWeakTopic = () => {},
  onToggleWeakTopicResolved = () => {},
  onClearResolvedWeakTopics = () => {},
  presetRequest = null,
  onNavigateToTopic,
}) => {
  const [subView, setSubView] = useState<MockSubView>('slot_paper');

  // --- Slot Paper State ---
  const [activePaperSet, setActivePaperSet] = useState<PaperSetId>('d1');
  const [orChoiceMap, setOrChoiceMap] = useState<Record<string, 'a' | 'b'>>({});
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});
  const [slotPaperModule, setSlotPaperModule] = useState<ModuleFilter>('all');

  // --- 3-Hour Full Exam Mode & Self-Grader State ---
  const [examRunning, setExamRunning] = useState(false);
  const [examSecondsLeft, setExamSecondsLeft] = useState(THREE_HOURS_SECONDS);
  const [showGraderControls, setShowGraderControls] = useState(true);

  // --- Forensics State ---
  const [slotFilter, setSlotFilter] = useState<SlotFilter>('ALL');
  const [forensicModuleFilter, setForensicModuleFilter] = useState<ModuleFilter>('all');

  // --- Rapid MCQ State ---
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>('all');
  const [partFilter, setPartFilter] = useState<PartFilter>('all');
  const [missedOnly, setMissedOnly] = useState(false);
  const [timedMode, setTimedMode] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30 * 60);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (!presetRequest) return;
    setSubView(presetRequest.subView);
    if (presetRequest.subView === 'mcq') {
      setModuleFilter(presetRequest.moduleId);
      setPartFilter('all');
      setMissedOnly(false);
      setCurrentIdx(0);
    }
  }, [presetRequest]);

  const unresolvedWeakCount = useMemo(
    () => weakTopics.filter((w) => !w.resolved).length,
    [weakTopics]
  );

  useEffect(() => {
    if (!examRunning) return;
    const id = window.setInterval(() => {
      setExamSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [examRunning]);

  useEffect(() => {
    if (!timedMode) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timedMode]);

  const filteredQuestions = useMemo(() => {
    return FAT_QUESTIONS.filter((q) => {
      if (moduleFilter !== 'all' && q.moduleId !== moduleFilter) return false;
      if (partFilter !== 'all' && q.part !== partFilter) return false;
      if (missedOnly) {
        const chosen = savedAnswers[q.id];
        return chosen !== undefined && chosen !== q.correctIndex;
      }
      return true;
    });
  }, [moduleFilter, partFilter, missedOnly, savedAnswers]);

  const safeIdx = Math.min(currentIdx, Math.max(0, filteredQuestions.length - 1));
  const currentQ = filteredQuestions[safeIdx];

  const scoreStats = useMemo(() => {
    let answered = 0;
    let correct = 0;
    let marksEarned = 0;
    let marksAttempted = 0;
    for (const q of FAT_QUESTIONS) {
      const chosen = savedAnswers[q.id];
      if (chosen !== undefined) {
        answered++;
        marksAttempted += q.marks;
        if (chosen === q.correctIndex) {
          correct++;
          marksEarned += q.marks;
        }
      }
    }
    return { answered, correct, total: FAT_QUESTIONS.length, marksEarned, marksAttempted };
  }, [savedAnswers]);

  const formattedTimer = useMemo(() => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [secondsLeft]);

  const handleToggleTimed = () => {
    if (!timedMode) {
      setSecondsLeft(30 * 60);
      setTimedMode(true);
    } else {
      setTimedMode(false);
    }
  };

  const basePaper =
    activePaperSet === 'd1'
      ? D1_TD1_PAPER
      : activePaperSet === 'a1'
      ? A1_TA1_PAPER
      : activePaperSet === 'a2'
      ? A2_TA2_PAPER
      : activePaperSet === 'model'
      ? OFFICIAL_MODEL_PAPER
      : GENERATED_SLOT_PAPER;

  const isDefaultOpenPaper =
    activePaperSet === 'd1' || activePaperSet === 'a1' || activePaperSet === 'a2';

  const filteredSlotPaper = useMemo(() => {
    if (slotPaperModule === 'all') return basePaper;
    return basePaper.filter((q) => q.moduleId === slotPaperModule);
  }, [slotPaperModule, basePaper]);

  const allSolutionsExpanded =
    filteredSlotPaper.length > 0 &&
    filteredSlotPaper.every((q) => {
      const key = `${activePaperSet}:${q.qNo}`;
      return expandedSolutions[key] ?? isDefaultOpenPaper;
    });

  const handleToggleAllSolutions = () => {
    const nextState = !allSolutionsExpanded;
    setExpandedSolutions((prev) => {
      const copy = { ...prev };
      for (const q of filteredSlotPaper) {
        copy[`${activePaperSet}:${q.qNo}`] = nextState;
      }
      return copy;
    });
  };

  const filteredForensics = useMemo(() => {
    return SLOT_PAPER_FORENSICS.filter((item) => {
      if (slotFilter !== 'ALL' && item.slot !== slotFilter) return false;
      if (forensicModuleFilter !== 'all' && item.moduleId !== forensicModuleFilter) return false;
      return true;
    });
  }, [slotFilter, forensicModuleFilter]);

  const formattedExamTimer = useMemo(() => {
    const hrs = Math.floor(examSecondsLeft / 3600);
    const mins = Math.floor((examSecondsLeft % 3600) / 60);
    const secs = examSecondsLeft % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [examSecondsLeft]);

  const handleStartThreeHourExam = () => {
    if (!examRunning) {
      // Collapse all solutions on active paper when entering fresh blind exam mode
      setExpandedSolutions((prev) => {
        const copy = { ...prev };
        for (const q of basePaper) {
          copy[`${activePaperSet}:${q.qNo}`] = false;
        }
        return copy;
      });
      setExamRunning(true);
    } else {
      setExamRunning(false);
    }
  };

  const handleResetExamTimer = () => {
    setExamRunning(false);
    setExamSecondsLeft(THREE_HOURS_SECONDS);
  };

  const paperSelfScoreStats = useMemo(() => {
    let earned = 0;
    let gradedParts = 0;
    let totalParts = 0;
    for (const item of basePaper) {
      const paperKey = `${activePaperSet}:${item.qNo}`;
      const branch = orChoiceMap[paperKey] ?? 'a';
      const activeOpt = item.orOption && branch === 'b' ? item.orOption : item.primary;
      for (const sq of activeOpt.subQuestions) {
        totalParts += 1;
        const scoreKey = `${activePaperSet}:${normalizeQAnchor(item.qNo)}:${branch}:${sq.part}`;
        const val = rubricScores[scoreKey];
        if (val !== undefined && Number.isFinite(val)) {
          earned += Math.max(0, Math.min(sq.marks, val));
          gradedParts += 1;
        }
      }
    }
    return { earned, gradedParts, totalParts };
  }, [basePaper, activePaperSet, orChoiceMap, rubricScores]);

  const jumpToPaperQuestion = (targetSet: PaperSetId, qRef: string) => {
    const anchor = normalizeQAnchor(qRef.split('/')[0]);
    const targetPaper =
      targetSet === 'd1'
        ? D1_TD1_PAPER
        : targetSet === 'a1'
        ? A1_TA1_PAPER
        : targetSet === 'a2'
        ? A2_TA2_PAPER
        : targetSet === 'model'
        ? OFFICIAL_MODEL_PAPER
        : GENERATED_SLOT_PAPER;
    const matchedQ = targetPaper.find((q) => normalizeQAnchor(q.qNo) === anchor);
    setSlotPaperModule('all');
    setActivePaperSet(targetSet);
    setSubView('slot_paper');
    if (matchedQ) {
      setExpandedSolutions((prev) => ({ ...prev, [`${targetSet}:${matchedQ.qNo}`]: true }));
    }
    window.requestAnimationFrame(() => {
      const el = document.getElementById(`slot-paper-${anchor}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const paperHeading =
    activePaperSet === 'd1'
      ? 'VIT Chennai FAT Slot Paper — D1+TD1 (Section I: 7×10M + Section II: 2×15M = 100M)'
      : activePaperSet === 'a1'
      ? 'VIT Vellore FAT Slot Paper — A1+TA1 (Q1–Q10 Exact Order & Worked Solutions)'
      : activePaperSet === 'a2'
      ? 'VIT Vellore FAT Slot Paper — A2+TA2 (Q1–Q10 Exact Order & Worked Solutions)'
      : activePaperSet === 'model'
      ? 'Official Fall 2026-27 Model Question Paper (Class No. CH2026270101832)'
      : 'Generated Parallel FAT Set (10 × 10M Practice Paper)';

  const paperMetaLine =
    activePaperSet === 'd1'
      ? 'VIT CHENNAI · CLASS NBR: CH2026270101726 · BACSE202 DATABASE SYSTEMS · SECTION I (7×10M) + SECTION II (2×15M) = 100 MARKS · 3 HOURS'
      : 'COURSE: BACSE202 — DATABASE SYSTEMS · TIME: 3 HOURS · MAX. MARKS: 100 (10 × 10M)';

  return (
    <div className="space-y-6">
      {/* Header + Sub-Mode Switcher (h1 FIRST — zero eyebrow kicker above h1) */}
      <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1B18]">
            FAT Slot Paper Simulator &amp; Forensics
          </h1>
          <p className="text-xs font-mono text-[#6E695D] tabular-nums">
            VIT BACSE202 END SEMESTER FAT · VIT CHENNAI D1+TD1 (7×10M + 2×15M), VIT VELLORE A1/A2, MODEL QP &amp; PREDICTED PAPER
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => {
              setActivePaperSet('d1');
              setSubView('slot_paper');
            }}
            className={`px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap shrink-0 ${
              subView === 'slot_paper' && activePaperSet === 'd1'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
            }`}
          >
            VIT Chennai D1+TD1 (100M)
          </button>
          <button
            type="button"
            onClick={() => {
              setActivePaperSet('a1');
              setSubView('slot_paper');
            }}
            className={`px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap shrink-0 ${
              subView === 'slot_paper' && activePaperSet === 'a1'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
            }`}
          >
            Vellore A1+TA1 (100M)
          </button>
          <button
            type="button"
            onClick={() => {
              setActivePaperSet('a2');
              setSubView('slot_paper');
            }}
            className={`px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap shrink-0 ${
              subView === 'slot_paper' && activePaperSet === 'a2'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
            }`}
          >
            Vellore A2+TA2 (100M)
          </button>
          <button
            type="button"
            onClick={() => {
              setActivePaperSet('model');
              setSubView('slot_paper');
            }}
            className={`px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap shrink-0 ${
              subView === 'slot_paper' && activePaperSet === 'model'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
            }`}
          >
            Official Model QP (100M)
          </button>
          <button
            type="button"
            onClick={() => {
              setActivePaperSet('predicted');
              setSubView('slot_paper');
            }}
            className={`px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap shrink-0 ${
              subView === 'slot_paper' && activePaperSet === 'predicted'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
            }`}
          >
            Predicted 100M Paper
          </button>
          <button
            type="button"
            onClick={() => setSubView('forensics')}
            className={`px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap shrink-0 ${
              subView === 'forensics'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
            }`}
          >
            D1, A1, A2 &amp; Model Forensics
          </button>
          <button
            type="button"
            onClick={() => setSubView('mcq')}
            className={`px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap shrink-0 ${
              subView === 'mcq'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
            }`}
          >
            {FAT_QUESTIONS.length}-Q Rapid MCQ Drill
          </button>
          <button
            type="button"
            onClick={() => setSubView('weak_topics')}
            className={`px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap shrink-0 tabular-nums ${
              subView === 'weak_topics'
                ? 'bg-[#6B21A8] text-[#FAF7F0]'
                : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
            }`}
          >
            Weak Topics ({unresolvedWeakCount})
          </button>
        </div>
      </div>

      {/* ====================================================================
          MODE 1: A1+TA1, A2+TA2, OFFICIAL MODEL QP OR PREDICTED 100M SLOT PAPER
         ==================================================================== */}
      {subView === 'slot_paper' && (
        <div className="space-y-5" data-testid="slot-paper-view">
          {/* Paper Specification Header (h2 FIRST — zero eyebrow above h2) */}
          <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#1C1B18]">
                  {paperHeading}
                </h2>
                <div className="text-xs font-mono text-[#6E695D]">
                  {paperMetaLine}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#1C1B18] bg-[#FAF7F0] hover:bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0"
                >
                  <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Print Paper</span>
                </button>
                <button
                  type="button"
                  onClick={handleToggleAllSolutions}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#1C1B18] bg-[#E5B82E] hover:bg-[#d8ab22] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0"
                >
                  <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{allSolutionsExpanded ? 'Hide All Solutions' : 'Expand All Solutions'}</span>
                </button>
              </div>
            </div>

            {/* 3-Hour Full Exam Mode & Rubric Self-Grader Bar */}
            <div
              className="bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px] p-3.5 flex flex-wrap items-center justify-between gap-3 no-print"
              data-testid="exam-mode-bar"
            >
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] font-mono text-xs font-extrabold text-[#1C1B18] tabular-nums">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span data-testid="exam-timer-display">{formattedExamTimer}</span>
                </div>
                <button
                  type="button"
                  onClick={handleStartThreeHourExam}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap ${
                    examRunning
                      ? 'bg-[#1C1B18] text-[#FAF7F0]'
                      : 'bg-[#E5B82E] text-[#1C1B18] hover:bg-[#d8ab22]'
                  }`}
                >
                  {examRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Pause 3h Exam</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Start 3h Exam Mode</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleResetExamTimer}
                  aria-label="Reset 3-hour exam timer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#1C1B18] bg-[#FAF7F0] hover:bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] step-hinge"
                >
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  <span>Reset 3h</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div
                  data-testid="self-grader-total"
                  className="px-2.5 py-1.5 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] font-mono text-xs font-bold text-[#1C1B18] tabular-nums"
                >
                  Self-Graded: <span className="text-[#4F8A3D]">{paperSelfScoreStats.earned}</span> / 100M ({paperSelfScoreStats.gradedParts}/{paperSelfScoreStats.totalParts} parts)
                </div>
                <button
                  type="button"
                  onClick={() => setShowGraderControls((v) => !v)}
                  className="px-2.5 py-1.5 text-xs font-bold text-[#1C1B18] bg-[#FAF7F0] hover:bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap"
                >
                  {showGraderControls ? 'Hide Self-Grader' : 'Show Self-Grader'}
                </button>
                {onResetRubricScores && paperSelfScoreStats.gradedParts > 0 && (
                  <button
                    type="button"
                    onClick={() => onResetRubricScores(`${activePaperSet}:`)}
                    className="px-2.5 py-1.5 text-xs font-bold text-[#A62B2B] bg-[#FAF7F0] hover:bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap"
                  >
                    Clear Marks
                  </button>
                )}
              </div>
            </div>

            {/* Blueprint Insights — Hairline Manual Columns (No decorative 01. numbers) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#1C1B18]">
              {SLOT_BLUEPRINT_INSIGHTS.map((ins, i) => (
                <div key={i} className="space-y-1">
                  <div className="text-xs font-bold text-[#1C1B18]">
                    {ins.title}
                  </div>
                  <p className="text-xs text-[#434038] leading-relaxed">{ins.detail}</p>
                </div>
              ))}
            </div>

            {/* Module filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#C5BEB0]">
              <div className="flex flex-wrap items-center gap-1.5">
                {(['all', 'm1', 'm2', 'm3', 'm4', 'm5'] as ModuleFilter[]).map((mod) => (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => setSlotPaperModule(mod)}
                    className={`px-3 py-1 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap shrink-0 ${
                      slotPaperModule === mod
                        ? 'bg-[#1C1B18] text-[#FAF7F0]'
                        : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                    }`}
                  >
                    {mod === 'all' ? `All ${basePaper.length} Questions (100M)` : `Module ${mod.slice(1)}`}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSubView('forensics')}
                className="text-xs font-bold text-[#1C1B18] underline underline-offset-4"
              >
                Inspect D1+TD1, A1+TA1 &amp; A2+TA2 Sources →
              </button>
            </div>
          </div>

          {/* 10 Questions */}
          <div className="space-y-4">
            {filteredSlotPaper.map((item) => {
              const paperKey = `${activePaperSet}:${item.qNo}`;
              const selectedBranch = orChoiceMap[paperKey] ?? 'a';
              const activeOpt: GeneratedSlotOption =
                item.orOption && selectedBranch === 'b' ? item.orOption : item.primary;
              const isOpen = expandedSolutions[paperKey] ?? isDefaultOpenPaper;

              const activeTopicId =
                item.orOption && selectedBranch === 'b' && item.orTopicId
                  ? item.orTopicId
                  : item.topicId;
              const activeTopicTitle =
                item.orOption && selectedBranch === 'b' && item.orTopicTitle
                  ? item.orTopicTitle
                  : item.topicTitle;
              const moduleMeta = MODULES.find((m) => m.id === item.moduleId);
              const moduleSwatch = MODULE_SWATCHES[item.moduleId];

              const qAnchor = normalizeQAnchor(item.qNo);
              const qEarnedMarks = activeOpt.subQuestions.reduce((sum, sq) => {
                const k = `${activePaperSet}:${qAnchor}:${selectedBranch}:${sq.part}`;
                const v = rubricScores[k];
                return sum + (v !== undefined && Number.isFinite(v) ? Math.max(0, Math.min(sq.marks, v)) : 0);
              }, 0);

              return (
                <article
                  key={paperKey}
                  id={`slot-paper-${qAnchor}`}
                  className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 space-y-4 print-card scroll-mt-20"
                >
                  {/* Question Header (h3 FIRST — zero eyebrow above h3) */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-extrabold text-[#1C1B18]">
                        {activeOpt.label}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E695D] font-mono tabular-nums">
                        <span className="font-bold text-[#1C1B18] bg-[#E5B82E] px-1.5 py-0.5 rounded-[2px]">
                          {item.qNo}
                        </span>
                        {item.section && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-bold text-[#FAF7F0] bg-[#1C1B18] px-1.5 py-0.5 rounded-[2px]">
                              {item.section}
                            </span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className="font-bold text-[#1C1B18]">{item.marks}M</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.co}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.bl}</span>
                        <span aria-hidden="true">·</span>
                        <span>Module {item.moduleId.slice(1)}</span>
                      </div>
                      <p className="text-xs text-[#434038]">
                        <span className="font-bold text-[#1C1B18]">Blueprint Lineage: </span>
                        {item.patternOrigin}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {item.orOption && (
                        <div className="flex items-center gap-1 p-0.5 bg-[#EAE4D7] rounded-[4px] border border-[#1C1B18]">
                          <button
                            type="button"
                            onClick={() => setOrChoiceMap((prev) => ({ ...prev, [paperKey]: 'a' }))}
                            className={`px-2.5 py-1 text-xs font-bold rounded-[2px] step-hinge ${
                              selectedBranch === 'a'
                                ? 'bg-[#1C1B18] text-[#FAF7F0]'
                                : 'text-[#1C1B18] hover:bg-[#FAF7F0]'
                            }`}
                          >
                            Option (a)
                          </button>
                          <button
                            type="button"
                            onClick={() => setOrChoiceMap((prev) => ({ ...prev, [paperKey]: 'b' }))}
                            className={`px-2.5 py-1 text-xs font-bold rounded-[2px] step-hinge ${
                              selectedBranch === 'b'
                                ? 'bg-[#1C1B18] text-[#FAF7F0]'
                                : 'text-[#1C1B18] hover:bg-[#FAF7F0]'
                            }`}
                          >
                            OR Option (b)
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedSolutions((prev) => ({ ...prev, [paperKey]: !isOpen }))
                        }
                        aria-expanded={isOpen}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#1C1B18] bg-[#E5B82E] hover:bg-[#d8ab22] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap"
                      >
                        <span>{isOpen ? 'Hide Solution' : 'Show Solution'}</span>
                        {isOpen ? (
                          <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Prompt Intro + Schema/Data */}
                  <p className="prose-manual">{activeOpt.promptIntro}</p>

                  {activeOpt.schemaOrData && (
                    <pre className="font-mono text-xs bg-[#26231E] text-[#FAF7F0] border border-[#1C1B18] p-4 rounded-[4px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {activeOpt.schemaOrData}
                    </pre>
                  )}

                  {activeOpt.referenceImageUrl && (
                    <figure className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-3 space-y-2">
                      <img
                        src={activeOpt.referenceImageUrl}
                        alt={activeOpt.referenceImageCaption ?? `${item.qNo} reference diagram`}
                        referrerPolicy="no-referrer"
                        className="w-full max-w-2xl mx-auto rounded-[2px] border border-[#1C1B18]/40 bg-white"
                      />
                      {activeOpt.referenceImageCaption && (
                        <figcaption className="text-[11px] font-mono text-[#6E695D] text-center">
                          {activeOpt.referenceImageCaption}
                        </figcaption>
                      )}
                    </figure>
                  )}

                  {/* Sub-questions + Inline Rubric Self-Grader */}
                  <div className="divide-y divide-[#C5BEB0] border-t border-b border-[#1C1B18]">
                    {activeOpt.subQuestions.map((sq) => {
                      const scoreKey = `${activePaperSet}:${qAnchor}:${selectedBranch}:${sq.part}`;
                      const currentScore = rubricScores[scoreKey];
                      return (
                        <div
                          key={sq.part}
                          className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-sm text-[#1C1B18]"
                        >
                          <div className="leading-relaxed prose-measure">
                            <span className="font-mono font-bold text-[#1C1B18] mr-2">
                              {sq.part}.
                            </span>
                            {sq.text}
                          </div>
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                            {showGraderControls && onSetRubricScore && (
                              <div className="inline-flex items-center gap-1 no-print">
                                <label
                                  htmlFor={`grade-${scoreKey}`}
                                  className="sr-only"
                                >
                                  Self-graded marks for {item.qNo} part {sq.part} (out of {sq.marks})
                                </label>
                                <input
                                  id={`grade-${scoreKey}`}
                                  type="number"
                                  min={0}
                                  max={sq.marks}
                                  step={0.5}
                                  value={currentScore ?? ''}
                                  placeholder="—"
                                  onChange={(e) => {
                                    const raw = e.target.value;
                                    if (raw === '') {
                                      onSetRubricScore(scoreKey, null);
                                      return;
                                    }
                                    const parsed = Number(raw);
                                    if (Number.isFinite(parsed)) {
                                      onSetRubricScore(
                                        scoreKey,
                                        Math.max(0, Math.min(sq.marks, parsed))
                                      );
                                    }
                                  }}
                                  className="w-14 h-7 px-1.5 text-center font-mono text-xs bg-[#F4EFE4] border border-[#1C1B18] rounded-[3px] text-[#1C1B18] tabular-nums"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    onSetRubricScore(
                                      scoreKey,
                                      currentScore === sq.marks ? 0 : sq.marks
                                    )
                                  }
                                  title={`Toggle full ${sq.marks} marks`}
                                  className={`px-1.5 h-7 text-[10px] font-mono font-bold rounded-[3px] border border-[#1C1B18] step-hinge ${
                                    currentScore === sq.marks
                                      ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                                      : 'bg-[#EAE4D7] text-[#1C1B18] hover:bg-[#E5B82E]'
                                  }`}
                                >
                                  Full
                                </button>
                              </div>
                            )}
                            <span className="font-mono text-xs font-bold text-[#1C1B18] whitespace-nowrap shrink-0 tabular-nums">
                              [{sq.marks}M]
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Module Tag & Topic Tag Directly Above Step-by-Step Solution */}
                  {isOpen && (
                    <div
                      className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] overflow-hidden"
                      data-testid={`slot-solution-${qAnchor}`}
                    >
                      <div
                        className="px-4 py-2.5 bg-[#EAE4D7] border-b border-[#1C1B18] flex flex-wrap items-center justify-between gap-2"
                        data-testid={`slot-solution-tags-${qAnchor}`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            style={{ backgroundColor: moduleSwatch.bg, color: moduleSwatch.text }}
                            className="px-2 py-0.5 text-[11px] font-mono font-bold rounded-[2px] border border-[#1C1B18]"
                          >
                            Module {item.moduleId.slice(1)} · {moduleMeta?.title ?? `Module ${item.moduleId.slice(1)}`}
                          </span>
                          <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#FAF7F0] text-[#1C1B18] rounded-[2px] border border-[#1C1B18]">
                            {activeTopicId} · {activeTopicTitle}
                          </span>
                          {qEarnedMarks > 0 && (
                            <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#4F8A3D] text-[#FAF7F0] rounded-[2px] border border-[#1C1B18] tabular-nums">
                              Graded: {qEarnedMarks} / {item.marks}M
                            </span>
                          )}
                        </div>

                        {onNavigateToTopic && (
                          <button
                            type="button"
                            onClick={() => onNavigateToTopic(item.moduleId, activeTopicId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-bold text-[#1C1B18] bg-[#E5B82E] hover:bg-[#d8ab22] border border-[#1C1B18] rounded-[3px] step-hinge whitespace-nowrap no-print"
                          >
                            <span>Open Topic in Syllabus</span>
                            <ArrowRight className="w-3 h-3" aria-hidden="true" />
                          </button>
                        )}
                      </div>

                      <div className="p-4 sm:p-5 space-y-4">
                        <div className="text-xs font-mono font-bold text-[#4F8A3D] uppercase tracking-wider">
                          Worked Step-by-Step Solution ({item.qNo}
                          {item.orOption ? ` — Option ${selectedBranch}` : ''})
                        </div>

                        {activeOpt.diagramId && (
                          <ConceptDiagram
                            id={activeOpt.diagramId}
                            caption={activeOpt.diagramCaption}
                          />
                        )}

                        <div className="space-y-3">
                          {activeOpt.solutionSteps.map((step, sIdx) => (
                            <MarkdownBlock key={sIdx} content={step} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* ====================================================================
          MODE 2: A1+TA1 & A2+TA2 SOURCE FORENSICS
         ==================================================================== */}
      {subView === 'forensics' && (
        <div className="space-y-5" data-testid="forensics-view">
          <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1C1B18]">
                Source Investigation: VIT Chennai D1+TD1, VIT Vellore A1/A2 &amp; Official Model QP
              </h2>
              <p className="prose-manual">
                Every question across VIT Chennai’s real D1+TD1 FAT paper (Section I 7×10M + Section II 2×15M), VIT Vellore’s A1+TA1 &amp; A2+TA2 papers, and the Official Fall 2026-27 Model QP mapped to its exact CO, Bloom’s level, syllabus topic, lecture slides, and textbook chapter.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {(['ALL', 'D1+TD1', 'MODEL_QP', 'A1+TA1', 'A2+TA2'] as SlotFilter[]).map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSlotFilter(slot)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap shrink-0 ${
                      slotFilter === slot
                        ? 'bg-[#1C1B18] text-[#FAF7F0]'
                        : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                    }`}
                  >
                    {slot === 'ALL'
                      ? `All 4 Papers (${SLOT_PAPER_FORENSICS.length} Qs)`
                      : slot === 'D1+TD1'
                      ? 'VIT Chennai D1+TD1 (9 Qs)'
                      : slot === 'MODEL_QP'
                      ? 'Official Model QP (10 Qs)'
                      : `Vellore ${slot} (10 Qs)`}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(['all', 'm1', 'm2', 'm3', 'm4', 'm5'] as ModuleFilter[]).map((mod) => (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => setForensicModuleFilter(mod)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap shrink-0 ${
                      forensicModuleFilter === mod
                        ? 'bg-[#E5B82E] text-[#1C1B18]'
                        : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                    }`}
                  >
                    {mod === 'all' ? 'All Mods' : `M${mod.slice(1)}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredForensics.map((row) => (
              <div
                key={row.id}
                className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-extrabold text-[#1C1B18]">
                      {row.topicSummary}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#6E695D] tabular-nums">
                      <span className="font-bold text-[#1C1B18] bg-[#E5B82E] px-1.5 py-0.5 rounded-[2px]">
                        {row.slot}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-bold text-[#1C1B18]">{row.qNo}</span>
                      <span aria-hidden="true">·</span>
                      <span>{row.marks}M</span>
                      <span aria-hidden="true">·</span>
                      <span>{row.co}</span>
                      <span aria-hidden="true">·</span>
                      <span>{row.bl}</span>
                      <span aria-hidden="true">·</span>
                      <span>Module {row.moduleId.slice(1)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        jumpToPaperQuestion(
                          row.slot === 'D1+TD1'
                            ? 'd1'
                            : row.slot === 'A1+TA1'
                            ? 'a1'
                            : row.slot === 'A2+TA2'
                            ? 'a2'
                            : 'model',
                          row.qNo
                        )
                      }
                      className="px-3 py-1.5 text-xs font-bold text-[#1C1B18] bg-[#FAF7F0] hover:bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0"
                    >
                      Open Solved ({row.qNo})
                    </button>
                    <button
                      type="button"
                      onClick={() => jumpToPaperQuestion('predicted', row.pairedPredictedQNo)}
                      className="px-3 py-1.5 text-xs font-bold text-[#1C1B18] bg-[#E5B82E] hover:bg-[#d8ab22] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0"
                    >
                      Practice Similar ({row.pairedPredictedQNo})
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3 border-t border-[#C5BEB0] text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-[#1C1B18]">Syllabus Source</div>
                    <p className="text-[#434038] leading-relaxed">{row.syllabusSource}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-[#1C1B18]">Professor PPT Source</div>
                    <p className="text-[#434038] leading-relaxed">{row.pptSource}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-[#1C1B18]">Textbook Reference</div>
                    <p className="text-[#434038] leading-relaxed">{row.textbookSource}</p>
                  </div>
                </div>

                <p className="pt-3 border-t border-[#C5BEB0] text-xs text-[#434038] leading-relaxed prose-measure">
                  <span className="font-bold text-[#1C1B18]">Setter Pattern: </span>
                  {row.setterPatternNote}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

          {/* ====================================================================
          MODE 3: RAPID MCQ DRILL (FULL SYLLABUS BANK)
         ==================================================================== */}
      {subView === 'mcq' && (
        <div className="space-y-5" data-testid="mcq-drill-view">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="text-xs font-mono font-bold text-[#434038] tabular-nums">
              QUICK CHECK · {scoreStats.answered}/{scoreStats.total} ANSWERED · {scoreStats.correct} CORRECT ({scoreStats.marksEarned}/{scoreStats.marksAttempted} MARKS)
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleToggleTimed}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap shrink-0 tabular-nums ${
                  timedMode
                    ? 'bg-[#E5B82E] text-[#1C1B18]'
                    : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{timedMode ? `Timer: ${formattedTimer}` : 'Start 30m Timer'}</span>
              </button>

              {scoreStats.answered > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onResetAnswers();
                    setMissedOnly(false);
                    setCurrentIdx(0);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#1C1B18] bg-[#FAF7F0] border border-[#1C1B18] hover:bg-[#EAE4D7] rounded-[4px] step-hinge whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Reset Quiz</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {(['all', 'm1', 'm2', 'm3', 'm4', 'm5'] as ModuleFilter[]).map((mod) => (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => {
                      setModuleFilter(mod);
                      setCurrentIdx(0);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap shrink-0 ${
                      moduleFilter === mod
                        ? 'bg-[#1C1B18] text-[#FAF7F0]'
                        : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                    }`}
                  >
                    {mod === 'all' ? 'All Modules' : `Mod ${mod.slice(1)}`}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pl-0 sm:pl-2 sm:border-l sm:border-[#C5BEB0]">
                {(
                  [
                    { id: 'all', label: 'All Parts' },
                    { id: 'Part A (Short)', label: 'Part A (2M)' },
                    { id: 'Part B (Analytical)', label: 'Part B (10M)' },
                  ] as Array<{ id: PartFilter; label: string }>
                ).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPartFilter(p.id);
                      setCurrentIdx(0);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap shrink-0 ${
                      partFilter === p.id
                        ? 'bg-[#E5B82E] text-[#1C1B18]'
                        : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="inline-flex items-center gap-2 text-xs font-bold text-[#1C1B18] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={missedOnly}
                onChange={(e) => {
                  setMissedOnly(e.target.checked);
                  setCurrentIdx(0);
                }}
                className="w-4 h-4 rounded-[2px] border-[#1C1B18] accent-[#1C1B18]"
              />
              <span>Review missed questions only</span>
            </label>
          </div>

          {!currentQ ? (
            <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-10 text-center space-y-2">
              <p className="text-sm font-bold text-[#1C1B18]">
                {missedOnly ? 'No missed questions in this filter.' : 'No questions found.'}
              </p>
              <p className="text-xs text-[#6E695D]">
                Uncheck &quot;Review missed questions only&quot; to practice all {FAT_QUESTIONS.length} FAT items.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-6 sm:p-8 space-y-6">
                <div className="space-y-1.5">
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#1C1B18] leading-snug">
                    {currentQ.prompt}
                  </h2>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#6E695D] tabular-nums">
                    <span>
                      Question {safeIdx + 1} of {filteredQuestions.length} · Module {currentQ.moduleId.slice(1)} · {currentQ.part}
                    </span>
                    <span className="font-bold text-[#1C1B18]">{currentQ.marks} Marks</span>
                  </div>
                </div>

                {currentQ.codeOrSchema && (
                  <div className="font-mono text-xs sm:text-sm bg-[#26231E] border border-[#1C1B18] rounded-[4px] px-4 py-3 text-[#FAF7F0] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {currentQ.codeOrSchema}
                  </div>
                )}

                <div className="space-y-2.5">
                  {currentQ.options.map((opt, idx) => {
                    const chosen = savedAnswers[currentQ.id];
                    const isAnswered = chosen !== undefined;
                    const isSelected = chosen === idx;
                    const isCorrect = idx === currentQ.correctIndex;

                    let stateClasses = 'bg-[#FAF7F0] border-[#C5BEB0] hover:border-[#1C1B18] hover:bg-[#F4EFE4] text-[#1C1B18]';
                    if (isAnswered) {
                      if (isCorrect) {
                        stateClasses = 'bg-[#4F8A3D]/15 border-[#4F8A3D] text-[#1C1B18] font-bold';
                      } else if (isSelected) {
                        stateClasses = 'bg-[#A62B2B]/15 border-[#A62B2B] text-[#1C1B18]';
                      } else {
                        stateClasses = 'bg-[#FAF7F0] border-[#C5BEB0] text-[#6E695D]';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onSelectAnswer(currentQ.id, idx)}
                        className={`w-full text-left p-4 rounded-[4px] border text-sm step-hinge flex items-start justify-between gap-3 ${stateClasses}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-xs font-bold text-[#6E695D] mt-0.5">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          <span className="leading-relaxed">{opt}</span>
                        </div>
                        {isAnswered && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-[#4F8A3D] shrink-0" aria-hidden="true" />
                        )}
                        {isAnswered && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-[#A62B2B] shrink-0" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {savedAnswers[currentQ.id] !== undefined && (
                  <div
                    className="pt-4 border-t border-[#1C1B18] space-y-1.5"
                    data-testid="question-explanation"
                  >
                    <div className="text-xs font-bold text-[#1C1B18]">
                      {savedAnswers[currentQ.id] === currentQ.correctIndex
                        ? 'Correct — Worked Solution'
                        : 'Incorrect — Worked Solution'}
                    </div>
                    <p className="prose-manual whitespace-pre-line">{currentQ.explanation}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-[#C5BEB0] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={safeIdx === 0}
                    onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                    className="px-4 py-2 text-xs font-bold text-[#1C1B18] bg-[#FAF7F0] border border-[#1C1B18] hover:bg-[#EAE4D7] disabled:opacity-40 disabled:cursor-not-allowed rounded-[4px] step-hinge"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={safeIdx >= filteredQuestions.length - 1}
                    onClick={() => setCurrentIdx((i) => Math.min(filteredQuestions.length - 1, i + 1))}
                    className="px-4 py-2 text-xs font-bold text-[#1C1B18] bg-[#E5B82E] hover:bg-[#d8ab22] border border-[#1C1B18] disabled:opacity-40 disabled:cursor-not-allowed rounded-[4px] step-hinge"
                  >
                    Next Question
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1C1B18] pb-2">
                  <h3 className="text-sm font-extrabold text-[#1C1B18]">
                    Question Map
                  </h3>
                  <span className="text-xs font-mono font-bold text-[#6E695D] tabular-nums">
                    {filteredQuestions.length} Qs
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2 max-h-[400px] overflow-y-auto pr-1" data-testid="question-map-grid">
                  {filteredQuestions.map((q, idx) => {
                    const chosen = savedAnswers[q.id];
                    const isCurrent = idx === safeIdx;
                    let btnStyle = 'bg-[#FAF7F0] border-[#1C1B18] text-[#1C1B18] hover:bg-[#EAE4D7]';
                    if (chosen !== undefined) {
                      btnStyle =
                        chosen === q.correctIndex
                          ? 'bg-[#4F8A3D] border-[#1C1B18] text-[#FAF7F0]'
                          : 'bg-[#A62B2B] border-[#1C1B18] text-[#FAF7F0]';
                    }
                    if (isCurrent) {
                      btnStyle = 'bg-[#E5B82E] border-[#1C1B18] text-[#1C1B18] ring-2 ring-[#1C1B18]';
                    }
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIdx(idx)}
                        aria-label={`Jump to question ${idx + 1}`}
                        className={`h-10 rounded-[4px] border font-mono text-xs font-bold tabular-nums step-hinge ${btnStyle}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-[#C5BEB0] text-xs font-mono text-[#6E695D] space-y-1">
                  <div className="flex justify-between">
                    <span>Part A (Short 2M)</span>
                    <span className="font-bold text-[#1C1B18]">
                      {FAT_QUESTIONS.filter((q) => q.marks === 2).length} Qs
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Part B (Analytical 10M)</span>
                    <span className="font-bold text-[#1C1B18]">
                      {FAT_QUESTIONS.filter((q) => q.marks === 10).length} Qs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {weakTopics.length > 0 && (
            <WeakTopicsPanel
              panelId="mcq-weak-topics-panel"
              weakTopics={weakTopics}
              divisionColors={divisionColors}
              onReviewWeakTopic={onReviewWeakTopic}
              onToggleResolved={onToggleWeakTopicResolved}
              onClearAllResolved={onClearResolvedWeakTopics}
              defaultExpanded={false}
              title="Weak Topics Quick Panel"
              subtitle="Expand to review missed questions from Standing and FAT Mock without leaving your MCQ drill."
            />
          )}
        </div>
      )}

      {/* ====================================================================
          MODE 4: WEAK TOPICS PANEL (STANDING + FAT MOCK WRONGS)
         ==================================================================== */}
      {subView === 'weak_topics' && (
        <WeakTopicsPanel
          panelId="mock-weak-topics-panel"
          weakTopics={weakTopics}
          divisionColors={divisionColors}
          onReviewWeakTopic={onReviewWeakTopic}
          onToggleResolved={onToggleWeakTopicResolved}
          onClearAllResolved={onClearResolvedWeakTopics}
          defaultExpanded={true}
          title="Central Weak Topics Tracker"
          subtitle="Tracks every wrong answer from Standing Diagnostics and FAT Mock MCQs with SRS overdue alerts, inline worked review, and resolution tracking."
        />
      )}
    </div>
  );
};
