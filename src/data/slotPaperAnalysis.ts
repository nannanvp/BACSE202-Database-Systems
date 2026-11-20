import type { DiagramId } from './noteTypes';

export type SlotId = 'A1+TA1' | 'A2+TA2' | 'MODEL_QP';

export interface SlotForensicItem {
  id: string;
  slot: SlotId;
  qNo: string;
  co: 'CO1' | 'CO2' | 'CO3' | 'CO4' | 'CO5';
  bl: string;
  marks: number;
  moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
  topicSummary: string;
  syllabusSource: string;
  pptSource: string;
  textbookSource: string;
  setterPatternNote: string;
  pairedPredictedQNo: string;
}

export interface GeneratedSlotOption {
  label: string;
  promptIntro: string;
  schemaOrData?: string;
  subQuestions: Array<{ part: string; marks: number; text: string }>;
  solutionSteps: string[];
  diagramId?: DiagramId;
  diagramCaption?: string;
}

export interface GeneratedSlotQuestion {
  qNo: string;
  marks: 10;
  co: 'CO1' | 'CO2' | 'CO3' | 'CO4' | 'CO5';
  bl: string;
  moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
  topicId: string;
  topicTitle: string;
  orTopicId?: string;
  orTopicTitle?: string;
  patternOrigin: string;
  primary: GeneratedSlotOption;
  orOption?: GeneratedSlotOption;
}

export const SLOT_BLUEPRINT_INSIGHTS = [
  {
    title: 'Exact 10 × 10 = 100M Structure',
    detail:
      'Both A1+TA1 and A2+TA2 have NO separate 2M Part-A: Part A itself has Q1–Q10 (10 marks each = 100M total, 3 Hours), subdivided into [2+6+2], [4+6], [5+5], or [2+8] parts with internal (OR) choices on heavy numericals.',
  },
  {
    title: 'Consistent CO1–CO5 Blueprint',
    detail:
      'Both slots test: 2× CO1 questions (Module 1 architecture/constraints), 2× CO5 questions (Module 2 EER diagram + FD Normalization), 2× CO2 questions (Module 3 Hashing/B+ Tree/Multilevel Index + Query Tree Optimization), 2× CO3 questions (Module 4 Serializability/2PL/Deadlock/Recovery), and 2× CO4 questions (Module 5 DDBMS/Fragmentation + CAP/NoSQL).',
  },
  {
    title: 'Direct Slide-to-Question Lineage',
    detail:
      'Nearly every question adapts an exact example or diagram from Prof. Swaminathan’s PPTs and Elmasri & Navathe (7th Ed.) into a fresh real-world domain (Agriculture ARRMS, Hospital, Retail Banking, Hotel, University Project Evaluation).',
  },
];

export const SLOT_PAPER_FORENSICS: SlotForensicItem[] = [
  // ================= A1+TA1 (Nov 2026) =================
  {
    id: 'a1-q1',
    slot: 'A1+TA1',
    qNo: 'Q1',
    co: 'CO1',
    bl: 'BL1',
    marks: 10,
    moduleId: 'm1',
    topicSummary: 'Database System Environment block diagram + working of all component modules.',
    syllabusSource: 'Module 1 — Database System Environment (m1-t4)',
    pptSource: 'Module 1 Concepts & Arch.pptx (Slides 86–99: Overall DBMS Architecture — DDL Compiler, DML Precompiler, Query Processor, DB/File Manager)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 2 (Sec. 2.4, Fig. 2.3)',
    setterPatternNote: 'Opens CO1/BL1 with a pure architecture block-diagram + explanation question drawn straight from Module 1 architecture slides.',
    pairedPredictedQNo: 'Q1',
  },
  {
    id: 'a1-q2',
    slot: 'A1+TA1',
    qNo: 'Q2',
    co: 'CO1',
    bl: 'BL2 / BL3',
    marks: 10,
    moduleId: 'm1',
    topicSummary: 'PROJECT_GRANT relation: [2] Domain constraint + violation, [6] Insertion/Deletion/Update anomalies, [2] Referential integrity on DELETE.',
    syllabusSource: 'Module 1 — Domain & Referential Integrity Constraints (m1-t6) + Module 2 Anomalies (m2-t4)',
    pptSource: 'Module 1 Concepts & Arch.pptx (Slides 150–163: Student CHECK & DELETE violation actions) + Module-2-Consolidated.ppt (Slides 163–164: Anomalies)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 5 (Sec. 5.2) & Ch. 14 (Sec. 14.1.2)',
    setterPatternNote: 'Combines constraints and unnormalized-table anomalies onto one concrete relation schema using [2+6+2] sub-marks.',
    pairedPredictedQNo: 'Q2',
  },
  {
    id: 'a1-q3',
    slot: 'A1+TA1',
    qNo: 'Q3',
    co: 'CO5',
    bl: 'BL6',
    marks: 10,
    moduleId: 'm2',
    topicSummary: 'ARRMS Agriculture EER Diagram: overlapping specialization, disjoint+total specialization, nested weak entities, ternary relationship, aggregation.',
    syllabusSource: 'Module 2 — ER/Weak Entity & EER Specialization/Aggregation (m2-t1, m2-t2)',
    pptSource: 'Module 2 ER Modeling.pptx (Slides 57–78 Weak entities/Ternary & Slides 90–106 Disjoint/Overlapping + Aggregation)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 3 & Ch. 4; Silberschatz Ch. 6 (Aggregation)',
    setterPatternNote: 'BL6 Create question deliberately packs EVERY EER construct (multivalued, overlapping, disjoint-total, weak entity, 3-way relation, aggregation) into bullet constraints.',
    pairedPredictedQNo: 'Q3',
  },
  {
    id: 'a1-q4',
    slot: 'A1+TA1',
    qNo: 'Q4',
    co: 'CO5',
    bl: 'BL3',
    marks: 10,
    moduleId: 'm2',
    topicSummary: 'PATIENT_DIAGNOSIS with 4 FDs: [4] Identify highest Normal Form (1NF — fails 2NF), [6] Decompose into BCNF.',
    syllabusSource: 'Module 2 — Normalization 1NF, 2NF, 3NF, BCNF (m2-t5)',
    pptSource: 'Module-2-Consolidated.ppt (Slides 195–203: Running-stage NF check + chain FD BCNF decomposition R(P,Q,R,S,T,U))',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 14 (Sec. 14.3–14.5)',
    setterPatternNote: 'Mirrors Prof. Consolidated PPT’s exact multi-stage chain pattern (CK partial dep + transitive Doctor->Dept->Head) in a clinical domain.',
    pairedPredictedQNo: 'Q4',
  },
  {
    id: 'a1-q5',
    slot: 'A1+TA1',
    qNo: 'Q5 (a OR b)',
    co: 'CO2',
    bl: 'BL3',
    marks: 10,
    moduleId: 'm3',
    topicSummary: 'Option (a) [4+6]: 4-bit hash keys K1..K5 (c=2) under Static Hashing (overflow chain) vs Extendible Dynamic Hashing. Option (b) [5+5]: B+ Tree order m=3 insert [10,20,5,15,25,30,2] + delete [5,20,15].',
    syllabusSource: 'Module 3 — Static & Dynamic Hashing + B+ Tree Indexing (m3-t2, m3-t3)',
    pptSource: 'Module 3. Hashing.pptx (Slides 37–45 Extendible LSBs) + BACSE202-DBS-Module-3_Complete.pptx (Slides 153–158 Insert + Delete B+ Tree)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 16 & Ch. 17 (Sec. 17.3)',
    setterPatternNote: 'Always pairs Hashing vs B+ Tree (both Insertion + Deletion phases mandatory in B+ Tree!).',
    pairedPredictedQNo: 'Q5',
  },
  {
    id: 'a1-q6',
    slot: 'A1+TA1',
    qNo: 'Q6',
    co: 'CO2',
    bl: 'BL3',
    marks: 10,
    moduleId: 'm3',
    topicSummary: 'Retail banking 3-table SQL query (CUSTOMER, ACCOUNT, TRANSACTION): [2] Canonical Query Tree, [8] Step-by-step Heuristic Optimization & Final Tree.',
    syllabusSource: 'Module 3 — Query Trees & Heuristic Query Optimization (m3-t6)',
    pptSource: 'BACSE202-DBS-Module-3_Complete.pptx (Slides 264–274: 3-table Stafford/Aquarius SQL -> Canonical Tree -> Push σ/π & Convert ×+σ to ⋈)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 19 (Sec. 19.1–19.2)',
    setterPatternNote: 'Standard 3-table join + 3 single-table filters (Branch_Code, Acc_Type, Amount) testing all 4 heuristic rules cleanly.',
    pairedPredictedQNo: 'Q6',
  },
  {
    id: 'a1-q7',
    slot: 'A1+TA1',
    qNo: 'Q7',
    co: 'CO3',
    bl: 'BL3',
    marks: 10,
    moduleId: 'm4',
    topicSummary: 'Wallet schedule S (T1, T2 on X, Y): [3] List all conflicting pairs, [4] Conflict serializability + Precedence graph, [3] Recoverable / Cascadeless / Strict.',
    syllabusSource: 'Module 4 — Conflict Serializability & Schedules Based on Recoverability (m4-t2)',
    pptSource: 'Module - 4 Transaction Processing and Recovery.pptx (Slides 37–44 & 51–54); Module-4.ppt (Slides 97–110)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 20 (Sec. 20.4–20.5)',
    setterPatternNote: 'T1/T2 wallet transfer wraps standard RW/WR/WW conflict enumeration + precedence graph + commit-order check.',
    pairedPredictedQNo: 'Q7',
  },
  {
    id: 'a1-q8',
    slot: 'A1+TA1',
    qNo: 'Q8 (a OR b)',
    co: 'CO3',
    bl: 'BL3',
    marks: 10,
    moduleId: 'm4',
    topicSummary: 'Option (a) [3+5+2]: Inventory Incorrect Summary schedule (t1..t14) -> resolve with step-by-step 2PL lock/wait trace. Option (b) [2+4+4]: Crash log (T1, T2, T3) under Deferred vs Immediate Update.',
    syllabusSource: 'Module 4 — Concurrency Anomalies, 2PL & Deferred/Immediate Recovery (m4-t3, m4-t6)',
    pptSource: 'Module - 4 Txn & Recovery.pptx (Slide 11 Incorrect Summary; Slides 55–58 Log trace) + Concurrency PPT (Slides 6–13) + Module-4.ppt (Slides 202–213)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 20 (Fig. 20.3c), Ch. 21 & Ch. 22',
    setterPatternNote: 'Classic choice pairing Lock-Based Concurrency Control (a) vs Log-Based Recovery (b) — exact textbook trace formats.',
    pairedPredictedQNo: 'Q8',
  },
  {
    id: 'a1-q9',
    slot: 'A1+TA1',
    qNo: 'Q9',
    co: 'CO4',
    bl: 'BL2',
    marks: 10,
    moduleId: 'm5',
    topicSummary: '[2] Advantages of DDBMS over Centralized DBMS, [2] Need for Fragmentation, [6] Differentiate Horizontal, Vertical, Mixed fragmentation with example.',
    syllabusSource: 'Module 5 — Distributed DB Introduction & Data Fragmentation (m5-t1, m5-t2)',
    pptSource: 'BACSE202-DBS-Module-5.ppt (Slides 8–12 DDB Advantages & Slides 28–32 Fragmentation types)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 23 (Sec. 23.1–23.2)',
    setterPatternNote: 'Directly tests DDBMS theory & fragmentation rules (Completeness, Reconstruction, Disjointness) from first half of Module 5.',
    pairedPredictedQNo: 'Q9',
  },
  {
    id: 'a1-q10',
    slot: 'A1+TA1',
    qNo: 'Q10',
    co: 'CO4',
    bl: 'BL4',
    marks: 10,
    moduleId: 'm5',
    topicSummary: 'Global Flash Sale partition (US-East vs EU-West): [3] Define C, A, P; [3] Inventory Service -> CP vs AP; [4] Product Review Service -> AP UX impact.',
    syllabusSource: 'Module 5 — CAP Theorem & Consistency Trade-offs (m5-t4)',
    pptSource: 'Module 5. No-SQL database management.pptx (Slides 8–11) + BACSE202-DBS-Module-5.ppt (Slides 175–180 Eventual consistency)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 24 (Sec. 24.1)',
    setterPatternNote: 'Uses dual-workload scenario (strict financial/inventory vs social/review) to test applied CP vs AP judgment at BL4.',
    pairedPredictedQNo: 'Q10',
  },

  // ================= A2+TA2 (Nov 2026) =================
  {
    id: 'a2-q1',
    slot: 'A2+TA2',
    qNo: 'Q1',
    co: 'CO1',
    bl: 'BL1',
    marks: 10,
    moduleId: 'm1',
    topicSummary: 'Three-Schema Architecture block diagram, level functions, Logical vs Physical Data Independence with real-world examples.',
    syllabusSource: 'Module 1 — Schemas, Instances & Three-Schema Architecture (m1-t3)',
    pptSource: 'Module 1 Concepts & Arch.pptx (Slides 60–79 & 141–145: External/Conceptual/Internal levels)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 2 (Sec. 2.3, Fig. 2.2)',
    setterPatternNote: 'Exact companion to A1 Q1 — A1 asked Environment Block Diagram, A2 asks Three-Schema Architecture; next slot alternates to Client/Server 2-tier/3-tier & Actors.',
    pairedPredictedQNo: 'Q1',
  },
  {
    id: 'a2-q2',
    slot: 'A2+TA2',
    qNo: 'Q2',
    co: 'CO1',
    bl: 'BL3',
    marks: 10,
    moduleId: 'm1',
    topicSummary: 'Hospital schema (PATIENT, DOCTOR, APPOINTMENT): Discuss need & types of constraints + map 5 rules (a–e) to Domain/Key/Entity/NULL/Referential constraints.',
    syllabusSource: 'Module 1 — Relational Model Constraints & Schemas (m1-t6)',
    pptSource: 'Module 1 Concepts & Arch.pptx (Slides 150–170: CHECK, UNIQUE, NOT NULL, PRIMARY KEY, FOREIGN KEY)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 5 (Sec. 5.2)',
    setterPatternNote: 'Tests identical 5 integrity rules as A1 Q2 via rule-identification checklist rather than anomaly essay.',
    pairedPredictedQNo: 'Q2',
  },
  {
    id: 'a2-q3',
    slot: 'A2+TA2',
    qNo: 'Q3',
    co: 'CO5',
    bl: 'BL3 / BL6',
    marks: 10,
    moduleId: 'm2',
    topicSummary: 'Hotel Management ER/EER Diagram: Guest, Room, Booking, Service (M:N with Quantity & Service_Date), Weak entity Bed (Bed_No within Room) + Single/Double specialization.',
    syllabusSource: 'Module 2 — ER Modeling, Weak Entities & EER Specialization (m2-t1, m2-t2)',
    pptSource: 'Module 2 ER Modeling.pptx (Slides 57–78 & 90–104)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 3 & Ch. 4',
    setterPatternNote: 'Domain-adapted EER prompt combining M:N relationship attributes, weak entity Bed, and bed-type specialization.',
    pairedPredictedQNo: 'Q3',
  },
  {
    id: 'a2-q4',
    slot: 'A2+TA2',
    qNo: 'Q4',
    co: 'CO2',
    bl: 'BL3',
    marks: 10,
    moduleId: 'm3',
    topicSummary: 'Multilevel Index Disk I/O Numerical: STUDENT 16,000 records × 80B, block 1,000B, dense 4B+6B index. [2] bfr & blocks, [3] 1st & 2nd level index blocks, [3] max I/Os, [2] diagram.',
    syllabusSource: 'Module 3 — Single-Level & Multi-Level Indexing (m3-t3)',
    pptSource: 'BACSE202-DBS-Module-3_Complete.pptx (Slides 119–135 Dense/Sparse/Multilevel) + Module 3. Indexing.pptx',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 17 (Sec. 17.1–17.2 Worked Blocking Factor & Multilevel Example)',
    setterPatternNote: 'Directly lifts Elmasri Ch. 17 blocking-factor & multilevel index block-count numerical into STUDENT domain.',
    pairedPredictedQNo: 'Q5',
  },
  {
    id: 'a2-q5',
    slot: 'A2+TA2',
    qNo: 'Q5',
    co: 'CO3',
    bl: 'BL4',
    marks: 10,
    moduleId: 'm4',
    topicSummary: 'a [5] Online banking transfer ACID explanation; b [5] Conflict serializability + Precedence graphs for S1 (acyclic T3->T1->T2) and S2 (3-cycle T1->T2->T3->T1).',
    syllabusSource: 'Module 4 — ACID Properties & Conflict Serializability (m4-t1, m4-t2)',
    pptSource: 'Module - 4 Transaction Processing and Recovery.pptx (Slides 21 & 37–44) + Module-4.ppt (Slides 107–110)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 20 (Sec. 20.2 & 20.5)',
    setterPatternNote: 'Combines ACID conceptual question with dual schedule test (one serializable, one cyclic non-serializable).',
    pairedPredictedQNo: 'Q7',
  },
  {
    id: 'a2-q6',
    slot: 'A2+TA2',
    qNo: 'Q6',
    co: 'CO3',
    bl: 'BL4',
    marks: 10,
    moduleId: 'm4',
    topicSummary: 'Strict 2PL 9-step lock action table (T1, T2, T3): Draw Wait-For Graph, prove T1->T3->T2->T1 deadlock cycle, explain deadlock resolution.',
    syllabusSource: 'Module 4 — Two-Phase Locking & Deadlock Handling (m4-t4)',
    pptSource: 'Module - 4 Concurrency Control Techniques.pptx (Slides 17–22) + Module-4.ppt (Slides 100–104 Grant/Block WFG)',
    textbookSource: 'Silberschatz 7th Ed., Ch. 18 & Elmasri Ch. 21 (Sec. 21.1.3)',
    setterPatternNote: 'Mirrors Module-4.ppt Slides 103–104 step-by-step lock grant/wait table into WFG cycle detection.',
    pairedPredictedQNo: 'Q8',
  },
  {
    id: 'a2-q7',
    slot: 'A2+TA2',
    qNo: 'Q7',
    co: 'CO4',
    bl: 'BL4',
    marks: 10,
    moduleId: 'm5',
    topicSummary: 'Banking DB1/DB2 partition (Balance ₹50,000, ₹10k vs ₹15k concurrent withdrawals): Analyze AP (continue both) vs CP (halt until healed).',
    syllabusSource: 'Module 5 — CAP Theorem & Distributed Consistency (m5-t4)',
    pptSource: 'Module 5. No-SQL database management.pptx (Slides 8–11) + BACSE202-DBS-Module-5.ppt (Slides 175–180)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 24 (Sec. 24.1)',
    setterPatternNote: 'Numerical banking partition counterpart to A1 Q10 CAP question.',
    pairedPredictedQNo: 'Q9 / Q10',
  },
  {
    id: 'a2-q8',
    slot: 'A2+TA2',
    qNo: 'Q8',
    co: 'CO4',
    bl: 'BL2 / BL3',
    marks: 10,
    moduleId: 'm5',
    topicSummary: 'Recipe-sharing platform (varying fields & ingredient search): [2] Select Document NoSQL, [6] Sample JSON/BSON representation, [2] 2 Advantages.',
    syllabusSource: 'Module 5 — Four Types of NoSQL Databases (m5-t6)',
    pptSource: 'Module 5. No-SQL.pptx (Slide 13) + BACSE202-DBS-Module-5.ppt (Slides 153–158 Why Document DBs + Slides 182–186 MongoDB)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 24 (Sec. 24.3 Document Stores / MongoDB)',
    setterPatternNote: 'Tests applied NoSQL family selection + JSON/BSON payload authoring (Document DB in A2 -> leaves Graph/Wide-Column/Key-Value + MapReduce for next slot).',
    pairedPredictedQNo: 'Q10',
  },
  {
    id: 'a2-q9',
    slot: 'A2+TA2',
    qNo: 'Q9 (a OR b)',
    co: 'CO5',
    bl: 'BL3',
    marks: 10,
    moduleId: 'm2',
    topicSummary: 'Option (a): PROJECT_EVALUATION normalize up to 3NF & test BCNF. Option (b): Online Shopping USERS -> CUSTOMER/SELLER -> INDIVIDUAL/BUSINESS_SELLER -> Shared Subclass BUYER_SELLER EER.',
    syllabusSource: 'Module 2 — Normalization 1NF–BCNF (m2-t5) OR EER Shared Subclass / Multiple Inheritance (m2-t2)',
    pptSource: 'Module-2-Consolidated.ppt (Slides 176–203) & Module 2 ER Modeling.pptx (Slides 90–104)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 14 & Ch. 4 (Sec. 4.4 Shared Subclass / Lattice)',
    setterPatternNote: 'Provides OR flexibility between Normalization and Shared-Subclass EER Lattice.',
    pairedPredictedQNo: 'Q3 / Q4',
  },
  {
    id: 'a2-q10',
    slot: 'A2+TA2',
    qNo: 'Q10 (a OR b)',
    co: 'CO2',
    bl: 'BL3 / BL6',
    marks: 10,
    moduleId: 'm3',
    topicSummary: 'Option (a): B+ Tree order 3 insert [10,20,5,15,25], delete 10, insert [30,35,40], delete 20. Option (b): Online Shopping 3-table SQL -> Canonical Query Tree -> Heuristic Optimization.',
    syllabusSource: 'Module 3 — B+ Tree Indexing (m3-t3) OR Heuristic Query Optimization (m3-t6)',
    pptSource: 'BACSE202-DBS-Module-3_Complete.pptx (Slides 146–158 B+ Tree & Slides 264–274 Query Tree)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 17 & Ch. 19',
    setterPatternNote: 'Tests interleaved insert/delete B+ tree OR 3-table join heuristic optimization (exact mirror of A1 Q5b & Q6).',
    pairedPredictedQNo: 'Q5 / Q6',
  },

  // ================= OFFICIAL MODEL QP (Fall 2026-27 · CH2026270101832) =================
  {
    id: 'model-q1',
    slot: 'MODEL_QP',
    qNo: 'Q1',
    co: 'CO2',
    bl: 'BL6',
    marks: 10,
    moduleId: 'm2',
    topicSummary: 'Car Dealership & Service Facility ER Diagram: Salesperson, Customer, Car, Invoice, Service Ticket, Service History, Mechanic (M:N), and optional Parts (0..N).',
    syllabusSource: 'Module 2 — Entity Relationship Model, Cardinalities & Participation Constraints (m2-t1)',
    pptSource: 'Module 2. ER Modeling and Relational Database Design.pptx (Slides 10–78: Entities, Cardinality Ratios 1:1/1:N/M:N, Total vs Partial Participation)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 3 (Sec. 3.3–3.7); Coronel & Morris (Car Dealership Case)',
    setterPatternNote: 'Tests nuanced participation traps: service-only customers (Partial on BUYS) and carburetor tune-up needing zero parts (Partial on USES_PARTS).',
    pairedPredictedQNo: 'Q3',
  },
  {
    id: 'model-q2',
    slot: 'MODEL_QP',
    qNo: 'Q2',
    co: 'CO1',
    bl: 'BL2 / BL3',
    marks: 10,
    moduleId: 'm1',
    topicSummary: 'a [6] Retail company multi-branch Three-Schema Architecture (Sales staff, Store managers, DBA, storage upgrade via Physical Data Independence); b [4] Centralized & Client/Server DBMS architectures.',
    syllabusSource: 'Module 1 — Three-Schema Architecture, Data Independence & Client/Server Tiers (m1-t3)',
    pptSource: 'Module 1. Database Systems Concepts and Architecture..pptx (Slides 53–85 & 137–147)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 2 (Sec. 2.2, 2.3 & 2.5)',
    setterPatternNote: 'Combines scenario-based Three-Schema + Physical Data Independence [6M] with Centralized vs 2-Tier/3-Tier Client/Server [4M].',
    pairedPredictedQNo: 'Q1',
  },
  {
    id: 'model-q3',
    slot: 'MODEL_QP',
    qNo: 'Q3',
    co: 'CO2',
    bl: 'BL4',
    marks: 10,
    moduleId: 'm2',
    topicSummary: 'LIBRARY_ISSUE 12-attribute table with FD1..FD6: a [3] Identify Candidate Key (IssueID, BookID); b [7] Audit 2NF, 3NF, BCNF violations and decompose into 6 lossless BCNF tables.',
    syllabusSource: 'Module 2 — Functional Dependencies, Candidate Keys & 1NF–BCNF Normalization (m2-t4, m2-t5)',
    pptSource: 'Module 2. Part 1 - Relational DB Design.pptx (Slides 1–25) & Part 2 - FD.pptx (Slides 1–31)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 14 (Sec. 14.3–14.5)',
    setterPatternNote: 'Composite key (IssueID, BookID) triggers both Partial Dependencies (FD1 on IssueID, FD4 on BookID) and Transitive Dependencies (FD2, FD3, FD5).',
    pairedPredictedQNo: 'Q4',
  },
  {
    id: 'model-q4',
    slot: 'MODEL_QP',
    qNo: 'Q4',
    co: 'CO2',
    bl: 'BL3',
    marks: 10,
    moduleId: 'm2',
    topicSummary: 'ER-to-Relational Mapping: Student (composite name & class), Team, LabSection, Member-of (M:N), and weak entity DragExpRun with partial key (Date, Trial).',
    syllabusSource: 'Module 2 — 7-Step ER-to-Relational Mapping Algorithm (m2-t3)',
    pptSource: 'Module 2. ER Modeling and Relational Database Design.pptx (Slides 79–89: 7-Step Mapping Rules)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 9 (Sec. 9.1 Steps 1–7)',
    setterPatternNote: 'Tests flattening composite attributes (FirstName/LastName and year/semester/section) alongside weak entity composite PK (TeamID, Date, Trial).',
    pairedPredictedQNo: 'Q3',
  },
  {
    id: 'model-q5',
    slot: 'MODEL_QP',
    qNo: 'Q5',
    co: 'CO3',
    bl: 'BL4',
    marks: 10,
    moduleId: 'm4',
    topicSummary: 'a [5] 4-Transaction schedule S (T1..T4 on A, B, C) Precedence Graph & Conflict Serializability check; b [5] Online banking Transactions, ACID properties & Concurrency anomalies.',
    syllabusSource: 'Module 4 — Conflict Serializability, Precedence Graph & ACID / Concurrency Anomalies (m4-t1, m4-t2, m4-t3)',
    pptSource: 'Module - 4 Transaction Processing and Recovery.pptx (Slides 10–44) & Module-4.ppt',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 20 (Sec. 20.1–20.5)',
    setterPatternNote: '4-transaction schedule S has cycle T1 <-> T2 on A and B, proving non-serializability.',
    pairedPredictedQNo: 'Q7',
  },
  {
    id: 'model-q6',
    slot: 'MODEL_QP',
    qNo: 'Q6',
    co: 'CO3',
    bl: 'BL3',
    marks: 10,
    moduleId: 'm3',
    topicSummary: 'a [7] Construct Order-4 B+ Tree for 15 values [24,45,11,89,55,67,49,38,7,23,12,78,97,36,21]; b [3] Delete 38, 12, and 89 sequentially.',
    syllabusSource: 'Module 3 — B+ Tree Indexing Insertion & Deletion Cases I, II, III (m3-t3)',
    pptSource: 'Module 3. Indexing.pptx (Slides 17–36) & B+ Tree.docx',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 17 (Sec. 17.3)',
    setterPatternNote: 'Deletions 38, 12, 89 systematically exercise Case I (leaf only), Case II (internal separator update 12->21), and Case III (leaf underflow merge).',
    pairedPredictedQNo: 'Q5',
  },
  {
    id: 'model-q7',
    slot: 'MODEL_QP',
    qNo: 'Q7',
    co: 'CO3',
    bl: 'BL4',
    marks: 10,
    moduleId: 'm4',
    topicSummary: 'Apply Two-Phase Locking (2PL) lock/unlock operations to T1 (X:=X+Y) and T2 (Y:=X+Y); justify elimination of Lost Update, Uncommitted Update, and Inconsistent Summary.',
    syllabusSource: 'Module 4 — Two-Phase Locking (2PL) & Concurrency Anomalies (m4-t3, m4-t4)',
    pptSource: 'Module - 4 Concurrency Control Techniques.pptx (Slides 3–16: read_lock, write_lock, 2PL Growing/Shrinking phases)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 21 (Sec. 21.1, Fig. 21.3)',
    setterPatternNote: 'Directly adapts Elmasri Fig. 21.3 T1/T2 lock-instrumentation example.',
    pairedPredictedQNo: 'Q8',
  },
  {
    id: 'model-q8',
    slot: 'MODEL_QP',
    qNo: 'Q8',
    co: 'CO3',
    bl: 'BL3',
    marks: 10,
    moduleId: 'm3',
    topicSummary: 'Write 5 Relational Algebra expressions (2M × 5 = 10M) on Projects, Products, Suppliers, and Deliveries using σ, π, and ⋈.',
    syllabusSource: 'Module 3 — Relational Algebra & SQL Translation (m3-t4)',
    pptSource: 'Module 3. Relational Algebra.pptx (Slides 1–67) & Translating SQL Queries into Relational Algebra.pptx (Slides 1–39)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 8 (Sec. 8.1–8.5)',
    setterPatternNote: 'Tests 4 single-relation σ+π queries (i–iv) and 1 three-way Natural Join query (v: Suppliers ⋈ Deliveries ⋈ σ_{Address=\'Chennai\'}(Projects)).',
    pairedPredictedQNo: 'Q6',
  },
  {
    id: 'model-q9',
    slot: 'MODEL_QP',
    qNo: 'Q9',
    co: 'CO4',
    bl: 'BL4',
    marks: 10,
    moduleId: 'm4',
    topicSummary: 'a [6] 9-step Basic Timestamp Ordering trace for TS(T1)=10, TS(T2)=20, TS(T3)=30 on X=100, Y=200, Z=300; b [4] Differentiate Deferred Update vs Immediate Update recovery.',
    syllabusSource: 'Module 4 — Timestamp Ordering Concurrency Control & Log-Based Recovery (m4-t5, m4-t6)',
    pptSource: 'Module - 4 Concurrency Control Techniques.pptx & Module - 4 Transaction Processing and Recovery.pptx (Slides 51–59)',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 21 (Sec. 21.2) & Ch. 22 (Sec. 22.2–22.3)',
    setterPatternNote: 'Tests exact RTS/WTS checks where T1 aborts at Op 3 (TS(T1)=10 < WTS(X)=20) and T2 aborts at Op 5 (TS(T2)=20 < RTS(Y)=30).',
    pairedPredictedQNo: 'Q8',
  },
  {
    id: 'model-q10',
    slot: 'MODEL_QP',
    qNo: 'Q10',
    co: 'CO4',
    bl: 'BL4',
    marks: 10,
    moduleId: 'm5',
    topicSummary: 'a [5] Distributed online polling system CAP theorem analysis (AP vs C); b [5] Food delivery platform single-Document-DB limitations & Polyglot NoSQL redesign.',
    syllabusSource: 'Module 5 — CAP Theorem & Four Types of NoSQL Databases (m5-t4, m5-t6)',
    pptSource: 'Module 5. No-SQL database management.pptx (Slides 1–17) & BACSE202-DBS-Module-5.ppt',
    textbookSource: 'Elmasri & Navathe 7th Ed., Ch. 24 (Sec. 24.1–24.6)',
    setterPatternNote: 'Pairs a 5M applied CAP scenario (Online Polling -> AP) with a 5M Polyglot Persistence architecture question across Document, KV, Column-Family, and Graph DBs.',
    pairedPredictedQNo: 'Q10',
  },
];

