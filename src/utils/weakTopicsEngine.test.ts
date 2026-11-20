import test from 'node:test';
import assert from 'node:assert/strict';
import { FAT_QUESTIONS } from '../data/bacse202Data';
import { STANDING_QUESTIONS } from '../data/standingData';
import { recordWeakTopicWrong, toggleWeakTopicResolved, WeakTopicEntry } from './standingEngine';
import {
  clearResolvedWeakTopics,
  countUnresolvedWeakTopics,
  filterWeakTopicsBySource,
  getSourceBadgeLabel,
  getWrongCountSeverity,
  groupWeakTopicsByModule,
  isRecentlyReviewed,
  isReviewOverdue,
  markWeakTopicReviewed,
  OVERDUE_REVIEW_THRESHOLD_MS,
  RECENT_REVIEW_WINDOW_MS,
  resolveWeakQuestionDetail,
  sortWeakTopics,
} from './weakTopicsEngine';

test('Weak Topics tracks both Standing and Mock wrongs without duplicates and supports review/resolve/clear', () => {
  let list: WeakTopicEntry[] = [];

  list = recordWeakTopicWrong(
    list,
    {
      questionId: 's_m1_a_02',
      moduleId: 'm1',
      tier: 'application',
      source: 'standing',
      prompt: STANDING_QUESTIONS.find((q) => q.id === 's_m1_a_02')!.prompt,
    },
    '2026-11-20T08:00:00.000Z'
  );
  list = recordWeakTopicWrong(
    list,
    {
      questionId: FAT_QUESTIONS[0].id,
      moduleId: FAT_QUESTIONS[0].moduleId,
      source: 'mock',
      prompt: FAT_QUESTIONS[0].prompt,
    },
    '2026-11-20T09:00:00.000Z'
  );
  // Repeat wrong on Mock question -> increments wrongCount, no duplicate
  list = recordWeakTopicWrong(
    list,
    {
      questionId: FAT_QUESTIONS[0].id,
      moduleId: FAT_QUESTIONS[0].moduleId,
      source: 'mock',
      prompt: FAT_QUESTIONS[0].prompt,
    },
    '2026-11-20T09:30:00.000Z'
  );

  assert.equal(list.length, 2);
  assert.equal(countUnresolvedWeakTopics(list), 2);
  const mockEntry = list.find((e) => e.questionId === FAT_QUESTIONS[0].id)!;
  assert.equal(mockEntry.wrongCount, 2);
  assert.equal(mockEntry.lastWrongAt, '2026-11-20T09:30:00.000Z');
  assert.equal(mockEntry.tier, undefined);

  // Mark reviewed updates lastReviewedAt without resolving
  list = markWeakTopicReviewed(list, 's_m1_a_02', '2026-11-20T10:00:00.000Z');
  const standingEntry = list.find((e) => e.questionId === 's_m1_a_02')!;
  assert.equal(standingEntry.lastReviewedAt, '2026-11-20T10:00:00.000Z');
  assert.equal(standingEntry.resolved, false);

  // Resolve one item and clear resolved
  list = toggleWeakTopicResolved(list, 's_m1_a_02', '2026-11-20T10:05:00.000Z');
  assert.equal(countUnresolvedWeakTopics(list), 1);

  const cleared = clearResolvedWeakTopics(list);
  assert.equal(cleared.length, 1);
  assert.equal(cleared[0].questionId, FAT_QUESTIONS[0].id);
});

test('SRS spaced repetition rules identify overdue (>=3 misses & 2+ hrs) and recently reviewed (<1 hr)', () => {
  const nowMs = Date.parse('2026-11-20T12:00:00.000Z');

  const neverReviewedHigh: WeakTopicEntry = {
    questionId: 's_m3_n_01',
    moduleId: 'm3',
    tier: 'analysis',
    source: 'standing',
    prompt: 'Sample',
    wrongCount: 3,
    lastWrongAt: '2026-11-20T09:00:00.000Z',
    resolved: false,
  };
  assert.equal(isReviewOverdue(neverReviewedHigh, nowMs), true);
  assert.equal(isRecentlyReviewed(neverReviewedHigh, nowMs), false);

  const reviewed30mAgo: WeakTopicEntry = {
    ...neverReviewedHigh,
    lastReviewedAt: new Date(nowMs - RECENT_REVIEW_WINDOW_MS / 2).toISOString(),
  };
  assert.equal(isReviewOverdue(reviewed30mAgo, nowMs), false);
  assert.equal(isRecentlyReviewed(reviewed30mAgo, nowMs), true);

  const reviewed90mAgo: WeakTopicEntry = {
    ...neverReviewedHigh,
    lastReviewedAt: new Date(nowMs - 90 * 60 * 1000).toISOString(),
  };
  assert.equal(isReviewOverdue(reviewed90mAgo, nowMs), false);
  assert.equal(isRecentlyReviewed(reviewed90mAgo, nowMs), false);

  const reviewed2hAgo: WeakTopicEntry = {
    ...neverReviewedHigh,
    lastReviewedAt: new Date(nowMs - OVERDUE_REVIEW_THRESHOLD_MS).toISOString(),
  };
  assert.equal(isReviewOverdue(reviewed2hAgo, nowMs), true);
  assert.equal(isRecentlyReviewed(reviewed2hAgo, nowMs), false);

  const only2Misses: WeakTopicEntry = {
    ...neverReviewedHigh,
    wrongCount: 2,
  };
  assert.equal(isReviewOverdue(only2Misses, nowMs), false);

  const resolvedHigh: WeakTopicEntry = {
    ...neverReviewedHigh,
    resolved: true,
  };
  assert.equal(isReviewOverdue(resolvedHigh, nowMs), false);
  assert.equal(isRecentlyReviewed(resolvedHigh, nowMs), false);

  assert.equal(getWrongCountSeverity(1), 'low');
  assert.equal(getWrongCountSeverity(2), 'medium');
  assert.equal(getWrongCountSeverity(3), 'high');
  assert.equal(getWrongCountSeverity(7), 'high');
});

