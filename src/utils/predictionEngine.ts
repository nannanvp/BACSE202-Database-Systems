import { MODULES } from '../data/bacse202Data';
import {
  A1_TA1_PAPER,
  A2_TA2_PAPER,
  GeneratedSlotOption,
  GeneratedSlotQuestion,
} from '../data/slotPaperAnalysis';
import type { ModuleId } from './standingEngine';

export type D1CoverageStatus = 'untested' | 'partial' | 'tested';
export type VelloreSlotTag = 'A1+TA1' | 'A2+TA2';
export type PredictionCoverageFilter = 'all' | 'untested' | 'untested_with_vellore' | 'partial' | 'tested';
export type BetaPatternType = 'Sibling Rotation' | 'Anchor Repeat';

export interface VelloreQuestionLink {
  id: string;
  slot: VelloreSlotTag;
  qNo: string;
  displayRef: string;
  marks: number;
  co: string;
  bl: string;
  branch: 'primary' | 'or';
  option: GeneratedSlotOption;
}

export interface TopicPredictionEntry {
  moduleId: ModuleId;
  moduleNumber: number;
  moduleTitle: string;
  topicId: string;
  topicOrder: number; // 1..30
  topicNumberInModule: number; // 1..6
  topicTitle: string;
  topicDetail: string;
  fatWeight: 'Core' | 'High Yield' | 'Numerical / Diagram';
  d1Status: D1CoverageStatus;
  d1Refs: string[];
  d1TestedDetail: string;
  d1UntestedGap: string;
  velloreLinks: VelloreQuestionLink[];
  d2QuestionTypes: string[];
  inAlphaD2: boolean;
  alphaD2SlotRef?: string;
  inBetaD2: boolean;
  betaD2SlotRef?: string;
  betaMechanism?: BetaPatternType;
}

export interface A1ToA2ShiftPattern {
  id: string;
  moduleId: ModuleId;
  moduleLabel: string;
  a1Asked: string;
  a2Asked: string;
  mechanism: BetaPatternType;
  empiricalRule: string;
  d1ChennaiAnchor: string;
  betaD2Projection: string;
}

export interface PredictedD2Question {
  id: string;
  model: 'alpha' | 'beta';
  qNo: string;
  section: 'Section I (7 × 10M)' | 'Section II (2 × 15M)';
  marks: 10 | 15;
  co: 'CO1' | 'CO2' | 'CO3' | 'CO4' | 'CO5';
  bl: string;
  moduleId: ModuleId;
  targetTopicIds: string[];
  title: string;
  d1Counterpart: string;
  betaMechanism?: BetaPatternType;
  a1a2Precedent?: string;
  subQuestions: Array<{ part: string; marks: number; text: string }>;
  rationale: string;
  vellorePrecedentTags: string[];
}

export interface PredictionSummaryStats {
  totalTopics: number;
  untestedInD1: number;
  partialInD1: number;
  testedInD1: number;
  untestedWithVelloreProof: number;
  partialWithVelloreProof: number;
  alphaTotalMarks: number;
  betaTotalMarks: number;
  betaRotationCount: number;
  betaRepeatCount: number;
}

interface RawTopicCoverageMeta {
  d1Status: D1CoverageStatus;
  d1Refs: string[];
  d1TestedDetail: string;
  d1UntestedGap: string;
  velloreSpecs: Array<{
    slot: VelloreSlotTag;
    qNoPrefix: string; // e.g. 'Q1', 'Q5', 'Q8', 'Q9', 'Q10'
    branch: 'primary' | 'or';
    displayRef: string;
  }>;
  d2QuestionTypes: string[];
  inAlphaD2: boolean;
  alphaD2SlotRef?: string;
  inBetaD2: boolean;
  betaD2SlotRef?: string;
  betaMechanism?: BetaPatternType;
}

function resolveVelloreOption(
  slot: VelloreSlotTag,
  qNoPrefix: string,
  branch: 'primary' | 'or',
  displayRef: string
): VelloreQuestionLink {
  const paper: GeneratedSlotQuestion[] = slot === 'A1+TA1' ? A1_TA1_PAPER : A2_TA2_PAPER;
  const match = paper.find((q) => {
    const base = q.qNo.split(/\s+/)[0].toUpperCase();
    return base === qNoPrefix.toUpperCase();
  });
  if (!match) {
    throw new Error(`Unable to resolve ${slot} ${qNoPrefix} in slotPaperAnalysis.ts`);
  }
  const option = branch === 'or' ? match.orOption : match.primary;
  if (!option) {
    throw new Error(`Missing ${branch} option for ${slot} ${qNoPrefix}`);
  }
  return {
    id: `${slot}-${qNoPrefix}-${branch}`,
    slot,
    qNo: match.qNo,
    displayRef,
    marks: match.marks,
    co: match.co,
    bl: match.bl,
    branch,
    option,
  };
}

