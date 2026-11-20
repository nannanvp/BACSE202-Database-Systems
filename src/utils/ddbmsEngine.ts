// ============================================================================
// Module 5: DDBMS Semijoin Cost Calculator, Fragmentation Correctness Validator
// & Two-Phase Commit (2PC) Crash-Recovery Stepper
// Pure, deterministic logic decoupled from UI for unit testing & FAT drills
// ============================================================================

// ----------------------------------------------------------------------------
// 1. Semijoin (R ⋉ S) vs. Naive Join Network Transfer Cost Calculator
// ----------------------------------------------------------------------------

export interface SemijoinInput {
  relRName: string;
  relSName: string;
  tuplesR: number;
  tupleBytesR: number;
  tuplesS: number;
  tupleBytesS: number;
  joinKeyBytes: number;
  distinctJoinKeysS: number;
  matchingTuplesR: number; // |R ⋉ S|
}

export interface SemijoinPreset {
  id: string;
  name: string;
  examTag: string;
  input: SemijoinInput;
}

export const SEMIJOIN_PRESETS: SemijoinPreset[] = [
  {
    id: 'a1_q9_emp_dept',
    name: 'A1 Q9: EMPLOYEE ⋈ DEPARTMENT',
    examTag: 'A1+TA1 Q9 / Elmasri Classic',
    input: {
      relRName: 'EMPLOYEE (Site 1)',
      relSName: 'DEPARTMENT (Site 2)',
      tuplesR: 10000,
      tupleBytesR: 100,
      tuplesS: 100,
      tupleBytesS: 40,
      joinKeyBytes: 4,
      distinctJoinKeysS: 10, // filtered departments
      matchingTuplesR: 500, // employees in those filtered depts
    },
  },
  {
    id: 'model_q10_orders',
    name: 'Model Q10: ORDERS ⋈ CUSTOMERS',
    examTag: 'High-Selectivity Semijoin Win',
    input: {
      relRName: 'ORDERS (Site 1)',
      relSName: 'VIP_CUSTOMERS (Site 2)',
      tuplesR: 50000,
      tupleBytesR: 120,
      tuplesS: 2000,
      tupleBytesS: 80,
      joinKeyBytes: 8,
      distinctJoinKeysS: 200,
      matchingTuplesR: 600,
    },
  },
  {
    id: 'low_selectivity_trap',
    name: 'Low-Selectivity Trap (Naive Wins)',
    examTag: 'FAT Trade-off Case',
    input: {
      relRName: 'ENROLLMENT (Site 1)',
      relSName: 'COURSE (Site 2)',
      tuplesR: 1000,
      tupleBytesR: 40,
      tuplesS: 500,
      tupleBytesS: 40,
      joinKeyBytes: 12,
      distinctJoinKeysS: 500,
      matchingTuplesR: 920,
    },
  },
];

export interface SemijoinCostResult {
  naiveShipRBytes: number;
  naiveShipSBytes: number;
  bestNaiveBytes: number;
  bestNaiveStrategy: string;
  semijoinStep1Bytes: number; // |π_K(S)| * size(K)
  semijoinStep2Bytes: number; // |R ⋉ S| * size(R)
  semijoinTotalBytes: number;
  winner: 'SEMIJOIN' | 'NAIVE';
  savingsBytes: number;
  savingsPctVsBestNaive: number;
  savingsPctVsShipR: number;
  steps: string[];
}

