// ============================================================================
// Module 4: 2PL Lock-Table, Wait-For Graph, Wait-Die / Wound-Wait &
// Multiple Granularity Locking (IS/IX/S/SIX/X) Engine
// Pure, deterministic logic decoupled from UI for unit testing & FAT drills
// ============================================================================

export type LockMode = 'S' | 'X';
export type LockProtocol = 'strict_2pl_wfg' | 'wait_die' | 'wound_wait';

export interface LockOp {
  type: 'R' | 'W' | 'C' | 'A';
  tx: string;
  item?: string;
  raw: string;
}

export interface LockTableEntry {
  item: string;
  mode: 'FREE' | 'S' | 'X';
  holders: string[];
  waitQueue: Array<{ tx: string; mode: LockMode }>;
}

export interface WaitForEdge {
  from: string;
  to: string;
  item: string;
}

export interface LockStepSnapshot {
  stepNo: number;
  op: LockOp;
  txTs: number;
  outcome: 'GRANTED' | 'UPGRADED' | 'BLOCKED' | 'ABORTED_WAIT_DIE' | 'WOUNDED_OTHER' | 'COMMITTED' | 'SKIPPED' | 'DEADLOCK';
  detail: string;
  lockTable: LockTableEntry[];
  wfgEdges: WaitForEdge[];
  deadlockCycle: string[] | null;
  abortedTxs: string[];
  committedTxs: string[];
  blockedTxs: string[];
}

export interface TwoPLSimulationResult {
  protocol: LockProtocol;
  transactions: string[];
  timestamps: Record<string, number>;
  steps: LockStepSnapshot[];
  deadlockDetected: boolean;
  deadlockCycle: string[] | null;
  abortedTxs: string[];
  committedTxs: string[];
  woundedEvents: number;
}

export interface TwoPLPreset {
  id: string;
  name: string;
  examTag: string;
  schedule: string;
  timestamps: Record<string, number>;
  note: string;
}

export const TWO_PL_PRESETS: TwoPLPreset[] = [
  {
    id: 'classic_2tx',
    name: '2-Tx Deadlock (A2 Q6)',
    examTag: 'A2+TA2 Q6 Classic',
    schedule: 'R1(X) R2(Y) W2(X) W1(Y) C1 C2',
    timestamps: { T1: 10, T2: 20 },
    note: 'T1 holds S(X) and wants X(Y); T2 holds S(Y) and wants X(X). Compare WFG Cycle vs Wait-Die vs Wound-Wait!',
  },
  {
    id: 'cycle_3tx',
    name: '3-Tx Cycle Deadlock (Model Q7)',
    examTag: 'Model QP Q7 Pattern',
    schedule: 'W1(X) W2(Y) W3(Z) R1(Y) R2(Z) R3(X) C1 C2 C3',
    timestamps: { T1: 10, T2: 20, T3: 30 },
    note: 'Forms a 3-node Wait-For Graph cycle T1 → T2 → T3 → T1 under plain Strict 2PL.',
  },
  {
    id: 'upgrade_deadlock',
    name: 'Lock Upgrade Deadlock (S → X)',
    examTag: 'VIT FAT 2M/10M Trap',
    schedule: 'R1(X) R2(X) W1(X) W2(X) C1 C2',
    timestamps: { T1: 10, T2: 20 },
    note: 'Both T1 and T2 share S(X), then both request upgrade to X(X) -> immediate mutual wait deadlock!',
  },
  {
    id: 'safe_strict_2pl',
    name: 'Safe Strict 2PL (No Deadlock)',
    examTag: 'Strict 2PL Commit Release',
    schedule: 'R1(X) R2(X) C1 W2(X) C2',
    timestamps: { T1: 10, T2: 20 },
    note: 'T1 releases S(X) on commit C1, allowing T2 to upgrade its S(X) to X(X) cleanly with zero conflicts.',
  },
];

