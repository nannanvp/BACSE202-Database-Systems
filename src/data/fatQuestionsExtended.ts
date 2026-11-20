import type { FatQuestion } from './bacse202Data';

/**
 * 90 additional BACSE202 FAT MCQ & Part B Analytical Questions
 * Strictly traceable to VIT BACSE202 Syllabus (78th Academic Council, 12.06.2025)
 * and Elmasri & Navathe, Fundamentals of Database Systems (7th Ed.).
 *
 * Distribution:
 *   Module 1 (7h):  16 questions (13 Part A + 3 Part B) — m1_q4 .. m1_q19
 *   Module 2 (10h): 22 questions (18 Part A + 4 Part B) — m2_q5 .. m2_q26
 *   Module 3 (9h):  17 questions (14 Part A + 3 Part B) — m3_q6 .. m3_q22
 *   Module 4 (10h): 20 questions (16 Part A + 4 Part B) — m4_q5 .. m4_q24
 *   Module 5 (7h):  15 questions (12 Part A + 3 Part B) — m5_q5 .. m5_q19
 *   Total: 90 new questions (73 Part A + 17 Part B, 25+ numerical/trace items)
 */
export const EXTENDED_FAT_QUESTIONS: FatQuestion[] = [
  // ==========================================================================
  // MODULE 1: Database Systems and Data Models (16 new questions: m1_q4..m1_q19)
  // ==========================================================================
  {
    id: 'm1_q4',
    moduleId: 'm1',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Which foundational characteristic of the database approach enables a single general-purpose DBMS software package to work with completely different databases (e.g., university, banking, airline) without recompiling the engine?',
    options: [
      'Self-describing nature via a System Catalog (metadata repository)',
      'Hard-coding record field offsets directly inside application programs',
      'Eliminating external user views in favor of a single flat file',
      'Restricting all transactions to single-user sequential execution',
    ],
    correctIndex: 0,
    explanation:
      'Under Elmasri & Navathe (Ch. 1), the self-describing nature of a database system means the DBMS stores a complete definition of database structure and constraints inside the System Catalog (meta-data). Because the DBMS software consults this catalog at runtime instead of relying on hard-coded file layouts, the same engine can manage diverse schemas. Traditional file-processing systems embed file structures in application code, causing tight coupling.',
  },
  {
    id: 'm1_q5',
    moduleId: 'm1',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'A bank teller runs pre-tested, canned transactions (check balance, deposit cash, print mini-statement) hundreds of times a day using a fixed menu interface. How does Elmasri & Navathe classify this actor on the scene?',
    options: [
      'Casual end user',
      'Naive (parametric) end user',
      'Sophisticated end user',
      'Database designer',
    ],
    correctIndex: 1,
    explanation:
      'Elmasri & Navathe (Ch. 1, Actors on the Scene) classify bank tellers, reservation agents, and shipping clerks as naive (parametric) end users because their primary job revolves around repeatedly executing standard, pre-programmed canned transactions. Casual end users occasionally query ad-hoc information (e.g., middle managers), while sophisticated end users (engineers, scientists, analysts) implement complex custom requests directly against DBMS facilities.',
  },
  {
    id: 'm1_q6',
    moduleId: 'm1',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Which pair correctly distinguishes a Database Schema from a Database State (Instance) in Elmasri & Navathe terminology?',
    options: [
      'Schema is the current snapshot of rows (extension); State is the structural description (intension)',
      'Schema is the structural description (intension) that changes rarely; State is the actual data at a point in time (extension) that changes frequently',
      'Schema exists only at the internal level; State exists only at the external level',
      'Schema is created by DML statements; State is created exclusively by DDL statements',
    ],
    correctIndex: 1,
    explanation:
      'A database schema (also called the intension) specifies the database structure, data types, and constraints via DDL and changes infrequently. A database state or snapshot (the extension) is the actual collection of tuples stored at a particular instant, changing on every INSERT, UPDATE, or DELETE. A state is termed a valid state when it satisfies every schema structure and integrity constraint.',
  },
  {
    id: 'm1_q7',
    moduleId: 'm1',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Adding a new attribute Email to the conceptual EMPLOYEE table or expanding the conceptual schema with a new PROJECT table without requiring existing user views or application programs to be rewritten demonstrates which property?',
    options: [
      'Physical data independence',
      'Logical data independence',
      'Program-operation dependence',
      'Referential transparency',
    ],
    correctIndex: 1,
    explanation:
      'In the Three-Schema Architecture (Ch. 2), logical data independence is the capacity to change the conceptual schema without altering external views or application programs—only the external/conceptual mapping needs adjustment. Physical data independence insulates the conceptual schema from changes at the internal storage level (e.g., adding indexes or reorganizing files). Logical data independence is generally harder to achieve because applications rely heavily on conceptual semantics.',
  },
  {
    id: 'm1_q8',
    moduleId: 'm1',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Inside the DBMS Component Architecture (Database System Environment), which module receives parsed high-level queries, consults catalog statistics, rearranges operations, and selects an efficient execution plan?',
    options: [
      'DDL Compiler',
      'Query Optimizer',
      'Stored Data Manager',
      'Concurrency Control Scheduler',
    ],
    correctIndex: 1,
    explanation:
      'In Elmasri & Navathe (Ch. 2, DBMS Component Modules), the Query Compiler parses and validates interactive queries, then hands the internal query representation to the Query Optimizer. The Query Optimizer uses system catalog statistics to rearrange relational operations, eliminate redundant work, and choose low-cost access algorithms before generating executable code for the Runtime Database Processor. The DDL Compiler processes schema definitions into the catalog, while the Stored Data Manager handles OS disk I/O.',
  },
  {
    id: 'm1_q9',
    moduleId: 'm1',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'In the DBMS classification taxonomy, what distinguishes a "homogeneous distributed DBMS" from a "federated (multidatabase) system"?',
    options: [
      'Homogeneous systems allow only one user at a time; federated systems allow multiple users',
      'Homogeneous systems run the same DBMS software at all sites under unified control; federated systems loosely couple autonomous, often heterogeneous local DBMSs',
      'Homogeneous systems store only unstructured text; federated systems store only relational tables',
      'Homogeneous systems forbid data replication; federated systems require full replication at every node',
    ],
    correctIndex: 1,
    explanation:
      'DBMS classification by distribution separates centralized systems from distributed systems, which further divide into homogeneous (identical DBMS software across all sites with a unified global schema) and heterogeneous/federated systems. In a federated (multidatabase) DBMS, participating sites retain local autonomy and may run different DBMS engines or data models while exposing selected views to global users.',
  },
  {
    id: 'm1_q10',
    moduleId: 'm1',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'An IoT power-grid platform ingests 500,000 voltage readings per second tagged with timestamps and runs rolling 15-minute window averages and downsampling queries. Which database paradigm is purpose-built for this workload?',
    options: [
      'Graph database',
      'Time-series database',
      'Relational OLTP database with normalized junction tables',
      'Unstructured BLOB object store',
    ],
    correctIndex: 1,
    explanation:
      'Time-series databases (e.g., InfluxDB, TimescaleDB) are engineered specifically for high-throughput append-only timestamped measurements, time-partitioned storage, delta-of-delta compression, and native time-window aggregations/retention policies. Graph databases optimize multi-hop relationship traversals, while standard relational tables incur heavier B-tree write amplification and lack native downsampling primitives.',
  },
  {
    id: 'm1_q11',
    moduleId: 'm1',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'A fraud-detection service must traverse 4-hop money-laundering chains across accounts, merchants, shared devices, and IP addresses in milliseconds. Which data model avoids expensive recursive SQL self-joins by storing edges directly as first-class adjacency pointers?',
    options: [
      'Semi-structured JSON document database',
      'Graph database',
      'Vector database',
      'Static flat-file database',
    ],
    correctIndex: 1,
    explanation:
      'Graph databases (such as Neo4j) represent entities as nodes and relationships as typed, directed edges with index-free adjacency. Traversing k-hop neighborhoods visits only connected edges rather than scanning global join indexes across millions of rows, dramatically outperforming multi-way relational self-joins on deeply connected data.',
  },
  {
    id: 'm1_q12',
    moduleId: 'm1',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'A relation STUDENT(RegNo, Name, Dept, CGPA, AdvisorId) currently contains 120 tuples. What are the Degree (arity) and Cardinality of this relation state, and does tuple order matter mathematically?',
    codeOrSchema: 'STUDENT(RegNo, Name, Dept, CGPA, AdvisorId)  —  120 rows stored',
    options: [
      'Degree = 120, Cardinality = 5; tuple ordering is strictly significant',
      'Degree = 5, Cardinality = 120; tuple ordering is mathematically irrelevant because a relation is a set of tuples',
      'Degree = 5, Cardinality = 120; tuples must remain physically sorted by RegNo',
      'Degree = 4, Cardinality = 120; NULL attributes are excluded from the degree',
    ],
    correctIndex: 1,
    explanation:
      'In the formal Relational Model (Elmasri & Navathe Ch. 5), the degree (arity) of a relation schema is its number of attributes (5), while the cardinality of a relation state is its number of tuples (120). Because a relation state r(R) is mathematically defined as a set of n-tuples, duplicate tuples are forbidden and the ordering of tuples carries no logical meaning.',
  },
  {
    id: 'm1_q13',
    moduleId: 'm1',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Which of the following is NOT one of the three standard semantic interpretations of a NULL attribute value defined in Elmasri & Navathe (Ch. 5)?',
    options: [
      'Value unknown (exists in reality, but not currently known)',
      'Value exists but is unavailable or withheld (e.g., unlisted phone number)',
      'Attribute not applicable to this tuple (e.g., MaidenName for a male employee)',
      'Zero or empty string sentinel representing a valid default measurement',
    ],
    correctIndex: 3,
    explanation:
      'Elmasri & Navathe explicitly warn against confusing NULL with numeric zero (0) or an empty string (""), which are concrete domain values. The three legitimate interpretations of NULL in relational theory are: (1) Value unknown, (2) Value exists but is not available/withheld, and (3) Attribute is not applicable (undefined) for that specific tuple.',
  },
  {
    id: 'm1_q14',
    moduleId: 'm1',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Numerical: Consider a relation R(A, B, C, D, E) with 5 attributes whose ONLY candidate key is the single attribute {A}. How many distinct superkeys does R possess?',
    codeOrSchema: 'R(A, B, C, D, E)   |   Only Candidate Key = { A }',
    options: ['5', '15', '16', '31'],
    correctIndex: 2,
    explanation:
      'By definition, a superkey of R is any attribute subset that contains at least one candidate key. Since {A} is the sole candidate key, every superkey must include A combined with any subset of the remaining 4 attributes {B, C, D, E}. There are 2^(5−1) = 2^4 = 16 such subsets (including {A} itself and all 5 attributes {A,B,C,D,E}). Choosing 15 forgets {A} itself, while 31 counts all non-empty subsets of R.',
  },
  {
    id: 'm1_q15',
    moduleId: 'm1',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'In a relational schema where EMPLOYEE(EmpId, Name, DeptNo) has primary key EmpId and foreign key DeptNo referencing DEPARTMENT(Dno), which statement about NULL values is TRUE under standard Entity and Referential Integrity rules?',
    options: [
      'DeptNo cannot be NULL because it is a foreign key',
      'DeptNo may be NULL (unless constrained NOT NULL), whereas EmpId (or any part of a composite PK) can NEVER be NULL',
      'EmpId may be NULL for at most one tuple in EMPLOYEE',
      'Referential integrity forbids inserting an EMPLOYEE whose DeptNo is NULL even if the employee is unassigned',
    ],
    correctIndex: 1,
    explanation:
      'Entity Integrity (Elmasri & Navathe Ch. 5) mandates that no primary key value—and no component attribute of a composite primary key—can be NULL, because PK values uniquely identify individual tuples. Referential Integrity states that every foreign key value in a referencing tuple must EITHER match an existing primary key value in the referenced relation OR be wholly NULL (unless an explicit NOT NULL constraint is declared).',
  },
  {
    id: 'm1_q16',
    moduleId: 'm1',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'If DEPARTMENT(Dno = 5) is deleted and the foreign key EMPLOYEE.DeptNo was declared with ON DELETE SET NULL, what happens to employees currently assigned to department 5?',
    options: [
      'The DELETE on DEPARTMENT is rejected immediately',
      'All employees in department 5 are also deleted from EMPLOYEE',
      'Department 5 is deleted, and DeptNo is updated to NULL for every employee who belonged to department 5 (assuming DeptNo allows NULL)',
      'Department 5 is archived and DeptNo remains 5 as a dangling reference',
    ],
    correctIndex: 2,
    explanation:
      'When handling referential integrity violations on DELETE, SQL/Elmasri provides four corrective actions: RESTRICT/NO ACTION rejects the deletion; CASCADE deletes all referencing child tuples; SET NULL deletes the parent tuple and sets matching child foreign keys to NULL (valid only if the FK column is nullable); and SET DEFAULT assigns a predefined valid default parent key.',
  },
  {
    id: 'm1_q17',
    moduleId: 'm1',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt:
      'Part B Analytical: An enterprise migrates its Student Portal database in two independent phases: (Phase 1) DBAs replace a heap file on ENROLLMENT with a clustered B+ tree index and compress disk blocks; (Phase 2) Architects split STUDENT.Address into Street, City, and PinCode columns while updating view mappings so legacy transcript reports continue running unchanged. Which combination of Three-Schema levels and data independence properties correctly explains BOTH phases?',
    codeOrSchema:
      'Phase 1: Internal storage change (Heap -> Clustered B+ Tree + Compression)\nPhase 2: Conceptual schema split (Address -> Street, City, PinCode) with External View mapping preserved',
    options: [
      'Phase 1 exercises Logical Data Independence (External/Conceptual mapping); Phase 2 exercises Physical Data Independence (Conceptual/Internal mapping)',
      'Phase 1 exercises Physical Data Independence (isolating Conceptual from Internal changes); Phase 2 exercises Logical Data Independence (isolating External views from Conceptual changes)',
      'Both phases exercise Physical Data Independence because both alter disk storage layouts',
      'Neither phase achieves data independence because all three ANSI/SPARC schemas must always be rewritten together',
    ],
    correctIndex: 1,
    explanation:
      'Step 1 (Three-Schema Levels): The ANSI/SPARC architecture defines three layers—Internal (physical files, indexes, compression), Conceptual (logical tables, data types, relationships, constraints), and External (tailored user views).\nStep 2 (Phase 1 Analysis): Switching ENROLLMENT from a heap file to a B+ tree with block compression modifies ONLY the Internal Schema. Because the Conceptual Schema and queries stay untouched (only the Conceptual/Internal mapping updates), this is Physical Data Independence.\nStep 3 (Phase 2 Analysis): Splitting Address into Street, City, and PinCode modifies the Conceptual Schema. Because the External/Conceptual view mapping concatenates those columns back into Address for legacy transcript reports without rewriting application code, this is Logical Data Independence.',
  },
  {
    id: 'm1_q18',
    moduleId: 'm1',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt:
      'Part B Analytical: Given DEPARTMENT(Dno PK, Dname UNIQUE) = {(1, "CSE"), (2, "ECE")} and EMPLOYEE(Eid PK, Name, Salary > 0, Dno FK -> DEPARTMENT) = {(101, "Asha", 50000, 1), (102, "Ravi", 45000, 2)}, trace the EXACT constraint violated by each of the 4 operations below:\n(i) INSERT (NULL, "Neha", 40000, 1) into EMPLOYEE\n(ii) INSERT (103, "Kiran", -5000, 1) into EMPLOYEE\n(iii) INSERT (104, "Dev", 42000, 9) into EMPLOYEE\n(iv) DELETE Dno = 1 from DEPARTMENT (under default RESTRICT)',
    codeOrSchema:
      'DEPARTMENT(Dno PK, Dname UNIQUE): (1, CSE), (2, ECE)\nEMPLOYEE(Eid PK, Name, Salary > 0, Dno FK -> DEPARTMENT): (101, Asha, 50000, 1), (102, Ravi, 45000, 2)',
    options: [
      '(i) Referential Integrity, (ii) Key Constraint, (iii) Entity Integrity, (iv) Domain Constraint',
      '(i) Entity Integrity, (ii) Domain Constraint, (iii) Referential Integrity, (iv) Referential Integrity',
      '(i) Domain Constraint, (ii) Entity Integrity, (iii) Key Constraint, (iv) Entity Integrity',
      '(i) Entity Integrity, (ii) Referential Integrity, (iii) Domain Constraint, (iv) Key Constraint',
    ],
    correctIndex: 1,
    explanation:
      'Step 1 — Op (i): Attempting to insert NULL for primary key Eid violates Entity Integrity, which prohibits NULL in any PK attribute.\nStep 2 — Op (ii): Inserting Salary = -5000 violates the Domain Constraint (Salary > 0 specifies the valid domain of values for Salary).\nStep 3 — Op (iii): Inserting Dno = 9 into EMPLOYEE references a non-existent primary key in DEPARTMENT (only 1 and 2 exist), violating Referential Integrity; remedy is to reject the insert or insert department 9 first.\nStep 4 — Op (iv): Deleting Dno = 1 from DEPARTMENT leaves EMPLOYEE(101, "Asha") with a dangling FK, violating Referential Integrity; remedies are RESTRICT (reject), CASCADE (delete Asha), SET NULL (set Asha.Dno = NULL), or SET DEFAULT.',
  },
  {
    id: 'm1_q19',
    moduleId: 'm1',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt:
      'Part B Analytical: An e-commerce engineering team must pick the right database paradigm for 4 distinct microservices: (S1) Core payment ledger requiring strict ACID transfers; (S2) Product catalog where laptops, shoes, and books have wildly varying nested attributes; (S3) AI visual search matching 1536-dim image embeddings by cosine similarity; (S4) Real-time recommendation engine traversing "User -> Bought -> SimilarTo -> Brand" 4-hop paths. Which mapping is optimal?',
    codeOrSchema:
      'S1: Strict ACID ledger  |  S2: Varying nested catalog specs\nS3: 1536-dim cosine similarity  |  S4: 4-hop social/product traversal',
    options: [
      'S1: Document, S2: Relational, S3: Time-Series, S4: Vector',
      'S1: Relational, S2: Semi-structured (Document), S3: Vector, S4: Graph',
      'S1: Graph, S2: Vector, S3: Relational, S4: Semi-structured',
      'S1: Relational, S2: Time-Series, S3: Graph, S4: Unstructured',
    ],
    correctIndex: 1,
    explanation:
      'Step 1 (S1 -> Relational): Financial ledgers require strict ACID transactions, strong schema/referential integrity, and normalized multi-row atomicity, which Relational DBMSs guarantee natively.\nStep 2 (S2 -> Semi-structured/Document): Heterogeneous product specs with nested arrays/attributes avoid sparse NULL-heavy relational tables when modeled as self-describing JSON/BSON documents.\nStep 3 (S3 -> Vector): High-dimensional 1536-d embeddings require Approximate Nearest Neighbor (ANN) indexes (HNSW/IVF) for cosine/L2 similarity search—the exact purpose of a Vector DB.\nStep 4 (S4 -> Graph): Deep 4-hop traversals run in O(local degree) via index-free adjacency in a Graph DB, avoiding exponential relational join costs.',
  },

  // ==========================================================================
  // MODULE 2: ER Modeling & Relational DB Design (22 new questions: m2_q5..m2_q26)
  // ==========================================================================
  {
    id: 'm2_q5',
    moduleId: 'm2',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'In an ER diagram for a University database, DateOfBirth is stored permanently while Age is computed on demand from DateOfBirth and CurrentDate; PhoneNumbers can hold multiple numbers per student; Address subdivides into Street, City, and PinCode. How are Age, PhoneNumbers, and Address classified?',
    options: [
      'Age: stored; PhoneNumbers: composite; Address: multivalued',
      'Age: derived; PhoneNumbers: multivalued; Address: composite',
      'Age: composite; PhoneNumbers: derived; Address: simple',
      'Age: derived; PhoneNumbers: simple; Address: multivalued',
    ],
    correctIndex: 1,
    explanation:
      'In Elmasri & Navathe (Ch. 3, ER Model), a derived attribute (dashed oval) is computed from stored attributes (Age from DateOfBirth); a multivalued attribute (double oval) can hold a set of values for a single entity instance (PhoneNumbers); and a composite attribute branches into simpler sub-attributes (Address -> Street, City, PinCode).',
  },
  {
    id: 'm2_q6',
    moduleId: 'm2',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'In a COMPANY ER diagram, the recursive relationship SUPERVISION links EMPLOYEE to EMPLOYEE. Why are role names (Supervisor and Supervisee) mandatory on the two lines connecting EMPLOYEE to SUPERVISION?',
    options: [
      'Because recursive relationships are always weak identifying relationships',
      'Because the same entity type participates more than once in different roles, and role names disambiguate which foreign key references whom',
      'Because SQL forbids self-referencing foreign keys unless two separate tables are created',
      'Because recursive relationships cannot have cardinality ratios',
    ],
    correctIndex: 1,
    explanation:
      'When an entity type participates multiple times in the same relationship type (a unary/recursive relationship), each participation line must carry a distinct role name (e.g., Supervisor vs Supervisee) to specify its semantic meaning. During relational mapping (Step 4), this produces a self-referencing foreign key such as Super_ssn inside the EMPLOYEE relation.',
  },
  {
    id: 'm2_q7',
    moduleId: 'm2',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'In Elmasri & Navathe (min, max) structural constraint notation, the line between EMPLOYEE and WORKS_FOR (linking EMPLOYEE to DEPARTMENT) is labeled (1, 1), while the line between DEPARTMENT and WORKS_FOR is labeled (1, N). What does this specify?',
    codeOrSchema: 'EMPLOYEE ──(1, 1)── <WORKS_FOR> ──(1, N)── DEPARTMENT',
    options: [
      'Both EMPLOYEE and DEPARTMENT have partial participation, and the ratio is M:N',
      'Every employee must work for at least 1 and at most 1 department (total participation); every department must have at least 1 employee (total participation) and may have many',
      'An employee may work for zero departments, and a department can have at most one employee',
      'Each department is managed by at most one employee, and employees are optional',
    ],
    correctIndex: 1,
    explanation:
      'In Elmasri & Navathe (min, max) notation placed adjacent to an entity type E, min >= 1 signifies total participation (existence dependency) and max specifies the upper cardinality bound for each E instance. Thus (1, 1) on EMPLOYEE means every employee works for exactly one department, and (1, N) on DEPARTMENT means every department has at least one (up to N) employees.',
  },
  {
    id: 'm2_q8',
    moduleId: 'm2',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Which statement accurately describes a Weak Entity Type (such as DEPENDENT owned by EMPLOYEE) in ER modeling and Step 2 of ER-to-Relational mapping?',
    options: [
      'It has its own globally unique primary key and partial participation in its identifying relationship',
      'It lacks sufficient key attributes of its own, has total participation in its identifying relationship, and its mapped table primary key is the combination of the owner PK plus its own partial key (discriminator)',
      'It is always merged as a single nullable column inside the owner entity table',
      'It can participate in an M:N identifying relationship with zero owner entities',
    ],
    correctIndex: 1,
    explanation:
      'A weak entity type (double rectangle) cannot be uniquely identified by its own attributes alone; it relies on an owner entity via an identifying relationship (double diamond) with total participation. In Step 2 of the 7-step ER-to-Relational algorithm, its table includes the owner primary key as a foreign key, and its composite primary key is (Owner_PK, Partial_Key)—e.g., (Essn, Dependent_name).',
  },
  {
    id: 'm2_q9',
    moduleId: 'm2',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'In Step 3 of the 7-step ER-to-Relational mapping algorithm for a binary 1:1 relationship MANAGES between EMPLOYEE (partial participation) and DEPARTMENT (total participation), which foreign key placement minimizes NULL values?',
    options: [
      'Place DEPARTMENT.Dnumber as a foreign key in EMPLOYEE',
      'Place EMPLOYEE.Ssn as a foreign key in DEPARTMENT (the total-participation side)',
      'Always create a separate 3-column junction table even for 1:1 relationships',
      'Duplicate both primary keys in both tables',
    ],
    correctIndex: 1,
    explanation:
      'In Step 3 (1:1 binary relationship, Foreign Key approach), Elmasri & Navathe recommend placing the foreign key in the relation that has TOTAL participation (DEPARTMENT), because every department has a manager so Mgr_ssn will never be NULL. Placing Dnumber in EMPLOYEE would leave NULL for the vast majority of employees who do not manage a department.',
  },
  {
    id: 'm2_q10',
    moduleId: 'm2',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'In Step 6 of the ER-to-Relational mapping algorithm, how is a multivalued attribute Dlocations of strong entity DEPARTMENT(Dnumber, Dname) mapped into a 1NF relational schema?',
    options: [
      'Store comma-separated city names inside a single Dlocations VARCHAR column in DEPARTMENT',
      'Create a new relation DEPT_LOCATIONS(Dnumber, Dlocation) where Dnumber is a FK to DEPARTMENT and the primary key is the composite (Dnumber, Dlocation)',
      'Create a new relation DEPT_LOCATIONS(Dlocation) with Dlocation alone as the primary key',
      'Add fixed columns Loc1, Loc2, Loc3 inside DEPARTMENT regardless of how many locations exist',
    ],
    correctIndex: 1,
    explanation:
      'Relational 1NF forbids multivalued attributes. Step 6 of Elmasri & Navathe creates a separate table containing the multivalued attribute plus the owner primary key as a foreign key, with their combination (Dnumber, Dlocation) serving as the composite primary key so each department can have multiple locations and multiple departments can share the same city.',
  },
  {
    id: 'm2_q11',
    moduleId: 'm2',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'In Extended ER (EER) modeling, which EER-to-Relational mapping option (8A, 8B, 8C, or 8D) creates tables ONLY for the subclasses (no superclass table) by duplicating all superclass attributes into each subclass table, and under what constraint is it valid?',
    options: [
      'Option 8A — valid for any specialization',
      'Option 8B — valid only when the specialization is TOTAL (and strongly recommended for DISJOINT to avoid redundant superclass storage)',
      'Option 8C — valid only for overlapping specializations with multiple boolean flags',
      'Option 8D — valid only when there are zero subclass-specific attributes',
    ],
    correctIndex: 1,
    explanation:
      'In Elmasri & Navathe (Ch. 9, Step 8 EER Mapping), Option 8B creates one relation per subclass, copying superclass attributes into each subclass table. It works ONLY for a TOTAL specialization (otherwise superclass entities belonging to no subclass would be lost) and works cleanly for DISJOINT subclasses (overlapping subclasses would duplicate superclass data across multiple tables).',
  },
  {
    id: 'm2_q12',
    moduleId: 'm2',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Compare EER Mapping Options 8C and 8D (both single-relation approaches). When should Option 8D (multiple boolean type flags) be chosen over Option 8C (a single type discriminator column)?',
    options: [
      'When subclasses are DISJOINT and an entity can belong to at most one subclass',
      'When subclasses are OVERLAPPING so a single entity instance can simultaneously belong to two or more subclasses',
      'When subclasses have zero specific attributes of their own',
      'When the specialization is strictly partial and disjoint',
    ],
    correctIndex: 1,
    explanation:
      'Option 8C stores all superclass and subclass attributes in one table with a single type discriminator (e.g., JobType = "Secretary" | "Engineer"), which only works for DISJOINT specializations. Option 8D replaces the single discriminator with m boolean flag attributes (Is_Manufactured, Is_Purchased), allowing an entity to belong to multiple OVERLAPPING subclasses simultaneously (at the cost of NULLs for inapplicable subclass attributes).',
  },
  {
    id: 'm2_q13',
    moduleId: 'm2',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'According to Elmasri & Navathe\'s Informal Guidelines for Relational Schema Design (Ch. 14), joining two relations on non-key, non-foreign-key attributes (such as joining EMP_LOCS and EMP_PROJ1 on Plocation) violates Guideline 4 by generating what error?',
    options: [
      'Entity integrity violation',
      'Spurious tuples (erroneous extra rows that did not exist in the original relation)',
      'Cascading rollbacks during crash recovery',
      'Lost update concurrency anomalies',
    ],
    correctIndex: 1,
    explanation:
      'Informal Design Guideline 4 states that relations should be designed so they can be joined with equality conditions on primary key / foreign key pairs, guaranteeing that no spurious (invalid, fabricated) tuples appear in the result. Joining on non-unique descriptive attributes like Plocation cross-multiplies unrelated employees working at the same location, causing a lossy decomposition.',
  },
  {
    id: 'm2_q14',
    moduleId: 'm2',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Which Armstrong inference rule (or derived rule) directly deduces WX -> Z from the two functional dependencies X -> Y and WY -> Z?',
    options: [
      'Reflexivity',
      'Union rule',
      'Pseudotransitivity rule',
      'Decomposition rule',
    ],
    correctIndex: 2,
    explanation:
      'The Pseudotransitivity rule states that if X -> Y and WY -> Z, then WX -> Z. It is derived from Armstrong\'s sound and complete axioms by first applying Augmentation (adding W to X -> Y to obtain WX -> WY) and then applying Transitivity with WY -> Z to conclude WX -> Z.',
  },
  {
    id: 'm2_q15',
    moduleId: 'm2',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Numerical: Given relation R(A, B, C, D, E, F) and FD set F = { AB -> C, C -> D, D -> E, BE -> F, F -> A }, what is the attribute closure (BC)+?',
    codeOrSchema: 'R(A, B, C, D, E, F)  |  F = { AB -> C, C -> D, D -> E, BE -> F, F -> A }',
    options: [
      '{ B, C, D, E }',
      '{ B, C, D, E, F }',
      '{ A, B, C, D, E, F }',
      '{ B, C }',
    ],
    correctIndex: 2,
    explanation:
      'Compute (BC)+ iteratively: start with {B, C}. Using C -> D adds D -> {B, C, D}. Using D -> E adds E -> {B, C, D, E}. Now both B and E are present, so BE -> F adds F -> {B, C, D, E, F}. Finally, F -> A adds A -> {A, B, C, D, E, F}. Since neither B+ = {B} nor C+ = {C, D, E} covers R, BC is a valid candidate key of R.',
  },
  {
    id: 'm2_q16',
    moduleId: 'm2',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Numerical: Compute the Minimal (Canonical) Cover Fc of the functional dependency set F = { A -> BC, B -> C, A -> B, AB -> C }.',
    codeOrSchema: 'F = { A -> BC, B -> C, A -> B, AB -> C }',
    options: [
      '{ A -> B, A -> C, B -> C }',
      '{ A -> B, B -> C }',
      '{ A -> BC, B -> C }',
      '{ AB -> C, A -> B }',
    ],
    correctIndex: 1,
    explanation:
      'Apply the 3-step Minimal Cover algorithm (Elmasri Ch. 15): Step 1 (singleton RHS) yields {A -> B, A -> C, B -> C, AB -> C}. Step 2 (drop extraneous LHS): in AB -> C, B+ = {B, C} already derives C, so A is extraneous, collapsing AB -> C into duplicate B -> C. Step 3 (drop redundant FDs): removing A -> C still lets A+ = {A, B, C} via A -> B and B -> C, so A -> C is redundant. The minimal cover is {A -> B, B -> C}.',
  },
  {
    id: 'm2_q17',
    moduleId: 'm2',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'How do you formally prove that two functional dependency sets F and G over the same relation R are equivalent (F ≡ G)?',
    options: [
      'Check that F and G have the exact same number of functional dependencies',
      'Verify that every FD X -> Y in G is implied by F (Y ⊆ X+ under F) AND every FD U -> V in F is implied by G (V ⊆ U+ under G)',
      'Verify that F and G share at least one common candidate key',
      'Verify that every RHS in F is a singleton attribute',
    ],
    correctIndex: 1,
    explanation:
      'Two FD sets F and G are equivalent if and only if F covers G (F |= G, meaning for every X -> Y in G, Y is contained in X+ computed using F) AND G covers F (G |= F, meaning for every U -> V in F, V is contained in U+ computed using G). Equivalent sets can have different cardinalities (for instance, an unreduced set and its minimal cover).',
  },
  {
    id: 'm2_q18',
    moduleId: 'm2',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Numerical: Consider R(A, B, C, D) with candidate key {AB} and FDs { AB -> C, AB -> D, B -> D }. What is the highest normal form satisfied by R?',
    codeOrSchema: 'R(A, B, C, D)  |  Candidate Key = { AB }  |  F = { AB -> C, AB -> D, B -> D }',
    options: [
      '1NF only (violates 2NF because B -> D is a partial dependency)',
      '2NF (violates 3NF due to transitive dependency)',
      '3NF (violates BCNF)',
      'BCNF',
    ],
    correctIndex: 0,
    explanation:
      'The sole candidate key is {AB}, so prime attributes are {A, B} and non-prime attributes are {C, D}. Because D is non-prime and depends functionally on {B}—a proper subset of candidate key {AB}—B -> D is a partial dependency, violating 2NF. Hence R satisfies 1NF only.',
  },
  {
    id: 'm2_q19',
    moduleId: 'm2',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Numerical: Relation R(A, B, C, D) with FDs { A -> B, B -> C, C -> D } is decomposed into two candidate decompositions:\nD1 = { R1(A, B), R2(B, C, D) }\nD2 = { R1(A, C), R2(B, C, D) }\nUsing the binary lossless-join test (R1 ∩ R2) -> R1 or (R1 ∩ R2) -> R2, which statement is TRUE?',
    codeOrSchema: 'R(A, B, C, D)  |  F = { A -> B, B -> C, C -> D }\nD1 = { (A,B), (B,C,D) }    vs    D2 = { (A,C), (B,C,D) }',
    options: [
      'Both D1 and D2 are lossless',
      'D1 is lossless because (R1 ∩ R2) = {B} and B+ = {B, C, D} = R2; D2 is lossy because (R1 ∩ R2) = {C} and C+ = {C, D} covers neither R1 nor R2',
      'D2 is lossless and D1 is lossy',
      'Both D1 and D2 are lossy because neither intersection contains A',
    ],
    correctIndex: 1,
    explanation:
      'By the Binary Lossless-Join Theorem (Elmasri Ch. 15), splitting R into R1 and R2 is lossless iff (R1 ∩ R2) -> (R1 − R2) or (R1 ∩ R2) -> (R2 − R1). For D1, R1 ∩ R2 = {B} and B+ = {B, C, D} ⊇ R2, guaranteeing a lossless join. For D2, R1 ∩ R2 = {C} and C+ = {C, D}, which determines neither A in R1 nor B in R2, so joining R1 and R2 produces spurious tuples (lossy).',
  },
  {
    id: 'm2_q20',
    moduleId: 'm2',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Numerical: Given R(A, B, C) with FDs { AB -> C, C -> B }, R is in 3NF but NOT BCNF. If you decompose R into BCNF as R1(C, B) and R2(C, A), what classic normalization trade-off occurs?',
    codeOrSchema: 'R(A, B, C)  |  F = { AB -> C, C -> B }  ->  BCNF Split: R1(C, B), R2(C, A)',
    options: [
      'The decomposition becomes lossy, though all FDs are preserved',
      'The decomposition is lossless (via C -> B), BOTH tables are in BCNF, but dependency AB -> C is NOT preserved',
      'R1(C, B) still violates BCNF',
      'Both lossless join AND dependency preservation are guaranteed in BCNF for every schema',
    ],
    correctIndex: 1,
    explanation:
      'This is the textbook 3NF-vs-BCNF theorem in Elmasri & Navathe (Ch. 15, LOTS1A / TEACH example): every relation admits a lossless, dependency-preserving 3NF decomposition, and every relation admits a lossless BCNF decomposition—but BCNF cannot always guarantee dependency preservation. Here R1 ∩ R2 = {C} -> B makes the split lossless, yet AB -> C spans both tables and can no longer be enforced without a join.',
  },
  {
    id: 'm2_q21',
    moduleId: 'm2',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'In Fourth Normal Form (4NF), when is a Multivalued Dependency (MVD) X ->> Y over relation R considered TRIVIAL (and therefore permitted even if X is not a superkey)?',
    options: [
      'Only when X is a single attribute',
      'When Y ⊆ X OR X ∪ Y = R',
      'Whenever X and Y are disjoint sets of attributes',
      'Whenever R contains fewer than 4 attributes',
    ],
    correctIndex: 1,
    explanation:
      'Under Elmasri & Navathe (Ch. 15, 4NF), an MVD X ->> Y is trivial if either Y ⊆ X or X ∪ Y = R (meaning all remaining attributes of R are on the RHS, so no independent third attribute set Z = R − (X ∪ Y) exists to create Cartesian-product redundancy). A relation is in 4NF iff for every non-trivial MVD X ->> Y, X is a superkey of R.',
  },
  {
    id: 'm2_q22',
    moduleId: 'm2',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'What defines Fifth Normal Form (5NF / Project-Join Normal Form — PJNF) beyond 4NF?',
    options: [
      'Every non-prime attribute must be functionally dependent on a single-column primary key',
      'Every non-trivial Join Dependency *(R1, R2, ..., Rn) holding on R must be implied by the candidate keys of R (every Ri is a superkey of R)',
      'Every table must contain at most two foreign keys',
      'All multivalued attributes must be stored in JSON arrays',
    ],
    correctIndex: 1,
    explanation:
      '5NF (PJNF) eliminates cyclic join redundancy that cannot be decomposed losslessly into two projections (as in 4NF) and instead requires 3 or more projections. A relation R is in 5NF iff every non-trivial Join Dependency *(R1, R2, ..., Rn) satisfied by R has every component Ri as a superkey of R (classic SUPPLY(Sname, Part_name, Proj_name) cyclic business rule).',
  },
  {
    id: 'm2_q23',
    moduleId: 'm2',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt:
      'Part B Analytical (Numerical): Given R(A, B, C, D, E, F) with FDs F = { AB -> C, C -> D, B -> E, E -> F }, find its candidate key(s), highest current normal form, and final lossless BCNF decomposition.',
    codeOrSchema: 'R(A, B, C, D, E, F)  |  F = { AB -> C, C -> D, B -> E, E -> F }',
    options: [
      'Candidate Key = {A, B}; currently 2NF; BCNF = { R1(A,B,C,D), R2(B,E,F) }',
      'Candidate Key = {A, B}; currently 1NF; BCNF = { R1(B, E), R2(E, F), R3(A, B, C), R4(C, D) } (lossless & dependency-preserving)',
      'Candidate Keys = {AB, BC}; currently 3NF; BCNF = { R1(A,B,C), R2(C,D,E,F) }',
      'Candidate Key = {A, B, C}; currently 1NF; BCNF = { R1(A,B,E,F), R2(C,D) }',
    ],
    correctIndex: 1,
    explanation:
      'Step 1 (Candidate Key): Attributes A and B never appear on any RHS, so every key must contain AB. Computing (AB)+ = {A, B} -> C -> D and B -> E -> F yields {A, B, C, D, E, F}. Thus {AB} is the sole candidate key.\nStep 2 (Normal Form): Prime = {A, B}; non-prime = {C, D, E, F}. Because B -> E is a partial dependency of non-prime E on proper subset B of key AB, R fails 2NF (currently 1NF).\nStep 3 (2NF Split): Extract B+ = {B, E, F} -> R_left(B, E, F) and R_right(A, B, C, D). Intersection {B} -> R_left (lossless).\nStep 4 (3NF/BCNF Split): In R_left(B, E, F), transitive E -> F splits into R1(B, E) and R2(E, F) (intersection {E} -> R2). In R_right(A, B, C, D), transitive C -> D splits into R3(A, B, C) and R4(C, D) (intersection {C} -> R4). All 4 relations are in BCNF, lossless, and preserve every FD in F.',
  },
  {
    id: 'm2_q24',
    moduleId: 'm2',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt:
      'Part B Analytical: An EER Hospital schema has strong entity PATIENT(Pid, Name), weak entity VISIT(VisitDate partial key, Diagnosis) owned by PATIENT, multivalued attribute PATIENT.Allergies, and a DISJOINT + TOTAL specialization of STAFF(Sid, Sname) into DOCTOR(Specialty) and NURSE(Shift). Applying Elmasri Steps 1–8 (using Option 8A for specialization), how many relational tables are produced and what are the primary keys of VISIT and PATIENT_ALLERGIES?',
    codeOrSchema:
      'PATIENT(Pid PK, Name, {Allergies}) ══ <HAS_VISIT> ══ [VISIT(VisitDate partial, Diagnosis)]\nSTAFF(Sid PK, Sname) ──(d, total)──> DOCTOR(Specialty), NURSE(Shift)  [Option 8A]',
    options: [
      '4 tables total; VISIT PK = (VisitDate); PATIENT_ALLERGIES PK = (Allergy)',
      '6 tables total (PATIENT, VISIT, PATIENT_ALLERGIES, STAFF, DOCTOR, NURSE); VISIT PK = (Pid, VisitDate); PATIENT_ALLERGIES PK = (Pid, Allergy)',
      '5 tables total (STAFF omitted under 8A); VISIT PK = (Pid, VisitDate); PATIENT_ALLERGIES PK = (Pid)',
      '7 tables total (including separate HAS_VISIT junction table); VISIT PK = (VisitDate)',
    ],
    correctIndex: 1,
    explanation:
      'Step 1 (Strong Entities): PATIENT(Pid PK, Name) and STAFF(Sid PK, Sname) -> 2 tables.\nStep 2 (Weak Entity): VISIT becomes VISIT(Pid FK, VisitDate, Diagnosis) with composite PK (Pid, VisitDate); identifying 1:N relationship HAS_VISIT does NOT create a separate table -> +1 table (total 3).\nStep 3 (Multivalued Attribute, Step 6): PATIENT.Allergies becomes PATIENT_ALLERGIES(Pid FK, Allergy) with composite PK (Pid, Allergy) -> +1 table (total 4).\nStep 4 (EER Option 8A): Creates one table for each subclass sharing superclass PK Sid as both PK and FK: DOCTOR(Sid PK/FK, Specialty) and NURSE(Sid PK/FK, Shift) -> +2 tables (total 6 tables).',
  },
  {
    id: 'm2_q25',
    moduleId: 'm2',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt:
      'Part B Analytical: Normalize ORDER_LINE(OrderId, ItemId, CustId, CustCity, ItemName, Qty) step-by-step from 1NF to BCNF given FDs { (OrderId, ItemId) -> Qty, OrderId -> CustId, CustId -> CustCity, ItemId -> ItemName }. Which normalized schema eliminates EVERY partial and transitive dependency without losing any data?',
    codeOrSchema:
      'ORDER_LINE(OrderId, ItemId, CustId, CustCity, ItemName, Qty)\nF = { (OrderId, ItemId) -> Qty, OrderId -> CustId, CustId -> CustCity, ItemId -> ItemName }',
    options: [
      'R1(OrderId, ItemId, Qty, CustCity), R2(OrderId, CustId, ItemName)',
      'ORDER_ITEMS(OrderId, ItemId, Qty), ORDERS(OrderId, CustId), CUSTOMERS(CustId, CustCity), ITEMS(ItemId, ItemName)',
      'ORDER_ITEMS(OrderId, ItemId, Qty, ItemName), ORDERS(OrderId, CustId, CustCity)',
      'ORDER_ITEMS(OrderId, ItemId, Qty), ORDERS(OrderId, CustId, CustCity), ITEMS(ItemId, ItemName)',
    ],
    correctIndex: 1,
    explanation:
      'Step 1 (Key & 1NF): Candidate key is (OrderId, ItemId). All values are atomic -> currently 1NF.\nStep 2 (2NF — Remove Partial Dependencies): OrderId -> CustId (and transitively CustCity) depends only on OrderId; ItemId -> ItemName depends only on ItemId. Decompose into ORDER_ITEMS(OrderId, ItemId, Qty), ORDERS_TEMP(OrderId, CustId, CustCity), and ITEMS(ItemId, ItemName).\nStep 3 (3NF — Remove Transitive Dependency): In ORDERS_TEMP, OrderId -> CustId -> CustCity is a transitive dependency via non-prime CustId. Split into ORDERS(OrderId, CustId) and CUSTOMERS(CustId, CustCity).\nStep 4 (BCNF Check): Every remaining determinant ((OrderId, ItemId), OrderId, CustId, ItemId) is the primary key of its own table, so all 4 tables are in BCNF with lossless joins.',
  },
  {
    id: 'm2_q26',
    moduleId: 'm2',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt:
      'Part B Analytical: Contrast 4NF and 5NF using two classic Elmasri schemas:\n(Case 1) EMP(Ename, Pname, Dname) where an employee\'s projects and dependents are completely independent (Ename ->> Pname | Dname).\n(Case 2) SUPPLY(Sname, Part_name, Proj_name) with NO non-trivial FDs or MVDs, where a cyclic business rule states: if supplier s supplies part p, project j uses part p, and s supplies at least one part to j, then s supplies p to j.\nWhich decompositions bring Case 1 to 4NF and Case 2 to 5NF respectively?',
    codeOrSchema:
      'Case 1: EMP(Ename, Pname, Dname)  [Ename ->> Pname | Dname]\nCase 2: SUPPLY(Sname, Part_name, Proj_name)  [JD *(R1, R2, R3)]',
    options: [
      'Case 1 needs 3 binary tables; Case 2 needs 2 binary tables',
      'Case 1 decomposes into 2 tables: EMP_PROJ(Ename, Pname) and EMP_DEP(Ename, Dname) for 4NF; Case 2 cannot be split losslessly into 2 tables and requires 3 binary tables: R1(Sname, Part_name), R2(Part_name, Proj_name), R3(Sname, Proj_name) for 5NF',
      'Both Case 1 and Case 2 are already in 5NF because their primary keys span all 3 attributes (hence already BCNF)',
      'Case 1 requires BCNF decomposition on Pname -> Dname; Case 2 violates 2NF',
    ],
    correctIndex: 1,
    explanation:
      'Step 1 (Why BCNF Is Insufficient): In both schemas the only key is all 3 attributes (all-key relations), so there are zero non-trivial FDs and both are trivially in BCNF—yet both still suffer insertion/deletion redundancy.\nStep 2 (Case 1 -> 4NF): Because Ename ->> Pname and Ename ->> Dname are non-trivial MVDs and Ename is not a superkey, EMP fails 4NF. Decomposing into two tables EMP_PROJ(Ename, Pname) and EMP_DEP(Ename, Dname) removes the Cartesian-product blowup losslessly.\nStep 3 (Case 2 -> 5NF): SUPPLY has no non-trivial MVDs (so it IS in 4NF!), yet satisfies the ternary Join Dependency *(R1(S,P), R2(P,J), R3(S,J)). Any 2-way split is lossy, whereas joining all 3 binary projections reconstructs SUPPLY losslessly and achieves 5NF (PJNF).',
  },

  // ==========================================================================
  // MODULE 3: Physical DB Design & Query Processing (17 new questions: m3_q6..m3_q22)
  // ==========================================================================
  {
    id: 'm3_q6',
    moduleId: 'm3',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Numerical: A disk has block size B = 4096 bytes. A file stores r = 50,000 fixed-length records of size R = 200 bytes using UNSPANNED organization. What are the blocking factor (bfr) and total number of data blocks (b)?',
    codeOrSchema: 'B = 4096 bytes  |  R = 200 bytes (unspanned)  |  r = 50,000 records',
    options: [
      'bfr = 21 records/block, b = 2,381 blocks',
      'bfr = 20 records/block, b = 2,500 blocks',
      'bfr = 20.48 records/block, b = 2,442 blocks',
      'bfr = 16 records/block, b = 3,125 blocks',
    ],
    correctIndex: 1,
    explanation:
      'Under unspanned record organization (Elmasri & Navathe Ch. 16), records cannot cross block boundaries, so the blocking factor is bfr = floor(B / R) = floor(4096 / 200) = 20 records/block (leaving 96 bytes unused per block). Total blocks needed is b = ceil(r / bfr) = ceil(50,000 / 20) = 2,500 blocks. Using 20.48 corresponds to spanned records.',
  },
  {
    id: 'm3_q7',
    moduleId: 'm3',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Numerical: For a file occupying b = 2,500 disk blocks, compare the average block accesses for an equality search on the ordering key in an UNORDERED (Heap) file versus an ORDERED (Sequential) file using binary search.',
    codeOrSchema: 'b = 2,500 disk blocks  |  Equality search on unique key',
    options: [
      'Heap: 2,500 blocks; Ordered: 1,250 blocks',
      'Heap: 1,250 blocks (b/2); Ordered: 12 blocks (ceil(log2 2500))',
      'Heap: 12 blocks; Ordered: 1 block',
      'Heap: 1,250 blocks; Ordered: 50 blocks (sqrt(b))',
    ],
    correctIndex: 1,
    explanation:
      'In an unordered (heap) file, finding a matching unique record scans half the file on average: b / 2 = 2500 / 2 = 1,250 block accesses (and all 2,500 if absent). In an ordered (sequential) file sorted by the search key, binary search requires at most ceil(log2 b) = ceil(log2 2500) = ceil(11.29) = 12 block accesses (since 2^11 = 2048 < 2500 <= 4096 = 2^12).',
  },
  {
    id: 'm3_q8',
    moduleId: 'm3',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Why is inserting a new record into a contiguous ORDERED (sequential) file significantly slower than inserting into an UNORDERED (heap) file, and how do DBMSs mitigate this cost?',
    options: [
      'Ordered files require linear scanning to find the end of file; mitigated by disabling indexing',
      'Maintaining physical sort order requires shifting subsequent records/blocks (O(b/2) cost); mitigated by appending new records to a temporary unordered overflow (transaction) file and periodically merging',
      'Ordered files forbid duplicate primary keys while heap files allow them',
      'Ordered files must recompute hash functions on every block',
    ],
    correctIndex: 1,
    explanation:
      'Heap insertion simply appends to the last disk block in O(1) I/O. Maintaining strict physical order in a sequential file would require shifting half the file on average; therefore DBMSs append inserts into a small unordered overflow (transaction) file and periodically sort-merge it into the main file (at the cost of also scanning the overflow file on searches).',
  },
  {
    id: 'm3_q9',
    moduleId: 'm3',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Numerical: An Extendible Hashing index currently has global depth d = 4. A particular bucket B has local depth d\' = 2. How many total entries exist in the directory, how many directory entries point to bucket B, and does the directory double if bucket B overflows?',
    codeOrSchema: 'Extendible Hashing  |  Global depth d = 4  |  Bucket B local depth d\' = 2',
    options: [
      'Directory = 16 entries; 4 entries point to B; directory does NOT double on overflow (d\' increments to 3)',
      'Directory = 16 entries; 2 entries point to B; directory doubles to 32 entries on overflow',
      'Directory = 8 entries; 4 entries point to B; directory doubles to 16 entries',
      'Directory = 16 entries; 8 entries point to B; directory does NOT double',
    ],
    correctIndex: 0,
    explanation:
      'In Extendible Hashing (Elmasri Ch. 16), directory size is 2^d = 2^4 = 16 entries, and any bucket with local depth d\' is shared by 2^(d − d\') = 2^(4 − 2) = 4 directory pointers. Because d\' (2) < d (4), overflowing bucket B splits into two buckets of local depth 3 (each receiving 2 directory pointers) WITHOUT doubling the directory.',
  },
  {
    id: 'm3_q10',
    moduleId: 'm3',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'How does Linear Hashing avoid the sudden directory-doubling overhead of Extendible Hashing when buckets overflow?',
    options: [
      'It stores all keys inside a single B+ tree root block',
      'It eliminates the directory entirely and splits buckets sequentially in round-robin order tracked by a split pointer n (using h_i and h_{i+1}), placing temporary overflows in chained overflow buckets',
      'It refuses new insertions once load factor reaches 70%',
      'It doubles all buckets simultaneously on every single collision',
    ],
    correctIndex: 1,
    explanation:
      'Linear Hashing grows the hash file by one bucket at a time without any directory structure. A split pointer n advances linearly from 0 to M−1, splitting bucket n (not necessarily the bucket that just overflowed) using hash function h_{i+1}(K) = K mod (2^{i+1} M), while temporary collisions are handled via short overflow chains until the pointer reaches that bucket.',
  },
  {
    id: 'm3_q11',
    moduleId: 'm3',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Which combination accurately characterizes Primary, Clustering, and Secondary single-level indexes in Elmasri & Navathe (Ch. 17)?',
    options: [
      'Primary: dense on non-key; Clustering: dense on key; Secondary: sparse on key',
      'Primary: sparse on ordered key field (1 entry/block); Clustering: sparse on ordered non-key field (1 entry/distinct value); Secondary: dense on unordered field (1 entry/record)',
      'Primary: unordered field; Clustering: ordered key field; Secondary: sparse on ordered field',
      'All three single-level index types are always sparse with exactly 1 entry per disk block',
    ],
    correctIndex: 1,
    explanation:
      'Elmasri & Navathe (Ch. 17) classify single-level indexes by physical file ordering and uniqueness: a Primary index is sparse (one anchor entry per data block) on an ordered key field; a Clustering index is sparse (one entry per distinct field value) on an ordered non-key field; and a Secondary index sits on an unordered field, so it MUST be dense (one entry per data record) because matching records can reside in any block.',
  },
  {
    id: 'm3_q12',
    moduleId: 'm3',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Numerical: A file has r = 30,000 records (R = 100 bytes, B = 1024 bytes, unspanned -> 3,000 data blocks). A Multilevel Primary Index is built with key V = 9 bytes and block pointer P = 6 bytes (fan-out fo = 68). How many index levels (t) exist and how many total disk block accesses are needed to retrieve a record by primary key?',
    codeOrSchema: 'b = 3,000 data blocks  |  Index entry = 15 B  |  fo = floor(1024/15) = 68',
    options: [
      't = 1 level; 2 disk I/Os',
      't = 2 levels; 3 disk I/Os (Root -> Level 1 -> Data Block)',
      't = 3 levels; 4 disk I/Os',
      't = 2 levels; 12 disk I/Os',
    ],
    correctIndex: 1,
    explanation:
      'Level 1 of the primary index holds 3,000 entries -> b1 = ceil(3000 / 68) = 45 blocks. Level 2 holds 45 entries -> b2 = ceil(45 / 68) = 1 root block. Thus the multilevel index has t = ceil(log_68(3000)) = 2 levels. Locating a record traverses t index levels plus 1 data block access = 2 + 1 = 3 disk I/Os (compared to ceil(log2 45) + 1 = 7 I/Os for single-level binary search).',
  },
  {
    id: 'm3_q13',
    moduleId: 'm3',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Numerical: A B+ tree internal node has order p = 51 (maximum 51 child pointers and 50 search keys). What are the MINIMUM number of child pointers and MINIMUM number of search keys required in any non-root internal node to avoid underflow?',
    codeOrSchema: 'B+ Tree non-root internal node  |  Order p = 51',
    options: [
      'Min 25 pointers, min 24 keys',
      'Min 26 pointers (ceil(p/2)), min 25 keys (ceil(p/2) − 1)',
      'Min 50 pointers, min 25 keys',
      'Min 1 pointer, min 0 keys',
    ],
    correctIndex: 1,
    explanation:
      'By B+ tree structural invariants (Elmasri Ch. 17), every internal node except the root must be at least half full: it must contain at least ceil(p / 2) tree pointers and at least ceil(p / 2) − 1 search keys. For p = 51, ceil(51 / 2) = 26 child pointers and 26 − 1 = 25 search keys. Only the root is permitted as few as 2 pointers (1 key).',
  },
  {
    id: 'm3_q14',
    moduleId: 'm3',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'During deletion of a key from a B+ tree leaf node, what happens if the leaf drops below its minimum occupancy floor (ceil(p_leaf / 2) entries) and its immediate sibling has extra entries above the minimum?',
    options: [
      'The entire B+ tree is rebuilt from scratch',
      'An entry is borrowed (redistributed) from the sibling leaf and the parent separator key is updated to the new smallest key of the right leaf',
      'The root node is immediately deleted even if it has 5 children',
      'The deleted key is left inside the leaf permanently with no structural update',
    ],
    correctIndex: 1,
    explanation:
      'B+ tree deletion resolves leaf underflow in two stages: first, attempt redistribution (borrowing an entry from an adjacent left or right sibling that has > minimum entries) and update the parent routing key to match the right leaf\'s new minimum key. Only if neither sibling can spare an entry do the two leaves merge, removing the separator key from the parent and propagating underflow upward if needed.',
  },
  {
    id: 'm3_q15',
    moduleId: 'm3',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'In an LSM-Tree storage engine, why are per-SSTable Bloom Filters maintained in memory on the read path?',
    options: [
      'To encrypt WAL records before writing to SSD',
      'To quickly skip immutable SSTable files that definitely do NOT contain the requested key, drastically reducing read amplification',
      'To replace MemTable sorting during write ingestion',
      'To eliminate the need for background compaction permanently',
    ],
    correctIndex: 1,
    explanation:
      'Because LSM trees flush writes into multiple immutable SSTables across levels, a point lookup might otherwise probe every SSTable on disk (read amplification). A compact in-memory Bloom Filter guarantees zero false negatives: if the filter reports "not present", the engine skips that SSTable entirely without issuing a disk I/O.',
  },
  {
    id: 'm3_q16',
    moduleId: 'm3',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'In Relational Algebra, what is the exact difference between an Inner Equijoin (R ⋈_{R.A = S.B} S) and a Left Outer Join (R ⟕_{R.A = S.B} S)?',
    options: [
      'Left Outer Join discards unmatched tuples from R and keeps only unmatched tuples from S',
      'Left Outer Join preserves EVERY tuple of R in the output, padding S\'s attributes with NULL when a tuple in R has no matching tuple in S',
      'Left Outer Join removes duplicate join columns automatically while Equijoin does not',
      'Left Outer Join requires R and S to be union-compatible (same degree and domains)',
    ],
    correctIndex: 1,
    explanation:
      'Standard inner joins (Theta-Join, Equijoin, Natural Join) eliminate dangling tuples that fail to find a match in the opposite relation. A Left Outer Join (R ⟕ S) retains all tuples of the left operand R, filling the attributes of S with NULL whenever no match exists in S (similarly ⟖ preserves S, and ⟗ Full Outer Join preserves both).',
  },
  {
    id: 'm3_q17',
    moduleId: 'm3',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Numerical/Trace: Let ENROLLED(Sid, Cid) = {(S1, C1), (S1, C2), (S1, C3), (S2, C1), (S2, C3), (S3, C1), (S3, C2)} and CORE(Cid) = {(C1), (C2)}. What is the exact result of the Relational Algebra Division ENROLLED ÷ CORE?',
    codeOrSchema: 'ENROLLED = {(S1,C1),(S1,C2),(S1,C3),(S2,C1),(S2,C3),(S3,C1),(S3,C2)}\nCORE = {(C1), (C2)}',
    options: [
      '{ (S1) } only',
      '{ (S1), (S3) }',
      '{ (S1), (S2), (S3) }',
      '{ (S2) } only',
    ],
    correctIndex: 1,
    explanation:
      'Relational Division R(A, B) ÷ S(B) returns every Sid paired with ALL Cid values in CORE = {C1, C2}. S1 has {C1, C2, C3} ⊇ {C1, C2} (included); S2 has {C1, C3} which misses C2 (excluded); S3 has {C1, C2} ⊇ {C1, C2} (included). Formally computed via T1 = π_Sid(R), T2 = π_Sid((T1 × S) − R), Result = T1 − T2 = {(S1), (S3)}.',
  },
  {
    id: 'm3_q18',
    moduleId: 'm3',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Which Tuple Relational Calculus (TRC) expression safely retrieves the names of employees who do NOT work on ANY project (equivalent to SQL NOT EXISTS)?',
    codeOrSchema: 'EMPLOYEE(Ssn, Name)   |   WORKS_ON(Essn, Pno)',
    options: [
      '{ e.Name | EMPLOYEE(e) ∧ (∃w)(WORKS_ON(w) ∧ w.Essn = e.Ssn) }',
      '{ e.Name | EMPLOYEE(e) ∧ ¬(∃w)(WORKS_ON(w) ∧ w.Essn = e.Ssn) }',
      '{ e.Name | ¬EMPLOYEE(e) }',
      '{ e.Name | (∀w)(WORKS_ON(w) ∧ w.Essn ≠ e.Ssn) }',
    ],
    correctIndex: 1,
    explanation:
      'In Tuple Relational Calculus (Elmasri Ch. 8), an expression is safe only when its output is bounded by existing database domain values (achieved here via the range predicate EMPLOYEE(e)). Appending ¬(∃w)(WORKS_ON(w) ∧ w.Essn = e.Ssn) asserts that no WORKS_ON tuple links to employee e. Option C is unsafe (infinite domain), and Option D misses the range predicate EMPLOYEE(e).',
  },
  {
    id: 'm3_q19',
    moduleId: 'm3',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'In Heuristic Query Optimization (Elmasri Ch. 18), why should a Selection σ_c(R × S) whose condition c equates an attribute of R with an attribute of S be rewritten into a Join (R ⋈_c S) before execution?',
    options: [
      'Because SQL forbids Cartesian products in canonical query trees',
      'Because evaluating R × S first materializes |R| × |S| tuples before filtering, whereas R ⋈_c S can use index/hash/sort-merge join algorithms directly without building the full cross product',
      'Because Joins always return more tuples than Cartesian products',
      'Because combining σ and × eliminates the need to check primary key constraints',
    ],
    correctIndex: 1,
    explanation:
      'Step 4 of Elmasri\'s Heuristic Query Tree Optimization algorithm combines a Cartesian Product (×) with a subsequent join-condition Selection (σ) into an explicit Join (⋈). Materializing R × S generates |R|·|S| intermediate rows (potentially millions), whereas executing R ⋈_c S directly enables indexed nested-loop, hash join, or sort-merge join algorithms.',
  },
  {
    id: 'm3_q20',
    moduleId: 'm3',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt:
      'Part B Analytical (Numerical): Design a B+ Tree index for disk block size B = 1024 bytes, search key V = 12 bytes, block/tree pointer P = 8 bytes, and data record pointer P_r = 10 bytes. What are the exact internal node order p, leaf node order p_leaf, and maximum number of data records indexable in a 3-level B+ tree (root + 1 internal level + leaf level)?',
    codeOrSchema: 'B = 1024 B  |  Key V = 12 B  |  Tree Pointer P = 8 B  |  Data Pointer P_r = 10 B',
    options: [
      'p = 50, p_leaf = 45, max 3-level records = 112,500',
      'p = 51, p_leaf = 46, max 3-level records = 119,646',
      'p = 52, p_leaf = 46, max 3-level records = 124,384',
      'p = 51, p_leaf = 48, max 3-level records = 124,848',
    ],
    correctIndex: 1,
    explanation:
      'Step 1 (Internal Node Order p): Inequality p·P + (p − 1)·V ≤ B => 8p + 12(p − 1) ≤ 1024 => 20p ≤ 1036 => p = floor(1036 / 20) = 51 pointers (50 keys; 51×8 + 50×12 = 1008 B ≤ 1024 B).\nStep 2 (Leaf Node Order p_leaf): Each leaf holds p_leaf (key, data pointer) pairs plus 1 sibling leaf pointer P: p_leaf·(V + P_r) + P ≤ B => 22·p_leaf + 8 ≤ 1024 => 22·p_leaf ≤ 1016 => p_leaf = floor(1016 / 22) = 46 entries (46×22 + 8 = 1020 B ≤ 1024 B).\nStep 3 (Max Records in 3 Levels): Level 1 (Root) has up to 51 children; Level 2 (51 internal nodes) points to up to 51 × 51 = 2,601 leaves; Level 3 (2,601 leaves × 46 entries) indexes up to 2,601 × 46 = 119,646 records.',
  },
  {
    id: 'm3_q21',
    moduleId: 'm3',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt:
      'Part B Analytical: Given EMPLOYEE(Ssn, Lname, Bdate, Dno), WORKS_ON(Essn, Pno), PROJECT(Pnumber, Pname, Plocation), consider the query: "Retrieve Lname of employees born after 1995 who work on a project located in Chennai."\nWhich Relational Algebra expression, TRC expression, AND Heuristic Query Tree optimization sequence are ALL completely correct?',
    codeOrSchema:
      'EMPLOYEE(Ssn, Lname, Bdate, Dno)  |  WORKS_ON(Essn, Pno)  |  PROJECT(Pnumber, Pname, Plocation)\nFilter: Bdate > "1995-12-31" AND Plocation = "Chennai"  |  Output: Lname',
    options: [
      'Push π_Lname to the leaf of EMPLOYEE before joining on Ssn; TRC uses ∀p for PROJECT',
      'RA: π_Lname( (π_{Ssn,Lname}(σ_{Bdate>"1995-12-31"}(EMPLOYEE))) ⋈_{Ssn=Essn} WORKS_ON ⋈_{Pno=Pnumber} (π_{Pnumber}(σ_{Plocation="Chennai"}(PROJECT))) ); TRC: { e.Lname | EMPLOYEE(e) ∧ e.Bdate>"1995-12-31" ∧ (∃w)(∃p)(WORKS_ON(w) ∧ PROJECT(p) ∧ w.Essn=e.Ssn ∧ w.Pno=p.Pnumber ∧ p.Plocation="Chennai") }',
      'Evaluate (EMPLOYEE × WORKS_ON × PROJECT) first so indexes on Plocation are avoided; TRC drops existential quantifiers',
      'Push σ_{Plocation="Chennai"} down to EMPLOYEE and σ_{Bdate>"1995-12-31"} down to PROJECT',
    ],
    correctIndex: 1,
    explanation:
      'Step 1 (Canonical Initial Tree): Starts with Cartesian products (EMPLOYEE × WORKS_ON × PROJECT), applies the combined conjunction σ at the middle, and projects π_Lname at the root.\nStep 2 (Heuristic Optimization): Break conjunctive σ into cascading selections; push σ_{Bdate>"1995-12-31"} directly onto EMPLOYEE and σ_{Plocation="Chennai"} directly onto PROJECT; combine remaining join predicates with × into ⋈; push projections down while retaining join keys (π_{Ssn,Lname} on EMPLOYEE, π_{Pnumber} on PROJECT) so joins still succeed.\nStep 3 (TRC Equivalence): Existentially quantify joining tuples w ∈ WORKS_ON and p ∈ PROJECT while keeping free range variable e ∈ EMPLOYEE.',
  },
  {
    id: 'm3_q22',
    moduleId: 'm3',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt:
      'Part B Analytical (Numerical): Compare bucket splits in Extendible Hashing vs Linear Hashing:\n(A) Extendible Hashing has d = 2, bucket capacity = 2; Bucket "01" (local depth d\' = 2) holds keys {5 (0101), 9 (1001)} [using 2 least-significant bits] and key 13 (1101) arrives.\n(B) Linear Hashing starts with M = 4 buckets (0..3), split pointer n = 0, level i = 0 (h_0(K) = K mod 4, h_1(K) = K mod 8). Bucket 2 overflows and triggers a split.\nWhat occurs in (A) and (B)?',
    codeOrSchema:
      '(A) Extendible: d = 2, Bucket "01" (d\' = 2) full -> insert 13 (1101)\n(B) Linear: M = 4, n = 0, i = 0 -> Bucket 2 overflows',
    options: [
      '(A) Bucket "01" splits without doubling directory; (B) Bucket 2 splits immediately using h_1 and n stays 0',
      '(A) Because d\' == d (2 == 2), directory doubles from 4 to 8 entries (d = 3) and Bucket "01" splits into "001" ({9}) and "101" ({5, 13}) with d\' = 3; (B) Bucket 2 chains an overflow page while Bucket n = 0 splits into Bucket 0 and Bucket 4 using h_1(K) = K mod 8, advancing n to 1',
      '(A) Key 13 is placed in an overflow chain without splitting; (B) All 4 buckets double immediately to 8 buckets',
      '(A) Directory doubles to 16 entries; (B) Bucket 2 splits into Bucket 2 and Bucket 6',
    ],
    correctIndex: 1,
    explanation:
      'Step 1 (Extendible Trace): Because overflowing bucket "01" has local depth d\' = 2 equal to global depth d = 2, the directory MUST double from 2^2 = 4 to 2^3 = 8 entries (d becomes 3). Inspecting the 3 least-significant bits: 9 = ...001 goes to "001", while 5 = ...101 and 13 = ...101 go to "101"; both buckets get local depth d\' = 3 (no overflow chains).\nStep 2 (Linear Hashing Trace): Linear Hashing NEVER splits an arbitrary overflowing bucket immediately. Instead, Bucket 2 attaches a temporary overflow page, while the bucket pointed to by split pointer n = 0 is rehashed with h_1(K) = K mod 8 into Bucket 0 and new Bucket 4, and n increments to 1.',
  },

  // ==========================================================================
  // MODULE 4: Transactions, Concurrency Control & Recovery (20 new: m4_q5..m4_q24)
  // ==========================================================================
  {
    id: 'm4_q5',
    moduleId: 'm4',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Transaction T1 reads balance X = 500, subtracts 100, and writes X = 400. Before T1 commits, T2 reads X = 400. Then T1 fails and rolls back X to 500, leaving T2 operating on a value that never legally existed. Which concurrency anomaly occurred?',
    options: [
      'Lost update problem',
      'Dirty read (Temporary Update) problem',
      'Incorrect summary (Aggregate) problem',
      'Phantom read problem',
    ],
    correctIndex: 1,
    explanation:
      'The Temporary Update (Dirty Read) anomaly (Elmasri Ch. 20) occurs when one transaction updates an item and later fails/rolls back, while another transaction has already read that uncommitted intermediate value. Lost Update happens when two transactions overwrite each other\'s updates based on stale reads, and Incorrect Summary occurs when an aggregate scans items mid-transfer.',
  },
  {
    id: 'm4_q6',
    moduleId: 'm4',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'In the DBMS architecture, which pairing correctly maps ACID properties to the internal subsystem primarily responsible for enforcing each property?',
    options: [
      'Atomicity & Durability -> Recovery Manager; Isolation -> Concurrency Control Manager; Consistency -> Integrity Constraints & Transaction Logic',
      'Atomicity & Isolation -> Query Optimizer; Durability -> Buffer Replacement Policy; Consistency -> B+ Tree Manager',
      'Durability & Isolation -> DDL Compiler; Atomicity -> Concurrency Control Manager',
      'All four ACID properties are enforced exclusively by the OS File System',
    ],
    correctIndex: 0,
    explanation:
      'Elmasri & Navathe (Ch. 20) map ACID enforcement cleanly across DBMS subsystems: the Recovery Manager guarantees Atomicity (via UNDO of failed transactions) and Durability (via WAL REDO of committed transactions); the Concurrency Control Subsystem enforces Isolation (preventing concurrent interference); and Consistency is preserved jointly by DBMS integrity constraints and correct application transaction code.',
  },
  {
    id: 'm4_q7',
    moduleId: 'm4',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'In the 5-state Transaction State Transition Diagram (Elmasri Ch. 20), when does a transaction enter the "Partially Committed" state, and can it still transition to "Failed" from there?',
    options: [
      'Before executing its first read; no, once partially committed it cannot fail',
      'Immediately after executing its final operation (end_transaction); YES, it can still transition to Failed if concurrency checks fail or a crash occurs before its commit log record is forced to stable disk',
      'Only after the OS flushes all dirty pages to tape backup; no failure is possible',
      'Immediately after an explicit ROLLBACK statement',
    ],
    correctIndex: 1,
    explanation:
      'A transaction transitions Active -> Partially Committed upon reaching its final statement. At this checkpoint, the DBMS verifies serializability/validation rules and forces the [commit, Ti] WAL record to stable storage; if a check fails or power fails before the commit record lands on disk, the transaction transitions Partially Committed -> Failed -> Aborted.',
  },
  {
    id: 'm4_q8',
    moduleId: 'm4',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Numerical: How many distinct SERIAL schedules exist for n = 4 concurrent transactions {T1, T2, T3, T4}?',
    codeOrSchema: 'n = 4 transactions: { T1, T2, T3, T4 }',
    options: ['16', '24', '64', '120'],
    correctIndex: 1,
    explanation:
      'In a serial schedule, all operations of one transaction execute consecutively without interleaving with any other transaction. Therefore, each permutation of the n transactions defines a unique serial schedule, yielding n! = 4! = 4 × 3 × 2 × 1 = 24 distinct serial schedules.',
  },
  {
    id: 'm4_q9',
    moduleId: 'm4',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Analyze schedule S = W1(X); R2(X); C2; A1 (where C2 = commit T2, A1 = abort T1). Which recoverability class does S violate, and what is the strict inclusion hierarchy of recoverability classes?',
    codeOrSchema: 'S:  W1(X) -> R2(X) -> Commit(T2) -> Abort(T1)',
    options: [
      'S is Recoverable but not Cascadeless; hierarchy is Recoverable ⊂ Cascadeless ⊂ Strict',
      'S is Non-Recoverable (T2 committed after reading uncommitted X from T1, which later aborted); hierarchy is Strict ⊂ Cascadeless (ACA) ⊂ Recoverable',
      'S is Cascadeless but not Strict; hierarchy is Strict ⊂ Recoverable ⊂ Cascadeless',
      'S is Strict because T2 only performed a read on X',
    ],
    correctIndex: 1,
    explanation:
      'A schedule is Recoverable iff every transaction T2 that reads an item written by T1 commits ONLY AFTER T1 commits. Because T2 committed before T1 aborted, T2\'s committed effects cannot be undone, making S Non-Recoverable. The proper subset hierarchy (Elmasri Ch. 20) is Strict ⊂ Cascadeless (Avoids Cascading Aborts) ⊂ Recoverable.',
  },
  {
    id: 'm4_q10',
    moduleId: 'm4',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Consider schedule S = W1(X); W2(X); C1; C2 (no reads). Is S Cascadeless (ACA), and is S Strict?',
    codeOrSchema: 'S:  W1(X) -> W2(X) -> Commit(T1) -> Commit(T2)',
    options: [
      'Both Cascadeless and Strict',
      'Cascadeless (no dirty reads occur), but NOT Strict (T2 overwrote uncommitted X written by T1 before T1 committed/aborted)',
      'Strict, but NOT Cascadeless',
      'Neither Recoverable nor Cascadeless',
    ],
    correctIndex: 1,
    explanation:
      'Cascadeless (ACA) schedules forbid reading an item written by an uncommitted transaction; since S has zero dirty reads, S is Cascadeless (and Recoverable). However, a Strict schedule forbids BOTH reading AND writing an item until the last transaction that wrote it commits or aborts. Because W2(X) overwrites W1(X) before T1 commits (making simple BFIM restoration fail if T1 aborts), S is NOT Strict.',
  },
  {
    id: 'm4_q11',
    moduleId: 'm4',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Numerical/Trace: Construct the Precedence Graph for S = R1(X); R2(X); W2(X); R1(Y); W1(Y). Is S conflict serializable?',
    codeOrSchema: 'S:  R1(X) -> R2(X) -> W2(X) -> R1(Y) -> W1(Y)',
    options: [
      'NOT conflict serializable because R1(X) and R2(X) create a bidirectional cycle',
      'Conflict serializable; only edge is T1 -> T2 (from R1(X) before W2(X)), so equivalent serial schedule is T1 -> T2',
      'Conflict serializable; only edge is T2 -> T1, so equivalent serial schedule is T2 -> T1',
      'NOT conflict serializable because T1 and T2 access different items X and Y',
    ],
    correctIndex: 1,
    explanation:
      'Two operations conflict iff they belong to different transactions, access the same item, and at least one is a WRITE. R1(X) and R2(X) do NOT conflict (both are reads). On X, R1(X) precedes W2(X), adding a single directed edge T1 -> T2. On Y, only T1 touches Y. The graph has no cycle, proving S is conflict serializable with serial equivalent T1 -> T2.',
  },
  {
    id: 'm4_q12',
    moduleId: 'm4',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'How does View Serializability relate to Conflict Serializability, and what operation pattern makes a schedule view-serializable without being conflict-serializable?',
    options: [
      'Every view-serializable schedule is conflict-serializable; they are identical sets',
      'Every conflict-serializable schedule is view-serializable, but the converse is false—a schedule with "blind writes" (writing an item without reading it first) can be view-serializable despite having a cycle in its precedence graph',
      'Conflict serializability is strictly weaker than view serializability',
      'View serializability can be tested in O(n) polynomial time using a wait-for graph',
    ],
    correctIndex: 1,
    explanation:
      'Conflict Serializability ⊂ View Serializability (Elmasri Ch. 20). Any schedule that is view-serializable yet NOT conflict-serializable MUST contain blind writes (e.g., S = R1(X); W2(X); W1(X); W3(X), which is view-equivalent to T1 -> T2 -> T3 because W3(X) performs the final blind write). Testing view serializability is NP-complete, so DBMSs enforce conflict serializability in practice.',
  },
  {
    id: 'm4_q13',
    moduleId: 'm4',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Which Two-Phase Locking (2PL) variant guarantees BOTH conflict serializability AND strictness (zero cascading rollbacks) by holding all Exclusive (X) locks until the transaction commits or aborts, while still permitting early release of Shared (S) locks?',
    options: [
      'Basic 2PL',
      'Strict 2PL',
      'Conservative (Static) 2PL',
      'Non-locking Timestamp Ordering',
    ],
    correctIndex: 1,
    explanation:
      'Strict 2PL follows the 2PL rule and additionally holds all Exclusive (write) locks until after COMMIT or ABORT, guaranteeing strict schedules (zero dirty reads or dirty overwrites). Rigorous 2PL holds BOTH S and X locks until commit/abort (even simpler to implement), Basic 2PL allows early release of X locks (risking cascading aborts), and Conservative 2PL pre-locks all items upfront to prevent deadlocks.',
  },
  {
    id: 'm4_q14',
    moduleId: 'm4',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Numerical/Trace: Two transactions have timestamps TS(T1) = 5 (older) and TS(T2) = 12 (younger). Suppose T2 currently holds an X-lock on item A, and T1 requests X(A). Compare the exact actions taken under Wait-Die versus Wound-Wait.',
    codeOrSchema: 'TS(T1) = 5 (older)  |  TS(T2) = 12 (younger)  |  T2 holds X(A), T1 requests X(A)',
    options: [
      'Wait-Die: T1 aborts; Wound-Wait: T1 waits',
      'Wait-Die: T1 waits for T2 (older waits); Wound-Wait: T1 wounds/aborts T2 (older preempts younger)',
      'Wait-Die: T2 aborts; Wound-Wait: T2 waits',
      'Both Wait-Die and Wound-Wait abort T1 to avoid starvation',
    ],
    correctIndex: 1,
    explanation:
      'Under Wait-Die (non-preemptive), an older requester waits for a younger holder (TS(T1) < TS(T2) => T1 waits), whereas a younger requester dies (aborts). Under Wound-Wait (preemptive), an older requester wounds/aborts a younger holder (TS(T1) < TS(T2) => T2 is aborted and releases A to T1), whereas a younger requester waits.',
  },
  {
    id: 'm4_q15',
    moduleId: 'm4',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'In Wait-Die and Wound-Wait deadlock prevention, why MUST an aborted transaction keep its ORIGINAL timestamp when it restarts instead of receiving a brand-new timestamp?',
    options: [
      'To minimize log file size on disk',
      'To guarantee freedom from Starvation (livelock), ensuring the restarted transaction eventually becomes the oldest in the system and succeeds',
      'Because SQL forbids assigning new timestamps after a rollback',
      'To ensure the transaction runs under Thomas Write Rule',
    ],
    correctIndex: 1,
    explanation:
      'If a rolled-back transaction were issued a newer (larger) timestamp on every restart, it would always remain "young" and could be repeatedly aborted forever (starvation). Retaining its original timestamp guarantees that after all older transactions finish, it becomes the oldest transaction in the system and cannot be aborted again.',
  },
  {
    id: 'm4_q16',
    moduleId: 'm4',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Numerical/Trace: Under Basic Timestamp Ordering (BTO), data item X currently has read_TS(X) = 15 and write_TS(X) = 10. Transaction T_mid with TS(T_mid) = 12 attempts to execute W(X). What does BTO do?',
    codeOrSchema: 'Item X: read_TS(X) = 15, write_TS(X) = 10  |  T_mid (TS = 12) executes W(X)',
    options: [
      'Allows W(X) and sets write_TS(X) = 12',
      'Ignores W(X) using Thomas Write Rule and lets T_mid proceed',
      'Rejects W(X) and aborts/rolls back T_mid (restarting with a new timestamp) because read_TS(X) > TS(T_mid)',
      'Blocks T_mid in a lock wait queue until TS = 15 commits',
    ],
    correctIndex: 2,
    explanation:
      'In Basic Timestamp Ordering (Elmasri Ch. 21), when Ti executes W(X), the DBMS checks if read_TS(X) > TS(Ti) OR write_TS(X) > TS(Ti). Here read_TS(X) = 15 > 12 means a younger transaction already read the previous value of X that T_mid is trying to retroactively overwrite. Even under Thomas Write Rule, read_TS(X) > TS(Ti) ALWAYS forces an abort and rollback of Ti.',
  },
  {
    id: 'm4_q17',
    moduleId: 'm4',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Numerical/Trace: Data item Y has read_TS(Y) = 10 and write_TS(Y) = 20. Transaction T_old with TS(T_old) = 15 issues W(Y). How does Thomas\'s Write Rule differ from Basic Timestamp Ordering here?',
    codeOrSchema: 'Item Y: read_TS(Y) = 10, write_TS(Y) = 20  |  T_old (TS = 15) executes W(Y)',
    options: [
      'Both Basic TO and Thomas Write Rule abort T_old',
      'Basic TO aborts T_old because write_TS(Y) > TS(T_old); Thomas Write Rule safely IGNORES the obsolete W(Y) (since read_TS(Y) <= 15 < 20 = write_TS(Y)) and allows T_old to continue',
      'Thomas Write Rule overwrites Y and lowers write_TS(Y) back to 15',
      'Basic TO accepts W(Y) while Thomas Write Rule aborts T_old',
    ],
    correctIndex: 1,
    explanation:
      'Because read_TS(Y) = 10 <= TS(T_old) = 15, no younger transaction read the value between TS 15 and TS 20, and a younger transaction (TS=20) has already overwritten Y. Under Basic TO, write_TS(Y) > TS(T_old) triggers an abort; under Thomas\'s Write Rule, the outdated write is simply ignored as if T_old had written before TS 20 and been overwritten, increasing concurrency (view-serializable!).',
  },
  {
    id: 'm4_q18',
    moduleId: 'm4',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'In the Multiple Granularity Locking (MGL) compatibility matrix (IS, IX, S, SIX, X), if Transaction T1 holds a SIX (Shared + Intention Exclusive) lock on Table EMP, which lock mode(s) can Transaction T2 concurrently acquire on Table EMP?',
    codeOrSchema: 'MGL Modes: { IS, IX, S, SIX, X }  |  T1 holds SIX(Table EMP)',
    options: [
      'IS and S',
      'IS only',
      'IS and IX',
      'No lock mode is compatible with SIX',
    ],
    correctIndex: 1,
    explanation:
      'A SIX lock means T1 reads the entire table in S mode while intending to acquire X locks on selected lower-level rows. Another transaction T2 holding IS only intends to read individual rows (compatible with T1\'s S, and row-level X/S conflicts will be checked at row level). By contrast, IX/X could write rows T1 is reading, and S/SIX would read the whole table while T1 is modifying rows—so ONLY IS is compatible with SIX.',
  },
  {
    id: 'm4_q19',
    moduleId: 'm4',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'In Recovery Buffer Management categorization (Elmasri Ch. 22), what exact (Steal/No-Steal, Force/No-Force) policy combination describes Immediate Update (UNDO/REDO) recovery—and why do commercial DBMSs prefer it?',
    options: [
      'No-Steal / Force — requires neither UNDO nor REDO',
      'Steal / No-Force — allows flushing uncommitted dirty pages when RAM is full (requiring UNDO) and avoids forcing all dirty pages on commit (requiring REDO), maximizing runtime throughput',
      'No-Steal / No-Force — requires NO-UNDO / REDO (Deferred Update)',
      'Steal / Force — requires UNDO / NO-REDO',
    ],
    correctIndex: 1,
    explanation:
      'Commercial engines (and ARIES / Immediate Update) choose Steal / No-Force: Steal permits the buffer manager to evict uncommitted dirty pages to disk under memory pressure (requiring UNDO on crash), and No-Force avoids expensive synchronous random disk writes of all modified data pages at commit time—flushing only the sequential WAL record instead (requiring REDO on crash).',
  },
  {
    id: 'm4_q20',
    moduleId: 'm4',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Under the Write-Ahead Logging (WAL) protocol in Immediate Update recovery, which rule MUST hold before a dirty data page modified by an uncommitted transaction can be flushed to disk?',
    options: [
      'The transaction must already have written its [commit] record',
      'The corresponding log record containing the Before-Image (BFIM) MUST already be forced to stable disk storage before the dirty page overwrites the disk block',
      'All other active transactions must be paused for a sharp checkpoint',
      'Only the After-Image (AFIM) needs to be buffered in volatile RAM',
    ],
    correctIndex: 1,
    explanation:
      'WAL enforces two strict rules (Elmasri Ch. 22): (1) Before overwriting an item on disk with an uncommitted update, the UNDO log entry (BFIM) must be flushed to stable disk so the change can be rolled back if a crash occurs; (2) Before a transaction reaches Committed state, all its REDO log entries (AFIM) and its [commit] record must be flushed to stable disk.',
  },
  {
    id: 'm4_q21',
    moduleId: 'm4',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt:
      'Part B Analytical (Numerical/Graph): Given the 3-transaction schedule S below, identify ALL directed edges in its Precedence Graph, determine whether S is conflict serializable, and give the equivalent serial schedule.',
    codeOrSchema:
      'S:  R1(X); R2(Z); R1(Z); R3(X); R3(Y); W1(X); W3(Y); R2(Y); W2(Z); W2(Y)',
    options: [
      'Edges: { T1->T3, T3->T2, T1->T2 }; Acyclic; Serial order: T1 -> T3 -> T2',
      'Edges: { T3->T1, T3->T2, T1->T2 }; Acyclic; Unique equivalent serial order: T3 -> T1 -> T2',
      'Edges: { T3->T1, T1->T2, T2->T3 }; Cycle exists; NOT conflict serializable',
      'Edges: { T2->T1, T1->T3 }; Acyclic; Serial order: T2 -> T1 -> T3',
    ],
    correctIndex: 1,
    explanation:
      'Step 1 (Conflicts on X): Operations are R1(X), R3(X), W1(X). Only cross-transaction conflict is R3(X) before W1(X) => edge T3 -> T1.\nStep 2 (Conflicts on Y): Operations are R3(Y), W3(Y), R2(Y), W2(Y). R3(Y) before W2(Y), W3(Y) before R2(Y), and W3(Y) before W2(Y) all yield edge T3 -> T2.\nStep 3 (Conflicts on Z): Operations are R2(Z), R1(Z), W2(Z). R2(Z) & R1(Z) do not conflict; R1(Z) before W2(Z) yields edge T1 -> T2.\nStep 4 (Cycle & Topological Sort): Graph edges are {T3 -> T1, T3 -> T2, T1 -> T2}, which is acyclic (in-degrees: T3=0, T1=1, T2=2). Thus S IS conflict serializable with unique equivalent serial schedule T3 -> T1 -> T2.',
  },
  {
    id: 'm4_q22',
    moduleId: 'm4',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt:
      'Part B Analytical: Trace Strict 2PL on concurrent operations: T1 (TS=10): R1(A), W1(B), C1; T2 (TS=20): R2(B), W2(A), C2 arriving in interleaved order R1(A); R2(B); W1(B); W2(A). Where do lock grants/blocks occur, what does the Wait-For Graph show, and how do Wait-Die vs Wound-Wait resolve it?',
    codeOrSchema:
      'Interleaving:  R1(A) -> R2(B) -> W1(B) -> W2(A)\nTimestamps:    TS(T1) = 10 (older), TS(T2) = 20 (younger)',
    options: [
      'No deadlock occurs because Strict 2PL releases S(A) immediately after R1(A)',
      'T1 gets S(A), T2 gets S(B); W1(B) blocks waiting for T2 (edge T1 -> T2); W2(A) blocks waiting for T1 (edge T2 -> T1) -> DEADLOCK cycle T1 <-> T2. Under Wait-Die: T1 waits on W1(B) and younger T2 aborts on W2(A); under Wound-Wait: older T1 immediately wounds/aborts T2 on W1(B)',
      'Deadlock occurs on R2(B); Wait-Die aborts older T1 while Wound-Wait makes T1 wait',
      'Only T1 blocks; Wait-For Graph has edge T1 -> T2 with no cycle',
    ],
    correctIndex: 1,
    explanation:
      'Step 1 (Lock Acquisition under Strict 2PL): On R1(A), T1 acquires S(A). On R2(B), T2 acquires S(B). Note: even if S locks could release early in Strict 2PL, neither T1 nor T2 has finished its growing phase yet (T1 still needs X(B), T2 still needs X(A)), so 2PL forbids releasing S(A) or S(B)!\nStep 2 (Blocking & Wait-For Graph): On W1(B), T1 requests X(B), which conflicts with T2\'s S(B) -> T1 blocks (WFG edge T1 -> T2). On W2(A), T2 requests X(A), conflicting with T1\'s S(A) -> T2 blocks (WFG edge T2 -> T1). Cycle T1 -> T2 -> T1 confirms DEADLOCK.\nStep 3 (Prevention): Under Wait-Die, older T1 waits on W1(B), and when younger T2 requests X(A) held by older T1, T2 dies (aborts). Under Wound-Wait, as soon as older T1 requests X(B) held by younger T2, T1 preemptively wounds/aborts T2 and proceeds.',
  },
  {
    id: 'm4_q23',
    moduleId: 'm4',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt:
      'Part B Analytical (Numerical): Initial disk values are X = 100, Y = 200, Z = 300. An Immediate Update (UNDO/REDO) WAL log contains:\n1:[start,T1] 2:[write,T1,X,100,120] 3:[commit,T1] 4:[start,T2] 5:[write,T2,Y,200,250] 6:[checkpoint] 7:[start,T3] 8:[write,T3,Z,300,340] 9:[commit,T2] 10:[start,T4] 11:[write,T4,X,120,180] 12:CRASH.\nAfter crash recovery completes, what are the exact REDO list, UNDO list, and final recovered values of (X, Y, Z)?',
    codeOrSchema:
      'Initial: X=100, Y=200, Z=300  |  [write, Ti, item, BFIM, AFIM]\nLog: [start,T1] [write,T1,X,100,120] [commit,T1] [start,T2] [write,T2,Y,200,250]\n     [checkpoint] [start,T3] [write,T3,Z,300,340] [commit,T2] [start,T4] [write,T4,X,120,180] CRASH',
    options: [
      'REDO = {T1, T2}; UNDO = {T3, T4}; Final: X = 120, Y = 250, Z = 300',
      'REDO = {T2}; UNDO = {T3, T4}; Final: X = 120, Y = 250, Z = 300',
      'REDO = {T2}; UNDO = {T4}; Final: X = 120, Y = 250, Z = 340',
      'REDO = {T1, T2, T3}; UNDO = {T4}; Final: X = 100, Y = 250, Z = 340',
    ],
    correctIndex: 1,
    explanation:
      'Step 1 (Classify Transactions at Checkpoint): T1 committed BEFORE [checkpoint], so its updates (X = 120) were already forced to disk at checkpoint—T1 needs neither REDO nor UNDO.\nStep 2 (REDO List): T2 was active at [checkpoint] and has [commit, T2] before crash -> add T2 to REDO, applying AFIM Y = 250.\nStep 3 (UNDO List): T3 and T4 started after [checkpoint] and have NO [commit] record -> add T3 and T4 to UNDO. Scanning backward restores T4\'s BFIM (X = 120) and T3\'s BFIM (Z = 300).\nStep 4 (Final State): REDO = {T2}, UNDO = {T3, T4}, leaving consistent disk values X = 120, Y = 250, Z = 300.',
  },
  {
    id: 'm4_q24',
    moduleId: 'm4',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt:
      'Part B Analytical: Compare all four Two-Phase Locking variants (Basic 2PL, Conservative/Static 2PL, Strict 2PL, Rigorous 2PL) across Serializability, Deadlock Freedom, and Cascading Rollback Immunity. Which summary is 100% accurate?',
    codeOrSchema: 'Compare: Basic 2PL  |  Conservative 2PL  |  Strict 2PL  |  Rigorous 2PL',
    options: [
      'All four variants prevent deadlocks, and only Basic 2PL suffers cascading rollbacks',
      'All four guarantee Conflict Serializability; ONLY Conservative 2PL is deadlock-free (by pre-locking all items atomically before start); Strict 2PL (holds X locks to commit) and Rigorous 2PL (holds S & X locks to commit) prevent cascading rollbacks, whereas Basic 2PL suffers both deadlocks and cascading rollbacks',
      'Strict 2PL is deadlock-free; Conservative 2PL allows deadlocks; Rigorous 2PL does not guarantee serializability',
      'Basic 2PL guarantees strict schedules; Rigorous 2PL guarantees deadlock freedom',
    ],
    correctIndex: 1,
    explanation:
      'Step 1 (Common Guarantee): Every 2PL protocol enforces a growing phase followed by a shrinking phase, which mathematically guarantees Conflict Serializability (no cycle in the precedence graph).\nStep 2 (Deadlock Freedom): ONLY Conservative (Static) 2PL is deadlock-free because a transaction acquires ALL needed locks atomically before executing (or waits without holding any lock); Basic, Strict, and Rigorous 2PL can all deadlock and require Wait-For Graph detection, timeouts, or Wait-Die/Wound-Wait prevention.\nStep 3 (Cascading Rollbacks): Basic 2PL permits releasing X locks before commit (risking dirty reads and cascading aborts), whereas Strict 2PL (holds X until commit/abort) and Rigorous 2PL (holds both S and X until commit/abort) guarantee strict schedules with zero cascading rollbacks.',
  },

  // ==========================================================================
  // MODULE 5: Distributed and NoSQL Databases (15 new questions: m5_q5..m5_q19)
  // ==========================================================================
  {
    id: 'm5_q5',
    moduleId: 'm5',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'In Distributed DBMS Transparency levels (Elmasri Ch. 23), what does Location Transparency guarantee to application developers and end users?',
    options: [
      'Users must manually specify the physical network IP address of each fragment in SQL queries',
      'Users can query logical relations or fragments without needing to know which physical site(s) store the data',
      'Every table is automatically duplicated at every site in the cluster',
      'Network partitions are physically impossible across wide-area links',
    ],
    correctIndex: 1,
    explanation:
      'Distributed transparency hides distribution complexity in layers: Fragmentation (Distribution) Transparency hides how relations are partitioned; Location Transparency hides the physical site where each fragment resides so data can migrate across sites without breaking queries; and Replication Transparency hides the existence of multiple copies of a fragment.',
  },
  {
    id: 'm5_q6',
    moduleId: 'm5',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'How does Derived Horizontal Fragmentation differ from Primary Horizontal Fragmentation, and what correctness rule is mandatory for Vertical Fragmentation?',
    options: [
      'Derived horizontal fragmentation splits columns; vertical fragmentation splits rows using UNION',
      'Derived horizontal fragmentation partitions a member relation (e.g., EMPLOYEE) using a semijoin with the horizontal fragments of its owner relation (e.g., DEPARTMENT); vertical fragmentation splits attributes and MUST repeat the Primary Key in every fragment so the original table reconstructs via Natural Join (⋈)',
      'Derived horizontal fragmentation forbids foreign keys; vertical fragmentation omits the primary key to save space',
      'Both horizontal and vertical fragmentation reconstruct the global table using Cartesian Product (×)',
    ],
    correctIndex: 1,
    explanation:
      'Primary horizontal fragmentation applies selection predicates directly on a relation\'s own attributes, whereas Derived Horizontal Fragmentation partitions a child relation based on the horizontal fragmentation of a parent relation via semijoin (co-locating related rows at the same site to speed joins). Vertical fragmentation projects column subsets and MUST include the primary key (or tuple ID) in every fragment for lossless Natural Join reconstruction.',
  },
  {
    id: 'm5_q7',
    moduleId: 'm5',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'In Distributed Data Allocation, what is the primary performance trade-off of moving from No Replication to Full Replication across N sites?',
    options: [
      'Write latency decreases while read latency increases',
      'Local read queries become very fast and fault-tolerant (high availability), but every update/write incurs heavy synchronization and network broadcast overhead across all N replicas',
      'Storage cost decreases by a factor of N',
      'Distributed deadlocks are completely eliminated',
    ],
    correctIndex: 1,
    explanation:
      'Full replication places a copy of the entire database at every site: read queries execute locally with zero network transfer and survive site failures, but every write must propagate updates and maintain consistency across all N copies. Partial replication balances this by replicating read-heavy fragments widely while keeping write-heavy fragments at fewer sites.',
  },
  {
    id: 'm5_q8',
    moduleId: 'm5',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Numerical: A distributed database uses Quorum Consensus voting across V = 9 equal-weight replicas with read quorum V_r = 4. What is the MINIMUM write quorum V_w required to guarantee strict read-write and write-write consistency?',
    codeOrSchema: 'V = 9 replicas  |  Read quorum V_r = 4  |  Rules: V_r + V_w > V  AND  2·V_w > V',
    options: ['V_w = 4', 'V_w = 5', 'V_w = 6', 'V_w = 9'],
    correctIndex: 2,
    explanation:
      'Quorum consensus (Elmasri Ch. 23, Distributed Concurrency Control) enforces two inequalities: (1) V_r + V_w > V so every read intersects the latest write (4 + V_w > 9 => V_w >= 6), and (2) 2·V_w > V so no two concurrent writes can both succeed (2·V_w > 9 => V_w >= 5). Satisfying both simultaneously requires a minimum write quorum of V_w = 6.',
  },
  {
    id: 'm5_q9',
    moduleId: 'm5',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Why is Two-Phase Commit (2PC) classified as a BLOCKING atomic commit protocol?',
    options: [
      'Because participants must wait for all network routers to reboot before voting',
      'Because if the Coordinator crashes after participants have voted YES (entering the READY/UNCERTAIN state) and before sending Global Commit/Abort, participants cannot safely decide unilaterally and must hold locks until the Coordinator recovers',
      'Because 2PC forbids more than two participating sites',
      'Because 2PC requires three full network round-trips before voting',
    ],
    correctIndex: 1,
    explanation:
      'Once a participant force-writes [ready] and sends YES in Phase 1, it surrenders unilateral abort rights because the coordinator may have already logged [commit] and notified other sites. If the coordinator crashes before broadcasting the decision, uncertain participants remain blocked holding locks until the coordinator recovers (the classic 2PC blocking window).',
  },
  {
    id: 'm5_q10',
    moduleId: 'm5',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'How does the Three-Phase Commit (3PC) protocol eliminate 2PC\'s blocking problem under fail-stop site crashes, and what major distributed failure can STILL break 3PC?',
    options: [
      '3PC removes the voting phase; it cannot handle single-node crashes',
      '3PC inserts an intermediate PRE-COMMIT phase plus timeout rules so no participant can be in Commit while another is still in Uncertain/Wait, making it non-blocking under fail-stop crashes—but a network partition (split-brain) can still cause inconsistent decisions',
      '3PC guarantees non-blocking consensus even across arbitrary network partitions and Byzantine failures',
      '3PC replaces coordinator logs with client-side cookies',
    ],
    correctIndex: 1,
    explanation:
      '3PC splits Phase 2 into Prepare-to-Commit (PRE-COMMIT) and Do-Commit, establishing the invariant that if ANY site has committed, every other operational site has at least reached Pre-Commit. Under fail-stop crashes with bounded message delays, a newly elected coordinator can safely finish the protocol without blocking; however, during a network partition, two isolated sides can time out to opposite decisions (commit vs abort).',
  },
  {
    id: 'm5_q11',
    moduleId: 'm5',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Numerical: Site 1 holds EMPLOYEE (10,000 tuples × 100 bytes = 1,000,000 B; join key Dno = 4 B). Site 2 holds filtered DEPARTMENT (10 distinct Dno keys). Only 200 EMPLOYEE tuples match those 10 keys, and the final result is required at Site 2. How many total bytes are transferred over the network using Semijoin (EMPLOYEE ⋉ DEPARTMENT) versus shipping all of EMPLOYEE naively?',
    codeOrSchema:
      'Site 1: EMPLOYEE (10,000 rows × 100 B, Dno = 4 B)  |  200 rows match\nSite 2: Filtered DEPARTMENT (10 distinct Dno keys)  |  Target: Site 2',
    options: [
      'Semijoin: 20,000 B vs Naive: 1,000,000 B',
      'Semijoin: 20,040 B (40 B keys + 20,000 B matching rows) vs Naive: 1,000,000 B (979,960 B saved)',
      'Semijoin: 40,000 B vs Naive: 200,000 B',
      'Semijoin transfers more bytes than Naive whenever selectivity is below 50%',
    ],
    correctIndex: 1,
    explanation:
      'Naive transfer ships all of EMPLOYEE from Site 1 to Site 2 = 10,000 × 100 = 1,000,000 bytes. Semijoin optimization executes in two network trips: (1) Ship π_Dno(DEPARTMENT) from Site 2 -> Site 1 = 10 × 4 = 40 bytes; (2) Filter EMPLOYEE locally at Site 1 and ship only the 200 matching tuples back to Site 2 = 200 × 100 = 20,000 bytes. Total Semijoin cost = 20,040 bytes, cutting network traffic by ~98%.',
  },
  {
    id: 'm5_q12',
    moduleId: 'm5',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Under the CAP Theorem, during a network partition between two data centers, how do CP datastores (e.g., HBase, ZooKeeper, MongoDB with majority write concern) behave compared to AP datastores (e.g., Cassandra, DynamoDB, CouchDB)?',
    options: [
      'CP systems serve stale reads to stay available; AP systems refuse all writes until the link heals',
      'CP systems sacrifice Availability on the minority/partitioned side (rejecting writes/reads) to guarantee linearizable Consistency; AP systems sacrifice strong Consistency (accepting writes on both sides and reconciling later via eventual consistency/vector clocks) to stay Available',
      'CP systems disable Partition Tolerance while AP systems disable Durability',
      'Both CP and AP systems guarantee all three of C, A, and P simultaneously during a partition',
    ],
    correctIndex: 1,
    explanation:
      'When a network partition (P) splits a cluster, nodes cannot synchronize state across the cut. A CP system blocks or rejects operations on any side that cannot reach quorum so no client observes stale/divergent data; an AP system continues serving reads and writes on all reachable nodes and resolves divergence asynchronously once healed (Eventual Consistency / BASE).',
  },
  {
    id: 'm5_q13',
    moduleId: 'm5',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'In NoSQL modeling (Elmasri Ch. 24), which three NoSQL families are classified as "Aggregate-Oriented" (grouping related data into a single unit for sharding and atomic single-aggregate updates), and which family is NOT aggregate-oriented?',
    options: [
      'Aggregate-oriented: Relational, Graph, Document; Non-aggregate: Key-Value',
      'Aggregate-oriented: Key-Value, Document, and Column-Family; Non-aggregate: Graph databases (relationship-oriented)',
      'Aggregate-oriented: Graph, Column-Family, Key-Value; Non-aggregate: Document',
      'All four NoSQL families are strictly normalized 3NF non-aggregate models',
    ],
    correctIndex: 1,
    explanation:
      'Key-Value, Document, and Column-Family databases are Aggregate-Oriented: they encapsulate a domain entity and its nested child records (e.g., an Order with its OrderItems) inside a single aggregate that serves as the natural unit of horizontal sharding and atomic access. Graph databases are NOT aggregate-oriented—they store fine-grained nodes and rich interconnecting edges for complex traversal queries.',
  },
  {
    id: 'm5_q14',
    moduleId: 'm5',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Compare NoSQL Distribution Models: what advantage does Peer-to-Peer Replication (e.g., Cassandra) offer over Master-Slave (Primary-Secondary) Replication?',
    options: [
      'Peer-to-Peer guarantees zero write conflicts without vector clocks or timestamps',
      'Peer-to-Peer eliminates the single-point-of-failure write bottleneck of a single Master node, allowing any replica to accept writes for high write availability (at the cost of managing replica write conflicts)',
      'Peer-to-Peer forbids horizontal sharding',
      'Peer-to-Peer stores all data on a single centralized disk array',
    ],
    correctIndex: 1,
    explanation:
      'In Master-Slave replication, all writes route through one Master node, simplifying consistency but creating a write bottleneck and failover delay if the Master crashes. Peer-to-Peer replication lets any node accept reads and writes, maximizing write resilience and availability while relying on tunable quorums (R + W > N), hinted handoff, or conflict resolution (LWW / vector clocks) to reconcile concurrent updates.',
  },
  {
    id: 'm5_q15',
    moduleId: 'm5',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'In the MapReduce distributed programming model (Elmasri Ch. 24), what happens during the Shuffle & Sort phase between Map and Reduce?',
    options: [
      'Raw input files are split into HDFS blocks for the first time',
      'Intermediate <key, value> pairs emitted by all Map tasks are partitioned by key, transferred across the network, sorted, and grouped into <key, list(values)> before being passed to Reduce tasks',
      'Final Reducer results are deleted from distributed storage',
      'Map functions are bypassed whenever a Combiner is absent',
    ],
    correctIndex: 1,
    explanation:
      'MapReduce executes in three main stages: Map transforms each input split into intermediate <key, value> pairs; Shuffle & Sort automatically partitions, transfers, sorts, and aggregates all values sharing the same key into <key, [v1, v2, ...]>; and Reduce iterates over each key\'s value list to emit the final aggregated output. An optional local Combiner pre-aggregates map outputs before network shuffle to cut bandwidth.',
  },
  {
    id: 'm5_q16',
    moduleId: 'm5',
    part: 'Part A (Short)',
    marks: 2,
    prompt:
      'Which NoSQL database family organizes data into nested sparse columns grouped inside Column Families (e.g., Apache Cassandra, Apache HBase) indexed by a Row Key and Timestamp, excelling at massive write-heavy analytical/event logs?',
    options: [
      'Key-Value store (e.g., Redis)',
      'Document store (e.g., MongoDB)',
      'Column-Family (Wide-Column) store',
      'Property Graph store (e.g., Neo4j)',
    ],
    correctIndex: 2,
    explanation:
      'Column-Family (Wide-Column) databases such as HBase (modeled after Google Bigtable) and Cassandra store rows identified by a Row Key where each row can contain thousands of dynamically named, timestamp-versioned columns organized into Column Families on LSM-tree storage—delivering high write throughput and efficient column-slice scans.',
  },
  {
    id: 'm5_q17',
    moduleId: 'm5',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt:
      'Part B Analytical: A global relation ACCOUNT(AccNo PK, Branch, Balance, CustName, KYC_Doc) is distributed across Chennai and Delhi sites.\n(1) Horizontal fragments: H1 = σ_{Branch="Chennai"}(ACCOUNT), H2 = σ_{Branch="Delhi"}(ACCOUNT) (only two branches exist).\n(2) Vertical fragments: V1 = π_{AccNo, Branch, Balance}(ACCOUNT), V2 = π_{AccNo, CustName, KYC_Doc}(ACCOUNT).\n(3) During a cross-site fund transfer using 2PC, both Chennai and Delhi vote YES (READY), then the Coordinator crashes before writing [commit].\nWhich analysis of fragmentation correctness and 2PC failure behavior is completely accurate?',
    codeOrSchema:
      'ACCOUNT(AccNo PK, Branch, Balance, CustName, KYC_Doc)\nH1, H2: Branch="Chennai" / "Delhi"  |  V1: (AccNo,Branch,Balance), V2: (AccNo,CustName,KYC_Doc)\n2PC Failure: Coordinator crashes after both sites log [ready] and send YES',
    options: [
      'H1/H2 reconstruct via Natural Join; V1/V2 violate disjointness because AccNo is repeated; Chennai and Delhi safely commit immediately on timeout',
      'H1/H2 satisfy Completeness, Disjointness, and Reconstruction via Union (H1 ∪ H2); V1/V2 satisfy Completeness, PK-overlap Disjointness, and Reconstruction via Natural Join (V1 ⋈ V2) because PK AccNo is included in both; under 2PC both sites enter a BLOCKED (uncertain) state holding locks until the Coordinator recovers',
      'V1/V2 cannot reconstruct ACCOUNT unless Branch is also duplicated in V2; under 2PC participants unilaterally abort after 1 second',
      'H1/H2 fail completeness; V1/V2 reconstruct via Union (V1 ∪ V2); 2PC never blocks when all sites vote YES',
    ],
    correctIndex: 1,
    explanation:
      'Step 1 (Horizontal Correctness): Because Chennai and Delhi exhaust all branches and are mutually exclusive, H1 and H2 satisfy Completeness (every row present), Disjointness (zero row overlap), and Reconstruction (ACCOUNT = H1 ∪ H2).\nStep 2 (Vertical Correctness): Every attribute appears in V1 or V2 (Completeness), non-key attributes are strictly disjoint, and repeating primary key AccNo in BOTH fragments guarantees lossless Reconstruction via Natural Join (ACCOUNT = V1 ⋈_{AccNo} V2).\nStep 3 (2PC Coordinator Crash): Because both sites already forced [ready] and sent YES, neither knows whether the coordinator logged [commit] or [abort] before crashing; thus 2PC blocks both participants holding locks until the coordinator recovers and reads its log.',
  },
  {
    id: 'm5_q18',
    moduleId: 'm5',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt:
      'Part B Analytical: Match all FOUR NoSQL database types to their exact Data Model, typical CAP Bias, and canonical Production Use Case:\n(1) Key-Value (Redis/DynamoDB)\n(2) Document (MongoDB/CouchDB)\n(3) Column-Family (Cassandra/HBase)\n(4) Graph (Neo4j)',
    codeOrSchema: '4 NoSQL Families: Key-Value  |  Document  |  Column-Family  |  Graph',
    options: [
      '(1) Opaque value by key · AP/tunable · session caches & shopping carts; (2) Nested JSON/BSON docs with secondary indexes · CP (MongoDB majority) or AP (CouchDB) · catalogs & CMS; (3) Sparse wide columns in column families · AP (Cassandra) or CP (HBase) · massive time/event telemetry; (4) Nodes + typed edges with index-free adjacency · CA/CP (single-leader) · fraud rings & social graphs',
      '(1) Nodes + edges · CP · fraud rings; (2) Opaque blobs · AP · caches; (3) Strict 3NF tables · CA · payroll; (4) JSON documents · AP · IoT telemetry',
      'All four NoSQL types are strictly AP and forbid secondary indexing or transactions',
      '(1) Wide columns · CP; (2) Key-Value · CA; (3) Graph · AP; (4) Document · strictly relational joins',
    ],
    correctIndex: 0,
    explanation:
      'Step 1 (Key-Value): Maps a unique key to an opaque value blob for O(1) lookups (ideal for sessions, user preferences, carts; e.g., Redis, DynamoDB).\nStep 2 (Document): Stores self-describing nested JSON/BSON documents supporting field-level queries and secondary indexes (ideal for e-commerce catalogs, content management; MongoDB leans CP with majority quorum while CouchDB leans AP).\nStep 3 (Column-Family): Stores sparse column groups per row key on LSM trees (ideal for high-ingest event logs and telemetry; Cassandra is tunable AP while HBase on HDFS is CP).\nStep 4 (Graph): Models connected domains as nodes and directed edges with index-free adjacency (ideal for fraud detection, knowledge graphs, shortest-path routing; Neo4j is ACID/CA-CP).',
  },
  {
    id: 'm5_q19',
    moduleId: 'm5',
    part: 'Part B (Analytical)',
    marks: 10,
    prompt:
      'Part B Analytical (Numerical/Trace): Contrast ACID vs BASE, then trace a MapReduce job computing total revenue per Department from 4 distributed order lines:\nSplit 1: ("CSE", 500), ("ECE", 300)\nSplit 2: ("CSE", 700), ("ECE", 200)\nWhich statement correctly explains ACID vs BASE AND shows the exact Map, Shuffle/Sort, and Reduce outputs?',
    codeOrSchema:
      'Input Splits:\n  Split 1: (CSE, 500), (ECE, 300)\n  Split 2: (CSE, 700), (ECE, 200)',
    options: [
      'BASE enforces pessimistic 2PL locks on every replica; Reduce outputs ("CSE", 500) and ("ECE", 300) because splits are never merged',
      'ACID prioritizes strong immediate consistency via pessimistic locking/2PC (banking), whereas BASE prioritizes availability & horizontal scale via Soft State and Eventual Consistency (shopping carts/feeds). Map emits <"CSE",500>, <"ECE",300>, <"CSE",700>, <"ECE",200>; Shuffle groups <"CSE",[500,700]> & <"ECE",[300,200]>; Reduce emits <"CSE",1200> & <"ECE",500>',
      'ACID allows stale reads during partitions; Shuffle sums values before Map executes',
      'Map outputs <"CSE",1200> directly without a Shuffle phase; Reduce only sorts keys alphabetically',
    ],
    correctIndex: 1,
    explanation:
      'Step 1 (ACID vs BASE): ACID (Atomicity, Consistency, Isolation, Durability) guarantees strong immediate consistency via locks/2PC—mandatory for financial transfers—but reduces availability under partitions. BASE (Basically Available, Soft state, Eventual consistency) accepts temporary replica divergence so distributed reads/writes remain fast and highly available (ideal for social feeds, product views, carts).\nStep 2 (Map Phase): Each mapper parses its local split and emits <dept, amount>: Mapper 1 -> <"CSE", 500>, <"ECE", 300>; Mapper 2 -> <"CSE", 700>, <"ECE", 200>.\nStep 3 (Shuffle & Sort): The framework partitions and groups identical keys across the network into <"CSE", [500, 700]> and <"ECE", [300, 200]>.\nStep 4 (Reduce Phase): Each reducer sums its value list to output final totals <"CSE", 1200> and <"ECE", 500>.',
  },
];
