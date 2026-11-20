import type { StandingQuestion } from '../data/standingData';

export type ModuleId = 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
export type StandingTier = 'foundation' | 'application' | 'analysis';
export type StandingGrade = 'A' | 'B' | 'C' | 'D';

export interface ModuleStandingScore {
  foundation: number;
  application: number;
  analysis: number;
  completedAt: string;
}

export type StandingScoresMap = Partial<Record<ModuleId, ModuleStandingScore>>;

export interface WeakTopicEntry {
  questionId: string;
  moduleId: ModuleId;
  tier?: StandingTier;
  source: 'standing' | 'mock';
  prompt: string;
  wrongCount: number;
  lastWrongAt: string;
  lastReviewedAt?: string;
  resolved: boolean;
}

export interface ModuleStandingBreakdown {
  moduleId: ModuleId;
  foundation: number;
  application: number;
  analysis: number;
  total: number;
  grade: StandingGrade;
  wrongQuestionIds: string[];
}

export interface PrescriptiveRecommendation {
  headline: string;
  detail: string;
  priorityTarget: 'notes' | 'labs' | 'mock' | 'ready';
}

export interface AggregateStandingSummary {
  assessedCount: number;
  totalScore: number;
  maxScore: number;
  showRadar: boolean;
  verdict: string;
  band: 'strong' | 'decent' | 'gaps' | 'start';
}

export const MODULE_ORDER: ModuleId[] = ['m1', 'm2', 'm3', 'm4', 'm5'];

export const TIER_META: Record<
  StandingTier,
  {
    label: string;
    shortLabel: string;
    subtitle: string;
    stars: string;
    colorHex: string;
    barClass: string;
    textClass: string;
    bgTintClass: string;
    borderClass: string;
  }
> = {
  foundation: {
    label: 'Tier 1: Foundation',
    shortLabel: 'Foundation',
    subtitle: 'Do you remember it?',
    stars: '★☆☆',
    colorHex: '#10B981',
    barClass: 'bg-emerald-500',
    textClass: 'text-emerald-700',
    bgTintClass: 'bg-emerald-500/12',
    borderClass: 'border-emerald-600',
  },
  application: {
    label: 'Tier 2: Application',
    shortLabel: 'Application',
    subtitle: 'Can you use it?',
    stars: '★★☆',
    colorHex: '#F59E0B',
    barClass: 'bg-amber-500',
    textClass: 'text-amber-700',
    bgTintClass: 'bg-amber-500/15',
    borderClass: 'border-amber-600',
  },
  analysis: {
    label: 'Tier 3: Analysis',
    shortLabel: 'Analysis',
    subtitle: 'Can you reason about it?',
    stars: '★★★',
    colorHex: '#F43F5E',
    barClass: 'bg-rose-500',
    textClass: 'text-rose-700',
    bgTintClass: 'bg-rose-500/12',
    borderClass: 'border-rose-600',
  },
};

export function getStandingGrade(totalScore: number): StandingGrade {
  if (totalScore >= 25) return 'A';
  if (totalScore >= 18) return 'B';
  if (totalScore >= 10) return 'C';
  return 'D';
}

export function getTierStatusTone(score: number): 'green' | 'amber' | 'red' {
  if (score >= 7) return 'green';
  if (score >= 5) return 'amber';
  return 'red';
}

export function getPrescriptiveRecommendation(score: {
  foundation: number;
  application: number;
  analysis: number;
}): PrescriptiveRecommendation {
  if (score.foundation < 7) {
    return {
      headline: 'Re-read the module notes first before attempting problems',
      detail: `Foundation is ${score.foundation}/10. Lock in core terminology, schema rules, and definitions in Syllabus Notes before moving to timed problem solving.`,
      priorityTarget: 'notes',
    };
  }
  if (score.application < 6) {
    return {
      headline: 'You know the theory — focus on Interactive Labs for hands-on practice',
      detail: `Foundation is strong (${score.foundation}/10), but Application is ${score.application}/10. Step through single-rule traces and numerical builders in the Interactive Lab.`,
      priorityTarget: 'labs',
    };
  }
  if (score.analysis < 6) {
    return {
      headline: 'Solid base — do FAT Mock Part B questions for multi-step reasoning',
      detail: `Foundation (${score.foundation}/10) and Application (${score.application}/10) are solid, while Analysis is ${score.analysis}/10. Practice 10-mark Part B analytical derivations in FAT Mock.`,
      priorityTarget: 'mock',
    };
  }
  if (score.foundation >= 7 && score.application >= 7 && score.analysis >= 7) {
    return {
      headline: "You're exam-ready on this module! 🎯",
      detail: `All three tiers scored 7/10 or higher (${score.foundation}F · ${score.application}A · ${score.analysis}N). Maintain recall with quick formula scans and Part B mocks.`,
      priorityTarget: 'ready',
    };
  }
  return {
    headline: 'Nearly exam-ready — polish multi-step drills in Labs & FAT Mock Part B',
    detail: `Strong grasp across tiers (${score.foundation}F · ${score.application}A · ${score.analysis}N). A quick pass through missed items and Part B problems will lock in an A-grade.`,
    priorityTarget: 'mock',
  };
}

