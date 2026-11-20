import { EXTENDED_FAT_QUESTIONS } from './fatQuestionsExtended';

export interface SyllabusTopic {
  id: string;
  title: string;
  detail: string;
  fatWeight: 'Core' | 'High Yield' | 'Numerical / Diagram';
}

export interface ComparisonTable {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface ModuleData {
  id: 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
  number: number;
  title: string;
  hours: number;
  examFocus: string;
  topics: SyllabusTopic[];
  keyFormulasAndRules: Array<{ label: string; value: string }>;
  comparisonTable: ComparisonTable;
  likelyFatQuestions: string[];
  recommendedLab?:
    | 'exam_drill'
    | 'integrity'
    | 'er_mapping'
    | 'normalization'
    | 'bplus'
    | 'hashing_index'
    | 'ra_trc_tree'
    | 'serializability'
    | 'two_pl_deadlock'
    | 'timestamp_recovery'
    | 'ddbms_2pc'
    | 'cap_nosql';
}

export interface SprintBlock {
  id: string;
  day: 'Nov 21' | 'Nov 22' | 'Nov 23';
  timeSlot: string;
  durationLabel: string;
  title: string;
  moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5' | 'all';
  syllabusHours: number;
  focusSummary: string;
  checklist: string[];
  targetView: 'syllabus' | 'labs' | 'mock';
  targetLab?:
    | 'exam_drill'
    | 'integrity'
    | 'er_mapping'
    | 'normalization'
    | 'bplus'
    | 'hashing_index'
    | 'ra_trc_tree'
    | 'serializability'
    | 'two_pl_deadlock'
    | 'timestamp_recovery'
    | 'ddbms_2pc'
    | 'cap_nosql';
}

export interface FatQuestion {
  id: string;
  moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
  part: 'Part A (Short)' | 'Part B (Analytical)';
  marks: 2 | 10;
  prompt: string;
  codeOrSchema?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const COURSE_META = {
  code: 'BACSE202',
  title: 'Database Systems',
  credits: 'L 3 · T 0 · P 2 · C 4',
  institution: 'VIT Chennai · End Semester FAT',
  examDate: '23 Nov 2026, 09:00 AM IST',
  prepWindow: '21 Nov – 22 Nov (48 Hours)',
  textbook: 'R. Elmasri & S. B. Navathe, Fundamentals of Database Systems (7th Ed., 2021)',
  references: [
    'Silberschatz, Korth & Sudarshan — Database System Concepts (7th Ed.)',
    'M. Tamer Özsu & Patrick Valduriez — Principles of Distributed Database Systems (4th Ed.)',
  ],
};

export const MODULES: ModuleData[] = [
  {
    id: 'm1',
    number: 1,
    title: 'Database Systems and Data Models',
    hours: 7,
    examFocus: 'Three-schema data independence, actors, modern data models, and integrity constraint violation actions.',
    topics: [
      {
        id: 'm1-t1',
        title: 'Characteristics & Advantages of DBMS Approach',
        detail: 'Self-describing nature (catalog/metadata), program-data & program-operation independence, data abstraction, multiple views, concurrency & multiuser transaction control.',
        fatWeight: 'Core',
      },
      {
        id: 'm1-t2',
        title: 'Actors on the Scene & DBMS Classification',
        detail: 'DBA, Database Designers, End Users (casual, naive/parametric, sophisticated, standalone), System Analysts & Application Programmers. Classification by data model, users, distribution, cost.',
        fatWeight: 'Core',
      },
      {
        id: 'm1-t3',
        title: 'Schemas, Instances & Three-Schema Architecture',
        detail: 'External (view), Conceptual (logical), Internal (physical) levels. Logical vs Physical data independence.',
        fatWeight: 'High Yield',
      },
      {
        id: 'm1-t4',
        title: 'Database System Environment & Data Models',
        detail: 'DBMS component modules (DDL/DML compiler, query optimizer, runtime processor, buffer/recovery manager). Models: Relational, Semi-structured (JSON/XML), Graph, Vector, Time-Series, Distributed, Unstructured.',
        fatWeight: 'Core',
      },
      {
        id: 'm1-t5',
        title: 'Relational Model Concepts & Characteristics',
        detail: 'Relation schema R(A1, A2, ..., An), tuple, domain, degree (arity), cardinality, ordering irrelevance of tuples, atomic values (1NF assumption), NULL interpretations.',
        fatWeight: 'Core',
      },
      {
        id: 'm1-t6',
        title: 'Constraints & Handling Violations',
        detail: 'Domain, Key (Superkey, Candidate, Primary), NULL, Entity Integrity (PK != NULL), Referential Integrity (FK matches PK or NULL). Actions on Delete/Update: RESTRICT/REJECT, CASCADE, SET NULL, SET DEFAULT.',
        fatWeight: 'Numerical / Diagram',
      },
    ],
    keyFormulasAndRules: [
      { label: 'Logical Data Independence', value: 'Change conceptual schema without rewriting external views/applications' },
      { label: 'Physical Data Independence', value: 'Change internal storage/indexes without altering conceptual schema' },
      { label: 'Entity Integrity Rule', value: 'No primary key attribute may contain NULL in any tuple' },
      { label: 'Referential Integrity Rule', value: 'Foreign key tuple t1[FK] = t2[PK] in referenced relation OR t1[FK] is NULL' },
    ],
    comparisonTable: {
      title: 'Modern Database Paradigms in Module 1',
      headers: ['Data Model', 'Primary Structure', 'Typical Query / Use Case'],
      rows: [
        ['Relational', 'Normalized tables (tuples & attributes)', 'ACID transactions, SQL joins, banking'],
        ['Semi-Structured', 'Self-describing trees (JSON / XML)', 'Schema-flexible APIs, catalog configs'],
        ['Graph', 'Nodes, directed edges & properties', 'Social networks, fraud rings, shortest path'],
        ['Vector', 'High-dimensional embeddings + ANN index', 'Semantic similarity search, RAG retrieval'],
        ['Time-Series', 'Timestamp-indexed append-only metrics', 'IoT sensor telemetry, server monitoring'],
      ],
    },
    likelyFatQuestions: [
      'Draw and explain the Three-Schema Architecture and distinguish logical vs physical data independence.',
      'Given an Employee–Department schema, trace which Insert/Delete/Update operations violate Domain, Entity, or Referential Integrity and specify CASCADE vs RESTRICT remedies.',
      'Compare relational, graph, vector, and time-series data models with real-world selection criteria.',
    ],
    recommendedLab: 'integrity',
  },
  {
    id: 'm2',
    number: 2,
    title: 'ER Modeling and Relational Database Design',
    hours: 10,
    examFocus: 'ER/EER diagramming, 7-step ER-to-Relational mapping, FD closure, Minimal Cover, and 1NF–BCNF/4NF/5NF decomposition.',
    topics: [
      {
        id: 'm2-t1',
        title: 'Entity Relationship Model & Weak Entities',
        detail: 'Attribute types (simple/composite, single/multivalued, stored/derived), relationship degree/roles, cardinality ratios (1:1, 1:N, M:N), participation constraints (total vs partial), weak entity + identifying owner + partial key.',
        fatWeight: 'Numerical / Diagram',
      },
      {
        id: 'm2-t2',
        title: 'Extended ER (EER) Modeling',
        detail: 'Superclass/subclass, specialization & generalization, disjoint (d) vs overlapping (o), total (double line) vs partial participation, attribute inheritance, aggregation.',
        fatWeight: 'High Yield',
      },
      {
        id: 'm2-t3',
        title: '7-Step ER/EER-to-Relational Mapping',
        detail: 'Regular entities -> tables; weak entities -> include owner PK; 1:1 -> merge or FK on total side; 1:N -> FK on N-side; M:N -> junction table; multivalued -> separate table; N-ary -> table with all FKs; EER options 8A–8D.',
        fatWeight: 'Numerical / Diagram',
      },
      {
        id: 'm2-t4',
        title: 'Functional Dependencies, Axioms & Minimal Cover',
        detail: 'Armstrong axioms (Reflexivity, Augmentation, Transitivity) + Union, Decomposition, Pseudotransitivity. Attribute closure X+, equivalence of FD sets, 3-step Minimal/Canonical Cover.',
        fatWeight: 'Numerical / Diagram',
      },
      {
        id: 'm2-t5',
        title: 'Normalization: 1NF, 2NF, 3NF & BCNF',
        detail: '1NF (atomic domains), 2NF (no partial dependency on candidate key), 3NF (no transitive dependency; X->A has X superkey or A prime), BCNF (every non-trivial X->A has X superkey). Lossless-join & dependency-preservation trade-offs.',
        fatWeight: 'Numerical / Diagram',
      },
      {
        id: 'm2-t6',
        title: 'Multivalued (4NF) & Join Dependencies (5NF)',
        detail: 'MVD X ->-> Y when independent multi-valued facts mix in one table (4NF eliminates non-trivial MVDs unless X is superkey). 5NF (PJNF) eliminates non-trivial join dependencies.',
        fatWeight: 'High Yield',
      },
    ],
    keyFormulasAndRules: [
      { label: 'Lossless Join Check (R1, R2)', value: '(R1 ∩ R2) -> R1  OR  (R1 ∩ R2) -> R2 holds in F+' },
      { label: '3NF Condition (X -> A)', value: 'X is a Superkey  OR  A is a Prime Attribute' },
      { label: 'BCNF Condition (X -> A)', value: 'X MUST be a Superkey (stricter; may lose FD preservation)' },
      { label: 'Minimal Cover 3 Steps', value: '1) Singleton RHS  2) Drop extraneous LHS attrs  3) Drop redundant FDs' },
    ],
    comparisonTable: {
      title: 'Normal Form Hierarchy & Trade-Offs',
      headers: ['Normal Form', 'Eliminates', 'Lossless Join?', 'Dependency Preserving?'],
      rows: [
        ['1NF', 'Repeating groups & non-atomic values', 'Base form', 'Base form'],
        ['2NF', 'Partial dependencies (proper subset of CK -> non-prime)', 'Always achievable', 'Always achievable'],
        ['3NF', 'Transitive dependencies (non-superkey -> non-prime)', 'Always achievable', 'Always achievable'],
        ['BCNF', 'All non-trivial FDs where LHS is not a superkey', 'Always achievable', 'Not always guaranteed'],
        ['4NF', 'Independent multivalued dependencies (X ->-> Y)', 'Always achievable', 'N/A (MVD level)'],
        ['5NF (PJNF)', 'Join dependencies not implied by candidate keys', 'Always achievable', 'N/A (JD level)'],
      ],
    },
    likelyFatQuestions: [
      'Design an EER diagram (e.g., Hospital, Bank, or University) with a weak entity and specialization, then map every entity/relationship to relational tables.',
      'Given R(A,B,C,D,E,F) and a set of FDs, find all candidate keys, compute the minimal cover, and decompose into 3NF/BCNF proving lossless join.',
      'Explain why a relation in 3NF can still fail BCNF with an example, and differentiate 4NF from 5NF.',
    ],
    recommendedLab: 'normalization',
  },
  {
    id: 'm3',
    number: 3,
    title: 'Physical Database Design and Query Processing',
    hours: 9,
    examFocus: 'Static/dynamic hashing, B+ tree order & insertion, LSM trees, Relational Algebra/TRC queries, and Heuristic Query Tree optimization.',
    topics: [
      {
        id: 'm3-t1',
        title: 'File Organization: Unordered & Ordered Records',
        detail: 'Heap (unordered) vs Sorted (sequential) files: cost of scan, equality search (O(N/2) vs O(log2 b)), range search, insertion, and deletion (overflow blocks / deletion markers).',
        fatWeight: 'Core',
      },
      {
        id: 'm3-t2',
        title: 'Hashing Techniques: Static & Dynamic',
        detail: 'Static hashing (bucket overflow chains). Dynamic hashing: Extendible Hashing (directory with global depth d and bucket local depth d\') and Linear Hashing (gradual bucket splits using split pointer n).',
        fatWeight: 'High Yield',
      },
      {
        id: 'm3-t3',
        title: 'Single-Level, Multi-Level & B+ Tree Indexing',
        detail: 'Primary, Clustering, Secondary indexes (dense vs sparse). B+ tree: data pointers only at leaves, linked leaf sequence, internal node order p. LSM trees (MemTable, WAL, immutable SSTables, compaction for write-heavy workloads).',
        fatWeight: 'Numerical / Diagram',
      },
      {
        id: 'm3-t4',
        title: 'Relational Algebra & SQL Translation',
        detail: 'Unary: σ (Select), π (Project), ρ (Rename). Binary: ∪, ∩, −, ×, ⋈ (Theta/Equi/Natural Join), ÷ (Division for "for all" queries). Translating nested/join SQL into RA.',
        fatWeight: 'Numerical / Diagram',
      },
      {
        id: 'm3-t5',
        title: 'Tuple Relational Calculus (TRC)',
        detail: 'Non-procedural declarative queries: { t | P(t) } using existential (∃) and universal (∀) quantifiers, safe expressions.',
        fatWeight: 'High Yield',
      },
      {
        id: 'm3-t6',
        title: 'Query Optimization & Heuristic Query Trees',
        detail: 'Canonical query tree construction. Heuristic rules: cascade σ, push σ down below ⋈/×, push π down, execute most restrictive σ and smallest ⋈ first, convert × + σ into ⋈.',
        fatWeight: 'Numerical / Diagram',
      },
    ],
    keyFormulasAndRules: [
      { label: 'B+ Tree Internal Node', value: 'At most p tree pointers and p-1 search keys; min ceil(p/2) pointers' },
      { label: 'B+ Tree Leaf Node', value: 'At most p_leaf - 1 (key, data_ptr) pairs + 1 next-leaf sibling pointer' },
      { label: 'RA Division (R ÷ S)', value: 'π_{A}(R) − π_{A}( (π_{A}(R) × S) − R )  [used for "every/all" queries]' },
      { label: 'Heuristic Priority', value: '1) Break & push σ down  2) Reorder joins (smallest first)  3) Push π down' },
    ],
    comparisonTable: {
      title: 'B+ Tree vs LSM Tree & Static vs Dynamic Hashing',
      headers: ['Structure', 'Read Workload', 'Write Workload', 'Key Mechanism'],
      rows: [
        ['B+ Tree', 'Fast point & range O(log_p N)', 'In-place page split/merge (random I/O)', 'Balanced multi-level sorted pages + linked leaves'],
        ['LSM Tree', 'Needs Bloom filters + multi-level check', 'Ultra-fast sequential append', 'In-memory MemTable -> flushed SSTables -> compaction'],
        ['Extendible Hash', 'O(1) directory + 1 bucket I/O', 'Directory doubles when d\' == d', 'Global depth d, local depth d\', bit-prefix trie'],
        ['Linear Hash', '1–2 I/Os (overflow chains possible)', 'Predictable incremental split', 'Level i hash functions h_i, h_{i+1} + split pointer n'],
      ],
    },
    likelyFatQuestions: [
      'Construct a B+ tree of order p=3 or p=4 step-by-step for a given key sequence and show leaf node splits.',
      'Translate 3 SQL queries (including Division / Group / Join) into Relational Algebra and Tuple Relational Calculus.',
      'Draw the initial canonical Query Tree for a multi-table SQL query and apply heuristic optimization rules step-by-step.',
    ],
    recommendedLab: 'bplus',
  },
  {
    id: 'm4',
    number: 4,
    title: 'Transaction Processing, Concurrency Control and Recovery',
    hours: 10,
    examFocus: 'ACID, Conflict Serializability precedence graphs, Strict 2PL, Deadlock (Wait-Die / Wound-Wait), Timestamp Ordering, and Deferred vs Immediate Recovery.',
    topics: [
      {
        id: 'm4-t1',
        title: 'ACID Properties & Transaction State Diagram',
        detail: 'Atomicity, Consistency, Isolation, Durability. States: Active -> Partially Committed -> Committed, or Failed -> Aborted/Terminated. System log records.',
        fatWeight: 'Core',
      },
      {
        id: 'm4-t2',
        title: 'Concurrency Problems & Schedule Classification',
        detail: 'Lost update, Dirty read (temporary update), Incorrect summary, Unrepeatable read. Recoverable, Cascadeless (ACA), and Strict schedules.',
        fatWeight: 'High Yield',
      },
      {
        id: 'm4-t3',
        title: 'Conflict Serializability & Precedence Graphs',
        detail: 'Conflicting ops (RW, WR, WW on same item by different Ti, Tj). Draw directed graph; acyclic <=> conflict serializable; topological sort gives equivalent serial schedule.',
        fatWeight: 'Numerical / Diagram',
      },
      {
        id: 'm4-t4',
        title: 'Two-Phase Locking (2PL) & Deadlock Handling',
        detail: 'Growing & Shrinking phases. Basic, Conservative, Strict (hold X-locks until commit), Rigorous 2PL. Deadlock prevention: Wait-Die (non-preemptive) vs Wound-Wait (preemptive); Wait-for graph detection; starvation prevention.',
        fatWeight: 'Numerical / Diagram',
      },
      {
        id: 'm4-t5',
        title: 'Timestamp Ordering & Multiple Granularity Locking',
        detail: 'Basic TO & Thomas Write Rule (read_TS(X), write_TS(X)). Granularity hierarchy (DB -> File -> Page -> Record) with Intention locks (IS, IX, SIX).',
        fatWeight: 'High Yield',
      },
      {
        id: 'm4-t6',
        title: 'Database Recovery: Deferred vs Immediate Update',
        detail: 'No-steal/Force vs Steal/No-force buffer policies, Checkpointing, Shadow Paging. Deferred Update (NO-UNDO / REDO) vs Immediate Update (UNDO / REDO) from system log.',
        fatWeight: 'Numerical / Diagram',
      },
    ],
    keyFormulasAndRules: [
      { label: 'Strict Schedule Hierarchy', value: 'Strict ⊂ Cascadeless ⊂ Recoverable (every Strict schedule is Cascadeless)' },
      { label: 'Wait-Die (Older requests)', value: 'Older Ti WAITS for younger Tj; Younger Ti ABORTS (dies) if Tj holds lock' },
      { label: 'Wound-Wait (Older requests)', value: 'Older Ti WOUNDS (aborts) younger Tj; Younger Ti WAITS for older Tj' },
      { label: 'Basic TO Rollback Rule', value: 'Read(X) fails if TS(T) < write_TS(X); Write(X) fails if TS(T) < read_TS(X) or write_TS(X)' },
    ],
    comparisonTable: {
      title: 'Recovery Algorithms Comparison',
      headers: ['Technique', 'Buffer Policy', 'Before Commit Disk Write?', 'On Crash Action'],
      rows: [
        ['Deferred Update', 'No-Steal / Force (or No-Force)', 'No (writes buffered until commit)', 'NO-UNDO needed; REDO committed txns only'],
        ['Immediate Update', 'Steal / No-Force', 'Yes (dirty pages may flush early)', 'UNDO uncommitted txns (backward) + REDO committed (forward)'],
        ['Shadow Paging', 'Copy-on-Write directories', 'Writes go to new shadow pages', 'Discard current page table; no log REDO/UNDO needed'],
      ],
    },
    likelyFatQuestions: [
      'Given an interleaved schedule S with T1, T2, T3, draw the Precedence Graph, test conflict serializability, find an equivalent serial order, and check Recoverability/Strictness.',
      'Trace a system log crash scenario under Deferred Update vs Immediate Update with a Checkpoint, listing exact UNDO and REDO transaction sets.',
      'Compare Wait-Die vs Wound-Wait deadlock prevention and explain Intention locks (IS, IX, SIX) with the compatibility matrix.',
    ],
    recommendedLab: 'serializability',
  },
  {
    id: 'm5',
    number: 5,
    title: 'Distributed and NoSQL Databases',
    hours: 7,
    examFocus: 'DDBMS architectures, Horizontal/Vertical fragmentation, 2PC, CAP Theorem, ACID vs BASE, and the 4 NoSQL models + MapReduce.',
    topics: [
      {
        id: 'm5-t1',
        title: 'Distributed Database Architectures & Transparency',
        detail: 'Homogeneous vs Heterogeneous, Shared-Nothing / Shared-Disk / Shared-Memory, Location, Fragmentation, and Replication transparency.',
        fatWeight: 'Core',
      },
      {
        id: 'm5-t2',
        title: 'Data Fragmentation, Replication & Allocation',
        detail: 'Horizontal (σ selection, disjointness & completeness), Vertical (π projection + primary key), Mixed/Hybrid. Full vs Partial vs No replication. Allocation strategies.',
        fatWeight: 'Numerical / Diagram',
      },
      {
        id: 'm5-t3',
        title: 'Distributed Transactions, 2PC & Query Processing',
        detail: 'Two-Phase Commit (2PC): Prepare/Voting phase + Commit/Decision phase (Coordinator vs Participants, blocking risk). Semijoin (R ⋉ S) to minimize network transfer cost.',
        fatWeight: 'High Yield',
      },
      {
        id: 'm5-t4',
        title: 'CAP Theorem & ACID vs BASE',
        detail: 'Consistency (linearizability), Availability (every non-failing node responds), Partition Tolerance (mandatory in distributed networks -> choose CP or AP). BASE: Basically Available, Soft state, Eventual consistency.',
        fatWeight: 'High Yield',
      },
      {
        id: 'm5-t5',
        title: 'NoSQL Modeling, Distribution & MapReduce',
        detail: 'Aggregate data models (minimizing cross-node joins), Sharding (consistent hashing), Master-Slave vs Peer-to-Peer replication, MapReduce (Map emit key-value -> Shuffle/Sort -> Reduce aggregate).',
        fatWeight: 'Core',
      },
      {
        id: 'm5-t6',
        title: 'Four Types of NoSQL Databases',
        detail: 'Key-Value (Redis, DynamoDB), Document-Based (MongoDB), Column-Based / Wide-Column (Cassandra, HBase), Graph Databases (Neo4j).',
        fatWeight: 'High Yield',
      },
    ],
    keyFormulasAndRules: [
      { label: 'Horizontal Fragmentation Rules', value: 'Completeness (union = R), Reconstruction (∪ fragments = R), Disjointness' },
      { label: 'Vertical Fragmentation Rules', value: 'Every fragment must include Primary Key so Natural Join reconstructs R' },
      { label: 'CAP Under Partition (P)', value: 'Network partitions happen -> Real distributed systems are either CP or AP' },
      { label: 'Semijoin Cost Reduction', value: 'R ⋉ S = π_R(R ⋈ S): send only join attributes across network first' },
    ],
    comparisonTable: {
      title: 'Four NoSQL Database Families',
      headers: ['Type', 'Data Unit', 'CAP / Scaling Bias', 'Example Systems & Best Fit'],
      rows: [
        ['Key-Value', 'Opaque blob by key', 'AP / Ultra-low latency sharding', 'Redis, DynamoDB — session cache, cart'],
        ['Document', 'JSON / BSON nested aggregates', 'CP or tunable — sharded collections', 'MongoDB — product catalogs, CMS'],
        ['Column-Family', 'Row key + dynamic column families', 'AP — ring consistent hashing', 'Cassandra, HBase — time-series, write-heavy'],
        ['Graph', 'Nodes + typed relationships', 'CP — index-free adjacency', 'Neo4j — recommendations, fraud detection'],
      ],
    },
    likelyFatQuestions: [
      'Design horizontal and vertical fragments for a given relation and verify Completeness, Reconstruction, and Disjointness.',
      'Explain CAP Theorem and compare ACID vs BASE properties with concrete NoSQL trade-offs.',
      'Compare Key-Value, Document, Column-Based, and Graph databases, and trace a MapReduce word/log-aggregation pipeline.',
    ],
    recommendedLab: 'cap_nosql',
  },
];

export const SPRINT_BLOCKS: SprintBlock[] = [
  {
    id: 'sb-1',
    day: 'Nov 21',
    timeSlot: '09:00 – 11:30',
    durationLabel: '2.5 hrs',
    title: 'Module 1: Three-Schema, Data Models & Integrity Rules',
    moduleId: 'm1',
    syllabusHours: 7,
    focusSummary: 'Lock down schema levels, data independence, modern DB models, and FK violation actions (Cascade vs Restrict).',
    checklist: [
      'Memorize Three-Schema Architecture & Logical vs Physical Independence',
      'Review Relational, Semi-structured, Graph, Vector, Time-Series models',
      'Practice Insert/Delete/Update integrity constraint violation tracing',
    ],
    targetView: 'syllabus',
    targetLab: 'integrity',
  },
  {
    id: 'sb-2',
    day: 'Nov 21',
    timeSlot: '11:45 – 14:15',
    durationLabel: '2.5 hrs',
    title: 'Module 2A: ER/EER Modeling & 7-Step Relational Mapping',
    moduleId: 'm2',
    syllabusHours: 4,
    focusSummary: 'Draw weak entities, total/disjoint EER hierarchies, and convert M:N, N-ary, and multivalued attributes into tables.',
    checklist: [
      'Master double-rectangle weak entity + identifying relationship notation',
      'Practice EER disjoint (d) / overlapping (o) & total/partial specialization',
      'Walk through all 7 ER-to-Relational + 4 EER mapping options (8A–8D)',
    ],
    targetView: 'syllabus',
    targetLab: 'er_mapping',
  },
  {
    id: 'sb-3',
    day: 'Nov 21',
    timeSlot: '15:15 – 18:30',
    durationLabel: '3.25 hrs',
    title: 'Module 2B: FDs, Minimal Cover & 1NF–BCNF–4NF–5NF',
    moduleId: 'm2',
    syllabusHours: 6,
    focusSummary: 'Guaranteed 10-mark FAT numericals: candidate keys, canonical cover, 3NF synthesis, and BCNF lossless check.',
    checklist: [
      'Solve 3 candidate-key + attribute closure problems in the Normalization Lab',
      'Trace the 3-step Minimal Cover algorithm without skipping step 2',
      'Distinguish 3NF vs BCNF and MVD (4NF) vs Join Dependency (5NF)',
    ],
    targetView: 'labs',
    targetLab: 'normalization',
  },
  {
    id: 'sb-4',
    day: 'Nov 21',
    timeSlot: '19:30 – 22:00',
    durationLabel: '2.5 hrs',
    title: 'Module 3A: File Structures, Dynamic Hashing, B+ & LSM Trees',
    moduleId: 'm3',
    syllabusHours: 5,
    focusSummary: 'Extendible vs Linear hashing mechanics, B+ tree order splits, and LSM MemTable/SSTable compaction.',
    checklist: [
      'Build & split keys in the B+ Tree Visualizer at order p=3 and p=4',
      'Contrast Extendible Hashing (global/local depth) vs Linear Hashing',
      'Review LSM tree write amplification & Bloom filter read path',
    ],
    targetView: 'labs',
    targetLab: 'bplus',
  },
  {
    id: 'sb-5',
    day: 'Nov 22',
    timeSlot: '08:30 – 11:00',
    durationLabel: '2.5 hrs',
    title: 'Module 3B: Relational Algebra, TRC & Heuristic Query Trees',
    moduleId: 'm3',
    syllabusHours: 4,
    focusSummary: 'Translate SQL queries (including Division ÷) into RA + TRC, then push σ and π down query trees.',
    checklist: [
      'Drill RA operators: σ, π, ⋈, and Division (R ÷ S) for "all" queries',
      'Write safe Tuple Relational Calculus expressions with ∃ and ∀',
      'Apply the 5-step heuristic query tree optimization transformation',
    ],
    targetView: 'syllabus',
    targetLab: 'ra_trc_tree',
  },
  {
    id: 'sb-6',
    day: 'Nov 22',
    timeSlot: '11:15 – 14:00',
    durationLabel: '2.75 hrs',
    title: 'Module 4A: ACID, Recoverability & Conflict Serializability',
    moduleId: 'm4',
    syllabusHours: 5,
    focusSummary: 'Precedence graphs, cycle detection, topological serial order, and Recoverable vs Cascadeless vs Strict.',
    checklist: [
      'Test 4 schedules in the Conflict Serializability Lab (RW/WR/WW edges)',
      'Verify Strict ⊂ Cascadeless ⊂ Recoverable using dirty-read examples',
      'Draw the 5-state Transaction lifecycle diagram from memory',
    ],
    targetView: 'labs',
    targetLab: 'serializability',
  },
  {
    id: 'sb-7',
    day: 'Nov 22',
    timeSlot: '15:00 – 17:45',
    durationLabel: '2.75 hrs',
    title: 'Module 4B: 2PL, Deadlocks, Timestamp Ordering & Recovery',
    moduleId: 'm4',
    syllabusHours: 5,
    focusSummary: 'Strict/Rigorous 2PL, Wait-Die vs Wound-Wait, Intention locks (IS/IX/SIX), and Deferred vs Immediate log recovery.',
    checklist: [
      'Compare Wait-Die (older waits) vs Wound-Wait (older aborts younger)',
      'Practice Basic Timestamp Ordering & Thomas Write Rule checks',
      'Trace UNDO/REDO transaction lists under Deferred vs Immediate Update',
    ],
    targetView: 'syllabus',
    targetLab: 'two_pl_deadlock',
  },
  {
    id: 'sb-8',
    day: 'Nov 22',
    timeSlot: '18:30 – 21:00',
    durationLabel: '2.5 hrs',
    title: 'Module 5: Distributed DBs, Fragmentation, CAP & NoSQL',
    moduleId: 'm5',
    syllabusHours: 7,
    focusSummary: 'Horizontal/Vertical fragmentation rules, 2PC, CAP theorem, ACID vs BASE, 4 NoSQL models, and MapReduce.',
    checklist: [
      'Explore CP vs AP trade-offs and NoSQL families in the CAP & NoSQL Lab',
      'Verify Horizontal (Completeness/Disjointness) & Vertical (PK join) rules',
      'Review Two-Phase Commit (Prepare + Commit) & Semijoin cost savings',
    ],
    targetView: 'labs',
    targetLab: 'cap_nosql',
  },
  {
    id: 'sb-9',
    day: 'Nov 22',
    timeSlot: '21:15 – 23:00',
    durationLabel: '1.75 hrs',
    title: 'Full Timed FAT Mock Exam & Missed-Topic Repair',
    moduleId: 'all',
    syllabusHours: 0,
    focusSummary: 'Complete the 110-question BACSE202 Mock FAT bank covering Part A (2M) & Part B (10M) analytical patterns and patch weak spots.',
    checklist: [
      'Drill Part A (2M) & Part B (10M) FAT Mock questions under timed exam conditions',
      'Review every missed question explanation and redo its corresponding lab',
      'Sleep by 23:15 so morning recall on Nov 23 is sharp',
    ],
    targetView: 'mock',
  },
  {
    id: 'sb-10',
    day: 'Nov 23',
    timeSlot: '07:00 – 08:15',
    durationLabel: '1.25 hrs',
    title: 'Exam Morning Rapid Formula & Diagram Scan (9:00 AM Exam)',
    moduleId: 'all',
    syllabusHours: 0,
    focusSummary: 'Zero new cramming — review key formulas, Armstrong axioms, B+ tree bounds, 2PL deadlock matrix, and CAP.',
    checklist: [
      'Skim key formulas across Modules 1–5 without starting heavy derivations',
      'Verify exam kit (ID card, pens, calculator if allowed) by 08:20 AM',
    ],
    targetView: 'syllabus',
    targetLab: 'exam_drill',
  },
];

export const FAT_QUESTIONS: FatQuestion[] = [
  {
    id: 'q1',
    moduleId: 'm1',
    part: 'Part A (Short)',
    marks: 2,
    prompt: 'Which level of data independence allows modifying file organizations or adding B+ tree indexes without rewriting the conceptual schema or application queries?',
    options: [
      'Logical data independence',
      'Physical data independence',
      'External view independence',
      'Referential independence',
    ],
    correctIndex: 1,
    explanation: 'Physical data independence insulates the conceptual schema from changes to the internal (physical storage/indexing) schema in the Three-Schema Architecture.',
  },
  {
    id: 'q2',
    moduleId: 'm1',
    part: 'Part A (Short)',
    marks: 2,
    prompt: 'Deleting a referenced tuple from a parent relation (e.g., DEPARTMENT) when child tuples in EMPLOYEE still reference its primary key violates which constraint?',
    options: [
      'Domain constraint',
      'Entity integrity constraint',
      'Referential integrity constraint',
      'Key uniqueness constraint',
    ],
    correctIndex: 2,
    explanation: 'Entity integrity only forbids NULL in a primary key. Deleting a referenced parent tuple creates dangling foreign keys in EMPLOYEE, violating Referential Integrity.',
  },
  {
    id: 'q3',
    moduleId: 'm1',
    part: 'Part A (Short)',
    marks: 2,
    prompt: 'Which database category stores high-dimensional embeddings and relies on approximate nearest neighbor (ANN) indexes for semantic similarity retrieval?',
    options: [
      'Time-series database',
      'Vector database',
      'Document database',
      'Column-family database',
    ],
    correctIndex: 1,
    explanation: 'Vector databases store dense numerical feature vectors (embeddings) and support k-NN / ANN distance queries (cosine, L2) for similarity search.',
  },
  {
    id: 'q4',
    moduleId: 'm2',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt: 'Consider relation R(A, B, C, D, E) with FDs: A -> BC, CD -> E, B -> D, E -> A. Which set lists ALL candidate keys of R?',
    codeOrSchema: 'R(A, B, C, D, E)  |  F = { A -> BC, CD -> E, B -> D, E -> A }',
    options: [
      '{ A } only',
      '{ A, E, BC, CD }',
      '{ A, E, BC }',
      '{ AB, CD, E }',
    ],
    correctIndex: 1,
    explanation: 'A+ = {A,B,C,D,E}. Since E -> A, E+ = {A,B,C,D,E}. For BC: B -> D gives {B,C,D}, then CD -> E -> A gives all 5 attributes (neither B nor C alone reaches all). For CD: CD -> E -> A -> BC gives all 5 attributes. Thus candidate keys are A, E, BC, and CD.',
  },
  {
    id: 'q5',
    moduleId: 'm2',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt: 'Given R(A, B, C, D) with FDs { AB -> C, C -> D, D -> A }, what is the highest normal form of R?',
    codeOrSchema: 'R(A, B, C, D)  |  Candidate Keys: AB, BC, BD',
    options: [
      '1NF (fails 2NF due to partial dependency)',
      '2NF (fails 3NF due to transitive dependency)',
      '3NF (every RHS is prime, but fails BCNF)',
      'BCNF (all LHS are superkeys)',
    ],
    correctIndex: 2,
    explanation: 'Candidate keys are AB, BC, and BD, so Prime attributes = {A, B, C, D} (all attributes are prime!). Therefore no non-prime attribute exists to violate 2NF or 3NF. However, C -> D and D -> A have non-superkey LHS, so R is in 3NF but NOT BCNF.',
  },
  {
    id: 'q6',
    moduleId: 'm2',
    part: 'Part A (Short)',
    marks: 2,
    prompt: 'When mapping a 1:N binary relationship between DEPARTMENT (1-side) and EMPLOYEE (N-side) to relational tables, where should the foreign key be placed?',
    options: [
      'In DEPARTMENT referencing EMPLOYEE',
      'In EMPLOYEE referencing DEPARTMENT',
      'In a mandatory third junction relation',
      'Duplicated in both tables',
    ],
    correctIndex: 1,
    explanation: 'In ER-to-Relational Step 4 (1:N relationship), include the primary key of the 1-side (DEPARTMENT) as a foreign key in the relation representing the N-side (EMPLOYEE) to avoid multivalued fields.',
  },
  {
    id: 'q7',
    moduleId: 'm2',
    part: 'Part A (Short)',
    marks: 2,
    prompt: 'Which anomaly is specifically eliminated when decomposing a relation from BCNF into Fourth Normal Form (4NF)?',
    options: [
      'Partial functional dependencies',
      'Transitive functional dependencies',
      'Independent non-trivial multivalued dependencies (X ->-> Y)',
      'Lossy join dependencies across 3+ projections',
    ],
    correctIndex: 2,
    explanation: '4NF targets non-trivial Multivalued Dependencies (X ->-> Y) where X is not a superkey, such as mixing two independent 1:N attributes (Employee ->-> Skill and Employee ->-> Language) in one table.',
  },
  {
    id: 'q8',
    moduleId: 'm3',
    part: 'Part A (Short)',
    marks: 2,
    prompt: 'In an Extendible Hashing index, when does the hash directory double in size during an insertion?',
    options: [
      'Whenever any bucket overflows',
      'When an overflowing bucket has local depth d\' equal to global depth d',
      'Every time the load factor exceeds 50%',
      'Only when all buckets reach maximum capacity simultaneously',
    ],
    correctIndex: 1,
    explanation: 'If local depth d\' < global depth d, only the overflowing bucket splits and directory pointers are reassigned. Directory doubling occurs only when d\' == d.',
  },
  {
    id: 'q9',
    moduleId: 'm3',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt: 'In a B+ Tree of order p = 4 (max 4 pointers / 3 keys per internal node, and max 3 keys per leaf), what happens when a leaf node containing [10, 20, 30] receives key 25?',
    options: [
      'Leaf splits into [10, 20] and [25, 30]; key 25 is copied up to the parent internal node',
      'Leaf splits into [10, 20] and [30]; key 25 moves up and is removed from leaves',
      'Leaf holds [10, 20, 25, 30] because max keys equals p',
      'Tree height shrinks by merging with the left sibling',
    ],
    correctIndex: 0,
    explanation: 'A B+ tree keeps ALL search keys in the leaves. When [10, 20, 25, 30] overflows max 3 keys, it splits into [10, 20] and [25, 30], and the smallest key of the right leaf (25) is COPIED up as a routing key to the parent.',
  },
  {
    id: 'q10',
    moduleId: 'm3',
    part: 'Part A (Short)',
    marks: 2,
    prompt: 'Why do LSM-Tree storage engines (e.g., RocksDB, Cassandra) achieve dramatically higher write throughput than traditional B+ Trees?',
    options: [
      'They bypass crash logging entirely',
      'Writes append sequentially to a WAL and in-memory MemTable, flushing sorted SSTables later',
      'They store all data uncompressed in CPU L1 cache',
      'They forbid secondary indexes and range scans',
    ],
    correctIndex: 1,
    explanation: 'LSM trees convert random disk writes into sequential appends (WAL + MemTable -> immutable SSTables merged via background compaction), avoiding random in-place page updates.',
  },
  {
    id: 'q11',
    moduleId: 'm3',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt: 'During Heuristic Query Optimization on a query tree, which transformation yields the largest intermediate tuple reduction first?',
    options: [
      'Execute Cartesian Product (×) before Selection (σ)',
      'Push Selection (σ) and Projection (π) operations as far down the tree as possible before Joins',
      'Evaluate Projection (π) only at the root after all joins complete',
      'Convert Natural Joins into Cartesian Products',
    ],
    correctIndex: 1,
    explanation: 'Pushing σ down filters tuples early and pushing π down eliminates unneeded columns early, drastically shrinking the relation sizes fed into expensive Join (⋈) nodes.',
  },
  {
    id: 'q12',
    moduleId: 'm3',
    part: 'Part A (Short)',
    marks: 2,
    prompt: 'Which Relational Algebra operator is used to find students who have enrolled in EVERY course offered by the CSE department?',
    options: [
      'Natural Join (⋈)',
      'Outer Union (⟕)',
      'Division (÷)',
      'Set Difference (−) alone',
    ],
    correctIndex: 2,
    explanation: 'Relational Division R(A, B) ÷ S(B) returns A-values paired with EVERY B-value present in S, directly expressing universal quantification ("for all").',
  },
  {
    id: 'q13',
    moduleId: 'm4',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt: 'Analyze the schedule S = R1(X); R2(X); W1(X); W2(X). What does its Precedence Graph show?',
    codeOrSchema: 'S:  R1(X) -> R2(X) -> W1(X) -> W2(X)',
    options: [
      'Acyclic graph; equivalent serial schedule is T1 -> T2',
      'Acyclic graph; equivalent serial schedule is T2 -> T1',
      'Cycle T1 -> T2 -> T1; NOT conflict serializable',
      'Cycle exists, but Strict 2PL allows it without rollback',
    ],
    correctIndex: 2,
    explanation: 'R1(X) before W2(X) adds edge T1 -> T2. R2(X) before W1(X) adds edge T2 -> T1. The cycle T1 -> T2 -> T1 proves S is NOT conflict serializable.',
  },
  {
    id: 'q14',
    moduleId: 'm4',
    part: 'Part A (Short)',
    marks: 2,
    prompt: 'Under the Wound-Wait deadlock prevention scheme, what happens when an older transaction T_old requests a lock currently held by a younger transaction T_young?',
    options: [
      'T_old aborts and restarts with a new timestamp',
      'T_old waits patiently until T_young commits',
      'T_young is preemptively aborted (wounded) and releases the lock to T_old',
      'Both T_old and T_young enter a wait-for cycle',
    ],
    correctIndex: 2,
    explanation: 'Wound-Wait is preemptive: older wounds (aborts) younger; younger waits for older. In contrast, Wait-Die is non-preemptive: older waits, younger dies.',
  },
  {
    id: 'q15',
    moduleId: 'm4',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt: 'In Deferred Update (NO-UNDO / REDO) recovery, what action is taken after a crash for transactions that started before the crash but have NO [commit, Ti] record in the log?',
    options: [
      'Run UNDO on all write_item log entries in reverse order',
      'Do nothing (ignore them), because deferred writes never reached disk before commit',
      'Run REDO on their partial updates and mark them committed',
      'Restore from the previous week shadow directory',
    ],
    correctIndex: 1,
    explanation: 'Deferred Update follows a No-Steal policy: database buffers are not flushed to disk until after COMMIT. Hence uncommitted transactions leave zero dirty changes on disk and need NO UNDO.',
  },
  {
    id: 'q16',
    moduleId: 'm4',
    part: 'Part A (Short)',
    marks: 2,
    prompt: 'In Multiple Granularity Locking, before acquiring an Exclusive (X) lock on a single record, what lock must a transaction hold on the parent Table and Database?',
    options: [
      'Shared (S) lock',
      'Intention Exclusive (IX) lock',
      'Intention Shared (IS) lock',
      'No parent lock is needed',
    ],
    correctIndex: 1,
    explanation: 'To lock a lower-level node in X mode, all ancestor nodes along the path from the root must be locked in IX (or SIX/X) mode so coarse-grain conflicts are detected at the top.',
  },
  {
    id: 'q17',
    moduleId: 'm5',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt: 'Which three correctness rules MUST a Horizontal Fragmentation {F1, F2, ..., Fn} of relation R satisfy?',
    options: [
      'Atomicity, Isolation, Durability',
      'Completeness, Reconstruction (via Union ∪), and Disjointness',
      'Lossless Join, Dependency Preservation, and BCNF',
      'Consistency, Availability, and Partition Tolerance',
    ],
    correctIndex: 1,
    explanation: 'Horizontal fragmentation partitions tuples using selection predicates and must satisfy Completeness (every tuple appears in >=1 fragment), Reconstruction (R = F1 ∪ F2 ∪ ... ∪ Fn), and Disjointness (no tuple duplicated across fragments).',
  },
  {
    id: 'q18',
    moduleId: 'm5',
    part: 'Part A (Short)',
    marks: 2,
    prompt: 'According to Brewer\'s CAP Theorem, when a network partition (P) occurs in a distributed datastore, what binary choice must the system architect make?',
    options: [
      'Choose between Partition Tolerance (P) and Durability (D)',
      'Choose between Consistency (C) and Availability (A)',
      'Choose between Replication and Fragmentation',
      'Drop both C and A until MapReduce finishes',
    ],
    correctIndex: 1,
    explanation: 'Because network partitions are unavoidable in distributed systems, during a partition a system must choose either Consistency (reject writes/reads on minority side -> CP) or Availability (serve potentially stale data -> AP).',
  },
  {
    id: 'q19',
    moduleId: 'm5',
    part: 'Part A (Short)',
    marks: 2,
    prompt: 'Which pair correctly maps BASE properties used by high-availability NoSQL systems?',
    options: [
      'Basically Consistent, Atomic State, Eventual Locking',
      'Basically Available, Soft State, Eventual Consistency',
      'Binary Access, Shared Engine, Exact Consistency',
      'Balanced Allocation, Strict State, Elastic Consistency',
    ],
    correctIndex: 1,
    explanation: 'BASE stands for Basically Available, Soft state (state may change over time without input due to async sync), and Eventual consistency.',
  },
  {
    id: 'q20',
    moduleId: 'm5',
    part: 'Part A (Short)',
    marks: 2,
    prompt: 'During Two-Phase Commit (2PC), what happens in Phase 1 (Prepare/Voting) before the coordinator can issue a Global Commit?',
    options: [
      'Participants delete their undo logs immediately',
      'Coordinator sends PREPARE and must receive YES (Ready) votes from ALL participants',
      'Only a simple majority (>50%) of participants need to reply YES',
      'Participants release all locks before writing log records',
    ],
    correctIndex: 1,
    explanation: '2PC is unanimous: the coordinator writes [prepare] and collects votes; only if EVERY participant force-writes [ready] and votes YES does the coordinator issue Global Commit.',
  },
  ...EXTENDED_FAT_QUESTIONS,
];
