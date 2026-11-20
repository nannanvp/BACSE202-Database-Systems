import test from 'node:test';
import assert from 'node:assert/strict';
import { FLASHCARD_DECK } from './erFlashcardEngine';
import {
  buildStudyQueue,
  classifyCardStatus,
  computeNextEaseFactor,
  computeRetentionForecast,
  computeSrsDeckMetrics,
  createInitialCardState,
  extractRetainedCardIds,
  formatInterval,
  formatLongInterval,
  formatNextReviewPhrase,
  formatRelativeDue,
  formatReviewDateShort,
  migrateLegacyKnownIds,
  previewRatingIntervals,
  reviewCard,
  SrsProgressMap,
} from './srsEngine';

const T0 = Date.UTC(2026, 10, 21, 9, 0, 0);
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

test('SM-2 Ease Factor updates accurately and respects the 1.30 floor', () => {
  const start = 2.5;
  assert.equal(computeNextEaseFactor(start, 'easy'), 2.6);
  assert.equal(computeNextEaseFactor(start, 'good'), 2.5);
  assert.equal(computeNextEaseFactor(start, 'hard'), 2.36);
  assert.equal(computeNextEaseFactor(start, 'again'), 1.96);

  // Repeated lapses must never dip below 1.30
  let ef = 1.5;
  for (let i = 0; i < 6; i++) {
    ef = computeNextEaseFactor(ef, 'again');
  }
  assert.equal(ef, 1.3);
});

test('48h FAT Crunch and Long-Term SM-2 interval progressions and lapse resets work deterministically', () => {
  // 48h FAT Crunch: Good progression 1h -> 6h -> 15h (6 * 2.5)
  const r1 = reviewCard(undefined, 'fc-m1-1', 'good', 'fat48h', T0);
  assert.equal(r1.repetitions, 1);
  assert.equal(r1.intervalMinutes, 60);
  assert.equal(r1.dueAt, T0 + 1 * HOUR);
  assert.equal(classifyCardStatus(r1, T0 + 10 * MIN), 'learning');

  const r2 = reviewCard(r1, 'fc-m1-1', 'good', 'fat48h', T0 + 1 * HOUR);
  assert.equal(r2.repetitions, 2);
  assert.equal(r2.intervalMinutes, 360);
  assert.equal(classifyCardStatus(r2, T0 + 2 * HOUR), 'mastered');

  const r3 = reviewCard(r2, 'fc-m1-1', 'good', 'fat48h', T0 + 7 * HOUR);
  assert.equal(r3.repetitions, 3);
  assert.equal(r3.intervalMinutes, 900); // 360 * 2.5 = 900m = 15h

  // Lapse on 'again' resets repetitions to 0, increments lapses, and schedules 2m relearning
  const lapsed = reviewCard(r3, 'fc-m1-1', 'again', 'fat48h', T0 + 22 * HOUR);
  assert.equal(lapsed.repetitions, 0);
  assert.equal(lapsed.lapses, 1);
  assert.equal(lapsed.intervalMinutes, 2);
  assert.ok(lapsed.easeFactor < r3.easeFactor);

  // Long-Term SM-2: Good progression 1d -> 6d -> 15d
  const lt1 = reviewCard(undefined, 'fc-m2-1', 'good', 'longterm', T0);
  assert.equal(lt1.intervalMinutes, 1440);
  const lt2 = reviewCard(lt1, 'fc-m2-1', 'good', 'longterm', T0 + DAY);
  assert.equal(lt2.intervalMinutes, 6 * 1440);
  const lt3 = reviewCard(lt2, 'fc-m2-1', 'good', 'longterm', T0 + 7 * DAY);
  assert.equal(lt3.intervalMinutes, 15 * 1440);

  // Interval previews match mode labels
  const p48 = previewRatingIntervals(undefined, 'fc-m3-1', 'fat48h');
  assert.deepEqual(p48, { again: '2m', hard: '20m', good: '1h', easy: '4h' });
  const pLt = previewRatingIntervals(undefined, 'fc-m3-1', 'longterm');
  assert.deepEqual(pLt, { again: '10m', hard: '12h', good: '1d', easy: '4d' });
});