export const GENERATED_SLOT_PAPER: GeneratedSlotQuestion[] = [
  {
    qNo: 'Q1',
    marks: 10,
    co: 'CO1',
    bl: 'BL1 / BL2',
    moduleId: 'm1',
    topicId: 'm1-t2',
    topicTitle: 'Actors on the Scene & DBMS Classification',
    patternOrigin: 'Completes Module 1 Q1 rotation after A1 (DBMS Environment) and A2 (Three-Schema Architecture)',
    primary: {
      label: 'Client/Server Architectures & Actors on the Scene',
      promptIntro:
        'Contrast centralized and client/server DBMS architectures for an enterprise university portal.',
      subQuestions: [
        {
          part: 'A',
          marks: 5,
          text: 'Draw neat block diagrams for 2-Tier and 3-Tier Client/Server DBMS architectures and explain the role of each tier.',
        },
        {
          part: 'B',
          marks: 5,
          text: 'Classify and explain the responsibilities of the four categories of "Actors on the Scene" (DBA, Database Designers, End Users — Naive, Casual, Sophisticated, Standalone — and Application Programmers) in this university portal.',
        },
      ],
      solutionSteps: [
        'Part A (5M): Draw 2-Tier (Client UI + API/ODBC/JDBC -> Database Server over network) vs 3-Tier (Client UI -> Middle Application/Web Server holding business logic & security -> Database Server). Highlight better scalability, connection pooling, and security isolation in 3-Tier.',
        'Part B (5M): (1) DBA: manages schemas, grants privileges, tunes storage/backups. (2) Database Designers: model entities, constraints, views. (3) End Users: Naive/Parametric (clerks running canned grade-entry forms), Casual (Dean issuing ad-hoc queries), Sophisticated (data scientists writing complex SQL), Standalone (personal DBs). (4) Application Programmers / System Analysts: build canned host-language transactions.',
      ],
    },
  },
  {
    qNo: 'Q2',
    marks: 10,
    co: 'CO1',
    bl: 'BL3',
    moduleId: 'm1',
    topicId: 'm1-t6',
    topicTitle: 'Constraints & Handling Violations',
    patternOrigin: 'Same [2+4+4] schema-rule & DELETE violation structure as A1 Q2 and A2 Q2',
    primary: {
      label: 'Campus Placement Schema Constraints & Violations',
      promptIntro: 'A university Placement Cell maintains the following relational schema:',
      schemaOrData:
        'COMPANY(Comp_ID, Comp_Name, Sector)\nSTUDENT(Reg_No, SName, CGPA, Email, Backlogs)\nDRIVE_APPLICATION(App_ID, Comp_ID, Reg_No, Role_Title, Package_LPA, Status)',
      subQuestions: [
        {
          part: 'A',
          marks: 2,
          text: 'Identify the exact integrity constraint for each rule: (i) CGPA must lie between 0.00 and 10.00; (ii) No two students may share the same Email; (iii) Reg_No cannot be NULL; (iv) An application must reference a valid student and company.',
        },
        {
          part: 'B',
          marks: 4,
          text: 'Explain what happens when executing DELETE FROM COMPANY WHERE Comp_ID = \'CMP101\' while child rows exist in DRIVE_APPLICATION, contrasting RESTRICT, CASCADE, SET NULL, and SET DEFAULT.',
        },
        {
          part: 'C',
          marks: 4,
          text: 'Distinguish the three semantic interpretations of NULL values using attributes from this schema, and explain why NULL is not equivalent to 0 or an empty string ("").',
        },
      ],
      solutionSteps: [
        'Part A (2M): (i) Domain Constraint (CHECK CGPA BETWEEN 0.00 AND 10.00); (ii) Key Constraint (UNIQUE(Email)); (iii) Entity Integrity Constraint (PRIMARY KEY Reg_No != NULL); (iv) Referential Integrity Constraint (FOREIGN KEY Comp_ID & Reg_No).',
        'Part B (4M): Deleting CMP101 creates dangling foreign keys in DRIVE_APPLICATION. Remedies: ON DELETE RESTRICT rejects deletion; ON DELETE CASCADE deletes CMP101 and all dependent applications; ON DELETE SET NULL keeps application rows with Comp_ID = NULL; ON DELETE SET DEFAULT assigns a predefined placeholder Comp_ID (e.g., \'UNASSIGNED\').',
        'Part C (4M): Three NULL meanings: (1) Unknown — CGPA exists but not yet entered; (2) Missing/Withheld — student omitted optional Email; (3) Not Applicable — Package_LPA when Status = \'Rejected\'. NULL denotes absence of a known value in three-valued logic (comparisons evaluate to UNKNOWN, not TRUE/FALSE), unlike numeric 0 or string "".',
      ],
    },
  },
  {
    qNo: 'Q3',
    marks: 10,
    co: 'CO5',
    bl: 'BL6',
    moduleId: 'm2',
    topicId: 'm2-t2',
    topicTitle: 'Extended ER (EER) Modeling',
    patternOrigin: 'Same full-checklist EER + Aggregation + Weak Entity + Shared Subclass construct as A1 Q3 & A2 Q3/Q9b',
    primary: {
      label: 'Smart Hospital & Telemedicine Network (SHTN) EER Modeling',
      promptIntro:
        'Design a complete Extended ER (EER) diagram capturing all structural, inheritance, and aggregation constraints below:',
      schemaOrData:
        '• Every STAFF member has a unique Staff_ID, Full_Name, Join_Date, and one or more {Contact_Numbers}.\n• STAFF must belong to exactly one of: DOCTOR (MCI_Reg_No, Fee), NURSE (Ward_Grade), or ADMIN_OFFICER (Office_Ext).\n• A SURGEON is a specialized DOCTOR (Surgical_Specialty). Additionally, a CHIEF_MEDICAL_LEAD holds both roles simultaneously by inheriting from DOCTOR and ADMIN_OFFICER (with Board_Term_Years).\n• Each WARD (unique Ward_No, Wing) contains one or more BEDs. A BED is identified by Bed_Seq relative to its WARD and has Bed_Status.\n• PATIENT (Patient_ID, Name, DOB, derived Age) participates with a DOCTOR and a DIAGNOSTIC_LAB in a three-way CONSULTATION (Visit_Date, Fee).\n• Because insurance billing tracks the overall visit event, the combination (PATIENT, DOCTOR, DIAGNOSTIC_LAB) via CONSULTATION is aggregated as CONSULTATION_CASE and linked to an INSURANCE_CLAIM (Claim_ID, Approved_Amount).',
      subQuestions: [
        {
          part: 'A',
          marks: 10,
          text: 'Draw the complete EER diagram showing all entity types, weak entities, multivalued/derived attributes, keys, cardinality ratios, total/partial participation lines, disjoint (d) / overlapping (o) circles, shared subclass inheritance, and aggregation.',
        },
      ],
      solutionSteps: [
        'Entities & Attributes: STAFF (Staff_ID underlined, multivalued Contact_Numbers in double oval); PATIENT (Patient_ID underlined, DOB, Age in dashed derived oval); DIAGNOSTIC_LAB (Lab_ID underlined); WARD (Ward_No underlined); INSURANCE_CLAIM (Claim_ID underlined, Approved_Amount).',
        'Weak Entity: Double-rectangle BED (Bed_Seq dashed-underlined partial key, Bed_Status) connected via double-diamond HAS_BED (1:N from WARD) with double-line Total participation on BED.',
        'EER Hierarchies: STAFF -> Disjoint (d) + Total (double line) specialization into DOCTOR, NURSE, ADMIN_OFFICER. DOCTOR -> Partial specialization to SURGEON. Shared Subclass (Lattice): CHIEF_MEDICAL_LEAD connects upward to BOTH DOCTOR and ADMIN_OFFICER (multiple inheritance, Board_Term_Years).',
        'Ternary + Aggregation: Ternary diamond CONSULTATION (Visit_Date, Fee) connecting PATIENT, DOCTOR, DIAGNOSTIC_LAB -> surrounded by dashed/box Aggregation boundary -> linked via 1:1 / 1:N relationship FILED_FOR to INSURANCE_CLAIM.',
      ],
    },
  },
  {
    qNo: 'Q4',
    marks: 10,
    co: 'CO5',
    bl: 'BL3',
    moduleId: 'm2',
    topicId: 'm2-t5',
    topicTitle: 'Normalization: 1NF, 2NF, 3NF & BCNF',
    patternOrigin: 'Same multi-FD schema normalization pattern as A1 Q4 & A2 Q9a (testing 2NF -> 3NF/BCNF + Lossless/FD Proof)',
    primary: {
      label: 'Course Offering Normalization (1NF -> 2NF -> 3NF -> BCNF)',
      promptIntro:
        'Consider the relation COURSE_OFFERING used by an Academic Scheduling System:',
      schemaOrData:
        'COURSE_OFFERING(Course_Code, Semester, Faculty_ID, Faculty_Name, Faculty_Dept, Dept_Building, Classroom_No, Capacity, Enrolled_Count)\n\nFunctional Dependencies:\n• FD1: {Course_Code, Semester} -> Faculty_ID, Classroom_No, Enrolled_Count\n• FD2: Faculty_ID -> Faculty_Name, Faculty_Dept\n• FD3: Faculty_Dept -> Dept_Building\n• FD4: Classroom_No -> Capacity',
      subQuestions: [
        {
          part: 'A',
          marks: 3,
          text: 'Determine the Candidate Key(s), list Prime vs Non-Prime attributes, and identify the highest Normal Form currently satisfied by COURSE_OFFERING.',
        },
        {
          part: 'B',
          marks: 4,
          text: 'Normalize COURSE_OFFERING step-by-step up to 3NF and verify whether every resulting relation satisfies BCNF.',
        },
        {
          part: 'C',
          marks: 3,
          text: 'Prove that your final decomposition satisfies both Lossless Join and Dependency Preservation.',
        },
      ],
      solutionSteps: [
        'Part A (3M): Course_Code and Semester never appear on any RHS -> must be in every key. {Course_Code, Semester}+ reaches all 9 attributes via FD1->FD2->FD3->FD4. Only Candidate Key = {Course_Code, Semester}. Prime = {Course_Code, Semester}; Non-Prime = remaining 7 attributes. No proper subset (Course_Code+ or Semester+) determines any non-prime attribute -> NO partial dependencies -> satisfies 2NF! However, FD2, FD3, FD4 are transitive dependencies (non-superkey -> non-prime) -> fails 3NF. Highest Normal Form = 2NF.',
        'Part B (4M): Eliminate transitive dependencies to achieve 3NF:\n  • R1(Course_Code, Semester, Faculty_ID, Classroom_No, Enrolled_Count)   [CK: (Course_Code, Semester)]\n  • R2(Faculty_ID, Faculty_Name, Faculty_Dept)   [CK: Faculty_ID]\n  • R3(Faculty_Dept, Dept_Building)   [CK: Faculty_Dept]\n  • R4(Classroom_No, Capacity)   [CK: Classroom_No]\nBCNF Check: In R1..R4, every active non-trivial FD (FD1 in R1, FD2 in R2, FD3 in R3, FD4 in R4) has a Superkey on its LHS -> ALL 4 relations satisfy BCNF!',
        'Part C (3M): Lossless Join: R1 ∩ R2 = {Faculty_ID} (key of R2); R2 ∩ R3 = {Faculty_Dept} (key of R3); R1 ∩ R4 = {Classroom_No} (key of R4) -> every join attribute set is a superkey of one decomposed relation, proving lossless join. Dependency Preservation: FD1 ⊆ R1, FD2 ⊆ R2, FD3 ⊆ R3, FD4 ⊆ R4 -> 100% of dependencies are preserved locally without cross-table joins.',
      ],
    },
  },
  {
    qNo: 'Q5',
    marks: 10,
    co: 'CO2',
    bl: 'BL3 / BL6',
    moduleId: 'm3',
    topicId: 'm3-t2',
    topicTitle: 'Hashing Techniques: Static & Dynamic',
    orTopicId: 'm3-t3',
    orTopicTitle: 'Single-Level, Multi-Level & B+ Tree Indexing',
    patternOrigin: 'Combines Linear Hashing + Sparse Multilevel Index I/O (OR) B+ Tree m=4 Insert & Delete (mirroring A1 Q5 & A2 Q4/Q10a)',
    primary: {
      label: '(a) Linear Hashing Numerical + Sparse Multilevel Index Block Calculation',
      promptIntro:
        'Solve BOTH parts below covering dynamic Linear Hashing and Multilevel Indexing:',
      subQuestions: [
        {
          part: 'A',
          marks: 5,
          text: 'Trace Linear Hashing for the key sequence [6, 8, 10, 3, 5, 7, 9] starting with N = 2 initial buckets (B0, B1), bucket capacity c = 2, level i = 0, split pointer p = 0, h0(k) = k mod 2, and h1(k) = k mod 4. Split bucket Bp whenever any bucket overflows and draw the final bucket layout.',
        },
        {
          part: 'B',
          marks: 5,
          text: 'An ordered EMPLOYEE file has 20,000 fixed-length records of 120 bytes each stored unspanned in 1,024-byte disk blocks. A sparse Primary Index uses an 8-byte key and 6-byte block pointer. Calculate: (i) blocking factor and data blocks, (ii) first-level and second-level index blocks, and (iii) total block accesses required to locate a record using binary/root index lookup.',
        },
      ],
      solutionSteps: [
        'Part A (5M): Insert 6 (6%2=0 -> B0=[6]), Insert 8 (B0=[6,8] full). Insert 10 -> B0 overflows! Split p=0 (B0) creating B2 and rehash {6,8,10} with h1=k%4: 8%4=0->B0, 6%4=2->B2, 10%4=2->B2 => B0=[8], B1=[], B2=[6,10]; p becomes 1. Insert 3 (3%2=1 >= p=1 -> B1=[3]), Insert 5 (B1=[3,5] full). Insert 7 -> B1 overflows! Split p=1 (B1) creating B3 and rehash {3,5,7} with h1=k%4: 5%4=1->B1, 3%4=3->B3, 7%4=3->B3 => B0=[8], B1=[5], B2=[6,10], B3=[3,7]; p reaches 2 (=2^0*N) so round 0 finishes: increment i=1, reset p=0! Insert 9 (i=1 -> use h1: 9%4=1 -> B1=[5,9], fits without overflow!). Final: B0=[8], B1=[5,9], B2=[6,10], B3=[3,7].',
        'Part B (5M): Data blocking factor bfr = floor(1024 / 120) = 8 records/block -> Data blocks b = ceil(20000 / 8) = 2,500 blocks. Index entry size Ri = 8 + 6 = 14 bytes -> Index bfr_i = floor(1024 / 14) = 73 entries/block. Sparse 1st-level index has 1 entry per data block = 2,500 entries -> ceil(2500 / 73) = 35 blocks. 2nd-level index has 35 entries -> ceil(35 / 73) = 1 root block. Block accesses = 1 (root/2nd level) + 1 (1st level) + 1 (data block) = 3 disk block accesses!',
      ],
    },
    orOption: {
      label: '(b) B+ Tree (Order m = 4) Construction & Sequential Deletion',
      promptIntro:
        'Consider a B+ Tree of order m = 4 (maximum 4 child pointers / 3 keys per node; leaf minimum keys = ceil((m-1)/2) = 2; internal minimum keys = ceil(m/2)-1 = 1).',
      schemaOrData:
        '1) Insertion sequence:  5, 10, 15, 20, 25, 30, 35, 40, 45, 50\n2) Deletion sequence:   Delete 15, Delete 20, Delete 25, Delete 30',
      subQuestions: [
        {
          part: 'A',
          marks: 5,
          text: 'Insert all 10 keys sequentially into an initially empty B+ Tree of order m = 4, drawing the tree at every leaf split and root split.',
        },
        {
          part: 'B',
          marks: 5,
          text: 'Starting from the constructed tree in (A), delete 15, 20, 25, and 30 in exact order, explicitly showing sibling merges, separator removals, and internal node merging.',
        },
      ],
      solutionSteps: [
        'Part A (5M): Insert 5,10,15 -> [5,10,15]. Insert 20 -> split [5,10] [15,20], copy 15 up -> Root [15]. Insert 25,30 -> right leaf overflows -> split [15,20] [25,30], copy 25 up -> Root [15,25]. Insert 35,40 -> split [25,30] [35,40], copy 35 up -> Root [15,25,35]. Insert 45,50 -> split [35,40] [45,50], copy 45 up -> Root overflows [15,25,35,45] -> Root splits (move 35 up to new root!): Root [35] -> Children [15,25] & [45] -> Leaves [5,10] -> [15,20] -> [25,30] -> [35,40] -> [45,50]. (Height = 3).',
        'Part B (5M): Delete 15 -> [20] underflows (min 2), siblings [5,10] & [25,30] have 2 keys (cannot lend) -> merge with left [5,10,20], remove 15 from parent -> parent becomes [25]. Delete 20 -> [5,10] (OK, 2 keys). Delete 25 -> [30] underflows, left [5,10] cannot lend -> merge [5,10,30], remove 25 -> internal node becomes empty! Right internal sibling [45] has min 1 key -> Internal Merge: pull root key 35 down to form single internal root [35,45] with leaves [5,10,30], [35,40], [45,50] (Height reduces to 2). Delete 30 -> [5,10]. Final Tree: Root [35,45] -> Leaves [5,10], [35,40], [45,50].',
      ],
    },
  },
  {
    qNo: 'Q6',
    marks: 10,
    co: 'CO2',
    bl: 'BL3',
    moduleId: 'm3',
    topicId: 'm3-t6',
    topicTitle: 'Query Optimization & Heuristic Query Trees',
    patternOrigin: 'Exact 3-table join + 3 WHERE predicates Heuristic Query Tree Optimization pattern (matches A1 Q6 & A2 Q10b)',
    primary: {
      label: 'Academic Course Query Tree & Heuristic Optimization',
      promptIntro: 'Consider the following University Database relations and SQL query:',
      schemaOrData:
        'DEPARTMENT(Dept_ID, Dept_Name, Building)\nFACULTY(Fac_ID, Fac_Name, Dept_ID, Designation)\nCOURSE(Course_ID, Course_Title, Credits, Fac_ID)\n\nTarget Query (SQL):\nSELECT F.Fac_Name, C.Course_Title, C.Credits\nFROM DEPARTMENT D, FACULTY F, COURSE C\nWHERE D.Dept_ID = F.Dept_ID\n  AND F.Fac_ID = C.Fac_ID\n  AND D.Building = \'AB1\'\n  AND F.Designation = \'Professor\'\n  AND C.Credits >= 4;',
      subQuestions: [
        {
          part: 'A',
          marks: 2,
          text: 'Draw the unoptimized Canonical Query Tree directly from the SQL query.',
        },
        {
          part: 'B',
          marks: 8,
          text: 'Demonstrate step-by-step Heuristic Query Optimization transformations (breaking conjunctive selections, pushing σ down, reordering joins, converting × + σ into ⋈, and pushing π down) and write the Final Optimized Relational Algebra expression.',
        },
      ],
      solutionSteps: [
        'Part A (2M): Leaf nodes DEPARTMENT, FACULTY, COURSE combined via two Cartesian Product (×) nodes at the bottom -> single compound σ node with all 5 AND predicates -> root π_{F.Fac_Name, C.Course_Title, C.Credits}.',
        'Part B (8M): Step 1 (Cascade σ): split 5 conjunctive conditions. Step 2 (Push σ down to leaves): push D.Building=\'AB1\' to DEPARTMENT, F.Designation=\'Professor\' to FACULTY, and C.Credits>=4 to COURSE. Step 3 (Reorder leaves / smallest first): place most restrictive leaf filter (σ_{Building=\'AB1\'}(DEPARTMENT)) first if it yields fewest tuples. Step 4 (Replace × + join predicates with ⋈): form (D ⋈_{D.Dept_ID=F.Dept_ID} F) ⋈_{F.Fac_ID=C.Fac_ID} C. Step 5 (Push π down): project only join keys + required output columns at each node.',
        'Final Optimized RA: π_{F.Fac_Name, C.Course_Title, C.Credits}( ( π_{F.Fac_ID, F.Fac_Name}( (π_{Dept_ID}(σ_{Building=\'AB1\'}(D))) ⋈_{D.Dept_ID=F.Dept_ID} (π_{Fac_ID, Fac_Name, Dept_ID}(σ_{Designation=\'Professor\'}(F))) ) ) ⋈_{F.Fac_ID=C.Fac_ID} (π_{Fac_ID, Course_Title, Credits}(σ_{Credits>=4}(C))) ).',
      ],
    },
  },
  {
    qNo: 'Q7',
    marks: 10,
    co: 'CO3',
    bl: 'BL4',
    moduleId: 'm4',
    topicId: 'm4-t3',
    topicTitle: 'Conflict Serializability & Precedence Graphs',
    patternOrigin: 'Combined Precedence Graph + Conflict Serializability + Recoverability check (matches A1 Q7 & A2 Q5b)',
    primary: {
      label: 'Conflict Serializability, Precedence Graphs & Recoverability Classification',
      promptIntro:
        'Analyze the two concurrent execution schedules S1 and S2 involving transactions T1, T2, and T3:',
      schemaOrData:
        'S1: R1(A); W1(A); R2(B); W2(B); R3(A); R2(A); W3(A); C1; C3; C2\nS2: R1(X); W1(X); R2(X); W2(X); R3(Y); W2(Y); R1(Y); W3(Y); W1(Y); C1; C2; C3',
      subQuestions: [
        {
          part: 'A',
          marks: 4,
          text: 'List all conflicting operation pairs in S1, draw its Precedence Graph, state whether S1 is conflict serializable, and give an equivalent serial order if one exists.',
        },
        {
          part: 'B',
          marks: 3,
          text: 'Draw the Precedence Graph for S2 and prove whether S2 is conflict serializable.',
        },
        {
          part: 'C',
          marks: 3,
          text: 'Classify BOTH S1 and S2 according to recoverability (Recoverable, Cascadeless, Strict, or Irrecoverable) with exact justification.',
        },
      ],
      solutionSteps: [
        'Part A (4M): Conflicts in S1 (all on A): R1(A)->W3(A) [T1->T3], W1(A)->R3(A) [T1->T3], W1(A)->R2(A) [T1->T2], W1(A)->W3(A) [T1->T3], R2(A)->W3(A) [T2->T3]. Edges: T1->T2, T2->T3, T1->T3. Acyclic graph -> Conflict Serializable! Unique equivalent serial schedule: T1 -> T2 -> T3.',
        'Part B (3M): Conflicts in S2: on X, W1(X)->R2(X) and W1(X)->W2(X) add edge T1 -> T2. On Y, W2(Y)->R1(Y) and W2(Y)->W1(Y) add edge T2 -> T1 (plus T3->T1, T3->T2, T2->T3, T1->T3). Cycle T1 -> T2 -> T1 exists -> S2 is NOT conflict serializable.',
        'Part C (3M): S1: T3 and T2 both read uncommitted A written by T1 (dirty reads -> NOT Cascadeless and NOT Strict), but T1 commits (C1) BEFORE both T3 (C3) and T2 (C2) -> S1 is Recoverable (with cascading rollback). S2: T1 executes R1(Y) reading dirty Y written by W2(Y), yet C1 commits BEFORE C2 -> if T2 aborts, T1 cannot roll back -> S2 is Irrecoverable!',
      ],
    },
  },
  {
    qNo: 'Q8',
    marks: 10,
    co: 'CO3',
    bl: 'BL3 / BL4',
    moduleId: 'm4',
    topicId: 'm4-t4',
    topicTitle: 'Two-Phase Locking (2PL) & Deadlock Handling',
    orTopicId: 'm4-t6',
    orTopicTitle: 'Database Recovery: Deferred vs Immediate Update',
    patternOrigin: 'Choice pairing Strict 2PL WFG Deadlock + Wait-Die/Wound-Wait (a) OR Checkpoint Log Recovery & Shadow Paging (b) (mirrors A1 Q8 & A2 Q6)',
    primary: {
      label: '(a) Strict 2PL Wait-For Graph Deadlock & Timestamp Deadlock Prevention',
      promptIntro:
        'Three transactions T1 (TS = 10), T2 (TS = 20), and T3 (TS = 30) execute under Strict 2PL in the sequence below:',
      schemaOrData:
        'Step 1: T1 -> lock-X(A), Write(A)\nStep 2: T2 -> lock-S(B), Read(B)\nStep 3: T3 -> lock-X(C), Write(C)\nStep 4: T1 -> lock-X(B)   [requests B held by T2]\nStep 5: T2 -> lock-S(C)   [requests C held by T3]\nStep 6: T3 -> lock-S(A)   [requests A held by T1]',
      subQuestions: [
        {
          part: 'A',
          marks: 5,
          text: 'Construct the Wait-For Graph at Step 6, justify why a deadlock exists, and explain how deadlock detection & victim selection resolves it.',
        },
        {
          part: 'B',
          marks: 5,
          text: 'Re-trace Steps 4–6 separately under (i) Wait-Die and (ii) Wound-Wait timestamp prevention protocols, stating at each conflict which transaction waits vs aborts.',
        },
      ],
      solutionSteps: [
        'Part A (5M): Edges: T1 -> T2 (Step 4: T1 wants X(B) held by T2), T2 -> T3 (Step 5: T2 wants S(C) held by T3), T3 -> T1 (Step 6: T3 wants S(A) held by T1). Directed cycle T1 -> T2 -> T3 -> T1 proves Deadlock. Resolution: Victim selector rolls back lowest-cost/youngest transaction (e.g., T3), releasing X(C) so T2 proceeds and breaks the cycle.',
        'Part B (5M): (i) Wait-Die (older waits, younger dies): Step 4 -> T1(10) older than T2(20) => T1 WAITS. Step 5 -> T2(20) older than T3(30) => T2 WAITS. Step 6 -> T3(30) younger than T1(10) => T3 DIES (aborts & restarts keeping TS=30), freeing C immediately -> no cycle! (ii) Wound-Wait (older wounds younger, younger waits): Step 4 -> T1(10) requests from T2(20) => T1 WOUNDS (aborts) T2 immediately, freeing B so T1 acquires X(B) -> no deadlock!',
      ],
    },
    orOption: {
      label: '(b) Log-Based Recovery with Checkpoint & Shadow Paging Comparison',
      promptIntro:
        'A database uses Write-Ahead Logging (WAL). Initial balances before crash are A = 2000, B = 5000, C = 1500. System log at crash time:',
      schemaOrData:
        '[Start, T1]\n[Write, T1, A, 2000, 2400]\n[Commit, T1]\n[Checkpoint]\n[Start, T2]\n[Write, T2, B, 5000, 4200]\n[Start, T3]\n[Write, T3, C, 1500, 1800]\n[Commit, T3]\n[Start, T4]\n[Write, T4, A, 2400, 2100]\n<SYSTEM CRASH>',
      subQuestions: [
        {
          part: 'A',
          marks: 2,
          text: 'Explain the purpose of the [Checkpoint] record and Write-Ahead Logging (WAL) during crash recovery.',
        },
        {
          part: 'B',
          marks: 5,
          text: 'Determine the exact REDO and UNDO lists, recovery actions, and final disk values of A, B, and C under: (i) Deferred Update and (ii) Immediate Update.',
        },
        {
          part: 'C',
          marks: 3,
          text: 'Contrast Shadow Paging against Log-Based Recovery on disk update timing, UNDO/REDO requirements, and fragmentation overhead.',
        },
      ],
      solutionSteps: [
        'Part A (2M): WAL guarantees log records flush to stable storage before dirty data pages hit disk. [Checkpoint] flushes active buffers and records active txns so recovery scans backwards only to the latest checkpoint (skipping T1!).',
        'Part B (5M): (i) Deferred Update (NO-UNDO / REDO): T1 committed before checkpoint (already flushed -> skip). REDO = {T3}, UNDO = ∅ (ignore T2, T4 since deferred writes never reached disk). Actions: Redo T3 sets C = 1800. Final: A = 2400, B = 5000, C = 1800. (ii) Immediate Update (UNDO / REDO): UNDO = {T4, T2} (reverse order: restore A = 2400, then restore B = 5000); REDO = {T3} (forward: set C = 1800). Final: A = 2400, B = 5000, C = 1800.',
        'Part C (3M): Shadow Paging keeps two page directories (Shadow old table + Current new table) writing updates to newly allocated pages; commit atomically swaps directory pointer -> Fast recovery (NO UNDO, NO REDO, no log needed), but breaks physical clustering (data fragmentation) and struggles with concurrent multi-user page sharing.',
      ],
    },
  },
  {
    qNo: 'Q9',
    marks: 10,
    co: 'CO4',
    bl: 'BL2 / BL4',
    moduleId: 'm5',
    topicId: 'm5-t3',
    topicTitle: 'Distributed Transactions, 2PC & Query Processing',
    patternOrigin: 'Covers remaining Module 5 DDBMS pillars (Allocation, 2PC Failure Blocking, Semijoin) complementing A1 Q9 Fragmentation',
    primary: {
      label: 'DDBMS Fragment Allocation, Two-Phase Commit (2PC) & Semijoin',
      promptIntro:
        'A nationwide enterprise runs distributed sites across Chennai, Mumbai, and Delhi.',
      subQuestions: [
        {
          part: 'A',
          marks: 3,
          text: 'Recommend the best Fragment Allocation technique (Centralized, Non-Replicated Partitioned, Full Replication, or Partial Replication) for: (i) A high-frequency airline ticket booking ledger, (ii) A static digital library catalog, and (iii) A University ERP. Justify each.',
        },
        {
          part: 'B',
          marks: 5,
          text: 'Trace the Two-Phase Commit (2PC) protocol for a ₹10,000 fund transfer across Site A and Site B, and explain what happens on recovery if Site A’s log contains <ready T> with no final <commit T>/<abort T> record while the coordinator has crashed.',
        },
        {
          part: 'C',
          marks: 2,
          text: 'Show why a Semijoin (R ⋉ S) dramatically lowers network transfer cost compared to shipping an entire relation across sites.',
        },
      ],
      solutionSteps: [
        'Part A (3M): (i) Airline booking (write-intensive) -> Non-Replicated Partitioned (eliminates cross-site replica lock synchronization on frequent updates). (ii) Digital library (read-intensive) -> Full or Replicated Allocation (fast local reads, zero frequent writes). (iii) University ERP (mixed workload) -> Partial Replication (replicate hot student/timetable lookups, partition grade writes).',
        'Part B (5M): Phase 1 (Voting): Coordinator logs <prepare T>, sends PREPARE to Site A & B; sites execute, force-log <ready T> (if OK), reply YES/READY. Phase 2 (Decision): If ALL vote YES, Coordinator force-logs <commit T> and sends GLOBAL_COMMIT (if any NO, logs <abort T> and sends ABORT). Failure Blocking: If Coordinator crashes right after receiving YES votes, a recovering/waiting Site A seeing only <ready T> cannot unilaterally commit or abort — it enters an "uncertain" BLOCKED state holding locks until Coordinator recovers (or polls peer participants).',
        'Part C (2M): Instead of transferring all wide tuples of R (e.g., 10,000 rows × 500B = 5MB) across the WAN to join with S, Semijoin ships only the compact join-key projection π_{join_key}(S) to R’s site, filters matching R tuples locally, and transfers only matching rows back.',
      ],
    },
  },
  {
    qNo: 'Q10',
    marks: 10,
    co: 'CO4',
    bl: 'BL4',
    moduleId: 'm5',
    topicId: 'm5-t6',
    topicTitle: 'Four Types of NoSQL Databases',
    patternOrigin: 'Covers Wide-Column (HBase), Graph (Neo4j Cypher), ACID vs BASE, and MapReduce — complementing A2 Q8 (Document DB)',
    primary: {
      label: 'NoSQL Selection (Graph & Wide-Column), BASE & MapReduce Pipeline',
      promptIntro:
        'A FinTech analytics platform runs two specialized NoSQL subsystems alongside its operational core:',
      schemaOrData:
        'Workload 1 (Referral & Fraud Ring Engine): Queries 3-hop user-to-user transaction & friend networks in real time.\nWorkload 2 (Telemetry & Audit Ingestion): Absorbs 50,000 server events/sec with dynamic metric columns per event row and runs nightly error counts per microservice.',
      subQuestions: [
        {
          part: 'A',
          marks: 4,
          text: 'Identify the optimal NoSQL database family and real-world system for Workload 1 and Workload 2. Write (i) a sample Neo4j Cypher query for Workload 1 and (ii) a Wide-Column (HBase) row-key / column-family example for Workload 2.',
        },
        {
          part: 'B',
          marks: 3,
          text: 'Compare ACID vs BASE properties and justify why BASE suits Workload 2.',
        },
        {
          part: 'C',
          marks: 3,
          text: 'Trace the Map -> Shuffle/Partition -> Reduce pipeline to compute daily error counts per microservice across distributed log shards.',
        },
      ],
      solutionSteps: [
        'Part A (4M): Workload 1 -> Graph Database (Neo4j): stores labeled nodes and typed directed edges with index-free adjacency, avoiding slow relational self-joins. Cypher example: MATCH (u:USER {id:"U101"})-[:TRANSFERS_TO*1..3]->(suspect:USER) WHERE suspect.flagged=true RETURN u, suspect.\nWorkload 2 -> Wide-Column / Column-Family Store (Apache HBase / Cassandra backed by LSM-Trees): Namespace -> Table TELEMETRY -> lexicographically sorted Row Key (service#timestamp) -> Column Families (Meta, Metrics) with sparse dynamic column qualifiers & timestamped versions.',
        'Part B (3M): ACID (Atomicity, Consistency, Isolation, Durability) guarantees strict single-copy consistency via locks. BASE (Basically Available, Soft state, Eventual consistency) lets distributed shards keep ingesting writes during high load or partitions and converge replicas asynchronously — ideal for high-velocity Workload 2 telemetry where throughput and availability outweigh immediate cross-node linearizability.',
        'Part C (3M): (1) Map phase (TaskTrackers on local shards): parses log lines and emits intermediate pairs like ("AuthSvc", 1), ("PaySvc", 1), ("AuthSvc", 1). (2) Shuffle & Sort (Partitioner): hashes keys across network so all values for a given service reach the same Reducer sorted -> ("AuthSvc", [1, 1]), ("PaySvc", [1]). (3) Reduce phase: sums value lists to emit final counts ("AuthSvc", 2), ("PaySvc", 1).',
      ],
    },
  },
];

