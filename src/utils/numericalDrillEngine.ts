// ============================================================================
// BACSE202 95+ Procedural Numerical Drill Engine, Examiner Blueprints & Trap Busters
// Pure, deterministic logic decoupled from React for fast unit-test verification.
// Every numerical problem dynamically computes its ground-truth answer using the
// verified domain engines (dbEngine & ddbmsEngine) so answer keys cannot drift.
// ============================================================================

import {
  analyzeNormalForms,
  analyzeSchedule,
  calculateMultilevelIndexMetrics,
  parseAttributes,
  parseFDs,
  parseWalLog,
  parseSchedule,
  simulateLogRecovery,
} from './dbEngine';
import { calculateSemijoinCost } from './ddbmsEngine';

export type DrillCategory =
  | 'index_io'
  | 'bplus_bounds'
  | 'norm_nf'
  | 'serializability'
  | 'wal_recovery'
  | 'semijoin_cost';

export interface NumericalDrillProblem {
  id: string;
  seed: number;
  category: DrillCategory;
  categoryLabel: string;
  moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
  moduleLabel: string;
  fatTag: string;
  targetSeconds: number;
  title: string;
  prompt: string;
  givenBlock: string;
  questionLine: string;
  inputKind: 'number' | 'choice' | 'text';
  choices?: string[];
  unitHint?: string;
  expectedAnswer: string;
  acceptedAliases?: string[];
  rubricSteps: string[];
  matchingLab:
    | 'normalization'
    | 'bplus'
    | 'hashing_index'
    | 'serializability'
    | 'timestamp_recovery'
    | 'ddbms_2pc';
}

export interface DrillGradeResult {
  correct: boolean;
  normalizedInput: string;
  expectedDisplay: string;
  feedback: string;
}

export const DRILL_CATEGORIES: Array<{
  id: DrillCategory;
  label: string;
  moduleLabel: string;
  moduleId: 'm2' | 'm3' | 'm4' | 'm5';
}> = [
  { id: 'norm_nf', label: 'Normal Form & Keys', moduleLabel: 'M2', moduleId: 'm2' },
  { id: 'index_io', label: 'Multilevel Index I/O', moduleLabel: 'M3', moduleId: 'm3' },
  { id: 'bplus_bounds', label: 'B+ Tree Order & Bounds', moduleLabel: 'M3', moduleId: 'm3' },
  { id: 'serializability', label: 'Serializability & Strictness', moduleLabel: 'M4', moduleId: 'm4' },
  { id: 'wal_recovery', label: 'WAL Crash UNDO / REDO', moduleLabel: 'M4', moduleId: 'm4' },
  { id: 'semijoin_cost', label: 'DDBMS Semijoin Transfer', moduleLabel: 'M5', moduleId: 'm5' },
];

// Deterministic PRNG (Mulberry32) so any seed produces reproducible exam problems
function createRng(seed: number): () => number {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  const idx = Math.floor(rng() * items.length);
  return items[Math.min(idx, items.length - 1)];
}

// ----------------------------------------------------------------------------
// 1. Module 3 — Multilevel Index Disk I/O Numerical Generator
// ----------------------------------------------------------------------------
function generateIndexIoProblem(seed: number): NumericalDrillProblem {
  const rng = createRng(seed * 7919 + 11);
  const numRecords = pick(rng, [12000, 16000, 20000, 24000, 30000, 40000, 50000]);
  const blockSize = pick(rng, [1000, 1024, 2048, 4096]);
  const recordSize = pick(rng, [80, 100, 128, 160, 200]);
  const keySize = pick(rng, [4, 8, 9, 12]);
  const blockPointerSize = pick(rng, [4, 6, 8]);
  const indexType = pick(rng, ['primary', 'secondary_dense'] as const);
  const askKind = pick(rng, ['multilevel_io', 'level1_blocks', 'data_blocks'] as const);

  const metrics = calculateMultilevelIndexMetrics({
    numRecords,
    blockSize,
    recordSize,
    keySize,
    blockPointerSize,
    indexType,
  });

  const indexName =
    indexType === 'primary'
      ? 'Primary (Sparse — 1 entry per data block)'
      : 'Secondary (Dense — 1 entry per record)';

  let questionLine = '';
  let expected = 0;
  let unitHint = 'disk block accesses';

  if (askKind === 'multilevel_io') {
    questionLine =
      'Compute the total number of disk block accesses (I/Os) required to search for a record using the complete Multilevel Index (levels + 1 data block read).';
    expected = metrics.multilevelSearchIO;
    unitHint = 'block accesses (integer)';
  } else if (askKind === 'level1_blocks') {
    questionLine = 'Compute the number of index blocks required at Level 1 (b_i1) of the index.';
    expected = metrics.levels[0]?.blocks ?? 1;
    unitHint = 'index blocks (integer)';
  } else {
    questionLine =
      'Compute the total number of data file blocks (b) needed to store all records using unspanned organization.';
    expected = metrics.dataBlocks;
    unitHint = 'data blocks (integer)';
  }

  const levelSummary = metrics.levels
    .map((l) => `Level ${l.level}: ceil(${l.entries.toLocaleString()} / ${metrics.bfrIndex}) = ${l.blocks.toLocaleString()} block(s)`)
    .join(' → ');

  return {
    id: `index_io_${seed}`,
    seed,
    category: 'index_io',
    categoryLabel: 'Multilevel Index I/O',
    moduleId: 'm3',
    moduleLabel: 'Module 3',
    fatTag: 'A2+TA2 Q4 · 10M Guaranteed Formula',
    targetSeconds: 180,
    title: 'Multilevel Index Block & Disk I/O Calculation',
    prompt:
      'Solve step-by-step using unspanned blocking factor bfr = floor(B / R) and index fanout fo = floor(B / (V + P)).',
    givenBlock: [
      `Records (r)           = ${numRecords.toLocaleString()}`,
      `Block Size (B)        = ${blockSize} bytes (unspanned)`,
      `Record Size (R)       = ${recordSize} bytes`,
      `Search Key (V)        = ${keySize} bytes`,
      `Block Pointer (P)     = ${blockPointerSize} bytes`,
      `Index Organization    = ${indexName}`,
    ].join('\n'),
    questionLine,
    inputKind: 'number',
    unitHint,
    expectedAnswer: String(expected),
    rubricSteps: [
      `[2M] Data blocking factor: bfr = floor(${blockSize} / ${recordSize}) = ${metrics.bfr} records/block.`,
      `[2M] Data file blocks: b = ceil(${numRecords.toLocaleString()} / ${metrics.bfr}) = ${metrics.dataBlocks.toLocaleString()} blocks.`,
      `[2M] Index entry size Ri = V + P = ${keySize} + ${blockPointerSize} = ${metrics.indexEntrySize} B → Index fanout bfr_i = floor(${blockSize} / ${metrics.indexEntrySize}) = ${metrics.bfrIndex} entries/block.`,
      `[2M] Multilevel build: ${levelSummary} (Total index levels t = ${metrics.totalIndexLevels}).`,
      `[2M] Multilevel search cost = t + 1 = ${metrics.totalIndexLevels} + 1 = ${metrics.multilevelSearchIO} disk accesses (vs. ${metrics.singleLevelBinarySearchIO} for single-level binary search).`,
    ],
    matchingLab: 'hashing_index',
  };
}

