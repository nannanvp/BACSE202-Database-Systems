import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SkipBack,
  SkipForward,
  XCircle,
} from 'lucide-react';
import {
  calculateSemijoinCost,
  FRAG_SAMPLE_EMPLOYEES,
  HORIZONTAL_PRESETS,
  HorizontalPresetId,
  NodeTwoPCState,
  SEMIJOIN_PRESETS,
  SemijoinInput,
  TWO_PC_SCENARIOS,
  TwoPCScenarioId,
  validateHorizontalFragmentation,
  validateVerticalFragmentation,
  VERTICAL_ALL_ATTRS,
  VERTICAL_PK,
  VERTICAL_PRESETS,
  VerticalPresetId,
} from '../utils/ddbmsEngine';

type SubTab = 'semijoin' | 'fragmentation' | 'twopc';
type FragMode = 'horizontal' | 'vertical';

const TWO_PC_SCENARIO_LIST: TwoPCScenarioId[] = [
  'normal_commit',
  'participant_abort',
  'participant_crash_before_vote',
  'participant_crash_after_ready',
  'coordinator_crash_blocking',
];

const HORIZONTAL_PRESET_LIST: HorizontalPresetId[] = [
  'valid_dept',
  'broken_completeness',
  'broken_disjointness',
];

const VERTICAL_PRESET_LIST: VerticalPresetId[] = [
  'valid_pk_split',
  'missing_pk',
  'dropped_col',
  'duplicate_nonkey',
];

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes.toLocaleString()} B`;
}

function getTwoPCNodeColors(state: NodeTwoPCState): {
  fill: string;
  stroke: string;
  text: string;
  badgeBg: string;
  badgeText: string;
} {
  switch (state) {
    case 'COMMITTED':
      return {
        fill: '#4F8A3D',
        stroke: '#1C1B18',
        text: '#FAF7F0',
        badgeBg: 'bg-[#4F8A3D]',
        badgeText: 'text-[#FAF7F0]',
      };
    case 'ABORTED':
      return {
        fill: '#E06D2B',
        stroke: '#1C1B18',
        text: '#1C1B18',
        badgeBg: 'bg-[#E06D2B]',
        badgeText: 'text-[#1C1B18]',
      };
    case 'CRASHED':
      return {
        fill: '#A62B2B',
        stroke: '#1C1B18',
        text: '#FAF7F0',
        badgeBg: 'bg-[#A62B2B]',
        badgeText: 'text-[#FAF7F0]',
      };
    case 'BLOCKED':
      return {
        fill: '#A62B2B',
        stroke: '#1C1B18',
        text: '#FAF7F0',
        badgeBg: 'bg-[#A62B2B]',
        badgeText: 'text-[#FAF7F0]',
      };
    case 'READY (IN-DOUBT)':
      return {
        fill: '#E5B82E',
        stroke: '#1C1B18',
        text: '#1C1B18',
        badgeBg: 'bg-[#E5B82E]',
        badgeText: 'text-[#1C1B18]',
      };
    case 'WAIT':
      return {
        fill: '#22559C',
        stroke: '#1C1B18',
        text: '#FAF7F0',
        badgeBg: 'bg-[#22559C]',
        badgeText: 'text-[#FAF7F0]',
      };
    default:
      return {
        fill: '#F4EFE4',
        stroke: '#1C1B18',
        text: '#1C1B18',
        badgeBg: 'bg-[#EAE4D7]',
        badgeText: 'text-[#1C1B18]',
      };
  }
}

export const DdbmsProtocolLab: React.FC = () => {
  const [subTab, setSubTab] = useState<SubTab>('semijoin');

  // --- Tab 1: Semijoin Cost Calculator state ---
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SEMIJOIN_PRESETS[0].id);
  const [semijoinInput, setSemijoinInput] = useState<SemijoinInput>(SEMIJOIN_PRESETS[0].input);

  // --- Tab 2: Fragmentation Validator state ---
  const [fragMode, setFragMode] = useState<FragMode>('horizontal');
  const [horizPresetId, setHorizPresetId] = useState<HorizontalPresetId>('valid_dept');
  const [vertPresetId, setVertPresetId] = useState<VerticalPresetId>('valid_pk_split');
  const [customVertFragments, setCustomVertFragments] = useState<
    Array<{ name: string; attrs: string[] }>
  >(() => VERTICAL_PRESETS.valid_pk_split.fragments.map((f) => ({ ...f, attrs: [...f.attrs] })));

  // --- Tab 3: 2PC Crash-Recovery Stepper state ---
  const [twoPcScenarioId, setTwoPcScenarioId] = useState<TwoPCScenarioId>('normal_commit');
  const [twoPcStepIdx, setTwoPcStepIdx] = useState<number>(0);

  // Derived results
  const semijoinResult = useMemo(() => calculateSemijoinCost(semijoinInput), [semijoinInput]);
  const horizResult = useMemo(
    () => validateHorizontalFragmentation(horizPresetId),
    [horizPresetId]
  );
  const vertResult = useMemo(
    () => validateVerticalFragmentation(customVertFragments),
    [customVertFragments]
  );

  const activeTwoPcScenario = TWO_PC_SCENARIOS[twoPcScenarioId];
  const clampedStepIdx = Math.min(
    Math.max(0, twoPcStepIdx),
    activeTwoPcScenario.steps.length - 1
  );
  const activeTwoPcStep = activeTwoPcScenario.steps[clampedStepIdx];

  const handleSelectSemijoinPreset = (presetId: string) => {
    const preset = SEMIJOIN_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(preset.id);
    setSemijoinInput({ ...preset.input });
  };

  const updateSemijoinField = <K extends keyof SemijoinInput>(key: K, rawValue: number) => {
    setSelectedPresetId('custom');
    const safeVal = Number.isFinite(rawValue) ? Math.max(0, Math.round(rawValue)) : 0;
    setSemijoinInput((prev) => {
      const next = { ...prev, [key]: safeVal };
      if (key === 'tuplesS' && next.distinctJoinKeysS > safeVal) {
        next.distinctJoinKeysS = Math.max(1, safeVal);
      }
      if (key === 'tuplesR' && next.matchingTuplesR > safeVal) {
        next.matchingTuplesR = safeVal;
      }
      return next;
    });
  };

  const handleSelectVerticalPreset = (presetId: VerticalPresetId) => {
    setVertPresetId(presetId);
    setCustomVertFragments(
      VERTICAL_PRESETS[presetId].fragments.map((f) => ({ ...f, attrs: [...f.attrs] }))
    );
  };

  const handleToggleVerticalAttr = (fragIndex: number, attr: string) => {
    setCustomVertFragments((prev) =>
      prev.map((frag, idx) => {
        if (idx !== fragIndex) return frag;
        const exists = frag.attrs.includes(attr);
        return {
          ...frag,
          attrs: exists ? frag.attrs.filter((a) => a !== attr) : [...frag.attrs, attr],
        };
      })
    );
  };

  const handleSelectTwoPcScenario = (scenarioId: TwoPCScenarioId) => {
    setTwoPcScenarioId(scenarioId);
    setTwoPcStepIdx(0);
  };

  const maxTransferBytes = Math.max(
    1,
    semijoinResult.naiveShipRBytes,
    semijoinResult.naiveShipSBytes,
    semijoinResult.semijoinTotalBytes
  );

  const beatsShipR = semijoinResult.semijoinTotalBytes < semijoinResult.naiveShipRBytes;
  const activeFragValid = fragMode === 'horizontal' ? horizResult.allValid : vertResult.allValid;

  return (
    <div data-testid="ddbms-lab" className="space-y-5">
      {/* Lab Header & Sub-Tab Switcher */}
      <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#1C1B18] tracking-tight">
              Module 5 · DDBMS Semijoin, Fragmentation &amp; 2PC Lab
            </h2>
            <p className="text-xs font-mono text-[#6E695D] mt-0.5">
              A1 Q9–10 · A2 Q7–8 · MODEL Q10 — NETWORK TRANSFER MATH, FRAGMENTATION RULES &amp; CRASH RECOVERY
            </p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-[4px] bg-[#22559C] text-[#FAF7F0] border border-[#1C1B18] font-mono text-[11px] font-bold self-start sm:self-auto whitespace-nowrap shrink-0">
            M5 · DDBMS &amp; 2PC
          </span>
        </div>

        <div
          role="tablist"
          aria-label="DDBMS Lab Tools"
          className="grid grid-cols-1 sm:grid-cols-3 gap-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'semijoin'}
            onClick={() => setSubTab('semijoin')}
            className={`px-3.5 py-2.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge text-left flex items-center justify-between gap-2 ${
              subTab === 'semijoin'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#F4EFE4] text-[#1C1B18] hover:bg-[#EAE4D7]'
            }`}
          >
            <span>Semijoin Cost Calculator (R ⋉ S)</span>
            <span className="font-mono text-[10px] opacity-80 shrink-0">A1 Q9</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'fragmentation'}
            onClick={() => setSubTab('fragmentation')}
            className={`px-3.5 py-2.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge text-left flex items-center justify-between gap-2 ${
              subTab === 'fragmentation'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#F4EFE4] text-[#1C1B18] hover:bg-[#EAE4D7]'
            }`}
          >
            <span>Fragmentation Validator</span>
            <span className="font-mono text-[10px] opacity-80 shrink-0">C·D·R</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'twopc'}
            onClick={() => setSubTab('twopc')}
            className={`px-3.5 py-2.5 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge text-left flex items-center justify-between gap-2 ${
              subTab === 'twopc'
                ? 'bg-[#E5B82E] text-[#1C1B18]'
                : 'bg-[#F4EFE4] text-[#1C1B18] hover:bg-[#EAE4D7]'
            }`}
          >
            <span>2PC Crash-Recovery Stepper</span>
            <span className="font-mono text-[10px] opacity-80 shrink-0">BLOCKING</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: SEMIJOIN COST CALCULATOR (R ⋉ S)                              */}
      {/* ==================================================================== */}
      {subTab === 'semijoin' && (
        <div data-testid="semijoin-panel" className="space-y-4">
          {/* Exam Presets */}
          <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-[#1C1B18]">
                FAT Numerical Presets
              </h3>
              <button
                type="button"
                onClick={() => handleSelectSemijoinPreset(SEMIJOIN_PRESETS[0].id)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-[4px] border border-[#1C1B18] bg-[#F4EFE4] hover:bg-[#EAE4D7] text-[#1C1B18]"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Reset to A1 Q9
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {SEMIJOIN_PRESETS.map((preset) => {
                const active = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectSemijoinPreset(preset.id)}
                    className={`p-3 rounded-[4px] border border-[#1C1B18] text-left step-hinge ${
                      active
                        ? 'bg-[#22559C] text-[#FAF7F0]'
                        : 'bg-[#F4EFE4] text-[#1C1B18] hover:bg-[#EAE4D7]'
                    }`}
                  >
                    <div className="text-xs font-bold leading-snug">{preset.name}</div>
                    <div
                      className={`text-[11px] font-mono mt-1 ${
                        active ? 'text-[#FAF7F0]/80' : 'text-[#6E695D]'
                      }`}
                    >
                      {preset.examTag}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Interactive Parameters */}
            <div className="lg:col-span-5 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1C1B18]/20 pb-2">
                <h3 className="text-sm font-extrabold text-[#1C1B18]">
                  Site 1 &amp; Site 2 Parameters
                </h3>
                <span className="font-mono text-[11px] text-[#6E695D]">Bytes / Tuples</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="text-[11px] font-bold text-[#1C1B18] block">
                    |R| Tuples ({semijoinInput.relRName.split(' ')[0]})
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={500000}
                    value={semijoinInput.tuplesR}
                    onChange={(e) => updateSemijoinField('tuplesR', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-[#FFFFFF] border border-[#1C1B18] rounded-[4px] text-[#1C1B18]"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-[11px] font-bold text-[#1C1B18] block">
                    size(R) Tuple Bytes
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={4096}
                    value={semijoinInput.tupleBytesR}
                    onChange={(e) => updateSemijoinField('tupleBytesR', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-[#FFFFFF] border border-[#1C1B18] rounded-[4px] text-[#1C1B18]"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-[11px] font-bold text-[#1C1B18] block">
                    |S| Tuples ({semijoinInput.relSName.split(' ')[0]})
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={500000}
                    value={semijoinInput.tuplesS}
                    onChange={(e) => updateSemijoinField('tuplesS', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-[#FFFFFF] border border-[#1C1B18] rounded-[4px] text-[#1C1B18]"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-[11px] font-bold text-[#1C1B18] block">
                    size(S) Tuple Bytes
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={4096}
                    value={semijoinInput.tupleBytesS}
                    onChange={(e) => updateSemijoinField('tupleBytesS', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-[#FFFFFF] border border-[#1C1B18] rounded-[4px] text-[#1C1B18]"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-[11px] font-bold text-[#1C1B18] block">
                    size(K) Join Key (B)
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={256}
                    value={semijoinInput.joinKeyBytes}
                    onChange={(e) => updateSemijoinField('joinKeyBytes', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-[#FFFFFF] border border-[#1C1B18] rounded-[4px] text-[#1C1B18]"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-[11px] font-bold text-[#1C1B18] block">
                    |π_K(S)| Distinct Keys
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={semijoinInput.tuplesS}
                    value={semijoinInput.distinctJoinKeysS}
                    onChange={(e) =>
                      updateSemijoinField('distinctJoinKeysS', Number(e.target.value))
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-[#FFFFFF] border border-[#1C1B18] rounded-[4px] text-[#1C1B18]"
                  />
                </label>
              </div>

              {/* Interactive Selectivity Slider for |R ⋉ S| */}
              <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="matching-tuples-slider"
                    className="text-xs font-bold text-[#1C1B18]"
                  >
                    |R ⋉ S| Matching Tuples in R
                  </label>
                  <span className="font-mono text-xs font-bold tabular-nums text-[#22559C]">
                    {semijoinInput.matchingTuplesR.toLocaleString()} /{' '}
                    {semijoinInput.tuplesR.toLocaleString()} (
                    {((semijoinInput.matchingTuplesR / Math.max(1, semijoinInput.tuplesR)) * 100).toFixed(1)}
                    %)
                  </span>
                </div>
                <input
                  id="matching-tuples-slider"
                  type="range"
                  min={0}
                  max={semijoinInput.tuplesR}
                  step={Math.max(1, Math.floor(semijoinInput.tuplesR / 100))}
                  value={semijoinInput.matchingTuplesR}
                  onChange={(e) => updateSemijoinField('matchingTuplesR', Number(e.target.value))}
                  className="w-full accent-[#22559C]"
                />
                <p className="text-[11px] text-[#6E695D]">
                  Drag selectivity up to see the exact break-even point where Naive Ship beats Semijoin.
                </p>
              </div>
            </div>

            {/* Right: Verdict, Visual Transfer Bars & 5-Step FAT Trace */}
            <div className="lg:col-span-7 space-y-4">
              {/* Verdict Banner */}
              <div
                data-testid="semijoin-verdict"
                className={`border border-[#1C1B18] rounded-[4px] p-4 space-y-2 ${
                  semijoinResult.winner === 'SEMIJOIN'
                    ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                    : beatsShipR
                    ? 'bg-[#E5B82E] text-[#1C1B18]'
                    : 'bg-[#A62B2B] text-[#FAF7F0]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-extrabold text-sm sm:text-base">
                    {semijoinResult.winner === 'SEMIJOIN' ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
                    )}
                    <span>
                      {semijoinResult.winner === 'SEMIJOIN'
                        ? `SEMIJOIN WINS OVERALL — Saves ${semijoinResult.savingsPctVsBestNaive}% vs Best Naive`
                        : beatsShipR
                        ? `NAIVE (${semijoinResult.bestNaiveStrategy}) IS SMALLEST — Semijoin still saves ${semijoinResult.savingsPctVsShipR}% vs Ship R`
                        : `NAIVE SHIP WINS — Semijoin adds ${Math.abs(semijoinResult.savingsPctVsBestNaive)}% overhead`}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-[4px] border border-[#1C1B18] bg-[#FAF7F0] text-[#1C1B18] font-mono text-[11px] font-bold tabular-nums whitespace-nowrap">
                    {semijoinResult.winner === 'SEMIJOIN' ? 'WINNER: SEMIJOIN' : 'WINNER: NAIVE'}
                  </span>
                </div>
                <p className="text-xs font-mono opacity-95">
                  Semijoin Total: {semijoinResult.semijoinTotalBytes.toLocaleString()} B (
                  {formatBytes(semijoinResult.semijoinTotalBytes)}) · vs Ship R:{' '}
                  {semijoinResult.savingsPctVsShipR >= 0
                    ? `-${semijoinResult.savingsPctVsShipR}%`
                    : `+${Math.abs(semijoinResult.savingsPctVsShipR)}%`}{' '}
                  · Best Naive ({semijoinResult.bestNaiveStrategy}):{' '}
                  {semijoinResult.bestNaiveBytes.toLocaleString()} B
                </p>
              </div>

              {/* Visual Byte Transfer Comparison Bars */}
              <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 space-y-3.5">
                <h3 className="text-sm font-extrabold text-[#1C1B18]">
                  Network Transfer Comparison (Lower is Better)
                </h3>

                {/* Bar 1: Ship Full R */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="font-bold text-[#1C1B18]">
                      1. Naive: Ship Full {semijoinInput.relRName} → Site 2
                    </span>
                    <span className="font-mono font-bold tabular-nums text-[#1C1B18] whitespace-nowrap">
                      {semijoinResult.naiveShipRBytes.toLocaleString()} B (
                      {formatBytes(semijoinResult.naiveShipRBytes)})
                    </span>
                  </div>
                  <div className="h-5 bg-[#EAE4D7] border border-[#1C1B18] rounded-[3px] overflow-hidden">
                    <div
                      className="h-full bg-[#A62B2B] transition-all duration-200"
                      style={{
                        width: `${Math.max(
                          2,
                          Math.round((semijoinResult.naiveShipRBytes / maxTransferBytes) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Bar 2: Ship Full S */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="font-bold text-[#1C1B18]">
                      2. Naive: Ship Full {semijoinInput.relSName} → Site 1
                    </span>
                    <span className="font-mono font-bold tabular-nums text-[#1C1B18] whitespace-nowrap">
                      {semijoinResult.naiveShipSBytes.toLocaleString()} B (
                      {formatBytes(semijoinResult.naiveShipSBytes)})
                    </span>
                  </div>
                  <div className="h-5 bg-[#EAE4D7] border border-[#1C1B18] rounded-[3px] overflow-hidden">
                    <div
                      className="h-full bg-[#E06D2B] transition-all duration-200"
                      style={{
                        width: `${Math.max(
                          2,
                          Math.round((semijoinResult.naiveShipSBytes / maxTransferBytes) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Bar 3: Semijoin R ⋉ S */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="font-bold text-[#1C1B18]">
                      3. Semijoin: π_K(S) ({semijoinResult.semijoinStep1Bytes.toLocaleString()} B) + R ⋉ S ({semijoinResult.semijoinStep2Bytes.toLocaleString()} B)
                    </span>
                    <span className="font-mono font-bold tabular-nums text-[#22559C] whitespace-nowrap">
                      {semijoinResult.semijoinTotalBytes.toLocaleString()} B (
                      {formatBytes(semijoinResult.semijoinTotalBytes)})
                    </span>
                  </div>
                  <div className="h-5 bg-[#EAE4D7] border border-[#1C1B18] rounded-[3px] overflow-hidden flex">
                    <div
                      className="h-full bg-[#E5B82E] transition-all duration-200"
                      title={`Step 1: π_K(S) = ${semijoinResult.semijoinStep1Bytes} B`}
                      style={{
                        width: `${Math.max(
                          1,
                          Math.round((semijoinResult.semijoinStep1Bytes / maxTransferBytes) * 100)
                        )}%`,
                      }}
                    />
                    <div
                      className="h-full bg-[#4F8A3D] transition-all duration-200"
                      title={`Step 2: R ⋉ S = ${semijoinResult.semijoinStep2Bytes} B`}
                      style={{
                        width: `${Math.max(
                          1,
                          Math.round((semijoinResult.semijoinStep2Bytes / maxTransferBytes) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 5-Step FAT Solution Trace */}
              <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 space-y-2.5">
                <h3 className="text-sm font-extrabold text-[#1C1B18]">
                  Step-by-Step FAT Exam Derivation
                </h3>
                <ol className="space-y-1.5">
                  {semijoinResult.steps.map((step, idx) => (
                    <li
                      key={idx}
                      className="text-xs font-mono text-[#1C1B18] bg-[#F4EFE4] border border-[#1C1B18]/25 rounded-[4px] px-3 py-2 leading-relaxed"
                    >
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: HORIZONTAL & VERTICAL FRAGMENTATION VALIDATOR                 */}
      {/* ==================================================================== */}
      {subTab === 'fragmentation' && (
        <div data-testid="fragmentation-panel" className="space-y-4">
          {/* Mode Toggle + Overall Verdict */}
          <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFragMode('horizontal')}
                className={`px-3.5 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                  fragMode === 'horizontal'
                    ? 'bg-[#22559C] text-[#FAF7F0]'
                    : 'bg-[#F4EFE4] text-[#1C1B18] hover:bg-[#EAE4D7]'
                }`}
              >
                Horizontal Fragmentation (σ)
              </button>
              <button
                type="button"
                onClick={() => setFragMode('vertical')}
                className={`px-3.5 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] step-hinge ${
                  fragMode === 'vertical'
                    ? 'bg-[#22559C] text-[#FAF7F0]'
                    : 'bg-[#F4EFE4] text-[#1C1B18] hover:bg-[#EAE4D7]'
                }`}
              >
                Vertical Fragmentation (π)
              </button>
            </div>

            <div
              data-testid="frag-overall-verdict"
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] border border-[#1C1B18] font-mono text-xs font-bold self-start sm:self-auto whitespace-nowrap ${
                activeFragValid
                  ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                  : 'bg-[#A62B2B] text-[#FAF7F0]'
              }`}
            >
              {activeFragValid ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              ) : (
                <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              )}
              <span>{activeFragValid ? 'ALL 3 RULES PASS (VALID)' : 'FRAGMENTATION INVALID'}</span>
            </div>
          </div>

          {fragMode === 'horizontal' ? (
            <div className="space-y-4">
              {/* Horizontal Presets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {HORIZONTAL_PRESET_LIST.map((pid) => {
                  const p = HORIZONTAL_PRESETS[pid];
                  const active = horizPresetId === pid;
                  return (
                    <button
                      key={pid}
                      type="button"
                      onClick={() => setHorizPresetId(pid)}
                      className={`p-3 rounded-[4px] border border-[#1C1B18] text-left text-xs font-bold step-hinge ${
                        active
                          ? 'bg-[#E5B82E] text-[#1C1B18]'
                          : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#F4EFE4]'
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>

              {/* Sample Table + Resulting Fragments */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 space-y-2.5">
                  <h3 className="text-sm font-extrabold text-[#1C1B18]">
                    Base Relation: EMP(EID, Name, Dept, Salary)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-[#EAE4D7] border-b border-[#1C1B18] text-left">
                          <th className="py-1.5 px-2 font-bold">EID</th>
                          <th className="py-1.5 px-2 font-bold">Name</th>
                          <th className="py-1.5 px-2 font-bold">Dept</th>
                          <th className="py-1.5 px-2 font-bold text-right">Salary</th>
                        </tr>
                      </thead>
                      <tbody>
                        {FRAG_SAMPLE_EMPLOYEES.map((emp) => (
                          <tr
                            key={emp.eid}
                            className="border-b border-[#1C1B18]/15 last:border-b-0"
                          >
                            <td className="py-1.5 px-2 font-bold">{emp.eid}</td>
                            <td className="py-1.5 px-2">{emp.name}</td>
                            <td className="py-1.5 px-2">{emp.dept}</td>
                            <td className="py-1.5 px-2 text-right tabular-nums">{emp.salary}k</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 space-y-3">
                  <h3 className="text-sm font-extrabold text-[#1C1B18]">
                    Generated Horizontal Fragments (Selection σ)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {horizResult.fragments.map((frag) => (
                      <div
                        key={frag.name}
                        className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-3 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-extrabold text-[#22559C]">
                            {frag.name}
                          </span>
                          <span className="font-mono text-[11px] text-[#6E695D]">
                            {frag.predicateLabel}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {frag.tupleIds.map((eid) => (
                            <span
                              key={eid}
                              className="px-2 py-0.5 rounded-[3px] bg-[#FAF7F0] border border-[#1C1B18] font-mono text-[11px] font-bold"
                            >
                              {eid}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3 Correctness Rule Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { title: '1. Completeness', rule: horizResult.completeness },
                  { title: '2. Disjointness', rule: horizResult.disjointness },
                  { title: '3. Reconstruction (∪)', rule: horizResult.reconstruction },
                ].map(({ title, rule }) => (
                  <div
                    key={title}
                    className={`border border-[#1C1B18] rounded-[4px] p-4 space-y-1.5 ${
                      rule.passed ? 'bg-[#FAF7F0]' : 'bg-[#FFF3F3]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-[#1C1B18]">{title}</span>
                      <span
                        className={`px-2 py-0.5 rounded-[3px] border border-[#1C1B18] font-mono text-[10px] font-bold ${
                          rule.passed
                            ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                            : 'bg-[#A62B2B] text-[#FAF7F0]'
                        }`}
                      >
                        {rule.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    <p className="text-xs text-[#1C1B18]/85 leading-relaxed">{rule.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Vertical Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {VERTICAL_PRESET_LIST.map((pid) => {
                  const p = VERTICAL_PRESETS[pid];
                  const active = vertPresetId === pid;
                  return (
                    <button
                      key={pid}
                      type="button"
                      onClick={() => handleSelectVerticalPreset(pid)}
                      className={`p-3 rounded-[4px] border border-[#1C1B18] text-left text-xs font-bold step-hinge ${
                        active
                          ? 'bg-[#E5B82E] text-[#1C1B18]'
                          : 'bg-[#FAF7F0] text-[#1C1B18] hover:bg-[#F4EFE4]'
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>

              {/* Interactive Column Toggle Matrix */}
              <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-[#1C1B18]">
                    Interactive Vertical Projection Builder — EMP({VERTICAL_ALL_ATTRS.join(', ')})
                  </h3>
                  <span className="font-mono text-[11px] text-[#6E695D]">
                    Primary Key: {VERTICAL_PK} (must appear in every fragment for lossless ⋈)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customVertFragments.map((frag, fragIdx) => (
                    <div
                      key={frag.name}
                      className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-3.5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-extrabold text-[#22559C]">
                          {frag.name}
                        </span>
                        <span className="font-mono text-[11px] text-[#6E695D]">
                          π({frag.attrs.join(', ') || '∅'})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {VERTICAL_ALL_ATTRS.map((attr) => {
                          const checked = frag.attrs.includes(attr);
                          const isPk = attr === VERTICAL_PK;
                          return (
                            <button
                              key={`${frag.name}-${attr}`}
                              type="button"
                              aria-pressed={checked}
                              aria-label={`Toggle ${attr} in ${frag.name}`}
                              onClick={() => handleToggleVerticalAttr(fragIdx, attr)}
                              className={`px-2.5 py-1.5 rounded-[4px] border border-[#1C1B18] font-mono text-xs font-bold step-hinge ${
                                checked
                                  ? isPk
                                    ? 'bg-[#22559C] text-[#FAF7F0]'
                                    : 'bg-[#4F8A3D] text-[#FAF7F0]'
                                  : 'bg-[#FAF7F0] text-[#6E695D] hover:bg-[#EAE4D7]'
                              }`}
                            >
                              {checked ? '✓ ' : '+ '}
                              {attr}
                              {isPk ? ' (PK)' : ''}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 Correctness Rule Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { title: '1. Completeness', rule: vertResult.completeness },
                  { title: '2. Reconstruction (Natural ⋈)', rule: vertResult.reconstruction },
                  { title: '3. Non-Key Disjointness', rule: vertResult.disjointness },
                ].map(({ title, rule }) => (
                  <div
                    key={title}
                    className={`border border-[#1C1B18] rounded-[4px] p-4 space-y-1.5 ${
                      rule.passed ? 'bg-[#FAF7F0]' : 'bg-[#FFF3F3]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-[#1C1B18]">{title}</span>
                      <span
                        className={`px-2 py-0.5 rounded-[3px] border border-[#1C1B18] font-mono text-[10px] font-bold ${
                          rule.passed
                            ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                            : 'bg-[#A62B2B] text-[#FAF7F0]'
                        }`}
                      >
                        {rule.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    <p className="text-xs text-[#1C1B18]/85 leading-relaxed">{rule.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: TWO-PHASE COMMIT (2PC) CRASH-RECOVERY STEPPER                 */}
      {/* ==================================================================== */}
      {subTab === 'twopc' && (
        <div data-testid="twopc-panel" className="space-y-4">
          {/* Scenario Selector */}
          <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 space-y-3">
            <h3 className="text-sm font-extrabold text-[#1C1B18]">
              Select 2PC Execution / Crash Scenario
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {TWO_PC_SCENARIO_LIST.map((sid) => {
                const sc = TWO_PC_SCENARIOS[sid];
                const active = twoPcScenarioId === sid;
                return (
                  <button
                    key={sid}
                    type="button"
                    onClick={() => handleSelectTwoPcScenario(sid)}
                    className={`p-3 rounded-[4px] border border-[#1C1B18] text-left step-hinge ${
                      active
                        ? 'bg-[#22559C] text-[#FAF7F0]'
                        : 'bg-[#F4EFE4] text-[#1C1B18] hover:bg-[#EAE4D7]'
                    }`}
                  >
                    <div className="text-xs font-bold leading-snug">{sc.name}</div>
                    <div
                      className={`text-[11px] font-mono mt-1 ${
                        active ? 'text-[#FAF7F0]/80' : 'text-[#6E695D]'
                      }`}
                    >
                      {sc.examTag}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step Replay Controls + Outcome Badge */}
          <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-label="First 2PC step"
                disabled={clampedStepIdx === 0}
                onClick={() => setTwoPcStepIdx(0)}
                className="p-2 rounded-[4px] border border-[#1C1B18] bg-[#F4EFE4] hover:bg-[#EAE4D7] disabled:opacity-40"
              >
                <SkipBack className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Previous 2PC step"
                disabled={clampedStepIdx === 0}
                onClick={() => setTwoPcStepIdx((i) => Math.max(0, i - 1))}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] bg-[#F4EFE4] hover:bg-[#EAE4D7] disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                Prev
              </button>
              <span className="px-3 py-2 rounded-[4px] border border-[#1C1B18] bg-[#EAE4D7] font-mono text-xs font-bold tabular-nums whitespace-nowrap shrink-0">
                Stage {clampedStepIdx + 1} / {activeTwoPcScenario.steps.length}
              </span>
              <button
                type="button"
                aria-label="Next 2PC step"
                disabled={clampedStepIdx >= activeTwoPcScenario.steps.length - 1}
                onClick={() =>
                  setTwoPcStepIdx((i) => Math.min(activeTwoPcScenario.steps.length - 1, i + 1))
                }
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] bg-[#E5B82E] hover:bg-[#d6a920] text-[#1C1B18] disabled:opacity-40"
              >
                Next
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Final 2PC step"
                disabled={clampedStepIdx >= activeTwoPcScenario.steps.length - 1}
                onClick={() => setTwoPcStepIdx(activeTwoPcScenario.steps.length - 1)}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-[4px] border border-[#1C1B18] bg-[#F4EFE4] hover:bg-[#EAE4D7] disabled:opacity-40"
              >
                Final
                <SkipForward className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div
              data-testid="twopc-outcome"
              className={`px-3 py-1.5 rounded-[4px] border border-[#1C1B18] font-mono text-xs font-extrabold whitespace-nowrap shrink-0 ${
                activeTwoPcScenario.finalOutcome === 'COMMITTED'
                  ? 'bg-[#4F8A3D] text-[#FAF7F0]'
                  : activeTwoPcScenario.finalOutcome === 'ABORTED'
                  ? 'bg-[#E06D2B] text-[#1C1B18]'
                  : 'bg-[#A62B2B] text-[#FAF7F0]'
              }`}
            >
              OUTCOME: {activeTwoPcScenario.finalOutcome}
            </div>
          </div>

          {/* Visual 4-Node Coordinator / Participant SVG + Active Step Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* SVG Topology Diagram */}
            <div className="lg:col-span-6 bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-extrabold text-[#1C1B18]">
                  Coordinator &amp; Participant States
                </h3>
                <span className="px-2 py-0.5 rounded-[3px] border border-[#1C1B18] bg-[#F4EFE4] font-mono text-[11px] font-bold">
                  {activeTwoPcStep.phase}
                </span>
              </div>

              <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-2">
                <svg
                  viewBox="0 0 540 270"
                  className="w-full h-auto block"
                  role="img"
                  aria-label={`2PC topology showing Coordinator in ${activeTwoPcStep.coordState}, P1 in ${activeTwoPcStep.p1State}, P2 in ${activeTwoPcStep.p2State}, and P3 in ${activeTwoPcStep.p3State}`}
                >
                  {/* Connection lines C -> P1, P2, P3 */}
                  {[
                    { x: 95, state: activeTwoPcStep.p1State },
                    { x: 270, state: activeTwoPcStep.p2State },
                    { x: 445, state: activeTwoPcStep.p3State },
                  ].map((target, idx) => {
                    const broken =
                      activeTwoPcStep.coordState === 'CRASHED' || target.state === 'CRASHED';
                    return (
                      <line
                        key={idx}
                        x1={270}
                        y1={90}
                        x2={target.x}
                        y2={174}
                        stroke={broken ? '#A62B2B' : '#1C1B18'}
                        strokeWidth={broken ? 2 : 2.2}
                        strokeDasharray={broken ? '6 5' : undefined}
                      />
                    );
                  })}

                  {/* Coordinator Node */}
                  {(() => {
                    const cColors = getTwoPCNodeColors(activeTwoPcStep.coordState);
                    return (
                      <g>
                        <rect
                          x={165}
                          y={18}
                          width={210}
                          height={72}
                          rx={5}
                          fill={cColors.fill}
                          stroke={cColors.stroke}
                          strokeWidth={2}
                        />
                        <text
                          x={270}
                          y={44}
                          textAnchor="middle"
                          fill={cColors.text}
                          fontSize="13"
                          fontWeight="800"
                          fontFamily="monospace"
                        >
                          COORDINATOR (C)
                        </text>
                        <text
                          x={270}
                          y={68}
                          textAnchor="middle"
                          fill={cColors.text}
                          fontSize="12"
                          fontWeight="700"
                          fontFamily="monospace"
                        >
                          [{activeTwoPcStep.coordState}]
                        </text>
                      </g>
                    );
                  })()}

                  {/* Participant Nodes P1, P2, P3 */}
                  {(
                    [
                      { label: 'PARTICIPANT P1', x: 18, state: activeTwoPcStep.p1State },
                      { label: 'PARTICIPANT P2', x: 193, state: activeTwoPcStep.p2State },
                      { label: 'PARTICIPANT P3', x: 368, state: activeTwoPcStep.p3State },
                    ] as const
                  ).map((node) => {
                    const pColors = getTwoPCNodeColors(node.state);
                    return (
                      <g key={node.label}>
                        <rect
                          x={node.x}
                          y={174}
                          width={154}
                          height={74}
                          rx={5}
                          fill={pColors.fill}
                          stroke={pColors.stroke}
                          strokeWidth={2}
                        />
                        <text
                          x={node.x + 77}
                          y={202}
                          textAnchor="middle"
                          fill={pColors.text}
                          fontSize="11.5"
                          fontWeight="800"
                          fontFamily="monospace"
                        >
                          {node.label}
                        </text>
                        <text
                          x={node.x + 77}
                          y={228}
                          textAnchor="middle"
                          fill={pColors.text}
                          fontSize="11"
                          fontWeight="700"
                          fontFamily="monospace"
                        >
                          {node.state}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Message Flow Banner */}
              <div className="bg-[#EAE4D7] border border-[#1C1B18] rounded-[4px] px-3 py-2 font-mono text-xs font-bold text-[#1C1B18]">
                MSG: {activeTwoPcStep.messageFlow}
              </div>
            </div>

            {/* Right: WAL Log Entries, Step Explanation & Scenario Summary */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-[#FAF7F0] border border-[#1C1B18] rounded-[4px] p-4 space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-[#1C1B18]/20 pb-2">
                  <h3 className="text-sm font-extrabold text-[#1C1B18]">
                    Step {activeTwoPcStep.stepNo}: {activeTwoPcStep.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-[#1C1B18] leading-relaxed">
                  {activeTwoPcStep.explanation}
                </p>

                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-mono font-bold uppercase text-[#6E695D]">
                    Write-Ahead Log (Stable Storage)
                  </div>
                  {activeTwoPcStep.walEntries.map((entry, idx) => (
                    <div
                      key={idx}
                      className="font-mono text-xs bg-[#1C1B18] text-[#FAF7F0] rounded-[4px] px-3 py-2"
                    >
                      {entry}
                    </div>
                  ))}
                </div>
              </div>

              {/* Exam Takeaway Box */}
              <div className="bg-[#F4EFE4] border border-[#1C1B18] rounded-[4px] p-4 space-y-1.5">
                <div className="text-xs font-extrabold text-[#1C1B18]">
                  FAT Exam Takeaway · {activeTwoPcScenario.examTag}
                </div>
                <p className="text-xs text-[#1C1B18]/85 leading-relaxed">
                  {activeTwoPcScenario.summary}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
