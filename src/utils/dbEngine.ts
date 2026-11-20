export interface FunctionalDependency {
  lhs: string[];
  rhs: string[];
  raw: string;
}

export interface ClosureStep {
  fd: string;
  added: string[];
  resultAfter: string[];
}

export interface NormalFormViolation {
  normalForm: '2NF' | '3NF' | 'BCNF';
  fd: string;
  reason: string;
}

export interface NormalizationAnalysis {
  attributes: string[];
  fds: FunctionalDependency[];
  candidateKeys: string[][];
  primeAttributes: string[];
  nonPrimeAttributes: string[];
  highestNormalForm: 'BCNF' | '3NF' | '2NF' | '1NF';
  violations: NormalFormViolation[];
  minimalCover: FunctionalDependency[];
}

export function formatAttrList(attrs: string[]): string {
  if (attrs.length === 0) return '';
  return attrs.every((a) => a.length === 1) ? attrs.join('') : attrs.join(', ');
}

export function parseAttributes(input: string): string[] {
  const parts = input
    .split(/[\s,]+/)
    .map((s) => s.trim().toUpperCase())
    .filter((s) => /^[A-Z][A-Z0-9_]*$/.test(s));
  return Array.from(new Set(parts));
}

function splitAttrToken(token: string, knownAttrs: string[]): string[] {
  const trimmed = token.trim().toUpperCase();
  if (!trimmed) return [];
  if (trimmed.includes(' ') || trimmed.includes(',')) {
    return trimmed
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (knownAttrs.includes(trimmed)) {
    return [trimmed];
  }
  // If single-letter attributes like "AB" are written compactly, split into characters
  if (/^[A-Z]+$/.test(trimmed) && trimmed.split('').every((ch) => knownAttrs.length === 0 || knownAttrs.includes(ch))) {
    return trimmed.split('');
  }
  return [trimmed];
}

export function parseFDs(input: string, knownAttrs: string[] = []): { fds: FunctionalDependency[]; error?: string } {
  const statements = input
    .split(/[;\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (statements.length === 0) {
    return { fds: [], error: 'Enter at least one functional dependency (e.g., A -> B).' };
  }

  const fds: FunctionalDependency[] = [];
  for (const stmt of statements) {
    const match = stmt.match(/^(.+?)\s*(?:->|→)\s*(.+)$/);
    if (!match) {
      return { fds: [], error: `Invalid FD syntax "${stmt}". Use "LHS -> RHS" format.` };
    }
    const lhs = Array.from(new Set(splitAttrToken(match[1], knownAttrs)));
    const rhs = Array.from(new Set(splitAttrToken(match[2], knownAttrs)));
    if (lhs.length === 0 || rhs.length === 0) {
      return { fds: [], error: `Empty attribute side in "${stmt}".` };
    }
    if (knownAttrs.length > 0) {
      const unknown = [...lhs, ...rhs].filter((a) => !knownAttrs.includes(a));
      if (unknown.length > 0) {
        return { fds: [], error: `Unknown attribute(s) ${unknown.join(', ')} in "${stmt}".` };
      }
    }
    fds.push({ lhs, rhs, raw: `${formatAttrList(lhs)} -> ${formatAttrList(rhs)}` });
  }

  return { fds };
}

export function computeClosure(
  target: string[],
  fds: FunctionalDependency[]
): { closure: string[]; steps: ClosureStep[] } {
  const result = new Set(target.map((a) => a.toUpperCase()));
  const steps: ClosureStep[] = [];
  let changed = true;

  while (changed) {
    changed = false;
    for (const fd of fds) {
      if (fd.lhs.every((a) => result.has(a))) {
        const added: string[] = [];
        for (const r of fd.rhs) {
          if (!result.has(r)) {
            result.add(r);
            added.push(r);
            changed = true;
          }
        }
        if (added.length > 0) {
          steps.push({
            fd: fd.raw,
            added,
            resultAfter: Array.from(result).sort(),
          });
        }
      }
    }
  }

  return { closure: Array.from(result).sort(), steps };
}

function isSuperkey(subset: string[], allAttrs: string[], fds: FunctionalDependency[]): boolean {
  const { closure } = computeClosure(subset, fds);
  return allAttrs.every((a) => closure.includes(a));
}

export function findCandidateKeys(allAttrs: string[], fds: FunctionalDependency[]): string[][] {
  if (allAttrs.length === 0) return [];
  // Attributes that never appear on any RHS must be in every candidate key
  const rhsAttrs = new Set(fds.flatMap((fd) => fd.rhs));
  const lhsAttrs = new Set(fds.flatMap((fd) => fd.lhs));
  const core = allAttrs.filter((a) => !rhsAttrs.has(a));
  const optional = allAttrs.filter((a) => rhsAttrs.has(a) && lhsAttrs.has(a));

  if (isSuperkey(core, allAttrs, fds)) {
    return [core.sort()];
  }

  // BFS by subset size starting from core + combinations of optional attributes (cap at 12 attrs for safety)
  const candidates: string[][] = [];
  const maxExtras = Math.min(optional.length, 10);

  for (let size = 1; size <= maxExtras; size++) {
    const combos = generateCombinations(optional.slice(0, maxExtras), size);
    for (const combo of combos) {
      const candidate = [...core, ...combo].sort();
      // Minimality check: no already-found candidate key is a subset
      const hasSmallerKey = candidates.some((ck) => ck.every((attr) => candidate.includes(attr)));
      if (!hasSmallerKey && isSuperkey(candidate, allAttrs, fds)) {
        candidates.push(candidate);
      }
    }
  }

  // Fallback if attributes weren't covered by optional-only expansion
  if (candidates.length === 0) {
    const remaining = allAttrs.filter((a) => !core.includes(a));
    for (let size = 1; size <= remaining.length; size++) {
      const combos = generateCombinations(remaining, size);
      for (const combo of combos) {
        const candidate = [...core, ...combo].sort();
        const hasSmallerKey = candidates.some((ck) => ck.every((attr) => candidate.includes(attr)));
        if (!hasSmallerKey && isSuperkey(candidate, allAttrs, fds)) {
          candidates.push(candidate);
        }
      }
      if (candidates.length > 0) break;
    }
  }

  return candidates.length > 0 ? candidates : [allAttrs.slice().sort()];
}

function generateCombinations<T>(items: T[], k: number): T[][] {
  const result: T[][] = [];
  function backtrack(start: number, current: T[]) {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < items.length; i++) {
      current.push(items[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }
  backtrack(0, []);
  return result;
}

export function computeMinimalCover(fds: FunctionalDependency[]): FunctionalDependency[] {
  // Step 1: Split RHS into singleton attributes
  let working: FunctionalDependency[] = [];
  for (const fd of fds) {
    for (const r of fd.rhs) {
      if (!fd.lhs.includes(r)) {
        working.push({
          lhs: [...fd.lhs].sort(),
          rhs: [r],
          raw: `${formatAttrList([...fd.lhs].sort())} -> ${r}`,
        });
      }
    }
  }

  // Step 2: Eliminate extraneous attributes on LHS
  working = working.map((fd) => {
    let currentLhs = [...fd.lhs];
    if (currentLhs.length > 1) {
      for (const attr of [...currentLhs]) {
        if (currentLhs.length === 1) break;
        const reduced = currentLhs.filter((a) => a !== attr);
        const { closure } = computeClosure(reduced, working);
        if (closure.includes(fd.rhs[0])) {
          currentLhs = reduced;
        }
      }
    }
    return {
      lhs: currentLhs,
      rhs: fd.rhs,
      raw: `${formatAttrList(currentLhs)} -> ${fd.rhs[0]}`,
    };
  });

  // Deduplicate before Step 3
  const seen = new Set<string>();
  working = working.filter((fd) => {
    if (seen.has(fd.raw)) return false;
    seen.add(fd.raw);
    return true;
  });

  // Step 3: Remove redundant FDs
  const finalFds: FunctionalDependency[] = [];
  for (let i = 0; i < working.length; i++) {
    const candidate = working[i];
    const withoutCandidate = working.filter((_, idx) => idx !== i);
    const { closure } = computeClosure(candidate.lhs, withoutCandidate);
    if (!closure.includes(candidate.rhs[0])) {
      finalFds.push(candidate);
    } else {
      // Remove from working by replacing with a no-op marker? Better: splice cleanly via index loop
    }
  }

  // Exact iterative removal to avoid mutual redundancy bug
  let minimal = [...working];
  let idx = 0;
  while (idx < minimal.length) {
    const without = minimal.filter((_, j) => j !== idx);
    const { closure } = computeClosure(minimal[idx].lhs, without);
    if (closure.includes(minimal[idx].rhs[0])) {
      minimal = without;
    } else {
      idx++;
    }
  }

  return minimal;
}

export function analyzeNormalForms(
  allAttrs: string[],
  fds: FunctionalDependency[]
): NormalizationAnalysis {
  const candidateKeys = findCandidateKeys(allAttrs, fds);
  const primeSet = new Set(candidateKeys.flat());
  const primeAttributes = allAttrs.filter((a) => primeSet.has(a)).sort();
  const nonPrimeAttributes = allAttrs.filter((a) => !primeSet.has(a)).sort();
  const violations: NormalFormViolation[] = [];

  let fails2NF = false;
  let fails3NF = false;
  let failsBCNF = false;

  for (const fd of fds) {
    const nonTrivialRhs = fd.rhs.filter((r) => !fd.lhs.includes(r));
    if (nonTrivialRhs.length === 0) continue;

    const lhsIsSuperkey = isSuperkey(fd.lhs, allAttrs, fds);

    if (!lhsIsSuperkey) {
      failsBCNF = true;
      violations.push({
        normalForm: 'BCNF',
        fd: fd.raw,
        reason: `LHS (${formatAttrList(fd.lhs)}) is not a superkey.`,
      });

      const nonPrimeRhs = nonTrivialRhs.filter((r) => !primeSet.has(r));
      if (nonPrimeRhs.length > 0) {
        fails3NF = true;
        // Check 2NF: is LHS a proper subset of any candidate key?
        const isProperSubsetOfCK = candidateKeys.some(
          (ck) => fd.lhs.length < ck.length && fd.lhs.every((a) => ck.includes(a))
        );
        if (isProperSubsetOfCK) {
          fails2NF = true;
          violations.push({
            normalForm: '2NF',
            fd: fd.raw,
            reason: `Partial dependency: non-prime attribute(s) ${nonPrimeRhs.join(', ')} depend on proper subset (${formatAttrList(fd.lhs)}) of a candidate key.`,
          });
        } else {
          violations.push({
            normalForm: '3NF',
            fd: fd.raw,
            reason: `Transitive/non-key dependency: LHS (${formatAttrList(fd.lhs)}) is not a superkey and RHS (${nonPrimeRhs.join(', ')}) is non-prime.`,
          });
        }
      }
    }
  }

  const highestNormalForm: NormalizationAnalysis['highestNormalForm'] = fails2NF
    ? '1NF'
    : fails3NF
    ? '2NF'
    : failsBCNF
    ? '3NF'
    : 'BCNF';

  return {
    attributes: allAttrs,
    fds,
    candidateKeys,
    primeAttributes,
    nonPrimeAttributes,
    highestNormalForm,
    violations,
    minimalCover: computeMinimalCover(fds),
  };
}

// ============================================================================
// Module 4: Conflict Serializability & Precedence Graph Analyzer
// ============================================================================

export type ScheduleOpType = 'R' | 'W' | 'C' | 'A';

export interface ScheduleOp {
  index: number;
  type: ScheduleOpType;
  tx: string;
  item?: string;
  raw: string;
}

export interface ConflictEdge {
  from: string;
  to: string;
  item: string;
  conflictType: 'RW' | 'WR' | 'WW';
  fromStep: number;
  toStep: number;
}

export interface ScheduleAnalysis {
  ops: ScheduleOp[];
  transactions: string[];
  conflicts: ConflictEdge[];
  uniqueEdges: Array<{ from: string; to: string; labels: string[] }>;
  isConflictSerializable: boolean;
  cycle: string[] | null;
  serialOrder: string[] | null;
  isRecoverable: boolean;
  isCascadeless: boolean;
  isStrict: boolean;
  recoverabilityNote: string;
}

export function parseSchedule(input: string): { ops: ScheduleOp[]; error?: string } {
  const tokens = input
    .trim()
    .split(/[\s,;]+/)
    .filter(Boolean);

  if (tokens.length === 0) {
    return { ops: [], error: 'Enter schedule operations (e.g., R1(X) W2(X) C1 C2).' };
  }

  const ops: ScheduleOp[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].toUpperCase();
    const rwMatch = token.match(/^([RW])(\d+)\(([A-Z0-9_]+)\)$/);
    if (rwMatch) {
      ops.push({
        index: i + 1,
        type: rwMatch[1] as 'R' | 'W',
        tx: `T${rwMatch[2]}`,
        item: rwMatch[3],
        raw: `${rwMatch[1]}${rwMatch[2]}(${rwMatch[3]})`,
      });
      continue;
    }

    const ctrlMatch = token.match(/^([CA])(\d+)$/);
    if (ctrlMatch) {
      ops.push({
        index: i + 1,
        type: ctrlMatch[1] as 'C' | 'A',
        tx: `T${ctrlMatch[2]}`,
        raw: `${ctrlMatch[1]}${ctrlMatch[2]}`,
      });
      continue;
    }

    return {
      ops: [],
      error: `Invalid operation "${tokens[i]}". Use R1(X), W2(X), C1, or A1.`,
    };
  }

  return { ops };
}

export function analyzeSchedule(ops: ScheduleOp[]): ScheduleAnalysis {
  const transactions = Array.from(new Set(ops.map((o) => o.tx))).sort((a, b) => {
    const na = parseInt(a.slice(1), 10);
    const nb = parseInt(b.slice(1), 10);
    return na - nb;
  });

  const conflicts: ConflictEdge[] = [];
  const edgeMap = new Map<string, Set<string>>();

  for (let i = 0; i < ops.length; i++) {
    const a = ops[i];
    if ((a.type !== 'R' && a.type !== 'W') || !a.item) continue;

    for (let j = i + 1; j < ops.length; j++) {
      const b = ops[j];
      if ((b.type !== 'R' && b.type !== 'W') || !b.item) continue;
      if (a.tx === b.tx || a.item !== b.item) continue;
      if (a.type === 'R' && b.type === 'R') continue;

      const conflictType = `${a.type}${b.type}` as 'RW' | 'WR' | 'WW';
      conflicts.push({
        from: a.tx,
        to: b.tx,
        item: a.item,
        conflictType,
        fromStep: a.index,
        toStep: b.index,
      });

      const key = `${a.tx}->${b.tx}`;
      if (!edgeMap.has(key)) edgeMap.set(key, new Set());
      edgeMap.get(key)!.add(`${conflictType}(${a.item})`);
    }
  }

  const adj = new Map<string, string[]>();
  for (const tx of transactions) adj.set(tx, []);
  const uniqueEdges: Array<{ from: string; to: string; labels: string[] }> = [];

  for (const [key, labels] of edgeMap.entries()) {
    const [from, to] = key.split('->');
    adj.get(from)!.push(to);
    uniqueEdges.push({ from, to, labels: Array.from(labels) });
  }

  // Cycle detection via DFS + topological sort via Kahn's algorithm
  const cycle = detectDirectedCycle(transactions, adj);
  const serialOrder = cycle ? null : topologicalSort(transactions, adj);

  // Recoverability, Cascadeless, Strict checks (tracking both C_i commits and A_i aborts)
  const commitIdx = new Map<string, number>();
  const abortIdx = new Map<string, number>();
  const termIdx = new Map<string, { index: number; type: 'C' | 'A' }>();
  for (const op of ops) {
    if (op.type === 'C') {
      commitIdx.set(op.tx, op.index);
      termIdx.set(op.tx, { index: op.index, type: 'C' });
    } else if (op.type === 'A') {
      abortIdx.set(op.tx, op.index);
      termIdx.set(op.tx, { index: op.index, type: 'A' });
    }
  }

  let isRecoverable = true;
  let isCascadeless = true;
  let isStrict = true;
  const notes: string[] = [];

  for (let i = 0; i < ops.length; i++) {
    const w = ops[i];
    if (w.type !== 'W' || !w.item) continue;
    const wCommit = commitIdx.get(w.tx);
    const wTerm = termIdx.get(w.tx);

    for (let j = i + 1; j < ops.length; j++) {
      const next = ops[j];
      if (next.tx === w.tx || next.item !== w.item) continue;

      // Writer already committed or aborted & rolled back BEFORE next access -> safe
      const terminatedBeforeNext = wTerm !== undefined && wTerm.index < next.index;

      // Dirty read check (WR)
      if (next.type === 'R' && !terminatedBeforeNext) {
        const readerCommit = commitIdx.get(next.tx);
        isCascadeless = false;
        isStrict = false;
        if (readerCommit !== undefined && (wCommit === undefined || readerCommit < wCommit)) {
          isRecoverable = false;
          if (wTerm?.type === 'A') {
            notes.push(`${next.tx} reads uncommitted ${w.item} written by ${w.tx} and commits even though ${w.tx} aborts.`);
          } else {
            notes.push(`${next.tx} reads ${w.item} written by ${w.tx} and commits before ${w.tx} commits.`);
          }
        } else if (notes.length === 0) {
          notes.push(`${next.tx} reads uncommitted ${w.item} from ${w.tx} (dirty read; violates cascadeless).`);
        }
      }

      // Dirty write check (WW)
      if (next.type === 'W' && !terminatedBeforeNext) {
        isStrict = false;
        if (notes.length === 0) {
          notes.push(`${next.tx} overwrites uncommitted ${w.item} from ${w.tx} (violates strictness).`);
        }
      }
    }
  }

  const hasExplicitBoundaries = termIdx.size > 0;
  let recoverabilityNote = '';
  if (!hasExplicitBoundaries) {
    recoverabilityNote = 'No explicit C_i/A_i boundaries supplied; add C1, C2 (or A1) to test Recoverable / Cascadeless / Strict rules.';
  } else if (notes.length > 0) {
    recoverabilityNote = notes[0];
  } else {
    recoverabilityNote = 'All reads and overwrites occur only after writer commits or aborts (Strict, Cascadeless & Recoverable).';
  }

  return {
    ops,
    transactions,
    conflicts,
    uniqueEdges,
    isConflictSerializable: cycle === null,
    cycle,
    serialOrder,
    isRecoverable,
    isCascadeless,
    isStrict,
    recoverabilityNote,
  };
}

function detectDirectedCycle(nodes: string[], adj: Map<string, string[]>): string[] | null {
  const state = new Map<string, 0 | 1 | 2>(); // 0 unvisited, 1 visiting, 2 done
  for (const n of nodes) state.set(n, 0);
  const stack: string[] = [];

  function dfs(u: string): string[] | null {
    state.set(u, 1);
    stack.push(u);
    for (const v of adj.get(u) ?? []) {
      const st = state.get(v) ?? 0;
      if (st === 1) {
        const idx = stack.indexOf(v);
        return [...stack.slice(idx), v];
      }
      if (st === 0) {
        const found = dfs(v);
        if (found) return found;
      }
    }
    stack.pop();
    state.set(u, 2);
    return null;
  }

  for (const n of nodes) {
    if (state.get(n) === 0) {
      const cycle = dfs(n);
      if (cycle) return cycle;
    }
  }
  return null;
}

function topologicalSort(nodes: string[], adj: Map<string, string[]>): string[] {
  const inDegree = new Map<string, number>();
  for (const n of nodes) inDegree.set(n, 0);
  for (const n of nodes) {
    for (const v of adj.get(n) ?? []) {
      inDegree.set(v, (inDegree.get(v) ?? 0) + 1);
    }
  }

  const queue = nodes.filter((n) => inDegree.get(n) === 0);
  const order: string[] = [];

  while (queue.length > 0) {
    queue.sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10));
    const u = queue.shift()!;
    order.push(u);
    for (const v of adj.get(u) ?? []) {
      const nextDeg = (inDegree.get(v) ?? 1) - 1;
      inDegree.set(v, nextDeg);
      if (nextDeg === 0) queue.push(v);
    }
  }

  return order;
}

// ============================================================================
// Module 3: B+ Tree Builder & Search Tracer
// ============================================================================

export interface BPlusNode {
  id: string;
  isLeaf: boolean;
  keys: number[];
  children: BPlusNode[];
  nextLeafId?: string;
}

export interface BPlusSearchStep {
  nodeId: string;
  isLeaf: boolean;
  keysChecked: number[];
  decision: string;
}

export function buildBPlusTree(rawKeys: number[], order: number): BPlusNode {
  const keys = Array.from(new Set(rawKeys.filter((k) => Number.isFinite(k))));
  const maxKeys = Math.max(2, order - 1);

  let root: BPlusNode = { id: 'N0', isLeaf: true, keys: [], children: [] };
  let nodeCounter = 1;

  function insertIntoNode(node: BPlusNode, key: number): { promotedKey: number; rightNode: BPlusNode } | null {
    if (node.isLeaf) {
      if (!node.keys.includes(key)) {
        node.keys.push(key);
        node.keys.sort((a, b) => a - b);
      }
      if (node.keys.length <= maxKeys) return null;

      // Leaf split: right leaf keeps middle key (>=) so [a, b, c] splits into [a] and [b, c] (order 3)
      const splitIdx = Math.floor(node.keys.length / 2);
      const rightKeys = node.keys.slice(splitIdx);
      node.keys = node.keys.slice(0, splitIdx);
      const rightNode: BPlusNode = {
        id: `N${nodeCounter++}`,
        isLeaf: true,
        keys: rightKeys,
        children: [],
        nextLeafId: node.nextLeafId,
      };
      node.nextLeafId = rightNode.id;
      return { promotedKey: rightKeys[0], rightNode };
    }

    // Internal node: find child branch
    let childIdx = 0;
    while (childIdx < node.keys.length && key >= node.keys[childIdx]) {
      childIdx++;
    }
    const splitResult = insertIntoNode(node.children[childIdx], key);
    if (!splitResult) return null;

    node.keys.splice(childIdx, 0, splitResult.promotedKey);
    node.children.splice(childIdx + 1, 0, splitResult.rightNode);

    if (node.keys.length <= maxKeys) return null;

    // Internal split: middle key moves UP (not duplicated)
    const midIdx = Math.floor(node.keys.length / 2);
    const promotedKey = node.keys[midIdx];
    const rightKeys = node.keys.slice(midIdx + 1);
    const rightChildren = node.children.slice(midIdx + 1);
    node.keys = node.keys.slice(0, midIdx);
    node.children = node.children.slice(0, midIdx + 1);

    const rightNode: BPlusNode = {
      id: `N${nodeCounter++}`,
      isLeaf: false,
      keys: rightKeys,
      children: rightChildren,
    };
    return { promotedKey, rightNode };
  }

  for (const key of keys) {
    const split = insertIntoNode(root, key);
    if (split) {
      root = {
        id: `N${nodeCounter++}`,
        isLeaf: false,
        keys: [split.promotedKey],
        children: [root, split.rightNode],
      };
    }
  }

  return root;
}

export type BPlusOp = {
  type: 'insert' | 'delete';
  key: number;
};

export interface BPlusStepTrace {
  stepIndex: number;
  op: BPlusOp;
  actionSummary: string;
  events: string[];
  tree: BPlusNode;
  leafCount: number;
  height: number;
}

function cloneBPlusNode(node: BPlusNode): BPlusNode {
  return {
    id: node.id,
    isLeaf: node.isLeaf,
    keys: [...node.keys],
    children: node.children.map(cloneBPlusNode),
    nextLeafId: node.nextLeafId,
  };
}

function collectLeaves(node: BPlusNode, out: BPlusNode[] = []): BPlusNode[] {
  if (node.isLeaf) {
    out.push(node);
    return out;
  }
  for (const ch of node.children) {
    collectLeaves(ch, out);
  }
  return out;
}

function relinkLeaves(root: BPlusNode): BPlusNode[] {
  const leaves = collectLeaves(root);
  for (let i = 0; i < leaves.length; i++) {
    leaves[i].nextLeafId = leaves[i + 1]?.id;
  }
  return leaves;
}

function getTreeHeight(node: BPlusNode): number {
  let h = 1;
  let cur: BPlusNode | undefined = node;
  while (cur && !cur.isLeaf && cur.children.length > 0) {
    h += 1;
    cur = cur.children[0];
  }
  return h;
}

function minKeyInSubtree(node: BPlusNode): number | undefined {
  let cur: BPlusNode | undefined = node;
  while (cur && !cur.isLeaf) {
    cur = cur.children[0];
  }
  return cur?.keys[0];
}

function containsKeyInTree(node: BPlusNode, key: number): boolean {
  let cur: BPlusNode | undefined = node;
  while (cur && !cur.isLeaf) {
    let idx = 0;
    while (idx < cur.keys.length && key >= cur.keys[idx]) idx++;
    cur = cur.children[idx];
  }
  return Boolean(cur?.keys.includes(key));
}

export function simulateBPlusOperations(
  rawOps: BPlusOp[],
  order: number
): { finalTree: BPlusNode; steps: BPlusStepTrace[] } {
  const safeOrder = Math.max(3, Math.floor(order));
  const maxKeys = safeOrder - 1;
  const minLeafKeys = Math.ceil((safeOrder - 1) / 2);
  const minInternalKeys = Math.ceil(safeOrder / 2) - 1;

  let root: BPlusNode = { id: 'N0', isLeaf: true, keys: [], children: [] };
  let nodeCounter = 1;
  const steps: BPlusStepTrace[] = [];

  for (let stepIdx = 0; stepIdx < rawOps.length; stepIdx++) {
    const op = rawOps[stepIdx];
    const events: string[] = [];

    if (!Number.isFinite(op.key)) continue;

    if (op.type === 'insert') {
      if (containsKeyInTree(root, op.key)) {
        events.push(`Key ${op.key} already exists in tree — no change.`);
      } else {
        const insertRec = (
          node: BPlusNode,
          key: number
        ): { promotedKey: number; rightNode: BPlusNode } | null => {
          if (node.isLeaf) {
            node.keys.push(key);
            node.keys.sort((a, b) => a - b);
            if (node.keys.length <= maxKeys) {
              events.push(`Inserted ${key} into leaf ${node.id} -> [${node.keys.join(', ')}].`);
              return null;
            }
            const splitIdx = Math.floor(node.keys.length / 2);
            const rightKeys = node.keys.slice(splitIdx);
            node.keys = node.keys.slice(0, splitIdx);
            const rightNode: BPlusNode = {
              id: `N${nodeCounter++}`,
              isLeaf: true,
              keys: rightKeys,
              children: [],
            };
            events.push(
              `Leaf ${node.id} overflowed -> split into [${node.keys.join(', ')}] & [${rightKeys.join(', ')}], copy ${rightKeys[0]} up.`
            );
            return { promotedKey: rightKeys[0], rightNode };
          }

          let childIdx = 0;
          while (childIdx < node.keys.length && key >= node.keys[childIdx]) {
            childIdx++;
          }
          const splitResult = insertRec(node.children[childIdx], key);
          if (!splitResult) return null;

          node.keys.splice(childIdx, 0, splitResult.promotedKey);
          node.children.splice(childIdx + 1, 0, splitResult.rightNode);

          if (node.keys.length <= maxKeys) {
            return null;
          }

          const midIdx = Math.floor(node.keys.length / 2);
          const promotedKey = node.keys[midIdx];
          const rightKeys = node.keys.slice(midIdx + 1);
          const rightChildren = node.children.slice(midIdx + 1);
          node.keys = node.keys.slice(0, midIdx);
          node.children = node.children.slice(0, midIdx + 1);

          const rightNode: BPlusNode = {
            id: `N${nodeCounter++}`,
            isLeaf: false,
            keys: rightKeys,
            children: rightChildren,
          };
          events.push(
            `Internal node ${node.id} overflowed -> push ${promotedKey} up leaving [${node.keys.join(', ')}] & [${rightKeys.join(', ')}].`
          );
          return { promotedKey, rightNode };
        };

        const rootSplit = insertRec(root, op.key);
        if (rootSplit) {
          root = {
            id: `N${nodeCounter++}`,
            isLeaf: false,
            keys: [rootSplit.promotedKey],
            children: [root, rootSplit.rightNode],
          };
          events.push(`New Root ${root.id} created with key [${rootSplit.promotedKey}] (height increased).`);
        }
      }
    } else {
      // DELETE operation
      if (!containsKeyInTree(root, op.key)) {
        events.push(`Key ${op.key} not present in tree — no deletion performed.`);
      } else {
        const deleteRec = (node: BPlusNode, key: number): void => {
          if (node.isLeaf) {
            const pos = node.keys.indexOf(key);
            if (pos !== -1) {
              node.keys.splice(pos, 1);
              events.push(`Removed ${key} from leaf ${node.id} -> [${node.keys.join(', ')}].`);
            }
            return;
          }

          let childIdx = 0;
          while (childIdx < node.keys.length && key >= node.keys[childIdx]) {
            childIdx++;
          }
          const child = node.children[childIdx];
          deleteRec(child, key);

          // Handle child underflow
          if (child.isLeaf && child.keys.length < minLeafKeys) {
            const rightSibling = node.children[childIdx + 1];
            const leftSibling = node.children[childIdx - 1];

            if (rightSibling && rightSibling.keys.length > minLeafKeys) {
              const borrowed = rightSibling.keys.shift()!;
              child.keys.push(borrowed);
              node.keys[childIdx] = rightSibling.keys[0];
              if (childIdx > 0 && child.keys.length > 0) {
                node.keys[childIdx - 1] = child.keys[0];
              }
              events.push(
                `Leaf ${child.id} underflowed (< ${minLeafKeys}) -> borrowed ${borrowed} from right sibling ${rightSibling.id}; parent separators updated.`
              );
            } else if (leftSibling && leftSibling.keys.length > minLeafKeys) {
              const borrowed = leftSibling.keys.pop()!;
              child.keys.unshift(borrowed);
              node.keys[childIdx - 1] = child.keys[0];
              events.push(
                `Leaf ${child.id} underflowed (< ${minLeafKeys}) -> borrowed ${borrowed} from left sibling ${leftSibling.id}; parent separator updated.`
              );
            } else if (leftSibling) {
              const droppedSep = node.keys[childIdx - 1];
              leftSibling.keys.push(...child.keys);
              node.keys.splice(childIdx - 1, 1);
              node.children.splice(childIdx, 1);
              events.push(
                `Leaf ${child.id} merged into left sibling ${leftSibling.id} -> [${leftSibling.keys.join(', ')}] (dropped separator ${droppedSep}).`
              );
            } else if (rightSibling) {
              const droppedSep = node.keys[childIdx];
              child.keys.push(...rightSibling.keys);
              node.keys.splice(childIdx, 1);
              node.children.splice(childIdx + 1, 1);
              events.push(
                `Leaf ${child.id} merged with right sibling ${rightSibling.id} -> [${child.keys.join(', ')}] (dropped separator ${droppedSep}).`
              );
            }
          } else if (!child.isLeaf && child.keys.length < minInternalKeys) {
            const rightSibling = node.children[childIdx + 1];
            const leftSibling = node.children[childIdx - 1];

            if (rightSibling && rightSibling.keys.length > minInternalKeys) {
              const pullDown = node.keys[childIdx];
              const pushUp = rightSibling.keys.shift()!;
              const movedChild = rightSibling.children.shift()!;
              child.keys.push(pullDown);
              child.children.push(movedChild);
              node.keys[childIdx] = pushUp;
              events.push(
                `Internal ${child.id} underflowed -> borrowed from right sibling ${rightSibling.id} (pulled ${pullDown}, pushed ${pushUp}).`
              );
            } else if (leftSibling && leftSibling.keys.length > minInternalKeys) {
              const pullDown = node.keys[childIdx - 1];
              const pushUp = leftSibling.keys.pop()!;
              const movedChild = leftSibling.children.pop()!;
              child.keys.unshift(pullDown);
              child.children.unshift(movedChild);
              node.keys[childIdx - 1] = pushUp;
              events.push(
                `Internal ${child.id} underflowed -> borrowed from left sibling ${leftSibling.id} (pulled ${pullDown}, pushed ${pushUp}).`
              );
            } else if (leftSibling) {
              const pullDown = node.keys[childIdx - 1];
              leftSibling.keys.push(pullDown, ...child.keys);
              leftSibling.children.push(...child.children);
              node.keys.splice(childIdx - 1, 1);
              node.children.splice(childIdx, 1);
              events.push(
                `Internal ${child.id} merged into left ${leftSibling.id} pulling separator ${pullDown} down -> [${leftSibling.keys.join(', ')}].`
              );
            } else if (rightSibling) {
              const pullDown = node.keys[childIdx];
              child.keys.push(pullDown, ...rightSibling.keys);
              child.children.push(...rightSibling.children);
              node.keys.splice(childIdx, 1);
              node.children.splice(childIdx + 1, 1);
              events.push(
                `Internal ${child.id} merged with right ${rightSibling.id} pulling separator ${pullDown} down -> [${child.keys.join(', ')}].`
              );
            }
          }

          // Case II: if deleted key remains as a router separator in this internal node, replace with inorder successor
          const sepIdx = node.keys.indexOf(key);
          if (sepIdx !== -1 && node.children[sepIdx + 1]) {
            const successor = minKeyInSubtree(node.children[sepIdx + 1]);
            if (successor !== undefined && successor !== key) {
              node.keys[sepIdx] = successor;
              events.push(
                `Case II: Updated internal separator ${key} -> inorder successor ${successor} in ${node.id}.`
              );
            }
          }
        };

        deleteRec(root, op.key);

        if (!root.isLeaf && root.keys.length === 0 && root.children.length === 1) {
          root = root.children[0];
          events.push(`Root collapsed -> new Root ${root.id} [${root.keys.join(', ')}] (tree height reduced).`);
        }
      }
    }

    const leaves = relinkLeaves(root);
    steps.push({
      stepIndex: stepIdx,
      op,
      actionSummary: `${op.type === 'insert' ? 'Insert' : 'Delete'} ${op.key}`,
      events,
      tree: cloneBPlusNode(root),
      leafCount: leaves.length,
      height: getTreeHeight(root),
    });
  }

  if (steps.length === 0) {
    relinkLeaves(root);
  }

  return {
    finalTree: cloneBPlusNode(root),
    steps,
  };
}

export function traceBPlusSearch(
  root: BPlusNode,
  target: number
): { found: boolean; steps: BPlusSearchStep[]; visitedNodeIds: string[] } {
  const steps: BPlusSearchStep[] = [];
  const visitedNodeIds: string[] = [];
  let current: BPlusNode | undefined = root;

  while (current) {
    visitedNodeIds.push(current.id);
    if (current.isLeaf) {
      const found = current.keys.includes(target);
      steps.push({
        nodeId: current.id,
        isLeaf: true,
        keysChecked: current.keys,
        decision: found
          ? `Found ${target} in leaf ${current.id}.`
          : `${target} not present in leaf ${current.id}.`,
      });
      return { found, steps, visitedNodeIds };
    }

    let childIdx = 0;
    while (childIdx < current.keys.length && target >= current.keys[childIdx]) {
      childIdx++;
    }
    const routeDesc =
      childIdx === 0
        ? `${target} < ${current.keys[0]} -> follow left pointer P0`
        : childIdx === current.keys.length
        ? `${target} >= ${current.keys[current.keys.length - 1]} -> follow rightmost pointer P${childIdx}`
        : `${current.keys[childIdx - 1]} <= ${target} < ${current.keys[childIdx]} -> follow pointer P${childIdx}`;

    steps.push({
      nodeId: current.id,
      isLeaf: false,
      keysChecked: current.keys,
      decision: routeDesc,
    });
    current = current.children[childIdx];
  }

  return { found: false, steps, visitedNodeIds };
}

// ============================================================================
// Sprint Progress Math
// ============================================================================

export interface SprintBlockLike {
  id: string;
  day: 'Nov 21' | 'Nov 22' | 'Nov 23';
  syllabusHours: number;
}

export function calculateSprintStats(
  blocks: SprintBlockLike[],
  completedIds: string[]
): {
  completedCount: number;
  totalCount: number;
  completedHours: number;
  totalHours: number;
  percentComplete: number;
} {
  const completedSet = new Set(completedIds);
  const totalCount = blocks.length;
  const totalHours = blocks.reduce((sum, b) => sum + b.syllabusHours, 0);
  const completedBlocks = blocks.filter((b) => completedSet.has(b.id));
  const completedCount = completedBlocks.length;
  const completedHours = completedBlocks.reduce((sum, b) => sum + b.syllabusHours, 0);
  const percentComplete = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return { completedCount, totalCount, completedHours, totalHours, percentComplete };
}

export interface TopicMasteryModuleLike {
  id: 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
  number: number;
  title: string;
  topics: Array<{ id: string }>;
}

export interface ModuleMasteryStat {
  moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
  number: number;
  title: string;
  masteredCount: number;
  totalTopics: number;
  percentComplete: number;
}

export interface TopicMasteryStats {
  masteredCount: number;
  totalTopics: number;
  percentComplete: number;
  perModule: ModuleMasteryStat[];
}

export function calculateTopicMasteryStats(
  modules: TopicMasteryModuleLike[],
  masteredTopicIds: string[]
): TopicMasteryStats {
  const masteredSet = new Set(masteredTopicIds);
  let totalTopics = 0;
  let masteredCount = 0;

  const perModule: ModuleMasteryStat[] = modules.map((mod) => {
    const modTotal = mod.topics.length;
    const modMastered = mod.topics.filter((t) => masteredSet.has(t.id)).length;
    totalTopics += modTotal;
    masteredCount += modMastered;
    return {
      moduleId: mod.id,
      number: mod.number,
      title: mod.title,
      masteredCount: modMastered,
      totalTopics: modTotal,
      percentComplete: modTotal === 0 ? 0 : Math.round((modMastered / modTotal) * 100),
    };
  });

  const percentComplete = totalTopics === 0 ? 0 : Math.round((masteredCount / totalTopics) * 100);

  return {
    masteredCount,
    totalTopics,
    percentComplete,
    perModule,
  };
}

// ============================================================================
// Module 4: Timestamp Ordering (Basic TO vs Thomas Write Rule) Simulator
// ============================================================================

export type TimestampMode = 'basic' | 'thomas';

export interface TimestampStepResult {
  stepIndex: number;
  op: ScheduleOp;
  txTs: number;
  beforeRts: number | null;
  beforeWts: number | null;
  afterRts: number | null;
  afterWts: number | null;
  status: 'allowed' | 'ignored' | 'aborted' | 'skipped';
  reason: string;
}

export interface TimestampSimulationResult {
  mode: TimestampMode;
  timestamps: Record<string, number>;
  steps: TimestampStepResult[];
  abortedTxs: string[];
  ignoredWrites: number;
  finalRts: Record<string, number>;
  finalWts: Record<string, number>;
}

export function simulateTimestampOrdering(
  ops: ScheduleOp[],
  customTimestamps: Record<string, number> = {},
  mode: TimestampMode = 'basic'
): TimestampSimulationResult {
  const transactions = Array.from(new Set(ops.map((o) => o.tx))).sort(
    (a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10)
  );
  const timestamps: Record<string, number> = {};
  transactions.forEach((tx, idx) => {
    const custom = customTimestamps[tx];
    timestamps[tx] = Number.isFinite(custom) ? custom : (idx + 1) * 10;
  });

  const rts: Record<string, number> = {};
  const wts: Record<string, number> = {};
  const abortedSet = new Set<string>();
  const steps: TimestampStepResult[] = [];
  let ignoredWrites = 0;

  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    const txTs = timestamps[op.tx];

    if (abortedSet.has(op.tx)) {
      steps.push({
        stepIndex: i + 1,
        op,
        txTs,
        beforeRts: op.item ? (rts[op.item] ?? 0) : null,
        beforeWts: op.item ? (wts[op.item] ?? 0) : null,
        afterRts: op.item ? (rts[op.item] ?? 0) : null,
        afterWts: op.item ? (wts[op.item] ?? 0) : null,
        status: 'skipped',
        reason: `${op.tx} already aborted & rolled back earlier.`,
      });
      continue;
    }

    if (op.type === 'C' || op.type === 'A') {
      if (op.type === 'A') abortedSet.add(op.tx);
      steps.push({
        stepIndex: i + 1,
        op,
        txTs,
        beforeRts: null,
        beforeWts: null,
        afterRts: null,
        afterWts: null,
        status: op.type === 'C' ? 'allowed' : 'aborted',
        reason: op.type === 'C' ? `${op.tx} commits.` : `${op.tx} explicitly aborts.`,
      });
      continue;
    }

    const item = op.item!;
    const prevRts = rts[item] ?? 0;
    const prevWts = wts[item] ?? 0;

    if (op.type === 'R') {
      if (prevWts > txTs) {
        abortedSet.add(op.tx);
        steps.push({
          stepIndex: i + 1,
          op,
          txTs,
          beforeRts: prevRts,
          beforeWts: prevWts,
          afterRts: prevRts,
          afterWts: prevWts,
          status: 'aborted',
          reason: `Reject & ABORT ${op.tx}: WTS(${item})=${prevWts} > TS(${op.tx})=${txTs} (younger write already occurred).`,
        });
      } else {
        const nextRts = Math.max(prevRts, txTs);
        rts[item] = nextRts;
        steps.push({
          stepIndex: i + 1,
          op,
          txTs,
          beforeRts: prevRts,
          beforeWts: prevWts,
          afterRts: nextRts,
          afterWts: prevWts,
          status: 'allowed',
          reason: `Allow read: WTS(${item})=${prevWts} <= TS(${op.tx})=${txTs}. Set RTS(${item}) = max(${prevRts}, ${txTs}) = ${nextRts}.`,
        });
      }
    } else if (op.type === 'W') {
      if (prevRts > txTs) {
        abortedSet.add(op.tx);
        steps.push({
          stepIndex: i + 1,
          op,
          txTs,
          beforeRts: prevRts,
          beforeWts: prevWts,
          afterRts: prevRts,
          afterWts: prevWts,
          status: 'aborted',
          reason: `Reject & ABORT ${op.tx}: RTS(${item})=${prevRts} > TS(${op.tx})=${txTs} (younger transaction already read ${item}).`,
        });
      } else if (prevWts > txTs) {
        if (mode === 'thomas') {
          ignoredWrites += 1;
          steps.push({
            stepIndex: i + 1,
            op,
            txTs,
            beforeRts: prevRts,
            beforeWts: prevWts,
            afterRts: prevRts,
            afterWts: prevWts,
            status: 'ignored',
            reason: `Thomas Write Rule: WTS(${item})=${prevWts} > TS(${op.tx})=${txTs} (and RTS=${prevRts} <= ${txTs}) -> IGNORE obsolete write; ${op.tx} continues!`,
          });
        } else {
          abortedSet.add(op.tx);
          steps.push({
            stepIndex: i + 1,
            op,
            txTs,
            beforeRts: prevRts,
            beforeWts: prevWts,
            afterRts: prevRts,
            afterWts: prevWts,
            status: 'aborted',
            reason: `Basic TO Reject & ABORT ${op.tx}: WTS(${item})=${prevWts} > TS(${op.tx})=${txTs} (obsolete write).`,
          });
        }
      } else {
        wts[item] = txTs;
        steps.push({
          stepIndex: i + 1,
          op,
          txTs,
          beforeRts: prevRts,
          beforeWts: prevWts,
          afterRts: prevRts,
          afterWts: txTs,
          status: 'allowed',
          reason: `Allow write: RTS(${item})=${prevRts} <= ${txTs} and WTS(${item})=${prevWts} <= ${txTs}. Set WTS(${item}) = ${txTs}.`,
        });
      }
    }
  }

  return {
    mode,
    timestamps,
    steps,
    abortedTxs: Array.from(abortedSet),
    ignoredWrites,
    finalRts: rts,
    finalWts: wts,
  };
}

// ============================================================================
// Module 4: Write-Ahead Log (WAL) Recovery Simulator (Deferred vs Immediate)
// ============================================================================

export type WalEntryType = 'START' | 'WRITE' | 'COMMIT' | 'ABORT' | 'CHECKPOINT';

export interface WalLogEntry {
  lineNo: number;
  type: WalEntryType;
  tx?: string;
  item?: string;
  oldVal?: number;
  newVal?: number;
  raw: string;
}

export type RecoveryMode = 'deferred' | 'immediate';

export interface RecoveryAction {
  phase: 'UNDO' | 'REDO' | 'SKIP';
  tx: string;
  item?: string;
  detail: string;
}

export interface RecoverySimulationResult {
  mode: RecoveryMode;
  checkpointIndex: number;
  committedBeforeCheckpoint: string[];
  redoList: string[];
  undoList: string[];
  abortedList: string[];
  actions: RecoveryAction[];
  diskBeforeRecovery: Record<string, number>;
  finalValues: Record<string, number>;
}

export function parseWalLog(rawText: string): { entries: WalLogEntry[]; error?: string } {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.toUpperCase().includes('CRASH'));

  const entries: WalLogEntry[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const clean = raw.replace(/^[\[<]\s*/, '').replace(/\s*[\]>]$/, '');
    const parts = clean.split(',').map((p) => p.trim());
    const cmd = (parts[0] ?? '').toUpperCase();

    if (cmd === 'CHECKPOINT') {
      entries.push({ lineNo: i + 1, type: 'CHECKPOINT', raw });
      continue;
    }
    if ((cmd === 'START' || cmd === 'COMMIT' || cmd === 'ABORT') && parts[1]) {
      entries.push({
        lineNo: i + 1,
        type: cmd as 'START' | 'COMMIT' | 'ABORT',
        tx: parts[1].toUpperCase(),
        raw,
      });
      continue;
    }
    if (cmd === 'WRITE' && parts.length >= 5) {
      const oldVal = Number(parts[3]);
      const newVal = Number(parts[4]);
      if (!Number.isFinite(oldVal) || !Number.isFinite(newVal)) {
        return {
          entries: [],
          error: `Line ${i + 1}: old/new values must be numbers in "${raw}".`,
        };
      }
      entries.push({
        lineNo: i + 1,
        type: 'WRITE',
        tx: parts[1].toUpperCase(),
        item: parts[2].toUpperCase(),
        oldVal,
        newVal,
        raw,
      });
      continue;
    }

    return {
      entries: [],
      error: `Line ${i + 1}: unrecognized WAL entry "${raw}". Use [Start, T1], [Write, T1, A, 100, 200], [Commit, T1], [Abort, T2], or [Checkpoint].`,
    };
  }

  return { entries };
}

