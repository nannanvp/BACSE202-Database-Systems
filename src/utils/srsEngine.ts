// ============================================================================
// SM-2 Spaced Repetition System (SRS) Engine for BACSE202 Flashcards
// Supports both 48-Hour FAT Exam Crunch intervals & Long-Term SM-2 spacing.
// Pure, deterministic logic decoupled from UI for fast unit testing.
// ============================================================================

import type { FlashcardModule, RapidFlashcard } from './erFlashcardEngine';

export type SrsRating = 'again' | 'hard' | 'good' | 'easy';
export type SrsMode = 'fat48h' | 'longterm';
export type SrsQueueFilter = 'due' | 'all' | 'weak';
export type SrsCardStatus = 'new' | 'due' | 'learning' | 'mastered';

export interface CardSrsState {
  cardId: string;
  repetitions: number;
  easeFactor: number;
  intervalMinutes: number;
  dueAt: number;
  lastReviewedAt: number | null;
  lapses: number;
  totalReviews: number;
  lastRating: SrsRating | null;
}

export type SrsProgressMap = Record<string, CardSrsState>;

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;
const MINUTE_MS = 60 * 1000;
const DAY_MINUTES = 24 * 60;

const RATING_QUALITY: Record<SrsRating, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
};

export function createInitialCardState(cardId: string): CardSrsState {
  return {
    cardId,
    repetitions: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    intervalMinutes: 0,
    dueAt: 0,
    lastReviewedAt: null,
    lapses: 0,
    totalReviews: 0,
    lastRating: null,
  };
}

/**
 * Computes next SM-2 Ease Factor using the standard SuperMemo-2 equation:
 * EF' = max(1.30, EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
 */
export function computeNextEaseFactor(currentEf: number, rating: SrsRating): number {
  const q = RATING_QUALITY[rating];
  const delta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  const next = Math.max(MIN_EASE_FACTOR, currentEf + delta);
  return Math.round(next * 100) / 100;
}

/**
 * Computes the next scheduled interval (in minutes) given prior SM-2 state,
 * chosen recall quality rating, and active study mode ('fat48h' vs 'longterm').
 */
