import type { TopicNote } from './noteTypes';

export const MODULE_5_NOTES: Record<string, TopicNote> = {
  'm5-t1': {
    summary:
      'A Distributed Database (DDB) is a collection of multiple, logically interrelated databases distributed over a computer network, managed by a Distributed DBMS (DDBMS) that hides physical distribution behind strict transparencies.',
    sourceDecks: [
      '202-5.md (Sections 1 & 2)',
      'BACSE202-DBS-Module-5.ppt',
    ],
    keyPoints: [
      {
        heading: 'DDBMS Core Definition & 3-Step Design Order',
        text: 'Users interact with ONE logical database over a communication network connecting Site 1, Site 2, ..., Site N. Design follows an iterative 3-step pipeline: (1) Fragmentation -> (2) Allocation -> (3) Replication.',
      },
      {
        heading: 'Four Distribution Transparencies',
        text: 'Location Transparency (no need to know site addresses), Fragmentation Transparency (queries target the global unfragmented schema), Replication Transparency (multiple physical copies act as one logical item), and Network/Distribution Transparency (system behaves like a centralized DBMS).',
      },
      {
        heading: 'Shared-Nothing Advantage Over Shared-Memory / Shared-Disk',
        text: 'Shared-Nothing nodes have private CPU, Memory (M), and Disk (D), communicating strictly via network messages. This removes shared memory-bus and disk-interconnect bottlenecks, powering horizontal scale-out in modern DDBMS and NoSQL clusters.',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Conceptual View of a Distributed Database System',
        body: 'A DDB is not simply a pile of disconnected files on separate servers—its databases are logically interrelated and coordinated so global applications query them seamlessly:',
        diagramId: 'm5-ddb-concept',
        diagramCaption: 'Conceptual view: Global applications query distributed Site 1–3 transparently as one logical database.',
      },
      {
        title: '2. Advantages vs. Challenges of a DDBMS',
        body: 'Compare why enterprises adopt a DDBMS over a single centralized server alongside the engineering trade-offs:',
        table: {
          headers: ['Advantages', 'Challenges / Disadvantages'],
          rows: [
            [
              'Higher Reliability & Availability: Replication ensures a single site crash does not bring down the system.',
              'Increased Complexity & Software Cost: Needs distributed query optimizers, deadlock detectors, and commit protocols.',
            ],
            [
              'Improved Performance (Data Localization): Storing data near heavy-access sites cuts latency and enables parallel execution.',
              'Communication Overhead: Inter-site network hops and message round-trips slow down distributed joins and commits.',
            ],
            [
              'Modular Scalability: Expand capacity incrementally by adding sites instead of replacing a costly central mainframe.',
              'Complex Integrity & Security: Enforcing global constraints and securing data across untrusted links is harder.',
            ],
            [
              'Local Autonomy: Regional branches control local operational data while still answering global queries.',
              'Concurrency & Recovery Difficulty: Coordinating locks and atomic commits across unreliable networks is non-trivial.',
            ],
          ],
        },
      },
      {
        title: '3. DDBMS Software & Network Architectures (Özsu & Valduriez)',
        body: 'Distributed systems vary along three orthogonal dimensions—**Autonomy** (tightly integrated, semiautonomous, totally isolated), **Distribution** (Client-Server vs. Peer-to-Peer), and **Heterogeneity** (hardware, OS, data model):',
        bullets: [
          '**Homogeneous vs. Heterogeneous DDBMS:** Homogeneous sites run the identical DBMS software (e.g., all Oracle or PostgreSQL) under a unified global schema. Heterogeneous (or **Federated / Multidatabase Systems — MDBMS**) unite different DBMS engines (e.g., Oracle at HQ + MySQL at branch + MongoDB for logs) using wrappers/translators while preserving local autonomy.',
          '**Client-Server (2-Tier vs. 3-Tier):** Two-tier routes SQL directly from client UI to DB servers. Three-tier inserts a middle Application/Routing tier (`UI -> Application Logic / Query Router -> Database Layer`); modern distributed/NoSQL tiers offload caching and routing here to prevent DB bottlenecks.',
          '**Peer-to-Peer (Fully Distributed):** No strict client/server split—every node runs full local DBMS software and participates equally in storage, query routing, and transaction coordination.',
          '**Centralized vs. Distributed Network Topology:** Centralized topology routes all remote sites into one central hub DB; distributed topology interconnects peer sites hosting local fragments and replicas.',
        ],
      },
      {
        title: '4. Hardware Memory-Sharing Architectures',
        body: 'Hardware topology explains why traditional single-box RDBMSs hit vertical scaling limits while Shared-Nothing powers horizontal NoSQL clusters:',
        diagramId: 'm5-hardware-arch',
        diagramCaption: 'Hardware memory-sharing topologies: Shared-Memory vs. Shared-Disk vs. Shared-Nothing.',
        bullets: [
          '**Shared Memory:** All CPUs share one global RAM space and disk pool; fast IPC, but memory-bus contention restricts it to vertical scaling.',
          '**Shared Disk:** Each CPU owns private RAM `M` while sharing a storage array `D`; isolates memory faults, though storage interconnect still limits scale.',
          '**Shared Nothing:** Every node owns private `CPU + RAM + Disk` and communicates exclusively by message passing—delivering independent failure domains and massive horizontal scale-out.',
        ],
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Nov 2026 FAT · Slot A1+TA1 · Q9 Part A [2M of 10M, CO4, BL2]',
        questionPrompt:
          'Q9(A): List two key advantages of a Distributed Database Management System (DDBMS) over a centralized DBMS architecture. [2 Marks] (Note: Parts B & C of A1 Q9 are covered under Module 5 Topic 2 — Data Fragmentation.)',
        solvingMethod: [
          'Step 1 — Understand Marks Allocation [2M]: Examiners award 1 mark per clear, distinct advantage backed by its architectural reason (do not just write single words without a one-line justification).',
          'Step 2 — Pick the Two Strongest Advantages from the DDBMS vs Centralized comparison: (1) **Higher Reliability & Availability:** In a centralized DBMS, one server crash halts the whole enterprise; in a DDBMS, data replication across multiple networked sites ensures uninterrupted access if one site fails. (2) **Improved Performance via Data Localization & Parallelism:** Data fragments are stored close to the branch/users that query them most, eliminating long-distance network bottlenecks and allowing sub-queries to execute in parallel across sites.',
          'Step 3 — Optional Bonus Insurance (if space allows): Mention **Modular / Incremental Scalability** (adding regional commodity nodes scales capacity smoothly compared to upgrading a single mainframe) or **Local Autonomy** while keeping answers crisp.',
        ],
        commonPitfalls:
          'Avoid vague points like "it is faster" or "it is cheaper." State WHY it is faster (data localization + parallel execution) and WHY reliability improves (replication prevents single point of failure).',
      },
    ],
    selfChecks: [
      {
        question:
          'A Chennai branch engineer runs `SELECT Ename FROM EMPLOYEE WHERE Dno = 5` without knowing whether `EMPLOYEE` is split across regional servers or which physical IP hosts `Dept 5`. Which two transparencies are demonstrated?',
        options: [
          'Fragmentation Transparency and Location Transparency',
          'Immediate Update and Deferred Update Transparency',
          'B+ Tree Split and Hash Collision Transparency',
          'Wait-Die and Wound-Wait Transparency',
        ],
        correctIndex: 0,
        explanation:
          'Querying the global table name without knowing it is partitioned is Fragmentation Transparency; querying without specifying physical site addresses is Location Transparency.',
      },
      {
        question:
          'Why do modern distributed NoSQL and NewSQL clusters overwhelmingly prefer a Shared-Nothing hardware architecture over Shared-Memory or Shared-Disk?',
        options: [
          'Shared-Nothing requires zero network communication between nodes',
          'Each node owns independent CPU, RAM, and Disk, eliminating shared bus/storage contention for linear horizontal scale-out',
          'Shared-Nothing forces all transactions to execute serially on a single CPU',
          'Shared-Nothing cannot replicate data across nodes',
        ],
        correctIndex: 1,
        explanation:
          'Shared-Memory and Shared-Disk architectures bottleneck on interconnect bus contention as nodes increase, whereas Shared-Nothing nodes scale out horizontally via message passing.',
      },
    ],
    exampleTitle: 'Transparency Trace on a Global Employee Query',
    exampleBody:
`\`\`\`sql
-- Query issued at Chennai client:
SELECT Ename, Salary FROM EMPLOYEE WHERE Dno = 5;
\`\`\`

1. **Fragmentation Transparency:** Query targets global \`EMPLOYEE\`, unaware it is split across regional or column fragments.
2. **Location Transparency:** User never specifies \`Site_Chennai\` or \`Site_Mumbai\` in the SQL statement.
3. **Replication Transparency:** DDBMS invisibly picks the healthiest, lowest-latency replica of \`Dept 5\`.
4. **3-Step Design Pipeline:** **(1) Fragmentation -> (2) Allocation -> (3) Replication**.`,
    examTip:
      'In Part-A questions, distinguish Reliability (probability a system runs without failure over time) from Availability (probability it is accessible at a given instant).',
  },

  'm5-t2': {
    summary:
      'Distributed Database Design splits global relations into fragments, replicates selected copies for fault tolerance, and allocates fragments across network sites to minimize communication cost and match read/write workloads.',
    sourceDecks: [
      '202-5.md (Section 3)',
      'BACSE202-DBS-Module-5.ppt',
    ],
    keyPoints: [
      {
        heading: 'Three Fragmentation Correctness Rules',
        text: 'Any fragmentation of relation R into {R1, R2, ..., Rn} must satisfy: (1) Completeness (every item in R appears in >=1 fragment), (2) Reconstruction (an algebraic operator restores R losslessly), and (3) Disjointness (no duplication except PKs in vertical fragments).',
      },
      {
        heading: 'Horizontal (σ + ∪), Vertical (π + PK + ⋈) & Mixed Fragmentation',
        text: 'Horizontal splits rows via Selection σ_Pi(R) and reconstructs via Union (∪). Vertical splits columns via Projection π_{Li ∪ PK}(R)—every fragment MUST retain the Primary Key—and reconstructs via Natural Join (⋈). Mixed combines both.',
      },
      {
        heading: 'Allocation vs. Replication & Workload Match',
        text: 'Allocation decides WHERE a fragment lives; Replication decides HOW MANY copies exist. Read-intensive workloads (e-commerce catalog, news) suit Replicated Allocation; Write-intensive workloads (banking, airline booking) suit Non-Replicated Partitioning; Mixed ERP workloads suit Partial Replication.',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Why Fragment & The Three Types of Fragmentation',
        body: 'Applications typically access only a slice of a table (e.g., Chennai branch queries Chennai customers, and HR separates public info from salaries). Fragmentation trims storage waste, tightens security, and enables parallel sub-query execution:',
        bullets: [
          '**Primary Horizontal Fragmentation (HF):** Divides tuples (rows) using Relational Algebra **Selection**: `Rᵢ = σ_{Pᵢ}(R)`. Reconstructed via **Union**: `R = R₁ ∪ R₂ ∪ ... ∪ Rₙ`. (Closest equivalent to NoSQL Sharding.)',
          '**Derived Horizontal Fragmentation:** Fragments a child table based on how its parent table is horizontally fragmented (using semijoin) so parent–child rows stay co-located on the same site.',
          '**Vertical Fragmentation (VF):** Divides attributes (columns) using **Projection**: `Rᵢ = π_{Lᵢ ∪ PK}(R)`. Every fragment **must include the Primary Key (`PK`)** (or tuple ID) so **Natural Join** reconstructs `R = R₁ ⋈ R₂ ⋈ ... ⋈ Rₙ` without spurious rows.',
          '**Mixed / Hybrid Fragmentation:** Applies Horizontal then Vertical (or Vertical then Horizontal) fragmentation; reconstructed by reversing the sequence using `⋈` and `∪`.',
        ],
      },
      {
        title: '2. Data Replication Degrees & Topologies',
        body: 'Replication keeps multiple copies (*replicas*) of fragments across servers for high **Availability, Fault Tolerance, Faster Reads, and Load Balancing**:',
        bullets: [
          '**Replication Degrees:** *Non-Replicated* (1 copy total per fragment), *Full Replication* (every fragment copied to every site—max read speed & fault tolerance, highest storage & update sync cost), and *Partial Replication* (only hot/selected fragments replicated, e.g., Node 1 holds `P1(Primary), P2(Replica)`, Node 2 holds `P2(Primary), P3(Replica)`, Node 3 holds `P1(Replica), P3(Primary)`).',
          '**Synchronous vs. Asynchronous Updates:** Synchronous waits for all replicas to confirm before returning ACK (strong consistency, higher latency); Asynchronous acknowledges immediately and ships logs in the background (low latency, risks **replication lag** / stale reads or lost writes on crash).',
        ],
        table: {
          headers: ['Topology', 'How Updates Propagate', 'Advantages', 'Disadvantages'],
          rows: [
            [
              'Master–Slave (Primary–Replica)',
              'Only Primary accepts writes and logs updates to Secondaries (which serve reads).',
              'Simple control, scales read capacity, zero write conflicts.',
              'Primary is a write bottleneck; requires failover election on Primary crash.',
            ],
            [
              'Master–Master (Multi-Leader)',
              'Multiple servers accept both reads and writes and sync changes peer-to-peer.',
              'No single write bottleneck; high multi-region write availability.',
              'Complex write–write conflict resolution when two masters edit the same record.',
            ],
          ],
        },
      },
      {
        title: '3. Data Allocation Techniques & Workload Matrix',
        body: 'Allocation chooses **where** fragments reside considering access frequency, read/write ratio, communication cost, site storage/CPU capacity, reliability, load balancing, and security (Elmasri & Navathe). Note: *Allocation decides WHERE; Replication decides HOW MANY copies.*',
        table: {
          headers: ['Allocation Strategy', 'Data Copies', 'Storage Cost', 'Query Speed', 'Update Cost', 'Availability'],
          rows: [
            ['Centralized', 'One copy at 1 central site', 'Low', 'Slow for remote users', 'Low', 'Low (SPOF)'],
            ['Non-Replicated (Partitioned)', 'One copy of each fragment', 'Low', 'Fast if local; slow if remote', 'Low', 'Medium'],
            ['Partial Replication', 'Hot fragments at selected sites', 'Medium', 'Fast', 'Medium', 'High'],
            ['Full Replication', 'All fragments at every site', 'Very High', 'Very Fast', 'Very High', 'Very High'],
          ],
        },
        bullets: [
          '**Read-Intensive (Shopping Catalog, Digital Library, News Portal):** Use **Replicated Allocation** — reads vastly outnumber writes, so local copies eliminate WAN delay.',
          '**Write-Intensive (Banking, Airline Reservations, Hospital Management):** Use **Non-Replicated (Partitioned) Allocation** — avoids costly cross-site replica lock synchronization on every write.',
          '**Mixed Workloads (University ERP, E-Commerce Apps):** Use **Partial Replication** — replicate read-heavy lookups while keeping write-heavy tables single-copy.',
          '**5 Allocation Costs to Minimize:** Communication Cost, Storage Cost, Processing Cost, Update Cost, and Reliability Cost.',
        ],
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Nov 2026 FAT · Slot A1+TA1 · Q9 Parts B & C [2M + 6M, CO4, BL2]',
        questionPrompt:
          'Q9(B): What is the need for fragmentation in a DDBMS? [2M]\nQ9(C): Differentiate between the types of fragmentation in DDBMS with respect to an example. [6M]',
        solvingMethod: [
          'Part B Method [2M] — "Why Fragment?": State 3 crisp operational reasons: (1) **Data Localization & Performance:** Applications usually query only a subset of rows/columns (e.g., Chennai branch only needs South India customers), so storing relevant slices locally cuts network traffic and allows parallel sub-query execution. (2) **Storage & Bandwidth Efficiency:** Avoids storing unneeded attributes/tuples at every site. (3) **Security & Privacy:** Sensitive columns (Salary, TaxID) stay isolated at HQ while branches only store public fields.',
          'Part C Method [6M] — Anchor on ONE consistent schema, define ALL 3 types with Relational Algebra + Reconstruction + Correctness Rules! Use `EMPLOYEE(EmpID, Name, Region, Dept, Salary)`:',
          '• **1. Horizontal Fragmentation (HF):** Splits rows by selection predicate (`Fi = σ_{Region=...}(EMPLOYEE)`). Example: `Emp_South = σ_{Region="South"}(EMPLOYEE)` at Chennai; `Emp_North = σ_{Region="North"}(EMPLOYEE)` at Delhi. **Reconstruction:** Union (`Emp_South ∪ Emp_North = EMPLOYEE`). Must satisfy Completeness and Disjointness.',
          '• **2. Vertical Fragmentation (VF):** Splits columns by projection, **preserving Primary Key (`EmpID`) in every fragment**. Example: `Emp_Public = π_{EmpID, Name, Region, Dept}(EMPLOYEE)` at branches; `Emp_Payroll = π_{EmpID, Salary}(EMPLOYEE)` at HQ. **Reconstruction:** Natural Join (`Emp_Public ⋈ Emp_Payroll = EMPLOYEE`).',
          '• **3. Mixed / Hybrid Fragmentation:** Combines HF and VF on the same relation—for example, split `EMPLOYEE` horizontally by `Region` (`South`, `North`), then vertically separate public attributes `(EmpID, Name, Dept)` from confidential `(EmpID, Salary)` inside each regional site. **Reconstruction:** Natural Join (`⋈`) followed by Union (`∪`).',
          'Closing Check (guarantees 6/6): State the three correctness rules explicitly—**Completeness, Reconstruction, Disjointness**—in 1–2 lines at the end.',
        ],
        commonPitfalls:
          'Students frequently lose 2 marks in Part C by (a) forgetting to include the Primary Key inside EVERY vertical fragment, or (b) omitting Mixed/Hybrid fragmentation and the Union (∪) vs Join (⋈) reconstruction operators.',
      },
    ],
    selfChecks: [
      {
        question:
          'When vertically fragmenting `EMPLOYEE(EmpID, Name, Dept, Salary)` into `E1(EmpID, Name, Dept)` and `E2(EmpID, Salary)`, why MUST the primary key `EmpID` be repeated in both fragments?',
        options: [
          'To satisfy the Reconstruction rule via lossless Natural Join (`E1 ⋈ E2 = EMPLOYEE`) without generating spurious tuples',
          'To allow Union (`E1 ∪ E2`) to reconstruct the table',
          'Because Vertical Fragmentation forbids projection operators',
          'To force every query to scan both fragments simultaneously',
        ],
        correctIndex: 0,
        explanation:
          'Vertical fragments are reconstructed using Natural Join (⋈). Including the Primary Key (or tuple-ID) in every vertical fragment guarantees a lossless join with zero spurious tuples.',
      },
      {
        question:
          'Which data allocation strategy is best suited for a write-intensive core banking ledger versus a read-intensive e-commerce product catalog?',
        options: [
          'Full Replication for banking; Centralized for e-commerce catalog',
          'Non-Replicated (Partitioned) Allocation for write-heavy banking; Replicated Allocation for read-heavy product catalog',
          'Full Replication for both workloads',
          'Vertical Fragmentation without Primary Keys for both workloads',
        ],
        correctIndex: 1,
        explanation:
          'Write-intensive workloads suffer heavy cross-site lock/sync overhead under full replication, so Non-Replicated Partitioning is preferred; read-intensive catalogs thrive on Replicated Allocation.',
      },
    ],
    exampleTitle: 'Complete Verification Check on Mixed Fragmentation',
    exampleBody:
`#### Global Schema: \`CUSTOMER\`(\`Cid (PK)\`, \`Name\`, \`Region\`, \`Balance\`, \`PinCode\`)

1. **Horizontal Split by Region:** \`C_South = σ_{Region='South'}(CUSTOMER)\` | \`C_Other = σ_{Region<>'South'}(CUSTOMER)\`
2. **Vertical Split on \`C_South\` *(Retaining PK \`Cid\` in every fragment!)*:**
   - \`C_South_Info = π_{Cid, Name, Region, PinCode}(C_South)\`
   - \`C_South_Acct = π_{Cid, Balance}(C_South)\`
3. **Lossless Algebraic Reconstruction:**
> \`(C_South_Info ⋈ C_South_Acct) ∪ C_Other  =  CUSTOMER\` *(Complete, Disjoint, and Lossless!)*`,
    examTip:
      'Whenever asked to recommend an allocation technique, pair the workload directly: Read-Intensive -> Full/Partial Replication; Write-Intensive -> Non-Replicated Partitioned.',
  },

  'm5-t3': {
    summary:
      'Distributed transactions execute sub-transactions across multiple autonomous sites, requiring distributed locking or timestamps for serializability, Two-Phase/Three-Phase Commit (2PC/3PC) for atomic commitment, and Semijoins (⋉) to slash network transfer cost.',
    sourceDecks: [
      '202-5.md (Sections 4 & 5)',
      'BACSE202-DBS-Module-5.ppt',
    ],
    keyPoints: [
      {
        heading: 'Coordinator vs. Local Participants & Distributed Locking',
        text: 'Global transactions span sites via a Coordinator (TM) and site Resource Managers. Replicated locks use ROWA (Read-One Write-All) or Quorum Consensus (Nr + Nw > N and Nw > N/2). Deadlocks use Wait-Die, Wound-Wait, or Global Wait-For Graphs (watch for False Cycles from message delays).',
      },
      {
        heading: 'Two-Phase Commit (2PC) & Its Blocking Limitation',
        text: 'Phase 1 (Prepare/Voting): Coordinator logs <prepare T> and sends PREPARE; participants force-log <ready T> and reply YES/NO. Phase 2 (Commit/Decision): Unanimous YES -> GLOBAL-COMMIT; else ABORT. Weakness: Coordinator crash after <ready T> leaves uncertain participants BLOCKED holding locks (fixed under fail-stop by 3PC PreCommit).',
      },
      {
        heading: 'Semijoin (S ⋉ R) Distributed Query Optimization',
        text: 'Communication cost dominates distributed queries: C_COMM(X) = C0 + C1*X. Instead of shipping an entire wide table S across the network, Semijoin ships only the compact join-key projection π_A(R) first to prune non-matching rows of S remotely.',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Distributed Concurrency Control & Deadlock Handling',
        body: 'Extending single-site Two-Phase Locking (2PL) and Timestamp Ordering across networked nodes:',
        bullets: [
          '**Centralized 2PL:** One designated site runs the Global Lock Manager. Simple deadlock graph, but single-node bottleneck and SPOF.',
          '**Primary Copy 2PL:** Each replicated data item designates one site as its Primary Copy site; all lock requests go there rather than locking every replica.',
          '**Distributed 2PL — ROWA vs. Quorum Consensus:** *ROWA (Read-One, Write-All)* reads 1 local replica but locks ALL replicas on write (stalls if any replica is down). *Quorum Consensus (Majority Locking)* acquires `N_r` read locks and `N_w` write locks satisfying **`N_r + N_w > N`** and **`N_w > N/2`**, guaranteeing read and write quorums overlap at `>= 1` up-to-date node.',
          '**Distributed Timestamp Ordering:** Global timestamps `TS(Tᵢ) = <local_clock, site_id>` maintained monotonic via **Lamport clocks**.',
          '**Deadlock Prevention & Detection:** Wait-Die (older waits, younger aborts/dies) and Wound-Wait (older aborts/wounds younger, younger waits). Detection merges Local WFGs into a **Global Wait-For Graph (GWFG)**—stale in-flight messages can create **False Cycles** that require timestamp validation before aborting victims.',
        ],
      },
      {
        title: '2. Atomic Commit Protocols: Two-Phase Commit (2PC) & 3PC',
        body: 'A distributed transaction touching Site A (debit) and Site B (credit) must be all-or-nothing despite crashes:',
        diagramId: 'm5-2pc-sequence',
        diagramCaption: 'Two-Phase Commit (2PC): Phase 1 Voting (PREPARE -> VOTE-COMMIT) & Phase 2 Decision (GLOBAL COMMIT -> ACK).',
        bullets: [
          '**Phase 1 (Voting / Prepare):** Coordinator logs `BEGIN_COMMIT` and sends `PREPARE`. Each participant verifies local constraints, force-writes undo/redo logs + `READY` to disk (WAL), and replies `VOTE-COMMIT` (or `VOTE-ABORT`).',
          '**Phase 2 (Decision / Commit):** Only if **100% of participants** vote `VOTE-COMMIT` does Coordinator force-log `COMMIT` and broadcast `GLOBAL-COMMIT`; any `VOTE-ABORT` or timeout triggers `GLOBAL-ABORT`. Participants apply updates, release locks, and return `ACK`.',
          '**The 2PC Blocking Problem:** If a participant logged `<ready T>` (entered the *uncertain* state) and **the Coordinator crashes** before sending Phase 2’s decision, the participant **cannot safely commit or abort unilaterally**—it remains blocked holding locks indefinitely until Coordinator recovers.',
          '**Three-Phase Commit (3PC):** Splits Phase 2 into **`CanCommit?` -> `PreCommit` -> `DoCommit`**. Under fail-stop crashes (no network partitions), a backup coordinator checks survivors: if none reached `PreCommit`, abort; if any reached `PreCommit`, commit—eliminating blocking.',
        ],
        table: {
          headers: ['Recovering Site S_k Log Entry', 'Meaning at Crash Instant', 'Required Recovery Action'],
          rows: [
            ['Contains <commit T>', 'Decision reached to commit globally', 'Execute REDO(T) using local after-images'],
            ['Contains <abort T>', 'Transaction aborted globally', 'Execute UNDO(T) using local before-images'],
            ['Contains <ready T> ONLY (no final record)', 'Site voted YES before crash; decision unknown', 'UNCERTAIN / BLOCKED: Must query Coordinator (or peer sites)'],
            ['No <ready T> for T', 'Crashed before voting YES', 'Unilaterally ABORT and execute UNDO(T)'],
          ],
        },
      },
      {
        title: '3. Distributed Query Optimization & Semijoin Numerical',
        body: 'Distributed query total cost is `Total Cost = C_CPU + C_I/O + C_COMM`, dominated by WAN transfer `C_COMM(X) = C₀ + C₁ × X`. Processing runs in 4 stages: **(1) Query Decomposition** → **(2) Data Localization** (substitute fragments & prune irrelevant sites) → **(3) Global Optimization** (join order, replica choice, semijoins) → **(4) Local Optimization**.',
        bullets: [
          '**Ship-Whole vs. Fetch-as-Needed vs. Semijoin:** Ship-Whole sends entire tables across the WAN (wastes bandwidth on non-matching tuples). Fetch-as-Needed sends one network round-trip per tuple (high latency). **Semijoin (`S ⋉_A R = π_S(S ⋈_A R) = S ⋈_A π_A(R)`)** ships only the compact join keys first.',
        ],
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Standard Module 5 Quantitative Pattern (Predicted Slot Q9 · CO4)',
        questionPrompt:
          'Compare Ship-Whole vs. Semijoin cost when joining Site 1 `Dept(Dno, Dname, Budget)` [100 rows × 50B, Budget > 50L selects 5 depts] with Site 2 `Emp(Eid, Ename, Salary, Dno)` [10,000 rows × 100B, 80 match], where `Dno` = 4B.',
        solvingMethod: [
          'Step 1 — Compute Ship-Whole Baseline: Shipping all of `Emp` from Site 2 to Site 1 transfers `10,000 × 100 bytes = 1,000,000 bytes (1 MB)`.',
          'Step 2 — Apply Local Selection First at Site 1: Filter `Dept\' = σ_{Budget > 50L}(Dept)` (yields `5` tuples locally — zero network bytes).',
          'Step 3 — Ship Join-Key Projection `π_{Dno}(Dept\')` to Site 2: `5 × 4 bytes = 20 bytes`.',
          'Step 4 — Filter Matching `Emp` Tuples at Site 2 & Ship Back: Compute `Emp\' = Emp ⋉_{Dno} π_{Dno}(Dept\')` (`80` tuples) and ship to Site 1: `80 × 100 bytes = 8,000 bytes`.',
          'Step 5 — Total & Savings Conclusion: `20 + 8,000 = 8,020 bytes` transferred vs `1,000,000 bytes` (> 99.19% network traffic reduction!).',
        ],
        commonPitfalls:
          'Always push local selection (`σ`) BEFORE projecting join keys (`π_A`)—if you project all 100 departments instead of the 5 filtered ones, your semijoin unnecessarily ships extra unmatched `Emp` tuples.',
      },
    ],
    selfChecks: [
      {
        question:
          'In Two-Phase Commit (2PC), a participant site has force-written `<ready T>` to its log and sent `VOTE-COMMIT` to the Coordinator, when the Coordinator suddenly crashes. What state is the participant in?',
        options: [
          'It can unilaterally commit T immediately',
          'It can unilaterally abort T immediately',
          'It is BLOCKED in the uncertain state holding locks until the Coordinator recovers (or peer status is resolved)',
          'It automatically converts to a Capped Collection',
        ],
        correctIndex: 2,
        explanation:
          'Having voted YES (`<ready T>`), the participant promised it can commit if told to, but does not know whether other sites voted YES or NO—so it cannot safely abort or commit unilaterally.',
      },
      {
        question:
          'For a replicated data item with `N = 7` copies using Quorum Consensus locking, which choice of Read Quorum (`N_r`) and Write Quorum (`N_w`) is valid?',
        options: [
          'N_r = 2, N_w = 3',
          'N_r = 3, N_w = 5 (since N_r + N_w = 8 > 7 and N_w = 5 > 3.5)',
          'N_r = 4, N_w = 3',
          'N_r = 1, N_w = 4',
        ],
        correctIndex: 1,
        explanation:
          'Quorum Consensus requires BOTH `N_r + N_w > N` (so read and write quorums intersect) AND `N_w > N/2` (so two write quorums intersect). For N = 7, N_r = 3 and N_w = 5 satisfies 3 + 5 = 8 > 7 and 5 > 3.5.',
      },
    ],
    exampleTitle: 'Semijoin Cost Formula & Quorum Check Summary',
    exampleBody:
`> **Quorum Consensus (\`N = 5\` Replicas):** Satisfy \`N_r + N_w > 5\` and \`N_w > 2.5\`. Choosing **\`N_w = 3\`** and **\`N_r = 3\`** guarantees \`3 + 3 = 6 > 5\`, so any Read Quorum must intersect any Write Quorum at \`>= 1\` up-to-date node.

> **Semijoin Algebraic Identity:** \`S ⋉_A R  =  π_S(S ⋈_A R)  =  S ⋈_A π_A(R)\``,
    examTip:
      'In 2PC questions, always draw the 2-column vertical message sequence (PREPARE -> VOTE-COMMIT -> log COMMIT -> GLOBAL-COMMIT -> ACK) and explicitly call out the Coordinator-crash blocking window.',
  },

  'm5-t4': {
    summary:
      'NoSQL ("Not Only SQL") evolved to overcome single-node RDBMS scale limits under Volume, Velocity, Variability, and Agility. Distributed NoSQL trades strict ACID for CAP theorem choices (CP vs AP) and BASE eventual consistency.',
    sourceDecks: [
      '202-5.md (Sections 6, 7, 8 & 9)',
      'Module 5. No-SQL database management.pptx',
      'BACSE202-DBS-Module-5.ppt',
    ],
    keyPoints: [
      {
        heading: 'Three Database Revolutions & 4 Business Drivers',
        text: '1st Gen (1960s–70s): Navigational (Hierarchical IMS 1:N & Network CODASYL M:N). 2nd Gen (1970s–90s): Codd’s Relational SQL + ACID. 3rd Gen (2000s+): NoSQL scale-out triggered by Volume, Velocity, Variability, and Agility (pioneered by Memcache, MapReduce, Bigtable, Amazon Dynamo, MarkLogic).',
      },
      {
        heading: 'Brewer’s CAP Theorem (Why Partition Forces CP or AP)',
        text: 'A replicated distributed system can guarantee at most two of Consistency (C: linearizable latest read), Availability (A: every healthy node responds without error), and Partition Tolerance (P: survives dropped network links). Since partitions happen in real networks, distributed systems must choose CP or AP.',
      },
      {
        heading: 'ACID ("The Perfectionist") vs. BASE ("The Realist")',
        text: 'ACID (Atomicity, Consistency, Isolation, Durability) uses locking to keep immediate single-copy consistency. BASE (Basically Available, Soft State, Eventual Consistency) avoids write-blocking locks so high-traffic apps stay responsive and replicas converge asynchronously.',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Evolution of NoSQL & SQL vs. NoSQL Comparison',
        body: 'Coined by **Carlo Strozzi (1998)** and popularized in **2009**, NoSQL means **"Not Only SQL"** (it is *not* anti-SQL language, not merely open-source, and not only RAM/cloud). Key industry milestones include **LiveJournal Memcache** (RAM query caching), **Google MapReduce** (parallel commodity indexing), **Google Bigtable** (sparse matrix storage), **Amazon Dynamo** (always-writable replicated KV store), and **MarkLogic** (distributed XML search).',
        table: {
          headers: ['Dimension', 'SQL (RDBMS)', 'NoSQL'],
          rows: [
            ['Data Model', 'Relational tables (fixed rows & columns)', 'Key-Value, Document, Column-Family, Graph'],
            ['Schema', 'Static, explicit predefined schema', 'Dynamic, implicit, schema-free / flexible'],
            ['Hierarchical Data', 'Poor fit (requires joins / ORM)', 'Natural fit (nested JSON/XML documents)'],
            ['Scalability', 'Primarily Vertical (Scale-Up)', 'Primarily Horizontal (Scale-Out, Shared-Nothing)'],
            ['Consistency Model', 'Strict ACID properties', 'CAP trade-offs & BASE (often tunable)'],
            ['Examples', 'MySQL, PostgreSQL, Oracle, SQL Server', 'MongoDB, Redis, Cassandra, HBase, Neo4j, DynamoDB'],
          ],
        },
        bullets: [
          '**6 Core Characteristics of NoSQL:** (1) Non-relational & aggregate-oriented (no cross-node joins), (2) Schema-free dynamic structure, (3) Shared-nothing horizontal scale-out, (4) Auto-sharding, (5) Built-in multi-node replication, (6) Relaxed / tunable consistency (BASE).',
        ],
      },
      {
        title: '2. CAP Theorem Geometry & Real-Life Analogies',
        body: 'If there is **no network partition**, a distributed database looks like **CA** (single-node RDBMS like standalone MySQL is CA because there are no distributed links to partition). The moment a **network partition (P)** occurs, you must sacrifice either **A** (-> **CP**) or **C** (-> **AP**):',
        diagramId: 'm5-cap-triangle',
        diagramCaption: 'Brewer CAP Theorem: Single-node CA vs. distributed Partition choices CP (Consistency) and AP (Availability).',
        bullets: [
          '**Two Bank Branches Analogy:** Balance = ₹10,000. Undersea/fiber link between Branch A and Branch B cuts (**P**). After ₹10,000 is withdrawn at Branch A, someone attempts withdrawal at Branch B: **CP** halts Branch B (*"cannot verify balance while network is down"*) preserving accuracy; **AP** allows both withdrawals (balance becomes -₹10,000!), favoring availability.',
          '**Last Movie Ticket Phone Analogy:** Two friends coordinating over a phone call for 1 remaining seat. If the line drops (**P**), wait until reconnected (**CP**) or risk double-booking (**AP**).',
        ],
        table: {
          headers: ['Scenario', 'Failure / Partition Situation', 'Choice', 'CAP Type'],
          rows: [
            ['Bank ATM Withdrawal', 'ATM A drains account while link to ATM B breaks', 'Reject ATM B until balance verified', 'CP'],
            ['Instagram Likes', 'You tap Like; overseas friend briefly sees old count', 'Show post immediately; sync count shortly', 'AP'],
            ['Flight Seat Booking', 'Last 1 seat left while booking servers disconnect', 'Pause booking until seat lock confirmed', 'CP'],
            ['Hospital Allergy Record', 'Allergy updated seconds ago before ER prescription', 'Block prescription until latest record confirmed', 'CP'],
            ['Google Maps Traffic', 'One road sensor cluster unreachable due to lag', 'Keep navigating using best available traffic data', 'AP'],
          ],
        },
      },
      {
        title: '3. Strong vs. Eventual Consistency & ACID vs. BASE',
        body: 'In distributed clusters, network latency, partitions, server crashes, and heavy spikes delay replica convergence. **Eventual Consistency** guarantees that *if new updates cease, all replicas eventually converge to the identical value* (e.g., social likes jumping `101, 100, 100` -> `101, 101, 101`).',
        table: {
          headers: ['Feature', 'ACID (SQL / RDBMS)', 'BASE (Distributed NoSQL)'],
          rows: [
            ['Philosophy', 'Pessimistic: "Get every detail right at all costs."', 'Optimistic: "Keep writes flowing; syncs catch up."'],
            ['Concurrency', 'Heavy locking (`locks & unlocks`), blocks conflicts', 'Avoids global locks; never blocks writes'],
            ['Consistency Timing', 'Immediate / Strong at transaction commit', 'Eventual (Soft State shifts via background sync)'],
            ['CAP Alignment', 'Consistency & Isolation (CP / CA)', 'Availability & Partition Tolerance (AP)'],
            ['Best Fits', 'Banking transfers, inventory locks, flight seats', 'Social feeds/likes, IoT streams, catalogs, caches'],
          ],
        },
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Nov 2026 FAT · Slot A1+TA1 · Q10 [10M, CO4, BL4]',
        questionPrompt:
          'Global e-commerce flash sale with US-East (Primary) and EU-West (Secondary) disconnected by an undersea cable fault (partition P): (A) Define C, A, and P [3M]; (B) Inventory Management Service (1 unit left) — CP or AP? Justify [3M]; (C) Product Review & Recommendation Service — CP or AP + explain EU-West UX under AP during partition [4M].',
        solvingMethod: [
          'Part A Method [3M] — Crisp Formal CAP Definitions (1M each): **Consistency (C)** = Every read returns the most recent committed write or an error (all clients see identical global state). **Availability (A)** = Every request to a non-failing node receives a timely non-error response (even if stale). **Partition Tolerance (P)** = Cluster continues operating despite dropped/delayed messages between disconnected data centers.',
          'Part B Method [3M] — Inventory Service Decision: Explicitly state **CP (Consistency + Partition Tolerance)**! Justification: During partition P, we cannot simultaneously keep C and A. With only 1 unit left, choosing AP would let both US-East and EU-West sell the same item (**overselling / negative stock anomaly**). Choosing **CP** rejects/blocks EU-West minority-side checkouts (sacrificing A locally) to guarantee strict inventory correctness.',
          'Part C Method [4M] — Review Service & EU-West UX Analysis: State **AP (Availability + Partition Tolerance)**! Explain exact EU-West user experience during partition: (1) Users in EU-West can still browse product pages, view cached reviews/recommendations, and submit new reviews with zero downtime (high availability). (2) However, **Eventual Consistency (Soft State)** means EU-West temporarily displays *stale* review lists/ratings (missing brand-new US-East reviews) and newly submitted EU-West reviews remain local until the undersea cable heals and background sync converges both DCs.',
        ],
        commonPitfalls:
          'In Part C, don’t just say "users are happy"—explicitly trace BOTH reads (reading slightly stale cached US reviews) AND writes (EU reviews accepted locally and merged later once healed).',
      },
      {
        sourcePaper: 'Nov 2026 FAT · Slot A2+TA2 · Q7 [10M, CO4, BL4]',
        questionPrompt:
          'Banking app stores customer balance (₹50,000) on DB1 and DB2. Network partition isolates DB1 and DB2 while DB1 processes ₹10,000 withdrawal and DB2 processes ₹15,000 withdrawal. Discuss 3 CAP aspects and analyze: (i) Allow transactions independently on both DB1 & DB2; (ii) Stop transactions until link restores — stating which CAP property is affected and the exact balance problem.',
        solvingMethod: [
          'Step 1 — State the 3 Fundamental Aspects [3M]: Define Consistency (C), Availability (A), and Partition Tolerance (P), noting that when DB1 <-> DB2 fails, **P has occurred**, forcing a strict binary choice between **AP** and **CP**.',
          'Step 2 — Analyze Approach (i): Continue Independently on DB1 & DB2 [3.5M]: Identify this as **AP (sacrifices Consistency C to preserve Availability A)**. Trace the exact numbers: True balance should become `50,000 - 10,000 - 15,000 = ₹25,000`. Instead, DB1 independently records `50,000 - 10,000 = ₹40,000` while DB2 independently records `50,000 - 15,000 = ₹35,000` (**state divergence / lost update**). Worse, if initial balance were ₹20,000, both branches would approve the withdrawals totaling ₹25,000 -> **illegal overdraft / double-spending**!',
          'Step 3 — Analyze Approach (ii): Stop Transactions Until Communication Restores [3.5M]: Identify this as **CP (sacrifices Availability A to protect Consistency C)**. Explain: Because DB1 and DB2 cannot synchronize, transactions on at least the disconnected/minority side (or both) are rejected/halted (`System Unavailable`), preventing conflicting withdrawals and keeping ₹50,000 strictly consistent until the partition heals. Conclude clearly that financial ledgers require **CP**.',
        ],
        commonPitfalls:
          'Show BOTH the exact arithmetic divergence (`DB1 = ₹40,000`, `DB2 = ₹35,000`, true = `₹25,000`) AND the overdraft risk if balance were lower than ₹25,000 to earn full analytical marks.',
      },
      {
        sourcePaper: 'Official Fall 2026-27 Model Question Paper · Q10(a) [5M, CO4, BL4]',
        questionPrompt:
          'Q10(a): A distributed online polling system allows users across multiple locations to cast votes simultaneously. During network issues, users can still cast votes without interruption, although vote counts across servers may temporarily differ. Identify which properties of the CAP theorem are prioritized in this system and explain what property is compromised. Also discuss one advantage and one limitation of this design choice. [5 Marks]',
        solvingMethod: [
          'Step 1 — Identify Prioritized CAP Properties [2M]: Because the polling system continues operating during network issues ("network issues" = **Partition Tolerance, P**) and allows users across locations to cast votes without interruption ("without interruption" = **Availability, A**), the system is an **AP (Availability + Partition Tolerance)** system under Brewer’s CAP Theorem.',
          'Step 2 — Explain the Compromised Property [1M]: **Strong Consistency (C)** is compromised in favor of **Eventual Consistency (BASE / Soft State)**. During a network partition or replication lag, polling servers accept local votes immediately without waiting for global lock synchronization, so live vote tallies temporarily differ across servers until background anti-entropy/gossip sync merges the counts.',
          'Step 3 — One Concrete Advantage [1M]: **Zero Downtime & High Write Throughput under Peak Load:** Millions of voters can cast ballots simultaneously with sub-millisecond local response times and no "Service Unavailable" errors even when inter-datacenter links drop.',
          'Step 4 — One Concrete Limitation [1M]: **Stale Tallies & Duplicate-Vote / Conflict Resolution Risk:** Users refreshing different regional servers see temporarily inconsistent vote totals (violating read-your-writes/monotonic reads), and without idempotent voter-ID deduplication (e.g., CRDTs or unique `(poll_id, user_id)` keys), a user could attempt to vote twice across partitioned nodes before the partition heals.',
        ],
        commonPitfalls:
          'Do not say "Partition Tolerance is compromised"—network partitions are a physical reality of distributed networks ("During network issues..."), so P is mandatory and C is the property traded off for A.',
      },
    ],
    selfChecks: [
      {
        question:
          'A social-media post has 10,000 likes. Immediately after a new like: Server A shows 10,001 while Servers B and C show 10,000. Moments later, all three converge to 10,001. Which concept does this illustrate?',
        options: [
          'Strong consistency (ACID)',
          'Eventual consistency (BASE)',
          'Strict 2PL locking',
          'Capped collection eviction',
        ],
        correctIndex: 1,
        explanation:
          'Replicas temporarily diverge during propagation lag (Soft State) and converge to the identical value once updates stop and sync completes—the definition of Eventual Consistency.',
      },
      {
        question:
          'In the Official Model QP Q10(a), an online polling system lets users keep casting votes during network partitions while vote counts temporarily differ across servers. Which CAP classification fits this system?',
        options: [
          'CA (Consistency + Availability)',
          'CP (Consistency + Partition Tolerance)',
          'AP (Availability + Partition Tolerance, trading Strong Consistency for Eventual Consistency)',
          'Single-node Strict 2PL',
        ],
        correctIndex: 2,
        explanation:
          'Surviving network issues (P) while accepting every vote without interruption (A) and tolerating temporary count divergence (sacrificing strong C) is the textbook definition of an AP / BASE system.',
      },
    ],
    exampleTitle: 'ACID Bank Transfer vs. BASE Social Like Propagation',
    exampleBody:
`#### ACID Bank Transfer *(₹5,000 from \`A\` -> \`B\`)*
1. Deduct ₹5,000 from \`A\` and credit ₹5,000 to \`B\` (**Atomicity:** all-or-nothing).
2. Total \`A + B\` stays invariant (**Consistency**), isolated from concurrent audits (**Isolation**).

#### BASE Eventual Consistency *(Instagram Like Counter on Cassandra)*
| Time | Event | Server A | Server B | Server C |
| :--- | :--- | :--- | :--- | :--- |
| Initial | Baseline likes | \`10,000\` | \`10,000\` | \`10,000\` |
| \`T + 0 ms\` | User taps Like -> Server A ACKs *(Basically Available)* | **\`10,001\`** | \`10,000\` | \`10,000\` |
| \`T + 5 ms\` | Friend reads Server B *(Soft State / stale lag)* | \`10,001\` | **\`10,000\`** | \`10,000\` |
| \`T + 40 ms\` | Anti-entropy sync completes *(Eventual Consistency)* | **\`10,001\`** | **\`10,001\`** | **\`10,001\`** |`,
    examTip:
      'For ANY CAP scenario question: first state that Partition (P) forces choosing between CP and AP, then tie your answer directly to the domain numbers/risk (overselling/overdraft -> CP; stale likes/reviews/feeds -> AP).',
  },

  'm5-t5': {
    summary:
      'NoSQL scale-out relies on aggregate modeling (embedding vs referencing), Sharding + Replication distribution, MapReduce batch pipelines, and MongoDB production mechanics (Replica Sets, read preferences, compound/multikey indexes, and shard keys).',
    sourceDecks: [
      '202-5.md (Sections 10, 12.6–12.8 & Part III A)',
      'BACSE202-DBS-Module-5.ppt',
    ],
    keyPoints: [
      {
        heading: 'Aggregate Modeling & Embedding vs. Referencing',
        text: 'Key-Value, Document, and Column-Family stores are Aggregate-Oriented (bundle related objects together onto 1 shard to avoid cross-node joins); Graph and RDBMS are Aggregate-Ignorant. Embed for bounded 1:1/1:Few data read together (respecting 16 MB doc limit); Reference via _id for unbounded 1:Many or M:N.',
      },
      {
        heading: 'Sharding Strategies & The "Hot Shard" Problem',
        text: 'Range sharding speeds range queries but causes write hotspots; Hash/Consistent Hashing balances data uniformly (Voldemort ring) but loses range locality; Directory sharding adds lookup flexibility. Skewed shard keys (like city with 50% Chennai orders) create a Hot Shard bottleneck!',
      },
      {
        heading: 'MongoDB Replica Sets, Indexes & MapReduce',
        text: 'Replica sets elect a Primary via majority vote using the oplog (Priority=0, Hidden=True, SlaveDelay for lagging recovery backups). Compound indexes obey the Leftmost Prefix Rule; Multikey indexes index arrays; MapReduce executes Map -> Shuffle/Sort -> Reduce.',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Embedding vs. Referencing & Aggregate Data Models',
        body: 'In MongoDB/Document stores, schema design starts from **query access patterns** rather than strict BCNF normalization. Key-Value, Document, and Column-Family databases are **Aggregate-Oriented** (packing related objects onto one node/shard), while Relational and Graph DBs are **Aggregate-Ignorant**:',
        table: {
          headers: ['Approach', 'How It Works', 'Best Used When...', 'Drawbacks'],
          rows: [
            ['Embedding (Denormalized)', 'Store nested sub-objects/arrays inside parent document (e.g., blog post + `comments` array)', '1:1 or 1:Few relationships always read together; atomic single-doc updates', 'Data duplication if shared; risk of hitting **16 MB** document limit if arrays grow unbounded'],
            ['Referencing (Normalized)', 'Store `_id` links in separate collections and resolve via application or `$lookup`', 'Unbounded 1:Many or M:N; child entities change often or are read independently', 'Extra query round-trips or slower cross-shard `$lookup` joins'],
          ],
        },
      },
      {
        title: '2. Sharding vs. Replication & Partitioning Strategies',
        body: 'NoSQL clusters combine two **orthogonal** distribution techniques—**Sharding** splits data to scale capacity & writes, whereas **Replication** copies data for availability & read throughput:',
        table: {
          headers: ['Feature', 'Sharding (Horizontal Partitioning)', 'Replication'],
          rows: [
            ['Purpose & Data Stored', 'Stores **different** data subsets per server to scale writes & storage', 'Stores **same** data copies across servers for availability & backup'],
            ['Increases Storage Capacity?', 'Yes (linearly with shards)', 'No (all replicas hold copies)'],
            ['Improves Read Performance?', 'Targeted shard queries faster', 'Yes (reads spread across Secondaries)'],
            ['Improves Write Performance?', 'Yes (writes distribute across shards)', 'Limited (Primary handles writes in Primary-Replica)'],
            ['Fault Tolerance', 'Low alone (unless each shard is replicated)', 'High (automatic failover)'],
          ],
        },
        diagramId: 'm5-mongodb-sharding',
        diagramCaption: 'MongoDB Sharded Cluster: Client -> mongos Query Router -> Replica-Set Shards 1–3.',
        bullets: [
          '**Three Sharding Techniques:** (1) **Range-Based** (`1-1000 -> Shard 1`): great range queries, but suffers **hotspots** on monotonic/timestamp keys. (2) **Hash-Based / Consistent Hashing** (`Hash(StudentID) -> Shard 2`, Voldemort ring): uniform load distribution, but scatter–gathers range queries. (3) **Directory-Based:** lookup table maps keys flexibly (`Student 101 -> Shard 2`), at the cost of directory overhead.',
          '**Combined Production Models:** *Sharded Primary–Replica (MongoDB)* makes each shard a Replica Set; *Peer-to-Peer Ring (Cassandra/Dynamo)* has equal nodes using a consistent-hashing ring with clockwise `N`-replica placement.',
          '**The "Hot Shard" Case Study (`city` Shard Key skew):** Sharding **500M e-commerce orders** by `city` where **Chennai = 35–50%**, **Bengaluru = 25–30%**, **Mumbai = 15–20%**, Others = 10–15% overloads the Chennai shard (**workload skew / Hot Shard**). Always pick high-cardinality keys (`customerId`, `userId`, `productId`)—and remember MongoDB requires the shard key to **exist in every doc AND have an index**!',
        ],
      },
      {
        title: '3. MapReduce Parallel Pipeline (Map -> Shuffle/Sort -> Reduce)',
        body: 'MapReduce moves computation to the data across commodity shards via **JobTracker** scheduling (**Fair Scheduler** vs. **Capacity Scheduler**) and fault-tolerant **TaskTrackers**:',
        diagramId: 'm5-mapreduce-pipeline',
        diagramCaption: 'MapReduce Parallel Execution Pipeline: Input Chunks -> Map -> Shuffle & Sort -> Reduce -> Final Totals.',
        bullets: [
          '**Map Phase (`map(k1, v1) -> list(k2, v2)`):** Parses local shard orders and emits `(city, amount)` — e.g., Shard 1 emits `("Chennai", 4500), ("Mumbai", 2000)`; Shard 2 emits `("Chennai", 1500), ("Bengaluru", 3000)`.',
          '**Shuffle & Sort Phase (`Partitioner`):** Groups & sorts identical keys onto the same Reducer: `"Bengaluru" -> [3000]`, `"Chennai" -> [4500, 1500]`, `"Mumbai" -> [2000]`.',
          '**Reduce Phase (`reduce(k2, list(v2))`):** Aggregates sums: `("Bengaluru", 3000)`, `("Chennai", 6000)`, `("Mumbai", 2000)`.',
        ],
      },
      {
        title: '4. MongoDB Indexes (6 Types) & Replica Set Mechanics',
        body: 'Ordered B-tree indexes prevent slow full collection scans (`1` = Ascending, `-1` = Descending). Replica Sets use a Primary + Secondaries pulling asynchronously from the **`oplog`** (odd total voting members prevent tie elections; zero writes accepted during election):',
        table: {
          headers: ['MongoDB Index Type', 'Syntax Example', 'Behavior / Best Use'],
          rows: [
            ['1. Single-Field', '`db.students.createIndex({ regno: 1 })`', 'Fast equality & range lookup on 1 field'],
            ['2. Compound', '`db.students.createIndex({ department: 1, semester: 1 })`', 'Obeys **Leftmost Prefix Rule**: accelerates `department` or `department+semester`, NOT `semester` alone!'],
            ['3. Multikey', '`db.students.createIndex({ skills: 1 })`', 'Auto-created on array fields (`["Python", "MongoDB"]`)'],
            ['4. Text', '`db.articles.createIndex({ title: "text", description: "text" })`', 'Keyword search via `$text: { $search: "..." }`'],
            ['5. Geospatial', '`db.places.createIndex({ location: "2dsphere" })`', 'Proximity queries (nearby stores, rides, hospitals)'],
            ['6. Unique', '`db.students.createIndex({ email: 1 }, { unique: true })`', 'Rejects duplicate field values across collection'],
          ],
        },
        bullets: [
          '**Fine-Tuning Secondary Nodes:** `Priority = 0` (cannot become Primary, still serves client reads); `Hidden = True` (implies `Priority = 0` AND blocks client reads/writes—ideal for heavy offline reporting/backups); `SlaveDelay = m` / `secondaryDelaySecs` (must set `Hidden = True`; lags `m` seconds behind Primary as a rollback buffer against accidental `dropCollection`).',
          '**5 Read Preferences:** `Primary` *(Default — Strict Consistency)*, `PrimaryPreferred`, `Secondary` *(may see stale Eventual Consistency)*, `SecondaryPreferred`, `Nearest` *(lowest latency)*. Default write concern `w: 1` acknowledges once Primary writes in RAM—so un-replicated writes can roll back if Primary crashes before syncing to Secondaries.',
          '**BACSE202 Lab Alignment:** **Exp 10** covers CRUD + scaling out/in (`sh.addShard(...)`, `removeShard`); **Exp 11** covers Replica Sets (`rs.initiate()`, `rs.add()`, `rs.status()`), `mongodump` / `mongorestore` backups, and chunk inspection (`sh.status()`).',
        ],
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Lecture Worked Case Study (202-5.md Part III-A · Indexing 8M Student Records)',
        questionPrompt:
          'A university stores 8 million student records in MongoDB with frequent queries: Q1 (`regno`), Q2 (`department = "CSE" AND semester = 5`), Q3 (`semester = 5` only), Q4 (`skills` array contains `"MongoDB"`). DBA creates `{ department: 1, semester: 1 }`: (a) Why does Q2 speed up while Q3 does not? (b) Recommend indexes for Q1 & Q4; (c) Critique indexing EVERY field.',
        solvingMethod: [
          'Part (a) — Leftmost Prefix Explanation: `{ department: 1, semester: 1 }` is a **Compound Index** sorted first by `department` and secondarily by `semester`. Q2 specifies the leading prefix (`department + semester`), enabling direct B-tree range seeks. Q3 filters ONLY on `semester` without `department`; because semester `5` entries are scattered across all departments in the tree, MongoDB cannot seek by prefix and falls back to a slow full scan.',
          'Part (b) — Targeted Index Recommendations: For Q1: `db.students.createIndex({ regno: 1 }, { unique: true })` (**Unique Single-Field Index** for `O(log N)` lookup + uniqueness). For Q4: `db.students.createIndex({ skills: 1 })` (**Multikey Index** indexing every element of the `skills` array).',
          'Part (c) — Why Never Index Every Field: (1) **Severe Write Amplification:** Every `insert`/`update`/`delete` must update ALL B-tree indexes. (2) **RAM & Disk Bloat:** Across 8M docs, unneeded indexes evict hot working sets from memory. (3) **Query Planner Overhead:** Unused indexes add planning cost—index strictly to match dominant query access patterns.',
        ],
        commonPitfalls:
          'Always name the exact index types (**Unique Single-Field**, **Compound / Leftmost Prefix**, **Multikey**) rather than just writing raw `createIndex` syntax.',
      },
    ],
    selfChecks: [
      {
        question:
          'A university stores 5 million student documents and searches most frequently by unique `regno`. What is the best approach?',
        options: [
          'Create a text index on `regno`',
          'Create a single-field index (ideally unique) on `regno`',
          'Shard using `department`',
          'Convert to a capped collection',
        ],
        correctIndex: 1,
        explanation:
          'A single-field index (with `{ unique: true }`) gives direct O(log N) B-tree lookup on `regno` without scanning 5M documents.',
      },
      {
        question:
          'An online store frequently executes `db.products.find({ category: "Laptop", brand: "Dell" })`. Which index is most suitable?',
        options: [
          '{ category: 1 } only',
          '{ brand: 1 } only',
          'Compound index { category: 1, brand: 1 }',
          'Capped collection on category',
        ],
        correctIndex: 2,
        explanation:
          'A compound index `{ category: 1, brand: 1 }` covers both equality predicates in a single B-tree index lookup.',
      },
      {
        question:
          'A MongoDB replica set contains 1 Primary and 2 Secondaries. The Primary suddenly crashes. What happens next?',
        options: [
          'The cluster permanently stops serving reads and writes',
          'One healthy Secondary is elected as the new Primary via majority vote',
          'Both Secondaries become Primary simultaneously',
          'The crashed Primary’s data is erased across all nodes',
        ],
        correctIndex: 1,
        explanation:
          'Automatic failover runs an election among the surviving majority (2 of 3 members) and promotes one Secondary to Primary.',
      },
      {
        question:
          'A company configures one MongoDB secondary with `Priority = 0` and `Hidden = True`. What is its ideal purpose?',
        options: [
          'Automatically taking over as Primary during failover',
          'Serving all front-end customer writes',
          'Dedicated offline analytics, reporting, and backups without impacting clients',
          'Acting as the mongos shard key',
        ],
        correctIndex: 2,
        explanation:
          'Priority=0 blocks Primary election while Hidden=True hides the node from client read/write routing, isolating batch analytics/backups.',
      },
      {
        question:
          'An e-commerce company shards orders by `city` (Chennai 50%, Bengaluru 25%, Mumbai 15%, Others 10%), overloading the Chennai shard. What is this issue called?',
        options: [
          'Replica election tie',
          'Data/workload skew causing a Hot Shard',
          'Two-Phase Commit blocking',
          'Capped collection overflow',
        ],
        correctIndex: 1,
        explanation:
          'Low-cardinality or skewed shard keys route disproportionate traffic to a single overloaded "Hot Shard."',
      },
      {
        question:
          'A company must distribute 500 million documents across multiple MongoDB servers because a single machine lacks storage & write capacity. Which mechanism is primarily required?',
        options: [
          'Replication only',
          'Capped collection',
          'Sharding (Horizontal Partitioning)',
          'Text indexing',
        ],
        correctIndex: 2,
        explanation:
          'Replication copies the same dataset; Sharding horizontally partitions 500M documents across servers to scale storage and write throughput.',
      },
      {
        question:
          'In a 3-member replica set (A=Primary, B=Secondary, C=Secondary), an order write hits A (default `w: 1`) and A crashes before B and C pull the oplog. What happens?',
        options: [
          'Sharding moves A’s un-synced data automatically to B',
          'An election promotes B or C as Primary, and the un-replicated write on A is lost/rolled back',
          'B and C both become Primary simultaneously',
          'MongoDB freezes permanently even though 2 of 3 nodes are healthy',
        ],
        correctIndex: 1,
        explanation:
          'With majority (2 of 3) healthy, failover elects B or C as new Primary, but any oplog entry that never left crashed A is lost/rolled back when A rejoins.',
      },
    ],
    exampleTitle: 'Voldemort Consistent Hashing Ring & MapReduce City Revenue',
    exampleDiagramId: 'm5-consistent-hash-ring',
    exampleDiagramCaption: 'Consistent Hashing Ring: Uniform token placement (A, B, C) minimizes key movement when Node D joins.',
    exampleBody:
`#### MapReduce Total Revenue by City
1. **Map Phase:** Shard 1 emits \`("Chennai", 4500)\`, \`("Mumbai", 2000)\`; Shard 2 emits \`("Chennai", 1500)\`, \`("Bengaluru", 3000)\`.
2. **Shuffle & Sort Phase:** Groups identical keys -> \`"Bengaluru": [3000]\`, \`"Chennai": [4500, 1500]\`, \`"Mumbai": [2000]\`.
3. **Reduce Phase:** Aggregates sums -> **\`("Bengaluru", 3000)\`**, **\`("Chennai", 6000)\`**, **\`("Mumbai", 2000)\`**.`,
    examTip:
      'Remember both MongoDB shard-key mandates (field must exist in EVERY document AND have an index) and the Compound Index Leftmost Prefix rule.',
  },

  'm5-t6': {
    summary:
      'NoSQL engines split into four specialized data models—Key-Value, Document, Column-Family, and Graph—illustrated in depth by MongoDB (BSON documents, Capped Collections, CRUD operators), DynamoDB/Redis, HBase/BigTable, and Neo4j Cypher.',
    sourceDecks: [
      '202-5.md (Sections 11 & 12.1–12.5)',
      'BACSE202-DBS-Module-5.ppt',
      'Module 5. No-SQL database management.pptx',
    ],
    keyPoints: [
      {
        heading: 'Four NoSQL Data Families & Quick Selection Rule',
        text: 'Key-Value (Redis, DynamoDB: O(1) opaque lookups), Document (MongoDB: flexible nested JSON/BSON + rich secondary queries), Wide-Column / Column-Family (HBase, Cassandra: sorted RowKey + Column Families + timestamps for massive writes/logs), Graph (Neo4j: nodes/edges + Cypher for multi-hop paths).',
      },
      {
        heading: 'MongoDB Core Mechanics & Capped Collections',
        text: 'Written in C++ (2009, "Humongous"); stores BSON (Binary JSON, max 16 MB, mandatory unique _id / 12-byte ObjectId, no leading $ or dots in field names). Capped Collections ({capped:true, size, max}) act as fixed-size FIFO circular buffers auto-evicting oldest logs.',
      },
      {
        heading: 'CRUD Operators & Police Station Query Patterns',
        text: 'Supports Comparison ($eq, $ne, $gt, $gte, $lt, $lte, $in, $nin) and Logical ($and, $or, $not, $nor) operators via insertOne/Many, find, countDocuments, updateOne ($set), and deleteOne.',
      },
    ],
    deepDiveSections: [
      {
        title: '1. Four NoSQL Database Families Side-by-Side',
        body: 'Choose a NoSQL model based on how your workload reads, writes, and traverses relationships:',
        table: {
          headers: ['NoSQL Type', 'Core Storage Unit', 'Representative DBs', 'Real-Time Examples', 'Sample Representation'],
          rows: [
            ['Key-Value', 'Key -> Opaque Value (hash table)', 'Redis, DynamoDB, Riak, Memcached, Voldemort', 'OTPs, login sessions, shopping carts, leaderboards', '`mobile_9876 -> 458921` / `cart_25 -> {items}`'],
            ['Document', 'JSON / BSON / XML documents', 'MongoDB, CouchDB, Firestore, MarkLogic', 'Student records, recipes, e-commerce catalogs, blogs', '`{ "rollNo": "22BCE101", "skills": ["MongoDB"] }`'],
            ['Column-Family', 'Sorted RowKey + dynamic Column Families', 'Apache Cassandra, Apache HBase, Bigtable', 'IoT sensor telemetry, bank logs, telecom CDRs, Netflix logs', '`Row: S101 | cf:Temp=34C @ts1 | cf:Humidity=60%`'],
            ['Graph', 'Nodes, Directed Edges & Properties', 'Neo4j, Amazon Neptune, OrientDB', 'Social graphs, Google Maps routes, banking fraud rings', '`(Anu)-[:FRIEND_OF]->(Ravi)-[:WORKS_AT]->(Infosys)`'],
          ],
        },
        bullets: [
          '**Key-Value Deep Dive (Voldemort / DynamoDB / Redis):** Blazing-fast `O(1)` `get(key)` and `put(key, value)` by primary key; cannot natively filter inside opaque values without scanning. **Project Voldemort** (open-source Amazon Dynamo clone, Elmasri Sec 24.4) uses a **consistent-hashing ring** where nodes and keys map onto `[0, 2^m - 1]`, replicating each key to `N` clockwise successor nodes and resolving concurrent writes via **Vector Clocks (versioning)**.',
          '**Wide-Column (Bigtable / Apache HBase) 4D Coordinate System (Elmasri Sec 24.5):** Stores sparse tabular data indexed by a **4-dimensional coordinate: `(RowKey, ColumnFamily:ColumnQualifier, Timestamp) -> Value`**. Rows are sorted lexicographically by `RowKey` and split horizontally into **Regions** managed by **RegionServers**, coordinated by **HMaster** and **Apache ZooKeeper**. Column Families (e.g., `Name:`, `Details:`) must be declared at table creation and are stored together on disk (column-family locality), while Column Qualifiers (`Name:Fname`, `Name:Lname`) are added dynamically per row with zero `NULL` storage overhead.',
          '**Graph (Neo4j) Deep Dive (Elmasri Sec 24.6):** Stores **Nodes** (with **Labels** like `:EMPLOYEE`, `:PROJECT`), **Directed Relationships** (with **Relationship Types** like `[:WORKS_ON]`), and key-value **Properties** on both nodes and edges. Uses **index-free adjacency** (direct physical pointers between connected nodes) to traverse multi-hop paths in `O(1)` per hop via declarative **Cypher** (`CREATE`, `MATCH`, `WHERE`, `RETURN`).',
        ],
      },
      {
        title: '2. MongoDB Overview, RDBMS Mapping & 12-Byte ObjectId Anatomy',
        body: 'Created in **2009** by 10gen (**"Humongous"**), MongoDB bridges fast Key-Value scalability with rich secondary-index querying. If a document omits `_id`, MongoDB auto-generates a **12-byte (96-bit, 24-hex-character) `ObjectId`** (`[4-byte UNIX epoch timestamp (seconds) | 5-byte random value (3B machine ID + 2B process ID) | 3-byte incrementing counter]`):',
        table: {
          headers: ['Relational DB (RDBMS)', 'MongoDB Equivalent', 'Notes / Constraints'],
          rows: [
            ['Database', 'Database', 'Meaningful names (e.g., `CollegeDB`, `HospitalDB`)'],
            ['Table', 'Collection', 'Lowercase plural (`students`, `orders`); dynamic schema per document'],
            ['Row / Tuple', 'Document (BSON)', 'Binary JSON; **maximum 16 MB per document**'],
            ['Column', 'Field', 'Names cannot start with `$` or contain `.` (dot)'],
            ['Primary Key', '`_id`', 'Mandatory unique key; auto-generated 12-byte `ObjectId` (`4B ts + 3B machine + 2B PID + 3B counter`)'],
            ['JOIN', 'Embedded Docs / `$lookup`', 'Prefer embedding for localized reads'],
          ],
        },
      },
      {
        title: '3. Capped Collections vs. Normal Collections',
        body: 'A **Capped Collection** is a fixed-size circular buffer preserving insertion order—once full, MongoDB automatically overwrites/evicts the oldest documents:',
        codeLanguage: 'js',
        codeOrDiagram:
`db.createCollection("logs", { capped: true, size: 100000 })
db.createCollection("recent_events", { capped: true, size: 100000, max: 1000 })`,
        table: {
          headers: ['Feature', 'Normal Collection', 'Capped Collection'],
          rows: [
            ['Maximum Size', 'Grows dynamically', 'Fixed byte `size` (and optional `max` docs)'],
            ['Old Data Eviction', 'Manual delete only', 'Automatic FIFO circular overwrite'],
            ['Good for Permanent Records?', 'Yes (patient records, bank ledgers)', 'No! Old patient/order history gets silently lost'],
            ['Good for Logs / IoT Streams?', 'Requires manual TTL/cleanup', 'Ideal — zero manual cleanup needed'],
          ],
        },
      },
      {
        title: '4. MongoDB CRUD Operators & Police Station Case Study',
        body: 'Query operators use `$`-prefixed keys: **Comparison** (`$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`) and **Logical** (`$and`, `$or`, `$not`, `$nor`):',
        codeLanguage: 'js',
        codeOrDiagram:
`// Police Station Collections: criminals(_id, name, crime, arrestDate) & firs(_id, FIR_No, date, officer, section)
db.firs.find({ officer: "Officer X" })                            // List FIRs by Officer X
db.firs.countDocuments({ section: "IPC 420" })                    // Count IPC 420 cases
db.criminals.find({ crime: "Theft" })                             // Filter by crime
db.firs.find({ date: { $gte: "2025-09-01" } })                    // Date >= 2025-09-01
db.firs.insertOne({ FIR_No: "FIR005", date: "2025-09-23", officer: "Officer Y", section: "IPC 379" })
db.firs.updateOne({ FIR_No: "FIR001" }, { $set: { officer: "Officer Z" } })
db.criminals.deleteOne({ name: "Ravi" })

// Compound Logical Query: CSE students with CGPA > 8 OR any student with CGPA > 9
db.students.find({ $or: [ { $and: [{ department: "CSE" }, { cgpa: { $gt: 8 } }] }, { cgpa: { $gt: 9 } } ] })`,
      },
    ],
    fatQuestionMethods: [
      {
        sourcePaper: 'Nov 2026 FAT · Slot A2+TA2 · Q8 [10M, CO4, BL2/BL3]',
        questionPrompt:
          'A recipe-sharing platform stores varying fields (ingredients, cooking steps, nutrition, images, optional info) across recipes and searches by ingredients, cuisine, and cooking time: (a) Identify & justify the most suitable NoSQL type [2M]; (b) Explain how it represents all these fields with a sample recipe [6M]; (c) State two advantages [2M].',
        solvingMethod: [
          'Part (a) Method [2M] — Model Selection + Justification: Name **Document-Oriented NoSQL Database (e.g., MongoDB)**. Justify using TWO cues from the prompt: (1) *Varying / optional fields per recipe* map directly to schema-free JSON/BSON documents without NULL-heavy ALTER TABLE migrations; (2) *Search by ingredients, cuisine, cooking time* requires rich field-level querying and **secondary/multikey indexes** (which pure Key-Value stores lack).',
          'Part (b) Method [6M] — Explain Representation + Write Valid JSON/BSON Document: First map each field type explicitly: `_id` (unique key), `title`/`cuisine`/`cookingTimeMins` (scalar fields for filtering), `ingredients` (embedded array of objects—supports Multikey Index search!), `steps` (ordered array), `nutrition` (nested sub-document), `images` (URL/media array), and optional fields like `dietaryTags` / `chefNotes` (omitted safely on recipes without them). Then write the sample JSON recipe document below.',
          'Part (c) Method [2M] — Two Concrete Advantages: (1) **Schema Evolution Agility:** New fields (e.g., allergen info or video links) can be added to new recipes instantly with zero table locks or NULL columns. (2) **High Read Locality + Indexing:** Fetching a complete recipe (ingredients + steps + nutrition) takes **one single-document read** (zero multi-table SQL JOINs), while Multikey indexes on `ingredients.name` and compound indexes on `{ cuisine: 1, cookingTimeMins: 1 }` deliver fast filtered search.',
        ],
        codeBlock: {
          title: 'Sample Recipe Document to Write in Exam (JSON/BSON)',
          language: 'json',
          content: `{
  "_id": "REC_1042",
  "title": "Masala Dosa",
  "cuisine": "South Indian",
  "cookingTimeMins": 35,
  "ingredients": [
    { "name": "Rice Batter", "qty": "2 cups" },
    { "name": "Potato", "qty": "3 medium" }
  ],
  "steps": [
    "Boil and mash potatoes",
    "Spread batter on hot tawa",
    "Fold with masala"
  ],
  "nutrition": { "calories": 320, "proteinG": 8, "carbsG": 52 },
  "images": [ "https://cdn.recipes/dosa-1.jpg" ],
  "notes": "Optional: serve hot with coconut chutney"
}`,
        },
        commonPitfalls:
          'Avoid writing a flat relational table or forgetting nested structures: explicitly show nested arrays (`ingredients`, `steps`) AND a nested object (`nutrition`) AND explain why optional fields simply don’t have to exist in every document.',
      },
      {
        sourcePaper: 'Official Fall 2026-27 Model Question Paper · Q10(b) [5M, CO4, BL4]',
        questionPrompt:
          'Q10(b): A food delivery platform stores restaurant information, order transactions, delivery logs, and customer–delivery partner interactions. Currently, all data is stored in a single document database. As the system scales, performance issues arise in handling different types of queries. Analyze the limitations of using a single NoSQL database model in this scenario and propose a suitable combination of NoSQL databases, justifying the role of each. [5 Marks]',
        solvingMethod: [
          'Step 1 — Analyze Limitations of a Single Document DB at Scale [2M]: Forcing all four workloads into one Document DB (e.g., MongoDB) causes three severe bottlenecks: (1) **Unbounded Log Growth & Write Contention:** Appending millions of high-velocity GPS/status delivery logs bloats documents (hitting the **16 MB BSON limit**) or thrashes B-tree indexes on the main collection. (2) **Slow Multi-Hop Graph Traversals:** Analyzing complex `Customer <-> Restaurant <-> Delivery Partner` interaction networks, route optimization, or collusion/fraud rings requires expensive recursive `$lookup` joins across shards. (3) **High-Frequency Ephemeral State Overhead:** Active cart/session state and live rider heartbeat coordinates suffer unnecessary disk/BSON serialization overhead compared to in-memory `O(1)` lookups.',
          'Step 2 — Propose a Polyglot Persistence NoSQL Architecture (Justifying Each Model) [3M]:',
          '• **1. Document Database (MongoDB) -> Restaurant Catalogs & Menus:** Restaurant profiles, dynamic nested menus, add-ons, and customer order snapshots have hierarchical, variable schemas read together as a single unit (`O(1)` aggregate read).',
          '• **2. Key-Value Store (Redis / Amazon DynamoDB) -> Active Carts, Rider Live Sessions & OTPs:** Sub-millisecond `O(1)` `GET/PUT` in-memory lookups handle high-frequency rider location pings, login tokens, and active checkout carts with TTL expiration.',
          '• **3. Wide-Column / Column-Family Store (Apache Cassandra / HBase) -> High-Velocity Delivery & Order Status Logs:** Append-only time-series telemetry (`RowKey = OrderID_Date`, sorted by timestamp) handles massive write throughput across distributed regions without index lock contention.',
          '• **4. Graph Database (Neo4j) -> Customer–Delivery Partner–Restaurant Interaction & Routing Graph:** Models `(Customer)-[:ORDERED_FROM]->(Restaurant)` and `(Partner)-[:DELIVERED_TO]->(Customer)` using index-free adjacency for real-time partner matching, recommendation engines, and promo-abuse/fraud ring detection.',
        ],
        commonPitfalls:
          'Do not just list the 4 NoSQL types abstractly—explicitly map each of the 4 prompt workloads (restaurant info, active order/session state, delivery logs, customer–partner interactions) to its matching NoSQL engine and state WHY the single Document DB struggled with it.',
      },
    ],
    selfChecks: [
      {
        question:
          'A server generates thousands of log documents every minute. Only recent logs are useful, and old logs should be automatically discarded. Which MongoDB feature is best?',
        options: [
          'Replica set',
          'Compound index',
          'Capped collection',
          'Sharding by timestamp',
        ],
        correctIndex: 2,
        explanation:
          'A Capped Collection acts as a fixed-size FIFO circular buffer that automatically overwrites the oldest documents without manual deletion scripts.',
      },
      {
        question:
          'A hospital wants to store every patient’s medical record permanently. A student suggests a capped collection. What is the main flaw?',
        options: [
          'Capped collections cannot contain nested objects',
          'Older patient records will be automatically removed once capacity fills',
          'Capped collections lack an _id field',
          'Capped collections only allow numeric values',
        ],
        correctIndex: 1,
        explanation:
          'Capped collections evict older documents automatically when size or max document limits are reached—fatal for permanent medical/financial history.',
      },
    ],
    exampleTitle: 'HBase Sparse Wide-Column & Neo4j Cypher Reference',
    exampleBody:
`#### HBase Wide-Column *(Fig 24.3 — \`EMPLOYEE\` Table with Column Families \`Name\`, \`Details\`)*
| Row Key | \`Name\` Column Family | \`Details\` Column Family |
| :--- | :--- | :--- |
| \`"emp_001"\` | \`Name:Fname="John"\` *(t1)*, \`Name:Lname="Smith"\` *(t1)* | \`Details:Role="DBA"\` *(t2)* |
| \`"emp_002"\` | \`Name:Fname="Asha"\` *(t3)* | *(omitted — zero NULL waste!)* |

#### Neo4j Cypher *(Fig 24.4 — Multi-Hop Graph Traversal)*
\`\`\`cypher
CREATE (e:EMPLOYEE {Fname: "John", Ssn: "123"})
MATCH (e:EMPLOYEE)-[:WORKS_ON]->(p:PROJECT {Pname: "ProductX"})
RETURN e.Fname, p.Pname;
\`\`\``,
    examTip:
      'In 10-mark "Compare the 4 NoSQL models" questions, pair each family with a crisp real-world example + query mechanism: Redis/DynamoDB (KV `get/put`), MongoDB (BSON + `$` operators), HBase (RowKey + ColumnFamily + Timestamp), Neo4j (Nodes/Edges + Cypher).',
  },
};