export function calculateSemijoinCost(input: SemijoinInput): SemijoinCostResult {
  const tuplesR = Math.max(1, Math.round(input.tuplesR));
  const tupleBytesR = Math.max(1, Math.round(input.tupleBytesR));
  const tuplesS = Math.max(1, Math.round(input.tuplesS));
  const tupleBytesS = Math.max(1, Math.round(input.tupleBytesS));
  const joinKeyBytes = Math.max(1, Math.round(input.joinKeyBytes));
  const distinctJoinKeysS = Math.max(1, Math.min(tuplesS, Math.round(input.distinctJoinKeysS)));
  const matchingTuplesR = Math.max(0, Math.min(tuplesR, Math.round(input.matchingTuplesR)));

  const naiveShipRBytes = tuplesR * tupleBytesR;
  const naiveShipSBytes = tuplesS * tupleBytesS;
  const bestNaiveBytes = Math.min(naiveShipRBytes, naiveShipSBytes);
  const bestNaiveStrategy =
    naiveShipSBytes <= naiveShipRBytes
      ? `Ship ${input.relSName} → Site 1`
      : `Ship ${input.relRName} → Site 2`;

  const semijoinStep1Bytes = distinctJoinKeysS * joinKeyBytes;
  const semijoinStep2Bytes = matchingTuplesR * tupleBytesR;
  const semijoinTotalBytes = semijoinStep1Bytes + semijoinStep2Bytes;

  // Compare Semijoin (producing result at Site 2) vs shipping R directly to Site 2 AND vs best naive
  const winner: 'SEMIJOIN' | 'NAIVE' =
    semijoinTotalBytes < naiveShipRBytes && semijoinTotalBytes <= bestNaiveBytes
      ? 'SEMIJOIN'
      : semijoinTotalBytes < naiveShipRBytes && bestNaiveBytes < semijoinTotalBytes
      ? 'NAIVE'
      : 'NAIVE';

  const savingsBytes = bestNaiveBytes - semijoinTotalBytes;
  const savingsPctVsBestNaive = Number(
    ((savingsBytes / Math.max(1, bestNaiveBytes)) * 100).toFixed(2)
  );
  const savingsPctVsShipR = Number(
    (((naiveShipRBytes - semijoinTotalBytes) / Math.max(1, naiveShipRBytes)) * 100).toFixed(2)
  );

  const steps = [
    `1. Naive Ship R → Site 2: ${tuplesR.toLocaleString()} × ${tupleBytesR} B = ${naiveShipRBytes.toLocaleString()} B (${(naiveShipRBytes / 1024).toFixed(1)} KB).`,
    `2. Naive Ship S → Site 1: ${tuplesS.toLocaleString()} × ${tupleBytesS} B = ${naiveShipSBytes.toLocaleString()} B (${(naiveShipSBytes / 1024).toFixed(1)} KB).`,
    `3. Semijoin Step 1 — Ship π_K(S) (Site 2 → Site 1): ${distinctJoinKeysS.toLocaleString()} keys × ${joinKeyBytes} B = ${semijoinStep1Bytes.toLocaleString()} B.`,
    `4. Semijoin Step 2 — Ship R' = R ⋉ S (Site 1 → Site 2): ${matchingTuplesR.toLocaleString()} matched rows × ${tupleBytesR} B = ${semijoinStep2Bytes.toLocaleString()} B.`,
    `5. Semijoin Total = ${semijoinStep1Bytes.toLocaleString()} + ${semijoinStep2Bytes.toLocaleString()} = ${semijoinTotalBytes.toLocaleString()} B (${(semijoinTotalBytes / 1024).toFixed(1)} KB) -> ${
      semijoinTotalBytes < naiveShipRBytes
        ? `Saves ${savingsPctVsShipR}% vs shipping full R!`
        : `Higher than shipping R directly (${Math.abs(savingsPctVsShipR)}% overhead).`
    }`,
  ];

  return {
    naiveShipRBytes,
    naiveShipSBytes,
    bestNaiveBytes,
    bestNaiveStrategy,
    semijoinStep1Bytes,
    semijoinStep2Bytes,
    semijoinTotalBytes,
    winner,
    savingsBytes,
    savingsPctVsBestNaive,
    savingsPctVsShipR,
    steps,
  };
}

// ----------------------------------------------------------------------------
// 2. Horizontal & Vertical Fragmentation Correctness Validator
// ----------------------------------------------------------------------------

export interface EmpSampleTuple {
  eid: string;
  name: string;
  dept: 'CSE' | 'ECE' | 'AI';
  salary: number;
}

