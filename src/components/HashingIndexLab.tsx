import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCcw,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import {
  calculateMultilevelIndexMetrics,
  IndexOrganization,
  simulateExtendibleHashing,
  simulateLinearHashing,
} from '../utils/dbEngine';

type SubMode = 'hashing' | 'multilevel';
type HashScheme = 'extendible' | 'linear';

const HASH_PRESETS: Array<{
  id: string;
  label: string;
  scheme: HashScheme;
  keys: number[];
  cap: number;
  mod: number;
  note: string;
}> = [
  {
    id: 'a1_ext',
    label: 'A1+TA1 Q5(a) Extendible',
    scheme: 'extendible',
    keys: [16, 4, 6, 22, 24, 10, 31, 7, 9, 20],
    cap: 2,
    mod: 16,
    note: 'Demonstrates local bucket splits vs global directory doubling (D: 1 -> 2 -> 3) using h(K) = K mod 16.',
  },
  {
    id: 'pred_lin',
    label: 'Linear Hashing (M=2, cap=2)',
    scheme: 'linear',
    keys: [10, 14, 18, 22, 7, 11, 15, 25],
    cap: 2,
    mod: 16,
    note: 'Shows linear split pointer (next) advancing sequentially on bucket overflow without directory doubling.',
  },
];

const INDEX_PRESETS: Array<{
  id: string;
  label: string;
  numRecords: number;
  blockSize: number;
  recordSize: number;
  keySize: number;
  blockPointerSize: number;
  indexType: IndexOrganization;
  distinctValues?: number;
}> = [
  {
    id: 'a2_q4',
    label: 'A2+TA2 Q4 Official Exam (Primary)',
    numRecords: 30000,
    blockSize: 1024,
    recordSize: 100,
    keySize: 9,
    blockPointerSize: 6,
    indexType: 'primary',
  },
  {
    id: 'secondary_dense',
    label: 'Secondary Dense (30,000 recs)',
    numRecords: 30000,
    blockSize: 1024,
    recordSize: 100,
    keySize: 9,
    blockPointerSize: 6,
    indexType: 'secondary_dense',
  },
  {
    id: 'clustering_dept',
    label: 'Clustering Index (500 Depts)',
    numRecords: 50000,
    blockSize: 2048,
    recordSize: 120,
    keySize: 10,
    blockPointerSize: 6,
    indexType: 'clustering',
    distinctValues: 500,
  },
];

