// ============================================================================
// #11: ER/EER 7-Step & 8A-8D Mapping Engine, 48h High-Yield 80/20 Triage
// & Morning Rapid-Fire Formula & Axiom Flashcard Deck
// Pure, deterministic logic decoupled from UI for fast unit testing
// ============================================================================

import type { SprintBlock } from '../data/bacse202Data';

// ----------------------------------------------------------------------------
// 1. ER/EER 7-Step + Options 8A-8D Mapping Drill
// ----------------------------------------------------------------------------

export interface ErMappingQuestion {
  id: string;
  stepTag: string;
  examRef: string;
  constructTitle: string;
  erScenario: string;
  questionPrompt: string;
  options: string[];
  correctIndex: number;
  mappedSchema: string;
  ruleExplanation: string;
}

export const ER_MAPPING_DRILLS: ErMappingQuestion[] = [
  {
    id: 'er-step-1',
    stepTag: 'Step 1 · Regular Entity',
    examRef: 'Model Q1 / Elmasri Step 1',
    constructTitle: 'Strong Entity with Composite & Derived Attributes',
    erScenario:
      'Entity STUDENT has key RegNo, composite attribute Name(First, Last), stored attribute DOB, and derived attribute Age.',
    questionPrompt:
      'Which relational schema correctly maps this strong entity under Step 1?',
    options: [
      'STUDENT(RegNo [PK], First, Last, DOB) — flatten composite Name, omit derived Age',
      'STUDENT(RegNo [PK], Name, DOB, Age) — keep composite Name as single column and store Age',
      'STUDENT(RegNo [PK], DOB) + NAME(RegNo [FK], First, Last) — separate table for composite',
      'STUDENT(RegNo, First, Last, DOB, Age) with no primary key required',
    ],
    correctIndex: 0,
    mappedSchema: 'STUDENT(RegNo [PK], First, Last, DOB)',
    ruleExplanation:
      'Step 1 creates one relation per regular entity containing only simple component attributes of any composite attribute (First, Last). Derived attributes (Age) are computed on query, not stored.',
  },
  {
    id: 'er-step-2',
    stepTag: 'Step 2 · Weak Entity',
    examRef: 'A2 Q3 / Model Q1',
    constructTitle: 'Weak Entity & Identifying Relationship',
    erScenario:
      'Weak entity DEPENDENT (partial key Dep_Name, Relationship) is owned by strong entity EMPLOYEE(SSN [PK]) via identifying relationship DEPENDENTS_OF.',
    questionPrompt:
      'What is the exact primary key and foreign key design for DEPENDENT?',
    options: [
      'DEPENDENT(Dep_Name [PK], Relationship) — no foreign key needed',
      'DEPENDENT(SSN [FK → EMPLOYEE], Dep_Name, Relationship) with composite PK (SSN, Dep_Name)',
      'Merge Dep_Name directly into EMPLOYEE as a single-valued attribute',
      'DEPENDENT(Dep_ID [PK], SSN [FK], Dep_Name) where SSN allows NULL',
    ],
    correctIndex: 1,
    mappedSchema:
      'DEPENDENT(SSN [PK, FK → EMPLOYEE ON DELETE CASCADE], Dep_Name [PK], Relationship)',
    ruleExplanation:
      'Step 2 maps every weak entity to its own relation, includes the identifying owner’s PK (SSN) as a NOT NULL FK, and forms the composite PK = (Owner_PK + Partial_Key).',
  },
  {
    id: 'er-step-3',
    stepTag: 'Step 3 · Binary 1:1',
    examRef: 'Elmasri Step 3 (Foreign Key Rule)',
    constructTitle: 'Binary 1:1 with Partial vs Total Participation',
    erScenario:
      'EMPLOYEE (partial participation) — MANAGES(StartDate) — DEPARTMENT (total participation; every department has exactly one manager).',
    questionPrompt:
      'Where should the foreign key and StartDate attribute be placed to avoid NULLs?',
    options: [
      'Place Dept_No [FK] and StartDate inside EMPLOYEE (the partial side)',
      'Place Mgr_SSN [FK → EMPLOYEE] and StartDate inside DEPARTMENT (the total participation side)',
      'Always create a mandatory third junction table MANAGES(SSN, Dept_No, StartDate)',
      'Duplicate both keys into both tables simultaneously',
    ],
    correctIndex: 1,
    mappedSchema:
      'DEPARTMENT(Dnumber [PK], Dname, Mgr_SSN [FK → EMPLOYEE, UNIQUE, NOT NULL], Mgr_StartDate)',
    ruleExplanation:
      'Step 3 (Foreign Key approach) places the FK on the relation with TOTAL participation (DEPARTMENT) so the FK is never NULL, and attaches relationship attributes (StartDate) to that same table.',
  },
  {
    id: 'er-step-4',
    stepTag: 'Step 4 · Binary 1:N',
    examRef: 'A2 Q3 / Classic Trap',
    constructTitle: 'Binary 1:N Relationship Direction',
    erScenario:
      'DEPARTMENT (1) — WORKS_FOR — EMPLOYEE (N): Each department has many employees; each employee works for one department.',
    questionPrompt:
      'Which side receives the foreign key in a 1:N relationship?',
    options: [
      'Add Dno [FK → DEPARTMENT] into EMPLOYEE (the N-side)',
      'Add SSN [FK → EMPLOYEE] into DEPARTMENT (the 1-side)',
      'Create a separate table WORKS_FOR(Dno, SSN) as the only legal option',
      'Store a comma-separated list of SSNs inside DEPARTMENT',
    ],
    correctIndex: 0,
    mappedSchema: 'EMPLOYEE(SSN [PK], Name, Salary, Dno [FK → DEPARTMENT])',
    ruleExplanation:
      'Step 4 always posts the PK of the 1-side (DEPARTMENT.Dnumber) as a Foreign Key in the N-side relation (EMPLOYEE). Putting SSN in DEPARTMENT would violate 1NF (multi-valued).',
  },
  {
    id: 'er-step-5',
    stepTag: 'Step 5 · Binary M:N',
    examRef: 'A2 Q3 / Model Q1',
    constructTitle: 'Binary M:N Relationship with Attributes',
    erScenario:
      'STUDENT(RegNo) — ENROLLS(Grade, Semester) — COURSE(CourseID) with cardinality M:N.',
    questionPrompt:
      'How must an M:N relationship be represented in the relational model?',
    options: [
      'Add CourseID as a foreign key in STUDENT',
      'Add RegNo as a foreign key in COURSE',
      'Create a new associative table ENROLLS(RegNo [FK], CourseID [FK], Grade, Semester) with PK (RegNo, CourseID)',
      'Merge STUDENT and COURSE into a single relation',
    ],
    correctIndex: 2,
    mappedSchema:
      'ENROLLS(RegNo [PK, FK → STUDENT], CourseID [PK, FK → COURSE], Grade, Semester)',
    ruleExplanation:
      'Step 5 mandates a new relationship relation whose primary key is the combination of both participating entities’ PKs, plus any simple attributes of the relationship itself.',
  },
  {
    id: 'er-step-6',
    stepTag: 'Step 6 · Multivalued Attr',
    examRef: 'Model Q1 (Phone/Location)',
    constructTitle: 'Multivalued Attribute Normalization to 1NF',
    erScenario:
      'DEPARTMENT(Dnumber [PK], Dname) has a multivalued attribute {Locations} (a department can operate in Chennai, Vellore, and Amaravati).',
    questionPrompt:
      'Which schema satisfies Step 6 and preserves 1NF?',
    options: [
      'DEPARTMENT(Dnumber [PK], Dname, Locations) storing "Chennai, Vellore"',
      'DEPT_LOCATIONS(Dnumber [PK, FK → DEPARTMENT], Dlocation [PK])',
      'DEPT_LOCATIONS(Dlocation [PK], Dnumber [FK → DEPARTMENT])',
      'DEPARTMENT(Dnumber [PK], Dname, Loc1, Loc2, Loc3)',
    ],
    correctIndex: 1,
    mappedSchema: 'DEPT_LOCATIONS(Dnumber [PK, FK → DEPARTMENT], Dlocation [PK])',
    ruleExplanation:
      'Step 6 creates a new relation holding the owner’s PK (Dnumber) + the multivalued attribute (Dlocation). Both columns together form the composite PK so multiple departments can share a city.',
  },
  {
    id: 'er-step-7',
    stepTag: 'Step 7 · N-ary (Ternary)',
    examRef: 'Elmasri Step 7 (n > 2)',
    constructTitle: 'Ternary Relationship Mapping',
    erScenario:
      'Ternary relationship SUPPLY(Quantity) connects SUPPLIER(Sname), PROJECT(ProjName), and PART(PartNo) with M:N:P cardinality.',
    questionPrompt:
      'What table is created under Step 7?',
    options: [
      'Decompose into three separate binary tables without storing Quantity',
      'Create SUPPLY(Sname [FK], ProjName [FK], PartNo [FK], Quantity) with composite PK (Sname, ProjName, PartNo)',
      'Place Sname and PartNo as foreign keys inside PROJECT',
      'Create SUPPLY(Quantity [PK], Sname, ProjName, PartNo)',
    ],
    correctIndex: 1,
    mappedSchema:
      'SUPPLY(Sname [PK, FK], ProjName [PK, FK], PartNo [PK, FK], Quantity)',
    ruleExplanation:
      'Step 7 creates one relation for each n-ary (n > 2) relationship containing FKs to all participating entities plus relationship attributes. The PK combines all FKs (except any entity with max cardinality 1).',
  },
  {
    id: 'er-step-8a',
    stepTag: 'Step 8A · EER Super+Sub',
    examRef: 'Model Q1 (Hospital EER)',
    constructTitle: 'Option 8A: Superclass + Subclass Relations',
    erScenario:
      'Hospital EER: PERSON(PID, Name) specialized into DOCTOR(Spec), NURSE(Shift), and PATIENT(Ward) — overlapping or partial constraints may apply.',
    questionPrompt:
      'Why is Option 8A the most universal EER mapping strategy?',
    options: [
      'It only works for Disjoint + Total specializations',
      'It works for ANY specialization (disjoint/overlapping, total/partial) by giving each subclass the superclass PK as both PK and FK',
      'It eliminates all joins when querying a subclass',
      'It drops the PERSON superclass table completely',
    ],
    correctIndex: 1,
    mappedSchema:
      'PERSON(PID [PK], Name); DOCTOR(PID [PK, FK → PERSON], Spec); NURSE(PID [PK, FK], Shift); PATIENT(PID [PK, FK], Ward)',
    ruleExplanation:
      'Option 8A (Multiple relations: Superclass + Subclasses) handles ALL combinations of (d/o) and (total/partial) cleanly with zero NULL waste, at the cost of a join on PID.',
  },
  {
    id: 'er-step-8b',
    stepTag: 'Step 8B · Subclasses Only',
    examRef: 'A2 Q3 / Exam Trap',
    constructTitle: 'Option 8B Validity Condition (Subclasses Only)',
    erScenario:
      'EER hierarchy VEHICLE(VID, Price) specialized into CAR(MaxSpeed) and TRUCK(Tonnage). You want to drop the VEHICLE table and keep only CAR and TRUCK.',
    questionPrompt:
      'When is Option 8B (Multiple relations — Subclass relations ONLY) strictly recommended/valid without losing entities or duplicating superclass data?',
    options: [
      'Only when the specialization is TOTAL and DISJOINT',
      'Whenever the specialization is PARTIAL and OVERLAPPING',
      'For every EER diagram regardless of constraints',
      'Only when subclasses have no specific attributes',
    ],
    correctIndex: 0,
    mappedSchema:
      'CAR(VID [PK], Price, MaxSpeed); TRUCK(VID [PK], Price, Tonnage)  [No VEHICLE table]',
    ruleExplanation:
      'If specialization is Partial, superclass-only entities vanish with no table! If Overlapping, superclass attributes get redundantly duplicated across subclass tables. Thus 8B requires Total + Disjoint.',
  },
  {
    id: 'er-step-8cd',
    stepTag: 'Step 8C vs 8D · Single Table',
    examRef: 'Model Q1 / Elmasri 8C–8D',
    constructTitle: 'Single Relation with Type Discriminator (8C) vs Boolean Flags (8D)',
    erScenario:
      'PART(PartNo, Desc) has an OVERLAPPING specialization into MANUFACTURED_PART(DrawingNo) and PURCHASED_PART(SupplierName). A part can be both!',
    questionPrompt:
      'Why must you choose Option 8D over Option 8C for a single-table mapping here?',
    options: [
      'Option 8C uses a single Type column which can hold only one subclass value (Disjoint only); Option 8D adds separate boolean flags (Mflag, Pflag) to support Overlapping subclasses',
      'Option 8C is exclusively for Overlapping hierarchies',
      'Option 8D completely eliminates NULL values across all subclass columns',
      'Option 8C requires creating three separate tables',
    ],
    correctIndex: 0,
    mappedSchema:
      'PART(PartNo [PK], Desc, Mflag [BOOL], DrawingNo, Pflag [BOOL], SupplierName)',
    ruleExplanation:
      'Option 8C uses ONE type column (e.g., JobType = "Engineer" | "Technician"), so it works ONLY for Disjoint (d). Option 8D uses one boolean flag per subclass, supporting Overlapping (o) or Disjoint.',
  },
];

