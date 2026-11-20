import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX } from 'lucide-react';
import {
  computeRingFractionRemaining,
  DAILY_FOCUS_GOAL,
  formatPomodoroClock,
  getCycleDotsProgress,
  getFocusSessionCounterText,
  getNextPomodoroTransition,
  LONG_BREAK_INTERVAL,
  parsePersistedPomodoroState,
  playPomodoroChime,
  POMODORO_DURATIONS_SEC,
  POMODORO_MODE_META,
  POMODORO_STORAGE_KEY,
  PomodoroMode,
} from '../utils/pomodoroEngine';

interface PomodoroTimerProps {
  ringColorHex: string;
  activeModuleCode: string;
}

const RING_SIZE = 74;
const RING_STROKE = 5.5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  ringColorHex,
  activeModuleCode,
}) => {
  const [persistedInit] = useState(() => {
    try {
      return parsePersistedPomodoroState(window.localStorage.getItem(POMODORO_STORAGE_KEY));
    } catch {
      return parsePersistedPomodoroState(null);
    }
  });

  const [mode, setMode] = useState<PomodoroMode>(persistedInit.mode);
  const [completedFocusSessions, setCompletedFocusSessions] = useState<number>(
    persistedInit.completedFocusSessions
  );
  const [secondsLeft, setSecondsLeft] = useState<number>(
    POMODORO_DURATIONS_SEC[persistedInit.mode]
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Persist session count and active mode to bacse202_pomodoro_v1
  useEffect(() => {
    try {
      window.localStorage.setItem(
        POMODORO_STORAGE_KEY,
        JSON.stringify({
          completedFocusSessions,
          dailyGoal: DAILY_FOCUS_GOAL,
          mode,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [completedFocusSessions, mode]);

  // Non-blocking 1-second timer tick with auto-advance & Web Audio chime
  useEffect(() => {
    if (!isRunning) return;

    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        const finishedMode = mode;
        const transition = getNextPomodoroTransition(finishedMode, completedFocusSessions);
        if (soundEnabled) {
          playPomodoroChime(finishedMode);
        }
        setCompletedFocusSessions(transition.completedFocusSessions);
        setMode(transition.nextMode);
        setStatusNotice(
          transition.triggeredLongBreak
            ? '4-cycle streak complete — Long Break started'
            : transition.nextMode === 'short_break'
            ? 'Focus complete — Short Break started'
            : 'Break complete — Next Focus session ready'
        );
        return transition.durationSec;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [isRunning, mode, completedFocusSessions, soundEnabled]);

  const totalSeconds = POMODORO_DURATIONS_SEC[mode];
  const fractionRemaining = computeRingFractionRemaining(secondsLeft, totalSeconds);
  const dashOffset = RING_CIRCUMFERENCE * (1 - fractionRemaining);
  const sessionLabel = getFocusSessionCounterText(mode, completedFocusSessions, DAILY_FOCUS_GOAL);
  const cycleDotsFilled = getCycleDotsProgress(completedFocusSessions);

  const handleSwitchMode = (nextMode: PomodoroMode) => {
    setIsRunning(false);
    setMode(nextMode);
    setSecondsLeft(POMODORO_DURATIONS_SEC[nextMode]);
    setStatusNotice(null);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(POMODORO_DURATIONS_SEC[mode]);
    setStatusNotice(null);
  };

  const handleSkip = () => {
    const finishedMode = mode;
    const transition = getNextPomodoroTransition(finishedMode, completedFocusSessions);
    if (soundEnabled) {
      playPomodoroChime(finishedMode);
    }
    setCompletedFocusSessions(transition.completedFocusSessions);
    setMode(transition.nextMode);
    setSecondsLeft(transition.durationSec);
    setIsRunning(false);
    setStatusNotice(
      transition.triggeredLongBreak
        ? '4th focus complete — switched to Long Break (15m)'
        : transition.nextMode === 'short_break'
        ? 'Switched to Short Break (5m)'
        : 'Switched to Focus (25m)'
    );
  };

  return (
    <section
      aria-label="Pomodoro focus timer"
      data-testid="pomodoro-timer"
      className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] px-4 py-3 sm:px-5 sm:py-3.5"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        {/* Left: Compact SVG Circular Progress Ring + Session Info */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative w-[74px] h-[74px] shrink-0">
            <svg
              width={RING_SIZE}
              height={RING_SIZE}
              viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
              className="-rotate-90"
              role="img"
              aria-label={`${POMODORO_MODE_META[mode].label} timer: ${formatPomodoroClock(secondsLeft)} remaining`}
            >
              {/* Track Ring */}
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                className="stroke-[#EAE4D7] dark:stroke-[#312E29]"
                strokeWidth={RING_STROKE}
              />
              {/* Animated Progress Ring matching DIVISION_WHEEL hex color */}
              <motion.circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke={ringColorHex}
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                initial={false}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                data-testid="pomodoro-ring-progress"
                data-ring-color={ringColorHex}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span
                data-testid="pomodoro-clock"
                className="font-mono text-sm font-extrabold text-[#1C1B18] tabular-nums leading-none"
              >
                {formatPomodoroClock(secondsLeft)}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#6E695D] mt-0.5">
                {isRunning ? 'LIVE' : 'IDLE'}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xs sm:text-sm font-display font-extrabold uppercase tracking-[0.04em] text-[#1C1B18]">
                Pomodoro Focus Timer
              </h2>
              <span
                data-testid="pomodoro-session-counter"
                className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#F4EFE4] border border-[#1C1B18] rounded-[3px] text-[#1C1B18] tabular-nums"
              >
                {sessionLabel}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#434038]">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-[#1C1B18] shrink-0"
                  style={{ backgroundColor: ringColorHex }}
                  aria-hidden="true"
                />
                <span>{activeModuleCode}</span>
              </span>
            </div>

            {/* 4-cycle dots toward Long Break + optional transition note */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#6E695D]">
              <div
                className="flex items-center gap-1.5"
                aria-label={`${cycleDotsFilled} of ${LONG_BREAK_INTERVAL} cycles toward Long Break`}
              >
                <span className="inline-flex items-center gap-1 shrink-0" aria-hidden="true">
                  {Array.from({ length: LONG_BREAK_INTERVAL }).map((_, i) => (
                    <span
                      key={i}
                      style={
                        i < cycleDotsFilled ? { backgroundColor: ringColorHex } : undefined
                      }
                      className={`w-2 h-2 rounded-full border border-[#1C1B18] shrink-0 ${
                        i < cycleDotsFilled ? '' : 'bg-[#EAE4D7]'
                      }`}
                    />
                  ))}
                </span>
                <span className="leading-snug">
                  {statusNotice ?? 'Every 4th focus auto-switches to 15m Long Break'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Mode Switcher + Controls (Play/Pause, Reset, Skip, Chime Mute) */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2.5">
          {/* 3 Modes */}
          <div
            role="tablist"
            aria-label="Pomodoro timer modes"
            className="inline-flex items-center gap-1 p-0.5 bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px]"
          >
            {(['focus', 'short_break', 'long_break'] as PomodoroMode[]).map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleSwitchMode(m)}
                  className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-[3px] step-hinge whitespace-nowrap ${
                    active
                      ? 'bg-[#1C1B18] text-[#FAF7F0]'
                      : 'text-[#434038] hover:text-[#1C1B18] hover:bg-[#FAF7F0]'
                  }`}
                >
                  {POMODORO_MODE_META[m].shortLabel}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="inline-flex items-center gap-1.5">
            {isRunning ? (
              <button
                type="button"
                onClick={() => setIsRunning(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-[#FAF7F0] bg-[#1C1B18] hover:bg-[#2C2A25] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap"
              >
                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setStatusNotice(null);
                  setIsRunning(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-[#1C1B18] bg-[#E5B82E] hover:bg-[#d8aa22] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Start</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset Pomodoro timer"
              title="Reset current timer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-bold text-[#1C1B18] bg-[#FAF7F0] hover:bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              type="button"
              onClick={handleSkip}
              aria-label="Skip to next Pomodoro phase"
              title="Skip to next phase"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-bold text-[#1C1B18] bg-[#FAF7F0] hover:bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px] step-hinge whitespace-nowrap"
            >
              <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Skip</span>
            </button>

            <button
              type="button"
              onClick={() => setSoundEnabled((v) => !v)}
              aria-label={soundEnabled ? 'Mute completion chime' : 'Enable completion chime'}
              aria-pressed={!soundEnabled}
              title={soundEnabled ? 'Chime on (click to mute)' : 'Chime muted (click to unmute)'}
              className="p-1.5 text-[#434038] hover:text-[#1C1B18] bg-[#F4EFE4] hover:bg-[#EAE4D7] border border-[#1C1B18]/60 rounded-[4px] step-hinge"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