// ----------------------------------------------------------------------------
// 2. Module 3 — B+ Tree Order, Fanout & Bounds Numerical Generator
// ----------------------------------------------------------------------------
function generateBPlusBoundsProblem(seed: number): NumericalDrillProblem {
  const rng = createRng(seed * 6151 + 29);
  const blockSize = pick(rng, [512, 1024, 2048, 4096]);
  const keySize = pick(rng, [8, 9, 12, 16]);
  const treePtr = pick(rng, [6, 8]);
  const recordPtr = pick(rng, [7, 8, 10]);
  const askKind = pick(rng, ['internal_order', 'leaf_order', 'min_internal_keys'] as const);

  // Internal node: p * P_tree + (p - 1) * V <= B  =>  p * (P_tree + V) <= B + V
  const pInternal = Math.floor((blockSize + keySize) / (treePtr + keySize));
  // Leaf node: p_leaf * (V + P_rec) + P_tree <= B
  const pLeaf = Math.floor((blockSize - treePtr) / (keySize + recordPtr));
  const minInternalKeys = Math.ceil(pInternal / 2) - 1;

  let questionLine = '';
  let expected = 0;
  let unitHint = '';

  if (askKind === 'internal_order') {
    questionLine =
      'Compute the maximum order (p) of an internal (non-leaf) B+ Tree node (maximum number of block pointers).';
    expected = pInternal;
    unitHint = 'order p (integer)';
  } else if (askKind === 'leaf_order') {
    questionLine =
      'Compute the maximum number of (search_key, data_pointer) entries (p_leaf) that fit inside one B+ Tree leaf node (reserving 1 next-leaf pointer P_block).';
    expected = pLeaf;
    unitHint = 'leaf entries p_leaf (integer)';
  } else {
    questionLine =
      'First derive internal order p, then compute the MINIMUM number of search keys required in any non-root internal node.';
    expected = minInternalKeys;
    unitHint = 'minimum search keys (integer)';
  }

  return {
    id: `bplus_bounds_${seed}`,
    seed,
    category: 'bplus_bounds',
    categoryLabel: 'B+ Tree Order & Bounds',
    moduleId: 'm3',
    moduleLabel: 'Module 3',
    fatTag: 'Elmasri Ch.17 / Model Q6 & A2 Q10(a)',
    targetSeconds: 150,
    title: 'B+ Tree Internal Order p, Leaf Capacity & Minimum Occupancy',
    prompt:
      'Use exact Elmasri & Navathe B+ Tree node inequalities (never confuse internal node tree pointers with leaf data pointers!).',
    givenBlock: [
      `Disk Block Size (B)       = ${blockSize} bytes`,
      `Search Key Field (V)      = ${keySize} bytes`,
      `Block / Tree Pointer (P)  = ${treePtr} bytes`,
      `Record / Data Pointer (Pr)= ${recordPtr} bytes`,
    ].join('\n'),
    questionLine,
    inputKind: 'number',
    unitHint,
    expectedAnswer: String(expected),
    rubricSteps: [
      `[3M] Internal node inequality: p·P + (p − 1)·V ≤ B  ⇒  p·(${treePtr} + ${keySize}) ≤ ${blockSize} + ${keySize}  ⇒  p = floor(${blockSize + keySize} / ${treePtr + keySize}) = ${pInternal}.`,
      `[2M] Internal node key bounds: max keys = p − 1 = ${pInternal - 1}; min pointers (non-root) = ceil(p/2) = ${Math.ceil(pInternal / 2)}; min keys = ceil(p/2) − 1 = ${minInternalKeys}.`,
      `[3M] Leaf node inequality: p_leaf·(V + Pr) + P ≤ B  ⇒  p_leaf·(${keySize} + ${recordPtr}) ≤ ${blockSize - treePtr}  ⇒  p_leaf = floor(${blockSize - treePtr} / ${keySize + recordPtr}) = ${pLeaf}.`,
      `[2M] Leaf minimum entries = ceil(p_leaf / 2) = ${Math.ceil(pLeaf / 2)} (plus 1 mandatory next-leaf sibling pointer).`,
    ],
    matchingLab: 'bplus',
  };
}

// ----------------------------------------------------------------------------
// 3. Module 2 — Normalization & Candidate Key Generator (Verified via dbEngine)
// ----------------------------------------------------------------------------
const NORM_DRILL_BANK: Array<{
  title: string;
  attrs: string;
  fds: string;
  examNote: string;
}> = [
  {
    title: 'Composite Key Partial Dependency',
    attrs: 'A, B, C, D, E',
    fds: 'A B -> C D; B -> E',
    examNote: 'Classic 1NF trap (proper subset B -> E)',
  },
  {
    title: 'Transitive Non-Prime Chain',
    attrs: 'A, B, C, D',
    fds: 'A -> B; B -> C; C -> D',
    examNote: 'Classic 2NF-only schema (A is single-attribute key)',
  },
  {
    title: '3NF Satisfied, BCNF Violated (Lost-FD Pattern)',
    attrs: 'A, B, C',
    fds: 'A B -> C; C -> B',
    examNote: 'C -> B has prime RHS (passes 3NF) but non-superkey LHS (fails BCNF)',
  },
  {
    title: 'Strict BCNF Relation',
    attrs: 'A, B, C, D',
    fds: 'A -> B C D; B -> A',
    examNote: 'Both A and B are candidate keys -> every LHS is a superkey',
  },
  {
    title: 'FAT A1 Q4 — PATIENT_DIAGNOSIS',
    attrs: 'P, D, Doc, DName, Dept, Head, Test, Res',
    fds: 'P D -> Doc; Doc -> DName Dept; Dept -> Head; P D Test -> Res',
    examNote: 'Composite key (P, D, Test); partial dep P D -> Doc drops it to 1NF',
  },
  {
    title: 'FAT A2 Q9(a) — PROJECT_EVALUATION',
    attrs: 'Sid, Pid, Title, Gid, Gname, Dept, Edate, Marks',
    fds: 'Sid Pid -> Edate Marks; Pid -> Title Gid; Gid -> Gname Dept',
    examNote: 'Composite key (Sid, Pid); Pid -> Title Gid is partial dependency (1NF)',
  },
  {
    title: 'University Course Allocation (3NF not BCNF)',
    attrs: 'S, C, I',
    fds: 'S C -> I; I -> C',
    examNote: 'Candidate keys {SC, SI}; I is not superkey but C is prime -> 3NF',
  },
  {
    title: 'Supplier City Warehouse (2NF not 3NF)',
    attrs: 'Sid, Sname, City, Status',
    fds: 'Sid -> Sname City; City -> Status',
    examNote: 'Single-attribute PK Sid -> automatically 2NF; transitive City -> Status fails 3NF',
  },
];

