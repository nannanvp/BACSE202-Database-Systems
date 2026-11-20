import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeExamCountdown,
  EXAM_DURATION_MS,
  EXAM_TARGET_ISO,
  EXAM_TARGET_UTC_MS,
  formatCompactCountdown,
  formatIstDateTime,
} from './countdownEngine';

test('EXAM_TARGET_UTC_MS matches 2026-11-23T09:00:00+05:30 exactly', () => {
  assert.equal(EXAM_TARGET_UTC_MS, Date.parse(EXAM_TARGET_ISO));
  assert.equal(formatIstDateTime(EXAM_TARGET_UTC_MS), 'Mon, 23 Nov 2026 · 09:00:00 AM IST');
});

test('computeExamCountdown breaks down days, hours, minutes, and seconds accurately', () => {
  // 20 Nov 2026 16:21:27 IST = 2d 16h 38m 33s before 23 Nov 2026 09:00:00 IST
  const nowMs = Date.parse('2026-11-20T16:21:27+05:30');
  const snap = computeExamCountdown(nowMs);

  assert.equal(snap.isReached, false);
  assert.equal(snap.days, 2);
  assert.equal(snap.hours, 16);
  assert.equal(snap.minutes, 38);
  assert.equal(snap.seconds, 33);
  assert.equal(snap.phase, 'prep');
  assert.equal(snap.phaseLabel, 'Prep Window');
  assert.equal(formatCompactCountdown(snap), '02d : 16h : 38m : 33s');
});

test('computeExamCountdown transitions through 48h sprint, final 24h, and exam morning phases', () => {
  const sprint48 = computeExamCountdown(Date.parse('2026-11-21T12:00:00+05:30'));
  assert.equal(sprint48.phase, 'sprint_48h');
  assert.equal(sprint48.phaseLabel, '48h Sprint Active');
  assert.equal(sprint48.days, 1);
  assert.equal(sprint48.hours, 21);

  const final24 = computeExamCountdown(Date.parse('2026-11-22T18:30:00+05:30'));
  assert.equal(final24.phase, 'final_24h');
  assert.equal(final24.phaseLabel, 'Final 24 Hours');
  assert.equal(final24.days, 0);
  assert.equal(final24.hours, 14);
  assert.equal(final24.minutes, 30);

  const morning = computeExamCountdown(Date.parse('2026-11-23T07:15:45+05:30'));
  assert.equal(morning.phase, 'exam_morning');
  assert.equal(morning.phaseLabel, 'Exam Morning');
  assert.equal(morning.hours, 1);
  assert.equal(morning.minutes, 44);
  assert.equal(morning.seconds, 15);
});

test('computeExamCountdown handles exact exam start, in-progress window, and post-exam state', () => {
  const exactStart = computeExamCountdown(EXAM_TARGET_UTC_MS);
  assert.equal(exactStart.isReached, true);
  assert.equal(exactStart.phase, 'in_progress');
  assert.equal(exactStart.examRemainingMs, EXAM_DURATION_MS);
  assert.equal(formatCompactCountdown(exactStart), 'In Progress · 03h 00m 00s left');

  const midExam = computeExamCountdown(Date.parse('2026-11-23T10:30:00+05:30'));
  assert.equal(midExam.phase, 'in_progress');
  assert.equal(formatCompactCountdown(midExam), 'In Progress · 01h 30m 00s left');

  const afterExam = computeExamCountdown(Date.parse('2026-11-23T12:00:01+05:30'));
  assert.equal(afterExam.isReached, true);
  assert.equal(afterExam.phase, 'completed');
  assert.equal(afterExam.phaseLabel, 'Exam Concluded');
  assert.equal(formatCompactCountdown(afterExam), '00d : 00h : 00m : 00s · Concluded');
});

test('formatIstDateTime converts UTC timestamps accurately to IST (UTC+05:30)', () => {
  // 2026-11-20T18:30:00Z is midnight 21 Nov 2026 00:00:00 IST
  const midnightIst = Date.UTC(2026, 10, 20, 18, 30, 0);
  assert.equal(formatIstDateTime(midnightIst), 'Sat, 21 Nov 2026 · 12:00:00 AM IST');

  // 2026-11-22T06:30:05Z is 12:00:05 PM IST on 22 Nov 2026
  const noonIst = Date.UTC(2026, 10, 22, 6, 30, 5);
  assert.equal(formatIstDateTime(noonIst), 'Sun, 22 Nov 2026 · 12:00:05 PM IST');
});
