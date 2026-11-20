import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import {
  checkGranularityCompatibility,
  getRequiredIntentionChain,
  GRANULARITY_COMPATIBILITY,
  GRANULARITY_MODE_INFO,
  GRANULARITY_MODES,
  GranularityLevel,
  GranularityMode,
  LockProtocol,
  parseLockSchedule,
  simulateTwoPL,
  TWO_PL_PRESETS,
} from '../utils/lockingEngine';

type SubTab = 'two_pl' | 'granularity';

const PROTOCOL_OPTIONS: Array<{ id: LockProtocol; label: string; rule: string }> = [
  {
    id: 'strict_2pl_wfg',
    label: 'Strict 2PL (Wait-For Graph)',
    rule: 'Allow waits -> detect cycle in WFG',
  },
  {
    id: 'wait_die',
    label: 'Wait-Die (Non-Preemptive)',
    rule: 'Older waits (TS<holder), Younger dies',
  },
  {
    id: 'wound_wait',
    label: 'Wound-Wait (Preemptive)',
    rule: 'Older wounds younger, Younger waits',
  },
];

const GRANULARITY_LEVELS: GranularityLevel[] = [
  'Database',
  'Table (STUDENT)',
  'Page (P1)',
  'Record (R1)',
];

function getOutcomeBadge(outcome: string): { label: string; classes: string } {
  switch (outcome) {
    case 'GRANTED':
      return { label: 'GRANTED', classes: 'bg-[#4F8A3D] text-[#FAF7F0]' };
    case 'UPGRADED':
      return { label: 'UPGRADED S→X', classes: 'bg-[#147E7B] text-[#FAF7F0]' };
    case 'COMMITTED':
      return { label: 'COMMIT', classes: 'bg-[#22559C] text-[#FAF7F0]' };
    case 'BLOCKED':
      return { label: 'BLOCKED', classes: 'bg-[#E5B82E] text-[#1C1B18]' };
    case 'WOUNDED_OTHER':
      return { label: 'WOUNDED', classes: 'bg-[#E06D2B] text-[#1C1B18]' };
    case 'ABORTED_WAIT_DIE':
      return { label: 'ABORT (DIE)', classes: 'bg-[#A62B2B] text-[#FAF7F0]' };
    case 'DEADLOCK':
      return { label: 'DEADLOCK!', classes: 'bg-[#A62B2B] text-[#FAF7F0]' };
    default:
      return { label: 'SKIPPED', classes: 'bg-[#EAE4D7] text-[#6E695D]' };
  }
}