export const FRAG_SAMPLE_EMPLOYEES: EmpSampleTuple[] = [
  { eid: 'E1', name: 'Ananya', dept: 'CSE', salary: 90 },
  { eid: 'E2', name: 'Vikram', dept: 'CSE', salary: 65 },
  { eid: 'E3', name: 'Neha', dept: 'ECE', salary: 75 },
  { eid: 'E4', name: 'Arjun', dept: 'ECE', salary: 50 },
  { eid: 'E5', name: 'Priya', dept: 'AI', salary: 95 },
  { eid: 'E6', name: 'Kabir', dept: 'AI', salary: 70 },
];

export type HorizontalPresetId = 'valid_dept' | 'broken_completeness' | 'broken_disjointness';

export interface HorizontalFragmentDef {
  name: string;
  predicateLabel: string;
  matches: (t: EmpSampleTuple) => boolean;
}

export const HORIZONTAL_PRESETS: Record<
  HorizontalPresetId,
  { id: HorizontalPresetId; name: string; fragments: HorizontalFragmentDef[] }
> = {
  valid_dept: {
    id: 'valid_dept',
    name: 'Valid Partition (Dept = CSE / ECE / AI)',
    fragments: [
      { name: 'F1', predicateLabel: "σ_{Dept='CSE'}(EMP)", matches: (t) => t.dept === 'CSE' },
      { name: 'F2', predicateLabel: "σ_{Dept='ECE'}(EMP)", matches: (t) => t.dept === 'ECE' },
      { name: 'F3', predicateLabel: "σ_{Dept='AI'}(EMP)", matches: (t) => t.dept === 'AI' },
    ],
  },
  broken_completeness: {
    id: 'broken_completeness',
    name: 'Broken Completeness (Missing AI Dept)',
    fragments: [
      { name: 'F1', predicateLabel: "σ_{Dept='CSE'}(EMP)", matches: (t) => t.dept === 'CSE' },
      { name: 'F2', predicateLabel: "σ_{Dept='ECE'}(EMP)", matches: (t) => t.dept === 'ECE' },
    ],
  },
  broken_disjointness: {
    id: 'broken_disjointness',
    name: 'Broken Disjointness (Overlapping Salary)',
    fragments: [
      { name: 'F1', predicateLabel: 'σ_{Salary <= 75}(EMP)', matches: (t) => t.salary <= 75 },
      { name: 'F2', predicateLabel: 'σ_{Salary >= 65}(EMP)', matches: (t) => t.salary >= 65 },
    ],
  },
};

export interface FragmentRuleVerdict {
  passed: boolean;
  detail: string;
}

export interface HorizontalValidationResult {
  fragments: Array<{ name: string; predicateLabel: string; tupleIds: string[] }>;
  completeness: FragmentRuleVerdict;
  disjointness: FragmentRuleVerdict;
  reconstruction: FragmentRuleVerdict;
  allValid: boolean;
}

export function validateHorizontalFragmentation(
  presetId: HorizontalPresetId
): HorizontalValidationResult {
  const preset = HORIZONTAL_PRESETS[presetId];
  const fragments = preset.fragments.map((f) => ({
    name: f.name,
    predicateLabel: f.predicateLabel,
    tupleIds: FRAG_SAMPLE_EMPLOYEES.filter(f.matches).map((t) => t.eid),
  }));

  const counts = new Map<string, string[]>();
  for (const f of fragments) {
    for (const eid of f.tupleIds) {
      const list = counts.get(eid) ?? [];
      list.push(f.name);
      counts.set(eid, list);
    }
  }

  const missing = FRAG_SAMPLE_EMPLOYEES.map((e) => e.eid).filter((id) => !counts.has(id));
  const overlaps = Array.from(counts.entries())
    .filter(([, frags]) => frags.length > 1)
    .map(([eid, frags]) => `${eid} in {${frags.join(', ')}}`);

  const completeness: FragmentRuleVerdict =
    missing.length === 0
      ? { passed: true, detail: `All ${FRAG_SAMPLE_EMPLOYEES.length} tuples appear in at least one fragment.` }
      : { passed: false, detail: `Missing tuple(s): ${missing.join(', ')} — data lost in fragmentation!` };

  const disjointness: FragmentRuleVerdict =
    overlaps.length === 0
      ? { passed: true, detail: 'Zero tuple overlap across fragments (F_i ∩ F_j = ∅).' }
      : { passed: false, detail: `Duplicate tuple(s): ${overlaps.join('; ')} — update anomalies possible!` };

  const reconstruction: FragmentRuleVerdict =
    missing.length === 0
      ? { passed: true, detail: `Union (F1 ∪ ... ∪ F${fragments.length}) reproduces exact relation EMP.` }
      : { passed: false, detail: `Union cannot reconstruct missing tuple(s): ${missing.join(', ')}.` };

  return {
    fragments,
    completeness,
    disjointness,
    reconstruction,
    allValid: completeness.passed && disjointness.passed && reconstruction.passed,
  };
}