export interface ErQuizScore {
  answeredCount: number;
  correctCount: number;
  totalCount: number;
  accuracyPct: number;
}

export function evaluateErQuizScore(selections: Record<string, number>): ErQuizScore {
  const totalCount = ER_MAPPING_DRILLS.length;
  let answeredCount = 0;
  let correctCount = 0;

  for (const q of ER_MAPPING_DRILLS) {
    if (selections[q.id] !== undefined) {
      answeredCount++;
      if (selections[q.id] === q.correctIndex) {
        correctCount++;
      }
    }
  }

  return {
    answeredCount,
    correctCount,
    totalCount,
    accuracyPct: answeredCount === 0 ? 0 : Math.round((correctCount / answeredCount) * 100),
  };
}

// ----------------------------------------------------------------------------
// 2. Interactive EER Option 8A-8D Recommender Matrix
// ----------------------------------------------------------------------------

export type EerDisjointness = 'disjoint' | 'overlapping';
export type EerCompleteness = 'total' | 'partial';

export interface EerOptionEvaluation {
  optionId: '8A' | '8B' | '8C' | '8D';
  title: string;
  status: 'RECOMMENDED' | 'VALID' | 'INVALID';
  reason: string;
  exampleTables: string[];
  tradeoff: string;
}

export function recommendEerMappingOptions(
  disjointness: EerDisjointness,
  completeness: EerCompleteness
): EerOptionEvaluation[] {
  const isDisjoint = disjointness === 'disjoint';
  const isTotal = completeness === 'total';

  return [
    {
      optionId: '8A',
      title: '8A · Multiple Relations (Superclass + Subclasses)',
      status: !isDisjoint || !isTotal ? 'RECOMMENDED' : 'VALID',
      reason:
        'Works cleanly for ALL EER constraints (disjoint/overlapping, total/partial) with zero NULL bloat.',
      exampleTables: [
        'PERSON(PID [PK], Name, Phone)',
        'DOCTOR(PID [PK, FK → PERSON], Specialty)',
        'STAFF(PID [PK, FK → PERSON], Shift)',
      ],
      tradeoff: 'Requires JOIN on PID to retrieve full subclass + superclass attributes.',
    },
    {
      optionId: '8B',
      title: '8B · Multiple Relations (Subclass Relations Only)',
      status: isDisjoint && isTotal ? 'RECOMMENDED' : 'INVALID',
      reason:
        isDisjoint && isTotal
          ? 'Optimal for Total + Disjoint: every entity belongs to exactly one subclass, avoiding joins with zero duplication.'
          : !isTotal
          ? 'INVALID for Partial: entities belonging only to the superclass have NO table to be stored in!'
          : 'INVALID/DISCOURAGED for Overlapping: entities in multiple subclasses duplicate superclass attributes, causing update anomalies.',
      exampleTables: [
        'DOCTOR(PID [PK], Name, Phone, Specialty)',
        'STAFF(PID [PK], Name, Phone, Shift)',
      ],
      tradeoff: 'Fast subclass queries without joins, but cross-subclass queries require UNION.',
    },
    {
      optionId: '8C',
      title: '8C · Single Relation with One Type Discriminator',
      status: isDisjoint ? 'VALID' : 'INVALID',
      reason: isDisjoint
        ? 'Valid for Disjoint (d): single PersonType column identifies which single subclass applies (NULL if Partial superclass-only).'
        : 'INVALID for Overlapping (o): a single atomic Type column cannot record membership in multiple subclasses simultaneously.',
      exampleTables: [
        'PERSON(PID [PK], Name, Phone, PersonType, Specialty, Shift)',
      ],
      tradeoff: 'Zero joins, but creates many NULLs if subclasses have numerous distinct attributes.',
    },
    {
      optionId: '8D',
      title: '8D · Single Relation with Multiple Boolean Flags',
      status: !isDisjoint ? 'RECOMMENDED' : 'VALID',
      reason: !isDisjoint
        ? 'Ideal single-table choice for Overlapping (o): IsDoctor and IsStaff flags can both be TRUE simultaneously.'
        : 'Valid (though 8C is simpler for Disjoint): each subclass gets a boolean indicator column.',
      exampleTables: [
        'PERSON(PID [PK], Name, Phone, IsDoctor [BOOL], Specialty, IsStaff [BOOL], Shift)',
      ],
      tradeoff: 'Zero joins and supports overlapping roles, but introduces sparse NULL columns.',
    },
  ];
}

