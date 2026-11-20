import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';
import {
  parseSchedule,
  parseWalLog,
  RecoveryMode,
  simulateLogRecovery,
  simulateTimestampOrdering,
  TimestampMode,
} from '../utils/dbEngine';

type SubLabMode = 'timestamp' | 'recovery';

const TO_PRESETS = [
  {
    id: 'thomas_classic',
    name: 'Thomas Write Rule Classic',
    schedule: 'R1(X); W2(X); W1(X); C1; C2',
    timestamps: 'T1=10, T2=20',
    note: 'T1 tries an obsolete write W1(X) after T2(20) wrote X. Basic TO aborts T1; Thomas Write Rule ignores W1(X) so both commit.',
  },
  {
    id: 'basic_read_abort',
    name: 'Basic TO Read Abort',
    schedule: 'W2(X); R1(X); C2',
    timestamps: 'T1=10, T2=20',
    note: 'T1(10) attempts to read X after younger T2(20) wrote X (WTS(X)=20 > TS(T1)=10) -> aborted under both Basic TO & Thomas.',
  },
  {
    id: 'three_tx',
    name: '3-Tx Interleaved FAT Drill',
    schedule: 'R1(A); R2(A); W2(A); W1(A); W3(A); C1; C2; C3',
    timestamps: 'T1=10, T2=20, T3=30',
    note: 'Younger T2 reads A before T1 writes A -> RTS(A)=20 > TS(T1)=10 aborts T1 even under Thomas Write Rule!',
  },
];

const WAL_PRESETS = [
  {
    id: 'predicted_q8b',
    name: 'Predicted Q8(b) Checkpoint Log',
    initValues: 'A=2000, B=5000, C=1500',
    log: `[Start, T1]
[Write, T1, A, 2000, 2400]
[Commit, T1]
[Checkpoint]
[Start, T2]
[Write, T2, B, 5000, 4200]
[Start, T3]
[Write, T3, C, 1500, 1800]
[Commit, T3]
[Start, T4]
[Write, T4, A, 2400, 2100]
<SYSTEM CRASH>`,
    note: 'T1 committed pre-checkpoint (skip), T3 committed post-checkpoint (REDO), T2 & T4 active at crash (UNDO under Immediate; ignored under Deferred).',
  },
  {
    id: 'a1_q8b_bank',
    name: 'Banking Multi-Write Crash Log',
    initValues: 'X=500, Y=1000, Z=300',
    log: `[Start, T1]
[Write, T1, X, 500, 700]
[Start, T2]
[Write, T2, Y, 1000, 850]
[Commit, T1]
[Checkpoint]
[Write, T2, Z, 300, 450]
[Start, T3]
[Write, T3, X, 700, 900]
[Commit, T2]
[Start, T4]
[Write, T4, Y, 850, 600]
<SYSTEM CRASH>`,
    note: 'T2 started BEFORE checkpoint and committed AFTER checkpoint -> T2 must be REDOne; T3 & T4 never committed -> UNDO under Immediate.',
  },
];

function parseKeyValMap(raw: string): Record<string, number> {
  const result: Record<string, number> = {};
  raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((pair) => {
      const [k, v] = pair.split('=').map((x) => x.trim());
      const num = Number(v);
      if (k && Number.isFinite(num)) {
        result[k.toUpperCase()] = num;
      }
    });
  return result;
}