export const VERTICAL_ALL_ATTRS = ['EID', 'Name', 'Dept', 'Salary', 'Email'] as const;
export const VERTICAL_PK = 'EID';

export type VerticalPresetId = 'valid_pk_split' | 'missing_pk' | 'dropped_col' | 'duplicate_nonkey';

export const VERTICAL_PRESETS: Record<
  VerticalPresetId,
  { id: VerticalPresetId; name: string; fragments: Array<{ name: string; attrs: string[] }> }
> = {
  valid_pk_split: {
    id: 'valid_pk_split',
    name: 'Valid Vertical Split (PK EID in Both)',
    fragments: [
      { name: 'V1 (HR)', attrs: ['EID', 'Name', 'Email'] },
      { name: 'V2 (Payroll)', attrs: ['EID', 'Dept', 'Salary'] },
    ],
  },
  missing_pk: {
    id: 'missing_pk',
    name: 'Broken Reconstruction (No PK in V2)',
    fragments: [
      { name: 'V1 (HR)', attrs: ['EID', 'Name', 'Email'] },
      { name: 'V2 (Payroll)', attrs: ['Dept', 'Salary'] },
    ],
  },
  dropped_col: {
    id: 'dropped_col',
    name: 'Broken Completeness (Dropped Salary)',
    fragments: [
      { name: 'V1 (HR)', attrs: ['EID', 'Name', 'Email'] },
      { name: 'V2 (Dept)', attrs: ['EID', 'Dept'] },
    ],
  },
  duplicate_nonkey: {
    id: 'duplicate_nonkey',
    name: 'Broken Disjointness (Dept Duplicated)',
    fragments: [
      { name: 'V1 (HR)', attrs: ['EID', 'Name', 'Dept', 'Email'] },
      { name: 'V2 (Payroll)', attrs: ['EID', 'Dept', 'Salary'] },
    ],
  },
};

export interface VerticalValidationResult {
  fragments: Array<{ name: string; attrs: string[] }>;
  completeness: FragmentRuleVerdict;
  reconstruction: FragmentRuleVerdict;
  disjointness: FragmentRuleVerdict;
  allValid: boolean;
}

