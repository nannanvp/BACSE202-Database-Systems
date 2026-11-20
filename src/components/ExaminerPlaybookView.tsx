import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Check,
  Clock,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import {
  EXAM_HALL_PACING,
  EXAM_TRAP_BUSTERS,
  EXAMINER_BLUEPRINTS,
} from '../utils/numericalDrillEngine';

interface ExaminerPlaybookViewProps {
  lockedTrapIds: string[];
  onToggleTrap: (trapId: string) => void;
  onResetTraps: () => void;
}

type PlaybookTab = 'blueprints' | 'traps' | 'pacing';
type ModFilter = 'all' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5';

const MODULE_PALETTE: Record<'m1' | 'm2' | 'm3' | 'm4' | 'm5', { hex: string; ink: string; label: string }> = {
  m1: { hex: '#E5B82E', ink: '#1C1B18', label: 'M1' },
  m2: { hex: '#E06D2B', ink: '#1C1B18', label: 'M2' },
  m3: { hex: '#4F8A3D', ink: '#FAF7F0', label: 'M3' },
  m4: { hex: '#147E7B', ink: '#FAF7F0', label: 'M4' },
  m5: { hex: '#22559C', ink: '#FAF7F0', label: 'M5' },
};

export const ExaminerPlaybookView: React.FC<ExaminerPlaybookViewProps> = ({
  lockedTrapIds,
  onToggleTrap,
  onResetTraps,
}) => {
  const [tab, setTab] = useState<PlaybookTab>('blueprints');
  const [modFilter, setModFilter] = useState<ModFilter>('all');

  const lockedSet = useMemo(() => new Set(lockedTrapIds), [lockedTrapIds]);
  const lockedCount = useMemo(
    () => EXAM_TRAP_BUSTERS.filter((t) => lockedSet.has(t.id)).length,
    [lockedSet]
  );

  const filteredBlueprints = useMemo(
    () =>
      modFilter === 'all'
        ? EXAMINER_BLUEPRINTS
        : EXAMINER_BLUEPRINTS.filter((b) => b.moduleId === modFilter),
    [modFilter]
  );

  const filteredTraps = useMemo(
    () =>
      modFilter === 'all'
        ? EXAM_TRAP_BUSTERS
        : EXAM_TRAP_BUSTERS.filter((t) => t.moduleId === modFilter),
    [modFilter]
  );

  return (
    <div data-testid="examiner-playbook" className="space-y-5">
      {/* Sub-Navigation & Trap Score Strip */}
      <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={tab === 'blueprints'}
            onClick={() => setTab('blueprints')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
              tab === 'blueprints'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
            }`}
          >
            <Award className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Q1–Q10 Full-Marks Blueprints (10)</span>
          </button>
          <button
            type="button"
            aria-pressed={tab === 'traps'}
            onClick={() => setTab('traps')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
              tab === 'traps'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>-2M Trap Busters ({lockedCount}/{EXAM_TRAP_BUSTERS.length})</span>
          </button>
          <button
            type="button"
            aria-pressed={tab === 'pacing'}
            onClick={() => setTab('pacing')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
              tab === 'pacing'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>3-Hour Hall Pacing (09:00–12:00)</span>
          </button>
        </div>

        {tab !== 'pacing' && (
          <div className="flex flex-wrap items-center gap-1.5">
            {(['all', 'm1', 'm2', 'm3', 'm4', 'm5'] as ModFilter[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModFilter(m)}
                className={`px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-[3px] border border-[#1C1B18] step-hinge ${
                  modFilter === m
                    ? 'bg-[#E5B82E] text-[#1C1B18]'
                    : 'bg-[#FAF7F0] text-[#434038] hover:bg-[#EAE4D7]'
                }`}
              >
                {m === 'all' ? 'All' : m}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: Q1-Q10 FULL-MARKS BLUEPRINTS */}
      {tab === 'blueprints' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredBlueprints.map((bp) => {
            const pal = MODULE_PALETTE[bp.moduleId];
            return (
              <article
                key={bp.qRange}
                className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] overflow-hidden flex flex-col"
              >
                <div
                  style={{ backgroundColor: pal.hex, color: pal.ink }}
                  className="px-4 py-2 border-b border-[#1C1B18] flex items-center justify-between gap-2 text-xs font-mono font-bold"
                >
                  <span>{bp.qRange} · {bp.topic}</span>
                </div>
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="px-2.5 py-1.5 bg-[#EAE4D7] border border-[#1C1B18]/40 rounded-[3px] font-mono text-[11px] font-bold text-[#1C1B18]">
                      Mark Split: {bp.markSplit}
                    </div>
                    <ol className="space-y-1.5 text-xs text-[#1C1B18] list-decimal pl-4 leading-relaxed">
                      {bp.mandatorySteps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#C5BEB0] text-xs">
                    <div className="bg-[#4F8A3D]/12 border border-[#4F8A3D] rounded-[3px] p-2.5 text-[#1C1B18]">
                      <span className="font-mono font-extrabold text-[#2E5C22]">95+ TOPPER MOVE: </span>
                      {bp.topperMove}
                    </div>
                    <div className="bg-[#A62B2B]/10 border border-[#A62B2B] rounded-[3px] p-2.5 text-[#1C1B18]">
                      <span className="font-mono font-extrabold text-[#A62B2B]">COMMON -2M TRAP: </span>
                      {bp.commonTrap}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* TAB 2: 20 EXAM TRAP BUSTERS */}
      {tab === 'traps' && (
        <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] overflow-hidden">
          <div className="px-5 py-3.5 bg-[#EAE4D7] border-b border-[#1C1B18] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#1C1B18]">
                20 Classic VIT FAT Deduction Traps — Check Off Each Rule You Have Locked In
              </h2>
              <p className="text-xs font-mono text-[#434038]">
                ELIMINATING THESE 20 ERRORS PROTECTS 15–20 MARKS ON EXAM DAY
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                data-testid="traps-locked-badge"
                className="px-2.5 py-1 text-xs font-mono font-bold bg-[#E5B82E] text-[#1C1B18] border border-[#1C1B18] rounded-[2px] tabular-nums"
              >
                {lockedCount} / {EXAM_TRAP_BUSTERS.length} Locked In
              </span>
              {lockedCount > 0 && (
                <button
                  type="button"
                  onClick={onResetTraps}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-[#FAF7F0] hover:bg-[#F4EFE4] border border-[#1C1B18] rounded-[3px]"
                >
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-[#C5BEB0]">
            {filteredTraps.map((item) => {
              const locked = lockedSet.has(item.id);
              const pal = MODULE_PALETTE[item.moduleId];
              return (
                <div
                  key={item.id}
                  className={`px-5 py-3.5 flex items-start gap-3.5 step-hinge ${
                    locked ? 'bg-[#EAE4D7]/55' : 'bg-[#FAF7F0]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onToggleTrap(item.id)}
                    aria-pressed={locked}
                    aria-label={
                      locked ? `Unmark trap "${item.trap}"` : `Lock in trap rule "${item.trap}"`
                    }
                    className={`mt-0.5 w-6 h-6 rounded-full border border-[#1C1B18] flex items-center justify-center shrink-0 step-hinge ${
                      locked
                        ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                        : 'bg-[#EAE4D7] hover:bg-[#E5B82E] text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        style={{ backgroundColor: pal.hex, color: pal.ink }}
                        className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-[2px] border border-[#1C1B18]"
                      >
                        {pal.label}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs sm:text-sm font-bold ${
                          locked ? 'line-through text-[#6E695D]' : 'text-[#A62B2B]'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>Trap: {item.trap}</span>
                      </span>
                    </div>
                    <p className="text-xs text-[#1C1B18] leading-relaxed">
                      <strong className="font-mono text-[#4F8A3D]">95+ Rule:</strong> {item.fix}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: 3-HOUR EXAM HALL PACING SCHEDULE */}
      {tab === 'pacing' && (
        <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] overflow-hidden">
          <div className="px-5 py-4 bg-[#EAE4D7] border-b border-[#1C1B18]">
            <h2 className="text-base font-extrabold text-[#1C1B18]">
              Exam Hall Minute-by-Minute Pacing Plan (23 Nov · 09:00 AM – 12:00 PM)
            </h2>
            <p className="text-xs font-mono text-[#434038] mt-0.5">
              16 MIN PER 10-MARK QUESTION · 5 MIN OR-SELECTION SCAN · 15 MIN FINAL AUDIT BUFFER
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F4EFE4] border-b border-[#1C1B18] font-mono text-[#1C1B18]">
                  <th className="py-2.5 px-4 font-bold whitespace-nowrap">Clock Window</th>
                  <th className="py-2.5 px-4 font-bold whitespace-nowrap">Budget</th>
                  <th className="py-2.5 px-4 font-bold whitespace-nowrap">Target Questions</th>
                  <th className="py-2.5 px-4 font-bold">95+ Execution Strategy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5BEB0]">
                {EXAM_HALL_PACING.map((row) => (
                  <tr key={row.window} className="hover:bg-[#F4EFE4]/60">
                    <td className="py-3 px-4 font-mono font-bold text-[#1C1B18] whitespace-nowrap tabular-nums">
                      {row.window}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#434038] whitespace-nowrap tabular-nums">
                      {row.duration}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#1C1B18] whitespace-nowrap">
                      {row.target}
                    </td>
                    <td className="py-3 px-4 text-[#434038] leading-relaxed">{row.strategy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