export const TimestampRecoveryLab: React.FC = () => {
  const [subMode, setSubMode] = useState<SubLabMode>('timestamp');

  // --- Timestamp Ordering state ---
  const [toMode, setToMode] = useState<TimestampMode>('thomas');
  const [scheduleInput, setScheduleInput] = useState(TO_PRESETS[0].schedule);
  const [tsInput, setTsInput] = useState(TO_PRESETS[0].timestamps);

  const parsedSched = useMemo(() => parseSchedule(scheduleInput), [scheduleInput]);
  const customTs = useMemo(() => parseKeyValMap(tsInput), [tsInput]);
  const toResult = useMemo(() => {
    if (parsedSched.error || parsedSched.ops.length === 0) return null;
    return simulateTimestampOrdering(parsedSched.ops, customTs, toMode);
  }, [parsedSched, customTs, toMode]);

  // --- WAL Recovery state ---
  const [recoveryMode, setRecoveryMode] = useState<RecoveryMode>('immediate');
  const [initInput, setInitInput] = useState(WAL_PRESETS[0].initValues);
  const [walInput, setWalInput] = useState(WAL_PRESETS[0].log);

  const parsedWal = useMemo(() => parseWalLog(walInput), [walInput]);
  const initialDiskMap = useMemo(() => parseKeyValMap(initInput), [initInput]);
  const recoveryResult = useMemo(() => {
    if (parsedWal.error || parsedWal.entries.length === 0) return null;
    return simulateLogRecovery(initialDiskMap, parsedWal.entries, recoveryMode);
  }, [initialDiskMap, parsedWal, recoveryMode]);

  return (
    <div className="space-y-5" data-testid="timestamp-recovery-lab">
      {/* Sub-mode switcher */}
      <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-[#1C1B18]">
            Module 4 Concurrency &amp; Crash Recovery Simulators
          </h2>
          <p className="text-xs font-mono text-[#6E695D]">
            RTS/WTS TIMESTAMP ORDERING (BASIC VS THOMAS WRITE RULE) · WRITE-AHEAD LOG RECOVERY (DEFERRED VS IMMEDIATE)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSubMode('timestamp')}
            className={`px-3.5 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap ${
              subMode === 'timestamp'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
            }`}
          >
            Timestamp Ordering (RTS / WTS)
          </button>
          <button
            type="button"
            onClick={() => setSubMode('recovery')}
            className={`px-3.5 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap ${
              subMode === 'recovery'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
            }`}
          >
            WAL Log Recovery (UNDO / REDO)
          </button>
        </div>
      </div>

      {/* ====================================================================
          SUB-LAB A: TIMESTAMP ORDERING (BASIC TO VS THOMAS WRITE RULE)
         ==================================================================== */}
      {subMode === 'timestamp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 cols: Step-by-step trace table */}
          <div className="lg:col-span-7 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-[#1C1B18]">
                  {toMode === 'thomas' ? 'Thomas Write Rule Trace' : 'Basic Timestamp Ordering Trace'}
                </h3>
                <p className="text-xs font-mono text-[#6E695D]">
                  {toResult
                    ? `Aborted: ${toResult.abortedTxs.length ? toResult.abortedTxs.join(', ') : 'None'} · Ignored Writes: ${toResult.ignoredWrites}`
                    : 'Enter a valid schedule to trace.'}
                </p>
              </div>

              <div className="flex items-center gap-1 p-0.5 bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px]">
                <button
                  type="button"
                  onClick={() => setToMode('basic')}
                  className={`px-3 py-1 text-xs font-bold rounded-[2px] step-hinge ${
                    toMode === 'basic'
                      ? 'bg-[#1C1B18] text-[#FAF7F0]'
                      : 'text-[#1C1B18] hover:bg-[#FAF7F0]'
                  }`}
                >
                  Basic TO
                </button>
                <button
                  type="button"
                  onClick={() => setToMode('thomas')}
                  className={`px-3 py-1 text-xs font-bold rounded-[2px] step-hinge ${
                    toMode === 'thomas'
                      ? 'bg-[#1C1B18] text-[#FAF7F0]'
                      : 'text-[#1C1B18] hover:bg-[#FAF7F0]'
                  }`}
                >
                  Thomas Write Rule
                </button>
              </div>
            </div>

            {parsedSched.error ? (
              <div className="p-4 rounded-[4px] bg-[#A62B2B]/10 border border-[#A62B2B] text-xs font-mono text-[#A62B2B]">
                {parsedSched.error}
              </div>
            ) : (
              toResult && (
                <>
                  {/* Outcome banner */}
                  <div
                    data-testid="to-summary-banner"
                    className={`p-3.5 rounded-[4px] border border-[#1C1B18] flex items-center gap-2.5 text-xs font-bold ${
                      toResult.abortedTxs.length === 0
                        ? 'bg-[#4F8A3D]/15 text-[#1C1B18]'
                        : 'bg-[#A62B2B]/15 text-[#1C1B18]'
                    }`}
                  >
                    {toResult.abortedTxs.length === 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-[#4F8A3D] shrink-0" aria-hidden="true" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-[#A62B2B] shrink-0" aria-hidden="true" />
                    )}
                    <span>
                      {toResult.abortedTxs.length === 0
                        ? `Zero Aborts (${toResult.ignoredWrites} obsolete write${toResult.ignoredWrites === 1 ? '' : 's'} safely ignored via Thomas Write Rule).`
                        : `Aborted Transaction(s): ${toResult.abortedTxs.join(', ')} (must rollback & restart with a newer timestamp).`}
                    </span>
                  </div>

                  {/* Step Table */}
                  <div className="overflow-x-auto border border-[#1C1B18] rounded-[4px]">
                    <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
                      <thead>
                        <tr className="bg-[#EAE4D7] border-b border-[#1C1B18] text-[#1C1B18]">
                          <th className="py-2 px-3">#</th>
                          <th className="py-2 px-3">Op (TS)</th>
                          <th className="py-2 px-3">Decision</th>
                          <th className="py-2 px-3">After RTS / WTS</th>
                          <th className="py-2 px-3 font-sans">Rule Justification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C5BEB0]">
                        {toResult.steps.map((st) => {
                          const badgeClass =
                            st.status === 'allowed'
                              ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                              : st.status === 'ignored'
                              ? 'bg-[#E5B82E] text-[#1C1B18]'
                              : st.status === 'aborted'
                              ? 'bg-[#A62B2B] text-[#FAF7F0]'
                              : 'bg-[#EAE4D7] text-[#6E695D]';
                          return (
                            <tr key={st.stepIndex} className="bg-[#FAF7F0] hover:bg-[#F4EFE4]">
                              <td className="py-2.5 px-3 font-bold text-[#6E695D]">{st.stepIndex}</td>
                              <td className="py-2.5 px-3 font-bold text-[#1C1B18] whitespace-nowrap">
                                {st.op.raw} <span className="text-[#6E695D]">({st.txTs})</span>
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`px-2 py-0.5 text-[11px] font-bold uppercase rounded-[2px] border border-[#1C1B18] ${badgeClass}`}
                                >
                                  {st.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap text-[#1C1B18]">
                                {st.op.item
                                  ? `${st.op.item}: R=${st.afterRts}, W=${st.afterWts}`
                                  : '—'}
                              </td>
                              <td className="py-2.5 px-3 font-sans text-[#434038] leading-relaxed">
                                {st.reason}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )
            )}
          </div>

          {/* Right 5 cols: Presets & Inputs */}
          <div className="lg:col-span-5 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 space-y-5">
            <div className="border-b border-[#1C1B18] pb-3">
              <h3 className="text-base font-extrabold text-[#1C1B18]">Schedule &amp; Timestamps</h3>
              <p className="mt-1 text-xs text-[#434038]">
                Compare Basic TO against Thomas Write Rule on the exact same schedule.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-[#1C1B18]">FAT Exam Presets</div>
              <div className="flex flex-wrap gap-1.5">
                {TO_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setScheduleInput(p.schedule);
                      setTsInput(p.timestamps);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-[#1C1B18] bg-[#EAE4D7] hover:bg-[#E5B82E] border border-[#1C1B18] rounded-[4px] step-hinge"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="to-schedule" className="block text-xs font-bold text-[#1C1B18]">
                Schedule Operations (e.g. R1(X); W2(X); W1(X); C1; C2)
              </label>
              <textarea
                id="to-schedule"
                rows={3}
                value={scheduleInput}
                onChange={(e) => setScheduleInput(e.target.value)}
                className="w-full p-3 text-sm font-mono bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] text-[#1C1B18] focus:outline-none focus:bg-[#FAF7F0]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="to-timestamps" className="block text-xs font-bold text-[#1C1B18]">
                Transaction Timestamps (TS)
              </label>
              <input
                id="to-timestamps"
                type="text"
                value={tsInput}
                onChange={(e) => setTsInput(e.target.value)}
                placeholder="T1=10, T2=20, T3=30"
                className="w-full h-10 px-3 text-sm font-mono bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] text-[#1C1B18] focus:outline-none focus:bg-[#FAF7F0]"
              />
            </div>

            <div className="pt-3 border-t border-[#1C1B18] text-xs text-[#434038] space-y-1.5">
              <div className="font-bold text-[#1C1B18]">Exam Cheat Rule</div>
              <p><strong>Read R(X):</strong> If WTS(X) &gt; TS(T), abort T; else RTS(X) = max(RTS(X), TS(T)).</p>
              <p><strong>Write W(X):</strong> If RTS(X) &gt; TS(T), always abort T. If WTS(X) &gt; TS(T): Basic TO aborts T, while Thomas Write Rule ignores W(X) and lets T continue.</p>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          SUB-LAB B: WAL LOG-BASED RECOVERY (DEFERRED VS IMMEDIATE)
         ==================================================================== */}
      {subMode === 'recovery' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 cols: UNDO/REDO Analysis & Final Disk Values */}
          <div className="lg:col-span-7 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-[#1C1B18]">
                  {recoveryMode === 'immediate'
                    ? 'Immediate Update Recovery (UNDO / REDO)'
                    : 'Deferred Update Recovery (NO-UNDO / REDO)'}
                </h3>
                <p className="text-xs font-mono text-[#6E695D]">
                  WRITE-AHEAD LOGGING (WAL) CRASH RECOVERY ENGINE
                </p>
              </div>

              <div className="flex items-center gap-1 p-0.5 bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px]">
                <button
                  type="button"
                  onClick={() => setRecoveryMode('deferred')}
                  className={`px-3 py-1 text-xs font-bold rounded-[2px] step-hinge ${
                    recoveryMode === 'deferred'
                      ? 'bg-[#1C1B18] text-[#FAF7F0]'
                      : 'text-[#1C1B18] hover:bg-[#FAF7F0]'
                  }`}
                >
                  Deferred (NO-UNDO)
                </button>
                <button
                  type="button"
                  onClick={() => setRecoveryMode('immediate')}
                  className={`px-3 py-1 text-xs font-bold rounded-[2px] step-hinge ${
                    recoveryMode === 'immediate'
                      ? 'bg-[#1C1B18] text-[#FAF7F0]'
                      : 'text-[#1C1B18] hover:bg-[#FAF7F0]'
                  }`}
                >
                  Immediate (UNDO/REDO)
                </button>
              </div>
            </div>

            {parsedWal.error ? (
              <div className="p-4 rounded-[4px] bg-[#A62B2B]/10 border border-[#A62B2B] text-xs font-mono text-[#A62B2B]">
                {parsedWal.error}
              </div>
            ) : (
              recoveryResult && (
                <>
                  {/* Transaction Lists */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" data-testid="wal-recovery-lists">
                    <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-3 space-y-1">
                      <div className="text-[11px] font-mono font-bold text-[#6E695D]">PRE-CHECKPOINT (SKIP)</div>
                      <div className="text-sm font-mono font-bold text-[#1C1B18]">
                        {recoveryResult.committedBeforeCheckpoint.length > 0
                          ? recoveryResult.committedBeforeCheckpoint.join(', ')
                          : 'None'}
                      </div>
                    </div>
                    <div className="bg-[#4F8A3D]/15 border border-[#1C1B18] rounded-[4px] p-3 space-y-1">
                      <div className="text-[11px] font-mono font-bold text-[#4F8A3D]">REDO LIST (FORWARD)</div>
                      <div className="text-sm font-mono font-bold text-[#1C1B18]">
                        {recoveryResult.redoList.length > 0
                          ? recoveryResult.redoList.join(', ')
                          : 'None'}
                      </div>
                    </div>
                    <div className="bg-[#A62B2B]/15 border border-[#1C1B18] rounded-[4px] p-3 space-y-1">
                      <div className="text-[11px] font-mono font-bold text-[#A62B2B]">UNDO LIST (BACKWARD)</div>
                      <div className="text-sm font-mono font-bold text-[#1C1B18]">
                        {recoveryResult.undoList.length > 0
                          ? recoveryResult.undoList.join(', ')
                          : recoveryMode === 'deferred'
                          ? 'None (NO-UNDO)'
                          : 'None'}
                      </div>
                    </div>
                  </div>

                  {/* Disk State Comparison */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[#1C1B18]">
                      Disk State: Crash Snapshot vs Post-Recovery Consistent State
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" data-testid="wal-final-values">
                      {Object.keys(recoveryResult.finalValues)
                        .sort()
                        .map((item) => (
                          <div
                            key={item}
                            className="bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px] p-3 font-mono tabular-nums"
                          >
                            <div className="text-xs text-[#434038]">Item {item}</div>
                            <div className="text-lg font-extrabold text-[#1C1B18]">
                              {recoveryResult.finalValues[item]}
                            </div>
                            <div className="text-[11px] text-[#6E695D]">
                              At crash: {recoveryResult.diskBeforeRecovery[item]}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Action Log */}
                  <div className="space-y-2 pt-2 border-t border-[#1C1B18]">
                    <div className="text-xs font-bold text-[#1C1B18]">Step-by-Step Recovery Actions</div>
                    <ol className="space-y-1.5 text-xs font-mono">
                      {recoveryResult.actions.map((act, idx) => (
                        <li
                          key={idx}
                          className="flex flex-wrap items-center gap-2 bg-[#F4EFE4] border border-[#C5BEB0] rounded-[4px] px-3 py-2"
                        >
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded-[2px] border border-[#1C1B18] ${
                              act.phase === 'REDO'
                                ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                                : act.phase === 'UNDO'
                                ? 'bg-[#A62B2B] text-[#FAF7F0]'
                                : 'bg-[#EAE4D7] text-[#434038]'
                            }`}
                          >
                            {act.phase}
                          </span>
                          <span className="text-[#1C1B18]">{act.detail}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </>
              )
            )}
          </div>

          {/* Right 5 cols: Crash Log Inputs */}
          <div className="lg:col-span-5 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 space-y-5">
            <div className="border-b border-[#1C1B18] pb-3 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-[#1C1B18]">System Log &amp; Initial Disk</h3>
                <p className="mt-1 text-xs text-[#434038]">
                  Edit log lines or load a VIT FAT checkpoint crash scenario.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setInitInput(WAL_PRESETS[0].initValues);
                  setWalInput(WAL_PRESETS[0].log);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#434038] hover:text-[#1C1B18]"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                <span>Reset</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {WAL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setInitInput(preset.initValues);
                    setWalInput(preset.log);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-[#1C1B18] bg-[#EAE4D7] hover:bg-[#E5B82E] border border-[#1C1B18] rounded-[4px] step-hinge"
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="wal-init" className="block text-xs font-bold text-[#1C1B18]">
                Initial Committed Disk Values
              </label>
              <input
                id="wal-init"
                type="text"
                value={initInput}
                onChange={(e) => setInitInput(e.target.value)}
                className="w-full h-10 px-3 text-sm font-mono bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] text-[#1C1B18] focus:outline-none focus:bg-[#FAF7F0]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="wal-log-text" className="block text-xs font-bold text-[#1C1B18]">
                WAL Log Records
              </label>
              <textarea
                id="wal-log-text"
                rows={10}
                value={walInput}
                onChange={(e) => setWalInput(e.target.value)}
                className="w-full p-3 text-xs font-mono bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] text-[#1C1B18] leading-relaxed focus:outline-none focus:bg-[#FAF7F0]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