export function simulateLogRecovery(
  initialValues: Record<string, number>,
  entries: WalLogEntry[],
  mode: RecoveryMode
): RecoverySimulationResult {
  const normalizedInit: Record<string, number> = {};
  for (const [k, v] of Object.entries(initialValues)) {
    normalizedInit[k.toUpperCase()] = v;
  }

  let checkpointIndex = -1;
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].type === 'CHECKPOINT') checkpointIndex = i;
  }

  const started = new Set<string>();
  const committedBeforeCheckpoint = new Set<string>();
  const committedAfterCheckpoint = new Set<string>();
  const abortedSet = new Set<string>();

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (e.type === 'START' && e.tx) started.add(e.tx);
    if (e.type === 'COMMIT' && e.tx) {
      if (checkpointIndex !== -1 && i < checkpointIndex) {
        committedBeforeCheckpoint.add(e.tx);
      } else {
        committedAfterCheckpoint.add(e.tx);
      }
    }
    if (e.type === 'ABORT' && e.tx) abortedSet.add(e.tx);
  }

  const activeAtCrash = Array.from(started).filter(
    (tx) =>
      !committedBeforeCheckpoint.has(tx) &&
      !committedAfterCheckpoint.has(tx) &&
      !abortedSet.has(tx)
  );

  // Model disk state at crash time before recovery runs
  const diskBeforeRecovery: Record<string, number> = { ...normalizedInit };
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (e.type === 'WRITE' && e.item && e.newVal !== undefined && e.tx) {
      if (mode === 'immediate') {
        // Immediate Update allows uncommitted dirty buffers to reach disk before commit
        if (!abortedSet.has(e.tx)) {
          diskBeforeRecovery[e.item] = e.newVal;
        }
      } else {
        // Deferred Update only flushes committed transactions (e.g. flushed at checkpoint)
        if (committedBeforeCheckpoint.has(e.tx)) {
          diskBeforeRecovery[e.item] = e.newVal;
        }
      }
    }
  }

  const finalValues: Record<string, number> = { ...diskBeforeRecovery };
  const actions: RecoveryAction[] = [];

  for (const tx of committedBeforeCheckpoint) {
    actions.push({
      phase: 'SKIP',
      tx,
      detail: `${tx} committed BEFORE last [Checkpoint] — already flushed durably to disk (no REDO needed).`,
    });
  }

  const undoList = mode === 'immediate' ? [...activeAtCrash] : [];
  const redoList = Array.from(committedAfterCheckpoint);

  if (mode === 'immediate') {
    // Backward scan for UNDO of active transactions at crash
    const undoSet = new Set(undoList);
    for (let i = entries.length - 1; i >= 0; i--) {
      const e = entries[i];
      if (e.type === 'WRITE' && e.tx && undoSet.has(e.tx) && e.item && e.oldVal !== undefined) {
        finalValues[e.item] = e.oldVal;
        actions.push({
          phase: 'UNDO',
          tx: e.tx,
          item: e.item,
          detail: `UNDO ${e.tx} on ${e.item}: restore before-image ${e.oldVal} (was ${e.newVal}).`,
        });
      }
    }
  } else {
    for (const tx of activeAtCrash) {
      actions.push({
        phase: 'SKIP',
        tx,
        detail: `${tx} uncommitted at crash — NO-UNDO needed under Deferred Update (disk never modified).`,
      });
    }
  }

  // Forward scan for REDO of transactions committed after checkpoint (or all committed if no checkpoint)
  const redoSet = new Set(redoList);
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (e.type === 'WRITE' && e.tx && redoSet.has(e.tx) && e.item && e.newVal !== undefined) {
      finalValues[e.item] = e.newVal;
      actions.push({
        phase: 'REDO',
        tx: e.tx,
        item: e.item,
        detail: `REDO ${e.tx} on ${e.item}: apply after-image ${e.newVal}.`,
      });
    }
  }

  return {
    mode,
    checkpointIndex,
    committedBeforeCheckpoint: Array.from(committedBeforeCheckpoint),
    redoList,
    undoList,
    abortedList: Array.from(abortedSet),
    actions,
    diskBeforeRecovery,
    finalValues,
  };
}