function generateNormProblem(seed: number): NumericalDrillProblem {
  const rng = createRng(seed * 4099 + 7);
  const item = pick(rng, NORM_DRILL_BANK);
  const attrs = parseAttributes(item.attrs);
  const fds = parseFDs(item.fds, attrs).fds;
  const analysis = analyzeNormalForms(attrs, fds);

  const keyStr = analysis.candidateKeys.map((k) => `{${k.join(', ')}}`).join(', ');
  const violationSummary =
    analysis.violations.length === 0
      ? 'Zero violations: every non-trivial FD has a superkey on its LHS.'
      : analysis.violations.map((v) => `${v.fd} fails ${v.normalForm} (${v.reason})`).join(' | ');

  return {
    id: `norm_nf_${seed}`,
    seed,
    category: 'norm_nf',
    categoryLabel: 'Normal Form & Keys',
    moduleId: 'm2',
    moduleLabel: 'Module 2',
    fatTag: 'A1 Q4 · A2 Q9(a) · Model Q3 (10M)',
    targetSeconds: 180,
    title: `Highest Normal Form Determination — ${item.title}`,
    prompt:
      'Find all candidate keys (check attributes absent from every RHS first), list prime vs. non-prime attributes, and determine the HIGHEST normal form satisfied.',
    givenBlock: `R(${attrs.join(', ')})\nF = { ${fds.map((f) => f.raw).join('; ')} }`,
    questionLine: 'Select the HIGHEST normal form currently satisfied by relation R:',
    inputKind: 'choice',
    choices: ['1NF', '2NF', '3NF', 'BCNF'],
    expectedAnswer: analysis.highestNormalForm,
    rubricSteps: [
      `[3M] Candidate Key(s) via attribute closure X+: ${keyStr}.`,
      `[2M] Prime attributes = { ${analysis.primeAttributes.join(', ')} }; Non-prime = { ${analysis.nonPrimeAttributes.join(', ') || '∅'} }.`,
      `[3M] Check FDs against 2NF → 3NF → BCNF: ${violationSummary}`,
      `[2M] Verdict: Highest satisfied normal form is ${analysis.highestNormalForm}. (${item.examNote})`,
    ],
    matchingLab: 'normalization',
  };
}

// ----------------------------------------------------------------------------
// 4. Module 4 — Conflict Serializability & Recoverability Generator
// ----------------------------------------------------------------------------
const SCHEDULE_DRILL_BANK: Array<{
  title: string;
  ops: string;
  ask: 'serializable' | 'strictness';
}> = [
  {
    title: 'FAT A2 Q5(b) S1 — 3-Transaction Schedule',
    ops: 'R1(X) R2(Z) R1(Z) R3(X) R3(Y) W1(X) C1 W3(Y) C3 R2(Y) W2(Z) W2(Y) C2',
    ask: 'serializable',
  },
  {
    title: 'FAT A1 Q7 — Concurrent Wallet Transfer',
    ops: 'R1(X) W1(X) R2(X) W2(X) R1(Y) R2(Y) W1(Y) C1 C2',
    ask: 'serializable',
  },
  {
    title: 'Model QP Q5(a) — 4-Transaction Schedule',
    ops: 'R1(A) R2(B) W1(B) R3(A) W2(A) R4(B) W3(C) W4(B) R2(C) C1 C2 C3 C4',
    ask: 'serializable',
  },
  {
    title: 'Clean Linearizable Commit Order',
    ops: 'R1(A) W1(A) C1 R2(A) W2(B) C2 R3(B) W3(B) C3',
    ask: 'serializable',
  },
  {
    title: 'Dirty Read Committed Early',
    ops: 'W1(X) R2(X) C2 C1',
    ask: 'strictness',
  },
  {
    title: 'Dirty Read with Delayed Reader Commit',
    ops: 'W1(X) R2(X) C1 C2',
    ask: 'strictness',
  },
  {
    title: 'Dirty Write Only (No Dirty Read)',
    ops: 'W1(X) W2(X) C1 C2',
    ask: 'strictness',
  },
  {
    title: 'Strict Commit-Before-Access Schedule',
    ops: 'R1(X) W1(X) C1 R2(X) W2(X) C2',
    ask: 'strictness',
  },
];