export const OFFICIAL_MODEL_PAPER: GeneratedSlotQuestion[] = [
  {
    qNo: 'Q1',
    marks: 10,
    co: 'CO2',
    bl: 'BL6',
    moduleId: 'm2',
    topicId: 'm2-t1',
    topicTitle: 'Entity Relationship Model & Weak Entities',
    patternOrigin: 'Official Fall 2026-27 Model Question Paper · Class No. CH2026270101832 · Q1 [10M]',
    primary: {
      label: 'Car Dealership & Service Facility Entity-Relationship (ER) Design',
      promptIntro:
        'Design an Entity-Relationship (ER) diagram for a car dealership. The dealership sells both new and used cars, and it operates a service facility. Base your design on the following business rules:',
      schemaOrData:
        '• A salesperson may sell many cars, but each car is sold by only one salesperson.\n• A customer may buy many cars, and each car is bought by only one customer.\n• A salesperson writes a single invoice for each car he or she sells.\n• A customer gets an invoice for each car he or she buys.\n• A customer may come in just to have his or her car serviced; that is, a customer need not buy a car to be classified as a customer.\n• When a customer takes one or more cars in for repair or service, one service ticket is written for each car.\n• The car dealership maintains a service history for each of the cars serviced. The service records are referenced by the car\'s serial number.\n• A car brought in for service can be worked on by many mechanics, and each mechanic may work on many cars.\n• A car that is serviced may or may not need parts (e.g., adjusting a carburetor or cleaning a fuel injector nozzle does not require providing new parts).',
      subQuestions: [
        {
          part: 'A',
          marks: 10,
          text: 'Clearly indicate entities, attributes, primary keys, relationships, cardinalities, and participation constraints.',
        },
      ],
      solutionSteps: [
        '1. Entities & Primary Keys (2.5M): SALESPERSON(SalespersonID [PK], Name, Phone); CUSTOMER(CustomerID [PK], Name, Phone, Address); CAR(SerialNo [PK], Make, Model, Year, Condition {"New","Used"}); INVOICE(InvoiceNo [PK], InvoiceDate, TotalAmount); SERVICE_TICKET(TicketNo [PK], DateReceived, DateReturned, Comments); Weak Entity SERVICE_RECORD(RecordNo [Partial Key], ServiceDate, WorkDescription) owned by CAR(SerialNo); MECHANIC(MechanicID [PK], Name, Specialty); PARTS(PartNo [PK], Description, UnitPrice).',
        '2. Sales & Invoice Relationships (2.5M): SALESPERSON —(1:N)— SELLS — CAR (Partial on both: unsold/service-only cars have 0 salesperson); CUSTOMER —(1:N)— BUYS — CAR (Partial on CUSTOMER because service-only customers buy 0 cars!); SALESPERSON —(1:N)— WRITES == INVOICE, CUSTOMER —(1:N)— RECEIVES == INVOICE, and CAR —(1:1)— GENERATES == INVOICE (Total == on INVOICE for all three).',
        '3. Service Facility, Mechanics & Optional Parts (3M): CUSTOMER —(1:N)— BRINGS == SERVICE_TICKET and CAR —(1:N)— HAS_TICKET == SERVICE_TICKET (1 ticket written per car visit); CAR ==(1:N)== MAINTAINS_HISTORY == [[SERVICE_RECORD]] referenced by CAR.SerialNo; SERVICE_TICKET ==(M:N)— WORKED_ON_BY — MECHANIC (with relationship attribute HoursWorked); SERVICE_TICKET —(M:N, Partial 0..N)— USES_PARTS — PARTS (with QuantityUsed — Partial on SERVICE_TICKET because carburetor adjustment needs 0 parts!).',
        '4. Verification Summary (2M): Explicitly label (0,N) vs (1,1) / (1,N) min-max bounds on all 8 relationships so the examiner sees both Partial participation exceptions clearly.',
      ],
    },
  },
  {
    qNo: 'Q2',
    marks: 10,
    co: 'CO1',
    bl: 'BL2 / BL3',
    moduleId: 'm1',
    topicId: 'm1-t3',
    topicTitle: 'Schemas, Instances & Three-Schema Architecture',
    patternOrigin: 'Official Fall 2026-27 Model Question Paper · Class No. CH2026270101832 · Q2 [6M + 4M = 10M]',
    primary: {
      label: 'Retail Multi-Branch Three-Schema Architecture & Client/Server DBMS',
      promptIntro:
        'A retail company uses a centralized database across multiple branches. Different users interact with the system:',
      schemaOrData:
        '• Sales staff view only billing and product prices.\n• Store managers access sales summaries and inventory reports.\n• Database administrators manage table structures and storage details.\n• System upgrades are planned at the storage level without affecting user applications.',
      subQuestions: [
        {
          part: 'a',
          marks: 6,
          text: 'Identify and explain the suitable database architecture that supports these requirements. Illustrate with a neat diagram and justify how the system ensures minimal impact during upgrades.',
        },
        {
          part: 'b',
          marks: 4,
          text: 'Explain the centralized and client/server architectures for DBMS.',
        },
      ],
      solutionSteps: [
        'Part (a) [6M]: Identify the ANSI/SPARC Three-Schema Architecture. Map the levels: (1) External / View Level provides tailored SQL Views — Sales Staff View exposes only (ProductID, ProductName, Price, BillAmount) hiding wholesale costs, while Store Manager View exposes aggregated branch sales & stock reports; (2) Conceptual / Logical Level (managed by DBA) defines the unified logical tables (BRANCH, PRODUCT, INVENTORY, INVOICE) and constraints; (3) Internal / Physical Level (managed by DBA) defines B+ tree indexes, block sizes, and disk files. Storage upgrades (SSD migration, new indexes, file re-clustering) only update the Conceptual/Internal Mapping via Physical Data Independence, leaving the Conceptual Schema, External Views, and branch billing apps untouched.',
        'Part (b) [4M]: Centralized DBMS Architecture runs all DBMS software, application programs, and display formatting on one central host/mainframe accessed via dumb terminals (simple administration, single point of failure). 2-Tier Client/Server splits Presentation/UI on clients (via ODBC/JDBC) from SQL processing on the Database Server. 3-Tier Client/Server inserts a middle Application/Web Server tier (Client UI <-> Application Server <-> Database Server) for connection pooling, business rules, and database security isolation.',
      ],
    },
  },
  {
    qNo: 'Q3',
    marks: 10,
    co: 'CO2',
    bl: 'BL4',
    moduleId: 'm2',
    topicId: 'm2-t5',
    topicTitle: 'Normalization: 1NF, 2NF, 3NF & BCNF',
    patternOrigin: 'Official Fall 2026-27 Model Question Paper · Class No. CH2026270101832 · Q3 [3M + 7M = 10M]',
    primary: {
      label: 'University LIBRARY_ISSUE Candidate Key & BCNF Decomposition',
      promptIntro:
        'A university maintains a single relational table LIBRARY_ISSUE to store information about book issues:',
      schemaOrData:
        'LIBRARY_ISSUE(IssueID, IssueDate, StudentID, StudentName, DeptID, DeptName, BookID, BookTitle, AuthorID, AuthorName, Publisher, QuantityIssued)\n\nFunctional Dependencies:\n• FD1: IssueID -> IssueDate, StudentID\n• FD2: StudentID -> StudentName, DeptID\n• FD3: DeptID -> DeptName\n• FD4: BookID -> BookTitle, AuthorID, Publisher\n• FD5: AuthorID -> AuthorName\n• FD6: (IssueID, BookID) -> QuantityIssued',
      subQuestions: [
        {
          part: 'a',
          marks: 3,
          text: 'Identify the candidate key(s) for the relation LIBRARY_ISSUE.',
        },
        {
          part: 'b',
          marks: 7,
          text: 'Analyze the table for violations of 2NF, 3NF, and BCNF, and decompose the relation into BCNF relations, clearly indicating primary and foreign keys.',
        },
      ],
      solutionSteps: [
        'Part (a) [3M]: Neither IssueID nor BookID appears on the RHS of any FD (FD1..FD6), so every superkey must include {IssueID, BookID}. Computing closure {IssueID, BookID}+: via FD1 adds {IssueDate, StudentID}; via FD2 adds {StudentName, DeptID}; via FD3 adds {DeptName}; via FD4 adds {BookTitle, AuthorID, Publisher}; via FD5 adds {AuthorName}; via FD6 adds {QuantityIssued} = all 12 attributes! Since neither {IssueID}+ nor {BookID}+ determines all attributes, the unique Candidate Key is (IssueID, BookID).',
        'Part (b) [7M]: Violation Audit: (1) 2NF Violations (Partial Dependencies on proper subsets of CK): FD1 (IssueID -> IssueDate, StudentID) and FD4 (BookID -> BookTitle, AuthorID, Publisher) -> table is only in 1NF! (2) 3NF & BCNF Violations (Transitive Dependencies where LHS is not a superkey): FD2 (StudentID -> StudentName, DeptID), FD3 (DeptID -> DeptName), and FD5 (AuthorID -> AuthorName).\nFinal 6-Table Lossless & Dependency-Preserving BCNF Decomposition:\n  1. DEPARTMENT(DeptID [PK], DeptName)\n  2. STUDENT(StudentID [PK], StudentName, DeptID [FK -> DEPARTMENT])\n  3. AUTHOR(AuthorID [PK], AuthorName)\n  4. BOOK(BookID [PK], BookTitle, AuthorID [FK -> AUTHOR], Publisher)\n  5. ISSUE_HEADER(IssueID [PK], IssueDate, StudentID [FK -> STUDENT])\n  6. ISSUE_LINE(IssueID [PK, FK -> ISSUE_HEADER], BookID [PK, FK -> BOOK], QuantityIssued)',
      ],
    },
  },
  {
    qNo: 'Q4',
    marks: 10,
    co: 'CO2',
    bl: 'BL3',
    moduleId: 'm2',
    topicId: 'm2-t3',
    topicTitle: '7-Step ER/EER-to-Relational Mapping',
    patternOrigin: 'Official Fall 2026-27 Model Question Paper · Class No. CH2026270101832 · Q4 [10M]',
    primary: {
      label: 'ER-to-Relational Schema Mapping (Student, Team, LabSection, DragExpRun)',
      promptIntro:
        'Convert the given Entity-Relationship (ER) diagram into a Relational Database Schema:',
      schemaOrData:
        '• Strong Entity Student: StudentID (PK), composite name(FirstName, LastName), composite class(year, semester, section).\n• Strong Entity LabSection: composite key class(year, semester, section), LabInstructor.\n• Strong Entity Team: TeamID (PK), TeamName.\n• Weak Entity DragExpRun (identified by Conduct under owner Team): partial key (Date, Trial), DragF, Mass, Vel, Accel.\n• Relationships: Student —(M:N)— Member-of —(0..N)— Team; LabSection —(1:N)— Made-of —(1..1)— Team; Team —(1:N)— Conduct == [[DragExpRun]].',
      subQuestions: [
        {
          part: 'A',
          marks: 10,
          text: 'Clearly specify relation names, attributes, primary keys, and foreign keys for every entity and relationship.',
        },
      ],
      solutionSteps: [
        'Step 1 — Regular Strong Entities (Flatten Composite Attributes) [4M]:\n  • STUDENT(StudentID [PK], FirstName, LastName, year, semester, section)\n  • LAB_SECTION(year [PK], semester [PK], section [PK], LabInstructor)\n  • TEAM(TeamID [PK], TeamName, SectionYear [FK], SectionSemester [FK], SectionNo [FK]) where (SectionYear, SectionSemester, SectionNo) references LAB_SECTION(year, semester, section) from the 1:N Made-of relationship.',
        'Step 2 — Weak Entity DragExpRun (Include Owner Team PK + Partial Key) [3M]:\n  • DRAG_EXP_RUN(TeamID [PK, FK -> TEAM(TeamID)], Date [PK], Trial [PK], DragF, Mass, Vel, Accel).',
        'Step 3 — M:N Relationship Member-of (Junction Table) [3M]:\n  • MEMBER_OF(StudentID [PK, FK -> STUDENT(StudentID)], TeamID [PK, FK -> TEAM(TeamID)]).',
      ],
    },
  },
  {
    qNo: 'Q5',
    marks: 10,
    co: 'CO3',
    bl: 'BL4',
    moduleId: 'm4',
    topicId: 'm4-t3',
    topicTitle: 'Conflict Serializability & Precedence Graphs',
    patternOrigin: 'Official Fall 2026-27 Model Question Paper · Class No. CH2026270101832 · Q5 [5M + 5M = 10M]',
    primary: {
      label: '4-Transaction Precedence Graph & Online Banking ACID / Concurrency Analysis',
      promptIntro:
        'Consider the following schedule S involving four transactions T1, T2, T3, and T4:',
      schemaOrData:
        'S: R1(A), R2(B), W1(B), R3(A), W2(A), R4(B), W3(C), W4(B), R2(C), C1, C2, C3, C4',
      subQuestions: [
        {
          part: 'a',
          marks: 5,
          text: 'Construct the precedence (serialization) graph for the schedule S and determine whether the schedule is conflict serializable.',
        },
        {
          part: 'b',
          marks: 5,
          text: 'A bank allows customers to perform online transactions such as balance inquiries, fund transfers, and bill payments simultaneously. Explain the concepts of transactions, ACID properties, and concurrency anomalies if multiple transactions access the same account simultaneously.',
        },
      ],
      solutionSteps: [
        'Part (a) [5M]: Conflict pairs by data item:\n  • On A (R1(A), R3(A), W2(A)): R1(A)->W2(A) gives edge T1 -> T2; R3(A)->W2(A) gives edge T3 -> T2.\n  • On B (R2(B), W1(B), R4(B), W4(B)): R2(B)->W1(B) gives edge T2 -> T1; R2(B)->W4(B) gives edge T2 -> T4; W1(B)->R4(B) & W1(B)->W4(B) give edge T1 -> T4.\n  • On C (W3(C), R2(C)): W3(C)->R2(C) gives edge T3 -> T2.\nDirected Edges = {T1 -> T2, T2 -> T1, T1 -> T4, T2 -> T4, T3 -> T2}. Because the precedence graph contains a cycle (T1 -> T2 -> T1), schedule S is NOT conflict serializable.',
        'Part (b) [5M]: (1) Transaction: logical unit of work transforming the DB from one consistent state to another. (2) ACID: Atomicity (all-or-nothing debit+credit via Undo logs), Consistency (account sum invariant preserved), Isolation (concurrent transfers do not interfere via 2PL/MVCC), Durability (committed transfers survive crashes via WAL Redo logs). (3) Concurrency Anomalies: Lost Update (two transfers overwrite each other\'s balance update), Dirty Read / Uncommitted Dependency (balance inquiry reads an uncommitted transfer that rolls back), and Inconsistent Summary / Unrepeatable Read (audit sums accounts mid-transfer).',
      ],
    },
  },
  {
    qNo: 'Q6',
    marks: 10,
    co: 'CO3',
    bl: 'BL3',
    moduleId: 'm3',
    topicId: 'm3-t3',
    topicTitle: 'Single-Level, Multi-Level & B+ Tree Indexing',
    patternOrigin: 'Official Fall 2026-27 Model Question Paper · Class No. CH2026270101832 · Q6 [7M + 3M = 10M]',
    primary: {
      label: 'Order-4 B+ Tree Construction (15 Keys) & Sequential Deletions (38, 12, 89)',
      promptIntro:
        'Construct and update a B+ tree of order 4 (max 4 pointers / 3 keys per node; min 2 keys per leaf) for the given sequence:',
      schemaOrData:
        'Insertion Sequence (15 values): 24, 45, 11, 89, 55, 67, 49, 38, 7, 23, 12, 78, 97, 36, 21\nDeletion Sequence (3 values):   Delete 38, Delete 12, Delete 89',
      subQuestions: [
        {
          part: 'a',
          marks: 7,
          text: 'Construct a B+ tree of order 4 for the 15 values above.',
        },
        {
          part: 'b',
          marks: 3,
          text: 'Using the B+ tree built in Q6(a), show the structure after deleting 38, 12, and 89.',
        },
      ],
      solutionSteps: [
        'Part (a) [7M]: (1) Insert 24, 45, 11 -> Leaf [11, 24, 45]. (2) Insert 89 -> splits into [11, 24] and [45, 89], copy-up 45 -> Root [45]. (3) Insert 55, 67 -> [45, 55, 67, 89] splits into [45, 55] and [67, 89], copy-up 67 -> Root [45, 67]. (4) Insert 49, 38 -> leaves [11, 24, 38], [45, 49, 55], [67, 89]. (5) Insert 7 -> [7, 11, 24, 38] splits into [7, 11] and [24, 38], copy-up 24 -> Root [24, 45, 67]. (6) Insert 23, 12 -> [7, 11, 12, 23] splits into [7, 11] and [12, 23], copy-up 12 overflows Root [12, 24, 45, 67] -> push-up 45 to new Root [45] with Left Internal [12, 24] and Right Internal [67]. (7) Insert 78, 97 -> [67, 78, 89, 97] splits into [67, 78] and [89, 97], copy-up 89 -> Right Internal [67, 89]. (8) Insert 36, 21 -> fits into [24, 36, 38] and [12, 21, 23]. Final Q6(a) Tree: Root [45] -> Left Internal [12, 24] (Leaves: [7, 11], [12, 21, 23], [24, 36, 38]) & Right Internal [67, 89] (Leaves: [45, 49, 55], [67, 78], [89, 97]).',
        'Part (b) [3M]: (1) Delete 38 (Case I — Leaf only): Leaf [24, 36, 38] becomes [24, 36] (>=2 keys, no underflow). (2) Delete 12 (Case II — Leaf + Internal Separator Update): Leaf [12, 21, 23] becomes [21, 23]; update separator 12 in Left Internal node to 21 -> Left Internal [21, 24]. (3) Delete 89 (Case III — Leaf Underflow + Merge): Leaf [89, 97] becomes [97] (<2 keys) and sibling [67, 78] has only 2 keys -> merge into [67, 78, 97] and remove separator 89 from Right Internal -> Right Internal [67].',
      ],
    },
  },
  {
    qNo: 'Q7',
    marks: 10,
    co: 'CO3',
    bl: 'BL4',
    moduleId: 'm4',
    topicId: 'm4-t4',
    topicTitle: 'Two-Phase Locking (2PL) & Deadlock Handling',
    patternOrigin: 'Official Fall 2026-27 Model Question Paper · Class No. CH2026270101832 · Q7 [10M]',
    primary: {
      label: 'Applying Two-Phase Locking (2PL) to Concurrent Transactions T1 & T2',
      promptIntro:
        'Given the two concurrent transactions T1 and T2 below:',
      schemaOrData:
        'T1:                          T2:\nread_item(X);                read_item(X);\nread_item(Y);                read_item(Y);\nX := X + Y;                  Y := X + Y;\nwrite_item(X);               write_item(Y);',
      subQuestions: [
        {
          part: 'A',
          marks: 10,
          text: 'Apply the Two-Phase Locking (2PL) protocol by inserting appropriate lock and unlock operations. Analyze and justify whether the resulting execution eliminates concurrency anomalies such as Lost Update, Uncommitted Update, and Inconsistent Summary problems.',
        },
      ],
      solutionSteps: [
        '1. Lock/Unlock Instrumentation (Growing Phase before Shrinking Phase, Canonical Order X then Y) [4M]:\n  • T1: write_lock(X); read_item(X); read_lock(Y); read_item(Y); X := X + Y; write_item(X); COMMIT; unlock(X); unlock(Y);\n  • T2: read_lock(X); read_item(X); write_lock(Y); read_item(Y); Y := X + Y; write_item(Y); COMMIT; unlock(X); unlock(Y);',
        '2. Elimination of Concurrency Anomalies & Deadlock Analysis [6M]:\n  • Lost Update Eliminated: Exclusive write_lock(X) in T1 and write_lock(Y) in T2 prevent concurrent overwrites on the same item.\n  • Uncommitted Update (Dirty Read) Eliminated: Holding exclusive locks until after COMMIT (Strict 2PL) ensures neither transaction can read uncommitted writes of the other.\n  • Inconsistent Summary Eliminated: Because T1 must hold locks on both X and Y at its Lock Point before releasing any lock, T2 cannot modify Y until T1 finishes reading Y (or vice versa), guaranteeing conflict serializability (T1 -> T2 with X=X0+Y0, Y=X0+2Y0, or T2 -> T1 with Y=X0+Y0, X=2X0+Y0).\n  • Bonus Deadlock Prevention: Acquiring locks in canonical order (X before Y) prevents circular wait when T1 starts with write_lock(X) before T2 requests read_lock(X).',
      ],
    },
  },
  {
    qNo: 'Q8',
    marks: 10,
    co: 'CO3',
    bl: 'BL3',
    moduleId: 'm3',
    topicId: 'm3-t4',
    topicTitle: 'Relational Algebra & SQL Translation',
    patternOrigin: 'Official Fall 2026-27 Model Question Paper · Class No. CH2026270101832 · Q8 [2M × 5 = 10M]',
    primary: {
      label: 'Relational Algebra Queries on Projects, Products, Suppliers & Deliveries',
      promptIntro:
        'Consider the following relational database schema and write Relational Algebra expressions for (i)–(v):',
      schemaOrData:
        'Projects(Proj_Id, Proj_Name, Address)\nProducts(Prod_Id, Prod_Name, Price)\nSuppliers(S_Id, S_Name, Address, Credit)\nDeliveries(Prod_Id, S_Id, Proj_Id, Quantity)',
      subQuestions: [
        {
          part: 'i',
          marks: 2,
          text: 'Retrieve the project names that are residing in Mumbai.',
        },
        {
          part: 'ii',
          marks: 2,
          text: 'Find the names of products whose price does not exceed Rs. 1000.',
        },
        {
          part: 'iii',
          marks: 2,
          text: 'List the supplier names and their credit status for suppliers located in Delhi.',
        },
        {
          part: 'iv',
          marks: 2,
          text: 'Retrieve the product IDs and project IDs where the delivered quantity is more than 50 units.',
        },
        {
          part: 'v',
          marks: 2,
          text: 'Find the names of suppliers who have delivered products to projects located in Chennai.',
        },
      ],
      solutionSteps: [
        '(i)   π_{Proj_Name}(σ_{Address = \'Mumbai\'}(Projects))',
        '(ii)  π_{Prod_Name}(σ_{Price <= 1000}(Products))',
        '(iii) π_{S_Name, Credit}(σ_{Address = \'Delhi\'}(Suppliers))',
        '(iv)  π_{Prod_Id, Proj_Id}(σ_{Quantity > 50}(Deliveries))',
        '(v)   π_{S_Name}(Suppliers ⋈ Deliveries ⋈ π_{Proj_Id}(σ_{Address = \'Chennai\'}(Projects)))',
      ],
    },
  },
  {
    qNo: 'Q9',
    marks: 10,
    co: 'CO4',
    bl: 'BL4',
    moduleId: 'm4',
    topicId: 'm4-t5',
    topicTitle: 'Timestamp Ordering & Multiple Granularity Locking',
    patternOrigin: 'Official Fall 2026-27 Model Question Paper · Class No. CH2026270101832 · Q9 [6M + 4M = 10M]',
    primary: {
      label: 'Timestamp Ordering Protocol Trace & Deferred vs. Immediate Update Recovery',
      promptIntro:
        'Suppose there are three transactions T1, T2, and T3 with timestamps TS(T1) = 10, TS(T2) = 20, and TS(T3) = 30, and three data items X = 100, Y = 200, and Z = 300 (initial RTS = 0, WTS = 0):',
      schemaOrData:
        '1. T1: Read(X)\n2. T2: Write(X)\n3. T1: Write(X)\n4. T3: Read(Y)\n5. T2: Write(Y)\n6. T3: Write(Z)\n7. T1: Read(Z)\n8. T2: Read(Z)\n9. T3: Write(X)',
      subQuestions: [
        {
          part: 'a',
          marks: 6,
          text: 'Apply the Basic Timestamp Ordering protocol and trace the execution of the schedule step-by-step, clearly mentioning read_TS, write_TS updates, and whether any transaction is aborted and rolled back.',
        },
        {
          part: 'b',
          marks: 4,
          text: 'Differentiate between Deferred Update and Immediate Update recovery techniques in database systems.',
        },
      ],
      solutionSteps: [
        'Part (a) [6M] Step-by-Step Timestamp Ordering Trace:\n  • Op 1 [T1: Read(X)]: TS(T1)=10 >= WTS(X)=0 -> ALLOWED -> RTS(X) = max(0, 10) = 10.\n  • Op 2 [T2: Write(X)]: TS(T2)=20 >= RTS(X)=10 & WTS(X)=0 -> ALLOWED -> WTS(X) = 20.\n  • Op 3 [T1: Write(X)]: TS(T1)=10 < WTS(X)=20 -> REJECTED! T1 is ABORTED and ROLLED BACK (restarts with a new timestamp).\n  • Op 4 [T3: Read(Y)]: TS(T3)=30 >= WTS(Y)=0 -> ALLOWED -> RTS(Y) = 30.\n  • Op 5 [T2: Write(Y)]: TS(T2)=20 < RTS(Y)=30 (younger T3 already read Y!) -> REJECTED! T2 is ABORTED and ROLLED BACK (undoing T2\'s uncommitted Write(X), restoring WTS(X)=0).\n  • Op 6 [T3: Write(Z)]: TS(T3)=30 >= RTS(Z)=0, WTS(Z)=0 -> ALLOWED -> WTS(Z) = 30.\n  • Op 7 [T1: Read(Z)] & Op 8 [T2: Read(Z)]: Skipped because T1 and T2 already aborted at Steps 3 and 5 (and even if checked directly, 10 < 30 and 20 < 30 fail WTS(Z)=30).\n  • Op 9 [T3: Write(X)]: TS(T3)=30 >= RTS(X)=10, WTS(X)=0 -> ALLOWED -> WTS(X) = 30. T3 COMMITS.',
        'Part (b) [4M] Deferred Update (NO-UNDO / REDO) vs. Immediate Update (UNDO / REDO):\n  1. Disk Flush Timing: Deferred Update buffers all writes in local memory/log until COMMIT; Immediate Update allows dirty pages to flush to disk before COMMIT (provided WAL log flushes first).\n  2. Log Image Requirements: Deferred Update logs only after-images (new values); Immediate Update logs both before-images (BFIM) and after-images (AFIM).\n  3. Aborted Transactions on Crash: Deferred Update requires ZERO UNDO (uncommitted changes never reached disk); Immediate Update must UNDO uncommitted transactions in reverse log order.\n  4. Committed Transactions on Crash: Both schemes REDO committed transactions forward using after-images.',
      ],
    },
  },
  {
    qNo: 'Q10',
    marks: 10,
    co: 'CO4',
    bl: 'BL4',
    moduleId: 'm5',
    topicId: 'm5-t4',
    topicTitle: 'CAP Theorem & ACID vs BASE',
    patternOrigin: 'Official Fall 2026-27 Model Question Paper · Class No. CH2026270101832 · Q10 [5M + 5M = 10M]',
    primary: {
      label: 'Distributed Online Polling CAP Analysis & Food Delivery Polyglot NoSQL Redesign',
      promptIntro:
        'Analyze both distributed and NoSQL database architecture scenarios below:',
      subQuestions: [
        {
          part: 'a',
          marks: 5,
          text: 'A distributed online polling system allows users across multiple locations to cast votes simultaneously. During network issues, users can still cast votes without interruption, although vote counts across servers may temporarily differ. Identify which properties of the CAP theorem are prioritized in this system and explain what property is compromised. Also discuss one advantage and one limitation of this design choice.',
        },
        {
          part: 'b',
          marks: 5,
          text: 'A food delivery platform stores restaurant information, order transactions, delivery logs, and customer–delivery partner interactions. Currently, all data is stored in a single document database. As the system scales, performance issues arise in handling different types of queries. Analyze the limitations of using a single NoSQL database model in this scenario and propose a suitable combination of NoSQL databases, justifying the role of each.',
        },
      ],
      solutionSteps: [
        'Part (a) [5M]: (1) Prioritized CAP Properties: Availability (A) and Partition Tolerance (P) -> AP System (continues accepting votes across disconnected servers during network issues). (2) Compromised Property: Strong Consistency (C) is traded off for Eventual Consistency (BASE / Soft State), so regional vote counts diverge temporarily until background gossip/anti-entropy merges them. (3) Advantage: Zero downtime and sub-millisecond local write latency during peak voting spikes. (4) Limitation: Users refreshing different servers see temporarily inconsistent vote totals, and idempotent voter-ID deduplication (CRDTs or unique (poll_id, user_id) keys) is needed to prevent duplicate voting.',
        'Part (b) [5M]: (1) Limitations of Single Document DB at Scale: Appending millions of GPS/delivery logs bloats documents (hitting the 16 MB BSON limit) and thrashes secondary indexes; multi-hop Customer-Partner-Restaurant relationship queries require slow cross-shard $lookup joins; ephemeral cart/rider heartbeat pings suffer unnecessary disk serialization overhead. (2) Proposed Polyglot Persistence Architecture: Document DB (MongoDB) for hierarchical restaurant menus & order snapshots; Key-Value Store (Redis/DynamoDB) for O(1) active carts, login tokens & live rider pings with TTL; Wide-Column Store (Cassandra/HBase) for high-velocity append-only time-series delivery logs; Graph DB (Neo4j) for index-free multi-hop rider routing, recommendations & fraud detection.',
      ],
    },
  },
];