export function validateVerticalFragmentation(
  fragments: Array<{ name: string; attrs: string[] }>
): VerticalValidationResult {
  const allSeen = new Set(fragments.flatMap((f) => f.attrs));
  const missingCols = VERTICAL_ALL_ATTRS.filter((a) => !allSeen.has(a));

  const missingPkFrags = fragments
    .filter((f) => !f.attrs.includes(VERTICAL_PK))
    .map((f) => f.name);

  const nonKeyCounts = new Map<string, string[]>();
  for (const f of fragments) {
    for (const a of f.attrs) {
      if (a === VERTICAL_PK) continue;
      const list = nonKeyCounts.get(a) ?? [];
      list.push(f.name);
      nonKeyCounts.set(a, list);
    }
  }
  const dupNonKeys = Array.from(nonKeyCounts.entries())
    .filter(([, frags]) => frags.length > 1)
    .map(([col, frags]) => `${col} in {${frags.join(', ')}}`);

  const completeness: FragmentRuleVerdict =
    missingCols.length === 0
      ? { passed: true, detail: `All ${VERTICAL_ALL_ATTRS.length} attributes are covered.` }
      : { passed: false, detail: `Missing attribute(s): ${missingCols.join(', ')}.` };

  const reconstruction: FragmentRuleVerdict =
    missingPkFrags.length === 0 && missingCols.length === 0
      ? { passed: true, detail: `Primary key ${VERTICAL_PK} is replicated in every fragment -> Natural Join (V1 ⋈ V2) is lossless.` }
      : missingPkFrags.length > 0
      ? { passed: false, detail: `${missingPkFrags.join(', ')} omits PK ${VERTICAL_PK} -> Natural Join produces spurious tuples (lossy!).` }
      : { passed: false, detail: `Cannot reconstruct missing attribute(s): ${missingCols.join(', ')}.` };

  const disjointness: FragmentRuleVerdict =
    dupNonKeys.length === 0
      ? { passed: true, detail: 'All non-primary-key attributes are strictly disjoint across fragments.' }
      : { passed: false, detail: `Duplicated non-key attribute(s): ${dupNonKeys.join('; ')}.` };

  return {
    fragments,
    completeness,
    reconstruction,
    disjointness,
    allValid: completeness.passed && reconstruction.passed && disjointness.passed,
  };
}

// ----------------------------------------------------------------------------
// 3. Two-Phase Commit (2PC) Protocol & Crash-Recovery Stepper
// ----------------------------------------------------------------------------

export type TwoPCScenarioId =
  | 'normal_commit'
  | 'participant_abort'
  | 'participant_crash_before_vote'
  | 'participant_crash_after_ready'
  | 'coordinator_crash_blocking';

export type NodeTwoPCState =
  | 'INIT'
  | 'WAIT'
  | 'READY (IN-DOUBT)'
  | 'COMMITTED'
  | 'ABORTED'
  | 'CRASHED'
  | 'BLOCKED';

export interface TwoPCStep {
  stepNo: number;
  phase: 'Phase 1 (Voting)' | 'Phase 2 (Decision)' | 'Crash / Recovery';
  title: string;
  messageFlow: string;
  walEntries: string[];
  coordState: NodeTwoPCState;
  p1State: NodeTwoPCState;
  p2State: NodeTwoPCState;
  p3State: NodeTwoPCState;
  explanation: string;
}

export interface TwoPCScenario {
  id: TwoPCScenarioId;
  name: string;
  examTag: string;
  finalOutcome: 'COMMITTED' | 'ABORTED' | 'BLOCKED (UNCERTAIN)';
  summary: string;
  steps: TwoPCStep[];
}