const RAW_TOPIC_COVERAGE: Record<string, RawTopicCoverageMeta> = {
  // ======================= MODULE 1 (m1-t1 .. m1-t6) =======================
  'm1-t1': {
    d1Status: 'untested',
    d1Refs: [],
    d1TestedDetail: 'Not tested in VIT Chennai D1+TD1.',
    d1UntestedGap: 'File-processing drawbacks, self-describing catalog, program-data independence, and when NOT to use a DBMS.',
    velloreSpecs: [],
    d2QuestionTypes: [
      'Scenario contrast (4M–5M): File-system data redundancy, isolation, and update anomalies vs. DBMS self-describing catalog and controlled sharing.',
      'Applied architectural justification: Identify 4 characteristics of the DBMS approach (program-data independence, multiple user views, concurrency control) in a campus/hospital case.',
    ],
    inAlphaD2: false,
    inBetaD2: false,
  },
  'm1-t2': {
    d1Status: 'partial',
    d1Refs: ['D1 Q1(b) [4M]'],
    d1TestedDetail: 'D1 Q1(b) tested Actors on the Scene (DBA, Designers, End Users, Programmers) for Railway Reservation.',
    d1UntestedGap: 'DBMS Classification (by data model, user count, site distribution, general vs. special purpose) & Workers Behind the Scene were NOT asked in D1.',
    velloreSpecs: [],
    d2QuestionTypes: [
      'Classification short note (4M): Classify DBMS by data model (Relational, Object, NoSQL), number of users, distribution (Centralized vs. Distributed), and cost/purpose.',
      'Contrast Actors on the Scene vs. Workers Behind the Scene (DBMS system designers, tool developers, operators).',
    ],
    inAlphaD2: false,
    inBetaD2: false,
  },
  'm1-t3': {
    d1Status: 'untested',
    d1Refs: [],
    d1TestedDetail: 'Completely untested in VIT Chennai D1+TD1 (D1 Q1 asked DBMS Components + Actors instead).',
    d1UntestedGap: 'ANSI/SPARC Three-Schema Architecture (External, Conceptual, Internal), Schema vs. Instance, and Logical vs. Physical Data Independence.',
    velloreSpecs: [
      { slot: 'A2+TA2', qNoPrefix: 'Q1', branch: 'primary', displayRef: 'A2 Q1 [10M]' },
    ],
    d2QuestionTypes: [
      'Case-study Three-Schema Architecture (6M–10M): Map multi-role users (cashiers, managers, DBAs) to External Views, Conceptual Schema, and Internal Storage with a neat diagram.',
      'Data Independence impact analysis (4M): Justify why migrating storage/indexes needs only Physical Data Independence while adding columns/splitting tables requires Logical Data Independence.',
      'Schema (Intension) vs. Database State/Instance (Extension) distinction with live examples.',
    ],
    inAlphaD2: true,
    alphaD2SlotRef: 'Alpha Q1(a) [6M]',
    inBetaD2: true,
    betaD2SlotRef: 'Beta Q1(a) [6M]',
    betaMechanism: 'Sibling Rotation',
  },
  'm1-t4': {
    d1Status: 'partial',
    d1Refs: ['D1 Q1(a) [6M]'],
    d1TestedDetail: 'D1 Q1(a) tested DBMS Component Modules (DDL/DML compiler, Query Optimizer, Buffer/Storage Manager) for Railway Reservation.',
    d1UntestedGap: 'Centralized vs. 2-Tier / 3-Tier Client-Server DBMS architectures & Modern Data Models (Semi-Structured JSON/XML, Graph, Vector, Time-Series) were NOT asked in D1.',
    velloreSpecs: [
      { slot: 'A1+TA1', qNoPrefix: 'Q1', branch: 'primary', displayRef: 'A1 Q1 [10M]' },
    ],
    d2QuestionTypes: [
      'Client/Server DBMS Architectures (4M): Compare Centralized, 2-Tier (ODBC/JDBC), and 3-Tier (Presentation -> App Server -> DB Server) architectures with a diagram.',
      'Modern Data Model Selection (4M–5M): Choose among Relational, Semi-Structured (JSON/XML), Graph, Vector (embeddings), and Time-Series models for IoT, social, or RAG workloads.',
    ],
    inAlphaD2: true,
    alphaD2SlotRef: 'Alpha Q1(b) [4M]',
    inBetaD2: true,
    betaD2SlotRef: 'Beta Q1(b) [4M]',
    betaMechanism: 'Sibling Rotation',
  },
  'm1-t5': {
    d1Status: 'untested',
    d1Refs: [],
    d1TestedDetail: 'Not tested in VIT Chennai D1+TD1.',
    d1UntestedGap: 'Formal relational model terminology (Domain, Degree/Arity, Cardinality, Tuple ordering irrelevance, Atomic values, 3 NULL semantics).',
    velloreSpecs: [],
    d2QuestionTypes: [
      'Schema inspection & properties (3M–4M): Identify degree, cardinality, candidate keys vs. superkeys, and explain why tuples have no inherent ordering and why NULL means Unknown / Not Applicable / Missing.',
      'Contrast Relational Model mathematical properties (set of tuples, atomic attribute values) against flat tables.',
    ],
    inAlphaD2: false,
    inBetaD2: false,
  },
  'm1-t6': {
    d1Status: 'untested',
    d1Refs: [],
    d1TestedDetail: 'Completely untested in VIT Chennai D1+TD1 — massive Module 1 gap!',
    d1UntestedGap: 'Domain, Key, Entity Integrity (PK ≠ NULL), Referential Integrity (FK), and Insert/Delete/Update Violation Actions (RESTRICT, CASCADE, SET NULL, SET DEFAULT).',
    velloreSpecs: [
      { slot: 'A1+TA1', qNoPrefix: 'Q2', branch: 'primary', displayRef: 'A1 Q2 [10M]' },
      { slot: 'A2+TA2', qNoPrefix: 'Q2', branch: 'primary', displayRef: 'A2 Q2 [10M]' },
    ],
    d2QuestionTypes: [
      'Violation Audit & Trace (6M–10M): Given 2–3 linked tables (e.g., Department/Employee, Hospital, or Project/Grant) and 4–5 concrete INSERT/DELETE/UPDATE operations, identify which constraint is violated (Domain, Key, Entity, Referential).',
      'Referential Action Comparison (4M): Trace exact row-level impact of ON DELETE RESTRICT vs. CASCADE vs. SET NULL vs. SET DEFAULT on parent/child tables.',
    ],
    inAlphaD2: true,
    alphaD2SlotRef: 'Alpha Q2 [10M]',
    inBetaD2: true,
    betaD2SlotRef: 'Beta Q2 [10M]',
    betaMechanism: 'Anchor Repeat',
  },

  // ======================= MODULE 2 (m2-t1 .. m2-t6) =======================
  'm2-t1': {
    d1Status: 'untested',
    d1Refs: [],
    d1TestedDetail: 'D1 Q8(i) only gave a pre-drawn Hotel ER diagram to map into tables — D1 NEVER asked students to design/draw an ER diagram from business rules.',
    d1UntestedGap: 'Designing an ER diagram from scratch (Strong vs. Weak entities, Partial Key, Composite/Multivalued/Derived attributes, Cardinality 1:1/1:N/M:N, Total vs. Partial Participation).',
    velloreSpecs: [
      { slot: 'A2+TA2', qNoPrefix: 'Q3', branch: 'primary', displayRef: 'A2 Q3 [10M]' },
    ],
    d2QuestionTypes: [
      'Full Case-Study ER Diagram Design (8M–10M): Build an ER diagram from business rules (e.g., Hospital, University, E-Commerce, Airport) showing composite/multivalued/derived attributes, weak entities with double rectangles, and (min, max) participation.',
      'Weak Entity & Participation Trap Analysis: Distinguish identifying relationship (double diamond), partial key (dashed underline), and total vs. partial participation.',
    ],
    inAlphaD2: true,
    alphaD2SlotRef: 'Alpha Q8(i) [8M]',
    inBetaD2: true,
    betaD2SlotRef: 'Beta Q8(i) [8M]',
    betaMechanism: 'Sibling Rotation',
  },
  'm2-t2': {
    d1Status: 'untested',
    d1Refs: [],
    d1TestedDetail: 'Completely absent from VIT Chennai D1+TD1 (zero specialization, generalization, disjoint/overlapping, or shared subclass/lattice).',
    d1UntestedGap: 'EER Modeling: Superclass/Subclass, Specialization vs. Generalization, Disjoint (d) vs. Overlapping (o), Total vs. Partial completeness, Shared Subclass (Multiple Inheritance), Union/Category, and Aggregation.',
    velloreSpecs: [
      { slot: 'A1+TA1', qNoPrefix: 'Q3', branch: 'primary', displayRef: 'A1 Q3 [10M]' },
      { slot: 'A2+TA2', qNoPrefix: 'Q9', branch: 'or', displayRef: 'A2 Q9(b) [10M]' },
    ],
    d2QuestionTypes: [
      'Complete EER Diagram Design (8M–10M): Model a domain with Superclass/Subclass hierarchies (e.g., PERSON -> PATIENT/DOCTOR or USER -> BUYER/SELLER with shared subclass), marking {d}/{o} and total/partial lines + attribute inheritance.',
      'EER Concepts & Lattice/Category Distinction (4M–5M): Differentiate Specialization Lattice (shared subclass) vs. Category/Union type (e.g., OWNER = PERSON ∪ BANK ∪ COMPANY) and Aggregation.',
    ],
    inAlphaD2: true,
    alphaD2SlotRef: 'Alpha Q8(i) [8M]',
    inBetaD2: true,
    betaD2SlotRef: 'Beta Q8(i) [8M]',
    betaMechanism: 'Sibling Rotation',
  },
  'm2-t3': {
    d1Status: 'partial',
    d1Refs: ['D1 Q8(i) [8M]'],
    d1TestedDetail: 'D1 Q8(i) tested standard 7-Step ER-to-Relational Mapping on a Hotel Management ER diagram (strong entities, composite Name, 1:1, 1:N, M:N).',
    d1UntestedGap: 'Step 8 (Options 8A, 8B, 8C, 8D) EER Superclass/Subclass-to-Relational Mapping & N-ary/Weak-Entity Mapping trade-offs were NOT tested in D1.',
    velloreSpecs: [],
    d2QuestionTypes: [
      'EER-to-Relational Mapping Options 8A–8D (5M–7M): Map a given specialization hierarchy using 8A (Multiple relations: superclass + subclasses), 8B (Subclass relations only — valid only for total+disjoint), 8C (Single table with type discriminator), and 8D (Single table with boolean flags for overlapping).',
      'Compare NULL-value overhead vs. JOIN cost across Options 8A–8D.',
    ],
    inAlphaD2: true,
    alphaD2SlotRef: 'Alpha Q8(i) [8M]',
    inBetaD2: false,
  },
  'm2-t4': {
    d1Status: 'partial',
    d1Refs: ['D1 Q8(ii) [7M]'],
    d1TestedDetail: 'D1 Q8(ii) tested Attribute Closure (PR)+ [4M] and Candidate Keys [3M] on R(P,Q,R,S,T).',
    d1UntestedGap: 'Minimal (Canonical) Cover 3-step algorithm, Equivalence of two FD sets (F ≡ G), Armstrong Axiom formal proofs, and Chase Test for Lossless Join were NOT tested in D1.',
    velloreSpecs: [
      { slot: 'A1+TA1', qNoPrefix: 'Q2', branch: 'primary', displayRef: 'A1 Q2(B) [4M]' },
    ],
    d2QuestionTypes: [
      'Canonical / Minimal Cover Numerical (5M–7M): Given an FD set F with composite LHS and redundant FDs, compute Fc step-by-step (Singleton RHS -> Drop extraneous LHS attributes -> Drop redundant FDs).',
      'FD Equivalence & Armstrong Proof (4M–5M): Prove whether two FD sets F and G are equivalent (F ⊆ G+ and G ⊆ F+) or derive an FD using Reflexivity, Augmentation, Transitivity, and Pseudotransitivity.',
      'Lossless Join & Dependency Preservation Check (Chase Tableau / Binary Test) on a proposed decomposition.',
    ],
    inAlphaD2: true,
    alphaD2SlotRef: 'Alpha Q8(ii) [7M]',
    inBetaD2: true,
    betaD2SlotRef: 'Beta Q8(ii) [7M]',
    betaMechanism: 'Sibling Rotation',
  },
  'm2-t5': {
    d1Status: 'tested',
    d1Refs: ['D1 Q7(a,b) [4M]'],
    d1TestedDetail: 'D1 Q7(a,b) tested anomalies, 1NF atomicity, FD derivation, and 2NF/3NF/BCNF decomposition on a Multispecialty Hospital table.',
    d1UntestedGap: '3NF Synthesis Algorithm (preserving all FDs) vs. BCNF Decomposition dependency-loss trade-off (classic 3NF-not-BCNF proof) was NOT explicitly isolated in D1.',
    velloreSpecs: [
      { slot: 'A1+TA1', qNoPrefix: 'Q4', branch: 'primary', displayRef: 'A1 Q4 [10M]' },
      { slot: 'A2+TA2', qNoPrefix: 'Q9', branch: 'primary', displayRef: 'A2 Q9(a) [10M]' },
    ],
    d2QuestionTypes: [
      'Beta D2 Core Anchor Repeat (10M): Stage-by-stage 1NF -> 2NF -> 3NF -> BCNF normalization in a fresh domain (e.g., University Course/Project Evaluation or Order Fulfillment) with explicit PK/FK schema.',
      '3NF vs. BCNF Trade-off Proof (5M): Demonstrate a relation in 3NF that fails BCNF (overlapping candidate keys, e.g., R(A,B,C) with AB->C, C->B) and verify lossless join vs. lost FD.',
    ],
    inAlphaD2: false,
    inBetaD2: true,
    betaD2SlotRef: 'Beta Q7 [10M]',
    betaMechanism: 'Anchor Repeat',
  },
  'm2-t6': {
    d1Status: 'tested',
    d1Refs: ['D1 Q7(c,d) [6M]'],
    d1TestedDetail: 'D1 Q7(c,d) thoroughly tested Multivalued Dependencies (4NF) and Join Dependencies (5NF) for [6M] inside the Hospital normalization problem.',
    d1UntestedGap: 'Low priority for Alpha D2 (heavily tested in D1 Q7 for 6 full marks). Only quick conceptual recall of MVD X ->> Y and PJNF needed.',
    velloreSpecs: [],
    d2QuestionTypes: [
      'Short comparison (2M–3M): Differentiate FD vs. MVD (4NF) vs. JD (5NF) with one minimal counterexample.',
    ],
    inAlphaD2: false,
    inBetaD2: false,
  },

  // ======================= MODULE 3 (m3-t1 .. m3-t6) =======================
  'm3-t1': {
    d1Status: 'untested',
    d1Refs: [],
    d1TestedDetail: 'Not tested in VIT Chennai D1+TD1.',
    d1UntestedGap: 'Heap (Unordered) vs. Sequential (Ordered) file organizations, Spanned vs. Unspanned blocking factor (bfr), and I/O search/insert/delete cost formulas (b/2 vs. log2(b)).',
    velloreSpecs: [],
    d2QuestionTypes: [
      'File Organization Cost Numerical (4M–5M): Compute blocking factor bfr = floor(B/R), number of file blocks b = ceil(r/bfr), and average search/insert block accesses for Unordered Heap vs. Ordered Sequential files.',
      'Compare overflow-block maintenance and deletion markers in sorted vs. heap files.',
    ],
    inAlphaD2: true,
    alphaD2SlotRef: 'Alpha Q3(b) [4M]',
    inBetaD2: false,
  },
  'm3-t2': {
    d1Status: 'untested',
    d1Refs: [],
    d1TestedDetail: 'Completely untested in VIT Chennai D1+TD1 (D1 Q3/Q4 asked B+ Tree & LSM Tree instead of Hashing).',
    d1UntestedGap: 'Static Hashing (overflow chains & collision resolution), Extendible Hashing (global depth d, local depth d\', directory doubling), and Linear Hashing (split pointer n, h_i / h_{i+1}).',
    velloreSpecs: [
      { slot: 'A1+TA1', qNoPrefix: 'Q5', branch: 'primary', displayRef: 'A1 Q5(a) [10M]' },
    ],
    d2QuestionTypes: [
      'Extendible Hashing Step-by-Step Trace (6M–10M): Insert a key sequence using binary prefix/suffix bits, showing bucket splits (d\' < d) vs. directory doubling (d\' == d) and final directory pointers.',
      'Static vs. Dynamic Hashing Comparison (4M): Analyze Static Hashing overflow degradation vs. Extendible Hashing (directory doubling, no overflow chains) vs. Linear Hashing (gradual splits using split pointer n, no directory).',
    ],
    inAlphaD2: true,
    alphaD2SlotRef: 'Alpha Q3(a) [6M]',
    inBetaD2: true,
    betaD2SlotRef: 'Beta Q3(a) [5M]',
    betaMechanism: 'Sibling Rotation',
  },
  'm3-t3': {
    d1Status: 'tested',
    d1Refs: ['D1 Q3 [10M]', 'D1 Q4(ii) [4M]'],
    d1TestedDetail: 'D1 Q3 tested Order-4 B+ Tree Insert/Delete [6M] + Single vs. Multilevel & Dynamic vs. Static Index Theory [4M]; D1 Q4(ii) tested LSM-Tree Compaction [4M].',
    d1UntestedGap: 'Multilevel Index Disk I/O Numerical (computing bfr, bfr_i, fan-out fo, levels t, and search I/Os for Primary/Secondary Dense/Clustering index — as in Vellore A2 Q4!) was NOT asked as a numerical in D1.',
    velloreSpecs: [
      { slot: 'A1+TA1', qNoPrefix: 'Q5', branch: 'or', displayRef: 'A1 Q5(b) [10M]' },
      { slot: 'A2+TA2', qNoPrefix: 'Q4', branch: 'primary', displayRef: 'A2 Q4 [10M]' },
      { slot: 'A2+TA2', qNoPrefix: 'Q10', branch: 'primary', displayRef: 'A2 Q10(a) [10M]' },
    ],
    d2QuestionTypes: [
      'Beta D2 Multilevel Index Disk I/O Numerical (5M–10M): Given r records, block size B, record size R, key size V, pointer size P, compute bfr, data blocks b, index blocking factor bfr_i, number of levels, and block accesses (Primary Sparse vs. Secondary Dense).',
      'B+ Tree Order p=3 Interleaved Insert/Delete or Order Calculation (finding max order p from block size B, key size V, pointer size P).',
    ],
    inAlphaD2: false,
    inBetaD2: true,
    betaD2SlotRef: 'Beta Q3(b) [5M]',
    betaMechanism: 'Anchor Repeat',
  },
  'm3-t4': {
    d1Status: 'tested',
    d1Refs: ['D1 Q2 [10M]', 'D1 Q4(i) [6M]'],
    d1TestedDetail: 'D1 Q2 tested 5 complex SQL queries (GROUP BY/HAVING, CTE/subquery, correlated subquery) [10M]; D1 Q4(i) tested RA Division (÷) & Aggregate Grouping (ℑ) [6M].',
    d1UntestedGap: 'SQL-to-RA translation & Outer Joins (⟕, ⟖, ⟗) remain VIT Chennai signature staples (likely to repeat in Beta D2 in a new domain, while Alpha D2 shifts to TRC + Query Trees).',
    velloreSpecs: [],
    d2QuestionTypes: [
      'Beta D2 Chennai Anchor Repeat (6M–10M): 5 SQL analytical queries (Correlated Subquery, HAVING, NOT EXISTS/ALL, Self-Join) or SQL-to-RA translation on a fresh schema (Banking, Airline, or Hospital).',
      'Relational Algebra Outer Join (Left/Right/Full) & Set Difference queries.',
    ],
    inAlphaD2: false,
    inBetaD2: true,
    betaD2SlotRef: 'Beta Q4(a) [5M]',
    betaMechanism: 'Anchor Repeat',
  },
  'm3-t5': {
    d1Status: 'untested',
    d1Refs: [],
    d1TestedDetail: 'Completely untested in VIT Chennai D1+TD1 (D1 Q4 asked only Relational Algebra, zero Tuple Relational Calculus).',
    d1UntestedGap: 'Tuple Relational Calculus (TRC) declarative queries { t | P(t) }, Existential (∃) and Universal (∀) quantifiers, Implication (P → Q), and Safe vs. Unsafe expressions.',
    velloreSpecs: [],
    d2QuestionTypes: [
      'TRC Query Formulation (4M–6M): Write 3–4 Tuple Relational Calculus queries on a 3-table schema using ∃ (join/exists), ¬∃ (not exists), and ∀ (universal "for all" queries rewritten via implication).',
      'Safe vs. Unsafe TRC Expressions (2M–3M): Explain why { t | ¬(t ∈ R) } is unsafe and define dom(P) safety.',
    ],
    inAlphaD2: true,
    alphaD2SlotRef: 'Alpha Q4(b) [4M]',
    inBetaD2: false,
  },
  'm3-t6': {
    d1Status: 'untested',
    d1Refs: [],
    d1TestedDetail: 'Completely untested in VIT Chennai D1+TD1 — the single highest-probability Module 3 gap!',
    d1UntestedGap: 'Translating a multi-table SQL query into an Initial Canonical Query Tree and applying Heuristic Algebraic Optimization rules step-by-step (Cascade σ, Push σ down, Reorder joins, Convert ×+σ to ⋈, Push π down).',
    velloreSpecs: [
      { slot: 'A1+TA1', qNoPrefix: 'Q6', branch: 'primary', displayRef: 'A1 Q6 [10M]' },
      { slot: 'A2+TA2', qNoPrefix: 'Q10', branch: 'or', displayRef: 'A2 Q10(b) [10M]' },
    ],
    d2QuestionTypes: [
      'Full Heuristic Query Tree Optimization (6M–10M): Given a 3-table SQL query (e.g., Retail/Banking/E-Commerce), write the initial Relational Algebra expression, draw the Canonical Query Tree, and show step-by-step transformed trees using equivalence rules.',
      'Cost Reduction Justification (2M–3M): Explain why pushing σ before ⋈ and pushing π down dramatically shrinks intermediate tuple cardinality and disk I/O.',
    ],
    inAlphaD2: true,
    alphaD2SlotRef: 'Alpha Q4(a) [6M]',
    inBetaD2: true,
    betaD2SlotRef: 'Beta Q4(b) [5M]',
    betaMechanism: 'Sibling Rotation',
  },

  // ======================= MODULE 4 (m4-t1 .. m4-t6) =======================
  'm4-t1': {
    d1Status: 'untested',
    d1Refs: [],
    d1TestedDetail: 'Completely untested in VIT Chennai D1+TD1 (D1 Q5 jumped straight into 6-class schedule classification).',
    d1UntestedGap: 'ACID Properties applied to a real transaction scenario (Atomicity, Consistency, Isolation, Durability) + Transaction State Transition Diagram (Active -> Partially Committed -> Committed / Failed -> Aborted/Terminated) & System Log operations.',
    velloreSpecs: [
      { slot: 'A2+TA2', qNoPrefix: 'Q5', branch: 'primary', displayRef: 'A2 Q5(a) [5M]' },
    ],
    d2QuestionTypes: [
      'Scenario-Based ACID + State Diagram (5M–10M): Apply ACID properties to an online banking / ticket-booking transfer failure and draw the 5-state Transaction State Transition Diagram showing exact transitions on power failure or constraint violation.',
      'Identify which DBMS subsystem enforces each ACID property (Recovery Manager -> A & D; Concurrency Control -> I; Integrity Constraints/App -> C).',
    ],
    inAlphaD2: true,
    alphaD2SlotRef: 'Alpha Q5(a) [5M]',
    inBetaD2: true,
    betaD2SlotRef: 'Beta Q5(a) [5M]',
    betaMechanism: 'Sibling Rotation',
  },
  'm4-t2': {
    d1Status: 'tested',
    d1Refs: ['D1 Q5 [10M]'],
    d1TestedDetail: 'D1 Q5 tested Recoverable, Avoids-Cascading-Aborts (ACA), and Strict schedule classification across 4 schedules (a–d).',
    d1UntestedGap: 'Named Concurrency Anomalies (Lost Update, Dirty Read / Temporary Update, Incorrect Summary, Unrepeatable Read / Phantom) with concrete interleaving traces were NOT explicitly asked to construct.',
    velloreSpecs: [
      { slot: 'A1+TA1', qNoPrefix: 'Q7', branch: 'primary', displayRef: 'A1 Q7(C) [3M]' },
      { slot: 'A1+TA1', qNoPrefix: 'Q8', branch: 'primary', displayRef: 'A1 Q8(a) [10M]' },
    ],
    d2QuestionTypes: [
      'Concurrency Anomaly Trace (4M–5M): Given two concurrent transactions (e.g., inventory update + audit summary), illustrate Lost Update, Dirty Read, and Incorrect Summary with concrete numerical variable values.',
    ],
    inAlphaD2: false,
    inBetaD2: false,
  },
  'm4-t3': {
    d1Status: 'tested',
    d1Refs: ['D1 Q5 [10M]'],
    d1TestedDetail: 'D1 Q5 tested Conflict Serializability & View Serializability across 4 schedules (a–d).',
    d1UntestedGap: 'Explicit Precedence Graph drawing with topological sort & View-Serializable-but-NOT-Conflict-Serializable (blind write) proof remains a top Beta D2 anchor repeat!',
    velloreSpecs: [
      { slot: 'A1+TA1', qNoPrefix: 'Q7', branch: 'primary', displayRef: 'A1 Q7 [10M]' },
      { slot: 'A2+TA2', qNoPrefix: 'Q5', branch: 'primary', displayRef: 'A2 Q5(b) [5M]' },
    ],
    d2QuestionTypes: [
      'Beta D2 Core Anchor Repeat (5M): Construct Precedence Graphs for 2 schedules S1 and S2, list all RW/WR/WW conflict pairs, prove cycle vs. acyclic, and derive the exact equivalent serial order.',
      'View Serializability Check (3M–4M): Prove a schedule with blind writes is View Serializable (same initial reads, updated reads, final writes) even though its Precedence Graph has a cycle.',
    ],
    inAlphaD2: false,
    inBetaD2: true,
    betaD2SlotRef: 'Beta Q5(b) [5M]',
    betaMechanism: 'Anchor Repeat',
  },
  'm4-t4': {
    d1Status: 'partial',
    d1Refs: ['D1 Q6(a) [5M]'],
    d1TestedDetail: 'D1 Q6(a) tested Basic 2PL cascading rollback vs. Strict 2PL [4M] + 1M shared-to-exclusive lock-upgrade deadlock.',
    d1UntestedGap: 'Full Wait-For Graph (WFG) Deadlock Detection trace (as in A2 Q6 [10M]) and Timestamp-Based Deadlock Prevention (Wait-Die vs. Wound-Wait) + Starvation Prevention were NOT tested in D1!',
    velloreSpecs: [
      { slot: 'A1+TA1', qNoPrefix: 'Q8', branch: 'primary', displayRef: 'A1 Q8(a) [10M]' },
      { slot: 'A2+TA2', qNoPrefix: 'Q6', branch: 'primary', displayRef: 'A2 Q6 [10M]' },
    ],
    d2QuestionTypes: [
      'Wait-For Graph & Deadlock Resolution Trace (5M–6M): Trace a multi-transaction Strict 2PL schedule step-by-step, build the Wait-For Graph, identify the cycle, choose a victim transaction, and show resumed execution.',
      'Wait-Die vs. Wound-Wait Numerical Comparison (4M–5M): Given TS(T1) < TS(T2) < TS(T3) and lock request conflicts, determine which transaction waits vs. aborts (dies/wounds) and explain why restarting with the original timestamp prevents starvation.',
    ],
    inAlphaD2: true,
    alphaD2SlotRef: 'Alpha Q5(b) [5M]',
    inBetaD2: true,
    betaD2SlotRef: 'Beta Q6(b) [5M]',
    betaMechanism: 'Sibling Rotation',
  },
  'm4-t5': {
    d1Status: 'partial',
    d1Refs: ['D1 Q6(b) [5M]'],
    d1TestedDetail: 'D1 Q6(b) tested Basic Timestamp Ordering vs. Thomas\'s Write Rule trace on T1(5), T2(15), T3(25) for [5M].',
    d1UntestedGap: 'Multiple Granularity Locking (Hierarchy: DB -> Area -> File -> Page -> Record, Intention locks IS, IX, SIX, Compatibility Matrix, Top-Down Lock / Bottom-Up Unlock) & Optimistic Concurrency Control (Read/Validation/Write) were completely untouched in D1!',
    velloreSpecs: [],
    d2QuestionTypes: [
      'Multiple Granularity Locking Protocol (5M–6M): Draw the 5×5 lock compatibility matrix (IS, IX, S, SIX, X), explain why SIX = S + IX is needed, and trace locking a specific record while another transaction scans the file.',
      'Optimistic (Validation-Based) Concurrency Control (4M): Explain Read, Validation, and Write phases and the 3 timestamp validation conditions.',
    ],
    inAlphaD2: true,
    alphaD2SlotRef: 'Alpha Q6(b) [4M]',
    inBetaD2: false,
  },
  'm4-t6': {
    d1Status: 'untested',
    d1Refs: [],
    d1TestedDetail: 'Completely untested in VIT Chennai D1+TD1 — zero log-based recovery, checkpointing, or shadow paging!',
    d1UntestedGap: 'Deferred Update (NO-UNDO / REDO) vs. Immediate Update (UNDO / REDO) WAL crash log traces with Checkpointing, Steal/No-Force buffer policies, and Shadow Paging.',
    velloreSpecs: [
      { slot: 'A1+TA1', qNoPrefix: 'Q8', branch: 'or', displayRef: 'A1 Q8(b) [10M]' },
    ],
    d2QuestionTypes: [
      'Crash Log Recovery Trace with Checkpoint (6M–10M): Given a WAL log with [Start], [Write, T, X, old, new], [Commit], [Checkpoint], and SYSTEM CRASH, determine UNDO and REDO lists and compute exact final disk values under Deferred Update vs. Immediate Update.',
      'Shadow Paging & Buffer Management Policies (4M): Explain Current vs. Shadow Page Table swap on commit, why Shadow Paging needs no log UNDO/REDO, and compare No-Steal/Force vs. Steal/No-Force.',
    ],
    inAlphaD2: true,
    alphaD2SlotRef: 'Alpha Q6(a) [6M]',
    inBetaD2: true,
    betaD2SlotRef: 'Beta Q6(a) [5M]',
    betaMechanism: 'Sibling Rotation',
  },

  // ======================= MODULE 5 (m5-t1 .. m5-t6) =======================
  'm5-t1': {
    d1Status: 'untested',
    d1Refs: [],
    d1TestedDetail: 'Not directly asked in VIT Chennai D1+TD1 (D1 Q9 jumped straight into Fragmentation/Replication + MapReduce).',
    d1UntestedGap: 'DDBMS Architectures (Homogeneous vs. Heterogeneous, Shared-Nothing / Shared-Disk / Shared-Memory, Federated) and Distribution Transparency (Location, Fragmentation, Replication Transparency).',
    velloreSpecs: [
      { slot: 'A1+TA1', qNoPrefix: 'Q9', branch: 'primary', displayRef: 'A1 Q9(A) [2M]' },
    ],
    d2QuestionTypes: [
      'Distribution Transparency & Architectures (4M–5M): Explain Location, Fragmentation, and Replication Transparency with SQL examples, and compare Shared-Memory, Shared-Disk, and Shared-Nothing architectures.',
      'Homogeneous vs. Heterogeneous / Federated DDBMS advantages & design challenges.',
    ],
    inAlphaD2: true,
    alphaD2SlotRef: 'Alpha Q9(ii) [7M]',
    inBetaD2: false,
  },
  'm5-t2': {
    d1Status: 'tested',
    d1Refs: ['D1 Q9(i) [8M]'],
    d1TestedDetail: 'D1 Q9(i) tested Horizontal Fragmentation + Replication design for a 3-campus university STUDENT relation [8M].',
    d1UntestedGap: 'Vertical Fragmentation (π + PK), Derived Horizontal Fragmentation (semijoin), Mixed/Hybrid Fragmentation, and formal Verification of Completeness, Reconstruction, and Disjointness rules.',
    velloreSpecs: [
      { slot: 'A1+TA1', qNoPrefix: 'Q9', branch: 'primary', displayRef: 'A1 Q9 [10M]' },
    ],
    d2QuestionTypes: [
      'Vertical & Mixed Fragmentation Design (5M–6M): Split a wide relation vertically (preserving PK in every fragment for Natural Join reconstruction) and prove Completeness, Reconstruction, and Disjointness.',
    ],
    inAlphaD2: false,
    inBetaD2: false,
  },
  'm5-t3': {
    d1Status: 'untested',
    d1Refs: [],
    d1TestedDetail: 'Completely untested in VIT Chennai D1+TD1 (zero 2PC or Semijoin distributed query processing).',
    d1UntestedGap: 'Two-Phase Commit (2PC) Protocol (Phase 1 Prepare/Vote + Phase 2 Commit/Abort, Coordinator crash blocking problem) and Distributed Query Optimization via Semijoin (R ⋉ S) network transfer-cost calculation.',
    velloreSpecs: [],
    d2QuestionTypes: [
      'Two-Phase Commit (2PC) Protocol Trace (5M–8M): Draw the Coordinator–Participant message sequence for Commit and Abort cases, specify WAL force-writes at each phase, and explain why 2PC blocks if the Coordinator fails during uncertain state.',
      'Semijoin Network Cost Numerical (5M–7M): Compare naive Ship-Whole-Table join vs. Semijoin (R ⋉ S) byte transfer across two sites given tuple counts, tuple sizes, and join-key selectivity.',
    ],
    inAlphaD2: true,
    alphaD2SlotRef: 'Alpha Q9(ii) [7M]',
    inBetaD2: true,
    betaD2SlotRef: 'Beta Q9(ii) [7M]',
    betaMechanism: 'Sibling Rotation',
  },
  'm5-t4': {
    d1Status: 'untested',
    d1Refs: [],
    d1TestedDetail: 'Completely untested in VIT Chennai D1+TD1 — massive Module 5 gap tested in BOTH Vellore A1 and A2!',
    d1UntestedGap: 'CAP Theorem (Consistency, Availability, Partition Tolerance -> CP vs. AP trade-off under network partition) and ACID vs. BASE (Basically Available, Soft state, Eventual consistency).',
    velloreSpecs: [
      { slot: 'A1+TA1', qNoPrefix: 'Q10', branch: 'primary', displayRef: 'A1 Q10 [10M]' },
      { slot: 'A2+TA2', qNoPrefix: 'Q7', branch: 'primary', displayRef: 'A2 Q7 [10M]' },
    ],
    d2QuestionTypes: [
      'Applied Network Partition CAP Case Study (7M–10M): Given a multi-region platform (e.g., Global E-Commerce, Banking, Ride-Hailing, or Online Polling) hit by a network partition, prove why P is mandatory, classify subsystems into CP vs. AP, and compare divergence vs. downtime risks.',
      'ACID vs. BASE Comparison Table (4M–5M): Contrast strong consistency/pessimistic locking (ACID) against Eventual Consistency/Soft State/Optimistic availability (BASE) with concrete examples.',
    ],
    inAlphaD2: true,
    alphaD2SlotRef: 'Alpha Q7 [10M]',
    inBetaD2: true,
    betaD2SlotRef: 'Beta Q9(i) [8M]',
    betaMechanism: 'Anchor Repeat',
  },
  'm5-t5': {
    d1Status: 'tested',
    d1Refs: ['D1 Q9(ii) [7M]'],
    d1TestedDetail: 'D1 Q9(ii) tested MapReduce programming model (Map -> Shuffle/Sort -> Reduce) for average product rating [7M].',
    d1UntestedGap: 'Consistent Hashing Ring (Sharding), Master-Slave vs. Peer-to-Peer Replication, and Tunable Quorum Consistency (R + W > N) were NOT tested in D1.',
    velloreSpecs: [],
    d2QuestionTypes: [
      'NoSQL Distribution & Quorum Numerical (4M–5M): Explain Consistent Hashing virtual nodes, Master-Slave vs. Peer-to-Peer replication, and compute read/write quorum configurations satisfying R + W > N.',
    ],
    inAlphaD2: false,
    inBetaD2: false,
  },
  'm5-t6': {
    d1Status: 'untested',
    d1Refs: [],
    d1TestedDetail: 'Completely untested in VIT Chennai D1+TD1 — zero Key-Value, Document, Column-Family, or Graph NoSQL modeling!',
    d1UntestedGap: 'Four Types of NoSQL Databases (Key-Value: Redis/DynamoDB, Document: MongoDB JSON/BSON, Wide-Column: Cassandra/HBase, Graph: Neo4j), Sample JSON/Graph schema design, and Polyglot Persistence.',
    velloreSpecs: [
      { slot: 'A2+TA2', qNoPrefix: 'Q8', branch: 'primary', displayRef: 'A2 Q8 [10M]' },
    ],
    d2QuestionTypes: [
      'NoSQL Model Selection + Sample JSON/Graph Schema (8M–10M): Recommend the best NoSQL database(s) for a real-world app (Recipe Sharing, Social Network, IoT Telemetry, or Food Delivery), write a concrete JSON/BSON document or Graph node-edge representation, and justify scaling advantages over RDBMS.',
      'Polyglot Persistence Architecture (5M–8M): Critique why a single NoSQL model bottlenecks at scale and combine Document + Key-Value + Wide-Column + Graph stores with clear justification.',
    ],
    inAlphaD2: true,
    alphaD2SlotRef: 'Alpha Q9(i) [8M]',
    inBetaD2: true,
    betaD2SlotRef: 'Beta Q9(i) [8M]',
    betaMechanism: 'Sibling Rotation',
  },
};