export function parseLockSchedule(input: string): { ops: LockOp[]; error?: string } {
  const tokens = input
    .trim()
    .split(/[\s,;]+/)
    .filter(Boolean);

  if (tokens.length === 0) {
    return { ops: [], error: 'Enter a schedule such as: R1(X) R2(Y) W2(X) W1(Y) C1 C2' };
  }

  const ops: LockOp[] = [];
  for (const tok of tokens) {
    const rw = tok.match(/^([RWSX])(\d+)\(([A-Za-z][A-Za-z0-9]*)\)$/i);
    if (rw) {
      const code = rw[1].toUpperCase();
      const type: 'R' | 'W' = code === 'R' || code === 'S' ? 'R' : 'W';
      ops.push({
        type,
        tx: `T${rw[2]}`,
        item: rw[3].toUpperCase(),
        raw: tok,
      });
      continue;
    }
    const ca = tok.match(/^([CA])(\d+)$/i);
    if (ca) {
      ops.push({
        type: ca[1].toUpperCase() as 'C' | 'A',
        tx: `T${ca[2]}`,
        raw: tok,
      });
      continue;
    }
    return {
      ops: [],
      error: `Invalid token "${tok}". Use R1(X), W2(Y), S1(X), X2(Y), C1, or A2.`,
    };
  }

  return { ops };
}

function findCycleInWFG(edges: WaitForEdge[]): string[] | null {
  const adj = new Map<string, string[]>();
  const nodes = new Set<string>();
  for (const e of edges) {
    nodes.add(e.from);
    nodes.add(e.to);
    const list = adj.get(e.from) ?? [];
    if (!list.includes(e.to)) list.push(e.to);
    adj.set(e.from, list);
  }

  const state = new Map<string, 0 | 1 | 2>(); // 0=unvisited, 1=visiting, 2=done
  const stack: string[] = [];

  const dfs = (u: string): string[] | null => {
    state.set(u, 1);
    stack.push(u);
    for (const v of adj.get(u) ?? []) {
      const st = state.get(v) ?? 0;
      if (st === 1) {
        const startIdx = stack.indexOf(v);
        return [...stack.slice(startIdx), v];
      }
      if (st === 0) {
        const res = dfs(v);
        if (res) return res;
      }
    }
    stack.pop();
    state.set(u, 2);
    return null;
  };

  for (const n of Array.from(nodes).sort()) {
    if ((state.get(n) ?? 0) === 0) {
      const cycle = dfs(n);
      if (cycle) return cycle;
    }
  }
  return null;
}

