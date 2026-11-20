// ============================================================================
// BACSE202 95+ Exam Readiness Telemetry & Smart Next-Action Coach Engine
// Pure, deterministic logic decoupled from UI for unit testing.
// Aggregates all 6 persisted study signals to project exam readiness (0-100),
// identify the weakest module, and generate prioritized 1-click next actions.
// ============================================================================

import { ModuleData, SprintBlock } from '../data/bacse202Data';
import { calculateSprintStats, calculateTopicMasteryStats } from './dbEngine';
import { FLASHCARD_DECK } from './erFlashcardEngine';
import { EXAM_TRAP_BUSTERS } from './numericalDrillEngine';

export interface ReadinessInput {
  modules: ModuleData[];
  sprintBlocks: SprintBlock[];
  completedBlockIds: string[];
  masteredTopicIds: string[];
  selfCheckItems: Array<{
    key: string;
    moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
    correctIndex: number;
  }>;
  selfCheckSelections: Record<string, number>;
  fatQuestions: Array<{
    id: string;
    moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
    correctIndex: number;
  }>;
  mockAnswers: Record<string, number>;
  rubricScores: Record<string, number>;
  knownFlashcardIds: string[];
  drillSolvedCount: number;
  lockedTrapIds: string[];
}

export interface ModuleReadinessStat {
  moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
  number: number;
  title: string;
  hours: number;
  topicsMastered: number;
  topicsTotal: number;
  mcqAnswered: number;
  mcqCorrect: number;
  mcqMissed: number;
  readinessPct: number;
}