test('sortWeakTopics and groupWeakTopicsByModule pin overdue items and overdue modules to top', () => {
  const nowMs = Date.parse('2026-11-20T12:00:00.000Z');
  const entries: WeakTopicEntry[] = [
    {
      questionId: 'm1_q1',
      moduleId: 'm1',
      source: 'mock',
      prompt: 'Recent high count but just reviewed',
      wrongCount: 5,
      lastWrongAt: '2026-11-20T11:55:00.000Z',
      lastReviewedAt: '2026-11-20T11:58:00.000Z',
      resolved: false,
    },
    {
      questionId: 'm4_q2',
      moduleId: 'm4',
      source: 'mock',
      prompt: 'Overdue M4 entry',
      wrongCount: 3,
      lastWrongAt: '2026-11-20T08:00:00.000Z',
      lastReviewedAt: '2026-11-20T09:00:00.000Z',
      resolved: false,
    },
    {
      questionId: 's_m4_f_01',
      moduleId: 'm4',
      tier: 'foundation',
      source: 'standing',
      prompt: 'Normal M4 entry',
      wrongCount: 2,
      lastWrongAt: '2026-11-20T11:50:00.000Z',
      resolved: false,
    },
  ];

  // Even though m1_q1 has wrongCount=5 and newer timestamp, m4_q2 is overdue so it MUST sort first
  const byCount = sortWeakTopics(entries, 'wrongCount', nowMs);
  assert.equal(byCount[0].questionId, 'm4_q2');
  assert.equal(byCount[1].questionId, 'm1_q1');
  assert.equal(byCount[2].questionId, 's_m4_f_01');

  const byRecent = sortWeakTopics(entries, 'lastWrongAt', nowMs);
  assert.equal(byRecent[0].questionId, 'm4_q2');
  assert.equal(byRecent[1].questionId, 'm1_q1');
  assert.equal(byRecent[2].questionId, 's_m4_f_01');

  // Module grouping surfaces M4 (has overdue) above M1, and overdue item first inside M4
  const groups = groupWeakTopicsByModule(entries, 'wrongCount', nowMs);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].moduleId, 'm4');
  assert.equal(groups[0].overdueCount, 1);
  assert.equal(groups[0].entries[0].questionId, 'm4_q2');
  assert.equal(groups[1].moduleId, 'm1');

  // Source filter works accurately
  assert.equal(filterWeakTopicsBySource(entries, 'standing').length, 1);
  assert.equal(filterWeakTopicsBySource(entries, 'mock').length, 2);
  assert.equal(filterWeakTopicsBySource(entries, 'all').length, 3);
});

test('resolveWeakQuestionDetail and getSourceBadgeLabel resolve Standing and Mock questions with exact labels', () => {
  const standingSample = STANDING_QUESTIONS.find((q) => q.id === 's_m2_a_04')!;
  const standingEntry: WeakTopicEntry = {
    questionId: standingSample.id,
    moduleId: standingSample.moduleId,
    tier: standingSample.tier,
    source: 'standing',
    prompt: standingSample.prompt,
    wrongCount: 1,
    lastWrongAt: '2026-11-20T10:00:00.000Z',
    resolved: false,
  };
  const standingDetail = resolveWeakQuestionDetail(standingEntry);
  assert.ok(standingDetail);
  assert.equal(standingDetail.sourceBadgeLabel, 'Standing · Tier 2');
  assert.equal(getSourceBadgeLabel(standingEntry), 'Standing · Tier 2');
  assert.equal(standingDetail.options.length, 4);
  assert.ok(standingDetail.explanation.length > 20);

  const mockPartA = FAT_QUESTIONS.find((q) => q.part === 'Part A (Short)')!;
  const mockEntryA: WeakTopicEntry = {
    questionId: mockPartA.id,
    moduleId: mockPartA.moduleId,
    source: 'mock',
    prompt: mockPartA.prompt,
    wrongCount: 2,
    lastWrongAt: '2026-11-20T10:00:00.000Z',
    resolved: false,
  };
  const mockDetailA = resolveWeakQuestionDetail(mockEntryA);
  assert.ok(mockDetailA);
  assert.equal(mockDetailA.sourceBadgeLabel, 'Mock · Part A');
  assert.equal(getSourceBadgeLabel(mockEntryA), 'Mock · Part A');
  assert.equal(mockDetailA.options.length, 4);

  const mockPartB = FAT_QUESTIONS.find((q) => q.part === 'Part B (Analytical)')!;
  const mockEntryB: WeakTopicEntry = {
    questionId: mockPartB.id,
    moduleId: mockPartB.moduleId,
    source: 'mock',
    prompt: mockPartB.prompt,
    wrongCount: 3,
    lastWrongAt: '2026-11-20T10:00:00.000Z',
    resolved: false,
  };
  assert.equal(getSourceBadgeLabel(mockEntryB), 'Mock · Part B');
});