export function simulateTwoPL(
  ops: LockOp[],
  protocol: LockProtocol,
  customTimestamps: Record<string, number> = {}
): TwoPLSimulationResult {
  const transactions = Array.from(new Set(ops.map((o) => o.tx))).sort(
    (a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10)
  );
  const items = Array.from(new Set(ops.map((o) => o.item).filter((x): x is string => Boolean(x)))).sort();

  const timestamps: Record<string, number> = {};
  transactions.forEach((tx, idx) => {
    const custom = customTimestamps[tx];
    timestamps[tx] = Number.isFinite(custom) ? custom : (idx + 1) * 10;
  });

  // Per-item lock state
  const holders = new Map<string, Map<string, LockMode>>();
  const waitQueue = new Map<string, Array<{ tx: string; mode: LockMode }>>();
  for (const item of items) {
    holders.set(item, new Map());
    waitQueue.set(item, []);
  }

  const abortedSet = new Set<string>();
  const committedSet = new Set<string>();
  const blockedSet = new Set<string>();
  let woundedEvents = 0;

  const isCompatible = (item: string, tx: string, reqMode: LockMode): boolean => {
    const itemHolders = holders.get(item)!;
    for (const [otherTx, otherMode] of itemHolders.entries()) {
      if (otherTx === tx) continue;
      if (reqMode === 'X' || otherMode === 'X') return false;
    }
    return true;
  };

  const getConflictingHolders = (item: string, tx: string, reqMode: LockMode): string[] => {
    const itemHolders = holders.get(item)!;
    const conflicts: string[] = [];
    for (const [otherTx, otherMode] of itemHolders.entries()) {
      if (otherTx === tx) continue;
      if (reqMode === 'X' || otherMode === 'X') {
        conflicts.push(otherTx);
      }
    }
    return conflicts.sort();
  };

  const computeWFG = (): WaitForEdge[] => {
    const edges: WaitForEdge[] = [];
    const seen = new Set<string>();
    for (const item of items) {
      const q = waitQueue.get(item)!;
      for (const waiter of q) {
        const conflicts = getConflictingHolders(item, waiter.tx, waiter.mode);
        for (const holder of conflicts) {
          const key = `${waiter.tx}->${holder}@${item}`;
          if (!seen.has(key)) {
            seen.add(key);
            edges.push({ from: waiter.tx, to: holder, item });
          }
        }
      }
    }
    return edges;
  };

  const releaseAllLocks = (tx: string): string[] => {
    const woken: string[] = [];
    for (const item of items) {
      holders.get(item)!.delete(tx);
      const q = waitQueue.get(item)!;
      const filtered = q.filter((w) => w.tx !== tx);
      waitQueue.set(item, filtered);
    }
    blockedSet.delete(tx);

    // Attempt to wake compatible waiting transactions FIFO
    let progress = true;
    while (progress) {
      progress = false;
      for (const item of items) {
        const q = waitQueue.get(item)!;
        const remaining: Array<{ tx: string; mode: LockMode }> = [];
        for (const req of q) {
          if (abortedSet.has(req.tx)) continue;
          if (isCompatible(item, req.tx, req.mode)) {
            const existing = holders.get(item)!.get(req.tx);
            const nextMode: LockMode = existing === 'X' || req.mode === 'X' ? 'X' : 'S';
            holders.get(item)!.set(req.tx, nextMode);
            blockedSet.delete(req.tx);
            woken.push(`${req.tx} granted ${nextMode}(${item})`);
            progress = true;
          } else {
            remaining.push(req);
          }
        }
        waitQueue.set(item, remaining);
      }
    }
    return woken;
  };

  const snapshotLockTable = (): LockTableEntry[] =>
    items.map((item) => {
      const hMap = holders.get(item)!;
      const hList = Array.from(hMap.keys()).sort();
      const hasX = Array.from(hMap.values()).includes('X');
      const mode: LockTableEntry['mode'] = hList.length === 0 ? 'FREE' : hasX ? 'X' : 'S';
      return {
        item,
        mode,
        holders: hList,
        waitQueue: waitQueue.get(item)!.map((w) => ({ ...w })),
      };
    });

  const steps: LockStepSnapshot[] = [];
  let anyDeadlock = false;
  let lastCycle: string[] | null = null;

  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    const txTs = timestamps[op.tx];

    if (abortedSet.has(op.tx)) {
      const wfgEdges = computeWFG();
      const cycle = findCycleInWFG(wfgEdges);
      steps.push({
        stepNo: i + 1,
        op,
        txTs,
        outcome: 'SKIPPED',
        detail: `${op.tx} was already aborted & rolled back earlier — operation skipped.`,
        lockTable: snapshotLockTable(),
        wfgEdges,
        deadlockCycle: cycle,
        abortedTxs: Array.from(abortedSet).sort(),
        committedTxs: Array.from(committedSet).sort(),
        blockedTxs: Array.from(blockedSet).sort(),
      });
      continue;
    }

    if (blockedSet.has(op.tx)) {
      const wfgEdges = computeWFG();
      const cycle = findCycleInWFG(wfgEdges);
      steps.push({
        stepNo: i + 1,
        op,
        txTs,
        outcome: 'BLOCKED',
        detail: `${op.tx} is currently blocked waiting for an earlier lock — ${op.raw} queued.`,
        lockTable: snapshotLockTable(),
        wfgEdges,
        deadlockCycle: cycle,
        abortedTxs: Array.from(abortedSet).sort(),
        committedTxs: Array.from(committedSet).sort(),
        blockedTxs: Array.from(blockedSet).sort(),
      });
      continue;
    }

    if (op.type === 'C' || op.type === 'A') {
      if (op.type === 'C') committedSet.add(op.tx);
      if (op.type === 'A') abortedSet.add(op.tx);
      const woken = releaseAllLocks(op.tx);
      const wfgEdges = computeWFG();
      const cycle = findCycleInWFG(wfgEdges);
      steps.push({
        stepNo: i + 1,
        op,
        txTs,
        outcome: op.type === 'C' ? 'COMMITTED' : 'ABORTED_WAIT_DIE',
        detail:
          op.type === 'C'
            ? `${op.tx} commits & releases all Strict 2PL locks.${woken.length > 0 ? ` Woke: ${woken.join('; ')}.` : ''}`
            : `${op.tx} explicitly aborts & releases all locks.${woken.length > 0 ? ` Woke: ${woken.join('; ')}.` : ''}`,
        lockTable: snapshotLockTable(),
        wfgEdges,
        deadlockCycle: cycle,
        abortedTxs: Array.from(abortedSet).sort(),
        committedTxs: Array.from(committedSet).sort(),
        blockedTxs: Array.from(blockedSet).sort(),
      });
      continue;
    }

    const item = op.item!;
    const reqMode: LockMode = op.type === 'R' ? 'S' : 'X';
    const currentHeld = holders.get(item)!.get(op.tx);

    // Already holds sufficient lock
    if (currentHeld === 'X' || (currentHeld === 'S' && reqMode === 'S')) {
      const wfgEdges = computeWFG();
      const cycle = findCycleInWFG(wfgEdges);
      steps.push({
        stepNo: i + 1,
        op,
        txTs,
        outcome: 'GRANTED',
        detail: `${op.tx} already holds ${currentHeld}(${item}) — ${op.raw} executes immediately.`,
        lockTable: snapshotLockTable(),
        wfgEdges,
        deadlockCycle: cycle,
        abortedTxs: Array.from(abortedSet).sort(),
        committedTxs: Array.from(committedSet).sort(),
        blockedTxs: Array.from(blockedSet).sort(),
      });
      continue;
    }

    const conflicts = getConflictingHolders(item, op.tx, reqMode);

    if (conflicts.length === 0) {
      const wasUpgrade = currentHeld === 'S' && reqMode === 'X';
      holders.get(item)!.set(op.tx, reqMode);
      const wfgEdges = computeWFG();
      const cycle = findCycleInWFG(wfgEdges);
      steps.push({
        stepNo: i + 1,
        op,
        txTs,
        outcome: wasUpgrade ? 'UPGRADED' : 'GRANTED',
        detail: wasUpgrade
          ? `${op.tx} safely upgrades S(${item}) → X(${item}) (sole holder).`
          : `Grant ${reqMode}(${item}) to ${op.tx} (no incompatible holders).`,
        lockTable: snapshotLockTable(),
        wfgEdges,
        deadlockCycle: cycle,
        abortedTxs: Array.from(abortedSet).sort(),
        committedTxs: Array.from(committedSet).sort(),
        blockedTxs: Array.from(blockedSet).sort(),
      });
      continue;
    }

    // Conflict exists! Resolve according to active protocol
    if (protocol === 'strict_2pl_wfg') {
      waitQueue.get(item)!.push({ tx: op.tx, mode: reqMode });
      blockedSet.add(op.tx);
      const wfgEdges = computeWFG();
      const cycle = findCycleInWFG(wfgEdges);
      if (cycle) {
        anyDeadlock = true;
        lastCycle = cycle;
      }
      steps.push({
        stepNo: i + 1,
        op,
        txTs,
        outcome: cycle ? 'DEADLOCK' : 'BLOCKED',
        detail: cycle
          ? `DEADLOCK DETECTED! ${op.tx} blocks requesting ${reqMode}(${item}) held by ${conflicts.join(', ')} -> Wait-For Cycle: ${cycle.join(' → ')}.`
          : `${op.tx} BLOCKED requesting ${reqMode}(${item}) — conflicts with holder(s) ${conflicts.join(', ')}. Added WFG edge(s) ${conflicts.map((h) => `${op.tx}→${h}`).join(', ')}.`,
        lockTable: snapshotLockTable(),
        wfgEdges,
        deadlockCycle: cycle,
        abortedTxs: Array.from(abortedSet).sort(),
        committedTxs: Array.from(committedSet).sort(),
        blockedTxs: Array.from(blockedSet).sort(),
      });
      continue;
    }

    if (protocol === 'wait_die') {
      // Wait-Die (Non-Preemptive): Older waits (TS(Ti) < TS(Tj)), Younger dies (TS(Ti) > TS(Tj))
      const olderOrEqualHolders = conflicts.filter((h) => timestamps[h] < txTs);
      if (olderOrEqualHolders.length > 0) {
        abortedSet.add(op.tx);
        const woken = releaseAllLocks(op.tx);
        const wfgEdges = computeWFG();
        const cycle = findCycleInWFG(wfgEdges);
        steps.push({
          stepNo: i + 1,
          op,
          txTs,
          outcome: 'ABORTED_WAIT_DIE',
          detail: `Wait-Die: ${op.tx} (TS=${txTs}) is YOUNGER than holder ${olderOrEqualHolders.map((h) => `${h}(TS=${timestamps[h]})`).join(', ')} -> ${op.tx} DIES (aborts & releases locks).${woken.length > 0 ? ` Woke: ${woken.join('; ')}.` : ''}`,
          lockTable: snapshotLockTable(),
          wfgEdges,
          deadlockCycle: cycle,
          abortedTxs: Array.from(abortedSet).sort(),
          committedTxs: Array.from(committedSet).sort(),
          blockedTxs: Array.from(blockedSet).sort(),
        });
      } else {
        waitQueue.get(item)!.push({ tx: op.tx, mode: reqMode });
        blockedSet.add(op.tx);
        const wfgEdges = computeWFG();
        const cycle = findCycleInWFG(wfgEdges);
        steps.push({
          stepNo: i + 1,
          op,
          txTs,
          outcome: 'BLOCKED',
          detail: `Wait-Die: ${op.tx} (TS=${txTs}) is OLDER than holder ${conflicts.map((h) => `${h}(TS=${timestamps[h]})`).join(', ')} -> ${op.tx} WAITS for ${reqMode}(${item}).`,
          lockTable: snapshotLockTable(),
          wfgEdges,
          deadlockCycle: cycle,
          abortedTxs: Array.from(abortedSet).sort(),
          committedTxs: Array.from(committedSet).sort(),
          blockedTxs: Array.from(blockedSet).sort(),
        });
      }
      continue;
    }

    // protocol === 'wound_wait' (Preemptive):
    // Older wounds younger (TS(Ti) < TS(Tj) -> abort Tj), Younger waits (TS(Ti) > TS(Tj) -> Ti waits)
    const youngerConflicts = conflicts.filter((h) => txTs < timestamps[h]);
    const olderConflicts = conflicts.filter((h) => txTs >= timestamps[h]);

    if (youngerConflicts.length > 0) {
      const woundedNames: string[] = [];
      for (const y of youngerConflicts) {
        abortedSet.add(y);
        woundedEvents += 1;
        woundedNames.push(`${y}(TS=${timestamps[y]})`);
        releaseAllLocks(y);
      }

      if (olderConflicts.length === 0 && isCompatible(item, op.tx, reqMode)) {
        holders.get(item)!.set(op.tx, reqMode);
        const wfgEdges = computeWFG();
        const cycle = findCycleInWFG(wfgEdges);
        steps.push({
          stepNo: i + 1,
          op,
          txTs,
          outcome: 'WOUNDED_OTHER',
          detail: `Wound-Wait: Older ${op.tx} (TS=${txTs}) WOUNDS (aborts) younger ${woundedNames.join(', ')} and immediately acquires ${reqMode}(${item})!`,
          lockTable: snapshotLockTable(),
          wfgEdges,
          deadlockCycle: cycle,
          abortedTxs: Array.from(abortedSet).sort(),
          committedTxs: Array.from(committedSet).sort(),
          blockedTxs: Array.from(blockedSet).sort(),
        });
      } else {
        waitQueue.get(item)!.push({ tx: op.tx, mode: reqMode });
        blockedSet.add(op.tx);
        const wfgEdges = computeWFG();
        const cycle = findCycleInWFG(wfgEdges);
        steps.push({
          stepNo: i + 1,
          op,
          txTs,
          outcome: 'WOUNDED_OTHER',
          detail: `Wound-Wait: ${op.tx} (TS=${txTs}) wounded ${woundedNames.join(', ')}, and waits for older holder(s) ${olderConflicts.join(', ')}.`,
          lockTable: snapshotLockTable(),
          wfgEdges,
          deadlockCycle: cycle,
          abortedTxs: Array.from(abortedSet).sort(),
          committedTxs: Array.from(committedSet).sort(),
          blockedTxs: Array.from(blockedSet).sort(),
        });
      }
    } else {
      waitQueue.get(item)!.push({ tx: op.tx, mode: reqMode });
      blockedSet.add(op.tx);
      const wfgEdges = computeWFG();
      const cycle = findCycleInWFG(wfgEdges);
      steps.push({
        stepNo: i + 1,
        op,
        txTs,
        outcome: 'BLOCKED',
        detail: `Wound-Wait: Younger ${op.tx} (TS=${txTs}) WAITS for older holder ${olderConflicts.map((h) => `${h}(TS=${timestamps[h]})`).join(', ')} on ${reqMode}(${item}).`,
        lockTable: snapshotLockTable(),
        wfgEdges,
        deadlockCycle: cycle,
        abortedTxs: Array.from(abortedSet).sort(),
        committedTxs: Array.from(committedSet).sort(),
        blockedTxs: Array.from(blockedSet).sort(),
      });
    }
  }

  return {
    protocol,
    transactions,
    timestamps,
    steps,
    deadlockDetected: anyDeadlock,
    deadlockCycle: lastCycle,
    abortedTxs: Array.from(abortedSet).sort(),
    committedTxs: Array.from(committedSet).sort(),
    woundedEvents,
  };
}

