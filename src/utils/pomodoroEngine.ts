export type PomodoroMode = 'focus' | 'short_break' | 'long_break';

export const POMODORO_STORAGE_KEY = 'bacse202_pomodoro_v1';
export const DAILY_FOCUS_GOAL = 8;
export const LONG_BREAK_INTERVAL = 4;

export const POMODORO_DURATIONS_SEC: Record<PomodoroMode, number> = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

export const POMODORO_MODE_META: Record<
  PomodoroMode,
  { label: string; shortLabel: string; minutes: number }
> = {
  focus: { label: 'Focus', shortLabel: 'Focus 25m', minutes: 25 },
  short_break: { label: 'Short Break', shortLabel: 'Short 5m', minutes: 5 },
  long_break: { label: 'Long Break', shortLabel: 'Long 15m', minutes: 15 },
};

export interface PomodoroPersistedState {
  completedFocusSessions: number;
  dailyGoal: number;
  mode: PomodoroMode;
  updatedAt: string;
}

export interface PomodoroTransitionResult {
  nextMode: PomodoroMode;
  completedFocusSessions: number;
  durationSec: number;
  triggeredLongBreak: boolean;
}

/**
 * Pure state machine for Pomodoro auto-advance:
 * - After Focus finishes: increment completedFocusSessions; every 4th cycle -> Long Break (15m),
 *   otherwise -> Short Break (5m).
 * - After Short Break or Long Break finishes: return to Focus (25m).
 */
export function getNextPomodoroTransition(
  currentMode: PomodoroMode,
  completedFocusSessions: number
): PomodoroTransitionResult {
  const safeCount = Math.max(0, Math.floor(completedFocusSessions));

  if (currentMode === 'focus') {
    const nextCount = safeCount + 1;
    const isLongBreak = nextCount % LONG_BREAK_INTERVAL === 0;
    const nextMode: PomodoroMode = isLongBreak ? 'long_break' : 'short_break';
    return {
      nextMode,
      completedFocusSessions: nextCount,
      durationSec: POMODORO_DURATIONS_SEC[nextMode],
      triggeredLongBreak: isLongBreak,
    };
  }

  return {
    nextMode: 'focus',
    completedFocusSessions: safeCount,
    durationSec: POMODORO_DURATIONS_SEC.focus,
    triggeredLongBreak: false,
  };
}

export function formatPomodoroClock(secondsLeft: number): string {
  const clamped = Math.max(0, Math.floor(secondsLeft));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function computeRingFractionRemaining(
  secondsLeft: number,
  totalSeconds: number
): number {
  if (totalSeconds <= 0) return 0;
  return Math.max(0, Math.min(1, secondsLeft / totalSeconds));
}

export function getFocusSessionCounterText(
  mode: PomodoroMode,
  completedFocusSessions: number,
  dailyGoal: number = DAILY_FOCUS_GOAL
): string {
  const safeCompleted = Math.max(0, Math.floor(completedFocusSessions));
  const currentFocusNum = safeCompleted + 1;

  if (mode === 'focus') {
    return `Focus #${currentFocusNum} of ${dailyGoal}`;
  }
  if (mode === 'long_break') {
    return `Long Break · ${safeCompleted} of ${dailyGoal} Done`;
  }
  return `Short Break · ${safeCompleted} of ${dailyGoal} Done`;
}

export function getCycleDotsProgress(completedFocusSessions: number): number {
  const safeCompleted = Math.max(0, Math.floor(completedFocusSessions));
  if (safeCompleted === 0) return 0;
  const mod = safeCompleted % LONG_BREAK_INTERVAL;
  return mod === 0 ? LONG_BREAK_INTERVAL : mod;
}

export function parsePersistedPomodoroState(
  raw: string | null
): PomodoroPersistedState {
  const fallback: PomodoroPersistedState = {
    completedFocusSessions: 0,
    dailyGoal: DAILY_FOCUS_GOAL,
    mode: 'focus',
    updatedAt: new Date().toISOString(),
  };

  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as Partial<PomodoroPersistedState>;
    const count =
      typeof parsed.completedFocusSessions === 'number' &&
      Number.isFinite(parsed.completedFocusSessions) &&
      parsed.completedFocusSessions >= 0
        ? Math.floor(parsed.completedFocusSessions)
        : 0;
    const mode: PomodoroMode =
      parsed.mode === 'focus' ||
      parsed.mode === 'short_break' ||
      parsed.mode === 'long_break'
        ? parsed.mode
        : 'focus';
    const dailyGoal =
      typeof parsed.dailyGoal === 'number' &&
      Number.isFinite(parsed.dailyGoal) &&
      parsed.dailyGoal >= 1
        ? Math.floor(parsed.dailyGoal)
        : DAILY_FOCUS_GOAL;

    return {
      completedFocusSessions: count,
      dailyGoal,
      mode,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : fallback.updatedAt,
    };
  } catch {
    return fallback;
  }
}

/**
 * Generates a subtle two-note chime via the Web Audio API without external audio files.
 * Gracefully no-ops in restricted or headless environments.
 */
export function playPomodoroChime(finishedMode: PomodoroMode): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    // Ascending soothing chime when Focus finishes; crisp readiness chime when Break ends
    const notes =
      finishedMode === 'focus' ? [523.25, 659.25, 783.99] : [440, 587.33];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.08, now + idx * 0.14 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.14 + 0.42);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.45);
    });

    window.setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1200);
  } catch {
    // Ignore audio context autoplay/headless restrictions
  }
}
