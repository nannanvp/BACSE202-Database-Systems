/**
 * Pure, timezone-independent countdown engine targeting
 * 9:00 AM, 23 November 2026 Indian Standard Time (IST = UTC+05:30).
 */

export const EXAM_TARGET_ISO = '2026-11-23T09:00:00+05:30';
// 09:00:00 IST (UTC+05:30) === 03:30:00 UTC on 23 Nov 2026
export const EXAM_TARGET_UTC_MS = Date.UTC(2026, 10, 23, 3, 30, 0);
export const EXAM_DURATION_MS = 3 * 60 * 60 * 1000; // 3-hour FAT exam (09:00–12:00 IST)
export const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000; // UTC+05:30

export type CountdownPhase =
  | 'prep'
  | 'sprint_48h'
  | 'final_24h'
  | 'exam_morning'
  | 'in_progress'
  | 'completed';

export interface CountdownSnapshot {
  targetMs: number;
  nowMs: number;
  remainingMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalHoursLeft: number;
  phase: CountdownPhase;
  phaseLabel: string;
  examElapsedMs: number;
  examRemainingMs: number;
  isReached: boolean;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTHS = [
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
] as const;

export function padTwo(value: number): string {
  return String(Math.max(0, Math.floor(value))).padStart(2, '0');
}

export function computeExamCountdown(
  nowMs: number,
  targetMs: number = EXAM_TARGET_UTC_MS,
  examDurationMs: number = EXAM_DURATION_MS
): CountdownSnapshot {
  const diffMs = targetMs - nowMs;

  if (diffMs <= 0) {
    const elapsedMs = Math.max(0, nowMs - targetMs);
    const inProgress = elapsedMs < examDurationMs;
    const examRemainingMs = inProgress ? examDurationMs - elapsedMs : 0;

    return {
      targetMs,
      nowMs,
      remainingMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalHoursLeft: 0,
      phase: inProgress ? 'in_progress' : 'completed',
      phaseLabel: inProgress ? 'Exam In Progress' : 'Exam Concluded',
      examElapsedMs: elapsedMs,
      examRemainingMs,
      isReached: true,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const totalHoursLeft = Number((diffMs / (60 * 60 * 1000)).toFixed(1));

  let phase: CountdownPhase = 'prep';
  let phaseLabel = 'Prep Window';

  if (diffMs <= 6 * 60 * 60 * 1000) {
    phase = 'exam_morning';
    phaseLabel = 'Exam Morning';
  } else if (diffMs <= 24 * 60 * 60 * 1000) {
    phase = 'final_24h';
    phaseLabel = 'Final 24 Hours';
  } else if (diffMs <= 48 * 60 * 60 * 1000) {
    phase = 'sprint_48h';
    phaseLabel = '48h Sprint Active';
  }

  return {
    targetMs,
    nowMs,
    remainingMs: diffMs,
    days,
    hours,
    minutes,
    seconds,
    totalHoursLeft,
    phase,
    phaseLabel,
    examElapsedMs: 0,
    examRemainingMs: examDurationMs,
    isReached: false,
  };
}

/**
 * Formats any UTC epoch millisecond timestamp into deterministic Indian Standard Time (UTC+05:30),
 * independent of the host OS or browser timezone database.
 */
export function formatIstDateTime(ms: number): string {
  const istDate = new Date(ms + IST_OFFSET_MS);
  const weekday = WEEKDAYS[istDate.getUTCDay()];
  const day = padTwo(istDate.getUTCDate());
  const month = MONTHS[istDate.getUTCMonth()];
  const year = istDate.getUTCFullYear();

  const rawHours = istDate.getUTCHours();
  const meridiem = rawHours >= 12 ? 'PM' : 'AM';
  const hour12 = rawHours % 12 === 0 ? 12 : rawHours % 12;
  const minutes = padTwo(istDate.getUTCMinutes());
  const seconds = padTwo(istDate.getUTCSeconds());

  return `${weekday}, ${day} ${month} ${year} · ${padTwo(hour12)}:${minutes}:${seconds} ${meridiem} IST`;
}

export function formatCompactCountdown(snapshot: CountdownSnapshot): string {
  if (snapshot.phase === 'in_progress') {
    const remSec = Math.floor(snapshot.examRemainingMs / 1000);
    const hrs = Math.floor(remSec / 3600);
    const mins = Math.floor((remSec % 3600) / 60);
    const secs = remSec % 60;
    return `In Progress · ${padTwo(hrs)}h ${padTwo(mins)}m ${padTwo(secs)}s left`;
  }
  if (snapshot.phase === 'completed') {
    return '00d : 00h : 00m : 00s · Concluded';
  }
  return `${padTwo(snapshot.days)}d : ${padTwo(snapshot.hours)}h : ${padTwo(snapshot.minutes)}m : ${padTwo(snapshot.seconds)}s`;
}