// ============================================================================
// Multiple Granularity Locking (IS, IX, S, SIX, X) Compatibility & Hierarchy
// ============================================================================

export type GranularityMode = 'IS' | 'IX' | 'S' | 'SIX' | 'X';

export const GRANULARITY_MODES: GranularityMode[] = ['IS', 'IX', 'S', 'SIX', 'X'];

export const GRANULARITY_COMPATIBILITY: Record<GranularityMode, Record<GranularityMode, boolean>> = {
  IS: { IS: true, IX: true, S: true, SIX: true, X: false },
  IX: { IS: true, IX: true, S: false, SIX: false, X: false },
  S: { IS: true, IX: false, S: true, SIX: false, X: false },
  SIX: { IS: true, IX: false, S: false, SIX: false, X: false },
  X: { IS: false, IX: false, S: false, SIX: false, X: false },
};

export const GRANULARITY_MODE_INFO: Record<
  GranularityMode,
  { name: string; meaning: string; requiredAncestorModes: GranularityMode[] }
> = {
  IS: {
    name: 'Intention Shared',
    meaning: 'Explicit S lock(s) will be requested at a finer descendant level.',
    requiredAncestorModes: ['IS', 'IX'],
  },
  IX: {
    name: 'Intention Exclusive',
    meaning: 'Explicit X (or S) lock(s) will be requested at a finer descendant level.',
    requiredAncestorModes: ['IX', 'SIX'],
  },
  S: {
    name: 'Shared',
    meaning: 'Shared read lock on this node and its entire subtree.',
    requiredAncestorModes: ['IS', 'IX'],
  },
  SIX: {
    name: 'Shared + Intention Exclusive',
    meaning: 'S lock on entire subtree + explicit X locks on selected descendant nodes (e.g., scan table, update few rows).',
    requiredAncestorModes: ['IX', 'SIX'],
  },
  X: {
    name: 'Exclusive',
    meaning: 'Exclusive read/write lock on this node and its entire subtree.',
    requiredAncestorModes: ['IX', 'SIX'],
  },
};