export function computeNextIntervalMinutes(
  state: CardSrsState,
  rating: SrsRating,
  mode: SrsMode,
  nextEaseFactor: number
): { intervalMinutes: number; repetitions: number; lapsed: boolean } {
  if (rating === 'again') {
    return {
      intervalMinutes: mode === 'fat48h' ? 2 : 10,
      repetitions: 0,
      lapsed: true,
    };
  }

  if (mode === 'fat48h') {
    // Exam-compressed SM-2 intervals tailored for a 48-hour FAT sprint
    if (rating === 'hard') {
      const nextMinutes =
        state.repetitions === 0
          ? 20
          : Math.max(25, Math.round(Math.max(state.intervalMinutes, 30) * 1.2));
      return {
        intervalMinutes: Math.min(nextMinutes, 36 * 60),
        repetitions: Math.max(1, state.repetitions),
        lapsed: false,
      };
    }

    if (rating === 'good') {
      const nextReps = state.repetitions + 1;
      let nextMinutes: number;
      if (nextReps === 1) {
        nextMinutes = 60; // 1h
      } else if (nextReps === 2) {
        nextMinutes = 6 * 60; // 6h
      } else {
        nextMinutes = Math.round(Math.max(state.intervalMinutes, 6 * 60) * nextEaseFactor);
      }
      return {
        intervalMinutes: Math.min(nextMinutes, 72 * 60),
        repetitions: nextReps,
        lapsed: false,
      };
    }

    // rating === 'easy'
    const nextReps = state.repetitions + 1;
    let nextMinutes: number;
    if (nextReps === 1) {
      nextMinutes = 4 * 60; // 4h
    } else if (nextReps === 2) {
      nextMinutes = 18 * 60; // 18h
    } else {
      nextMinutes = Math.round(Math.max(state.intervalMinutes, 12 * 60) * nextEaseFactor * 1.3);
    }
    return {
      intervalMinutes: Math.min(nextMinutes, 96 * 60),
      repetitions: nextReps,
      lapsed: false,
    };
  }

  // Standard Long-Term SuperMemo-2 (day-based spacing)
  if (rating === 'hard') {
    const nextMinutes =
      state.repetitions === 0
        ? 12 * 60 // 12h
        : Math.max(DAY_MINUTES, Math.round(Math.max(state.intervalMinutes, DAY_MINUTES) * 1.2));
    return {
      intervalMinutes: nextMinutes,
      repetitions: Math.max(1, state.repetitions),
      lapsed: false,
    };
  }

  if (rating === 'good') {
    const nextReps = state.repetitions + 1;
    let nextMinutes: number;
    if (nextReps === 1) {
      nextMinutes = DAY_MINUTES; // 1d
    } else if (nextReps === 2) {
      nextMinutes = 6 * DAY_MINUTES; // 6d
    } else {
      const prevDays = Math.max(1, state.intervalMinutes / DAY_MINUTES);
      nextMinutes = Math.round(prevDays * nextEaseFactor) * DAY_MINUTES;
    }
    return {
      intervalMinutes: nextMinutes,
      repetitions: nextReps,
      lapsed: false,
    };
  }

  // Long-Term 'easy'
  const nextReps = state.repetitions + 1;
  let nextMinutes: number;
  if (nextReps === 1) {
    nextMinutes = 4 * DAY_MINUTES; // 4d
  } else if (nextReps === 2) {
    nextMinutes = 10 * DAY_MINUTES; // 10d
  } else {
    const prevDays = Math.max(1, state.intervalMinutes / DAY_MINUTES);
    nextMinutes = Math.round(prevDays * nextEaseFactor * 1.3) * DAY_MINUTES;
  }
  return {
    intervalMinutes: nextMinutes,
    repetitions: nextReps,
    lapsed: false,
  };
}

/**
 * Pure transition: applies a student's recall rating to a card's SM-2 record.
 */
export function reviewCard(
  existing: CardSrsState | undefined,
  cardId: string,
  rating: SrsRating,
  mode: SrsMode,
  nowMs: number = Date.now()
): CardSrsState {
  const base = existing ?? createInitialCardState(cardId);
  const nextEf = computeNextEaseFactor(base.easeFactor, rating);
  const { intervalMinutes, repetitions, lapsed } = computeNextIntervalMinutes(
    base,
    rating,
    mode,
    nextEf
  );

  return {
    cardId,
    repetitions,
    easeFactor: nextEf,
    intervalMinutes,
    dueAt: nowMs + intervalMinutes * MINUTE_MS,
    lastReviewedAt: nowMs,
    lapses: base.lapses + (lapsed ? 1 : 0),
    totalReviews: base.totalReviews + 1,
    lastRating: rating,
  };
}

export function formatInterval(minutes: number): string {
  if (minutes < 60) {
    return `${Math.max(1, Math.round(minutes))}m`;
  }
  if (minutes < DAY_MINUTES) {
    const hours = Math.round((minutes / 60) * 10) / 10;
    return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
  }
  const days = Math.round((minutes / DAY_MINUTES) * 10) / 10;
  return Number.isInteger(days) ? `${days}d` : `${days.toFixed(1)}d`;
}

/**
 * Formats an interval in clear, spelled-out natural language
 * (e.g., "2 minutes", "1 hour", "2 days").
 */
export function formatLongInterval(minutes: number): string {
  if (minutes < 60) {
    const m = Math.max(1, Math.round(minutes));
    return `${m} ${m === 1 ? 'minute' : 'minutes'}`;
  }
  if (minutes < DAY_MINUTES) {
    const h = Math.max(1, Math.round(minutes / 60));
    return `${h} ${h === 1 ? 'hour' : 'hours'}`;
  }
  const d = Math.max(1, Math.round(minutes / DAY_MINUTES));
  return `${d} ${d === 1 ? 'day' : 'days'}`;
}