function generateSerializabilityProblem(seed: number): NumericalDrillProblem {
  const rng = createRng(seed * 5381 + 19);
  const item = pick(rng, SCHEDULE_DRILL_BANK);
  const parsed = parseSchedule(item.ops);
  const analysis = analyzeSchedule(parsed.ops);

  const edgeList =
    analysis.uniqueEdges.length === 0
      ? 'No conflict edges'
      : analysis.uniqueEdges.map((e) => `${e.from}→${e.to} [${e.labels.join(', ')}]`).join('; ');

  if (item.ask === 'serializable') {
    const answer = analysis.isConflictSerializable
      ? 'Conflict Serializable (Acyclic)'
      : 'NOT Conflict Serializable (Cycle)';
    return {
      id: `serializability_${seed}`,
      seed,
      category: 'serializability',
      categoryLabel: 'Serializability & Strictness',
      moduleId: 'm4',
      moduleLabel: 'Module 4',
      fatTag: 'A1 Q7 · A2 Q5(b) · Model Q5(a)',
      targetSeconds: 180,
      title: `Precedence Graph Test — ${item.title}`,
      prompt:
        'List every RW, WR, and WW conflicting pair between different transactions on the same data item, draw directed edges Ti → Tj, and check for a directed cycle.',
      givenBlock: `Schedule S:\n${item.ops}`,
      questionLine: 'Is Schedule S Conflict Serializable?',
      inputKind: 'choice',
      choices: ['Conflict Serializable (Acyclic)', 'NOT Conflict Serializable (Cycle)'],
      expectedAnswer: answer,
      rubricSteps: [
        `[4M] Precedence Graph edges (${analysis.uniqueEdges.length}): ${edgeList}.`,
        analysis.isConflictSerializable
          ? `[4M] Graph is a DAG (zero cycles) → Conflict Serializable! Equivalent serial order: ${analysis.serialOrder?.join(' → ')}.`
          : `[4M] Directed cycle detected: ${analysis.cycle?.join(' → ')} → NOT Conflict Serializable.`,
        `[2M] Recoverability check: Recoverable=${analysis.isRecoverable ? 'Yes' : 'No'}, Cascadeless=${analysis.isCascadeless ? 'Yes' : 'No'}, Strict=${analysis.isStrict ? 'Yes' : 'No'}.`,
      ],
      matchingLab: 'serializability',
    };
  }

  // Strictness hierarchy classification
  const strictClass = !analysis.isRecoverable
    ? 'Irrecoverable'
    : !analysis.isCascadeless
    ? 'Recoverable (Not Cascadeless)'
    : !analysis.isStrict
    ? 'Cascadeless (Not Strict)'
    : 'Strict (Strict ⊂ Cascadeless ⊂ Recoverable)';

  return {
    id: `serializability_${seed}`,
    seed,
    category: 'serializability',
    categoryLabel: 'Serializability & Strictness',
    moduleId: 'm4',
    moduleLabel: 'Module 4',
    fatTag: 'A1 Q7 · A2 Q5(a) — Hierarchy Proof',
    targetSeconds: 120,
    title: `Recoverability Hierarchy — ${item.title}`,
    prompt:
      'Remember Strict ⊂ Cascadeless ⊂ Recoverable: Dirty Read + Early Commit = Irrecoverable; Dirty Read + Late Commit = Recoverable only; Dirty Write without Dirty Read = Cascadeless only.',
    givenBlock: `Schedule S:\n${item.ops}`,
    questionLine: 'Select the STRICTEST recoverability class satisfied by Schedule S:',
    inputKind: 'choice',
    choices: [
      'Irrecoverable',
      'Recoverable (Not Cascadeless)',
      'Cascadeless (Not Strict)',
      'Strict (Strict ⊂ Cascadeless ⊂ Recoverable)',
    ],
    expectedAnswer: strictClass,
    rubricSteps: [
      `[3M] Check Dirty Reads (WR before writer commits/aborts) and Dirty Writes (WW before writer commits/aborts).`,
      `[4M] Finding: ${analysis.recoverabilityNote}`,
      `[3M] Classification: Recoverable=${analysis.isRecoverable ? 'Yes' : 'No'}, Cascadeless=${analysis.isCascadeless ? 'Yes' : 'No'}, Strict=${analysis.isStrict ? 'Yes' : 'No'} ⇒ ${strictClass}.`,
    ],
    matchingLab: 'serializability',
  };
}

// ----------------------------------------------------------------------------
// 5. Module 4 — WAL Log Recovery (UNDO / REDO) Generator
// ----------------------------------------------------------------------------
const WAL_DRILL_BANK: Array<{
  title: string;
  mode: 'immediate' | 'deferred';
  ask: 'undo' | 'redo' | 'final_a';
  init: Record<string, number>;
  log: string;
}> = [
  {
    title: 'Immediate Update Crash with Checkpoint',
    mode: 'immediate',
    ask: 'undo',
    init: { A: 2000, B: 5000, C: 1500 },
    log: `[Start, T1]
[Write, T1, A, 2000, 2400]
[Commit, T1]
[Checkpoint]
[Start, T2]
[Write, T2, A, 2400, 2100]
[Start, T3]
[Write, T3, C, 1500, 1800]
[Commit, T3]
[Start, T4]
[Write, T4, B, 5000, 4200]
--- SYSTEM CRASH ---`,
  },
  {
    title: 'Deferred Update Crash (NO-UNDO / REDO)',
    mode: 'deferred',
    ask: 'redo',
    init: { A: 100, B: 200, C: 300 },
    log: `[Start, T1]
[Write, T1, A, 100, 150]
[Commit, T1]
[Checkpoint]
[Start, T2]
[Write, T2, B, 200, 260]
[Start, T3]
[Write, T3, C, 300, 390]
[Commit, T3]
[Start, T4]
[Write, T4, A, 150, 190]
[Commit, T4]
--- SYSTEM CRASH ---`,
  },
  {
    title: 'Immediate Update Final Value of Item A After Recovery',
    mode: 'immediate',
    ask: 'final_a',
    init: { A: 500, B: 900 },
    log: `[Start, T1]
[Write, T1, A, 500, 750]
[Commit, T1]
[Start, T2]
[Write, T2, A, 750, 620]
[Start, T3]
[Write, T3, B, 900, 950]
[Commit, T3]
--- SYSTEM CRASH ---`,
  },
];

function generateWalProblem(seed: number): NumericalDrillProblem {
  const rng = createRng(seed * 3571 + 43);
  const item = pick(rng, WAL_DRILL_BANK);
  const parsed = parseWalLog(item.log);
  const res = simulateLogRecovery(item.init, parsed.entries, item.mode);

  const modeLabel =
    item.mode === 'immediate'
      ? 'Immediate Update (UNDO / REDO)'
      : 'Deferred Update (NO-UNDO / REDO)';

  if (item.ask === 'final_a') {
    const finalA = res.finalValues.A;
    return {
      id: `wal_recovery_${seed}`,
      seed,
      category: 'wal_recovery',
      categoryLabel: 'WAL Crash UNDO / REDO',
      moduleId: 'm4',
      moduleLabel: 'Module 4',
      fatTag: 'A1 Q8(b) · Model Q9(b)',
      targetSeconds: 150,
      title: `WAL Recovery Final Disk State — ${item.title}`,
      prompt: `Under ${modeLabel}, trace committed vs. uncommitted transactions after the crash and compute the recovered disk value of item A.`,
      givenBlock: `Initial Disk: ${Object.entries(item.init).map(([k, v]) => `${k}=${v}`).join(', ')}\nProtocol: ${modeLabel}\n\n${item.log}`,
      questionLine: 'What is the final recovered value of item A on disk?',
      inputKind: 'number',
      unitHint: 'integer value of A',
      expectedAnswer: String(finalA),
      rubricSteps: [
        `[3M] Committed before crash (REDO list): ${res.redoList.join(', ') || 'None'}.`,
        `[3M] Active / uncommitted at crash (UNDO list): ${res.undoList.join(', ') || 'None'}.`,
        `[4M] Rollback uncommitted writes in reverse log order & reapply committed writes forward ⇒ Final Disk: ${Object.entries(res.finalValues).map(([k, v]) => `${k}=${v}`).join(', ')}.`,
      ],
      matchingLab: 'timestamp_recovery',
    };
  }

  const targetList = item.ask === 'undo' ? res.undoList : res.redoList;
  const expectedStr = targetList.length > 0 ? targetList.join(', ') : 'NONE';

  return {
    id: `wal_recovery_${seed}`,
    seed,
    category: 'wal_recovery',
    categoryLabel: 'WAL Crash UNDO / REDO',
    moduleId: 'm4',
    moduleLabel: 'Module 4',
    fatTag: 'A1 Q8(b) · Model Q9(b)',
    targetSeconds: 150,
    title: `WAL ${item.ask.toUpperCase()} List Identification — ${item.title}`,
    prompt: `Scan from the last [Checkpoint] forward to --- SYSTEM CRASH --- under ${modeLabel}. Ignore transactions already committed before the checkpoint.`,
    givenBlock: `Protocol: ${modeLabel}\n\n${item.log}`,
    questionLine: `List the transactions in the ${item.ask.toUpperCase()} list (comma-separated, e.g., "T2, T4" or "NONE"):`,
    inputKind: 'text',
    unitHint: 'e.g. T2, T4',
    expectedAnswer: expectedStr,
    rubricSteps: [
      `[2M] Committed BEFORE [Checkpoint] (flushed to disk; neither UNDO nor REDO needed): ${res.committedBeforeCheckpoint.join(', ') || 'None'}.`,
      `[4M] REDO list (committed AFTER checkpoint): ${res.redoList.join(', ') || 'None'} — replay new-values forward.`,
      `[4M] UNDO list (uncommitted at crash): ${res.undoList.join(', ') || 'None'}${item.mode === 'deferred' ? ' (Deferred Update uses NO-UNDO — uncommitted writes never reached disk!)' : ' — restore old-values in REVERSE order.'}`,
    ],
    matchingLab: 'timestamp_recovery',
  };
}