// ----------------------------------------------------------------------------
// 3. 48h High-Yield 80/20 Triage Mode (65-70M First-Pass Baseline)
// ----------------------------------------------------------------------------

export const TRIAGE_HIGH_YIELD_BLOCK_IDS: ReadonlySet<string> = new Set([
  'sb-2', // M2A: ER/EER Modeling & 7-Step Mapping (10M guaranteed)
  'sb-3', // M2B: FDs, Minimal Cover & 1NF-BCNF (10M guaranteed)
  'sb-4', // M3A: Dynamic Hashing & B+ Trees (10M guaranteed)
  'sb-5', // M3B: Relational Algebra, TRC & Heuristic Query Trees (10M guaranteed)
  'sb-6', // M4A: ACID, Recoverability & Conflict Serializability (10M guaranteed)
  'sb-8', // M5: Fragmentation, Semijoin, 2PC, CAP & NoSQL (15-20M guaranteed)
]);

export interface SprintFilterOptions {
  dayFilter: 'All' | 'Nov 21' | 'Nov 22' | 'Nov 23';
  hideCompleted: boolean;
  highYieldOnly: boolean;
  completedBlockIds: string[];
}

export function filterSprintBlocks(
  blocks: SprintBlock[],
  options: SprintFilterOptions
): SprintBlock[] {
  const completedSet = new Set(options.completedBlockIds);
  return blocks.filter((block) => {
    if (options.dayFilter !== 'All' && block.day !== options.dayFilter) return false;
    if (options.hideCompleted && completedSet.has(block.id)) return false;
    if (options.highYieldOnly && !TRIAGE_HIGH_YIELD_BLOCK_IDS.has(block.id)) return false;
    return true;
  });
}