export function formatRelativeDue(state: CardSrsState | undefined, nowMs: number): string {
  if (!state || state.totalReviews === 0) return 'New';
  const diffMs = state.dueAt - nowMs;
  if (diffMs <= 0) return 'Due now';
  const diffMinutes = Math.ceil(diffMs / MINUTE_MS);
  return `In ${formatInterval(diffMinutes)}`;
}

/**
 * Explicit human-readable scheduling readout for cards and schedule tiles
 * (e.g., "Next review: 2 days", "Next review: 4 hours", "Next review: Due now").
 */
export function formatNextReviewPhrase(state: CardSrsState | undefined, nowMs: number): string {
  if (!state || state.totalReviews === 0) {
    return 'Next review: Ready now';
  }
  const diffMs = state.dueAt - nowMs;
  if (diffMs <= 0) {
    const overdueMinutes = Math.floor(Math.abs(diffMs) / MINUTE_MS);
    if (overdueMinutes >= 15) {
      return `Overdue by ${formatLongInterval(overdueMinutes)}`;
    }
    return 'Next review: Due now';
  }
  const diffMinutes = Math.max(1, Math.ceil(diffMs / MINUTE_MS));
  return `Next review: ${formatLongInterval(diffMinutes)}`;
}

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Formats a scheduled review timestamp into a compact calendar label
 * ("Today, 14:30", "Tomorrow, 09:00", or "24 Nov, 09:00").
 */
export function formatReviewDateShort(
  dueAt: number,
  nowMs: number,
  useUtc: boolean = false
): string {
  const due = new Date(dueAt);
  const now = new Date(nowMs);

  const getY = (d: Date) => (useUtc ? d.getUTCFullYear() : d.getFullYear());
  const getM = (d: Date) => (useUtc ? d.getUTCMonth() : d.getMonth());
  const getD = (d: Date) => (useUtc ? d.getUTCDate() : d.getDate());
  const getH = (d: Date) => (useUtc ? d.getUTCHours() : d.getHours());
  const getMin = (d: Date) => (useUtc ? d.getUTCMinutes() : d.getMinutes());

  const hh = String(getH(due)).padStart(2, '0');
  const mm = String(getMin(due)).padStart(2, '0');

  const dayStartNow = Date.UTC(getY(now), getM(now), getD(now));
  const dayStartDue = Date.UTC(getY(due), getM(due), getD(due));
  const dayDelta = Math.round((dayStartDue - dayStartNow) / (DAY_MINUTES * MINUTE_MS));

  if (dayDelta === 0) return `Today, ${hh}:${mm}`;
  if (dayDelta === 1) return `Tomorrow, ${hh}:${mm}`;
  return `${getD(due)} ${SHORT_MONTHS[getM(due)]}, ${hh}:${mm}`;
}

export interface SrsTimelineBucket {
  id: 'now' | 'within6h' | 'within24h' | 'longterm';
  label: string;
  count: number;
  pct: number;
  hex: string;
  ink: string;
}

/**
 * Buckets the flashcard deck across a 4-window future review timeline so
 * students can see how their SRS workload distributes over the next 48h+.
 */
