import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  Check,
  ChevronDown,
  ChevronUp,
  Dices,
  Flame,
  RotateCcw,
  Target,
} from 'lucide-react';
import { COURSE_META, MODULES, SPRINT_BLOCKS, SprintBlock } from '../data/bacse202Data';
import { calculateSprintStats, calculateTopicMasteryStats } from '../utils/dbEngine';
import {
  calculateTriageSummary,
  filterSprintBlocks,
  TRIAGE_HIGH_YIELD_BLOCK_IDS,
} from '../utils/erFlashcardEngine';
import { ExamReadinessReport, SmartNextAction } from '../utils/readinessEngine';
import { ExamCountdown } from './ExamCountdown';
import { LabId } from './InteractiveLabsView';
import { PomodoroTimer } from './PomodoroTimer';
import type { DivisionColorMeta } from './WeakTopicsPanel';

type ModuleId = 'm1' | 'm2' | 'm3' | 'm4' | 'm5';

interface SprintPlannerViewProps {
  activeModuleId?: ModuleId;
  divisionColors?: Record<ModuleId, DivisionColorMeta>;
  completedBlockIds: string[];
  masteredTopicIds: string[];
  readiness: ExamReadinessReport;
  onToggleBlock: (blockId: string) => void;
  onResetProgress: () => void;
  completedUpgradeIds: string[];
  onToggleUpgrade: (upgradeId: string) => void;
  onNavigateToModule: (moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5') => void;
  onNavigateToLab: (lab: LabId) => void;
  onStartMock: () => void;
  onOpenMissedQueue: () => void;
  onOpenSyllabus: () => void;
  onOpenReference: () => void;
  onOpenFlashcards: () => void;
  onOpenPlaybook: () => void;
}

interface UpgradeRoadmapItem {
  id: string;
  order: number;
  title: string;
  detail: string;
  actionKind?: 'lab' | 'missed_queue' | 'mock' | 'syllabus';
  targetLab?: LabId;
  actionLabel?: string;
  secondaryLabel?: string;
  secondaryKind?: 'reference' | 'flashcards';
}

const APP_IMPROVEMENT_ROADMAP: UpgradeRoadmapItem[] = [
  {
    id: 'imp-1',
    order: 1,
    title: 'Upgrade B+ Tree Lab: Deletion, Step Replay & FAT Exam Presets',
    detail:
      'Supports key deletion (leaf/internal borrow & merge, Case II inorder-successor separator updates, root collapse), step-by-step replay controls, and 1-click Model QP Q6(a)/(b), A1+TA1 Q5(b), & A2+TA2 Q10(a) presets.',
    actionKind: 'lab',
    targetLab: 'bplus',
    actionLabel: 'Open B+ Tree Lab',
  },
  {
    id: 'imp-2',
    order: 2,
    title: 'Timestamp Ordering & Log-Based Recovery Interactive Lab',
    detail:
      'Trace Basic Timestamp Ordering (RTS/WTS) vs Thomas Write Rule conflicts and simulate Deferred vs Immediate Write-Ahead Logging (UNDO/REDO) crash recovery.',
    actionKind: 'lab',
    targetLab: 'timestamp_recovery',
    actionLabel: 'Open TO & Recovery Lab',
  },
  {
    id: 'imp-3',
    order: 3,
    title: 'Hashing & Multilevel Index Disk I/O Calculator Lab',
    detail:
      'Extendible vs Linear Hashing bucket-split visualizer (A1 Q5a) plus Primary/Dense/Clustering multilevel index block & Disk I/O calculator (A2 Q4).',
    actionKind: 'lab',
    targetLab: 'hashing_index',
    actionLabel: 'Open Hashing & Index Lab',
  },
  {
    id: 'imp-4',
    order: 4,
    title: 'Persist All 68 Topic Self-Check MCQs & Missed-Question Queue',
    detail:
      'Persist per-topic self-check selections in localStorage and surface a cross-topic weak/missed-question drill filter.',
    actionKind: 'missed_queue',
    actionLabel: 'Open Missed-Q Queue',
  },
  {
    id: 'imp-5',
    order: 5,
    title: '3-Hour Full Exam Mode, Rubric Self-Grader & Printable Cheat Sheet',
    detail:
      'Full 100-mark 3-hour countdown timer, per-question sub-part self-grading ledger, and clean @media print formula sheets.',
    actionKind: 'mock',
    actionLabel: 'Open 3h Exam Mode',
    secondaryLabel: 'Formula Sheet',
  },
  {
    id: 'imp-6',
    order: 6,
    title: 'Deep-Search Match Highlighting & Direct FAT-to-Syllabus Navigation',
    detail:
      'Highlight matched snippets inside Syllabus deep-dive sections and jump directly between worked FAT Mock solutions and syllabus topics.',
    actionKind: 'syllabus',
    actionLabel: 'Try Deep Search',
  },
  {
    id: 'imp-7',
    order: 7,
    title: '3NF Synthesis, BCNF Decomposition Tree & Chase Lossless-Join Solver',
    detail:
      'Extend the Normalization Lab to generate exact 3NF synthesis tables, step-by-step BCNF splits (R1 = X+, R2 = R - (X+ - X)), dependency-preservation checks, and the Chase tableau matrix (A1 Q4, A2 Q9a, Model Q3).',
    actionKind: 'lab',
    targetLab: 'normalization',
    actionLabel: 'Open 3NF / BCNF / Chase Lab',
  },
  {
    id: 'imp-8',
    order: 8,
    title: 'Relational Algebra, TRC & Heuristic Query-Tree Interactive Sandbox',
    detail:
      'Live STUDENT/COURSE/ENROLLMENT evaluator for σ, π, ⋈, and Division (÷), TRC quantifier (∃/∀) verifier, and step-by-step heuristic query-tree pushdown visualizer showing intermediate tuple reduction (A1 Q6, Model Q8).',
    actionKind: 'lab',
    targetLab: 'ra_trc_tree',
    actionLabel: 'Open RA / TRC / Query-Tree Lab',
  },
  {
    id: 'imp-9',
    order: 9,
    title: '2PL Lock-Table, Wait-For Graph & Wait-Die / Wound-Wait Deadlock Tracer',
    detail:
      'Trace Strict/Rigorous 2PL S/X lock grants, blocked queues, Wait-For Graph cycles, Wait-Die vs Wound-Wait abort decisions by TS(Ti), and Multiple Granularity (IS/IX/SIX) compatibility checks (A1 Q8a, A2 Q6, Model Q7).',
    actionKind: 'lab',
    targetLab: 'two_pl_deadlock',
    actionLabel: 'Open 2PL & Deadlock Lab',
  },
  {
    id: 'imp-10',
    order: 10,
    title: 'Module 5 DDBMS Semijoin Cost Calculator & 2PC Crash-Recovery Stepper',
    detail:
      'Compare Naive Join vs Semijoin (R ⋉ S) network byte-transfer cost, validate Horizontal/Vertical fragmentation Completeness/Disjointness/Reconstruction rules, and simulate 2PC coordinator/participant crash recovery (A1 Q9–10, A2 Q7–8, Model Q10).',
    actionKind: 'lab',
    targetLab: 'ddbms_2pc',
    actionLabel: 'Open DDBMS & 2PC Lab',
  },
  {
    id: 'imp-11',
    order: 11,
    title: 'ER/EER 7-Step Mapping Drill, 48h High-Yield Triage Mode & Rapid Flashcards',
    detail:
      'Interactive ER/EER-to-Relational (8A–8D) schema mapper quiz (A2 Q3, Model Q1), an 80/20 From-Scratch First-Pass filter in 48h Plan for a fast 65–70M baseline, and a morning rapid-fire formula & axiom flashcard deck.',
    actionKind: 'lab',
    targetLab: 'er_mapping',
    actionLabel: 'Open ER/EER Mapper',
    secondaryLabel: 'Rapid Flashcards',
    secondaryKind: 'flashcards',
  },
  {
    id: 'imp-12',
    order: 12,
    title: 'Module 1 Integrity Constraint Violation & Referential Action Tracer',
    detail:
      'Interactive INSERT/DELETE/UPDATE simulator checking Domain, Key, Entity Integrity (NULL PK), and Referential Integrity violations while contrasting RESTRICT, CASCADE, SET NULL, and SET DEFAULT outcomes (A1 Q2, A2 Q2).',
    actionKind: 'lab',
    targetLab: 'integrity',
    actionLabel: 'Open Integrity & FK Lab',
  },
  {
    id: 'imp-13',
    order: 13,
    title: 'Syllabus Topic Mastery Progress Indicator on 48h Plan Dashboard',
    detail:
      'Live syllabus mastery percentage indicator on the 48h Plan dashboard calculated from mastered topics vs. total topics (30 across Modules 1–5) with clickable M1–M5 per-module progress breakdown.',
    actionKind: 'syllabus',
    actionLabel: 'Track Topic Mastery',
  },
];

type DayFilter = 'All' | 'Nov 21' | 'Nov 22' | 'Nov 23';

const MODULE_SWATCHES: Record<'m1' | 'm2' | 'm3' | 'm4' | 'm5', { bg: string; text: string }> = {
  m1: { bg: '#E5B82E', text: '#1C1B18' },
  m2: { bg: '#E06D2B', text: '#1C1B18' },
  m3: { bg: '#4F8A3D', text: '#FAF7F0' },
  m4: { bg: '#147E7B', text: '#FAF7F0' },
  m5: { bg: '#22559C', text: '#FAF7F0' },
};

export const SprintPlannerView: React.FC<SprintPlannerViewProps> = ({
  activeModuleId = 'm1',
  divisionColors,
  completedBlockIds,
  masteredTopicIds,
  readiness,
  onToggleBlock,
  onResetProgress,
  completedUpgradeIds,
  onToggleUpgrade,
  onNavigateToModule,
  onNavigateToLab,
  onStartMock,
  onOpenMissedQueue,
  onOpenSyllabus,
  onOpenReference,
  onOpenFlashcards,
  onOpenPlaybook,
}) => {
  const activeRingHex =
    divisionColors?.[activeModuleId]?.hex ?? MODULE_SWATCHES[activeModuleId].bg;
  const activeModuleCode =
    divisionColors?.[activeModuleId]?.code ?? `M${activeModuleId.slice(1)}`;
  const [dayFilter, setDayFilter] = useState<DayFilter>('All');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [highYieldOnly, setHighYieldOnly] = useState(false);
  const implementedUpgradeCount = useMemo(
    () =>
      completedUpgradeIds.filter((id) => APP_IMPROVEMENT_ROADMAP.some((r) => r.id === id)).length,
    [completedUpgradeIds]
  );
  const [showUpgradeChecklist, setShowUpgradeChecklist] = useState<boolean>(
    implementedUpgradeCount < APP_IMPROVEMENT_ROADMAP.length
  );

  const handleSmartAction = (action: SmartNextAction) => {
    const t = action.target;
    if (t.kind === 'missed_queue') {
      onOpenMissedQueue();
    } else if (t.kind === 'module') {
      onNavigateToModule(t.moduleId);
    } else if (t.kind === 'lab') {
      onNavigateToLab(t.labId);
    } else if (t.kind === 'mock') {
      onStartMock();
    } else if (t.kind === 'playbook') {
      onOpenPlaybook();
    } else {
      onOpenFlashcards();
    }
  };

  const stats = useMemo(
    () => calculateSprintStats(SPRINT_BLOCKS, completedBlockIds),
    [completedBlockIds]
  );

  const masteryStats = useMemo(
    () => calculateTopicMasteryStats(MODULES, masteredTopicIds),
    [masteredTopicIds]
  );

  const masteryByModule = useMemo(() => {
    const map = new Map<string, (typeof masteryStats.perModule)[number]>();
    for (const m of masteryStats.perModule) {
      map.set(m.moduleId, m);
    }
    return map;
  }, [masteryStats]);

  const triageSummary = useMemo(
    () => calculateTriageSummary(SPRINT_BLOCKS, completedBlockIds),
    [completedBlockIds]
  );

  const filteredBlocks = useMemo(
    () =>
      filterSprintBlocks(SPRINT_BLOCKS, {
        dayFilter,
        hideCompleted,
        highYieldOnly,
        completedBlockIds,
      }),
    [dayFilter, hideCompleted, highYieldOnly, completedBlockIds]
  );

  const completedSet = useMemo(() => new Set(completedBlockIds), [completedBlockIds]);

  const handleOpenTarget = (block: SprintBlock) => {
    if (block.targetView === 'mock') {
      onStartMock();
      return;
    }
    if (block.targetView === 'labs' && block.targetLab) {
      onNavigateToLab(block.targetLab);
      return;
    }
    if (block.moduleId !== 'all') {
      onNavigateToModule(block.moduleId);
    } else {
      onNavigateToModule('m1');
    }
  };

  return (
    <div className="space-y-8">
      {/* Architectural Specification Masthead (Hairline Grid — Zero Eyebrow Kickers Above H1) */}
      <section className="border-t-2 border-b border-[#1C1B18] grid grid-cols-1 lg:grid-cols-12">
        {/* Left 7 cols: Display Title + Serif Manual Lead + Primary Action */}
        <div className="lg:col-span-7 py-6 sm:py-8 lg:pr-8 lg:border-r border-[#C5BEB0] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl font-display font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-[#1C1B18] text-balance">
              48-Hour FAT Sprint Manual: Modules 1 to 5
            </h1>
            <p className="prose-manual">
              Structured two-day engineering schedule across 43 lecture hours of core database theory, interactive numerical labs, and full 100-mark End Semester FAT slot drills before 23 Nov 2026, 09:00 AM IST.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2 text-xs font-mono text-[#434038] tabular-nums">
              <span>{COURSE_META.code} {COURSE_META.title}</span>
              <span aria-hidden="true">·</span>
              <span>{COURSE_META.institution}</span>
              <span aria-hidden="true">·</span>
              <span>{COURSE_META.credits}</span>
            </div>
          </div>

          <ExamCountdown variant="hero" />

          <div className="pt-4 border-t border-[#C5BEB0] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onStartMock}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 text-xs font-mono font-semibold uppercase tracking-[0.06em] text-[#1C1B18] bg-[#E5B82E] hover:bg-[#d8aa22] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0"
              >
                <span>Take FAT Mock</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onNavigateToModule('m1')}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium uppercase tracking-[0.06em] text-[#1C1B18] bg-[#FAF7F0] hover:bg-[#1C1B18] hover:text-[#FAF7F0] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0"
              >
                <span>Open Syllabus Manual</span>
              </button>
            </div>

            {completedBlockIds.length > 0 && (
              <button
                type="button"
                onClick={onResetProgress}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-[#434038] hover:text-[#1C1B18] border border-[#C5BEB0] hover:border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset Sprint Progress</span>
              </button>
            )}
          </div>
        </div>

        {/* Right 5 cols: Specification Ledger, Syllabus Mastery & Sprint Schedule */}
        <div className="lg:col-span-5 py-6 sm:py-8 lg:pl-8 border-t lg:border-t-0 border-[#C5BEB0] flex flex-col justify-between space-y-4">
          <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 sm:p-5 space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-mono font-semibold uppercase tracking-[0.08em] text-[#1C1B18]">
                Sprint Execution Ledger
              </h2>
              <span className="font-mono text-xs text-[#434038] tabular-nums">
                {stats.completedHours} / {stats.totalHours} hrs
              </span>
            </div>

            <div className="flex items-end justify-between gap-4">
              <div className="flex items-baseline gap-2">
                <span
                  className="text-3xl sm:text-4xl font-display font-extrabold text-[#1C1B18] tabular-nums"
                  data-testid="sprint-percent"
                >
                  {stats.percentComplete}%
                </span>
                <span className="text-xs font-mono text-[#434038] tabular-nums">
                  ({stats.completedCount} of {stats.totalCount} blocks)
                </span>
              </div>

              {/* 10-bar manual progress meter matching rw-manual-acetate-tab-board */}
              <div className="flex items-end gap-1 h-8" aria-hidden="true">
                {SPRINT_BLOCKS.map((b, i) => {
                  const done = completedSet.has(b.id);
                  const hPx = 12 + ((i % 5) + 1) * 4;
                  return (
                    <span
                      key={b.id}
                      style={{ height: `${hPx}px` }}
                      className={`w-1.5 rounded-[1px] ${
                        done ? 'bg-[#4F8A3D]' : 'bg-[#E5B82E]'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Syllabus Topic Mastery Progress Indicator */}
          <div
            data-testid="syllabus-mastery-card"
            className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 sm:p-5 space-y-3"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-mono font-semibold uppercase tracking-[0.08em] text-[#1C1B18]">
                Syllabus Topic Mastery
              </h2>
              <span
                data-testid="syllabus-mastery-ratio"
                className="font-mono text-xs text-[#434038] tabular-nums"
              >
                {masteryStats.masteredCount} / {masteryStats.totalTopics} topics
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span
                    data-testid="syllabus-mastery-percent"
                    className="text-3xl sm:text-4xl font-display font-extrabold text-[#1C1B18] tabular-nums"
                  >
                    {masteryStats.percentComplete}%
                  </span>
                  <span className="text-xs font-mono text-[#434038]">
                    {masteryStats.masteredCount === masteryStats.totalTopics
                      ? 'All 5 modules mastered'
                      : `${masteryStats.totalTopics - masteryStats.masteredCount} remaining`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onOpenSyllabus}
                  className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#1C1B18] underline underline-offset-4 hover:text-[#22559C] whitespace-nowrap"
                >
                  Mark Topics →
                </button>
              </div>

              <div
                role="progressbar"
                aria-label="Syllabus topic mastery"
                aria-valuenow={masteryStats.percentComplete}
                aria-valuemin={0}
                aria-valuemax={100}
                className="w-full h-2.5 bg-[#EAE4D7] border border-[#1C1B18] rounded-[2px] overflow-hidden"
              >
                <div
                  style={{ width: `${masteryStats.percentComplete}%` }}
                  className="h-full bg-[#4F8A3D] transition-[width] duration-300"
                />
              </div>
            </div>

            {/* Clickable Per-Module M1-M5 Mini Progress Breakdown */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {masteryStats.perModule.map((mod) => {
                const swatch = MODULE_SWATCHES[mod.moduleId];
                return (
                  <button
                    key={mod.moduleId}
                    type="button"
                    onClick={() => onNavigateToModule(mod.moduleId)}
                    aria-label={`Open Module ${mod.number} (${mod.masteredCount} of ${mod.totalTopics} topics mastered)`}
                    className="text-left bg-[#F4EFE4] hover:bg-[#EAE4D7] border border-[#1C1B18]/40 hover:border-[#1C1B18] rounded-[3px] p-1.5 space-y-1 step-hinge"
                  >
                    <div className="flex items-center justify-between gap-1 font-mono text-[10px] font-bold text-[#1C1B18] tabular-nums">
                      <span>M{mod.number}</span>
                      <span className="text-[#434038]">
                        {mod.masteredCount}/{mod.totalTopics}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#FAF7F0] border border-[#1C1B18]/30 rounded-[1px] overflow-hidden">
                      <div
                        style={{
                          width: `${mod.percentComplete}%`,
                          backgroundColor: swatch.bg,
                        }}
                        className="h-full transition-[width] duration-300"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 sm:p-5 divide-y divide-[#C5BEB0] text-xs font-mono tabular-nums">
            <div className="pb-2.5 flex items-center justify-between gap-2">
              <span className="text-[#434038]">Prep Window (21 Nov)</span>
              <span className="font-semibold text-[#1C1B18]">Modules 1, 2, 3A</span>
            </div>
            <div className="py-2.5 flex items-center justify-between gap-2">
              <span className="text-[#434038]">Final Day (22 Nov)</span>
              <span className="font-semibold text-[#1C1B18]">Modules 3B, 4, 5 + Mock</span>
            </div>
            <div className="pt-2.5 flex items-center justify-between gap-2">
              <span className="text-[#434038]">Exam Slot (23 Nov 2026, 09:00 AM IST)</span>
              <span className="font-semibold text-[#4F8A3D]">07:00 Formula Scan</span>
            </div>
          </div>
        </div>
      </section>

      {/* Compact Pomodoro Focus Timer — directly below progress stats, non-blocking */}
      <PomodoroTimer
        ringColorHex={activeRingHex}
        activeModuleCode={activeModuleCode}
      />

      {/* 5-Division Module Index Strip (Color-Coded Manual Tabs) */}
      <section aria-label="Module hour distribution" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {MODULES.map((mod) => {
          const swatch = MODULE_SWATCHES[mod.id];
          const modStat = masteryByModule.get(mod.id);
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => onNavigateToModule(mod.id)}
              className="text-left bg-[#FAF7F0] hover:bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-3.5 flex items-start gap-3 step-hinge"
            >
              <div
                style={{ backgroundColor: swatch.bg, color: swatch.text }}
                className="w-11 h-11 rounded-[3px] border border-[#1C1B18] flex flex-col items-center justify-center shrink-0 font-mono text-xs font-bold tabular-nums"
              >
                <span>M{mod.number}</span>
                <span className="text-[10px] font-normal">{mod.hours}h</span>
              </div>
              <div className="min-w-0 space-y-1 flex-1">
                <div className="text-[13px] leading-snug font-display font-bold text-[#1C1B18]">
                  {mod.title}
                </div>
                <div className="text-[11px] font-mono text-[#434038] tabular-nums">
                  {modStat ? `${modStat.masteredCount}/${modStat.totalTopics} topics (${modStat.percentComplete}%)` : 'Open Division →'}
                </div>
              </div>
            </button>
          );
        })}
      </section>

      {/* 95+ Exam Readiness Command Panel & Smart Next-Action Coach */}
      <section
        aria-label="95+ exam readiness coach"
        data-testid="readiness-command-panel"
        className="bg-[#FAF7F0] border-2 border-[#1C1B18] rounded-[4px] overflow-hidden"
      >
        <div className="px-5 py-3.5 bg-[#1C1B18] text-[#FAF7F0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Target className="w-4 h-4 text-[#E5B82E] shrink-0" aria-hidden="true" />
            <h2 className="text-sm sm:text-base font-display font-extrabold tracking-wide uppercase">
              95+ Target Readiness &amp; Next-Best Action Coach
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateToLab('exam_drill')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold bg-[#E5B82E] hover:bg-[#d8aa22] text-[#1C1B18] border border-[#FAF7F0]/30 rounded-[3px] step-hinge whitespace-nowrap"
            >
              <Dices className="w-3.5 h-3.5" aria-hidden="true" />
              <span>95+ Drill Arena</span>
            </button>
            <button
              type="button"
              onClick={onOpenPlaybook}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold bg-[#FAF7F0] hover:bg-[#EAE4D7] text-[#1C1B18] rounded-[3px] step-hinge whitespace-nowrap"
            >
              <Award className="w-3.5 h-3.5" aria-hidden="true" />
              <span>95+ Examiner Playbook</span>
            </button>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 5 cols: Composite Readiness Gauge + 5 Live Telemetry Counters */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-4 space-y-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <span
                    data-testid="readiness-score"
                    className="text-3xl sm:text-4xl font-display font-extrabold text-[#1C1B18] tabular-nums"
                  >
                    {readiness.overallScore}
                  </span>
                  <span className="text-xs font-mono text-[#6E695D] ml-1">/ 100 readiness</span>
                </div>
                <span
                  data-testid="readiness-band"
                  className={`px-2.5 py-1 text-xs font-mono font-extrabold rounded-[3px] border border-[#1C1B18] tabular-nums ${
                    readiness.overallScore >= 90
                      ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                      : readiness.overallScore >= 60
                      ? 'bg-[#E5B82E] text-[#1C1B18]'
                      : 'bg-[#E06D2B] text-[#1C1B18]'
                  }`}
                >
                  Est: {readiness.projectedBand}
                </span>
              </div>

              <div
                role="progressbar"
                aria-label="Composite 95+ exam readiness"
                aria-valuenow={readiness.overallScore}
                aria-valuemin={0}
                aria-valuemax={100}
                className="w-full h-2.5 bg-[#FAF7F0] border border-[#1C1B18] rounded-[2px] overflow-hidden"
              >
                <div
                  style={{ width: `${readiness.overallScore}%` }}
                  className="h-full bg-[#4F8A3D] transition-[width] duration-300"
                />
              </div>

              <p className="text-xs font-mono text-[#434038] leading-snug">
                {readiness.projectedHeadline}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono tabular-nums">
              <div className="bg-[#F4EFE4] border border-[#1C1B18]/40 rounded-[3px] p-2.5">
                <div className="text-[10px] text-[#6E695D] uppercase">MCQs Correct</div>
                <div className="font-bold text-[#1C1B18] mt-0.5">
                  {readiness.counts.selfCheckCorrect + readiness.counts.fatMcqCorrect} /{' '}
                  {readiness.counts.selfCheckTotal + readiness.counts.fatMcqTotal}
                </div>
              </div>
              <div className="bg-[#F4EFE4] border border-[#1C1B18]/40 rounded-[3px] p-2.5">
                <div className="text-[10px] text-[#6E695D] uppercase">Best 100M Paper</div>
                <div className="font-bold text-[#1C1B18] mt-0.5">
                  {readiness.counts.bestPaperScore} / 100
                </div>
              </div>
              <div className="bg-[#F4EFE4] border border-[#1C1B18]/40 rounded-[3px] p-2.5">
                <div className="text-[10px] text-[#6E695D] uppercase">Drills Solved</div>
                <div className="font-bold text-[#1C1B18] mt-0.5" data-testid="readiness-drills-count">
                  {readiness.counts.drillSolvedCount} / {readiness.counts.drillTargetCount}
                </div>
              </div>
              <div className="bg-[#F4EFE4] border border-[#1C1B18]/40 rounded-[3px] p-2.5">
                <div className="text-[10px] text-[#6E695D] uppercase">Flashcards</div>
                <div className="font-bold text-[#1C1B18] mt-0.5">
                  {readiness.counts.flashcardsKnown} / {readiness.counts.flashcardsTotal}
                </div>
              </div>
              <div className="bg-[#F4EFE4] border border-[#1C1B18]/40 rounded-[3px] p-2.5">
                <div className="text-[10px] text-[#6E695D] uppercase">-2M Traps</div>
                <div className="font-bold text-[#1C1B18] mt-0.5" data-testid="readiness-traps-count">
                  {readiness.counts.trapsLocked} / {readiness.counts.trapsTotal}
                </div>
              </div>
              <div className="bg-[#F4EFE4] border border-[#1C1B18]/40 rounded-[3px] p-2.5">
                <div className="text-[10px] text-[#6E695D] uppercase">Weakest Link</div>
                <div className="font-bold text-[#A62B2B] mt-0.5">
                  M{readiness.weakestModule.number} ({readiness.weakestModule.readinessPct}%)
                </div>
              </div>
            </div>
          </div>

          {/* Right 7 cols: Prioritized Next-Best Actions */}
          <div className="lg:col-span-7 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#434038]">
                Highest-ROI Next Actions to Reach 95+/100
              </h3>
              <span className="text-[11px] font-mono text-[#6E695D]">
                Auto-ranked from your live progress
              </span>
            </div>

            {readiness.nextActions.length === 0 ? (
              <div className="bg-[#4F8A3D]/15 border border-[#4F8A3D] rounded-[4px] p-4 text-xs font-bold text-[#1C1B18]">
                All 95+ readiness milestones cleared! Do one light 5-minute formula scan and get full rest before 09:00 AM.
              </div>
            ) : (
              <div className="space-y-2.5">
                {readiness.nextActions.map((act) => (
                  <div
                    key={act.id}
                    className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-mono font-extrabold rounded-[2px] border border-[#1C1B18] ${
                            act.priority === 'CRITICAL'
                              ? 'bg-[#A62B2B] text-[#FAF7F0]'
                              : act.priority === 'HIGH'
                              ? 'bg-[#E06D2B] text-[#1C1B18]'
                              : 'bg-[#4F8A3D] text-[#FAF7F0]'
                          }`}
                        >
                          {act.priority}
                        </span>
                        <span className="text-xs sm:text-sm font-display font-bold text-[#1C1B18]">
                          {act.title}
                        </span>
                      </div>
                      <p className="text-xs text-[#434038] leading-snug">{act.reason}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSmartAction(act)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold bg-[#E5B82E] hover:bg-[#d8aa22] text-[#1C1B18] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap self-start sm:self-auto shrink-0"
                    >
                      <span>{act.ctaLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Persisted App Improvement Checklist (Collapsible once 13/13 Implemented so 48h Timetable sits high) */}
      <section
        aria-label="App improvement checklist"
        data-testid="upgrade-checklist"
        className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] overflow-hidden"
      >
        <div className="px-5 py-3.5 bg-[#EAE4D7] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-display font-extrabold text-[#1C1B18]">
              App Improvement Checklist
            </h2>
            <p className="text-xs font-mono text-[#434038]">
              All 13 syllabus, lab &amp; mastery upgrades complete · quick-launch any module tool below
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              data-testid="upgrade-checklist-count"
              className="px-2.5 py-1 text-xs font-mono font-bold bg-[#4F8A3D] text-[#FAF7F0] border border-[#1C1B18] rounded-[2px] tabular-nums"
            >
              {implementedUpgradeCount} / {APP_IMPROVEMENT_ROADMAP.length} Implemented
            </span>
            <button
              type="button"
              data-testid="toggle-upgrade-checklist"
              aria-expanded={showUpgradeChecklist}
              onClick={() => setShowUpgradeChecklist((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold bg-[#FAF7F0] hover:bg-[#F4EFE4] text-[#1C1B18] border border-[#1C1B18] rounded-[3px] step-hinge"
            >
              <span>{showUpgradeChecklist ? 'Hide Checklist' : 'Show All 13 Upgrades'}</span>
              {showUpgradeChecklist ? (
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {showUpgradeChecklist && (
          <div className="divide-y divide-[#C5BEB0] border-t border-[#1C1B18]">
            {APP_IMPROVEMENT_ROADMAP.map((item) => {
              const done = completedUpgradeIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 step-hinge ${
                    done ? 'bg-[#EAE4D7]/55' : 'bg-[#FAF7F0]'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleUpgrade(item.id)}
                      aria-label={
                        done
                          ? `Mark improvement "${item.title}" pending`
                          : `Mark improvement "${item.title}" implemented`
                      }
                      aria-pressed={done}
                      className={`mt-0.5 w-6 h-6 rounded-full border border-[#1C1B18] flex items-center justify-center shrink-0 step-hinge ${
                        done
                          ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                          : 'bg-[#EAE4D7] hover:bg-[#E5B82E] text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#6E695D] tabular-nums">
                          #{item.order}
                        </span>
                        <h3
                          className={`text-sm font-display font-bold ${
                            done ? 'text-[#434038] line-through' : 'text-[#1C1B18]'
                          }`}
                        >
                          {item.title}
                        </h3>
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-[2px] border border-[#1C1B18] ${
                            done ? 'bg-[#4F8A3D] text-[#FAF7F0]' : 'bg-[#F4EFE4] text-[#434038]'
                          }`}
                        >
                          {done ? 'Implemented' : 'Queued'}
                        </span>
                      </div>
                      <p className="text-xs text-[#434038] leading-relaxed">{item.detail}</p>
                    </div>
                  </div>

                  {item.actionLabel && (
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
                      {item.secondaryLabel && (
                        <button
                          type="button"
                          onClick={
                            item.secondaryKind === 'flashcards' ? onOpenFlashcards : onOpenReference
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-[#1C1B18] bg-[#FAF7F0] hover:bg-[#1C1B18] hover:text-[#FAF7F0] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0"
                        >
                          <span>{item.secondaryLabel}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (item.actionKind === 'lab' && item.targetLab) {
                            onNavigateToLab(item.targetLab);
                          } else if (item.actionKind === 'missed_queue') {
                            onOpenMissedQueue();
                          } else if (item.actionKind === 'mock') {
                            onStartMock();
                          } else {
                            onOpenSyllabus();
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-[#1C1B18] bg-[#E5B82E] hover:bg-[#d8aa22] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0"
                      >
                        <span>{item.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Schedule Toolbar + Timetable Ledger */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#1C1B18]">
          <div className="flex items-center gap-1 p-1 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] overflow-x-auto">
            {(['All', 'Nov 21', 'Nov 22', 'Nov 23'] as DayFilter[]).map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setDayFilter(day)}
                className={`px-3.5 py-1.5 text-xs font-mono font-medium uppercase tracking-wider rounded-[3px] step-hinge whitespace-nowrap shrink-0 ${
                  dayFilter === day
                    ? 'bg-[#E5B82E] text-[#1C1B18] border border-[#1C1B18] font-semibold'
                    : 'text-[#434038] hover:text-[#1C1B18]'
                }`}
              >
                {day === 'All' ? 'All 48 Hours' : day}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              data-testid="triage-toggle"
              aria-pressed={highYieldOnly}
              onClick={() => setHighYieldOnly((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap ${
                highYieldOnly
                  ? 'bg-[#E06D2B] text-[#1C1B18]'
                  : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>80/20 High-Yield Triage ({triageSummary.coreBlockCount} Core)</span>
            </button>

            <label className="inline-flex items-center gap-2 text-xs font-mono text-[#1C1B18] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hideCompleted}
                onChange={(e) => setHideCompleted(e.target.checked)}
                className="w-4 h-4 rounded-[2px] border-[#1C1B18] accent-[#1C1B18]"
              />
              <span>Hide completed blocks</span>
            </label>
          </div>
        </div>

        {highYieldOnly && (
          <div
            data-testid="triage-banner"
            className="bg-[#FAF7F0] border-2 border-[#E06D2B] rounded-[4px] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div className="space-y-0.5">
              <div className="text-xs font-extrabold text-[#1C1B18]">
                80/20 From-Scratch First-Pass Mode Active — Target: {triageSummary.targetMarkBand}
              </div>
              <p className="text-xs text-[#434038]">
                Focuses exclusively on the {triageSummary.coreBlockCount} highest-ROI blocks ({triageSummary.estimatedPrepHours}h study covering {triageSummary.coreSyllabusHours} syllabus hrs: ER/EER, FDs/BCNF, B+ Trees, RA/TRC, Serializability, DDBMS/CAP).
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-[3px] border border-[#1C1B18] bg-[#E06D2B] text-[#1C1B18] font-mono text-xs font-extrabold tabular-nums whitespace-nowrap self-start sm:self-auto shrink-0">
              {triageSummary.completedCoreCount} / {triageSummary.coreBlockCount} Core ({triageSummary.corePercent}%)
            </span>
          </div>
        )}

        {filteredBlocks.length === 0 ? (
          <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-10 text-center space-y-2">
            <p className="text-sm font-display font-bold text-[#1C1B18]">All blocks in this view are completed.</p>
            <p className="text-xs font-mono text-[#434038]">Uncheck "Hide completed blocks" or switch to the FAT Mock exam.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1C1B18] border border-[#1C1B18] rounded-[4px] bg-[#FAF7F0]" data-testid="sprint-block-list">
            {filteredBlocks.map((block) => {
              const isDone = completedSet.has(block.id);
              const modSwatch =
                block.moduleId !== 'all' ? MODULE_SWATCHES[block.moduleId] : { bg: '#854D2B', text: '#FAF7F0' };

              return (
                <div
                  key={block.id}
                  className={`p-5 sm:p-6 step-hinge ${
                    isDone ? 'bg-[#EAE4D7]/60' : 'bg-[#FAF7F0]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Punched Acetate Check Button */}
                      <button
                        type="button"
                        onClick={() => onToggleBlock(block.id)}
                        aria-label={isDone ? `Mark "${block.title}" incomplete` : `Mark "${block.title}" complete`}
                        aria-pressed={isDone}
                        className={`mt-1 w-6 h-6 rounded-full border border-[#1C1B18] flex items-center justify-center shrink-0 step-hinge ${
                          isDone
                            ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                            : 'bg-[#EAE4D7] hover:bg-[#E5B82E] text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>

                      <div className="space-y-2.5">
                        {/* Heading FIRST — zero eyebrow above h2 (craft-floor rule) */}
                        <h2
                          className={`text-base sm:text-lg font-display font-bold ${
                            isDone ? 'text-[#6E695D] line-through' : 'text-[#1C1B18]'
                          }`}
                        >
                          {block.title}
                        </h2>

                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#434038] tabular-nums">
                          <span
                            style={{ backgroundColor: modSwatch.bg, color: modSwatch.text }}
                            className="px-1.5 py-0.5 rounded-[2px] border border-[#1C1B18] font-semibold text-[11px]"
                          >
                            {block.day}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{block.timeSlot}</span>
                          <span aria-hidden="true">·</span>
                          <span>{block.durationLabel}</span>
                          {TRIAGE_HIGH_YIELD_BLOCK_IDS.has(block.id) && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="px-1.5 py-0.5 rounded-[2px] border border-[#1C1B18] bg-[#E06D2B]/20 text-[#1C1B18] font-bold text-[10px]">
                                80/20 CORE
                              </span>
                            </>
                          )}
                          {isDone && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold text-[#4F8A3D]">Completed</span>
                            </>
                          )}
                        </div>

                        <p className="text-sm text-[#2C2A25] leading-relaxed max-w-3xl">
                          {block.focusSummary}
                        </p>

                        <ul className="pt-1 space-y-1 text-xs text-[#434038] list-disc pl-4 marker:text-[#6E695D]">
                          {block.checklist.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-col items-end justify-end gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenTarget(block)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#1C1B18] bg-[#E5B82E] hover:bg-[#d8aa22] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0"
                      >
                        <span>
                          {block.targetView === 'labs'
                            ? 'Open Lab'
                            : block.targetView === 'mock'
                            ? 'Start Mock'
                            : 'Study Notes'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      {block.targetView === 'syllabus' && block.targetLab && (
                        <button
                          type="button"
                          onClick={() => onNavigateToLab(block.targetLab!)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#1C1B18] bg-[#FAF7F0] hover:bg-[#1C1B18] hover:text-[#FAF7F0] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap shrink-0"
                        >
                          <span>Practice Lab</span>
                          <ArrowRight className="w-3 h-3" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