export function calculateModuleStanding(
  moduleId: ModuleId,
  moduleQuestions: StandingQuestion[],
  answers: Record<string, number>
): ModuleStandingBreakdown {
  let foundation = 0;
  let application = 0;
  let analysis = 0;
  const wrongQuestionIds: string[] = [];

  for (const q of moduleQuestions) {
    if (q.moduleId !== moduleId) continue;
    const chosen = answers[q.id];
    if (chosen === q.correctIndex) {
      if (q.tier === 'foundation') foundation += 1;
      else if (q.tier === 'application') application += 1;
      else analysis += 1;
    } else if (chosen !== undefined) {
      wrongQuestionIds.push(q.id);
    }
  }

  const total = foundation + application + analysis;
  return {
    moduleId,
    foundation,
    application,
    analysis,
    total,
    grade: getStandingGrade(total),
    wrongQuestionIds,
  };
}

export function calculateAggregateStanding(
  scores: StandingScoresMap
): AggregateStandingSummary {
  let assessedCount = 0;
  let totalScore = 0;

  for (const modId of MODULE_ORDER) {
    const entry = scores[modId];
    if (entry) {
      assessedCount += 1;
      totalScore += entry.foundation + entry.application + entry.analysis;
    }
  }

  let verdict: string;
  let band: AggregateStandingSummary['band'];

  if (totalScore >= 120) {
    verdict = "Strong standing — focus on weak spots and you'll ace it";
    band = 'strong';
  } else if (totalScore >= 80) {
    verdict = 'Decent base — targeted study will get you to 90+';
    band = 'decent';
  } else if (totalScore >= 40) {
    verdict = 'Gaps to fill — follow the 48h sprint plan closely';
    band = 'gaps';
  } else {
    verdict = 'Start from Module 1 notes and work through sequentially';
    band = 'start';
  }

  return {
    assessedCount,
    totalScore,
    maxScore: 150,
    showRadar: assessedCount >= 2,
    verdict,
    band,
  };
}

export function recordWeakTopicWrong(
  entries: WeakTopicEntry[],
  payload: {
    questionId: string;
    moduleId: ModuleId;
    tier?: StandingTier;
    source: 'standing' | 'mock';
    prompt: string;
  },
  nowIso: string = new Date().toISOString()
): WeakTopicEntry[] {
  const existingIdx = entries.findIndex((e) => e.questionId === payload.questionId);
  if (existingIdx >= 0) {
    const existing = entries[existingIdx];
    const updated: WeakTopicEntry = {
      ...existing,
      moduleId: payload.moduleId,
      tier: payload.tier ?? existing.tier,
      source: payload.source,
      prompt: payload.prompt,
      wrongCount: existing.wrongCount + 1,
      lastWrongAt: nowIso,
      resolved: false,
    };
    return [...entries.slice(0, existingIdx), updated, ...entries.slice(existingIdx + 1)];
  }

  return [
    {
      questionId: payload.questionId,
      moduleId: payload.moduleId,
      ...(payload.tier ? { tier: payload.tier } : {}),
      source: payload.source,
      prompt: payload.prompt,
      wrongCount: 1,
      lastWrongAt: nowIso,
      resolved: false,
    },
    ...entries,
  ];
}

export function toggleWeakTopicResolved(
  entries: WeakTopicEntry[],
  questionId: string,
  nowIso: string = new Date().toISOString()
): WeakTopicEntry[] {
  return entries.map((entry) =>
    entry.questionId === questionId
      ? {
          ...entry,
          resolved: !entry.resolved,
          lastReviewedAt: nowIso,
        }
      : entry
  );
}

export interface RadarPoint {
  x: number;
  y: number;
}

export function computeRadarPoint(
  axisIndex: number,
  axisCount: number,
  normalizedValue: number,
  radius: number,
  cx: number,
  cy: number
): RadarPoint {
  const clamped = Math.max(0, Math.min(1, normalizedValue));
  const angle = -Math.PI / 2 + (axisIndex * 2 * Math.PI) / axisCount;
  return {
    x: Number((cx + Math.cos(angle) * radius * clamped).toFixed(2)),
    y: Number((cy + Math.sin(angle) * radius * clamped).toFixed(2)),
  };
}

export function computeRadarPolygonPath(
  valuesOutOfTen: number[],
  radius: number,
  cx: number,
  cy: number
): string {
  const n = valuesOutOfTen.length;
  if (n === 0) return '';
  return valuesOutOfTen
    .map((v, i) => {
      const pt = computeRadarPoint(i, n, v / 10, radius, cx, cy);
      return `${i === 0 ? 'M' : 'L'}${pt.x},${pt.y}`;
    })
    .join(' ') + ' Z';
}