export interface TriageSummary {
  coreBlockCount: number;
  completedCoreCount: number;
  corePercent: number;
  coreSyllabusHours: number;
  estimatedPrepHours: number;
  targetMarkBand: string;
}

export function calculateTriageSummary(
  blocks: SprintBlock[],
  completedBlockIds: string[]
): TriageSummary {
  const coreBlocks = blocks.filter((b) => TRIAGE_HIGH_YIELD_BLOCK_IDS.has(b.id));
  const completedSet = new Set(completedBlockIds);
  const completedCoreCount = coreBlocks.filter((b) => completedSet.has(b.id)).length;
  const coreSyllabusHours = coreBlocks.reduce((acc, b) => acc + b.syllabusHours, 0);
  const estimatedPrepHours = coreBlocks.reduce((acc, b) => {
    const match = b.durationLabel.match(/([\d.]+)/);
    return acc + (match ? Number(match[1]) : 0);
  }, 0);

  return {
    coreBlockCount: coreBlocks.length,
    completedCoreCount,
    corePercent:
      coreBlocks.length === 0 ? 0 : Math.round((completedCoreCount / coreBlocks.length) * 100),
    coreSyllabusHours,
    estimatedPrepHours: Number(estimatedPrepHours.toFixed(2)),
    targetMarkBand: '65–75 / 100 Marks',
  };
}