test('buildStudyQueue prioritizes overdue cards before new cards and supports weak/lapsed filtering', () => {
  const srsMap: SrsProgressMap = {
    // Scheduled in future (not due)
    'fc-m1-1': reviewCard(undefined, 'fc-m1-1', 'easy', 'fat48h', T0),
    // Overdue card (reviewed 3h ago with 1h interval -> overdue by 2h)
    'fc-m3-1': reviewCard(undefined, 'fc-m3-1', 'good', 'fat48h', T0 - 3 * HOUR),
    // More severely overdue + lapsed card (due 4h ago)
    'fc-m4-1': reviewCard(undefined, 'fc-m4-1', 'again', 'fat48h', T0 - 4 * HOUR),
  };

  const dueQueue = buildStudyQueue(FLASHCARD_DECK, srsMap, {
    moduleFilter: 'all',
    queueFilter: 'due',
    nowMs: T0,
  });

  // fc-m1-1 is scheduled in the future so excluded from 'due' queue (23 remaining)
  assert.equal(dueQueue.length, FLASHCARD_DECK.length - 1);
  // Most overdue card comes first, followed by second overdue card, then new cards
  assert.equal(dueQueue[0].id, 'fc-m4-1');
  assert.equal(dueQueue[1].id, 'fc-m3-1');
  assert.equal(classifyCardStatus(srsMap[dueQueue[2].id], T0), 'new');

  // Weak/lapsed filter surfaces only fc-m4-1
  const weakQueue = buildStudyQueue(FLASHCARD_DECK, srsMap, {
    moduleFilter: 'all',
    queueFilter: 'weak',
    nowMs: T0,
  });
  assert.deepEqual(
    weakQueue.map((c) => c.id),
    ['fc-m4-1']
  );
});

test('computeSrsDeckMetrics, extractRetainedCardIds, formatting, and legacy migration work cleanly', () => {
  const migrated = migrateLegacyKnownIds(['fc-m1-1', 'fc-m2-1'], {}, T0);
  assert.equal(Object.keys(migrated).length, 2);
  assert.equal(migrated['fc-m1-1'].repetitions, 1);

  // Advance fc-m1-1 to mastered (rep 2) and lapse fc-m2-1
  const map: SrsProgressMap = {
    'fc-m1-1': reviewCard(migrated['fc-m1-1'], 'fc-m1-1', 'good', 'fat48h', T0 + 6 * HOUR),
    'fc-m2-1': reviewCard(migrated['fc-m2-1'], 'fc-m2-1', 'again', 'fat48h', T0 + 6 * HOUR),
  };

  const now = T0 + 6 * HOUR + 1 * MIN;
  const metrics = computeSrsDeckMetrics(FLASHCARD_DECK, map, now);
  assert.equal(metrics.totalCount, 24);
  assert.equal(metrics.masteredCount, 1);
  assert.equal(metrics.retainedCount, 1); // fc-m2-1 lapsed so no longer retained
  assert.equal(metrics.weakCount, 1);
  assert.equal(metrics.newCount, 22);
  assert.equal(metrics.learningCount, 1); // fc-m2-1 due in 1 more minute
  assert.deepEqual(extractRetainedCardIds(FLASHCARD_DECK, map), ['fc-m1-1']);
  assert.equal(formatInterval(45), '45m');
  assert.equal(formatInterval(180), '3h');
  assert.equal(formatInterval(4320), '3d');
  assert.equal(formatRelativeDue(createInitialCardState('fc-m5-1'), now), 'New');
  assert.equal(formatRelativeDue(map['fc-m2-1'], now + 5 * MIN), 'Due now');
});

test('SRS visualization formatters produce clear Next review phrases, calendar timestamps, and timeline forecast buckets', () => {
  assert.equal(formatLongInterval(1), '1 minute');
  assert.equal(formatLongInterval(20), '20 minutes');
  assert.equal(formatLongInterval(60), '1 hour');
  assert.equal(formatLongInterval(240), '4 hours');
  assert.equal(formatLongInterval(1440), '1 day');
  assert.equal(formatLongInterval(2880), '2 days');

  const card4d = reviewCard(undefined, 'fc-m1-1', 'easy', 'longterm', T0);
  const card1h = reviewCard(undefined, 'fc-m1-2', 'good', 'fat48h', T0);
  const card12h = reviewCard(undefined, 'fc-m1-3', 'hard', 'longterm', T0);
  const overdueCard = reviewCard(undefined, 'fc-m1-4', 'good', 'fat48h', T0 - 3 * HOUR);

  assert.equal(formatNextReviewPhrase(undefined, T0), 'Next review: Ready now');
  assert.equal(formatNextReviewPhrase(card4d, T0), 'Next review: 4 days');
  assert.equal(formatNextReviewPhrase(card1h, T0), 'Next review: 1 hour');
  assert.equal(formatNextReviewPhrase(overdueCard, T0), 'Overdue by 2 hours');

  assert.equal(formatReviewDateShort(T0 + 4 * HOUR, T0, true), 'Today, 13:00');
  assert.equal(formatReviewDateShort(T0 + DAY, T0, true), 'Tomorrow, 09:00');
  assert.equal(formatReviewDateShort(T0 + 4 * DAY, T0, true), '25 Nov, 09:00');

  const forecast = computeRetentionForecast(
    FLASHCARD_DECK,
    {
      'fc-m1-1': card4d,
      'fc-m1-2': card1h,
      'fc-m1-3': card12h,
      'fc-m1-4': overdueCard,
    },
    T0
  );
  const byId = Object.fromEntries(forecast.map((b) => [b.id, b.count]));
  assert.equal(byId.longterm, 1); // card4d
  assert.equal(byId.within24h, 1); // card12h
  assert.equal(byId.within6h, 1); // card1h
  assert.equal(byId.now, 21); // 20 new + 1 overdue
});