// ============================================================================
// PAST FAT SLOT PAPERS IN EXACT Q1–Q10 ORDER (A1+TA1 & A2+TA2)
// ============================================================================

export const A1_TA1_PAPER: GeneratedSlotQuestion[] = [
  {
    qNo: 'Q1',
    marks: 10,
    co: 'CO1',
    bl: 'BL1',
    moduleId: 'm1',
    topicId: 'm1-t4',
    topicTitle: 'Database System Environment & Data Models',
    patternOrigin: 'Nov 2026 FAT · Slot A1+TA1 · Q1 [10M, CO1, BL1]',
    primary: {
      label: 'Overall Component Modules of a Database System Environment',
      promptIntro:
        'Draw a block diagram showing the overall component modules of a Database System Environment and briefly explain how it works.',
      subQuestions: [
        {
          part: 'A',
          marks: 4,
          text: 'Draw a neat labeled block diagram of the overall DBMS component architecture showing all user types, query/DML compilers, system catalog, storage/buffer managers, and stored database.',
        },
        {
          part: 'B',
          marks: 6,
          text: 'Trace the working of DDL compilation, interactive query execution, compiled host-language transactions, and transaction/buffer/file managers.',
        },
      ],
      diagramId: 'm1-dbms-components',
      diagramCaption: 'Complete DBMS component environment diagram with bidirectional System Catalog links.',
      solutionSteps: [
        'Part A — Architecture Block Diagram [4M]: Organize top-to-bottom into four layers:\n  1. Users: DBA & DB Designers | Casual / Sophisticated Users | Application Programmers | Naive (Parametric) Users.\n  2. Query Processor & Compilers: DDL Compiler | Query Compiler & Query Optimizer | DML Precompiler + Host Language Compiler -> Compiled Transactions.\n  3. Execution & Storage Manager: Runtime Database Processor, Concurrency Control / Backup & Recovery Subsystem, Stored Data Manager, Buffer Manager, File Manager.\n  4. Disk Structures: System Catalog (Data Dictionary) + Stored Database (Data Files, Indices, Statistics).',
        'Part B — Step-by-Step Working [6M]:\n  • DDL Path (DBA): DBA defines schemas/constraints (`CREATE TABLE`, `ALTER`, `GRANT`); the **DDL Compiler** validates syntax and writes structural metadata into the **System Catalog (Data Dictionary)**.\n  • Interactive Query Path (Casual Users): Ad-hoc SQL enters the **Query Compiler**, which checks Catalog definitions, translates queries into Relational Algebra, and passes plans to the **Query Optimizer** to select the minimum-cost execution plan.\n  • Application Path (Programmers & Naive Users): Application programmers embed DML inside host code (Java/C++); the **DML Precompiler** extracts DML calls into runtime procedure stubs, and the **Host Compiler** links them into **Compiled Transactions** invoked repeatedly by Naive users.\n  • Runtime, Buffer & Transaction Control: The **Runtime DB Processor** drives execution via the **Stored Data / File Manager** and **Buffer Manager** (transferring disk pages into RAM pools via OS disk I/O), while **Concurrency Control** (locking/timestamps) and **Recovery Managers** (`UNDO/REDO` WAL logs) enforce ACID guarantees.',
      ],
    },
  },
  {
    qNo: 'Q2',
    marks: 10,
    co: 'CO1',
    bl: 'BL2 / BL3',
    moduleId: 'm1',
    topicId: 'm1-t6',
    topicTitle: 'Constraints & Handling Violations (with m2-t4 Anomalies)',
    patternOrigin: 'Nov 2026 FAT · Slot A1+TA1 · Q2 [2M + 6M + 2M = 10M, CO1, BL2/BL3]',
    primary: {
      label: 'PROJECT_GRANT Domain Constraints, Modification Anomalies & Referential Delete Actions',
      promptIntro:
        'Consider the relation PROJECT_GRANT below, where each project has one Principal Investigator (PI) and one Sponsor Agency, and a PI can lead multiple projects:',
      schemaOrData:
        'PROJECT_GRANT(Project_ID, Project_Title, Principal_Investigator_SSN, PI_Name, Sponsor_Agency, Budget_Amount)',
      subQuestions: [
        {
          part: 'A',
          marks: 2,
          text: 'Define a Domain Constraint and provide one concrete example violation using any attribute from PROJECT_GRANT.',
        },
        {
          part: 'B',
          marks: 6,
          text: 'Briefly distinguish the three modification anomalies with respect to PROJECT_GRANT: (1) Insertion Anomaly, (2) Deletion Anomaly, and (3) Update (Modification) Anomaly.',
        },
        {
          part: 'C',
          marks: 2,
          text: 'Explain how the DBMS handles referential integrity constraint checks when deleting a tuple from PROJECT_GRANT if Project_ID is referenced as a foreign key in another relation.',
        },
      ],
      solutionSteps: [
        'Part A — Domain Constraint & Violation [2M]: A **Domain Constraint** requires every attribute value in a tuple to be atomic and belong to the declared data type, format, and range (`CHECK`) of that attribute’s domain. *Example on `PROJECT_GRANT`:* Define `Budget_Amount DECIMAL(12,2) CHECK (Budget_Amount > 0)`. Attempting to insert `Budget_Amount = -50000` or `"Five Lakhs"` violates the domain constraint and is rejected by the DBMS.',
        'Part B — Three Modification Anomalies in `PROJECT_GRANT` [6M]: Because `PROJECT_GRANT` mixes two entity facts (`Project` details and `Principal_Investigator_SSN -> PI_Name`), repeating PI details across multiple projects causes:\n  1. **Insertion Anomaly (2M):** You cannot insert a newly hired PI (`Principal_Investigator_SSN`, `PI_Name`) into the database until they are assigned at least one active `Project_ID` (leaving Primary Key `Project_ID` `NULL` violates Entity Integrity).\n  2. **Deletion Anomaly (2M):** If a PI currently leads only one project (`P105`) and you `DELETE` `P105` upon completion, all record of that PI’s SSN and `PI_Name` is unintentionally lost.\n  3. **Update / Modification Anomaly (2M):** If a PI leads 5 projects and changes their legal `PI_Name`, all 5 rows must be updated; updating only one row leaves conflicting `PI_Name` values for the same SSN.',
        'Part C — Referential Integrity on Parent `DELETE` [2M]: When deleting a `PROJECT_GRANT` tuple whose `Project_ID` is referenced by child rows (e.g., `EXPENDITURE`), the DBMS enforces its configured referential action: (1) **`RESTRICT / NO ACTION`** (rejects delete), (2) **`ON DELETE CASCADE`** (automatically deletes matching child rows), (3) **`ON DELETE SET NULL`** (sets child FK to `NULL` if nullable), or (4) **`ON DELETE SET DEFAULT`** (resets child FK to a default ID).',
      ],
    },
  },
  {
    qNo: 'Q3',
    marks: 10,
    co: 'CO5',
    bl: 'BL6',
    moduleId: 'm2',
    topicId: 'm2-t2',
    topicTitle: 'Extended ER (EER) Modeling',
    patternOrigin: 'Nov 2026 FAT · Slot A1+TA1 · Q3 [10M, CO5, BL6]',
    primary: {
      label: 'ARRMS Agriculture Complete EER Diagram (Specialization, Nested Weak Entities & Aggregation)',
      promptIntro:
        'Design a complete Extended Entity-Relationship (EER) diagram for the Agricultural Research & Resource Management System (ARRMS) capturing all rules below:',
      schemaOrData:
        '• STAKEHOLDER(National_ID [PK], Name, Primary_Contact, {Assigned_Agri_Zones}); specialized into FARM_OWNER(Ownership_License_No, Total_Land_Area) and AGRONOMIST(Degree_Specialization, Research_Institute) — a stakeholder may be BOTH simultaneously.\n• CROP(Crop_ID [PK], Botanical_Name, Optimal_pH_Range) is classified into EITHER FOOD_CROP(Nutritional_Grade, Storage_Life_Days) OR INDUSTRIAL_CROP(Processing_Industry_Type, Extraction_Yield_Pct) — every crop must belong to exactly one.\n• FARM_PARCEL(Parcel_No [partial key]) is a weak entity owned by AGRI_ZONE(Agri_Zone_ID [PK], Climatic_Region).\n• IOT_SOIL_SENSORS(Sensor_ID [partial key], Moisture_Level, Nitrate_Content) is a nested weak entity owned by FARM_PARCEL.\n• Ternary relationship FIELD_TRIALS connects AGRONOMIST, CROP, and FARM_PARCEL. That overall trial event is aggregated as AGRI_EXPERIMENT_EVENT and linked to IRRIGATION_SCHEDULES(Water_Volume_Liters, Frequency).',
      subQuestions: [
        {
          part: 'A',
          marks: 10,
          text: 'Draw the complete EER diagram showing all strong/weak entities, multivalued attributes, overlapping (o) vs disjoint-total (d) specializations, ternary relationship, and aggregation.',
        },
      ],
      diagramId: 'm2-arrms-eer',
      diagramCaption: 'Complete EER diagram for ARRMS showing (o), Disjoint Total (d), nested weak entities, and Aggregation.',
      solutionSteps: [
        '1. Strong & Multivalued Base Entities (2M): Draw `STAKEHOLDER` (`National_ID` underlined PK, `Name`, `Primary_Contact`, `{Assigned_Agri_Zones}` in a **double-oval** multivalued attribute), `CROP` (`Crop_ID` underlined), `AGRI_ZONE` (`Agri_Zone_ID` underlined, `Climatic_Region`), and `IRRIGATION_SCHEDULES` (`Schedule_ID`, `Water_Volume_Liters`, `Frequency`).',
        '2. Specialization Constraints (2.5M):\n  • Beneath `STAKEHOLDER`, draw a single-line Partial + **`(o)` Overlapping** circle branching to `FARM_OWNER` (`Ownership_License_No`, `Total_Land_Area`) and `AGRONOMIST` (`Degree_Specialization`, `Research_Institute`).\n  • Beneath `CROP`, draw a double-line **Total** + **`(d)` Disjoint** circle branching to `FOOD_CROP` (`Nutritional_Grade`, `Storage_Life_Days`) and `INDUSTRIAL_CROP` (`Processing_Industry_Type`, `Extraction_Yield_Pct`).',
        '3. Nested Weak Entities (2.5M): Connect `AGRI_ZONE` via double-diamond `HAS_PARCEL` (`1:N`) == double-rectangle `FARM_PARCEL` (`Parcel_No` dashed-underlined). Then connect `FARM_PARCEL` via double-diamond `HAS_SENSOR` (`1:N`) == double-rectangle `IOT_SOIL_SENSORS` (`Sensor_ID` dashed-underlined, `Moisture_Level`, `Nitrate_Content`).',
        '4. Ternary Relationship & Aggregation (3M): Connect `AGRONOMIST`, `CROP`, and `FARM_PARCEL` into ternary diamond `FIELD_TRIALS`. Surround `FIELD_TRIALS` and those 3 entities inside a dashed/rectangular **Aggregation** boundary labeled `AGRI_EXPERIMENT_EVENT`, and connect that aggregate box via relationship `FOLLOWS` (`1:N`) to `IRRIGATION_SCHEDULES`.',
      ],
    },
  },
  {
    qNo: 'Q4',
    marks: 10,
    co: 'CO5',
    bl: 'BL3',
    moduleId: 'm2',
    topicId: 'm2-t5',
    topicTitle: 'Normalization: 1NF, 2NF, 3NF & BCNF',
    patternOrigin: 'Nov 2026 FAT · Slot A1+TA1 · Q4 [4M + 6M = 10M, CO5, BL3]',
    primary: {
      label: 'PATIENT_DIAGNOSIS Candidate Key, Highest Normal Form & BCNF Decomposition',
      promptIntro:
        'Consider the relation PATIENT_DIAGNOSIS and its given set of functional dependencies:',
      schemaOrData:
        'PATIENT_DIAGNOSIS(Patient_ID, Appt_Date, Doctor_ID, Doctor_Name, Dept_Code, Dept_Head, Test_Name, Test_Result)\n\nFunctional Dependencies:\n• FD1: Patient_ID, Appt_Date -> Doctor_ID\n• FD2: Doctor_ID -> Doctor_Name, Dept_Code\n• FD3: Dept_Code -> Dept_Head\n• FD4: Patient_ID, Appt_Date, Test_Name -> Test_Result',
      subQuestions: [
        {
          part: 'A',
          marks: 4,
          text: 'Identify the Candidate Key(s), Prime vs. Non-Prime attributes, and state the highest Normal Form currently satisfied by PATIENT_DIAGNOSIS with justification.',
        },
        {
          part: 'B',
          marks: 6,
          text: 'Decompose PATIENT_DIAGNOSIS step-by-step into BCNF relations, showing primary keys, foreign keys, and verifying why each resulting relation is in BCNF.',
        },
      ],
      solutionSteps: [
        'Part A — Candidate Key & Highest Normal Form [4M]:\n  1. Essential (`L`-only) attributes: `Patient_ID`, `Appt_Date`, and `Test_Name` never appear on any RHS, so they must belong to every superkey.\n  2. Closure Check: `{Patient_ID, Appt_Date, Test_Name}+` -> adds `Doctor_ID` (FD1) -> adds `Doctor_Name, Dept_Code` (FD2) -> adds `Dept_Head` (FD3) -> adds `Test_Result` (FD4) = all 8 attributes!\n  3. Only Candidate Key = **`{Patient_ID, Appt_Date, Test_Name}`**. Prime = `{Patient_ID, Appt_Date, Test_Name}`; Non-Prime = `{Doctor_ID, Doctor_Name, Dept_Code, Dept_Head, Test_Result}`.\n  4. Normal Form Audit: Assuming atomic values, it satisfies **1NF**. Check **2NF**: look at `FD1: {Patient_ID, Appt_Date} -> Doctor_ID` — LHS `{Patient_ID, Appt_Date}` is a proper subset of the Candidate Key determining non-prime `Doctor_ID` (**Partial Dependency** -> FAILS 2NF!). Therefore, **Highest Normal Form = `1NF`** (FD2 & FD3 are also transitive dependencies).',
        'Part B — Step-by-Step Lossless BCNF Decomposition [6M]: Repeatedly split on FDs whose LHS is NOT a superkey:\n  1. Decompose on `FD3 (Dept_Code -> Dept_Head)`:\n     • **`DEPARTMENT(Dept_Code [PK], Dept_Head)`** (CK = `Dept_Code` -> BCNF)\n  2. Decompose on `FD2 (Doctor_ID -> Doctor_Name, Dept_Code)`:\n     • **`DOCTOR(Doctor_ID [PK], Doctor_Name, Dept_Code [FK -> DEPARTMENT])`** (CK = `Doctor_ID` -> BCNF)\n  3. Decompose on `FD1 (Patient_ID, Appt_Date -> Doctor_ID)`:\n     • **`APPOINTMENT(Patient_ID [PK], Appt_Date [PK], Doctor_ID [FK -> DOCTOR])`** (CK = `(Patient_ID, Appt_Date)` -> BCNF)\n     • **`PATIENT_TEST(Patient_ID [PK], Appt_Date [PK], Test_Name [PK], Test_Result)`** with `(Patient_ID, Appt_Date) [FK -> APPOINTMENT]` (CK = `(Patient_ID, Appt_Date, Test_Name)` -> BCNF).\n  • Verification: In all 4 resulting tables, every non-trivial FD has a Superkey on its LHS, and every join attribute is a key -> **Lossless, Dependency-Preserving, and BCNF**.',
      ],
    },
  },
  {
    qNo: 'Q5 (a OR b)',
    marks: 10,
    co: 'CO2',
    bl: 'BL3',
    moduleId: 'm3',
    topicId: 'm3-t2',
    topicTitle: 'Hashing Techniques: Static & Dynamic',
    orTopicId: 'm3-t3',
    orTopicTitle: 'Single-Level, Multi-Level & B+ Tree Indexing',
    patternOrigin: 'Nov 2026 FAT · Slot A1+TA1 · Q5(a OR b) [10M, CO2, BL3]',
    primary: {
      label: '(a) Static Hashing Overflow Chain vs. Extendible Dynamic Hashing Trace',
      promptIntro:
        'A file uses hash buckets of capacity c = 2 records. Five records with 4-bit binary hash keys are inserted in sequence:',
      schemaOrData: 'Keys: K1 = 0001,  K2 = 1001,  K3 = 0101,  K4 = 0010,  K5 = 1101   (Bucket capacity c = 2)',
      subQuestions: [
        {
          part: 'A',
          marks: 4,
          text: 'Under Static Hashing with fixed primary buckets B0(00), B1(01), B2(10), B3(11) using h_static(k) = last 2 bits of k, trace inserting K1..K5 and draw the resulting buckets and overflow chain.',
        },
        {
          part: 'B',
          marks: 6,
          text: 'Under Extendible Dynamic Hashing starting with Global Depth d = 1 (directory entries 0 and 1), Bucket_A (prefix 0, dp = 1), and Bucket_B (prefix 1, dp = 1), trace inserting K1..K5 step-by-step and draw the Final Directory and Bucket Layout.',
        },
      ],
      diagramId: 'm3-hashing-layouts',
      diagramCaption: 'A1+TA1 Q5(a): Static Hashing overflow chain on B1 vs. MSB Extendible Hashing (d = 2).',
      solutionSteps: [
        'Part A — Static Hashing Trace (Last 2 Suffix Bits) [4M]:\n  • `K1 (0001)` -> suffix `01` -> `B1 = [K1]`\n  • `K2 (1001)` -> suffix `01` -> `B1 = [K1, K2]` *(B1 now FULL, c=2)*\n  • `K3 (0101)` -> suffix `01` -> `B1` overflows! Allocate overflow bucket `B1_ov1 = [K3]` chained from `B1`.\n  • `K4 (0010)` -> suffix `10` -> `B2 = [K4]`\n  • `K5 (1101)` -> suffix `01` -> `B1` full -> follow overflow pointer -> `B1_ov1 = [K3, K5]`.\n  • Final Static State: `B0 = []`, `B1 = [K1, K2] -> B1_ov1 [K3, K5]`, `B2 = [K4]`, `B3 = []`.',
        'Part B — Extendible Hashing Trace (MSB Prefix Convention, Initial d = 1) [6M]:\n  1. `K1 (0001)` prefix `0` -> `Bucket_A = [K1]` (`dp=1`).\n  2. `K2 (1001)` prefix `1` -> `Bucket_B = [K2]` (`dp=1`).\n  3. `K3 (0101)` prefix `0` -> `Bucket_A = [K1, K3]` *(FULL, c=2)*.\n  4. `K4 (0010)` prefix `0` -> **`Bucket_A` OVERFLOWS!** Since `dp(A) = 1 == d = 1`, **double directory (`d = 2`: `00, 01, 10, 11`)**, split `Bucket_A` into `A1 (00, dp=2)` and `A2 (01, dp=2)`, and rehash `{K1(0001), K3(0101), K4(0010)}`: `A1 = [K1, K4]`, `A2 = [K3]`. Directory `10` and `11` both share `Bucket_B (dp=1)`.\n  5. `K5 (1101)` 2-bit prefix `11` -> routes to `Bucket_B = [K2, K5]` *(fits within capacity `c=2`, NO second split!)*.',
      ],
    },
    orOption: {
      label: '(b) B+ Tree (Order m = 3) Construction [10,20,5,15,25,30,2] & Deletion [5,20,15]',
      promptIntro:
        'Construct and update a B+ Tree of order m = 3 (max 3 child pointers / 2 keys per node; min 1 key per non-root node):',
      schemaOrData:
        'Phase 1 Insertions: 10, 20, 5, 15, 25, 30, 2\nPhase 2 Deletions:  Delete 5, Delete 20, Delete 15',
      subQuestions: [
        {
          part: 'A',
          marks: 5,
          text: 'Insert all 7 keys sequentially starting from an empty tree, showing every leaf split (copy up) and internal split (push up).',
        },
        {
          part: 'B',
          marks: 5,
          text: 'Delete 5, 20, and 15 in order from the constructed tree, showing leaf underflows, sibling borrowing, leaf merging, and separator updates.',
        },
      ],
      diagramId: 'm3-bplus-a1q5b',
      diagramCaption: 'A1+TA1 Q5(b): B+ Tree (m = 3) after Phase 1 Insertions and Phase 2 Deletions.',
      solutionSteps: [
        'Part A — Step-by-Step Insertions (m = 3, Max 2 Keys) [5M]:\n  1. Insert `10, 20` -> Leaf `[10, 20]`.\n  2. Insert `5` -> `[5, 10, 20]` splits into `[5]` & `[10, 20]`, copy `10` up -> Root `[10]`.\n  3. Insert `15` -> `[10, 15, 20]` splits into `[10]` & `[15, 20]`, copy `15` up -> Root `[10, 15]`.\n  4. Insert `25` -> `[15, 20, 25]` splits into `[15]` & `[20, 25]`, copy `20` up -> Root `[10, 15, 20]` splits moving **`15`** up: Root `[15]` -> L:`[10]` (`[5], [10]`) & R:`[20]` (`[15], [20, 25]`).\n  5. Insert `30` -> `[20, 25, 30]` splits into `[20]` & `[25, 30]`, copy `25` up -> R:`[20, 25]`.\n  6. Insert `2` -> fits in `[2, 5]`. Phase 1 Leaves: `[2, 5] -> [10] -> [15] -> [20] -> [25, 30]`.',
        'Part B — Step-by-Step Deletions [5M]:\n  7. **Delete 5:** Leaf `[2, 5]` becomes `[2]` (`>= 1` key, valid!).\n  8. **Delete 20:** Leaf `[20]` becomes empty (`0 < 1`). Right sibling `[25, 30]` has 2 keys -> **Borrow `25`**: leaves become `[25]` & `[30]`, and R updates `[20, 25]` -> **`[25, 30]`**.\n  9. **Delete 15:** Leaf `[15]` empties (`0 < 1`); right sibling `[25]` has only 1 key -> **Merge** `[15] + [25]` into `[25]`, drop separator `25` from R leaving R=`[30]`, and update Root separator `15 -> 25`. **Final Tree:** Root `[25]` -> L:`[10]` (`[2] -> [10]`) & R:`[30]` (`[25] -> [30]`).',
      ],
    },
  },
  {
    qNo: 'Q6',
    marks: 10,
    co: 'CO2',
    bl: 'BL3',
    moduleId: 'm3',
    topicId: 'm3-t6',
    topicTitle: 'Query Optimization & Heuristic Query Trees',
    patternOrigin: 'Nov 2026 FAT · Slot A1+TA1 · Q6 [2M + 8M = 10M, CO2, BL3]',
    primary: {
      label: 'Retail Banking 3-Table SQL Query Tree & Heuristic Optimization',
      promptIntro: 'Consider the following Retail Banking relations and SQL query:',
      schemaOrData:
        'CUSTOMER(Cust_ID, CName, Branch_Code, Credit_Score)\nACCOUNT(Acc_No, Cust_ID, Acc_Type, Opening_Date)\nTRANSACTION(Txn_ID, Acc_No, Txn_Type, Amount, Txn_Date)\n\nSELECT C.CName, A.Acc_No, T.Amount\nFROM CUSTOMER C, ACCOUNT A, TRANSACTION T\nWHERE C.Cust_ID = A.Cust_ID\n  AND A.Acc_No = T.Acc_No\n  AND C.Branch_Code = \'BR_MUMBAI_01\'\n  AND A.Acc_Type = \'Savings\'\n  AND T.Amount > 100000;',
      subQuestions: [
        {
          part: 'A',
          marks: 2,
          text: 'Draw the unoptimized Canonical Query Tree directly from the SQL query.',
        },
        {
          part: 'B',
          marks: 8,
          text: 'Demonstrate step-by-step Heuristic Optimization transformations (cascade σ, push σ down, reorder most restrictive leaves, convert × + σ to ⋈, and push π down) and draw the Final Optimized Query Tree.',
        },
      ],
      diagramId: 'm3-query-tree-a1q6',
      diagramCaption: 'A1+TA1 Q6: Unoptimized Canonical Query Tree vs. Final Optimized Heuristic Query Tree.',
      solutionSteps: [
        'Part A — Canonical Query Tree [2M]: Base relations `CUSTOMER C`, `ACCOUNT A`, `TRANSACTION T` at the leaves combined via two Cartesian Product (`×`) nodes at the bottom -> single compound `σ` holding all 5 `AND` predicates above `×` -> root `π_{C.CName, A.Acc_No, T.Amount}`.',
        'Part B — 5-Step Heuristic Optimization [8M]:\n  • Step 1 (Cascade `σ`): Break the 5 conjunctive predicates into separate single-predicate selections.\n  • Step 2 (Push `σ` down to leaves): Push `σ_{Branch_Code=\'BR_MUMBAI_01\'}(C)`, `σ_{Acc_Type=\'Savings\'}(A)`, and `σ_{Amount>100000}(T)` directly above base tables.\n  • Step 3 (Reorder Restrictive Leaves): Place highly selective leaf filters (`C` filtered to one branch, `T` filtered to `> 1,00,000`) so joins process minimal rows.\n  • Step 4 (Replace `× + σ` with Equi-Joins `⋈`): Form `(C ⋈_{C.Cust_ID=A.Cust_ID} A) ⋈_{A.Acc_No=T.Acc_No} T`.\n  • Step 5 (Push `π` down keeping join keys!): Project `π_{Cust_ID, CName}(σ(C))`, `π_{Acc_No, Cust_ID}(σ(A))`, and `π_{Acc_No, Amount}(σ(T))`; project `π_{C.CName, A.Acc_No}` above `C ⋈ A` before joining `T`.',
      ],
    },
  },
  {
    qNo: 'Q7',
    marks: 10,
    co: 'CO3',
    bl: 'BL3',
    moduleId: 'm4',
    topicId: 'm4-t3',
    topicTitle: 'Conflict Serializability & Precedence Graphs (with m4-t2 Recoverability)',
    patternOrigin: 'Nov 2026 FAT · Slot A1+TA1 · Q7 [3M + 4M + 3M = 10M, CO3, BL3]',
    primary: {
      label: 'Wallet Schedule Conflicts, Precedence Graph Cycle & Recoverability Classification',
      promptIntro:
        'Digital wallet accounts initially hold X = 500 and Y = 800. T1 transfers 100 from X to Y; T2 adds a 50 bonus to X and audits Y. Consider concurrent schedule S:',
      schemaOrData:
        'S: T1:Read(X); T1:Write(X); T2:Read(X); T2:Write(X); T1:Read(Y); T2:Read(Y); T1:Write(Y); T1:Commit; T2:Commit',
      subQuestions: [
        {
          part: 'A',
          marks: 3,
          text: 'List all pairs of conflicting operations present in schedule S.',
        },
        {
          part: 'B',
          marks: 4,
          text: 'State whether S is conflict serializable. If yes, give an equivalent serial order; if no, justify using the precedence graph.',
        },
        {
          part: 'C',
          marks: 3,
          text: 'Classify schedule S according to recoverability properties (Recoverable, Cascadeless, or Strict) with justification.',
        },
      ],
      diagramId: 'm4-precedence-a1q7',
      diagramCaption: 'A1+TA1 Q7: Precedence graph cycle T1 -> T2 -> T1 proving S is not conflict serializable.',
      solutionSteps: [
        'Part A — Enumerate All 4 Conflicting Pairs [3M]: Index operations `1..9`. Conflicts require different transactions, same item, and at least one Write:\n  1. `(Op 1: T1:Read(X), Op 4: T2:Write(X))` -> `RW` (`T1 -> T2`)\n  2. `(Op 2: T1:Write(X), Op 3: T2:Read(X))` -> `WR` (`T1 -> T2`)\n  3. `(Op 2: T1:Write(X), Op 4: T2:Write(X))` -> `WW` (`T1 -> T2`)\n  4. `(Op 6: T2:Read(Y), Op 7: T1:Write(Y))` -> `RW` (`T2 -> T1`)\n  *(Note: `T1:Read(Y)` vs `T2:Read(Y)` is RR, NOT a conflict!)*',
        'Part B — Precedence Graph & Serializability Verdict [4M]: Draw vertices `T1` and `T2`. Conflicts 1–3 add edge `T1 -> T2`; Conflict 4 adds edge `T2 -> T1`. Because the graph contains the directed cycle **`T1 -> T2 -> T1`**, Schedule `S` is **NOT Conflict Serializable**.',
        'Part C — Recoverability Classification [3M]: `T2:Read(X)` reads uncommitted `X` written by `T1:Write(X)` (a **Dirty Read**), so `S` is **NOT Cascadeless** and therefore **NOT Strict** (also `T2:Write(X)` overwrites uncommitted `X`). However, `T1:Commit` occurs BEFORE `T2:Commit`, so if `T1` aborted before commit `T2` has not yet committed — making `S` **Recoverable (specifically: Recoverable with Cascading Rollback)**.',
      ],
    },
  },
  {
    qNo: 'Q8 (a OR b)',
    marks: 10,
    co: 'CO3',
    bl: 'BL3',
    moduleId: 'm4',
    topicId: 'm4-t4',
    topicTitle: 'Two-Phase Locking (2PL) & Deadlock Handling',
    orTopicId: 'm4-t6',
    orTopicTitle: 'Database Recovery: Deferred vs Immediate Update',
    patternOrigin: 'Nov 2026 FAT · Slot A1+TA1 · Q8(a OR b) [10M, CO3, BL3]',
    primary: {
      label: '(a) Incorrect Summary Inventory Anomaly & Step-by-Step 2PL Lock Trace',
      promptIntro:
        'Product_A initially holds 100 units and Product_B holds 50 units (Total = 150). T1 (Audit) sums Product_A + Product_B while T2 (Transfer) moves 20 units from Product_A to Product_B. Under uncontrolled execution: T1 reads A=100 (t2), T2 sets A=80, B=70 and commits (t4–t10), then T1 reads B=70 (t11) and outputs Sum = 170.',
      subQuestions: [
        {
          part: 'A',
          marks: 3,
          text: 'Identify the concurrency problem and explain precisely where the inconsistency occurs.',
        },
        {
          part: 'B',
          marks: 5,
          text: 'Rewrite the complete step-by-step execution trace showing how Two-Phase Locking (2PL) resolves this schedule, explicitly marking all lock requests, grants, WAIT states, and unlocks.',
        },
        {
          part: 'C',
          marks: 2,
          text: 'State the new final Sum computed by T1 under 2PL and justify inventory consistency.',
        },
      ],
      solutionSteps: [
        'Part A — Identify Problem [3M]: This is the **Incorrect Summary Problem (Inconsistent Analysis)**. `T1` read the **pre-transfer** `Product_A = 100` (`t2–t3`), `T2` committed its `20`-unit transfer (`A=80, B=70`), and then `T1` read the **post-transfer** `Product_B = 70` (`t11`), double-counting the transferred 20 units (`100 + 70 = 170 != 150`).',
        'Part B — Complete 2PL Execution Trace (`t1..t13`) [5M]:\n  • `t1`: `T1 -> lock-S(Product_A)` **[Granted]**\n  • `t2–t3`: `T1 -> Read(Product_A)=100; Sum := 100`\n  • `t4`: `T2 -> lock-X(Product_A)` -> **WAIT!** *(T1 still holds `S(Product_A)`; 2PL forbids `T1` from releasing `A` before acquiring `lock-S(B)`)*\n  • `t5–t7`: `T1 -> lock-S(Product_B)` **[Granted; Lock Point]**, `Read(Product_B)=50`, `Sum := 100 + 50 = 150; Output(150)`\n  • `t8`: `T1 -> Commit; unlock(Product_A); unlock(Product_B)` *(T2 unblocked!)*\n  • `t9–t13`: `T2 -> lock-X(Product_A), Read(A)=100, A:=80, Write(A); lock-X(Product_B), Read(B)=50, B:=70, Write(B); Commit; unlock(A); unlock(B)`.',
        'Part C — Consistent Result [2M]: `T1` outputs **`Sum = 150`**, matching the true conserved inventory total (`80 + 70 = 150`) via an execution equivalent to serial order `T1 -> T2`.',
      ],
    },
    orOption: {
      label: '(b) Crash Log Recovery Trace (Deferred Update vs. Immediate Update)',
      promptIntro:
        'A banking database uses Write-Ahead Logging (WAL). Initial disk balances before crash are A = 500 and B = 1000. The system log at crash time contains:',
      schemaOrData:
        '[Start_Transaction, T1]\n[Write, T1, A, 500, 400]\n[Start_Transaction, T2]\n[Write, T2, B, 1000, 1200]\n[Commit, T1]\n[Start_Transaction, T3]\n[Write, T3, A, 400, 450]\n<SYSTEM CRASH>',
      subQuestions: [
        {
          part: 'A',
          marks: 2,
          text: 'Differentiate Deferred Update vs. Immediate Update regarding when physical disk updates occur relative to transaction commits.',
        },
        {
          part: 'B',
          marks: 4,
          text: 'Trace the recovery process (UNDO List, REDO List, and exact recovery operations on A & B) for Case A: Deferred Update and Case B: Immediate Update.',
        },
        {
          part: 'C',
          marks: 4,
          text: 'State the final consistent values of A and B on disk after recovery finishes under BOTH cases and explain why.',
        },
      ],
      solutionSteps: [
        'Part A — Timing Distinction [2M]: Under **Deferred Update (`NO-UNDO / REDO`, `No-Steal`)**, updates stay buffered in memory/log and **never modify disk pages until `Commit`**. Under **Immediate Update (`UNDO / REDO`, `Steal / No-Force`)**, dirty buffer pages **may flush to disk while the transaction is active (before `Commit`)**, provided WAL log records flush first.',
        'Part B — Recovery Traces [4M]:\n  • **Case A (Deferred Update):** `T1` has `[Commit, T1]`; `T2` and `T3` never committed. Thus **`UNDO = ∅`**, **`REDO = {T1}`** (ignore `T2, T3` as their writes never reached disk). Execute `REDO(T1)`: set `A := 400` (`B` stays `1000`).\n  • **Case B (Immediate Update):** Active uncommitted transactions enter **Backward `UNDO = {T3, T2}`** and committed transactions enter **Forward `REDO = {T1}`**.\n    1) Backward UNDO: undo `[Write, T3, A, 400, 450]` -> restore `A := 400` (`BFIM`); undo `[Write, T2, B, 1000, 1200]` -> restore `B := 1000` (`BFIM`).\n    2) Forward REDO: redo `[Write, T1, A, 500, 400]` -> set `A := 400` (`AFIM`).',
        'Part C — Final Disk Values [4M]: Under **BOTH Deferred Update and Immediate Update**, final consistent balances are **`A = 400, B = 1000`**. Committed `T1` (`500 -> 400`) persists, while uncommitted `T2` (`+200` on `B`) and `T3` (`+50` on `A`) are eliminated (notice why backward UNDO of `T3` before REDO of `T1` avoids corrupting `A` to `500`!).',
      ],
    },
  },
  {
    qNo: 'Q9',
    marks: 10,
    co: 'CO4',
    bl: 'BL2',
    moduleId: 'm5',
    topicId: 'm5-t2',
    topicTitle: 'Data Fragmentation, Replication & Allocation (with m5-t1 DDBMS Advantages)',
    patternOrigin: 'Nov 2026 FAT · Slot A1+TA1 · Q9 [2M + 2M + 6M = 10M, CO4, BL2]',
    primary: {
      label: 'DDBMS Advantages, Need for Fragmentation & Horizontal/Vertical/Mixed Types',
      promptIntro:
        'Answer the following distributed database design questions:',
      subQuestions: [
        {
          part: 'A',
          marks: 2,
          text: 'List two key advantages of a Distributed Database Management System (DDBMS) over a centralized DBMS architecture.',
        },
        {
          part: 'B',
          marks: 2,
          text: 'What is the need for fragmentation in a DDBMS?',
        },
        {
          part: 'C',
          marks: 6,
          text: 'Differentiate Horizontal, Vertical, and Mixed fragmentation with a concrete relational example and correctness rules.',
        },
      ],
      solutionSteps: [
        'Part A — Two DDBMS Advantages [2M]:\n  1. **Higher Reliability & Availability:** Replicating data across physically separated sites eliminates any Single Point of Failure (SPOF)—when one node fails, queries route to surviving replicas.\n  2. **Improved Performance via Data Localization & Parallelism:** Storing fragments close to regional users cuts WAN communication latency and lets sub-queries run in parallel across nodes.',
        'Part B — Need for Fragmentation [2M]: Applications usually access only specific rows or columns (e.g., Chennai branch queries only South-zone customers, and HR separates confidential Salary from public directory fields). Storing fragments locally reduces network bandwidth, eliminates wasted storage, strengthens column-level security, and boosts parallel query execution.',
        'Part C — Three Fragmentation Types Using `EMPLOYEE(EmpID [PK], Name, Region, Dept, Salary)` [6M]:\n  1. **Horizontal Fragmentation (HF):** Splits **tuples (rows)** via Relational Algebra Selection (`σ`): `Emp_South = σ_{Region=\'South\'}(EMPLOYEE)`, `Emp_North = σ_{Region=\'North\'}(EMPLOYEE)`. **Reconstruction:** Union (`Emp_South ∪ Emp_North = EMPLOYEE`).\n  2. **Vertical Fragmentation (VF):** Splits **attributes (columns)** via Projection (`π`), retaining the **Primary Key (`EmpID`)** in EVERY fragment: `Emp_Public = π_{EmpID, Name, Region, Dept}(EMPLOYEE)`, `Emp_Payroll = π_{EmpID, Salary}(EMPLOYEE)`. **Reconstruction:** Natural Join (`Emp_Public ⋈ Emp_Payroll = EMPLOYEE`).\n  3. **Mixed / Hybrid Fragmentation:** Applies HF then VF (or VF then HF)—for example, horizontally partition `EMPLOYEE` by `Region` then vertically separate public vs `Salary` columns per site. **Reconstruction:** Natural Join (`⋈`) followed by Union (`∪`).\n  • **Correctness Rules:** **Completeness** (no lost tuples/attributes), **Reconstruction** (lossless algebraic inverse), and **Disjointness** (minimal duplication except PKs in VF).',
      ],
    },
  },
  {
    qNo: 'Q10',
    marks: 10,
    co: 'CO4',
    bl: 'BL4',
    moduleId: 'm5',
    topicId: 'm5-t4',
    topicTitle: 'CAP Theorem & ACID vs BASE',
    patternOrigin: 'Nov 2026 FAT · Slot A1+TA1 · Q10 [3M + 3M + 4M = 10M, CO4, BL4]',
    primary: {
      label: 'Global Flash Sale Undersea Partition: CAP Theorem Analysis (Inventory CP vs. Reviews AP)',
      promptIntro:
        'A global e-commerce platform runs a flash sale across US-East (Primary) and EU-West (Secondary). A sudden undersea cable fault causes a network partition isolating the two data centers.',
      subQuestions: [
        {
          part: 'A',
          marks: 3,
          text: 'Define the three guarantees of Brewer’s CAP Theorem: Consistency (C), Availability (A), and Partition Tolerance (P).',
        },
        {
          part: 'B',
          marks: 3,
          text: 'With only 1 promotional item unit remaining in stock, should the Inventory Management Service choose CP or AP during the partition? Justify.',
        },
        {
          part: 'C',
          marks: 4,
          text: 'Should the Product Review & Recommendation Service choose CP or AP? Explain the exact EU-West user experience (reads and writes) while partitioned.',
        },
      ],
      diagramId: 'm5-cap-triangle',
      diagramCaption: 'CAP Theorem trade-off: Partition Tolerance (P) forces selecting CP (Inventory) or AP (Reviews).',
      solutionSteps: [
        'Part A — Three CAP Properties [3M]:\n  • **Consistency (C — Linearizability):** Every read receives the most recent committed write or an error; all nodes reflect an identical global view.\n  • **Availability (A):** Every request received by a non-failing node returns a timely non-error response (without guaranteeing it holds the freshest write).\n  • **Partition Tolerance (P):** The cluster continues functioning despite arbitrary dropped or delayed network messages between disconnected nodes.',
        'Part B — Inventory Service (`1` Unit Left) -> Choose **CP** [3M]: Once the undersea cable cuts (**P**), the service cannot satisfy both C and A. Choosing AP would allow both US-East and EU-West to sell the same last unit simultaneously (**overselling / negative inventory**). Therefore, choose **CP**: reject/block minority EU-West checkouts until quorum/link recovers, guaranteeing strict stock consistency at the cost of local EU availability.',
        'Part C — Product Review & Recommendation Service -> Choose **AP** + EU-West UX [4M]: Reviews tolerate minor staleness, so choose **AP (BASE / Eventual Consistency)**:\n  • **Reads in EU-West:** Shoppers continue browsing product pages and reading cached ratings/reviews with zero downtime, though brand-new US-East reviews remain temporarily invisible.\n  • **Writes in EU-West:** New EU-West customer reviews are accepted locally (`Soft State`) without cross-Atlantic lock waits and asynchronously synced/merged via anti-entropy once the undersea link heals.',
      ],
    },
  },
];