export const TWO_PC_SCENARIOS: Record<TwoPCScenarioId, TwoPCScenario> = {
  normal_commit: {
    id: 'normal_commit',
    name: 'Normal Commit (All VOTE-COMMIT)',
    examTag: 'Standard 2PC Happy Path',
    finalOutcome: 'COMMITTED',
    summary: 'All 3 participants force-write <READY> and vote COMMIT; Coordinator force-writes <COMMIT> and broadcasts GLOBAL-COMMIT.',
    steps: [
      {
        stepNo: 1,
        phase: 'Phase 1 (Voting)',
        title: 'Coordinator Sends PREPARE',
        messageFlow: 'C → P1, P2, P3 : PREPARE(T)',
        walEntries: ['C WAL: <PREPARE, T> (force-written)'],
        coordState: 'WAIT',
        p1State: 'INIT',
        p2State: 'INIT',
        p3State: 'INIT',
        explanation: 'Coordinator logs <PREPARE, T> on stable storage and asks every participant if it can safely commit T.',
      },
      {
        stepNo: 2,
        phase: 'Phase 1 (Voting)',
        title: 'All Participants Vote COMMIT',
        messageFlow: 'P1, P2, P3 → C : VOTE-COMMIT(T)',
        walEntries: ['P1, P2, P3 WAL: <READY, T> (force-written with REDO/UNDO records)'],
        coordState: 'WAIT',
        p1State: 'READY (IN-DOUBT)',
        p2State: 'READY (IN-DOUBT)',
        p3State: 'READY (IN-DOUBT)',
        explanation: 'Each participant flushes undo/redo records + <READY, T> to disk before replying VOTE-COMMIT. They surrender unilateral abort rights.',
      },
      {
        stepNo: 3,
        phase: 'Phase 2 (Decision)',
        title: 'Coordinator Logs & Broadcasts GLOBAL-COMMIT',
        messageFlow: 'C → P1, P2, P3 : GLOBAL-COMMIT(T)',
        walEntries: ['C WAL: <COMMIT, T> (DECISION POINT — force-written)'],
        coordState: 'COMMITTED',
        p1State: 'READY (IN-DOUBT)',
        p2State: 'READY (IN-DOUBT)',
        p3State: 'READY (IN-DOUBT)',
        explanation: 'All votes are COMMIT -> Coordinator force-writes <COMMIT, T> (the irreversible commit point) and sends GLOBAL-COMMIT.',
      },
      {
        stepNo: 4,
        phase: 'Phase 2 (Decision)',
        title: 'Participants Commit, Release Locks & ACK',
        messageFlow: 'P1, P2, P3 → C : ACK(T)',
        walEntries: ['P1, P2, P3 WAL: <COMMIT, T>', 'C WAL: <END, T>'],
        coordState: 'COMMITTED',
        p1State: 'COMMITTED',
        p2State: 'COMMITTED',
        p3State: 'COMMITTED',
        explanation: 'Every participant commits locally, releases Strict 2PL locks, logs <COMMIT, T>, and sends ACK so Coordinator logs <END, T>.',
      },
    ],
  },
  participant_abort: {
    id: 'participant_abort',
    name: 'Participant P2 Sends VOTE-ABORT',
    examTag: 'Unanimous Rule (1 Veto = Abort)',
    finalOutcome: 'ABORTED',
    summary: 'P2 hits a constraint/lock failure and votes ABORT -> Coordinator must broadcast GLOBAL-ABORT to preserve atomicity.',
    steps: [
      {
        stepNo: 1,
        phase: 'Phase 1 (Voting)',
        title: 'Coordinator Sends PREPARE',
        messageFlow: 'C → P1, P2, P3 : PREPARE(T)',
        walEntries: ['C WAL: <PREPARE, T>'],
        coordState: 'WAIT',
        p1State: 'INIT',
        p2State: 'INIT',
        p3State: 'INIT',
        explanation: 'Coordinator initiates Phase 1 voting across P1, P2, and P3.',
      },
      {
        stepNo: 2,
        phase: 'Phase 1 (Voting)',
        title: 'P1 & P3 Vote COMMIT, P2 Votes ABORT',
        messageFlow: 'P1,P3 → C : VOTE-COMMIT · P2 → C : VOTE-ABORT',
        walEntries: ['P1, P3 WAL: <READY, T>', 'P2 WAL: <ABORT, T> (rolls back immediately)'],
        coordState: 'WAIT',
        p1State: 'READY (IN-DOUBT)',
        p2State: 'ABORTED',
        p3State: 'READY (IN-DOUBT)',
        explanation: 'P2 cannot commit (e.g., integrity violation or local abort), so it logs <ABORT, T> and replies VOTE-ABORT.',
      },
      {
        stepNo: 3,
        phase: 'Phase 2 (Decision)',
        title: 'Coordinator Broadcasts GLOBAL-ABORT',
        messageFlow: 'C → P1, P3 : GLOBAL-ABORT(T)',
        walEntries: ['C WAL: <ABORT, T>'],
        coordState: 'ABORTED',
        p1State: 'READY (IN-DOUBT)',
        p2State: 'ABORTED',
        p3State: 'READY (IN-DOUBT)',
        explanation: 'Even a single VOTE-ABORT forces global rollback. Coordinator logs <ABORT, T> and notifies ready participants.',
      },
      {
        stepNo: 4,
        phase: 'Phase 2 (Decision)',
        title: 'P1 & P3 Undo Changes & Release Locks',
        messageFlow: 'P1, P3 → C : ACK(T)',
        walEntries: ['P1, P3 WAL: <ABORT, T> (UNDO applied)', 'C WAL: <END, T>'],
        coordState: 'ABORTED',
        p1State: 'ABORTED',
        p2State: 'ABORTED',
        p3State: 'ABORTED',
        explanation: 'P1 and P3 use their UNDO logs to roll back, ensuring all-or-nothing distributed atomicity.',
      },
    ],
  },
  participant_crash_before_vote: {
    id: 'participant_crash_before_vote',
    name: 'Participant P2 Crashes BEFORE Voting',
    examTag: 'Timeout → Presumed Abort',
    finalOutcome: 'ABORTED',
    summary: 'P2 crashes before writing <READY>. Coordinator times out and aborts globally; P2 recovers cleanly by aborting.',
    steps: [
      {
        stepNo: 1,
        phase: 'Phase 1 (Voting)',
        title: 'Coordinator Sends PREPARE; P2 Crashes',
        messageFlow: 'C → P1, P2(✕), P3 : PREPARE(T)',
        walEntries: ['C WAL: <PREPARE, T>', 'P1, P3 WAL: <READY, T>', 'P2 WAL: (no <READY> written)'],
        coordState: 'WAIT',
        p1State: 'READY (IN-DOUBT)',
        p2State: 'CRASHED',
        p3State: 'READY (IN-DOUBT)',
        explanation: 'P1 and P3 respond VOTE-COMMIT, but P2 crashes before flushing <READY, T> to disk.',
      },
      {
        stepNo: 2,
        phase: 'Crash / Recovery',
        title: 'Coordinator Timeout → GLOBAL-ABORT',
        messageFlow: 'C → P1, P3 : GLOBAL-ABORT(T)',
        walEntries: ['C WAL: <ABORT, T> (timeout waiting for P2)'],
        coordState: 'ABORTED',
        p1State: 'ABORTED',
        p2State: 'CRASHED',
        p3State: 'ABORTED',
        explanation: 'Because C never received P2’s vote, C safely decides GLOBAL-ABORT and notifies P1 and P3.',
      },
      {
        stepNo: 3,
        phase: 'Crash / Recovery',
        title: 'P2 Restarts & Reads Local WAL',
        messageFlow: 'P2 local recovery (no network needed)',
        walEntries: ['P2 finds <START, T> without <READY, T> -> UNDO & log <ABORT, T>'],
        coordState: 'ABORTED',
        p1State: 'ABORTED',
        p2State: 'ABORTED',
        p3State: 'ABORTED',
        explanation: 'On reboot, P2 sees no <READY, T> record -> unilaterally aborts T (consistent with Coordinator!).',
      },
    ],
  },
  participant_crash_after_ready: {
    id: 'participant_crash_after_ready',
    name: 'Participant P2 Crashes AFTER <READY>',
    examTag: 'In-Doubt Participant Recovery',
    finalOutcome: 'COMMITTED',
    summary: 'P2 already voted COMMIT (<READY> on disk) before crashing. Coordinator commits globally; P2 queries C on reboot and REDOs.',
    steps: [
      {
        stepNo: 1,
        phase: 'Phase 1 (Voting)',
        title: 'All Vote COMMIT; P2 Crashes Immediately After',
        messageFlow: 'P1, P2, P3 → C : VOTE-COMMIT · P2 crashes (✕)',
        walEntries: ['P1, P2, P3 WAL: <READY, T> on disk'],
        coordState: 'WAIT',
        p1State: 'READY (IN-DOUBT)',
        p2State: 'CRASHED',
        p3State: 'READY (IN-DOUBT)',
        explanation: 'P2 safely flushed <READY, T> and sent VOTE-COMMIT, then lost power before Phase 2 arrived.',
      },
      {
        stepNo: 2,
        phase: 'Phase 2 (Decision)',
        title: 'Coordinator Decides GLOBAL-COMMIT',
        messageFlow: 'C → P1, P3 : GLOBAL-COMMIT(T) (P2 unreachable)',
        walEntries: ['C WAL: <COMMIT, T>', 'P1, P3 WAL: <COMMIT, T>'],
        coordState: 'COMMITTED',
        p1State: 'COMMITTED',
        p2State: 'CRASHED',
        p3State: 'COMMITTED',
        explanation: 'Coordinator received all 3 COMMIT votes, so it logs <COMMIT, T> and commits P1 and P3.',
      },
      {
        stepNo: 3,
        phase: 'Crash / Recovery',
        title: 'P2 Recovers, Sees <READY> & Queries Coordinator',
        messageFlow: 'P2 → C : DECISION-REQUEST(T) · C → P2 : GLOBAL-COMMIT(T)',
        walEntries: ['P2 WAL: finds <READY, T> (in-doubt) -> applies REDO & logs <COMMIT, T>'],
        coordState: 'COMMITTED',
        p1State: 'COMMITTED',
        p2State: 'COMMITTED',
        p3State: 'COMMITTED',
        explanation: 'P2 cannot abort unilaterally after <READY>. It asks Coordinator (or peer P1), receives GLOBAL-COMMIT, and REDOs T!',
      },
    ],
  },
  coordinator_crash_blocking: {
    id: 'coordinator_crash_blocking',
    name: 'Coordinator Crash After PREPARE (2PC Blocking!)',
    examTag: 'A2 Q8 / Model Q10 — Blocking Proof',
    finalOutcome: 'BLOCKED (UNCERTAIN)',
    summary: 'Classic weakness of 2PC: participants in <READY> cannot safely commit OR abort while Coordinator is down -> locks held indefinitely!',
    steps: [
      {
        stepNo: 1,
        phase: 'Phase 1 (Voting)',
        title: 'Coordinator Sends PREPARE',
        messageFlow: 'C → P1, P2, P3 : PREPARE(T)',
        walEntries: ['C WAL: <PREPARE, T>'],
        coordState: 'WAIT',
        p1State: 'INIT',
        p2State: 'INIT',
        p3State: 'INIT',
        explanation: 'Phase 1 starts normally; all participants receive PREPARE(T).',
      },
      {
        stepNo: 2,
        phase: 'Phase 1 (Voting)',
        title: 'Participants Enter <READY> Window',
        messageFlow: 'P1, P2, P3 → C : VOTE-COMMIT(T)',
        walEntries: ['P1, P2, P3 WAL: <READY, T> (locks HELD)'],
        coordState: 'WAIT',
        p1State: 'READY (IN-DOUBT)',
        p2State: 'READY (IN-DOUBT)',
        p3State: 'READY (IN-DOUBT)',
        explanation: 'All participants enter the uncertainty window: they promised to obey C and still hold Strict 2PL locks.',
      },
      {
        stepNo: 3,
        phase: 'Crash / Recovery',
        title: 'Coordinator Crashes Before Broadcasting Decision!',
        messageFlow: 'C CRASHES (✕) · No GLOBAL-COMMIT or GLOBAL-ABORT received',
        walEntries: ['P1, P2, P3: ONLY <READY, T> in WAL — decision unknown!'],
        coordState: 'CRASHED',
        p1State: 'BLOCKED',
        p2State: 'BLOCKED',
        p3State: 'BLOCKED',
        explanation: '2PC BLOCKING PROBLEM: Even if P1, P2, P3 talk to each other, C may have already logged <COMMIT> or <ABORT> right before crashing. Participants MUST block holding locks until C recovers! (3PC adds PRE-COMMIT to reduce blocking.)',
      },
    ],
  },
};