// ============================================================================
// Module 3: Extendible Hashing & Linear Hashing Simulators
// ============================================================================

export interface ExtendibleBucketSnapshot {
  id: string;
  localDepth: number;
  keys: number[];
}

export interface ExtendibleStepSnapshot {
  stepIndex: number;
  insertedKey: number;
  binaryHash: string;
  globalDepth: number;
  directory: Array<{ bits: string; bucketId: string }>;
  buckets: ExtendibleBucketSnapshot[];
  events: string[];
}

export function simulateExtendibleHashing(
  keys: number[],
  bucketCapacity = 2,
  hashMod = 16
): { steps: ExtendibleStepSnapshot[]; finalState: ExtendibleStepSnapshot | null } {
  const cap = Math.max(1, Math.floor(bucketCapacity));
  const mod = Math.max(4, Math.floor(hashMod));
  const hashBitWidth = Math.max(4, Math.ceil(Math.log2(mod)));

  let globalDepth = 1;
  let bucketSeq = 2;
  const buckets = new Map<string, { id: string; localDepth: number; keys: number[] }>();
  buckets.set('B0', { id: 'B0', localDepth: 1, keys: [] });
  buckets.set('B1', { id: 'B1', localDepth: 1, keys: [] });
  let directory: string[] = ['B0', 'B1'];

  const getHash = (k: number) => ((k % mod) + mod) % mod;
  const toBits = (val: number, width: number) => val.toString(2).padStart(width, '0');
  const getDirIdx = (h: number, d: number) => h & ((1 << d) - 1);

  const steps: ExtendibleStepSnapshot[] = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (!Number.isFinite(key)) continue;
    const events: string[] = [];
    const h = getHash(key);
    const binStr = toBits(h, hashBitWidth);

    const existing = Array.from(buckets.values()).some((b) => b.keys.includes(key));
    if (existing) {
      events.push(`Key ${key} already exists in hash table.`);
    } else {
      let guard = 0;
      while (guard < 8) {
        guard += 1;
        const dirIdx = getDirIdx(h, globalDepth);
        const targetId = directory[dirIdx];
        const bucket = buckets.get(targetId)!;

        if (bucket.keys.length < cap) {
          bucket.keys.push(key);
          events.push(
            `Inserted ${key} (hash=${h}, ${binStr}, last ${globalDepth}b=${toBits(dirIdx, globalDepth)}) into ${bucket.id} (d'=${bucket.localDepth}).`
          );
          break;
        }

        // Bucket overflow -> check if directory needs doubling
        if (bucket.localDepth === globalDepth) {
          if (globalDepth >= 5) {
            bucket.keys.push(key);
            events.push(`Max depth D=5 reached; placed ${key} in overflow of ${bucket.id}.`);
            break;
          }
          const prevSize = directory.length;
          const nextDir: string[] = new Array(prevSize * 2);
          for (let j = 0; j < prevSize; j++) {
            nextDir[j] = directory[j];
            nextDir[j + prevSize] = directory[j];
          }
          directory = nextDir;
          globalDepth += 1;
          events.push(
            `${bucket.id} full with d'=${bucket.localDepth} == D -> Directory doubled to D=${globalDepth} (${directory.length} entries).`
          );
        }

        // Split bucket
        const oldLocal = bucket.localDepth;
        const newLocal = oldLocal + 1;
        const newBucketId = `B${bucketSeq++}`;
        const newBucket = { id: newBucketId, localDepth: newLocal, keys: [] as number[] };
        buckets.set(newBucketId, newBucket);

        const oldKeys = [...bucket.keys];
        bucket.keys = [];
        bucket.localDepth = newLocal;

        // Rewire directory pointers sharing the old bucket
        for (let idx = 0; idx < directory.length; idx++) {
          if (directory[idx] === bucket.id && ((idx >> oldLocal) & 1) === 1) {
            directory[idx] = newBucketId;
          }
        }

        // Rehash old keys
        for (const ok of oldKeys) {
          const oh = getHash(ok);
          const odIdx = getDirIdx(oh, globalDepth);
          buckets.get(directory[odIdx])!.keys.push(ok);
        }

        events.push(
          `Split ${bucket.id} (d'->${newLocal}) into ${bucket.id}=[${bucket.keys.join(',')}] & ${newBucketId}=[${newBucket.keys.join(',')}].`
        );
      }
    }

    steps.push({
      stepIndex: i,
      insertedKey: key,
      binaryHash: binStr,
      globalDepth,
      directory: directory.map((bId, idx) => ({
        bits: toBits(idx, globalDepth),
        bucketId: bId,
      })),
      buckets: Array.from(buckets.values()).map((b) => ({
        id: b.id,
        localDepth: b.localDepth,
        keys: [...b.keys],
      })),
      events,
    });
  }

  return {
    steps,
    finalState: steps.length > 0 ? steps[steps.length - 1] : null,
  };
}