export const HashingIndexLab: React.FC = () => {
  const [subMode, setSubMode] = useState<SubMode>('hashing');

  // --- Hashing State ---
  const [scheme, setScheme] = useState<HashScheme>('extendible');
  const [keys, setKeys] = useState<number[]>(HASH_PRESETS[0].keys);
  const [bucketCap, setBucketCap] = useState<number>(2);
  const [newKeyInput, setNewKeyInput] = useState('14');
  const [stepIdx, setStepIdx] = useState<number | 'final'>('final');

  const extSim = useMemo(
    () => simulateExtendibleHashing(keys, bucketCap, 16),
    [keys, bucketCap]
  );
  const linSim = useMemo(
    () => simulateLinearHashing(keys, bucketCap, 2),
    [keys, bucketCap]
  );

  const totalSteps = scheme === 'extendible' ? extSim.steps.length : linSim.steps.length;
  const resolvedStep =
    totalSteps === 0
      ? -1
      : stepIdx === 'final'
      ? totalSteps - 1
      : Math.max(0, Math.min(stepIdx, totalSteps - 1));

  const activeExtStep = scheme === 'extendible' && resolvedStep >= 0 ? extSim.steps[resolvedStep] : null;
  const activeLinStep = scheme === 'linear' && resolvedStep >= 0 ? linSim.steps[resolvedStep] : null;

  const handleInsertHashKey = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(newKeyInput, 10);
    if (!Number.isFinite(val)) return;
    if (keys.length < 24) {
      setKeys((prev) => [...prev, val]);
      setStepIdx('final');
    }
    setNewKeyInput('');
  };

  // --- Multilevel Index Calculator State ---
  const [numRecords, setNumRecords] = useState<number>(30000);
  const [blockSize, setBlockSize] = useState<number>(1024);
  const [recordSize, setRecordSize] = useState<number>(100);
  const [keySize, setKeySize] = useState<number>(9);
  const [blockPointerSize, setBlockPointerSize] = useState<number>(6);
  const [indexType, setIndexType] = useState<IndexOrganization>('primary');
  const [distinctValues, setDistinctValues] = useState<number>(500);

  const indexMetrics = useMemo(
    () =>
      calculateMultilevelIndexMetrics({
        numRecords,
        blockSize,
        recordSize,
        keySize,
        blockPointerSize,
        indexType,
        distinctValues,
      }),
    [numRecords, blockSize, recordSize, keySize, blockPointerSize, indexType, distinctValues]
  );

  return (
    <div className="space-y-5" data-testid="hashing-index-lab">
      {/* Sub-mode switcher */}
      <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-[#1C1B18]">
            Module 3 Dynamic Hashing &amp; Multilevel Index Disk I/O Lab
          </h2>
          <p className="text-xs font-mono text-[#6E695D]">
            EXTENDIBLE &amp; LINEAR HASHING TRACER (A1 Q5a) · MULTILEVEL INDEX BLOCK &amp; DISK I/O CALCULATOR (A2 Q4)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSubMode('hashing')}
            className={`px-3.5 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap ${
              subMode === 'hashing'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
            }`}
          >
            Extendible &amp; Linear Hashing
          </button>
          <button
            type="button"
            onClick={() => setSubMode('multilevel')}
            className={`px-3.5 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge whitespace-nowrap ${
              subMode === 'multilevel'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
            }`}
          >
            Multilevel Index Disk I/O Calculator
          </button>
        </div>
      </div>

      {/* ====================================================================
          SUB-LAB A: EXTENDIBLE & LINEAR HASHING
         ==================================================================== */}
      {subMode === 'hashing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 cols: Directory + Buckets + Step Replay */}
          <div className="lg:col-span-7 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-[#1C1B18]">
                  {scheme === 'extendible'
                    ? `Extendible Hashing (Global Depth D = ${activeExtStep?.globalDepth ?? 1})`
                    : `Linear Hashing (Level i = ${activeLinStep?.level ?? 0}, Split Pointer next = ${activeLinStep?.splitPointer ?? 0})`}
                </h3>
                <p className="text-xs font-mono text-[#6E695D] tabular-nums">
                  Bucket Capacity = {bucketCap} keys · {keys.length} inserted keys
                </p>
              </div>

              <div className="flex items-center gap-1 p-0.5 bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px]">
                <button
                  type="button"
                  onClick={() => {
                    setScheme('extendible');
                    setStepIdx('final');
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-[2px] step-hinge ${
                    scheme === 'extendible'
                      ? 'bg-[#1C1B18] text-[#FAF7F0]'
                      : 'text-[#1C1B18] hover:bg-[#FAF7F0]'
                  }`}
                >
                  Extendible
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScheme('linear');
                    setStepIdx('final');
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-[2px] step-hinge ${
                    scheme === 'linear'
                      ? 'bg-[#1C1B18] text-[#FAF7F0]'
                      : 'text-[#1C1B18] hover:bg-[#FAF7F0]'
                  }`}
                >
                  Linear
                </button>
              </div>
            </div>

            {/* Visual Stage */}
            <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-4 space-y-4" data-testid="hashing-stage">
              {scheme === 'extendible' && activeExtStep && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <div className="md:col-span-5 space-y-1.5">
                    <div className="text-[11px] font-mono font-bold text-[#6E695D]">
                      DIRECTORY (2^{activeExtStep.globalDepth} = {activeExtStep.directory.length} ENTRIES)
                    </div>
                    <div className="divide-y divide-[#C5BEB0] border border-[#1C1B18] rounded-[4px] bg-[#FAF7F0] font-mono text-xs tabular-nums">
                      {activeExtStep.directory.map((entry) => (
                        <div
                          key={entry.bits}
                          className="px-3 py-1.5 flex items-center justify-between"
                        >
                          <span className="font-bold text-[#1C1B18]">{entry.bits}</span>
                          <span className="text-[#6E695D]">→</span>
                          <span className="px-1.5 py-0.5 bg-[#E5B82E] text-[#1C1B18] font-bold rounded-[2px] border border-[#1C1B18]">
                            {entry.bucketId}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-7 space-y-1.5">
                    <div className="text-[11px] font-mono font-bold text-[#6E695D]">
                      DATA BUCKETS ({activeExtStep.buckets.length} BUCKETS)
                    </div>
                    <div className="space-y-2">
                      {activeExtStep.buckets.map((b) => (
                        <div
                          key={b.id}
                          className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-3 flex flex-wrap items-center justify-between gap-2 font-mono text-xs tabular-nums"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1C1B18]">{b.id}</span>
                            <span className="px-1.5 py-0.5 bg-[#EAE4D7] border border-[#1C1B18] rounded-[2px] text-[11px]">
                              d&apos; = {b.localDepth}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {b.keys.length === 0 ? (
                              <span className="text-[#6E695D]">[ empty ]</span>
                            ) : (
                              b.keys.map((k) => (
                                <span
                                  key={k}
                                  className="px-2 py-0.5 bg-[#4F8A3D]/15 border border-[#1C1B18] rounded-[2px] font-bold text-[#1C1B18]"
                                >
                                  {k}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {scheme === 'linear' && activeLinStep && (
                <div className="space-y-2.5">
                  <div className="text-[11px] font-mono font-bold text-[#6E695D]">
                    LINEAR BUCKETS (MOD {activeLinStep.modulus}, NEXT SPLIT POINTER = BUCKET {activeLinStep.splitPointer})
                  </div>
                  <div className="space-y-2">
                    {activeLinStep.buckets.map((b) => {
                      const isSplitTarget = b.index === activeLinStep.splitPointer;
                      return (
                        <div
                          key={b.index}
                          className={`border border-[#1C1B18] rounded-[4px] p-3 flex flex-wrap items-center justify-between gap-2 font-mono text-xs tabular-nums ${
                            isSplitTarget ? 'bg-[#E5B82E]/25' : 'bg-[#FAF7F0]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1C1B18]">Bucket {b.index}</span>
                            {isSplitTarget && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#E5B82E] border border-[#1C1B18] rounded-[2px]">
                                NEXT SPLIT
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[#1C1B18]">
                              Primary: [{b.primaryKeys.join(', ') || '—'}]
                            </span>
                            {b.overflowKeys.length > 0 && (
                              <span className="px-2 py-0.5 bg-[#A62B2B]/15 border border-[#A62B2B] text-[#A62B2B] rounded-[2px] font-bold">
                                Overflow: [{b.overflowKeys.join(', ')}]
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Step Replay */}
            {totalSteps > 0 && (
              <div className="bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-[#1C1B18] tabular-nums">
                    Insert {scheme === 'extendible' ? activeExtStep?.insertedKey : activeLinStep?.insertedKey} · Step {resolvedStep + 1} / {totalSteps}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setStepIdx(0)}
                      disabled={resolvedStep <= 0}
                      aria-label="First hash step"
                      className="p-1.5 rounded-[3px] border border-[#1C1B18] bg-[#FAF7F0] hover:bg-[#E5B82E] disabled:opacity-40 step-hinge"
                    >
                      <SkipBack className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setStepIdx(Math.max(0, resolvedStep - 1))}
                      disabled={resolvedStep <= 0}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-[3px] border border-[#1C1B18] bg-[#FAF7F0] hover:bg-[#E5B82E] disabled:opacity-40 step-hinge"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStepIdx(Math.min(totalSteps - 1, resolvedStep + 1))}
                      disabled={resolvedStep >= totalSteps - 1}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-[3px] border border-[#1C1B18] bg-[#FAF7F0] hover:bg-[#E5B82E] disabled:opacity-40 step-hinge"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setStepIdx('final')}
                      disabled={resolvedStep >= totalSteps - 1}
                      aria-label="Final hash step"
                      className="p-1.5 rounded-[3px] border border-[#1C1B18] bg-[#FAF7F0] hover:bg-[#E5B82E] disabled:opacity-40 step-hinge"
                    >
                      <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <ul className="space-y-1 text-xs font-mono text-[#1C1B18] list-disc pl-4">
                  {(scheme === 'extendible' ? activeExtStep?.events : activeLinStep?.events)?.map(
                    (ev, i) => (
                      <li key={i}>{ev}</li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Right 5 cols: Presets & Insert */}
          <div className="lg:col-span-5 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 space-y-5">
            <div className="border-b border-[#1C1B18] pb-3">
              <h3 className="text-base font-extrabold text-[#1C1B18]">Hashing Parameters &amp; Presets</h3>
              <p className="mt-1 text-xs text-[#434038]">
                Insert keys and observe LSB binary hash routing, directory doubling, or linear split progression.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {HASH_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setScheme(p.scheme);
                    setKeys(p.keys);
                    setBucketCap(p.cap);
                    setStepIdx('final');
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-[#1C1B18] bg-[#EAE4D7] hover:bg-[#E5B82E] border border-[#1C1B18] rounded-[4px] step-hinge"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-bold text-[#1C1B18]">Bucket Capacity</div>
              <div className="flex items-center gap-2">
                {[2, 3].map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => {
                      setBucketCap(cap);
                      setStepIdx('final');
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                      bucketCap === cap
                        ? 'bg-[#E5B82E] text-[#1C1B18]'
                        : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                    }`}
                  >
                    {cap} Keys / Bucket
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleInsertHashKey} className="space-y-1.5">
              <label htmlFor="hash-insert-key" className="block text-xs font-bold text-[#1C1B18]">
                Insert Key (h(K) = K mod 16)
              </label>
              <div className="flex gap-2">
                <input
                  id="hash-insert-key"
                  type="number"
                  value={newKeyInput}
                  onChange={(e) => setNewKeyInput(e.target.value)}
                  className="flex-1 h-10 px-3 text-sm font-mono bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] text-[#1C1B18] focus:outline-none focus:bg-[#FAF7F0]"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 px-4 h-10 text-xs font-bold text-[#1C1B18] bg-[#E5B82E] hover:bg-[#d8ab22] border border-[#1C1B18] rounded-[4px] step-hinge"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Insert</span>
                </button>
              </div>
            </form>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#1C1B18]">Inserted Sequence</span>
                <button
                  type="button"
                  onClick={() => {
                    setKeys(HASH_PRESETS[0].keys);
                    setStepIdx('final');
                  }}
                  className="inline-flex items-center gap-1 font-bold text-[#434038] hover:text-[#1C1B18]"
                >
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  <span>Reset</span>
                </button>
              </div>
              <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-3 font-mono text-xs text-[#1C1B18]">
                {keys.join(', ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          SUB-LAB B: MULTILEVEL INDEX BLOCK & DISK I/O CALCULATOR
         ==================================================================== */}
      {subMode === 'multilevel' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 cols: Computed Formulas & Level Breakdown */}
          <div className="lg:col-span-7 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 space-y-5" data-testid="multilevel-results">
            <div className="border-b border-[#1C1B18] pb-3">
              <h3 className="text-base font-extrabold text-[#1C1B18]">
                Calculated Blocking Factors, Index Levels &amp; Disk I/O Cost
              </h3>
              <p className="text-xs font-mono text-[#6E695D]">
                EXACT ELMASRI &amp; NAVATHE CH. 17 FORMULAS (UNSPANNED STORAGE)
              </p>
            </div>

            {indexMetrics.error ? (
              <div className="p-4 rounded-[4px] bg-[#A62B2B]/10 border border-[#A62B2B] text-xs font-mono text-[#A62B2B]">
                {indexMetrics.error}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono tabular-nums">
                  <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-3">
                    <div className="text-[11px] text-[#6E695D]">DATA bfr</div>
                    <div className="text-xl font-extrabold text-[#1C1B18]">{indexMetrics.bfr}</div>
                    <div className="text-[10px] text-[#434038]">⌊B / R⌋ rec/blk</div>
                  </div>
                  <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-3">
                    <div className="text-[11px] text-[#6E695D]">DATA BLOCKS (b)</div>
                    <div className="text-xl font-extrabold text-[#1C1B18]">{indexMetrics.dataBlocks.toLocaleString()}</div>
                    <div className="text-[10px] text-[#434038]">⌈r / bfr⌉</div>
                  </div>
                  <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-3">
                    <div className="text-[11px] text-[#6E695D]">FAN-OUT (bfr_i)</div>
                    <div className="text-xl font-extrabold text-[#1C1B18]">{indexMetrics.bfrIndex}</div>
                    <div className="text-[10px] text-[#434038]">⌊B / ({keySize}+{blockPointerSize})⌋</div>
                  </div>
                  <div className="bg-[#E5B82E] border border-[#1C1B18] rounded-[4px] p-3">
                    <div className="text-[11px] text-[#1C1B18] font-bold">MULTILEVEL I/O</div>
                    <div className="text-xl font-extrabold text-[#1C1B18]">{indexMetrics.multilevelSearchIO}</div>
                    <div className="text-[10px] text-[#1C1B18]">t + 1 = {indexMetrics.totalIndexLevels} + 1</div>
                  </div>
                </div>

                {/* Level-by-Level Table */}
                <div className="overflow-x-auto border border-[#1C1B18] rounded-[4px]">
                  <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
                    <thead>
                      <tr className="bg-[#EAE4D7] border-b border-[#1C1B18] text-[#1C1B18]">
                        <th className="py-2 px-3">Index Level</th>
                        <th className="py-2 px-3">Entries (r_k)</th>
                        <th className="py-2 px-3">Blocks (b_k = ⌈r_k / bfr_i⌉)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C5BEB0]">
                      {indexMetrics.levels.map((lvl) => (
                        <tr key={lvl.level} className="bg-[#FAF7F0]">
                          <td className="py-2 px-3 font-bold text-[#1C1B18]">
                            Level {lvl.level} {lvl.level === indexMetrics.totalIndexLevels ? '(Top Root)' : ''}
                          </td>
                          <td className="py-2 px-3 text-[#434038]">{lvl.entries.toLocaleString()}</td>
                          <td className="py-2 px-3 font-bold text-[#1C1B18]">{lvl.blocks.toLocaleString()} blocks</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Disk I/O Comparison */}
                <div className="bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px] p-4 space-y-2 text-xs font-mono tabular-nums">
                  <div className="font-bold text-[#1C1B18] font-sans">Search Cost Comparison (Worst-Case Block Accesses)</div>
                  <div className="flex justify-between">
                    <span className="text-[#434038]">1. Linear Scan on Data File (avg b/2)</span>
                    <span className="font-bold text-[#1C1B18]">{indexMetrics.linearScanAvgIO.toLocaleString()} I/Os</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#434038]">2. Binary Search on Ordered Data File (⌈log₂ b⌉)</span>
                    <span className="font-bold text-[#1C1B18]">{indexMetrics.binarySearchDataFileIO} I/Os</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#434038]">3. Single-Level Index (⌈log₂ b₁⌉ + 1)</span>
                    <span className="font-bold text-[#1C1B18]">{indexMetrics.singleLevelBinarySearchIO} I/Os</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#1C1B18]">
                    <span className="font-bold text-[#4F8A3D]">4. Multilevel Index (t + 1) — Saves {indexMetrics.ioSavedVsSingleLevel} I/Os vs Single-Level</span>
                    <span className="font-extrabold text-[#4F8A3D]">{indexMetrics.multilevelSearchIO} I/Os</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right 5 cols: Parameters & Presets */}
          <div className="lg:col-span-5 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-5 sm:p-6 space-y-4">
            <div className="border-b border-[#1C1B18] pb-3">
              <h3 className="text-base font-extrabold text-[#1C1B18]">File &amp; Index Parameters</h3>
              <p className="mt-1 text-xs text-[#434038]">
                Load A2+TA2 Q4 or adjust file size, block size, and index organization.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {INDEX_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setNumRecords(p.numRecords);
                    setBlockSize(p.blockSize);
                    setRecordSize(p.recordSize);
                    setKeySize(p.keySize);
                    setBlockPointerSize(p.blockPointerSize);
                    setIndexType(p.indexType);
                    if (p.distinctValues) setDistinctValues(p.distinctValues);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-[#1C1B18] bg-[#EAE4D7] hover:bg-[#E5B82E] border border-[#1C1B18] rounded-[4px] step-hinge"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-bold text-[#1C1B18]">Index Organization</div>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'primary', label: 'Primary (Sparse)' },
                    { id: 'secondary_dense', label: 'Secondary (Dense)' },
                    { id: 'clustering', label: 'Clustering' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setIndexType(opt.id)}
                    className={`py-2 px-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                      indexType === opt.id
                        ? 'bg-[#E5B82E] text-[#1C1B18]'
                        : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#EAE4D7]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="idx-records" className="block text-xs font-bold text-[#1C1B18]">
                  Records (r)
                </label>
                <input
                  id="idx-records"
                  type="number"
                  min={1}
                  value={numRecords}
                  onChange={(e) => setNumRecords(Number(e.target.value) || 1)}
                  className="w-full h-9 px-2.5 text-sm font-mono bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px]"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="idx-block" className="block text-xs font-bold text-[#1C1B18]">
                  Block Size B (bytes)
                </label>
                <input
                  id="idx-block"
                  type="number"
                  min={32}
                  value={blockSize}
                  onChange={(e) => setBlockSize(Number(e.target.value) || 32)}
                  className="w-full h-9 px-2.5 text-sm font-mono bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px]"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="idx-recsize" className="block text-xs font-bold text-[#1C1B18]">
                  Record Size R (bytes)
                </label>
                <input
                  id="idx-recsize"
                  type="number"
                  min={1}
                  value={recordSize}
                  onChange={(e) => setRecordSize(Number(e.target.value) || 1)}
                  className="w-full h-9 px-2.5 text-sm font-mono bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px]"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="idx-keysize" className="block text-xs font-bold text-[#1C1B18]">
                  Key Size V (bytes)
                </label>
                <input
                  id="idx-keysize"
                  type="number"
                  min={1}
                  value={keySize}
                  onChange={(e) => setKeySize(Number(e.target.value) || 1)}
                  className="w-full h-9 px-2.5 text-sm font-mono bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px]"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="idx-ptrsize" className="block text-xs font-bold text-[#1C1B18]">
                  Pointer Size P (bytes)
                </label>
                <input
                  id="idx-ptrsize"
                  type="number"
                  min={1}
                  value={blockPointerSize}
                  onChange={(e) => setBlockPointerSize(Number(e.target.value) || 1)}
                  className="w-full h-9 px-2.5 text-sm font-mono bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px]"
                />
              </div>
              {indexType === 'clustering' && (
                <div className="space-y-1">
                  <label htmlFor="idx-distinct" className="block text-xs font-bold text-[#1C1B18]">
                    Distinct Field Values
                  </label>
                  <input
                    id="idx-distinct"
                    type="number"
                    min={1}
                    value={distinctValues}
                    onChange={(e) => setDistinctValues(Number(e.target.value) || 1)}
                    className="w-full h-9 px-2.5 text-sm font-mono bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