// ----------------------------------------------------------------------------
// 6. Module 5 — DDBMS Semijoin Transfer Cost Generator
// ----------------------------------------------------------------------------
function generateSemijoinProblem(seed: number): NumericalDrillProblem {
  const rng = createRng(seed * 9203 + 5);
  const tuplesR = pick(rng, [8000, 10000, 20000, 50000]);
  const tupleBytesR = pick(rng, [80, 100, 120, 150]);
  const tuplesS = pick(rng, [100, 200, 500, 1000]);
  const tupleBytesS = pick(rng, [40, 60, 80]);
  const joinKeyBytes = pick(rng, [4, 8, 10]);
  const distinctJoinKeysS = pick(rng, [10, 25, 50, 100]);
  const matchingTuplesR = pick(rng, [200, 400, 500, 600]);
  const askKind = pick(rng, ['semijoin_total', 'naive_ship_r'] as const);

  const res = calculateSemijoinCost({
    relRName: 'EMPLOYEE (Site 1)',
    relSName: 'DEPARTMENT (Site 2)',
    tuplesR,
    tupleBytesR,
    tuplesS,
    tupleBytesS,
    joinKeyBytes,
    distinctJoinKeysS,
    matchingTuplesR,
  });

  const expected =
    askKind === 'semijoin_total' ? res.semijoinTotalBytes : res.naiveShipRBytes;

  return {
    id: `semijoin_cost_${seed}`,
    seed,
    category: 'semijoin_cost',
    categoryLabel: 'DDBMS Semijoin Transfer',
    moduleId: 'm5',
    moduleLabel: 'Module 5',
    fatTag: 'A1+TA1 Q9 · Model Q10(a)',
    targetSeconds: 150,
    title: 'Distributed Semijoin (R ⋉ S) Network Transfer Cost',
    prompt:
      'Compute total bytes shipped across the network to produce R ⋈ S at Site 2 using the 2-step Semijoin strategy: Step 1 ship π_K(S) from Site 2 → Site 1; Step 2 ship matching tuples (R ⋉ S) from Site 1 → Site 2.',
    givenBlock: [
      `Site 1 — R (EMPLOYEE):   |R| = ${tuplesR.toLocaleString()} tuples, tuple size = ${tupleBytesR} B`,
      `Site 2 — S (DEPARTMENT): |S| = ${tuplesS.toLocaleString()} tuples, tuple size = ${tupleBytesS} B`,
      `Join key K size:         ${joinKeyBytes} bytes`,
      `Distinct join keys |π_K(S)|: ${distinctJoinKeysS.toLocaleString()} keys`,
      `Matching tuples |R ⋉ S|: ${matchingTuplesR.toLocaleString()} tuples`,
    ].join('\n'),
    questionLine:
      askKind === 'semijoin_total'
        ? 'Compute the TOTAL network transfer cost (in bytes) of the Semijoin strategy (Step 1 + Step 2):'
        : 'Compute the Naive strategy cost (in bytes) if Site 1 ships the entire relation R directly to Site 2:',
    inputKind: 'number',
    unitHint: 'bytes (integer)',
    expectedAnswer: String(expected),
    rubricSteps: [
      `[3M] Naive Ship R → Site 2: ${tuplesR.toLocaleString()} × ${tupleBytesR} B = ${res.naiveShipRBytes.toLocaleString()} bytes.`,
      `[3M] Semijoin Step 1 (ship π_K(S) to Site 1): ${distinctJoinKeysS.toLocaleString()} × ${joinKeyBytes} B = ${res.semijoinStep1Bytes.toLocaleString()} bytes.`,
      `[2M] Semijoin Step 2 (ship R ⋉ S to Site 2): ${matchingTuplesR.toLocaleString()} × ${tupleBytesR} B = ${res.semijoinStep2Bytes.toLocaleString()} bytes.`,
      `[2M] Total Semijoin Transfer = ${res.semijoinStep1Bytes.toLocaleString()} + ${res.semijoinStep2Bytes.toLocaleString()} = ${res.semijoinTotalBytes.toLocaleString()} bytes (${res.savingsPctVsShipR}% reduction vs. shipping full R!).`,
    ],
    matchingLab: 'ddbms_2pc',
  };
}

export function generateNumericalProblem(
  category: DrillCategory,
  seed: number
): NumericalDrillProblem {
  switch (category) {
    case 'index_io':
      return generateIndexIoProblem(seed);
    case 'bplus_bounds':
      return generateBPlusBoundsProblem(seed);
    case 'norm_nf':
      return generateNormProblem(seed);
    case 'serializability':
      return generateSerializabilityProblem(seed);
    case 'wal_recovery':
      return generateWalProblem(seed);
    case 'semijoin_cost':
      return generateSemijoinProblem(seed);
  }
}