export interface SmartNextAction {
  id: string;
  priority: 'CRITICAL' | 'HIGH' | 'POLISH';
  title: string;
  reason: string;
  ctaLabel: string;
  target:
    | { kind: 'missed_queue' }
    | { kind: 'module'; moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5' }
    | { kind: 'lab'; labId: 'exam_drill' | 'normalization' | 'bplus' | 'serializability' | 'ddbms_2pc' }
    | { kind: 'mock' }
    | { kind: 'playbook' }
    | { kind: 'flashcards' };
}

export interface ExamReadinessReport {
  overallScore: number; // 0 - 100 composite readiness
  projectedBand: string;
  projectedHeadline: string;
  dimensions: {
    topicMasteryPct: number;
    sprintPct: number;
    activeRecallPct: number;
    bestPaperScore: number;
    drillsAndCardsPct: number;
  };
  counts: {
    topicsMastered: number;
    topicsTotal: number;
    selfCheckCorrect: number;
    selfCheckTotal: number;
    selfCheckMissed: number;
    fatMcqCorrect: number;
    fatMcqTotal: number;
    bestPaperScore: number;
    flashcardsKnown: number;
    flashcardsTotal: number;
    drillSolvedCount: number;
    drillTargetCount: number;
    trapsLocked: number;
    trapsTotal: number;
  };
  perModule: ModuleReadinessStat[];
  weakestModule: ModuleReadinessStat;
  nextActions: SmartNextAction[];
}

const DRILL_TARGET_COUNT = 12; // Solving 12 unseen numericals (2 per archetype) locks in 60/60 numerical fluency

function computeBestPaperRubricScore(rubricScores: Record<string, number>): number {
  const paperTotals: Record<string, number> = {};
  for (const [key, val] of Object.entries(rubricScores)) {
    if (!Number.isFinite(val) || val < 0) continue;
    const prefix = key.split(':')[0] || 'default';
    paperTotals[prefix] = (paperTotals[prefix] ?? 0) + val;
  }
  const totals = Object.values(paperTotals);
  if (totals.length === 0) return 0;
  return Math.min(100, Math.round(Math.max(...totals)));
}

export function calculateExamReadiness(input: ReadinessInput): ExamReadinessReport {
  const topicStats = calculateTopicMasteryStats(input.modules, input.masteredTopicIds);
  const sprintStats = calculateSprintStats(input.sprintBlocks, input.completedBlockIds);

  // Self-check stats + per-module MCQ breakdown
  let selfCheckCorrect = 0;
  let selfCheckMissed = 0;
  const modMcqMap: Record<string, { answered: number; correct: number; missed: number }> = {
    m1: { answered: 0, correct: 0, missed: 0 },
    m2: { answered: 0, correct: 0, missed: 0 },
    m3: { answered: 0, correct: 0, missed: 0 },
    m4: { answered: 0, correct: 0, missed: 0 },
    m5: { answered: 0, correct: 0, missed: 0 },
  };

  for (const sc of input.selfCheckItems) {
    const chosen = input.selfCheckSelections[sc.key];
    if (chosen !== undefined) {
      modMcqMap[sc.moduleId].answered += 1;
      if (chosen === sc.correctIndex) {
        selfCheckCorrect += 1;
        modMcqMap[sc.moduleId].correct += 1;
      } else {
        selfCheckMissed += 1;
        modMcqMap[sc.moduleId].missed += 1;
      }
    }
  }

  let fatMcqCorrect = 0;
  for (const fq of input.fatQuestions) {
    const chosen = input.mockAnswers[fq.id];
    if (chosen !== undefined) {
      modMcqMap[fq.moduleId].answered += 1;
      if (chosen === fq.correctIndex) {
        fatMcqCorrect += 1;
        modMcqMap[fq.moduleId].correct += 1;
      } else {
        modMcqMap[fq.moduleId].missed += 1;
      }
    }
  }

  const totalRecallItems = input.selfCheckItems.length + input.fatQuestions.length;
  const totalRecallCorrect = selfCheckCorrect + fatMcqCorrect;
  const activeRecallPct =
    totalRecallItems === 0 ? 0 : Math.round((totalRecallCorrect / totalRecallItems) * 100);

  const bestPaperScore = computeBestPaperRubricScore(input.rubricScores);

  const validFlashcardSet = new Set(FLASHCARD_DECK.map((c) => c.id));
  const flashcardsKnown = Array.from(new Set(input.knownFlashcardIds)).filter((id) =>
    validFlashcardSet.has(id)
  ).length;
  const flashcardsTotal = FLASHCARD_DECK.length;

  const validTrapSet = new Set(EXAM_TRAP_BUSTERS.map((t) => t.id));
  const trapsLocked = Array.from(new Set(input.lockedTrapIds)).filter((id) =>
    validTrapSet.has(id)
  ).length;
  const trapsTotal = EXAM_TRAP_BUSTERS.length;

  const drillPct = Math.min(100, Math.round((input.drillSolvedCount / DRILL_TARGET_COUNT) * 100));
  const cardsPct =
    flashcardsTotal === 0 ? 0 : Math.round((flashcardsKnown / flashcardsTotal) * 100);
  const trapsPct = trapsTotal === 0 ? 0 : Math.round((trapsLocked / trapsTotal) * 100);
  const drillsAndCardsPct = Math.round(drillPct * 0.5 + cardsPct * 0.3 + trapsPct * 0.2);

  // Composite 0-100 weighted readiness
  // 25% Topics + 15% Sprint Blocks + 25% Active Recall MCQs + 20% Best 100M Paper + 15% Numerical Drills/Cards/Traps
  const overallScore = Math.min(
    100,
    Math.round(
      topicStats.percentComplete * 0.25 +
        sprintStats.percentComplete * 0.15 +
        activeRecallPct * 0.25 +
        bestPaperScore * 0.2 +
        drillsAndCardsPct * 0.15
    )
  );

  let projectedBand = '< 55 / 100';
  let projectedHeadline = 'Foundation Stage — Start 80/20 Core Blocks';
  if (overallScore >= 90) {
    projectedBand = '95 – 100 / 100';
    projectedHeadline = '95+ Topper Ready — Audit Traps & Rest';
  } else if (overallScore >= 75) {
    projectedBand = '85 – 94 / 100';
    projectedHeadline = 'S-Grade Zone — Drill Numericals & Blind 100M Paper';
  } else if (overallScore >= 55) {
    projectedBand = '72 – 84 / 100';
    projectedHeadline = 'Solid A-Grade Base — Patch Weak Modules & Missed Qs';
  } else if (overallScore >= 30) {
    projectedBand = '55 – 71 / 100';
    projectedHeadline = 'Building Momentum — Complete Core Modules & Labs';
  }

  // Per-module readiness combining topic mastery (65%) + MCQ accuracy/coverage (35%)
  const perModule: ModuleReadinessStat[] = input.modules.map((mod) => {
    const tStat = topicStats.perModule.find((m) => m.moduleId === mod.id);
    const mcq = modMcqMap[mod.id];
    const modTotalMcqs =
      input.selfCheckItems.filter((s) => s.moduleId === mod.id).length +
      input.fatQuestions.filter((q) => q.moduleId === mod.id).length;
    const mcqScorePct = modTotalMcqs === 0 ? 0 : Math.round((mcq.correct / modTotalMcqs) * 100);
    const topicPct = tStat?.percentComplete ?? 0;
    const readinessPct = Math.round(topicPct * 0.65 + mcqScorePct * 0.35);

    return {
      moduleId: mod.id,
      number: mod.number,
      title: mod.title,
      hours: mod.hours,
      topicsMastered: tStat?.masteredCount ?? 0,
      topicsTotal: tStat?.totalTopics ?? mod.topics.length,
      mcqAnswered: mcq.answered,
      mcqCorrect: mcq.correct,
      mcqMissed: mcq.missed,
      readinessPct,
    };
  });

  // Identify weakest module (break ties by higher syllabus lecture hours -> M2 & M4 first!)
  const weakestModule = [...perModule].sort((a, b) => {
    if (a.readinessPct !== b.readinessPct) return a.readinessPct - b.readinessPct;
    return b.hours - a.hours;
  })[0];

  // Build top 3 prioritized Next-Best Actions
  const nextActions: SmartNextAction[] = [];

  if (selfCheckMissed > 0) {
    nextActions.push({
      id: 'fix-missed-self-checks',
      priority: 'CRITICAL',
      title: `Repair ${selfCheckMissed} Missed Topic Self-Check${selfCheckMissed === 1 ? '' : 's'}`,
      reason: 'Every unresolved concept mistake risks a -2M to -5M slip in Part B.',
      ctaLabel: 'Open Missed Queue',
      target: { kind: 'missed_queue' },
    });
  }

  if (weakestModule && weakestModule.readinessPct < 85) {
    nextActions.push({
      id: `boost-${weakestModule.moduleId}`,
      priority: weakestModule.readinessPct < 40 ? 'CRITICAL' : 'HIGH',
      title: `Strengthen Module ${weakestModule.number} (${weakestModule.topicsMastered}/${weakestModule.topicsTotal} topics · ${weakestModule.hours}h FAT weight)`,
      reason: `Lowest module readiness (${weakestModule.readinessPct}%). Closing this gap is your highest-ROI score jump.`,
      ctaLabel: `Study M${weakestModule.number}`,
      target: { kind: 'module', moduleId: weakestModule.moduleId },
    });
  }

  if (input.drillSolvedCount < DRILL_TARGET_COUNT) {
    nextActions.push({
      id: 'drill-numericals',
      priority: 'HIGH',
      title: `Solve ${DRILL_TARGET_COUNT - input.drillSolvedCount} More Unseen FAT Numericals (${input.drillSolvedCount}/${DRILL_TARGET_COUNT})`,
      reason: '~60/100 marks come from deterministic Index I/O, B+ Tree, NF, Precedence Graph, WAL & Semijoin calculations.',
      ctaLabel: 'Open Drill Arena',
      target: { kind: 'lab', labId: 'exam_drill' },
    });
  }

  if (bestPaperScore < 90) {
    nextActions.push({
      id: 'blind-100m-paper',
      priority: bestPaperScore === 0 ? 'HIGH' : 'POLISH',
      title:
        bestPaperScore === 0
          ? 'Attempt 1 Blind 100-Mark FAT Paper & Self-Grade'
          : `Push Full-Paper Rubric Score from ${bestPaperScore}/100 to 95+`,
      reason: 'Simulating 3-hour pacing and grading every sub-part exposes answer-writing gaps before Nov 23.',
      ctaLabel: 'Open 100M Mock',
      target: { kind: 'mock' },
    });
  }

  if (trapsLocked < trapsTotal) {
    nextActions.push({
      id: 'lock-exam-traps',
      priority: 'POLISH',
      title: `Lock In ${trapsTotal - trapsLocked} Remaining -2M Examiner Traps`,
      reason: 'Review VIT marking-scheme blueprints and eliminate silly deductions (floor vs ceil, R-R edges, FK NULLs).',
      ctaLabel: 'Open 95+ Playbook',
      target: { kind: 'playbook' },
    });
  }

  if (flashcardsKnown < flashcardsTotal) {
    nextActions.push({
      id: 'rapid-flashcards',
      priority: 'POLISH',
      title: `Clear ${flashcardsTotal - flashcardsKnown} Morning Rapid Flashcards`,
      reason: 'Fast 5-minute formula, axiom & theorem recall lock-in before the exam.',
      ctaLabel: 'Run Flashcards',
      target: { kind: 'flashcards' },
    });
  }

  return {
    overallScore,
    projectedBand,
    projectedHeadline,
    dimensions: {
      topicMasteryPct: topicStats.percentComplete,
      sprintPct: sprintStats.percentComplete,
      activeRecallPct,
      bestPaperScore,
      drillsAndCardsPct,
    },
    counts: {
      topicsMastered: topicStats.masteredCount,
      topicsTotal: topicStats.totalTopics,
      selfCheckCorrect,
      selfCheckTotal: input.selfCheckItems.length,
      selfCheckMissed,
      fatMcqCorrect,
      fatMcqTotal: input.fatQuestions.length,
      bestPaperScore,
      flashcardsKnown,
      flashcardsTotal,
      drillSolvedCount: input.drillSolvedCount,
      drillTargetCount: DRILL_TARGET_COUNT,
      trapsLocked,
      trapsTotal,
    },
    perModule,
    weakestModule,
    nextActions: nextActions.slice(0, 3),
  };
}