export interface LinearBucketSnapshot {
  index: number;
  primaryKeys: number[];
  overflowKeys: number[];
}

export interface LinearHashStepSnapshot {
  stepIndex: number;
  insertedKey: number;
  level: number;
  splitPointer: number;
  modulus: number;
  buckets: LinearBucketSnapshot[];
  events: string[];
}

export function simulateLinearHashing(
  keys: number[],
  bucketCapacity = 2,
  initialBuckets = 2
): { steps: LinearHashStepSnapshot[]; finalState: LinearHashStepSnapshot | null } {
  const cap = Math.max(1, Math.floor(bucketCapacity));
  const m0 = Math.max(2, Math.floor(initialBuckets));

  let level = 0;
  let next = 0;
  const buckets: LinearBucketSnapshot[] = Array.from({ length: m0 }, (_, idx) => ({
    index: idx,
    primaryKeys: [],
    overflowKeys: [],
  }));

  const hashAtLevel = (k: number, lvl: number) => {
    const mod = m0 * Math.pow(2, lvl);
    return ((k % mod) + mod) % mod;
  };

  const placeKey = (bucket: LinearBucketSnapshot, key: number): boolean => {
    if (bucket.primaryKeys.length < cap) {
      bucket.primaryKeys.push(key);
      return false;
    }
    bucket.overflowKeys.push(key);
    return true;
  };

  const steps: LinearHashStepSnapshot[] = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (!Number.isFinite(key)) continue;
    const events: string[] = [];

    const mod = m0 * Math.pow(2, level);
    let targetIdx = hashAtLevel(key, level);
    if (targetIdx < next) {
      targetIdx = hashAtLevel(key, level + 1);
      events.push(
        `h_${level}(${key})=${hashAtLevel(key, level)} < next(${next}) -> rehash with h_${level + 1}(${key}) = Bucket ${targetIdx}.`
      );
    } else {
      events.push(`h_${level}(${key}) = ${key} mod ${mod} = Bucket ${targetIdx}.`);
    }

    const overflowed = placeKey(buckets[targetIdx], key);

    if (overflowed) {
      events.push(
        `Bucket ${targetIdx} overflowed (cap=${cap}) -> trigger Linear Split at split pointer next=${next}!`
      );
      const splitIdx = next;
      const newBucketIdx = buckets.length;
      buckets.push({ index: newBucketIdx, primaryKeys: [], overflowKeys: [] });

      const allToRehash = [...buckets[splitIdx].primaryKeys, ...buckets[splitIdx].overflowKeys];
      buckets[splitIdx].primaryKeys = [];
      buckets[splitIdx].overflowKeys = [];

      for (const rk of allToRehash) {
        const dest = hashAtLevel(rk, level + 1);
        placeKey(buckets[dest], rk);
      }

      events.push(
        `Rehashed Bucket ${splitIdx} using h_${level + 1} (mod ${mod * 2}) across Bucket ${splitIdx} & new Bucket ${newBucketIdx}.`
      );

      next += 1;
      if (next === mod) {
        next = 0;
        level += 1;
        events.push(`Round complete (next wrapped to 0) -> level incremented to i=${level} (mod ${m0 * Math.pow(2, level)}).`);
      }
    }

    steps.push({
      stepIndex: i,
      insertedKey: key,
      level,
      splitPointer: next,
      modulus: m0 * Math.pow(2, level),
      buckets: buckets.map((b) => ({
        index: b.index,
        primaryKeys: [...b.primaryKeys],
        overflowKeys: [...b.overflowKeys],
      })),
      events,
    });
  }

  return {
    steps,
    finalState: steps.length > 0 ? steps[steps.length - 1] : null,
  };
}

