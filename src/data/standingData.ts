import { MODULES } from './bacse202Data';
import { STANDING_QUESTIONS_M1_M2 } from './standingQuestionsM1M2';
import { STANDING_QUESTIONS_M3_M4 } from './standingQuestionsM3M4';
import { STANDING_QUESTIONS_M5 } from './standingQuestionsM5';

export interface StandingQuestion {
  id: string;
  moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
  tier: 'foundation' | 'application' | 'analysis';
  prompt: string;
  codeOrSchema?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ModuleRefresher {
  moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
  title: string;
  conceptBullets: string[];
  workedExamples: Array<{
    title: string;
    problem: string;
    solution: string;
  }>;
  keyFormulas: Array<{ label: string; value: string }>;
}

function getModuleFormulas(moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5') {
  const mod = MODULES.find((m) => m.id === moduleId);
  return mod ? mod.keyFormulasAndRules : [];
}

export const STANDING_QUESTIONS: StandingQuestion[] = [
  ...STANDING_QUESTIONS_M1_M2,
  ...STANDING_QUESTIONS_M3_M4,
  ...STANDING_QUESTIONS_M5,
];

export const MODULE_REFRESHERS: ModuleRefresher[] = [
  {
    moduleId: 'm1',
    title: 'Database Systems and Data Models',
    conceptBullets: [
      '**Self-Describing Catalog**: DBMS stores schemas, types, and constraints inside a system catalog—not hard-coded inside app binaries.',
      '**Program-Data Independence**: Physical file layouts can evolve without rewriting SQL or application queries.',
      '**Actors on the Scene**: DBA (security/resources), Designers (schema), End Users — **Naive/Parametric** (canned txns), **Casual** (ad-hoc), **Sophisticated** (analysts/engineers), **Standalone**.',
      '**Three-Schema Architecture**: **External** (user views) ↔ **Conceptual** (enterprise logical schema) ↔ **Internal** (physical files/indexes).',
      '**Logical vs Physical Independence**: Logical shields external views from conceptual changes (harder); Physical shields conceptual schema from storage/index changes (routine).',
      '**DBMS Environment Modules**: DDL Compiler → Catalog; DML/Query Compiler → Query Optimizer → Runtime Processor → Buffer & Recovery Manager.',
      '**Modern Data Models**: **Relational** (ACID tables), **Semi-Structured** (JSON/XML trees), **Graph** (nodes/edges), **Vector** (ANN embeddings), **Time-Series** (timestamp metrics).',
      '**Relation Characteristics**: Set of unique tuples (row order irrelevant); **Degree** = columns, **Cardinality** = rows; **Atomic** cell values (1NF).',
      '**Key Hierarchy**: **Superkey** (uniquely identifies rows) ⊇ **Candidate Key** (minimal superkey) ⊇ **Primary Key** (chosen CK, never NULL).',
      '**Integrity Constraints**: **Domain** (type/CHECK), **Entity Integrity** (PK ≠ NULL), **Referential Integrity** (FK matches parent PK or is NULL).',
      '**Violation Remedies**: `RESTRICT` (reject), `CASCADE` (propagate delete/update), `SET NULL` (nullable FK), `SET DEFAULT`.',
    ],
    workedExamples: [
      {
        title: '1. Tracing Integrity Constraint Violations & Remedies',
        problem:
          'Given `DEPT(Dno PK)` with `{D1, D2}` and `EMP(Eno PK, Age CHECK(Age>=18), Dno FK -> DEPT.Dno)`: classify violations for 4 operations.',
        solution: `| Operation | Violated Constraint | Standard Remedy |
| --- | --- | --- |
| \`INSERT (NULL, 25, D1)\` into EMP | **Entity Integrity** (PK is NULL) | Reject (\`RESTRICT\`) |
| \`INSERT (E9, 16, D1)\` into EMP | **Domain Constraint** (Age < 18) | Reject |
| \`INSERT (E9, 25, D9)\` into EMP | **Referential Integrity** (D9 missing) | Reject or insert D9 first |
| \`DELETE D1\` from DEPT (referenced) | **Referential Integrity** | \`RESTRICT\`, \`CASCADE\`, or \`SET NULL\` |`,
      },
      {
        title: '2. Counting Superkeys from Candidate Keys',
        problem:
          'Relation `STUDENT(RegNo, Email, Name, Dept)` has candidate keys `{RegNo}` and `{Email}`. How many superkeys exist?',
        solution: `1. Superkeys containing \`RegNo\`: \`2^3 = 8\` (choose any subset of \`{Email, Name, Dept}\`).
2. Superkeys containing \`Email\`: \`2^3 = 8\` (choose any subset of \`{RegNo, Name, Dept}\`).
3. Overlap containing **both** \`{RegNo, Email}\`: \`2^2 = 4\` (subsets of \`{Name, Dept}\`).
4. By inclusion-exclusion: \`8 + 8 - 4 = 12\` distinct superkeys.`,
      },
      {
        title: '3. Selecting the Right Database Paradigm',
        problem:
          'Choose the best data model for (a) UPI bank transfers, (b) 4-hop fraud rings, (c) RAG semantic search, (d) IoT turbine metrics.',
        solution: `- **(a) UPI transfers** → **Relational**: strict ACID transactions & referential integrity.
- **(b) 4-hop fraud rings** → **Graph**: index-free adjacency beats recursive SQL joins.
- **(c) RAG semantic search** → **Vector**: high-dimensional ANN similarity indexes (HNSW).
- **(d) IoT turbine metrics** → **Time-Series**: append-only timestamp compression & window rollups.`,
      },
    ],
    keyFormulas: getModuleFormulas('m1'),
  },
  {
    moduleId: 'm2',
    title: 'ER Modeling and Relational Database Design',
    conceptBullets: [
      '**ER Attributes**: **Simple** vs **Composite** (Address → Street, City), **Single** vs **Multivalued** (double oval), **Stored** vs **Derived** (dashed oval).',
      '**Structural Constraints**: **Cardinality Ratios** (`1:1`, `1:N`, `M:N`) + **Participation** (`Single line` = partial, `Double line` = total/mandatory).',
      '**Weak Entity**: Double rectangle + **Identifying Relationship** (double diamond) + total participation + **Partial Key** (dashed underline).',
      '**EER Specialization/Generalization**: Top-down vs bottom-up; **Disjoint (`d`)** vs **Overlapping (`o`)**; **Total** (double line) vs **Partial**; subclasses inherit all superclass attributes.',
      '**7-Step ER Mapping**: (1) Strong → table, (2) Weak → owner PK + partial key, (3) 1:1 → FK on total side, (4) 1:N → FK on N-side, (5) M:N → junction table, (6) Multivalued → new table, (7) N-ary → new table with all FKs.',
      '**EER Options 8A–8D**: **8A** (super + sub tables, works always), **8B** (sub tables only — ONLY disjoint & total), **8C** (1 table + type col — disjoint), **8D** (1 table + boolean flags — overlapping).',
      '**Armstrong\'s Axioms**: **Reflexivity** (`Y ⊆ X ⇒ X→Y`), **Augmentation** (`X→Y ⇒ XZ→YZ`), **Transitivity** (`X→Y, Y→Z ⇒ X→Z`) + Union, Decomposition, Pseudotransitivity.',
      '**Candidate Key Rule**: Attributes never on any RHS MUST belong to every candidate key; test closure `X+ = R` for minimal sets.',
      '**Minimal Cover (3 Steps)**: (1) Split RHS to singletons, (2) Drop extraneous LHS attributes, (3) Drop redundant FDs.',
      '**Normal Form Ladder**: **1NF** (atomic) → **2NF** (no partial dep) → **3NF** (`X` superkey OR `A` prime) → **BCNF** (`X` MUST be superkey) → **4NF** (no non-trivial MVD) → **5NF** (no non-trivial JD).',
    ],
    workedExamples: [
      {
        title: '1. Candidate Keys + 3NF vs BCNF Diagnostic',
        problem:
          'Given `R(A, B, C, D)` with `F = { AB -> C, C -> D, D -> A }`, find all candidate keys and highest normal form.',
        solution: `1. **Must-include attribute**: \`B\` never appears on any RHS → every CK contains \`B\`.
2. **Test pairs with B**: \`(AB)+ = ABCD\`, \`(BC)+ = BCDA\`, \`(BD)+ = BDAC\` → **3 Candidate Keys**: \`{AB, BC, BD}\`.
3. **Prime attributes**: \`{A, B, C, D}\` (all attributes are prime!).
4. **3NF check**: Every RHS is prime → **Passes 3NF**.
5. **BCNF check**: In \`C -> D\` and \`D -> A\`, neither \`C\` nor \`D\` is a superkey → **Fails BCNF**. Highest NF = **3NF**.`,
      },
      {
        title: '2. 3-Step Minimal Cover Pipeline',
        problem:
          'Find the minimal cover of `F = { A -> BC, B -> C, AB -> D }`.',
        solution: `1. **Step 1 (Singleton RHS)**: \`{ A -> B, A -> C, B -> C, AB -> D }\`.
2. **Step 2 (Drop extraneous LHS)**: In \`AB -> D\`, \`A+\` under F contains \`B\`, so \`B\` is extraneous → replace with \`A -> D\`. Set is now \`{ A -> B, A -> C, B -> C, A -> D }\`.
3. **Step 3 (Drop redundant FDs)**: Removing \`A -> C\`, \`A+\` under \`{ A -> B, B -> C, A -> D }\` still yields \`{A, B, C, D}\` → \`A -> C\` is redundant.
4. **Minimal Cover**: \`{ A -> B, B -> C, A -> D }\`.`,
      },
      {
        title: '3. 4NF (MVD) vs 5NF (Join Dependency)',
        problem:
          'Distinguish when a BCNF table needs 4NF decomposition vs 5NF decomposition.',
        solution: `| Normal Form | Root Cause | Fix |
| --- | --- | --- |
| **4NF** | Independent multi-valued facts in one table (\`Course ->-> Instructor\`, \`Course ->-> Book\`) | Split into **2** tables: \`(Course, Instructor)\` & \`(Course, Book)\` |
| **5NF (PJNF)** | Cyclic 3-way business rule (\`Agent–Company–Product\`) with no binary lossless split | Split into **3** projections: \`(A,C)\`, \`(C,P)\`, \`(A,P)\` |`,
      },
    ],
    keyFormulas: getModuleFormulas('m2'),
  },
  {
    moduleId: 'm3',
    title: 'Physical Database Design and Query Processing',
    conceptBullets: [
      '**Heap vs Sorted File I/O**: Unordered equality search averages `b/2` blocks; Sorted binary search takes `ceil(log2 b)` blocks (`bfr = floor(B/R)`, `b = ceil(r/bfr)`).',
      '**Static vs Dynamic Hashing**: Static hashing suffers overflow chains on growth; **Extendible** uses directory (`2^d`) + local depth `d\'`; **Linear** splits incrementally via split pointer `n` (no directory).',
      '**Single-Level Indexes**: **Primary** (ordering key, sparse), **Clustering** (ordering non-key, sparse), **Secondary** (non-ordering field, ALWAYS dense).',
      '**B+ Tree Architecture**: Data pointers ONLY in leaves; leaves linked sequentially for range scans; internal nodes hold up to `p` pointers & `p-1` keys (min `ceil(p/2)` pointers).',
      '**B+ Tree Split Rule**: Leaf split **COPIES** the first key of the right leaf up to the parent; internal split **PUSHES** the middle key up.',
      '**LSM Tree**: Write-optimized path (**WAL → in-memory MemTable → immutable SSTables → compaction**); **Bloom filters** skip irrelevant SSTables on reads.',
      '**Relational Algebra Core**: Unary `σ` (row filter), `π` (column projection), `ρ` (rename); Binary `∪, ∩, −, ×, ⋈, ÷` (Division = "for ALL").',
      '**Tuple Relational Calculus (TRC)**: Declarative `{ t | P(t) }` using `∃` and `∀`; must be **safe** (range-restricted to finite relations).',
      '**Heuristic Query Tree Order**: (1) Cascade `σ`, (2) Push `σ` down to leaves, (3) Execute smallest/most-selective joins first, (4) Replace `× + σ` with `⋈`, (5) Push `π` down.',
      '**Optimizer Trap**: Never push `π` below Set Difference (`−`) — `π_A(R − S) ≠ π_A(R) − π_A(S)` in general.',
    ],
    workedExamples: [
      {
        title: '1. B+ Tree Order & Max Capacity Calculation',
        problem:
          'Block `B = 1024 B`, search key `V = 12 B`, block pointer `P = 8 B`, record pointer `Pr = 8 B`. Compute `p` and `p_leaf`.',
        solution: `1. **Internal order \`p\`**: \`p·P + (p - 1)·V <= B\` → \`8p + 12(p - 1) <= 1024\` → \`20p <= 1036\` → **\`p = 51\`** (max 50 keys, min \`ceil(51/2) = 26\` pointers).
2. **Leaf capacity \`p_leaf\`**: \`p_leaf·(V + Pr) + P <= B\` → \`p_leaf·20 + 8 <= 1024\` → \`20·p_leaf <= 1016\` → **\`p_leaf = 50\`** entries/leaf.
3. **3-level max records**: \`p × p × p_leaf = 51 × 51 × 50 = 130,050\` records in 3 disk I/Os.`,
      },
      {
        title: '2. Extendible vs Linear Hashing Split Trigger',
        problem:
          'Contrast what happens on bucket overflow in Extendible Hashing (`d = 2, d\' = 2`) vs Linear Hashing (`M = 4, n = 0`).',
        solution: `| Scheme | Trigger | Action |
| --- | --- | --- |
| **Extendible** | Overflow bucket has \`d' == d\` | Double directory (\`d: 2→3\`, 8 slots), split ONLY overflowing bucket (\`d' = 3\`) |
| **Linear** | Any bucket overflows (or load > threshold) | Split **Bucket \`n\` (0)** using \`h_1(K) = K mod 8\` into Bucket 0 & Bucket 4; increment \`n: 0→1\` |`,
      },
      {
        title: '3. Heuristic Query Tree Optimization',
        problem:
          'Optimize `π_{Ename}(σ_{Dname="CSE" ∧ Salary>90k}(EMP × DEPT))` where `EMP.Dno = DEPT.Dno`.',
        solution: `1. **Cascade & push \`σ\`**: Apply \`σ_{Salary>90k}(EMP)\` and \`σ_{Dname="CSE"}(DEPT)\` at the leaves.
2. **Convert \`× + σ\` to Join**: Merge join predicate into \`⋈_{EMP.Dno = DEPT.Dno}\`.
3. **Push \`π\` down**: Keep only \`π_{Ename, Dno}\` from filtered \`EMP\` and \`π_{Dno}\` from filtered \`DEPT\` before the join, then final \`π_{Ename}\`.`,
      },
    ],
    keyFormulas: getModuleFormulas('m3'),
  },
  {
    moduleId: 'm4',
    title: 'Transaction Processing, Concurrency Control and Recovery',
    conceptBullets: [
      '**ACID**: **Atomicity** (all-or-nothing), **Consistency** (invariant-preserving), **Isolation** (concurrent = serial effect), **Durability** (persists post-crash).',
      '**Transaction States**: `Active → Partially Committed → Committed` (or `Active/Partially Committed → Failed → Aborted → Terminated`).',
      '**Conflicting Operations**: Different transactions, SAME data item, at least one Write: **RW, WR, WW** (RR never conflicts).',
      '**Conflict Serializability**: Draw directed edge `Ti → Tj` whenever `Ti` conflicts before `Tj`; **Acyclic graph ⇔ Conflict Serializable** (topological sort = serial order).',
      '**Recoverability Hierarchy**: **Strict** (no read OR overwrite of uncommitted data) ⊂ **Cascadeless** (no dirty reads) ⊂ **Recoverable** (commit after dependency commits).',
      '**2PL Variants**: **Basic** (growing then shrinking; can cascade-abort), **Conservative** (lock all upfront; **deadlock-free**), **Strict** (hold X-locks till commit), **Rigorous** (hold ALL locks till commit).',
      '**Deadlock Prevention**: **Wait-Die** (older waits, younger dies — non-preemptive) vs **Wound-Wait** (older wounds younger, younger waits — preemptive); restarts keep ORIGINAL timestamp.',
      '**Timestamp Ordering**: Basic TO aborts if `TS(T) < write_TS(X)` on read, or `TS(T) < read_TS(X)` / `write_TS(X)` on write. **Thomas Write Rule** ignores obsolete writes when `read_TS(X) <= TS(T) < write_TS(X)`.',
      '**Multiple Granularity Locking**: Acquire top-down (`IS/IX` on ancestors → `S/X` on leaf). `IS` compatible with `IS, IX, S, SIX`; `IX` compatible ONLY with `IS, IX`.',
      '**WAL & Recovery**: **Deferred Update** (No-Steal → **NO-UNDO / REDO**); **Immediate Update** (Steal/No-Force → **UNDO backward + REDO forward**); **Checkpoints** skip transactions committed before checkpoint.',
    ],
    workedExamples: [
      {
        title: '1. Precedence Graph & Serial Order Check',
        problem:
          'Test conflict serializability of `S: R1(X); W2(X); R3(Y); W1(Y); W3(X);`.',
        solution: `1. **Conflicts on X**: \`R1(X) → W2(X)\` gives \`T1 → T2\`; \`R1(X) → W3(X)\` gives \`T1 → T3\`; \`W2(X) → W3(X)\` gives \`T2 → T3\`.
2. **Conflicts on Y**: \`R3(Y) → W1(Y)\` gives \`T3 → T1\`.
3. **Cycle Detection**: \`T1 → T3 → T1\` forms a **cycle** → Schedule S is **NOT conflict-serializable**.`,
      },
      {
        title: '2. Wait-Die vs Wound-Wait Decision Table',
        problem:
          'Given `TS(T1) = 10` (older) and `TS(T2) = 20` (younger), trace both schemes when requester hits a held lock.',
        solution: `| Request | Wait-Die (Non-Preemptive) | Wound-Wait (Preemptive) |
| --- | --- | --- |
| **Older T1** requests lock held by **Younger T2** | T1 **WAITS** | T1 **WOUNDS** (aborts) T2 |
| **Younger T2** requests lock held by **Older T1** | T2 **DIES** (aborts) | T2 **WAITS** |`,
      },
      {
        title: '3. WAL Checkpoint Crash Recovery (Immediate Update)',
        problem:
          'Initial `X=50, Y=80`. Log: `start T1, W(T1,X:50→70), commit T1, CHECKPOINT{T2}, start T3, W(T2,Y:80→95), W(T3,X:70→99), commit T2, CRASH`.',
        solution: `1. **Classify**: \`T1\` committed before checkpoint (**Ignore** — already on disk); \`T2\` committed after checkpoint (**REDO**); \`T3\` active at crash (**UNDO**).
2. **UNDO backward** (\`T3\`): restore \`X = 70\`.
3. **REDO forward** (\`T2\`): apply \`Y = 95\`.
4. **Final Disk State**: \`X = 70, Y = 95\`.`,
      },
    ],
    keyFormulas: getModuleFormulas('m4'),
  },
  {
    moduleId: 'm5',
    title: 'Distributed and NoSQL Databases',
    conceptBullets: [
      '**DDBMS Types & Transparency**: **Homogeneous** (same DBMS) vs **Heterogeneous** (mixed engines); hide distribution via **Location, Fragmentation, and Replication transparency**.',
      '**Fragmentation Rules**: **Horizontal** (`σ`, reassemble via `∪`), **Vertical** (`π` + Primary Key in every slice, reassemble via `⋈`), **Mixed/Hybrid**. Must obey **Completeness, Reconstruction, Disjointness**.',
      '**Replication & Quorums**: Full vs Partial vs No replication; strong read-your-writes consistency requires quorum overlap **`R + W > N`**.',
      '**Semijoin (`R ⋉ S`)**: Ship small join column `π_J(S)` first, filter `R`, return only matching rows — saves WAN bytes unless selectivity approaches 100%.',
      '**Two-Phase Commit (2PC)**: **Phase 1 (Prepare/Vote)** unanimous YES required; **Phase 2 (Commit/Abort)**. Coordinator crash while participants are `READY` causes **blocking** (3PC adds `PRE-COMMIT` for non-partitioned networks).',
      '**CAP Theorem**: Under inevitable Network **Partition (`P`)**, systems must choose **Consistency (`CP`)** or **Availability (`AP`)**.',
      '**ACID vs BASE**: **BASE** = **Basically Available, Soft state, Eventual consistency** — optimizes scale/uptime over strict linearizability.',
      '**Four NoSQL Families**: **Key-Value** (Redis — O(1) sessions), **Document** (MongoDB — nested JSON aggregates), **Column-Family** (Cassandra — wide sparse write-heavy), **Graph** (Neo4j — multi-hop traversals).',
      '**Sharding & Replication**: **Consistent Hashing** moves only `~1/N` keys on node add; **Primary-Replica** avoids write conflicts, **Peer-to-Peer** boosts write availability with conflict resolution.',
      '**MapReduce Pipeline**: **Map** emits `(k, v)` → **Shuffle & Sort** groups `(k, [v1, v2, ...])` → **Reduce** aggregates per key.',
    ],
    workedExamples: [
      {
        title: '1. Verifying Horizontal & Vertical Fragmentation',
        problem:
          'Check `EMP(Eid PK, Branch, Salary, Photo)` split into `H1 = σ_{Branch="VIT"}(EMP)`, `H2 = σ_{Branch≠"VIT"}(EMP)` and vertical `V1(Eid, Branch, Salary)`, `V2(Eid, Photo)`.',
        solution: `- **Horizontal**: Every tuple matches either \`Branch="VIT"\` or \`Branch≠"VIT"\` (**Complete**), zero overlap (**Disjoint**), and \`H1 ∪ H2 = EMP\` (**Reconstruction**).
- **Vertical**: Every column covered (**Complete**), only PK \`Eid\` shared (**Disjoint** on non-keys), and \`V1 ⋈_{Eid} V2 = EMP\` (**Reconstruction**).`,
      },
      {
        title: '2. Semijoin vs Naive Transfer Cost',
        problem:
          '`R` at Site 1 = 800 KB; only 10% of `R` matches `S` at Site 2; `π_J(S)` = 30 KB. Compute bytes saved.',
        solution: `1. **Naive ship \`R → Site 2\`**: \`800 KB\`.
2. **Semijoin**: Ship \`π_J(S)\` (\`30 KB\`) + matching 10% of \`R\` (\`80 KB\`) = **\`110 KB\`**.
3. **Savings**: \`800 - 110 = 690 KB\` (**86.25% reduction**).`,
      },
      {
        title: '3. Selecting CAP Quadrant & NoSQL Family',
        problem:
          'Map 4 production services to CAP bias and NoSQL family.',
        solution: `| Service | CAP Bias | Best NoSQL Family |
| --- | --- | --- |
| User auth session cache | **AP** | **Key-Value** (Redis) |
| Nested e-commerce catalog | **CP / Tunable** | **Document** (MongoDB) |
| Global IoT telemetry log | **AP** | **Column-Family** (Cassandra) |
| 5-hop fraud ring detector | **CP** | **Graph** (Neo4j) |`,
      },
    ],
    keyFormulas: getModuleFormulas('m5'),
  },
];

export function getModuleStandingQuestions(
  moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5'
): StandingQuestion[] {
  const tierOrder: Record<StandingQuestion['tier'], number> = {
    foundation: 0,
    application: 1,
    analysis: 2,
  };
  return STANDING_QUESTIONS.filter((q) => q.moduleId === moduleId).sort(
    (a, b) => tierOrder[a.tier] - tierOrder[b.tier] || a.id.localeCompare(b.id)
  );
}

export function getModuleRefresher(
  moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5'
): ModuleRefresher {
  const found = MODULE_REFRESHERS.find((r) => r.moduleId === moduleId);
  if (!found) {
    throw new Error(`Missing ModuleRefresher for ${moduleId}`);
  }
  return found;
}