export const A2_TA2_PAPER: GeneratedSlotQuestion[] = [
  {
    qNo: 'Q1',
    marks: 10,
    co: 'CO1',
    bl: 'BL1',
    moduleId: 'm1',
    topicId: 'm1-t3',
    topicTitle: 'Schemas, Instances & Three-Schema Architecture',
    patternOrigin: 'Nov 2026 FAT · Slot A2+TA2 · Q1 [10M, CO1, BL1]',
    primary: {
      label: 'Three-Schema Architecture, Level Functions & Data Independence Examples',
      promptIntro:
        'Explain the ANSI/SPARC Three-Schema Architecture and how it achieves data independence.',
      subQuestions: [
        {
          part: 'A',
          marks: 4,
          text: 'Draw a neat block diagram of the Three-Schema Architecture showing all levels and both schema mappings, and describe the function of each level.',
        },
        {
          part: 'B',
          marks: 6,
          text: 'Explain how the architecture provides Logical and Physical Data Independence, illustrating each type with one suitable real-world database example.',
        },
      ],
      diagramId: 'm1-three-schema',
      diagramCaption: 'A2+TA2 Q1: External, Conceptual, and Internal schemas separated by External/Conceptual & Conceptual/Internal mappings.',
      solutionSteps: [
        'Part A — Diagram & Level Functions [4M]:\n  1. **External / View Level:** Presents customized user views (hiding sensitive columns like salaries or wholesale cost while supporting different roles).\n  2. **Conceptual / Logical Level:** Describes global enterprise entities, relationships, datatypes, and integrity constraints independent of storage hardware.\n  3. **Internal / Physical Level:** Specifies physical file organizations, disk block layouts, compression, and B+ Tree / Hash indexes over the **Stored Database**.\n  • Explicitly connect layers via **External/Conceptual Mapping** and **Conceptual/Internal Mapping**.',
        'Part B — Data Independence & Examples [6M]:\n  • **Physical Data Independence:** Ability to modify the **Internal Schema** without changing the Conceptual Schema or applications (absorbed by **Conceptual/Internal Mapping**). *Real-World Example:* Building a new B+ Tree index on `Student(RegNo)` or migrating data files from HDD to NVMe SSD doubles query speed without touching tables or SQL reports.\n  • **Logical Data Independence:** Ability to modify the **Conceptual Schema** (adding/splitting columns or tables) without rewriting External Views or user programs (absorbed by **External/Conceptual Mapping**). *Real-World Example:* Adding `Emergency_Phone` to `EMPLOYEE` or splitting `ACCOUNT` into `SAVINGS` and `CURRENT` while updating the view definition leaves existing payroll/portal apps working unchanged.',
      ],
    },
  },
  {
    qNo: 'Q2',
    marks: 10,
    co: 'CO1',
    bl: 'BL3',
    moduleId: 'm1',
    topicId: 'm1-t6',
    topicTitle: 'Constraints & Handling Violations',
    patternOrigin: 'Nov 2026 FAT · Slot A2+TA2 · Q2 [3M + 7M = 10M, CO1, BL3]',
    primary: {
      label: 'Hospital Schema Integrity Constraints Need, Types & Rule Mapping (a–e)',
      promptIntro:
        'Discuss the need for integrity constraints in relational databases and describe their types. Given the Hospital schema below:',
      schemaOrData:
        'PATIENT(patient_id, patient_name, phone, age, gender)\nDOCTOR(doctor_id, doctor_name, specialization)\nAPPOINTMENT(appointment_id, patient_id, doctor_id, appointment_date, status)',
      subQuestions: [
        {
          part: 'A',
          marks: 3,
          text: 'Explain why integrity constraints are essential and list the five standard relational integrity constraint types.',
        },
        {
          part: 'B',
          marks: 7,
          text: 'Identify and justify the exact integrity constraint enforcing each rule: (a) Every patient must have a unique patient_id; (b) A patient’s phone number must not be duplicated; (c) Patient age must be between 1 and 120; (d) patient_name and doctor_name cannot be left empty; (e) An appointment can only reference an existing patient and doctor.',
        },
      ],
      solutionSteps: [
        'Part A — Need & 5 Types [3M]: Integrity constraints preserve accuracy, prevent duplicate records, block impossible domain values, and forbid orphan foreign-key references. The five core types are: **Domain**, **Key (`UNIQUE`/`PK`)**, **NULL (`NOT NULL`)**, **Entity Integrity**, and **Referential Integrity**.',
        'Part B — Rule-by-Rule Mapping & Justification [7M]:\n  • **(a) Unique `patient_id` -> Entity Integrity + Key Constraint (`PRIMARY KEY`):** Guarantees every patient tuple is uniquely identified (`Key`) AND prevents `patient_id` from ever being `NULL` (`Entity Integrity`).\n  • **(b) Non-duplicated `phone` -> Key Constraint (`UNIQUE`):** Enforces uniqueness on non-primary-key attribute `phone VARCHAR(15) UNIQUE` so no two patients register with the same phone.\n  • **(c) `age` between 1 and 120 -> Domain Constraint (`CHECK`):** Restricts the column’s allowed numeric range via `CHECK (age BETWEEN 1 AND 120)`.\n  • **(d) Non-empty `patient_name` & `doctor_name` -> NULL Constraint (`NOT NULL`):** Disallows unknown/missing `NULL` strings on mandatory name columns.\n  • **(e) Valid patient & doctor on `APPOINTMENT` -> Referential Integrity (`FOREIGN KEY`):** `APPOINTMENT.patient_id REFERENCES PATIENT(patient_id)` and `APPOINTMENT.doctor_id REFERENCES DOCTOR(doctor_id)` ensure no appointment references a non-existent patient or doctor.',
      ],
    },
  },
  {
    qNo: 'Q3',
    marks: 10,
    co: 'CO5',
    bl: 'BL3 / BL6',
    moduleId: 'm2',
    topicId: 'm2-t1',
    topicTitle: 'Entity Relationship Model & Weak Entities',
    patternOrigin: 'Nov 2026 FAT · Slot A2+TA2 · Q3 [10M, CO5, BL3/BL6]',
    primary: {
      label: 'Hotel Management System Complete ER/EER Diagram (Weak Entity BED + Specialization)',
      promptIntro:
        'Design a complete ER/EER diagram for a Hotel Management System satisfying all requirements below:',
      schemaOrData:
        '• GUEST(Guest_ID [PK], Name, Phone, Email); ROOM(Room_No [PK], Room_Type, Tariff); BOOKING(Booking_ID [PK], Booking_Date, Check_In_Date, Check_Out_Date); SERVICE(Service_ID [PK], Service_Name, Charge).\n• A Guest makes >=0 Bookings; each Booking belongs to exactly 1 Guest and reserves >=1 Room (Rooms have multiple Bookings over time).\n• Guests consume Services during a Booking (record Quantity and Service_Date).\n• Each Room contains >=1 Beds; each Bed is identified by Bed_No unique only within its Room, and each bed is classified as either Single or Double.',
      subQuestions: [
        {
          part: 'A',
          marks: 10,
          text: 'Draw the complete ER/EER diagram indicating strong/weak entities, keys, relationship attributes, cardinalities, total/partial participation lines, and EER specialization constraints.',
        },
      ],
      diagramId: 'm2-hotel-eer',
      diagramCaption: 'A2+TA2 Q3: Hotel Management ER/EER diagram with weak entity BED and (d) Total specialization.',
      solutionSteps: [
        '1. Strong & Weak Entities [2.5M]: Strong boxes `GUEST(Guest_ID*)`, `BOOKING(Booking_ID*)`, `ROOM(Room_No*)`, `SERVICE(Service_ID*)`; Double-lined **Weak Entity** `[[BED]]` with dashed partial key `Bed_No`.',
        '2. Relationships, Attributes & Cardinalities [3M]:\n  • `GUEST —(1:N)— MAKES == BOOKING` (Partial on `GUEST`, Total `==` on `BOOKING`).\n  • `BOOKING ==(M:N)— RESERVES — ROOM` (Total `==` on `BOOKING` since `>=1` room; Partial on `ROOM`).\n  • `BOOKING —(M:N)— USES_SERVICE — SERVICE` carrying relationship attributes `Quantity` and `Service_Date`.',
        '3. Weak Entity Identification [2.5M]: Connect `ROOM` and `[[BED]]` via double-diamond **`CONTAINS_BED`** (`1:N`) with **Total (`==`) participation on BOTH `ROOM` and `BED`**.',
        '4. EER Specialization on `BED` [2M]: Draw a **`(d)` Disjoint + Double-Line Total** circle below `BED` specializing into `SINGLE_BED` and `DOUBLE_BED`.',
      ],
    },
  },
  {
    qNo: 'Q4',
    marks: 10,
    co: 'CO2',
    bl: 'BL3',
    moduleId: 'm3',
    topicId: 'm3-t3',
    topicTitle: 'Single-Level, Multi-Level & B+ Tree Indexing',
    patternOrigin: 'Nov 2026 FAT · Slot A2+TA2 · Q4 [2M + 3M + 3M + 2M = 10M, CO2, BL3]',
    primary: {
      label: 'STUDENT Dense Multilevel Index Blocking Factor & Disk I/O Numerical',
      promptIntro:
        'A STUDENT file contains r = 16,000 fixed-length records of R = 80 bytes each stored unspanned in disk blocks of size B = 1,000 bytes. Assume a dense primary index with 4-byte search key and 6-byte block pointer.',
      subQuestions: [
        {
          part: 'a',
          marks: 2,
          text: 'Calculate the blocking factor (bfr) and total number of data blocks required for STUDENT.',
        },
        {
          part: 'b',
          marks: 3,
          text: 'Calculate the number of index blocks required for the 1st-level dense index and the 2nd-level sparse index.',
        },
        {
          part: 'c',
          marks: 3,
          text: 'Calculate the maximum number of block accesses required to locate a record using this multilevel index.',
        },
        {
          part: 'd',
          marks: 2,
          text: 'Draw a neat labeled diagram of the resulting multilevel index structure.',
        },
      ],
      diagramId: 'm3-multilevel-index',
      diagramCaption: 'A2+TA2 Q4: 2-block 2nd-level index -> 160-block 1st-level dense index -> 1,334 STUDENT blocks.',
      solutionSteps: [
        'Part (a) — Blocking Factor & Data Blocks [2M]:\n  • `bfr = floor(B / R) = floor(1,000 / 80) = 12` records/block (`40` bytes unused per block).\n  • Total data blocks `b = ceil(16,000 / 12) = ceil(1333.33) = 1,334` blocks.',
        'Part (b) — 1st-Level & 2nd-Level Index Blocks [3M]:\n  • Index entry size `Ri = 4 + 6 = 10` bytes -> Index blocking factor `bfr_i = floor(1,000 / 10) = 100` entries/block.\n  • **1st-Level Index (Dense):** Because the index is explicitly dense, `r1 = 16,000` entries -> `b1 = ceil(16,000 / 100) = 160` blocks.\n  • **2nd-Level Index (Sparse over Level 1):** 1 entry per 1st-level block -> `r2 = 160` entries -> `b2 = ceil(160 / 100) = 2` blocks.',
        'Part (c) — Maximum Block Accesses [3M]: Binary search on the 2-block 2nd-level index requires `ceil(log2(2)) = 1` read + `1` read in the 1st-level index + `1` data-block read = **3 disk block accesses** *(note: if scanning both top-level blocks sequentially or adding a 1-block 3rd-level root, worst case = `4` accesses)*.',
        'Part (d) — Structure Diagram [2M]: Show `2nd Level (2 blocks, 160 ptrs) -> 1st Level Dense Index (160 blocks, 16,000 ptrs) -> STUDENT File (1,334 blocks, 16,000 rows)`.',
      ],
    },
  },
  {
    qNo: 'Q5',
    marks: 10,
    co: 'CO3',
    bl: 'BL4',
    moduleId: 'm4',
    topicId: 'm4-t3',
    topicTitle: 'Conflict Serializability & Precedence Graphs (with m4-t1 ACID)',
    patternOrigin: 'Nov 2026 FAT · Slot A2+TA2 · Q5 [5M + 5M = 10M, CO3, BL4]',
    primary: {
      label: 'Online Banking ACID Transaction Handling & Schedules S1/S2 Precedence Graphs',
      promptIntro: 'Analyze both Transaction Processing and Conflict Serializability scenarios below:',
      schemaOrData:
        'S1: r1(X); r2(Z); r1(Z); r3(X); r3(Y); w1(X); c1; w3(Y); c3; r2(Y); w2(Z); w2(Y); c2\nS2: r1(X); w1(X); r2(X); w2(X); r2(Y); w2(Y); r3(Y); w3(Y); r3(Z); w3(Z); r1(Z); w1(Z)',
      subQuestions: [
        {
          part: 'a',
          marks: 5,
          text: 'An online banking system transfers funds between two accounts concurrently across customers and may face server crashes. Explain how the transaction processing system ensures reliable execution and discuss ACID properties with banking examples.',
        },
        {
          part: 'b',
          marks: 5,
          text: 'Determine whether each schedule S1 and S2 above is conflict serializable or not, justifying both answers with their Precedence Graphs and equivalent serial order (if any).',
        },
      ],
      diagramId: 'm4-precedence-a2q5b',
      diagramCaption: 'A2+TA2 Q5(b): Schedule S1 (Acyclic -> T3, T1, T2) vs. Schedule S2 (3-cycle -> Not Conflict Serializable).',
      solutionSteps: [
        'Part (a) — Banking Transaction Processing & ACID [5M]: Wrap `Debit(A)` and `Credit(B)` inside one atomic transaction managed by the Concurrency Control Manager (2PL/MVCC isolating concurrent users) and Recovery Manager (WAL `BFIM/AFIM` crash recovery).\n  • **Atomicity:** Power loss after `Debit(A)` triggers WAL `UNDO` so money never disappears.\n  • **Consistency:** Total `A + B` balance remains conserved before and after committed transfers.\n  • **Isolation:** Concurrent inquiries/transfers never see half-completed intermediate balances.\n  • **Durability:** Once `Commit` flushes to WAL, subsequent power failure never loses the transfer (`REDO`).',
        'Part (b) — Conflict Serializability Analysis [5M]:\n  • **Schedule S1:** On `X`: `r3(X) -> w1(X)` gives `T3 -> T1`. On `Y`: `r3(Y), w3(Y)` precede `r2(Y), w2(Y)` giving `T3 -> T2`. On `Z`: `r1(Z) -> w2(Z)` gives **`T1 -> T2`** (`r2(Z) -> r1(Z)` is RR, NOT a conflict!). Graph `{T3->T1, T3->T2, T1->T2}` is **ACYCLIC** -> **Conflict Serializable!** Equivalent serial order: **`T3 -> T1 -> T2`**.\n  • **Schedule S2:** On `X`: `T1 -> T2`. On `Y`: `T2 -> T3`. On `Z`: `T3 -> T1`. Graph contains 3-node cycle **`T1 -> T2 -> T3 -> T1`** -> **NOT Conflict Serializable**.',
      ],
    },
  },
  {
    qNo: 'Q6',
    marks: 10,
    co: 'CO3',
    bl: 'BL4',
    moduleId: 'm4',
    topicId: 'm4-t4',
    topicTitle: 'Two-Phase Locking (2PL) & Deadlock Handling',
    patternOrigin: 'Nov 2026 FAT · Slot A2+TA2 · Q6 [10M, CO3, BL4]',
    primary: {
      label: 'Strict 2PL 9-Step Execution Trace, Wait-For Graph Cycle & Deadlock Resolution',
      promptIntro:
        'Three transactions T1, T2, and T3 execute under Strict 2PL (locks held until Commit) in the sequence below:',
      schemaOrData:
        '1: T1: S(A)    2: T1: R(A)\n3: T2: X(B)    4: T2: W(B)\n5: T3: S(C)    6: T3: R(C)\n7: T1: X(C)    8: T2: X(A)    9: T3: X(B)',
      subQuestions: [
        {
          part: 'A',
          marks: 4,
          text: 'Trace steps 1–9 showing which lock requests are Granted vs. Blocked and which transaction holds each conflicting lock.',
        },
        {
          part: 'B',
          marks: 3,
          text: 'Construct the Wait-For Graph (WFG) and prove whether a deadlock exists.',
        },
        {
          part: 'C',
          marks: 3,
          text: 'Explain how this deadlock can be resolved using an appropriate deadlock-handling technique.',
        },
      ],
      diagramId: 'm4-wfg-a2q6',
      diagramCaption: 'A2+TA2 Q6: Wait-For Graph directed cycle T1 -> T3 -> T2 -> T1.',
      solutionSteps: [
        'Part A — Step-by-Step Grant/Block Trace [4M]:\n  • Steps 1–6: `T1` granted `S(A)` and reads `A`; `T2` granted `X(B)` and writes `B`; `T3` granted `S(C)` and reads `C` (Strict 2PL keeps all locks until commit).\n  • Step 7 (`T1: X(C)`): **BLOCKED** waiting on `T3` (holds `S(C)`) -> edge **`T1 -> T3`**.\n  • Step 8 (`T2: X(A)`): **BLOCKED** waiting on `T1` (holds `S(A)`) -> edge **`T2 -> T1`**.\n  • Step 9 (`T3: X(B)`): **BLOCKED** waiting on `T2` (holds `X(B)`) -> edge **`T3 -> T2`**.',
        'Part B — Wait-For Graph & Deadlock Proof [3M]: Nodes `{T1, T2, T3}`, Edges `T1 -> T3 -> T2 -> T1`. The directed 3-cycle proves **Deadlock EXISTS**.',
        'Part C — Deadlock Resolution [3M]:\n  • **Victim Selection & Rollback:** Select lowest-cost victim (`T3` performed zero writes vs `T2` already modified `B`). Abort `T3`, releasing `S(C)` and clearing `T1 -> T3` & `T3 -> T2`. Now `T1` acquires `X(C)` and commits (releasing `A, C`); `T2` acquires `X(A)` and commits; then `T3` restarts cleanly.\n  • Also note **Wait-Die** or **Wound-Wait** timestamp prevention could prevent the cycle upfront.',
      ],
    },
  },
  {
    qNo: 'Q7',
    marks: 10,
    co: 'CO4',
    bl: 'BL4',
    moduleId: 'm5',
    topicId: 'm5-t4',
    topicTitle: 'CAP Theorem & ACID vs BASE',
    patternOrigin: 'Nov 2026 FAT · Slot A2+TA2 · Q7 [3M + 3.5M + 3.5M = 10M, CO4, BL4]',
    primary: {
      label: 'Distributed Banking Partition (DB1/DB2): CAP Trade-Off Analysis (AP Divergence vs. CP Halt)',
      promptIntro:
        'A distributed banking application stores a customer’s ₹50,000 balance replicated across two nodes, DB1 and DB2. A network partition isolates DB1 and DB2 while DB1 processes a ₹10,000 withdrawal and DB2 concurrently processes a ₹15,000 withdrawal.',
      subQuestions: [
        {
          part: 'A',
          marks: 3,
          text: 'Discuss the three fundamental properties of Brewer’s CAP Theorem.',
        },
        {
          part: 'B',
          marks: 3.5,
          text: 'Analyze Option (i): Allow both DB1 and DB2 to continue processing withdrawals independently — identify which CAP properties hold/fail and compute the resulting balance discrepancy.',
        },
        {
          part: 'C',
          marks: 3.5,
          text: 'Analyze Option (ii): Halt disconnected nodes until network communication restores — identify which CAP property is traded off and justify why banks prefer this.',
        },
      ],
      diagramId: 'm5-cap-triangle',
      diagramCaption: 'A2+TA2 Q7: Network partition forces AP (state divergence) vs. CP (safe halt).',
      solutionSteps: [
        'Part A — Three CAP Properties [3M]: Define **Consistency (C)** (every read reflects latest committed write across nodes), **Availability (A)** (every non-failing node serves responses), and **Partition Tolerance (P)** (survives dropped inter-node messages). During a partition, P is occurring so a system must pick AP or CP.',
        'Part B — Option (i) Continue Independently -> **AP (Sacrifices Consistency C)** [3.5M]: Both DB1 and DB2 stay available, yielding divergent inconsistent ledgers:\n  • True serial balance should be `50,000 - 10,000 - 15,000 = ₹25,000`.\n  • Instead, DB1 independently computes `50,000 - 10,000 = ₹40,000` while DB2 computes `50,000 - 15,000 = ₹35,000` (**state divergence / lost update**).\n  • Worse, if starting balance were ₹20,000, both would succeed totaling ₹25,000 (**illegal overdraft / double spending**).',
        'Part C — Option (ii) Stop Until Link Restores -> **CP (Sacrifices Availability A)** [3.5M]: Disconnected/minority nodes refuse withdrawals (`Service Unavailable`) until DB1 and DB2 reconnect and synchronize. Availability is temporarily traded off to guarantee strict monetary **Consistency (C)** — mandatory for banking.',
      ],
    },
  },
  {
    qNo: 'Q8',
    marks: 10,
    co: 'CO4',
    bl: 'BL2 / BL3',
    moduleId: 'm5',
    topicId: 'm5-t6',
    topicTitle: 'Four Types of NoSQL Databases',
    patternOrigin: 'Nov 2026 FAT · Slot A2+TA2 · Q8 [2M + 6M + 2M = 10M, CO4, BL2/BL3]',
    primary: {
      label: 'Recipe-Sharing Platform NoSQL Selection, Sample JSON/BSON Document & Advantages',
      promptIntro:
        'A recipe-sharing platform stores varying fields across recipes (ingredients, cooking steps, nutrition facts, images, and optional notes) and supports fast filtering by ingredients, cuisine, and cooking time.',
      subQuestions: [
        {
          part: 'a',
          marks: 2,
          text: 'Identify and justify the most suitable NoSQL database family for this application.',
        },
        {
          part: 'b',
          marks: 6,
          text: 'Explain how all listed fields are modeled and write a complete sample JSON/BSON recipe document.',
        },
        {
          part: 'c',
          marks: 2,
          text: 'State two concrete architectural advantages of using this NoSQL model over a normalized relational schema here.',
        },
      ],
      solutionSteps: [
        'Part (a) — Select Document-Oriented NoSQL (e.g., MongoDB) [2M]: Varying/optional recipe fields map naturally to schema-free JSON/BSON documents, while filtering by `ingredients`, `cuisine`, and `cookingTimeMins` requires rich field-level querying and **secondary/multikey indexes** (missing in simple Key-Value stores).',
        'Part (b) — Modeling & Sample JSON/BSON Document [6M]: Map `_id` (PK), scalar fields (`title, cuisine, cookingTimeMins`), nested object (`nutrition`), ordered array (`steps`), array of sub-documents (`ingredients` for Multikey indexing), and optional fields (`notes`).\n```json\n{\n  "_id": "REC_1042",\n  "title": "Masala Dosa",\n  "cuisine": "South Indian",\n  "cookingTimeMins": 35,\n  "ingredients": [\n    { "name": "Rice Batter", "qty": "2 cups" },\n    { "name": "Potato", "qty": "3 medium" }\n  ],\n  "steps": ["Boil and mash potatoes", "Spread batter on tawa", "Fold with masala"],\n  "nutrition": { "calories": 320, "proteinG": 8, "carbsG": 52 },\n  "images": ["https://cdn.recipes/dosa-1.jpg"],\n  "notes": "Serve hot with coconut chutney"\n}\n```',
        'Part (c) — Two Concrete Advantages [2M]:\n  1. **Schema Evolution Agility:** Optional attributes (allergens, video links) can be added to new recipes without `ALTER TABLE` locks or sparse `NULL` columns.\n  2. **Single-Read Aggregate Locality + Multikey Indexing:** Fetching an entire recipe requires one single document read (zero SQL multi-table JOINs across `RECIPE`, `INGREDIENT`, `STEP`), while Multikey indexes on `ingredients.name` keep ingredient lookups fast.',
      ],
    },
  },
  {
    qNo: 'Q9 (a OR b)',
    marks: 10,
    co: 'CO5',
    bl: 'BL3',
    moduleId: 'm2',
    topicId: 'm2-t5',
    topicTitle: 'Normalization: 1NF, 2NF, 3NF & BCNF',
    orTopicId: 'm2-t2',
    orTopicTitle: 'Extended ER (EER) Modeling',
    patternOrigin: 'Nov 2026 FAT · Slot A2+TA2 · Q9(a OR b) [10M, CO5, BL3]',
    primary: {
      label: '(a) PROJECT_EVALUATION Stage-by-Stage Normalization (1NF -> 2NF -> 3NF -> BCNF)',
      promptIntro:
        'Consider the unnormalized/1NF relation PROJECT_EVALUATION (where a student can work on multiple projects, and each project has one guide):',
      schemaOrData:
        'PROJECT_EVALUATION(Student_ID, Project_ID, Title, Guide_ID, Guide_Name, Department, Evaluation_Date, Marks)\n\nFDs:\n• Student_ID, Project_ID -> Evaluation_Date, Marks\n• Project_ID -> Title, Guide_ID\n• Guide_ID -> Guide_Name, Department',
      subQuestions: [
        {
          part: 'A',
          marks: 3,
          text: 'Identify Candidate Key(s) and determine the initial Normal Form of PROJECT_EVALUATION.',
        },
        {
          part: 'B',
          marks: 4,
          text: 'Normalize step-by-step up to 3NF, clearly indicating tables, primary keys, and foreign keys at 2NF and 3NF.',
        },
        {
          part: 'C',
          marks: 3,
          text: 'Check and justify whether all final 3NF tables satisfy BCNF.',
        },
      ],
      solutionSteps: [
        'Part A — Candidate Key & Initial NF [3M]: `Student_ID` and `Project_ID` never appear on any RHS. Closure `{Student_ID, Project_ID}+` reaches `Evaluation_Date, Marks, Title, Guide_ID, Guide_Name, Department` = all 8 attributes! Unique Candidate Key = **`(Student_ID, Project_ID)`**. Because `Project_ID -> Title, Guide_ID` is a **Partial Dependency**, the initial table is only in **`1NF`**.',
        'Part B — Normalize 1NF -> 2NF -> 3NF [4M]:\n  • **2NF (Remove Partial Dependency `Project_ID -> Title, Guide_ID, Guide_Name, Department`):**\n    1. `EVALUATION(Student_ID [PK], Project_ID [PK, FK -> PROJECT], Evaluation_Date, Marks)`\n    2. `PROJECT_GUIDE(Project_ID [PK], Title, Guide_ID, Guide_Name, Department)`\n  • **3NF (Remove Transitive Dependency `Project_ID -> Guide_ID -> Guide_Name, Department`):**\n    1. `EVALUATION(Student_ID [PK], Project_ID [PK, FK -> PROJECT], Evaluation_Date, Marks)`\n    2. `PROJECT(Project_ID [PK], Title, Guide_ID [FK -> GUIDE])`\n    3. `GUIDE(Guide_ID [PK], Guide_Name, Department)`',
        'Part C — BCNF Justification [3M]: Active non-trivial FDs are `(Student_ID, Project_ID) -> Evaluation_Date, Marks` in `EVALUATION`, `Project_ID -> Title, Guide_ID` in `PROJECT`, and `Guide_ID -> Guide_Name, Department` in `GUIDE`. Because EVERY determinant LHS is the Superkey (PK) of its relation, **ALL 3 relations satisfy BCNF!**',
      ],
    },
    orOption: {
      label: '(b) Online Shopping Shared Subclass EER Lattice (BUYER_SELLER)',
      promptIntro:
        'Model an Online Shopping System capturing the EER hierarchy and multiple inheritance rules below:',
      schemaOrData:
        '• USERS(User_ID [PK], Name, Email). A user may be a CUSTOMER(Customer_ID), a SELLER(Seller_ID), or both (participation NOT mandatory).\n• Every SELLER is classified strictly as EITHER INDIVIDUAL_SELLER OR BUSINESS_SELLER.\n• A BUSINESS_SELLER who also acts as a CUSTOMER is modeled as BUYER_SELLER(Buyer_Seller_ID, Business_Name).\n• Every BUYER_SELLER is strictly classified as EITHER PREMIUM_BUYER_SELLER OR REGULAR_BUYER_SELLER.',
      subQuestions: [
        {
          part: 'A',
          marks: 3,
          text: 'Explicitly identify the Shared Subclass and its immediate Superclasses (Lattice) in the scenario.',
        },
        {
          part: 'B',
          marks: 7,
          text: 'Draw the complete EER diagram clearly showing all entity types, keys, disjointness (d/o), and completeness (total/partial) constraints.',
        },
      ],
      diagramId: 'm2-shopping-lattice',
      diagramCaption: 'A2+TA2 Q9(b): Shared subclass BUYER_SELLER inheriting from CUSTOMER and BUSINESS_SELLER.',
      solutionSteps: [
        'Part A — Shared Subclass & Superclasses [3M]: **Shared Subclass = `BUYER_SELLER`**, inheriting via **multiple inheritance (EER Lattice)** from two immediate superclasses: **`CUSTOMER`** and **`BUSINESS_SELLER`**.',
        'Part B — Layered EER Diagram [7M]:\n  1. **Level 1 (`USERS`):** Single-line Partial + **`(o)` Overlapping** circle to `CUSTOMER` and `SELLER` ("may be customer, seller, or both; not mandatory").\n  2. **Level 2 (`SELLER`):** Double-line **Total** + **`(d)` Disjoint** circle to `INDIVIDUAL_SELLER` and `BUSINESS_SELLER` ("every SELLER is either...").\n  3. **Level 3 (`BUYER_SELLER`):** Connect subset lines upward from `BUYER_SELLER` to BOTH `CUSTOMER` and `BUSINESS_SELLER`.\n  4. **Level 4 (`BUYER_SELLER`):** Double-line **Total** + **`(d)` Disjoint** circle to `PREMIUM_BUYER_SELLER` and `REGULAR_BUYER_SELLER`.',
      ],
    },
  },
  {
    qNo: 'Q10 (a OR b)',
    marks: 10,
    co: 'CO2',
    bl: 'BL3 / BL6',
    moduleId: 'm3',
    topicId: 'm3-t3',
    topicTitle: 'Single-Level, Multi-Level & B+ Tree Indexing',
    orTopicId: 'm3-t6',
    orTopicTitle: 'Query Optimization & Heuristic Query Trees',
    patternOrigin: 'Nov 2026 FAT · Slot A2+TA2 · Q10(a OR b) [10M, CO2, BL3/BL6]',
    primary: {
      label: '(a) B+ Tree (Order m = 3) Interleaved Insertions & Deletions',
      promptIntro:
        'Consider a B+ tree of order m = 3 (maximum 2 keys and 3 child pointers per node; min 1 key per non-root node). Starting from an empty tree, execute all 10 operations in exact order:',
      schemaOrData:
        'Insert 10, Insert 20, Insert 5, Insert 15, Insert 25, Delete 10, Insert 30, Insert 35, Insert 40, Delete 20',
      subQuestions: [
        {
          part: 'A',
          marks: 10,
          text: 'Show the B+ tree structure at every insertion/deletion that causes a split, borrow, leaf merge, or internal height collapse, and state the final B+ tree.',
        },
      ],
      diagramId: 'm3-bplus-a2q10a',
      diagramCaption: 'A2+TA2 Q10(a): Height-shrink milestone after Delete 10 and final Height-3 tree after Delete 20.',
      solutionSteps: [
        '1. **After Inserts `10, 20, 5, 15, 25` [3M]:** Splits at `5`, `15`, and `25` push `15` up -> Root `[15]` -> L:`[10]` (`[5], [10]`) & R:`[20]` (`[15], [20, 25]`) *(Height = 3)*.',
        '2. **Delete 10 (Leaf Merge + Root Collapse, Height 3 -> 2) [2.5M]:** `[10]` empties -> merges with left `[5]` -> `[5]`, emptying internal node `[10]`. Merge empty internal with `[20]` pulling root `15` down -> new **Root `[15, 20]`** directly over leaves `[5] -> [15] -> [20, 25]`.',
        '3. **Insert `30, 35, 40` (Back to Height 3) [2.5M]:** `30` splits `[20, 25, 30]` copying `25` up -> Root `[15, 20, 25]` splits pushing `20` up -> Root `[20]` -> `[15] ([5],[15])` & `[25] ([20],[25,30])`. `35` expands right internal to `[25, 30]`. `40` splits `[30, 35, 40]` & pushes `30` up -> Root `[20, 30]` -> `[15]`, `[25]`, `[35]` with leaves `[5], [15], [20], [25], [30], [35, 40]`.',
        '4. **Delete 20 (Leaf Merge + Internal Merge) [2M]:** `[20]` empties -> merges with `[25]` -> `[25]`, emptying middle internal `[25]`. Empty internal merges with left `[15]` pulling root `20` down -> `[15, 20]` over `[5], [15], [25]`. **Final Tree:** Root `[30]` -> L:`[15, 20]` (`[5], [15], [25]`) & R:`[35]` (`[30], [35, 40]`).',
      ],
    },
    orOption: {
      label: '(b) Online Shopping 3-Table SQL Query Tree & Heuristic Optimization',
      promptIntro: 'Consider the Online Shopping relational schema and SQL query below:',
      schemaOrData:
        'CUSTOMER(Cust_ID, Name, City)\nORDERS(Order_ID, Cust_ID, Product_ID, Amount)\nPRODUCT(Product_ID, Product_Name, Category, Price)\n\nSELECT C.Name, P.Product_Name\nFROM CUSTOMER C, ORDERS O, PRODUCT P\nWHERE C.Cust_ID = O.Cust_ID\n  AND O.Product_ID = P.Product_ID\n  AND C.City = \'Chennai\';',
      subQuestions: [
        {
          part: 'A',
          marks: 2,
          text: 'Draw the initial unoptimized Canonical Query Tree.',
        },
        {
          part: 'B',
          marks: 6,
          text: 'Demonstrate step-by-step heuristic optimization (push σ down, convert × + σ to ⋈, push π down retaining join keys).',
        },
        {
          part: 'C',
          marks: 2,
          text: 'Write the Final Optimized Relational Algebra expression.',
        },
      ],
      diagramId: 'm3-query-tree-a2q10b',
      diagramCaption: 'A2+TA2 Q10(b): Final Optimized Query Tree pushing σ_{City=\'Chennai\'} and projections π down.',
      solutionSteps: [
        'Part A — Canonical Tree [2M]: Leaves `CUSTOMER`, `ORDERS`, `PRODUCT` joined via `×` nodes -> compound `σ` with all 3 predicates -> root `π_{C.Name, P.Product_Name}`.',
        'Part B — Heuristic Optimization Steps [6M]:\n  1. Break conjunctions (`σ`) and push `σ_{C.City=\'Chennai\'}` directly down onto `CUSTOMER` (most restrictive table first!).\n  2. Convert `× + join conditions` into Equi-Joins: `(σ_{City=\'Chennai\'}(C) ⋈_{C.Cust_ID=O.Cust_ID} O) ⋈_{O.Product_ID=P.Product_ID} P`.\n  3. Push Projections (`π`) down retaining join keys: `π_{Cust_ID, Name}(σ(C))`, `π_{Cust_ID, Product_ID}(O)` (drops `Order_ID, Amount`), `π_{C.Name, O.Product_ID}(C ⋈ O)` (drops `Cust_ID` once joined!), and `π_{Product_ID, Product_Name}(P)`.',
        'Part C — Final Optimized RA Expression [2M]: `π_{C.Name, P.Product_Name}( ( π_{C.Name, O.Product_ID}( (π_{Cust_ID, Name}(σ_{City=\'Chennai\'}(C))) ⋈_{C.Cust_ID=O.Cust_ID} (π_{Cust_ID, Product_ID}(O)) ) ) ⋈_{O.Product_ID=P.Product_ID} (π_{Product_ID, Product_Name}(P)) )`',
      ],
    },
  },
];


