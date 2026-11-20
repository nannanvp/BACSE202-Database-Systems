import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeRingFractionRemaining,
  DAILY_FOCUS_GOAL,
  formatPomodoroClock,
  getCycleDotsProgress,
  getFocusSessionCounterText,
  getNextPomodoroTransition,
  parsePersistedPomodoroState,
  POMODORO_DURATIONS_SEC,
  POMODORO_STORAGE_KEY,
} from './pomodoroEngine';

test('Pomodoro durations and clock formatting match 25m / 5m / 15m spec', () => {
  assert.equal(POMODORO_STORAGE_KEY, 'bacse202_pomodoro_v1');
  assert.equal(POMODORO_DURATIONS_SEC.focus, 1500);
  assert.equal(POMODORO_DURATIONS_SEC.short_break, 300);
  assert.equal(POMODORO_DURATIONS_SEC.long_break, 900);

  assert.equal(formatPomodoroClock(1500), '25:00');
  assert.equal(formatPomodoroClock(305), '05:05');
  assert.equal(formatPomodoroClock(59), '00:59');
  assert.equal(formatPomodoroClock(0), '00:00');
  assert.equal(formatPomodoroClock(-10), '00:00');

  assert.equal(computeRingFractionRemaining(1500, 1500), 1);
  assert.equal(computeRingFractionRemaining(750, 1500), 0.5);
  assert.equal(computeRingFractionRemaining(0, 1500), 0);
});

test('Auto-advance transitions Focus -> Short Break and every 4th cycle -> Long Break', () => {
  // Cycle 1: Focus -> Short Break (completed = 1)
  const t1 = getNextPomodoroTransition('focus', 0);
  assert.equal(t1.nextMode, 'short_break');
  assert.equal(t1.completedFocusSessions, 1);
  assert.equal(t1.durationSec, 300);
  assert.equal(t1.triggeredLongBreak, false);

  // Break -> Focus (completed stays 1)
  const b1 = getNextPomodoroTransition('short_break', 1);
  assert.equal(b1.nextMode, 'focus');
  assert.equal(b1.completedFocusSessions, 1);
  assert.equal(b1.durationSec, 1500);

  // Cycles 2 & 3 -> Short Break
  assert.equal(getNextPomodoroTransition('focus', 1).nextMode, 'short_break');
  assert.equal(getNextPomodoroTransition('focus', 2).nextMode, 'short_break');

  // Cycle 4: Focus -> Long Break (15 min)
  const t4 = getNextPomodoroTransition('focus', 3);
  assert.equal(t4.nextMode, 'long_break');
  assert.equal(t4.completedFocusSessions, 4);
  assert.equal(t4.durationSec, 900);
  assert.equal(t4.triggeredLongBreak, true);

  // Long Break -> Focus #5
  const b4 = getNextPomodoroTransition('long_break', 4);
  assert.equal(b4.nextMode, 'focus');
  assert.equal(b4.completedFocusSessions, 4);

  // Cycle 8 -> Long Break again
  const t8 = getNextPomodoroTransition('focus', 7);
  assert.equal(t8.nextMode, 'long_break');
  assert.equal(t8.completedFocusSessions, 8);
  assert.equal(t8.triggeredLongBreak, true);
});

test('Session counter labels, cycle dots, and localStorage state parsing work reliably', () => {
  assert.equal(getFocusSessionCounterText('focus', 0, DAILY_FOCUS_GOAL), 'Focus #1 of 8');
  assert.equal(getFocusSessionCounterText('focus', 2, DAILY_FOCUS_GOAL), 'Focus #3 of 8');
  assert.equal(getFocusSessionCounterText('short_break', 2, DAILY_FOCUS_GOAL), 'Short Break · 2 of 8 Done');
  assert.equal(getFocusSessionCounterText('long_break', 4, DAILY_FOCUS_GOAL), 'Long Break · 4 of 8 Done');

  assert.equal(getCycleDotsProgress(0), 0);
  assert.equal(getCycleDotsProgress(1), 1);
  assert.equal(getCycleDotsProgress(3), 3);
  assert.equal(getCycleDotsProgress(4), 4);
  assert.equal(getCycleDotsProgress(5), 1);

  const valid = parsePersistedPomodoroState(
    JSON.stringify({ completedFocusSessions: 3, dailyGoal: 8, mode: 'short_break' })
  );
  assert.equal(valid.completedFocusSessions, 3);
  assert.equal(valid.mode, 'short_break');
  assert.equal(valid.dailyGoal, 8);

  const fallback = parsePersistedPomodoroState('not-json');
  assert.equal(fallback.completedFocusSessions, 0);
  assert.equal(fallback.mode, 'focus');
});