export function gradeDrillAnswer(
  problem: NumericalDrillProblem,
  rawInput: string
): DrillGradeResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      correct: false,
      normalizedInput: '',
      expectedDisplay: problem.expectedAnswer,
      feedback: 'Enter or select an answer before grading.',
    };
  }

  if (problem.inputKind === 'number') {
    const cleaned = trimmed.replace(/[,\s_]/g, '').replace(/(bytes?|blocks?|io|ios|keys?)$/i, '');
    const numericInput = Number(cleaned);
    const expectedNum = Number(problem.expectedAnswer);
    const correct = Number.isFinite(numericInput) && numericInput === expectedNum;
    return {
      correct,
      normalizedInput: cleaned,
      expectedDisplay: Number(problem.expectedAnswer).toLocaleString(),
      feedback: correct
        ? `Exact match (${expectedNum.toLocaleString()})! Follow the 4-step marking scheme below to guarantee 10/10.`
        : `Expected ${expectedNum.toLocaleString()} (you entered "${trimmed}"). Check the intermediate formula steps below.`,
    };
  }

  if (problem.inputKind === 'choice') {
    const correct = trimmed.toLowerCase() === problem.expectedAnswer.toLowerCase();
    return {
      correct,
      normalizedInput: trimmed,
      expectedDisplay: problem.expectedAnswer,
      feedback: correct
        ? `Correct — "${problem.expectedAnswer}"! Review the rubric checkpoints to lock in full marks.`
        : `Incorrect. Correct answer is "${problem.expectedAnswer}". Study the proof steps below.`,
    };
  }

  // Set-normalized token comparison (e.g., "T2, T4" == "T4 T2" == "t2,t4")
  const tokenize = (s: string) =>
    s
      .toUpperCase()
      .split(/[\s,;]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .sort()
      .join(',');

  const userKey = tokenize(trimmed);
  const expKey = tokenize(problem.expectedAnswer);
  const correct = userKey === expKey;

  return {
    correct,
    normalizedInput: userKey,
    expectedDisplay: problem.expectedAnswer,
    feedback: correct
      ? `Exact match (${problem.expectedAnswer})! Remember to mention UNDO runs in reverse log order & REDO runs forward.`
      : `Expected "${problem.expectedAnswer}" (you entered "${trimmed}"). Check the Checkpoint boundary in the trace below.`,
  };
}

// ============================================================================
// 95+ Examiner Answer-Writing Blueprints (Q1–Q10) & 20 FAT Trap Busters
// ============================================================================

export interface ExaminerBlueprint {
  qRange: string;
  moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
  topic: string;
  markSplit: string;
  mandatorySteps: string[];
  topperMove: string;
  commonTrap: string;
}