// ============================================================================
// Module 3: Multilevel Index Block & Disk I/O Calculator
// ============================================================================

export type IndexOrganization = 'primary' | 'secondary_dense' | 'clustering';

export interface MultilevelIndexInput {
  numRecords: number;
  blockSize: number;
  recordSize: number;
  keySize: number;
  blockPointerSize: number;
  indexType: IndexOrganization;
  distinctValues?: number;
}

export interface MultilevelIndexMetrics {
  bfr: number;
  dataBlocks: number;
  indexEntrySize: number;
  bfrIndex: number;
  firstLevelEntries: number;
  levels: Array<{ level: number; entries: number; blocks: number }>;
  totalIndexLevels: number;
  totalIndexBlocks: number;
  linearScanAvgIO: number;
  binarySearchDataFileIO: number;
  singleLevelBinarySearchIO: number;
  multilevelSearchIO: number;
  ioSavedVsSingleLevel: number;
  error?: string;
}

export function calculateMultilevelIndexMetrics(
  input: MultilevelIndexInput
): MultilevelIndexMetrics {
  const numRecords = Math.max(1, Math.floor(input.numRecords));
  const blockSize = Math.max(16, Math.floor(input.blockSize));
  const recordSize = Math.max(1, Math.floor(input.recordSize));
  const keySize = Math.max(1, Math.floor(input.keySize));
  const blockPointerSize = Math.max(1, Math.floor(input.blockPointerSize));

  const bfr = Math.floor(blockSize / recordSize);
  const indexEntrySize = keySize + blockPointerSize;
  const bfrIndex = Math.floor(blockSize / indexEntrySize);

  if (bfr < 1 || bfrIndex < 2) {
    return {
      bfr,
      dataBlocks: 0,
      indexEntrySize,
      bfrIndex,
      firstLevelEntries: 0,
      levels: [],
      totalIndexLevels: 0,
      totalIndexBlocks: 0,
      linearScanAvgIO: 0,
      binarySearchDataFileIO: 0,
      singleLevelBinarySearchIO: 0,
      multilevelSearchIO: 0,
      ioSavedVsSingleLevel: 0,
      error:
        bfr < 1
          ? 'Record size exceeds block size (unspanned bfr < 1).'
          : 'Index blocking factor bfr_i must be >= 2 for multilevel tree convergence.',
    };
  }

  const dataBlocks = Math.ceil(numRecords / bfr);
  const firstLevelEntries =
    input.indexType === 'primary'
      ? dataBlocks
      : input.indexType === 'secondary_dense'
      ? numRecords
      : Math.max(1, Math.floor(input.distinctValues ?? Math.ceil(numRecords / 10)));

  const levels: Array<{ level: number; entries: number; blocks: number }> = [];
  let curEntries = firstLevelEntries;
  let lvl = 1;
  while (lvl <= 12) {
    const blocks = Math.ceil(curEntries / bfrIndex);
    levels.push({ level: lvl, entries: curEntries, blocks });
    if (blocks <= 1) break;
    curEntries = blocks;
    lvl += 1;
  }

  const totalIndexLevels = levels.length;
  const totalIndexBlocks = levels.reduce((sum, l) => sum + l.blocks, 0);
  const linearScanAvgIO = Math.ceil(dataBlocks / 2);
  const binarySearchDataFileIO = Math.max(1, Math.ceil(Math.log2(dataBlocks)));
  const singleLevelBinarySearchIO =
    Math.max(1, Math.ceil(Math.log2(Math.max(1, levels[0].blocks)))) + 1;
  const multilevelSearchIO = totalIndexLevels + 1;

  return {
    bfr,
    dataBlocks,
    indexEntrySize,
    bfrIndex,
    firstLevelEntries,
    levels,
    totalIndexLevels,
    totalIndexBlocks,
    linearScanAvgIO,
    binarySearchDataFileIO,
    singleLevelBinarySearchIO,
    multilevelSearchIO,
    ioSavedVsSingleLevel: singleLevelBinarySearchIO - multilevelSearchIO,
  };
}