export function buildTopicPredictionMatrix(): TopicPredictionEntry[] {
  const matrix: TopicPredictionEntry[] = [];
  let globalOrder = 0;

  for (const mod of MODULES) {
    mod.topics.forEach((topic, idx) => {
      globalOrder += 1;
      const raw = RAW_TOPIC_COVERAGE[topic.id];
      if (!raw) {
        throw new Error(`Missing prediction coverage metadata for syllabus topic ${topic.id}`);
      }
      const velloreLinks = raw.velloreSpecs.map((spec) =>
        resolveVelloreOption(spec.slot, spec.qNoPrefix, spec.branch, spec.displayRef)
      );

      matrix.push({
        moduleId: mod.id,
        moduleNumber: mod.number,
        moduleTitle: mod.title,
        topicId: topic.id,
        topicOrder: globalOrder,
        topicNumberInModule: idx + 1,
        topicTitle: topic.title,
        topicDetail: topic.detail,
        fatWeight: topic.fatWeight,
        d1Status: raw.d1Status,
        d1Refs: raw.d1Refs,
        d1TestedDetail: raw.d1TestedDetail,
        d1UntestedGap: raw.d1UntestedGap,
        velloreLinks,
        d2QuestionTypes: raw.d2QuestionTypes,
        inAlphaD2: raw.inAlphaD2,
        alphaD2SlotRef: raw.alphaD2SlotRef,
        inBetaD2: raw.inBetaD2,
        betaD2SlotRef: raw.betaD2SlotRef,
        betaMechanism: raw.betaMechanism,
      });
    });
  }

  return matrix;
}