// ----------------------------------------------------------------------------
// 4. Exam-Morning Rapid-Fire Formula & Axiom Flashcard Deck (24 Cards)
// ----------------------------------------------------------------------------

export type FlashcardModule = 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
export type FlashcardCategory = 'Formula' | 'Axiom / Rule' | 'Comparison' | 'Exam Trap';

export interface RapidFlashcard {
  id: string;
  moduleId: FlashcardModule;
  category: FlashcardCategory;
  frontPrompt: string;
  backAnswer: string;
  examHint: string;
}

export const FLASHCARD_DECK: RapidFlashcard[] = [
  // Module 1 (4 cards)
  {
    id: 'fc-m1-1',
    moduleId: 'm1',
    category: 'Comparison',
    frontPrompt: 'Logical Data Independence vs. Physical Data Independence — which layer changes?',
    backAnswer:
      'Logical DI: change Conceptual schema without altering External views/apps. Physical DI: change Internal storage/indexes without altering Conceptual schema.',
    examHint: 'Physical DI is easier to achieve and more common in practice.',
  },
  {
    id: 'fc-m1-2',
    moduleId: 'm1',
    category: 'Axiom / Rule',
    frontPrompt: 'State the Entity Integrity Rule vs. the Referential Integrity Rule.',
    backAnswer:
      'Entity Integrity: NO Primary Key attribute may be NULL in any tuple. Referential Integrity: every Foreign Key value must either match an existing PK in the referenced relation OR be NULL.',
    examHint: 'A1 Q2 & A2 Q2 test all 4 constraints: Domain, Key, Entity, Referential.',
  },
  {
    id: 'fc-m1-3',
    moduleId: 'm1',
    category: 'Exam Trap',
    frontPrompt: 'What are the 4 SQL Referential Actions when a referenced Parent PK is DELETED?',
    backAnswer:
      '1) RESTRICT / NO ACTION (reject delete), 2) CASCADE (delete matching child rows), 3) SET NULL (nullify child FK if nullable), 4) SET DEFAULT (assign default FK value).',
    examHint: 'INSERT on parent never violates RI; DELETE on child never violates RI.',
  },
  {
    id: 'fc-m1-4',
    moduleId: 'm1',
    category: 'Comparison',
    frontPrompt: 'When should you pick Graph vs. Vector vs. Time-Series DB models?',
    backAnswer:
      'Graph: multi-hop traversals (fraud rings, social networks). Vector: high-dim embeddings + ANN cosine similarity (RAG/AI search). Time-Series: timestamped append-only telemetry/IoT.',
    examHint: 'Module 1 modern data models appear in 2M/10M architecture prompts.',
  },

  // Module 2 (5 cards)
  {
    id: 'fc-m2-1',
    moduleId: 'm2',
    category: 'Axiom / Rule',
    frontPrompt: 'List Armstrong’s 3 Primary Axioms and 3 Derived Rules for FDs.',
    backAnswer:
      'Primary: Reflexivity (Y ⊆ X ⇒ X→Y), Augmentation (X→Y ⇒ XZ→YZ), Transitivity (X→Y, Y→Z ⇒ X→Z). Derived: Union, Decomposition, Pseudotransitivity.',
    examHint: 'Sound & Complete: they generate the exact closure F+.',
  },
  {
    id: 'fc-m2-2',
    moduleId: 'm2',
    category: 'Formula',
    frontPrompt: 'What are the exact 3 steps to compute a Minimal (Canonical) Cover Fc?',
    backAnswer:
      '1) Decompose RHS to singletons (X→A). 2) Remove extraneous LHS attributes (check if A ∈ (X − {B})+). 3) Remove redundant FDs (check if A ∈ X+ without using X→A).',
    examHint: 'Never skip Step 2 before Step 3 — order matters!',
  },
  {
    id: 'fc-m2-3',
    moduleId: 'm2',
    category: 'Comparison',
    frontPrompt: 'Exact formal definition difference between 3NF and BCNF for non-trivial X → A?',
    backAnswer:
      '3NF: X is a Superkey OR A is a Prime attribute. BCNF: X MUST be a Superkey (no prime-attribute exception). 3NF always guarantees lossless + FD-preserving; BCNF guarantees lossless only.',
    examHint: 'Classic 3NF-not-BCNF witness: R(A,B,C) with AB→C, C→B.',
  },
  {
    id: 'fc-m2-4',
    moduleId: 'm2',
    category: 'Formula',
    frontPrompt: 'Binary Lossless-Join Test for decomposing R into (R1, R2)?',
    backAnswer:
      'Decomposition (R1, R2) is lossless-join iff (R1 ∩ R2) → R1  OR  (R1 ∩ R2) → R2 holds in F+. For k > 2 tables, run the Chase Tableau Matrix until an all-"a" row appears.',
    examHint: 'Compute (R1 ∩ R2)+ and verify it covers all attributes of R1 or R2.',
  },
  {
    id: 'fc-m2-5',
    moduleId: 'm2',
    category: 'Exam Trap',
    frontPrompt: 'ER-to-Relational Mapping: Where does the FK go in 1:1, 1:N, M:N, and Weak Entities?',
    backAnswer:
      '1:1 → FK on Total-participation side. 1:N → FK on N-side. M:N → new junction table with composite PK. Weak Entity → new table with PK = (Owner_PK, Partial_Key).',
    examHint: 'EER 8B (subclasses only) is ONLY valid for Total + Disjoint!',
  },

  // Module 3 (5 cards)
  {
    id: 'fc-m3-1',
    moduleId: 'm3',
    category: 'Formula',
    frontPrompt: 'Multilevel Index Disk I/O Formulas: bfr, data blocks b, and index levels?',
    backAnswer:
      'bfr = floor(B / R_size); Data blocks b = ceil(r / bfr); Primary index entries = b (sparse); Dense secondary entries = r; Fanout fo = floor(B / (K + P)); Total I/O = levels + 1 data block.',
    examHint: 'Exact A2+TA2 Q4 numerical formula — always use floor() for bfr/fo and ceil() for blocks.',
  },
  {
    id: 'fc-m3-2',
    moduleId: 'm3',
    category: 'Formula',
    frontPrompt: 'B+ Tree of order p (internal) and p_leaf (leaf): min & max keys and pointers?',
    backAnswer:
      'Internal (non-root): max p ptrs & (p−1) keys; min ceil(p/2) ptrs & ceil(p/2)−1 keys. Leaf: max (p_leaf−1) entries + 1 next-leaf ptr; min ceil((p_leaf−1)/2) entries.',
    examHint: 'In B+ tree split, leaf middle key is COPIED up; internal middle key is PUSHED up!',
  },
  {
    id: 'fc-m3-3',
    moduleId: 'm3',
    category: 'Comparison',
    frontPrompt: 'Extendible Hashing vs. Linear Hashing — how do they split buckets?',
    backAnswer:
      'Extendible: uses directory of size 2^d (global depth d, bucket local depth d\'); splits overflowing bucket and doubles directory when d\' == d. Linear: NO directory; splits bucket at split pointer n round-robin when load factor exceeds threshold.',
    examHint: 'A1 Q5(a): Extendible uses leading/trailing d bits; Linear uses h_i(k) = k mod (2^i × M).',
  },
  {
    id: 'fc-m3-4',
    moduleId: 'm3',
    category: 'Formula',
    frontPrompt: 'Write the Relational Algebra Division (R ÷ S) identity using basic operators.',
    backAnswer:
      'R(A, B) ÷ S(B) = π_A(R) − π_A( (π_A(R) × S) − R ). Answers "find all A that are associated with EVERY B in S."',
    examHint: 'In TRC, Division translates to universal quantifier ∀c ∈ S (∃e ∈ R ...).',
  },
  {
    id: 'fc-m3-5',
    moduleId: 'm3',
    category: 'Axiom / Rule',
    frontPrompt: 'State the 5-step Heuristic Query-Tree Optimization sequence.',
    backAnswer:
      '1) Cascade conjunctive σ (break σ_{c1∧c2}). 2) Push σ as far down the tree as possible. 3) Reorder leaves/joins so most restrictive σ & smallest intermediate results execute first. 4) Combine Cartesian × + σ into equijoin ⋈. 5) Push π down to drop unused columns early.',
    examHint: 'Always annotate intermediate tuple counts to prove cost reduction (Model Q8).',
  },

  // Module 4 (5 cards)
  {
    id: 'fc-m4-1',
    moduleId: 'm4',
    category: 'Axiom / Rule',
    frontPrompt: 'How do you construct a Conflict Serializability Precedence Graph?',
    backAnswer:
      'Create node Ti per transaction. Add directed edge Ti → Tj for any conflicting pair on the same item X where Ti precedes Tj: RW (R_i(X), W_j(X)), WR (W_i(X), R_j(X)), or WW (W_i(X), W_j(X)). Acyclic ⇔ Conflict Serializable (topological order = equivalent serial order).',
    examHint: 'Read–Read (RR) is NEVER a conflict!',
  },
  {
    id: 'fc-m4-2',
    moduleId: 'm4',
    category: 'Comparison',
    frontPrompt: 'Explain the strict hierarchy: Strict ⊂ Cascadeless (ACA) ⊂ Recoverable.',
    backAnswer:
      'Recoverable: if Tj reads X written by Ti, Ti must commit before Tj commits. Cascadeless (ACA): Tj can only read committed values (no dirty reads). Strict: Tj can neither read NOR overwrite X until Ti commits or aborts.',
    examHint: 'Strict 2PL holds all X-locks until commit/abort, guaranteeing Strict schedules.',
  },
  {
    id: 'fc-m4-3',
    moduleId: 'm4',
    category: 'Exam Trap',
    frontPrompt: 'Deadlock Prevention: Wait-Die vs. Wound-Wait when Ti requests a lock held by Tj?',
    backAnswer:
      'Wait-Die (Non-Preemptive): Older waits (TS(Ti) < TS(Tj)), Younger dies/aborts. Wound-Wait (Preemptive): Older wounds/aborts younger (TS(Ti) < TS(Tj)), Younger waits. Both keep original TS on restart to prevent starvation!',
    examHint: 'Mnemonic: Older is ALWAYS favored — Wait-Die (older waits), Wound-Wait (older wounds).',
  },
  {
    id: 'fc-m4-4',
    moduleId: 'm4',
    category: 'Axiom / Rule',
    frontPrompt: 'Basic Timestamp Ordering (BTO) vs. Thomas Write Rule on W_i(X)?',
    backAnswer:
      'BTO: abort Ti if TS(Ti) < R-TS(X) OR TS(Ti) < W-TS(X). Thomas Write Rule: if TS(Ti) >= R-TS(X) but TS(Ti) < W-TS(X), IGNORE the obsolete write (do NOT abort) — yields View Serializable schedules!',
    examHint: 'If TS(Ti) < R-TS(X), BOTH BTO and Thomas Write Rule MUST abort Ti.',
  },
  {
    id: 'fc-m4-5',
    moduleId: 'm4',
    category: 'Comparison',
    frontPrompt: 'Deferred Update (NO-UNDO/REDO) vs. Immediate Update (UNDO/REDO) WAL Recovery?',
    backAnswer:
      'Deferred: DB disk not touched before commit → on crash, REDO committed Txs after checkpoint, NO UNDO needed. Immediate: uncommitted writes may reach disk → WAL must flush <T, X, old, new> first; on crash, UNDO active Txs backward, REDO committed Txs forward.',
    examHint: 'Transactions committed BEFORE the last checkpoint need neither UNDO nor REDO.',
  },

  // Module 5 (5 cards)
  {
    id: 'fc-m5-1',
    moduleId: 'm5',
    category: 'Axiom / Rule',
    frontPrompt: 'Name the 3 Correctness Rules of Data Fragmentation (Horizontal & Vertical).',
    backAnswer:
      '1) Completeness: every tuple/attribute of R appears in at least one fragment. 2) Reconstruction: Horizontal via Union (∪), Vertical via Natural Join (⋈) with PK replicated in every fragment. 3) Disjointness: zero tuple overlap (H) or zero non-PK column overlap (V).',
    examHint: 'Vertical fragmentation without the Primary Key in every fragment fails Reconstruction!',
  },
  {
    id: 'fc-m5-2',
    moduleId: 'm5',
    category: 'Formula',
    frontPrompt: 'Semijoin (R ⋉ S) Total Network Byte-Transfer Cost Formula?',
    backAnswer:
      'Cost(R ⋉ S) = [ |π_K(S)| × size(K) ] + [ |R ⋉ S| × size(R) ]. Compare against Naive Ship R (|R|×size(R)) and Naive Ship S (|S|×size(S)). Wins when join selectivity is high!',
    examHint: 'A1 Q9: Semijoin cuts EMPLOYEE transfer from 1,000,000 B to 50,040 B (95% saved).',
  },
  {
    id: 'fc-m5-3',
    moduleId: 'm5',
    category: 'Exam Trap',
    frontPrompt: 'Why is Two-Phase Commit (2PC) called a BLOCKING protocol?',
    backAnswer:
      'After Phase 1, participants that force-wrote <READY, T> enter an in-doubt window holding Strict 2PL locks. If the Coordinator crashes before broadcasting GLOBAL-COMMIT/ABORT, participants cannot unilaterally commit or abort and MUST block until C recovers.',
    examHint: '3PC adds a PRE-COMMIT phase with timeouts to avoid single-site blocking.',
  },
  {
    id: 'fc-m5-4',
    moduleId: 'm5',
    category: 'Comparison',
    frontPrompt: 'CAP Theorem: During a Network Partition (P), contrast CP vs. AP databases.',
    backAnswer:
      'Because P is unavoidable in distributed networks, choose CP (Consistency — reject/block stale reads/writes: MongoDB, HBase, ZooKeeper) OR AP (Availability — serve every node with eventual consistency: Cassandra, DynamoDB, CouchDB).',
    examHint: 'CA is only possible on a single non-partitioned node (e.g., standalone RDBMS).',
  },
  {
    id: 'fc-m5-5',
    moduleId: 'm5',
    category: 'Comparison',
    frontPrompt: 'Expand ACID vs. BASE and map the 4 NoSQL Database Families.',
    backAnswer:
      'BASE = Basically Available, Soft state, Eventually consistent. 4 Families: Key-Value (Redis/DynamoDB), Document (MongoDB), Wide-Column (Cassandra/HBase), Graph (Neo4j).',
    examHint: 'Pair with MapReduce phases: Map(k1,v1) → Shuffle/Sort → Reduce(k2, list(v2)).',
  },
];

export function filterFlashcards(
  cards: RapidFlashcard[],
  moduleFilter: 'all' | FlashcardModule,
  needsPracticeOnly: boolean,
  knownIds: string[]
): RapidFlashcard[] {
  const knownSet = new Set(knownIds);
  return cards.filter((c) => {
    if (moduleFilter !== 'all' && c.moduleId !== moduleFilter) return false;
    if (needsPracticeOnly && knownSet.has(c.id)) return false;
    return true;
  });
}

export function computeFlashcardStats(cards: RapidFlashcard[], knownIds: string[]): {
  knownCount: number;
  totalCount: number;
  readyPct: number;
} {
  const knownSet = new Set(knownIds);
  const knownCount = cards.filter((c) => knownSet.has(c.id)).length;
  const totalCount = cards.length;
  return {
    knownCount,
    totalCount,
    readyPct: totalCount === 0 ? 0 : Math.round((knownCount / totalCount) * 100),
  };
}