// ============================================================================
// Module 2: 3NF Synthesis, BCNF Decomposition Tree & Chase Lossless-Join Solver
// ============================================================================

export interface DecomposedRelation {
  name: string;
  attributes: string[];
  primaryKey: string[];
  preservedFds: string[];
  reason: string;
}

export interface ThreeNFSynthesisResult {
  minimalCover: FunctionalDependency[];
  groupedFds: Array<{ lhs: string[]; rhs: string[]; raw: string }>;
  relations: DecomposedRelation[];
  addedCandidateKeyRelation: boolean;
  removedSubsets: string[];
  isDependencyPreserving: boolean;
  isLossless: boolean;
  steps: string[];
}

export interface BCNFSplitStep {
  stepNo: number;
  parentName: string;
  parentAttrs: string[];
  violatingFd: string;
  leftName: string;
  leftAttrs: string[];
  rightName: string;
  rightAttrs: string[];
  reason: string;
}

export interface BCNFDecompositionResult {
  alreadyBCNF: boolean;
  splits: BCNFSplitStep[];
  relations: DecomposedRelation[];
  preservedFds: string[];
  lostFds: string[];
  isDependencyPreserving: boolean;
  isLossless: boolean;
}

export interface ChaseStep {
  stepNo: number;
  fd: string;
  matchedRows: number[];
  updates: string[];
  matrixAfter: string[][];
}