// ============================================================================
// EMPIRICAL A1 -> A2 VELLORE SHIFT MATRIX (PROOF FOR BETA D2)
// ============================================================================

export const A1_TO_A2_SHIFT_PATTERNS: A1ToA2ShiftPattern[] = [
  {
    id: 'shift-m1-arch',
    moduleId: 'm1',
    moduleLabel: 'Module 1 · Architecture',
    a1Asked: 'A1 Q1: DBMS Component Modules Environment (m1-t4)',
    a2Asked: 'A2 Q1: Three-Schema Architecture & Logical/Physical Data Independence (m1-t3)',
    mechanism: 'Sibling Rotation',
    empiricalRule: 'When Slot 1 asks DBMS Component Modules, Slot 2 rotates directly to Three-Schema Architecture & Data Independence.',
    d1ChennaiAnchor: 'Chennai D1 Q1 asked DBMS Components (6M) + Actors (4M) — identical to A1 Q1!',
    betaD2Projection: 'Beta D2 Q1 rotates directly to Three-Schema Architecture + Data Independence (6M) + 2-Tier/3-Tier Client-Server / Modern Data Models (4M).',
  },
  {
    id: 'shift-m1-constraints',
    moduleId: 'm1',
    moduleLabel: 'Module 1 · Integrity Constraints',
    a1Asked: 'A1 Q2: Domain, Entity & Referential Integrity Violations (PROJECT_GRANT)',
    a2Asked: 'A2 Q2: Integrity Constraints & Rule Mapping (Hospital Schema)',
    mechanism: 'Anchor Repeat',
    empiricalRule: 'Relational Integrity Constraints & FK Violation Actions repeat across slots in a fresh domain because CO1 requires constraint mastery.',
    d1ChennaiAnchor: 'Chennai D1 skipped m1-t6 completely (0M), making it both an A1/A2 Core Anchor AND a D1 Negative Gap!',
    betaD2Projection: 'Beta D2 Q2 tests Domain, Entity & Referential Integrity + CASCADE/RESTRICT/SET NULL violation traces (10M).',
  },
  {
    id: 'shift-m2-design',
    moduleId: 'm2',
    moduleLabel: 'Module 2 · ER/EER & Normalization',
    a1Asked: 'A1 Q3 (EER Diagram) + A1 Q4 (1NF→BCNF Normalization: Hospital)',
    a2Asked: 'A2 Q3 & Q9(b) (ER/EER Diagram + Lattice) + A2 Q9(a) (1NF→BCNF: Project Eval)',
    mechanism: 'Anchor Repeat',
    empiricalRule: 'Core 1NF→BCNF Normalization repeats across slots in a fresh domain, while ER/EER toggles between Modeling/Lattice and Mapping/FD algorithms.',
    d1ChennaiAnchor: 'Chennai D1 Q7 did Hospital 1NF→5NF; D1 Q8 (15M) did Hotel ER Mapping + FD Closure/Keys (no ER/EER drawing, no Minimal Cover).',
    betaD2Projection: 'Beta D2 Q7 repeats 1NF→BCNF Normalization + 3NF vs. BCNF proof in a new domain (10M); Beta D2 Q8 (15M) rotates to EER Diagram Design (8M) + Minimal Cover & Lossless Chase (7M).',
  },
  {
    id: 'shift-m3-indexing',
    moduleId: 'm3',
    moduleLabel: 'Module 3 · Storage, Hashing & Query Opt',
    a1Asked: 'A1 Q5 (Static/Extendible Hashing OR B+ Tree p=3) + A1 Q6 (Query Tree Opt)',
    a2Asked: 'A2 Q4 (Multilevel Index Disk I/O) + A2 Q10 (B+ Tree p=3 OR Query Tree Opt)',
    mechanism: 'Sibling Rotation',
    empiricalRule: 'B+ Tree & Heuristic Query Trees act as core anchors across slots, while the companion storage slot rotates between Hashing (A1 Q5a) and Multilevel Disk I/O Numerical (A2 Q4).',
    d1ChennaiAnchor: 'Chennai D1 Q3/Q4 asked B+ Tree p=4 + LSM + SQL/RA — completely omitting Hashing, Multilevel I/O Math, and Heuristic Query Trees!',
    betaD2Projection: 'Beta D2 Q3 pairs Extendible/Linear Hashing (5M) + Multilevel Index Disk I/O Numerical (5M); Beta D2 Q4 pairs Chennai SQL/RA Anchor (5M) + Heuristic Query Tree Optimization (5M).',
  },
  {
    id: 'shift-m4-tx',
    moduleId: 'm4',
    moduleLabel: 'Module 4 · Transactions, Locks & Recovery',
    a1Asked: 'A1 Q7 (Precedence Graph) + A1 Q8 (2PL Trace OR Deferred/Immediate WAL Recovery)',
    a2Asked: 'A2 Q5 (ACID + Precedence Graphs S1/S2) + A2 Q6 (Strict 2PL + WFG Deadlock)',
    mechanism: 'Anchor Repeat',
    empiricalRule: 'Conflict Serializability Precedence Graphs repeat in BOTH slots (A1 Q7 & A2 Q5b), while the secondary M4 slots rotate across ACID State Diagram, WFG/Deadlock Prevention, and WAL Recovery.',
    d1ChennaiAnchor: 'Chennai D1 Q5/Q6 tested 6-Class Schedules + Strict 2PL + Basic TO/Thomas — leaving ACID/States, WFG/Wait-Die/Wound-Wait, and WAL Recovery untouched.',
    betaD2Projection: 'Beta D2 Q5 pairs ACID + State Diagram (5M) with Precedence Graph Anchor Repeat (5M); Beta D2 Q6 pairs Deferred/Immediate WAL Recovery (5M) with WFG + Wait-Die/Wound-Wait Deadlocks (5M).',
  },
  {
    id: 'shift-m5-ddbms',
    moduleId: 'm5',
    moduleLabel: 'Module 5 · Distributed & NoSQL',
    a1Asked: 'A1 Q9 (DDBMS Fragmentation) + A1 Q10 (CAP Theorem Partition)',
    a2Asked: 'A2 Q7 (CAP Theorem Banking Partition) + A2 Q8 (4 NoSQL Models + JSON Schema)',
    mechanism: 'Sibling Rotation',
    empiricalRule: 'CAP Theorem repeats across both slots in a fresh outage scenario, while the companion M5 slot rotates from DDBMS Fragmentation (A1 Q9) to NoSQL Model Selection + JSON/Polyglot Design (A2 Q8).',
    d1ChennaiAnchor: 'Chennai D1 Q9 (15M) tested Fragmentation (8M) + MapReduce (7M) — completely skipping CAP Theorem, 4 NoSQL Types, and 2PC/Semijoin!',
    betaD2Projection: 'Beta D2 Q9 (15M) rotates cleanly to CAP Theorem + 4 NoSQL Types / Polyglot Schema (8M) + Two-Phase Commit (2PC) & Semijoin Query Cost (7M).',
  },
];

