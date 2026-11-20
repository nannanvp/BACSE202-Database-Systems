import { FAT_QUESTIONS, FatQuestion, MODULES } from '../data/bacse202Data';
import { STANDING_QUESTIONS, StandingQuestion } from '../data/standingData';
import { MODULE_ORDER, ModuleId, StandingTier, WeakTopicEntry } from './standingEngine';

export type WeakTopicSourceFilter = 'all' | 'standing' | 'mock';
export type WeakTopicSortMode = 'wrongCount' | 'lastWrongAt';
export type WrongCountSeverity = 'high' | 'medium' | 'low';

export const OVERDUE_REVIEW_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours
export const RECENT_REVIEW_WINDOW_MS = 1 * 60 * 60 * 1000; // 1 hour

export interface ResolvedWeakQuestionDetail {
  questionId: string;
  moduleId: ModuleId;
  source: 'standing' | 'mock';
  sourceBadgeLabel: string; // e.g. "Standing · Tier 2" or "Mock · Part A"
  prompt: string;
  codeOrSchema?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ModuleWeakTopicGroup {
  moduleId: ModuleId;
  moduleNumber: number;
  moduleTitle: string;
  entries: WeakTopicEntry[];
  overdueCount: number;
}

const STANDING_BY_ID = new Map<string, StandingQuestion>(
  STANDING_QUESTIONS.map((q) => [q.id, q])
);
const FAT_BY_ID = new Map<string, FatQuestion>(
  FAT_QUESTIONS.map((q) => [q.id, q])
);

export function getTierNumberLabel(tier?: StandingTier): string {
  if (tier === 'foundation') return 'Tier 1';
  if (tier === 'application') return 'Tier 2';
  if (tier === 'analysis') return 'Tier 3';
  return 'Diagnostic';
}

export function getSourceBadgeLabel(entry: WeakTopicEntry): string {
  if (entry.source === 'standing') {
    const q = STANDING_BY_ID.get(entry.questionId);
    const tier = entry.tier ?? q?.tier;
    return `Standing · ${getTierNumberLabel(tier)}`;
  }
  const fatQ = FAT_BY_ID.get(entry.questionId);
  if (fatQ) {
    const shortPart = fatQ.part.startsWith('Part B') ? 'Part B' : 'Part A';
    return `Mock · ${shortPart}`;
  }
  return 'Mock · MCQ';
}

export function resolveWeakQuestionDetail(
  entry: WeakTopicEntry
): ResolvedWeakQuestionDetail | null {
  if (entry.source === 'standing') {
    const q = STANDING_BY_ID.get(entry.questionId);
    if (!q) return null;
    return {
      questionId: q.id,
      moduleId: q.moduleId,
      source: 'standing',
      sourceBadgeLabel: `Standing · ${getTierNumberLabel(q.tier)}`,
      prompt: q.prompt,
      codeOrSchema: q.codeOrSchema,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    };
  }

  const fatQ = FAT_BY_ID.get(entry.questionId);
  if (!fatQ) return null;
  const shortPart = fatQ.part.startsWith('Part B') ? 'Part B' : 'Part A';
  return {
    questionId: fatQ.id,
    moduleId: fatQ.moduleId,
    source: 'mock',
    sourceBadgeLabel: `Mock · ${shortPart}`,
    prompt: fatQ.prompt,
    codeOrSchema: fatQ.codeOrSchema,
    options: fatQ.options,
    correctIndex: fatQ.correctIndex,
    explanation: fatQ.explanation,
  };
}

export function getWrongCountSeverity(wrongCount: number): WrongCountSeverity {
  if (wrongCount >= 3) return 'high';
  if (wrongCount === 2) return 'medium';
  return 'low';
}

/**
 * SRS Rule 1:
 * Unresolved entries with wrongCount >= 3 that haven't been reviewed in 2+ hours
 * (or have never been reviewed) are flagged as "Review overdue!".
 */
export function isReviewOverdue(
  entry: WeakTopicEntry,
  nowMs: number = Date.now()
): boolean {
  if (entry.resolved) return false;
  if (entry.wrongCount < 3) return false;
  if (!entry.lastReviewedAt) return true;
  const reviewedMs = Date.parse(entry.lastReviewedAt);
  if (!Number.isFinite(reviewedMs)) return true;
  return nowMs - reviewedMs >= OVERDUE_REVIEW_THRESHOLD_MS;
}

/**
 * SRS Rule 2:
 * Unresolved entries reviewed within the last hour get a subtle "Recently reviewed ✓" badge.
 */
export function isRecentlyReviewed(
  entry: WeakTopicEntry,
  nowMs: number = Date.now()
): boolean {
  if (entry.resolved) return false;
  if (!entry.lastReviewedAt) return false;
  const reviewedMs = Date.parse(entry.lastReviewedAt);
  if (!Number.isFinite(reviewedMs)) return false;
  const elapsed = nowMs - reviewedMs;
  return elapsed >= 0 && elapsed < RECENT_REVIEW_WINDOW_MS;
}

export function markWeakTopicReviewed(
  entries: WeakTopicEntry[],
  questionId: string,
  nowIso: string = new Date().toISOString()
): WeakTopicEntry[] {
  return entries.map((entry) =>
    entry.questionId === questionId
      ? {
          ...entry,
          lastReviewedAt: nowIso,
        }
      : entry
  );
}

export function clearResolvedWeakTopics(entries: WeakTopicEntry[]): WeakTopicEntry[] {
  return entries.filter((entry) => !entry.resolved);
}

export function countUnresolvedWeakTopics(entries: WeakTopicEntry[]): number {
  let count = 0;
  for (const entry of entries) {
    if (!entry.resolved) count += 1;
  }
  return count;
}

export function filterWeakTopicsBySource(
  entries: WeakTopicEntry[],
  sourceFilter: WeakTopicSourceFilter
): WeakTopicEntry[] {
  if (sourceFilter === 'all') return entries;
  return entries.filter((entry) => entry.source === sourceFilter);
}

/**
 * Sorts weak topics with "review overdue" entries pinned to the top automatically,
 * then by the selected sort mode (wrongCount descending or lastWrongAt descending).
 */
export function sortWeakTopics(
  entries: WeakTopicEntry[],
  sortMode: WeakTopicSortMode,
  nowMs: number = Date.now()
): WeakTopicEntry[] {
  return [...entries].sort((a, b) => {
    const aOverdue = isReviewOverdue(a, nowMs) ? 1 : 0;
    const bOverdue = isReviewOverdue(b, nowMs) ? 1 : 0;
    if (aOverdue !== bOverdue) return bOverdue - aOverdue;

    if (sortMode === 'wrongCount') {
      if (b.wrongCount !== a.wrongCount) return b.wrongCount - a.wrongCount;
      return b.lastWrongAt.localeCompare(a.lastWrongAt);
    }

    const timeCmp = b.lastWrongAt.localeCompare(a.lastWrongAt);
    if (timeCmp !== 0) return timeCmp;
    return b.wrongCount - a.wrongCount;
  });
}

/**
 * Groups active (unresolved) weak topics by module.
 * Modules with overdue items surface first so overdue entries appear at the very top of the panel,
 * while remaining modules keep canonical syllabus order (M1 -> M5).
 */
export function groupWeakTopicsByModule(
  entries: WeakTopicEntry[],
  sortMode: WeakTopicSortMode,
  nowMs: number = Date.now()
): ModuleWeakTopicGroup[] {
  const byModule = new Map<ModuleId, WeakTopicEntry[]>();
  for (const entry of entries) {
    const bucket = byModule.get(entry.moduleId);
    if (bucket) {
      bucket.push(entry);
    } else {
      byModule.set(entry.moduleId, [entry]);
    }
  }

  const groups: ModuleWeakTopicGroup[] = [];
  for (const modId of MODULE_ORDER) {
    const list = byModule.get(modId);
    if (!list || list.length === 0) continue;
    const sorted = sortWeakTopics(list, sortMode, nowMs);
    const overdueCount = sorted.filter((e) => isReviewOverdue(e, nowMs)).length;
    const modMeta = MODULES.find((m) => m.id === modId);
    groups.push({
      moduleId: modId,
      moduleNumber: modMeta?.number ?? Number(modId.slice(1)),
      moduleTitle: modMeta?.title ?? `Module ${modId.slice(1)}`,
      entries: sorted,
      overdueCount,
    });
  }

  return groups.sort((a, b) => {
    const aHasOverdue = a.overdueCount > 0 ? 1 : 0;
    const bHasOverdue = b.overdueCount > 0 ? 1 : 0;
    if (aHasOverdue !== bHasOverdue) return bHasOverdue - aHasOverdue;
    return a.moduleNumber - b.moduleNumber;
  });
}

export function formatRelativeTimestamp(iso: string, nowMs: number = Date.now()): string {
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return 'just now';
  const diffSec = Math.max(0, Math.floor((nowMs - ts) / 1000));
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}