export interface ChaseResult {
  attributes: string[];
  relationNames: string[];
  initialMatrix: string[][];
  finalMatrix: string[][];
  steps: ChaseStep[];
  isLossless: boolean;
  winningRowIndex: number | null;
}

function isAttrSubset(sub: string[], sup: string[]): boolean {
  const supSet = new Set(sup);
  return sub.every((a) => supSet.has(a));
}

export function checkDependencyPreservation(
  relations: Array<{ attributes: string[] }>,
  fds: FunctionalDependency[]
): { preservedFds: string[]; lostFds: string[]; isDependencyPreserving: boolean } {
  const preservedFds: string[] = [];
  const lostFds: string[] = [];
  const minimal = computeMinimalCover(fds);

  for (const fd of minimal) {
    // Ullman Algorithm: compute closure of fd.lhs restricted to projections on each relation R_i
    const result = new Set(fd.lhs);
    let changed = true;
    while (changed) {
      changed = false;
      for (const rel of relations) {
        const relSet = new Set(rel.attributes);
        const intersection = Array.from(result).filter((a) => relSet.has(a));
        if (intersection.length === 0) continue;
        const { closure } = computeClosure(intersection, fds);
        for (const attr of closure) {
          if (relSet.has(attr) && !result.has(attr)) {
            result.add(attr);
            changed = true;
          }
        }
      }
    }

    if (fd.rhs.every((r) => result.has(r))) {
      preservedFds.push(fd.raw);
    } else {
      lostFds.push(fd.raw);
    }
  }

  return {
    preservedFds,
    lostFds,
    isDependencyPreserving: lostFds.length === 0,
  };
}

export function runChaseLosslessTest(
  allAttrs: string[],
  relations: Array<{ name: string; attributes: string[] }>,
  fds: FunctionalDependency[]
): ChaseResult {
  const attrs = [...allAttrs];
  const attrIndex = new Map<string, number>();
  attrs.forEach((a, idx) => attrIndex.set(a, idx));

  const relationNames = relations.map((r) => r.name);
  const matrix: string[][] = relations.map((rel, rIdx) => {
    const relSet = new Set(rel.attributes);
    return attrs.map((a, cIdx) => (relSet.has(a) ? `a${cIdx + 1}` : `b${rIdx + 1},${cIdx + 1}`));
  });

  const cloneMatrix = (m: string[][]) => m.map((row) => [...row]);
  const initialMatrix = cloneMatrix(matrix);

  const findWinningRow = (m: string[][]): number | null => {
    for (let i = 0; i < m.length; i++) {
      if (m[i].every((cell) => cell.startsWith('a'))) {
        return i;
      }
    }
    return null;
  };

  const steps: ChaseStep[] = [];
  let winningRowIndex = findWinningRow(matrix);
  let stepNo = 1;
  let guard = 0;

  while (winningRowIndex === null && guard < 40) {
    guard += 1;
    let changedInPass = false;

    for (const fd of fds) {
      const lhsIdx = fd.lhs.map((a) => attrIndex.get(a)).filter((i): i is number => i !== undefined);
      const rhsIdx = fd.rhs.map((a) => attrIndex.get(a)).filter((i): i is number => i !== undefined);
      if (lhsIdx.length !== fd.lhs.length || rhsIdx.length === 0) continue;

      // Group rows that agree on every LHS attribute symbol
      const groups = new Map<string, number[]>();
      for (let r = 0; r < matrix.length; r++) {
        const key = lhsIdx.map((c) => matrix[r][c]).join('|');
        const list = groups.get(key) ?? [];
        list.push(r);
        groups.set(key, list);
      }

      for (const rows of groups.values()) {
        if (rows.length < 2) continue;
        const updates: string[] = [];

        for (const c of rhsIdx) {
          const symbols = rows.map((r) => matrix[r][c]);
          const distSym = symbols.find((s) => s.startsWith('a'));
          const targetSym =
            distSym ??
            [...symbols].sort((x, y) => x.localeCompare(y, undefined, { numeric: true }))[0];

          for (const r of rows) {
            if (matrix[r][c] !== targetSym) {
              updates.push(
                `${relationNames[r]}.${attrs[c]}: ${matrix[r][c]} -> ${targetSym}`
              );
              matrix[r][c] = targetSym;
            }
          }
        }

        if (updates.length > 0) {
          changedInPass = true;
          steps.push({
            stepNo: stepNo++,
            fd: fd.raw,
            matchedRows: rows,
            updates,
            matrixAfter: cloneMatrix(matrix),
          });
          winningRowIndex = findWinningRow(matrix);
          if (winningRowIndex !== null) break;
        }
      }

      if (winningRowIndex !== null) break;
    }

    if (!changedInPass) break;
  }

  return {
    attributes: attrs,
    relationNames,
    initialMatrix,
    finalMatrix: cloneMatrix(matrix),
    steps,
    isLossless: winningRowIndex !== null,
    winningRowIndex,
  };
}

