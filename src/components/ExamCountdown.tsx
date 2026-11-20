import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import {
  computeExamCountdown,
  CountdownPhase,
  EXAM_TARGET_ISO,
  EXAM_TARGET_UTC_MS,
  formatCompactCountdown,
  formatIstDateTime,
  padTwo,
} from '../utils/countdownEngine';

interface ExamCountdownProps {
  variant: 'hero' | 'compact';
  onOpenPlan?: () => void;
}

const PHASE_STYLES: Record<CountdownPhase, string> = {
  prep: 'bg-[#22559C] text-[#FAF7F0]',
  sprint_48h: 'bg-[#E5B82E] text-[#1C1B18]',
  final_24h: 'bg-[#E06D2B] text-[#1C1B18]',
  exam_morning: 'bg-[#A62B2B] text-[#FAF7F0]',
  in_progress: 'bg-[#4F8A3D] text-[#FAF7F0]',
  completed: 'bg-[#1C1B18] text-[#FAF7F0]',
};

export const ExamCountdown: React.FC<ExamCountdownProps> = ({ variant, onOpenPlan }) => {
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const snapshot = computeExamCountdown(nowMs, EXAM_TARGET_UTC_MS);
  const istNowLabel = formatIstDateTime(nowMs);
  const phaseBadgeClass = PHASE_STYLES[snapshot.phase];

  if (variant === 'compact') {
    return (
      <div
        data-testid="exam-countdown-compact"
        role="region"
        aria-label="Exam countdown to 9 AM 23 November 2026 IST"
        className="mb-6 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] px-4 py-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2"
      >
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono text-[#1C1B18]">
          <Clock className="w-3.5 h-3.5 text-[#434038] shrink-0" aria-hidden="true" />
          <span className="font-bold uppercase tracking-[0.06em]">FAT Countdown</span>
          <span aria-hidden="true" className="text-[#6E695D]">·</span>
          <time dateTime={EXAM_TARGET_ISO} className="text-[#434038] tabular-nums">
            Mon, 23 Nov 2026 · 09:00 AM IST
          </time>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            data-testid="countdown-compact-value"
            className="font-mono text-sm font-bold text-[#1C1B18] tabular-nums tracking-[0.04em]"
          >
            {formatCompactCountdown(snapshot)}
          </span>
          <span
            className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border border-[#1C1B18] rounded-[2px] whitespace-nowrap ${phaseBadgeClass}`}
          >
            {snapshot.phaseLabel}
          </span>
          {onOpenPlan && (
            <button
              type="button"
              onClick={onOpenPlan}
              className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#1C1B18] underline underline-offset-4 hover:text-[#22559C] whitespace-nowrap"
            >
              <ArrowLeft className="w-3 h-3" aria-hidden="true" />
              <span>48h Plan</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const units = [
    { label: 'Days', value: padTwo(snapshot.days), testId: 'countdown-days' },
    { label: 'Hours', value: padTwo(snapshot.hours), testId: 'countdown-hours' },
    { label: 'Minutes', value: padTwo(snapshot.minutes), testId: 'countdown-minutes' },
    { label: 'Seconds', value: padTwo(snapshot.seconds), testId: 'countdown-seconds' },
  ];

  return (
    <div
      data-testid="exam-countdown-hero"
      role="region"
      aria-label="Live countdown to 9:00 AM 23 November 2026 Indian Standard Time"
      className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 sm:p-5 space-y-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1C1B18] shrink-0" aria-hidden="true" />
            <h2 className="text-sm font-mono font-semibold uppercase tracking-[0.08em] text-[#1C1B18]">
              FAT Exam Countdown
            </h2>
          </div>
          <p className="text-xs font-mono text-[#434038] tabular-nums">
            Target:{' '}
            <time dateTime={EXAM_TARGET_ISO} className="font-semibold text-[#1C1B18]">
              Mon, 23 Nov 2026 · 09:00 AM IST (UTC+05:30)
            </time>
          </p>
        </div>

        <span
          data-testid="countdown-phase-badge"
          className={`px-2 py-0.5 text-[11px] font-mono font-bold uppercase tracking-wider border border-[#1C1B18] rounded-[2px] whitespace-nowrap ${phaseBadgeClass}`}
        >
          {snapshot.phaseLabel}
        </span>
      </div>

      {snapshot.phase === 'in_progress' ? (
        <div
          data-testid="countdown-in-progress"
          className="bg-[#4F8A3D]/15 border border-[#4F8A3D] rounded-[3px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
        >
          <span className="text-sm font-display font-bold text-[#1C1B18]">
            BACSE202 End Semester FAT is underway (09:00 AM – 12:00 PM IST).
          </span>
          <span className="font-mono text-sm font-extrabold text-[#1C1B18] tabular-nums whitespace-nowrap">
            {formatCompactCountdown(snapshot)}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-4 border border-[#1C1B18] rounded-[3px] divide-x divide-[#1C1B18] bg-[#F4EFE4] overflow-hidden">
          {units.map((u) => (
            <div key={u.label} className="py-3 px-2 sm:px-3 text-center">
              <div
                data-testid={u.testId}
                className="text-2xl sm:text-4xl font-display font-extrabold text-[#1C1B18] leading-none tabular-nums"
              >
                {u.value}
              </div>
              <div className="mt-1.5 text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-[0.1em] text-[#434038]">
                {u.label}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-2.5 border-t border-[#C5BEB0] flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[11px] font-mono text-[#434038] tabular-nums">
        <span data-testid="countdown-ist-now">IST Now: {istNowLabel}</span>
        <span>
          {snapshot.isReached
            ? snapshot.phase === 'in_progress'
              ? '3h Exam Slot Active'
              : 'Target Reached'
            : `${snapshot.totalHoursLeft.toFixed(1)} hrs remaining`}
        </span>
      </div>
    </div>
  );
};