export function computeRetentionForecast(
  cards: RapidFlashcard[],
  srsMap: SrsProgressMap,
  nowMs: number
): SrsTimelineBucket[] {
  let nowCount = 0;
  let within6hCount = 0;
  let within24hCount = 0;
  let longtermCount = 0;

  const sixHoursMs = 6 * 60 * MINUTE_MS;
  const oneDayMs = DAY_MINUTES * MINUTE_MS;

  for (const card of cards) {
    const st = srsMap[card.id];
    if (!st || st.totalReviews === 0 || st.dueAt <= nowMs) {
      nowCount++;
    } else {
      const delta = st.dueAt - nowMs;
      if (delta <= sixHoursMs) within6hCount++;
      else if (delta <= oneDayMs) within24hCount++;
      else longtermCount++;
    }
  }

  const total = Math.max(1, cards.length);
  const toPct = (n: number) => Math.round((n / total) * 100);

  return [
    {
      id: 'now',
      label: 'Due / New Now',
      count: nowCount,
      pct: toPct(nowCount),
      hex: '#E06D2B',
      ink: '#1C1B18',
    },
    {
      id: 'within6h',
      label: 'Next 6 Hours',
      count: within6hCount,
      pct: toPct(within6hCount),
      hex: '#E5B82E',
      ink: '#1C1B18',
    },
    {
      id: 'within24h',
      label: '6h – 24h',
      count: within24hCount,
      pct: toPct(within24hCount),
      hex: '#22559C',
      ink: '#FAF7F0',
    },
    {
      id: 'longterm',
      label: '2+ Days',
      count: longtermCount,
      pct: toPct(longtermCount),
      hex: '#4F8A3D',
      ink: '#FAF7F0',
    },
  ];
}

/**
 * Previews the exact interval label for all 4 SM-2 buttons before the user clicks.
 */
export function previewRatingIntervals(
  existing: CardSrsState | undefined,
  cardId: string,
  mode: SrsMode
): Record<SrsRating, string> {
  const base = existing ?? createInitialCardState(cardId);
  const ratings: SrsRating[] = ['again', 'hard', 'good', 'easy'];
  const result = {} as Record<SrsRating, string>;
  for (const r of ratings) {
    const ef = computeNextEaseFactor(base.easeFactor, r);
    const { intervalMinutes } = computeNextIntervalMinutes(base, r, mode, ef);
    result[r] = formatInterval(intervalMinutes);
  }
  return result;
}

export function classifyCardStatus(
  state: CardSrsState | undefined,
  nowMs: number
): SrsCardStatus {
  if (!state || state.totalReviews === 0) return 'new';
  if (state.dueAt <= nowMs) return 'due';
  if (state.repetitions >= 2 && state.lastRating !== 'again') return 'mastered';
  return 'learning';
}

/**
 * Determines whether a card counts as currently retained for the 48h Readiness Coach:
 * at least 1 successful recall (Good/Easy or sustained Hard) without a current lapse.
 */
export function isCardRetained(state: CardSrsState | undefined): boolean {
  if (!state || state.totalReviews === 0) return false;
  return state.repetitions >= 1 && state.lastRating !== 'again';
}

export function extractRetainedCardIds(
  cards: RapidFlashcard[],
  srsMap: SrsProgressMap
): string[] {
  return cards.filter((c) => isCardRetained(srsMap[c.id])).map((c) => c.id);
}

/**
 * Migrates legacy boolean knownFlashcardIds into valid SM-2 state records so
 * existing users retain their prior mastery seamlessly.
 */
export function migrateLegacyKnownIds(
  legacyKnownIds: string[],
  existingMap: SrsProgressMap,
  nowMs: number
): SrsProgressMap {
  if (legacyKnownIds.length === 0) return existingMap;
  let changed = false;
  const next: SrsProgressMap = { ...existingMap };
  for (const cardId of legacyKnownIds) {
    if (!next[cardId]) {
      changed = true;
      next[cardId] = {
        cardId,
        repetitions: 1,
        easeFactor: DEFAULT_EASE_FACTOR,
        intervalMinutes: 6 * 60,
        dueAt: nowMs + 6 * 60 * MINUTE_MS,
        lastReviewedAt: nowMs,
        lapses: 0,
        totalReviews: 1,
        lastRating: 'good',
      };
    }
  }
  return changed ? next : existingMap;
}

export interface StudyQueueOptions {
  moduleFilter: 'all' | FlashcardModule;
  queueFilter: SrsQueueFilter;
  nowMs: number;
}