// ============================================================================
// ALPHA D2 BLUEPRINT (STRICT D1-NEGATIVE COMPLEMENT — 7×10M + 2×15M = 100M)
// ============================================================================

export const ALPHA_D2_BLUEPRINT: PredictedD2Question[] = [
  {
    id: 'alpha-q1',
    model: 'alpha',
    qNo: 'Q1',
    section: 'Section I (7 × 10M)',
    marks: 10,
    co: 'CO1',
    bl: 'K3',
    moduleId: 'm1',
    targetTopicIds: ['m1-t3', 'm1-t4'],
    title: 'Three-Schema Architecture, Data Independence & Client-Server / Modern Data Models',
    d1Counterpart: 'D1 Q1 asked DBMS Component Modules (6M) + Actors on the Scene (4M)',
    subQuestions: [
      {
        part: '(a)',
        marks: 6,
        text: 'Design and explain the ANSI/SPARC Three-Schema Architecture for a multi-branch healthcare or retail system, showing how External Views, Conceptual Schema, and Internal Storage deliver Logical and Physical Data Independence during schema/storage upgrades.',
      },
      {
        part: '(b)',
        marks: 4,
        text: 'Compare 2-Tier vs. 3-Tier Client-Server DBMS architectures (or select appropriate Modern Data Models: Relational, Graph, Vector, Time-Series for given workloads).',
      },
    ],
    rationale: 'Exact Module 1 complement of D1 Q1: D1 already tested DBMS components and actors, leaving Three-Schema Architecture (m1-t3, asked in A2 Q1) and Client-Server / Modern Data Models (m1-t4 half) completely untouched.',
    vellorePrecedentTags: ['A2 Q1 [10M]'],
  },
  {
    id: 'alpha-q2',
    model: 'alpha',
    qNo: 'Q2',
    section: 'Section I (7 × 10M)',
    marks: 10,
    co: 'CO1',
    bl: 'K3',
    moduleId: 'm1',
    targetTopicIds: ['m1-t6'],
    title: 'Relational Integrity Constraints & Referential Violation Actions (CASCADE / RESTRICT / SET NULL)',
    d1Counterpart: 'D1 Q2 asked 5 Analytical SQL Queries (m1-t6 Integrity Constraints had 0M in D1)',
    subQuestions: [
      {
        part: '(a)',
        marks: 5,
        text: 'Given a multi-table schema (e.g., DEPARTMENT, EMPLOYEE, PROJECT) with sample tuples, evaluate 5 INSERT/UPDATE/DELETE operations and identify exact Domain, Key, Entity Integrity, or Referential Integrity violations.',
      },
      {
        part: '(b)',
        marks: 5,
        text: 'Trace the resulting table states when deleting/updating a referenced parent key under ON DELETE RESTRICT, ON DELETE CASCADE, and ON DELETE SET NULL, explaining modification anomalies prevented.',
      },
    ],
    rationale: 'm1-t6 was tested for a full 10M in BOTH Vellore A1 Q2 and Vellore A2 Q2, yet had zero marks in Chennai D1. Highest-confidence Module 1 negative gap.',
    vellorePrecedentTags: ['A1 Q2 [10M]', 'A2 Q2 [10M]'],
  },
  {
    id: 'alpha-q3',
    model: 'alpha',
    qNo: 'Q3',
    section: 'Section I (7 × 10M)',
    marks: 10,
    co: 'CO2',
    bl: 'K3',
    moduleId: 'm3',
    targetTopicIds: ['m3-t2', 'm3-t1'],
    title: 'Static vs. Dynamic Hashing (Extendible / Linear Trace) & File Organization Cost',
    d1Counterpart: 'D1 Q3 asked Order-4 B+ Tree Insert/Delete (6M) + Single vs. Multilevel Indexing Theory (4M)',
    subQuestions: [
      {
        part: '(a)',
        marks: 6,
        text: 'Trace Extendible Hashing (global depth d, local depth d\', bucket capacity = 2/3) for a sequence of 8–9 integer keys, clearly showing bucket splits vs. directory doubling, and contrast with Linear Hashing.',
      },
      {
        part: '(b)',
        marks: 4,
        text: 'Compare Unordered (Heap) vs. Ordered (Sequential) file organization on equality search, range search, insertion, and deletion block I/Os (computing bfr and b).',
      },
    ],
    rationale: 'D1 Q3 spent all 10M on B+ Trees and index definitions, leaving Dynamic Hashing (m3-t2, A1 Q5a) and File Organization (m3-t1) completely untested.',
    vellorePrecedentTags: ['A1 Q5(a) [10M]'],
  },
  {
    id: 'alpha-q4',
    model: 'alpha',
    qNo: 'Q4',
    section: 'Section I (7 × 10M)',
    marks: 10,
    co: 'CO2',
    bl: 'K4',
    moduleId: 'm3',
    targetTopicIds: ['m3-t6', 'm3-t5'],
    title: 'Heuristic Query Tree Optimization & Tuple Relational Calculus (TRC)',
    d1Counterpart: 'D1 Q4 asked Relational Algebra Division/Grouping (6M) + LSM-Tree Compaction (4M)',
    subQuestions: [
      {
        part: '(a)',
        marks: 6,
        text: 'Convert a 3-table SQL join query with WHERE predicates into an Initial Canonical Query Tree, then apply Heuristic Optimization rules step-by-step (cascade σ, push σ down, convert ×+σ to ⋈, push π down) and justify cost reduction.',
      },
      {
        part: '(b)',
        marks: 4,
        text: 'Formulate 2 declarative Tuple Relational Calculus (TRC) queries using ∃ and ∀ quantifiers and explain safe vs. unsafe TRC expressions.',
      },
    ],
    rationale: 'Heuristic Query Trees (m3-t6) appeared in BOTH Vellore A1 Q6 and A2 Q10(b) and was 100% absent from Chennai D1, alongside TRC (m3-t5).',
    vellorePrecedentTags: ['A1 Q6 [10M]', 'A2 Q10(b) [10M]'],
  },
  {
    id: 'alpha-q5',
    model: 'alpha',
    qNo: 'Q5',
    section: 'Section I (7 × 10M)',
    marks: 10,
    co: 'CO3',
    bl: 'K4',
    moduleId: 'm4',
    targetTopicIds: ['m4-t1', 'm4-t4'],
    title: 'ACID Properties, Transaction State Diagram & Deadlock Detection / Prevention (WFG, Wait-Die, Wound-Wait)',
    d1Counterpart: 'D1 Q5 asked 6-Class Schedule Classification (Serializable, View, Recoverable, ACA, Strict)',
    subQuestions: [
      {
        part: '(a)',
        marks: 5,
        text: 'Apply ACID properties to a concurrent banking/booking failure scenario and illustrate the Transaction State Transition Diagram (Active, Partially Committed, Committed, Failed, Aborted/Terminated).',
      },
      {
        part: '(b)',
        marks: 5,
        text: 'Trace a Strict 2PL schedule to construct the Wait-For Graph (WFG) detecting a deadlock cycle, and compare Wait-Die vs. Wound-Wait prevention for TS(T1) < TS(T2) < TS(T3).',
      },
    ],
    rationale: 'D1 Q5 skipped ACID/Transaction States (m4-t1, A2 Q5a) and D1 Q6 only touched a 1M lock-upgrade note, leaving full WFG Deadlock Detection (A2 Q6) and Wait-Die/Wound-Wait completely open.',
    vellorePrecedentTags: ['A2 Q5(a) [5M]', 'A2 Q6 [10M]'],
  },
  {
    id: 'alpha-q6',
    model: 'alpha',
    qNo: 'Q6',
    section: 'Section I (7 × 10M)',
    marks: 10,
    co: 'CO3',
    bl: 'K4',
    moduleId: 'm4',
    targetTopicIds: ['m4-t6', 'm4-t5'],
    title: 'Crash Log Recovery (Deferred vs. Immediate Update + Checkpoint) & Multiple Granularity Locking',
    d1Counterpart: 'D1 Q6 asked Basic/Strict 2PL (5M) + Basic TO vs. Thomas Write Rule (5M)',
    subQuestions: [
      {
        part: '(a)',
        marks: 6,
        text: 'Given a WAL system log with [Start], [Write, Ti, X, old, new], [Commit], [Checkpoint], and SYSTEM CRASH, identify UNDO and REDO transaction lists and compute final disk values under Deferred Update vs. Immediate Update (and contrast with Shadow Paging).',
      },
      {
        part: '(b)',
        marks: 4,
        text: 'Explain Multiple Granularity Locking using Intention locks (IS, IX, SIX), draw the 5×5 compatibility matrix, and trace acquiring locks down the DB -> File -> Page -> Record hierarchy.',
      },
    ],
    rationale: 'Database Recovery (m4-t6, A1 Q8b) had ZERO marks in Chennai D1 despite being a core CO3 outcome, and Multiple Granularity Locking (m4-t5 second half) was completely untouched.',
    vellorePrecedentTags: ['A1 Q8(b) [10M]'],
  },
  {
    id: 'alpha-q7',
    model: 'alpha',
    qNo: 'Q7',
    section: 'Section I (7 × 10M)',
    marks: 10,
    co: 'CO4',
    bl: 'K4',
    moduleId: 'm5',
    targetTopicIds: ['m5-t4'],
    title: 'CAP Theorem Under Network Partition & ACID vs. BASE Trade-Off Analysis',
    d1Counterpart: 'D1 Q7 asked Hospital 1NF→5NF Normalization (while CAP Theorem had 0M across the entire D1 paper!)',
    subQuestions: [
      {
        part: '(a)',
        marks: 6,
        text: 'Analyze a multi-region distributed system (e.g., Global E-Commerce Flash Sale or Distributed Banking) undergoing a network partition: explain why P is mandatory, justify CP vs. AP choices for inventory/balances vs. product reviews/carts, and evaluate failure consequences.',
      },
      {
        part: '(b)',
        marks: 4,
        text: 'Differentiate ACID vs. BASE (Basically Available, Soft state, Eventual consistency) with concrete distributed conflict-resolution examples.',
      },
    ],
    rationale: 'CAP Theorem + ACID vs. BASE (m5-t4) appeared for 10M in BOTH Vellore A1 Q10 and A2 Q7, yet received 0M in Chennai D1. Prime D2 Section I target.',
    vellorePrecedentTags: ['A1 Q10 [10M]', 'A2 Q7 [10M]'],
  },
  {
    id: 'alpha-q8',
    model: 'alpha',
    qNo: 'Q8',
    section: 'Section II (2 × 15M)',
    marks: 15,
    co: 'CO5',
    bl: 'K4',
    moduleId: 'm2',
    targetTopicIds: ['m2-t1', 'm2-t2', 'm2-t3', 'm2-t4'],
    title: 'Complete EER Diagram Design (Specialization / Weak Entities) + Minimal Cover & Lossless Chase Proof',
    d1Counterpart: 'D1 Q8 (15M) asked ER-to-Relational Mapping (8M) + FD Closure & Candidate Keys (7M)',
    subQuestions: [
      {
        part: '(i)',
        marks: 8,
        text: 'Design a complete Extended ER (EER) diagram from business rules (with weak entities, composite/multivalued attributes, disjoint/overlapping specialization & total/partial constraints), and state the best EER-to-Relational mapping option (8A–8D).',
      },
      {
        part: '(ii)',
        marks: 7,
        text: 'Given relation R(A,B,C,D,E) and a redundant FD set F: (a) Compute the Minimal (Canonical) Cover step-by-step (4M), and (b) Prove lossless-join vs. dependency-preservation using the Chase test / FD equivalence check (3M).',
      },
    ],
    rationale: 'Direct 15M mirror of D1 Q8: D1 gave a diagram to map and asked Closure/Keys; Alpha D2 flips both halves to drawing the EER diagram (A1 Q3 / A2 Q3 / A2 Q9b) + Minimal Cover & Lossless Proof.',
    vellorePrecedentTags: ['A1 Q3 [10M]', 'A2 Q3 [10M]', 'A2 Q9(b) [10M]'],
  },
  {
    id: 'alpha-q9',
    model: 'alpha',
    qNo: 'Q9',
    section: 'Section II (2 × 15M)',
    marks: 15,
    co: 'CO4',
    bl: 'K4',
    moduleId: 'm5',
    targetTopicIds: ['m5-t6', 'm5-t3', 'm5-t1'],
    title: 'Polyglot NoSQL Architecture (4 NoSQL Types + JSON Schema) & Two-Phase Commit (2PC) / Semijoin Cost',
    d1Counterpart: 'D1 Q9 (15M) asked 3-Campus Horizontal Fragmentation/Replication (8M) + MapReduce Average Rating (7M)',
    subQuestions: [
      {
        part: '(i)',
        marks: 8,
        text: 'Analyze scaling bottlenecks of a single relational/document DB for a large platform (e.g., Recipe-Sharing or Food Delivery), propose a Polyglot NoSQL architecture across Key-Value, Document, Wide-Column, and Graph databases, and write a sample nested JSON/BSON document.',
      },
      {
        part: '(ii)',
        marks: 7,
        text: 'Trace the Two-Phase Commit (2PC) distributed transaction protocol (Prepare & Commit phases + Coordinator failure blocking) OR optimize a two-site distributed join using Semijoin (R ⋉ S) network cost calculation & Distribution Transparencies.',
      },
    ],
    rationale: 'Direct 15M negative of D1 Q9: D1 tested Horizontal Fragmentation + MapReduce, leaving the Four NoSQL Types (m5-t6, A2 Q8) and 2PC/Semijoin (m5-t3) completely untested.',
    vellorePrecedentTags: ['A2 Q8 [10M]', 'A1 Q9(A) [2M]'],
  },
];