export const EXAMINER_BLUEPRINTS: ExaminerBlueprint[] = [
  {
    qRange: 'Q1 (M1)',
    moduleId: 'm1',
    topic: 'Three-Schema Architecture & Modern Data Models',
    markSplit: '4M Diagram + 3M Data Independence + 3M Model Comparison',
    mandatorySteps: [
      'Draw all 3 boxes (External Views → Conceptual Schema → Internal Schema → Stored DB) AND label both mapping arrows explicitly.',
      'Give one concrete change example for Logical Independence (adding/splitting a column without breaking views) and Physical Independence (adding B+ tree index / changing SSD storage).',
      'Compare Relational vs. Graph / Vector / Time-Series / Semi-Structured in a structured 3-column table.',
    ],
    topperMove: 'Include a real VIT/Enterprise example (e.g., VTOP GPA view vs. Conceptual schema) to turn a 7/10 answer into 10/10.',
    commonTrap: 'Mixing up Logical vs. Physical Independence or forgetting to draw the External/Conceptual and Conceptual/Internal mappings (-2M).',
  },
  {
    qRange: 'Q2 (M1)',
    moduleId: 'm1',
    topic: 'Relational Integrity Constraints & Violation Actions',
    markSplit: '3M Definitions + 4M Trace Table + 3M Referential Actions',
    mandatorySteps: [
      'Explicitly name all 4 constraint checks for every operation: Domain, Key, Entity Integrity (PK ≠ NULL), and Referential Integrity.',
      'For each INSERT/DELETE/UPDATE, state ACCEPTED or REJECTED + exact violated constraint name + offending tuple.',
      'Write all 4 SQL FK remedies: RESTRICT (reject), CASCADE (propagate), SET NULL, and SET DEFAULT.',
    ],
    topperMove: 'Always clarify that a Foreign Key CAN legally be NULL (unless NOT NULL is declared) — only Primary Keys forbid NULL!',
    commonTrap: 'Claiming an INSERT with FK = NULL violates Referential Integrity (-2M). NULL FK is valid under standard SQL!',
  },
  {
    qRange: 'Q3 (M2)',
    moduleId: 'm2',
    topic: 'ER / EER Diagramming & 7-Step + 8A–8D Relational Mapping',
    markSplit: '4M ER/EER Diagram + 6M Relational Tables (PK/FK Underlined)',
    mandatorySteps: [
      'Use exact Chen/Elmasri notation: Double rectangle for Weak Entity, double diamond for Identifying Relationship, dashed underline for Partial Key, (d)/(o) circle + double line for Total Specialization.',
      'Write every mapped table in standard schema form: TABLE_NAME(PK_Underlined, Attr, FK_Ref → Parent.PK).',
      'State which EER option (8A, 8B, 8C, or 8D) you chose and justify it via Disjoint vs. Overlapping & Total vs. Partial.',
    ],
    topperMove: 'Show Multivalued attributes as a separate table with composite PK (Owner_PK, Multivalued_Attr) and M:N relationships as a junction table.',
    commonTrap: 'Putting a 1:N Foreign Key on the "1" side instead of the "N" side, or forgetting Owner_PK inside a Weak Entity table (-3M).',
  },
  {
    qRange: 'Q4 (M2)',
    moduleId: 'm2',
    topic: 'Candidate Keys, Minimal Cover, 3NF Synthesis & BCNF Proof',
    markSplit: '2M Candidate Keys + 2M Current NF + 4M Decomposed Tables + 2M Lossless/Dep Proof',
    mandatorySteps: [
      'Partition attributes into Left-Only (must be in every CK), Middle, and Right-Only; show explicit closure X+ proving minimality.',
      'Pinpoint the exact violating FD (partial for 2NF, transitive for 3NF, non-superkey LHS for BCNF).',
      'List final decomposed tables with underlined PKs AND explicitly prove Lossless Join: (R1 ∩ R2) → R1 or (R1 ∩ R2) → R2 (or Chase tableau).',
    ],
    topperMove: 'When comparing 3NF vs. BCNF, explicitly check Dependency Preservation and highlight any lost FD in BCNF.',
    commonTrap: 'Stopping at 3NF when the prompt asks for BCNF, or omitting the formal Lossless Join proof (-2M).',
  },
  {
    qRange: 'Q5 (M3)',
    moduleId: 'm3',
    topic: 'Extendible / Linear Hashing & Multilevel Index Disk I/O',
    markSplit: '3M bfr & Data Blocks + 4M Level-by-Level Fanout + 3M Search I/O Comparison',
    mandatorySteps: [
      'Write formulas BEFORE plugging numbers: bfr = floor(B/R), b = ceil(r/bfr), bfr_i = floor(B/(V+P)).',
      'Show EVERY index level down to 1 root block: Level 1 → Level 2 → ... → Root (1 block).',
      'State final answer as t + 1 disk accesses and compare directly against binary search ceil(log2 b).',
    ],
    topperMove: 'Box every intermediate integer (bfr, b, fo, t, t+1) — VIT evaluators award full step marks even if a tiny arithmetic slip occurs.',
    commonTrap: 'Using ceil() instead of floor() for blocking factor bfr, or forgetting the "+ 1" final data block access (-2M).',
  },
  {
    qRange: 'Q6 (M3)',
    moduleId: 'm3',
    topic: 'B+ Tree Construction (Insertions, Splits & Deletions)',
    markSplit: '2M Node Bounds + 5M Step-by-Step Splits + 3M Final Linked Tree',
    mandatorySteps: [
      'Write max keys = p − 1 and min leaf/internal occupancy at the top before inserting the first key.',
      'Show intermediate snapshots after EVERY split or merge (not just the final tree!).',
      'Draw horizontal sibling arrows connecting ALL leaf nodes left-to-right and verify leaf keys stay duplicated in internal routers on leaf split, whereas internal splits PUSH UP without duplicating.',
    ],
    topperMove: 'During deletion, explicitly annotate Case I (leaf-only delete) vs. Case II (replace deleted internal router with inorder successor).',
    commonTrap: 'Duplicating the middle key during an INTERNAL node split (that is B-tree/leaf confusion!) or omitting leaf next-pointers (-2M).',
  },
  {
    qRange: 'Q7 (M3)',
    moduleId: 'm3',
    topic: 'Relational Algebra (incl. Division ÷), TRC & Heuristic Query Trees',
    markSplit: '4M RA/TRC Expressions + 3M Canonical Tree + 3M Optimized Pushdown Tree',
    mandatorySteps: [
      'For "all / every" queries, use Division (÷) in RA and universal quantifier ∀ with implication (→) in TRC.',
      'Draw the initial Canonical Query Tree (Cartesian products at leaves, σ and π at top).',
      'Apply heuristics in order: Cascade σ → Push σ down → Replace (× + σ) with ⋈ → Push π down → Reorder most selective joins first.',
    ],
    topperMove: 'Annotate approximate intermediate tuple counts next to each edge of the Canonical vs. Optimized tree to prove I/O reduction.',
    commonTrap: 'Using ∧ instead of → inside a universal quantifier ∀x (P(x) → Q(x)) in TRC (-2M).',
  },
  {
    qRange: 'Q8 (M4)',
    moduleId: 'm4',
    topic: 'Conflict Serializability, Precedence Graph & Strictness Hierarchy',
    markSplit: '4M Conflict List + 3M Precedence Graph & Serial Order + 3M Recoverability',
    mandatorySteps: [
      'Scan all pairs of operations on the same item from different transactions (RW, WR, WW) and list them with step numbers.',
      'Draw the directed Precedence Graph clearly; state Cycle (NOT conflict serializable) OR give a valid Topological Sort serial order.',
      'Test Recoverable, Cascadeless (no dirty reads), and Strict (no dirty reads & no dirty writes) separately.',
    ],
    topperMove: 'Always verify if a cycle exists among 3+ transactions (T1→T2→T3→T1), not just direct 2-node loops!',
    commonTrap: 'Drawing an edge for Read–Read (R–R) pairs — R–R NEVER conflicts! (-3M).',
  },
  {
    qRange: 'Q9 (M4)',
    moduleId: 'm4',
    topic: '2PL, Wait-Die / Wound-Wait Deadlocks, Timestamp Ordering & WAL Recovery',
    markSplit: '5M Protocol Trace Table + 5M Crash Recovery UNDO/REDO Table',
    mandatorySteps: [
      'Draw a clear tabular trace showing Step | Operation | Lock/TS State | Action (Grant / Wait / Abort / Ignore).',
      'Distinguish Wait-Die (Non-preemptive: older waits, younger dies) vs. Wound-Wait (Preemptive: older wounds younger, younger waits).',
      'For WAL recovery, explicitly list Pre-Checkpoint Committed (ignored), REDO list (forward), UNDO list (reverse), and Final Disk Values.',
    ],
    topperMove: 'Explicitly state the Thomas Write Rule condition: RTS(X) ≤ TS(Ti) AND WTS(X) > TS(Ti) ⇒ IGNORE obsolete write instead of aborting.',
    commonTrap: 'Applying UNDO under Deferred Update (Deferred is NO-UNDO/REDO!) or running UNDO forward instead of backward (-2M).',
  },
  {
    qRange: 'Q10 (M5)',
    moduleId: 'm5',
    topic: 'DDBMS Fragmentation, Semijoin Cost, 2PC & CAP / NoSQL',
    markSplit: '4M Fragmentation/Semijoin Math + 3M 2PC States + 3M CAP/NoSQL Design',
    mandatorySteps: [
      'Always prove all 3 fragmentation correctness rules: Completeness, Reconstruction (∪ for horizontal, ⋈ on PK for vertical), and Disjointness (except PK in vertical).',
      'Show Step 1 + Step 2 Semijoin byte calculation AND percentage savings vs. Naive Join.',
      'Map Two-Phase Commit (Phase 1 Prepare/Vote + Phase 2 Commit/Abort) and explain Coordinator blocking window; link CAP (CP vs. AP) to concrete NoSQL engines.',
    ],
    topperMove: 'State PACELC (if Partition → A vs C; Else → Latency vs Consistency) as a 1-line bonus insight on CAP questions.',
    commonTrap: 'Forgetting to include the Primary Key in EVERY vertical fragment — without PK, Reconstruction via natural join fails (-3M).',
  },
];

export interface ExamTrapBuster {
  id: string;
  moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
  trap: string;
  fix: string;
}