export function checkGranularityCompatibility(
  held: GranularityMode,
  requested: GranularityMode
): { compatible: boolean; explanation: string } {
  const compatible = GRANULARITY_COMPATIBILITY[held][requested];
  if (compatible) {
    if (held === 'SIX' && requested === 'IS') {
      return {
        compatible: true,
        explanation:
          'COMPATIBLE: T1 reads the whole subtree (S) and intends to update specific children (IX); T2 only intends to read specific children (IS). Conflicts are resolved down at the record level.',
      };
    }
    if (held === 'IX' && requested === 'IX') {
      return {
        compatible: true,
        explanation:
          'COMPATIBLE: Both transactions intend to write different records inside this container — finer-level X locks enforce exclusion on individual records.',
      };
    }
    return {
      compatible: true,
      explanation: `COMPATIBLE: ${held} (${GRANULARITY_MODE_INFO[held].name}) and ${requested} (${GRANULARITY_MODE_INFO[requested].name}) can coexist on the same node.`,
    };
  }
  return {
    compatible: false,
    explanation: `CONFLICT (BLOCK): ${requested} (${GRANULARITY_MODE_INFO[requested].name}) cannot be granted while another transaction holds ${held} (${GRANULARITY_MODE_INFO[held].name}) on the same node.`,
  };
}

export type GranularityLevel = 'Database' | 'Table (STUDENT)' | 'Page (P1)' | 'Record (R1)';

export function getRequiredIntentionChain(
  targetLevel: GranularityLevel,
  targetMode: GranularityMode
): Array<{ level: GranularityLevel; requiredLock: string }> {
  const levels: GranularityLevel[] = ['Database', 'Table (STUDENT)', 'Page (P1)', 'Record (R1)'];
  const idx = levels.indexOf(targetLevel);
  const ancestorRule = GRANULARITY_MODE_INFO[targetMode].requiredAncestorModes.join(' or ');

  return levels.slice(0, idx + 1).map((lvl, i) => ({
    level: lvl,
    requiredLock: i === idx ? `${targetMode} (Target Lock)` : `${ancestorRule} (Intention Lock)`,
  }));
}