// ============================================================================
// BETA D2 BLUEPRINT (A1 -> A2 EMPIRICAL PATTERN PROJECTED ONTO CHENNAI D1)
// ============================================================================

export const BETA_D2_BLUEPRINT: PredictedD2Question[] = [
  {
    id: 'beta-q1',
    model: 'beta',
    qNo: 'Q1',
    section: 'Section I (7 × 10M)',
    marks: 10,
    co: 'CO1',
    bl: 'K3',
    moduleId: 'm1',
    targetTopicIds: ['m1-t3', 'm1-t4'],
    title: 'Three-Schema Architecture & Data Independence + Client-Server / Modern Data Models',
    d1Counterpart: 'Chennai D1 Q1: DBMS Component Modules (6M) + Actors (4M)',
    betaMechanism: 'Sibling Rotation',
    a1a2Precedent: 'A1 Q1 (DBMS Components) ➔ A2 Q1 (Three-Schema Architecture & Data Independence)',
    subQuestions: [
      {
        part: '(a)',
        marks: 6,
        text: 'Apply the ANSI/SPARC Three-Schema Architecture to a multi-user enterprise scenario, mapping External/Conceptual/Internal levels and justifying Logical vs. Physical Data Independence.',
      },
      {
        part: '(b)',
        marks: 4,
        text: 'Contrast 2-Tier vs. 3-Tier Client-Server DBMS architectures or evaluate Semi-Structured, Graph, Vector, and Time-Series models for modern workloads.',
      },
    ],
    rationale: 'Exact replication of the A1 Q1 ➔ A2 Q1 rotation: because Chennai D1 Q1 matched A1 Q1 (DBMS Components), Beta D2 predicts the exact A2 Q1 shift to Three-Schema Architecture.',
    vellorePrecedentTags: ['A1 Q1 ➔ A2 Q1'],
  },
  {
    id: 'beta-q2',
    model: 'beta',
    qNo: 'Q2',
    section: 'Section I (7 × 10M)',
    marks: 10,
    co: 'CO1',
    bl: 'K3',
    moduleId: 'm1',
    targetTopicIds: ['m1-t6'],
    title: 'Relational Integrity Constraints, Violation Audit & Referential Trigger Actions',
    d1Counterpart: 'Chennai D1 Q2 tested SQL (0M on Integrity Constraints)',
    betaMechanism: 'Anchor Repeat',
    a1a2Precedent: 'A1 Q2 (PROJECT_GRANT Integrity) ➔ A2 Q2 (Hospital Schema Integrity) — repeated in BOTH slots!',
    subQuestions: [
      {
        part: '(a)',
        marks: 6,
        text: 'Given a 3-table domain schema with sample rows, audit 6 DML operations (INSERT/DELETE/UPDATE) for Domain, Key, Entity Integrity, and Referential Integrity violations.',
      },
      {
        part: '(b)',
        marks: 4,
        text: 'Specify and trace ON DELETE CASCADE, RESTRICT, and SET NULL rules to enforce business integrity without orphan rows.',
      },
    ],
    rationale: 'In Vellore, Integrity Constraints (m1-t6) was a non-negotiable CO1 anchor present in BOTH A1 Q2 and A2 Q2. Because Chennai D1 omitted it, Beta D2 assigns it a full 10M slot.',
    vellorePrecedentTags: ['A1 Q2 + A2 Q2 Anchor'],
  },
  {
    id: 'beta-q3',
    model: 'beta',
    qNo: 'Q3',
    section: 'Section I (7 × 10M)',
    marks: 10,
    co: 'CO2',
    bl: 'K3',
    moduleId: 'm3',
    targetTopicIds: ['m3-t2', 'm3-t3'],
    title: 'Extendible / Linear Dynamic Hashing Trace + Multilevel Index Disk I/O Numerical',
    d1Counterpart: 'Chennai D1 Q3: B+ Tree p=4 Insert/Delete (6M) + Multilevel Theory (4M)',
    betaMechanism: 'Anchor Repeat',
    a1a2Precedent: 'A1 Q5 (Hashing OR B+ Tree) ➔ A2 Q4 (Multilevel Disk I/O Math) + A2 Q10(a) (B+ Tree)',
    subQuestions: [
      {
        part: '(a)',
        marks: 5,
        text: 'Trace Extendible Hashing (global/local depth & directory doubling) or compare Static vs. Linear Hashing for a dynamic key workload.',
      },
      {
        part: '(b)',
        marks: 5,
        text: 'Multilevel Index Disk I/O Numerical (A2 Q4 style): Given r records, block size B, record size R, key size V, and pointer size P, compute bfr, data blocks b, index fan-out fo, number of levels, and search I/Os (or B+ tree order p calculation).',
      },
    ],
    rationale: 'Vellore rotated between Hashing (A1 Q5a) and Multilevel Disk I/O Numerical (A2 Q4) while keeping Indexing math active in every slot. Chennai D1 only tested Indexing conceptually (4M), so Beta D2 predicts the Disk I/O numerical paired with Hashing.',
    vellorePrecedentTags: ['A1 Q5(a)', 'A2 Q4 [10M]'],
  },
  {
    id: 'beta-q4',
    model: 'beta',
    qNo: 'Q4',
    section: 'Section I (7 × 10M)',
    marks: 10,
    co: 'CO2',
    bl: 'K4',
    moduleId: 'm3',
    targetTopicIds: ['m3-t4', 'm3-t6'],
    title: 'Applied SQL / Relational Algebra Anchor + Heuristic Query Tree Optimization',
    d1Counterpart: 'Chennai D1 Q2/Q4: EV SQL (10M) + University RA Division (6M) + LSM (4M)',
    betaMechanism: 'Sibling Rotation',
    a1a2Precedent: 'A1 Q6 (Retail Banking Query Tree) ➔ A2 Q10(b) (Online Shopping Query Tree) — Query Tree in BOTH slots!',
    subQuestions: [
      {
        part: '(a)',
        marks: 5,
        text: 'Write 3 analytical SQL or Relational Algebra queries (Correlated Subquery, GROUP BY/HAVING, Division ÷ or Outer Join) on a fresh Chennai domain schema.',
      },
      {
        part: '(b)',
        marks: 5,
        text: 'Construct the Initial Canonical Query Tree for a 3-table SQL query and apply Heuristic Optimization rules step-by-step (push σ down, reorder joins, push π down).',
      },
    ],
    rationale: 'Unlike pure Alpha D2 (which drops SQL/RA completely), Beta D2 recognizes SQL/RA as a VIT Chennai staple while pulling in Heuristic Query Tree Optimization — which appeared in BOTH A1 Q6 and A2 Q10(b).',
    vellorePrecedentTags: ['A1 Q6 [10M]', 'A2 Q10(b) [10M]'],
  },
  {
    id: 'beta-q5',
    model: 'beta',
    qNo: 'Q5',
    section: 'Section I (7 × 10M)',
    marks: 10,
    co: 'CO3',
    bl: 'K4',
    moduleId: 'm4',
    targetTopicIds: ['m4-t1', 'm4-t3'],
    title: 'ACID Properties & Transaction State Diagram + Precedence Graph Conflict Serializability',
    d1Counterpart: 'Chennai D1 Q5: 6-Class Schedule Classification (4 schedules)',
    betaMechanism: 'Anchor Repeat',
    a1a2Precedent: 'A1 Q7 (Precedence Graph + Recoverability) ➔ A2 Q5 (ACID [5M] + S1/S2 Precedence Graphs [5M])',
    subQuestions: [
      {
        part: '(a)',
        marks: 5,
        text: 'Explain ACID properties in an online banking/e-commerce failure scenario and draw the Transaction State Transition Diagram.',
      },
      {
        part: '(b)',
        marks: 5,
        text: 'Given two interleaved schedules S1 and S2, list all conflicting pairs, construct Precedence Graphs, test Conflict Serializability, and write an equivalent serial order (or identify the cycle).',
      },
    ],
    rationale: 'Precedence Graph Conflict Serializability NEVER disappeared between A1 and A2 — it shifted from a 10M standalone (A1 Q7) to a 5M+5M split with ACID (A2 Q5). Beta D2 mirrors A2 Q5 directly!',
    vellorePrecedentTags: ['A1 Q7 ➔ A2 Q5'],
  },
  {
    id: 'beta-q6',
    model: 'beta',
    qNo: 'Q6',
    section: 'Section I (7 × 10M)',
    marks: 10,
    co: 'CO3',
    bl: 'K4',
    moduleId: 'm4',
    targetTopicIds: ['m4-t6', 'm4-t4'],
    title: 'Deferred vs. Immediate WAL Crash Recovery Trace + WFG Deadlock / Wait-Die & Wound-Wait',
    d1Counterpart: 'Chennai D1 Q6: Strict 2PL (5M) + Basic TO vs. Thomas Write Rule (5M)',
    betaMechanism: 'Sibling Rotation',
    a1a2Precedent: 'A1 Q8 (2PL OR Deferred/Immediate WAL Recovery) ➔ A2 Q6 (Strict 2PL + WFG Deadlock Resolution)',
    subQuestions: [
      {
        part: '(a)',
        marks: 5,
        text: 'Trace a crash WAL log containing [Checkpoint], committed, and active transactions under Deferred Update (NO-UNDO/REDO) vs. Immediate Update (UNDO/REDO), showing final disk balances.',
      },
      {
        part: '(b)',
        marks: 5,
        text: 'Trace a Strict 2PL lock schedule to draw the Wait-For Graph (WFG) deadlock cycle, resolve it by aborting a victim, and compare Wait-Die vs. Wound-Wait deadlock prevention.',
      },
    ],
    rationale: 'A1 and A2 split Concurrency+Recovery into WAL Recovery (A1 Q8b) and WFG Deadlock Handling (A2 Q6). Since Chennai D1 spent Q6 on Basic TO/Thomas, Beta D2 rotates directly to WAL Recovery + WFG/Wait-Die/Wound-Wait.',
    vellorePrecedentTags: ['A1 Q8(b) + A2 Q6'],
  },
  {
    id: 'beta-q7',
    model: 'beta',
    qNo: 'Q7',
    section: 'Section I (7 × 10M)',
    marks: 10,
    co: 'CO2',
    bl: 'K4',
    moduleId: 'm2',
    targetTopicIds: ['m2-t5'],
    title: 'Stage-by-Stage 1NF → 2NF → 3NF → BCNF Normalization (Fresh Domain) & 3NF vs. BCNF Proof',
    d1Counterpart: 'Chennai D1 Q7: Multispecialty Hospital 1NF → 5NF Normalization (10M)',
    betaMechanism: 'Anchor Repeat',
    a1a2Precedent: 'A1 Q4 (Hospital 1NF→BCNF) ➔ A2 Q9(a) (Project Evaluation 1NF→BCNF) — Normalization in EVERY slot!',
    subQuestions: [
      {
        part: '(a)',
        marks: 6,
        text: 'Given an unnormalized multi-attribute relation in a fresh domain (e.g., University Project Evaluation or E-Commerce Order), derive FDs & candidate key(s), audit 2NF/3NF/BCNF violations, and decompose into lossless BCNF tables with PKs and FKs.',
      },
      {
        part: '(b)',
        marks: 4,
        text: 'Prove why a relation with overlapping candidate keys can satisfy 3NF yet violate BCNF, comparing 3NF Synthesis (dependency-preserving) vs. BCNF Decomposition (possible FD loss).',
      },
    ],
    rationale: 'Key Alpha vs. Beta divergence: Alpha D2 assumes Normalization won\'t repeat since D1 Q7 tested it, whereas Vellore A1→A2 proves 1NF→BCNF Normalization is an EVERY-SLOT anchor that simply swaps domains (Hospital ➔ University/Order) and drops 4NF/5NF for a 3NF-vs-BCNF proof!',
    vellorePrecedentTags: ['A1 Q4 ➔ A2 Q9(a)'],
  },
  {
    id: 'beta-q8',
    model: 'beta',
    qNo: 'Q8',
    section: 'Section II (2 × 15M)',
    marks: 15,
    co: 'CO5',
    bl: 'K4',
    moduleId: 'm2',
    targetTopicIds: ['m2-t1', 'm2-t2', 'm2-t4'],
    title: 'EER Modeling (Weak Entity + Specialization Lattice) + Minimal Cover & Lossless Join Check',
    d1Counterpart: 'Chennai D1 Q8 (15M): Hotel ER-to-Relational Mapping (8M) + R(P,Q,R,S,T) Closure/Keys (7M)',
    betaMechanism: 'Sibling Rotation',
    a1a2Precedent: 'A1 Q3 (EER Agriculture) ➔ A2 Q3 (Hotel ER/EER) + A2 Q9(b) (Shared Subclass EER Lattice)',
    subQuestions: [
      {
        part: '(i)',
        marks: 8,
        text: 'Design an EER diagram from business rules incorporating a Weak Entity, Disjoint/Overlapping Specialization, Shared Subclass (Lattice), and explicit (min, max) participation constraints.',
      },
      {
        part: '(ii)',
        marks: 7,
        text: 'Given a relation schema and FD set F: (a) Compute the Canonical/Minimal Cover (4M) and (b) Test whether a proposed decomposition is Lossless-Join and Dependency-Preserving (3M).',
      },
    ],
    rationale: 'Rotates both halves of Chennai D1 Q8 (15M) to their untouched Module 2 siblings — EER diagramming (tested across BOTH A1 Q3 and A2 Q3/Q9b!) and Minimal Cover / Lossless verification.',
    vellorePrecedentTags: ['A1 Q3', 'A2 Q3', 'A2 Q9(b)'],
  },
  {
    id: 'beta-q9',
    model: 'beta',
    qNo: 'Q9',
    section: 'Section II (2 × 15M)',
    marks: 15,
    co: 'CO4',
    bl: 'K4',
    moduleId: 'm5',
    targetTopicIds: ['m5-t4', 'm5-t6', 'm5-t3'],
    title: 'CAP Theorem + 4 NoSQL Types / JSON Schema Design (8M) & Two-Phase Commit (2PC) / Semijoin (7M)',
    d1Counterpart: 'Chennai D1 Q9 (15M): 3-Campus Horizontal Fragmentation (8M) + MapReduce (7M)',
    betaMechanism: 'Sibling Rotation',
    a1a2Precedent: 'A1 Q9 (Fragmentation) + A1 Q10 (CAP) ➔ A2 Q7 (CAP Banking) + A2 Q8 (NoSQL Model & JSON)',
    subQuestions: [
      {
        part: '(i)',
        marks: 8,
        text: 'Analyze a distributed application under network partition using CAP Theorem (CP vs. AP, ACID vs. BASE) AND recommend the optimal NoSQL database family (Document/KV/Wide-Column/Graph) with a concrete JSON/Graph schema.',
      },
      {
        part: '(ii)',
        marks: 7,
        text: 'Trace the Two-Phase Commit (2PC) protocol (Prepare/Vote & Commit/Abort phases + Coordinator crash blocking) or compute distributed Semijoin (R ⋉ S) network transfer savings.',
      },
    ],
    rationale: 'Directly applies the A1 Q9/Q10 ➔ A2 Q7/Q8 rotation to Chennai D1 Q9: Fragmentation + MapReduce rotate out, and CAP Theorem (anchor in BOTH A1 & A2) + 4 NoSQL Types (A2 Q8) + 2PC/Semijoin rotate into the 15M Section II capstone.',
    vellorePrecedentTags: ['A1 Q10 ➔ A2 Q7', 'A2 Q8 [10M]'],
  },
];