export const EXAM_TRAP_BUSTERS: ExamTrapBuster[] = [
  { id: 'trap-1', moduleId: 'm1', trap: 'Marking FK = NULL as a Referential Integrity error', fix: 'Foreign Keys MAY be NULL unless NOT NULL is explicitly stated; only Primary Keys ban NULL (Entity Integrity).' },
  { id: 'trap-2', moduleId: 'm1', trap: 'Swapping Logical vs. Physical Data Independence', fix: 'Logical = Conceptual changes without breaking External views; Physical = Internal storage changes without breaking Conceptual schema.' },
  { id: 'trap-3', moduleId: 'm1', trap: 'Missing the mapping layers in Three-Schema diagram', fix: 'Always draw External/Conceptual mapping AND Conceptual/Internal mapping arrows.' },
  { id: 'trap-4', moduleId: 'm2', trap: 'Placing 1:N Foreign Key on the 1-side table', fix: 'Always place the PK of the 1-side as a Foreign Key inside the N-side relation.' },
  { id: 'trap-5', moduleId: 'm2', trap: 'Forgetting Owner PK inside a Weak Entity table', fix: 'Weak Entity PK = (Owner_PK + Partial_Key), and Owner_PK is also a Foreign Key with ON DELETE CASCADE.' },
  { id: 'trap-6', moduleId: 'm2', trap: 'Skipping Step 2 (extraneous LHS attributes) in Minimal Cover', fix: 'Always run all 3 steps in order: 1) Split RHS, 2) Drop extraneous LHS attrs, 3) Drop redundant FDs.' },
  { id: 'trap-7', moduleId: 'm2', trap: 'Assuming 3NF fails when RHS is prime', fix: 'In 3NF, X → A is LEGAL if X is a superkey OR A is a prime attribute. BCNF removes the "A is prime" escape hatch.' },
  { id: 'trap-8', moduleId: 'm2', trap: 'Omitting the Lossless Join verification after decomposition', fix: 'Always verify (R1 ∩ R2) → R1 or (R1 ∩ R2) → R2 (or run Chase tableau for 3+ tables).' },
  { id: 'trap-9', moduleId: 'm3', trap: 'Using ceil(B / R) for blocking factor bfr', fix: 'Unspanned bfr MUST use floor(B / R); block counts b = ceil(r / bfr) use ceil().' },
  { id: 'trap-10', moduleId: 'm3', trap: 'Forgetting "+ 1" data block read in multilevel index search', fix: 'Total Disk I/O = number of index levels (t) + 1 final data block access.' },
  { id: 'trap-11', moduleId: 'm3', trap: 'Copying (duplicating) the promoted key on an INTERNAL B+ tree split', fix: 'Leaf split = COPY middle key up (stays in right leaf). Internal split = PUSH middle key up (removed from both halves).' },
  { id: 'trap-12', moduleId: 'm3', trap: 'Writing ∀t (P(t) ∧ Q(t)) instead of implication in TRC', fix: 'Universal quantifier ALWAYS pairs with implication (→): ∀c (Course(c) → ∃e (Enrolled(s, c))).' },
  { id: 'trap-13', moduleId: 'm4', trap: 'Adding a Precedence Graph edge for Read–Read (R1(X), R2(X))', fix: 'Only RW, WR, and WW conflict; two Reads on the same item never create an edge.' },
  { id: 'trap-14', moduleId: 'm4', trap: 'Confusing Wait-Die with Wound-Wait preemption', fix: 'Wait-Die: Older WAITS, Younger DIES (non-preemptive). Wound-Wait: Older WOUNDS (aborts) Younger, Younger WAITS (preemptive).' },
  { id: 'trap-15', moduleId: 'm4', trap: 'Aborting an obsolete write under Thomas Write Rule', fix: 'When WTS(X) > TS(Ti) and RTS(X) ≤ TS(Ti), Basic TO aborts Ti, whereas Thomas Write Rule IGNORES the write and lets Ti continue.' },
  { id: 'trap-16', moduleId: 'm4', trap: 'Running UNDO under Deferred Update or running UNDO forward', fix: 'Deferred Update = NO-UNDO / REDO. Immediate Update = UNDO uncommitted (REVERSE log order) + REDO committed (FORWARD order).' },
  { id: 'trap-17', moduleId: 'm5', trap: 'Leaving Primary Key out of a Vertical Fragment', fix: 'Every vertical fragment MUST replicate the Primary Key so Reconstruction via natural join is lossless.' },
  { id: 'trap-18', moduleId: 'm5', trap: 'Forgetting Step 1 join-key projection bytes in Semijoin cost', fix: 'Semijoin Total = (|π_K(S)| × size(K)) + (|R ⋉ S| × size(R)); always include Step 1 overhead!' },
  { id: 'trap-19', moduleId: 'm5', trap: 'Claiming 2PC is non-blocking', fix: '2PC is a BLOCKING protocol: if the Coordinator crashes after participants vote YES (Ready), participants stay blocked holding locks.' },
  { id: 'trap-20', moduleId: 'm5', trap: 'Claiming a distributed system can drop Partition Tolerance (P) in CAP', fix: 'Network partitions are unavoidable in distributed systems — real choices during a partition are CP (Consistency) vs. AP (Availability).' },
];

export interface ExamPacingRow {
  window: string;
  duration: string;
  target: string;
  strategy: string;
}

export const EXAM_HALL_PACING: ExamPacingRow[] = [
  { window: '09:00 – 09:05', duration: '5 min', target: 'Paper Scan & OR-Choice Lock', strategy: 'Pick the cleaner deterministic numerical on every OR pair (prefer FD/B+ Tree/Precedence Graph/Index I/O over open-ended essays).' },
  { window: '09:05 – 09:37', duration: '32 min', target: 'Q1 & Q2 (Module 1 · 20M)', strategy: '16 min each. Draw Three-Schema diagram crisply; list all 4 integrity checks in a neat table.' },
  { window: '09:37 – 10:09', duration: '32 min', target: 'Q3 & Q4 (Module 2 · 20M)', strategy: '16 min each. Underline every PK/FK in ER mapping; prove X+ and Lossless Join formally.' },
  { window: '10:09 – 10:41', duration: '32 min', target: 'Q5 & Q6 (Module 3 · 20M)', strategy: '16 min each. Box bfr/b/fo/t+1; draw leaf sibling pointers on B+ tree; double-check floor vs ceil.' },
  { window: '10:41 – 11:13', duration: '32 min', target: 'Q7 & Q8 (M3 Query / M4 Tx · 20M)', strategy: '16 min each. Push σ below ⋈ in query trees; verify zero R-R edges in precedence graph.' },
  { window: '11:13 – 11:45', duration: '32 min', target: 'Q9 & Q10 (M4 Lock/WAL & M5 · 20M)', strategy: '16 min each. Check reverse-order UNDO vs forward REDO; include PK in every vertical fragment.' },
  { window: '11:45 – 12:00', duration: '15 min', target: '95+ Audit Buffer (Zero Silly Losses)', strategy: 'Re-verify arithmetic on Index I/O & Semijoin, check leaf pointers on B+ Tree, verify PK underlines & boxed final verdicts.' },
];