export function synthesize3NF(
  allAttrs: string[],
  fds: FunctionalDependency[]
): ThreeNFSynthesisResult {
  const steps: string[] = [];
  const minimalCover = computeMinimalCover(fds);
  steps.push(
    `Step 1 (Minimal Cover G): ${minimalCover.map((f) => f.raw).join('; ') || 'None'}.`
  );

  // Step 2: Group minimal cover FDs by identical LHS
  const groupMap = new Map<string, { lhs: string[]; rhs: Set<string> }>();
  for (const fd of minimalCover) {
    const key = [...fd.lhs].sort().join(',');
    const existing = groupMap.get(key);
    if (existing) {
      fd.rhs.forEach((r) => existing.rhs.add(r));
    } else {
      groupMap.set(key, { lhs: [...fd.lhs].sort(), rhs: new Set(fd.rhs) });
    }
  }

  const groupedFds = Array.from(groupMap.values()).map((g) => {
    const rhs = Array.from(g.rhs).sort();
    return { lhs: g.lhs, rhs, raw: `${formatAttrList(g.lhs)} -> ${formatAttrList(rhs)}` };
  });

  let draftRelations: Array<{
    attributes: string[];
    primaryKey: string[];
    preservedFds: string[];
    reason: string;
  }> = groupedFds.map((g) => {
    const attrs = Array.from(new Set([...g.lhs, ...g.rhs])).sort();
    return {
      attributes: attrs,
      primaryKey: g.lhs,
      preservedFds: [g.raw],
      reason: `Synthesized from minimal-cover group ${g.raw}`,
    };
  });

  steps.push(
    `Step 2 (Group by LHS): Created ${draftRelations.length} schema(s) from grouped FDs.`
  );

  // Step 3: Remove redundant relations that are subsets of another synthesized relation
  const removedSubsets: string[] = [];
  const filtered: typeof draftRelations = [];
  for (let i = 0; i < draftRelations.length; i++) {
    const cur = draftRelations[i];
    const subsumedBy = draftRelations.find(
      (other, j) =>
        j !== i &&
        isAttrSubset(cur.attributes, other.attributes) &&
        (other.attributes.length > cur.attributes.length || j < i)
    );
    if (subsumedBy) {
      removedSubsets.push(`(${cur.attributes.join(', ')}) ⊆ (${subsumedBy.attributes.join(', ')})`);
      subsumedBy.preservedFds = Array.from(
        new Set([...subsumedBy.preservedFds, ...cur.preservedFds])
      );
    } else {
      filtered.push(cur);
    }
  }
  draftRelations = filtered;

  if (removedSubsets.length > 0) {
    steps.push(`Step 3 (Eliminate Subset Schemas): Removed ${removedSubsets.join('; ')}.`);
  }

  // Step 4: Ensure at least one relation contains a Candidate Key of R (guarantees lossless join)
  const candidateKeys = findCandidateKeys(allAttrs, fds);
  const hasCandidateKey = draftRelations.some((rel) =>
    candidateKeys.some((ck) => isAttrSubset(ck, rel.attributes))
  );

  let addedCandidateKeyRelation = false;
  if (!hasCandidateKey && candidateKeys.length > 0) {
    const smallestKey = [...candidateKeys].sort((a, b) => a.length - b.length)[0];
    draftRelations.push({
      attributes: [...smallestKey],
      primaryKey: [...smallestKey],
      preservedFds: [],
      reason: `Added Candidate Key relation (${smallestKey.join(', ')}) to guarantee Lossless Join`,
    });
    addedCandidateKeyRelation = true;
    steps.push(
      `Step 4 (Lossless-Join Key Check): No table contained a candidate key -> added R_key(${smallestKey.join(', ')}).`
    );
  } else {
    steps.push(
      `Step 4 (Lossless-Join Key Check): A synthesized schema already contains a candidate key of R.`
    );
  }

  // Handle isolated attributes not present in any FD
  const coveredAttrs = new Set(draftRelations.flatMap((r) => r.attributes));
  const missingAttrs = allAttrs.filter((a) => !coveredAttrs.has(a));
  if (missingAttrs.length > 0) {
    if (draftRelations.length > 0) {
      draftRelations[draftRelations.length - 1].attributes = Array.from(
        new Set([...draftRelations[draftRelations.length - 1].attributes, ...missingAttrs])
      ).sort();
    } else {
      draftRelations.push({
        attributes: [...allAttrs].sort(),
        primaryKey: [...allAttrs].sort(),
        preservedFds: [],
        reason: 'All attributes (no non-trivial FDs)',
      });
    }
  }

  const relations: DecomposedRelation[] = draftRelations.map((r, idx) => ({
    name: `R${idx + 1}`,
    attributes: r.attributes,
    primaryKey: r.primaryKey,
    preservedFds: r.preservedFds,
    reason: r.reason,
  }));

  const depCheck = checkDependencyPreservation(relations, fds);
  const chase = runChaseLosslessTest(allAttrs, relations, fds);

  return {
    minimalCover,
    groupedFds,
    relations,
    addedCandidateKeyRelation,
    removedSubsets,
    isDependencyPreserving: depCheck.isDependencyPreserving,
    isLossless: chase.isLossless,
    steps,
  };
}

function findBCNFViolationInSubrelation(
  subAttrs: string[],
  allFds: FunctionalDependency[]
): { lhs: string[]; rhs: string[]; raw: string } | null {
  const subSet = new Set(subAttrs);

  // Build candidate LHS sets: first check original FD LHS subsets inside subAttrs,
  // then small subsets (size 1..min(3, subAttrs.length - 1)) so projected FDs are caught accurately
  const candidateLhsList: string[][] = [];
  const seenKey = new Set<string>();

  const addCandidate = (cand: string[]) => {
    const sorted = Array.from(new Set(cand)).sort();
    if (sorted.length === 0 || sorted.length >= subAttrs.length) return;
    if (!sorted.every((a) => subSet.has(a))) return;
    const key = sorted.join(',');
    if (!seenKey.has(key)) {
      seenKey.add(key);
      candidateLhsList.push(sorted);
    }
  };

  // Prioritize original FDs directly (produces the cleanest exam-aligned splits first)
  for (const fd of allFds) {
    if (fd.lhs.every((a) => subSet.has(a))) {
      addCandidate(fd.lhs);
    }
  }

  // Also check singletons and pairs in subAttrs for implied projected FDs
  const maxCheckSize = Math.min(subAttrs.length - 1, subAttrs.length <= 8 ? 3 : 2);
  for (let size = 1; size <= maxCheckSize; size++) {
    for (const combo of generateCombinations(subAttrs, size)) {
      addCandidate(combo);
    }
  }

  for (const lhs of candidateLhsList) {
    const { closure } = computeClosure(lhs, allFds);
    const closedInSub = closure.filter((a) => subSet.has(a));
    const nonTrivialRhs = closedInSub.filter((a) => !lhs.includes(a));
    if (nonTrivialRhs.length > 0 && closedInSub.length < subAttrs.length) {
      return {
        lhs,
        rhs: nonTrivialRhs.sort(),
        raw: `${formatAttrList(lhs)} -> ${formatAttrList(nonTrivialRhs.sort())}`,
      };
    }
  }

  return null;
}

export function decomposeBCNF(
  allAttrs: string[],
  fds: FunctionalDependency[]
): BCNFDecompositionResult {
  const splits: BCNFSplitStep[] = [];
  const finalLeaves: Array<{ attributes: string[]; reason: string }> = [];

  const queue: Array<{ name: string; attributes: string[]; reason: string }> = [
    { name: 'R', attributes: [...allAttrs].sort(), reason: 'Initial relation R' },
  ];

  let nextNodeIdx = 1;
  let stepNo = 1;
  let guard = 0;

  while (queue.length > 0 && guard < 25) {
    guard += 1;
    const current = queue.shift()!;
    const violation = findBCNFViolationInSubrelation(current.attributes, fds);

    if (!violation) {
      finalLeaves.push({ attributes: current.attributes, reason: current.reason });
      continue;
    }

    const leftAttrs = Array.from(new Set([...violation.lhs, ...violation.rhs])).sort();
    const rhsSet = new Set(violation.rhs);
    const rightAttrs = current.attributes.filter((a) => !rhsSet.has(a)).sort();

    const leftName = `R${nextNodeIdx++}`;
    const rightName = `R${nextNodeIdx++}`;

    splits.push({
      stepNo: stepNo++,
      parentName: current.name,
      parentAttrs: current.attributes,
      violatingFd: violation.raw,
      leftName,
      leftAttrs,
      rightName,
      rightAttrs,
      reason: `${formatAttrList(violation.lhs)} is not a superkey of ${current.name} -> split into ${leftName} = X⁺ ∩ ${current.name} and ${rightName} = (${current.name} - Y) ∪ X.`,
    });

    queue.push({
      name: leftName,
      attributes: leftAttrs,
      reason: `Split from ${current.name} via ${violation.raw} (X ∪ Y)`,
    });
    queue.push({
      name: rightName,
      attributes: rightAttrs,
      reason: `Remainder of ${current.name} keeping determinant (${violation.lhs.join(', ')})`,
    });
  }

  const relations: DecomposedRelation[] = finalLeaves.map((leaf, idx) => {
    const leafSet = new Set(leaf.attributes);
    const localFds = fds
      .map((fd) => ({
        lhs: fd.lhs,
        rhs: fd.rhs.filter((r) => leafSet.has(r) && !fd.lhs.includes(r)),
        raw: '',
      }))
      .filter((fd) => fd.lhs.every((a) => leafSet.has(a)) && fd.rhs.length > 0)
      .map((fd) => ({
        ...fd,
        raw: `${formatAttrList(fd.lhs)} -> ${formatAttrList(fd.rhs)}`,
      }));
    const cks = findCandidateKeys(leaf.attributes, localFds);
    const pk = cks[0] ?? leaf.attributes;

    return {
      name: `R${idx + 1}`,
      attributes: leaf.attributes,
      primaryKey: pk,
      preservedFds: localFds.map((f) => f.raw),
      reason: leaf.reason,
    };
  });

  const depCheck = checkDependencyPreservation(relations, fds);
  const chase = runChaseLosslessTest(allAttrs, relations, fds);

  return {
    alreadyBCNF: splits.length === 0,
    splits,
    relations,
    preservedFds: depCheck.preservedFds,
    lostFds: depCheck.lostFds,
    isDependencyPreserving: depCheck.isDependencyPreserving,
    isLossless: chase.isLossless,
  };
}