export function computePredictionStats(matrix: TopicPredictionEntry[]): PredictionSummaryStats {
  const untestedInD1 = matrix.filter((t) => t.d1Status === 'untested').length;
  const partialInD1 = matrix.filter((t) => t.d1Status === 'partial').length;
  const testedInD1 = matrix.filter((t) => t.d1Status === 'tested').length;
  const untestedWithVelloreProof = matrix.filter(
    (t) => t.d1Status === 'untested' && t.velloreLinks.length > 0
  ).length;
  const partialWithVelloreProof = matrix.filter(
    (t) => t.d1Status === 'partial' && t.velloreLinks.length > 0
  ).length;

  return {
    totalTopics: matrix.length,
    untestedInD1,
    partialInD1,
    testedInD1,
    untestedWithVelloreProof,
    partialWithVelloreProof,
    alphaTotalMarks: ALPHA_D2_BLUEPRINT.reduce((s, q) => s + q.marks, 0),
    betaTotalMarks: BETA_D2_BLUEPRINT.reduce((s, q) => s + q.marks, 0),
    betaRotationCount: BETA_D2_BLUEPRINT.filter((q) => q.betaMechanism === 'Sibling Rotation').length,
    betaRepeatCount: BETA_D2_BLUEPRINT.filter((q) => q.betaMechanism === 'Anchor Repeat').length,
  };
}

export function filterPredictionMatrix(
  matrix: TopicPredictionEntry[],
  coverageFilter: PredictionCoverageFilter,
  moduleFilter: 'all' | ModuleId
): TopicPredictionEntry[] {
  return matrix.filter((entry) => {
    if (moduleFilter !== 'all' && entry.moduleId !== moduleFilter) return false;
    switch (coverageFilter) {
      case 'untested':
        return entry.d1Status === 'untested';
      case 'untested_with_vellore':
        return entry.d1Status === 'untested' && entry.velloreLinks.length > 0;
      case 'partial':
        return entry.d1Status === 'partial';
      case 'tested':
        return entry.d1Status === 'tested';
      case 'all':
      default:
        return true;
    }
  });
}