export const LockingDeadlockLab: React.FC = () => {
  const [subTab, setSubTab] = useState<SubTab>('two_pl');
  const [scheduleInput, setScheduleInput] = useState(TWO_PL_PRESETS[0].schedule);
  const [protocol, setProtocol] = useState<LockProtocol>('strict_2pl_wfg');
  const [customTs, setCustomTs] = useState<Record<string, number>>(TWO_PL_PRESETS[0].timestamps);
  const [stepCursor, setStepCursor] = useState<number | null>(null);

  // Multiple Granularity state
  const [heldMode, setHeldMode] = useState<GranularityMode>('SIX');
  const [reqMode, setReqMode] = useState<GranularityMode>('IS');
  const [targetLevel, setTargetLevel] = useState<GranularityLevel>('Record (R1)');
  const [targetLockMode, setTargetLockMode] = useState<GranularityMode>('X');

  const parsed = useMemo(() => parseLockSchedule(scheduleInput), [scheduleInput]);

  const sim = useMemo(() => {
    if (parsed.error || parsed.ops.length === 0) return null;
    return simulateTwoPL(parsed.ops, protocol, customTs);
  }, [parsed, protocol, customTs]);

  const activeStepIdx = useMemo(() => {
    if (!sim || sim.steps.length === 0) return 0;
    if (stepCursor === null) return sim.steps.length - 1;
    return Math.min(Math.max(0, stepCursor), sim.steps.length - 1);
  }, [sim, stepCursor]);

  const activeSnapshot = sim && sim.steps.length > 0 ? sim.steps[activeStepIdx] : null;

  const granCheck = useMemo(
    () => checkGranularityCompatibility(heldMode, reqMode),
    [heldMode, reqMode]
  );
  const intentionChain = useMemo(
    () => getRequiredIntentionChain(targetLevel, targetLockMode),
    [targetLevel, targetLockMode]
  );

  // Compute SVG coordinates for WFG nodes arranged cleanly on a circle
  const wfgLayout = useMemo(() => {
    if (!sim) return { coords: new Map<string, { x: number; y: number }>() };
    const txs = sim.transactions;
    const coords = new Map<string, { x: number; y: number }>();
    const cx = 190;
    const cy = 110;
    const r = txs.length <= 2 ? 78 : 74;
    txs.forEach((tx, idx) => {
      const angle =
        txs.length === 2
          ? idx === 0
            ? Math.PI
            : 0
          : -Math.PI / 2 + (2 * Math.PI * idx) / txs.length;
      coords.set(tx, {
        x: Math.round(cx + r * Math.cos(angle)),
        y: Math.round(cy + r * Math.sin(angle)),
      });
    });
    return { coords };
  }, [sim]);

  const cycleEdgeSet = useMemo(() => {
    const set = new Set<string>();
    const cyc = activeSnapshot?.deadlockCycle;
    if (!cyc) return set;
    for (let i = 0; i < cyc.length - 1; i++) {
      set.add(`${cyc[i]}->${cyc[i + 1]}`);
    }
    return set;
  }, [activeSnapshot]);

  const loadPreset = (presetIdx: number) => {
    const p = TWO_PL_PRESETS[presetIdx];
    setScheduleInput(p.schedule);
    setCustomTs(p.timestamps);
    setStepCursor(null);
  };

  return (
    <div className="space-y-6" data-testid="locking-deadlock-lab">
      <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] overflow-hidden">
        <div className="px-5 py-4 bg-[#EAE4D7] border-b border-[#1C1B18] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#1C1B18]">
              2PL Lock-Table, Wait-For Graph &amp; Deadlock Prevention Tracer
            </h2>
            <p className="text-xs font-mono text-[#434038]">
              MODULE 4 · STRICT 2PL, WAIT-DIE VS WOUND-WAIT &amp; MULTIPLE GRANULARITY LOCKING (A1 Q8a · A2 Q6 · MODEL Q7)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'two_pl', label: '2PL Lock-Table & Deadlock Tracer' },
                { id: 'granularity', label: 'Multiple Granularity (IS/IX/SIX)' },
              ] as Array<{ id: SubTab; label: string }>
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubTab(t.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap ${
                  subTab === t.id
                    ? 'bg-[#E5B82E] text-[#1C1B18]'
                    : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#F4EFE4]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================================================================ */}
        {/* SUB-TAB 1: 2PL LOCK-TABLE, WFG & WAIT-DIE / WOUND-WAIT           */}
        {/* ================================================================ */}
        {subTab === 'two_pl' && (
          <div className="p-5 sm:p-6 space-y-5" data-testid="two-pl-panel">
            {/* Protocol Mode Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {PROTOCOL_OPTIONS.map((opt) => {
                const active = protocol === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setProtocol(opt.id);
                      setStepCursor(null);
                    }}
                    aria-pressed={active}
                    className={`p-3 text-left rounded-[4px] border border-[#1C1B18] step-hinge ${
                      active
                        ? 'bg-[#147E7B] text-[#FAF7F0]'
                        : 'bg-[#F4EFE4] text-[#1C1B18] hover:bg-[#EAE4D7]'
                    }`}
                  >
                    <div className="text-xs font-extrabold">{opt.label}</div>
                    <div className={`text-[11px] font-mono mt-0.5 ${active ? 'opacity-90' : 'text-[#434038]'}`}>
                      {opt.rule}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Schedule Input, Presets & Timestamps */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-7 space-y-3 bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-4">
                <div className="flex flex-wrap gap-1.5">
                  {TWO_PL_PRESETS.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => loadPreset(idx)}
                      className="px-2.5 py-1 text-xs font-bold bg-[#FAF7F0] hover:bg-[#EAE4D7] border border-[#1C1B18] rounded-[3px] step-hinge"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                <div className="space-y-1">
                  <label htmlFor="two-pl-schedule" className="block text-xs font-bold text-[#1C1B18]">
                    Schedule Operations (R/S acquires Shared, W/X acquires Exclusive, C commits &amp; releases)
                  </label>
                  <input
                    id="two-pl-schedule"
                    type="text"
                    value={scheduleInput}
                    onChange={(e) => {
                      setScheduleInput(e.target.value);
                      setStepCursor(null);
                    }}
                    className="w-full h-10 px-3 text-sm font-mono bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] text-[#1C1B18]"
                  />
                </div>

                {sim && (
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
                    <span className="font-bold text-[#434038]">
                      Timestamps (Smaller = Older):
                    </span>
                    {sim.transactions.map((tx) => (
                      <label key={tx} className="inline-flex items-center gap-1.5">
                        <span className="font-extrabold text-[#1C1B18]">TS({tx})</span>
                        <input
                          type="number"
                          min={1}
                          max={999}
                          value={sim.timestamps[tx]}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setCustomTs((prev) => ({
                              ...prev,
                              [tx]: Number.isFinite(val) ? val : 10,
                            }));
                            setStepCursor(null);
                          }}
                          className="w-16 h-7 px-2 text-xs font-mono bg-[#FAF7F0] border border-[#1C1B18] rounded-[3px] text-[#1C1B18]"
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Verdict + Replay Controls */}
              <div className="lg:col-span-5 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 space-y-3">
                {parsed.error || !sim || !activeSnapshot ? (
                  <div className="text-xs font-bold text-[#A62B2B]">
                    {parsed.error ?? 'Enter valid schedule operations.'}
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {sim.deadlockDetected ? (
                          <AlertTriangle className="w-5 h-5 text-[#A62B2B] shrink-0" aria-hidden="true" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-[#4F8A3D] shrink-0" aria-hidden="true" />
                        )}
                        <div>
                          <div
                            data-testid="two-pl-verdict"
                            className={`text-sm font-extrabold ${
                              sim.deadlockDetected ? 'text-[#A62B2B]' : 'text-[#4F8A3D]'
                            }`}
                          >
                            {sim.deadlockDetected
                              ? `DEADLOCK DETECTED (${sim.deadlockCycle?.join(' → ')})`
                              : protocol === 'wait_die'
                              ? `DEADLOCK-FREE (Wait-Die · Aborted: ${sim.abortedTxs.join(', ') || 'None'})`
                              : protocol === 'wound_wait'
                              ? `DEADLOCK-FREE (Wound-Wait · Wounded: ${sim.abortedTxs.join(', ') || 'None'})`
                              : 'DEADLOCK-FREE (Strict 2PL Clean)'}
                          </div>
                          <div className="text-[11px] font-mono text-[#434038] mt-0.5">
                            Committed: {sim.committedTxs.join(', ') || 'None'} · Aborted: {sim.abortedTxs.join(', ') || 'None'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step Replay Controls */}
                    <div className="pt-2.5 border-t border-[#C5BEB0] flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-[#434038]">
                        Replay Step {activeStepIdx + 1} / {sim.steps.length}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setStepCursor(0)}
                          disabled={activeStepIdx === 0}
                          aria-label="First step"
                          className="p-1.5 rounded-[3px] border border-[#1C1B18] bg-[#FAF7F0] disabled:opacity-40 hover:bg-[#EAE4D7]"
                        >
                          <SkipBack className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setStepCursor(Math.max(0, activeStepIdx - 1))}
                          disabled={activeStepIdx === 0}
                          aria-label="Previous step"
                          className="p-1.5 rounded-[3px] border border-[#1C1B18] bg-[#FAF7F0] disabled:opacity-40 hover:bg-[#EAE4D7]"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setStepCursor(Math.min(sim.steps.length - 1, activeStepIdx + 1))}
                          disabled={activeStepIdx === sim.steps.length - 1}
                          aria-label="Next step"
                          className="p-1.5 rounded-[3px] border border-[#1C1B18] bg-[#FAF7F0] disabled:opacity-40 hover:bg-[#EAE4D7]"
                        >
                          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setStepCursor(sim.steps.length - 1)}
                          disabled={activeStepIdx === sim.steps.length - 1}
                          aria-label="Final step"
                          className="p-1.5 rounded-[3px] border border-[#1C1B18] bg-[#FAF7F0] disabled:opacity-40 hover:bg-[#EAE4D7]"
                        >
                          <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Lock Table Snapshot + Live SVG Wait-For Graph */}
            {sim && activeSnapshot && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Live Lock Table */}
                <div className="lg:col-span-7 space-y-2">
                  <h3 className="text-sm font-extrabold text-[#1C1B18]">
                    Lock Table State After Step {activeSnapshot.stepNo} ({activeSnapshot.op.raw})
                  </h3>
                  <div className="overflow-x-auto border border-[#1C1B18] rounded-[4px] bg-[#FAF7F0]">
                    <table className="w-full text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-[#EAE4D7] border-b border-[#1C1B18] text-left">
                          <th className="px-3 py-2 font-extrabold text-[#1C1B18]">Item</th>
                          <th className="px-3 py-2 font-extrabold text-[#1C1B18]">Mode</th>
                          <th className="px-3 py-2 font-extrabold text-[#1C1B18]">Lock Holders</th>
                          <th className="px-3 py-2 font-extrabold text-[#1C1B18]">Waiting Queue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C5BEB0]">
                        {activeSnapshot.lockTable.map((row) => (
                          <tr key={row.item}>
                            <td className="px-3 py-2.5 font-extrabold text-[#1C1B18]">{row.item}</td>
                            <td className="px-3 py-2.5">
                              <span
                                className={`px-2 py-0.5 rounded-[2px] font-bold ${
                                  row.mode === 'X'
                                    ? 'bg-[#A62B2B] text-[#FAF7F0]'
                                    : row.mode === 'S'
                                    ? 'bg-[#147E7B] text-[#FAF7F0]'
                                    : 'bg-[#EAE4D7] text-[#6E695D]'
                                }`}
                              >
                                {row.mode}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 font-semibold text-[#1C1B18]">
                              {row.holders.length > 0 ? row.holders.join(', ') : '—'}
                            </td>
                            <td className="px-3 py-2.5 text-[#A62B2B] font-semibold">
                              {row.waitQueue.length > 0
                                ? row.waitQueue.map((w) => `${w.tx}(${w.mode})`).join(', ')
                                : 'Empty'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Live SVG Wait-For Graph */}
                <div className="lg:col-span-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-[#1C1B18]">Wait-For Graph (WFG)</h3>
                    <span className="text-[11px] font-mono text-[#434038]">
                      Edge Ti → Tj means Ti waits for Tj
                    </span>
                  </div>
                  <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-3">
                    <svg
                      viewBox="0 0 380 220"
                      className="w-full h-auto"
                      role="img"
                      aria-label="Wait-For Graph showing transaction wait dependencies"
                    >
                      <defs>
                        <marker
                          id="wfg-arrow-normal"
                          viewBox="0 0 10 10"
                          refX="8"
                          refY="5"
                          markerWidth="6"
                          markerHeight="6"
                          orient="auto-start-reverse"
                        >
                          <path d="M 0 1 L 10 5 L 0 9 z" fill="#1C1B18" />
                        </marker>
                        <marker
                          id="wfg-arrow-cycle"
                          viewBox="0 0 10 10"
                          refX="8"
                          refY="5"
                          markerWidth="6"
                          markerHeight="6"
                          orient="auto-start-reverse"
                        >
                          <path d="M 0 1 L 10 5 L 0 9 z" fill="#A62B2B" />
                        </marker>
                      </defs>

                      {/* Wait-For Edges with curved offset for bidirectional pairs */}
                      {activeSnapshot.wfgEdges.map((edge, idx) => {
                        const p1 = wfgLayout.coords.get(edge.from);
                        const p2 = wfgLayout.coords.get(edge.to);
                        if (!p1 || !p2) return null;
                        const dx = p2.x - p1.x;
                        const dy = p2.y - p1.y;
                        const dist = Math.hypot(dx, dy) || 1;
                        const ux = dx / dist;
                        const uy = dy / dist;
                        const rNode = 24;

                        // Perpendicular curve offset so opposite edges separate cleanly
                        const hasReverse = activeSnapshot.wfgEdges.some(
                          (o) => o.from === edge.to && o.to === edge.from
                        );
                        const curve = hasReverse ? 28 : 12;
                        const nx = -uy;
                        const ny = ux;

                        const sx = p1.x + ux * rNode;
                        const sy = p1.y + uy * rNode;
                        const ex = p2.x - ux * (rNode + 3);
                        const ey = p2.y - uy * (rNode + 3);
                        const cx = (sx + ex) / 2 + nx * curve;
                        const cy = (sy + ey) / 2 + ny * curve;

                        const inCycle = cycleEdgeSet.has(`${edge.from}->${edge.to}`);
                        return (
                          <g key={`${edge.from}-${edge.to}-${edge.item}-${idx}`}>
                            <path
                              d={`M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`}
                              fill="none"
                              stroke={inCycle ? '#A62B2B' : '#1C1B18'}
                              strokeWidth={inCycle ? 2.4 : 1.6}
                              markerEnd={inCycle ? 'url(#wfg-arrow-cycle)' : 'url(#wfg-arrow-normal)'}
                            />
                            <rect
                              x={cx - 12}
                              y={cy - 8}
                              width={24}
                              height={15}
                              rx={2}
                              fill="#FAF7F0"
                              stroke={inCycle ? '#A62B2B' : '#1C1B18'}
                              strokeWidth={1}
                            />
                            <text
                              x={cx}
                              y={cy + 3}
                              textAnchor="middle"
                              fontSize={9}
                              fontFamily="monospace"
                              fontWeight="bold"
                              fill={inCycle ? '#A62B2B' : '#1C1B18'}
                            >
                              {edge.item}
                            </text>
                          </g>
                        );
                      })}

                      {/* Transaction Nodes */}
                      {sim.transactions.map((tx) => {
                        const pos = wfgLayout.coords.get(tx);
                        if (!pos) return null;
                        const isAborted = activeSnapshot.abortedTxs.includes(tx);
                        const isCommitted = activeSnapshot.committedTxs.includes(tx);
                        const inCycle = activeSnapshot.deadlockCycle?.includes(tx) ?? false;
                        const fill = inCycle
                          ? '#FDE8E8'
                          : isAborted
                          ? '#EAE4D7'
                          : isCommitted
                          ? '#E3F2DF'
                          : '#FAF7F0';
                        const stroke = inCycle ? '#A62B2B' : isCommitted ? '#4F8A3D' : '#1C1B18';

                        return (
                          <g key={tx} transform={`translate(${pos.x}, ${pos.y})`}>
                            <circle
                              r={23}
                              fill={fill}
                              stroke={stroke}
                              strokeWidth={inCycle ? 2.6 : 1.6}
                              strokeDasharray={isAborted ? '3 2' : undefined}
                            />
                            <text
                              x={0}
                              y={-1}
                              textAnchor="middle"
                              fontSize={12}
                              fontFamily="monospace"
                              fontWeight="bold"
                              fill={inCycle ? '#A62B2B' : '#1C1B18'}
                            >
                              {tx}
                            </text>
                            <text
                              x={0}
                              y={11}
                              textAnchor="middle"
                              fontSize={8.5}
                              fontFamily="monospace"
                              fill="#434038"
                            >
                              TS={sim.timestamps[tx]}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                    {activeSnapshot.wfgEdges.length === 0 && (
                      <div className="text-center text-[11px] font-mono text-[#434038] -mt-2 pb-1">
                        No active wait edges at Step {activeSnapshot.stepNo} (Zero Waiting Transactions).
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Complete Step-by-Step Trace Log */}
            {sim && (
              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-[#1C1B18]">
                  Step-by-Step 2PL &amp; Timestamp Decision Trace (Click any row to inspect Lock Table &amp; WFG)
                </h3>
                <div className="overflow-x-auto border border-[#1C1B18] rounded-[4px] bg-[#FAF7F0]">
                  <table className="w-full text-xs font-mono border-collapse min-w-[560px]">
                    <thead>
                      <tr className="bg-[#EAE4D7] border-b border-[#1C1B18] text-left">
                        <th className="px-3 py-2 font-extrabold text-[#1C1B18]">Step</th>
                        <th className="px-3 py-2 font-extrabold text-[#1C1B18]">Op</th>
                        <th className="px-3 py-2 font-extrabold text-[#1C1B18]">Outcome</th>
                        <th className="px-3 py-2 font-extrabold text-[#1C1B18]">Decision &amp; Timestamp Rule</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C5BEB0]">
                      {sim.steps.map((st, idx) => {
                        const badge = getOutcomeBadge(st.outcome);
                        const selected = idx === activeStepIdx;
                        return (
                          <tr
                            key={st.stepNo}
                            onClick={() => setStepCursor(idx)}
                            className={`cursor-pointer ${
                              selected ? 'bg-[#E5B82E]/25' : 'hover:bg-[#F4EFE4]'
                            }`}
                          >
                            <td className="px-3 py-2 font-bold text-[#1C1B18]">#{st.stepNo}</td>
                            <td className="px-3 py-2 font-extrabold text-[#1C1B18] whitespace-nowrap">
                              {st.op.raw}{' '}
                              <span className="text-[10px] text-[#6E695D] font-normal">
                                (TS={st.txTs})
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold ${badge.classes}`}>
                                {badge.label}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-[#1C1B18]">{st.detail}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* SUB-TAB 2: MULTIPLE GRANULARITY LOCKING (IS / IX / S / SIX / X)  */}
        {/* ================================================================ */}
        {subTab === 'granularity' && (
          <div className="p-5 sm:p-6 space-y-6" data-testid="granularity-panel">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 7 cols: Interactive 5x5 Compatibility Matrix */}
              <div className="lg:col-span-7 space-y-3">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1C1B18]">
                    Interactive Multiple Granularity Compatibility Matrix (Click Any Cell)
                  </h3>
                  <p className="text-xs text-[#434038]">
                    Rows = lock currently held by T1; Columns = lock requested by T2 on the same hierarchy node.
                  </p>
                </div>

                <div className="overflow-x-auto border border-[#1C1B18] rounded-[4px] bg-[#FAF7F0]">
                  <table className="w-full text-xs font-mono border-collapse">
                    <thead>
                      <tr className="bg-[#EAE4D7] border-b border-[#1C1B18]">
                        <th className="px-3 py-2.5 text-left font-extrabold text-[#1C1B18] border-r border-[#1C1B18]">
                          Held \ Req
                        </th>
                        {GRANULARITY_MODES.map((m) => (
                          <th key={m} className="px-3 py-2.5 text-center font-extrabold text-[#1C1B18]">
                            {m}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C5BEB0]">
                      {GRANULARITY_MODES.map((rowMode) => (
                        <tr key={rowMode}>
                          <td className="px-3 py-2 font-extrabold bg-[#EAE4D7]/60 text-[#1C1B18] border-r border-[#1C1B18]">
                            {rowMode}
                          </td>
                          {GRANULARITY_MODES.map((colMode) => {
                            const ok = GRANULARITY_COMPATIBILITY[rowMode][colMode];
                            const isSelected = heldMode === rowMode && reqMode === colMode;
                            return (
                              <td key={colMode} className="p-1.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setHeldMode(rowMode);
                                    setReqMode(colMode);
                                  }}
                                  data-testid={`gran-${rowMode}-${colMode}`}
                                  aria-label={`Check Held ${rowMode} vs Requested ${colMode}`}
                                  className={`w-full py-1.5 rounded-[3px] font-bold border step-hinge ${
                                    isSelected ? 'ring-2 ring-[#1C1B18] ring-offset-1' : ''
                                  } ${
                                    ok
                                      ? 'bg-[#4F8A3D]/20 text-[#1C1B18] border-[#4F8A3D]'
                                      : 'bg-[#A62B2B]/15 text-[#A62B2B] border-[#A62B2B]'
                                  }`}
                                >
                                  {ok ? 'Yes' : 'No'}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Live Compatibility Explanation */}
                <div
                  data-testid="granularity-verdict"
                  className={`p-4 rounded-[4px] border text-xs space-y-1 ${
                    granCheck.compatible
                      ? 'bg-[#4F8A3D]/10 border-[#4F8A3D]'
                      : 'bg-[#A62B2B]/10 border-[#A62B2B]'
                  }`}
                >
                  <div className="font-mono font-extrabold text-[#1C1B18]">
                    T1 Holds [{heldMode}] + T2 Requests [{reqMode}] →{' '}
                    <span className={granCheck.compatible ? 'text-[#4F8A3D]' : 'text-[#A62B2B]'}>
                      {granCheck.compatible ? 'COMPATIBLE (GRANT)' : 'CONFLICT (BLOCK)'}
                    </span>
                  </div>
                  <p className="text-[#1C1B18] leading-relaxed">{granCheck.explanation}</p>
                </div>
              </div>

              {/* Right 5 cols: Top-Down Intention-Lock Hierarchy Checker */}
              <div className="lg:col-span-5 bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1C1B18]">
                    Top-Down Intention Lock Protocol (A1 Q8a)
                  </h3>
                  <p className="text-xs text-[#434038] mt-0.5">
                    Pick a target granularity level and lock mode to see the mandatory root-to-leaf intention chain.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-mono font-bold uppercase text-[#434038]">
                    1. Target Hierarchy Node
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {GRANULARITY_LEVELS.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setTargetLevel(lvl)}
                        className={`px-2.5 py-1 text-xs font-mono font-bold rounded-[3px] border border-[#1C1B18] step-hinge ${
                          targetLevel === lvl
                            ? 'bg-[#1C1B18] text-[#FAF7F0]'
                            : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-mono font-bold uppercase text-[#434038]">
                    2. Desired Lock Mode
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {GRANULARITY_MODES.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTargetLockMode(m)}
                        className={`px-2.5 py-1 text-xs font-mono font-bold rounded-[3px] border border-[#1C1B18] step-hinge ${
                          targetLockMode === m
                            ? 'bg-[#E5B82E] text-[#1C1B18]'
                            : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#434038]">
                    <strong>{targetLockMode} ({GRANULARITY_MODE_INFO[targetLockMode].name}):</strong>{' '}
                    {GRANULARITY_MODE_INFO[targetLockMode].meaning}
                  </p>
                </div>

                {/* Required Top-Down Chain */}
                <div className="space-y-2 pt-2 border-t border-[#C5BEB0]">
                  <div className="text-[11px] font-mono font-bold uppercase text-[#1C1B18]">
                    Mandatory Acquisition Order (Top → Down; Release Bottom → Up)
                  </div>
                  <div className="space-y-1.5">
                    {intentionChain.map((item, idx) => (
                      <div
                        key={item.level}
                        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-[3px] border border-[#1C1B18] text-xs font-mono ${
                          idx === intentionChain.length - 1
                            ? 'bg-[#E5B82E] text-[#1C1B18] font-extrabold'
                            : 'bg-[#FAF7F0] text-[#1C1B18]'
                        }`}
                      >
                        <span>
                          L{idx + 1}. {item.level}
                        </span>
                        <span className="font-bold">{item.requiredLock}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