/**
 * Prioritizes flashcards for optimal retention:
 * 1. Overdue / Due cards first (most overdue & lowest ease factor first)
 * 2. New cards next
 * 3. Scheduled upcoming cards last (only in 'all' or 'weak' filter)
 */
export function buildStudyQueue(
  cards: RapidFlashcard[],
  srsMap: SrsProgressMap,
  options: StudyQueueOptions
): RapidFlashcard[] {
  const { moduleFilter, queueFilter, nowMs } = options;

  const filtered = cards.filter((card) => {
    if (moduleFilter !== 'all' && card.moduleId !== moduleFilter) return false;
    const state = srsMap[card.id];
    const status = classifyCardStatus(state, nowMs);

    if (queueFilter === 'due') {
      return status === 'due' || status === 'new';
    }
    if (queueFilter === 'weak') {
      return Boolean(
        state &&
          (state.lapses > 0 || state.lastRating === 'again' || state.easeFactor < 2.2)
      );
    }
    return true;
  });

  const priorityRank: Record<SrsCardStatus, number> = {
    due: 0,
    new: 1,
    learning: 2,
    mastered: 3,
  };

  return [...filtered].sort((a, b) => {
    const sa = srsMap[a.id];
    const sb = srsMap[b.id];
    const statusA = classifyCardStatus(sa, nowMs);
    const statusB = classifyCardStatus(sb, nowMs);

    if (priorityRank[statusA] !== priorityRank[statusB]) {
      return priorityRank[statusA] - priorityRank[statusB];
    }

    if (statusA === 'due' && sa && sb) {
      if (sa.dueAt !== sb.dueAt) return sa.dueAt - sb.dueAt;
      return sa.easeFactor - sb.easeFactor;
    }

    if ((statusA === 'learning' || statusA === 'mastered') && sa && sb) {
      return sa.dueAt - sb.dueAt;
    }

    return 0;
  });
}

export interface SrsDeckMetrics {
  totalCount: number;
  dueCount: number;
  newCount: number;
  learningCount: number;
  masteredCount: number;
  retainedCount: number;
  weakCount: number;
  reviewedCount: number;
  retentionPct: number;
  avgEaseFactor: number;
  nextDueAt: number | null;
}

export function computeSrsDeckMetrics(
  cards: RapidFlashcard[],
  srsMap: SrsProgressMap,
  nowMs: number
): SrsDeckMetrics {
  let dueCount = 0;
  let newCount = 0;
  let learningCount = 0;
  let masteredCount = 0;
  let retainedCount = 0;
  let weakCount = 0;
  let reviewedCount = 0;
  let efSum = 0;
  let nextDueAt: number | null = null;

  for (const card of cards) {
    const state = srsMap[card.id];
    const status = classifyCardStatus(state, nowMs);
    if (status === 'due') dueCount++;
    else if (status === 'new') newCount++;
    else if (status === 'learning') learningCount++;
    else if (status === 'mastered') masteredCount++;

    if (isCardRetained(state)) retainedCount++;

    if (state && state.totalReviews > 0) {
      reviewedCount++;
      efSum += state.easeFactor;
      if (state.lapses > 0 || state.lastRating === 'again' || state.easeFactor < 2.2) {
        weakCount++;
      }
      if (state.dueAt > nowMs && (nextDueAt === null || state.dueAt < nextDueAt)) {
        nextDueAt = state.dueAt;
      }
    }
  }

  const totalCount = cards.length;
  return {
    totalCount,
    dueCount,
    newCount,
    learningCount,
    masteredCount,
    retainedCount,
    weakCount,
    reviewedCount,
    retentionPct: totalCount === 0 ? 0 : Math.round((retainedCount / totalCount) * 100),
    avgEaseFactor:
      reviewedCount === 0 ? DEFAULT_EASE_FACTOR : Math.round((efSum / reviewedCount) * 100) / 100,
    nextDueAt,
  };
}
